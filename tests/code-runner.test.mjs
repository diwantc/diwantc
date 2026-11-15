// Tests for the in-page code runner: the sandbox page builder, the frame and
// worker logic (run in node:vm, see helpers/runner-harness.mjs), the MDX code
// helpers, and the runner's French interface text.
// Node 22.18+ loads the .ts helpers directly (type stripping).
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { buildSandboxPage, buildSandboxScript, sandboxCsp } from '../src/components/runner/js/sandbox-page.ts';
import { editorRows, errorText, normalizeCode, textDirection } from '../src/components/runner/code.ts';
import { createSandbox, frameSource, workerSource } from './helpers/runner-harness.mjs';

describe('sandbox page', () => {
  const html = buildSandboxPage(frameSource, workerSource);
  const script = /<script>([\s\S]*)<\/script>/.exec(html)[1];
  const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)[1];

  test('CSP blocks all network access and allows only blob: workers', () => {
    assert.match(csp, /(^|; )default-src 'none'(;|$)/);
    assert.match(csp, /(^|; )worker-src blob:(;|$)/);
    assert.doesNotMatch(csp, /connect-src|unsafe-inline|unsafe-eval|https?:|\*/);
  });

  test('script-src allows exactly the inline script, by hash', () => {
    const hash = createHash('sha256').update(script, 'utf8').digest('base64');
    assert.ok(csp.includes(`script-src 'sha256-${hash}'`), csp);
    assert.equal(sandboxCsp(script), csp);
  });

  test('CSP comes before the only script, and there is exactly one script', () => {
    assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script>'));
    assert.equal(html.match(/<script/g).length, 1);
  });

  test('the embedded worker source cannot close the script element', () => {
    assert.equal(script.match(/<\/script/gi), null);
    assert.equal(script.includes('__WORKER_PRELUDE__'), false);
  });

  test('builder refuses a frame without exactly one placeholder', () => {
    assert.throws(() => buildSandboxScript('var x = 1;', workerSource), /exactly once/);
    assert.throws(() => buildSandboxScript('__WORKER_PRELUDE__ __WORKER_PRELUDE__', workerSource), /exactly once/);
  });
});

