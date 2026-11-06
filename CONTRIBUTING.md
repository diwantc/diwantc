# Contributing to DiwanTC

<div dir="rtl" lang="ar">

شكراً لاهتمامك. أسهل طريقة للمساهمة: إذا وجدت خطأ في درس، افتح بلاغاً هنا على GitHub. وقبل الإطلاق سيُضاف رابط «وجدت خطأ؟» أسفل كل درس لا يحتاج حساباً. ويمكنك أيضاً اقتراح موضوع أو تحسين ترجمة.

</div>

Thank you for helping. Accuracy matters more than speed here: people learn
from these lessons, and many cannot tell when something is wrong.

## Ways to help

| You want to… | Do this |
|---|---|
| Report a mistake in a lesson | Open a **Report an error** issue (a "Found a mistake?" form with no account is coming before launch) |
| Suggest a topic | Open a **Suggest a topic** issue |
| Improve a translation | Open a pull request that changes one lesson file (see rules below) |
| Improve the site or tooling | Open an issue first for anything larger than a small fix |

## Rules for lesson changes

Every lesson follows [`docs/lesson-template.md`](docs/lesson-template.md). In short:

- Every factual claim has a source in `sources`, from an official or
  well-established publisher. Summarize in your own words — never copy.
- A lesson exists in Arabic, English and French with the same `lessonId`.
  Facts, steps and sources stay identical across languages.
- Every image has alt text in the lesson's language.
- Only the maintainer approves and merges lessons. Your change is reviewed
  like any AI-drafted lesson.

## Branches and pull requests

- `main` only holds approved lessons and reviewed code. Nobody pushes to it
  directly; everything goes through a pull request.
- Lesson branches: `lesson/<lessonId>` (for example `lesson/safety-l0-01`).
- Other branches: `fix/…`, `feat/…`, `docs/…`.
- CI must pass: content checks, link check, tests, type check, build.

## Local setup

```bash
nvm use            # Node 22.23.4+ (see .nvmrc)
npm install
npm run dev:demo   # site with demo lessons, drafts visible
npm test
```

## Code style

- TypeScript and Astro components. Interface text goes in
  `src/i18n/ui.ts` as keys, never hardcoded in pages.
- CSS uses logical properties (`margin-inline-start`, `ps-4`, …) so Arabic
  (RTL) and English/French (LTR) both work.
- Keep pages light: they must work on low-end phones and slow connections.
- Accessibility target: WCAG 2.1 AA.

## Licenses

By contributing you agree that code is released under [MIT](LICENSE) and
lesson content under [CC BY-SA 4.0](LICENSE-CONTENT.md).
