// Browser side of <CodeRunner>: wires the editor, buttons, status line and
// output of every runner on the page. Loaded only on pages that render one.
import { EXPLAINED_ERRORS, isRunnerLanguage, type ExplainedError, type RunnerLanguage } from './config';
import { errorText, textDirection } from './code';
import { createJsRuntime } from './js/runtime';
import type { EndReason, OutputLevel, OutputPart, RunError, RunLimits, Runtime, RuntimeFactory } from './types';

/** Interface text, already translated by the component (see CodeRunner.astro). */
export interface RunnerStrings {
  running: string;
  done: string;
  empty: string;
  error: string;
  /** Contains {line}. */
  errorLine: string;
  timeout: string;
  stopped: string;
  limit: string;
  unsupported: string;
  unavailable: string;
  reset: string;
  tooLong: string;
  levelWarn: string;
  levelError: string;
  explain: Record<ExplainedError | 'other', string>;
}

export interface RunnerConfig {
  sandboxUrl: string;
  maxCodeLength: number;
  limits: RunLimits;
}

/**
 * One loader per language. JavaScript ships with this file; a Python
 * runtime would be a dynamic import() here, so its large in-browser
 * interpreter downloads only on Python lessons.
 */
const RUNTIMES: Record<RunnerLanguage, () => Promise<RuntimeFactory>> = {
  js: async () => createJsRuntime,
};

const ICONS: Partial<Record<OutputLevel, string>> = { warn: '⚠', error: '✖' };

function explanation(strings: RunnerStrings, name: string): string {
  return (EXPLAINED_ERRORS as readonly string[]).includes(name)
    ? strings.explain[name as ExplainedError]
    : strings.explain.other;
}

/** A required part of the runner markup (see CodeRunner.astro). */
function part<T extends HTMLElement>(root: HTMLElement, name: string): T {
  const element = root.querySelector<T>(`[data-runner-${name}]`);
  if (!element) throw new Error(`CodeRunner: missing [data-runner-${name}]`);
  return element;
}

function setup(root: HTMLElement): void {
  if (root.dataset.runnerReady === 'true') return;
  const languageAttr = root.dataset.language ?? '';
  if (!isRunnerLanguage(languageAttr)) return;
  const language: RunnerLanguage = languageAttr;
  const editor = part<HTMLTextAreaElement>(root, 'code');
  const runButton = part<HTMLButtonElement>(root, 'run');
  const stopButton = part<HTMLButtonElement>(root, 'stop');
  const resetButton = part<HTMLButtonElement>(root, 'reset');
  const status = part<HTMLElement>(root, 'status');
  const output = part<HTMLElement>(root, 'output');

  const strings = JSON.parse(root.dataset.strings ?? '{}') as RunnerStrings;
  const config = JSON.parse(root.dataset.config ?? '{}') as RunnerConfig;
  let runtime: Runtime | null = null;
  let running = false;

  root.dataset.runnerReady = 'true';
  root.querySelectorAll<HTMLElement>('[data-runner-js]').forEach((el) => (el.hidden = false));
  // The hint mentions the Run button, so it describes the editor only once JS runs.
  if (editor.dataset.runnerHint) editor.setAttribute('aria-describedby', editor.dataset.runnerHint);

  // Grow the editor with its content (wrapped lines included); CSS caps the height.
  function grow(): void {
    editor.style.blockSize = 'auto';
    const borders = editor.offsetHeight - editor.clientHeight;
    editor.style.blockSize = `${editor.scrollHeight + borders}px`;
  }
  editor.addEventListener('input', grow);
  grow();

  function say(text: string): void {
    status.textContent = text;
  }

  /**
   * One output line. The panel is left-to-right, but each line is laid out
   * in the direction of its first letter, and each console.log argument is
   * isolated in its own <bdi>: Arabic text keeps its punctuation in place,
   * and arrays or objects next to it stay in code order. Only textContent
   * is used, so output can never become HTML on this page.
   */
  function appendLine(level: OutputLevel, parts: OutputPart[]): void {
    const row = document.createElement('div');
    row.className = 'runner-line';
    row.dataset.level = level;
    const icon = ICONS[level];
    if (icon) {
      const mark = document.createElement('span');
      mark.className = 'runner-icon';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = icon;
      const label = document.createElement('span');
      label.className = 'sr-only';
      label.textContent = level === 'warn' ? strings.levelWarn : strings.levelError;
      row.append(mark, label);
    }
    const line = document.createElement('bdi');
    line.dir = textDirection(parts.map((part) => part.text).join(' '));
    parts.forEach((part, index) => {
      if (index > 0) line.append(' ');
      const piece = document.createElement('bdi');
      piece.dir = part.kind === 'value' ? 'ltr' : 'auto';
      piece.textContent = part.text;
      line.append(piece);
    });
    row.append(line);
    output.append(row);
    output.scrollTop = output.scrollHeight;
  }

  function setRunning(value: boolean): void {
    running = value;
    root.toggleAttribute('data-running', value);
    stopButton.disabled = !value;
    if (!value && document.activeElement === stopButton) runButton.focus();
  }

  function summary(reason: EndReason, printed: number, error: RunError | null): string {
    if (reason === 'done') {
      if (error) {
        const where = error.line ? strings.errorLine.replace('{line}', String(error.line)) : strings.error;
        return `${where} ${explanation(strings, error.name)}`;
      }
      return printed > 0 ? strings.done : strings.empty;
    }
    return strings[reason];
  }

  // Each run gets a token; only the latest run may update the status line.
  let latestRun = 0;

  async function run(): Promise<void> {
    const code = editor.value;
    if (code.length > config.maxCodeLength) {
      say(strings.tooLong);
      return;
    }
    const token = ++latestRun;
    output.replaceChildren();
    say(strings.running);
    setRunning(true);

    let printed = 0;
    let firstError: RunError | null = null;
    const active = (runtime ??= (await RUNTIMES[language]())({
      container: root,
      sandboxUrl: config.sandboxUrl,
      limits: config.limits,
    }));
    const reason = await active.run(code, {
      onLine(line) {
        printed++;
        appendLine(line.level, line.parts);
      },
      onError(error) {
        firstError ??= error;
        appendLine('error', [{ kind: 'string', text: errorText(error.name, error.message) }]);
      },
    });
    if (token !== latestRun) return; // stopped by Reset, or a newer run took over
    setRunning(false);
    say(summary(reason, printed, firstError));
  }

  runButton.addEventListener('click', () => void run());
  stopButton.addEventListener('click', () => runtime?.stop());
  resetButton.addEventListener('click', () => {
    if (running) {
      latestRun++;
      runtime?.stop();
      setRunning(false);
    }
    editor.value = editor.defaultValue;
    grow();
    say(strings.reset);
  });
  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void run();
    }
  });
}

export function initRunners(): void {
  document.querySelectorAll<HTMLElement>('[data-code-runner]').forEach((root) => {
    try {
      setup(root);
    } catch (error) {
      // One broken runner must not stop the others; the code stays readable.
      console.error(error);
    }
  });
}
