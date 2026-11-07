// JavaScript runtime, lesson-page side. On the first run it fetches the
// sandbox page (same origin, cached) and loads it into a sandboxed iframe
// through srcdoc, talks to it over a private MessageChannel, and enforces the
// time limit, removing the sandbox if it ever stops answering.
//
// Security model (sources in the PR description):
// - <iframe sandbox="allow-scripts"> without allow-same-origin: the sandbox
//   gets an opaque origin, so it fails the same-origin policy with this page
//   (no DOM, cookies or storage of the lesson page).
// - The sandbox page's CSP is default-src 'none' (no network); the Worker
//   that runs learner code is made from a blob: URL and inherits that CSP.
//   A srcdoc document also inherits this page's policies, so a CSP added to
//   the site later must allow the sandbox script's hash and blob: workers.
// - Worker.terminate() stops a run at once, even an endless loop. The time
//   limit runs on this page; the sandbox keeps its own as a backup.
// - This page adds no window "message" listener. After one init message
//   that hands over a MessagePort, all traffic goes through that port.
// - Output is only ever written with textContent (see client.ts).
//
// Why srcdoc and not src: there is no separate URL to frame or open, and the
// sandbox document is exactly the HTML this page fetched.
import type { EndReason, OutputLevel, OutputPart, RunHandlers, Runtime, RuntimeFactory } from '../types';

/** How long the sandbox page may take to download and answer, on a slow network. */
const LOAD_TIMEOUT_MS = 15_000;
/** How long the sandbox has to confirm a stop before the page removes it. */
const STOP_CONFIRM_MS = 1_000;

type LoadState = 'ready' | 'unsupported' | 'unavailable';

const LEVELS: readonly OutputLevel[] = ['log', 'warn', 'error'];
const END_REASONS: readonly EndReason[] = ['done', 'timeout', 'stopped', 'limit'];

interface CurrentRun {
  id: number;
  handlers: RunHandlers;
  resolve: (reason: EndReason) => void;
  /** The time limit. Kept on this page: browsers may slow down timers in a hidden frame. */
  timer: number;
}

export const createJsRuntime: RuntimeFactory = ({ container, sandboxUrl, limits }) => {
  let frame: HTMLIFrameElement | null = null;
  let port: MessagePort | null = null;
  let loading: Promise<LoadState> | null = null;
  let nextId = 1;
  let wanted = 0; // id of the run the learner asked for last; 0 after Stop
  let current: CurrentRun | null = null;
  let unconfirmed = 0; // id of a stopped run the sandbox has not confirmed yet
  let confirmTimer = 0;

  function teardown(): void {
    port?.close();
    port = null;
    frame?.remove();
    frame = null;
    loading = null;
  }

  function finish(reason: EndReason): void {
    const run = current;
    if (!run) return;
    current = null;
    window.clearTimeout(run.timer);
    run.resolve(reason);
  }

  /** Ends the current run now and tells the sandbox to terminate its Worker. */
  function halt(reason: 'timeout' | 'stopped'): void {
    const run = current;
    if (!run) return;
    port?.postMessage({ type: 'stop', id: run.id });
    // A sandbox that does not confirm is removed, and its Worker with it.
    // The next run then loads a fresh sandbox.
    window.clearTimeout(confirmTimer);
    unconfirmed = run.id;
    confirmTimer = window.setTimeout(() => {
      if (unconfirmed === run.id) teardown();
    }, STOP_CONFIRM_MS);
    finish(reason);
  }

  function onRunMessage(data: Record<string, unknown>): void {
    if (data.type === 'end' && data.id === unconfirmed) {
      window.clearTimeout(confirmTimer);
      unconfirmed = 0;
    }
    const run = current;
    if (!run || data.id !== run.id) return;
    if (data.type === 'line') {
      const level = LEVELS.includes(data.level as OutputLevel) ? (data.level as OutputLevel) : 'log';
      const parts: OutputPart[] = (Array.isArray(data.parts) ? data.parts : []).map((part: unknown) => {
        const { kind, text } = (part ?? {}) as { kind?: unknown; text?: unknown };
        return { kind: kind === 'v' ? 'value' : 'string', text: String(text ?? '') };
      });
      run.handlers.onLine({ level, parts });
    } else if (data.type === 'error') {
      run.handlers.onError({
        name: typeof data.name === 'string' ? data.name : '',
        message: String(data.message ?? ''),
        line: typeof data.line === 'number' ? data.line : null,
      });
    } else if (data.type === 'end') {
      finish(END_REASONS.includes(data.reason as EndReason) ? (data.reason as EndReason) : 'done');
    }
  }

  function load(): Promise<LoadState> {
    if (loading) return loading;
    loading = new Promise<LoadState>((resolve) => {
      let settled = false;
      const timer = window.setTimeout(() => settle('unavailable'), LOAD_TIMEOUT_MS);
      function settle(state: LoadState): void {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        // Let the next Run try again after a failed load.
        if (state === 'unavailable') teardown();
        resolve(state);
      }

      fetch(sandboxUrl, { credentials: 'omit' })
        .then((response) => {
          if (!response.ok) throw new Error(`sandbox page: HTTP ${response.status}`);
          return response.text();
        })
        .then((html) => {
          if (settled) return;
          const channel = new MessageChannel();
          const iframe = document.createElement('iframe');
          iframe.setAttribute('sandbox', 'allow-scripts');
          iframe.tabIndex = -1;
          iframe.setAttribute('aria-hidden', 'true');
          // Invisible but rendered, pinned to the top corner of the viewport.
          // In Chromium, timers in a display:none cross-origin frame (and its
          // Worker) did not fire at all, and slowed to about one per second
          // when the frame was out of view or on the viewport's bottom edge
          // (measured 2026-11-07). So `hidden` would break setTimeout.
          iframe.style.cssText =
            'position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:1px;block-size:1px;' +
            'border:0;opacity:0;pointer-events:none;';

          channel.port1.onmessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data || typeof data !== 'object') return;
            if (data.type === 'ready' || data.type === 'unsupported') {
              if (!settled) settle(data.type);
              else if (data.type === 'unsupported') finish('unsupported');
              return;
            }
            onRunMessage(data);
          };

          iframe.addEventListener(
            'load',
            () => {
              // The sandbox has an opaque origin, which no targetOrigin string
              // can name, so "*" is required here. Only the port is sent;
              // replies come back on the port, never through a window
              // "message" listener.
              iframe.contentWindow?.postMessage({ type: 'init' }, '*', [channel.port2]);
            },
            { once: true },
          );

          port = channel.port1;
          frame = iframe;
          iframe.srcdoc = html;
          container.append(iframe);
        })
        .catch(() => settle('unavailable'));
    });
    return loading;
  }

  const runtime: Runtime = {
    async run(code: string, handlers: RunHandlers): Promise<EndReason> {
      runtime.stop();
      const id = nextId++;
      wanted = id;
      const state = await load();
      if (state !== 'ready') return state;
      if (wanted !== id || !port) return 'stopped';
      const activePort = port;
      return new Promise<EndReason>((resolve) => {
        const timer = window.setTimeout(() => halt('timeout'), limits.timeoutMs);
        current = { id, handlers, resolve, timer };
        activePort.postMessage({ type: 'run', id, code, ...limits });
      });
    },

    stop(): void {
      wanted = 0;
      halt('stopped');
    },
  };

  return runtime;
};
