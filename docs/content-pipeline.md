# Content Pipeline — DiwanTC (draft)

**Status:** all decisions made 2026-11-06; no open items
**Last updated:** 2026-11-06
**Related:** [`topic-map.md`](topic-map.md),
[`lesson-template.md`](lesson-template.md)

How a lesson goes from a line in the topic map to a published page in
Arabic, English and French. Built for the current reality: Claude writes,
CI checks, Mohammad is the only reviewer.

---

## 1. The flow

```
Topic map entry
   │
   ▼
① Plan ─────── GitHub issue "New lesson: <lessonId>"
   │
   ▼
② Research ─── Claude finds official sources, maps each claim → source
   │
   ▼
③ Draft AR ─── Claude writes the Arabic lesson from the template
   │
   ▼
④ Self-check ─ Claude, in a separate pass, re-checks every claim and the rules
   │
   ▼
⑤ Translate ── Claude writes EN and FR from the Arabic version
   │
   ▼
⑥ Pull request ─ CI runs automated checks + preview link
   │
   ▼
⑦ Review ───── Mohammad reviews in Telegram → changes or approval
   │
   ▼
⑧ Publish ──── merge to main → live site
   │
   ▼
⑨ Maintain ─── weekly link check, re-verify dates, error reports
```

**Rules:**
- `main` only ever holds approved lessons. Anything not approved lives in
  a branch.
- Claude commits and pushes **only to `lesson/*` branches**, and only
  inside a skill Mohammad runs (`new-lesson`, `review-sync`,
  `fix-lesson`). Never to `main`.
- **Only Mohammad merges** (decided 2026-11-06). Branch protection on
  `main`: PR required, blocking checks must pass.

## 2. Roles

| Who | Does | Never does |
|---|---|---|
| **Claude** | Research, Arabic draft, self-check, translations, fixes after review, opens the PR | Approves, merges, invents a source |
| **CI** | Schema, structure, links, accessibility basics, build | Judges accuracy |
| **Mohammad** | Reviews every language version in Telegram (his ✅ is the approval) and merges every PR himself | — |
| **Domain experts** (optional) | Review lessons in their field when available | — |
| **Community** (after launch) | Reports errors, suggests topics, improves translations through PRs | Publishes without review |

## 3. The stages

### ① Plan

- One GitHub issue per lesson, from a "New lesson" issue template: lesson
  ID, objective (copied from the topic map), labels `lesson`,
  `topic:<topic>`, `level:<n>`, plus `pilot` for `safety-l0-01` to `05`.
- Branch: `lesson/<lessonId>`.

### ② Research

- Claude searches for sources in the order set by the lesson template's
  source rules: official bodies → vendor documentation → educational
  organizations.
- Claude **opens every source** and confirms that it says what the lesson
  will claim. A source Claude has not opened in this session does not count.
- Output: a **claim map** in the PR description:

  | # | Claim (one line) | Source | Where in the source |
  |---|---|---|---|
  | 1 | … | <title — publisher> | <section heading> |

  The claim map points to the place in the source. It does not copy
  passages.
- **No official source for a claim → the claim is cut**, or the lesson is
  flagged in the issue. Claude never fills the gap from memory.
- Sources that disagree → listed in the PR for Mohammad to decide.

### ③ Draft Arabic

- Claude writes the Arabic file from `lesson-template.md`: six sections,
  Level 0 language rules, masculine singular generic, digits 0–9.
- Frontmatter: `sourceLang: ar`, `ai.assisted: true`, `ai.model: <model ID>`,
  `review.status: draft`.
- Device-specific steps: say which platform (Android / iOS / Windows /
  macOS). If the steps differ a lot, split them by platform.

### ④ Self-check

A separate Claude pass, with its own instructions, run before any
translation:

- Re-open each source and check each claim in the claim map against it.
- Compare the lesson text with the source text: flag any run of copied
  wording.
- Check the objective, the level, the template sections, alt text, quiz
  answers.
- Output: a short **self-check report** in the PR: what was checked, what
  was changed, what is still uncertain.

The self-check lowers Mohammad's load. It does not replace his review.

### ⑤ Translate

- Claude writes English and French from the Arabic version after its
  self-check, in the same branch.
- Facts, steps, sources and quiz answers stay identical. Phrasing and
  examples may adapt.
- If an equal official source exists in the target language, it may
  replace the English one for that version; it is added to the claim map.

### ⑥ Pull request and CI

One PR per lesson with three files. Title: `lesson: <lessonId> — <EN title>`.
Status moves to `review.status: in-review` when the PR is marked ready.

**Blocking checks** (PR cannot merge):

| Check | Rule |
|---|---|
| Schema | Frontmatter matches the Zod schema |
| Structure | `lang`, `topic`, `level` match the folder; `lessonId` identical in all three files |
| Completeness | All three languages present |
| Sources | At least one source; every source has `url` and `accessed` |
| Links | Every source URL and in-text link resolves |
| Images | Every image has alt text |
| Approval | A lesson merged to `main` has `review.status: approved`, `reviewer` and `date` |
| Build | Site builds |

**Warnings** (shown, do not block):

- Length outside 400–800 words.
- `duration` outside 5–10 minutes for Level 0.
- A source URL that answered slowly or with a redirect.

**Preview (decided 2026-11-06: Cloudflare Pages):** each PR gets its own
preview URL. Preview builds set `SHOW_DRAFTS=true`, so draft lessons are
visible there and never on the live site. Mohammad reviews the real page on
his phone, not raw Markdown.

### ⑦ Review (Mohammad, in Telegram) — decided 2026-11-06