describe('sandbox frame and worker', async () => {
  const sandbox = await createSandbox();
  after(() => sandbox.close());

  const lineText = (line) => line.parts.map((part) => part.text).join(' ');
  const texts = (result) => result.lines.map(lineText);

  test('starts only after a Worker probe succeeds', () => {
    assert.equal(sandbox.handshake, 'ready');
  });

  test('stops listening for window messages after the first init', () => {
    // The frame stops listening after the first valid init.
    assert.equal(sandbox.windowListeners.length, 0);
  });

  test('prints console output, Arabic text unchanged', async () => {
    const result = await sandbox.run('console.log("مرحباً يا سارة!");\nconsole.log("العدد:", 5);');
    assert.equal(result.reason, 'done');
    assert.deepEqual(texts(result), ['مرحباً يا سارة!', 'العدد: 5']);
  });

  test('formats values like a browser console', async () => {
    const result = await sandbox.run(`
      console.log(1, -0, 10n, true, null, undefined, NaN);
      console.log([1, "two", [3, [4]]], { a: 1, "b-c": "x", nested: { deep: { deeper: 1 } } });
      console.log(new Map([["k", 1]]), new Set([1, 2]), new Map(), []);
      console.log(function named() {}, () => {}, class Point {});
      const loop = { name: "loop" }; loop.self = loop;
      console.log(loop);
      console.log(new TypeError("bad"), Symbol("s"));
      class Box { constructor() { this.v = 1; } }
      console.log(new Box(), {});
    `);
    assert.deepEqual(texts(result), [
      '1 -0 10n true null undefined NaN',
      '[1, "two", [3, [Array(1)]]] { a: 1, "b-c": "x", nested: { deep: [Object] } }',
      'Map(1) { "k" => 1 } Set(2) { 1, 2 } Map(0) {} []',
      '[Function: named] [Function: (anonymous)] [class Point]',
      '{ name: "loop", self: [Circular] }',
      'TypeError: bad Symbol(s)',
      'Box { v: 1 } {}',
    ]);
  });

  test('each argument is its own part: strings as written, other values as code', async () => {
    const result = await sandbox.run('console.log("العدد:", 5, [1], "a b");\nconsole.log();');
    assert.deepEqual(result.lines[0].parts, [
      { kind: 's', text: 'العدد:' },
      { kind: 'v', text: '5' },
      { kind: 'v', text: '[1]' },
      { kind: 's', text: 'a b' },
    ]);
    assert.deepEqual(result.lines[1].parts, [], 'console.log() prints an empty line');
  });

  test('Arabic strings inside values are isolated so lists keep their order', async () => {
    const result = await sandbox.run('console.log(["أحمد", "Sara"], { "الاسم": "سارة" });');
    assert.equal(
      texts(result)[0],
      '[\u2068"أحمد"\u2069, "Sara"] { \u2068"الاسم"\u2069: \u2068"سارة"\u2069 }',
    );
  });

  test('long arrays are cut after 100 items', async () => {
    const result = await sandbox.run('console.log(Array.from({ length: 150 }, (_, i) => i));');
    assert.match(texts(result)[0], /, 99, … 50 more\]$/);
  });

  test('console.warn and console.error keep their level', async () => {
    const result = await sandbox.run('console.warn("w"); console.error("e"); console.info("i");');
    assert.deepEqual(
      result.lines.map((l) => `${l.level}:${lineText(l)}`),
      ['warn:w', 'error:e', 'log:i'],
    );
  });

  test('a runtime error reports its type, message and the learner line', async () => {
    const result = await sandbox.run('let message = "hi";\nconsole.log(message);\nconsole.log(mesage);\nconsole.log("never");');
    assert.equal(result.reason, 'done');
    assert.deepEqual(texts(result), ['hi']);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].name, 'ReferenceError');
    assert.match(result.errors[0].message, /mesage is not defined/);
    assert.equal(result.errors[0].line, 3);
  });

  test('a syntax error reports SyntaxError and its line', async () => {
    const result = await sandbox.run('console.log("ok");\nconsole.log("oops);');
    assert.equal(result.reason, 'done');
    assert.equal(result.lines.length, 0, 'nothing runs when the code cannot be parsed');
    assert.equal(result.errors[0].name, 'SyntaxError');
    assert.equal(result.errors[0].line, 2);
  });

  test('throwing a non-error value is reported without a type', async () => {
    const result = await sandbox.run('throw "stop here";');
    assert.equal(result.errors[0].name, '');
    assert.equal(result.errors[0].message, '"stop here"');
    assert.equal(errorText(result.errors[0].name, result.errors[0].message), 'Uncaught "stop here"');
  });

  test('waits for timers, then finishes', async () => {
    const result = await sandbox.run('setTimeout(() => console.log("later"), 50);\nconsole.log("now");');
    assert.equal(result.reason, 'done');
    assert.deepEqual(texts(result), ['now', 'later']);
  });

  test('a cleared timer does not keep the program running', async () => {
    const result = await sandbox.run('const id = setTimeout(() => console.log("no"), 5000);\nclearTimeout(id);');
    assert.equal(result.reason, 'done');
    assert.deepEqual(texts(result), []);
  });

  test('an error inside a timer is reported with its line', async () => {
    const result = await sandbox.run('setTimeout(() => {\n  null.x;\n}, 10);');
    assert.equal(result.errors[0].name, 'TypeError');
    assert.equal(result.errors[0].line, 2);
  });

  test('promise callbacks run before the program counts as finished', async () => {
    const result = await sandbox.run('Promise.resolve(2).then((n) => console.log("then", n));');
    assert.deepEqual(texts(result), ['then 2']);
  });

  test('a program that never finishes is stopped at the time limit', async () => {
    const result = await sandbox.run('setInterval(() => {}, 10);', { timeoutMs: 200 });
    assert.equal(result.reason, 'timeout');
  });

  test('stop ends the run at once', async () => {
    const id = 1000;
    sandbox.send({ type: 'run', id, code: 'setInterval(() => console.log("tick"), 20);', timeoutMs: 5000, maxLines: 500, maxLineLength: 2000 });
    await sandbox.waitFor((m) => m.type === 'line' && m.id === id);
    sandbox.send({ type: 'stop', id });
    const end = await sandbox.waitFor((m) => m.type === 'end' && m.id === id);
    assert.equal(end.reason, 'stopped');
  });

  test('too much output stops the program at the line limit', async () => {
    const result = await sandbox.run('for (let i = 0; i < 100; i++) console.log(i);', { maxLines: 10 });
    assert.equal(result.reason, 'limit');
    assert.equal(result.lines.length, 10);
  });

  test('very long lines are cut, across all their parts', async () => {
    const one = await sandbox.run('console.log("x".repeat(500));', { maxLineLength: 100 });
    assert.equal(texts(one)[0].length, 101);
    assert.ok(texts(one)[0].endsWith('…'));
    const many = await sandbox.run('console.log("a".repeat(60), "b".repeat(60), "c");', { maxLineLength: 100 });
    assert.deepEqual(many.lines[0].parts.map((p) => p.text.length), [60, 41]);
  });

  test('messages forged by learner code are cleaned before they reach the page', async () => {
    const result = await sandbox.run(`
      postMessage({ t: "line", level: "<img src=x>", text: 42 });
      postMessage({ t: "error", name: "<script>", message: "m", line: 1.5 });
      postMessage({ t: "unknown" });
      postMessage({ t: "line", parts: [{ kind: "x", text: { a: 1 } }, null] });
    `);
    assert.deepEqual(result.lines.map((l) => [l.level, lineText(l)]), [['log', '42'], ['log', '[object Object] ']]);
    assert.deepEqual(result.lines[1].parts.map((p) => p.kind), ['s', 's']);
    assert.deepEqual(
      result.errors.map((e) => [e.name, e.message, e.line]),
      [['', 'm', null]],
    );
    for (const message of sandbox.received) {
      assert.ok(['ready', 'line', 'error', 'end'].includes(message.type), JSON.stringify(message));
    }
  });

  test('a new run stops the previous one and starts a clean Worker', async () => {
    const before = sandbox.workers.length;
    const first = sandbox.run('let shared = 1; setInterval(() => {}, 10);', { timeoutMs: 5000 });
    const second = await sandbox.run('console.log(typeof shared);');
    assert.equal((await first).reason, 'stopped');
    assert.deepEqual(texts(second), ['undefined']);
    assert.ok(sandbox.workers.length >= before + 2);
    assert.ok(sandbox.workers.slice(before, -1).every((w) => w.dead), 'old workers are terminated');
  });

  test('blob URLs are released after each run', () => {
    assert.equal(sandbox.blobs.size, 0);
  });
});

