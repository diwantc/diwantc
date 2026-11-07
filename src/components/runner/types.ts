// The contract between the runner UI (client.ts) and a language runtime.
// JavaScript is the only runtime today. A Python runtime (L1+) would
// implement the same interface and be loaded only on Python lessons.

export type OutputLevel = 'log' | 'warn' | 'error';

/**
 * One argument of console.log. A string is shown as written; any other
 * value (number, array, object…) is shown as code, always left-to-right.
 */
export interface OutputPart {
  kind: 'string' | 'value';
  text: string;
}

export interface OutputLine {
  level: OutputLevel;
  parts: OutputPart[];
}

export interface RunError {
  /** Error type, e.g. "ReferenceError". Empty when the program threw a non-error value. */
  name: string;
  message: string;
  /** Line in the learner's code, when the browser reports one. */
  line: number | null;
}

/**
 * Why a run ended.
 * - done: the program finished (it may still have reported errors)
 * - timeout: it was still running after the time limit
 * - stopped: the learner pressed Stop
 * - limit: it printed more lines than allowed
 * - unsupported: this browser cannot run code safely in the sandbox
 * - unavailable: the sandbox did not load (offline, blocked…)
 */
export type EndReason = 'done' | 'timeout' | 'stopped' | 'limit' | 'unsupported' | 'unavailable';

export interface RunHandlers {
  onLine(line: OutputLine): void;
  onError(error: RunError): void;
}

export interface RunLimits {
  timeoutMs: number;
  maxLines: number;
  maxLineLength: number;
}

export interface Runtime {
  /** Runs code; resolves when the run ends. Starting a new run stops the previous one. */
  run(code: string, handlers: RunHandlers): Promise<EndReason>;
  /** Stops the current run, if any. Its run() promise resolves with "stopped". */
  stop(): void;
}

export type RuntimeFactory = (options: { container: HTMLElement; sandboxUrl: string; limits: RunLimits }) => Runtime;
