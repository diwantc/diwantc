# Error reports — "Found a mistake?"

**Status:** code ready; needs the Cloudflare and GitHub setup below before it works.
**Decided 2026-11-06:** a form with no account, posting to GitHub issues
([`content-pipeline.md`](content-pipeline.md) §⑨).

## How it works

```
Lesson page ── "وجدت خطأ في هذا الدرس؟" link
   │
   ▼
/<lang>/report/<lessonId>/          src/pages/[lang]/report/[lessonId].astro
   form: what is wrong + Turnstile (lesson ID and language are fixed by the page)
   │  POST /api/report (JSON)
   ▼
Pages Function                      functions/api/report.ts
   1. check the fields (and a hidden honeypot field)
   2. rate limit: 5 reports per IP per clock hour (Workers KV)
   3. verify the Turnstile token with Cloudflare (siteverify)
   4. open a GitHub issue labelled `error-report`
   │
   ▼
Issue "Error: <lessonId> (<lang>)" ── maintainer runs the `fix-lesson` skill
```

- Without JavaScript, or when the form is not set up, the page shows a link to
  the GitHub issue form (`report-error.yml`) instead. That needs a GitHub account.
- Report pages are excluded from the sitemap and marked `noindex`.

## What we store, and what is public

- **The form asks only for the text of the report.** No name, no email.
- **The report is public.** It becomes a GitHub issue that anyone can read. The
  form says so and asks readers not to include personal information.
- **The reader's text is put inside a code block in the issue.** @mentions,
  links and formatting from an anonymous form do not reach GitHub.
- **IP address:**
  - It is sent to Cloudflare's Turnstile check (`remoteip`).
  - For the rate limit, KV stores only a SHA-256 hash of the IP plus the
    current hour, and the entry expires after an hour.
  - It is never written to the issue.

## Limits

| What | Limit | Where |
|---|---|---|
| Report text | 10–2000 characters | `LIMITS` in `functions/api/report.ts`, shown on the form |
| Reports per IP | 5 per clock hour (approximate: KV is eventually consistent) | same |
| Request body | 16,384 characters | same |
| Turnstile token | 2048 characters, valid 5 minutes, single use | Cloudflare |

## Responses

| HTTP | `error` | Form message |
|---|---|---|
| 201 | — (`ok: true`, `issue: {number, url}`) | thanks + link to the issue |
| 400 | `invalid` | write at least 10 characters |
| 403 | `captcha` | the human check did not finish + GitHub link |
| 429 | `rate-limited` | try again in an hour |
| 503 | `unavailable` | form not working + GitHub link |

`unavailable` covers missing secrets or KV binding, a Turnstile outage and a
GitHub error.

## Setup (maintainer, once)

Everything below lives in Cloudflare or GitHub, never in the repo.

1. **Turnstile widget.**
   - Create a Turnstile widget for `diwantc.com`, and note its site key and secret key.
   - Arabic (`ar`) and French (`fr`) are in Cloudflare's supported-language
     list. The form passes the page's language to the widget.
2. **GitHub token.**
   - Create a fine-grained personal access token with access to the
     `diwantc/diwantc` repository only.
   - Its only permission is **Issues: Read and write**. GitHub's permission
     table lists `POST /repos/{owner}/{repo}/issues` under Issues (write).
   - Give it an expiry date and note it in your calendar.
   - Issues are created under the account that owns the token.
3. **KV namespace.**
   - Create a Workers KV namespace (for example `diwantc-report-limits`).
   - Bind it to the Pages project as **`REPORT_RATE_LIMIT`**, for Production.
4. **Variables and secrets.** Set these in the Pages project under Settings → Variables and Secrets, for Production:

   | Name | Type | Value |
   |---|---|---|
   | `PUBLIC_TURNSTILE_SITE_KEY` | plain variable; it must be available when the site is built | Turnstile site key |
   | `TURNSTILE_SECRET_KEY` | secret (encrypted) | Turnstile secret key |
   | `GITHUB_ISSUES_TOKEN` | secret (encrypted) | the token from step 2 |
   | `GITHUB_REPO` | optional plain variable | only if issues should go to another repo |

5. **Preview deployments.** Leave these unset for Preview, so preview pages
   show the GitHub link and never open real issues. To test the whole flow on a
   preview, use Cloudflare's Turnstile test keys and point `GITHUB_REPO` at a
   test repository.
6. **Redeploy, then test.**
   - Open a lesson, choose "وجدت خطأ في هذا الدرس؟" and send a short test report.
   - Check that the issue appears with the `error-report` label, then close it.
   - Once this works, update the "Report a mistake" line in `CONTRIBUTING.md`.

Official references used for this design:

- Turnstile server-side validation (siteverify, 5-minute single-use tokens, 2048-character limit): https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Turnstile test keys: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
- Pages Functions bindings, secrets and `.dev.vars`: https://developers.cloudflare.com/pages/functions/bindings/
- Workers KV writes (`expirationTtl` minimum 60 s, one write per second per key, eventual consistency): https://developers.cloudflare.com/kv/api/write-key-value-pairs/
- GitHub "Create an issue": https://docs.github.com/en/rest/issues/issues#create-an-issue

## Local work

- `node --test tests/report-function.test.mjs` tests the function with fake
  Turnstile, GitHub and KV. `npm test` runs it too.
- `astro dev` serves the form page but not the function. With
  `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` (Cloudflare's test key that
  always passes) the widget renders. Sending then shows the "unavailable"
  message, because `/api/report` does not exist under `astro dev`.
- To run the function locally with Wrangler, put the secrets in `.dev.vars`
  (git-ignored). See the Pages Functions bindings page above.

## Why not a WAF rate-limiting rule

On the Free plan, a rate-limiting rule counts requests per 10 seconds only,
and you get one rule. That cannot express "5 per hour". The KV counter can, and
it also covers the `*.pages.dev` hostname. You can still add a WAF rule on
`/api/report` as an extra layer.
