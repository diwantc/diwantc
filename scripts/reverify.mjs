#!/usr/bin/env node
// Lists lessons whose facts are due for re-verification (decided 2026-11-06):
//   - every 3 months: topic "ai" and lessons with device-specific steps (platforms)
//   - every 12 months: everything else
// Reporting-channel data (src/data/reporting-channels) joins this check when it exists.
//
// Usage: node scripts/reverify.mjs [lessons-dir] [--json] [--open-issues]
//   --open-issues  open one GitHub issue per due lesson version (needs `gh` and GH_TOKEN)
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { lessonsRoot, readLessons } from './lib/read-lessons.mjs';

const args = process.argv.slice(2);
const root = lessonsRoot(args.find((a) => !a.startsWith('--')));
const now = new Date();

function monthsLimit(fm) {
  return fm.topic === 'ai' || (Array.isArray(fm.platforms) && fm.platforms.length > 0) ? 3 : 12;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

const due = [];
for (const { rel, frontmatter: fm } of await readLessons(root)) {
  if (!fm?.lastVerified) continue;
  const last = new Date(fm.lastVerified);
  const limit = monthsLimit(fm);
  if (addMonths(last, limit) <= now) {
    due.push({ lessonId: fm.lessonId, lang: fm.lang, file: rel, lastVerified: last.toISOString().slice(0, 10), limitMonths: limit });
  }
}

if (args.includes('--json')) {
  console.log(JSON.stringify(due, null, 2));
} else if (due.length === 0) {
  console.log('Nothing is due for re-verification.');
} else {
  for (const d of due) console.log(`${d.lessonId} (${d.lang}) — last verified ${d.lastVerified}, limit ${d.limitMonths} months`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = ['## Re-verification due', ''];
  if (due.length === 0) lines.push('Nothing is due.');
  else {
    lines.push('| Lesson | Language | Last verified | Limit |', '|---|---|---|---|');
    for (const d of due) lines.push(`| ${d.lessonId} | ${d.lang} | ${d.lastVerified} | ${d.limitMonths} months |`);
  }
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}

if (args.includes('--open-issues')) {
  for (const d of due) {
    const title = `Re-verify: ${d.lessonId} (${d.lang})`;
    const open = execFileSync('gh', ['issue', 'list', '--state', 'open', '--search', `in:title "${title}"`, '--json', 'title'], {
      encoding: 'utf8',
    });
    if (JSON.parse(open).some((issue) => issue.title === title)) continue;
    const body = [
      `\`${d.file}\` was last verified on ${d.lastVerified}; the limit for this lesson is ${d.limitMonths} months.`,
      '',
      'Re-open every source, check each claim, update the lesson if needed, and set `lastVerified`.',
    ].join('\n');
    execFileSync('gh', ['issue', 'create', '--title', title, '--body', body], { stdio: 'inherit' });
  }
}
