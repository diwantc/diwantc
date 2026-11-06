# CLAUDE.md — DiwanTC

DiwanTC (ديوان تيك) is an open-source learning platform that teaches technology
to everyone, in Arabic (default, RTL), English and French. Accuracy comes
first: learners often cannot tell when a lesson is wrong.

## Read before working on lessons

- `docs/topic-map.md` — topics, levels, lesson IDs, the Level 0 list
- `docs/lesson-template.md` — frontmatter, the six sections, writing, source and review rules
- `docs/content-pipeline.md` — the full flow from issue to merge

## Layout

```
src/content/lessons/<lang>/<topic>/l<level>/<nn>-<slug>.mdx   lessons (CC BY-SA 4.0)
src/content.config.ts    lesson schema (Zod, from astro/zod)
src/lib/taxonomy.ts      languages, topics, levels, platforms
src/i18n/ui.ts           all interface text, as keys, in ar/en/fr
src/pages/[lang]/…       home, topic and lesson pages
scripts/                 check-content, check-links, reverify
tests/                   checker tests and demo lesson fixtures
```

## Commands

Node 22.23.4+ (`.nvmrc`). Run `nvm use` first.

```bash
npm run dev:demo       # demo lessons, drafts visible
npm run check:content  # add --require-approved to mimic CI
npm run check:links
npm test
npm run typecheck
npm run build
```

## Git rules (decided by the maintainer, 2026-11-06)

- Commit and push **only to `lesson/*` branches**, and only inside a skill
  the maintainer runs (`new-lesson`; later `review-sync`, `fix-lesson`).
  Any other branch or push needs the maintainer's explicit request.
- **Never push to `main`. Never merge.** Only the maintainer merges.

## Content rules that must never bend

- Every factual claim has a source you opened in this session. No source →
  cut the claim. Never write a source or URL from memory.
- Summarize sources in your own words. Never copy passages.
- Arabic is written first (`sourceLang: ar`), in simple Modern Standard
  Arabic, masculine singular as the generic form, Western digits 0–9.
- English and French are translations: same facts, steps, sources and quiz answers.
- `review.status: approved` is set only after the maintainer approves.

## Code rules

- Interface text goes in `src/i18n/ui.ts`, never hardcoded.
- Logical CSS only (`ps-*`, `ms-*`, `margin-inline-*`), so RTL and LTR both work.
- Pages must stay light for low-end phones. WCAG 2.1 AA.
- Secrets go in Cloudflare secrets or a local `.env`. Never in the repo.