Same pattern as the awadallah.vip articles bot (@Awadallah_bot): review
cards with preview links, decisions sent back with notes.

1. When the PR is ready and CI is green, Claude sends **three review
   cards** to the DiwanTC review bot, one per language. Each card: lesson
   title, level, language, the preview link to that language's page, and
   the self-check summary.
2. Buttons on each card:
   - ▶️ بدء المراجعة — starts the review timer.
   - ✅ موافق — approves this language version.
   - ✏️ تعديل — asks for notes (a text reply), which go back to Claude.
3. The bot stores decisions. Claude Code reads them (like the articles
   bot's `pending` command), posts them to the PR as comments so GitHub
   keeps the full history, fixes the notes in the same branch, and sends
   new cards for the changed versions only.
4. When all three versions have ✅: Claude commits `review.status:
   approved`, `reviewer`, `date` to the three files in the lesson branch,
   and sends Mohammad the PR link. **Mohammad merges it himself.**
5. Review minutes = time from ▶️ to ✅ or ✏️, logged per version by the bot.
   No manual entry.

**Why Claude pulls the decisions:** the bot server never holds a GitHub
write token. Every GitHub write happens in Mohammad's own Claude Code
session.

The checklist in `lesson-template.md` §7 still applies; each card links
to it.

### ⑧ Publish

- Merge to `main` → production build. Production shows `approved` lessons
  only.
- The lesson page renders sources, the AI disclosure, reviewer and date
  from frontmatter.

### ⑨ Maintain

- **Weekly scheduled CI job:** re-checks every source link in published
  lessons and every reporting-channel entry; opens an issue for each
  failure.
- **Re-verify (decided 2026-11-06, by how fast things change):**
  - Every **3 months**: `ai` lessons, reporting-channel entries, and any
    lesson with device-specific steps (`platforms` set).
  - Every **12 months**: all other lessons.
  - The weekly job lists what is due and opens one issue per item.
- **Error reports (decided 2026-11-06: form with no account):**
  - Every lesson page has a "Found a mistake?" link (AR: وجدت خطأ؟ /
    FR : Une erreur ?). It opens a short form: lesson ID and language
    (pre-filled) and what is wrong. No name, email or other personal data.
  - The form posts to a Cloudflare Pages Function, protected by Cloudflare
    Turnstile and a rate limit. The function opens a GitHub issue labelled
    `error-report`, using a token limited to issues on this repo and stored
    as a Cloudflare secret.
  - Fix flow: issue → Claude fixes in a branch → a review card in Telegram
    for the changed version only → merge.

## 4. How Claude runs it

**Recommended: Claude Code, inside the repo.**

- A repo `CLAUDE.md` with the content rules (short, pointing to the template).
- A project skill, `.claude/skills/new-lesson/SKILL.md`, that runs stages
  ② to ⑥ for one `lessonId`, opens the PR and sends the Telegram cards.
- `review-sync`: reads decisions from the bot, applies notes, and on three
  ✅ commits the review fields and sends the PR link for Mohammad to merge.
- `fix-lesson`: handles error-report issues.
- Uses Claude Code's web search and fetch for research and source checks.

Why: no extra infrastructure, it is how Mohammad already works, and every
step stays visible in the session.

**Later, at scale:** a GitHub Action that calls the Claude API when an
issue gets a `draft-lesson` label. Needs an API key in repository secrets
and a budget. Not for phase 1.

## 5. Pilot measurements (week 3)

For `safety-l0-01` to `05`, record in each PR:

| Metric | Why it matters |
|---|---|
| Review minutes per language version | Sets the real timeline for the other 63 versions (78 − 15) |
| Review rounds until approval | Shows how good the drafts are |
| Factual errors Mohammad found that the self-check missed | **The key number**: how much the AI checking can be trusted |
| Sources that failed (dead, wrong, not official) | Shows research quality |
| Claude usage per lesson | Input for the monthly budget |

After the pilot, adjust the template, the self-check instructions and the
schedule before writing the other topics.

## 6. Repo files this needs (built in week 2)

```
.github/
  ISSUE_TEMPLATE/
    new-lesson.yml
    report-error.yml
    suggest-topic.yml
  PULL_REQUEST_TEMPLATE.md      lesson checklist, claim map, self-check report
  workflows/
    content-checks.yml          blocking checks + warnings on PRs
    weekly-maintenance.yml      link check + re-verify list
.claude/
  skills/
    new-lesson/SKILL.md
    review-sync/SKILL.md
    fix-lesson/SKILL.md
CLAUDE.md
functions/
  api/report.ts                 no-account error form → GitHub issue
src/data/reporting-channels/    one YAML file per country
bot/                            Telegram review bot (articles-bot code, same server)
scripts/
  check-content.ts              schema, structure, completeness, alt text
  check-links.ts                source and in-text links
```

Secrets (Telegram bot token, GitHub issue token, Turnstile secret) live in
Cloudflare secrets or the bot server's `.env`, never in the repo.

## Decided 2026-11-06

- Hosting: Cloudflare Pages, with per-PR previews.
- Error reports: a form with no account, posting to GitHub issues.
- Re-verify: 3 months for fast-changing content, 12 months for the rest.
- Review: in Telegram, with review cards and buttons.
- Review bot: a new bot built on the @Awadallah_bot articles code, running
  on the same server.
- Merging: Mohammad merges every PR himself. Claude only prepares it.

## Open questions

None. Mohammad's step before the pilot: create the new bot with
BotFather and choose its name. The token goes in the server's `.env`
only.
