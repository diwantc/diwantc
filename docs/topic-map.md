# Topic Map — DiwanTC (draft)

**Status:** Level 0 lists and pilot approved 2026-11-06; open items at the end
**Last updated:** 2026-11-06
**Related:** [`lesson-template.md`](lesson-template.md)

Topics 1–4 are the launch set. Mohammad approved the Level 0 lesson lists
and the pilot on 2026-11-06. Topic 5 (languages) comes after the Level 0
launch.

---

## Levels

| Level | Name (AR / EN / FR) | Who it is for | Rules |
|---|---|---|---|
| **0** | ابدأ من هنا / Start here / Commencer ici | No background. May use a phone but not a computer | Every term explained, one idea per lesson, no installs |
| **1** | مبتدئ / Beginner | Finished Level 0, or uses devices daily | Hands-on tasks, still no assumed jargon |
| **2** | متوسط / Intermediate | Knows the basics, wants to work independently | How things work underneath, small projects |
| **3** | متقدم / Advanced | Wants deeper study or a career path | Points to formal study and certifications |

Phase 1 builds **Level 0 only**. Levels 1–3 are outlined so Level 0 leads
somewhere, not designed in detail.

## Lesson IDs and URLs

- **Lesson ID** (same for all three languages): `<topic>-l<level>-<nn>`
  → `safety-l0-01`
- **URL:** `/<lang>/<topic>/<level>/<slug>` → `/ar/safety/0/strong-passwords`
- Topic slugs: `basics`, `safety`, `ai`, `programming`

---

## 1. Computer & internet basics — `basics`

أساسيات الحاسب والإنترنت · Computer & internet basics · Les bases de l'informatique et d'internet

**Level 0** — prerequisites: none

| ID | Title (AR) | Title (EN) | Learner can… |
|---|---|---|---|
| basics-l0-01 | ما هو الجهاز؟ الجوال والجهاز اللوحي والحاسب | What is a device? | Tell phone, tablet and computer apart and say what each is good for |
| basics-l0-02 | الجهاز والبرامج والتطبيقات | Hardware, software and apps | Explain the difference between the device and the apps on it |
| basics-l0-03 | ما هو الإنترنت وكيف تتصل به | What is the internet and how to connect | Connect to Wi-Fi and know when mobile data is used |
| basics-l0-04 | المتصفح والبحث | Browsers and search | Open a website and search for information |
| basics-l0-05 | الملفات والمجلدات: أين تُحفظ صورك ومستنداتك | Files and folders | Find, open and organize photos and documents |
| basics-l0-06 | البريد الإلكتروني | Email | Read, write and send an email |
| basics-l0-07 | التحديثات: لماذا يطلب جهازك التحديث؟ | Updates: why your device asks | Install updates and know why they matter |

**Later levels**
- **L1:** documents and spreadsheets, cloud storage and backups, sharing files.
- **L2:** how networks work (router, IP address, DNS), basic troubleshooting.
- **L3:** IT foundations as a career path (operating systems, networking, support).

## 2. Digital safety — `safety`

الأمن الرقمي · Digital safety · La sécurité numérique

**Level 0** — prerequisites: none. Can be a learner's first topic.

| ID | Title (AR) | Title (EN) | Learner can… |
|---|---|---|---|
| safety-l0-01 | كلمات مرور قوية | Strong passwords | Create a strong password or passphrase |
| safety-l0-02 | التحقق بخطوتين | Two-step verification | Turn on two-step verification for an account |
| safety-l0-03 | كيف تكتشف رسائل الاحتيال | Spotting scam messages | Recognize common signs of a scam SMS, WhatsApp message or email |
| safety-l0-04 | لا تشارك رمز التحقق أبداً | Never share a verification code | Explain why a one-time code must never be shared, even with "the bank" |
| safety-l0-05 | الروابط المشبوهة والمواقع المزيفة | Suspicious links and fake websites | Check a link before opening it |
| safety-l0-06 | أذونات التطبيقات | App permissions | Review what an app can access and remove what it does not need |
| safety-l0-07 | ماذا تفعل إذا تعرضت للاحتيال؟ | What to do if you are scammed | Take the first steps: secure accounts, call the bank, report |

**`safety-l0-07` — decided 2026-11-06: as many countries as possible from
the start.**
- The lesson body holds the general steps, the same for everyone. Reporting
  channels come from one data file per country (e.g.
  `src/data/reporting-channels/sa.yaml`), shown through a country picker.
- Each entry: country, channel name, type (website / phone / app), contact,
  official source URL, `lastVerified`. An entry without an official source
  is not shown.
- Contacts do not depend on language, so each country is verified once and
  shared by all three language versions. Only names and labels are
  translated.
- Proposed order: Saudi Arabia → other GCC countries → other Arab countries
  → main French- and English-speaking countries.
- Contacts change: the weekly CI job flags entries whose `lastVerified` is
  older than 3 months (decided 2026-11-06).
- Data format, rules and coverage: [`reporting-channels.md`](reporting-channels.md).

**Later levels**
- **L1:** password managers, backups, home Wi-Fi security, privacy settings in social apps.
- **L2:** how attacks work (malware, social engineering), securing a small business.
- **L3:** cybersecurity as a field of study and career.

## 3. Everyday AI — `ai`

الذكاء الاصطناعي في الحياة اليومية · Everyday AI · L'IA au quotidien

**Level 0** — prerequisites: `basics-l0-03`, `basics-l0-04`

