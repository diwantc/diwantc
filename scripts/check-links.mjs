#!/usr/bin/env node
// Checks that every source URL and every web link in lessons, and every
// reporting-channel source and website, still answers.
// 404/410, 5xx and network failures are errors. 401/403/429 are warnings:
// some sites block automated checks, so those need a manual look.
//
// Usage: node scripts/check-links.mjs [lessons-dir]
import { lessonsRoot, readLessons, report } from './lib/read-lessons.mjs';
import { readReportingChannels } from './lib/read-data.mjs';

const root = lessonsRoot(process.argv.slice(2).find((a) => !a.startsWith('--')));
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 5;
const USER_AGENT = 'DiwanTC-link-check/1.0 (+https://github.com/diwantc/diwantc)';
// Some official sites send an incomplete TLS certificate chain. Browsers
// complete it themselves; Node does not. Report those as warnings.
const TLS_CHAIN_ERRORS = new Set(['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY']);

const lessons = await readLessons(root);
const urls = new Map(); // url -> first file that uses it

for (const { file, frontmatter, body } of lessons) {
  for (const s of frontmatter?.sources ?? []) if (s?.url) urls.has(s.url) || urls.set(s.url, file);
  for (const m of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)|href=["'](https?:\/\/[^"']+)["']/g)) {
    const url = m[1] ?? m[2];
    urls.has(url) || urls.set(url, file);
  }
}

// Reporting-channel sources and website contacts are checked too.
for (const { file, data } of await readReportingChannels()) {
  for (const channel of data?.channels ?? []) {
    const url = channel?.source?.url;
    if (url) urls.has(url) || urls.set(url, file);
    if (channel?.type === 'website' && /^https?:\/\//.test(channel.contact ?? '')) urls.has(channel.contact) || urls.set(channel.contact, file);
  }
}

async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/pdf,*/*' },
    });
    return { status: res.status };
  } catch (err) {
    const code = err.cause?.code;
    return { status: 0, reason: err.name === 'AbortError' ? 'timeout' : code ?? err.message, tls: TLS_CHAIN_ERRORS.has(code) };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  let result = await request(url, 'HEAD');
  // Many servers reject HEAD; retry with GET, then once more on failure.
  if (result.status === 0 || result.status >= 400) result = await request(url, 'GET');
  if (result.status === 0 || result.status >= 500) result = await request(url, 'GET');
  return result;
}

let errors = 0;
let warnings = 0;
const queue = [...urls.entries()];

async function worker() {
  while (queue.length) {
    const [url, file] = queue.shift();
    const { status, reason, tls } = await check(url);
    if (status >= 200 && status < 400) continue;
    if (tls) {
      warnings++;
      report('warning', file, `${url}: incomplete TLS certificate chain (${reason}) — opens in browsers; verify by hand`);
    } else if ([401, 403, 429].includes(status)) {
      warnings++;
      report('warning', file, `${url} answered ${status} (blocked automated check — verify by hand)`);
    } else {
      errors++;
      report('error', file, `${url} failed: ${status || reason}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(
  urls.size === 0
    ? 'No links found — nothing to check.'
    : `Checked ${urls.size} link(s): ${errors} error(s), ${warnings} warning(s).`,
);
process.exit(errors > 0 ? 1 : 0);
