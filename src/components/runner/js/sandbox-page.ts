// Builds the HTML of the JavaScript sandbox page (served at /runner/js-sandbox/).
// Used at build time by src/pages/runner/js-sandbox/index.html.ts and by the tests.
import { createHash } from 'node:crypto';

const PLACEHOLDER = '__WORKER_PRELUDE__';

/** A JS string literal that is safe inside an inline <script>. */
function scriptStringLiteral(source: string): string {
  return JSON.stringify(source)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** The inline script: frame.js with worker.js embedded as a string. */
export function buildSandboxScript(frameSource: string, workerSource: string): string {
  const frame = frameSource.trim();
  if (frame.split(PLACEHOLDER).length !== 2) throw new Error(`frame.js must contain ${PLACEHOLDER} exactly once`);
  // A function replacer, so "$" sequences in the source are kept as written.
  return frame.replace(PLACEHOLDER, () => scriptStringLiteral(workerSource.trim()));
}

/**
 * Content Security Policy of the sandbox page.
 * - default-src 'none': no fetch, XHR, WebSocket, EventSource, images, fonts…
 *   (connect-src and the other fetch directives fall back to default-src).
 * - script-src: only this exact inline script, by hash. No eval.
 * - worker-src blob: the Worker that runs the learner's code. child-src is the
 *   older fallback some browsers use for workers.
 * A Worker made from a blob: URL inherits this policy (HTML standard, policy
 * containers), so the learner's code is under it too.
 */
export function sandboxCsp(script: string): string {
  const hash = createHash('sha256').update(script, 'utf8').digest('base64');
  return [
    "default-src 'none'",
    `script-src 'sha256-${hash}'`,
    'worker-src blob:',
    'child-src blob:',
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

export function buildSandboxPage(frameSource: string, workerSource: string): string {
  const script = buildSandboxScript(frameSource, workerSource);
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${sandboxCsp(script)}">`,
    '<meta name="robots" content="noindex">',
    '<title>DiwanTC code sandbox</title>',
    '</head>',
    '<body>',
    `<script>${script}</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
