---
name: new-lesson
description: Draft one DiwanTC lesson end to end — research, Arabic draft, self-check, English and French translations, checks, and a pull request on a lesson/* branch. Use when the maintainer asks for a new lesson by ID (e.g. "new lesson safety-l0-01", "اكتب درس safety-l0-01").
---

# New lesson

Runs stages ② to ⑥ of `docs/content-pipeline.md` for **one** `lessonId`.
The maintainer running this skill is the request to commit and push to
`lesson/<lessonId>` and to open a pull request. Nothing else.

## 0. Start

1. Read `docs/topic-map.md` (the lesson's row and objective),
   `docs/lesson-template.md` and `docs/content-pipeline.md`.
2. Find or create the issue: `gh issue list --search "<lessonId> in:title"`.
   If none, create it from the "New lesson" form fields
   (`gh issue create --title "Lesson: <lessonId>" --label lesson`).
3. `git switch main && git pull && git switch -c lesson/<lessonId>`.

Tell the maintainer, in Arabic, which lesson you are starting.

## 1. Research

- Search for sources in the order the template sets: official bodies →
  vendor documentation → educational organizations.
- **Open every source** with WebFetch and confirm it says what the lesson
  will say. A source you did not open in this session does not count.
- Build the claim map: claim (one line) → source → where in the source
  (section heading). No copied passages.
- No official source for a claim → cut it. Never fill the gap from memory.
- Sources disagree → keep both in the claim map for the maintainer.

## 2. Arabic draft

File: `src/content/lessons/ar/<topic>/l<level>/<nn>-<slug>.mdx`
(`<slug>` in English kebab-case, the same for all languages).

- Six sections, in order, with the Arabic headings from the template.
- Frontmatter: `sourceLang: ar`, `ai.assisted: true`, `ai.model: <your model ID>`,
  `review.status: draft`, `lastVerified: <today>`, `platforms` if steps
  depend on the device.

## 3. Self-check (separate pass)

Re-read the Arabic file as a reviewer, not as its author:

- Re-open each source; check each claim against it.
- Compare wording with the sources; rewrite anything that copies them.
- Check objective, level, the six sections, alt text, quiz answers.

Write a short self-check report: checked / changed / still uncertain.

## 4. English and French

Translate from the Arabic file into `en/…` and `fr/…` at the same path.
Facts, steps, sources and quiz answers stay identical. Use a source in the
target language only if it is an equal official source; add it to the
claim map.

## 5. Checks

```bash
npm run check:content
npm run check:links
npm run build
```

Fix every error. Report warnings in the PR.

## 6. Pull request

1. Set `review.status: in-review` in all three files.
2. Commit only the three lesson files (and images), push
   `lesson/<lessonId>`.
3. `gh pr create` with the PR template filled: claim map, self-check
   report, checklist, `Closes #<issue>`.
4. Send the review cards to the DiwanTC Telegram bot. **Until the bot
   exists:** give the maintainer the PR link and the preview links for the
   three language pages.

Never merge. Never touch `main`.
