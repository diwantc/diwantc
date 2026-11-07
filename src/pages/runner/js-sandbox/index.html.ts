// The sandbox page that runs learners' JavaScript. Lesson pages fetch it and
// load it into <iframe sandbox="allow-scripts" srcdoc>
// (see src/components/runner/js/runtime.ts). Opened any other way, its script
// does nothing. Built to dist/runner/js-sandbox/index.html.
import type { APIRoute } from 'astro';
import frameSource from '../../../components/runner/js/frame.js?raw';
import workerSource from '../../../components/runner/js/worker.js?raw';
import { buildSandboxPage } from '../../../components/runner/js/sandbox-page';

export const GET: APIRoute = () =>
  new Response(buildSandboxPage(frameSource, workerSource), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
