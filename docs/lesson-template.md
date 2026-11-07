# Lesson Template — DiwanTC (draft)

**Status:** all decisions made 2026-11-06; no open items
**Last updated:** 2026-11-07
**Related:** [`topic-map.md`](topic-map.md)

Every lesson, in every language, follows this template. Claude drafts to it,
CI checks it, and Mohammad reviews against the checklist at the end.

---

## 1. File layout

```
src/content/lessons/<lang>/<topic>/l<level>/<nn>-<slug>.mdx
```

Example: `src/content/lessons/ar/safety/l0/01-strong-passwords.mdx`

- One file per language. The three versions share one `lessonId`.
- `<slug>` is in English for all languages, so URLs stay stable.

## 2. Frontmatter

| Field | Type | Required | Rule |
|---|---|---|---|
| `lessonId` | string | yes | `<topic>-l<level>-<nn>`, identical across languages |
| `lang` | `ar` \| `en` \| `fr` | yes | Must match the folder |
| `sourceLang` | `ar` \| `en` \| `fr` | yes | Which version is the original. Always `ar`: Claude drafts in Arabic first, then translates |
| `topic` | `basics` \| `safety` \| `ai` \| `programming` | yes | Must match the folder |
| `level` | 0–3 | yes | Must match the folder |
| `track` | `js` \| `python` \| … | programming L1+ | Language track. Not used in Level 0 |
| `order` | integer | yes | Position in the level; drives "next lesson" |
| `title` | string | yes | Short, plain words |
| `summary` | string | yes | One sentence, used in cards and search |
| `objective` | string | yes | One outcome: "After this lesson you can …" |
| `duration` | integer (minutes) | yes | 5–10 for Level 0 |
| `prerequisites` | list of `lessonId` | no | Empty for entry lessons |
| `terms` | list of strings | no | Key terms, to build a glossary later |
| `sources` | list (see below) | yes | At least one. Every factual claim needs one |
| `lastVerified` | date | yes | When the facts were last checked against sources |
| `platforms` | list: `android` \| `ios` \| `windows` \| `macos` | if steps depend on the device | Shown on the page. Puts the lesson on the 3-month re-verify cycle |
| `ai.assisted` | boolean | yes | `true` when AI wrote or translated any part |
| `ai.model` | string | if assisted | Model ID used, for traceability |
| `review.status` | `draft` \| `in-review` \| `approved` | yes | Only `approved` lessons appear on the live site; PR previews show all |
| `review.reviewer` | string | if approved | Who approved |
| `review.date` | date | if approved | When approved |
| `review.notes` | string | no | What changed in review |

**Source entry**

| Field | Rule |
|---|---|
| `title` | Title of the page or document |
| `publisher` | Organization that published it |
| `url` | Direct link. CI checks that it resolves |
| `lang` | Language of the source |
| `accessed` | Date it was read (YYYY-MM-DD) |
| `supports` | Which claim in the lesson it backs, in a few words |

**Example (placeholders, not real data)**

```yaml
---
lessonId: safety-l0-01
lang: ar
sourceLang: ar
topic: safety
level: 0
order: 1
title: "<lesson title>"
summary: "<one sentence>"
objective: "<after this lesson you can …>"
duration: 7
prerequisites: []
terms: ["<term>"]
sources:
  - title: "<page title>"
    publisher: "<organization>"
    url: "<https://…>"
    lang: en
    accessed: 2026-11-10
    supports: "<which claim>"
lastVerified: 2026-11-10
ai:
  assisted: true
  model: "<model id>"
review:
  status: draft
---
```

The Astro Content Collections schema (Zod) is written in week 2, from this
table, against the Astro version installed at scaffold time.

## 3. Lesson body

Six sections, always in this order. Headings use the lesson's language:

| # | Section | AR | EN | FR | What goes in it |
|---|---|---|---|---|---|
| 1 | Hook | لماذا يهمك هذا؟ | Why it matters | Pourquoi c'est important ? | 2–3 sentences: a real situation the learner recognizes |
| 2 | Idea | الفكرة | The idea | L'idée | The one concept, in plain words |
| 3 | Steps | خطوة بخطوة | Step by step | Étape par étape | Numbered steps or a worked example, with screenshots |
| 4 | Practice | جرّب بنفسك | Try it | À vous de jouer | One task the learner can do on a phone |
| 5 | Check | اختبر نفسك | Check yourself | Testez-vous | 2–3 questions, answers hidden until opened |
| 6 | Summary | الخلاصة | Key points | À retenir | 3 bullet points |

Rendered automatically from frontmatter (not written in the body): next
lesson link, sources list, AI disclosure, reviewer and date.

**AI disclosure text**

- AR: كُتب هذا الدرس بمساعدة الذكاء الاصطناعي، وراجعه {reviewer} — فريق ديوان تيك، بتاريخ {date}.
- EN: This lesson was written with AI assistance and reviewed by {reviewer} — DiwanTC team, on {date}.
- FR : Cette leçon a été rédigée avec l'aide de l'IA et relue par {reviewer} — équipe DiwanTC, le {date}.

The reviewer's real name and the team name always appear together
(decided 2026-11-06).

## 4. MDX skeleton (Arabic)

