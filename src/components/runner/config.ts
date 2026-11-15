// Shared settings for the in-page code runner (server render and browser).
// Decided with the maintainer on 2026-11-07: stop after 5 seconds, plain
// textarea editor, output = printed lines + errors with a short explanation.

/** Languages a lesson can run. Python (in-browser runtime) is planned for L1+. */
export const RUNNER_LANGUAGES = ['js'] as const;
export type RunnerLanguage = (typeof RUNNER_LANGUAGES)[number];

/** Display name of each language, shown in the editor label. Not translated. */
export const LANGUAGE_NAMES: Record<RunnerLanguage, string> = {
  js: 'JavaScript',
};

/**
 * Where each language's sandbox page is served (see src/pages/runner/).
 * The build writes runner/js-sandbox/index.html, which Cloudflare Pages
 * serves at the folder URL (it redirects ".../index.html" there). The dev
 * server only answers the file name, so dev uses that.
 */
const DEV = import.meta.env?.DEV === true;
export const SANDBOX_URLS: Record<RunnerLanguage, string> = {
  js: DEV ? '/runner/js-sandbox/index.html' : '/runner/js-sandbox/',
};

/** A run that has not finished after this long is stopped. */
export const RUN_TIMEOUT_MS = 5_000;

/** A program that prints more lines than this is stopped. */
export const MAX_OUTPUT_LINES = 500;

/** Longer output lines are cut, so one huge line cannot freeze the page. */
export const MAX_LINE_LENGTH = 2_000;

/** Longest program the sandbox accepts, in characters. */
export const MAX_CODE_LENGTH = 20_000;

/** Error types that have a plain-language explanation in src/i18n/ui.ts. */
export const EXPLAINED_ERRORS = ['SyntaxError', 'ReferenceError', 'TypeError', 'RangeError'] as const;
export type ExplainedError = (typeof EXPLAINED_ERRORS)[number];

export function isRunnerLanguage(value: string): value is RunnerLanguage {
  return (RUNNER_LANGUAGES as readonly string[]).includes(value);
}
