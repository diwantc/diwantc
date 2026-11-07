// Tests for the "Found a mistake?" Pages Function (functions/api/report.ts).
// Node runs the TypeScript file directly (type stripping, Node 22.18+).
// Network calls to Turnstile and GitHub are replaced with a fake fetch.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fenceFor, issueBody, LIMITS, onRequestPost, parseReport } from '../functions/api/report.ts';

const VALID = {
  lessonId: 'safety-l0-01',
  lang: 'ar',
  problem: 'The minimum length in step 2 does not match the source.',
  token: 'XXXX.DUMMY.TOKEN.XXXX',
};

function memoryKv() {
  const data = new Map();
  return {
    data,
    async get(key) {
      return data.has(key) ? data.get(key) : null;
    },
    async put(key, value) {
      data.set(key, value);
    },
  };
}

const env = (overrides = {}) => ({
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  GITHUB_ISSUES_TOKEN: 'test-token',
  REPORT_RATE_LIMIT: memoryKv(),
  ...overrides,
});

function post(body, { ip = '203.0.113.7', type = 'application/json' } = {}) {
  return new Request('https://diwantc.com/api/report', {
    method: 'POST',
    headers: { 'content-type': type, 'CF-Connecting-IP': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

let calls;
let replies;
const realFetch = globalThis.fetch;

beforeEach(() => {
  calls = [];
  replies = {
    turnstile: () => Response.json({ success: true }),
    github: () => Response.json({ number: 42, html_url: 'https://github.com/diwantc/diwantc/issues/42' }, { status: 201 }),
  };
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).startsWith('https://challenges.cloudflare.com/')) return replies.turnstile();
    if (String(url).startsWith('https://api.github.com/')) return replies.github();
    throw new Error(`unexpected fetch ${url}`);
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

test('parseReport accepts a valid report and trims the text', () => {
  const report = parseReport({ ...VALID, problem: `  ${VALID.problem}\r\n` });
  assert.deepEqual(report, { ...VALID, lang: 'ar' });
});

test('parseReport rejects bad fields and a filled honeypot', () => {
  assert.equal(parseReport({ ...VALID, website: 'http://spam.example' }), null);
  assert.equal(parseReport({ ...VALID, lessonId: 'safety-01' }), null);
  assert.equal(parseReport({ ...VALID, lessonId: 'cooking-l0-01' }), null);
  assert.equal(parseReport({ ...VALID, lang: 'de' }), null);
  assert.equal(parseReport({ ...VALID, problem: 'too short' }), null);
  assert.equal(parseReport({ ...VALID, problem: 'x'.repeat(LIMITS.problemMax + 1) }), null);
  assert.equal(parseReport({ ...VALID, token: '' }), null);
  assert.equal(parseReport({ ...VALID, token: 'x'.repeat(LIMITS.tokenMax + 1) }), null);
  assert.equal(parseReport({ ...VALID, problem: 42 }), null);
});

test('parseReport counts characters, not UTF-16 units, so Arabic text is measured fairly', () => {
  assert.ok(parseReport({ ...VALID, problem: 'خطأ في الخطوة 2' }));
});

test('the reader text cannot escape its code block in the issue body', () => {
  const problem = 'see ```` and @someone [link](https://evil.example)';
  const fence = fenceFor(problem);
  assert.equal(fence, '`````');
  const body = issueBody({ ...VALID, problem });
  const start = body.indexOf(`${fence}text\n`);
  const end = body.indexOf(`\n${fence}\n`, start);
  assert.ok(start > 0 && end > start, 'text is fenced');
  assert.ok(body.slice(start, end).includes('@someone'), 'mention stays inside the fence');
  assert.equal(fenceFor('no backticks'), '```');
});

test('a valid report opens a labelled GitHub issue after Turnstile passes', async () => {
  const response = await onRequestPost({ request: post(VALID), env: env() });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    ok: true,
    issue: { number: 42, url: 'https://github.com/diwantc/diwantc/issues/42' },
  });

  const [verify, issue] = calls;
  assert.equal(verify.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  const sent = new URLSearchParams(String(verify.init.body));
  assert.equal(sent.get('response'), VALID.token);
  assert.equal(sent.get('remoteip'), '203.0.113.7');

  assert.equal(issue.url, 'https://api.github.com/repos/diwantc/diwantc/issues');
  assert.equal(issue.init.headers.authorization, 'Bearer test-token');
  const payload = JSON.parse(issue.init.body);
  assert.equal(payload.title, 'Error: safety-l0-01 (ar)');
  assert.deepEqual(payload.labels, ['error-report']);
  assert.ok(payload.body.includes(VALID.problem));
});

test('form-encoded posts with the standard Turnstile field also work', async () => {
  const form = new URLSearchParams({ ...VALID, token: '', 'cf-turnstile-response': VALID.token });
  const response = await onRequestPost({
    request: post(form.toString(), { type: 'application/x-www-form-urlencoded' }),
    env: env(),
  });
  assert.equal(response.status, 201);
});

test('GITHUB_REPO overrides the target repository', async () => {
  await onRequestPost({ request: post(VALID), env: env({ GITHUB_REPO: 'someone/fork' }) });
  assert.equal(calls[1].url, 'https://api.github.com/repos/someone/fork/issues');
});

test('a failed Turnstile check returns "captcha" and opens no issue', async () => {
  replies.turnstile = () => Response.json({ success: false, 'error-codes': ['invalid-input-response'] });
  const response = await onRequestPost({ request: post(VALID), env: env() });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { ok: false, error: 'captcha' });
  assert.equal(calls.length, 1);
});

test('bad input returns "invalid" before any network call', async () => {
  for (const request of [
    post('{not json'),
    post({ ...VALID, problem: 'short' }),
    post(JSON.stringify({ ...VALID, problem: 'x'.repeat(LIMITS.bodyMax) })),
    post('a=b', { type: 'text/plain' }),
  ]) {
    const response = await onRequestPost({ request, env: env() });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, error: 'invalid' });
  }
  assert.equal(calls.length, 0);
});

test('missing secrets or KV binding returns "unavailable"', async () => {
  for (const missing of ['TURNSTILE_SECRET_KEY', 'GITHUB_ISSUES_TOKEN', 'REPORT_RATE_LIMIT']) {
    const response = await onRequestPost({ request: post(VALID), env: env({ [missing]: undefined }) });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, error: 'unavailable' });
  }
  assert.equal(calls.length, 0);
});

test('more than the hourly limit from one IP is refused; another IP still works', async () => {
  const shared = env();
  for (let i = 0; i < LIMITS.perHour; i++) {
    assert.equal((await onRequestPost({ request: post(VALID), env: shared })).status, 201);
  }
  const blocked = await onRequestPost({ request: post(VALID), env: shared });
  assert.equal(blocked.status, 429);
  assert.deepEqual(await blocked.json(), { ok: false, error: 'rate-limited' });

  const other = await onRequestPost({ request: post(VALID, { ip: '198.51.100.9' }), env: shared });
  assert.equal(other.status, 201);

  // Only hashes are stored, never the IP itself.
  for (const key of shared.REPORT_RATE_LIMIT.data.keys()) {
    assert.match(key, /^report:[0-9a-f]{64}$/);
  }
});

test('a GitHub error returns "unavailable"', async () => {
  replies.github = () => new Response('Bad credentials', { status: 401 });
  const response = await onRequestPost({ request: post(VALID), env: env() });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: 'unavailable' });
});