| ID | Title (AR) | Title (EN) | Learner can… |
|---|---|---|---|
| ai-l0-01 | ما هو الذكاء الاصطناعي وما ليس هو | What AI is, and what it is not | Explain AI in one sentence without myths |
| ai-l0-02 | المساعدات الذكية: كيف تسأل سؤالاً جيداً | Chat assistants: asking a good question | Write a clear request and improve it |
| ai-l0-03 | الذكاء الاصطناعي يخطئ: كيف تتحقق من الإجابة | AI makes mistakes: checking answers | Verify an AI answer against a reliable source |
| ai-l0-04 | ماذا لا تشارك مع أدوات الذكاء الاصطناعي | What not to share with AI tools | Keep personal and sensitive data out of AI tools |
| ai-l0-05 | الصور والأصوات والفيديوهات المزيفة | Fake images, voices and videos | Recognize signs of AI-generated media and verify before sharing |
| ai-l0-06 | استخدامات عملية: الكتابة والترجمة والتلخيص | Practical uses: writing, translating, summarizing | Use an assistant for one real daily task |

⚠ AI tools change fast. Lessons stay **tool-agnostic** where possible, and
every lesson carries a `lastVerified` date (see lesson template).

**Later levels**
- **L1:** AI for work and study, AI for documents and images, judging sources.
- **L2:** how models work (data, training, limits), automation with AI tools.
- **L3:** building with AI APIs and local models.

## 4. Programming for beginners — `programming`

البرمجة للمبتدئين · Programming for beginners · La programmation pour débutants

**Level 0** — prerequisites: `basics-l0-01` to `basics-l0-04`. No installs:
everything in the browser.

| ID | Title (AR) | Title (EN) | Learner can… |
|---|---|---|---|
| programming-l0-01 | ما هي البرمجة؟ | What is programming? | Explain what a program is with everyday examples |
| programming-l0-02 | خطوات بالترتيب: الخوارزميات في حياتك | Steps in order: algorithms in daily life | Write a task as ordered, exact steps |
| programming-l0-03 | المتغيرات: صناديق تحفظ القيم | Variables: boxes that hold values | Explain what a variable is and use one |
| programming-l0-04 | القرارات: إذا… وإلا | Decisions: if… else | Read and write a simple condition |
| programming-l0-05 | التكرار | Repetition: loops | Read and write a simple loop |
| programming-l0-06 | أول برنامج لك في المتصفح | Your first program in the browser | Run and change a small program |

**`programming-l0-06` — decided 2026-11-06: code runs inside the lesson
page, in JavaScript** (runs in every browser with no download). The runner
is now part of phase 1.

**Later levels**
- **From L1 the topic splits into language tracks:** JavaScript, Python, and
  more later. The learner picks a track; lessons carry a `track` field.
- **Runner per track:** JavaScript runs natively in a sandbox. Python needs
  an in-browser runtime (several MB), loaded only on Python lessons.
- **L2:** small projects (a web page, a script that saves time).
- **L3:** paths into web, data and software careers.

---

## Size of Level 0

| Topic | Lessons | × 3 languages |
|---|---|---|
| basics | 7 | 21 |
| safety | 7 | 21 |
| ai | 6 | 18 |
| programming | 6 | 18 |
| **Total** | **26** | **78** versions to review |

The week-3 pilot measures how long one review takes. That number, times 78,
sets the real date for finishing Level 0.

## Pilot (week 3) — approved 2026-11-06

**Topic:** digital safety, lessons `safety-l0-01` to `safety-l0-05`, in all
three languages (15 versions).

Why safety and not basics:
- Useful to **every** tester, including people who already use computers —
  basics Level 0 only tests well with true beginners.
- Strongest test of the sources rule: every claim must have an official source.
- Best fit for the first DiwanTC videos (short, practical, easy to share).

---

## 5. Languages — after the Level 0 launch

تعليم اللغات · Languages · Les langues

Decided 2026-11-06: added **after** the tech Level 0 is live. Not part of
phase 1.

- **Requested:** English for Arabic speakers, English for technology,
  French, Arabic for non-native speakers, and many more later.
- **Review:** AI review using MCP tools (Mohammad's choice).
- **Audio:** generated voice, checked by a native speaker.
- Language lessons are a different content type: audio, listening and
  speaking practice, spaced repetition. They need new components and their
  own lesson template, designed when this phase starts.
- Phase 1 only keeps the door open: the content model accepts new topics
  and audio files. Nothing else is built for languages now.

⚠ Concern (Claude): AI reviewing AI-written language lessons misses
unnatural phrasing that a beginner cannot catch. The native speaker who
checks the audio could also spot-check the text. Decide when this phase
starts.

## Candidate topics for after Level 0 (not decided)

Smartphone skills, office and productivity tools, government e-services,
digital payments, networks, hardware and repair, content creation.

## Decided 2026-11-06

- Level 0 lesson lists: approved as written (26 lessons).
- Pilot: digital safety, `safety-l0-01` to `safety-l0-05`.
- `safety-l0-07`: as many countries as possible from the start.
- `programming-l0-06`: runner inside the lesson page, in JavaScript.
- Programming: several languages (JavaScript, Python, more) as tracks from L1.
- Languages topic: after the Level 0 launch.

## Open questions

1. Which programming languages come after JavaScript and Python.
2. Languages topic: does a native speaker also spot-check the text?
