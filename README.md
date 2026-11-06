# ديوان تيك · DiwanTC

<div dir="rtl" lang="ar">

**تعلّم التقنية بلغة بسيطة، مجاناً وللجميع.**

ديوان تيك منصة مفتوحة المصدر لتعليم التقنية لكل الناس، بالعربية والإنجليزية والفرنسية.
تبدأ الدروس من الصفر، ولكل درس مصادر موثوقة، ويراجعه إنسان قبل نشره.

**الحالة:** قبل الإطلاق. نبني الآن «المستوى صفر» في أربعة مواضيع: أساسيات الحاسب والإنترنت، والأمن الرقمي، والذكاء الاصطناعي في الحياة اليومية، والبرمجة للمبتدئين.

**كيف تساهم:** أبلغ عن خطأ في درس، أو اقترح موضوعاً، أو حسّن ترجمة. التفاصيل في [CONTRIBUTING.md](CONTRIBUTING.md).

**الرخصة:** الكود MIT، والدروس CC BY-SA 4.0.

</div>

---

**Learn technology in plain language — free, for everyone.**

DiwanTC is an open-source platform that teaches technology to everyone, in
Arabic, English and French. Lessons start from zero, cite trusted sources, and
are reviewed by a person before they are published.

**Status:** pre-launch. We are building "Level 0" for four topics: computer &
internet basics, digital safety, everyday AI, and programming for beginners.

## How lessons are made

Lessons are drafted with AI assistance, checked against official sources,
and approved by a human reviewer. The full process is public:

- [`docs/topic-map.md`](docs/topic-map.md) — topics, levels and the Level 0 lesson list
- [`docs/lesson-template.md`](docs/lesson-template.md) — lesson format and writing, source and review rules
- [`docs/content-pipeline.md`](docs/content-pipeline.md) — from idea to published lesson

## Run it locally

Requires Node.js 22.23.4 or newer (see `.nvmrc`).

```bash
npm install
npm run dev        # real lessons (only approved ones are shown)
npm run dev:demo   # demo lessons from tests/fixtures, drafts visible
```

Checks:

```bash
npm run check:content   # structure, languages, alt text
npm run check:links     # source and link health
npm test                # tests for the content checker
npm run typecheck
npm run build
```

## Deployment

Cloudflare Pages: build command `npm run build`, output folder `dist`.
Set `SHOW_DRAFTS=true` **only** in the Preview environment, so pull-request
previews show lessons under review and the live site shows approved lessons only.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). Security issues: [SECURITY.md](SECURITY.md).

## License

- Code, configuration and docs: [MIT](LICENSE)
- Lessons and data: [CC BY-SA 4.0](LICENSE-CONTENT.md)
