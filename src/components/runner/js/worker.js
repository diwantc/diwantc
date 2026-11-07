// Runs inside the sandbox Worker, in the same script as the learner's code.
// frame.js builds the Worker script as:
//
//   <this function>(<config JSON>);
//   <learner code…>
//
// so this file must stay one function expression. It captures console
// output, reports errors with the learner's line number, and tells the frame
// when the program has finished (no timers left). It never touches the page:
// the Worker lives in a sandboxed, opaque-origin iframe with no network.
(function (config) {
  'use strict';

  var scope = self;
  var post = scope.postMessage.bind(scope);
  var nativeSetTimeout = scope.setTimeout.bind(scope);
  var nativeClearTimeout = scope.clearTimeout.bind(scope);
  var nativeSetInterval = scope.setInterval.bind(scope);
  var nativeClearInterval = scope.clearInterval.bind(scope);
  var scriptUrl = String((scope.location && scope.location.href) || '');

  var activeTimers = new Set();
  var printed = 0;
  var finished = false;

  // ---- Value formatting (close to what a browser console shows) ----------

  var MAX_DEPTH = 2;
  var MAX_ITEMS = 100;
  // Right-to-left scripts (Hebrew, Arabic, Syriac, Thaana, N'Ko, Arabic forms).
  var RTL_TEXT = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

  /**
   * A quoted string inside an array or object. Right-to-left text is wrapped
   * in Unicode isolate marks (FSI ... PDI) so that, in left-to-right output,
   * a list of Arabic strings keeps its order and its quotes and commas.
   */
  function quote(text) {
    var quoted = JSON.stringify(text);
    return RTL_TEXT.test(text) ? '\u2068' + quoted + '\u2069' : quoted;
  }

  function isIdentifier(key) {
    return /^[A-Za-z_$][\w$]*$/.test(key);
  }

  function formatKey(key) {
    return isIdentifier(key) ? key : quote(key);
  }

  function formatError(error) {
    var name = safe(function () {
      return String(error.name);
    }, 'Error');
    var message = safe(function () {
      return String(error.message);
    }, '');
    return message ? name + ': ' + message : name;
  }

  function safe(read, fallback) {
    try {
      return read();
    } catch (e) {
      return fallback;
    }
  }

  /** Formats up to MAX_ITEMS entries, then says how many were left out. */
  function formatEntries(entries, total, formatEntry) {
    var parts = [];
    for (var i = 0; i < entries.length && i < MAX_ITEMS; i++) parts.push(formatEntry(entries[i]));
    if (total > MAX_ITEMS) parts.push('… ' + (total - MAX_ITEMS) + ' more');
    return parts.join(', ');
  }

  /** First MAX_ITEMS entries of a Map or Set, without copying the rest. */
  function firstEntries(collection) {
    var out = [];
    var iterator = collection.entries();
    for (var step = iterator.next(); !step.done && out.length < MAX_ITEMS; step = iterator.next()) out.push(step.value);
    return out;
  }

  function format(value, depth, seen) {
    if (typeof value === 'string') return depth === 0 ? value : quote(value);
    if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
    if (typeof value === 'bigint') return String(value) + 'n';
    if (typeof value === 'symbol') return value.toString();
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'function') {
      var fname = safe(function () {
        return value.name;
      }, '');
      var isClass = safe(function () {
        return /^class[\s{]/.test(Function.prototype.toString.call(value));
      }, false);
      return (isClass ? '[class ' : '[Function: ') + (fname || '(anonymous)') + ']';
    }

    // Objects
    if (seen.indexOf(value) !== -1) return '[Circular]';
    if (value instanceof Error) return formatError(value);
    if (value instanceof Date) return isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
    if (value instanceof RegExp) return String(value);

    var nested = seen.concat([value]);
    var d = depth + 1;
    var inner = function (item) {
      return format(item, d, nested);
    };

    try {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (depth >= MAX_DEPTH) return '[Array(' + value.length + ')]';
        return '[' + formatEntries(value.slice(0, MAX_ITEMS), value.length, inner) + ']';
      }

      if (value instanceof Map || value instanceof Set) {
        var kind = value instanceof Map ? 'Map' : 'Set';
        if (value.size === 0) return kind + '(0) {}';
        if (depth >= MAX_DEPTH) return '[' + kind + '(' + value.size + ')]';
        var body = formatEntries(firstEntries(value), value.size, function (entry) {
          return kind === 'Map' ? inner(entry[0]) + ' => ' + inner(entry[1]) : inner(entry[0]);
        });
        return kind + '(' + value.size + ') { ' + body + ' }';
      }

      var proto = Object.getPrototypeOf(value);
      var ctor = proto && proto !== Object.prototype && proto.constructor ? String(proto.constructor.name) : '';
      var prefix = ctor && ctor !== 'Object' ? ctor + ' ' : '';
      var keys = Object.keys(value);
      if (keys.length === 0) return prefix + '{}';
      if (depth >= MAX_DEPTH) return '[' + (ctor || 'Object') + ']';
      var props = formatEntries(keys.slice(0, MAX_ITEMS), keys.length, function (key) {
        return formatKey(key) + ': ' + inner(value[key]);
      });
      return prefix + '{ ' + props + ' }';
    } catch (e) {
      // A getter or proxy in the learner's code threw while we read it.
      return '[object]';
    }
  }

  // ---- Messages to the frame ---------------------------------------------

  function finish(message) {
    if (finished) return;
    finished = true;
    post(message);
  }

  /**
   * One output line. Each argument is a separate part, so the page can lay
   * out Arabic and code-like values side by side without mixing them up.
   * kind 's' = a string argument (shown as written), 'v' = any other value.
   */
  function print(level, args) {
    if (finished) return;
    if (printed >= config.maxLines) {
      finish({ t: 'limit' });
      return;
    }
    printed++;
    var parts = [];
    var room = config.maxLineLength;
    for (var i = 0; i < args.length; i++) {
      var text = format(args[i], 0, []);
      var kind = typeof args[i] === 'string' ? 's' : 'v';
      if (text.length > room) {
        parts.push({ kind: kind, text: text.slice(0, room) + '…' });
        break;
      }
      room -= text.length;
      parts.push({ kind: kind, text: text });
    }
    post({ t: 'line', level: level, parts: parts });
  }

  /** Line in the learner's code, from an ErrorEvent line or an error's stack. */
  function learnerLine(lineno, error) {
    var line = typeof lineno === 'number' && lineno > 0 ? lineno : 0;
    if (!line && scriptUrl && error && typeof error.stack === 'string') {
      var at = error.stack.indexOf(scriptUrl + ':');
      if (at !== -1) {
        var match = /^:(\d+)/.exec(error.stack.slice(at + scriptUrl.length));
        if (match) line = Number(match[1]);
      }
    }
    var learner = line - config.lineOffset;
    return learner >= 1 ? learner : null;
  }

  function reportError(value, lineno) {
    if (finished) return;
    var isErrorLike =
      value instanceof Error ||
      (value !== null && typeof value === 'object' && typeof value.name === 'string' && 'message' in value);
    var name = isErrorLike ? String(value.name) : '';
    var message = isErrorLike ? String(value.message) : format(value, 1, []);
    post({ t: 'error', name: name, message: message, line: learnerLine(lineno, isErrorLike ? value : null) });
  }

  // ---- Console ------------------------------------------------------------

  var levels = { log: 'log', info: 'log', debug: 'log', dir: 'log', table: 'log', warn: 'warn', error: 'error' };
  var fakeConsole = scope.console || {};
  Object.keys(levels).forEach(function (method) {
    fakeConsole[method] = function () {
      print(levels[method], arguments);
    };
  });
  scope.console = fakeConsole;

  // ---- Errors -------------------------------------------------------------

  scope.addEventListener('error', function (event) {
    event.preventDefault();
    reportError(event.error !== undefined && event.error !== null ? event.error : event.message, event.lineno);
  });

  scope.addEventListener('unhandledrejection', function (event) {
    event.preventDefault();
    reportError(event.reason, 0);
  });

  // ---- Timers: the run is over when the code ran and no timer is left -----

  function checkIdle() {
    if (activeTimers.size === 0) finish({ t: 'done' });
  }

  function scheduleIdleCheck() {
    nativeSetTimeout(checkIdle, 0);
  }

  scope.setTimeout = function (callback, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof callback !== 'function') return nativeSetTimeout(callback, delay);
    var id = nativeSetTimeout(function () {
      activeTimers.delete(id);
      try {
        callback.apply(scope, args);
      } finally {
        scheduleIdleCheck();
      }
    }, delay);
    activeTimers.add(id);
    return id;
  };

  scope.setInterval = function (callback, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof callback !== 'function') return nativeSetInterval(callback, delay);
    var id = nativeSetInterval(function () {
      callback.apply(scope, args);
    }, delay);
    activeTimers.add(id);
    return id;
  };

  function clearTimer(id) {
    if (activeTimers.delete(id)) scheduleIdleCheck();
    nativeClearTimeout(id);
    nativeClearInterval(id);
  }

  scope.clearTimeout = clearTimer;
  scope.clearInterval = clearTimer;

  // Runs after the learner's top-level code and its promise callbacks.
  scheduleIdleCheck();
})