```mdx
---
# frontmatter as in section 2
---

## لماذا يهمك هذا؟

<موقف حقيقي يعرفه المتعلم، في جملتين أو ثلاث>

## الفكرة

<الفكرة الواحدة بكلمات بسيطة. كل مصطلح يُشرح أول مرة يظهر فيها:
كلمة المرور (Password) هي …>

## خطوة بخطوة

1. <خطوة>
2. <خطوة>

![<وصف الصورة لمن لا يراها>](./images/<file>.png)

## جرّب بنفسك

<مهمة واحدة ينفذها المتعلم الآن على جواله>

## اختبر نفسك

**1. <سؤال>**

<details>
<summary>اعرض الإجابة</summary>

<الإجابة مع سبب قصير>

</details>

## الخلاصة

- <نقطة>
- <نقطة>
- <نقطة>
```

Answers use `<details>` so they work without JavaScript and with screen
readers. An interactive quiz component can replace it later without
changing the content.

### Running code in a lesson (`<CodeRunner>`)

Programming lessons can let the learner run and change a program on the
page. `<CodeRunner>` is available in every lesson without an import:

```mdx
<CodeRunner
  title="مثال 1: أول برنامج"
  code={`
    let name = "سارة";
    console.log("مرحباً يا " + name + "!");
  `}
/>
```

- `code` (required): the starting program, in a template literal. The blank
  first and last lines and the shared indentation are removed. Write a
  backtick as `` \` `` and `${` as `\${`.
- `title` (optional): a visible caption in the lesson's language.
- `language`: `js`, the default and the only one for now. A later Python
  track adds `python`, whose runtime loads only on Python lessons.
- The learner can edit, run (button, or Ctrl+Enter / ⌘+Enter), stop, and
  restore the original code. Nothing is saved.
- The output panel is always left-to-right and shows `console.log`,
  `console.warn` and `console.error` lines. A status line in the lesson's
  language says how the run ended. Errors show the browser's message, the
  line number, and one plain sentence for `SyntaxError`, `ReferenceError`,
  `TypeError` and `RangeError`.
- A run stops after 5 seconds or 500 printed lines.
- Arabic in the editor: the editor is a plain left-to-right text box. A
  number written right after an Arabic string on the same line is drawn
  inside the string (in `console.log("العدد:", 5)` the 5 appears next to the
  Arabic word). This comes from the Unicode bidirectional algorithm, not
  from the runner. In lesson code, put the number in a variable first:
  `let count = 5;` then `console.log("العدد:", count);`. The output panel
  shows Arabic correctly either way.
- The code runs in a sandbox with no access to the page, cookies, storage
  or the network. `document`, `alert`, `prompt` and `fetch` do not work:
  teach with `console.log`.
- To see it: `npm run dev:demo`, then `/ar/programming/0/runner-demo/`.

## 5. Writing rules

**Level 0 language**
- One objective per lesson. If it needs two, split it.
- Short sentences. One idea per paragraph.
- Explain every technical term the first time it appears. In Arabic, give
  the English term in parentheses on first use: كلمة المرور (Password).
- Speak to the learner directly. Concrete examples, not abstract ones.
- Target length 400–800 words — a starting target, to be tuned with the
  pilot's real reading times.
- No fear-based wording in safety lessons: explain the risk, then the fix.

**Arabic**
- Simple Modern Standard Arabic (فصحى مبسطة), not dialect.
- Address the learner in the masculine singular as the generic form
  (افتح الإعدادات). Use neutral phrasing when it costs nothing.
- Western digits 0–9, matching screens, screenshots, verification codes and
  code.
- Claude writes the Arabic version first; English and French are
  translated from it.

**Translations**
- A translation is an adaptation: natural phrasing and local examples are
  fine; facts, steps and sources stay identical.
- Use a source in the target language when an equivalent official one exists.
- Each language version is reviewed on its own.

**Screenshots and steps**
- When steps depend on a device, say which (Android / iOS / Windows /
  macOS), and keep `lastVerified` current.
- Prefer steps that do not depend on one brand's app.

**Accessibility**
- Every image has alt text in the lesson's language.
- No information carried by color alone.
- Link text says where it goes ("Google's two-step verification help page"),
  never "click here".

**Media**
- Own screenshots, or openly licensed media only. Record the license and
  credit for anything not ours.

## 6. Source rules

1. Every factual claim has a source in `sources`.
2. Preferred sources, in order:
   1. Official bodies and standards (national cybersecurity authorities,
      standards organizations).
   2. The vendor's own documentation for product steps (Apple, Google,
      Microsoft help pages).
   3. Established educational organizations.
   4. Reputable news, only for events.
3. Not acceptable as a source: AI output, forums, social posts, or a blog
   as the only source.
4. Paraphrase, never copy. A short quote only when the exact wording
   matters, in quotation marks.
5. Claude must give a real, working URL for every source. Mohammad
   spot-checks sources during review. CI checks that links resolve.

## 7. Review checklist (Mohammad)

Before setting `review.status: approved`:

- [ ] The objective is met by the end of the lesson.
- [ ] Each claim matches its source (open the sources, at least spot-check).
- [ ] Right level: a true beginner can follow it with no outside help.
- [ ] Language reads naturally, not like a translation.
- [ ] No copied text from sources.
- [ ] Steps were tried on a real device, or match the vendor's current docs.
- [ ] Quiz answers are correct.
- [ ] Every image has alt text, and media licenses are recorded.
- [ ] `lastVerified`, `review.reviewer` and `review.date` are filled.

## Decided 2026-11-06

- Arabic second person: masculine singular as the generic form.
- Digits in Arabic lessons: Western 0–9.
- Drafting order: Arabic first, then English and French.
- Reviewer shown on the page: real name and team name together.

## Open questions

None.