describe('sandbox frame refuses to run outside a sandbox', () => {
  test('does nothing when its origin is not opaque', async () => {
    const vm = await import('node:vm');
    const listeners = [];
    const context = { origin: 'https://diwantc.com', parent: {}, addEventListener: (_t, fn) => listeners.push(fn) };
    context.window = context;
    context.self = context;
    vm.createContext(context);
    vm.runInContext(buildSandboxScript(frameSource, workerSource), context);
    assert.equal(listeners.length, 0);
  });

  test('does nothing when it is not inside a frame', async () => {
    const vm = await import('node:vm');
    const listeners = [];
    const context = { origin: 'null', addEventListener: (_t, fn) => listeners.push(fn) };
    context.window = context;
    context.self = context;
    context.parent = context;
    vm.createContext(context);
    vm.runInContext(buildSandboxScript(frameSource, workerSource), context);
    assert.equal(listeners.length, 0);
  });
});

describe('MDX code helpers', () => {
  test('normalizeCode removes the template literal padding and common indent', () => {
    const raw = '\n    let x = 1;\n    if (x) {\n      console.log(x);   \n    }\n  ';
    assert.equal(normalizeCode(raw), 'let x = 1;\nif (x) {\n  console.log(x);\n}');
  });

  test('normalizeCode keeps blank lines inside the code and handles CRLF', () => {
    assert.equal(normalizeCode('\r\n  a();\r\n\r\n  b();\r\n'), 'a();\n\nb();');
  });

  test('editorRows stays between 3 and 24', () => {
    assert.equal(editorRows('one'), 3);
    assert.equal(editorRows('1\n2\n3\n4\n5'), 5);
    assert.equal(editorRows(Array(40).fill('x').join('\n')), 24);
  });

  test('textDirection follows the first letter, skipping isolated text', () => {
    assert.equal(textDirection('مرحباً يا سارة!'), 'rtl');
    assert.equal(textDirection('5 تفاحات'), 'rtl');
    assert.equal(textDirection('Hello مرحباً'), 'ltr');
    assert.equal(textDirection('[\u2068"أحمد"\u2069, 1]'), 'ltr');
    assert.equal(textDirection('123 [1, 2]'), 'ltr');
    assert.equal(textDirection(''), 'ltr');
  });

  test('errorText prints like a console', () => {
    assert.equal(errorText('ReferenceError', 'x is not defined'), 'ReferenceError: x is not defined');
    assert.equal(errorText('Error', ''), 'Error');
  });
});

describe('runner interface text', () => {
  const source = readFileSync(new URL('../src/i18n/ui.ts', import.meta.url), 'utf8');
  const block = (name) => source.slice(source.indexOf(`const ${name}`), source.indexOf('};', source.indexOf(`const ${name}`)));
  const entries = (name) =>
    [...block(name).matchAll(/'([\w.]+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g)].map((m) => [m[1], m[2] ?? m[3]]);

  test('every runner key exists in all three languages', () => {
    const keys = (name) => entries(name).map(([key]) => key).filter((key) => key.startsWith('runner.')).sort();
    assert.ok(keys('ar').length > 20);
    assert.deepEqual(keys('en'), keys('ar'));
    assert.deepEqual(keys('fr'), keys('ar'));
  });

  test('French uses U+00A0 before ":" and inside « », U+202F before ? ! ;', () => {
    for (const [key, value] of entries('fr')) {
      assert.doesNotMatch(value, / [:?!;»]/, `${key}: plain space before punctuation`);
      assert.doesNotMatch(value, /« /, `${key}: plain space after «`);
      assert.doesNotMatch(value, / :| [?!;]/, `${key}: wrong kind of no-break space`);
      assert.doesNotMatch(value, /[^\s  ]:(?!\/\/)(?=\s|$)/, `${key}: no space before ":"`);
    }
  });
});
