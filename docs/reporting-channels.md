# Reporting channels (`safety-l0-07`)

Official places to report a scam, per country. Lesson `safety-l0-07`
("What to do if you are scammed") shows them with `<ReportingChannels />`,
which every lesson can use without an import. Without JavaScript all
countries are listed; with JavaScript a country picker shows one at a time.

## Files

One YAML file per country: `src/data/reporting-channels/<cc>.yaml`, where
`<cc>` is the ISO 3166-1 two-letter code in lower case (`sa.yaml`). The
schema is in `src/content.config.ts`; `tests/reporting-channels.test.mjs`
adds the rules the schema cannot see.

```yaml
country: sa                  # same as the file name
order: 1                     # position in the picker (unique)
name: { ar: "السعودية", en: "Saudi Arabia", fr: "Arabie saoudite" }
channels:
  - id: cst-330330           # kebab-case, unique in the file
    type: sms                # sms | phone | website | app | email
    contact: "330330"        # digits, an https URL, an email address,
                             # or, for an app only, { ar, en, fr }
    name: { ar: "…", en: "…", fr: "…" }
    use:  { ar: "…", en: "…", fr: "…" }   # what to report here, one or two sentences
    source:
      title: "…"             # title of the official page
      publisher: { ar: "…", en: "…", fr: "…" }
      url: https://…         # the official page you opened; https only
      lang: ar
    lastVerified: 2026-11-07
```

Quote every text value (`"…"`): a colon followed by a space inside a value
breaks YAML otherwise.

## Rules

- **Official sources only.** The source must be a government, police or
  regulator page that you opened yourself and that states the channel and
  what it is for. News, social posts, blogs and AI answers do not count.
  A channel without such a source is not added.
- **Say only what the source says.** If a page lists a number but not what
  it is for, the channel is not added. Conditions the page states (hours,
  "complain to your bank first", citizens only) go in `use`.
- **Contacts do not change by language;** names and `use` are translated.
  French uses U+00A0 before `:` and U+202F before `? ! ;`.
- **Re-verify every 3 months.** `scripts/reverify.mjs` lists every channel
  whose `lastVerified` is older than 3 months; the weekly workflow opens an
  issue for each one. Re-open the source, then update the entry and the date.
- **Links are checked weekly** (`scripts/check-links.mjs`): every source URL
  and every website contact. These are warnings (open the page by hand):
  - a 403;
  - an incomplete TLS certificate chain;
  - a timeout on a Gulf government domain (`.gov.sa`, `.gov.ae`, `.gov.kw`,
    `.gov.qa`, `.gov.bh`, `.gov.om`). Several of these sites do not answer
    GitHub's servers abroad, though they open from the region.

  Anything else that fails is an error.

## Coverage

Order decided 2026-11-06: Saudi Arabia, then the other GCC countries, then
other Arab countries, then the main French- and English-speaking
countries. The first batch (2026-11-07) covers Saudi Arabia and the five
other GCC countries.
