// Runs the real sandbox code (frame.js + worker.js, built by sandbox-page.ts)
// in node:vm, with small fakes for the browser APIs it uses: Worker, Blob
// URLs, MessagePort and window messaging. This tests the runner's own logic.
// What only a browser can prove (iframe sandbox, CSP, Worker.terminate on a
// busy loop) is checked in the browser; see the PR description.
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { buildSandboxScript } from '../../src/components/runner/js/sandbox-page.ts';

const read = (file) => readFileSync(new URL(`../../src/components/runner/js/${file}`, import.meta.url), 'utf8');
export const frameSource = read('frame.js');
export const workerSource = read('worker.js');

/** A Worker that runs its blob script in its own vm context. */
function createFakeWorkerClass(blobs) {
  return class FakeWorker {
    constructor(url) {
      const blob = blobs.get(url);
      if (!blob) throw new Error(`unknown blob URL ${url}`);
      this.onmessage = null;
      this.onerror = null;
      this.dead = false;
      this.timers = new Set();
      const listeners = { error: [], unhandledrejection: [] };
      const worker = this;

      const dispatchError = (error) => {
        const event = { error, message: String(error), lineno: 0, preventDefault() {} };
        for (const listener of listeners.error) listener(event);
      };
      const wrapTimer = (native, clear) => (fn, ms, ...args) => {
        const id = native(() => {
          if (worker.dead) return;
          try {
            fn(...args);
          } catch (error) {
            dispatchError(error);
          }
        }, ms);
        worker.timers.add({ id, clear });
        return id;
      };

      const context = {
        location: { href: url },
        console: {},
        postMessage: (data) => {
          if (worker.dead) return;
          // Like structured clone: the frame gets a copy, never live objects.
          const copy = structuredClone(data);
          queueMicrotask(() => !worker.dead && worker.onmessage?.({ data: copy }));
        },
        addEventListener: (type, fn) => listeners[type]?.push(fn),
        setTimeout: wrapTimer(setTimeout, clearTimeout),
        setInterval: wrapTimer(setInterval, clearInterval),
        clearTimeout,
        clearInterval,
      };
      context.self = context;
      vm.createContext(context);
      this.context = context;
      this.listeners = listeners;

      blob.text().then((source) => {
        if (this.dead) return;
        let script;
        try {
          script = new vm.Script(source, { filename: url });
        } catch (error) {
          // Like a browser: a script that cannot be parsed fires "error" on the Worker.
          const lineno = Number(new RegExp(`${url}:(\\d+)`).exec(error.stack)?.[1] ?? 0);
          this.onerror?.({ message: `Uncaught SyntaxError: ${error.message}`, lineno, preventDefault() {} });
          return;
        }
        try {
          script.runInContext(context, { timeout: 2000 });
        } catch (error) {
          dispatchError(error);
        }
      });
    }

    terminate() {
      this.dead = true;
      for (const { id, clear } of this.timers) clear(id);
    }
  };
}

/**
 * Loads the sandbox frame and returns helpers to run code through it, the
 * same way the lesson page does (init with a port, then run/stop messages).
 */
export async function createSandbox() {
  const blobs = new Map();
  let nextBlob = 1;
  const workers = [];
  const FakeWorker = createFakeWorkerClass(blobs);
  const windowListeners = [];
  const parentWindow = {};
  const received = [];
  const waiters = [];

  const port = {
    onmessage: null,
    postMessage(message) {
      // Like a real MessagePort: the page gets a structured clone in its own realm.
      received.push(structuredClone(message));
      for (const waiter of [...waiters]) waiter();
    },
  };

  const context = {
    origin: 'null',
    parent: parentWindow,
    Blob,
    URL: {
      createObjectURL(blob) {
        const url = `blob:null/${nextBlob++}`;
        blobs.set(url, blob);
        return url;
      },
      revokeObjectURL(url) {
        blobs.delete(url);
      },
    },
    Worker: class extends FakeWorker {
      constructor(url) {
        super(url);
        workers.push(this);
      }
    },
    addEventListener: (type, fn) => type === 'message' && windowListeners.push(fn),
    removeEventListener: (type, fn) => {
      const i = windowListeners.indexOf(fn);
      if (i !== -1) windowListeners.splice(i, 1);
    },
    setTimeout,
    clearTimeout,
  };
  context.window = context;
  context.self = context;
  vm.createContext(context);
  vm.runInContext(buildSandboxScript(frameSource, workerSource), context);

  function waitFor(predicate, ms = 3000) {
    return new Promise((resolve, reject) => {
      const check = () => {
        const found = received.find(predicate);
        if (found) {
          waiters.splice(waiters.indexOf(check), 1);
          clearTimeout(timer);
          resolve(found);
        }
      };
      const timer = setTimeout(() => {
        waiters.splice(waiters.indexOf(check), 1);
        reject(new Error(`timed out waiting; received ${JSON.stringify(received)}`));
      }, ms);
      waiters.push(check);
      check();
    });
  }

  const send = (data) => port.onmessage?.({ data });
  for (const listener of [...windowListeners]) listener({ source: parentWindow, data: { type: 'init' }, ports: [port] });
  const handshake = await waitFor((m) => m.type === 'ready' || m.type === 'unsupported');

  let nextRun = 1;
  /** Runs code; resolves with the run's lines, errors and end reason. */
  async function run(code, limits = {}) {
    const id = nextRun++;
    send({ type: 'run', id, code, timeoutMs: 1000, maxLines: 500, maxLineLength: 2000, ...limits });
    const end = await waitFor((m) => m.type === 'end' && m.id === id, (limits.timeoutMs ?? 1000) + 3000);
    const mine = received.filter((m) => m.id === id);
    return {
      id,
      reason: end.reason,
      lines: mine.filter((m) => m.type === 'line'),
      errors: mine.filter((m) => m.type === 'error'),
    };
  }

  return {
    handshake: handshake.type,
    run,
    send,
    received,
    waitFor,
    workers,
    windowListeners,
    parentWindow,
    port,
    blobs,
    /** Kill all fake workers so the test process can exit. */
    close() {
      for (const worker of workers) worker.terminate();
    },
  };
}
