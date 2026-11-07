// Runs inside the sandbox page (/runner/js-sandbox/), which the lesson page
// loads in <iframe sandbox="allow-scripts" srcdoc>: an opaque origin with no access
// to the lesson page, its cookies or storage. The page's CSP blocks all
// network access, and the Worker inherits that CSP (it is made from a blob:
// URL). Learner code runs only in the Worker, never in this document.
//
// Protocol (all over a private MessagePort from the lesson page):
//   page → frame  {type:'run', id, code, timeoutMs, maxLines, maxLineLength} | {type:'stop', id}
//   frame → page  {type:'ready'} | {type:'unsupported'}
//                 {type:'line', id, level, parts:[{kind:'s'|'v', text}]}
//                 {type:'error', id, name, message, line}
//                 {type:'end', id, reason: 'done'|'timeout'|'stopped'|'limit'}
//
// The PRELUDE placeholder below is replaced at build time with the source of
// worker.js (see sandbox-page.ts).
(function () {
  'use strict';

  // Refuse to run unless sandboxed (opaque origin, serialized as "null") and framed.
  if (self.origin !== 'null' || window.parent === window) return;

  var PRELUDE = __WORKER_PRELUDE__;
  // The learner's line 1 comes after the prelude call (see buildWorkerSource).
  var LINE_OFFSET = PRELUDE.split('\n').length;
  // Hard ceilings, whatever the page asks for. The page sets the real limits.
  var CEILING = { code: 100000, lines: 5000, lineLength: 20000, timeoutMs: 60000 };
  var LEVELS = { log: true, warn: true, error: true };
  var MAX_PARTS = 100;

  var port = null;
  var current = null; // { id, worker, url, timer, lines, maxLines, maxLineLength }

  function buildWorkerSource(code, maxLines, maxLineLength) {
    var config = { lineOffset: LINE_OFFSET, maxLines: maxLines, maxLineLength: maxLineLength };
    return PRELUDE + '(' + JSON.stringify(config) + ');\n' + code;
  }

  function send(message) {
    if (port) port.postMessage(message);
  }

  function clip(value, max) {
    var text = String(value);
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  /** Output parts from the Worker, checked and cut to the line length. */
  function cleanParts(data, maxLineLength) {
    var raw = Array.isArray(data.parts) ? data.parts : [{ kind: 's', text: data.text }];
    var parts = [];
    var room = maxLineLength;
    for (var i = 0; i < raw.length && i < MAX_PARTS && room > 0; i++) {
      var part = raw[i] && typeof raw[i] === 'object' ? raw[i] : {};
      var text = clip(part.text === undefined ? '' : part.text, room);
      room -= text.length;
      parts.push({ kind: part.kind === 'v' ? 'v' : 's', text: text });
    }
    return parts;
  }

  function end(reason) {
    var run = current;
    if (!run) return;
    current = null;
    clearTimeout(run.timer);
    run.worker.terminate();
    URL.revokeObjectURL(run.url);
    send({ type: 'end', id: run.id, reason: reason });
  }

  // Messages from the Worker carry learner-controlled data: check every field.
  function onWorkerMessage(run, event) {
    if (current !== run) return;
    var data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.t === 'line') {
      if (run.lines >= run.maxLines) return end('limit');
      run.lines++;
      send({
        type: 'line',
        id: run.id,
        level: LEVELS[data.level] === true ? data.level : 'log',
        parts: cleanParts(data, run.maxLineLength),
      });
    } else if (data.t === 'error') {
      send({
        type: 'error',
        id: run.id,
        name: typeof data.name === 'string' && /^[A-Za-z]{1,40}$/.test(data.name) ? data.name : '',
        message: clip(data.message, run.maxLineLength),
        line: typeof data.line === 'number' && data.line >= 1 && data.line % 1 === 0 ? data.line : null,
      });
    } else if (data.t === 'done') {
      end('done');
    } else if (data.t === 'limit') {
      end('limit');
    }
  }

  // Fires when the Worker script cannot run at all, usually a SyntaxError.
  // Runtime errors are caught inside the Worker by worker.js.
  function onWorkerError(run, event) {
    if (current !== run) return;
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var raw = String((event && event.message) || '').replace(/^Uncaught\s+/, '');
    var match = /^([A-Za-z]{1,40}Error)\b:?\s*([\s\S]*)$/.exec(raw);
    var lineno = event && typeof event.lineno === 'number' ? event.lineno - LINE_OFFSET : 0;
    send({
      type: 'error',
      id: run.id,
      name: match ? match[1] : '',
      message: clip(match ? match[2] : raw, run.maxLineLength),
      line: lineno >= 1 ? lineno : null,
    });
    end('done');
  }

  function start(message) {
    if (current) end('stopped');
    var code = String(message.code).slice(0, CEILING.code);
    var maxLines = Math.min(Math.max(Number(message.maxLines) || 0, 1), CEILING.lines);
    var maxLineLength = Math.min(Math.max(Number(message.maxLineLength) || 0, 80), CEILING.lineLength);
    var timeoutMs = Math.min(Math.max(Number(message.timeoutMs) || 0, 100), CEILING.timeoutMs);
    var blob = new Blob([buildWorkerSource(code, maxLines, maxLineLength)], { type: 'text/javascript' });
    var url = URL.createObjectURL(blob);
    var run = { id: message.id, worker: null, url: url, timer: 0, lines: 0, maxLines: maxLines, maxLineLength: maxLineLength };
    try {
      run.worker = new Worker(url);
    } catch (error) {
      URL.revokeObjectURL(url);
      send({ type: 'unsupported' });
      return;
    }
    current = run;
    run.worker.onmessage = function (event) {
      onWorkerMessage(run, event);
    };
    run.worker.onerror = function (event) {
      onWorkerError(run, event);
    };
    run.timer = setTimeout(function () {
      if (current === run) end('timeout');
    }, timeoutMs);
  }

  function onPageMessage(event) {
    var message = event.data;
    if (!message || typeof message !== 'object' || typeof message.id !== 'number') return;
    if (message.type === 'run' && typeof message.code === 'string') start(message);
    else if (message.type === 'stop' && current && current.id === message.id) end('stopped');
  }

  // Can this browser start a Worker from a blob: URL inside this sandbox?
  function probe(callback) {
    var done = false;
    var worker = null;
    var url = '';
    function finish(ok) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (url) URL.revokeObjectURL(url);
      callback(ok);
    }
    var timer = setTimeout(function () {
      finish(false);
    }, 3000);
    try {
      url = URL.createObjectURL(new Blob(['postMessage(1)'], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = function () {
        finish(true);
      };
      worker.onerror = function () {
        finish(false);
      };
    } catch (error) {
      finish(false);
    }
  }

  // The lesson page sends one 'init' message carrying a private MessagePort.
  // Everything after that goes through the port only.
  window.addEventListener('message', function onInit(event) {
    if (port || event.source !== window.parent) return;
    var data = event.data;
    if (!data || data.type !== 'init' || !event.ports || !event.ports[0]) return;
    window.removeEventListener('message', onInit);
    port = event.ports[0];
    port.onmessage = onPageMessage;
    probe(function (ok) {
      send({ type: ok ? 'ready' : 'unsupported' });
    });
  });
})();
