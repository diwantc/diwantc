// POST /api/report — the "Found a mistake?" form, with no account.
//
// Flow: validate the report → rate limit by IP (Workers KV) → verify the
// Cloudflare Turnstile token → open a GitHub issue labelled `error-report`.
// Setup, secrets and privacy notes: docs/error-reports.md.
//
// Minimal local types instead of a Workers types package, so the root
// `astro check` can type-check this file and Node can import it in tests.

interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  /** Cloudflare secret: the Turnstile widget's secret key. */
  TURNSTILE_SECRET_KEY?: string;
  /** Cloudflare secret: fine-grained token with Issues (write) on the repo only. */
  GITHUB_ISSUES_TOKEN?: string;
  /** Optional variable, `owner/name`. Defaults to the DiwanTC repo. */
  GITHUB_REPO?: string;
  /** KV namespace binding used to count reports per IP per hour. */
  REPORT_RATE_LIMIT?: RateLimitStore;
}

interface Context {
  request: Request;
  env: Env;
}

export const DEFAULT_REPO = 'diwantc/diwantc';
export const LANGS = ['ar', 'en', 'fr'] as const;
export const LIMITS = {
  problemMin: 10,
  problemMax: 2000,
  /** Largest request body accepted, in characters. */
  bodyMax: 16_384,
  /** Turnstile tokens are at most 2048 characters. */
  tokenMax: 2048,
  /** Reports accepted per IP per clock hour. */
  perHour: 5,
} as const;

const LESSON_ID = /^(basics|safety|ai|programming)-l[0-3]-\d{2}$/;
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const GITHUB_API_VERSION = '2026-03-10';

export type Lang = (typeof LANGS)[number];
export type ReportError = 'invalid' | 'captcha' | 'rate-limited' | 'unavailable';

export interface Report {
  lessonId: string;
  lang: Lang;
  problem: string;
  token: string;
}

/** Read and check the submitted fields. Returns null when anything is off. */
export function parseReport(fields: Record<string, unknown>): Report | null {
  const text = (name: string) => (typeof fields[name] === 'string' ? (fields[name] as string) : '');

  // Honeypot: hidden from people, often filled in by bots.
  if (text('website') !== '') return null;

  const lessonId = text('lessonId');
  const lang = text('lang');
  const problem = text('problem').replace(/\r\n?/g, '\n').trim();
  const token = text('token') || text('cf-turnstile-response');

  if (!LESSON_ID.test(lessonId)) return null;
  if (!(LANGS as readonly string[]).includes(lang)) return null;
  const length = [...problem].length;
  if (length < LIMITS.problemMin || length > LIMITS.problemMax) return null;
  if (token === '' || token.length > LIMITS.tokenMax) return null;

  return { lessonId, lang: lang as Lang, problem, token };
}

/** A code fence longer than any run of backticks in the text, so it cannot be closed early. */
export function fenceFor(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  return '`'.repeat(Math.max(3, longest + 1));
}

export function issueTitle(report: Report): string {
  return `Error: ${report.lessonId} (${report.lang})`;
}

/**
 * The reader's text goes inside a code block: no @mentions, links or
 * formatting from an anonymous form reach the issue.
 */
export function issueBody(report: Report): string {
  const fence = fenceFor(report.problem);
  return [
    'Reported through the "Found a mistake?" form on the site (no account).',
    '',
    `- **Lesson:** \`${report.lessonId}\``,
    `- **Language:** \`${report.lang}\``,
    '',
    '**What is wrong (as the reader wrote it):**',
    '',
    `${fence}text`,
    report.problem,
    fence,
    '',
    'Next step: run the `fix-lesson` skill on this issue.',
  ].join('\n');
}

function json(status: number, data: Record<string, unknown>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

const fail = (status: number, error: ReportError) => json(status, { ok: false, error });

async function readFields(request: Request): Promise<Record<string, unknown> | null> {
  const raw = await request.text();
  if (raw.length > LIMITS.bodyMax) return null;
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      const parsed: unknown = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    }
    if (type.includes('application/x-www-form-urlencoded')) {
      return Object.fromEntries(new URLSearchParams(raw));
    }
  } catch {
    return null;
  }
  return null;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Count this IP's reports in the current clock hour. KV keeps only a hash of
 * the IP and the hour, and the entry expires after an hour. KV is eventually
 * consistent, so the limit is approximate — Turnstile is the main guard.
 */
async function isOverLimit(store: RateLimitStore, ip: string, now: number): Promise<boolean> {
  const hour = Math.floor(now / 3_600_000);
  const key = `report:${await sha256Hex(`${ip}|${hour}`)}`;
  const count = Number((await store.get(key)) ?? '0') || 0;
  if (count >= LIMITS.perHour) return true;
  try {
    await store.put(key, String(count + 1), { expirationTtl: 3600 });
  } catch {
    // KV allows one write per second per key; a lost count is acceptable.
  }
  return false;
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<'ok' | 'failed' | 'error'> {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const response = await fetch(SITEVERIFY, { method: 'POST', body });
    if (!response.ok) return 'error';
    const result = (await response.json()) as { success?: boolean };
    return result.success === true ? 'ok' : 'failed';
  } catch {
    return 'error';
  }
}

async function createIssue(env: Env, report: Report): Promise<{ number: number; url: string } | null> {
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.GITHUB_ISSUES_TOKEN}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': GITHUB_API_VERSION,
        'user-agent': 'diwantc-report-form',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ title: issueTitle(report), body: issueBody(report), labels: ['error-report'] }),
    });
    if (response.status !== 201) return null;
    const issue = (await response.json()) as { number?: number; html_url?: string };
    return typeof issue.number === 'number' && typeof issue.html_url === 'string'
      ? { number: issue.number, url: issue.html_url }
      : null;
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const fields = await readFields(request);
  const report = fields && parseReport(fields);
  if (!report) return fail(400, 'invalid');

  if (!env.TURNSTILE_SECRET_KEY || !env.GITHUB_ISSUES_TOKEN || !env.REPORT_RATE_LIMIT) {
    return fail(503, 'unavailable');
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  if (await isOverLimit(env.REPORT_RATE_LIMIT, ip || 'unknown', Date.now())) {
    return fail(429, 'rate-limited');
  }

  const check = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, report.token, ip);
  if (check === 'failed') return fail(403, 'captcha');
  if (check === 'error') return fail(503, 'unavailable');

  const issue = await createIssue(env, report);
  if (!issue) return fail(503, 'unavailable');

  return json(201, { ok: true, issue });
}
