#!/usr/bin/env node
// Lesson rules the Astro schema cannot see: folder structure, all three
// languages present, matching IDs, alt text, approval before merge.
// The frontmatter schema itself is enforced by `astro build`.
//
// Usage: node scripts/check-content.mjs [lessons-dir] [--require-approved]
import { LOCALES, TOPICS, lessonsRoot, readLessons, report } from './lib/read-lessons.mjs';

const args = process.argv.slice(2);
const requireApproved = args.includes('--require-approved');
const root = lessonsRoot(args.find((a) => !a.startsWith('--')));

const WORDS_MIN = 400;
const WORDS_MAX = 800;

let errors = 0;
let warnings = 0;
const error = (file, msg) => (errors++, report('error', file, msg));
const warn = (file, msg) => (warnings++, report('warning', file, msg));

const lessons = await readLessons(root);
const byId = new Map();

for (const { file, rel, frontmatter: fm, body, parseError } of lessons) {
  if (parseError) {
    error(file, parseError);
    continue;
  }

  // Path: <lang>/<topic>/l<level>/<nn>-<slug>.mdx
  const parts = rel.split('/');
  const fileMatch = parts[3]?.match(/^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx?$/);
  if (parts.length !== 4 || !fileMatch) {
    error(file, 'path must be <lang>/<topic>/l<level>/<nn>-<slug>.mdx with an English kebab-case slug');
    continue;
  }
  const [lang, topic, levelDir] = parts;
  const nn = fileMatch[1];

  if (!LOCALES.includes(lang)) error(file, `unknown language folder "${lang}"`);
  if (!TOPICS.includes(topic)) error(file, `unknown topic folder "${topic}"`);
  if (fm.lang !== lang) error(file, `lang is "${fm.lang}" but the folder is "${lang}"`);
  if (fm.topic !== topic) error(file, `topic is "${fm.topic}" but the folder is "${topic}"`);
  if (`l${fm.level}` !== levelDir) error(file, `level is ${fm.level} but the folder is "${levelDir}"`);

  const expectedId = `${topic}-${levelDir}-${nn}`;
  if (fm.lessonId !== expectedId) error(file, `lessonId should be "${expectedId}" (from the path), found "${fm.lessonId}"`);

  // Sources
  const sources = Array.isArray(fm.sources) ? fm.sources : [];
  if (sources.length === 0) error(file, 'at least one source is required');
  sources.forEach((s, i) => {
    if (!s?.url) error(file, `sources[${i}] has no url`);
    if (!s?.accessed) error(file, `sources[${i}] has no accessed date`);
  });

  // Approval gate: only approved lessons may reach main.
  if (requireApproved) {
    const r = fm.review ?? {};
    if (r.status !== 'approved') error(file, `review.status is "${r.status}" — only approved lessons can be merged`);
    else if (!r.reviewer || !r.date) error(file, 'approved lessons need review.reviewer and review.date');
  }

  // Alt text on every image
  for (const m of body.matchAll(/!\[([^\]]*)\]\(([^)]*)\)/g)) {
    if (!m[1].trim()) error(file, `image "${m[2]}" has no alt text`);
  }
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
    const alt = m[0].match(/\balt\s*=\s*(["'])(.*?)\1/i);
    if (!alt || !alt[2].trim()) error(file, 'an <img> tag has no alt text');
  }

  // Warnings (do not block)
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>|[\]()!-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  if (words < WORDS_MIN || words > WORDS_MAX) warn(file, `${words} words (target ${WORDS_MIN}–${WORDS_MAX})`);
  if (fm.level === 0 && (fm.duration < 5 || fm.duration > 10)) warn(file, `duration ${fm.duration} min (Level 0 target 5–10)`);

  if (!byId.has(fm.lessonId)) byId.set(fm.lessonId, []);
  byId.get(fm.lessonId).push({ file, lang, fm });
}

// Every lesson exists in all three languages, with the same topic/level/order.
for (const [id, versions] of byId) {
  const langs = versions.map((v) => v.lang);
  const missing = LOCALES.filter((l) => !langs.includes(l));
  if (missing.length) error(versions[0].file, `${id} is missing language version(s): ${missing.join(', ')}`);
  for (const key of ['topic', 'level', 'order', 'sourceLang']) {
    const values = new Set(versions.map((v) => String(v.fm[key])));
    if (values.size > 1) error(versions[0].file, `${id}: "${key}" differs between languages (${[...values].join(' / ')})`);
  }
}

const count = lessons.length;
console.log(
  count === 0
    ? `No lessons found in ${root} — nothing to check.`
    : `Checked ${count} lesson file(s): ${errors} error(s), ${warnings} warning(s).`,
);
process.exit(errors > 0 ? 1 : 0);
