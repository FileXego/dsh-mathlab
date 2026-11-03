
window.__ModuleLoader__.load({
  id: 'dsh-mathlab',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const ML = { React, h, NS: 'dsh-mathlab', DICT: {} };

(function () {
  'use strict';

  ML.DICT.zh = ML.DICT.zh || {};
  ML.DICT.en = ML.DICT.en || {};

  ML.assignStrings = function (zh, en) {
    if (zh) Object.assign(ML.DICT.zh, zh);
    if (en) Object.assign(ML.DICT.en, en);
  };

  ML.assignStrings(
    {
      __lang: 'zh',
      panel: '数学研究台',
      title: 'MathLab · 数学研究台',
      subtitle: '研究生级数学工具台 · 符号运算 / 代数 / 范畴 / 逻辑 / Lean / 绘图',
      'engine.ready': '引擎就绪',
      'engine.starting': '引擎启动中…',
      'engine.down': '引擎不可用',
      'engine.idle': '引擎未连接',
      'engine.retry': '重试',
      'engine.python': 'Python {v}',
      'engine.leanOn': 'Lean ✓',
      'engine.leanOff': 'Lean —',
      'engine.leanUnknown': 'Lean ?',
      'engine.leanOnWith': 'Lean {v}',
      'engine.checking': '正在连接数学引擎…',
      'engine.downHint': '无法连接本地数学引擎。Python 进程可能仍在启动，或插件宿主尚未加载。',
      'engine.downRetry': '重新连接',
      'footer.version': '版本',
      'footer.attribution': '开源组件：SymPy、NetworkX、SciPy、NumPy、Lean 4 / Mathlib4、KaTeX',
      'footer.note': '面板与引擎通过本地同源 API 通信，计算在您的机器上完成。',
      'common.copy': '复制',
      'common.copied': '已复制',
      'common.copyFailed': '复制失败',
      'common.copyLatex': '复制 LaTeX',
      'common.copyText': '复制文本',
      'common.run': '运行',
      'common.running': '计算中…',
      'common.clear': '清空',
      'common.reset': '重置',
      'common.close': '关闭',
      'common.retry': '重试',
      'common.loading': '加载中…',
      'common.empty': '暂无内容',
      'common.notes': '说明',
      'common.result': '结果',
      'common.raw': '原始 JSON',
      'common.details': '详情',
      'common.add': '添加',
      'common.remove': '删除',
      'common.insert': '插入',
      'common.noResult': '尚无结果',
      'common.input': '输入',
      'common.output': '输出',
      'common.error': '错误',
      'common.warning': '警告',
      'common.example': '示例',
      'common.pickExample': '快速示例',
      'common.json': 'JSON',
      'common.invalidNumber': '不是合法数字',
      'common.seconds': '{n} 秒',
      'common.ms': '{n} ms',
      'common.lines': '{n} 行',
      'common.dismiss': '知道了',
      'common.optional': '可选',
      'error.title': '请求失败',
      'error.engineDownHint': '引擎可能仍在启动，请稍后重试。',
      'error.badRequest': '请求格式有误。',
      'error.parse': '输入无法解析，请检查语法。',
      'error.timeout': '计算超时（单次操作上限约 20 秒）。',
      'error.limit': '超出当前规模限制。',
      'error.unsupported': '引擎暂不支持该操作。',
      'error.unknownOp': '未知操作。',
      'error.domain': '超出定义域或不可计算。',
      'error.internal': '引擎内部错误。',
      'error.network': '网络请求失败。',
      'error.noServer': '无法连接 MathLab API。',
      'a11y.tablist': 'MathLab 功能标签',
      'a11y.results': '计算结果',
    },
    {
      __lang: 'en',
      panel: 'MathLab',
      title: 'MathLab · Mathematics Workbench',
      subtitle: 'Graduate mathematics workbench · symbolic / algebra / categories / logic / Lean / plots',
      'engine.ready': 'engine ready',
      'engine.starting': 'engine starting…',
      'engine.down': 'engine unavailable',
      'engine.idle': 'engine not connected',
      'engine.retry': 'Retry',
      'engine.python': 'Python {v}',
      'engine.leanOn': 'Lean ✓',
      'engine.leanOff': 'Lean —',
      'engine.leanUnknown': 'Lean ?',
      'engine.leanOnWith': 'Lean {v}',
      'engine.checking': 'Connecting to the mathematics engine…',
      'engine.downHint': 'Cannot reach the local engine. Python may still be starting, or the plugin host is not loaded yet.',
      'engine.downRetry': 'Reconnect',
      'footer.version': 'version',
      'footer.attribution': 'Open source: SymPy, NetworkX, SciPy, NumPy, Lean 4 / Mathlib4, KaTeX',
      'footer.note': 'The panel talks to the local engine over a same-origin API; computation happens on your machine.',
      'common.copy': 'Copy',
      'common.copied': 'Copied',
      'common.copyFailed': 'Copy failed',
      'common.copyLatex': 'Copy LaTeX',
      'common.copyText': 'Copy text',
      'common.run': 'Run',
      'common.running': 'Computing…',
      'common.clear': 'Clear',
      'common.reset': 'Reset',
      'common.close': 'Close',
      'common.retry': 'Retry',
      'common.loading': 'Loading…',
      'common.empty': 'Nothing here yet',
      'common.notes': 'Notes',
      'common.result': 'Result',
      'common.raw': 'Raw JSON',
      'common.details': 'Details',
      'common.add': 'Add',
      'common.remove': 'Remove',
      'common.insert': 'Insert',
      'common.noResult': 'No result yet',
      'common.input': 'Input',
      'common.output': 'Output',
      'common.error': 'Error',
      'common.warning': 'Warning',
      'common.example': 'Example',
      'common.pickExample': 'Quick examples',
      'common.json': 'JSON',
      'common.invalidNumber': 'Not a valid number',
      'common.seconds': '{n}s',
      'common.ms': '{n} ms',
      'common.lines': '{n} lines',
      'common.dismiss': 'Dismiss',
      'common.optional': 'optional',
      'error.title': 'Request failed',
      'error.engineDownHint': 'The engine may still be starting — try again in a moment.',
      'error.badRequest': 'The request was malformed.',
      'error.parse': 'The input could not be parsed; check the syntax.',
      'error.timeout': 'Computation timed out (roughly 20s per operation).',
      'error.limit': 'This exceeds the current size limit.',
      'error.unsupported': 'The engine does not support this operation yet.',
      'error.unknownOp': 'Unknown operation.',
      'error.domain': 'Outside the domain of the computation.',
      'error.internal': 'Internal engine error.',
      'error.network': 'Network request failed.',
      'error.noServer': 'Cannot reach the MathLab API.',
      'a11y.tablist': 'MathLab sections',
      'a11y.results': 'Computation results',
    },
  );

  ML.I18nContext = React.createContext(function (key) { return ML.DICT.zh[key] || key; });

  ML.useT = function () {
    return React.useContext(ML.I18nContext);
  };

  ML.fmt = function (t, key, vars) {
    let text = String(t(key));
    if (vars) {
      for (const name of Object.keys(vars)) {
        text = text.split('{' + name + '}').join(String(vars[name]));
      }
    }
    return text;
  };

  ML.lang = function (t) {
    try {
      return t('__lang') === 'en' ? 'en' : 'zh';
    } catch (error) {
      return 'zh';
    }
  };

  ML.pick = function (lang, zh, en) {
    if (lang === 'en') return en || zh || '';
    return zh || en || '';
  };

  ML.fallbackT = function () {
    return function (key) {
      return ML.DICT.zh[key] !== undefined ? ML.DICT.zh[key] : key;
    };
  };

  let uidCounter = 0;
  ML.uid = function (prefix) {
    uidCounter += 1;
    return (prefix || 'ml') + '-' + uidCounter;
  };

  ML.isObj = function (value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  };

  ML.isNum = function (value) {
    return typeof value === 'number' && Number.isFinite(value);
  };

  ML.clamp = function (value, min, max) {
    return Math.min(max, Math.max(min, value));
  };

  ML.toArr = function (value) {
    return Array.isArray(value) ? value : [];
  };

  ML.safeString = function (value, max) {
    let text;
    if (typeof value === 'string') text = value;
    else if (value === undefined || value === null) text = '';
    else {
      try {
        text = JSON.stringify(value);
      } catch (error) {
        text = String(value);
      }
    }
    const limit = max || 20000;
    return text.length > limit ? text.slice(0, limit) + '…' : text;
  };

  ML.escRe = function (text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  ML.debounce = function (fn, ms) {
    let timer = null;
    return function () {
      const args = arguments;
      const self = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(self, args);
      }, ms || 200);
    };
  };

  ML.fmtNum = function (value, digits) {
    if (typeof value === 'string') return value;
    if (!Number.isFinite(value)) return String(value);
    const abs = Math.abs(value);
    const d = digits === undefined ? 6 : digits;
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-4)) return value.toExponential(Math.min(d, 4));
    const rounded = Number(value.toPrecision(d));
    return String(rounded);
  };

  ML.errInfo = function (error) {
    if (!error) return { code: 'internal', message: 'unknown error' };
    const code = typeof error.code === 'string' && error.code ? error.code : 'internal';
    const message = typeof error.message === 'string' && error.message ? error.message : String(error);
    return { code: code, message: message };
  };

  ML.errText = function (error, t) {
    const info = ML.errInfo(error);
    const tr = typeof t === 'function' ? t : ML.fallbackT();
    const keyMap = {
      'engine-down': 'error.engineDownHint',
      'bad-request': 'error.badRequest',
      'parse-error': 'error.parse',
      timeout: 'error.timeout',
      limit: 'error.limit',
      unsupported: 'error.unsupported',
      'unknown-op': 'error.unknownOp',
      'domain-error': 'error.domain',
      internal: 'error.internal',
    };
    const hint = keyMap[info.code] ? String(tr(keyMap[info.code])) : '';
    const base = info.code + ': ' + info.message;
    return hint && hint !== info.message ? base + ' — ' + hint : base;
  };

  ML.storage = {
    get: function (key, fallback) {
      try {
        const raw = window.localStorage.getItem('mathlab.' + key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem('mathlab.' + key, JSON.stringify(value));
      } catch (error) {

      }
    },
    remove: function (key) {
      try {
        window.localStorage.removeItem('mathlab.' + key);
      } catch (error) {

      }
    },
  };

  const busListeners = new Map();
  ML.bus = {
    on: function (name, fn) {
      if (!busListeners.has(name)) busListeners.set(name, new Set());
      busListeners.get(name).add(fn);
      return function off() {
        const set = busListeners.get(name);
        if (set) set.delete(fn);
      };
    },
    emit: function (name, payload) {
      const set = busListeners.get(name);
      if (!set) return;
      for (const fn of Array.from(set)) {
        try {
          fn(payload);
        } catch (error) {
          if (typeof console !== 'undefined') console.error('[mathlab] bus handler failed', error);
        }
      }
    },
  };

  ML.copy = async function (text) {
    const value = String(text === undefined || text === null ? '' : text);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (error) {

    }
    try {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return !!ok;
    } catch (error) {
      return false;
    }
  };

  ML.download = function (filename, text, mime) {
    try {
      const blob = new Blob([String(text)], { type: mime || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || 'mathlab.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4000);
      return true;
    } catch (error) {
      return false;
    }
  };

  ML.insertAtActive = function (text) {
    try {
      const active = document.activeElement;
      const tag = active && active.tagName;
      const isField =
        active &&
        (tag === 'TEXTAREA' || (tag === 'INPUT' && String(active.type).toLowerCase() !== 'checkbox')) &&
        active.closest &&
        active.closest('[data-mathlab-root]');
      if (!isField) return false;
      const proto = tag === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      const start = typeof active.selectionStart === 'number' ? active.selectionStart : active.value.length;
      const end = typeof active.selectionEnd === 'number' ? active.selectionEnd : start;
      const next = active.value.slice(0, start) + text + active.value.slice(end);
      setter.call(active, next);
      active.dispatchEvent(new Event('input', { bubbles: true }));
      const caret = start + text.length;
      try {
        active.setSelectionRange(caret, caret);
      } catch (error) {

      }
      active.focus();
      return true;
    } catch (error) {
      return false;
    }
  };

  ML.parseMatrix = function (text) {
    const raw = String(text === undefined || text === null ? '' : text).trim();
    if (!raw) return { matrix: [], error: 'empty' };
    if (raw.charAt(0) === '[') {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.every(function (row) { return Array.isArray(row); })) {
          return { matrix: [], error: 'matrix must be an array of rows' };
        }
        const matrix = parsed.map(function (row) {
          return row.map(function (cell) { return ML.safeString(cell, 200).trim(); });
        });
        const width = matrix.length ? matrix[0].length : 0;
        if (matrix.length === 0 || width === 0) return { matrix: [], error: 'matrix is empty' };
        if (!matrix.every(function (row) { return row.length === width; })) {
          return { matrix: [], error: 'rows have different lengths' };
        }
        return { matrix: matrix, error: null };
      } catch (error) {
        return { matrix: [], error: 'invalid JSON matrix: ' + error.message };
      }
    }
    const rows = raw
      .split(/[\n;]+/)
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });
    if (rows.length === 0) return { matrix: [], error: 'empty' };
    const matrix = rows.map(function (line) {
      return line
        .replace(/[|]/g, ' ')
        .split(/[,\t]+|\s{1,}/)
        .map(function (cell) { return cell.trim(); })
        .filter(function (cell) { return cell.length > 0; });
    });
    if (matrix.some(function (row) { return row.length === 0; })) {
      return { matrix: [], error: 'empty row' };
    }
    const width = matrix[0].length;
    if (!matrix.every(function (row) { return row.length === width; })) {
      return { matrix: [], error: 'rows have different lengths' };
    }
    return { matrix: matrix, error: null };
  };

  ML.matrixText = function (matrix) {
    return ML.toArr(matrix)
      .map(function (row) {
        return ML.toArr(row)
          .map(function (cell) { return ML.safeString(cell, 400); })
          .join(', ');
      })
      .join('\n');
  };

  ML.lines = function (text) {
    return String(text === undefined || text === null ? '' : text)
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });
  };

  ML.parseList = function (text) {
    const raw = String(text === undefined || text === null ? '' : text).trim();
    if (!raw) return { values: [], error: 'empty' };
    if (raw.charAt(0) === '[') {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return { values: [], error: 'expected a JSON array' };
        return { values: parsed, error: null };
      } catch (error) {
        return { values: [], error: 'invalid JSON: ' + error.message };
      }
    }
    return {
      values: raw
        .split(/[,\s]+/)
        .map(function (part) { return part.trim(); })
        .filter(Boolean),
      error: null,
    };
  };

  ML.parseCycles = function (text) {
    const raw = String(text === undefined || text === null ? '' : text).trim();
    if (!raw) return { cycles: [], error: 'empty' };
    if (raw.charAt(0) === '[') {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return { cycles: [], error: 'expected an array of cycles' };
        const cycles = parsed.map(function (cycle) {
          return ML.toArr(cycle).map(function (value) { return parseInt(value, 10); });
        });
        return ML.validateCycles(cycles);
      } catch (error) {
        return { cycles: [], error: 'invalid JSON cycles: ' + error.message };
      }
    }
    const groups = [];
    const re = /\(([^()]*)\)/g;
    let match;
    while ((match = re.exec(raw)) !== null) groups.push(match[1]);
    let cycles;
    if (groups.length > 0) {
      cycles = groups.map(function (group) {
        return group
          .split(/[,\s]+/)
          .map(function (part) { return part.trim(); })
          .filter(Boolean)
          .map(function (value) { return parseInt(value, 10); });
      });
    } else {
      const parts = raw.split(/[;,]+/).map(function (part) { return part.trim(); }).filter(Boolean);
      cycles = parts.map(function (part) {
        return part.split(/[\s]+/).filter(Boolean).map(function (value) { return parseInt(value, 10); });
      });
    }
    return ML.validateCycles(cycles);
  };

  ML.validateCycles = function (cycles) {
    for (const cycle of cycles) {
      if (cycle.length < 2) return { cycles: [], error: 'every cycle needs at least two points' };
      for (const point of cycle) {
        if (!Number.isInteger(point) || point < 1) {
          return { cycles: [], error: 'permutation points must be positive integers' };
        }
      }
    }
    return { cycles: cycles, error: null };
  };

  ML.parseMappings = function (text) {
    const pairs = [];
    for (const line of ML.lines(text)) {
      const match = line.split(/\s*(?:->|=>|→|:)\s*/);
      if (match.length >= 2 && match[0] && match[1]) pairs.push([match[0].trim(), match[1].trim()]);
    }
    return pairs;
  };

  ML.exprLike = function (value) {
    return (
      ML.isObj(value) &&
      (typeof value.latex === 'string' ||
        typeof value.pretty === 'string' ||
        typeof value.result === 'string' ||
        typeof value.result === 'number')
    );
  };

  ML.pickExpr = function (data) {
    if (ML.exprLike(data)) return data;
    if (ML.isObj(data)) {
      if (ML.exprLike(data.value)) return data.value;
      if (ML.exprLike(data.result)) return data.result;
      if (ML.exprLike(data.solution)) return data.solution;
      if (Array.isArray(data.values) && data.values.length && ML.exprLike(data.values[0])) {
        return data.values[0];
      }
    }
    return null;
  };

  ML.exprLatex = function (expr) {
    if (!ML.isObj(expr)) return '';
    if (typeof expr.latex === 'string' && expr.latex) return expr.latex;
    if (typeof expr.pretty === 'string') return expr.pretty;
    return ML.safeString(expr.result === undefined ? expr : expr.result);
  };

  ML.matrixLike = function (value) {
    if (!Array.isArray(value) || value.length === 0) return false;
    return value.every(function (row) {
      return Array.isArray(row) && row.every(function (cell) {
        return typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean';
      });
    });
  };

  ML.prettyJSON = function (value, max) {
    try {
      const text = JSON.stringify(value, null, 2);
      return ML.safeString(text, max || 20000);
    } catch (error) {
      return ML.safeString(value);
    }
  };

  ML.normalizeInfo = function (info) {
    const root = ML.isObj(info) ? info : {};
    const engine = ML.isObj(root.engine) ? root.engine : {};
    const nested = ML.isObj(engine.info) ? engine.info : {};
    const pick = function (keys) {
      for (const source of [nested, engine, root]) {
        for (const key of keys) {
          if (source && source[key] !== undefined && source[key] !== null) return source[key];
        }
      }
      return null;
    };
    const leanRaw = pick(['lean']);
    let lean = null;
    if (ML.isObj(leanRaw)) lean = leanRaw;
    else if (leanRaw !== null) lean = { available: !!leanRaw };
    if (!lean) lean = { available: false, version: null, path: null };
    const leanAvailable =
      lean.available !== undefined ? !!lean.available : !!lean.version;
    const available =
      engine.available !== undefined
        ? !!engine.available
        : pick(['python']) !== null || root.plugin !== undefined || root.engine !== undefined;
    return {
      available: !!available,
      version: pick(['version']),
      pluginVersion: root.version || null,
      plugin: pick(['plugin']),
      python: pick(['python', 'pythonVersion']),
      sympy: pick(['sympy', 'sympyVersion']),
      numpy: pick(['numpy']),
      scipy: pick(['scipy']),
      networkx: pick(['networkx']),
      lean: {
        available: leanAvailable,
        version: lean.version || null,
        path: lean.path || null,
        note: lean.note || null,
        lake: lean.lake === undefined ? null : lean.lake,
      },
      capabilities: pick(['capabilities']) || [],
      symbols: pick(['symbols']),
      examples: pick(['examples']),
      raw: root,
    };
  };

  ML.tabs = {};
  ML.registerTab = function (id, order, zhLabel, enLabel, Component) {
    ML.tabs[id] = {
      id: id,
      order: order,
      Component: Component,
    };
    ML.assignStrings({ ['tab.' + id]: zhLabel }, { ['tab.' + id]: enLabel });
  };

  ML.needsEngine = function (status) {
    return status === 'idle' || status === 'starting' || status === 'loading' || status === 'down';
  };
})();

(function () {
  'use strict';

  const API_URL = '/mathlab/api';

  function MathLabError(code, message, cause) {
    const error = new Error(message || code || 'MathLab request failed');
    error.name = 'MathLabError';
    error.code = code || 'internal';
    if (cause !== undefined) error.cause = cause;
    return error;
  }
  MathLabError.prototype = Object.create(Error.prototype);
  MathLabError.prototype.constructor = MathLabError;
  ML.MathLabError = MathLabError;

  ML.callMath = async function (op, args) {
    const request = { op: String(op || ''), args: args && typeof args === 'object' ? args : {} };
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
      ? setTimeout(function () {
          try {
            controller.abort();
          } catch (error) {

          }
        }, 45000)
      : null;
    let response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
        cache: 'no-store',
        signal: controller ? controller.signal : undefined,
      });
    } catch (error) {
      clearTimeout(timer);
      if (error && error.name === 'AbortError') {
        throw MathLabError('timeout', ML.fmt(ML.fallbackT(), 'error.timeout'), error);
      }
      throw MathLabError('engine-down', 'network error: ' + (error && error.message ? error.message : String(error)), error);
    }
    clearTimeout(timer);

    if (!response || typeof response.ok !== 'boolean') {
      throw MathLabError('engine-down', 'empty HTTP response');
    }
    if (!response.ok) {
      throw MathLabError('bad-request', 'HTTP ' + response.status + ' ' + (response.statusText || ''));
    }
    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw MathLabError('bad-request', 'response is not valid JSON', error);
    }
    if (!payload || typeof payload !== 'object') {
      throw MathLabError('bad-request', 'empty response payload');
    }
    if (payload.ok === false) {
      const info = ML.isObj(payload.error) ? payload.error : {};
      throw MathLabError(String(info.code || 'internal'), String(info.message || 'request failed'));
    }
    if (payload.ok === true && Object.prototype.hasOwnProperty.call(payload, 'result')) {
      return payload.result;
    }

    return payload;
  };

  const engineState = {
    status: 'idle', // idle | loading | starting | ready | down
    info: null,
    error: null,
    attempts: 0,
    timer: null,
    subscribers: 0,
  };
  const engineListeners = new Set();

  function emitEngine() {
    for (const listener of Array.from(engineListeners)) {
      try {
        listener();
      } catch (error) {
        if (typeof console !== 'undefined') console.error('[mathlab] engine listener failed', error);
      }
    }
  }

  function setEngine(patch) {
    Object.assign(engineState, patch);
    emitEngine();
  }

  async function loadEngine(manual) {
    if (engineState.status === 'loading') return;
    clearTimeout(engineState.timer);
    setEngine({ status: 'loading', error: null });
    try {
      const info = await ML.callMath('meta.info', {});
      engineState.attempts = 0;
      setEngine({ status: 'ready', info: ML.normalizeInfo(info), error: null });
    } catch (error) {
      engineState.attempts += 1;
      const autoRetry = !manual && engineState.attempts < 5;
      if (autoRetry) {
        setEngine({ status: 'starting', error: error, timer: null });
        const delay = Math.min(6000, 800 * engineState.attempts + 600);
        engineState.timer = setTimeout(function () {
          if (engineState.subscribers > 0) loadEngine(false);
        }, delay);
      } else {
        setEngine({ status: 'down', error: error, timer: null });
      }
    }
  }

  ML.engine = {
    get: function () {
      return {
        status: engineState.status,
        info: engineState.info,
        error: engineState.error,
        attempts: engineState.attempts,
      };
    },
    subscribe: function (listener) {
      engineListeners.add(listener);
      return function () {
        engineListeners.delete(listener);
      };
    },
    ensure: function () {
      if (engineState.status === 'idle') loadEngine(false);
    },
    refresh: function () {
      engineState.attempts = 0;
      loadEngine(true);
    },
    retain: function () {
      engineState.subscribers += 1;
      return function () {
        engineState.subscribers = Math.max(0, engineState.subscribers - 1);
      };
    },
  };

  ML.useEngine = function () {
    const [snapshot, setSnapshot] = React.useState(function () {
      return ML.engine.get();
    });
    React.useEffect(function () {
      const release = ML.engine.retain();
      const unsubscribe = ML.engine.subscribe(function () {
        setSnapshot(ML.engine.get());
      });
      ML.engine.ensure();
      return function () {
        release();
        unsubscribe();
      };
    }, []);
    return Object.assign({}, snapshot, { refresh: ML.engine.refresh });
  };

  ML.useCall = function () {
    const [state, setState] = React.useState({
      loading: false,
      error: null,
      result: null,
      op: null,
      elapsed: null,
    });
    const seq = React.useRef(0);
    React.useEffect(function () {
      return function () {
        seq.current += 1;
      };
    }, []);

    const run = React.useCallback(async function (op, args) {
      const ticket = ++seq.current;
      const started = Date.now();
      setState({ loading: true, error: null, result: null, op: op, elapsed: null });
      try {
        const result = await ML.callMath(op, args);
        if (ticket === seq.current) {
          setState({ loading: false, error: null, result: result, op: op, elapsed: Date.now() - started });
        }
        return { ok: true, result: result };
      } catch (error) {
        if (ticket === seq.current) {
          setState({
            loading: false,
            error: error,
            result: null,
            op: op,
            elapsed: Date.now() - started,
          });
        }
        return { ok: false, error: error };
      }
    }, []);

    const reset = React.useCallback(function () {
      seq.current += 1;
      setState({ loading: false, error: null, result: null, op: null, elapsed: null });
    }, []);

    return Object.assign({}, state, { run: run, reset: reset });
  };

  ML.useMountedRef = function () {
    const ref = React.useRef(true);
    React.useEffect(function () {
      ref.current = true;
      return function () {
        ref.current = false;
      };
    }, []);
    return ref;
  };
})();

(function () {
  'use strict';

  const KATEX_BASE = '/mathlab/assets/katex/';
  let katexPromise = null;
  let katexCssRequested = false;
  let lastFailureAt = 0;

  function injectCss() {
    if (katexCssRequested) return;
    katexCssRequested = true;
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = KATEX_BASE + 'katex.min.css';
      link.setAttribute('data-mathlab-katex', 'css');
      document.head.appendChild(link);
    } catch (error) {

    }
  }

  function injectScript() {
    return new Promise(function (resolve) {
      try {
        if (window.katex && typeof window.katex.render === 'function') {
          resolve(true);
          return;
        }
        const existing = document.querySelector('script[data-mathlab-katex="js"]');
        if (existing) {
          existing.addEventListener('load', function () {
            resolve(!!window.katex);
          });
          existing.addEventListener('error', function () {
            resolve(false);
          });
          return;
        }
        const script = document.createElement('script');
        script.src = KATEX_BASE + 'katex.min.js';
        script.async = true;
        script.setAttribute('data-mathlab-katex', 'js');
        script.addEventListener('load', function () {
          resolve(!!(window.katex && typeof window.katex.render === 'function'));
        });
        script.addEventListener('error', function () {
          resolve(false);
        });
        document.head.appendChild(script);
        setTimeout(function () {
          resolve(!!(window.katex && typeof window.katex.render === 'function'));
        }, 12000);
      } catch (error) {
        resolve(false);
      }
    });
  }

  ML.ensureKatex = function () {
    if (katexPromise) return katexPromise;
    if (window.katex && typeof window.katex.render === 'function') {
      injectCss();
      katexPromise = Promise.resolve(true);
      return katexPromise;
    }
    if (lastFailureAt && Date.now() - lastFailureAt < 8000) return Promise.resolve(false);
    injectCss();
    katexPromise = injectScript().then(function (ok) {
      if (!ok) {
        lastFailureAt = Date.now();
        katexPromise = null;
        return false;
      }
      return true;
    });
    return katexPromise;
  };

  ML.katexReady = function () {
    return !!(window.katex && typeof window.katex.render === 'function');
  };

  ML.renderMath = function (node, latex, options) {
    if (!node) return Promise.resolve(false);
    const text = typeof latex === 'string' ? latex : latex === undefined || latex === null ? '' : String(latex);
    const opts = options || {};
    const display = !!opts.display;
    const fallback = function () {
      try {
        node.textContent = text;
        node.setAttribute('data-mathlab-math', 'fallback');
      } catch (error) {

      }
      return false;
    };
    try {
      if (ML.katexReady()) {
        try {
          window.katex.render(text, node, {
            displayMode: display,
            throwOnError: false,
            strict: false,
            trust: false,
            output: 'html',
          });
          node.setAttribute('data-mathlab-math', 'katex');
          return Promise.resolve(true);
        } catch (error) {
          return Promise.resolve(fallback());
        }
      }
      if (!text) {
        node.textContent = '';
        return Promise.resolve(false);
      }
      fallback();
      return ML.ensureKatex().then(function (ok) {
        if (!ok || !node.isConnected) return ok;
        try {
          window.katex.render(text, node, {
            displayMode: display,
            throwOnError: false,
            strict: false,
            trust: false,
            output: 'html',
          });
          node.setAttribute('data-mathlab-math', 'katex');
          return true;
        } catch (error) {
          fallback();
          return false;
        }
      });
    } catch (error) {
      return Promise.resolve(fallback());
    }
  };

  ML.Math = function Math(props) {
    const ref = React.useRef(null);
    const tex = typeof props.tex === 'string' ? props.tex : String(props.tex === undefined || props.tex === null ? '' : props.tex);
    const display = !!props.display;
    const className = props.className;
    React.useEffect(
      function () {
        let alive = true;
        ML.renderMath(ref.current, tex, { display: display }).then(function () {
          if (!alive) return;

        });
        return function () {
          alive = false;
        };
      },
      [tex, display],
    );
    return h('span', {
      ref: ref,
      className: 'ml-math' + (display ? ' ml-math-block' : '') + (className ? ' ' + className : ''),
      'aria-label': tex ? ML.safeString(tex, 400) : undefined,
    });
  };

  ML.FormulaBlock = function FormulaBlock(props) {
    return h(
      'div',
      { className: 'ml-formula' + (props.className ? ' ' + props.className : '') },
      props.label ? h('div', { className: 'ml-formula-label' }, props.label) : null,
      h(ML.Math, { tex: props.tex, display: true }),
    );
  };
})();

(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;

  let idCounter = 0;
  ML.useId = function (prefix) {
    if (typeof React.useId === 'function') return React.useId();
    const ref = useRef(null);
    if (ref.current === null) {
      idCounter += 1;
      ref.current = (prefix || 'ml') + '-' + idCounter;
    }
    return ref.current;
  };

  ML.Btn = React.forwardRef(function Btn(props, ref) {
    const variant = props.variant || 'ghost';
    const size = props.size || 'md';
    const className = ['ml-btn', 'ml-btn-' + variant, 'ml-btn-' + size, props.className || '']
      .filter(Boolean)
      .join(' ');
    const rest = Object.assign({}, props);
    delete rest.variant;
    delete rest.size;
    delete rest.className;
    return h(
      'button',
      Object.assign({ type: 'button', className: className, ref: ref }, rest),
      props.children,
    );
  });

  ML.Card = function Card(props) {
    return h(
      'section',
      { className: 'ml-card' + (props.className ? ' ' + props.className : '') },
      props.title || props.actions
        ? h(
            'header',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, props.title),
            props.subtitle ? h('p', { className: 'ml-card-sub' }, props.subtitle) : null,
            props.actions ? h('div', { className: 'ml-card-actions' }, props.actions) : null,
          )
        : null,
      h('div', { className: 'ml-card-bd' }, props.children),
    );
  };

  ML.SectionTitle = function SectionTitle(props) {
    return h(
      'div',
      { className: 'ml-section-title' },
      h('h2', { className: 'ml-h2' }, props.children),
      props.hint ? h('span', { className: 'ml-hint' }, props.hint) : null,
    );
  };

  ML.Field = function Field(props) {
    const autoId = ML.useId('field');
    const id = props.id || autoId;
    let child = props.children;
    if (typeof child === 'function') child = child({ id: id });
    else if (React.isValidElement(child)) {
      child = React.cloneElement(child, child.props.id ? {} : { id: id });
    }
    return h(
      'div',
      { className: 'ml-field' + (props.inline ? ' ml-field-inline' : '') + (props.className ? ' ' + props.className : '') },
      props.label ? h('label', { className: 'ml-label', htmlFor: id }, props.label) : null,
      child,
      props.hint ? h('div', { className: 'ml-hint' }, props.hint) : null,
    );
  };

  ML.Input = React.forwardRef(function Input(props, ref) {
    const rest = Object.assign({}, props);
    delete rest.className;
    return h('input', Object.assign({ type: 'text', ref: ref }, rest, {
      className: 'ml-input' + (props.className ? ' ' + props.className : ''),
    }));
  });

  ML.Textarea = React.forwardRef(function Textarea(props, ref) {
    const rest = Object.assign({}, props);
    delete rest.className;
    return h('textarea', Object.assign({ rows: props.rows || 4, spellCheck: false, ref: ref }, rest, {
      className: 'ml-textarea' + (props.className ? ' ' + props.className : ''),
    }));
  });

  ML.Select = React.forwardRef(function Select(props, ref) {
    const options = ML.toArr(props.options);
    const rest = Object.assign({}, props);
    delete rest.className;
    delete rest.options;
    return h(
      'select',
      Object.assign({ ref: ref }, rest, { className: 'ml-select' + (props.className ? ' ' + props.className : '') }),
      options.map(function (option) {
        const value = ML.isObj(option) ? option.value : option;
        const label = ML.isObj(option) ? option.label : String(option);
        return h('option', { key: String(value), value: value }, label);
      }),
    );
  });

  ML.Badge = function Badge(props) {
    return h(
      'span',
      { className: 'ml-badge ml-badge-' + (props.tone || 'idle') + (props.className ? ' ' + props.className : '') },
      props.children,
    );
  };

  ML.Loading = function Loading(props) {
    const t = ML.useT();
    return h(
      'div',
      { className: 'ml-loading', role: 'status', 'aria-live': 'polite' },
      h('span', { className: 'ml-spinner', 'aria-hidden': true }),
      h('span', null, props.label || t('common.loading')),
    );
  };

  ML.Empty = function Empty(props) {
    const t = ML.useT();
    return h('div', { className: 'ml-empty' }, props.label || t('common.empty'));
  };

  ML.ErrorBox = function ErrorBox(props) {
    const t = ML.useT();
    const error = props.error;
    const info = ML.errInfo(error);
    const tone = info.code === 'engine-down' || info.code === 'timeout' ? 'warn' : 'error';
    return h(
      'div',
      { className: 'ml-error ml-error-' + tone, role: 'alert' },
      h(
        'div',
        { className: 'ml-error-hd' },
        h('strong', null, props.title || t('error.title')),
        h('code', { className: 'ml-error-code' }, info.code),
        props.onRetry
          ? h(
              ML.Btn,
              { size: 'sm', variant: 'ghost', onClick: props.onRetry },
              t('common.retry'),
            )
          : null,
      ),
      h('div', { className: 'ml-error-msg' }, info.message),
      info.code === 'engine-down' ? h('div', { className: 'ml-error-hint' }, t('error.engineDownHint')) : null,
      props.extra ? h('div', { className: 'ml-error-hint' }, props.extra) : null,
    );
  };

  ML.Banner = function Banner(props) {
    return h(
      'div',
      { className: 'ml-banner ml-banner-' + (props.tone || 'info') + (props.className ? ' ' + props.className : '') },
      props.children,
    );
  };

  ML.CopyBtn = function CopyBtn(props) {
    const t = ML.useT();
    const [copied, setCopied] = useState(false);
    const timer = useRef(null);
    useEffect(function () {
      return function () {
        clearTimeout(timer.current);
      };
    }, []);
    const doCopy = async function () {
      const ok = await ML.copy(props.text);
      setCopied(ok ? 'ok' : 'fail');
      clearTimeout(timer.current);
      timer.current = setTimeout(function () {
        setCopied(false);
      }, 1600);
    };
    const label = copied === 'ok' ? t('common.copied') : copied === 'fail' ? t('common.copyFailed') : props.label || t('common.copy');
    return h(
      ML.Btn,
      {
        size: props.size || 'sm',
        variant: props.variant || 'ghost',
        onClick: doCopy,
        title: props.title,
        'data-copied': copied || undefined,
      },
      props.icon === false ? null : h('span', { className: 'ml-copy-glyph', 'aria-hidden': true }, copied === 'ok' ? '✓' : '⧉'),
      h('span', null, label),
    );
  };

  ML.Tabs = function Tabs(props) {
    const items = ML.toArr(props.items).map(function (item) {
      return ML.isObj(item) ? item : { id: String(item), label: String(item) };
    });
    const value = props.value;
    const refs = useRef([]);
    const idPrefix = props.idPrefix;
    const tabId = function (id) {
      return idPrefix ? idPrefix + '-tab-' + id : undefined;
    };
    const panelId = function (id) {
      return idPrefix ? idPrefix + '-panel-' + id : undefined;
    };
    const onKeyDown = function (event) {
      const key = event.key;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return;
      event.preventDefault();
      const enabled = items
        .map(function (item, index) { return { item: item, index: index }; })
        .filter(function (entry) { return !entry.item.disabled; });
      if (enabled.length === 0) return;
      let cursor = enabled.findIndex(function (entry) { return entry.item.id === value; });
      if (cursor < 0) cursor = 0;
      if (key === 'ArrowRight') cursor = (cursor + 1) % enabled.length;
      if (key === 'ArrowLeft') cursor = (cursor - 1 + enabled.length) % enabled.length;
      if (key === 'Home') cursor = 0;
      if (key === 'End') cursor = enabled.length - 1;
      const next = enabled[cursor].item;
      if (props.onChange) props.onChange(next.id);
      const node = refs.current[enabled[cursor].index];
      if (node && node.focus) node.focus();
    };
    return h(
      'div',
      {
        className: 'ml-tabs' + (props.size === 'sm' ? ' ml-tabs-sm' : '') + (props.className ? ' ' + props.className : ''),
        role: 'tablist',
        'aria-label': props.ariaLabel || undefined,
        onKeyDown: onKeyDown,
      },
      items.map(function (item, index) {
        const selected = item.id === value;
        return h(
          'button',
          {
            key: item.id,
            ref: function (node) {
              refs.current[index] = node;
            },
            type: 'button',
            role: 'tab',
            id: tabId(item.id),
            'aria-controls': panelId(item.id),
            className: 'ml-tab' + (selected ? ' is-active' : ''),
            'aria-selected': selected,
            tabIndex: selected ? 0 : -1,
            disabled: !!item.disabled,
            onClick: function () {
              if (props.onChange) props.onChange(item.id);
            },
          },
          item.label,
          item.badge !== undefined && item.badge !== null
            ? h('span', { className: 'ml-tab-badge' }, String(item.badge))
            : null,
        );
      }),
    );
  };

  ML.Notes = function Notes(props) {
    const t = ML.useT();
    const notes = ML.toArr(props.notes).filter(function (note) {
      return note !== undefined && note !== null && String(note).length > 0;
    });
    if (notes.length === 0) return null;
    return h(
      'div',
      { className: 'ml-notes' },
      h('div', { className: 'ml-notes-hd' }, t('common.notes')),
      h(
        'ul',
        null,
        notes.map(function (note, index) {
          return h('li', { key: index }, String(note));
        }),
      ),
    );
  };

  ML.JSONTree = function JSONTree(props) {
    const depth = props.depth || 0;
    const value = props.value;
    if (value === null || value === undefined) return h('span', { className: 'ml-json-null' }, String(value));
    if (typeof value === 'string') return h('span', { className: 'ml-json-string' }, value);
    if (typeof value === 'number' || typeof value === 'boolean') {
      return h('span', { className: 'ml-json-atom' }, String(value));
    }
    if (depth >= 8) return h('span', { className: 'ml-json-null' }, '…');
    if (Array.isArray(value)) {
      if (value.length === 0) return h('span', { className: 'ml-json-null' }, '[]');
      return h(
        'ol',
        { className: 'ml-json-list' },
        value.map(function (item, index) {
          return h(
            'li',
            { key: index },
            h('span', { className: 'ml-json-index' }, index + ': '),
            h(ML.JSONTree, { value: item, depth: depth + 1 }),
          );
        }),
      );
    }
    if (ML.isObj(value)) {
      const keys = Object.keys(value);
      if (keys.length === 0) return h('span', { className: 'ml-json-null' }, '{}');
      return h(
        'dl',
        { className: 'ml-json-obj' },
        keys.map(function (key) {
          return h(
            'div',
            { className: 'ml-json-row', key: key },
            h('dt', null, key),
            h('dd', null, h(ML.JSONTree, { value: value[key], depth: depth + 1 })),
          );
        }),
      );
    }
    return h('span', null, String(value));
  };

  ML.RawJSON = function RawJSON(props) {
    const t = ML.useT();
    const text = ML.prettyJSON(props.value);
    return h(
      'details',
      { className: 'ml-collapse ml-raw' },
      h(
        'summary',
        null,
        h('span', null, props.title || t('common.raw')),
        h(ML.CopyBtn, { text: text, label: t('common.copyText'), variant: 'subtle' }),
      ),
      h('pre', { className: 'ml-pre' }, text),
    );
  };

  ML.Collapse = function Collapse(props) {
    return h(
      'details',
      { className: 'ml-collapse', open: props.open || undefined },
      h(
        'summary',
        null,
        h('span', null, props.title),
        props.summary ? h('span', { className: 'ml-collapse-extra' }, props.summary) : null,
      ),
      h('div', { className: 'ml-collapse-bd' }, props.children),
    );
  };

  ML.KV = function KV(props) {
    const rows = ML.toArr(props.rows).filter(function (row) {
      return row && row.value !== undefined && row.value !== null && row.value !== '';
    });
    if (rows.length === 0) return null;
    return h(
      'dl',
      { className: 'ml-kv' },
      rows.map(function (row, index) {
        return h(
          'div',
          { className: 'ml-kv-row', key: (row.label || '') + index },
          h('dt', null, row.label),
          h('dd', { className: row.mono ? 'ml-mono' : undefined }, row.value),
        );
      }),
    );
  };

  ML.MatrixView = function MatrixView(props) {
    const matrix = ML.toArr(props.matrix);
    if (matrix.length === 0) return h(ML.Empty, null);
    const cols = Math.max.apply(
      null,
      matrix.map(function (row) { return ML.toArr(row).length; }).concat([0]),
    );
    return h(
      'div',
      { className: 'ml-matrix-wrap' + (props.small ? ' ml-matrix-sm' : '') },
      props.label ? h('div', { className: 'ml-matrix-label' }, props.label) : null,
      h(
        'table',
        { className: 'ml-matrix' + (props.editable ? ' ml-matrix-editable' : '') },
        h(
          'tbody',
          null,
          matrix.map(function (row, rowIndex) {
            return h(
              'tr',
              { key: rowIndex },
              ML.toArr(row).map(function (cell, colIndex) {
                let content;
                if (props.renderCell) content = props.renderCell(cell, rowIndex, colIndex);
                else if (props.onChange) {
                  content = h('input', {
                    className: 'ml-matrix-input',
                    value: cell === undefined || cell === null ? '' : String(cell),
                    'aria-label': 'r' + (rowIndex + 1) + 'c' + (colIndex + 1),
                    onChange: function (event) {
                      props.onChange(rowIndex, colIndex, event.target.value);
                    },
                  });
                } else if (ML.isObj(cell) && typeof cell.result === 'string') {
                  content = cell.result;
                } else if (ML.isObj(cell) && typeof cell.latex === 'string') {
                  content = h(ML.Math, { tex: cell.latex });
                } else content = ML.safeString(cell, 300);
                return h('td', { key: colIndex }, content);
              }),
            );
          }),
        ),
      ),
      cols === 0 ? h(ML.Empty, null) : null,
    );
  };

  ML.MatrixEditor = function MatrixEditor(props) {
    const t = ML.useT();
    const matrix = ML.toArr(props.matrix);
    const minRows = props.minRows || 1;
    const maxRows = props.maxRows || 12;
    const minCols = props.minCols || 1;
    const maxCols = props.maxCols || 12;
    const rows = matrix.length;
    const cols = rows ? ML.toArr(matrix[0]).length : 0;
    const emit = function (next) {
      if (props.onChange) props.onChange(next);
    };
    const setCell = function (rowIndex, colIndex, value) {
      const next = matrix.map(function (row) { return row.slice(); });
      next[rowIndex][colIndex] = value;
      emit(next);
    };
    const addRow = function () {
      if (rows >= maxRows) return;
      const makeCell = props.newCell || function () { return '0'; };
      const next = matrix.map(function (row) { return row.slice(); });
      next.push(Array.from({ length: cols || 1 }, makeCell));
      emit(next);
    };
    const removeRow = function () {
      if (rows <= minRows) return;
      emit(matrix.slice(0, rows - 1).map(function (row) { return row.slice(); }));
    };
    const addCol = function () {
      if (cols >= maxCols) return;
      const makeCell = props.newCell || function () { return '0'; };
      emit(matrix.map(function (row) { return row.concat([makeCell()]); }));
    };
    const removeCol = function () {
      if (cols <= minCols) return;
      emit(matrix.map(function (row) { return row.slice(0, cols - 1); }));
    };
    return h(
      'div',
      { className: 'ml-matrix-editor' },
      h(
        'div',
        { className: 'ml-matrix-editor-hd' },
        h('span', { className: 'ml-matrix-dims' }, rows + ' × ' + cols),
        props.extra ? h('span', { className: 'ml-hint' }, props.extra) : null,
        h(
          'div',
          { className: 'ml-matrix-btns' },
          h(ML.Btn, { size: 'sm', onClick: addRow, disabled: rows >= maxRows }, '+ ' + t('common.add') + ' 行'),
          h(ML.Btn, { size: 'sm', onClick: removeRow, disabled: rows <= minRows }, '− 行'),
          h(ML.Btn, { size: 'sm', onClick: addCol, disabled: cols >= maxCols }, '+ 列'),
          h(ML.Btn, { size: 'sm', onClick: removeCol, disabled: cols <= minCols }, '− 列'),
        ),
      ),
      h(
        'div',
        { className: 'ml-matrix-grid', style: { gridTemplateColumns: 'repeat(' + Math.max(cols, 1) + ', minmax(64px, 1fr))' } },
        matrix.map(function (row, rowIndex) {
          return ML.toArr(row).map(function (cell, colIndex) {
            return h('input', {
              key: rowIndex + ':' + colIndex,
              className: 'ml-matrix-input',
              value: cell === undefined || cell === null ? '' : String(cell),
              spellCheck: false,
              'aria-label': (props.ariaLabel || 'matrix') + ' row ' + (rowIndex + 1) + ' column ' + (colIndex + 1),
              onChange: function (event) {
                setCell(rowIndex, colIndex, event.target.value);
              },
            });
          });
        }),
      ),
    );
  };

  ML.Stat = function Stat(props) {
    return h(
      'div',
      { className: 'ml-stat' },
      h('div', { className: 'ml-stat-label' }, props.label),
      h('div', { className: 'ml-stat-value' + (props.mono ? ' ml-mono' : '') }, props.value),
      props.sub ? h('div', { className: 'ml-stat-sub' }, props.sub) : null,
    );
  };

  ML.LabeledTable = function LabeledTable(props) {
    const rowLabels = ML.toArr(props.rowLabels);
    const colLabels = ML.toArr(props.colLabels);
    const cells = ML.toArr(props.cells);
    if (cells.length === 0) return h(ML.Empty, null);
    return h(
      'div',
      { className: 'ml-tbl-wrap' + (props.className ? ' ' + props.className : '') },
      h(
        'table',
        { className: 'ml-table ml-table-labelled' },
        colLabels.length
          ? h(
              'thead',
              null,
              h(
                'tr',
                null,
                h('th', { className: 'ml-th-corner', scope: 'col' }, props.corner || '·'),
                colLabels.map(function (label, index) {
                  return h('th', { key: index, scope: 'col' }, String(label));
                }),
              ),
            )
          : null,
        h(
          'tbody',
          null,
          cells.map(function (row, rowIndex) {
            return h(
              'tr',
              { key: rowIndex },
              rowLabels.length
                ? h('th', { scope: 'row', className: 'ml-th-row' }, String(rowLabels[rowIndex] === undefined ? '' : rowLabels[rowIndex]))
                : null,
              ML.toArr(row).map(function (cell, colIndex) {
                if (React.isValidElement(cell)) return h('td', { key: colIndex }, cell);
                return h(
                  'td',
                  {
                    key: colIndex,
                    className: props.cellClass ? props.cellClass(cell, rowIndex, colIndex) : undefined,
                    title: ML.isObj(cell) ? ML.safeString(cell.raw, 200) : undefined,
                  },
                  ML.safeString(cell, 300),
                );
              }),
            );
          }),
        ),
      ),
    );
  };

  ML.ExprResult = function ExprResult(props) {
    const t = ML.useT();
    const data = props.data;
    const expr = ML.pickExpr(data);
    if (!expr) return h(ML.DataView, { data: data, t: t });
    const latex = ML.exprLatex(expr);
    const pretty = typeof expr.pretty === 'string' ? expr.pretty : '';
    const inputLatex = typeof expr.input_latex === 'string' ? expr.input_latex : '';
    const approx = expr.approx === undefined || expr.approx === null ? '' : String(expr.approx);
    const notes = ML.toArr(expr.notes);
    const resultText = expr.result === undefined || expr.result === null ? '' : ML.safeString(expr.result);
    return h(
      'div',
      { className: 'ml-result' },
      props.title ? h('div', { className: 'ml-result-title' }, props.title) : null,
      inputLatex
        ? h(
            'div',
            { className: 'ml-result-input' },
            h('span', { className: 'ml-result-caption' }, props.inputLabel || t('common.input')),
            h(ML.Math, { tex: inputLatex, display: true }),
          )
        : null,
      h(ML.FormulaBlock, { tex: latex, label: props.outputLabel || t('common.result') }),
      pretty && pretty !== resultText
        ? h(
            'div',
            { className: 'ml-result-block' },
            h('div', { className: 'ml-result-caption' }, 'pretty'),
            h('pre', { className: 'ml-pre' }, pretty),
          )
        : null,
      resultText && resultText !== pretty && resultText !== latex
        ? h(
            'div',
            { className: 'ml-result-block' },
            h('div', { className: 'ml-result-caption' }, 'sympy'),
            h('pre', { className: 'ml-pre' }, resultText),
          )
        : null,
      approx
        ? h('div', { className: 'ml-result-block' }, h('div', { className: 'ml-result-caption' }, '≈'), h('code', null, approx))
        : null,
      h(ML.Notes, { notes: notes }),
      h(
        'div',
        { className: 'ml-result-actions' },
        latex ? h(ML.CopyBtn, { text: latex, label: t('common.copyLatex') }) : null,
        pretty || resultText ? h(ML.CopyBtn, { text: pretty || resultText, label: t('common.copyText') }) : null,
        h(ML.CopyBtn, { text: ML.prettyJSON(data), label: t('common.json') }),
      ),
      props.showRaw === false ? null : h(ML.RawJSON, { value: data }),
    );
  };

  ML.DataView = function DataView(props) {
    const data = props.data;
    if (data === undefined || data === null) return h(ML.Empty, null);
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return h('pre', { className: 'ml-pre' }, String(data));
    }
    if (ML.matrixLike(data)) {
      return h(ML.MatrixView, { matrix: data });
    }
    if (Array.isArray(data)) {
      return h(ML.JSONTree, { value: data });
    }
    return h(
      'div',
      { className: 'ml-data-view' },
      h(ML.JSONTree, { value: data }),
      h(ML.RawJSON, { value: data }),
    );
  };

  ML.Boundary = class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      return { error: error };
    }
    componentDidCatch(error, info) {
      if (typeof console !== 'undefined') console.error('[mathlab] tab crashed', error, info);
    }
    render() {
      if (this.state.error) {
        return h(
          'div',
          { className: 'ml-error ml-error-error', role: 'alert' },
          h('div', { className: 'ml-error-hd' }, h('strong', null, 'UI error'), h('code', { className: 'ml-error-code' }, 'render')),
          h('div', { className: 'ml-error-msg' }, String(this.state.error && this.state.error.message ? this.state.error.message : this.state.error)),
          h(
            ML.Btn,
            { size: 'sm', onClick: () => this.setState({ error: null }) },
            'Retry',
          ),
        );
      }
      return this.props.children;
    }
  };

  ML.AsyncState = function AsyncState(props) {
    const call = props.call;
    const t = ML.useT();
    if (call.loading) return h(ML.Loading, null);
    if (call.error) return h(ML.ErrorBox, { error: call.error, onRetry: props.onRetry });
    if (call.result !== null && call.result !== undefined) return props.children;
    if (props.idle) return h(ML.Empty, { label: t('common.noResult') });
    return null;
  };

  ML.engineLabel = function (engine, t) {
    const status = engine.status;
    if (status === 'ready') return t('engine.ready');
    if (status === 'down') return t('engine.down');
    if (status === 'idle') return t('engine.idle');
    return t('engine.starting');
  };
})();

(function () {
  'use strict';

  ML.s = function s(tag, attrs) {
    const children = Array.prototype.slice.call(arguments, 2);
    return h.apply(null, [tag, attrs].concat(children));
  };

  ML.scale = function (d0, d1, r0, r1) {
    const span = d1 - d0 || 1;
    return {
      map: function (value) {
        return r0 + ((value - d0) / span) * (r1 - r0);
      },
      invert: function (pixel) {
        return d0 + ((pixel - r0) / (r1 - r0 || 1)) * span;
      },
      domain: [d0, d1],
      range: [r0, r1],
    };
  };

  ML.niceRange = function (min, max) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = -1;
      max = 1;
    }
    if (min === max) {
      const delta = Math.abs(min) > 0 ? Math.abs(min) * 0.5 : 1;
      min -= delta;
      max += delta;
    }
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    return [min, max];
  };

  ML.niceStep = function (span, count) {
    const rough = span / Math.max(1, count || 6);
    const power = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1e-12))));
    const fraction = rough / power;
    let nice;
    if (fraction <= 1) nice = 1;
    else if (fraction <= 2) nice = 2;
    else if (fraction <= 5) nice = 5;
    else nice = 10;
    return nice * power;
  };

  ML.ticks = function (min, max, count) {
    const [lo, hi] = ML.niceRange(min, max);
    const step = ML.niceStep(hi - lo, count || 6);
    const first = Math.ceil(lo / step) * step;
    const values = [];
    for (let value = first; value <= hi + step * 1e-6 && values.length < 24; value += step) {
      values.push(Math.abs(value) < step * 1e-9 ? 0 : value);
    }
    return { min: lo, max: hi, step: step, values: values };
  };

  ML.pointPath = function (points) {
    if (!points || points.length === 0) return '';
    let d = '';
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      if (!point) continue;
      d += (index === 0 ? 'M' : 'L') + ML.fmtNum(point[0], 8) + ' ' + ML.fmtNum(point[1], 8);
    }
    return d;
  };

  ML.CURVE_COLORS = [
    'var(--ml-c1)',
    'var(--ml-c2)',
    'var(--ml-c3)',
    'var(--ml-c4)',
    'var(--ml-c5)',
    'var(--ml-c6)',
    'var(--ml-c7)',
    'var(--ml-c8)',
  ];

  ML.curveColor = function (index) {
    return ML.CURVE_COLORS[((index % ML.CURVE_COLORS.length) + ML.CURVE_COLORS.length) % ML.CURVE_COLORS.length];
  };

  const EXPORT_PROPS = [
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-dasharray',
    'stroke-linecap',
    'stroke-linejoin',
    'opacity',
    'font-size',
    'font-family',
    'font-weight',
    'font-style',
    'text-anchor',
    'dominant-baseline',
    'letter-spacing',
  ];

  ML.exportSvg = function (svgEl, filename) {
    try {
      const clone = svgEl.cloneNode(true);
      const originals = [svgEl].concat(Array.prototype.slice.call(svgEl.querySelectorAll('*')));
      const copies = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
      const computedSvg = window.getComputedStyle(svgEl);
      let bg = computedSvg.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        const parent = svgEl.parentElement;
        if (parent) bg = window.getComputedStyle(parent).backgroundColor;
      }
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = '#ffffff';
      for (let index = 0; index < Math.min(originals.length, copies.length); index += 1) {
        const style = window.getComputedStyle(originals[index]);
        const target = copies[index];
        for (const prop of EXPORT_PROPS) {
          const value = style.getPropertyValue(prop);
          if (!value) continue;
          try {
            target.style.setProperty(prop, value);
          } catch (error) {

          }
        }
      }
      const viewBox = (svgEl.getAttribute('viewBox') || '0 0 800 480').split(/\s+/);
      const width = Number(viewBox[2]) || 800;
      const height = Number(viewBox[3]) || 480;
      clone.setAttribute('width', String(width));
      clone.setAttribute('height', String(height));
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      clone.style.background = bg;
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', viewBox[0] || '0');
      bgRect.setAttribute('y', viewBox[1] || '0');
      bgRect.setAttribute('width', String(width));
      bgRect.setAttribute('height', String(height));
      bgRect.setAttribute('fill', bg);
      clone.insertBefore(bgRect, clone.firstChild);
      const text = new XMLSerializer().serializeToString(clone);
      const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + text], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || 'mathlab.svg';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4000);
      return true;
    } catch (error) {
      if (typeof console !== 'undefined') console.error('[mathlab] SVG export failed', error);
      return false;
    }
  };
})();

(function () {
  'use strict';

  ML.CSS = `/* MathLab panel styles — scoped under .ml-panel, all classes ml- prefixed. */
.ml-panel {
  --ml-fg: var(--dsw-alias-label-primary, #1f2328);
  --ml-fg2: var(--dsw-alias-label-secondary, #5b6470);
  --ml-bg: var(--dsw-alias-bg-base, #ffffff);
  --ml-l1: var(--dsw-alias-bg-layer-1, #f7f8fa);
  --ml-l2: var(--dsw-alias-bg-layer-2, #eef0f4);
  --ml-ov: var(--dsw-alias-bg-overlay, #ffffff);
  --ml-b1: var(--dsw-alias-border-l1, rgba(20, 24, 32, 0.10));
  --ml-b2: var(--dsw-alias-border-l2, rgba(20, 24, 32, 0.18));
  --ml-brand: var(--dsw-alias-brand-primary, #4d6bfe);
  --ml-err: var(--dsw-alias-state-error-primary, #cf3232);
  --ml-idle: var(--dsw-alias-state-idle-primary, #8b949e);
  --ml-ok: var(--dsw-alias-state-success-primary, #1a7f46);
  --ml-warn: var(--dsw-alias-state-warn-primary, #b45f06);
  --ml-hover: color-mix(in srgb, var(--dsw-alias-label-primary, #1f2328) 7%, transparent);
  --ml-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  --ml-ring: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, transparent);
  --ml-c1: var(--dsw-alias-brand-primary, #4d6bfe);
  --ml-c2: var(--dsw-alias-state-success-primary, #1a7f46);
  --ml-c3: var(--dsw-alias-state-warn-primary, #b45f06);
  --ml-c4: var(--dsw-alias-state-error-primary, #cf3232);
  --ml-c5: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 52%, var(--dsw-alias-state-success-primary, #1a7f46));
  --ml-c6: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, var(--dsw-alias-state-warn-primary, #b45f06));
  --ml-c7: color-mix(in srgb, var(--dsw-alias-state-success-primary, #1a7f46) 55%, var(--dsw-alias-state-warn-primary, #b45f06));
  --ml-c8: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 40%, var(--dsw-alias-state-idle-primary, #8b949e));
  --ml-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: var(--ml-bg);
  color: var(--ml-fg);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.ml-panel *, .ml-panel *::before, .ml-panel *::after { box-sizing: border-box; }
.ml-panel :focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe); outline-offset: 2px; border-radius: 6px; }
.ml-panel button { font: inherit; }
.ml-panel a { color: var(--ml-brand); text-decoration: none; }
.ml-panel a:hover { text-decoration: underline; }
.ml-panel ::selection { background: var(--ml-active); }
.ml-inner { max-width: 1100px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 44px) 44px; }

.ml-header { padding: 26px 0 0; }
.ml-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.ml-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ml-mark {
  width: 40px; height: 40px; flex: none; display: grid; place-items: center;
  border-radius: 12px; color: var(--ml-brand);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 28%, transparent);
}
.ml-hd-text { min-width: 0; }
.ml-title { margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: 0.1px; }
.ml-sub { margin: 2px 0 0; font-size: 13px; color: var(--ml-fg2); }
.ml-engine { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 4px; }
.ml-pill {
  display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px;
  border-radius: 999px; font-size: 12px; color: var(--ml-fg2);
  border: 0.5px solid var(--ml-b1); background: var(--ml-l1);
  white-space: nowrap;
}
.ml-pill[data-status="ready"] { color: var(--ml-ok); border-color: color-mix(in srgb, var(--ml-ok) 35%, transparent); background: color-mix(in srgb, var(--ml-ok) 9%, transparent); }
.ml-pill[data-status="down"] { color: var(--ml-err); border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); background: color-mix(in srgb, var(--ml-err) 8%, transparent); }
.ml-pill[data-status="starting"], .ml-pill[data-status="loading"] { color: var(--ml-warn); border-color: color-mix(in srgb, var(--ml-warn) 35%, transparent); background: color-mix(in srgb, var(--ml-warn) 9%, transparent); }
.ml-pill-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex: none; }
.ml-pill[data-status="starting"] .ml-pill-dot, .ml-pill[data-status="loading"] .ml-pill-dot { animation: ml-pulse 1.1s ease-in-out infinite; }
.ml-pill-sep { width: 1px; height: 12px; background: var(--ml-b2); }
@keyframes ml-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.ml-tabs {
  display: flex; gap: 2px; align-items: stretch; overflow-x: auto; scrollbar-width: thin;
  margin: 18px 0 0; border-bottom: 0.5px solid var(--ml-b1);
}
.ml-tab {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  padding: 8px 12px 10px; margin: 0; font-size: 13px; color: var(--ml-fg2);
  border-bottom: 2px solid transparent; white-space: nowrap; border-radius: 6px 6px 0 0;
  display: inline-flex; align-items: center; gap: 6px;
}
.ml-tab:hover { color: var(--ml-fg); background: var(--ml-hover); }
.ml-tab.is-active { color: var(--ml-fg); border-bottom-color: var(--ml-brand); font-weight: 500; }
.ml-tab:disabled { opacity: 0.45; cursor: default; }
.ml-tab-badge { font-size: 11px; color: var(--ml-fg2); background: var(--ml-l2); border-radius: 999px; padding: 0 6px; line-height: 16px; }
.ml-tabs-sm { margin: 0; border-bottom: 0; gap: 4px; background: var(--ml-l1); border: 0.5px solid var(--ml-b1); border-radius: 9px; padding: 3px; display: inline-flex; }
.ml-tabs-sm .ml-tab { border-bottom: 0; border-radius: 6px; padding: 3px 10px; }
.ml-tabs-sm .ml-tab.is-active { background: var(--ml-ov); color: var(--ml-fg); box-shadow: 0 0 0 0.5px var(--ml-b2); }
.ml-tabpanel { padding-top: 20px; }
.ml-tabpanel[hidden] { display: none !important; }

.ml-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; padding: 0 12px; border-radius: 8px; cursor: pointer;
  border: 0.5px solid var(--ml-b1); background: transparent; color: var(--ml-fg);
  font-size: 13px; line-height: 1; white-space: nowrap; transition: background 120ms ease, border-color 120ms ease;
}
.ml-btn:hover { background: var(--ml-hover); }
.ml-btn:disabled { opacity: 0.45; cursor: not-allowed; background: transparent; }
.ml-btn-primary {
  background: var(--dsw-alias-brand-primary, #4d6bfe); border-color: transparent; color: var(--dsw-alias-bg-base, #fff);
  font-weight: 500;
}
.ml-btn-primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 84%, var(--dsw-alias-label-primary, #000)); }
.ml-btn-primary:disabled { background: var(--ml-idle); }
.ml-btn-subtle { border-color: transparent; color: var(--ml-fg2); }
.ml-btn-subtle:hover { color: var(--ml-fg); }
.ml-btn-danger { color: var(--ml-err); border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); }
.ml-btn-sm { height: 26px; padding: 0 9px; font-size: 12px; border-radius: 7px; }
.ml-btn-md { height: 32px; }
.ml-copy-glyph { font-size: 12px; opacity: 0.75; }
.ml-btn[data-copied="ok"] { color: var(--ml-ok); }
.ml-btn[data-copied="fail"] { color: var(--ml-err); }

.ml-input, .ml-textarea, .ml-select {
  width: 100%; min-height: 32px; padding: 5px 9px; border-radius: 8px;
  border: 0.5px solid var(--ml-b2); background: var(--ml-ov); color: var(--ml-fg);
  font-size: 13px; font-family: inherit; line-height: 1.5;
}
.ml-input:hover, .ml-textarea:hover, .ml-select:hover { border-color: var(--ml-fg2); }
.ml-input:focus, .ml-textarea:focus, .ml-select:focus { outline: 2px solid var(--ml-ring); outline-offset: 0; border-color: var(--ml-brand); }
.ml-textarea { resize: vertical; min-height: 66px; font-family: var(--ml-mono); font-size: 12.5px; line-height: 1.55; }
.ml-textarea-mono, .ml-mono { font-family: var(--ml-mono); }
.ml-select { appearance: auto; cursor: pointer; }
.ml-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.ml-field-inline { flex-direction: row; align-items: center; gap: 8px; }
.ml-label { font-size: 12px; color: var(--ml-fg2); font-weight: 500; }
.ml-hint { font-size: 11.5px; color: var(--ml-fg2); line-height: 1.45; }
.ml-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.ml-form-grid-wide { grid-template-columns: 1fr; }
.ml-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ml-row-end { justify-content: flex-end; }
.ml-stack { display: flex; flex-direction: column; gap: 14px; }
.ml-stack-sm { display: flex; flex-direction: column; gap: 8px; }
.ml-grow { flex: 1 1 auto; min-width: 0; }
.ml-split { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.ml-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0 0; }
.ml-muted { color: var(--ml-fg2); }
.ml-small { font-size: 12px; }
.ml-center { text-align: center; }
.ml-nowrap { white-space: nowrap; }

.ml-card { border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-l1); overflow: hidden; }
.ml-card-hd { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 12px 16px 0; }
.ml-card-title { margin: 0; font-size: 14px; font-weight: 500; }
.ml-card-sub { margin: 0; font-size: 12px; color: var(--ml-fg2); }
.ml-card-actions { margin-left: auto; display: flex; gap: 6px; align-items: center; }
.ml-card-bd { padding: 12px 16px 16px; }
.ml-section-title { display: flex; align-items: baseline; gap: 10px; margin: 0 0 10px; }
.ml-h2 { margin: 0; font-size: 14px; font-weight: 500; }
.ml-formula { padding: 10px 4px; overflow-x: auto; }
.ml-formula-label, .ml-result-caption { font-size: 11px; letter-spacing: 0.06em; color: var(--ml-fg2); text-transform: uppercase; margin-bottom: 4px; }
.ml-math { display: inline-block; max-width: 100%; }
.ml-math-block { display: block; overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
.ml-math .katex { font-size: 1.06em; }
.ml-math-block .katex-display { margin: 0.2em 0; }
.ml-math[data-mathlab-math="fallback"] { font-family: var(--ml-mono); font-size: 12.5px; color: var(--ml-fg2); word-break: break-word; white-space: pre-wrap; }

.ml-badge { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 999px; font-size: 11px; border: 0.5px solid var(--ml-b1); background: var(--ml-l2); color: var(--ml-fg2); white-space: nowrap; }
.ml-badge-success { color: var(--ml-ok); border-color: color-mix(in srgb, var(--ml-ok) 35%, transparent); background: color-mix(in srgb, var(--ml-ok) 9%, transparent); }
.ml-badge-error { color: var(--ml-err); border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); background: color-mix(in srgb, var(--ml-err) 8%, transparent); }
.ml-badge-warn { color: var(--ml-warn); border-color: color-mix(in srgb, var(--ml-warn) 35%, transparent); background: color-mix(in srgb, var(--ml-warn) 9%, transparent); }
.ml-badge-brand { color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 35%, transparent); background: color-mix(in srgb, var(--ml-brand) 9%, transparent); }
.ml-banner { border-radius: 10px; padding: 10px 12px; font-size: 13px; border: 0.5px solid var(--ml-b1); background: var(--ml-l1); color: var(--ml-fg); }
.ml-banner-warn { border-color: color-mix(in srgb, var(--ml-warn) 35%, transparent); background: color-mix(in srgb, var(--ml-warn) 8%, transparent); }
.ml-banner-error { border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); background: color-mix(in srgb, var(--ml-err) 7%, transparent); }
.ml-banner-success { border-color: color-mix(in srgb, var(--ml-ok) 35%, transparent); background: color-mix(in srgb, var(--ml-ok) 8%, transparent); }
.ml-error { border: 0.5px solid color-mix(in srgb, var(--ml-err) 40%, transparent); background: color-mix(in srgb, var(--ml-err) 7%, transparent); border-radius: 10px; padding: 10px 12px; font-size: 13px; }
.ml-error-warn { border-color: color-mix(in srgb, var(--ml-warn) 40%, transparent); background: color-mix(in srgb, var(--ml-warn) 8%, transparent); }
.ml-error-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ml-error-hd .ml-btn { margin-left: auto; }
.ml-error-code { font-family: var(--ml-mono); font-size: 11px; padding: 0 5px; border-radius: 4px; background: var(--ml-l2); color: var(--ml-fg2); }
.ml-error-msg { margin-top: 4px; white-space: pre-wrap; word-break: break-word; font-family: var(--ml-mono); font-size: 12px; }
.ml-error-hint { margin-top: 4px; color: var(--ml-fg2); font-size: 12px; }
.ml-loading { display: flex; align-items: center; gap: 9px; padding: 18px 4px; color: var(--ml-fg2); font-size: 13px; }
.ml-spinner { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--ml-b2); border-top-color: var(--ml-brand); animation: ml-spin 0.8s linear infinite; flex: none; }
@keyframes ml-spin { to { transform: rotate(360deg); } }
.ml-empty { padding: 20px 4px; color: var(--ml-fg2); font-size: 13px; text-align: center; border: 0.5px dashed var(--ml-b2); border-radius: 10px; }
.ml-notes { margin-top: 10px; padding: 8px 10px; background: var(--ml-l2); border-radius: 8px; font-size: 12px; color: var(--ml-fg2); }
.ml-notes-hd { font-weight: 500; color: var(--ml-fg); margin-bottom: 2px; }
.ml-notes ul { margin: 0; padding-left: 18px; }

.ml-result { border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-l1); padding: 12px 16px 14px; }
.ml-result-title { font-weight: 500; font-size: 13px; margin-bottom: 6px; }
.ml-result-input { border-bottom: 0.5px dashed var(--ml-b2); padding-bottom: 6px; margin-bottom: 6px; }
.ml-result-block { margin-top: 8px; }
.ml-result-block code { font-family: var(--ml-mono); font-size: 12.5px; }
.ml-result-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.ml-data-view { display: flex; flex-direction: column; gap: 8px; }
.ml-pre { margin: 0; background: var(--ml-l2); border: 0.5px solid var(--ml-b1); border-radius: 8px; padding: 9px 11px; font-family: var(--ml-mono); font-size: 12.5px; line-height: 1.5; overflow: auto; max-height: 320px; white-space: pre-wrap; word-break: break-word; }
.ml-json-list { margin: 0; padding-left: 20px; }
.ml-json-obj { margin: 0; }
.ml-json-row { display: grid; grid-template-columns: minmax(70px, 160px) 1fr; gap: 8px; padding: 1px 0; }
.ml-json-row dt { color: var(--ml-fg2); font-family: var(--ml-mono); font-size: 12px; overflow-wrap: anywhere; }
.ml-json-row dd { margin: 0; min-width: 0; }
.ml-json-string { color: var(--ml-fg); font-family: var(--ml-mono); font-size: 12.5px; overflow-wrap: anywhere; }
.ml-json-atom { color: var(--ml-brand); font-family: var(--ml-mono); font-size: 12.5px; }
.ml-json-null { color: var(--ml-fg2); font-family: var(--ml-mono); font-size: 12.5px; }
.ml-json-index { color: var(--ml-fg2); font-family: var(--ml-mono); font-size: 11.5px; }
.ml-kv { margin: 0; display: flex; flex-direction: column; gap: 4px; }
.ml-kv-row { display: grid; grid-template-columns: minmax(96px, 200px) 1fr; gap: 10px; }
.ml-kv-row dt { color: var(--ml-fg2); font-size: 12px; }
.ml-kv-row dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.ml-collapse { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); overflow: hidden; margin-top: 8px; }
.ml-collapse > summary { cursor: pointer; padding: 8px 12px; font-size: 12.5px; color: var(--ml-fg2); display: flex; align-items: center; gap: 10px; user-select: none; }
.ml-collapse > summary:hover { background: var(--ml-hover); }
.ml-collapse > summary .ml-collapse-extra { margin-left: auto; font-size: 11.5px; }
.ml-collapse-bd { padding: 4px 12px 12px; }
.ml-raw > summary .ml-btn { margin-left: auto; }
.ml-stat { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); padding: 10px 12px; min-width: 92px; }
.ml-stat-label { font-size: 11.5px; color: var(--ml-fg2); }
.ml-stat-value { font-size: 19px; font-weight: 500; line-height: 1.35; }
.ml-stat-sub { font-size: 11.5px; color: var(--ml-fg2); }
.ml-stats { display: flex; gap: 10px; flex-wrap: wrap; }

.ml-tbl-wrap { overflow: auto; max-height: 460px; border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-ov); }
.ml-table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
.ml-table th, .ml-table td { border-bottom: 0.5px solid var(--ml-b1); border-right: 0.5px solid var(--ml-b1); padding: 5px 9px; text-align: left; vertical-align: top; }
.ml-table th { position: sticky; top: 0; z-index: 2; background: var(--ml-l2); font-weight: 500; color: var(--ml-fg2); white-space: nowrap; }
.ml-table tbody tr:hover td { background: var(--ml-hover); }
.ml-table .ml-th-row { position: sticky; left: 0; z-index: 1; background: var(--ml-l2); white-space: nowrap; }
.ml-table .ml-th-corner { left: 0; z-index: 3; }
.ml-table td:last-child, .ml-table th:last-child { border-right: 0; }
.ml-table tr:last-child td, .ml-table tr:last-child th { border-bottom: 0; }
.ml-tbl-scroll { overflow: auto; max-height: 460px; }
.ml-matrix-wrap { display: inline-block; max-width: 100%; overflow: auto; }
.ml-matrix-label { font-size: 11.5px; color: var(--ml-fg2); margin-bottom: 4px; }
.ml-matrix { border-collapse: collapse; font-family: var(--ml-mono); font-size: 12.5px; }
.ml-matrix td { padding: 4px 10px; text-align: right; border: 0; min-width: 34px; }
.ml-matrix-wrap { border-left: 2px solid var(--ml-fg2); border-right: 2px solid var(--ml-fg2); border-radius: 4px; padding: 2px 4px; }
.ml-matrix-sm .ml-matrix td { padding: 2px 7px; font-size: 12px; }
.ml-matrix-editor { display: flex; flex-direction: column; gap: 8px; }
.ml-matrix-editor-hd { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ml-matrix-dims { font-family: var(--ml-mono); font-size: 12px; color: var(--ml-fg2); }
.ml-matrix-btns { display: flex; gap: 4px; flex-wrap: wrap; margin-left: auto; }
.ml-matrix-grid { display: grid; gap: 4px; }
.ml-matrix-input { width: 100%; min-width: 0; height: 30px; padding: 3px 6px; border: 0.5px solid var(--ml-b2); border-radius: 6px; background: var(--ml-ov); color: var(--ml-fg); font-family: var(--ml-mono); font-size: 12px; text-align: center; }
.ml-matrix-input:focus { outline: 2px solid var(--ml-ring); border-color: var(--ml-brand); }
.ml-matrix-bracket { color: var(--ml-fg2); }

.ml-plot-wrap { position: relative; border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-bg); overflow: hidden; }
.ml-plot-svg { display: block; width: 100%; height: auto; touch-action: none; cursor: crosshair; }
.ml-plot-svg.is-dragging { cursor: grabbing; }
.ml-plot-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 10px; border-bottom: 0.5px solid var(--ml-b1); background: var(--ml-l1); }
.ml-plot-readout { margin-left: auto; font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-fg2); }
.ml-grid-line { stroke: var(--ml-b1); stroke-width: 0.6; }
.ml-grid-line-major { stroke: var(--ml-b2); stroke-width: 0.6; }
.ml-axis-line { stroke: var(--ml-fg2); stroke-width: 0.9; }
.ml-tick-label { fill: var(--ml-fg2); font-size: 10.5px; font-family: var(--ml-mono); }
.ml-axis-label { fill: var(--ml-fg2); font-size: 11.5px; }
.ml-curve { fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ml-plot-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; padding: 6px 10px 8px; font-size: 12px; color: var(--ml-fg2); }
.ml-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.ml-legend-swatch { width: 14px; height: 2.5px; border-radius: 2px; display: inline-block; }
.ml-point-dot { fill: var(--ml-brand); }
.ml-arrow-line { stroke: var(--ml-fg2); stroke-width: 1; }
.ml-quiver-arrow { stroke: var(--ml-fg2); stroke-width: 1.1; }
.ml-surface-edge { stroke: var(--ml-brand); stroke-width: 0.6; fill: none; }
.ml-3d-label { fill: var(--ml-fg2); font-size: 10.5px; font-family: var(--ml-mono); }
.ml-plot-hint { padding: 6px 10px; font-size: 11.5px; color: var(--ml-fg2); border-top: 0.5px solid var(--ml-b1); background: var(--ml-l1); }

.ml-diagram { width: 100%; border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-bg); overflow: hidden; }
.ml-diagram-svg { display: block; width: 100%; height: auto; }
.ml-dedge { fill: none; stroke: var(--ml-fg2); stroke-width: 1.2; }
.ml-dedge.is-highlight { stroke: var(--ml-brand); stroke-width: 2; }
.ml-dedge.is-dim { opacity: 0.28; }
.ml-dlabel { fill: var(--ml-fg); font-size: 12px; font-family: var(--ml-mono); paint-order: stroke; stroke: var(--ml-bg); stroke-width: 3px; stroke-linejoin: round; }
.ml-dlabel.is-highlight { fill: var(--ml-brand); font-weight: 600; }
.ml-dnode circle, .ml-dnode ellipse, .ml-dnode rect { fill: var(--ml-l1); stroke: var(--ml-b2); stroke-width: 1.1; }
.ml-dnode text { fill: var(--ml-fg); font-size: 13px; font-weight: 500; font-family: var(--ml-mono); }
.ml-dnode.is-hover circle, .ml-dnode.is-hover rect { stroke: var(--ml-brand); stroke-width: 2; fill: var(--ml-active); }
.ml-dnode.is-normal circle, .ml-dnode.is-normal rect { stroke: var(--ml-brand); }
.ml-diagram-legend { display: flex; gap: 14px; flex-wrap: wrap; padding: 8px 12px; font-size: 11.5px; color: var(--ml-fg2); border-top: 0.5px solid var(--ml-b1); background: var(--ml-l1); }
.ml-hasse-node text { font-family: var(--ml-mono); }
.ml-hasse-node circle { fill: var(--ml-ov); stroke: var(--ml-fg2); stroke-width: 1.1; }
.ml-hasse-node.is-normal circle { stroke: var(--ml-brand); stroke-width: 2; fill: var(--ml-active); }
.ml-hasse-edge { stroke: var(--ml-fg2); stroke-width: 1; fill: none; }
.ml-hasse-label { fill: var(--ml-fg2); font-size: 10.5px; font-family: var(--ml-mono); }
.ml-cell-hl { background: var(--ml-active) !important; color: var(--ml-fg); font-weight: 500; }

.ml-fitch { position: relative; border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-ov); padding: 10px 4px 10px 0; overflow: auto; max-height: 560px; font-family: var(--ml-mono); font-size: 12.5px; }
.ml-fitch-bars { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.ml-fitch-bar { position: absolute; width: 1.5px; background: var(--ml-b2); border-radius: 1px; }
.ml-fitch-line { position: relative; display: flex; align-items: baseline; gap: 8px; height: 26px; line-height: 26px; padding-right: 12px; white-space: nowrap; }
.ml-fitch-line:hover { background: var(--ml-hover); }
.ml-fitch-no { width: 34px; text-align: right; color: var(--ml-fg2); font-size: 11.5px; flex: none; }
.ml-fitch-body { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ml-fitch-rule { color: var(--ml-fg2); font-size: 11.5px; flex: none; margin-left: 12px; }
.ml-fitch-refs { color: var(--ml-fg2); font-size: 11px; flex: none; }
.ml-fitch-line.is-conclusion .ml-fitch-body { font-weight: 600; }
.ml-proof-tree { font-family: var(--ml-mono); font-size: 12.5px; overflow: auto; max-height: 560px; padding: 6px 2px; }
.ml-proof-tree ul { list-style: none; margin: 0; padding-left: 22px; border-left: 0.5px solid var(--ml-b2); }
.ml-proof-tree > ul { padding-left: 0; border-left: 0; }
.ml-proof-tree li { padding: 2px 0; }
.ml-proof-rule { color: var(--ml-brand); font-size: 11.5px; margin-left: 8px; }
.ml-proof-discharged { color: var(--ml-fg2); font-size: 11px; margin-left: 8px; }
.ml-tt-t { color: var(--ml-ok); font-weight: 600; }
.ml-tt-f { color: var(--ml-err); }
.ml-tt-result { background: var(--ml-active) !important; }

.ml-sym-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 12px; }
.ml-chip-row { display: flex; gap: 6px; flex-wrap: wrap; }
.ml-chip { appearance: none; cursor: pointer; border: 0.5px solid var(--ml-b1); background: var(--ml-l1); color: var(--ml-fg2); border-radius: 999px; height: 26px; padding: 0 11px; font-size: 12px; }
.ml-chip:hover { background: var(--ml-hover); color: var(--ml-fg); }
.ml-chip.is-active { background: var(--ml-active); color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 40%, transparent); font-weight: 500; }
.ml-sym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
.ml-sym-card { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.ml-sym-glyph { font-size: 22px; line-height: 1.25; color: var(--ml-fg); overflow-x: auto; }
.ml-sym-name { font-size: 13px; font-weight: 500; }
.ml-sym-name-alt { font-size: 11.5px; color: var(--ml-fg2); }
.ml-sym-code { font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-fg2); word-break: break-all; background: var(--ml-l2); border-radius: 5px; padding: 1px 5px; }
.ml-sym-desc { font-size: 12px; color: var(--ml-fg2); }
.ml-sym-actions { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
.ml-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border: 0.5px solid var(--ml-b2); border-radius: 6px; background: var(--ml-ov); font-family: var(--ml-mono); font-size: 13px; cursor: pointer; }
.ml-kbd:hover { background: var(--ml-hover); border-color: var(--ml-brand); color: var(--ml-brand); }
.ml-example-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 10px; }
.ml-example { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); padding: 11px 13px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ml-example-hd { display: flex; align-items: baseline; gap: 8px; }
.ml-example-title { font-size: 13px; font-weight: 500; }
.ml-example-desc { font-size: 12px; color: var(--ml-fg2); flex: 1; }
.ml-example-actions { display: flex; gap: 6px; align-items: center; }
.ml-about { margin-top: 34px; padding: 14px 0 0; border-top: 0.5px solid var(--ml-b1); font-size: 11.5px; color: var(--ml-fg2); display: flex; gap: 8px 20px; flex-wrap: wrap; }
.ml-about-sep { opacity: 0.5; }

.ml-scroll-x { overflow-x: auto; max-width: 100%; }
.ml-divider { height: 0.5px; background: var(--ml-b1); margin: 16px 0; border: 0; }
.ml-list { margin: 0; padding-left: 18px; font-size: 13px; }
.ml-list li { margin: 2px 0; }
.ml-li-code { font-family: var(--ml-mono); font-size: 12px; }
.ml-sep { color: var(--ml-fg2); opacity: 0.6; padding: 0 4px; }
.ml-hidden { display: none !important; }
.ml-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ml-wrap-anywhere { overflow-wrap: anywhere; }
.ml-vscroll { max-height: 360px; overflow: auto; }

@media (max-width: 820px) {
  .ml-split { grid-template-columns: 1fr; }
  .ml-json-row { grid-template-columns: 1fr; gap: 0; }
  .ml-kv-row { grid-template-columns: 1fr; gap: 0; }
}
@media (max-width: 560px) {
  .ml-inner { padding-left: 14px; padding-right: 14px; }
  .ml-title { font-size: 18px; }
  .ml-tab { padding: 7px 9px 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .ml-spinner, .ml-pill[data-status="starting"] .ml-pill-dot { animation: none; }
}
`;

  ML.installStyles = function (ctx) {
    const doc = typeof document === 'undefined' ? null : document;
    if (!doc || !doc.head) return null;
    const existing = doc.querySelector('style[data-mathlab-css]');
    if (existing) return existing;
    const style = doc.createElement('style');
    style.setAttribute('data-mathlab-css', '');
    style.textContent = ML.CSS;
    doc.head.appendChild(style);
    if (ctx && typeof ctx.effect === 'function') {
      ctx.effect(
        function () {
          return function () {
            try {
              style.remove();
            } catch (error) {

            }
          };
        },
        'mathlab: styles',
      );
    }
    return style;
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;

  const VIEW_W = 800;
  const MARGIN = { left: 56, right: 18, top: 16, bottom: 38 };

  function pointsBounds(segments, arrows) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const segment of ML.toArr(segments)) {
      for (const point of ML.toArr(segment.points)) {
        const x = Number(point && point[0]);
        const y = Number(point && point[1]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    for (const arrow of ML.toArr(arrows)) {
      const x = Number(arrow[0]);
      const y = Number(arrow[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (!Number.isFinite(minX)) return null;
    return { x: [minX, maxX], y: [minY, maxY] };
  }

  function padRange(range, factor) {
    const span = range[1] - range[0] || 1;
    const pad = span * (factor === undefined ? 0.04 : factor);
    return [range[0] - pad, range[1] + pad];
  }

  ML.Plot2D = function Plot2D(props) {
    const t = ML.useT();
    const svgRef = useRef(null);
    const wrapRef = useRef(null);
    const viewRef = useRef(null);
    const dragRef = useRef(null);
    const height = props.height || 460;
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const plotW = VIEW_W - MARGIN.left - MARGIN.right;

    const segments = ML.toArr(props.segments);
    const arrows = ML.toArr(props.arrows);
    const markers = ML.toArr(props.markers);

    const auto = useMemo(function () {
      return pointsBounds(segments, arrows);
    }, [segments, arrows]);

    const computeInitial = useMemo(function () {
      return function () {
        const bounds = auto;
        let x0;
        let x1;
        let y0;
        let y1;
        if (props.xRange && props.xRange.length === 2 && isFinite(props.xRange[0]) && isFinite(props.xRange[1])) {
          x0 = Number(props.xRange[0]);
          x1 = Number(props.xRange[1]);
        } else if (bounds) {
          [x0, x1] = padRange(bounds.x);
        } else {
          x0 = -5;
          x1 = 5;
        }
        if (props.yRange && props.yRange.length === 2 && isFinite(props.yRange[0]) && isFinite(props.yRange[1])) {
          y0 = Number(props.yRange[0]);
          y1 = Number(props.yRange[1]);
        } else if (bounds) {
          [y0, y1] = padRange(bounds.y);
        } else {
          y0 = -3;
          y1 = 3;
        }
        if (!(x1 > x0)) x1 = x0 + 1;
        if (!(y1 > y0)) y1 = y0 + 1;
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
      };
    }, [auto, props.xRange, props.yRange]);
    const computeInitialRef = useRef(computeInitial);
    computeInitialRef.current = computeInitial;
    const initialRef = useRef(null);

    const resetSig = useMemo(function () {
      if (props.resetKey !== undefined && props.resetKey !== null) return 'k' + String(props.resetKey);
      return (
        JSON.stringify(props.xRange || null) +
        '|' +
        JSON.stringify(props.yRange || null) +
        '|' +
        segments.length +
        '|' +
        arrows.length
      );
    }, [props.resetKey, props.xRange, props.yRange, segments.length, arrows.length]);

    const [view, setView] = useState(function () {
      const start = computeInitial();
      initialRef.current = start;
      return start;
    });
    viewRef.current = view;
    const [hover, setHover] = useState(null);
    const [dragging, setDragging] = useState(false);

    useEffect(
      function () {
        const next = computeInitialRef.current();
        initialRef.current = next;
        setView(next);
      },
      [resetSig],
    );

    const xScale = ML.scale(view.x0, view.x1, MARGIN.left, MARGIN.left + plotW);
    const yScale = ML.scale(view.y0, view.y1, MARGIN.top + plotH, MARGIN.top);
    const xTicks = ML.ticks(view.x0, view.x1, 8);
    const yTicks = ML.ticks(view.y0, view.y1, 6);

    useEffect(
      function () {
        const node = svgRef.current;
        if (!node) return undefined;
        const onWheel = function (event) {
          event.preventDefault();
          const rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const scale = VIEW_W / rect.width;
          const px = (event.clientX - rect.left) * scale;
          const py = (event.clientY - rect.top) * scale;
          const current = viewRef.current;
          const base = initialRef.current || current;
          const cursorX = current.x0 + ((px - MARGIN.left) / plotW) * (current.x1 - current.x0);
          const cursorY = current.y1 - ((py - MARGIN.top) / plotH) * (current.y1 - current.y0);
          const factor = event.deltaY < 0 ? 0.86 : 1.163;
          const baseSpanX = base.x1 - base.x0 || 1;
          const baseSpanY = base.y1 - base.y0 || 1;
          const currentSpanX = current.x1 - current.x0 || 1;
          const currentSpanY = current.y1 - current.y0 || 1;
          const nextSpanX = ML.clamp(currentSpanX * factor, baseSpanX * 1e-4, baseSpanX * 1e4);
          const nextSpanY = ML.clamp(currentSpanY * factor, baseSpanY * 1e-4, baseSpanY * 1e4);
          const ratioX = nextSpanX / currentSpanX;
          const ratioY = nextSpanY / currentSpanY;
          setView({
            x0: cursorX - (cursorX - current.x0) * ratioX,
            x1: cursorX + (current.x1 - cursorX) * ratioX,
            y0: cursorY - (cursorY - current.y0) * ratioY,
            y1: cursorY + (current.y1 - cursorY) * ratioY,
          });
        };
        node.addEventListener('wheel', onWheel, { passive: false });
        return function () {
          node.removeEventListener('wheel', onWheel);
        };
      },
      [height, plotW, plotH],
    );

    const toSvgPoint = function (event) {
      const node = svgRef.current;
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const scale = VIEW_W / rect.width;
      return {
        px: (event.clientX - rect.left) * scale,
        py: (event.clientY - rect.top) * scale,
      };
    };

    const onPointerDown = function (event) {
      if (event.button !== 0) return;
      const point = toSvgPoint(event);
      if (!point) return;
      dragRef.current = {
        startPx: point.px,
        startPy: point.py,
        view: Object.assign({}, viewRef.current),
        moved: false,
      };
      setDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch (error) {

      }
    };

    const onPointerMove = function (event) {
      const point = toSvgPoint(event);
      if (point) {
        setHover({ x: xScale.invert(point.px), y: yScale.invert(point.py) });
      }
      const drag = dragRef.current;
      if (!drag || !point) return;
      const dx = point.px - drag.startPx;
      const dy = point.py - drag.startPy;
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      const spanX = drag.view.x1 - drag.view.x0;
      const spanY = drag.view.y1 - drag.view.y0;
      const worldDx = (dx / plotW) * spanX;
      const worldDy = (dy / plotH) * spanY;
      setView({
        x0: drag.view.x0 - worldDx,
        x1: drag.view.x1 - worldDx,
        y0: drag.view.y0 + worldDy,
        y1: drag.view.y1 + worldDy,
      });
    };

    const endDrag = function (event) {
      dragRef.current = null;
      setDragging(false);
      try {
        if (event && event.currentTarget && event.currentTarget.releasePointerCapture) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch (error) {

      }
    };

    const resetView = function () {
      setView(initialRef.current || computeInitialRef.current());
    };

    const download = function () {
      if (svgRef.current) ML.exportSvg(svgRef.current, props.filename || 'mathlab-plot.svg');
    };

    const clipId = useMemo(function () {
      return ML.uid('clip');
    }, []);
    const legendItems = useMemo(function () {
      const seen = [];
      for (const segment of segments) {
        if (segment && segment.label && seen.indexOf(segment.label) < 0) {
          seen.push(segment.label);
        }
      }
      return seen;
    }, [segments]);

    const axisX = view.y0 <= 0 && view.y1 >= 0 ? yScale.map(0) : MARGIN.top + plotH;
    const axisY = view.x0 <= 0 && view.x1 >= 0 ? xScale.map(0) : MARGIN.left;
    const plotLeft = MARGIN.left;
    const plotRight = MARGIN.left + plotW;
    const plotTop = MARGIN.top;
    const plotBottom = MARGIN.top + plotH;
    const arrowLen = 6;

    const empty = segments.length === 0 && arrows.length === 0 && markers.length === 0;

    return h(
      'div',
      { className: 'ml-plot-wrap', ref: wrapRef },
      h(
        'div',
        { className: 'ml-plot-toolbar' },
        h(ML.Btn, { size: 'sm', variant: 'ghost', onClick: resetView, disabled: empty }, '⤢ ' + t('common.reset')),
        h(ML.Btn, { size: 'sm', variant: 'ghost', onClick: download, disabled: empty }, '⤓ SVG'),
        props.extraControls || null,
        h(
          'span',
          { className: 'ml-plot-readout' },
          hover && !empty
            ? 'x = ' + ML.fmtNum(hover.x, 5) + '   y = ' + ML.fmtNum(hover.y, 5)
            : props.hint || '×',
        ),
      ),
      empty
        ? h('div', { className: 'ml-empty' }, props.emptyLabel || t('common.noResult'))
        : h(
            'svg',
            {
              ref: svgRef,
              className: 'ml-plot-svg' + (dragging ? ' is-dragging' : ''),
              viewBox: '0 0 ' + VIEW_W + ' ' + height,
              role: 'img',
              'aria-label': props.ariaLabel || props.title || 'plot',
              onPointerDown: onPointerDown,
              onPointerMove: onPointerMove,
              onPointerUp: endDrag,
              onPointerCancel: endDrag,
              onPointerLeave: function () {
                setHover(null);
                endDrag();
              },
              onDoubleClick: resetView,
            },
            h(
              'defs',
              null,
              h(
                'clipPath',
                { id: clipId },
                h('rect', { x: plotLeft, y: plotTop, width: plotW, height: plotH }),
              ),
              h(
                'marker',
                {
                  id: clipId + '-arrow',
                  markerWidth: 7,
                  markerHeight: 7,
                  refX: 6,
                  refY: 3,
                  orient: 'auto',
                  markerUnits: 'userSpaceOnUse',
                },
                h('path', { d: 'M0,0 L6,3 L0,6 Z', fill: 'var(--ml-fg2)' }),
              ),
            ),
            h(
              'g',
              { 'aria-hidden': 'true' },

              xTicks.values.map(function (value, index) {
                const x = xScale.map(value);
                if (x < plotLeft - 0.5 || x > plotRight + 0.5) return null;
                const major = Math.abs(value) < 1e-9;
                return h('line', {
                  key: 'gx' + index,
                  x1: x,
                  x2: x,
                  y1: plotTop,
                  y2: plotBottom,
                  className: major ? 'ml-grid-line-major' : 'ml-grid-line',
                });
              }),
              yTicks.values.map(function (value, index) {
                const y = yScale.map(value);
                if (y < plotTop - 0.5 || y > plotBottom + 0.5) return null;
                const major = Math.abs(value) < 1e-9;
                return h('line', {
                  key: 'gy' + index,
                  x1: plotLeft,
                  x2: plotRight,
                  y1: y,
                  y2: y,
                  className: major ? 'ml-grid-line-major' : 'ml-grid-line',
                });
              }),

              h('line', { x1: plotLeft, x2: plotRight, y1: axisX, y2: axisX, className: 'ml-axis-line' }),
              h('line', { x1: axisY, x2: axisY, y1: plotTop, y2: plotBottom, className: 'ml-axis-line' }),

              xTicks.values.map(function (value, index) {
                const x = xScale.map(value);
                if (x < plotLeft - 2 || x > plotRight + 2) return null;
                return h(
                  'text',
                  {
                    key: 'tx' + index,
                    x: x,
                    y: plotBottom + 15,
                    className: 'ml-tick-label',
                    textAnchor: 'middle',
                  },
                  ML.fmtNum(value, 4),
                );
              }),
              yTicks.values.map(function (value, index) {
                const y = yScale.map(value);
                if (y < plotTop - 2 || y > plotBottom + 2) return null;
                return h(
                  'text',
                  {
                    key: 'ty' + index,
                    x: plotLeft - 7,
                    y: y + 3.5,
                    className: 'ml-tick-label',
                    textAnchor: 'end',
                  },
                  ML.fmtNum(value, 4),
                );
              }),

              props.xLabel
                ? h(
                    'text',
                    {
                      x: plotRight - 2,
                      y: plotBottom + 30,
                      className: 'ml-axis-label',
                      textAnchor: 'end',
                    },
                    props.xLabel,
                  )
                : null,
              props.yLabel
                ? h(
                    'text',
                    {
                      x: plotLeft - 40,
                      y: plotTop + 2,
                      className: 'ml-axis-label',
                      textAnchor: 'start',
                    },
                    props.yLabel,
                  )
                : null,

              h(
                'g',
                { clipPath: 'url(#' + clipId + ')' },
                segments.map(function (segment, index) {
                  const points = ML.toArr(segment.points)
                    .map(function (point) {
                      const x = Number(point && point[0]);
                      const y = Number(point && point[1]);
                      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
                      return [xScale.map(x), yScale.map(y)];
                    })
                    .filter(Boolean);
                  if (points.length === 0) return null;
                  const d = ML.pointPath(points);
                  const color = segment.color || ML.curveColor(segment.colorIndex === undefined ? index : segment.colorIndex);
                  if (segment.type === 'dots') {
                    return h(
                      'g',
                      { key: 'seg' + index },
                      points.map(function (point, pointIndex) {
                        return h('circle', {
                          key: pointIndex,
                          cx: point[0],
                          cy: point[1],
                          r: segment.radius || 2,
                          fill: color,
                        });
                      }),
                    );
                  }
                  return h('path', {
                    key: 'seg' + index,
                    d: d,
                    className: 'ml-curve',
                    style: { stroke: color },
                    strokeDasharray: segment.dashed ? '5 4' : undefined,
                  });
                }),
                markers.map(function (marker, index) {
                  const x = xScale.map(Number(marker[0]));
                  const y = yScale.map(Number(marker[1]));
                  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
                  return h('circle', {
                    key: 'marker' + index,
                    cx: x,
                    cy: y,
                    r: 4,
                    fill: 'var(--ml-brand)',
                    stroke: 'var(--ml-bg)',
                    strokeWidth: 1.5,
                  });
                }),
              ),

              h(
                'g',
                { clipPath: 'url(#' + clipId + ')' },
                arrows.map(function (arrow, index) {
                  const x = Number(arrow[0]);
                  const y = Number(arrow[1]);
                  const dx = Number(arrow[2]);
                  const dy = Number(arrow[3]);
                  if (![x, y, dx, dy].every(Number.isFinite)) return null;
                  const x1 = xScale.map(x);
                  const y1 = yScale.map(y);
                  const x2 = xScale.map(x + dx);
                  const y2 = yScale.map(y + dy);
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  const tipX = x2 - Math.cos(angle) * 0.5 * arrowLen;
                  const tipY = y2 - Math.sin(angle) * 0.5 * arrowLen;
                  return h(
                    'g',
                    { key: 'arrow' + index },
                    h('line', {
                      x1: x1,
                      y1: y1,
                      x2: tipX,
                      y2: tipY,
                      className: 'ml-quiver-arrow',
                    }),
                    h('path', {
                      d:
                        'M' +
                        x2 +
                        ',' +
                        y2 +
                        ' L' +
                        (x2 - arrowLen * Math.cos(angle - 0.42)) +
                        ',' +
                        (y2 - arrowLen * Math.sin(angle - 0.42)) +
                        ' L' +
                        (x2 - arrowLen * Math.cos(angle + 0.42)) +
                        ',' +
                        (y2 - arrowLen * Math.sin(angle + 0.42)) +
                        ' Z',
                      fill: 'var(--ml-fg2)',
                    }),
                  );
                }),
              ),

              legendItems.length
                ? h(
                    'g',
                    null,
                    (function () {
                      const shown = legendItems.slice(0, 8);
                      const boxW = Math.min(220, Math.max.apply(null, shown.map(function (label) { return String(label).length * 6.4 + 34; }).concat([80])));
                      const boxX = plotRight - boxW - 6;
                      const boxY = plotTop + 6;
                      const boxH = shown.length * 16 + 10;
                      return h(
                        'g',
                        null,
                        h('rect', {
                          x: boxX,
                          y: boxY,
                          width: boxW,
                          height: boxH,
                          rx: 6,
                          fill: 'var(--ml-bg)',
                          stroke: 'var(--ml-b1)',
                          opacity: 0.92,
                        }),
                        shown.map(function (label, index) {
                          const color = ML.curveColor(index);
                          return h(
                            'g',
                            { key: 'lg' + index },
                            h('line', {
                              x1: boxX + 10,
                              x2: boxX + 24,
                              y1: boxY + 13 + index * 16,
                              y2: boxY + 13 + index * 16,
                              stroke: color,
                              strokeWidth: 2,
                            }),
                            h(
                              'text',
                              {
                                x: boxX + 29,
                                y: boxY + 16.5 + index * 16,
                                className: 'ml-tick-label',
                                style: { fill: 'var(--ml-fg)' },
                              },
                              ML.safeString(label, 26),
                            ),
                          );
                        }),
                      );
                    })(),
                  )
                : null,
            ),
          ),
      legendItems.length
        ? h(
            'div',
            { className: 'ml-plot-legend' },
            legendItems.map(function (label, index) {
              return h(
                'span',
                { className: 'ml-legend-item', key: index },
                h('span', { className: 'ml-legend-swatch', style: { background: ML.curveColor(index) } }),
                h('span', null, label),
              );
            }),
          )
        : null,
      h('div', { className: 'ml-plot-hint' }, props.hint || '滚轮缩放 · 拖拽平移 · 双击重置'),
    );
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useMemo = React.useMemo;

  const VIEW_W = 800;
  const VIEW_H = 480;

  function buildEdges(vertices, indices) {
    const edges = [];
    const seen = new Set();
    const addEdge = function (a, b) {
      if (!Number.isInteger(a) || !Number.isInteger(b) || a === b) return;
      if (a < 0 || b < 0 || a >= vertices.length || b >= vertices.length) return;
      const key = a < b ? a + ':' + b : b + ':' + a;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push([a, b]);
    };
    const triangles = ML.toArr(indices);
    if (triangles.length > 0) {
      for (const face of triangles) {
        const tri = ML.toArr(face);
        if (tri.length >= 3) {
          addEdge(tri[0], tri[1]);
          addEdge(tri[1], tri[2]);
          addEdge(tri[2], tri[0]);
        }
      }
    } else {
      return null;
    }
    return edges;
  }

  ML.Surface3D = function Surface3D(props) {
    const t = ML.useT();
    const svgRef = useRef(null);
    const dragRef = useRef(null);
    const [yaw, setYaw] = useState(0.72);
    const [pitch, setPitch] = useState(0.52);
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);

    const vertices = ML.toArr(props.vertices).filter(function (vertex) {
      return Array.isArray(vertex) && vertex.length >= 3;
    });
    const edges = useMemo(function () {
      return buildEdges(vertices, props.indices) || [];
    }, [vertices, props.indices]);

    const shape = useMemo(
      function () {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        for (const vertex of vertices) {
          const x = Number(vertex[0]);
          const y = Number(vertex[1]);
          const z = Number(vertex[2]);
          if (![x, y, z].every(Number.isFinite)) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }
        if (!Number.isFinite(minX)) {
          return { center: [0, 0, 0], extent: 2, zRange: [-1, 1], box: null };
        }
        const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
        const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1e-6);
        return {
          center: center,
          extent: extent,
          zRange: [minZ, maxZ],
          box: [minX, maxX, minY, maxY, minZ, maxZ],
        };
      },
      [vertices],
    );

    const scale = (Math.min(VIEW_W, VIEW_H) * 0.42 * zoom) / shape.extent;

    const project = function (vertex) {
      const x = Number(vertex[0]) - shape.center[0];
      const y = Number(vertex[1]) - shape.center[1];
      const z = Number(vertex[2]) - shape.center[2];
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const x1 = x * cy - y * sy;
      const y1 = x * sy + y * cy;
      const y2 = y1 * cp - z * sp;
      const z2 = y1 * sp + z * cp;
      return {
        x: VIEW_W / 2 + x1 * scale,
        y: VIEW_H / 2 - z2 * scale,
        depth: y2,
      };
    };

    const projected = useMemo(function () {
      return vertices.map(project);
    }, [vertices, yaw, pitch, zoom, shape.extent]);

    const projectedEdges = useMemo(
      function () {
        const list = [];
        for (const [a, b] of edges) {
          const pa = projected[a];
          const pb = projected[b];
          if (!pa || !pb) continue;
          list.push({ a: pa, b: pb, depth: (pa.depth + pb.depth) / 2 });
        }
        list.sort(function (left, right) {
          return right.depth - left.depth;
        });
        return list;
      },
      [edges, projected],
    );

    const endDrag = function () {
      dragRef.current = null;
      setDragging(false);
    };

    const download = function () {
      if (svgRef.current) ML.exportSvg(svgRef.current, props.filename || 'mathlab-surface.svg');
    };

    const box = shape.box;
    const boxEdges = useMemo(
      function () {
        if (!box) return [];
        const [x0, x1, y0, y1, z0, z1] = box;
        const corners = [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y1, z0],
          [x0, y1, z0],
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ];
        const pairs = [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 4],
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ];
        return pairs.map(function (pair) {
          return [project(corners[pair[0]]), project(corners[pair[1]])];
        });
      },
      [box, yaw, pitch, zoom],
    );

    const boxLabels = useMemo(
      function () {
        if (!box) return [];
        const [x0, x1, y0, y1, z0, z1] = box;
        return [
          { text: 'x', at: project([x1, y0, z0]) },
          { text: 'y', at: project([x0, y1, z0]) },
          { text: 'z', at: project([x0, y0, z1]) },
        ];
      },
      [box, yaw, pitch, zoom],
    );

    const zText =
      shape.zRange && Number.isFinite(shape.zRange[0])
        ? ML.fmtNum(shape.zRange[0], 3) + ' … ' + ML.fmtNum(shape.zRange[1], 3)
        : '';

    return h(
      'div',
      { className: 'ml-plot-wrap' },
      h(
        'div',
        { className: 'ml-plot-toolbar' },
        h(
          ML.Btn,
          {
            size: 'sm',
            onClick: function () {
              setYaw(0.72);
              setPitch(0.52);
              setZoom(1);
            },
          },
          '⤢ ' + t('common.reset'),
        ),
        h(ML.Btn, { size: 'sm', onClick: download, disabled: vertices.length === 0 }, '⤓ SVG'),
        h(
          'span',
          { className: 'ml-plot-readout' },
          zText ? 'z ∈ [' + zText + ']' : '',
          vertices.length ? '   ' + vertices.length + ' 顶点 / ' + projectedEdges.length + ' 边' : '',
        ),
      ),
      vertices.length === 0
        ? h('div', { className: 'ml-empty' }, t('common.noResult'))
        : h(
            'svg',
            {
              ref: svgRef,
              className: 'ml-plot-svg' + (dragging ? ' is-dragging' : ''),
              viewBox: '0 0 ' + VIEW_W + ' ' + VIEW_H,
              role: 'img',
              'aria-label': props.title || '3D surface',
              style: { cursor: dragging ? 'grabbing' : 'grab' },
              onPointerDown: function (event) {
                if (event.button !== 0) return;
                dragRef.current = {
                  x: event.clientX,
                  y: event.clientY,
                  yaw: yaw,
                  pitch: pitch,
                };
                setDragging(true);
                try {
                  event.currentTarget.setPointerCapture(event.pointerId);
                } catch (error) {

                }
              },
              onPointerMove: function (event) {
                const drag = dragRef.current;
                if (!drag) return;
                const dx = event.clientX - drag.x;
                const dy = event.clientY - drag.y;
                setYaw(drag.yaw + dx * 0.008);
                setPitch(ML.clamp(drag.pitch + dy * 0.006, -1.45, 1.45));
              },
              onPointerUp: endDrag,
              onPointerCancel: endDrag,
              onPointerLeave: endDrag,
              onWheel: function (event) {
                setZoom(function (previous) {
                  return ML.clamp(previous * (event.deltaY < 0 ? 1.08 : 0.925), 0.35, 4);
                });
              },
            },
            boxEdges.map(function (edge, index) {
              if (!edge[0] || !edge[1]) return null;
              return h('line', {
                key: 'box' + index,
                x1: edge[0].x,
                y1: edge[0].y,
                x2: edge[1].x,
                y2: edge[1].y,
                stroke: 'var(--ml-b1)',
                strokeWidth: 0.8,
                strokeDasharray: '3 4',
              });
            }),
            boxLabels.map(function (label, index) {
              return h(
                'text',
                {
                  key: 'bl' + index,
                  x: label.at.x,
                  y: label.at.y,
                  className: 'ml-3d-label',
                  textAnchor: 'middle',
                },
                label.text,
              );
            }),
            projectedEdges.map(function (edge, index) {
              const depthOpacity = ML.clamp(0.42 + (1 - (edge.depth + shape.extent / 2) / shape.extent) * 0.58, 0.35, 0.95);
              return h('line', {
                key: 'e' + index,
                x1: edge.a.x,
                y1: edge.a.y,
                x2: edge.b.x,
                y2: edge.b.y,
                stroke: 'var(--ml-brand)',
                strokeWidth: 0.75,
                opacity: depthOpacity,
              });
            }),
            h(
              'text',
              {
                x: 14,
                y: VIEW_H - 14,
                className: 'ml-3d-label',
                textAnchor: 'start',
              },
              props.caption || '拖拽旋转 · 滚轮缩放',
            ),
          ),
      h('div', { className: 'ml-plot-hint' }, props.hint || '拖动旋转视角，滚轮缩放；SVG 可导出。'),
    );
  };
})();

(function () {
  'use strict';
  const useState = React.useState;

  function objectLabel(object) {
    if (!ML.isObj(object)) return String(object);
    return String(object.label || object.id || '?');
  }

  function identityMorphismIds(category) {
    const ids = new Set();
    for (const identity of ML.toArr(category && category.identities)) {
      if (identity && identity.morphism !== undefined) ids.add(String(identity.morphism));
    }
    for (const morphism of ML.toArr(category && category.morphisms)) {
      if (!morphism) continue;
      const id = String(morphism.id || '');
      const dom = String(morphism.dom || '');
      const cod = String(morphism.cod || '');
      if (dom && cod && dom === cod && (id === 'id' + dom || id === 'id_' + dom || id.toLowerCase() === ('id' + dom).toLowerCase())) {
        ids.add(id);
      }
    }
    return ids;
  }

  function layerObjects(objects, edges) {
    const ids = objects.map(function (object) { return String(object.id); });
    const index = new Map(ids.map(function (id, position) { return [id, position]; }));
    const inDegree = new Map(ids.map(function (id) { return [id, 0]; }));
    const next = new Map(ids.map(function (id) { return [id, []]; }));
    for (const [from, to] of edges) {
      if (!index.has(from) || !index.has(to) || from === to) continue;
      next.get(from).push(to);
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }
    const layer = new Map();
    const queue = ids.filter(function (id) { return (inDegree.get(id) || 0) === 0; });
    queue.forEach(function (id) { layer.set(id, 0); });
    let guard = 0;
    while (queue.length && guard < 10000) {
      guard += 1;
      const id = queue.shift();
      for (const target of next.get(id) || []) {
        const candidate = (layer.get(id) || 0) + 1;
        if (candidate > (layer.get(target) || 0)) layer.set(target, candidate);
        inDegree.set(target, inDegree.get(target) - 1);
        if (inDegree.get(target) <= 0) queue.push(target);
      }
    }
    let maxLayer = 0;
    layer.forEach(function (value) { if (value > maxLayer) maxLayer = value; });
    for (const id of ids) {
      if (!layer.has(id)) {
        maxLayer += 1;
        layer.set(id, maxLayer);
      }
    }
    return layer;
  }

  function pointOnQuadratic(p0, c, p1, t) {
    const mt = 1 - t;
    return [mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0], mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1]];
  }

  ML.CommutativeDiagram = function CommutativeDiagram(props) {
    const category = props.category || {};
    const objects = ML.toArr(category.objects).filter(Boolean);
    const morphisms = ML.toArr(category.morphisms).filter(Boolean);
    const hoverState = useState(null);
    const hovered = hoverState[0];
    const setHovered = hoverState[1];

    if (objects.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'empty category' });

    const identityIds = identityMorphismIds(category);
    const visible = morphisms.filter(function (morphism) {
      return !identityIds.has(String(morphism.id));
    });
    const edges = visible.map(function (morphism) {
      return [String(morphism.dom), String(morphism.cod)];
    });
    const layer = layerObjects(objects, edges);
    const byLayer = new Map();
    for (const object of objects) {
      const id = String(object.id);
      const level = layer.get(id) || 0;
      if (!byLayer.has(level)) byLayer.set(level, []);
      byLayer.get(level).push(object);
    }
    const levels = Array.from(byLayer.keys()).sort(function (a, b) { return a - b; });
    const maxLevel = levels.length ? levels[levels.length - 1] : 0;
    let maxCount = 1;
    byLayer.forEach(function (list) { if (list.length > maxCount) maxCount = list.length; });

    const nodeW = 120;
    const nodeH = 40;
    const stepX = 190;
    const stepY = 100;
    const marginX = 50;
    const marginY = 40;
    const width = Math.max(360, (maxLevel + 1) * stepX + marginX * 2);
    const height = Math.max(220, (maxCount - 1) * stepY + nodeH + marginY * 2 + (maxCount > 1 ? 30 : 0));
    const positions = new Map();
    for (const level of levels) {
      const list = byLayer.get(level);
      const x = marginX + level * stepX;
      const span = (list.length - 1) * stepY;
      const startY = marginY + (height - marginY * 2 - span) / 2;
      list.forEach(function (object, index) {
        positions.set(String(object.id), { x: x, y: startY + index * stepY, object: object });
      });
    }

    const groups = new Map();
    for (const morphism of visible) {
      const key = String(morphism.dom) + '→' + String(morphism.cod);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(morphism);
    }
    const backwards = new Set();
    for (const key of groups.keys()) {
      const parts = key.split('→');
      if (groups.has(parts[1] + '→' + parts[0])) backwards.add(key);
    }

    const highlight = new Set(
      ML.toArr(props.highlightMorphismIds).map(function (id) {
        return String(id);
      }),
    );
    const dimOthers = highlight.size > 0 && props.dimOthers !== false;
    const isHot = function (morphismId) {
      return highlight.has(String(morphismId)) || hovered === String(morphismId);
    };

    const drawEdge = function (morphism, index) {
      const from = positions.get(String(morphism.dom));
      const to = positions.get(String(morphism.cod));
      const id = String(morphism.id);
      if (!from || !to) return null;
      const hot = isHot(id);
      const dim = dimOthers && !hot;
      const label = String(morphism.label || morphism.id || '');
      if (String(morphism.dom) === String(morphism.cod)) {

        const cx = from.x + nodeW / 2;
        const cy = from.y - nodeH / 2;
        const loopR = 26;
        const d =
          'M' + cx + ' ' + cy +
          ' C' + (cx + loopR) + ' ' + (cy - loopR * 1.6) + ' ' + (cx - loopR) + ' ' + (cy - loopR * 1.6) +
          ' ' + cx + ' ' + cy;
        return h(
          'g',
          { key: 'm' + index, onMouseEnter: function () { setHovered(id); }, onMouseLeave: function () { setHovered(null); } },
          h('path', {
            d: d,
            className: 'ml-dedge' + (hot ? ' is-highlight' : '') + (dim ? ' is-dim' : ''),
            markerEnd: 'url(#' + (props.markerId || 'ml-arrow') + ')',
          }),
          h(
            'text',
            { x: cx, y: cy - loopR * 1.9, className: 'ml-dlabel' + (hot ? ' is-highlight' : ''), textAnchor: 'middle' },
            label,
          ),
          h('title', null, id + ': ' + label + ' ∘ ' + label),
        );
      }
      const groupKey = String(morphism.dom) + '→' + String(morphism.cod);
      const siblings = groups.get(groupKey) || [morphism];
      const position = siblings.indexOf(morphism);
      const count = siblings.length;
      let offset = (position - (count - 1) / 2) * 34;
      if (backwards.has(groupKey) && count === 1) offset = 26;
      if (count === 1 && !backwards.has(groupKey)) offset = 0;

      const start = [from.x + nodeW / 2, from.y];
      const end = [to.x - nodeW / 2, to.y];
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      const normal = [-dy / length, dx / length];
      const mid = [(start[0] + end[0]) / 2 + normal[0] * offset, (start[1] + end[1]) / 2 + normal[1] * offset];
      const d = 'M' + start[0] + ' ' + start[1] + ' Q' + mid[0] + ' ' + mid[1] + ' ' + end[0] + ' ' + end[1];
      const tangentAngle = Math.atan2(end[1] - mid[1], end[0] - mid[0]);
      const arrowSize = 8;
      const arrowPoints = [
        [end[0], end[1]],
        [end[0] - arrowSize * Math.cos(tangentAngle - 0.38), end[1] - arrowSize * Math.sin(tangentAngle - 0.38)],
        [end[0] - arrowSize * Math.cos(tangentAngle + 0.38), end[1] - arrowSize * Math.sin(tangentAngle + 0.38)],
      ]
        .map(function (point) {
          return point[0] + ',' + point[1];
        })
        .join(' ');
      const labelPoint = pointOnQuadratic(start, mid, end, 0.5);
      const labelOffsetX = normal[0] * (offset >= 0 ? 10 : -10);
      const labelOffsetY = normal[1] * (offset >= 0 ? 10 : -10) - 3;
      return h(
        'g',
        { key: 'm' + index, onMouseEnter: function () { setHovered(id); }, onMouseLeave: function () { setHovered(null); } },
        h('path', { d: d, className: 'ml-dedge' + (hot ? ' is-highlight' : '') + (dim ? ' is-dim' : '') }),
        h('polygon', {
          points: arrowPoints,
          fill: hot ? 'var(--ml-brand)' : 'var(--ml-fg2)',
          opacity: dim ? 0.3 : 1,
        }),
        h(
          'text',
          {
            x: labelPoint[0] + labelOffsetX,
            y: labelPoint[1] + labelOffsetY,
            className: 'ml-dlabel' + (hot ? ' is-highlight' : ''),
            textAnchor: 'middle',
          },
          label,
        ),
        h('title', null, id + ': ' + String(morphism.dom) + ' → ' + String(morphism.cod)),
      );
    };

    const markerId = props.markerId || ML.uid('arrow');
    return h(
      'div',
      { className: 'ml-diagram' + (props.className ? ' ' + props.className : '') },
      h(
        'svg',
        {
          className: 'ml-diagram-svg',
          viewBox: '0 0 ' + width + ' ' + height,
          role: 'img',
          'aria-label': props.ariaLabel || 'commutative diagram',
        },
        h('defs', null, h('marker', {
          id: markerId,
          markerWidth: 10,
          markerHeight: 10,
          refX: 8,
          refY: 5,
          orient: 'auto',
          markerUnits: 'userSpaceOnUse',
        }, h('path', { d: 'M0,1 L9,5 L0,9 Z', fill: 'var(--ml-fg2)' }))),
        objects.map(function (object) {
          const id = String(object.id);
          const position = positions.get(id);
          if (!position) return null;
          const label = objectLabel(object);
          const hot = hovered === id;
          return h(
            'g',
            {
              key: 'n' + id,
              transform: 'translate(' + position.x + ',' + position.y + ')',
              className: 'ml-dnode' + (hot ? ' is-hover' : ''),
              onMouseEnter: function () { setHovered(id); },
              onMouseLeave: function () { setHovered(null); },
            },
            h('rect', {
              x: -nodeW / 2,
              y: -nodeH / 2,
              width: nodeW,
              height: nodeH,
              rx: 12,
            }),
            h(
              'text',
              { x: 0, y: 5, textAnchor: 'middle' },
              label.length > 16 ? label.slice(0, 15) + '…' : label,
            ),
            h('title', null, id + ' · ' + label),
          );
        }),
        visible.map(drawEdge),
      ),
      h(
        'div',
        { className: 'ml-diagram-legend' },
        h('span', null, props.legend || ''),
        h('span', null, visible.length + ' morphisms · ' + objects.length + ' objects · identity arrows hidden'),
      ),
    );
  };

  ML.HasseDiagram = function HasseDiagram(props) {
    const nodes = ML.toArr(props.nodes).filter(Boolean);
    const edges = ML.toArr(props.edges).filter(function (edge) {
      return Array.isArray(edge) && edge.length >= 2;
    });
    if (nodes.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no subgroups' });
    const orders = Array.from(
      new Set(
        nodes.map(function (node) {
          const order = Number(node.order);
          return Number.isFinite(order) ? order : 0;
        }),
      ),
    ).sort(function (a, b) { return a - b; });
    const byOrder = new Map();
    for (const node of nodes) {
      const order = Number.isFinite(Number(node.order)) ? Number(node.order) : 0;
      if (!byOrder.has(order)) byOrder.set(order, []);
      byOrder.get(order).push(node);
    }
    let maxCount = 1;
    byOrder.forEach(function (list) { if (list.length > maxCount) maxCount = list.length; });
    const stepX = 150;
    const stepY = 74;
    const marginX = 60;
    const marginY = 46;
    const width = Math.max(360, (orders.length - 1) * stepX + marginX * 2);
    const height = Math.max(200, (maxCount - 1) * stepY + marginY * 2);
    const positions = new Map();
    orders.forEach(function (order, levelIndex) {
      const list = byOrder.get(order);
      const x = marginX + levelIndex * stepX;
      const span = (list.length - 1) * stepY;
      const startY = marginY + (height - marginY * 2 - span) / 2;
      list.forEach(function (node, index) {
        positions.set(String(node.id), { x: x, y: startY + index * stepY, node: node });
      });
    });
    return h(
      'div',
      { className: 'ml-diagram' },
      h(
        'svg',
        { className: 'ml-diagram-svg', viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': props.ariaLabel || 'subgroup lattice' },
        edges.map(function (edge, index) {
          const from = positions.get(String(edge[0]));
          const to = positions.get(String(edge[1]));
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const dx = to.x - from.x;
          const control = 'M' + from.x + ' ' + (from.y + 9) + ' C' + mx + ' ' + (from.y + stepY * 0.4) + ' ' + mx + ' ' + (to.y - stepY * 0.4) + ' ' + to.x + ' ' + (to.y - 9);
          return h('path', { key: 'e' + index, d: control, className: 'ml-hasse-edge' });
        }),
        nodes.map(function (node) {
          const position = positions.get(String(node.id));
          if (!position) return null;
          const label = String(node.label || ('|H|=' + node.order));
          const title = String(node.id) + ' · ' + label + ' · |H| = ' + String(node.order) + (node.isNormal ? ' · normal' : '') + (node.isMaximal ? ' · maximal' : '');
          return h(
            'g',
            {
              key: 'n' + String(node.id),
              className: 'ml-hasse-node' + (node.isNormal ? ' is-normal' : ''),
              transform: 'translate(' + position.x + ',' + position.y + ')',
            },
            h('circle', { r: node.isNormal ? 8 : 6, cx: 0, cy: 0 }),
            h('text', { className: 'ml-hasse-label', x: 11, y: 4, textAnchor: 'start' }, label.length > 14 ? label.slice(0, 13) + '…' : label),
            h('title', null, title),
          );
        }),
      ),
      h(
        'div',
        { className: 'ml-diagram-legend' },
        h('span', null, '○ subgroup'),
        h('span', null, '◎  normal subgroup (blue)'),
        h('span', null, 'edges: smaller → larger (normal covering)'),
      ),
    );
  };

  ML.CayleyTable = function CayleyTable(props) {
    const elements = ML.toArr(props.elements);
    const table = ML.toArr(props.table);
    if (elements.length === 0 || table.length === 0) return h(ML.Empty, null);
    const cellClass = function (cell) {
      if (props.highlight && String(cell) === String(props.highlight)) return 'ml-cell-hl';
      return undefined;
    };
    return h(ML.LabeledTable, {
      rowLabels: elements,
      colLabels: elements,
      corner: props.corner || '∘',
      cells: table.map(function (row) {
        return ML.toArr(row).map(function (index) {
          return elements[Number(index)] === undefined ? String(index) : elements[Number(index)];
        });
      }),
      cellClass: cellClass,
      className: props.className,
    });
  };
})();

(function () {
  'use strict';
  const useState = React.useState;

  const LINE_HEIGHT = 26;
  const LINE_PADDING = 10;

  const TRUE_GLYPH = 'T';
  const FALSE_GLYPH = 'F';

  function normalizeLines(proof) {
    const direct = ML.toArr(proof && proof.fitch);
    if (direct.length > 0) {
      return direct.map(function (line, index) {
        return {
          line: line && line.line !== undefined ? line.line : index + 1,
          indent: ML.clamp(Number(line && line.indent) || 0, 0, 10),
          text: line && line.text !== undefined ? String(line.text) : String((line && line.conclusion) || ''),
          rule: line && line.rule !== undefined ? String(line.rule) : '',
          refs: ML.toArr(line && line.refs),
          conclusion: line && line.conclusion,
        };
      });
    }
    const nodes = ML.toArr((proof && proof.proof && proof.proof.nodes) || (proof && proof.nodes));
    return nodes.map(function (node, index) {
      const fitch = (node && node.fitch) || {};
      return {
        line: fitch.line !== undefined ? fitch.line : index + 1,
        indent: ML.clamp(Number(fitch.indent) || 0, 0, 10),
        text: fitch.text !== undefined ? String(fitch.text) : String((node && node.conclusion) || ''),
        rule: (node && node.rule) || fitch.rule || '',
        refs: ML.toArr(node && node.premises),
        conclusion: node && node.conclusion,
      };
    });
  }

  function computeScopes(lines) {
    const scopes = [];
    const stack = [];
    lines.forEach(function (line, index) {
      const indent = line.indent;
      while (stack.length > 0 && stack[stack.length - 1].indent > indent) {
        const open = stack.pop();
        open.end = index;
        scopes.push(open);
      }
      const topIndent = stack.length > 0 ? stack[stack.length - 1].indent : 0;
      if (indent > topIndent) {
        stack.push({ indent: indent, start: index });
      }
    });
    while (stack.length > 0) {
      const open = stack.pop();
      open.end = lines.length - 1;
      scopes.push(open);
    }
    return scopes;
  }

  ML.FitchProof = function FitchProof(props) {
    const lines = normalizeLines(props.proof !== undefined ? props.proof : props);
    if (lines.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no proof lines' });
    const scopes = computeScopes(lines);
    const innerHeight = lines.length * LINE_HEIGHT;
    return h(
      'div',
      { className: 'ml-fitch', style: { paddingTop: LINE_PADDING, paddingBottom: LINE_PADDING } },
      h(
        'div',
        { className: 'ml-fitch-inner', style: { position: 'relative', height: innerHeight } },
        scopes.map(function (scope, index) {
          const top = scope.start * LINE_HEIGHT + 4;
          const height = (scope.end - scope.start + 1) * LINE_HEIGHT - 8;
          const left = 42 + (scope.indent - 1) * 16 + 2;
          return h('div', {
            key: 'bar' + index,
            className: 'ml-fitch-bar',
            style: { left: left, top: top, height: height },
            title: 'discharge scope',
          });
        }),
        lines.map(function (line, index) {
          return h(
            'div',
            { key: 'line' + index, className: 'ml-fitch-line' + (index === lines.length - 1 ? ' is-conclusion' : '') },
            h('span', { className: 'ml-fitch-no' }, String(line.line)),
            h(
              'span',
              { className: 'ml-fitch-body', style: { paddingLeft: line.indent * 16 } },
              line.text || (line.conclusion === undefined ? '' : ML.safeString(line.conclusion)),
            ),
            line.rule ? h('span', { className: 'ml-fitch-rule' }, line.rule) : null,
            line.refs.length ? h('span', { className: 'ml-fitch-refs' }, '[' + line.refs.join(', ') + ']') : null,
          );
        }),
      ),
    );
  };

  ML.ProofTree = function ProofTree(props) {
    const nodes = ML.toArr((props.proof && props.proof.nodes) || props.nodes);
    if (nodes.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no proof nodes' });
    const byId = new Map();
    for (const node of nodes) {
      if (node && node.id !== undefined) byId.set(String(node.id), node);
    }
    const referenced = new Set();
    for (const node of nodes) {
      for (const premise of ML.toArr(node && node.premises)) referenced.add(String(premise));
    }
    let roots = nodes.filter(function (node) {
      return node && !referenced.has(String(node.id));
    });
    if (roots.length === 0) roots = [nodes[nodes.length - 1]];
    const visited = new Set();

    const renderNode = function (node, depth) {
      const id = String(node && node.id);
      if (visited.has(id) || depth > 40) {
        return h('li', { key: 'cycle' + id }, h('span', { className: 'ml-muted' }, '…'));
      }
      visited.add(id);
      const children = ML.toArr(node.premises).map(function (premiseId) {
        return byId.get(String(premiseId));
      }).filter(Boolean);
      const discharged = ML.toArr(node.discharged);
      return h(
        'li',
        { key: id },
        h('span', null, node.conclusion !== undefined ? ML.safeString(node.conclusion, 400) : id),
        node.rule ? h('span', { className: 'ml-proof-rule' }, node.rule) : null,
        discharged.length ? h('span', { className: 'ml-proof-discharged' }, 'discharge [' + discharged.join(', ') + ']') : null,
        children.length
          ? h(
              'ul',
              null,
              children.map(function (child) {
                return renderNode(child, depth + 1);
              }),
            )
          : null,
      );
    };

    return h(
      'div',
      { className: 'ml-proof-tree' },
      h(
        'ul',
        null,
        roots.map(function (root, index) {
          return h(React.Fragment, { key: 'root' + index }, renderNode(root, 0));
        }),
      ),
    );
  };

  function boolCell(value) {
    if (value === true || value === 'true' || value === 1) return h('span', { className: 'ml-tt-t' }, TRUE_GLYPH);
    if (value === false || value === 'false' || value === 0) return h('span', { className: 'ml-tt-f' }, FALSE_GLYPH);
    return h('span', { className: 'ml-muted' }, '?');
  }

  ML.TruthTable = function TruthTable(props) {
    const data = props.data || {};
    const atoms = ML.toArr(data.atoms).map(String);
    const rows = ML.toArr(data.rows);
    if (rows.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no truth table' });
    return h(
      'div',
      { className: 'ml-tbl-wrap' },
      h(
        'table',
        { className: 'ml-table ml-truth-table' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            rows[0] && Array.isArray(rows[0].values)
              ? atoms.map(function (atom) {
                  return h('th', { key: atom, scope: 'col' }, atom);
                })
              : null,
            h('th', { scope: 'col', className: 'ml-tt-result' }, ML.toArr(data.atoms).length ? 'φ' : 'result'),
          ),
        ),
        h(
          'tbody',
          null,
          rows.map(function (row, index) {
            const values = Array.isArray(row && row.values) ? row.values : [];
            return h(
              'tr',
              { key: index },
              atoms.map(function (atom, columnIndex) {
                return h('td', { key: atom }, boolCell(values[columnIndex]));
              }),
              h('td', { className: 'ml-tt-result' }, boolCell(row && row.result)),
            );
          }),
        ),
      ),
    );
  };

  ML.Countermodel = function Countermodel(props) {
    const t = ML.useT();
    const model = props.countermodel;
    if (!model || !ML.isObj(model)) return h(ML.Empty, { label: props.emptyLabel || 'none' });
    const sections = [];

    if (ML.isObj(model.assignment)) {
      sections.push(
        h(
          'div',
          { key: 'assignment' },
          h(ML.SectionTitle, null, props.assignmentLabel || 'assignment'),
          h(ML.LabeledTable, {
            rowLabels: [],
            colLabels: Object.keys(model.assignment),
            cells: [Object.keys(model.assignment).map(function (key) {
              return boolCell(model.assignment[key]);
            })],
          }),
        ),
      );
    }

    if (model.worlds !== undefined) {
      const worldCount = Array.isArray(model.worlds) ? model.worlds.length : Number(model.worlds);
      const worlds = Array.from({ length: Number.isFinite(worldCount) ? worldCount : 0 }, function (unused, index) {
        return 'w' + (index + 1);
      });
      sections.push(
        h(
          'div',
          { key: 'worlds' },
          h(ML.SectionTitle, null, props.worldsLabel || 'worlds'),
          h(
            'div',
            { className: 'ml-row' },
            worlds.map(function (world) {
              return h(ML.Badge, { key: world, tone: 'brand' }, world);
            }),
          ),
        ),
      );
      const relations = model.relations;
      if (Array.isArray(relations) && relations.length > 0) {
        if (ML.matrixLike(relations)) {
          sections.push(
            h(
              'div',
              { key: 'relations' },
              h(ML.SectionTitle, null, props.relationsLabel || 'accessibility relation'),
              h(ML.MatrixView, { matrix: relations, small: true }),
            ),
          );
        } else {
          sections.push(
            h(
              'div',
              { key: 'relations' },
              h(ML.SectionTitle, null, props.relationsLabel || 'accessibility relation'),
              h(
                'div',
                { className: 'ml-row' },
                relations.map(function (pair, index) {
                  const from = Array.isArray(pair) ? pair[0] : undefined;
                  const to = Array.isArray(pair) ? pair[1] : undefined;
                  return h(
                    'span',
                    { key: index, className: 'ml-badge' },
                    'world ' + String(from) + ' → ' + String(to),
                  );
                }),
              ),
            ),
          );
        }
      }
      if (ML.isObj(model.valuation)) {
        const atomNames = Object.keys(model.valuation);
        sections.push(
          h(
            'div',
            { key: 'valuation' },
            h(ML.SectionTitle, null, props.valuationLabel || 'valuation'),
            h(ML.LabeledTable, {
              rowLabels: worlds,
              colLabels: atomNames,
              corner: 'w',
              cells: worlds.map(function (world, worldIndex) {
                return atomNames.map(function (atom) {
                  const values = model.valuation[atom];
                  const value = Array.isArray(values) ? values[worldIndex] : values;
                  return boolCell(value);
                });
              }),
            }),
          ),
        );
      }
    }

    const remaining = {};
    for (const key of Object.keys(model)) {
      if (key === 'assignment' || key === 'worlds' || key === 'relations' || key === 'valuation') continue;
      remaining[key] = model[key];
    }
    if (Object.keys(remaining).length > 0) {
      sections.push(
        h(
          'div',
          { key: 'rest' },
          h(ML.Collapse, { title: t('common.details') }, h(ML.JSONTree, { value: remaining })),
        ),
      );
    }
    if (sections.length === 0) return h(ML.DataView, { data: model });
    return h('div', { className: 'ml-stack' }, sections, h(ML.RawJSON, { value: model }));
  };

  ML.RuleLegend = function RuleLegend() {
    const rules = [
      ['∧I', 'and-intro'],
      ['∧E', 'and-elim'],
      ['∨I', 'or-intro'],
      ['∨E', 'or-elim'],
      ['→I', 'imp-intro'],
      ['→E', 'imp-elim'],
      ['↔I', 'iff-intro'],
      ['¬I', 'not-intro'],
      ['¬E', 'not-elim'],
      ['⊥E', 'contradiction-elim'],
      ['¬¬E', 'double-neg-elim'],
      ['LEM', 'law-excluded-middle'],
    ];
    return h(
      'div',
      { className: 'ml-chip-row' },
      rules.map(function (rule) {
        return h('span', { key: rule[1], className: 'ml-badge', title: rule[1] }, rule[0] + ' ' + rule[1]);
      }),
    );
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useEffect = React.useEffect;

  ML.assignStrings(
    {
      'tab.compute': '计算',
      'compute.title': '符号计算',
      'compute.hint': '输入 SymPy 表达式；Ctrl/⌘ + Enter 运行。',
      'compute.expr': '表达式',
      'compute.op': '运算',
      'compute.result': '结果',
      'compute.history': '历史记录',
      'compute.historyEmpty': '还没有运行记录。',
      'compute.clearHistory': '清空历史',
      'compute.examples': '快速示例',
      'compute.palette': '符号',
      'compute.var': '变量',
      'compute.order': '阶数 / 项数',
      'compute.point': '展开点 / 极限点',
      'compute.direction': '方向',
      'compute.lower': '下限',
      'compute.upper': '上限',
      'compute.equations': '方程（每行一个）',
      'compute.vars': '未知量（逗号分隔）',
      'compute.eq': '微分方程',
      'compute.func': '未知函数',
      'compute.ics': '初值条件（JSON，可选）',
      'compute.subs': '代入（JSON）',
      'compute.digits': '有效位数',
      'compute.vector': '向量微积分',
      'compute.vectorOp': '运算',
      'compute.components': '分量 / 标量场（逗号分隔）',
      'compute.scalarField': '标量场 f（grad / laplacian / norm）',
      'compute.otherVector': '第二个向量（dot / cross）',
      'compute.coords': '坐标向量（逗号分隔）',
      'compute.varsXYZ': '变量（逗号分隔）',
      'compute.number': '数论',
      'compute.numberN': 'n',
      'compute.numberK': 'k',
      'compute.modulus': '模数',
      'compute.runShortcut': 'Ctrl/⌘ + Enter',
      'compute.emptyExpr': '请输入表达式。',
      'compute.emptyEquations': '请至少输入一个方程。',
      'compute.emptyVars': '请指定未知量。',
      'compute.invalidJSON': 'JSON 解析失败：',
      'compute.invalidICS': '初值条件 JSON 解析失败：',
      'compute.solutions': '解集',
      'compute.solution': '解',
      'compute.classification': '分类',
      'compute.orderLabel': '阶',
      'compute.approxValue': '数值',
      'compute.complexValue': '复数值',
      'compute.factorization': '分解',
      'compute.restore': '恢复',
      'compute.op.simplify': '化简 simplify',
      'compute.op.expand': '展开 expand',
      'compute.op.factor': '因式分解 factor',
      'compute.op.apart': '部分分式 apart',
      'compute.op.cancel': '约分 cancel',
      'compute.op.trigsimp': '三角化简 trigsimp',
      'compute.op.rationalize': '分母有理化 rationalize',
      'compute.op.powdenest': '根式化简 powdenest',
      'compute.op.diff': '求导 diff',
      'compute.op.integrate': '积分 integrate',
      'compute.op.limit': '极限 limit',
      'compute.op.series': '级数展开 series',
      'compute.op.sum': '求和 sum',
      'compute.op.product': '连乘 product',
      'compute.op.solve': '解方程 solve',
      'compute.op.dsolve': '微分方程 dsolve',
      'compute.op.approx': '数值求值 approx',
      'compute.vec.grad': '梯度 grad',
      'compute.vec.div': '散度 div',
      'compute.vec.curl': '旋度 curl',
      'compute.vec.laplacian': '拉普拉斯 laplacian',
      'compute.vec.dot': '点积 dot',
      'compute.vec.cross': '叉积 cross',
      'compute.vec.norm': '模 norm',
      'compute.num.factorint': '质因数分解',
      'compute.num.isprime': '素数判定',
      'compute.num.primes': '素数表',
      'compute.num.totient': '欧拉函数 φ(n)',
      'compute.num.divisors': '约数',
      'compute.num.gcd': '最大公因数 gcd',
      'compute.num.lcm': '最小公倍数 lcm',
      'compute.num.modinv': '模逆',
      'compute.num.crt': '中国剩余定理',
      'compute.num.fibonacci': '斐波那契',
      'compute.num.binomial': '二项式系数',
      'compute.num.sigma': '约数和 σ(n)',
      'compute.num.mobius': '莫比乌斯 μ(n)',
    },
    {
      'tab.compute': 'Compute',
      'compute.title': 'Symbolic computation',
      'compute.hint': 'Enter a SymPy expression; press Ctrl/⌘ + Enter to run.',
      'compute.expr': 'Expression',
      'compute.op': 'Operation',
      'compute.result': 'Result',
      'compute.history': 'History',
      'compute.historyEmpty': 'Nothing has been run yet.',
      'compute.clearHistory': 'Clear history',
      'compute.examples': 'Quick examples',
      'compute.palette': 'Symbols',
      'compute.var': 'Variable',
      'compute.order': 'Order / terms',
      'compute.point': 'Point',
      'compute.direction': 'Direction',
      'compute.lower': 'Lower bound',
      'compute.upper': 'Upper bound',
      'compute.equations': 'Equations (one per line)',
      'compute.vars': 'Unknowns (comma separated)',
      'compute.eq': 'Differential equation',
      'compute.func': 'Unknown function',
      'compute.ics': 'Initial conditions (JSON, optional)',
      'compute.subs': 'Substitutions (JSON)',
      'compute.digits': 'Digits',
      'compute.vector': 'Vector calculus',
      'compute.vectorOp': 'Operation',
      'compute.components': 'Components / scalar field (comma separated)',
      'compute.scalarField': 'Scalar field f (grad / laplacian / norm)',
      'compute.otherVector': 'Second vector (dot / cross)',
      'compute.coords': 'Coordinate vectors (comma separated)',
      'compute.varsXYZ': 'Variables (comma separated)',
      'compute.number': 'Number theory',
      'compute.numberN': 'n',
      'compute.numberK': 'k',
      'compute.modulus': 'modulus',
      'compute.runShortcut': 'Ctrl/⌘ + Enter',
      'compute.emptyExpr': 'Enter an expression.',
      'compute.emptyEquations': 'Enter at least one equation.',
      'compute.emptyVars': 'Specify the unknowns.',
      'compute.invalidJSON': 'Invalid JSON: ',
      'compute.invalidICS': 'Invalid initial-conditions JSON: ',
      'compute.solutions': 'Solutions',
      'compute.solution': 'Solution',
      'compute.classification': 'Classification',
      'compute.orderLabel': 'order',
      'compute.approxValue': 'value',
      'compute.complexValue': 'complex value',
      'compute.factorization': 'factorisation',
      'compute.restore': 'Restore',
      'compute.op.simplify': 'Simplify',
      'compute.op.expand': 'Expand',
      'compute.op.factor': 'Factor',
      'compute.op.apart': 'Apart',
      'compute.op.cancel': 'Cancel',
      'compute.op.trigsimp': 'Trig simplify',
      'compute.op.rationalize': 'Rationalize',
      'compute.op.powdenest': 'Power denest',
      'compute.op.diff': 'Differentiate',
      'compute.op.integrate': 'Integrate',
      'compute.op.limit': 'Limit',
      'compute.op.series': 'Series',
      'compute.op.sum': 'Sum',
      'compute.op.product': 'Product',
      'compute.op.solve': 'Solve',
      'compute.op.dsolve': 'ODE solve',
      'compute.op.approx': 'Approximate',
      'compute.vec.grad': 'Gradient',
      'compute.vec.div': 'Divergence',
      'compute.vec.curl': 'Curl',
      'compute.vec.laplacian': 'Laplacian',
      'compute.vec.dot': 'Dot product',
      'compute.vec.cross': 'Cross product',
      'compute.vec.norm': 'Norm',
      'compute.num.factorint': 'Prime factorisation',
      'compute.num.isprime': 'Primality test',
      'compute.num.primes': 'Prime list',
      'compute.num.totient': 'Totient φ(n)',
      'compute.num.divisors': 'Divisors',
      'compute.num.gcd': 'Greatest common divisor',
      'compute.num.lcm': 'Least common multiple',
      'compute.num.modinv': 'Modular inverse',
      'compute.num.crt': 'Chinese remainder',
      'compute.num.fibonacci': 'Fibonacci',
      'compute.num.binomial': 'Binomial coefficient',
      'compute.num.sigma': 'Divisor sum σ(n)',
      'compute.num.mobius': 'Möbius μ(n)',
    },
  );

  const OPS = [
    { id: 'simplify', fields: [] },
    { id: 'expand', fields: [] },
    { id: 'factor', fields: [] },
    { id: 'apart', fields: ['var'] },
    { id: 'cancel', fields: [] },
    { id: 'trigsimp', fields: [] },
    { id: 'rationalize', fields: [] },
    { id: 'powdenest', fields: [] },
    { id: 'diff', fields: ['var', 'order'] },
    { id: 'integrate', fields: ['var', 'lower', 'upper'] },
    { id: 'limit', fields: ['var', 'point', 'direction'] },
    { id: 'series', fields: ['var', 'point', 'order'] },
    { id: 'sum', fields: ['var', 'lower', 'upper'] },
    { id: 'product', fields: ['var', 'lower', 'upper'] },
    { id: 'solve', fields: ['equations', 'vars'] },
    { id: 'dsolve', fields: ['eq', 'func', 'var', 'ics'] },
    { id: 'approx', fields: ['subs', 'digits'] },
  ];

  const VECTOR_OPS = ['grad', 'div', 'curl', 'laplacian', 'dot', 'cross', 'norm'];
  const NUMBER_OPS = [
    'factorint',
    'isprime',
    'primes',
    'totient',
    'divisors',
    'gcd',
    'lcm',
    'modinv',
    'crt',
    'fibonacci',
    'binomial',
    'sigma',
    'mobius',
  ];

  const PALETTE = [
    '∫',
    '∑',
    '∏',
    '√',
    'π',
    '∞',
    '∂',
    '∇',
    'θ',
    'α',
    'β',
    'γ',
    'φ',
    'λ',
    '≤',
    '≥',
    '≠',
    '≈',
    '→',
    '⇒',
    '↦',
    '·',
    '×',
    '⟨⟩',
    '⌊⌋',
    '^',
    '**',
    'exp(',
    'sin(',
    'cos(',
    'log(',
  ];

  const EXAMPLES = [
    { zh: '欧拉恒等式', en: 'Euler identity', op: 'simplify', expr: 'exp(I*pi)' },
    { zh: '三角恒等式', en: 'Pythagorean identity', op: 'simplify', expr: 'sin(x)**2 + cos(x)**2' },
    {
      zh: '高斯积分',
      en: 'Gaussian integral',
      op: 'integrate',
      expr: 'exp(-x**2)',
      fields: { lower: '-oo', upper: 'oo' },
    },
    { zh: '泰勒展开', en: 'Taylor series', op: 'series', expr: 'sin(x)', fields: { var: 'x', point: '0', order: '6' } },
    { zh: '洛必达示例', en: 'A limit', op: 'limit', expr: 'sin(x)/x', fields: { var: 'x', point: '0' } },
    { zh: '级数求和', en: 'Series sum', op: 'sum', expr: '1/n**2', fields: { var: 'n', lower: '1', upper: 'oo' } },
    { zh: '因式分解', en: 'Factorisation', op: 'factor', expr: 'x**4 - 1' },
    { zh: '解二次方程', en: 'Quadratic equation', op: 'solve', fields: { equations: 'x**2 - 5*x + 6 = 0', vars: 'x' } },
    { zh: '二阶 ODE', en: 'Second-order ODE', op: 'dsolve', fields: { eq: "y'' + y = 0", func: 'y', var: 'x' } },
    { zh: '数值求值', en: 'Numeric value', op: 'approx', expr: 'exp(1)', fields: { subs: '{}', digits: '20' } },
  ];

  function emptyFields() {
    return {
      var: 'x',
      order: '1',
      point: '0',
      direction: 'both',
      lower: '',
      upper: '',
      equations: 'x**2 - 5*x + 6 = 0',
      vars: 'x',
      eq: "y'' + y = 0",
      func: 'y',
      ics: '',
      subs: '{}',
      digits: '15',
    };
  }

  function toNumber(value) {
    const text = String(value === undefined || value === null ? '' : value).trim();
    if (!text) return undefined;
    const asNumber = Number(text);
    return Number.isSafeInteger(asNumber) ? asNumber : text;
  }

  function parseJSONArg(text) {
    const raw = String(text || '').trim();
    if (!raw) return { value: undefined, error: null };
    try {
      return { value: JSON.parse(raw), error: null };
    } catch (error) {
      return { value: undefined, error: error.message };
    }
  }

  function buildArgs(op, expr, fields) {
    const exprText = String(expr === undefined || expr === null ? '' : expr);
    const args = {};
    const needsExpr = op !== 'solve' && op !== 'dsolve';
    if (needsExpr) {
      if (!exprText.trim()) return { args: null, error: 'empty-expr' };
      args.expr = exprText;
    }
    switch (op) {
      case 'apart':
        args.var = fields.var.trim() || 'x';
        break;
      case 'diff':
        args.var = fields.var.trim() || 'x';
        if (parseInt(fields.order, 10) > 0) args.order = parseInt(fields.order, 10);
        break;
      case 'integrate':
        args.var = fields.var.trim() || 'x';
        if (String(fields.lower).trim()) args.lower = String(fields.lower).trim();
        if (String(fields.upper).trim()) args.upper = String(fields.upper).trim();
        break;
      case 'limit':
        args.var = fields.var.trim() || 'x';
        args.point = String(fields.point).trim() || '0';
        args.direction = fields.direction || 'both';
        break;
      case 'series':
        args.var = fields.var.trim() || 'x';
        args.point = String(fields.point).trim() || '0';
        if (parseInt(fields.order, 10) > 0) args.order = parseInt(fields.order, 10);
        break;
      case 'sum':
      case 'product':
        args.var = fields.var.trim() || 'n';
        if (String(fields.lower).trim()) args.lower = String(fields.lower).trim();
        if (String(fields.upper).trim()) args.upper = String(fields.upper).trim();
        break;
      case 'solve': {
        const equations = ML.lines(fields.equations);
        if (equations.length === 0) return { args: null, error: 'empty-equations' };
        const vars = ML.parseList(fields.vars).values;
        if (vars.length === 0) return { args: null, error: 'empty-vars' };
        args.equations = equations;
        args.vars = vars.map(String);
        break;
      }
      case 'dsolve': {
        if (!String(fields.eq).trim()) return { args: null, error: 'empty-expr' };
        args.eq = String(fields.eq).trim();
        args.func = String(fields.func).trim() || 'y';
        args.var = String(fields.var).trim() || 'x';
        if (String(fields.ics).trim()) {
          const parsed = parseJSONArg(fields.ics);
          if (parsed.error) return { args: null, error: 'invalid-ics', detail: parsed.error };
          args.ics = parsed.value;
        }
        break;
      }
      case 'approx': {
        const parsed = parseJSONArg(fields.subs);
        if (parsed.error) return { args: null, error: 'invalid-json', detail: parsed.error };
        args.subs = parsed.value === undefined ? {} : parsed.value;
        if (parseInt(fields.digits, 10) > 0) args.digits = parseInt(fields.digits, 10);
        break;
      }
      default:
        break;
    }
    return { args: args, error: null };
  }

  function argsToState(args) {
    const fields = emptyFields();
    if (!ML.isObj(args)) return { expr: '', fields: fields };
    const expr = typeof args.expr === 'string' ? args.expr : '';
    for (const key of ['var', 'point', 'direction', 'lower', 'upper', 'func', 'digits']) {
      if (args[key] !== undefined && args[key] !== null) fields[key] = String(args[key]);
    }
    if (args.order !== undefined) fields.order = String(args.order);
    if (Array.isArray(args.equations)) fields.equations = args.equations.join('\n');
    if (Array.isArray(args.vars)) fields.vars = args.vars.join(', ');
    if (typeof args.eq === 'string') fields.eq = args.eq;
    if (args.ics !== undefined) fields.ics = ML.prettyJSON(args.ics);
    if (args.subs !== undefined) fields.subs = JSON.stringify(args.subs);
    return { expr: expr, fields: fields };
  }

  function labelFor(op, expr) {
    const text = String(expr || '').replace(/\s+/g, ' ').trim();
    return text.length > 64 ? text.slice(0, 64) + '…' : text || op;
  }

  function SolveResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    const solutions = ML.toArr(data.solutions);
    return h(
      'div',
      { className: 'ml-result' },
      data.latex ? h(ML.FormulaBlock, { tex: data.latex, label: t('compute.solutions') }) : null,
      solutions.length === 0
        ? h(ML.Empty, { label: t('common.empty') })
        : h(
            'div',
            { className: 'ml-stack-sm' },
            solutions.map(function (solution, index) {
              const values = ML.toArr(solution && solution.values);
              return h(
                'div',
                { key: index, className: 'ml-row' },
                h('span', { className: 'ml-mono' }, String((solution && solution.var) || '?') + ' ='),
                values.length === 0
                  ? h('span', { className: 'ml-muted' }, '∅')
                  : values.map(function (value, valueIndex) {
                      const expr = ML.isObj(value) ? value : null;
                      return h(
                        'span',
                        { key: valueIndex, className: 'ml-row' },
                        expr
                          ? h(ML.Math, { tex: ML.exprLatex(expr) })
                          : h('code', { className: 'ml-mono' }, ML.safeString(value, 200)),
                        valueIndex < values.length - 1 ? h('span', { className: 'ml-sep' }, ',') : null,
                      );
                    }),
              );
            }),
          ),
      h(ML.Notes, { notes: data.notes }),
      h(
        'div',
        { className: 'ml-result-actions' },
        h(ML.CopyBtn, { text: ML.prettyJSON(data), label: t('common.json') }),
      ),
      h(ML.RawJSON, { value: data }),
    );
  }

  function OdeResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    const solution = data.solution;
    const expr = ML.pickExpr(solution) || ML.pickExpr(data);
    return h(
      'div',
      { className: 'ml-stack-sm' },
      data.latex
        ? h(ML.FormulaBlock, { tex: data.latex, label: t('compute.solution') })
        : expr
          ? h(ML.ExprResult, { data: expr })
          : h(ML.DataView, { data: data }),
      data.pretty && !expr ? h('pre', { className: 'ml-pre' }, data.pretty) : null,
      h(ML.KV, {
        rows: [
          data.order !== undefined ? { label: t('compute.orderLabel'), value: String(data.order) } : null,
          data.classification ? { label: t('compute.classification'), value: ML.safeString(data.classification) } : null,
        ].filter(Boolean),
      }),
      h(ML.Notes, { notes: data.notes }),
      h(ML.RawJSON, { value: data }),
    );
  }

  function ApproxResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    return h(
      'div',
      { className: 'ml-stack-sm' },
      data.latex ? h(ML.FormulaBlock, { tex: data.latex }) : null,
      h(ML.KV, {
        rows: [
          data.value !== undefined ? { label: t('compute.approxValue'), value: ML.safeString(data.value, 400), mono: true } : null,
          data.complex ? { label: t('compute.complexValue'), value: ML.safeString(data.complex, 400), mono: true } : null,
        ].filter(Boolean),
      }),
      h(
        'div',
        { className: 'ml-result-actions' },
        h(ML.CopyBtn, { text: ML.safeString(data.value), label: t('common.copyText') }),
      ),
      h(ML.RawJSON, { value: data }),
    );
  }

  function NumberOutput(props) {
    const data = props.data;
    let pairs = null;
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length === 2) pairs = data;
    else if (ML.isObj(data) && Array.isArray(data.value) && data.value.length > 0 && Array.isArray(data.value[0]) && data.value[0].length === 2) pairs = data.value;
    if (pairs) {
      return h(
        'div',
        { className: 'ml-stack-sm' },
        h(
          'div',
          { className: 'ml-mono' },
          pairs
            .map(function (pair) {
              const base = ML.safeString(pair[0]);
              const exponent = ML.safeString(pair[1]);
              return exponent === '1' ? base : base + '^' + exponent;
            })
            .join(' · '),
        ),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (Array.isArray(data)) {
      return h(
        'div',
        { className: 'ml-stack-sm' },
        h(
          'div',
          { className: 'ml-mono', style: { wordBreak: 'break-word' } },
          data.length > 400 ? data.slice(0, 400).join(', ') + ' …' : data.join(', '),
        ),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (typeof data === 'boolean') {
      return h(ML.Badge, { tone: data ? 'success' : 'error' }, data ? 'true' : 'false');
    }
    return h(ML.DataView, { data: data });
  }

  function VectorTool() {
    const t = ML.useT();
    const engine = ML.useEngine();
    const [opName, setOpName] = useState('grad');
    const [scalarExpr, setScalarExpr] = useState('x**2*y + y**3');
    const [componentsText, setComponentsText] = useState('x**2*y, x*y**2, z');
    const [otherText, setOtherText] = useState('1, 0, 0');
    const [varsText, setVarsText] = useState('x, y, z');
    const call = ML.useCall();
    const lastArgs = useRef(null);
    const needsComponents = ['div', 'curl', 'dot', 'cross'].indexOf(opName) >= 0;
    const needsOther = ['dot', 'cross'].indexOf(opName) >= 0;
    const needsExpr = !needsComponents;
    const changeOp = function (next) {
      setOpName(next);
      if (next === 'curl' || next === 'dot' || next === 'cross') {
        setComponentsText('x**2*y, x*y**2, z');
        setOtherText(next === 'curl' ? '1, 0, 0' : '1, 2, 3');
        setVarsText('x, y, z');
      } else if (next === 'div') {
        setComponentsText('x**2*y, x*y**2');
        setVarsText('x, y');
      }
    };
    const run = function () {
      const args = { op: opName };
      const vars = ML.parseList(varsText).values.map(String);
      if (vars.length) args.vars = vars;
      if (needsExpr) {
        if (!String(scalarExpr).trim()) return;
        args.expr = String(scalarExpr).trim();
      } else {
        const parts = ML.parseList(componentsText).values;
        if (parts.length === 0) return;
        args.components = parts.map(String);
        if (needsOther) {
          const other = ML.parseList(otherText).values;
          if (other.length === 0) return;
          args.other = other.map(String);
        }
      }
      lastArgs.current = args;
      call.run('calc.vector', args);
    };
    const result = call.result;
    const expr = result && ML.pickExpr(result);
    const vector = result && Array.isArray(result.vector) ? result.vector : null;
    return h(
      'div',
      { className: 'ml-stack' },
      h(ML.SectionTitle, { hint: engine.status === 'ready' ? undefined : t('engine.starting') }, t('compute.vector')),
      h(
        'div',
        { className: 'ml-form-grid' },
        h(ML.Field, {
          label: t('compute.vectorOp'),
          children: (id) =>
            h(ML.Select, {
              id: id,
              value: opName,
              onChange: function (event) {
                changeOp(event.target.value);
              },
              options: VECTOR_OPS.map(function (id) {
                return { value: id, label: t('compute.vec.' + id) };
              }),
            }),
        }),
        h(ML.Field, {
          label: t('compute.varsXYZ'),
          children: (id) =>
            h(ML.Input, {
              id: id,
              value: varsText,
              onChange: function (event) {
                setVarsText(event.target.value);
              },
            }),
        }),
      ),
      needsExpr
        ? h(ML.Field, {
            label: t('compute.scalarField'),
            children: (id) =>
              h(ML.Input, {
                id: id,
                value: scalarExpr,
                className: 'ml-mono',
                onChange: function (event) {
                  setScalarExpr(event.target.value);
                },
              }),
          })
        : h(ML.Field, {
            label: t('compute.components'),
            hint: 'div / curl / dot / cross',
            children: (id) =>
              h(ML.Textarea, {
                id: id,
                rows: 2,
                value: componentsText,
                onChange: function (event) {
                  setComponentsText(event.target.value);
                },
              }),
          }),
      needsOther
        ? h(ML.Field, {
            label: t('compute.otherVector'),
            children: (id) =>
              h(ML.Input, {
                id: id,
                value: otherText,
                className: 'ml-mono',
                onChange: function (event) {
                  setOtherText(event.target.value);
                },
              }),
          })
        : null,
      h(
        'div',
        { className: 'ml-row' },
        h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
      ),
      call.loading ? h(ML.Loading, null) : null,
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: run }) : null,
      vector
        ? h(
            'div',
            { className: 'ml-stack-sm' },
            vector.map(function (entry, index) {
              return h(
                'div',
                { key: index, className: 'ml-row' },
                h('span', { className: 'ml-muted small' }, '[' + index + ']'),
                h(ML.Math, { tex: ML.exprLatex(entry) }),
                h(ML.CopyBtn, { size: 'sm', text: ML.exprLatex(entry), label: t('common.copyLatex') }),
              );
            }),
            h(ML.RawJSON, { value: result }),
          )
        : expr
          ? h(ML.ExprResult, { data: result })
          : result
            ? h(ML.DataView, { data: result })
            : null,
    );
  }

  function NumberTool() {
    const t = ML.useT();
    const [opName, setOpName] = useState('factorint');
    const [n, setN] = useState('360');
    const [k, setK] = useState('');
    const [modulus, setModulus] = useState('');
    const call = ML.useCall();
    const run = function () {
      const args = { op: opName };
      const nValue = toNumber(n);
      const kValue = toNumber(k);
      const modulusValue = toNumber(modulus);
      if (nValue !== undefined) args.n = nValue;
      if (kValue !== undefined) args.k = kValue;
      if (modulusValue !== undefined) args.modulus = modulusValue;
      call.run('calc.number', args);
    };
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-form-grid' },
        h(ML.Field, {
          label: t('compute.vectorOp'),
          children: (id) =>
            h(ML.Select, {
              id: id,
              value: opName,
              onChange: function (event) {
                setOpName(event.target.value);
              },
              options: NUMBER_OPS.map(function (id) {
                return { value: id, label: t('compute.num.' + id) };
              }),
            }),
        }),
        h(ML.Field, {
          label: t('compute.numberN'),
          children: (id) =>
            h(ML.Input, {
              id: id,
              value: n,
              inputMode: 'numeric',
              onChange: function (event) {
                setN(event.target.value);
              },
            }),
        }),
        h(ML.Field, {
          label: t('compute.numberK'),
          children: (id) =>
            h(ML.Input, {
              id: id,
              value: k,
              inputMode: 'numeric',
              onChange: function (event) {
                setK(event.target.value);
              },
            }),
        }),
        h(ML.Field, {
          label: t('compute.modulus'),
          children: (id) =>
            h(ML.Input, {
              id: id,
              value: modulus,
              inputMode: 'numeric',
              onChange: function (event) {
                setModulus(event.target.value);
              },
            }),
        }),
      ),
      h(
        'div',
        { className: 'ml-row' },
        h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
      ),
      call.loading ? h(ML.Loading, null) : null,
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: run }) : null,
      call.result !== null && call.result !== undefined
        ? h(
            'div',
            { className: 'ml-result' },
            h('div', { className: 'ml-result-caption' }, t('common.result')),
            h(NumberOutput, { data: call.result }),
          )
        : null,
    );
  }

  ML.tabs.compute = {
    id: 'compute',
    order: 10,
    Component: function ComputeTab(props) {
      const t = ML.useT();
      const [op, setOp] = useState('simplify');
      const [expr, setExpr] = useState('sin(x)**2 + cos(x)**2');
      const [fields, setFields] = useState(emptyFields);
      const [localError, setLocalError] = useState(null);
      const [history, setHistory] = useState(function () {
        const stored = ML.storage.get('compute.history', []);
        return Array.isArray(stored) ? stored : [];
      });
      const call = ML.useCall();
      const inputRef = useRef(null);
      const lastRun = useRef(null);

      const setField = function (key, value) {
        setFields(function (previous) {
          return Object.assign({}, previous, { [key]: value });
        });
      };

      const pushHistory = function (opName, args) {
        const entry = { op: opName, args: args, at: Date.now() };
        setHistory(function (previous) {
          const next = [entry].concat(previous).slice(0, 20);
          ML.storage.set('compute.history', next);
          return next;
        });
      };

      const execute = function (opName, args) {
        lastRun.current = { op: opName, args: args };
        call.run('calc.' + opName, args).then(function (response) {
          if (response.ok) pushHistory(opName, args);
        });
      };

      const runCurrent = function () {
        const built = buildArgs(op, expr, fields);
        if (built.error) {
          setLocalError(built);
          return;
        }
        setLocalError(null);
        execute(op, built.args);
      };

      const runExample = function (example) {
        const nextFields = Object.assign({}, fields, example.fields || {});
        const nextExpr = example.expr === undefined ? expr : example.expr;
        setOp(example.op);
        setFields(nextFields);
        if (example.expr !== undefined) setExpr(example.expr);
        const built = buildArgs(example.op, nextExpr, nextFields);
        if (built.error) {
          setLocalError(built);
          return;
        }
        setLocalError(null);
        execute(example.op, built.args);
      };

      const restore = function (entry) {
        const mapped = argsToState(entry.args);
        const opName = String(entry.op || '').replace(/^calc\./, '');
        setOp(OPS.some(function (item) { return item.id === opName; }) ? opName : 'simplify');
        setExpr(mapped.expr);
        setFields(mapped.fields);
        setLocalError(null);
      };

      const clearHistory = function () {
        setHistory([]);
        ML.storage.set('compute.history', []);
      };

      const insertSymbol = function (text) {
        const inserted = ML.insertAtActive(text);
        if (inserted) return;
        const node = inputRef.current;
        if (!node) return;
        node.focus();
        try {
          const end = node.value.length;
          node.setSelectionRange(end, end);
        } catch (error) {

        }
        ML.insertAtActive(text);
      };

      const meta = OPS.filter(function (item) {
        return item.id === op;
      })[0] || OPS[0];
      const showField = function (name) {
        return meta.fields.indexOf(name) >= 0;
      };

      React.useEffect(
        function () {
          if (!props.openAction || props.openAction.op === undefined) return;
          const action = props.openAction;
          const opName = String(action.op || '').replace(/^calc\./, '');
          const args = action.args || {};
          if (OPS.some(function (item) { return item.id === opName; })) {
            const mapped = argsToState(args);
            setOp(opName);
            setExpr(mapped.expr);
            setFields(mapped.fields);
            setLocalError(null);
            execute(opName, args);
          } else {

            call.run(action.op, args);
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const knownOps = OPS.map(function (item) {
        return { value: item.id, label: t('compute.op.' + item.id) };
      });

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('compute.hint') }, t('compute.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('compute.op'),
                children: (id) =>
                  h(ML.Select, {
                    id: id,
                    value: op,
                    onChange: function (event) {
                      const next = event.target.value;
                      setOp(next);
                      setLocalError(null);
                      if ((next === 'sum' || next === 'product') && fields.var === 'x') setField('var', 'n');
                    },
                    options: knownOps,
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { alignItems: 'flex-end', gap: 8 } },
                h(
                  ML.Btn,
                  { variant: 'primary', onClick: runCurrent, disabled: call.loading },
                  call.loading ? t('common.running') : t('common.run'),
                ),
                h('span', { className: 'ml-hint' }, t('compute.runShortcut')),
              ),
            ),
            h(ML.Field, {
              label: t('compute.expr'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  ref: inputRef,
                  rows: 3,
                  value: expr,
                  spellCheck: false,
                  placeholder: 'sin(x)**2 + cos(x)**2',
                  onKeyDown: function (event) {
                    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                      event.preventDefault();
                      runCurrent();
                    }
                  },
                  onChange: function (event) {
                    setExpr(event.target.value);
                  },
                }),
            }),
            h(
              'div',
              { className: 'ml-row' },
              h('span', { className: 'ml-hint' }, t('compute.palette')),
              PALETTE.map(function (symbol, index) {
                return h(
                  'button',
                  {
                    key: index,
                    type: 'button',
                    className: 'ml-kbd',
                    'aria-label': 'insert ' + symbol,
                    onMouseDown: function (event) {
                      event.preventDefault();
                    },
                    onClick: function () {
                      insertSymbol(symbol);
                    },
                  },
                  symbol,
                );
              }),
            ),
            (function () {
              const grid = [];
              if (showField('var')) {
                grid.push(
                  h(ML.Field, {
                    key: 'var',
                    label: t('compute.var'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        value: fields.var,
                        onChange: function (event) {
                          setField('var', event.target.value);
                        },
                      }),
                  }),
                );
              }
              if (showField('order')) {
                grid.push(
                  h(ML.Field, {
                    key: 'order',
                    label: t('compute.order'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        inputMode: 'numeric',
                        value: fields.order,
                        onChange: function (event) {
                          setField('order', event.target.value);
                        },
                      }),
                  }),
                );
              }
              if (showField('point')) {
                grid.push(
                  h(ML.Field, {
                    key: 'point',
                    label: t('compute.point'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        value: fields.point,
                        onChange: function (event) {
                          setField('point', event.target.value);
                        },
                      }),
                  }),
                );
              }
              if (showField('direction')) {
                grid.push(
                  h(ML.Field, {
                    key: 'direction',
                    label: t('compute.direction'),
                    children: (id) =>
                      h(ML.Select, {
                        id: id,
                        value: fields.direction,
                        onChange: function (event) {
                          setField('direction', event.target.value);
                        },
                        options: [
                          { value: 'both', label: 'both' },
                          { value: '+', label: '+' },
                          { value: '-', label: '−' },
                        ],
                      }),
                  }),
                );
              }
              for (const key of ['lower', 'upper']) {
                if (showField(key)) {
                  grid.push(
                    h(ML.Field, {
                      key: key,
                      label: key === 'lower' ? t('compute.lower') : t('compute.upper'),
                      children: (id) =>
                        h(ML.Input, {
                          id: id,
                          value: fields[key],
                          placeholder: key === 'lower' ? '-oo' : 'oo',
                          onChange: function (event) {
                            setField(key, event.target.value);
                          },
                        }),
                    }),
                  );
                }
              }
              if (showField('equations')) {
                grid.push(
                  h(
                    'div',
                    { key: 'equations', style: { gridColumn: '1 / -1' } },
                    h(ML.Field, {
                      label: t('compute.equations'),
                      children: (id) =>
                        h(ML.Textarea, {
                          id: id,
                          rows: 3,
                          value: fields.equations,
                          onChange: function (event) {
                            setField('equations', event.target.value);
                          },
                        }),
                    }),
                  ),
                );
              }
              if (showField('vars')) {
                grid.push(
                  h(ML.Field, {
                    key: 'vars',
                    label: t('compute.vars'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        value: fields.vars,
                        onChange: function (event) {
                          setField('vars', event.target.value);
                        },
                      }),
                  }),
                );
              }
              if (showField('eq')) {
                grid.push(
                  h(
                    'div',
                    { key: 'eq', style: { gridColumn: '1 / -1' } },
                    h(ML.Field, {
                      label: t('compute.eq'),
                      children: (id) =>
                        h(ML.Input, {
                          id: id,
                          value: fields.eq,
                          className: 'ml-mono',
                          onChange: function (event) {
                            setField('eq', event.target.value);
                          },
                        }),
                    }),
                  ),
                );
              }
              if (showField('func')) {
                grid.push(
                  h(ML.Field, {
                    key: 'func',
                    label: t('compute.func'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        value: fields.func,
                        onChange: function (event) {
                          setField('func', event.target.value);
                        },
                      }),
                  }),
                );
              }
              if (showField('ics')) {
                grid.push(
                  h(
                    'div',
                    { key: 'ics', style: { gridColumn: '1 / -1' } },
                    h(ML.Field, {
                      label: t('compute.ics'),
                      hint: '[{"x":0,"y":1}, {"x":0,"dy":0}]',
                      children: (id) =>
                        h(ML.Textarea, {
                          id: id,
                          rows: 2,
                          value: fields.ics,
                          onChange: function (event) {
                            setField('ics', event.target.value);
                          },
                        }),
                    }),
                  ),
                );
              }
              if (showField('subs')) {
                grid.push(
                  h(ML.Field, {
                    key: 'subs',
                    label: t('compute.subs'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        value: fields.subs,
                        className: 'ml-mono',
                        onChange: function (event) {
                          setField('subs', event.target.value);
                        },
                      }),
                  }),
                );
              }
              if (showField('digits')) {
                grid.push(
                  h(ML.Field, {
                    key: 'digits',
                    label: t('compute.digits'),
                    children: (id) =>
                      h(ML.Input, {
                        id: id,
                        inputMode: 'numeric',
                        value: fields.digits,
                        onChange: function (event) {
                          setField('digits', event.target.value);
                        },
                      }),
                  }),
                );
              }
              return grid.length
                ? h('div', { className: 'ml-form-grid', style: { marginTop: 10 } }, grid)
                : null;
            })(),
            h(
              'div',
              { className: 'ml-row', style: { marginTop: 12 } },
              h('span', { className: 'ml-hint' }, t('compute.examples')),
              EXAMPLES.map(function (example, index) {
                const lang = ML.lang(t);
                return h(
                  'button',
                  {
                    key: index,
                    type: 'button',
                    className: 'ml-chip',
                    onClick: function () {
                      runExample(example);
                    },
                  },
                  ML.pick(lang, example.zh, example.en),
                );
              }),
            ),
          ),
        ),
        localError
          ? h(
              ML.Banner,
              { tone: 'error' },
              localError.error === 'empty-expr'
                ? t('compute.emptyExpr')
                : localError.error === 'empty-equations'
                  ? t('compute.emptyEquations')
                  : localError.error === 'empty-vars'
                    ? t('compute.emptyVars')
                    : localError.error === 'invalid-ics'
                      ? t('compute.invalidICS') + (localError.detail || '')
                      : t('compute.invalidJSON') + (localError.detail || ''),
            )
          : null,
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('compute.result')),
            call.op ? h('span', { className: 'ml-hint' }, call.op) : null,
            call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
            call.result !== null && call.result !== undefined
              ? h(ML.CopyBtn, { text: ML.prettyJSON(call.result), label: t('common.json') })
              : null,
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            call.loading
              ? h(ML.Loading, null)
              : call.error
                ? h(ML.ErrorBox, {
                    error: call.error,
                    onRetry: function () {
                      if (lastRun.current) execute(lastRun.current.op, lastRun.current.args);
                    },
                  })
                : call.result === null || call.result === undefined
                  ? h(ML.Empty, { label: t('common.noResult') })
                  : op === 'solve'
                    ? h(SolveResult, { data: call.result })
                    : op === 'dsolve'
                      ? h(OdeResult, { data: call.result })
                      : op === 'approx'
                        ? h(ApproxResult, { data: call.result })
                        : ML.pickExpr(call.result)
                          ? h(ML.ExprResult, { data: call.result })
                          : h(ML.DataView, { data: call.result }),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('compute.history')),
            h('div', { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: clearHistory, disabled: history.length === 0 }, t('compute.clearHistory')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            history.length === 0
              ? h(ML.Empty, { label: t('compute.historyEmpty') })
              : h(
                  'ul',
                  { className: 'ml-list' },
                  history.map(function (entry, index) {
                    return h(
                      'li',
                      { key: index, className: 'ml-row', style: { gap: 10 } },
                      h('code', { className: 'ml-li-code' }, String(entry.op || '')),
                      h('span', { className: 'ml-muted ml-ellipsis', style: { flex: 1, minWidth: 0 } }, labelFor(entry.op, entry.args && (entry.args.expr || (entry.args.equations || []).join('; ')))),
                      h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: function () { restore(entry); } }, t('compute.restore')),
                    );
                  }),
                ),
          ),
        ),
        h(ML.Collapse, { title: t('compute.vector') }, h(VectorTool, null)),
        h(ML.Collapse, { title: t('compute.number') }, h(NumberTool, null)),
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useEffect = React.useEffect;

  ML.assignStrings(
    {
      'tab.linalg': '线代',
      'linalg.title': '线性代数',
      'linalg.hint': '矩阵元素可以是数字或 SymPy 表达式。',
      'linalg.matrix': '矩阵 A',
      'linalg.rhs': '右端向量 b',
      'linalg.op': '运算',
      'linalg.paste': '从文本导入',
      'linalg.pasteHint': '支持 CSV / TSV / 空格分隔行，或 JSON 数组。',
      'linalg.import': '导入',
      'linalg.random': '随机整数',
      'linalg.identity': '单位矩阵',
      'linalg.zeros': '零矩阵',
      'linalg.squareWarn': '该运算需要方阵。',
      'linalg.rhsWarn': 'solve/lstsq 需要长度等于行数的右端向量。',
      'linalg.rankNote': 'rank(A) ≤ min(m, n)；nullity = n − rank。',
      'linalg.detNote': 'det(A) ≠ 0 说明 A 可逆。',
      'linalg.basis': '零空间基',
      'linalg.dimension': '维数',
      'linalg.eigenvalues': '特征值',
      'linalg.eigenvectors': '特征向量（按列）',
      'linalg.singular': '奇异值',
      'linalg.result': '结果',
      'linalg.copyMatrix': '复制矩阵',
      'linalg.invalidMatrix': '矩阵解析失败：',
      'linalg.emptyMatrix': '请先输入矩阵。',
      'linalg.dims': '维数',
      'linalg.op.det': '行列式 det',
      'linalg.op.inv': '逆矩阵 inv',
      'linalg.op.rank': '秩 rank',
      'linalg.op.rref': '行最简形 rref',
      'linalg.op.eigen': '特征分解 eigen',
      'linalg.op.charpoly': '特征多项式 charpoly',
      'linalg.op.nullspace': '零空间 nullspace',
      'linalg.op.solve': '求解 Ax=b',
      'linalg.op.lstsq': '最小二乘 lstsq',
      'linalg.op.svd': '奇异值分解 SVD',
      'linalg.op.transpose': '转置 transpose',
      'linalg.matrixU': 'U',
      'linalg.matrixS': 'Σ',
      'linalg.matrixV': 'V',
    },
    {
      'tab.linalg': 'Linear',
      'linalg.title': 'Linear algebra',
      'linalg.hint': 'Entries may be numbers or SymPy expressions.',
      'linalg.matrix': 'Matrix A',
      'linalg.rhs': 'Right-hand side b',
      'linalg.op': 'Operation',
      'linalg.paste': 'Import from text',
      'linalg.pasteHint': 'CSV / TSV / whitespace rows, or a JSON array.',
      'linalg.import': 'Import',
      'linalg.random': 'Random integers',
      'linalg.identity': 'Identity',
      'linalg.zeros': 'Zeros',
      'linalg.squareWarn': 'This operation needs a square matrix.',
      'linalg.rhsWarn': 'solve/lstsq need a right-hand side with one entry per row.',
      'linalg.rankNote': 'rank(A) ≤ min(m, n); nullity = n − rank.',
      'linalg.detNote': 'det(A) ≠ 0 implies A is invertible.',
      'linalg.basis': 'Null-space basis',
      'linalg.dimension': 'Dimension',
      'linalg.eigenvalues': 'Eigenvalues',
      'linalg.eigenvectors': 'Eigenvectors (columns)',
      'linalg.singular': 'Singular values',
      'linalg.result': 'Result',
      'linalg.copyMatrix': 'Copy matrix',
      'linalg.invalidMatrix': 'Could not parse the matrix: ',
      'linalg.emptyMatrix': 'Enter a matrix first.',
      'linalg.dims': 'dimensions',
      'linalg.op.det': 'Determinant',
      'linalg.op.inv': 'Inverse',
      'linalg.op.rank': 'Rank',
      'linalg.op.rref': 'Reduced row echelon form',
      'linalg.op.eigen': 'Eigen decomposition',
      'linalg.op.charpoly': 'Characteristic polynomial',
      'linalg.op.nullspace': 'Null space',
      'linalg.op.solve': 'Solve Ax = b',
      'linalg.op.lstsq': 'Least squares',
      'linalg.op.svd': 'SVD',
      'linalg.op.transpose': 'Transpose',
      'linalg.matrixU': 'U',
      'linalg.matrixS': 'Σ',
      'linalg.matrixV': 'V',
    },
  );

  const OPS = ['det', 'inv', 'rank', 'rref', 'eigen', 'charpoly', 'nullspace', 'solve', 'lstsq', 'svd', 'transpose'];
  const MATRIX_FIELDS = ['matrix', 'inverse', 'transpose', 'rref', 'basis', 'nullspace', 'result', 'value', 'solution', 'x'];

  const INITIAL_MATRIX = [
    ['1', '2', '3'],
    ['0', '1', '4'],
    ['5', '6', '0'],
  ];

  function randomMatrix(rows, cols) {
    return Array.from({ length: rows }, function () {
      return Array.from({ length: cols }, function () {
        return String(Math.floor(Math.random() * 19) - 9);
      });
    });
  }

  function identityMatrix(size) {
    return Array.from({ length: size }, function (row) {
      return Array.from({ length: size }, function (column) {
        return row === column ? '1' : '0';
      });
    });
  }

  function exprListToMath(values) {
    return ML.toArr(values).map(function (value) {
      if (ML.isObj(value)) return ML.exprLatex(value);
      return ML.safeString(value, 200);
    });
  }

  function findMatrix(data) {
    if (!ML.isObj(data)) return null;
    for (const key of MATRIX_FIELDS) {
      if (ML.matrixLike(data[key])) return { key: key, matrix: data[key] };
    }
    return null;
  }

  function MatrixResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    const op = props.op;
    const fields = [];

    if (op === 'det') {
      const expr = ML.pickExpr(data);
      return expr
        ? h(ML.ExprResult, { data: expr })
        : h(ML.DataView, { data: data });
    }

    if (op === 'rank') {
      const rank = data.rank !== undefined ? data.rank : data.value;
      return h(
        'div',
        { className: 'ml-stack-sm' },
        h(ML.Stat, { label: 'rank(A)', value: ML.safeString(rank), sub: t('linalg.rankNote') }),
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    if (op === 'charpoly') {
      const expr = ML.pickExpr(data);
      if (expr) return h(ML.ExprResult, { data: expr });
      if (typeof data.poly === 'string' || typeof data.latex === 'string') {
        return h(
          'div',
          { className: 'ml-stack-sm' },
          h(ML.FormulaBlock, { tex: data.latex || data.poly }),
          h(ML.RawJSON, { value: data }),
        );
      }
      return h(ML.DataView, { data: data });
    }

    if (op === 'eigen') {
      const values = ML.toArr(data.values).map(function (value) {
        return ML.isObj(value) ? ML.exprLatex(value) : ML.safeString(value, 200);
      });
      const vectors = data.vectors;
      return h(
        'div',
        { className: 'ml-stack' },
        h(
          'div',
          null,
          h(ML.SectionTitle, null, t('linalg.eigenvalues')),
          h(
            'div',
            { className: 'ml-row' },
            values.length
              ? values.map(function (latex, index) {
                  return h(
                    'span',
                    { key: index, className: 'ml-badge ml-badge-brand' },
                    h(ML.Math, { tex: latex }),
                  );
                })
              : h(ML.Empty, null),
          ),
        ),
        vectors
          ? h(
              'div',
              null,
              h(ML.SectionTitle, null, t('linalg.eigenvectors')),
              h(ML.MatrixView, { matrix: vectors }),
            )
          : null,
        data.pretty ? h(ML.Collapse, { title: 'pretty' }, h('pre', { className: 'ml-pre' }, data.pretty)) : null,
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    if (op === 'svd') {
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.MatrixView, { matrix: data.U, label: t('linalg.matrixU') }),
        Array.isArray(data.S) && !ML.matrixLike(data.S)
          ? h(
              'div',
              null,
              h(ML.SectionTitle, null, t('linalg.matrixS')),
              h(
                'div',
                { className: 'ml-row' },
                exprListToMath(data.S).map(function (latex, index) {
                  return h(ML.Math, { key: index, tex: latex });
                }),
              ),
            )
          : h(ML.MatrixView, { matrix: data.S, label: t('linalg.matrixS') }),
        h(ML.MatrixView, { matrix: data.V, label: t('linalg.matrixV') }),
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    if (op === 'nullspace') {
      const basis = data.basis !== undefined ? data.basis : findMatrix(data) ? findMatrix(data).matrix : null;
      const dimension = data.dimension !== undefined ? data.dimension : Array.isArray(basis) ? basis.length : null;
      return h(
        'div',
        { className: 'ml-stack' },
        basis ? h(ML.MatrixView, { matrix: basis, label: t('linalg.basis') }) : h(ML.Empty, null),
        h(ML.KV, {
          rows: [dimension !== null ? { label: t('linalg.dimension'), value: String(dimension) } : null].filter(Boolean),
        }),
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    const found = findMatrix(data);
    if (found) {
      fields.push(
        h(
          'div',
          { key: 'matrix' },
          h(ML.SectionTitle, null, t('linalg.matrix')),
          h(ML.MatrixView, { matrix: found.matrix }),
          h(
            'div',
            { className: 'ml-row', style: { marginTop: 6 } },
            h(ML.CopyBtn, { text: ML.matrixText(found.matrix), label: t('linalg.copyMatrix') }),
          ),
        ),
      );
    }
    if (Array.isArray(data.solution) && !ML.matrixLike(data.solution)) {
      fields.push(
        h(
          'div',
          { key: 'sol' },
          h(ML.SectionTitle, null, t('common.result')),
          h(
            'div',
            { className: 'ml-row' },
            exprListToMath(data.solution).map(function (latex, index) {
              return h(ML.Math, { key: index, tex: latex });
            }),
          ),
        ),
      );
    }
    if (fields.length === 0) return h(ML.DataView, { data: data });
    return h('div', { className: 'ml-stack' }, fields, h(ML.Notes, { notes: data.notes }), h(ML.RawJSON, { value: data }));
  }

  ML.tabs.linalg = {
    id: 'linalg',
    order: 20,
    Component: function LinalgTab(props) {
      const t = ML.useT();
      const [matrix, setMatrix] = useState(INITIAL_MATRIX);
      const [rhs, setRhs] = useState(['1', '2', '3']);
      const [op, setOp] = useState('det');
      const [importText, setImportText] = useState('');
      const [importError, setImportError] = useState(null);
      const [localWarning, setLocalWarning] = useState(null);
      const call = ML.useCall();
      const inputRef = useRef(null);

      const rows = matrix.length;
      const cols = rows ? matrix[0].length : 0;
      const square = rows === cols;
      const needsRhs = op === 'solve' || op === 'lstsq';
      const needsSquare = op === 'det' || op === 'inv' || op === 'eigen' || op === 'charpoly';

      useEffect(
        function () {
          if (needsSquare && !square) setLocalWarning(t('linalg.squareWarn'));
          else if (needsRhs && rhs.length !== rows) setLocalWarning(t('linalg.rhsWarn'));
          else setLocalWarning(null);
        },
        [needsSquare, needsRhs, square, rows, rhs.length, t],
      );

      const run = function () {
        if (rows === 0 || cols === 0) {
          setLocalWarning(t('linalg.emptyMatrix'));
          return;
        }
        const args = { op: op, matrix: matrix };
        if (needsRhs) {
          const values = [];
          for (let index = 0; index < rows; index += 1) values.push(rhs[index] === undefined ? '0' : rhs[index]);
          args.rhs = values;
          setRhs(values);
        }
        setLocalWarning(null);
        call.run('calc.matrix', args);
      };

      const doImport = function () {
        const parsed = ML.parseMatrix(importText);
        if (parsed.error) {
          setImportError(parsed.error);
          return;
        }
        setImportError(null);
        setMatrix(parsed.matrix);
        setRhs(parsed.matrix.map(function () { return '0'; }));
        setImportText('');
      };

      const updateRhs = function (index, value) {
        setRhs(function (previous) {
          const next = previous.slice();
          while (next.length < rows) next.push('0');
          next[index] = value;
          return next.slice(0, Math.max(rows, 1));
        });
      };

      React.useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          if (action.op !== 'calc.matrix') return;
          const args = action.args || {};
          if (ML.matrixLike(args.matrix)) {
            setMatrix(args.matrix.map(function (row) {
              return row.map(function (cell) { return ML.safeString(cell, 200); });
            }));
          }
          if (Array.isArray(args.rhs)) {
            setRhs(args.rhs.map(function (cell) { return ML.safeString(cell, 200); }));
          }
          if (OPS.indexOf(args.op) >= 0) setOp(args.op);
          call.run('calc.matrix', args);
        },
        [props.openAction && props.openAction.seq],
      );

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('linalg.hint') }, t('linalg.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('linalg.op'),
                children: (id) =>
                  h(ML.Select, {
                    id: id,
                    value: op,
                    onChange: function (event) {
                      setOp(event.target.value);
                    },
                    options: OPS.map(function (name) {
                      return { value: name, label: t('linalg.op.' + name) };
                    }),
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { alignItems: 'flex-end' } },
                h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
              ),
            ),
            h('div', { style: { marginTop: 12 } }, h(ML.MatrixEditor, {
              matrix: matrix,
              onChange: function (next) {
                setMatrix(next);
                setImportError(null);
              },
              minRows: 1,
              maxRows: 12,
              minCols: 1,
              maxCols: 12,
              ariaLabel: 'matrix A',
              extra: t('linalg.dims') + ' ' + rows + '×' + cols,
            })),
            needsRhs
              ? h(
                  'div',
                  { style: { marginTop: 12 } },
                  h(ML.SectionTitle, null, t('linalg.rhs')),
                  h(
                    'div',
                    { className: 'ml-row' },
                    Array.from({ length: rows }).map(function (unused, index) {
                      return h('input', {
                        key: index,
                        className: 'ml-matrix-input',
                        style: { width: 72 },
                        value: rhs[index] === undefined ? '0' : rhs[index],
                        'aria-label': 'b' + (index + 1),
                        onChange: function (event) {
                          updateRhs(index, event.target.value);
                        },
                      });
                    }),
                    h(ML.Btn, {
                      size: 'sm',
                      onClick: function () {
                        setRhs(Array.from({ length: rows }, function () { return String(Math.floor(Math.random() * 9) + 1); }));
                      },
                    }, t('linalg.random')),
                  ),
                )
              : null,
            h(
              'div',
              { className: 'ml-toolbar' },
              h(ML.Btn, {
                size: 'sm',
                onClick: function () {
                  setMatrix(function (previous) {
                    return randomMatrix(previous.length, previous[0] ? previous[0].length : 1);
                  });
                },
              }, t('linalg.random')),
              h(ML.Btn, {
                size: 'sm',
                onClick: function () {
                  const size = rows || 3;
                  setMatrix(identityMatrix(size));
                },
              }, t('linalg.identity')),
              h(ML.Btn, {
                size: 'sm',
                onClick: function () {
                  setMatrix(matrix.map(function (row) { return row.map(function () { return '0'; }); }));
                },
              }, t('linalg.zeros')),
              h(ML.CopyBtn, { text: ML.matrixText(matrix), label: t('linalg.copyMatrix') }),
            ),
            h(
              ML.Collapse,
              { title: t('linalg.paste') },
              h(ML.Field, {
                label: t('linalg.pasteHint'),
                children: (id) =>
                  h(ML.Textarea, {
                    id: id,
                    rows: 4,
                    value: importText,
                    placeholder: '1 2 3\n4 5 6\n7 8 10',
                    onChange: function (event) {
                      setImportText(event.target.value);
                    },
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { marginTop: 8 } },
                h(ML.Btn, { size: 'sm', variant: 'primary', onClick: doImport }, t('linalg.import')),
              ),
              importError ? h(ML.Banner, { tone: 'error' }, t('linalg.invalidMatrix') + importError) : null,
            ),
            localWarning ? h(ML.Banner, { tone: 'warn' }, localWarning) : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('linalg.result')),
            call.op ? h('span', { className: 'ml-hint' }, call.op) : null,
            call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            call.loading
              ? h(ML.Loading, null)
              : call.error
                ? h(ML.ErrorBox, { error: call.error, onRetry: run })
                : call.result === null || call.result === undefined
                  ? h(ML.Empty, { label: t('common.noResult') })
                  : h(MatrixResult, { data: call.result, op: op }),
          ),
        ),
        h(ML.Notes, { notes: [] }),
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;

  ML.assignStrings(
    {
      'tab.algebra': '代数',
      'algebra.title': '抽象代数',
      'algebra.section.perm': '置换',
      'algebra.section.group': '群',
      'algebra.section.field': '有限域',
      'algebra.section.ring': '剩余类环',
      'algebra.permInput': '置换（轮换记法）',
      'algebra.mappingInput': '映射（1-based 像，逗号分隔）',
      'algebra.permHint': '例如 (1 2 3)(4 5)；缺省点视为不动点。',
      'algebra.other': '第二个置换',
      'algebra.n': '作用点数 n（可选）',
      'algebra.op': '运算',
      'algebra.cycles': '轮换分解',
      'algebra.mapping': '映射表',
      'algebra.order': '阶',
      'algebra.parity': '奇偶性',
      'algebra.cycleType': '轮换型',
      'algebra.perm.multiply': '乘法',
      'algebra.perm.inverse': '逆',
      'algebra.perm.order': '阶',
      'algebra.perm.cycle_type': '轮换型',
      'algebra.perm.sign': '符号',
      'algebra.perm.conjugate': '共轭',
      'algebra.perm.to_mapping': '转映射',
      'algebra.perm.from_mapping': '由映射构造',
      'algebra.groupTitle': '有限群探索',
      'algebra.generators': '生成元（每行一个轮换，或 JSON [[[...]]]）',
      'algebra.groupHint': '例如 S3：两行 (1 2 3) 与 (1 2)，n = 3。',
      'algebra.groupOp': '查询',
      'algebra.group.order': '阶',
      'algebra.group.elements': '元素',
      'algebra.group.is_abelian': '是否交换',
      'algebra.group.element_orders': '元素阶分布',
      'algebra.group.center': '中心',
      'algebra.group.commutator': '换位子群',
      'algebra.group.conjugacy_classes': '共轭类',
      'algebra.group.subgroups': '子群',
      'algebra.group.subgroup_lattice': '子群格',
      'algebra.group.normal_subgroups': '正规子群',
      'algebra.group.cayley_table': '凯莱表',
      'algebra.group.is_solvable': '是否可解',
      'algebra.group.is_nilpotent': '是否幂零',
      'algebra.group.is_simple': '是否单群',
      'algebra.group.sylow': 'Sylow 子群',
      'algebra.group.quotient': '商群',
      'algebra.group.homomorphism': '同态',
      'algebra.normal': '正规子群生成元（每行一个轮换）',
      'algebra.targetGenerators': '目标群生成元',
      'algebra.images': '生成元像（每行一个）',
      'algebra.presets': '预设',
      'algebra.preset.s3': 'S₃',
      'algebra.preset.d4': 'D₄',
      'algebra.preset.z6': 'ℤ/6',
      'algebra.preset.a4': 'A₄',
      'algebra.preset.v4': 'V₄',
      'algebra.elementId': '元素',
      'algebra.elementOrder': '阶',
      'algebra.elementParity': '奇偶',
      'algebra.subgroupOrder': '|H|',
      'algebra.normalBadge': '正规',
      'algebra.maximalBadge': '极大',
      'algebra.fieldTitle': '有限域 GF(pⁿ)',
      'algebra.p': '特征 p',
      'algebra.degree': '扩张次数 n',
      'algebra.fieldA': 'a',
      'algebra.fieldB': 'b',
      'algebra.fieldOp': '运算',
      'algebra.field.add': '加法 a + b',
      'algebra.field.sub': '减法 a − b',
      'algebra.field.mul': '乘法 a · b',
      'algebra.field.div': '除法 a / b',
      'algebra.field.inv': '逆 a⁻¹',
      'algebra.field.pow': '幂 a^k',
      'algebra.field.table': '运算表',
      'algebra.field.order': '域阶',
      'algebra.field.primitive_element': '本原元',
      'algebra.field.is_irreducible': '不可约多项式判定',
      'algebra.poly': '多项式',
      'algebra.irreduciblePoly': '不可约多项式',
      'algebra.value': '值',
      'algebra.addTable': '加法表',
      'algebra.mulTable': '乘法表',
      'algebra.ringTitle': '剩余类环 ℤ/nℤ',
      'algebra.ringOp': '查询',
      'algebra.ring.units': '单位群',
      'algebra.ring.zero_divisors': '零因子',
      'algebra.ring.is_field': '是否域',
      'algebra.ring.is_integral_domain': '是否整环',
      'algebra.ring.addition_table': '加法表',
      'algebra.ring.multiplication_table': '乘法表',
      'algebra.ringN': 'n',
      'algebra.fieldLabel': 'GF({q})',
      'algebra.polyFormula': '多项式 f',
      'algebra.polyP': '模 p（0 表示 ℚ）',
      'algebra.polyOp': '运算',
      'algebra.polyOther': '第二个多项式',
      'algebra.poly.degree': '次数',
      'algebra.poly.factor': '因式分解',
      'algebra.poly.roots': '根',
      'algebra.poly.gcd': '最大公因式',
      'algebra.poly.is_irreducible': '不可约判定',
      'algebra.poly.evaluate': '在 x 处求值',
      'algebra.invalidCycles': '轮换解析失败：',
      'algebra.invalidGenerators': '生成元解析失败：',
      'algebra.permCopied': '已复制',
      'algebra.copyCycles': '复制轮换',
      'algebra.kernel': '核',
      'algebra.image': '像',
      'algebra.valid': '合法',
      'algebra.invalid': '不合法',
    },
    {
      'tab.algebra': 'Algebra',
      'algebra.title': 'Abstract algebra',
      'algebra.section.perm': 'Permutations',
      'algebra.section.group': 'Groups',
      'algebra.section.field': 'Finite fields',
      'algebra.section.ring': 'Z/nZ',
      'algebra.permInput': 'Permutation (cycle notation)',
      'algebra.mappingInput': 'Mapping (1-based images, comma separated)',
      'algebra.permHint': 'e.g. (1 2 3)(4 5); omitted points are fixed.',
      'algebra.other': 'Second permutation',
      'algebra.n': 'Degree n (optional)',
      'algebra.op': 'Operation',
      'algebra.cycles': 'Cycle decomposition',
      'algebra.mapping': 'Mapping',
      'algebra.order': 'Order',
      'algebra.parity': 'Parity',
      'algebra.cycleType': 'Cycle type',
      'algebra.perm.multiply': 'Multiply',
      'algebra.perm.inverse': 'Inverse',
      'algebra.perm.order': 'Order',
      'algebra.perm.cycle_type': 'Cycle type',
      'algebra.perm.sign': 'Sign',
      'algebra.perm.conjugate': 'Conjugate',
      'algebra.perm.to_mapping': 'To mapping',
      'algebra.perm.from_mapping': 'From mapping',
      'algebra.groupTitle': 'Finite group explorer',
      'algebra.generators': 'Generators (one cycle per line, or JSON [[[...]]])',
      'algebra.groupHint': 'S3 example: lines (1 2 3) and (1 2), n = 3.',
      'algebra.groupOp': 'Query',
      'algebra.group.order': 'Order',
      'algebra.group.elements': 'Elements',
      'algebra.group.is_abelian': 'Abelian?',
      'algebra.group.element_orders': 'Element orders',
      'algebra.group.center': 'Center',
      'algebra.group.commutator': 'Commutator subgroup',
      'algebra.group.conjugacy_classes': 'Conjugacy classes',
      'algebra.group.subgroups': 'Subgroups',
      'algebra.group.subgroup_lattice': 'Subgroup lattice',
      'algebra.group.normal_subgroups': 'Normal subgroups',
      'algebra.group.cayley_table': 'Cayley table',
      'algebra.group.is_solvable': 'Solvable?',
      'algebra.group.is_nilpotent': 'Nilpotent?',
      'algebra.group.is_simple': 'Simple?',
      'algebra.group.sylow': 'Sylow subgroups',
      'algebra.group.quotient': 'Quotient',
      'algebra.group.homomorphism': 'Homomorphism',
      'algebra.normal': 'Normal subgroup generators (one cycle per line)',
      'algebra.targetGenerators': 'Target generators',
      'algebra.images': 'Generator images (one per line)',
      'algebra.presets': 'Presets',
      'algebra.preset.s3': 'S₃',
      'algebra.preset.d4': 'D₄',
      'algebra.preset.z6': 'ℤ/6',
      'algebra.preset.a4': 'A₄',
      'algebra.preset.v4': 'V₄',
      'algebra.elementId': 'Element',
      'algebra.elementOrder': 'Order',
      'algebra.elementParity': 'Parity',
      'algebra.subgroupOrder': '|H|',
      'algebra.normalBadge': 'normal',
      'algebra.maximalBadge': 'maximal',
      'algebra.fieldTitle': 'Finite field GF(pⁿ)',
      'algebra.p': 'Characteristic p',
      'algebra.degree': 'Degree n',
      'algebra.fieldA': 'a',
      'algebra.fieldB': 'b',
      'algebra.fieldOp': 'Operation',
      'algebra.field.add': 'a + b',
      'algebra.field.sub': 'a − b',
      'algebra.field.mul': 'a · b',
      'algebra.field.div': 'a / b',
      'algebra.field.inv': 'a⁻¹',
      'algebra.field.pow': 'a^k',
      'algebra.field.table': 'Operation tables',
      'algebra.field.order': 'Field order',
      'algebra.field.primitive_element': 'Primitive element',
      'algebra.field.is_irreducible': 'Irreducibility test',
      'algebra.poly': 'Polynomial',
      'algebra.irreduciblePoly': 'Irreducible polynomial',
      'algebra.value': 'Value',
      'algebra.addTable': 'Addition table',
      'algebra.mulTable': 'Multiplication table',
      'algebra.ringTitle': 'Residue ring ℤ/nℤ',
      'algebra.ringOp': 'Query',
      'algebra.ring.units': 'Units',
      'algebra.ring.zero_divisors': 'Zero divisors',
      'algebra.ring.is_field': 'Field?',
      'algebra.ring.is_integral_domain': 'Integral domain?',
      'algebra.ring.addition_table': 'Addition table',
      'algebra.ring.multiplication_table': 'Multiplication table',
      'algebra.ringN': 'n',
      'algebra.fieldLabel': 'GF({q})',
      'algebra.polyFormula': 'Polynomial f',
      'algebra.polyP': 'Modulus p (0 = ℚ)',
      'algebra.polyOp': 'Operation',
      'algebra.polyOther': 'Second polynomial',
      'algebra.poly.degree': 'Degree',
      'algebra.poly.factor': 'Factor',
      'algebra.poly.roots': 'Roots',
      'algebra.poly.gcd': 'GCD',
      'algebra.poly.is_irreducible': 'Irreducible?',
      'algebra.poly.evaluate': 'Evaluate at x',
      'algebra.invalidCycles': 'Could not parse the cycles: ',
      'algebra.invalidGenerators': 'Could not parse the generators: ',
      'algebra.permCopied': 'copied',
      'algebra.copyCycles': 'Copy cycles',
      'algebra.kernel': 'Kernel',
      'algebra.image': 'Image',
      'algebra.valid': 'valid',
      'algebra.invalid': 'invalid',
    },
  );

  const PERM_OPS = ['multiply', 'inverse', 'order', 'cycle_type', 'sign', 'conjugate', 'to_mapping', 'from_mapping'];
  const GROUP_OPS = [
    'order',
    'elements',
    'is_abelian',
    'element_orders',
    'center',
    'commutator',
    'conjugacy_classes',
    'subgroups',
    'subgroup_lattice',
    'normal_subgroups',
    'cayley_table',
    'is_solvable',
    'is_nilpotent',
    'is_simple',
    'sylow',
    'quotient',
    'homomorphism',
  ];
  const FIELD_OPS = ['add', 'sub', 'mul', 'div', 'inv', 'pow', 'table', 'order', 'primitive_element', 'is_irreducible'];
  const RING_OPS = ['units', 'zero_divisors', 'is_field', 'is_integral_domain', 'addition_table', 'multiplication_table'];
  const POLY_OPS = ['degree', 'factor', 'roots', 'gcd', 'is_irreducible', 'evaluate'];

  const GROUP_PRESETS = {
    s3: { lines: '(1 2 3)\n(1 2)', n: '3' },
    d4: { lines: '(1 2 3 4)\n(1 3)', n: '4' },
    z6: { lines: '(1 2 3 4 5 6)', n: '6' },
    a4: { lines: '(1 2 3)\n(2 3 4)', n: '4' },
    v4: { lines: '(1 2)(3 4)\n(1 3)(2 4)', n: '4' },
  };

  function cyclesToText(cycles) {
    return ML.toArr(cycles)
      .map(function (cycle) {
        return '(' + ML.toArr(cycle).join(' ') + ')';
      })
      .join('');
  }

  function parseGenerators(text) {
    const raw = String(text || '').trim();
    if (!raw) return { generators: [], error: null };
    if (raw.charAt(0) === '[') {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return { generators: [], error: 'expected an array' };
        const generators = parsed.map(function (generator) {
          return ML.toArr(generator).map(function (cycle) {
            return ML.toArr(cycle).map(function (point) {
              return parseInt(point, 10);
            });
          });
        });
        return { generators: generators, error: null };
      } catch (error) {
        return { generators: [], error: error.message };
      }
    }
    const generators = [];
    for (const line of ML.lines(raw)) {
      const parsed = ML.parseCycles(line);
      if (parsed.error) return { generators: [], error: parsed.error };
      generators.push(parsed.cycles);
    }
    return { generators: generators, error: null };
  }

  function boolBadge(t, value) {
    return h(ML.Badge, { tone: value ? 'success' : 'error' }, value ? t('algebra.valid') : t('algebra.invalid'));
  }

  function MappingTable(props) {
    const mapping = props.mapping;
    let pairs = [];
    if (Array.isArray(mapping)) {
      if (mapping.length && Array.isArray(mapping[0]) && mapping[0].length === 2) {
        pairs = mapping.map(function (pair) {
          return [String(pair[0]), String(pair[1])];
        });
      } else {
        pairs = mapping.map(function (value, index) {
          return [String(index + 1), ML.safeString(value)];
        });
      }
    } else if (ML.isObj(mapping)) {
      pairs = Object.keys(mapping).map(function (key) {
        return [String(key), ML.safeString(mapping[key])];
      });
    }
    if (pairs.length === 0) return null;
    return h(ML.LabeledTable, {
      rowLabels: ['i', 'σ(i)'],
      colLabels: pairs.map(function (pair) { return pair[0]; }),
      corner: 'σ',
      cells: [pairs.map(function (pair) { return pair[0]; }), pairs.map(function (pair) { return pair[1]; })],
      className: 'ml-mapping',
    });
  }

  function PermTool(props) {
    const t = ML.useT();
    const [text, setText] = useState('(1 2 3)(4 5)');
    const [otherText, setOtherText] = useState('(1 2)');
    const [nText, setNText] = useState('5');
    const [op, setOp] = useState('multiply');
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();
    const lastArgs = useRef(null);

    const run = function (argsOverride) {
      const args = argsOverride || { op: op };
      if (!argsOverride) {
        if (op === 'from_mapping') {
          const parsedMapping = ML.parseList(text);
          const mapping = parsedMapping.values.map(function (value) { return parseInt(value, 10); });
          if (mapping.length === 0 || mapping.some(function (value) { return !Number.isInteger(value) || value < 1; })) {
            return setLocalError(t('algebra.invalidCycles') + 'mapping wants 1-based images');
          }
          args.mapping = mapping;
        } else {
          const parsed = ML.parseCycles(text);
          if (parsed.error) return setLocalError(t('algebra.invalidCycles') + parsed.error);
          args.cycles = parsed.cycles;
          const needsOther = op === 'multiply' || op === 'conjugate';
          if (needsOther) {
            const other = ML.parseCycles(otherText);
            if (other.error) return setLocalError(t('algebra.invalidCycles') + other.error);
            args.other = other.cycles;
          }
        }
        const n = parseInt(nText, 10);
        if (Number.isInteger(n) && n > 0) args.n = n;
      }
      setLocalError(null);
      lastArgs.current = { op: args.op, args: args };
      call.run('algebra.perm', args);
    };

    useEffect(
      function () {
        if (!props.openAction || String(props.openAction.op || '').indexOf('algebra.perm') !== 0) return;
        const args = props.openAction.args || {};
        if (Array.isArray(args.cycles)) setText(cyclesToText(args.cycles));
        if (Array.isArray(args.other)) setOtherText(cyclesToText(args.other));
        if (args.n !== undefined) setNText(String(args.n));
        if (PERM_OPS.indexOf(args.op) >= 0) setOp(args.op);
        call.run('algebra.perm', args);
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    const needsOther = op === 'multiply' || op === 'conjugate';
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd' },
          h(ML.Field, {
            label: op === 'from_mapping' ? t('algebra.mappingInput') : t('algebra.permInput'),
            hint: op === 'from_mapping' ? '2, 3, 1' : t('algebra.permHint'),
            children: (id) =>
              h(ML.Input, {
                id: id,
                value: text,
                className: 'ml-mono',
                onChange: function (event) {
                  setText(event.target.value);
                },
              }),
          }),
          h(
            'div',
            { className: 'ml-form-grid', style: { marginTop: 10 } },
            h(ML.Field, {
              label: t('algebra.op'),
              children: (id) =>
                h(ML.Select, {
                  id: id,
                  value: op,
                  onChange: function (event) {
                    setOp(event.target.value);
                    setLocalError(null);
                  },
                  options: PERM_OPS.map(function (name) {
                    return { value: name, label: t('algebra.perm.' + name) };
                  }),
                }),
            }),
            needsOther
              ? h(ML.Field, {
                  label: t('algebra.other'),
                  children: (id) =>
                    h(ML.Input, {
                      id: id,
                      value: otherText,
                      className: 'ml-mono',
                      onChange: function (event) {
                        setOtherText(event.target.value);
                      },
                    }),
                })
              : null,
            h(ML.Field, {
              label: t('algebra.n'),
              children: (id) =>
                h(ML.Input, {
                  id: id,
                  value: nText,
                  inputMode: 'numeric',
                  onChange: function (event) {
                    setNText(event.target.value);
                  },
                }),
            }),
          ),
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
          ),
          localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        ),
      ),
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run('algebra.perm', lastArgs.current.args); } }) : null,
      call.loading ? h(ML.Loading, null) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('common.result'))),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              h(
                'div',
                { className: 'ml-row' },
                data.cycles ? h('span', { className: 'ml-mono' }, cyclesToText(data.cycles)) : null,
                data.cycles ? h(ML.CopyBtn, { text: cyclesToText(data.cycles), label: t('algebra.copyCycles') }) : null,
              ),
              h(
                'div',
                { className: 'ml-stats' },
                data.order !== undefined ? h(ML.Stat, { label: t('algebra.order'), value: String(data.order) }) : null,
                data.parity !== undefined
                  ? h(ML.Stat, {
                      label: t('algebra.parity'),
                      value: data.parity === 'even' ? 'even' : data.parity === 'odd' ? 'odd' : ML.safeString(data.parity),
                    })
                  : null,
                data.cycle_type
                  ? h(ML.Stat, { label: t('algebra.cycleType'), value: ML.safeString(data.cycle_type) })
                  : null,
              ),
              data.mapping ? h(MappingTable, { mapping: data.mapping }) : null,
              data.pretty ? h('pre', { className: 'ml-pre' }, data.pretty) : null,
            ),
          )
        : null,
    );
  }

  function GroupResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    const op = props.op;
    if (op === 'order') return h(ML.Stat, { label: t('algebra.group.order'), value: String(data.order !== undefined ? data.order : ML.safeString(data.value)) });
    if (op === 'elements') {
      const elements = ML.toArr(data.elements);
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.Stat, { label: t('algebra.group.order'), value: String(data.order !== undefined ? data.order : elements.length) }),
        h(ML.LabeledTable, {
          rowLabels: elements.map(function (element) { return String(element.id); }),
          colLabels: [t('algebra.elementId'), t('algebra.cycles'), t('algebra.elementOrder'), t('algebra.elementParity')],
          corner: '#',
          cells: elements.map(function (element) {
            return [
              String(element.id),
              cyclesToText(element.cycles) || 'e',
              String(element.order),
              String(element.parity),
            ];
          }),
        }),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'cayley_table') {
      return h(ML.CayleyTable, { elements: ML.toArr(data.elements), table: ML.toArr(data.table), corner: '∘' });
    }
    if (op === 'subgroup_lattice') {
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.HasseDiagram, { nodes: data.nodes, edges: data.edges }),
        h(ML.Stat, { label: t('algebra.group.subgroups'), value: String(ML.toArr(data.nodes).length) }),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'subgroups' || op === 'normal_subgroups') {
      const subgroups = ML.toArr(data.subgroups);
      return h(ML.LabeledTable, {
        rowLabels: subgroups.map(function (subgroup) { return String(subgroup.order); }),
        colLabels: [t('algebra.subgroupOrder'), t('algebra.generators'), 'elements'],
        corner: '#',
        cells: subgroups.map(function (subgroup) {
          return [
            String(subgroup.order),
            ML.toArr(subgroup.generators).map(function (generator) { return cyclesToText(generator) || 'e'; }).join(' , ') || 'e',
            ML.toArr(subgroup.cycles).join(', '),
          ];
        }),
      });
    }
    if (op === 'quotient') {
      return h(
        'div',
        { className: 'ml-stack' },
        h(
          'div',
          { className: 'ml-stats' },
          h(ML.Stat, { label: t('algebra.group.order'), value: ML.safeString(data.order) }),
          data.abelian !== undefined ? h(ML.Badge, { tone: data.abelian ? 'success' : 'idle' }, data.abelian ? t('algebra.group.is_abelian') : 'non-abelian') : null,
          data.name ? h(ML.Badge, { tone: 'brand' }, String(data.name)) : null,
        ),
        h(ML.LabeledTable, {
          rowLabels: ML.toArr(data.elements).map(function (element, index) { return String(index); }),
          colLabels: ['label', 'coset'],
          cells: ML.toArr(data.elements).map(function (element) {
            return [ML.safeString(element.label), ML.safeString(ML.toArr(element.coset).join(','))];
          }),
        }),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'sylow') {
      const primes = ML.toArr(data.primes);
      return h(ML.LabeledTable, {
        rowLabels: primes.map(function (entry) { return String(entry.p); }),
        colLabels: ['p', 'count', 'orders'],
        cells: primes.map(function (entry) {
          return [String(entry.p), String(entry.count), ML.toArr(entry.orders).join(', ')];
        }),
      });
    }
    if (op === 'homomorphism') {
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.Badge, { tone: data.valid ? 'success' : 'error' }, data.valid ? t('algebra.valid') : t('algebra.invalid') + ' ' + ML.safeString(data.reason || '')),
        h(ML.KV, {
          rows: [
            data.kernel !== undefined ? { label: t('algebra.kernel'), value: ML.safeString(ML.toArr(data.kernel).join(', ')) } : null,
            data.image !== undefined ? { label: t('algebra.image'), value: ML.safeString(ML.toArr(data.image).join(', ')) } : null,
          ].filter(Boolean),
        }),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'is_abelian' || op === 'is_solvable' || op === 'is_nilpotent' || op === 'is_simple') {
      const value = data.result !== undefined ? data.result : data.value !== undefined ? data.value : data[op];
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.Badge, { tone: value ? 'success' : 'idle' }, t('algebra.group.' + op) + ': ' + (value ? 'true' : 'false')),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'element_orders') {
      const orders = ML.toArr(data.orders);
      if (orders.length > 0 && ML.isObj(orders[0])) {
        return h(
          'div',
          { className: 'ml-stack' },
          h(ML.LabeledTable, {
            rowLabels: orders.map(function (entry) { return String(entry.order); }),
            colLabels: [t('algebra.elementOrder'), 'count'],
            cells: orders.map(function (entry) { return [String(entry.order), String(entry.count)]; }),
          }),
          h(ML.RawJSON, { value: data }),
        );
      }
      const payload = data.element_orders || data;
      if (ML.isObj(payload) && !Array.isArray(payload)) {
        const keys = Object.keys(payload);
        return h(ML.LabeledTable, {
          rowLabels: keys,
          colLabels: [t('algebra.elementOrder'), 'count'],
          cells: keys.map(function (key) { return [key, ML.safeString(payload[key])]; }),
        });
      }
      if (Array.isArray(payload)) {
        return h(ML.LabeledTable, {
          rowLabels: payload.map(function (entry, index) { return String(index); }),
          colLabels: [t('algebra.elementOrder')],
          cells: payload.map(function (entry) { return [ML.safeString(entry)]; }),
        });
      }
    }
    if (op === 'center') {
      const elements = ML.toArr(data.elements);
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.Stat, { label: t('algebra.group.center'), value: String(data.order !== undefined ? data.order : elements.length) }),
        h(
          'div',
          { className: 'ml-chip-row' },
          elements.map(function (element, index) {
            return h(ML.Badge, { key: index, tone: 'brand' }, ML.safeString(element));
          }),
        ),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'conjugacy_classes') {
      const classes = ML.toArr(data.classes);
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.LabeledTable, {
          rowLabels: classes.map(function (entry) { return String(entry.id); }),
          colLabels: ['#', 'size', 'cycle type', 'elements'],
          corner: 'class',
          cells: classes.map(function (entry, index) {
            return [String(index), String(entry.size), ML.safeString(entry.cycle_type || ''), ML.toArr(entry.elements).join(', ')];
          }),
        }),
        h(ML.RawJSON, { value: data }),
      );
    }
    if (op === 'commutator') {
      const payload = data.elements !== undefined ? data.elements : data.generators !== undefined ? data.generators : data.result !== undefined ? data.result : data[op];
      if (Array.isArray(payload)) {
        return h(
          'div',
          { className: 'ml-stack' },
          h(
            'div',
            { className: 'ml-chip-row' },
            payload.map(function (entry, index) {
              const label = Array.isArray(entry) ? cyclesToText(entry) : ML.safeString(entry);
              return h(ML.Badge, { key: index, tone: 'brand' }, label || 'e');
            }),
          ),
          h(ML.RawJSON, { value: data }),
        );
      }
    }
    if (op === 'center' || op === 'commutator' || op === 'conjugacy_classes') {
      return h(ML.DataView, { data: data });
    }
    return h(ML.DataView, { data: data });
  }

  function GroupTool(props) {
    const t = ML.useT();
    const [generatorsText, setGeneratorsText] = useState('(1 2 3)\n(1 2)');
    const [nText, setNText] = useState('3');
    const [op, setOp] = useState('order');
    const [normalText, setNormalText] = useState('(1 2 3)');
    const [targetText, setTargetText] = useState('');
    const [imagesText, setImagesText] = useState('');
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();
    const lastArgs = useRef(null);

    const buildArgs = function () {
      const parsed = parseGenerators(generatorsText);
      if (parsed.error) return { error: t('algebra.invalidGenerators') + parsed.error };
      if (parsed.generators.length === 0) return { error: t('algebra.invalidGenerators') + 'empty' };
      const args = { op: op, generators: parsed.generators };
      const n = parseInt(nText, 10);
      if (Number.isInteger(n) && n > 0) args.n = n;
      if (op === 'quotient') {
        const normal = parseGenerators(normalText);
        if (normal.error) return { error: t('algebra.invalidCycles') + normal.error };
        args.normal = normal.generators;
      }
      if (op === 'homomorphism') {
        const target = parseGenerators(targetText);
        if (target.error) return { error: t('algebra.invalidGenerators') + target.error };
        const images = [];
        for (const line of ML.lines(imagesText)) {
          const parsedImage = ML.parseCycles(line);
          if (parsedImage.error) return { error: t('algebra.invalidCycles') + parsedImage.error };
          images.push(parsedImage.cycles);
        }
        args.target_generators = target.generators;
        args.images = images;
      }
      return { args: args, error: null };
    };

    const run = function (argsOverride) {
      const built = argsOverride ? { args: argsOverride, error: null } : buildArgs();
      if (built.error) {
        setLocalError(built.error);
        return;
      }
      setLocalError(null);
      lastArgs.current = built.args;
      call.run('algebra.group', built.args);
    };

    const applyPreset = function (key) {
      const preset = GROUP_PRESETS[key];
      if (!preset) return;
      setGeneratorsText(preset.lines);
      setNText(preset.n);
      const parsed = parseGenerators(preset.lines);
      const args = { op: op, generators: parsed.generators, n: parseInt(preset.n, 10) };
      run(args);
    };

    useEffect(
      function () {
        if (!props.openAction || String(props.openAction.op || '').indexOf('algebra.group') !== 0) return;
        const args = props.openAction.args || {};
      if (Array.isArray(args.generators)) {
          setGeneratorsText(
            args.generators
              .map(function (generator) { return cyclesToText(generator); })
              .filter(Boolean)
              .join('\n'),
          );
        }
        if (args.normal !== undefined) {
          setNormalText(
            ML.toArr(args.normal)
              .map(function (generator) { return cyclesToText(generator); })
              .filter(Boolean)
              .join('\n'),
          );
        }
        if (args.n !== undefined) setNText(String(args.n));
        if (GROUP_OPS.indexOf(args.op) >= 0) setOp(args.op);
        call.run('algebra.group', args);
      },
      [props.openAction && props.openAction.seq],
    );

    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd' },
          h(
            'div',
            { className: 'ml-row' },
            h('span', { className: 'ml-hint' }, t('algebra.presets')),
            Object.keys(GROUP_PRESETS).map(function (key) {
              return h(
                'button',
                { key: key, type: 'button', className: 'ml-chip', onClick: function () { applyPreset(key); } },
                t('algebra.preset.' + key),
              );
            }),
          ),
          h(
            'div',
            { className: 'ml-form-grid', style: { marginTop: 10 } },
            h(ML.Field, {
              label: t('algebra.generators'),
              hint: t('algebra.groupHint'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  rows: 3,
                  value: generatorsText,
                  className: 'ml-mono',
                  onChange: function (event) {
                    setGeneratorsText(event.target.value);
                  },
                }),
            }),
            h(ML.Field, {
              label: t('algebra.n'),
              children: (id) =>
                h(ML.Input, {
                  id: id,
                  value: nText,
                  inputMode: 'numeric',
                  onChange: function (event) {
                    setNText(event.target.value);
                  },
                }),
            }),
          ),
          h(ML.Field, {
            label: t('algebra.groupOp'),
            children: (id) =>
              h(ML.Select, {
                id: id,
                value: op,
                onChange: function (event) {
                  setOp(event.target.value);
                  setLocalError(null);
                },
                options: GROUP_OPS.map(function (name) {
                  return { value: name, label: t('algebra.group.' + name) };
                }),
              }),
          }),
          op === 'quotient'
            ? h(ML.Field, {
                label: t('algebra.normal'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: normalText,
                    className: 'ml-mono',
                    onChange: function (event) {
                      setNormalText(event.target.value);
                    },
                  }),
              })
            : null,
          op === 'homomorphism'
            ? h(
                'div',
                null,
                h(ML.Field, {
                  label: t('algebra.targetGenerators'),
                  children: (id) =>
                    h(ML.Textarea, {
                      id: id,
                      rows: 2,
                      value: targetText,
                      className: 'ml-mono',
                      onChange: function (event) {
                        setTargetText(event.target.value);
                      },
                    }),
                }),
                h(ML.Field, {
                  label: t('algebra.images'),
                  children: (id) =>
                    h(ML.Textarea, {
                      id: id,
                      rows: 2,
                      value: imagesText,
                      className: 'ml-mono',
                      onChange: function (event) {
                        setImagesText(event.target.value);
                      },
                    }),
                }),
              )
            : null,
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
          ),
          localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        ),
      ),
      call.loading ? h(ML.Loading, null) : null,
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run('algebra.group', lastArgs.current); } }) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h(
              'div',
              { className: 'ml-card-hd' },
              h('h2', { className: 'ml-card-title' }, t('algebra.groupTitle') + ' · ' + t('algebra.group.' + op)),
              call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
            ),
            h('div', { className: 'ml-card-bd' }, h(GroupResult, { data: call.result, op: op })),
          )
        : null,
    );
  }

  function fieldElementText(element) {
    if (ML.isObj(element)) {
      if (element.poly !== undefined) return String(element.poly);
      if (element.coeffs !== undefined) return '[' + ML.toArr(element.coeffs).join(',') + ']';
      if (element.int !== undefined) return String(element.int);
    }
    return ML.safeString(element);
  }

  function FieldTool(props) {
    const t = ML.useT();
    const [p, setP] = useState('2');
    const [n, setN] = useState('2');
    const [op, setOp] = useState('add');
    const [a, setA] = useState('x');
    const [b, setB] = useState('x + 1');
    const [k, setK] = useState('2');
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();
    const lastArgs = useRef(null);

    const run = function (argsOverride) {
      const pValue = parseInt(p, 10);
      const nValue = parseInt(n, 10);
      if (!Number.isInteger(pValue) || pValue < 2 || !Number.isInteger(nValue) || nValue < 1) {
        setLocalError('p ≥ 2, n ≥ 1');
        return;
      }
      const args = argsOverride || { p: pValue, n: nValue, op: op };
      if (!argsOverride) {
        if (op !== 'table' && op !== 'order' && op !== 'primitive_element' && op !== 'is_irreducible') {
          if (String(a).trim()) args.a = String(a).trim();
          if (String(b).trim()) args.b = String(b).trim();
        }
        if (op === 'pow') args.k = parseInt(k, 10) || 2;
        if (op === 'is_irreducible') args.a = String(a).trim() || 'x';
      }
      setLocalError(null);
      lastArgs.current = args;
      call.run('algebra.finitefield', args);
    };

    const q = Math.pow(parseInt(p, 10) || 0, parseInt(n, 10) || 0);

    const data = call.result || {};
    const value = ML.isObj(data.value) ? data.value : null;
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd' },
          h(ML.SectionTitle, { hint: 'q = pⁿ = ' + (Number.isFinite(q) ? q : '?') }, t('algebra.fieldTitle')),
          h(
            'div',
            { className: 'ml-form-grid' },
            h(ML.Field, { label: t('algebra.p'), children: (id) => h(ML.Input, { id: id, value: p, inputMode: 'numeric', onChange: function (event) { setP(event.target.value); } }) }),
            h(ML.Field, { label: t('algebra.degree'), children: (id) => h(ML.Input, { id: id, value: n, inputMode: 'numeric', onChange: function (event) { setN(event.target.value); } }) }),
            h(ML.Field, {
              label: t('algebra.fieldOp'),
              children: (id) =>
                h(ML.Select, {
                  id: id,
                  value: op,
                  onChange: function (event) {
                    setOp(event.target.value);
                  },
                  options: FIELD_OPS.map(function (name) {
                    return { value: name, label: t('algebra.field.' + name) };
                  }),
                }),
            }),
          ),
          op !== 'table' && op !== 'order' && op !== 'primitive_element' && op !== 'is_irreducible'
            ? h(
                'div',
                { className: 'ml-form-grid', style: { marginTop: 10 } },
                h(ML.Field, { label: t('algebra.fieldA'), children: (id) => h(ML.Input, { id: id, value: a, className: 'ml-mono', onChange: function (event) { setA(event.target.value); } }) }),
                h(ML.Field, { label: t('algebra.fieldB'), children: (id) => h(ML.Input, { id: id, value: b, className: 'ml-mono', onChange: function (event) { setB(event.target.value); } }) }),
                op === 'pow'
                  ? h(ML.Field, { label: 'k', children: (id) => h(ML.Input, { id: id, value: k, inputMode: 'numeric', onChange: function (event) { setK(event.target.value); } }) })
                  : null,
              )
            : null,
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
            h('button', { type: 'button', className: 'ml-chip', onClick: function () { setP('2'); setN('2'); setA('x'); setB('x + 1'); } }, 'GF(4)'),
            h('button', { type: 'button', className: 'ml-chip', onClick: function () { setP('2'); setN('3'); setA('x'); setB('x + 1'); } }, 'GF(8)'),
            h('button', { type: 'button', className: 'ml-chip', onClick: function () { setP('3'); setN('2'); setA('x'); setB('x + 1'); } }, 'GF(9)'),
          ),
          localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        ),
      ),
      call.loading ? h(ML.Loading, null) : null,
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run('algebra.finitefield', lastArgs.current); } }) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('algebra.fieldTitle'))),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              value
                ? h(
                    'div',
                    { className: 'ml-stack-sm' },
                    h(ML.KV, {
                      rows: [
                        value.poly !== undefined ? { label: t('algebra.value'), value: String(value.poly), mono: true } : null,
                        value.coeffs !== undefined ? { label: 'coeffs (low→high)', value: '[' + ML.toArr(value.coeffs).join(', ') + ']', mono: true } : null,
                        value.int !== undefined ? { label: 'int', value: String(value.int), mono: true } : null,
                      ].filter(Boolean),
                    }),
                  )
                : null,
              data.irreducible_poly
                ? h(ML.KV, {
                    rows: [{ label: t('algebra.irreduciblePoly'), value: '[' + ML.toArr(data.irreducible_poly).join(', ') + ']', mono: true }],
                  })
                : null,
              data.value !== undefined && !ML.isObj(data.value) ? h(ML.KV, { rows: [{ label: t('algebra.value'), value: ML.safeString(data.value), mono: true }] }) : null,
              data.is_irreducible !== undefined
                ? h(ML.Badge, { tone: data.is_irreducible ? 'success' : 'idle' }, data.is_irreducible ? 'irreducible' : 'reducible')
                : null,
              data.primitive_element !== undefined
                ? h(ML.KV, { rows: [{ label: t('algebra.field.primitive_element'), value: fieldElementText(data.primitive_element) }] })
                : null,
              data.order !== undefined ? h(ML.Stat, { label: t('algebra.field.order'), value: String(data.order) }) : null,
              data.add || data.mul
                ? h(
                    'div',
                    { className: 'ml-stack' },
                    (function () {
                      const elements = ML.toArr(data.elements);
                      const mapCell = function (cell) {
                        const number = typeof cell === 'number' ? cell : parseInt(cell, 10);
                        if (Number.isInteger(number) && elements[number] !== undefined) return fieldElementText(elements[number]);
                        return fieldElementText(cell);
                      };
                      return [
                        data.add
                          ? h(
                              'div',
                              { key: 'add' },
                              h(ML.SectionTitle, null, t('algebra.addTable')),
                              h(ML.LabeledTable, {
                                rowLabels: elements.map(fieldElementText),
                                colLabels: elements.map(fieldElementText),
                                cells: ML.toArr(data.add).map(function (row) {
                                  return ML.toArr(row).map(mapCell);
                                }),
                                corner: '+',
                              }),
                            )
                          : null,
                        data.mul
                          ? h(
                              'div',
                              { key: 'mul' },
                              h(ML.SectionTitle, null, t('algebra.mulTable')),
                              h(ML.LabeledTable, {
                                rowLabels: elements.map(fieldElementText),
                                colLabels: elements.map(fieldElementText),
                                cells: ML.toArr(data.mul).map(function (row) {
                                  return ML.toArr(row).map(mapCell);
                                }),
                                corner: '·',
                              }),
                            )
                          : null,
                      ];
                    })(),
                  )
                : null,
              h(ML.RawJSON, { value: data }),
            ),
          )
        : null,
    );
  }

  function PolyResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    const value = data.value;
    const factors = ML.toArr(data.factors !== undefined ? data.factors : Array.isArray(value) ? value : []);
    const isFactorShape = factors.length > 0 && ML.isObj(factors[0]) && factors[0].poly !== undefined;
    if (isFactorShape) {
      const product = factors
        .map(function (factor) {
          const base = String(factor.poly || '');
          const multiplicity = Number(factor.multiplicity) || 1;
          return multiplicity > 1 ? '(' + base + ')^' + multiplicity : base;
        })
        .join(' · ');
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.KV, {
          rows: [
            { label: t('algebra.poly.factor'), value: product || String(data.constant === undefined ? '' : data.constant), mono: true },
            data.constant !== undefined && data.constant !== 1 ? { label: 'constant', value: String(data.constant), mono: true } : null,
            data.is_irreducible !== undefined ? { label: t('algebra.field.is_irreducible'), value: data.is_irreducible ? 'true' : 'false' } : null,
          ].filter(Boolean),
        }),
        h(ML.RawJSON, { value: data }),
      );
    }
    const roots = ML.toArr(data.roots !== undefined ? data.roots : Array.isArray(value) ? value : []);
    if (roots.length > 0 && ML.isObj(roots[0])) {
      return h(
        'div',
        { className: 'ml-stack' },
        h(
          'div',
          { className: 'ml-row' },
          roots.map(function (root, index) {
            const multiplicity = Number(root.multiplicity) || 1;
            return h(
              'span',
              { key: index, className: 'ml-row', style: { gap: 4 } },
              h(ML.Math, { tex: ML.exprLatex(root) }),
              multiplicity > 1 ? h(ML.Badge, { tone: 'idle' }, '×' + multiplicity) : null,
            );
          }),
        ),
        data.count !== undefined ? h(ML.Stat, { label: 'roots', value: String(data.count) }) : null,
        h(ML.RawJSON, { value: data }),
      );
    }
    if (ML.isObj(data.value) && !Array.isArray(data.value)) {
      return h(ML.DataView, { data: data.value });
    }
    if (typeof data.value === 'boolean') {
      return h(ML.Badge, { tone: data.value ? 'success' : 'idle' }, String(data.value));
    }
    if (ML.pickExpr(data)) return h(ML.ExprResult, { data: data });
    if (typeof data.value === 'number' || typeof data.value === 'string') {
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.KV, {
          rows: [
            { label: data.op || t('algebra.value'), value: ML.safeString(data.value), mono: true },
            data.degree !== undefined ? { label: t('algebra.poly.degree'), value: String(data.degree) } : null,
          ].filter(Boolean),
        }),
        h(ML.RawJSON, { value: data }),
      );
    }
    return h(ML.DataView, { data: data });
  }

  function RingTool(props) {
    const t = ML.useT();
    const [n, setN] = useState('12');
    const [op, setOp] = useState('units');
    const [polyCoeffs, setPolyCoeffs] = useState('1, 0, 1');
    const [polyP, setPolyP] = useState('2');
    const [polyOp, setPolyOp] = useState('factor');
    const [polyOther, setPolyOther] = useState('');
    const call = useCallSafe();
    const polyCall = useCallSafe();
    const lastArgs = useRef(null);

    const run = function (argsOverride) {
      const nValue = parseInt(n, 10);
      if (!Number.isInteger(nValue) || nValue < 2) return;
      const args = argsOverride || { op: op, n: nValue };
      lastArgs.current = args;
      call.run('algebra.ring', args);
    };

    const runPoly = function () {
      const coeffs = ML.parseList(polyCoeffs).values;
      if (coeffs.length === 0) return;
      const args = { coeffs: coeffs, p: parseInt(polyP, 10) || 0, op: polyOp };
      if (String(polyOther).trim()) args.other = ML.parseList(polyOther).values;
      polyCall.run('algebra.poly', args);
    };

    useEffect(
      function () {
        if (!props.openAction) return;
        const action = props.openAction;
        const opName = String(action.op || '');
        if (opName === 'algebra.ring') {
          const args = action.args || {};
          if (args.n !== undefined) setN(String(args.n));
          if (RING_OPS.indexOf(args.op) >= 0) setOp(args.op);
          call.run('algebra.ring', args);
        } else if (opName === 'algebra.poly') {
          const args = action.args || {};
          if (Array.isArray(args.coeffs)) setPolyCoeffs(args.coeffs.join(', '));
          if (args.p !== undefined) setPolyP(String(args.p));
          if (POLY_OPS.indexOf(args.op) >= 0) setPolyOp(args.op);
          polyCall.run('algebra.poly', args);
        }
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    const elements = Array.from({ length: parseInt(n, 10) > 0 && parseInt(n, 10) <= 1000 ? parseInt(n, 10) : 0 }, function (unused, index) {
      return index;
    });
    const renderSet = function (title, list) {
      return h(
        'div',
        { className: 'ml-stack-sm' },
        h(ML.SectionTitle, null, title),
        h(
          'div',
          { className: 'ml-chip-row' },
          ML.toArr(list).map(function (entry, index) {
            return h(ML.Badge, { key: index, tone: 'brand' }, ML.safeString(entry));
          }),
        ),
      );
    };
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd' },
          h(
            'div',
            { className: 'ml-form-grid' },
            h(ML.Field, {
              label: t('algebra.ringN'),
              children: (id) => h(ML.Input, { id: id, value: n, inputMode: 'numeric', onChange: function (event) { setN(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('algebra.ringOp'),
              children: (id) =>
                h(ML.Select, {
                  id: id,
                  value: op,
                  onChange: function (event) {
                    setOp(event.target.value);
                  },
                  options: RING_OPS.map(function (name) {
                    return { value: name, label: t('algebra.ring.' + name) };
                  }),
                }),
            }),
          ),
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
          ),
        ),
      ),
      call.loading ? h(ML.Loading, null) : null,
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run('algebra.ring', lastArgs.current); } }) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('algebra.ringTitle') + ' · ℤ/' + n + 'ℤ')),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              op === 'is_field' || op === 'is_integral_domain'
                ? h(ML.Badge, { tone: (data.value !== undefined ? data.value : data.result) ? 'success' : 'idle' }, t('algebra.ring.' + op) + ': ' + String(data.value !== undefined ? data.value : data.result))
                : null,
              op === 'units' ? renderSet(t('algebra.ring.units'), data.units || data.value || data.result) : null,
              op === 'zero_divisors' ? renderSet(t('algebra.ring.zero_divisors'), data.zero_divisors || data.value || data.result) : null,
              op === 'addition_table' || op === 'multiplication_table'
                ? h(ML.LabeledTable, {
                    rowLabels: elements,
                    colLabels: elements,
                    corner: op === 'addition_table' ? '+' : '·',
                    cells: ML.toArr(data.table || data.value || data.result).map(function (row) {
                      return Array.isArray(row) ? row : [ML.safeString(row)];
                    }),
                  })
                : null,
              (op === 'is_field' || op === 'is_integral_domain' || op === 'units' || op === 'zero_divisors') && !data.units && !data.value && !data.result
                ? h(ML.RawJSON, { value: data })
                : null,
              h(ML.RawJSON, { value: data }),
            ),
          )
        : null,
      h(
        ML.Collapse,
        { title: t('algebra.poly') },
        h(
          'div',
          { className: 'ml-stack-sm' },
          h(
            'div',
            { className: 'ml-form-grid' },
            h(ML.Field, {
              label: t('algebra.polyFormula'),
              hint: 'coeffs 低次→高次',
              children: (id) => h(ML.Input, { id: id, value: polyCoeffs, className: 'ml-mono', onChange: function (event) { setPolyCoeffs(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('algebra.polyP'),
              children: (id) => h(ML.Input, { id: id, value: polyP, inputMode: 'numeric', onChange: function (event) { setPolyP(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('algebra.polyOp'),
              children: (id) =>
                h(ML.Select, {
                  id: id,
                  value: polyOp,
                  onChange: function (event) {
                    setPolyOp(event.target.value);
                  },
                  options: POLY_OPS.map(function (name) {
                    return { value: name, label: t('algebra.poly.' + name) };
                  }),
                }),
            }),
            polyOp === 'gcd'
              ? h(ML.Field, {
                  label: t('algebra.polyOther'),
                  children: (id) => h(ML.Input, { id: id, value: polyOther, className: 'ml-mono', onChange: function (event) { setPolyOther(event.target.value); } }),
                })
              : null,
          ),
          h(ML.Btn, { onClick: runPoly, disabled: polyCall.loading }, polyCall.loading ? t('common.running') : t('common.run')),
          polyCall.error ? h(ML.ErrorBox, { error: polyCall.error, onRetry: runPoly }) : null,
          polyCall.result ? h(PolyResult, { data: polyCall.result }) : null,
        ),
      ),
    );
  }

  function useCallSafe() {
    return ML.useCall();
  }

  ML.tabs.algebra = {
    id: 'algebra',
    order: 30,
    Component: function AlgebraTab(props) {
      const t = ML.useT();
      const [section, setSection] = useState('perm');
      useEffect(
        function () {
          if (!props.openAction) return;
          const op = String(props.openAction.op || '');
          if (op.indexOf('algebra.perm') === 0) setSection('perm');
          else if (op.indexOf('algebra.group') === 0) setSection('group');
          else if (op.indexOf('algebra.finitefield') === 0) setSection('field');
          else if (op.indexOf('algebra.ring') === 0 || op.indexOf('algebra.poly') === 0) setSection('ring');
        },
        [props.openAction && props.openAction.seq],
      );
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, null, t('algebra.title')),
        h(ML.Tabs, {
          items: [
            { id: 'perm', label: t('algebra.section.perm') },
            { id: 'group', label: t('algebra.section.group') },
            { id: 'field', label: t('algebra.section.field') },
            { id: 'ring', label: t('algebra.section.ring') },
          ],
          value: section,
          onChange: setSection,
          size: 'sm',
          ariaLabel: t('algebra.title'),
        }),
        section === 'perm' ? h(PermTool, { openAction: props.openAction }) : null,
        section === 'group' ? h(GroupTool, { openAction: props.openAction }) : null,
        section === 'field' ? h(FieldTool, { openAction: props.openAction }) : null,
        section === 'ring' ? h(RingTool, { openAction: props.openAction }) : null,
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useMemo = React.useMemo;
  const useRef = React.useRef;

  ML.assignStrings(
    {
      'tab.category': '范畴',
      'category.title': '有限范畴',
      'category.section.editor': '编辑器',
      'category.section.functor': '函子',
      'category.section.diagram': '交换图',
      'category.section.limits': '极限',
      'category.objects': '对象 Ob(C)',
      'category.morphisms': '态射 Mor(C)',
      'category.identities': '恒等态射',
      'category.compositions': '复合表（first 然后 second = result）',
      'category.objectId': 'id',
      'category.objectLabel': '标签',
      'category.morphId': 'id',
      'category.dom': 'dom',
      'category.cod': 'cod',
      'category.morphismLabel': '标签',
      'category.addObject': '添加对象',
      'category.addMorphism': '添加态射',
      'category.addComposite': '添加复合',
      'category.syncIdentities': '自动补全恒等态射',
      'category.syncCompositions': '补全恒等复合',
      'category.validate': '验证范畴',
      'category.valid': '合法范畴 ✓',
      'category.invalid': '存在公理违例',
      'category.violations': '违例',
      'category.summary': '摘要',
      'category.summaryObjects': '对象',
      'category.summaryMorphisms': '态射',
      'category.summaryComposites': '复合',
      'category.copyJSON': '复制范畴 JSON',
      'category.diagram': '交换图预览',
      'category.hiddenIdentities': '恒等态射已隐藏；平行态射以曲线区分，自环显示在节点上方。',
      'category.presets': '预设',
      'category.preset.chain': '三角交换图',
      'category.preset.parallel': '平行箭头',
      'category.noObjects': '请先添加对象。',
      'category.functorTitle': '函子检查',
      'category.source': '源范畴',
      'category.target': '目标范畴',
      'category.onObjects': '对象映射（每行 from -> to）',
      'category.onMorphisms': '态射映射（每行 from -> to）',
      'category.checkFunctor': '检查函子',
      'category.laws': '公理',
      'category.lawIdentity': '恒等',
      'category.lawComposition': '复合',
      'category.naturalTitle': '自然变换检查',
      'category.F': '函子 F 映射',
      'category.G': '函子 G 映射',
      'category.components': '分量（每行 object -> morphism）',
      'category.checkNatural': '检查自然性',
      'category.naturality': '自然性方块',
      'category.equivalenceTitle': '范畴等价',
      'category.checkEquivalence': '检查等价',
      'category.useCurrent': '使用当前范畴',
      'category.invalidJSON': '范畴 JSON 无法解析：',
      'category.verifyTitle': '交换图验证',
      'category.pairs': '需要交换的路径（每行 from -> to）',
      'category.verify': '验证交换性',
      'category.pairFrom': '起点',
      'category.pairTo': '终点',
      'category.paths': '路径',
      'category.equal': '复合相等',
      'category.pathsEmpty': '没有找到路径',
      'category.limitsTitle': '集合范畴 Set 中的极限',
      'category.kind': '类型',
      'category.args': '参数（JSON）',
      'category.runLimit': '计算',
      'category.product': '积 product',
      'category.coproduct': '余积 coproduct',
      'category.equalizer': '等化子 equalizer',
      'category.coequalizer': '余等化子 coequalizer',
      'category.pullback': '拉回 pullback',
      'category.pushout': '推出 pushout',
      'category.terminal': '终对象 terminal',
      'category.initial': '始对象 initial',
      'category.universal': '泛对象与验证',
      'category.checkAll': '检查全部',
      'category.hintCompose': '复合语义：second ∘ first = result（先作用 first，再作用 second）。',
    },
    {
      'tab.category': 'Category',
      'category.title': 'Finite categories',
      'category.section.editor': 'Editor',
      'category.section.functor': 'Functors',
      'category.section.diagram': 'Diagram',
      'category.section.limits': 'Limits',
      'category.objects': 'Objects Ob(C)',
      'category.morphisms': 'Morphisms Mor(C)',
      'category.identities': 'Identity morphisms',
      'category.compositions': 'Composition table (first then second = result)',
      'category.objectId': 'id',
      'category.objectLabel': 'label',
      'category.morphId': 'id',
      'category.dom': 'dom',
      'category.cod': 'cod',
      'category.morphismLabel': 'label',
      'category.addObject': 'Add object',
      'category.addMorphism': 'Add morphism',
      'category.addComposite': 'Add composite',
      'category.syncIdentities': 'Fill identity arrows',
      'category.syncCompositions': 'Fill identity composites',
      'category.validate': 'Validate category',
      'category.valid': 'valid category ✓',
      'category.invalid': 'axiom violations',
      'category.violations': 'Violations',
      'category.summary': 'Summary',
      'category.summaryObjects': 'objects',
      'category.summaryMorphisms': 'morphisms',
      'category.summaryComposites': 'composites',
      'category.copyJSON': 'Copy category JSON',
      'category.diagram': 'Diagram preview',
      'category.hiddenIdentities': 'Identity arrows hidden; parallel arrows curve; self-loops sit above nodes.',
      'category.presets': 'Presets',
      'category.preset.chain': 'Commutative triangle',
      'category.preset.parallel': 'Parallel arrows',
      'category.noObjects': 'Add an object first.',
      'category.functorTitle': 'Functor checker',
      'category.source': 'Source category',
      'category.target': 'Target category',
      'category.onObjects': 'Object mapping (one from -> to per line)',
      'category.onMorphisms': 'Morphism mapping (one from -> to per line)',
      'category.checkFunctor': 'Check functor',
      'category.laws': 'Laws',
      'category.lawIdentity': 'Identity',
      'category.lawComposition': 'Composition',
      'category.naturalTitle': 'Natural transformation',
      'category.F': 'Functor F mapping',
      'category.G': 'Functor G mapping',
      'category.components': 'Components (one object -> morphism per line)',
      'category.checkNatural': 'Check naturality',
      'category.naturality': 'Naturality squares',
      'category.equivalenceTitle': 'Category equivalence',
      'category.checkEquivalence': 'Check equivalence',
      'category.useCurrent': 'Use current category',
      'category.invalidJSON': 'Cannot parse the category JSON: ',
      'category.verifyTitle': 'Diagram commutativity',
      'category.pairs': 'Paths that must commute (one from -> to per line)',
      'category.verify': 'Verify commute',
      'category.pairFrom': 'from',
      'category.pairTo': 'to',
      'category.paths': 'paths',
      'category.equal': 'composites equal',
      'category.pathsEmpty': 'no path found',
      'category.limitsTitle': 'Limits in Set',
      'category.kind': 'Kind',
      'category.args': 'Arguments (JSON)',
      'category.runLimit': 'Compute',
      'category.product': 'product',
      'category.coproduct': 'coproduct',
      'category.equalizer': 'equalizer',
      'category.coequalizer': 'coequalizer',
      'category.pullback': 'pullback',
      'category.pushout': 'pushout',
      'category.terminal': 'terminal',
      'category.initial': 'initial',
      'category.universal': 'Universal object and verification',
      'category.checkAll': 'Check all',
      'category.hintCompose': 'Composition means second ∘ first = result (apply first, then second).',
    },
  );

  const LIMIT_KINDS = ['product', 'coproduct', 'equalizer', 'coequalizer', 'pullback', 'pushout', 'terminal', 'initial'];
  const LIMIT_EXAMPLES = {
    product: { sets: { A: ['a1', 'a2'], B: ['b1'] } },
    coproduct: { sets: { A: ['a1'], B: ['b1'] } },
    equalizer: { domain: [1, 2, 3, 4], f: [1, 2, 1, 2], g: [1, 1, 1, 2] },
    coequalizer: { codomain: [1, 2, 3], f: [1, 2], g: [2, 3] },
    pullback: { A: [1, 2], B: ['a', 'b', 'c'], C: ['x', 'y'], f: ['x', 'x'], g: ['x', 'y', 'x'] },
    pushout: { C: [0], A: [1, 2], B: [3], f: [1], g: [3] },
    terminal: { sets: { A: ['a1'], B: ['b1'] } },
    initial: { sets: { A: ['a1'] } },
  };

  function makeChainCategory() {
    return {
      objects: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' },
      ],
      morphisms: [
        { id: 'f', dom: 'A', cod: 'B', label: 'f' },
        { id: 'g', dom: 'B', cod: 'C', label: 'g' },
        { id: 'h', dom: 'A', cod: 'C', label: 'h = g∘f' },
        { id: 'idA', dom: 'A', cod: 'A', label: 'id_A' },
        { id: 'idB', dom: 'B', cod: 'B', label: 'id_B' },
        { id: 'idC', dom: 'C', cod: 'C', label: 'id_C' },
      ],
      identities: [
        { object: 'A', morphism: 'idA' },
        { object: 'B', morphism: 'idB' },
        { object: 'C', morphism: 'idC' },
      ],
      compositions: [
        { first: 'idA', second: 'idA', result: 'idA' },
        { first: 'idB', second: 'idB', result: 'idB' },
        { first: 'idC', second: 'idC', result: 'idC' },
        { first: 'idA', second: 'f', result: 'f' },
        { first: 'f', second: 'idB', result: 'f' },
        { first: 'idA', second: 'g', result: 'g' },
        { first: 'g', second: 'idC', result: 'g' },
        { first: 'idA', second: 'h', result: 'h' },
        { first: 'h', second: 'idC', result: 'h' },
        { first: 'f', second: 'g', result: 'h' },
      ],
    };
  }

  function makeParallelCategory() {
    return {
      objects: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
      ],
      morphisms: [
        { id: 'f', dom: 'A', cod: 'B', label: 'f' },
        { id: 'g', dom: 'A', cod: 'B', label: 'g' },
        { id: 'idA', dom: 'A', cod: 'A', label: 'id_A' },
        { id: 'idB', dom: 'B', cod: 'B', label: 'id_B' },
      ],
      identities: [
        { object: 'A', morphism: 'idA' },
        { object: 'B', morphism: 'idB' },
      ],
      compositions: [
        { first: 'idA', second: 'idA', result: 'idA' },
        { first: 'idB', second: 'idB', result: 'idB' },
        { first: 'idA', second: 'f', result: 'f' },
        { first: 'f', second: 'idB', result: 'f' },
        { first: 'idA', second: 'g', result: 'g' },
        { first: 'g', second: 'idB', result: 'g' },
      ],
    };
  }

  function makeSimpleSourceCategory() {
    return {
      objects: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
      ],
      morphisms: [
        { id: 'f', dom: 'A', cod: 'B', label: 'f' },
        { id: 'idA', dom: 'A', cod: 'A', label: 'id_A' },
        { id: 'idB', dom: 'B', cod: 'B', label: 'id_B' },
      ],
      identities: [
        { object: 'A', morphism: 'idA' },
        { object: 'B', morphism: 'idB' },
      ],
      compositions: [
        { first: 'idA', second: 'idA', result: 'idA' },
        { first: 'idB', second: 'idB', result: 'idB' },
        { first: 'idA', second: 'f', result: 'f' },
        { first: 'f', second: 'idB', result: 'f' },
      ],
    };
  }

  function makeSimpleTargetCategory() {
    return {
      objects: [
        { id: 'X', label: 'X' },
        { id: 'Y', label: 'Y' },
      ],
      morphisms: [
        { id: 'u', dom: 'X', cod: 'Y', label: 'u' },
        { id: 'idX', dom: 'X', cod: 'X', label: 'id_X' },
        { id: 'idY', dom: 'Y', cod: 'Y', label: 'id_Y' },
      ],
      identities: [
        { object: 'X', morphism: 'idX' },
        { object: 'Y', morphism: 'idY' },
      ],
      compositions: [
        { first: 'idX', second: 'idX', result: 'idX' },
        { first: 'idY', second: 'idY', result: 'idY' },
        { first: 'idX', second: 'u', result: 'u' },
        { first: 'u', second: 'idY', result: 'u' },
      ],
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function categoryFromState(state) {
    const objects = state.objects
      .map(function (object) {
        return { id: String(object.id || '').trim(), label: String(object.label === undefined || object.label === '' ? object.id : object.label).trim() };
      })
      .filter(function (object) {
        return object.id.length > 0;
      });
    const objectIds = new Set(objects.map(function (object) { return object.id; }));
    const morphisms = state.morphisms
      .map(function (morphism) {
        return {
          id: String(morphism.id || '').trim(),
          dom: String(morphism.dom || '').trim(),
          cod: String(morphism.cod || '').trim(),
          label: String(morphism.label === undefined || morphism.label === '' ? morphism.id : morphism.label).trim(),
        };
      })
      .filter(function (morphism) {
        return morphism.id.length > 0 && objectIds.has(morphism.dom) && objectIds.has(morphism.cod);
      });
    const morphismIds = new Set(morphisms.map(function (morphism) { return morphism.id; }));
    const identities = state.identities
      .filter(function (identity) {
        return identity && objectIds.has(String(identity.object)) && morphismIds.has(String(identity.morphism));
      })
      .map(function (identity) {
        return { object: String(identity.object), morphism: String(identity.morphism) };
      });
    const compositions = state.compositions
      .filter(function (composition) {
        return (
          composition &&
          morphismIds.has(String(composition.first)) &&
          morphismIds.has(String(composition.second)) &&
          morphismIds.has(String(composition.result))
        );
      })
      .map(function (composition) {
        return {
          first: String(composition.first),
          second: String(composition.second),
          result: String(composition.result),
        };
      });
    return { objects: objects, morphisms: morphisms, identities: identities, compositions: compositions };
  }

  function stateFromCategory(category) {
    const source = ML.isObj(category) ? category : {};
    return {
      objects: ML.toArr(source.objects).map(function (object) {
        return { id: String(object.id), label: object.label === undefined ? String(object.id) : String(object.label) };
      }),
      morphisms: ML.toArr(source.morphisms).map(function (morphism) {
        return {
          id: String(morphism.id),
          dom: String(morphism.dom),
          cod: String(morphism.cod),
          label: morphism.label === undefined ? String(morphism.id) : String(morphism.label),
        };
      }),
      identities: ML.toArr(source.identities).map(function (identity) {
        return { object: String(identity.object), morphism: String(identity.morphism) };
      }),
      compositions: ML.toArr(source.compositions).map(function (composition) {
        return {
          first: String(composition.first),
          second: String(composition.second),
          result: String(composition.result),
        };
      }),
    };
  }

  function withIdentityArrows(state) {
    const next = clone(state);
    for (const object of next.objects) {
      const objectId = String(object.id || '').trim();
      if (!objectId) continue;
      const exists = next.morphisms.some(function (morphism) {
        return morphism.dom === objectId && morphism.cod === objectId && morphism.id === 'id' + objectId;
      });
      if (!exists) {
        const taken = next.morphisms.some(function (morphism) { return morphism.id === 'id' + objectId; });
        const morphismId = taken ? 'id_' + objectId : 'id' + objectId;
        next.morphisms.push({ id: morphismId, dom: objectId, cod: objectId, label: 'id_' + objectId });
      }
      const identityMorphism = next.morphisms.filter(function (morphism) {
        return morphism.dom === objectId && morphism.cod === objectId && morphism.id === 'id' + objectId;
      })[0];
      const identityId = identityMorphism ? identityMorphism.id : 'id' + objectId;
      if (!next.identities.some(function (identity) { return identity.object === objectId; })) {
        next.identities.push({ object: objectId, morphism: identityId });
      }
    }
    next.identities = next.identities.filter(function (identity) {
      return next.morphisms.some(function (morphism) { return morphism.id === identity.morphism; });
    });
    return next;
  }

  function withIdentityCompositions(state) {
    const next = withIdentityArrows(state);
    const byId = new Map(next.morphisms.map(function (morphism) { return [morphism.id, morphism]; }));
    const identityOf = new Map();
    for (const identity of next.identities) identityOf.set(identity.object, identity.morphism);
    const seen = new Set(
      next.compositions.map(function (composition) {
        return composition.first + '\u0000' + composition.second;
      }),
    );
    const push = function (first, second, result) {
      const key = first + '\u0000' + second;
      if (seen.has(key)) return;
      const left = byId.get(first);
      const right = byId.get(second);
      if (!left || !right || left.cod !== right.dom) return;
      seen.add(key);
      next.compositions.push({ first: first, second: second, result: result });
    };
    for (const morphism of next.morphisms) {
      const domIdentity = identityOf.get(morphism.dom);
      const codIdentity = identityOf.get(morphism.cod);
      if (domIdentity) push(domIdentity, morphism.id, morphism.id);
      if (codIdentity) push(morphism.id, codIdentity, morphism.id);
    }
    for (const identity of next.identities) {
      push(identity.morphism, identity.morphism, identity.morphism);
    }
    return next;
  }

  function parseCategoryJSON(text) {
    const raw = String(text || '').trim();
    if (!raw) return { category: null, error: 'empty' };
    try {
      const parsed = JSON.parse(raw);
      if (!ML.isObj(parsed)) return { category: null, error: 'category must be an object' };
      return {
        category: {
          objects: ML.toArr(parsed.objects),
          morphisms: ML.toArr(parsed.morphisms),
          identities: ML.toArr(parsed.identities),
          compositions: ML.toArr(parsed.compositions),
        },
        error: null,
      };
    } catch (error) {
      return { category: null, error: error.message };
    }
  }

  function categoryText(category) {
    return JSON.stringify(category, null, 2);
  }

  function ViolationList(props) {
    const t = ML.useT();
    const violations = ML.toArr(props.violations);
    if (violations.length === 0) return h(ML.Badge, { tone: 'success' }, t('category.valid'));
    return h(
      'div',
      { className: 'ml-stack-sm' },
      h('div', null, h(ML.Badge, { tone: 'error' }, violations.length + ' ' + t('category.violations'))),
      h(
        'ul',
        { className: 'ml-list' },
        violations.map(function (violation, index) {
          return h(
            'li',
            { key: index },
            h(
              'button',
              {
                type: 'button',
                className: 'ml-btn ml-btn-subtle ml-btn-sm',
                onClick: function () {
                  if (props.onSelect) props.onSelect(violation);
                },
                title: ML.safeString(ML.isObj(violation.where) ? ML.prettyJSON(violation.where) : violation.where),
              },
              h('code', null, String(violation.code || '?')),
              ' · ',
              ML.safeString(violation.message || '', 300),
            ),
          );
        }),
      ),
    );
  }

  function CategoryEditor(props) {
    const t = ML.useT();
    const call = ML.useCall();
    const [localError, setLocalError] = useState(null);
    const [highlight, setHighlight] = useState([]);
    const lastToggle = useRef(0);

    const state = {
      objects: props.objects,
      morphisms: props.morphisms,
      identities: props.identities,
      compositions: props.compositions,
    };
    const category = categoryFromState(state);
    const morphismIds = category.morphisms.map(function (morphism) { return morphism.id; });
    const objectIds = category.objects.map(function (object) { return object.id; });

    const update = function (patch) {
      if (patch.objects !== undefined) props.setObjects(patch.objects);
      if (patch.morphisms !== undefined) props.setMorphisms(patch.morphisms);
      if (patch.identities !== undefined) props.setIdentities(patch.identities);
      if (patch.compositions !== undefined) props.setCompositions(patch.compositions);
    };

    const setRow = function (key, index, field, value) {
      const list = props[key].slice();
      list[index] = Object.assign({}, list[index], { [field]: value });
      update({ [key]: list });
    };

    const addRow = function (key, empty) {
      update({ [key]: props[key].concat([Object.assign({}, empty)]) });
    };
    const removeRow = function (key, index) {
      update({ [key]: props[key].filter(function (unused, position) { return position !== index; }) });
    };

    const validate = function () {
      const built = categoryFromState({
        objects: props.objects,
        morphisms: props.morphisms,
        identities: props.identities,
        compositions: props.compositions,
      });
      if (built.objects.length === 0) {
        setLocalError(t('category.noObjects'));
        return;
      }
      setLocalError(null);
      setHighlight([]);
      call.run('category.validate', { category: built });
    };

    const syncIdentities = function () {
      update(withIdentityArrows(state));
    };
    const syncCompositions = function () {
      update(withIdentityCompositions(state));
    };

    const selectViolation = function (violation) {
      const text = ML.safeString(ML.isObj(violation.where) ? ML.prettyJSON(violation.where) : violation.where);
      const ids = morphismIds.filter(function (id) {
        return text.indexOf(id) >= 0;
      });
      const now = Date.now();
      if (now - lastToggle.current < 300) return;
      lastToggle.current = now;
      setHighlight(ids);
    };

    useEffect(
      function () {
        if (!props.openAction) return;
        const action = props.openAction;
        if (String(action.op || '') !== 'category.validate') return;
        const args = action.args || {};
        if (ML.isObj(args.category)) {
          const mapped = stateFromCategory(args.category);
          props.setObjects(mapped.objects);
          props.setMorphisms(mapped.morphisms);
          props.setIdentities(mapped.identities);
          props.setCompositions(mapped.compositions);
        }
        call.run('category.validate', args);
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    const summary = ML.isObj(data.summary) ? data.summary : {};
    const violations = ML.toArr(data.violations);

    const applyPreset = function (preset) {
      const categoryValue = preset === 'chain' ? makeChainCategory() : makeParallelCategory();
      const mapped = stateFromCategory(categoryValue);
      props.setObjects(mapped.objects);
      props.setMorphisms(mapped.morphisms);
      props.setIdentities(mapped.identities);
      props.setCompositions(mapped.compositions);
      call.run('category.validate', { category: categoryValue });
    };

    return h(
      'div',
      { className: 'ml-split' },
      h(
        'div',
        { className: 'ml-stack' },
        h(
          'div',
          { className: 'ml-row' },
          h('span', { className: 'ml-hint' }, t('category.presets')),
          h('button', { type: 'button', className: 'ml-chip', onClick: function () { applyPreset('chain'); } }, t('category.preset.chain')),
          h('button', { type: 'button', className: 'ml-chip', onClick: function () { applyPreset('parallel'); } }, t('category.preset.parallel')),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('category.objects')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', onClick: function () { addRow('objects', { id: 'X', label: '' }); } }, '+ ' + t('common.add')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            h(
              'div',
              { className: 'ml-cat-rows' },
              props.objects.map(function (object, index) {
                return h(
                  'div',
                  { key: index, className: 'ml-row' },
                  h('input', {
                    className: 'ml-input',
                    style: { width: 90 },
                    value: object.id,
                    'aria-label': 'object id ' + (index + 1),
                    onChange: function (event) { setRow('objects', index, 'id', event.target.value); },
                  }),
                  h('input', {
                    className: 'ml-input',
                    style: { flex: 1 },
                    value: object.label,
                    placeholder: t('category.objectLabel'),
                    'aria-label': 'object label ' + (index + 1),
                    onChange: function (event) { setRow('objects', index, 'label', event.target.value); },
                  }),
                  h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: function () { removeRow('objects', index); } }, '−'),
                );
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('category.morphisms')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', onClick: function () { addRow('morphisms', { id: 'a', dom: objectIds[0] || 'A', cod: objectIds[0] || 'A', label: '' }); } }, '+ ' + t('common.add')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            h(
              'div',
              { className: 'ml-cat-rows' },
              props.morphisms.map(function (morphism, index) {
                return h(
                  'div',
                  { key: index, className: 'ml-row' },
                  h('input', {
                    className: 'ml-input',
                    style: { width: 80 },
                    value: morphism.id,
                    'aria-label': 'morphism id ' + (index + 1),
                    onChange: function (event) { setRow('morphisms', index, 'id', event.target.value); },
                  }),
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 82 },
                      value: morphism.dom,
                      'aria-label': t('category.dom') + ' ' + (index + 1),
                      onChange: function (event) { setRow('morphisms', index, 'dom', event.target.value); },
                    },
                    objectIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h('span', { className: 'ml-muted' }, '→'),
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 82 },
                      value: morphism.cod,
                      'aria-label': t('category.cod') + ' ' + (index + 1),
                      onChange: function (event) { setRow('morphisms', index, 'cod', event.target.value); },
                    },
                    objectIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h('input', {
                    className: 'ml-input',
                    style: { flex: 1, minWidth: 60 },
                    value: morphism.label,
                    placeholder: t('category.morphismLabel'),
                    'aria-label': 'morphism label ' + (index + 1),
                    onChange: function (event) { setRow('morphisms', index, 'label', event.target.value); },
                  }),
                  h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: function () { removeRow('morphisms', index); } }, '−'),
                );
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('category.compositions')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', onClick: function () { addRow('compositions', { first: morphismIds[0] || '', second: morphismIds[0] || '', result: morphismIds[0] || '' }); } }, '+ ' + t('common.add')),
              h(ML.Btn, { size: 'sm', onClick: syncCompositions }, t('category.syncCompositions')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            h('div', { className: 'ml-hint', style: { marginBottom: 6 } }, t('category.hintCompose')),
            h(
              'div',
              { className: 'ml-cat-rows' },
              props.compositions.map(function (composition, index) {
                const rowClass = 'ml-row' + (highlight.indexOf(composition.result) >= 0 || highlight.indexOf(composition.first) >= 0 ? ' ml-cell-hl' : '');
                return h(
                  'div',
                  { key: index, className: rowClass, style: { borderRadius: 6, padding: '2px 4px' } },
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 84 },
                      value: composition.second,
                      'aria-label': 'second ' + (index + 1),
                      onChange: function (event) { setRow('compositions', index, 'second', event.target.value); },
                    },
                    morphismIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h('span', { className: 'ml-muted' }, '∘'),
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 84 },
                      value: composition.first,
                      'aria-label': 'first ' + (index + 1),
                      onChange: function (event) { setRow('compositions', index, 'first', event.target.value); },
                    },
                    morphismIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h('span', { className: 'ml-muted' }, '='),
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 84 },
                      value: composition.result,
                      'aria-label': 'result ' + (index + 1),
                      onChange: function (event) { setRow('compositions', index, 'result', event.target.value); },
                    },
                    morphismIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: function () { removeRow('compositions', index); } }, '−'),
                );
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('category.identities')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', onClick: syncIdentities }, t('category.syncIdentities')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            h(
              'div',
              { className: 'ml-cat-rows' },
              props.identities.map(function (identity, index) {
                return h(
                  'div',
                  { key: index, className: 'ml-row' },
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 84 },
                      value: identity.object,
                      'aria-label': 'identity object ' + (index + 1),
                      onChange: function (event) { setRow('identities', index, 'object', event.target.value); },
                    },
                    objectIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h('span', { className: 'ml-muted' }, '↦'),
                  h(
                    'select',
                    {
                      className: 'ml-select',
                      style: { width: 110 },
                      value: identity.morphism,
                      'aria-label': 'identity morphism ' + (index + 1),
                      onChange: function (event) { setRow('identities', index, 'morphism', event.target.value); },
                    },
                    morphismIds.map(function (id) { return h('option', { key: id, value: id }, id); }),
                  ),
                  h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: function () { removeRow('identities', index); } }, '−'),
                );
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-toolbar' },
          h(ML.Btn, { variant: 'primary', onClick: validate, disabled: call.loading }, call.loading ? t('common.running') : t('category.validate')),
          h(ML.CopyBtn, { text: categoryText(category), label: t('category.copyJSON') }),
        ),
        localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        call.loading ? h(ML.Loading, null) : null,
        call.error ? h(ML.ErrorBox, { error: call.error, onRetry: validate }) : null,
        call.result
          ? h(
              'div',
              { className: 'ml-card' },
              h(
                'div',
                { className: 'ml-card-hd' },
                h('h2', { className: 'ml-card-title' }, t('category.summary')),
                data.valid !== undefined
                  ? h(ML.Badge, { tone: data.valid ? 'success' : 'error' }, data.valid ? t('category.valid') : t('category.invalid'))
                  : null,
              ),
              h(
                'div',
                { className: 'ml-card-bd ml-stack' },
                h(
                  'div',
                  { className: 'ml-stats' },
                  h(ML.Stat, { label: t('category.summaryObjects'), value: ML.safeString(summary.objects !== undefined ? summary.objects : category.objects.length) }),
                  h(ML.Stat, { label: t('category.summaryMorphisms'), value: ML.safeString(summary.morphisms !== undefined ? summary.morphisms : category.morphisms.length) }),
                  h(ML.Stat, { label: t('category.summaryComposites'), value: ML.safeString(summary.composites !== undefined ? summary.composites : category.compositions.length) }),
                ),
                h(ViolationList, { violations: violations, onSelect: selectViolation }),
                h(ML.RawJSON, { value: data }),
              ),
            )
          : null,
      ),
      h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('category.hiddenIdentities') }, t('category.diagram')),
        h(ML.CommutativeDiagram, {
          category: category,
          highlightMorphismIds: highlight,
          legend: t('category.title'),
        }),
      ),
    );
  }

  function FunctorTool(props) {
    const t = ML.useT();
    const [sourceText, setSourceText] = useState(function () { return categoryText(makeSimpleSourceCategory()); });
    const [targetText, setTargetText] = useState(function () { return categoryText(makeSimpleTargetCategory()); });
    const [onObjectsText, setOnObjectsText] = useState('A -> X\nB -> Y');
    const [onMorphismsText, setOnMorphismsText] = useState('f -> u');
    const [fText, setFText] = useState('A -> X\nB -> Y');
    const [fMorphText, setFMorphText] = useState('f -> u');
    const [gText, setGText] = useState('A -> X\nB -> Y');
    const [gMorphText, setGMorphText] = useState('f -> u');
    const [componentsText, setComponentsText] = useState('A -> idX\nB -> idY');
    const [localError, setLocalError] = useState(null);
    const functorCall = ML.useCall();
    const naturalCall = ML.useCall();
    const equivalenceCall = ML.useCall();

    const parsePairText = function (text) {
      return ML.parseMappings(text).map(function (pair) {
        return { from: pair[0], to: pair[1] };
      });
    };

    const runFunctor = function () {
      const source = parseCategoryJSON(sourceText);
      const target = parseCategoryJSON(targetText);
      if (source.error) return setLocalError(t('category.invalidJSON') + source.error);
      if (target.error) return setLocalError(t('category.invalidJSON') + target.error);
      const args = {
        source: source.category,
        target: target.category,
        onObjects: parsePairText(onObjectsText),
        onMorphisms: parsePairText(onMorphismsText),
      };
      setLocalError(null);
      functorCall.run('category.functor', args);
    };

    const runNatural = function () {
      const source = parseCategoryJSON(sourceText);
      const target = parseCategoryJSON(targetText);
      if (source.error) return setLocalError(t('category.invalidJSON') + source.error);
      if (target.error) return setLocalError(t('category.invalidJSON') + target.error);
      const F = { onObjects: parsePairText(fText), onMorphisms: parsePairText(fMorphText) };
      const G = { onObjects: parsePairText(gText), onMorphisms: parsePairText(gMorphText) };
      const components = ML.parseMappings(componentsText).map(function (pair) {
        return { object: pair[0], morphism: pair[1] };
      });
      setLocalError(null);
      naturalCall.run('category.natural', { source: source.category, target: target.category, F: F, G: G, components: components });
    };

    const runEquivalence = function () {
      const source = parseCategoryJSON(sourceText);
      const target = parseCategoryJSON(targetText);
      if (source.error) return setLocalError(t('category.invalidJSON') + source.error);
      if (target.error) return setLocalError(t('category.invalidJSON') + target.error);
      setLocalError(null);
      equivalenceCall.run('category.equivalence', {
        source: source.category,
        target: target.category,
        functor: { onObjects: parsePairText(onObjectsText), onMorphisms: parsePairText(onMorphismsText) },
      });
    };

    return h(
      'div',
      { className: 'ml-stack' },
      localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
      h(
        'div',
        { className: 'ml-split' },
        h(ML.Field, {
          label: t('category.source'),
          children: (id) => h(ML.Textarea, { id: id, rows: 10, value: sourceText, className: 'ml-mono', onChange: function (event) { setSourceText(event.target.value); } }),
        }),
        h(ML.Field, {
          label: t('category.target'),
          children: (id) => h(ML.Textarea, { id: id, rows: 10, value: targetText, className: 'ml-mono', onChange: function (event) { setTargetText(event.target.value); } }),
        }),
      ),
      h(
        'div',
        { className: 'ml-card' },
        h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('category.functorTitle'))),
        h(
          'div',
          { className: 'ml-card-bd ml-stack' },
          h(
            'div',
            { className: 'ml-form-grid' },
            h(ML.Field, {
              label: t('category.onObjects'),
              children: (id) => h(ML.Textarea, { id: id, rows: 3, value: onObjectsText, onChange: function (event) { setOnObjectsText(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('category.onMorphisms'),
              children: (id) => h(ML.Textarea, { id: id, rows: 3, value: onMorphismsText, onChange: function (event) { setOnMorphismsText(event.target.value); } }),
            }),
          ),
          h(
            'div',
            { className: 'ml-row' },
            h(ML.Btn, { variant: 'primary', onClick: runFunctor, disabled: functorCall.loading }, functorCall.loading ? t('common.running') : t('category.checkFunctor')),
            h(ML.Btn, { onClick: runEquivalence, disabled: equivalenceCall.loading }, t('category.checkEquivalence')),
          ),
          functorCall.error ? h(ML.ErrorBox, { error: functorCall.error }) : null,
          equivalenceCall.error ? h(ML.ErrorBox, { error: equivalenceCall.error }) : null,
          (function () {
            const data = functorCall.result || equivalenceCall.result;
            if (!data) return null;
            return h(
              'div',
              { className: 'ml-stack-sm' },
              h(ML.Badge, { tone: data.valid ? 'success' : 'error' }, data.valid ? t('category.valid') : t('category.invalid')),
              data.laws
                ? h(ML.KV, {
                    rows: Object.keys(data.laws).map(function (key) {
                      const value = data.laws[key];
                      return { label: key, value: ML.isObj(value) ? ML.safeString(value.ok !== undefined ? (value.ok ? 'ok' : 'fail') : value) : ML.safeString(value) };
                    }),
                  })
                : null,
              h(ViolationList, { violations: data.violations }),
              h(ML.RawJSON, { value: data }),
            );
          })(),
        ),
      ),
      h(
        'div',
        { className: 'ml-card' },
        h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('category.naturalTitle'))),
        h(
          'div',
          { className: 'ml-card-bd ml-stack' },
          h(
            'div',
            { className: 'ml-form-grid' },
            h(ML.Field, { label: t('category.F'), children: (id) => h(ML.Textarea, { id: id, rows: 2, value: fText, onChange: function (event) { setFText(event.target.value); } }) }),
            h(ML.Field, { label: t('category.F') + ' · morphisms', children: (id) => h(ML.Textarea, { id: id, rows: 2, value: fMorphText, onChange: function (event) { setFMorphText(event.target.value); } }) }),
            h(ML.Field, { label: t('category.G'), children: (id) => h(ML.Textarea, { id: id, rows: 2, value: gText, onChange: function (event) { setGText(event.target.value); } }) }),
            h(ML.Field, { label: t('category.G') + ' · morphisms', children: (id) => h(ML.Textarea, { id: id, rows: 2, value: gMorphText, onChange: function (event) { setGMorphText(event.target.value); } }) }),
          ),
          h(ML.Field, {
            label: t('category.components'),
            children: (id) => h(ML.Textarea, { id: id, rows: 2, value: componentsText, onChange: function (event) { setComponentsText(event.target.value); } }),
          }),
          h(
            'div',
            { className: 'ml-row' },
            h(ML.Btn, { variant: 'primary', onClick: runNatural, disabled: naturalCall.loading }, naturalCall.loading ? t('common.running') : t('category.checkNatural')),
          ),
          naturalCall.error ? h(ML.ErrorBox, { error: naturalCall.error }) : null,
          naturalCall.result
            ? h(
                'div',
                { className: 'ml-stack-sm' },
                h(ML.Badge, { tone: naturalCall.result.valid ? 'success' : 'error' }, naturalCall.result.valid ? t('category.valid') : t('category.invalid')),
                h(ViolationList, { violations: naturalCall.result.violations }),
                ML.toArr(naturalCall.result.naturality).length
                  ? h(ML.LabeledTable, {
                      rowLabels: ML.toArr(naturalCall.result.naturality).map(function (entry) { return String(entry.object); }),
                      colLabels: ['object', 'source', 'target', 'ok'],
                      cells: ML.toArr(naturalCall.result.naturality).map(function (entry) {
                        const square = entry.square || {};
                        return [String(entry.object), ML.safeString(square.source), ML.safeString(square.target), square.ok === undefined ? '' : square.ok ? '✓' : '✗'];
                      }),
                    })
                  : null,
                h(ML.RawJSON, { value: naturalCall.result }),
              )
            : null,
        ),
      ),
    );
  }

  function DiagramVerifyTool(props) {
    const t = ML.useT();
    const [pairsText, setPairsText] = useState('A -> C');
    const [selected, setSelected] = useState(0);
    const call = ML.useCall();
    const pairList = ML.parseMappings(pairsText).map(function (pair) {
      return { from: pair[0], to: pair[1] };
    });

    const run = function () {
      call.run('category.verify_diagram', { category: props.category, pairs: pairList });
    };

    useEffect(
      function () {
        if (!props.openAction) return;
        const action = props.openAction;
        if (String(action.op || '') !== 'category.verify_diagram') return;
        const args = action.args || {};
        if (Array.isArray(args.pairs)) {
          setPairsText(
            args.pairs
              .map(function (pair) {
                return String(pair.from) + ' -> ' + String(pair.to);
              })
              .join('\n'),
          );
        }
        call.run('category.verify_diagram', args);
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    const pairs = ML.toArr(data.pairs);
    const activePair = pairs[selected] || null;
    const highlight = activePair
      ? ML.toArr(activePair.composites).concat(
          ML.toArr(activePair.paths).reduce(function (accumulator, path) {
            return accumulator.concat(ML.toArr(path));
          }, []),
        )
      : [];
    return h(
      'div',
      { className: 'ml-stack' },
      h(ML.Field, {
        label: t('category.pairs'),
        hint: 'A -> C',
        children: (id) => h(ML.Textarea, { id: id, rows: 3, value: pairsText, onChange: function (event) { setPairsText(event.target.value); } }),
      }),
      h(
        'div',
        { className: 'ml-toolbar' },
        h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('category.verify')),
      ),
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: run }) : null,
      call.loading ? h(ML.Loading, null) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h(
              'div',
              { className: 'ml-card-hd' },
              h('h2', { className: 'ml-card-title' }, t('category.verifyTitle')),
              h(ML.Badge, { tone: data.ok ? 'success' : 'error' }, data.ok ? t('category.valid') : t('category.invalid')),
            ),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              h(
                'ul',
                { className: 'ml-list' },
                pairs.map(function (pair, index) {
                  const equalText = pair.equal === undefined ? '?' : pair.equal ? '✓' : '✗';
                  return h(
                    'li',
                    { key: index },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'ml-btn ml-btn-subtle ml-btn-sm',
                        onClick: function () { setSelected(index); },
                      },
                      String(pair.from) + ' → ' + String(pair.to) + '  ' + equalText + '  [' + ML.toArr(pair.composites).join(' ∘ ') + ']',
                    ),
                    h(
                      'span',
                      { className: 'ml-hint' },
                      ' · ' + ML.toArr(pair.paths).length + ' ' + t('category.paths'),
                    ),
                  );
                }),
              ),
              h(ML.CommutativeDiagram, { category: props.category, highlightMorphismIds: highlight }),
              h(ML.RawJSON, { value: data }),
            ),
          )
        : null,
    );
  }

  function LimitsTool(props) {
    const t = ML.useT();
    const [kind, setKind] = useState('product');
    const [argsText, setArgsText] = useState(function () { return JSON.stringify(LIMIT_EXAMPLES.product, null, 2); });
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();

    const changeKind = function (next) {
      setKind(next);
      setArgsText(JSON.stringify(LIMIT_EXAMPLES[next] || {}, null, 2));
      setLocalError(null);
    };

    const run = function (argsOverride) {
      let args;
      if (argsOverride) args = argsOverride;
      else {
        try {
          args = JSON.parse(argsText);
        } catch (error) {
          setLocalError(t('category.invalidJSON') + error.message);
          return;
        }
      }
      if (!ML.isObj(args)) {
        setLocalError(t('category.invalidJSON') + 'expected an object');
        return;
      }
      setLocalError(null);
      call.run('category.limit', Object.assign({ kind: kind }, args));
    };

    useEffect(
      function () {
        if (!props.openAction) return;
        const action = props.openAction;
        if (String(action.op || '') !== 'category.limit') return;
        const args = action.args || {};
        if (LIMIT_KINDS.indexOf(args.kind) >= 0) {
          setKind(args.kind);
          setArgsText(JSON.stringify(Object.assign({}, args), null, 2));
        }
        call.run('category.limit', args);
      },
      [props.openAction && props.openAction.seq],
    );

    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-form-grid' },
        h(ML.Field, {
          label: t('category.kind'),
          children: (id) =>
            h(ML.Select, {
              id: id,
              value: kind,
              onChange: function (event) { changeKind(event.target.value); },
              options: LIMIT_KINDS.map(function (name) {
                return { value: name, label: t('category.' + name) };
              }),
            }),
        }),
      ),
      h(ML.Field, {
        label: t('category.args'),
        children: (id) => h(ML.Textarea, { id: id, rows: 8, value: argsText, className: 'ml-mono', onChange: function (event) { setArgsText(event.target.value); } }),
      }),
      h(
        'div',
        { className: 'ml-toolbar' },
        h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('category.runLimit')),
      ),
      localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { run(); } }) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h(
              'div',
              { className: 'ml-card-hd' },
              h('h2', { className: 'ml-card-title' }, t('category.universal')),
              h(ML.Badge, { tone: 'brand' }, String(kind)),
            ),
            h('div', { className: 'ml-card-bd ml-stack' }, h(ML.DataView, { data: call.result })),
          )
        : null,
    );
  }

  ML.tabs.category = {
    id: 'category',
    order: 40,
    Component: function CategoryTab(props) {
      const t = ML.useT();
      const [section, setSection] = useState('editor');
      const chain = makeChainCategory();
      const [objects, setObjects] = useState(chain.objects);
      const [morphisms, setMorphisms] = useState(chain.morphisms);
      const [identities, setIdentities] = useState(chain.identities);
      const [compositions, setCompositions] = useState(chain.compositions);
      const category = useMemo(function () {
        return categoryFromState({ objects: objects, morphisms: morphisms, identities: identities, compositions: compositions });
      }, [objects, morphisms, identities, compositions]);

      useEffect(
        function () {
          if (!props.openAction) return;
          const op = String(props.openAction.op || '');
          if (op === 'category.validate') setSection('editor');
          else if (op === 'category.functor' || op === 'category.natural' || op === 'category.equivalence') setSection('functor');
          else if (op === 'category.verify_diagram') setSection('diagram');
          else if (op === 'category.limit') setSection('limits');
        },
        [props.openAction && props.openAction.seq],
      );

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('category.hintCompose') }, t('category.title')),
        h(ML.Tabs, {
          items: [
            { id: 'editor', label: t('category.section.editor') },
            { id: 'functor', label: t('category.section.functor') },
            { id: 'diagram', label: t('category.section.diagram') },
            { id: 'limits', label: t('category.section.limits') },
          ],
          value: section,
          onChange: setSection,
          size: 'sm',
          ariaLabel: t('category.title'),
        }),
        section === 'editor'
          ? h(CategoryEditor, {
              objects: objects,
              morphisms: morphisms,
              identities: identities,
              compositions: compositions,
              setObjects: setObjects,
              setMorphisms: setMorphisms,
              setIdentities: setIdentities,
              setCompositions: setCompositions,
              openAction: props.openAction,
            })
          : null,
        section === 'functor' ? h(FunctorTool, { openAction: props.openAction }) : null,
        section === 'diagram' ? h(DiagramVerifyTool, { category: category, openAction: props.openAction }) : null,
        section === 'limits' ? h(LimitsTool, { openAction: props.openAction }) : null,
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;

  ML.assignStrings(
    {
      'tab.logic': '逻辑',
      'logic.title': '数理逻辑',
      'logic.hint': '命题：~ & | -> <->；一阶：forall x. exists x. P(x)；模态：[] <>。',
      'logic.formula': '公式',
      'logic.premises': '前提（每行一个）',
      'logic.goal': '目标',
      'logic.formulaB': '公式 b（等价性检查）',
      'logic.logicType': '逻辑',
      'logic.prop': '命题逻辑',
      'logic.fol': '一阶逻辑',
      'logic.modal': '模态逻辑',
      'logic.frame': '框架',
      'logic.worlds': '世界数',
      'logic.domain': '论域大小上限',
      'logic.act.parse': '解析',
      'logic.act.truthtable': '真值表',
      'logic.act.prove': '自然演绎证明',
      'logic.act.prove_fol': '一阶有界有效性',
      'logic.act.resolve': '归结',
      'logic.act.modal': '模态有效性',
      'logic.act.equivalent': '等价性',
      'logic.palette': '符号',
      'logic.pretty': '美化输出',
      'logic.atoms': '原子命题',
      'logic.freeVars': '自由变量',
      'logic.wellFormed': '语法合法',
      'logic.ast': '语法树',
      'logic.tautology': '重言式',
      'logic.contradiction': '矛盾式',
      'logic.satisfiable': '可满足',
      'logic.valid': '有效',
      'logic.invalid': '无效',
      'logic.proof': '证明',
      'logic.fitchView': 'Fitch 行式',
      'logic.treeView': '证明树',
      'logic.countermodel': '反模型',
      'logic.noProof': '没有构造出证明。',
      'logic.refutable': '可反驳',
      'logic.clauses': '子句集',
      'logic.steps': '归结步骤',
      'logic.equivalent': '等价',
      'logic.notEquivalent': '不等价',
      'logic.searched': '搜索规模',
      'logic.note': '说明',
      'logic.cnf': 'CNF',
      'logic.dnf': 'DNF',
      'logic.premisesEmpty': '（无）',
      'logic.examples': '示例',
      'logic.example.deMorgan': '德摩根律',
      'logic.example.syllogism': '三段论（FOL）',
      'logic.example.modal': '模态 T 公理',
      'logic.example.folValid': '一阶有效式',
      'logic.example.equiv': '蕴涵展开',
      'logic.example.excluded': '排中律',
      'logic.runHint': '证明需要前提与目标；解析与真值表只看公式。',
      'logic.invalidGoal': '请输入目标公式。',
      'logic.invalidFormula': '请输入公式。',
      'logic.unsupportedHint': '该逻辑类型可能不支持当前操作，请按提示切换。',
    },
    {
      'tab.logic': 'Logic',
      'logic.title': 'Mathematical logic',
      'logic.hint': 'Prop: ~ & | -> <->; FOL: forall x. exists x. P(x); modal: [] <>.',
      'logic.formula': 'Formula',
      'logic.premises': 'Premises (one per line)',
      'logic.goal': 'Goal',
      'logic.formulaB': 'Formula b (equivalence)',
      'logic.logicType': 'Logic',
      'logic.prop': 'Propositional',
      'logic.fol': 'First-order',
      'logic.modal': 'Modal',
      'logic.frame': 'Frame',
      'logic.worlds': 'Worlds',
      'logic.domain': 'Domain size bound',
      'logic.act.parse': 'Parse',
      'logic.act.truthtable': 'Truth table',
      'logic.act.prove': 'Natural deduction',
      'logic.act.prove_fol': 'Bounded FOL validity',
      'logic.act.resolve': 'Resolution',
      'logic.act.modal': 'Modal validity',
      'logic.act.equivalent': 'Equivalence',
      'logic.palette': 'Symbols',
      'logic.pretty': 'Pretty',
      'logic.atoms': 'Atoms',
      'logic.freeVars': 'Free variables',
      'logic.wellFormed': 'Well formed',
      'logic.ast': 'AST',
      'logic.tautology': 'Tautology',
      'logic.contradiction': 'Contradiction',
      'logic.satisfiable': 'Satisfiable',
      'logic.valid': 'Valid',
      'logic.invalid': 'Invalid',
      'logic.proof': 'Proof',
      'logic.fitchView': 'Fitch lines',
      'logic.treeView': 'Proof tree',
      'logic.countermodel': 'Countermodel',
      'logic.noProof': 'No proof was produced.',
      'logic.refutable': 'Refutable',
      'logic.clauses': 'Clauses',
      'logic.steps': 'Resolution steps',
      'logic.equivalent': 'equivalent',
      'logic.notEquivalent': 'not equivalent',
      'logic.searched': 'Search size',
      'logic.note': 'Note',
      'logic.cnf': 'CNF',
      'logic.dnf': 'DNF',
      'logic.premisesEmpty': '(none)',
      'logic.examples': 'Examples',
      'logic.example.deMorgan': 'De Morgan',
      'logic.example.syllogism': 'Syllogism (FOL)',
      'logic.example.modal': 'Modal T axiom',
      'logic.example.folValid': 'FOL validity',
      'logic.example.equiv': 'Implication expansion',
      'logic.example.excluded': 'Excluded middle',
      'logic.runHint': 'Proofs use premises + goal; parse and truth tables only read the formula.',
      'logic.invalidGoal': 'Enter a goal formula.',
      'logic.invalidFormula': 'Enter a formula.',
      'logic.unsupportedHint': 'This logic may not support the chosen action; switch logic or action.',
    },
  );

  const PALETTE = ['¬', '∧', '∨', '→', '↔', '∀', '∃', '□', '◇', '⊢', '⊨', '(', ')', '~', '&', '|', '->', '<->', 'T', 'F', '[]', '<>'];

  const ACTIONS = ['parse', 'truthtable', 'prove', 'prove_fol', 'resolve', 'modal', 'equivalent'];

  const EXAMPLES = [
    {
      id: 'deMorgan',
      logic: 'prop',
      formula: '~(A & B) -> (~A | ~B)',
      premises: '',
      goal: '~(A & B) -> (~A | ~B)',
      action: 'prove',
    },
    {
      id: 'excluded',
      logic: 'prop',
      formula: 'A | ~A',
      premises: '',
      goal: 'A | ~A',
      action: 'truthtable',
    },
    {
      id: 'syllogism',
      logic: 'fol',
      formula: 'forall x. (P(x) -> Q(x))',
      premises: 'forall x. (P(x) -> Q(x))\nP(a)',
      goal: 'Q(a)',
      action: 'prove_fol',
    },
    {
      id: 'folValid',
      logic: 'fol',
      formula: 'forall x. (P(x) -> P(x))',
      premises: '',
      goal: 'forall x. (P(x) -> P(x))',
      action: 'prove_fol',
    },
    {
      id: 'modal',
      logic: 'modal',
      formula: '[]P -> P',
      premises: '',
      goal: '[]P -> P',
      action: 'modal',
    },
    {
      id: 'equiv',
      logic: 'prop',
      formula: 'A -> B',
      formulaB: '~A | B',
      premises: '',
      goal: 'A -> B',
      action: 'equivalent',
    },
  ];

  function parsePremises(text) {
    return ML.lines(text);
  }

  function boolBadge(t, value, trueLabel, falseLabel) {
    return h(ML.Badge, { tone: value ? 'success' : 'error' }, value ? trueLabel : falseLabel);
  }

  ML.tabs.logic = {
    id: 'logic',
    order: 50,
    Component: function LogicTab(props) {
      const t = ML.useT();
      const [logic, setLogic] = useState('prop');
      const [formula, setFormula] = useState('(A & B) -> A');
      const [formulaB, setFormulaB] = useState('~A | B');
      const [premisesText, setPremisesText] = useState('');
      const [goal, setGoal] = useState('(A & B) -> A');
      const [frame, setFrame] = useState('K');
      const [worlds, setWorlds] = useState('3');
      const [domainSize, setDomainSize] = useState('4');
      const [lastAction, setLastAction] = useState('prove');
      const [proofView, setProofView] = useState('fitch');
      const [localError, setLocalError] = useState(null);
      const call = ML.useCall();
      const lastRequest = useRef(null);
      const formulaRef = useRef(null);

      const parseP = function () {
        return parsePremises(premisesText);
      };

      const buildRequest = function (action) {
        if (action === 'parse') return { op: 'logic.parse', args: { formula: formula, logic: logic } };
        if (action === 'truthtable') return { op: 'logic.truthtable', args: { formula: formula } };
        if (action === 'prove') {
          if (!String(goal).trim()) return { error: 'goal' };
          return { op: 'logic.prove', args: { premises: parseP(), goal: goal, system: 'nd' } };
        }
        if (action === 'prove_fol') {
          if (!String(goal).trim()) return { error: 'goal' };
          return {
            op: 'logic.prove_fol',
            args: { premises: parseP(), goal: goal, domainSize: parseInt(domainSize, 10) || 4, maxSolutions: 1 },
          };
        }
        if (action === 'resolve') {
          if (!String(goal).trim()) return { error: 'goal' };
          return { op: 'logic.resolve', args: { premises: parseP(), goal: goal } };
        }
        if (action === 'modal') {
          return { op: 'logic.modal', args: { frame: frame, formula: formula, worlds: parseInt(worlds, 10) || 3 } };
        }
        if (action === 'equivalent') {
          if (!String(formula).trim() || !String(formulaB).trim()) return { error: 'formula' };
          return { op: 'logic.equivalent', args: { a: formula, b: formulaB } };
        }
        return { error: 'unsupported' };
      };

      const run = function (action) {
        const request = buildRequest(action);
        if (request.error === 'goal') return setLocalError(t('logic.invalidGoal'));
        if (request.error === 'formula') return setLocalError(t('logic.invalidFormula'));
        if (request.error) return setLocalError(t('logic.unsupportedHint'));
        setLocalError(null);
        setLastAction(action);
        lastRequest.current = { action: action, op: request.op, args: request.args };
        call.run(request.op, request.args);
      };

      const insertSymbol = function (text) {
        const inserted = ML.insertAtActive(text);
        if (inserted) return;
        const node = formulaRef.current;
        if (!node) return;
        node.focus();
        try {
          const end = node.value.length;
          node.setSelectionRange(end, end);
        } catch (error) {

        }
        ML.insertAtActive(text);
      };

      const applyExample = function (example) {
        setLogic(example.logic);
        setFormula(example.formula);
        setPremisesText(example.premises || '');
        setGoal(example.goal || example.formula);
        if (example.formulaB !== undefined) setFormulaB(example.formulaB);
        setLocalError(null);
        setLastAction(example.action);
        const request = (function () {
          if (example.action === 'truthtable') return { op: 'logic.truthtable', args: { formula: example.formula } };
          if (example.action === 'prove') return { op: 'logic.prove', args: { premises: ML.lines(example.premises), goal: example.goal, system: 'nd' } };
          if (example.action === 'prove_fol')
            return { op: 'logic.prove_fol', args: { premises: ML.lines(example.premises), goal: example.goal, domainSize: 4, maxSolutions: 1 } };
          if (example.action === 'modal') return { op: 'logic.modal', args: { frame: 'K', formula: example.formula, worlds: 3 } };
          if (example.action === 'equivalent') return { op: 'logic.equivalent', args: { a: example.formula, b: example.formulaB } };
          return { op: 'logic.parse', args: { formula: example.formula, logic: example.logic } };
        })();
        lastRequest.current = request;
        call.run(request.op, request.args);
      };

      useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          const opName = String(action.op || '');
          if (opName.indexOf('logic.') !== 0) return;
          const args = action.args || {};
          if (typeof args.formula === 'string') setFormula(args.formula);
          if (typeof args.a === 'string') setFormula(args.a);
          if (typeof args.b === 'string') setFormulaB(args.b);
          if (typeof args.goal === 'string') setGoal(args.goal);
          if (Array.isArray(args.premises)) setPremisesText(args.premises.join('\n'));
          if (typeof args.frame === 'string') setFrame(args.frame);
          if (args.logic) setLogic(args.logic);
          else if (opName === 'logic.prove_fol' || opName === 'logic.resolve') setLogic('fol');
          else if (opName === 'logic.modal') setLogic('modal');
          const mapping = {
            'logic.parse': 'parse',
            'logic.truthtable': 'truthtable',
            'logic.prove': 'prove',
            'logic.prove_fol': 'prove_fol',
            'logic.resolve': 'resolve',
            'logic.modal': 'modal',
            'logic.equivalent': 'equivalent',
          };
          setLastAction(mapping[opName] || 'parse');
          lastRequest.current = { action: mapping[opName] || 'parse', op: opName, args: args };
          call.run(opName, args);
        },
        [props.openAction && props.openAction.seq],
      );

      const data = call.result || {};
      const renderResult = function () {
        if (!call.result) return null;
        if (lastAction === 'parse') {
          return h(
            'div',
            { className: 'ml-stack' },
            h(
              'div',
              { className: 'ml-row' },
              boolBadge(t, data.wellFormed, t('logic.wellFormed'), t('logic.invalid')),
              ML.toArr(data.atoms).length
                ? h(
                    'span',
                    { className: 'ml-chip-row' },
                    ML.toArr(data.atoms).map(function (atom) {
                      return h(ML.Badge, { key: String(atom), tone: 'brand' }, String(atom));
                    }),
                  )
                : null,
            ),
            data.latex ? h(ML.FormulaBlock, { tex: data.latex }) : data.pretty ? h('pre', { className: 'ml-pre' }, data.pretty) : null,
            h(ML.KV, {
              rows: [
                ML.toArr(data.freeVars).length ? { label: t('logic.freeVars'), value: ML.toArr(data.freeVars).join(', ') } : null,
              ].filter(Boolean),
            }),
            h(ML.Collapse, { title: t('logic.ast') }, h(ML.JSONTree, { value: data.ast })),
            h(ML.RawJSON, { value: data }),
          );
        }
        if (lastAction === 'truthtable') {
          return h(
            'div',
            { className: 'ml-stack' },
            h(
              'div',
              { className: 'ml-row' },
              data.tautology ? h(ML.Badge, { tone: 'success' }, t('logic.tautology')) : null,
              data.contradiction ? h(ML.Badge, { tone: 'warn' }, t('logic.contradiction')) : null,
              data.satisfiable !== undefined ? boolBadge(t, data.satisfiable, t('logic.satisfiable'), '¬' + t('logic.satisfiable')) : null,
              ML.toArr(data.atoms).length ? h('span', { className: 'ml-hint' }, ML.toArr(data.atoms).length + ' atoms · ' + ML.toArr(data.rows).length + ' rows') : null,
            ),
            h(ML.TruthTable, { data: data }),
            data.cnf || data.dnf
              ? h(
                  'div',
                  { className: 'ml-stack-sm' },
                  data.cnf ? h(ML.KV, { rows: [{ label: t('logic.cnf'), value: ML.safeString(data.cnf), mono: true }] }) : null,
                  data.dnf ? h(ML.KV, { rows: [{ label: t('logic.dnf'), value: ML.safeString(data.dnf), mono: true }] }) : null,
                )
              : null,
            data.latex ? h(ML.FormulaBlock, { tex: data.latex }) : null,
            h(ML.RawJSON, { value: data }),
          );
        }
        if (lastAction === 'prove') {

          const proof = data;
          const fitch = ML.toArr(proof && proof.fitch);
          return h(
            'div',
            { className: 'ml-stack' },
            h(
              'div',
              { className: 'ml-row' },
              boolBadge(t, data.valid, t('logic.valid'), t('logic.invalid')),
              data.valid && fitch.length
                ? h(ML.Tabs, {
                    items: [
                      { id: 'fitch', label: t('logic.fitchView') },
                      { id: 'tree', label: t('logic.treeView') },
                    ],
                    value: proofView,
                    onChange: setProofView,
                    size: 'sm',
                    ariaLabel: t('logic.proof'),
                  })
                : null,
            ),
            data.valid
              ? proofView === 'tree'
                ? h(ML.ProofTree, { proof: proof })
                : h(ML.FitchProof, { proof: proof })
              : !data.valid && data.countermodel
                ? h(
                    'div',
                    { className: 'ml-stack-sm' },
                    h(ML.SectionTitle, null, t('logic.countermodel')),
                    h(ML.Countermodel, { countermodel: data.countermodel }),
                  )
                : h(ML.Banner, { tone: 'warn' }, t('logic.noProof')),
            h(ML.RuleLegend, null),
            h(ML.RawJSON, { value: data }),
          );
        }
        if (lastAction === 'prove_fol') {
          return h(
            'div',
            { className: 'ml-stack' },
            h(
              'div',
              { className: 'ml-row' },
              boolBadge(t, data.valid, t('logic.valid'), t('logic.invalid')),
              data.searched !== undefined ? h(ML.Badge, { tone: 'idle' }, t('logic.searched') + ': ' + ML.safeString(data.searched)) : null,
            ),
            data.countermodel ? h(ML.Countermodel, { countermodel: data.countermodel }) : null,
            data.note ? h(ML.Banner, { tone: 'info' }, String(data.note)) : null,
            h(ML.RawJSON, { value: data }),
          );
        }
        if (lastAction === 'resolve') {
          return h(
            'div',
            { className: 'ml-stack' },
            h(ML.Badge, { tone: data.refutable ? 'success' : 'idle' }, t('logic.refutable') + ': ' + (data.refutable ? 'true' : 'false')),
            ML.toArr(data.clauses).length
              ? h(
                  'div',
                  null,
                  h(ML.SectionTitle, null, t('logic.clauses')),
                  h(
                    'ul',
                    { className: 'ml-list' },
                    ML.toArr(data.clauses).map(function (clause, index) {
                      return h('li', { key: index, className: 'ml-mono' }, ML.isObj(clause) ? ML.prettyJSON(clause, 400) : ML.safeString(clause));
                    }),
                  ),
                )
              : null,
            ML.toArr(data.steps).length
              ? h(
                  'div',
                  null,
                  h(ML.SectionTitle, null, t('logic.steps')),
                  h(
                    'ol',
                    { className: 'ml-list' },
                    ML.toArr(data.steps).map(function (step, index) {
                      return h('li', { key: index, className: 'ml-mono' }, ML.safeString(ML.isObj(step) ? ML.prettyJSON(step, 400) : step));
                    }),
                  ),
                )
              : null,
            data.note ? h(ML.Banner, { tone: 'info' }, String(data.note)) : null,
            h(ML.RawJSON, { value: data }),
          );
        }
        if (lastAction === 'modal') {
          return h(
            'div',
            { className: 'ml-stack' },
            h(
              'div',
              { className: 'ml-row' },
              boolBadge(t, data.valid, t('logic.valid'), t('logic.invalid')),
              h(ML.Badge, { tone: 'brand' }, frame),
            ),
            data.countermodel ? h(ML.Countermodel, { countermodel: data.countermodel }) : null,
            data.note ? h(ML.Banner, { tone: 'info' }, String(data.note)) : null,
            h(ML.RawJSON, { value: data }),
          );
        }
        if (lastAction === 'equivalent') {
          return h(
            'div',
            { className: 'ml-stack' },
            boolBadge(t, data.equivalent, t('logic.equivalent'), t('logic.notEquivalent')),
            data.countermodel ? h(ML.Countermodel, { countermodel: data.countermodel }) : null,
            h(ML.RawJSON, { value: data }),
          );
        }
        return h(ML.DataView, { data: data });
      };

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('logic.hint') }, t('logic.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('logic.logicType'),
                children: (id) =>
                  h(ML.Select, {
                    id: id,
                    value: logic,
                    onChange: function (event) {
                      setLogic(event.target.value);
                      setLocalError(null);
                    },
                    options: [
                      { value: 'prop', label: t('logic.prop') },
                      { value: 'fol', label: t('logic.fol') },
                      { value: 'modal', label: t('logic.modal') },
                    ],
                  }),
              }),
              logic === 'modal'
                ? h(ML.Field, {
                    label: t('logic.frame'),
                    children: (id) =>
                      h(ML.Select, {
                        id: id,
                        value: frame,
                        onChange: function (event) { setFrame(event.target.value); },
                        options: ['K', 'T', 'S4', 'S5'].map(function (name) { return { value: name, label: name }; }),
                      }),
                  })
                : null,
              logic === 'modal'
                ? h(ML.Field, {
                    label: t('logic.worlds'),
                    children: (id) => h(ML.Input, { id: id, value: worlds, inputMode: 'numeric', onChange: function (event) { setWorlds(event.target.value); } }),
                  })
                : null,
              logic === 'fol'
                ? h(ML.Field, {
                    label: t('logic.domain'),
                    children: (id) => h(ML.Input, { id: id, value: domainSize, inputMode: 'numeric', onChange: function (event) { setDomainSize(event.target.value); } }),
                  })
                : null,
            ),
            h(ML.Field, {
              label: t('logic.formula'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  ref: formulaRef,
                  rows: 2,
                  value: formula,
                  className: 'ml-mono',
                  onChange: function (event) { setFormula(event.target.value); },
                }),
            }),
            h(
              'div',
              { className: 'ml-row' },
              h('span', { className: 'ml-hint' }, t('logic.palette')),
              PALETTE.map(function (symbol, index) {
                return h(
                  'button',
                  {
                    key: index,
                    type: 'button',
                    className: 'ml-kbd',
                    'aria-label': 'insert ' + symbol,
                    onMouseDown: function (event) { event.preventDefault(); },
                    onClick: function () { insertSymbol(symbol); },
                  },
                  symbol,
                );
              }),
            ),
            h(
              'div',
              { className: 'ml-form-grid', style: { marginTop: 10 } },
              h(ML.Field, {
                label: t('logic.premises'),
                children: (id) =>
                  h(ML.Textarea, {
                    id: id,
                    rows: 2,
                    value: premisesText,
                    className: 'ml-mono',
                    placeholder: t('logic.premisesEmpty'),
                    onChange: function (event) { setPremisesText(event.target.value); },
                  }),
              }),
              h(ML.Field, {
                label: t('logic.goal'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: goal,
                    className: 'ml-mono',
                    onChange: function (event) { setGoal(event.target.value); },
                  }),
              }),
              h(ML.Field, {
                label: t('logic.formulaB'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: formulaB,
                    className: 'ml-mono',
                    onChange: function (event) { setFormulaB(event.target.value); },
                  }),
              }),
            ),
            h(
              'div',
              { className: 'ml-toolbar' },
              ACTIONS.map(function (action) {
                return h(
                  ML.Btn,
                  {
                    key: action,
                    variant: action === 'prove' ? 'primary' : 'ghost',
                    onClick: function () { run(action); },
                    disabled: call.loading,
                  },
                  t('logic.act.' + action),
                );
              }),
            ),
            h('div', { className: 'ml-hint' }, t('logic.runHint')),
            localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
            h(
              'div',
              { className: 'ml-row', style: { marginTop: 10 } },
              h('span', { className: 'ml-hint' }, t('logic.examples')),
              EXAMPLES.map(function (example) {
                return h(
                  'button',
                  { key: example.id, type: 'button', className: 'ml-chip', onClick: function () { applyExample(example); } },
                  t('logic.example.' + example.id),
                );
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('common.result')),
            call.op ? h('span', { className: 'ml-hint' }, call.op) : null,
            call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            call.loading
              ? h(ML.Loading, null)
              : call.error
                ? h(ML.ErrorBox, {
                    error: call.error,
                    onRetry: function () {
                      if (lastRequest.current) call.run(lastRequest.current.op, lastRequest.current.args);
                    },
                  })
                : call.result
                  ? renderResult()
                  : h(ML.Empty, { label: t('common.noResult') }),
          ),
        ),
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;

  ML.assignStrings(
    {
      'tab.lean': 'Lean',
      'lean.title': 'Lean 4 工作台',
      'lean.status': '环境状态',
      'lean.available': 'Lean 可用',
      'lean.unavailable': 'Lean 未安装',
      'lean.checking': '正在检测 Lean 环境…',
      'lean.version': '版本',
      'lean.path': '路径',
      'lean.lake': 'lake',
      'lean.note': '说明',
      'lean.installHint': '安装方式：先安装 elan（Lean 版本管理器），再运行 `elan default leanprover/lean4:stable`。插件会自动检测 PATH 中的 lean / lake；Mathlib 项目请配置 lakefile 后使用 `lake env lean`。',
      'lean.retryInfo': '重新检测',
      'lean.editor': '代码检查',
      'lean.code': 'Lean 代码',
      'lean.filename': '虚拟文件名',
      'lean.timeout': '超时（毫秒）',
      'lean.check': '检查',
      'lean.checking2': '正在运行 lean…',
      'lean.ok': '通过',
      'lean.failed': '有错误',
      'lean.diagnostics': '诊断信息',
      'lean.severity': '级别',
      'lean.line': '行',
      'lean.column': '列',
      'lean.message': '信息',
      'lean.stdout': '标准输出',
      'lean.stderr': '标准错误',
      'lean.elapsed': '耗时',
      'lean.leanVersion': 'Lean 版本',
      'lean.noDiagnostics': '没有诊断信息。',
      'lean.snippets': '片段库',
      'lean.searchSnippets': '搜索片段…',
      'lean.level': '级别',
      'lean.all': '全部',
      'lean.beginner': '入门',
      'lean.intermediate': '进阶',
      'lean.advanced': '高级',
      'lean.insert': '插入代码',
      'lean.loadSnippets': '加载片段库',
      'lean.noSnippets': '片段库为空或尚未加载。',
      'lean.imports': '导入',
      'lean.cheatsheet': '符号与 Mathlib 名称',
      'lean.cheatsheetHint': '常用记号在 Lean 4 / Mathlib4 中的写法。',
      'lean.checkFile': '检查文件（只读）',
      'lean.filePath': '绝对路径',
      'lean.checkFileBtn': '检查文件',
      'lean.snippetInserted': '已插入编辑器',
      'lean.engineDown': 'Lean 信息需要 Python 引擎（lean.info）；引擎启动后会自动可用，可手动重试。',
      'lean.fileHint': 'lean.check_file 只读取文件，不会修改。',
    },
    {
      'tab.lean': 'Lean',
      'lean.title': 'Lean 4 workbench',
      'lean.status': 'Environment',
      'lean.available': 'Lean available',
      'lean.unavailable': 'Lean not installed',
      'lean.checking': 'Detecting the Lean toolchain…',
      'lean.version': 'Version',
      'lean.path': 'Path',
      'lean.lake': 'lake',
      'lean.note': 'Note',
      'lean.installHint': 'Install elan (the Lean version manager), then run `elan default leanprover/lean4:stable`. The plugin auto-detects lean / lake on PATH; for Mathlib projects use `lake env lean` inside the project.',
      'lean.retryInfo': 'Re-detect',
      'lean.editor': 'Check code',
      'lean.code': 'Lean code',
      'lean.filename': 'Virtual filename',
      'lean.timeout': 'Timeout (ms)',
      'lean.check': 'Check',
      'lean.checking2': 'Running lean…',
      'lean.ok': 'passed',
      'lean.failed': 'has errors',
      'lean.diagnostics': 'Diagnostics',
      'lean.severity': 'Severity',
      'lean.line': 'Line',
      'lean.column': 'Column',
      'lean.message': 'Message',
      'lean.stdout': 'stdout',
      'lean.stderr': 'stderr',
      'lean.elapsed': 'elapsed',
      'lean.leanVersion': 'Lean version',
      'lean.noDiagnostics': 'No diagnostics.',
      'lean.snippets': 'Snippet library',
      'lean.searchSnippets': 'Search snippets…',
      'lean.level': 'Level',
      'lean.all': 'all',
      'lean.beginner': 'beginner',
      'lean.intermediate': 'intermediate',
      'lean.advanced': 'advanced',
      'lean.insert': 'Insert code',
      'lean.loadSnippets': 'Load snippets',
      'lean.noSnippets': 'The snippet library is empty or not loaded yet.',
      'lean.imports': 'imports',
      'lean.cheatsheet': 'Notation and Mathlib names',
      'lean.cheatsheetHint': 'How common notation is written in Lean 4 / Mathlib4.',
      'lean.checkFile': 'Check a file (read-only)',
      'lean.filePath': 'Absolute path',
      'lean.checkFileBtn': 'Check file',
      'lean.snippetInserted': 'Inserted into the editor',
      'lean.engineDown': 'Lean info comes from the Python engine (lean.info); it becomes available once the engine is up — retry manually if needed.',
      'lean.fileHint': 'lean.check_file only reads the file; it is never modified.',
    },
  );

  const CHEATSHEET = [
    ['∀', 'forall', '∀ x, P x'],
    ['∃', 'exists', '∃ x, P x'],
    ['λ', 'fun', 'fun x => x + 1'],
    ['→', '→', 'P → Q'],
    ['↔', '↔', 'P ↔ Q'],
    ['∧', 'And', 'P ∧ Q'],
    ['∨', 'Or', 'P ∨ Q'],
    ['¬', 'Not', '¬ P'],
    ['≠', 'Ne', 'a ≠ b'],
    ['≤', 'le', 'a ≤ b'],
    ['⊢', '⊢', 'goal separator'],
    ['⊤', 'True', 'True'],
    ['⊥', 'False', 'False'],
    ['⋃', 'Set.iUnion', '⋃ i, s i'],
    ['⋂', 'Set.iInter', '⋂ i, s i'],
    ['∘', 'Function.comp', 'f ∘ g'],
    ['∑', 'Finset.sum', '∑ i in s, f i'],
    ['∏', 'Finset.prod', '∏ i in s, f i'],
    ['∫', 'MeasureTheory.integral', '∫ x, f x'],
    ['∂', 'deriv', 'deriv f x'],
    ['lim', 'Filter.Tendsto', 'Filter.Tendsto f l l\''],
    ['ℕ', 'Nat', 'Nat'],
    ['ℤ', 'Int', 'Int'],
    ['ℚ', 'Rat', 'Rat'],
    ['ℝ', 'Real', 'Real'],
    ['ℂ', 'Complex', 'Complex'],
    ['⋃/⋂', 'Set.union / Set.inter', 's ∪ t'],
  ];

  const LEVELS = ['beginner', 'intermediate', 'advanced'];

  function snippetImports(snippet) {
    return ML.toArr(snippet && snippet.imports);
  }

  function snippetCode(snippet) {
    const imports = snippetImports(snippet);
    const code = String((snippet && snippet.code) || '');
    if (imports.length === 0) return code;
    return imports.map(function (name) { return 'import ' + name; }).join('\n') + '\n\n' + code;
  }

  ML.tabs.lean = {
    id: 'lean',
    order: 60,
    Component: function LeanTab(props) {
      const t = ML.useT();
      const [info, setInfo] = useState(null);
      const [infoError, setInfoError] = useState(null);
      const [infoLoading, setInfoLoading] = useState(false);
      const [snippets, setSnippets] = useState([]);
      const [snippetsLoading, setSnippetsLoading] = useState(false);
      const [snippetsError, setSnippetsError] = useState(null);
      const [query, setQuery] = useState('');
      const [level, setLevel] = useState('all');
      const [code, setCode] = useState(
        'import Mathlib\n\n-- 在 MathLab 中检查 Lean 4 代码（无需 lake 项目时仅基础环境可用）\nexample (P Q : Prop) : P → Q → P := by\n  intro hP hQ\n  exact hP\n',
      );
      const [filename, setFilename] = useState('MathLab.lean');
      const [timeoutMs, setTimeoutMs] = useState('15000');
      const [filePath, setFilePath] = useState('');
      const [checkCall, setCheckCall] = useState(null);
      const started = useRef(false);
      const checkRequest = useRef(null);

      const loadInfo = async function () {
        setInfoLoading(true);
        setInfoError(null);
        try {
          const result = await ML.callMath('lean.info', {});
          setInfo(result || {});
        } catch (error) {
          setInfoError(error);
          setInfo(null);
        } finally {
          setInfoLoading(false);
        }
      };

      const loadSnippets = async function () {
        setSnippetsLoading(true);
        setSnippetsError(null);
        try {
          const result = await ML.callMath('lean.snippets', {});
          setSnippets(ML.toArr(result && result.snippets));
        } catch (error) {
          setSnippetsError(error);
        } finally {
          setSnippetsLoading(false);
        }
      };

      useEffect(
        function () {
          if (!props.active || started.current) return;
          started.current = true;
          loadInfo();
          loadSnippets();
        },
        [props.active],
      );

      useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          const opName = String(action.op || '');
          if (opName === 'lean.snippets' || opName === 'lean.get_snippet') {
            if (started.current) loadSnippets();
            else {
              started.current = true;
              loadInfo();
              loadSnippets();
            }
            const targetId = action.args && action.args.id;
            if (targetId) {
              const apply = function () {
                const found = snippets.filter(function (snippet) { return String(snippet.id) === String(targetId); })[0];
                if (found) setCode(snippetCode(found));
              };
              if (snippets.length > 0) apply();
              else ML.callMath('lean.snippets', {}).then(function (result) {
                const list = ML.toArr(result && result.snippets);
                setSnippets(list);
                const found = list.filter(function (snippet) { return String(snippet.id) === String(targetId); })[0];
                if (found) setCode(snippetCode(found));
              }).catch(function () {});
            }
            return;
          }
          if (opName === 'lean.check' && action.args) {
            setCode(String(action.args.code || code));
            runCheck(action.args);
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const runCheck = async function (argsOverride) {
        const args = argsOverride || {
          code: code,
          filename: filename || 'MathLab.lean',
          timeoutMs: parseInt(timeoutMs, 10) || 15000,
        };
        checkRequest.current = args;
        setCheckCall({ loading: true, error: null, result: null });
        try {
          const result = await ML.callMath('lean.check', args);
          setCheckCall({ loading: false, error: null, result: result });
        } catch (error) {
          setCheckCall({ loading: false, error: error, result: null });
        }
      };

      const runCheckFile = async function () {
        if (!String(filePath).trim()) return;
        const args = { path: String(filePath).trim(), timeoutMs: parseInt(timeoutMs, 10) || 15000 };
        checkRequest.current = args;
        setCheckCall({ loading: true, error: null, result: null });
        try {
          const result = await ML.callMath('lean.check_file', args);
          setCheckCall({ loading: false, error: null, result: result });
        } catch (error) {
          setCheckCall({ loading: false, error: error, result: null });
        }
      };

      const filteredSnippets = useMemo(function () {
        const needle = String(query || '').trim().toLowerCase();
        return snippets.filter(function (snippet) {
          if (level !== 'all' && String(snippet.level) !== level) return false;
          if (!needle) return true;
          const haystack = [
            snippet.title,
            snippet.title_zh,
            snippet.code,
            snippet.explanation,
            snippet.explanation_zh,
            ML.toArr(snippet.imports).join(' '),
            ML.toArr(snippet.tags).join(' '),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.indexOf(needle) >= 0;
        });
      }, [snippets, query, level]);

      const lang = ML.lang(t);
      const check = checkCall || { loading: false, error: null, result: null };
      const result = check.result || null;
      const diagnostics = ML.toArr(result && result.diagnostics);
      const available = !!(info && info.available);

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('lean.cheatsheetHint') }, t('lean.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('lean.status')),
            h(
              'div',
              { className: 'ml-card-actions' },
              available ? h(ML.Badge, { tone: 'success' }, t('lean.available')) : infoLoading ? h(ML.Badge, { tone: 'warn' }, t('lean.checking')) : h(ML.Badge, { tone: 'idle' }, t('lean.unavailable')),
              h(ML.Btn, { size: 'sm', onClick: loadInfo, disabled: infoLoading }, t('lean.retryInfo')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            infoLoading ? h(ML.Loading, { label: t('lean.checking') }) : null,
            infoError
              ? h(ML.ErrorBox, { error: infoError, onRetry: loadInfo, extra: t('lean.engineDown') })
              : null,
            info
              ? h(
                  'div',
                  { className: 'ml-stack-sm' },
                  h(ML.KV, {
                    rows: [
                      info.version ? { label: t('lean.version'), value: String(info.version), mono: true } : null,
                      info.path ? { label: t('lean.path'), value: String(info.path), mono: true } : null,
                      info.lake !== undefined && info.lake !== null ? { label: t('lean.lake'), value: ML.safeString(info.lake), mono: true } : null,
                      info.note ? { label: t('lean.note'), value: String(info.note) } : null,
                    ].filter(Boolean),
                  }),
                  available
                    ? null
                    : h(ML.Banner, { tone: 'warn' }, t('lean.installHint')),
                )
              : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('lean.editor')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', variant: 'ghost', onClick: function () { ML.copy(code); } }, t('common.copy')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h(ML.Field, {
              label: t('lean.code'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  rows: 12,
                  value: code,
                  className: 'ml-mono',
                  spellCheck: false,
                  onChange: function (event) { setCode(event.target.value); },
                }),
            }),
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('lean.filename'),
                children: (id) => h(ML.Input, { id: id, value: filename, onChange: function (event) { setFilename(event.target.value); } }),
              }),
              h(ML.Field, {
                label: t('lean.timeout'),
                children: (id) => h(ML.Input, { id: id, value: timeoutMs, inputMode: 'numeric', onChange: function (event) { setTimeoutMs(event.target.value); } }),
              }),
            ),
            h(
              'div',
              { className: 'ml-row' },
              h(ML.Btn, { variant: 'primary', onClick: function () { runCheck(); }, disabled: check.loading }, check.loading ? t('lean.checking2') : t('lean.check')),
              result && result.ok !== undefined
                ? h(ML.Badge, { tone: result.ok ? 'success' : 'error' }, result.ok ? t('lean.ok') : t('lean.failed'))
                : null,
              result && result.elapsedMs !== undefined ? h('span', { className: 'ml-hint' }, result.elapsedMs + ' ms') : null,
              result && result.leanVersion ? h('span', { className: 'ml-hint' }, result.leanVersion) : null,
            ),
            check.error ? h(ML.ErrorBox, { error: check.error, onRetry: function () { if (checkRequest.current) ML.callMath('lean.check', checkRequest.current).then(function (r) { setCheckCall({ loading: false, error: null, result: r }); }).catch(function (e) { setCheckCall({ loading: false, error: e, result: null }); }); } }) : null,
            check.loading ? h(ML.Loading, { label: t('lean.checking2') }) : null,
            result
              ? h(
                  'div',
                  { className: 'ml-stack' },
                  h(ML.SectionTitle, null, t('lean.diagnostics')),
                  diagnostics.length === 0
                    ? h(ML.Banner, { tone: result.ok ? 'success' : 'warn' }, t('lean.noDiagnostics'))
                    : h(ML.LabeledTable, {
                        rowLabels: diagnostics.map(function (diagnostic, index) { return String(index + 1); }),
                        colLabels: [t('lean.severity'), t('lean.line'), t('lean.column'), t('lean.message')],
                        cells: diagnostics.map(function (diagnostic) {
                          return [
                            String(diagnostic.severity || 'info'),
                            diagnostic.line === undefined ? '' : String(diagnostic.line),
                            diagnostic.column === undefined ? '' : String(diagnostic.column),
                            ML.safeString(diagnostic.message, 800),
                          ];
                        }),
                        cellClass: function (cell, rowIndex) {
                          const diagnostic = diagnostics[rowIndex];
                          if (!diagnostic) return undefined;
                          if (String(diagnostic.severity).toLowerCase() === 'error') return 'ml-tt-f';
                          if (String(diagnostic.severity).toLowerCase() === 'warning') return 'ml-tt-result';
                          return undefined;
                        },
                      }),
                  result.stdout ? h(ML.Collapse, { title: t('lean.stdout') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stdout))) : null,
                  result.stderr ? h(ML.Collapse, { title: t('lean.stderr') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stderr))) : null,
                  h(ML.RawJSON, { value: result }),
                )
              : null,
            h(
              ML.Collapse,
              { title: t('lean.checkFile') },
              h(ML.Field, {
                label: t('lean.filePath'),
                hint: t('lean.fileHint'),
                children: (id) => h(ML.Input, { id: id, value: filePath, className: 'ml-mono', placeholder: 'D:/project/MathLab.lean', onChange: function (event) { setFilePath(event.target.value); } }),
              }),
              h(
                'div',
                { className: 'ml-toolbar' },
                h(ML.Btn, { onClick: runCheckFile, disabled: !String(filePath).trim() }, t('lean.checkFileBtn')),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('lean.snippets')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', onClick: loadSnippets, disabled: snippetsLoading }, snippetsLoading ? t('common.loading') : t('lean.loadSnippets')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('lean.searchSnippets'),
                children: (id) =>
                  h(ML.Input, { id: id, value: query, onChange: function (event) { setQuery(event.target.value); } }),
              }),
              h(ML.Field, {
                label: t('lean.level'),
                children: (id) =>
                  h(ML.Select, {
                    id: id,
                    value: level,
                    onChange: function (event) { setLevel(event.target.value); },
                    options: [{ value: 'all', label: t('lean.all') }].concat(
                      LEVELS.map(function (name) {
                        return { value: name, label: t('lean.' + name) };
                      }),
                    ),
                  }),
              }),
            ),
            snippetsLoading ? h(ML.Loading, null) : null,
            snippetsError ? h(ML.ErrorBox, { error: snippetsError, onRetry: loadSnippets }) : null,
            !snippetsLoading && !snippetsError && snippets.length === 0 ? h(ML.Empty, { label: t('lean.noSnippets') }) : null,
            filteredSnippets.length
              ? h(
                  'div',
                  { className: 'ml-stack' },
                  filteredSnippets.map(function (snippet) {
                    return h(
                      'div',
                      { key: snippet.id, className: 'ml-card' },
                      h(
                        'div',
                        { className: 'ml-card-hd' },
                        h('h2', { className: 'ml-card-title' }, ML.pick(lang, snippet.title_zh, snippet.title)),
                        h(ML.Badge, { tone: 'brand' }, String(snippet.level || '')),
                        h(
                          'div',
                          { className: 'ml-card-actions' },
                          h(
                            ML.Btn,
                            {
                              size: 'sm',
                              onClick: function () {
                                setCode(snippetCode(snippet));
                              },
                            },
                            t('lean.insert'),
                          ),
                        ),
                      ),
                      h(
                        'div',
                        { className: 'ml-card-bd ml-stack-sm' },
                        h('pre', { className: 'ml-pre' }, ML.safeString(snippet.code, 1800)),
                        h(ML.KV, {
                          rows: [
                            snippetImports(snippet).length
                              ? { label: t('lean.imports'), value: snippetImports(snippet).join(', '), mono: true }
                              : null,
                          ].filter(Boolean),
                        }),
                        h('div', { className: 'ml-hint' }, ML.pick(lang, snippet.explanation_zh, snippet.explanation)),
                      ),
                    );
                  }),
                )
              : snippets.length > 0
                ? h(ML.Empty, { label: t('common.empty') })
                : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('lean.cheatsheet'))),
          h(
            'div',
            { className: 'ml-card-bd' },
            h(ML.LabeledTable, {
              rowLabels: CHEATSHEET.map(function (row) { return row[0]; }),
              colLabels: [t('logic.palette'), 'Lean / Mathlib', 'usage'],
              cells: CHEATSHEET.map(function (row) {
                return [row[0], row[1], row[2]];
              }),
              className: 'ml-cheat',
            }),
          ),
        ),
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;

  ML.assignStrings(
    {
      'tab.topology': '拓扑',
      'topology.title': '拓扑与几何',
      'topology.section.homology': '单纯同调',
      'topology.section.pi1': '基本群',
      'topology.section.curvature': '曲率',
      'topology.simplices': '单纯形（每行 `维数: 顶点…`，多个用 ; 分隔）',
      'topology.simplicesHint': '例：0: a, b, c 与 1: a,b; b,c; c,a 给出圆周。',
      'topology.presets': '预设',
      'topology.preset.circle': '圆周 S¹',
      'topology.preset.sphere': '球面 S²',
      'topology.preset.point': '单点',
      'topology.preset.wedge': '两个圆之并',
      'topology.preset.solid': '实心三角形',
      'topology.homologyResult': '同调结果',
      'topology.betti': 'Betti 数',
      'topology.torsion': '挠率',
      'topology.euler': '欧拉示性数',
      'topology.chainRanks': '链群秩',
      'topology.boundary': '边界矩阵',
      'topology.note': '说明',
      'topology.vertices': '顶点（逗号分隔）',
      'topology.edges': '边（每行 u v）',
      'topology.pi1Result': '基本群',
      'topology.generators': '生成元',
      'topology.relations': '关系',
      'topology.abelianization': '交换化',
      'topology.betti1': '第一 Betti 数',
      'topology.preset.tree': '树',
      'topology.preset.triangle': '三角形（环）',
      'topology.preset.k4': '完全图 K₄',
      'topology.coords': '坐标（逗号分隔）',
      'topology.metric': '度规 g（每行一个对称矩阵行）',
      'topology.geoOp': '几何量',
      'topology.christoffel': 'Christoffel 符号',
      'topology.curvature': '曲率张量',
      'topology.riemann': 'Riemann 张量',
      'topology.ricci': 'Ricci 张量',
      'topology.scalar': '标量曲率',
      'topology.preset.polar': '极坐标平面',
      'topology.preset.sphere2': '球面 S²',
      'topology.preset.hyperbolic': '双曲平面',
      'topology.latex': 'LaTeX 结果',
      'topology.metricError': '度规必须是方阵且阶数等于坐标数。',
      'topology.coordError': '请至少给出两个坐标。',
      'topology.simplicesError': '单纯形无法解析：',
      'topology.verticesError': '请给出顶点。',
      'topology.original': '原始 JSON',
    },
    {
      'tab.topology': 'Topology',
      'topology.title': 'Topology & geometry',
      'topology.section.homology': 'Simplicial homology',
      'topology.section.pi1': 'Fundamental group',
      'topology.section.curvature': 'Curvature',
      'topology.simplices': 'Simplices (one `dim: vertices…` per line; separate with ;)',
      'topology.simplicesHint': 'Example: 0: a, b, c and 1: a,b; b,c; c,a is a circle.',
      'topology.presets': 'Presets',
      'topology.preset.circle': 'Circle S¹',
      'topology.preset.sphere': 'Sphere S²',
      'topology.preset.point': 'Point',
      'topology.preset.wedge': 'Wedge of two circles',
      'topology.preset.solid': 'Solid triangle',
      'topology.homologyResult': 'Homology',
      'topology.betti': 'Betti numbers',
      'topology.torsion': 'Torsion',
      'topology.euler': 'Euler characteristic',
      'topology.chainRanks': 'Chain ranks',
      'topology.boundary': 'Boundary matrices',
      'topology.note': 'Note',
      'topology.vertices': 'Vertices (comma separated)',
      'topology.edges': 'Edges (one u v per line)',
      'topology.pi1Result': 'Fundamental group',
      'topology.generators': 'Generators',
      'topology.relations': 'Relations',
      'topology.abelianization': 'Abelianisation',
      'topology.betti1': 'First Betti number',
      'topology.preset.tree': 'Tree',
      'topology.preset.triangle': 'Triangle (loop)',
      'topology.preset.k4': 'Complete graph K₄',
      'topology.coords': 'Coordinates (comma separated)',
      'topology.metric': 'Metric g (one matrix row per line)',
      'topology.geoOp': 'Geometry',
      'topology.christoffel': 'Christoffel symbols',
      'topology.curvature': 'Curvature tensor',
      'topology.riemann': 'Riemann tensor',
      'topology.ricci': 'Ricci tensor',
      'topology.scalar': 'Scalar curvature',
      'topology.preset.polar': 'Polar plane',
      'topology.preset.sphere2': 'Sphere S²',
      'topology.preset.hyperbolic': 'Hyperbolic plane',
      'topology.latex': 'LaTeX result',
      'topology.metricError': 'The metric must be square with size equal to the number of coordinates.',
      'topology.coordError': 'Provide at least two coordinates.',
      'topology.simplicesError': 'Could not parse the simplices: ',
      'topology.verticesError': 'Provide vertices.',
      'topology.original': 'Raw JSON',
    },
  );

  const HOMOLOGY_PRESETS = {
    circle: '0: a, b, c\n1: a,b; b,c; c,a',
    sphere:
      '0: a, b, c, d\n1: a,b; a,c; a,d; b,c; b,d; c,d\n2: a,b,c; a,b,d; a,c,d; b,c,d',
    point: '0: a',
    wedge:
      '0: a, b, c, d, e\n1: a,b; b,c; c,a; a,d; d,e; e,a',
    solid: '0: a, b, c\n1: a,b; b,c; c,a\n2: a,b,c',
  };

  const PI1_PRESETS = {
    triangle: { vertices: 'a, b, c', edges: 'a b\nb c\nc a' },
    tree: { vertices: 'a, b, c, d', edges: 'a b\nb c\nb d' },
    k4: { vertices: 'a, b, c, d', edges: 'a b\na c\na d\nb c\nb d\nc d' },
  };

  const CURVATURE_PRESETS = {
    polar: { coords: 'r, theta', metric: '1, 0\n0, r**2' },
    sphere2: { coords: 'theta, phi', metric: '1, 0\n0, sin(theta)**2' },
    hyperbolic: { coords: 'x, theta', metric: '1, 0\n0, sinh(x)**2' },
  };

  function parseSimplexText(text) {
    const simplices = {};
    for (const line of ML.lines(text)) {
      const colon = line.indexOf(':');
      if (colon < 0) return { simplices: null, error: 'missing dimension separator ":" in "' + line + '"' };
      const dim = parseInt(line.slice(0, colon).trim(), 10);
      if (!Number.isInteger(dim) || dim < 0) return { simplices: null, error: 'bad dimension in "' + line + '"' };
      const rest = line.slice(colon + 1).trim();
      const list = [];
      if (dim === 0) {
        for (const vertex of rest.split(/[,;]+/).map(function (part) { return part.trim(); }).filter(Boolean)) {
          list.push([vertex]);
        }
      } else {
        for (const group of rest.split(';')) {
          const vertices = group.split(',').map(function (part) { return part.trim(); }).filter(Boolean);
          if (vertices.length === 0) continue;
          list.push(vertices);
        }
      }
      if (list.length === 0) continue;
      const key = String(dim);
      simplices[key] = (simplices[key] || []).concat(list);
    }
    if (Object.keys(simplices).length === 0) return { simplices: null, error: 'no simplices' };
    return { simplices: simplices, error: null };
  }

  function renderBetti(betti) {
    return h(
      'div',
      { className: 'ml-stats' },
      ML.toArr(betti).map(function (value, index) {
        return h(ML.Stat, { key: index, label: 'β' + index, value: ML.safeString(value) });
      }),
    );
  }

  function HomologyTool(props) {
    const t = ML.useT();
    const [text, setText] = useState(HOMOLOGY_PRESETS.circle);
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();
    const lastArgs = useRef(null);

    const run = function (simplicesOverride) {
      let simplices = simplicesOverride;
      if (!simplices) {
        const parsed = parseSimplexText(text);
        if (parsed.error) {
          setLocalError(t('topology.simplicesError') + parsed.error);
          return;
        }
        simplices = parsed.simplices;
      }
      setLocalError(null);
      lastArgs.current = { simplices: simplices };
      call.run('topology.homology', { simplices: simplices });
    };

    const applyPreset = function (key) {
      setText(HOMOLOGY_PRESETS[key]);
      const parsed = parseSimplexText(HOMOLOGY_PRESETS[key]);
      if (!parsed.error) run(parsed.simplices);
    };

    useEffect(
      function () {
        if (!props.openAction || String(props.openAction.op || '') !== 'topology.homology') return;
        const args = props.openAction.args || {};
        if (ML.isObj(args.simplices)) {
          const lines = [];
          Object.keys(args.simplices).forEach(function (dim) {
            const list = ML.toArr(args.simplices[dim]).map(function (simplex) {
              return ML.toArr(simplex).join(', ');
            });
            if (dim === '0') {
              const vertices = ML.toArr(args.simplices[dim]).map(function (simplex) {
                return ML.toArr(simplex)[0];
              });
              lines.push('0: ' + vertices.join(', '));
            } else {
              lines.push(dim + ': ' + list.join('; '));
            }
          });
          setText(lines.join('\n'));
        }
        call.run('topology.homology', args);
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd ml-stack' },
          h(ML.Field, {
            label: t('topology.simplices'),
            hint: t('topology.simplicesHint'),
            children: (id) =>
              h(ML.Textarea, { id: id, rows: 6, value: text, className: 'ml-mono', onChange: function (event) { setText(event.target.value); } }),
          }),
          h(
            'div',
            { className: 'ml-row' },
            h('span', { className: 'ml-hint' }, t('topology.presets')),
            Object.keys(HOMOLOGY_PRESETS).map(function (key) {
              return h(
                'button',
                { key: key, type: 'button', className: 'ml-chip', onClick: function () { applyPreset(key); } },
                t('topology.preset.' + key),
              );
            }),
          ),
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
          ),
          localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        ),
      ),
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run('topology.homology', lastArgs.current); } }) : null,
      call.loading ? h(ML.Loading, null) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('topology.homologyResult'))),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              h(ML.SectionTitle, null, t('topology.betti')),
              renderBetti(data.betti),
              h(
                'div',
                { className: 'ml-stats' },
                data.euler !== undefined ? h(ML.Stat, { label: 'χ', value: ML.safeString(data.euler) }) : null,
                ML.toArr(data.chain_ranks).length
                  ? h(ML.Stat, { label: t('topology.chainRanks'), value: ML.toArr(data.chain_ranks).join(' · ') })
                  : null,
              ),
              ML.toArr(data.torsion).length
                ? h(
                    'div',
                    null,
                    h(ML.SectionTitle, null, t('topology.torsion')),
                    h(
                      'ul',
                      { className: 'ml-list' },
                      ML.toArr(data.torsion).map(function (entry, index) {
                        return h('li', { key: index, className: 'ml-mono' }, 'H' + index + ': ' + (ML.toArr(entry).length ? ML.toArr(entry).join(' ⊕ ') : '0'));
                      }),
                    ),
                  )
                : null,
              data.note ? h(ML.Banner, { tone: 'info' }, String(data.note)) : null,
              h(
                ML.Collapse,
                { title: t('topology.boundary') },
                h(ML.JSONTree, { value: data.boundary_matrices }),
              ),
              h(ML.RawJSON, { value: data }),
            ),
          )
        : null,
    );
  }

  function PiOneTool(props) {
    const t = ML.useT();
    const [vertices, setVertices] = useState(PI1_PRESETS.triangle.vertices);
    const [edges, setEdges] = useState(PI1_PRESETS.triangle.edges);
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();
    const lastArgs = useRef(null);

    const parseEdges = function () {
      const result = [];
      for (const line of ML.lines(edges)) {
        const parts = line.split(/[,\s]+/).filter(Boolean);
        if (parts.length >= 2) result.push([parts[0], parts[1]]);
      }
      return result;
    };

    const run = function (argsOverride) {
      const args =
        argsOverride ||
        {
          vertices: vertices.split(/[,\s]+/).map(function (part) { return part.trim(); }).filter(Boolean),
          edges: parseEdges(),
        };
      if (args.vertices.length === 0) {
        setLocalError(t('topology.verticesError'));
        return;
      }
      setLocalError(null);
      lastArgs.current = args;
      call.run('topology.fundamental_group', args);
    };

    const applyPreset = function (key) {
      const preset = PI1_PRESETS[key];
      setVertices(preset.vertices);
      setEdges(preset.edges);
      run({
        vertices: preset.vertices.split(/[,\s]+/).filter(Boolean),
        edges: preset.edges.split(/\n/).map(function (line) { return line.split(/\s+/).filter(Boolean); }).filter(function (parts) { return parts.length >= 2; }),
      });
    };

    useEffect(
      function () {
        if (!props.openAction || String(props.openAction.op || '') !== 'topology.fundamental_group') return;
        const args = props.openAction.args || {};
        if (Array.isArray(args.vertices)) setVertices(args.vertices.join(', '));
        if (Array.isArray(args.edges)) {
          setEdges(
            args.edges
              .map(function (edge) {
                return ML.toArr(edge).slice(0, 2).join(' ');
              })
              .join('\n'),
          );
        }
        call.run('topology.fundamental_group', args);
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd ml-stack' },
          h(ML.Field, {
            label: t('topology.vertices'),
            children: (id) => h(ML.Input, { id: id, value: vertices, onChange: function (event) { setVertices(event.target.value); } }),
          }),
          h(ML.Field, {
            label: t('topology.edges'),
            children: (id) => h(ML.Textarea, { id: id, rows: 5, value: edges, className: 'ml-mono', onChange: function (event) { setEdges(event.target.value); } }),
          }),
          h(
            'div',
            { className: 'ml-row' },
            h('span', { className: 'ml-hint' }, t('topology.presets')),
            Object.keys(PI1_PRESETS).map(function (key) {
              return h(
                'button',
                { key: key, type: 'button', className: 'ml-chip', onClick: function () { applyPreset(key); } },
                t('topology.preset.' + key),
              );
            }),
          ),
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
          ),
          localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        ),
      ),
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run('topology.fundamental_group', lastArgs.current); } }) : null,
      call.loading ? h(ML.Loading, null) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('topology.pi1Result'))),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              h(ML.KV, {
                rows: [
                  { label: t('topology.generators'), value: ML.toArr(data.generators).join(', ') || '—', mono: true },
                  { label: t('topology.relations'), value: ML.toArr(data.relations).join(', ') || '—', mono: true },
                  { label: t('topology.abelianization'), value: data.abelianization === undefined ? '—' : ML.safeString(data.abelianization), mono: true },
                  data.betti1 !== undefined ? { label: t('topology.betti1'), value: ML.safeString(data.betti1) } : null,
                ].filter(Boolean),
              }),
              data.note ? h(ML.Banner, { tone: 'info' }, String(data.note)) : null,
              h(ML.RawJSON, { value: data }),
            ),
          )
        : null,
    );
  }

  function matrixFromRows(value) {
    if (!ML.matrixLike(value)) return null;
    return value.map(function (row) {
      return ML.toArr(row).map(function (cell) {
        return ML.isObj(cell) ? (cell.result !== undefined ? String(cell.result) : ML.exprLatex(cell)) : ML.safeString(cell);
      });
    });
  }

  function CurvatureTool(props) {
    const t = ML.useT();
    const [coords, setCoords] = useState(CURVATURE_PRESETS.polar.coords);
    const [metric, setMetric] = useState(CURVATURE_PRESETS.polar.metric);
    const [op, setOp] = useState('curvature');
    const [localError, setLocalError] = useState(null);
    const call = ML.useCall();
    const lastArgs = useRef(null);

    const run = function (argsOverride) {
      const coordList = (argsOverride ? argsOverride.coords : coords.split(',')).map(function (part) { return String(part).trim(); }).filter(Boolean);
      if (coordList.length < 2) {
        setLocalError(t('topology.coordError'));
        return;
      }
      const parsedMetric = argsOverride ? { matrix: argsOverride.metric, error: null } : ML.parseMatrix(metric);
      if (parsedMetric.error) {
        setLocalError(parsedMetric.error);
        return;
      }
      const size = coordList.length;
      if (parsedMetric.matrix.length !== size || parsedMetric.matrix.some(function (row) { return row.length !== size; })) {
        setLocalError(t('topology.metricError'));
        return;
      }
      setLocalError(null);
      const args = { coords: coordList, metric: parsedMetric.matrix };
      lastArgs.current = { op: op, args: args };
      call.run(op === 'christoffel' ? 'geometry.christoffel' : 'geometry.curvature', args);
    };

    const applyPreset = function (key) {
      const preset = CURVATURE_PRESETS[key];
      setCoords(preset.coords);
      setMetric(preset.metric);
      const coordList = preset.coords.split(',').map(function (part) { return part.trim(); }).filter(Boolean);
      const matrix = preset.metric.split('\n').map(function (row) {
        return row.split(',').map(function (cell) { return cell.trim(); });
      });
      run({ coords: coordList, metric: matrix });
    };

    useEffect(
      function () {
        if (!props.openAction || String(props.openAction.op || '').indexOf('geometry.') !== 0) return;
        const action = props.openAction;
        const args = action.args || {};
        if (Array.isArray(args.coords)) setCoords(args.coords.join(', '));
        if (ML.matrixLike(args.metric)) {
          setMetric(
            args.metric
              .map(function (row) {
                return ML.toArr(row).map(function (cell) { return String(cell); }).join(', ');
              })
              .join('\n'),
          );
        }
        if (String(action.op) === 'geometry.christoffel') setOp('christoffel');
        lastArgs.current = { op: String(action.op) === 'geometry.christoffel' ? 'christoffel' : 'curvature', args: args };
        call.run(action.op, args);
      },
      [props.openAction && props.openAction.seq],
    );

    const data = call.result || {};
    const christoffel = ML.toArr(data.christoffel);
    return h(
      'div',
      { className: 'ml-stack' },
      h(
        'div',
        { className: 'ml-card' },
        h(
          'div',
          { className: 'ml-card-bd ml-stack' },
          h(ML.Field, {
            label: t('topology.coords'),
            children: (id) => h(ML.Input, { id: id, value: coords, className: 'ml-mono', onChange: function (event) { setCoords(event.target.value); } }),
          }),
          h(ML.Field, {
            label: t('topology.metric'),
            children: (id) => h(ML.Textarea, { id: id, rows: 4, value: metric, className: 'ml-mono', onChange: function (event) { setMetric(event.target.value); } }),
          }),
          h(ML.Field, {
            label: t('topology.geoOp'),
            children: (id) =>
              h(ML.Select, {
                id: id,
                value: op,
                onChange: function (event) { setOp(event.target.value); },
                options: [
                  { value: 'christoffel', label: t('topology.christoffel') },
                  { value: 'curvature', label: t('topology.curvature') },
                ],
              }),
          }),
          h(
            'div',
            { className: 'ml-row' },
            h('span', { className: 'ml-hint' }, t('topology.presets')),
            Object.keys(CURVATURE_PRESETS).map(function (key) {
              return h(
                'button',
                { key: key, type: 'button', className: 'ml-chip', onClick: function () { applyPreset(key); } },
                t('topology.preset.' + key),
              );
            }),
          ),
          h(
            'div',
            { className: 'ml-toolbar' },
            h(ML.Btn, { variant: 'primary', onClick: function () { run(); }, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
          ),
          localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
        ),
      ),
      call.error ? h(ML.ErrorBox, { error: call.error, onRetry: function () { if (lastArgs.current) call.run(lastArgs.current.op === 'christoffel' ? 'geometry.christoffel' : 'geometry.curvature', lastArgs.current.args); } }) : null,
      call.loading ? h(ML.Loading, null) : null,
      call.result
        ? h(
            'div',
            { className: 'ml-card' },
            h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, op === 'christoffel' ? t('topology.christoffel') : t('topology.curvature'))),
            h(
              'div',
              { className: 'ml-card-bd ml-stack' },
              christoffel.length
                ? h(
                    'div',
                    null,
                    h(ML.SectionTitle, null, t('topology.christoffel')),
                    h(
                      'div',
                      { className: 'ml-stack' },
                      christoffel.map(function (slice, index) {
                        const matrix = matrixFromRows(slice);
                        return matrix
                          ? h(
                              'div',
                              { key: index },
                              h('div', { className: 'ml-hint' }, 'Γ[' + index + ']'),
                              h(ML.MatrixView, { matrix: matrix, small: true }),
                            )
                          : h('pre', { key: index, className: 'ml-pre' }, ML.prettyJSON(slice));
                      }),
                    ),
                  )
                : null,
              ML.matrixLike(data.ricci)
                ? h(
                    'div',
                    null,
                    h(ML.SectionTitle, null, t('topology.ricci')),
                    h(ML.MatrixView, { matrix: matrixFromRows(data.ricci), small: true }),
                  )
                : null,
              data.scalar !== undefined && data.scalar !== null
                ? h(
                    'div',
                    null,
                    h(ML.SectionTitle, null, t('topology.scalar')),
                    typeof data.scalar === 'string'
                      ? h(ML.Math, { tex: data.scalar, display: true })
                      : h('code', { className: 'ml-mono' }, ML.safeString(data.scalar)),
                  )
                : null,
              data.latex
                ? h(ML.Collapse, { title: t('topology.latex') }, h(ML.FormulaBlock, { tex: data.latex }))
                : null,
              data.note ? h(ML.Banner, { tone: 'info' }, String(data.note)) : null,
              h(
                ML.Collapse,
                { title: t('topology.riemann') },
                h(ML.JSONTree, { value: data.riemann }),
              ),
              h(ML.RawJSON, { value: data }),
            ),
          )
        : null,
    );
  }

  ML.tabs.topology = {
    id: 'topology',
    order: 70,
    Component: function TopologyTab(props) {
      const t = ML.useT();
      const [section, setSection] = useState('homology');
      useEffect(
        function () {
          if (!props.openAction) return;
          const op = String(props.openAction.op || '');
          if (op === 'topology.homology') setSection('homology');
          else if (op === 'topology.fundamental_group') setSection('pi1');
          else if (op.indexOf('geometry.') === 0) setSection('curvature');
        },
        [props.openAction && props.openAction.seq],
      );
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('topology.simplicesHint') }, t('topology.title')),
        h(ML.Tabs, {
          items: [
            { id: 'homology', label: t('topology.section.homology') },
            { id: 'pi1', label: t('topology.section.pi1') },
            { id: 'curvature', label: t('topology.section.curvature') },
          ],
          value: section,
          onChange: setSection,
          size: 'sm',
          ariaLabel: t('topology.title'),
        }),
        section === 'homology' ? h(HomologyTool, { openAction: props.openAction }) : null,
        section === 'pi1' ? h(PiOneTool, { openAction: props.openAction }) : null,
        section === 'curvature' ? h(CurvatureTool, { openAction: props.openAction }) : null,
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useEffect = React.useEffect;
  const useMemo = React.useMemo;

  ML.assignStrings(
    {
      'tab.plot': '绘图',
      'plot.title': '函数绘图',
      'plot.hint': '所有图形在浏览器端由 plot.* 数据绘制为 SVG。',
      'plot.mode.explicit': '显式函数',
      'plot.mode.parametric': '参数曲线',
      'plot.mode.polar': '极坐标',
      'plot.mode.implicit': '隐式曲线',
      'plot.mode.field': '向量场',
      'plot.mode.surface3d': '三维曲面',
      'plot.exprs': '表达式（每行一个）',
      'plot.var': '自变量',
      'plot.xRange': 'x 范围',
      'plot.yRange': 'y 范围',
      'plot.range': '参数范围',
      'plot.samples': '采样点数',
      'plot.grid': '网格密度',
      'plot.n': '箭头 / 网格数',
      'plot.paramX': 'x(t)',
      'plot.paramY': 'y(t)',
      'plot.theta': '角度变量',
      'plot.polarR': 'r(θ)',
      'plot.implicitExpr': '方程 F(x, y) = 0',
      'plot.fieldP': 'P(x, y)',
      'plot.fieldQ': 'Q(x, y)',
      'plot.surfaceExpr': 'z = f(x, y)',
      'plot.xVar': 'x 变量',
      'plot.yVar': 'y 变量',
      'plot.rotateHint': '拖动旋转视角，滚轮缩放；可导出 SVG。',
      'plot.panHint': '滚轮缩放 · 拖拽平移 · 双击重置。',
      'plot.invalidRange': '范围必须是两个数字，且 min < max。',
      'plot.invalidNumber': '请输入合法的数字。',
      'plot.noExpr': '请输入至少一个表达式。',
      'plot.curves': '条曲线',
      'plot.arrows': '个箭头',
      'plot.segments': '段轮廓',
      'plot.points': '个点',
      'plot.discontinuity': '断点已自动拆分。',
      'plot.preset': '预设',
      'plot.preset.damped': '阻尼正弦',
      'plot.preset.poly': '多项式族',
      'plot.preset.lissajous': '利萨茹',
      'plot.preset.rose': '玫瑰线',
      'plot.preset.circle': '圆',
      'plot.preset.saddle': '马鞍面',
      'plot.preset.ripple': '涟漪面',
      'plot.preset.vortex': '旋涡场',
      'plot.rawData': '原始数据',
      'plot.exportedNote': '导出使用浏览器端 SVG 序列化。',
    },
    {
      'tab.plot': 'Plot',
      'plot.title': 'Plotting',
      'plot.hint': 'Every figure is rendered client-side as SVG from plot.* data.',
      'plot.mode.explicit': 'Explicit',
      'plot.mode.parametric': 'Parametric',
      'plot.mode.polar': 'Polar',
      'plot.mode.implicit': 'Implicit',
      'plot.mode.field': 'Vector field',
      'plot.mode.surface3d': '3-D surface',
      'plot.exprs': 'Expressions (one per line)',
      'plot.var': 'Variable',
      'plot.xRange': 'x range',
      'plot.yRange': 'y range',
      'plot.range': 'Parameter range',
      'plot.samples': 'Samples',
      'plot.grid': 'Grid',
      'plot.n': 'Arrows / grid size',
      'plot.paramX': 'x(t)',
      'plot.paramY': 'y(t)',
      'plot.theta': 'Angle variable',
      'plot.polarR': 'r(θ)',
      'plot.implicitExpr': 'Equation F(x, y) = 0',
      'plot.fieldP': 'P(x, y)',
      'plot.fieldQ': 'Q(x, y)',
      'plot.surfaceExpr': 'z = f(x, y)',
      'plot.xVar': 'x variable',
      'plot.yVar': 'y variable',
      'plot.rotateHint': 'Drag to rotate, wheel to zoom; SVG export available.',
      'plot.panHint': 'Wheel zoom · drag pan · double-click reset.',
      'plot.invalidRange': 'A range needs two numbers with min < max.',
      'plot.invalidNumber': 'Enter a valid number.',
      'plot.noExpr': 'Enter at least one expression.',
      'plot.curves': 'curves',
      'plot.arrows': 'arrows',
      'plot.segments': 'contour segments',
      'plot.points': 'points',
      'plot.discontinuity': 'Discontinuities split automatically.',
      'plot.preset': 'Presets',
      'plot.preset.damped': 'Damped sine',
      'plot.preset.poly': 'Polynomial family',
      'plot.preset.lissajous': 'Lissajous',
      'plot.preset.rose': 'Rose curve',
      'plot.preset.circle': 'Circle',
      'plot.preset.saddle': 'Saddle',
      'plot.preset.ripple': 'Ripple',
      'plot.preset.vortex': 'Vortex field',
      'plot.rawData': 'Raw data',
      'plot.exportedNote': 'Export serialises the browser SVG.',
    },
  );

  const MODES = ['explicit', 'parametric', 'polar', 'implicit', 'field', 'surface3d'];

  function parseRange(minText, maxText) {
    const min = parseFloat(String(minText).replace('−', '-'));
    const max = parseFloat(String(maxText).replace('−', '-'));
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { range: null, error: 'number' };
    if (!(min < max)) return { range: null, error: 'order' };
    return { range: [min, max], error: null };
  }

  function RangeFields(props) {
    const t = props.t;
    return h(
      'div',
      { className: 'ml-row', style: { alignItems: 'flex-end', gap: 8 } },
      h(
        'div',
        { className: 'ml-field', style: { width: 96 } },
        h('label', { className: 'ml-label', htmlFor: props.id + '-min' }, props.label + ' min'),
        h('input', {
          id: props.id + '-min',
          className: 'ml-input',
          value: props.min,
          inputMode: 'decimal',
          onChange: function (event) {
            props.onMin(event.target.value);
          },
        }),
      ),
      h(
        'div',
        { className: 'ml-field', style: { width: 96 } },
        h('label', { className: 'ml-label', htmlFor: props.id + '-max' }, props.label + ' max'),
        h('input', {
          id: props.id + '-max',
          className: 'ml-input',
          value: props.max,
          inputMode: 'decimal',
          onChange: function (event) {
            props.onMax(event.target.value);
          },
        }),
      ),
      props.hint ? h('span', { className: 'ml-hint' }, props.hint) : null,
    );
  }

  function curveSegments(curves) {
    const segments = [];
    ML.toArr(curves).forEach(function (curve, curveIndex) {
      const raw = curve && curve.points !== undefined ? curve.points : curve;
      if (!Array.isArray(raw) || raw.length === 0) return;
      const first = raw[0];
      const isPolyline = Array.isArray(first) && first.length >= 1 && typeof first[0] === 'number';
      const polylines = isPolyline ? [raw] : raw;
      polylines.forEach(function (points) {
        const clean = ML.toArr(points).filter(function (point) {
          return Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1]));
        });
        if (clean.length === 0) return;
        segments.push({
          points: clean.map(function (point) {
            return [Number(point[0]), Number(point[1])];
          }),
          label: curve && curve.expr !== undefined ? String(curve.expr) : undefined,
          colorIndex: curveIndex,
        });
      });
    });
    return segments;
  }

  ML.tabs.plot = {
    id: 'plot',
    order: 80,
    Component: function PlotTab(props) {
      const t = ML.useT();
      const [mode, setMode] = useState('explicit');
      const [exprs, setExprs] = useState('sin(x)\ncos(x)\nx**2/8');
      const [variable, setVariable] = useState('x');
      const [xMin, setXMin] = useState('-6');
      const [xMax, setXMax] = useState('6');
      const [yMin, setYMin] = useState('-3');
      const [yMax, setYMax] = useState('3');
      const [tMin, setTMin] = useState('0');
      const [tMax, setTMax] = useState('6.283');
      const [samples, setSamples] = useState('480');
      const [gridN, setGridN] = useState('120');
      const [arrowN, setArrowN] = useState('17');
      const [paramX, setParamX] = useState('sin(3*t)');
      const [paramY, setParamY] = useState('sin(2*t)');
      const [theta, setTheta] = useState('theta');
      const [polarR, setPolarR] = useState('cos(3*theta)');
      const [implicitExpr, setImplicitExpr] = useState('x**2 + y**2 - 4');
      const [fieldP, setFieldP] = useState('-y');
      const [fieldQ, setFieldQ] = useState('x');
      const [surfaceExpr, setSurfaceExpr] = useState('sin(x)*cos(y)');
      const [surfaceN, setSurfaceN] = useState('36');
      const [localError, setLocalError] = useState(null);
      const [lastMode, setLastMode] = useState('explicit');
      const [runSeq, setRunSeq] = useState(0);
      const call = ML.useCall();
      const lastRun = useRef(null);
      const startedRef = useRef(false);

      const execute = function (opName, args, renderMode) {
        lastRun.current = { op: opName, args: args };
        setLastMode(renderMode);
        setLocalError(null);
        setRunSeq(function (previous) {
          return previous + 1;
        });
        call.run(opName, args);
      };

      const run = function () {
        const sampleCount = parseInt(samples, 10);
        const nValue = parseInt(mode === 'field' ? arrowN : mode === 'surface3d' ? surfaceN : gridN, 10);
        const xr = parseRange(xMin, xMax);
        const yr = parseRange(yMin, yMax);
        const tr = parseRange(tMin, tMax);
        const fail = function (message) {
          setLocalError(message);
        };
        if (mode === 'explicit') {
          const list = ML.lines(exprs);
          if (list.length === 0) return fail(t('plot.noExpr'));
          if (xr.error) return fail(t('plot.invalidRange'));
          execute('plot.sample_multi', {
            exprs: list,
            var: variable.trim() || 'x',
            range: xr.range,
            samples: Number.isFinite(sampleCount) && sampleCount > 1 ? sampleCount : 400,
          }, 'explicit');
          return;
        }
        if (mode === 'parametric') {
          if (!paramX.trim() || !paramY.trim()) return fail(t('plot.noExpr'));
          if (tr.error) return fail(t('plot.invalidRange'));
          execute('plot.parametric', {
            x: paramX,
            y: paramY,
            t: 't',
            range: tr.range,
            samples: Number.isFinite(sampleCount) && sampleCount > 1 ? sampleCount : 400,
          }, 'parametric');
          return;
        }
        if (mode === 'polar') {
          if (!polarR.trim()) return fail(t('plot.noExpr'));
          if (tr.error) return fail(t('plot.invalidRange'));
          execute('plot.polar', {
            r: polarR,
            theta: theta.trim() || 'theta',
            range: tr.range,
            samples: Number.isFinite(sampleCount) && sampleCount > 1 ? sampleCount : 400,
          }, 'polar');
          return;
        }
        if (mode === 'implicit') {
          if (!implicitExpr.trim()) return fail(t('plot.noExpr'));
          if (xr.error || yr.error) return fail(t('plot.invalidRange'));
          execute('plot.implicit', {
            expr: implicitExpr,
            xRange: xr.range,
            yRange: yr.range,
            grid: Number.isFinite(nValue) && nValue >= 20 ? nValue : 120,
          }, 'implicit');
          return;
        }
        if (mode === 'field') {
          if (!fieldP.trim() || !fieldQ.trim()) return fail(t('plot.noExpr'));
          if (xr.error || yr.error) return fail(t('plot.invalidRange'));
          execute('plot.field', {
            P: fieldP,
            Q: fieldQ,
            xVar: 'x',
            yVar: 'y',
            xRange: xr.range,
            yRange: yr.range,
            n: Number.isFinite(nValue) && nValue > 1 ? nValue : 17,
            normalize: true,
          }, 'field');
          return;
        }
        if (mode === 'surface3d') {
          if (!surfaceExpr.trim()) return fail(t('plot.noExpr'));
          if (xr.error || yr.error) return fail(t('plot.invalidRange'));
          execute('plot.surface3d', {
            expr: surfaceExpr,
            xVar: 'x',
            yVar: 'y',
            xRange: xr.range,
            yRange: yr.range,
            n: Number.isFinite(nValue) && nValue >= 8 ? nValue : 36,
          }, 'surface3d');
        }
      };

      const applyPreset = function (preset) {
        if (preset === 'damped') {
          setMode('explicit');
          setExprs('exp(-x/6)*sin(2*x)');
          setVariable('x');
          setXMin('0');
          setXMax('18');
          setYMin('-1');
          setYMax('1');
          setMode('explicit');
          execute('plot.sample_multi', { exprs: ['exp(-x/6)*sin(2*x)'], var: 'x', range: [0, 18], samples: 480 }, 'explicit');
        } else if (preset === 'poly') {
          setMode('explicit');
          setExprs('x\nx**2/4\nx**3/16');
          setXMin('-4');
          setXMax('4');
          execute(
            'plot.sample_multi',
            { exprs: ['x', 'x**2/4', 'x**3/16'], var: 'x', range: [-4, 4], samples: 480 },
            'explicit',
          );
        } else if (preset === 'lissajous') {
          setMode('parametric');
          setParamX('sin(3*t)');
          setParamY('sin(2*t)');
          setTMin('0');
          setTMax('6.283');
          execute('plot.parametric', { x: 'sin(3*t)', y: 'sin(2*t)', t: 't', range: [0, 6.283], samples: 480 }, 'parametric');
        } else if (preset === 'rose') {
          setMode('polar');
          setPolarR('cos(3*theta)');
          setTMin('0');
          setTMax('6.283');
          execute('plot.polar', { r: 'cos(3*theta)', theta: 'theta', range: [0, 6.283], samples: 480 }, 'polar');
        } else if (preset === 'circle') {
          setMode('implicit');
          setImplicitExpr('x**2 + y**2 - 4');
          setXMin('-3');
          setXMax('3');
          setYMin('-3');
          setYMax('3');
          execute('plot.implicit', { expr: 'x**2 + y**2 - 4', xRange: [-3, 3], yRange: [-3, 3], grid: 140 }, 'implicit');
        } else if (preset === 'saddle') {
          setMode('surface3d');
          setSurfaceExpr('x**2 - y**2');
          setXMin('-2');
          setXMax('2');
          setYMin('-2');
          setYMax('2');
          execute('plot.surface3d', { expr: 'x**2 - y**2', xVar: 'x', yVar: 'y', xRange: [-2, 2], yRange: [-2, 2], n: 32 }, 'surface3d');
        } else if (preset === 'ripple') {
          setMode('surface3d');
          setSurfaceExpr('sin(sqrt(x**2+y**2)*2)/(1+sqrt(x**2+y**2))');
          execute(
            'plot.surface3d',
            { expr: 'sin(sqrt(x**2+y**2)*2)/(1+sqrt(x**2+y**2))', xVar: 'x', yVar: 'y', xRange: [-6, 6], yRange: [-6, 6], n: 44 },
            'surface3d',
          );
        } else if (preset === 'vortex') {
          setMode('field');
          setFieldP('-y');
          setFieldQ('x');
          execute('plot.field', { P: '-y', Q: 'x', xVar: 'x', yVar: 'y', xRange: [-3, 3], yRange: [-3, 3], n: 17, normalize: true }, 'field');
        }
      };

      const view = useMemo(function () {
        const data = call.result;
        if (!data) return { kind: lastMode };
        if (lastMode === 'explicit') {
          return {
            kind: lastMode,
            segments: curveSegments(data.curves),
            xRange: Array.isArray(data.range) ? data.range : null,
            yRange: Array.isArray(data.yRange) ? data.yRange : null,
            filename: 'mathlab-curves.svg',
          };
        }
        if (lastMode === 'parametric' || lastMode === 'polar') {
          const points = ML.toArr(data.points).filter(function (point) {
            return Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1]));
          }).map(function (point) {
            return [Number(point[0]), Number(point[1])];
          });
          return {
            kind: lastMode,
            segments: points.length
              ? [
                  {
                    points: points,
                    label: lastMode === 'parametric' ? 'x(t), y(t)' : 'r(θ)',
                    colorIndex: 0,
                  },
                ]
              : [],
            filename: 'mathlab-' + lastMode + '.svg',
          };
        }
        if (lastMode === 'implicit') {
          const segments = ML.toArr(data.segments).map(function (segment, index) {
            return {
              points: ML.toArr(segment).map(function (point) {
                return [Number(point[0]), Number(point[1])];
              }),
              colorIndex: 0,
            };
          });
          return {
            kind: lastMode,
            segments: segments,
            xRange: [parseFloat(xMin), parseFloat(xMax)],
            yRange: [parseFloat(yMin), parseFloat(yMax)],
            filename: 'mathlab-implicit.svg',
          };
        }
        if (lastMode === 'field') {
          return {
            kind: lastMode,
            arrows: ML.toArr(data.arrows),
            xRange: [parseFloat(xMin), parseFloat(xMax)],
            yRange: [parseFloat(yMin), parseFloat(yMax)],
            filename: 'mathlab-field.svg',
          };
        }
        return { kind: lastMode };
      }, [call.result, lastMode]);

      React.useEffect(
        function () {
          if (!props.active || startedRef.current) return;
          startedRef.current = true;
          run();
        },
        [props.active],
      );

      React.useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          const args = action.args || {};
          const opName = String(action.op || '');
          if (opName.indexOf('plot.') !== 0) return;
          setRunSeq(function (previous) {
            return previous + 1;
          });
          if (opName === 'plot.sample_multi' || opName === 'plot.sample') {
            setMode('explicit');
            if (Array.isArray(args.exprs)) setExprs(args.exprs.join('\n'));
            else if (typeof args.expr === 'string') setExprs(args.expr);
            if (Array.isArray(args.range)) {
              setXMin(String(args.range[0]));
              setXMax(String(args.range[1]));
            }
            lastRun.current = { op: opName === 'plot.sample' ? 'plot.sample_multi' : opName, args: args };
            setLastMode('explicit');
            call.run(opName === 'plot.sample' ? 'plot.sample' : 'plot.sample_multi', args);
          } else if (opName === 'plot.parametric') {
            setMode('parametric');
            if (args.x) setParamX(args.x);
            if (args.y) setParamY(args.y);
            if (Array.isArray(args.range)) {
              setTMin(String(args.range[0]));
              setTMax(String(args.range[1]));
            }
            lastRun.current = { op: opName, args: args };
            setLastMode('parametric');
            call.run(opName, args);
          } else if (opName === 'plot.polar') {
            setMode('polar');
            if (args.r) setPolarR(args.r);
            if (Array.isArray(args.range)) {
              setTMin(String(args.range[0]));
              setTMax(String(args.range[1]));
            }
            lastRun.current = { op: opName, args: args };
            setLastMode('polar');
            call.run(opName, args);
          } else if (opName === 'plot.implicit') {
            setMode('implicit');
            if (args.expr) setImplicitExpr(args.expr);
            if (Array.isArray(args.xRange)) {
              setXMin(String(args.xRange[0]));
              setXMax(String(args.xRange[1]));
            }
            if (Array.isArray(args.yRange)) {
              setYMin(String(args.yRange[0]));
              setYMax(String(args.yRange[1]));
            }
            lastRun.current = { op: opName, args: args };
            setLastMode('implicit');
            call.run(opName, args);
          } else if (opName === 'plot.field') {
            setMode('field');
            if (args.P) setFieldP(args.P);
            if (args.Q) setFieldQ(args.Q);
            lastRun.current = { op: opName, args: args };
            setLastMode('field');
            call.run(opName, args);
          } else if (opName === 'plot.surface3d') {
            setMode('surface3d');
            if (args.expr) setSurfaceExpr(args.expr);
            lastRun.current = { op: opName, args: args };
            setLastMode('surface3d');
            call.run(opName, args);
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const modeTabs = MODES.map(function (id) {
        return { id: id, label: t('plot.mode.' + id) };
      });

      const modeForm = function () {
        if (mode === 'explicit') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.exprs'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  rows: 4,
                  value: exprs,
                  onChange: function (event) {
                    setExprs(event.target.value);
                  },
                }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(ML.Field, {
                label: t('plot.var'),
                inline: true,
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: variable,
                    style: { width: 70 },
                    onChange: function (event) {
                      setVariable(event.target.value);
                    },
                  }),
              }),
              h(RangeFields, {
                t: t,
                id: 'plot-x',
                label: t('plot.xRange'),
                min: xMin,
                max: xMax,
                onMin: setXMin,
                onMax: setXMax,
              }),
              h(ML.Field, {
                label: t('plot.samples'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: samples,
                    inputMode: 'numeric',
                    style: { width: 90 },
                    onChange: function (event) {
                      setSamples(event.target.value);
                    },
                  }),
              }),
            ),
          );
        }
        if (mode === 'parametric') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.paramX'),
              children: (id) =>
                h(ML.Input, { id: id, value: paramX, className: 'ml-mono', onChange: function (event) { setParamX(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('plot.paramY'),
              children: (id) =>
                h(ML.Input, { id: id, value: paramY, className: 'ml-mono', onChange: function (event) { setParamY(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(RangeFields, { t: t, id: 'plot-t', label: 't', min: tMin, max: tMax, onMin: setTMin, onMax: setTMax }),
              h(ML.Field, {
                label: t('plot.samples'),
                children: (id) =>
                  h(ML.Input, { id: id, value: samples, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setSamples(event.target.value); } }),
              }),
            ),
          );
        }
        if (mode === 'polar') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.polarR'),
              children: (id) =>
                h(ML.Input, { id: id, value: polarR, className: 'ml-mono', onChange: function (event) { setPolarR(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(ML.Field, {
                label: t('plot.theta'),
                inline: true,
                children: (id) =>
                  h(ML.Input, { id: id, value: theta, style: { width: 90 }, onChange: function (event) { setTheta(event.target.value); } }),
              }),
              h(RangeFields, { t: t, id: 'plot-theta', label: 'θ', min: tMin, max: tMax, onMin: setTMin, onMax: setTMax }),
              h(ML.Field, {
                label: t('plot.samples'),
                children: (id) =>
                  h(ML.Input, { id: id, value: samples, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setSamples(event.target.value); } }),
              }),
            ),
          );
        }
        if (mode === 'implicit') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.implicitExpr'),
              children: (id) =>
                h(ML.Input, { id: id, value: implicitExpr, className: 'ml-mono', onChange: function (event) { setImplicitExpr(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(RangeFields, { t: t, id: 'plot-ix', label: t('plot.xRange'), min: xMin, max: xMax, onMin: setXMin, onMax: setXMax }),
              h(RangeFields, { t: t, id: 'plot-iy', label: t('plot.yRange'), min: yMin, max: yMax, onMin: setYMin, onMax: setYMax }),
              h(ML.Field, {
                label: t('plot.grid'),
                children: (id) =>
                  h(ML.Input, { id: id, value: gridN, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setGridN(event.target.value); } }),
              }),
            ),
          );
        }
        if (mode === 'field') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.fieldP'),
              children: (id) =>
                h(ML.Input, { id: id, value: fieldP, className: 'ml-mono', onChange: function (event) { setFieldP(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('plot.fieldQ'),
              children: (id) =>
                h(ML.Input, { id: id, value: fieldQ, className: 'ml-mono', onChange: function (event) { setFieldQ(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(RangeFields, { t: t, id: 'plot-fx', label: t('plot.xRange'), min: xMin, max: xMax, onMin: setXMin, onMax: setXMax }),
              h(RangeFields, { t: t, id: 'plot-fy', label: t('plot.yRange'), min: yMin, max: yMax, onMin: setYMin, onMax: setYMax }),
              h(ML.Field, {
                label: t('plot.n'),
                children: (id) =>
                  h(ML.Input, { id: id, value: arrowN, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setArrowN(event.target.value); } }),
              }),
            ),
          );
        }
        return h(
          'div',
          { className: 'ml-stack-sm' },
          h(ML.Field, {
            label: t('plot.surfaceExpr'),
            children: (id) =>
              h(ML.Input, { id: id, value: surfaceExpr, className: 'ml-mono', onChange: function (event) { setSurfaceExpr(event.target.value); } }),
          }),
          h(
            'div',
            { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
            h(RangeFields, { t: t, id: 'plot-sx', label: t('plot.xRange'), min: xMin, max: xMax, onMin: setXMin, onMax: setXMax }),
            h(RangeFields, { t: t, id: 'plot-sy', label: t('plot.yRange'), min: yMin, max: yMax, onMin: setYMin, onMax: setYMax }),
            h(ML.Field, {
              label: t('plot.n'),
              children: (id) =>
                h(ML.Input, { id: id, value: surfaceN, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setSurfaceN(event.target.value); } }),
            }),
          ),
        );
      };

      const presets = [
        { id: 'damped', label: t('plot.preset.damped') },
        { id: 'poly', label: t('plot.preset.poly') },
        { id: 'lissajous', label: t('plot.preset.lissajous') },
        { id: 'rose', label: t('plot.preset.rose') },
        { id: 'circle', label: t('plot.preset.circle') },
        { id: 'saddle', label: t('plot.preset.saddle') },
        { id: 'ripple', label: t('plot.preset.ripple') },
        { id: 'vortex', label: t('plot.preset.vortex') },
      ];

      const result = call.result || {};
      const notes = ML.toArr(result.note || result.notes);
      const counts = [];
      if (view.kind === 'explicit') counts.push(ML.toArr(view.segments).length + ' ' + t('plot.segments'));
      if (view.kind === 'field') counts.push(ML.toArr(view.arrows).length + ' ' + t('plot.arrows'));
      if (view.kind === 'parametric' || view.kind === 'polar') counts.push(ML.toArr(result.points).length + ' ' + t('plot.points'));
      if (view.kind === 'implicit') counts.push(ML.toArr(view.segments).length + ' ' + t('plot.segments'));

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('plot.hint') }, t('plot.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd' },
            h(ML.Tabs, {
              items: modeTabs,
              value: mode,
              onChange: function (next) {
                setMode(next);
                setLocalError(null);
              },
              size: 'sm',
              ariaLabel: t('plot.title'),
            }),
            h('div', { style: { marginTop: 12 } }, modeForm()),
            h(
              'div',
              { className: 'ml-toolbar' },
              h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
              props.engine && props.engine.status !== 'ready'
                ? h('span', { className: 'ml-hint' }, t('engine.starting'))
                : null,
              h('span', { className: 'ml-hint' }, t('plot.preset')),
              presets.map(function (preset) {
                return h(
                  'button',
                  {
                    key: preset.id,
                    type: 'button',
                    className: 'ml-chip',
                    onClick: function () {
                      applyPreset(preset.id);
                    },
                  },
                  preset.label,
                );
              }),
            ),
            localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('common.result')),
            h('span', { className: 'ml-hint' }, call.op || ''),
            call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
            counts.length ? h('span', { className: 'ml-hint' }, counts.join(' · ')) : null,
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            call.loading
              ? h(ML.Loading, null)
              : call.error
                ? h(ML.ErrorBox, {
                    error: call.error,
                    onRetry: function () {
                      if (lastRun.current) call.run(lastRun.current.op, lastRun.current.args);
                    },
                  })
                : !call.result
                  ? h(ML.Empty, { label: t('common.noResult') })
                  : view.kind === 'surface3d'
                    ? h(ML.Surface3D, {
                        vertices: result.vertices,
                        indices: result.indices,
                        title: t('plot.mode.surface3d'),
                        filename: 'mathlab-surface.svg',
                      })
                    : h(ML.Plot2D, {
                        segments: view.segments || [],
                        arrows: view.arrows || [],
                        xRange: view.xRange,
                        yRange: view.yRange,
                        xLabel: view.kind === 'polar' ? 'x' : 'x',
                        yLabel: 'y',
                        resetKey: runSeq + ':' + lastMode,
                        filename: view.filename,
                        hint: view.kind === 'field' ? t('plot.panHint') : t('plot.panHint'),
                      }),
            notes.length
              ? h(ML.Notes, { notes: notes.concat(view.kind === 'explicit' ? [t('plot.discontinuity')] : []) })
              : view.kind === 'explicit' && call.result
                ? h(ML.Notes, { notes: [t('plot.discontinuity')] })
                : null,
            call.result ? h(ML.RawJSON, { value: view.kind === 'surface3d' ? { zRange: result.zRange, note: result.note } : call.result }) : null,
          ),
        ),
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useMemo = React.useMemo;
  const useRef = React.useRef;

  ML.assignStrings(
    {
      'tab.symbols': '符号',
      'symbols.title': '符号词典',
      'symbols.hint': '按名称、LaTeX、Unicode 或标签搜索；点击符号可复制到剪贴板或插入最近聚焦的输入框。',
      'symbols.search': '搜索符号…',
      'symbols.allFields': '全部领域',
      'symbols.keyboard': '记号键盘',
      'symbols.copyLatex': 'LaTeX',
      'symbols.copyUnicode': 'Unicode',
      'symbols.lean': 'Lean',
      'symbols.sympy': 'SymPy',
      'symbols.inserted': '已插入输入框',
      'symbols.copied': '已复制',
      'symbols.loading': '正在加载符号词典…',
      'symbols.empty': '没有匹配的符号。',
      'symbols.noData': '符号数据尚未加载；Host 的 symbols.list 操作可能需要引擎或数据集就绪。',
      'symbols.reload': '重新加载',
      'symbols.count': '{n} 个符号',
      'symbols.fieldCount': '{n}',
    },
    {
      'tab.symbols': 'Symbols',
      'symbols.title': 'Symbol atlas',
      'symbols.hint': 'Search by name, LaTeX, unicode or tag; click a glyph to copy it or insert it into the last focused input.',
      'symbols.search': 'Search symbols…',
      'symbols.allFields': 'All fields',
      'symbols.keyboard': 'Notation keyboard',
      'symbols.copyLatex': 'LaTeX',
      'symbols.copyUnicode': 'Unicode',
      'symbols.lean': 'Lean',
      'symbols.sympy': 'SymPy',
      'symbols.inserted': 'Inserted into the input',
      'symbols.copied': 'Copied',
      'symbols.loading': 'Loading the symbol atlas…',
      'symbols.empty': 'No matching symbols.',
      'symbols.noData': 'The symbol data is not loaded yet; the Host symbols.list op may need the dataset prepared.',
      'symbols.reload': 'Reload',
      'symbols.count': '{n} symbols',
      'symbols.fieldCount': '{n}',
    },
  );

  const KEYBOARD = ['∫', '∑', '∏', '√', 'π', '∞', '∂', '∇', '∀', '∃', '¬', '∧', '∨', '→', '↔', '⊢', '⊨', '∈', '∉', '⊂', '⊆', '∪', '∩', '∅', '≅', '≃', '∘', '⊗', '⊕', '≤', '≥', '≠', '≈', 'ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ', 'λ', 'ε', 'δ', 'φ', 'Γ', 'Δ', 'Ω', '⟨', '⟩'];

  ML.tabs.symbols = {
    id: 'symbols',
    order: 90,
    Component: function SymbolsTab(props) {
      const t = ML.useT();
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [query, setQuery] = useState('');
      const [field, setField] = useState('all');
      const [toast, setToast] = useState(null);
      const started = useRef(false);
      const toastTimer = useRef(null);

      const load = async function () {
        setLoading(true);
        setError(null);
        try {
          const result = await ML.callMath('symbols.list', {});
          setData(result || { fields: [], symbols: [] });
        } catch (loadError) {
          setError(loadError);
          setData(null);
        } finally {
          setLoading(false);
        }
      };

      useEffect(
        function () {
          if (!props.active || started.current) return;
          started.current = true;
          load();
        },
        [props.active],
      );

      useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          if (String(action.op || '') === 'symbols.search' || String(action.op || '') === 'symbols.list') {
            if (!data && !loading) {
              started.current = true;
              load();
            }
            if (action.args && typeof action.args.query === 'string') setQuery(action.args.query);
            if (action.args && typeof action.args.field === 'string') setField(action.args.field);
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const showToast = function (message) {
        setToast(message);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(function () {
          setToast(null);
        }, 1800);
      };

      useEffect(function () {
        return function () {
          clearTimeout(toastTimer.current);
        };
      }, []);

      const symbols = ML.toArr(data && data.symbols);
      const fields = ML.toArr(data && data.fields);
      const lang = ML.lang(t);
      const fieldLabel = function (entry) {
        if (!ML.isObj(entry)) return String(entry);
        if (lang === 'en') return entry.label || entry.label_zh || entry.id;
        return entry.label_zh || entry.label || entry.id;
      };

      const filtered = useMemo(function () {
        const needle = String(query || '').trim().toLowerCase();
        return symbols.filter(function (symbol) {
          if (field !== 'all' && String(symbol.field) !== field) return false;
          if (!needle) return true;
          const haystack = [
            symbol.symbol,
            symbol.unicode,
            symbol.latex,
            symbol.name,
            symbol.name_zh,
            symbol.description,
            symbol.description_zh,
            symbol.lean,
            symbol.sympy,
            ML.toArr(symbol.tags).join(' '),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.indexOf(needle) >= 0;
        });
      }, [symbols, query, field]);

      const grouped = useMemo(function () {
        const order = [];
        const groups = new Map();
        for (const symbol of filtered) {
          const key = String(symbol.field || 'other');
          if (!groups.has(key)) {
            groups.set(key, []);
            order.push(key);
          }
          groups.get(key).push(symbol);
        }
        return order.map(function (key) {
          const entry = fields.filter(function (item) { return String(item.id) === key; })[0];
          return { id: key, label: fieldLabel(entry || { id: key }), symbols: groups.get(key) };
        });
      }, [filtered, fields, lang]);

      const useGlyph = function (symbol) {
        const element = ML.insertAtActive(String(symbol.unicode || symbol.symbol || ''));
        if (element) {
          showToast(t('symbols.inserted'));
        } else {
          ML.copy(String(symbol.latex || symbol.unicode || symbol.symbol || '')).then(function (ok) {
            showToast(ok ? t('symbols.copied') : t('common.copyFailed'));
          });
        }
      };

      const glyphNode = function (symbol) {
        if (symbol.latex) {
          return h(ML.Math, { tex: symbol.latex, className: 'ml-sym-glyph' });
        }
        return h('div', { className: 'ml-sym-glyph' }, String(symbol.unicode || symbol.symbol || '?'));
      };

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('symbols.hint') }, t('symbols.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h('div', { className: 'ml-hint' }, t('symbols.keyboard')),
            h(
              'div',
              { className: 'ml-chip-row' },
              KEYBOARD.map(function (glyph, index) {
                return h(
                  'button',
                  {
                    key: index,
                    type: 'button',
                    className: 'ml-kbd',
                    title: glyph,
                    onClick: function () {
                      const inserted = ML.insertAtActive(glyph);
                      if (inserted) showToast(t('symbols.inserted'));
                      else ML.copy(glyph).then(function (ok) { showToast(ok ? t('symbols.copied') : t('common.copyFailed')); });
                    },
                  },
                  glyph,
                );
              }),
            ),
            toast ? h(ML.Badge, { tone: 'success' }, toast) : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('symbols.search'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    type: 'search',
                    value: query,
                    placeholder: t('symbols.search'),
                    onChange: function (event) { setQuery(event.target.value); },
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { alignItems: 'flex-end' } },
                h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'symbols.count', { n: filtered.length })),
                h(ML.Btn, { size: 'sm', onClick: load, disabled: loading }, t('symbols.reload')),
              ),
            ),
            h(
              'div',
              { className: 'ml-chip-row' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'ml-chip' + (field === 'all' ? ' is-active' : ''),
                  onClick: function () { setField('all'); },
                },
                t('symbols.allFields'),
              ),
              fields.map(function (entry) {
                const id = String(entry.id);
                return h(
                  'button',
                  {
                    key: id,
                    type: 'button',
                    className: 'ml-chip' + (field === id ? ' is-active' : ''),
                    onClick: function () { setField(id); },
                  },
                  fieldLabel(entry) + (entry.count !== undefined ? ' · ' + entry.count : ''),
                );
              }),
            ),
            loading ? h(ML.Loading, { label: t('symbols.loading') }) : null,
            error ? h(ML.ErrorBox, { error: error, onRetry: load }) : null,
            !loading && !error && symbols.length === 0 ? h(ML.Empty, { label: t('symbols.noData') }) : null,
            !loading && !error && symbols.length > 0 && filtered.length === 0 ? h(ML.Empty, { label: t('symbols.empty') }) : null,
            grouped.map(function (group) {
              return h(
                'div',
                { key: group.id },
                h(ML.SectionTitle, { hint: group.symbols.length + '' }, group.label),
                h(
                  'div',
                  { className: 'ml-sym-grid' },
                  group.symbols.map(function (symbol) {
                    return h(
                      'div',
                      { key: symbol.id, className: 'ml-sym-card' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'ml-btn ml-btn-subtle',
                          style: { justifyContent: 'flex-start', padding: 0, height: 'auto', textAlign: 'left' },
                          title: t('common.copy'),
                          onClick: function () { useGlyph(symbol); },
                        },
                        glyphNode(symbol),
                      ),
                      h('div', { className: 'ml-sym-name' }, ML.pick(lang, symbol.name_zh, symbol.name) || String(symbol.name || '')),
                      h('div', { className: 'ml-sym-name-alt' }, ML.pick(lang === 'zh' ? 'en' : 'zh', symbol.name_zh, symbol.name)),
                      h('div', { className: 'ml-sym-desc' }, ML.pick(lang, symbol.description_zh, symbol.description)),
                      symbol.latex ? h('div', { className: 'ml-sym-code' }, symbol.latex) : null,
                      h(
                        'div',
                        { className: 'ml-sym-actions' },
                        symbol.latex ? h(ML.CopyBtn, { size: 'sm', text: symbol.latex, label: t('symbols.copyLatex') }) : null,
                        symbol.unicode || symbol.symbol ? h(ML.CopyBtn, { size: 'sm', text: String(symbol.unicode || symbol.symbol), label: t('symbols.copyUnicode') }) : null,
                        symbol.lean ? h(ML.CopyBtn, { size: 'sm', text: symbol.lean, label: 'Lean' }) : null,
                        symbol.sympy ? h(ML.CopyBtn, { size: 'sm', text: symbol.sympy, label: 'SymPy' }) : null,
                      ),
                      ML.toArr(symbol.tags).length
                        ? h(
                            'div',
                            { className: 'ml-chip-row' },
                            ML.toArr(symbol.tags).slice(0, 6).map(function (tag, index) {
                              return h(ML.Badge, { key: index }, String(tag));
                            }),
                          )
                        : null,
                    );
                  }),
                ),
              );
            }),
          ),
        ),
      );
    },
  };
})();

(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useMemo = React.useMemo;
  const useRef = React.useRef;

  ML.assignStrings(
    {
      'tab.examples': '例子',
      'examples.title': '示例库',
      'examples.hint': '每个示例都会在对应面板中打开并预填真实的 API 请求。',
      'examples.search': '搜索示例…',
      'examples.open': '打开',
      'examples.op': '操作',
      'examples.args': '参数',
      'examples.allFields': '全部领域',
      'examples.loading': '正在加载示例…',
      'examples.empty': '没有匹配的示例。',
      'examples.noData': '示例数据尚未加载；Host 的 examples.list 操作可能需要数据集就绪。',
      'examples.reload': '重新加载',
      'examples.count': '{n} 个示例',
      'examples.copyAction': '复制动作 JSON',
      'examples.panel': '面板',
      'examples.details': '请求详情',
      'examples.opened': '已在对应面板打开',
    },
    {
      'tab.examples': 'Examples',
      'examples.title': 'Example gallery',
      'examples.hint': 'Each example opens its panel and prefills a real API request.',
      'examples.search': 'Search examples…',
      'examples.open': 'Open',
      'examples.op': 'Operation',
      'examples.args': 'Arguments',
      'examples.allFields': 'All fields',
      'examples.loading': 'Loading examples…',
      'examples.empty': 'No matching examples.',
      'examples.noData': 'The example data is not loaded yet; the Host examples.list op may need the dataset prepared.',
      'examples.reload': 'Reload',
      'examples.count': '{n} examples',
      'examples.copyAction': 'Copy action JSON',
      'examples.panel': 'Panel',
      'examples.details': 'Request details',
      'examples.opened': 'Opened in its panel',
    },
  );

  const PANEL_ORDER = ['compute', 'linalg', 'algebra', 'category', 'logic', 'lean', 'topology', 'plot', 'symbols'];

  function inferPanel(example) {
    if (example && example.panel && PANEL_ORDER.indexOf(String(example.panel)) >= 0) return String(example.panel);
    const op = String((example && example.action && example.action.op) || '');
    if (op === 'calc.matrix') return 'linalg';
    if (op.indexOf('calc.') === 0) return 'compute';
    if (op.indexOf('algebra.') === 0) return 'algebra';
    if (op.indexOf('category.') === 0) return 'category';
    if (op.indexOf('logic.') === 0) return 'logic';
    if (op.indexOf('lean.') === 0) return 'lean';
    if (op.indexOf('plot.') === 0) return 'plot';
    if (op.indexOf('topology.') === 0 || op.indexOf('geometry.') === 0) return 'topology';
    if (op.indexOf('symbols.') === 0) return 'symbols';
    if (op.indexOf('examples.') === 0) return 'examples';
    return 'compute';
  }

  ML.tabs.examples = {
    id: 'examples',
    order: 100,
    Component: function ExamplesTab(props) {
      const t = ML.useT();
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [query, setQuery] = useState('');
      const [field, setField] = useState('all');
      const started = useRef(false);
      const [opened, setOpened] = useState(null);

      const load = async function () {
        setLoading(true);
        setError(null);
        try {
          const result = await ML.callMath('examples.list', {});
          setData(result || { examples: [] });
        } catch (loadError) {
          setError(loadError);
          setData(null);
        } finally {
          setLoading(false);
        }
      };

      useEffect(
        function () {
          if (!props.active || started.current) return;
          started.current = true;
          load();
        },
        [props.active],
      );

      useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          if (String(action.op || '') === 'examples.get' && action.args && action.args.id && !data && !loading) {
            started.current = true;
            load();
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const examples = ML.toArr(data && data.examples);
      const lang = ML.lang(t);
      const fields = useMemo(function () {
        const order = [];
        const seen = new Set();
        for (const example of examples) {
          const key = String(example.field || 'other');
          if (seen.has(key)) continue;
          seen.add(key);
          order.push(key);
        }
        return order;
      }, [examples]);

      const filtered = useMemo(function () {
        const needle = String(query || '').trim().toLowerCase();
        return examples.filter(function (example) {
          if (field !== 'all' && String(example.field) !== field) return false;
          if (!needle) return true;
          const haystack = [
            example.title,
            example.title_zh,
            example.description,
            example.description_zh,
            JSON.stringify(example.action || {}),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.indexOf(needle) >= 0;
        });
      }, [examples, query, field]);

      const grouped = useMemo(function () {
        const order = [];
        const groups = new Map();
        for (const example of filtered) {
          const key = String(example.field || 'other');
          if (!groups.has(key)) {
            groups.set(key, []);
            order.push(key);
          }
          groups.get(key).push(example);
        }
        return order.map(function (key) {
          return { id: key, examples: groups.get(key) };
        });
      }, [filtered]);

      const openExample = function (example) {
        const panel = inferPanel(example);
        const action = example.action || {};
        ML.bus.emit('open', {
          panel: panel,
          op: action.op,
          args: action.args || {},
          title: ML.pick(lang, example.title_zh, example.title),
        });
        setOpened(example.id);
      };

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('examples.hint') }, t('examples.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('examples.search'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    type: 'search',
                    value: query,
                    placeholder: t('examples.search'),
                    onChange: function (event) { setQuery(event.target.value); },
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { alignItems: 'flex-end' } },
                h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'examples.count', { n: filtered.length })),
                h(ML.Btn, { size: 'sm', onClick: load, disabled: loading }, t('examples.reload')),
                opened ? h(ML.Badge, { tone: 'success' }, t('examples.opened')) : null,
              ),
            ),
            h(
              'div',
              { className: 'ml-chip-row' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'ml-chip' + (field === 'all' ? ' is-active' : ''),
                  onClick: function () { setField('all'); },
                },
                t('examples.allFields'),
              ),
              fields.map(function (key) {
                return h(
                  'button',
                  {
                    key: key,
                    type: 'button',
                    className: 'ml-chip' + (field === key ? ' is-active' : ''),
                    onClick: function () { setField(key); },
                  },
                  key,
                );
              }),
            ),
            loading ? h(ML.Loading, { label: t('examples.loading') }) : null,
            error ? h(ML.ErrorBox, { error: error, onRetry: load }) : null,
            !loading && !error && examples.length === 0 ? h(ML.Empty, { label: t('examples.noData') }) : null,
            !loading && !error && examples.length > 0 && filtered.length === 0 ? h(ML.Empty, { label: t('examples.empty') }) : null,
            grouped.map(function (group) {
              return h(
                'div',
                { key: group.id },
                h(ML.SectionTitle, { hint: String(group.examples.length) }, group.id),
                h(
                  'div',
                  { className: 'ml-example-grid' },
                  group.examples.map(function (example) {
                    const action = example.action || {};
                    const actionText = JSON.stringify({ op: action.op, args: action.args || {} }, null, 2);
                    return h(
                      'div',
                      { key: example.id, className: 'ml-example' },
                      h(
                        'div',
                        { className: 'ml-example-hd' },
                        h('div', { className: 'ml-example-title' }, ML.pick(lang, example.title_zh, example.title)),
                        h(ML.Badge, { tone: 'brand' }, inferPanel(example)),
                      ),
                      h('div', { className: 'ml-example-desc' }, ML.pick(lang, example.description_zh, example.description)),
                      action.op ? h('div', { className: 'ml-sym-code' }, String(action.op)) : null,
                      h(
                        'div',
                        { className: 'ml-example-actions' },
                        h(ML.Btn, { size: 'sm', variant: 'primary', onClick: function () { openExample(example); } }, t('examples.open')),
                        h(ML.CopyBtn, { size: 'sm', text: actionText, label: t('examples.copyAction') }),
                      ),
                      h(
                        ML.Collapse,
                        { title: t('examples.details') },
                        h(ML.KV, {
                          rows: [
                            { label: t('examples.op'), value: String(action.op || ''), mono: true },
                            { label: t('examples.panel'), value: inferPanel(example), mono: true },
                          ],
                        }),
                        h('pre', { className: 'ml-pre' }, actionText),
                      ),
                    );
                  }),
                ),
              );
            }),
          ),
        ),
      );
    },
  };
})();

(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;
  const useCallback = React.useCallback;

  ML.CSS =
    (ML.CSS || '') +
    `/* ---------- Live Stage ---------- */
.stage-root { display: flex; flex-direction: column; gap: 14px; }
.stage-hd {
  display: flex; flex-direction: column; gap: 10px;
  border: 0.5px solid var(--ml-b1); border-radius: 12px;
  background: var(--ml-l1); padding: 14px 16px;
}
.stage-hd-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.stage-hd-text { min-width: 0; flex: 1 1 320px; }
.stage-title { margin: 0; font-size: 17px; font-weight: 600; line-height: 1.35; letter-spacing: 0.1px; overflow-wrap: anywhere; }
.stage-subtitle { margin: 3px 0 0; font-size: 12.5px; line-height: 1.5; color: var(--ml-fg2); overflow-wrap: anywhere; }
.stage-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.stage-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.stage-pill-live .stage-status-dot { animation: ml-pulse 1.1s ease-in-out infinite; }
.stage-sync { font-size: 11px; color: var(--ml-fg2); white-space: nowrap; }
.stage-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; border-top: 0.5px solid var(--ml-b1); padding-top: 10px; }
.stage-nav { display: flex; align-items: center; gap: 6px; }
.stage-step-label { font-size: 12px; color: var(--ml-fg2); font-variant-numeric: tabular-nums; text-align: center; min-width: 74px; }
.stage-spacer { flex: 1 1 auto; }
.stage-follow.is-active { color: var(--ml-brand); background: var(--ml-active); border-color: color-mix(in srgb, var(--ml-brand) 40%, transparent); }
.stage-toast { display: inline-flex; align-self: flex-start; max-width: 100%; }

.stage-steps { display: flex; gap: 4px; overflow-x: auto; padding: 2px 0 4px; scrollbar-width: thin; }
.stage-step-btn {
  appearance: none; cursor: pointer; flex: none; min-width: 26px; height: 24px;
  padding: 0 7px; border-radius: 6px; border: 0.5px solid var(--ml-b1);
  background: var(--ml-ov); color: var(--ml-fg2);
  font-family: var(--ml-mono); font-size: 11px; line-height: 22px;
}
.stage-step-btn:hover { color: var(--ml-fg); border-color: var(--ml-brand); }
.stage-step-btn.is-active { color: var(--ml-bg); background: var(--ml-brand); border-color: var(--ml-brand); font-weight: 600; }
.stage-blocks { display: flex; flex-direction: column; gap: 10px; }
.stage-block {
  border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-bg);
  padding: 10px 14px 12px; transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.stage-block.is-current {
  border-color: color-mix(in srgb, var(--ml-brand) 55%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ml-brand) 13%, transparent);
}
.stage-block-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.stage-step-no {
  appearance: none; cursor: pointer; flex: none; min-width: 24px; height: 22px;
  padding: 0 6px; border-radius: 6px; border: 0.5px solid var(--ml-b1);
  background: var(--ml-l1); color: var(--ml-fg2);
  font-family: var(--ml-mono); font-size: 11px; line-height: 20px;
}
.stage-step-no:hover { color: var(--ml-brand); border-color: var(--ml-brand); }
.stage-block.is-current .stage-step-no { color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 45%, transparent); background: var(--ml-active); }
.stage-kind { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ml-fg2); white-space: nowrap; }
.stage-block-title { font-size: 13px; font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
.stage-block-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-wrap: wrap; }
.stage-caption { font-size: 11.5px; color: var(--ml-fg2); line-height: 1.5; }
.stage-block-bd { font-size: 13.5px; }
.stage-raw { display: flex; flex-direction: column; gap: 8px; }

.stage-md { line-height: 1.75; overflow-wrap: anywhere; }
.stage-md p { margin: 0 0 6px; }
.stage-md p:last-child { margin-bottom: 0; }
.stage-md ul { margin: 4px 0 8px; padding-left: 20px; }
.stage-md li { margin: 2px 0; }
.stage-md strong { font-weight: 600; }
.stage-md code, .stage-code-inline {
  font-family: var(--ml-mono); font-size: 12px; background: var(--ml-l2);
  border: 0.5px solid var(--ml-b1); border-radius: 4px; padding: 0 4px;
}
.stage-display-math { margin: 8px 0; overflow-x: auto; padding: 4px 0; }

.stage-h { margin: 2px 0 0; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.stage-h-1 { font-size: 18px; }
.stage-h-2 { font-size: 15.5px; }
.stage-h-3 { font-size: 13px; color: var(--ml-fg2); letter-spacing: 0.03em; }
.stage-prose { line-height: 1.8; }
.stage-tone-insight { border-left: 3px solid var(--ml-brand); padding-left: 11px; }
.stage-tone-warning { border-left: 3px solid var(--ml-warn); padding-left: 11px; }
.stage-tone-question { border-left: 3px solid var(--ml-idle); padding-left: 11px; color: var(--ml-fg2); }
.stage-math .ml-math-block { font-size: 15px; }
.stage-math-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.stage-note {
  border: 0.5px dashed var(--ml-b2); border-radius: 9px; padding: 8px 11px;
  background: var(--ml-l1); font-size: 12.5px; color: var(--ml-fg2);
}

.stage-judgment { border-radius: 10px; border: 0.5px solid var(--ml-b1); padding: 10px 12px; background: var(--ml-ov); display: flex; flex-direction: column; gap: 6px; }
.stage-j-brand { border-color: color-mix(in srgb, var(--ml-brand) 32%, transparent); background: color-mix(in srgb, var(--ml-brand) 6%, transparent); }
.stage-j-success { border-color: color-mix(in srgb, var(--ml-ok) 32%, transparent); background: color-mix(in srgb, var(--ml-ok) 6%, transparent); }
.stage-j-warn { border-color: color-mix(in srgb, var(--ml-warn) 34%, transparent); background: color-mix(in srgb, var(--ml-warn) 6%, transparent); }
.stage-j-error { border-color: color-mix(in srgb, var(--ml-err) 34%, transparent); background: color-mix(in srgb, var(--ml-err) 5%, transparent); }
.stage-j-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-j-rule { font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-fg2); border: 0.5px solid var(--ml-b1); border-radius: 5px; padding: 0 6px; background: var(--ml-l2); }
.stage-j-claim { font-size: 14px; font-weight: 500; line-height: 1.6; }
.stage-j-reason { font-size: 12.5px; color: var(--ml-fg2); line-height: 1.65; }
.stage-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.stage-chip {
  appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  border: 0.5px solid var(--ml-b1); background: var(--ml-ov); color: var(--ml-fg2);
  border-radius: 999px; height: 24px; padding: 0 9px; font-size: 11.5px;
}
.stage-chip:hover { color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 45%, transparent); }
.stage-chip-glyph { font-family: var(--ml-mono); }
.stage-chip-name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.stage-tree, .stage-tree-children { list-style: none; margin: 0; padding: 0; }
.stage-tree-children { margin-left: 9px; padding-left: 15px; border-left: 1px solid var(--ml-b2); display: flex; flex-direction: column; gap: 3px; }
.stage-tree-node { padding: 2px 0; }
.stage-tree-label { display: flex; align-items: flex-start; gap: 7px; }
.stage-tree-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ml-idle); flex: none; margin-top: 7px; }
.stage-node-goal .stage-tree-dot { background: var(--ml-brand); }
.stage-node-subgoal .stage-tree-dot { background: color-mix(in srgb, var(--ml-brand) 55%, var(--ml-idle)); }
.stage-node-method .stage-tree-dot { background: var(--ml-warn); }
.stage-node-branch .stage-tree-dot { background: var(--ml-idle); }
.stage-node-result .stage-tree-dot { background: var(--ml-ok); }
.stage-tree-text { font-size: 13px; line-height: 1.55; overflow-wrap: anywhere; }
.stage-tree-sub { font-size: 11.5px; color: var(--ml-fg2); }
.stage-tree-node .ml-collapse { margin: 4px 0 2px 14px; }

.stage-proof { display: flex; flex-direction: column; gap: 8px; }
.stage-proof-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-proof-title { font-size: 13px; font-weight: 600; }
.stage-proof-nav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-range { accent-color: var(--ml-brand); width: 160px; max-width: 100%; }
.stage-proof-goal { font-size: 12.5px; display: flex; gap: 8px; flex-wrap: wrap; align-items: baseline; }
.stage-proof .ml-fitch { max-height: 460px; }

.stage-diagram-block, .stage-plot { display: flex; flex-direction: column; gap: 6px; }
.stage-diagram-scroll { overflow-x: auto; max-width: 100%; padding-bottom: 2px; }
.stage-verify { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
.stage-verify .ml-list { flex-basis: 100%; }
.stage-plot .ml-plot, .stage-plot svg { max-width: 100%; }

.stage-compute { display: flex; flex-direction: column; gap: 8px; }
.stage-compute-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-op { font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-brand); background: var(--ml-l2); border-radius: 5px; padding: 0 5px; }
.stage-sym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.stage-sym-card { border: 0.5px solid var(--ml-b1); border-radius: 10px; padding: 8px 9px; background: var(--ml-ov); display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.stage-sym-glyph { font-size: 18px; line-height: 1.3; min-height: 24px; display: flex; align-items: center; }
.stage-sym-name { font-size: 12px; overflow-wrap: anywhere; }
.stage-sym-alt { font-size: 11px; color: var(--ml-fg2); overflow-wrap: anywhere; }
.stage-sym-latex { font-family: var(--ml-mono); font-size: 10.5px; color: var(--ml-fg2); overflow-wrap: anywhere; }
.stage-lean { display: flex; flex-direction: column; gap: 8px; }
.stage-lean-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-code { margin: 0; }
.stage-diag-ok { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.stage-takeaway {
  border: 0.5px solid color-mix(in srgb, var(--ml-brand) 32%, transparent);
  border-radius: 12px; padding: 13px 15px;
  background: color-mix(in srgb, var(--ml-brand) 5%, transparent);
  display: flex; flex-direction: column; gap: 2px;
}
.stage-takeaway-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.stage-takeaway-icon { color: var(--ml-brand); font-size: 15px; }
.stage-takeaway-title { margin: 0; font-size: 14px; font-weight: 600; }
.stage-takeaway-row { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; padding: 7px 0; border-top: 0.5px dashed var(--ml-b1); }
.stage-takeaway-label { font-size: 11.5px; color: var(--ml-fg2); padding-top: 2px; }
.stage-takeaway-value { font-size: 13px; line-height: 1.65; overflow-wrap: anywhere; }
.stage-takeaway-list { margin: 0; padding-left: 18px; }
.stage-takeaway-list li { margin: 2px 0; }

.stage-annot { margin-top: 8px; border-top: 0.5px dashed var(--ml-b1); padding-top: 7px; display: flex; flex-direction: column; gap: 5px; }
.stage-annot-item { display: flex; align-items: baseline; gap: 7px; font-size: 12px; color: var(--ml-fg2); flex-wrap: wrap; }
.stage-annot-mark { color: var(--ml-warn); }
.stage-annot-text { color: var(--ml-fg); overflow-wrap: anywhere; }
.stage-annot-time { font-size: 10.5px; color: var(--ml-fg2); margin-left: auto; }
.stage-annot-editor { margin-top: 8px; display: flex; flex-direction: column; gap: 7px; }
.stage-general-notes { border: 0.5px solid var(--ml-b1); border-radius: 12px; padding: 10px 13px; background: var(--ml-l1); display: flex; flex-direction: column; gap: 6px; }
.stage-question { border: 0.5px solid var(--ml-b1); border-radius: 12px; padding: 12px 14px; background: var(--ml-l1); display: flex; flex-direction: column; gap: 8px; }
.stage-question-title { margin: 0; font-size: 13.5px; font-weight: 600; }
.stage-question-list { display: flex; flex-direction: column; gap: 6px; border-top: 0.5px solid var(--ml-b1); padding-top: 8px; }
.stage-q-item { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: 12.5px; }
.stage-q-text { flex: 1 1 240px; min-width: 0; overflow-wrap: anywhere; }
.stage-q-quote { flex: 1 1 100%; font-size: 11.5px; color: var(--ml-fg2); border-left: 2px solid var(--ml-b1); padding-left: 7px; overflow-wrap: anywhere; }
.stage-q-time { font-size: 10.5px; color: var(--ml-fg2); }

.stage-trace { display: flex; flex-direction: column; gap: 8px; }
.stage-trace-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-trace-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.stage-trace-item { border: 0.5px solid var(--ml-b1); border-radius: 10px; padding: 8px 11px; background: var(--ml-l1); }
.stage-trace-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
.stage-trace-op { font-family: var(--ml-mono); font-size: 12px; color: var(--ml-brand); }
.stage-trace-summary { min-width: 0; flex: 1 1 240px; overflow-wrap: anywhere; color: var(--ml-fg); }
.stage-trace-time { font-size: 10.5px; color: var(--ml-fg2); font-family: var(--ml-mono); }
.stage-trace-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.stage-trace-item .ml-collapse { margin-top: 6px; }

.stage-empty {
  border: 0.5px dashed var(--ml-b2); border-radius: 14px; padding: 30px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
  background: var(--ml-l1);
}
.stage-empty-mark { font-size: 26px; color: var(--ml-brand); line-height: 1; opacity: 0.85; }
.stage-empty-title { margin: 0; font-size: 16px; font-weight: 600; }
.stage-empty-body { max-width: 560px; font-size: 13px; color: var(--ml-fg2); text-align: left; }
.stage-empty-body .stage-md { text-align: left; }
.stage-empty-ask { font-size: 12.5px; color: var(--ml-fg2); }
.stage-empty-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 560px; text-align: left; }
.stage-empty-sample {
  display: block; font-family: var(--ml-mono); font-size: 12px; padding: 7px 10px;
  border: 0.5px solid var(--ml-b1); border-radius: 8px; background: var(--ml-ov);
  color: var(--ml-fg); overflow-wrap: anywhere;
}
.stage-empty-tool { max-width: 560px; font-size: 11.5px; color: var(--ml-fg2); text-align: left; }
.stage-empty .ml-collapse { width: 100%; max-width: 640px; text-align: left; }

@media (max-width: 700px) {
  .stage-hd { padding: 12px 12px; }
  .stage-tools { gap: 6px; }
  .stage-takeaway-row { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .stage-annot-time { margin-left: 0; }
  .stage-empty { padding: 22px 14px; }
  .stage-proof-hd { gap: 6px; }
  .stage-range { width: 110px; }
}
@media (prefers-reduced-motion: reduce) {
  .stage-pill-live .stage-status-dot, .ml-pill[data-status="starting"] .ml-pill-dot { animation: none; }
  .stage-block { transition: none; }
}
`;

  ML.assignStrings(
    {
      'tab.stage': '讲解',
      'stage.title': '讲解舞台',
      'stage.untitled': '未命名讲解',
      'stage.status.live': '进行中',
      'stage.status.final': '已完成',
      'stage.status.unknown': '状态未知',
      'stage.rev': 'rev {n}',
      'stage.rev.synced': '已同步',
      'stage.blocks': '{n} 块',
      'stage.step': '第 {i}/{n} 步',
      'stage.prev': '上一步',
      'stage.next': '下一步',
      'stage.follow': '跟随讲解',
      'stage.free': '自由查看',
      'stage.refresh': '刷新',
      'stage.view.label': '讲解视图',
      'stage.view.blocks': '讲解',
      'stage.view.trace': '过程轨迹',
      'stage.export': '导出 Markdown',
      'stage.exporting': '正在导出…',
      'stage.exported': '已导出 Markdown',
      'stage.copyMarkdown': '复制 Markdown',
      'stage.copiedMarkdown': '已复制 Markdown',
      'stage.copyStep': '复制步骤 LaTeX',
      'stage.copiedStep': '已复制本步内容',
      'stage.jumpTo': '跳到第 {n} 步',
      'stage.annotate': '标注',
      'stage.annotate.placeholder': '写下你的疑问或想法… agent 下次会读到',
      'stage.annotate.save': '保存标注',
      'stage.annotate.saved': '已记录标注',
      'stage.annotate.empty': '请先写下内容',
      'stage.annotation': '标注',
      'stage.annotation.general': '整体标注',
      'stage.question.title': '记录问题',
      'stage.question.hint':
        '问题会记录到讲解舞台；点按钮后也会复制到剪贴板，直接粘贴到对话里发给 DeepSeek 即可。',
      'stage.question.placeholder': '例如：为什么要假设 m、n 互素？',
      'stage.question.submit': '记录问题并复制',
      'stage.question.saved': '已记录，复制到对话发送即可',
      'stage.question.copiedOnly': '记录失败，但问题已复制到剪贴板',
      'stage.question.empty': '请先输入问题',
      'stage.question.list': '已记录的问题',
      'stage.question.general': '整体',
      'stage.empty.title': '讲解舞台还没有内容',
      'stage.empty.body':
        '当 DeepSeek 用 MathLab 讲解数学内容时，这块黑板会实时出现结构化的板书：**策略树**、一步步的**判断**、公式、证明、图像与可迁移的**结论**。\n\n你可以在任意一步旁边**标注**疑问，或在底部**记录问题**；agent 下一轮会读到它们，并继续在板上讲解。',
      'stage.empty.ask': '在对话里对 DeepSeek 说：',
      'stage.empty.sample1': '用 MathLab 讲解这道题',
      'stage.empty.sample2': '把 √2 无理性的证明写到讲解舞台，标出每一步判断',
      'stage.empty.sample3': '画出这个函数的图像，并在板上解释单调性',
      'stage.empty.tool':
        '（agent 使用 `mathlab_stage` 工具写板；每次 mathlab / mathlab_plot / mathlab_lean 调用都会自动进入“过程轨迹”。）',
      'stage.trace.title': '过程轨迹',
      'stage.trace.hint': '每次数学工具调用都会自动记录在这里；展开可查看参数与原始结果。',
      'stage.trace.empty': '还没有工具调用记录。',
      'stage.trace.copyAll': '复制全部',
      'stage.trace.copied': '已复制轨迹',
      'stage.trace.count': '{n} 条记录',
      'stage.trace.args': '参数',
      'stage.trace.result': '结果',
      'stage.kind.heading': '标题',
      'stage.kind.prose': '讲解',
      'stage.kind.math': '公式',
      'stage.kind.judgment': '判断',
      'stage.kind.strategy': '策略',
      'stage.kind.proof': '证明',
      'stage.kind.diagram': '图示',
      'stage.kind.plot': '图像',
      'stage.kind.compute': '计算',
      'stage.kind.symbols': '符号',
      'stage.kind.lean': 'Lean',
      'stage.kind.takeaway': '要点',
      'stage.kind.note': '旁注',
      'stage.kind.unknown': '未知块',
      'stage.verdict.goal': '目标',
      'stage.verdict.assume': '假设',
      'stage.verdict.have': '已得',
      'stage.verdict.rule': '规则',
      'stage.verdict.check': '检验',
      'stage.verdict.contradiction': '矛盾',
      'stage.verdict.conclusion': '结论',
      'stage.proof.title': '证明',
      'stage.proof.valid': '有效',
      'stage.proof.invalid': '无效',
      'stage.proof.unknown': '未验证',
      'stage.proof.fitch': 'Fitch 推导',
      'stage.proof.tree': '证明树',
      'stage.proof.rules': '推理规则',
      'stage.proof.line': '第 {i}/{n} 行',
      'stage.proof.empty': '没有可显示的证明行',
      'stage.proof.goal': '目标',
      'stage.strategy.detail': '详情',
      'stage.judgment.symbols': '符号',
      'stage.diagram.title': '图示',
      'stage.diagram.verify': '交换性验证',
      'stage.diagram.verified': '已验证',
      'stage.diagram.invalid': '未通过',
      'stage.diagram.unknown': '图示数据缺失',
      'stage.plot.title': '图像',
      'stage.plot.loading': '正在绘制…',
      'stage.plot.unsupported': '不支持的绘图操作',
      'stage.plot.empty': '没有绘图数据',
      'stage.plot.hint': '滚轮缩放 · 拖拽平移 · 三维视图拖拽旋转',
      'stage.compute.title': '计算',
      'stage.compute.run': '运行计算',
      'stage.compute.running': '计算中…',
      'stage.compute.input': '输入参数',
      'stage.symbols.title': '符号',
      'stage.symbols.loading': '正在加载符号…',
      'stage.symbols.empty': '没有匹配的符号。',
      'stage.symbols.copyLatex': 'LaTeX',
      'stage.lean.title': 'Lean 4',
      'stage.lean.check': '检查',
      'stage.lean.checking': '正在运行 Lean…',
      'stage.lean.ok': '通过',
      'stage.lean.failed': '有错误',
      'stage.lean.diagnostics': '诊断',
      'stage.lean.noDiagnostics': '没有诊断信息。',
      'stage.lean.imports': '导入',
      'stage.lean.stdout': '标准输出',
      'stage.lean.stderr': '标准错误',
      'stage.takeaway.title': '可迁移的结论',
      'stage.takeaway.claim': '主张',
      'stage.takeaway.method': '方法',
      'stage.takeaway.generalization': '推广',
      'stage.takeaway.scope': '适用范围',
      'stage.takeaway.examples': '例子',
      'stage.takeaway.references': '参考',
      'stage.takeaway.copy': '复制要点 Markdown',
      'stage.takeaway.download': '下载 .md',
      'stage.note.title': '旁注',
      'stage.unknown.hint': '该块类型暂不支持渲染，以下为原始数据。',
      'stage.error.title': '讲解舞台加载失败',
      'stage.loading': '正在加载讲解舞台…',
      'stage.offline': '无法连接 Host，面板会自动重试。',
      'stage.retryHint': 'stage.get 没有应答；面板每 ~0.9s 会自动重试一次。',
      'stage.missingStage': '舞台暂无内容（可能已被清空）。',
      'stage.current': '当前步骤',
    },
    {
      'tab.stage': 'Stage',
      'stage.title': 'Live stage',
      'stage.untitled': 'Untitled stage',
      'stage.status.live': 'live',
      'stage.status.final': 'final',
      'stage.status.unknown': 'unknown',
      'stage.rev': 'rev {n}',
      'stage.rev.synced': 'synced',
      'stage.blocks': '{n} blocks',
      'stage.step': 'Step {i}/{n}',
      'stage.prev': 'Prev',
      'stage.next': 'Next',
      'stage.follow': 'Follow',
      'stage.free': 'Browse',
      'stage.refresh': 'Refresh',
      'stage.view.label': 'Stage view',
      'stage.view.blocks': 'Board',
      'stage.view.trace': 'Trace',
      'stage.export': 'Export Markdown',
      'stage.exporting': 'Exporting…',
      'stage.exported': 'Markdown exported',
      'stage.copyMarkdown': 'Copy Markdown',
      'stage.copiedMarkdown': 'Markdown copied',
      'stage.copyStep': 'Copy step LaTeX',
      'stage.copiedStep': 'Step copied',
      'stage.jumpTo': 'Jump to step {n}',
      'stage.annotate': 'Annotate',
      'stage.annotate.placeholder': 'Note your question or idea… the agent reads it next turn',
      'stage.annotate.save': 'Save note',
      'stage.annotate.saved': 'Annotation saved',
      'stage.annotate.empty': 'Write something first',
      'stage.annotation': 'Annotation',
      'stage.annotation.general': 'General annotations',
      'stage.question.title': 'Record a question',
      'stage.question.hint':
        'The question is stored on the stage and copied to your clipboard, so you can paste it into the chat.',
      'stage.question.placeholder': 'e.g. why assume m and n are coprime?',
      'stage.question.submit': 'Record & copy',
      'stage.question.saved': 'Recorded and copied — paste it into the chat',
      'stage.question.copiedOnly': 'Recording failed, but the question was copied',
      'stage.question.empty': 'Type a question first',
      'stage.question.list': 'Recorded questions',
      'stage.question.general': 'general',
      'stage.empty.title': 'The stage is empty',
      'stage.empty.body':
        'When DeepSeek teaches mathematics with MathLab, this blackboard fills in live: a **strategy tree**, one explicit **judgment** per step, formulas, proofs, plots and a generalizable **takeaway**.\n\nYou can **annotate** any step or **record a question** at the bottom; the agent reads them on its next turn and keeps teaching on the board.',
      'stage.empty.ask': 'Say this in the chat:',
      'stage.empty.sample1': 'use MathLab to explain this problem',
      'stage.empty.sample2': 'write the proof that √2 is irrational on the stage, marking each judgment',
      'stage.empty.sample3': 'plot this function and explain monotonicity on the board',
      'stage.empty.tool':
        '(the agent writes with the `mathlab_stage` tool; every mathlab / mathlab_plot / mathlab_lean call is recorded under “Trace”.)',
      'stage.trace.title': 'Trace',
      'stage.trace.hint': 'Every math-tool call is recorded here automatically; expand for args and raw results.',
      'stage.trace.empty': 'No tool calls recorded yet.',
      'stage.trace.copyAll': 'Copy all',
      'stage.trace.copied': 'Trace copied',
      'stage.trace.count': '{n} entries',
      'stage.trace.args': 'Arguments',
      'stage.trace.result': 'Result',
      'stage.kind.heading': 'Heading',
      'stage.kind.prose': 'Narrative',
      'stage.kind.math': 'Formula',
      'stage.kind.judgment': 'Judgment',
      'stage.kind.strategy': 'Strategy',
      'stage.kind.proof': 'Proof',
      'stage.kind.diagram': 'Diagram',
      'stage.kind.plot': 'Plot',
      'stage.kind.compute': 'Computation',
      'stage.kind.symbols': 'Symbols',
      'stage.kind.lean': 'Lean',
      'stage.kind.takeaway': 'Takeaway',
      'stage.kind.note': 'Aside',
      'stage.kind.unknown': 'Unknown block',
      'stage.verdict.goal': 'Goal',
      'stage.verdict.assume': 'Assume',
      'stage.verdict.have': 'Have',
      'stage.verdict.rule': 'Rule',
      'stage.verdict.check': 'Check',
      'stage.verdict.contradiction': 'Contradiction',
      'stage.verdict.conclusion': 'Conclusion',
      'stage.proof.title': 'Proof',
      'stage.proof.valid': 'valid',
      'stage.proof.invalid': 'invalid',
      'stage.proof.unknown': 'unverified',
      'stage.proof.fitch': 'Fitch',
      'stage.proof.tree': 'Tree',
      'stage.proof.rules': 'Rules',
      'stage.proof.line': 'Line {i}/{n}',
      'stage.proof.empty': 'No proof lines to show',
      'stage.proof.goal': 'Goal',
      'stage.strategy.detail': 'Detail',
      'stage.judgment.symbols': 'Symbols',
      'stage.diagram.title': 'Diagram',
      'stage.diagram.verify': 'Commutativity check',
      'stage.diagram.verified': 'verified',
      'stage.diagram.invalid': 'failed',
      'stage.diagram.unknown': 'Missing diagram data',
      'stage.plot.title': 'Plot',
      'stage.plot.loading': 'Plotting…',
      'stage.plot.unsupported': 'Unsupported plot operation',
      'stage.plot.empty': 'No plot data',
      'stage.plot.hint': 'scroll to zoom · drag to pan · drag to rotate 3-D',
      'stage.compute.title': 'Computation',
      'stage.compute.run': 'Run',
      'stage.compute.running': 'Running…',
      'stage.compute.input': 'Arguments',
      'stage.symbols.title': 'Symbols',
      'stage.symbols.loading': 'Loading symbols…',
      'stage.symbols.empty': 'No matching symbols.',
      'stage.symbols.copyLatex': 'LaTeX',
      'stage.lean.title': 'Lean 4',
      'stage.lean.check': 'Check',
      'stage.lean.checking': 'Running Lean…',
      'stage.lean.ok': 'passed',
      'stage.lean.failed': 'errors',
      'stage.lean.diagnostics': 'Diagnostics',
      'stage.lean.noDiagnostics': 'No diagnostics.',
      'stage.lean.imports': 'Imports',
      'stage.lean.stdout': 'stdout',
      'stage.lean.stderr': 'stderr',
      'stage.takeaway.title': 'Generalizable takeaway',
      'stage.takeaway.claim': 'Claim',
      'stage.takeaway.method': 'Method',
      'stage.takeaway.generalization': 'Generalization',
      'stage.takeaway.scope': 'Scope',
      'stage.takeaway.examples': 'Examples',
      'stage.takeaway.references': 'References',
      'stage.takeaway.copy': 'Copy takeaway Markdown',
      'stage.takeaway.download': 'Download .md',
      'stage.note.title': 'Aside',
      'stage.unknown.hint': 'This block kind is not supported; raw data below.',
      'stage.error.title': 'Could not load the stage',
      'stage.loading': 'Loading the stage…',
      'stage.offline': 'Cannot reach the Host; retrying automatically.',
      'stage.retryHint': 'stage.get did not answer; the panel retries about once a second.',
      'stage.missingStage': 'The stage is empty (it may have been cleared).',
      'stage.current': 'current step',
    },
  );

  function tr(t) {
    return typeof t === 'function' ? t : ML.fallbackT();
  }

  function clampIndex(value, length) {
    if (!length || length < 1) return 0;
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return 0;
    return ML.clamp(n, 0, length - 1);
  }

  function range2(value) {
    if (!Array.isArray(value) || value.length < 2) return undefined;
    const a = Number(value[0]);
    const b = Number(value[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !(b > a)) return undefined;
    return [a, b];
  }

  function fmtTime(value) {
    if (value === undefined || value === null || value === '') return '';
    try {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return ML.safeString(value, 40);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      return ML.safeString(value, 40);
    }
  }

  function slugify(text) {
    const raw = String(text === undefined || text === null ? '' : text).trim();
    const cleaned = raw
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    return cleaned || 'stage';
  }

  function blockIdOf(block, index) {
    if (block && typeof block.id === 'string' && block.id) return block.id;
    return 'b' + (index + 1);
  }

  function blockKindOf(block) {
    return block && typeof block.kind === 'string' && block.kind ? block.kind : 'unknown';
  }

  function normalizeStagePayload(payload) {
    if (!ML.isObj(payload)) return { stage: null, revision: null, trace: [] };
    let stage = null;
    if (ML.isObj(payload.stage)) stage = payload.stage;
    else if (Array.isArray(payload.blocks)) stage = payload;
    let revision = payload.revision;
    if (revision === undefined || revision === null) {
      revision = stage && stage.revision !== undefined && stage.revision !== null ? stage.revision : null;
    }
    const numeric = Number(revision);
    revision = Number.isFinite(numeric) ? numeric : null;
    const stageTrace = ML.toArr(stage && stage.trace);
    return { stage: stage, revision: revision, trace: stageTrace.length ? stageTrace : ML.toArr(payload.trace) };
  }

  function fitchLines(block) {
    if (!ML.isObj(block)) return [];
    const source = ML.isObj(block.proof) ? block.proof : block;
    const direct = ML.toArr(source.fitch);
    if (direct.length > 0) {
      return direct.map(function (line, index) {
        return {
          line: line && line.line !== undefined ? line.line : index + 1,
          indent: ML.clamp(Number(line && line.indent) || 0, 0, 10),
          text: line && line.text !== undefined ? String(line.text) : String((line && line.conclusion) || ''),
          rule: line && line.rule !== undefined ? String(line.rule) : '',
          refs: ML.toArr(line && line.refs),
        };
      });
    }
    const nodes = ML.toArr(source.nodes).length ? ML.toArr(source.nodes) : ML.toArr(block.nodes);
    return nodes.map(function (node, index) {
      const fitch = (node && node.fitch) || {};
      return {
        line: fitch.line !== undefined ? fitch.line : index + 1,
        indent: ML.clamp(Number(fitch.indent) || 0, 0, 10),
        text: fitch.text !== undefined ? String(fitch.text) : String((node && node.conclusion) || ''),
        rule: (node && node.rule) || fitch.rule || '',
        refs: ML.toArr(node && node.premises),
      };
    });
  }

  function blockLatex(block) {
    if (!ML.isObj(block)) return '';
    if (typeof block.latex === 'string' && block.latex) return block.latex;
    if (blockKindOf(block) === 'proof') {
      const lines = fitchLines(block);
      if (lines.length) {
        return lines
          .map(function (line) {
            return line.text + (line.rule ? ' \\quad\\text{' + String(line.rule) + '}' : '');
          })
          .join(' \\\\\n');
      }
    }
    if (blockKindOf(block) === 'compute') {
      const expr = ML.pickExpr(block.result);
      const tex = expr ? ML.exprLatex(expr) : '';
      if (tex) return tex;
      if (typeof block.op === 'string' && block.op) {
        return block.op + ' ' + ML.prettyJSON(block.args || {}, 2000);
      }
    }
    if (typeof block.claim === 'string' && block.claim) return block.claim;
    if (typeof block.text === 'string' && block.text) return block.text;
    if (typeof block.title === 'string' && block.title) return block.title;
    return '';
  }

  function takeawayMarkdown(takeaway, title, t) {
    const trFn = tr(t);
    const data = ML.isObj(takeaway) ? takeaway : {};
    const lines = ['## ' + (title || String(trFn('stage.takeaway.title')))];
    const rows = [
      ['claim', 'stage.takeaway.claim'],
      ['method', 'stage.takeaway.method'],
      ['generalization', 'stage.takeaway.generalization'],
      ['scope', 'stage.takeaway.scope'],
    ];
    for (const row of rows) {
      const value = data[row[0]];
      if (value === undefined || value === null || String(value).trim() === '') continue;
      lines.push('', '**' + String(trFn(row[1])) + '**: ' + String(value));
    }
    const examples = ML.toArr(data.examples).map(String).filter(Boolean);
    if (examples.length) {
      lines.push('', '**' + String(trFn('stage.takeaway.examples')) + '**:');
      for (const example of examples) lines.push('- ' + example);
    }
    const references = ML.toArr(data.references).map(String).filter(Boolean);
    if (references.length) {
      lines.push('', '**' + String(trFn('stage.takeaway.references')) + '**:');
      for (const reference of references) lines.push('- ' + reference);
    }
    lines.push('');
    return lines.join('\n');
  }

  function buildStageMarkdown(stage, t) {
    const trFn = tr(t);
    if (!ML.isObj(stage)) return '';
    const lines = [];
    lines.push('# ' + (typeof stage.title === 'string' && stage.title ? stage.title : String(trFn('stage.untitled'))));
    if (typeof stage.subtitle === 'string' && stage.subtitle) lines.push('', '> ' + stage.subtitle);
    lines.push('');
    for (const block of ML.toArr(stage.blocks)) {
      if (!ML.isObj(block)) continue;
      const kind = blockKindOf(block);
      if (kind === 'heading') {
        const level = ML.clamp(parseInt(block.level, 10) || 2, 1, 3);
        lines.push('', '#'.repeat(level + 1) + ' ' + String(block.text || ''));
      } else if (kind === 'prose' || kind === 'note') {
        lines.push('', String(block.text || ''));
      } else if (kind === 'math') {
        lines.push('', '$$' + String(block.latex || '') + '$$');
        if (block.caption) lines.push('', '_' + String(block.caption) + '_');
      } else if (kind === 'judgment') {
        const verdict = String(block.verdict || 'have');
        lines.push('', '- **' + String(trFn('stage.verdict.' + verdict)) + '**: ' + String(block.claim || ''));
        if (block.rule) lines.push('  - ' + String(trFn('stage.verdict.rule')) + ': ' + String(block.rule));
        if (block.reason) lines.push('  - ' + String(block.reason));
      } else if (kind === 'strategy') {
        lines.push('', '### ' + String(block.title || trFn('stage.kind.strategy')));
        const walk = function (node, depth) {
          if (!ML.isObj(node) || depth > 8) return;
          lines.push('  '.repeat(depth) + '- ' + String(node.label === undefined ? '' : node.label));
          const children = ML.toArr(node.children);
          for (const child of children.slice(0, 40)) walk(child, depth + 1);
        };
        walk(ML.isObj(block.root) ? block.root : null, 0);
      } else if (kind === 'proof') {
        const proofLines = fitchLines(block);
        lines.push('', '### ' + String(block.title || trFn('stage.proof.title')));
        if (block.valid === true) lines.push('', '> ' + String(trFn('stage.proof.valid')));
        lines.push('', '```text');
        for (const line of proofLines) {
          lines.push('  '.repeat(line.indent) + line.text + (line.rule ? '    (' + line.rule + ')' : ''));
        }
        lines.push('```');
      } else if (kind === 'diagram') {
        const diagram = ML.isObj(block.diagram) ? block.diagram : {};
        lines.push('', '### ' + String(block.title || diagram.title || trFn('stage.kind.diagram')));
        lines.push('', '```json', ML.prettyJSON(diagram, 4000), '```');
      } else if (kind === 'plot') {
        lines.push('', '### ' + String(block.title || trFn('stage.plot.title')));
        lines.push('', '```json', ML.prettyJSON({ op: block.op, args: block.args }, 4000), '```');
      } else if (kind === 'compute') {
        lines.push('', '### ' + String(block.title || trFn('stage.compute.title')));
        if (block.op) lines.push('', '`' + String(block.op) + '`');
        const expr = ML.pickExpr(block.result);
        if (expr) {
          const tex = ML.exprLatex(expr);
          if (tex) lines.push('', '$$' + tex + '$$');
        }
      } else if (kind === 'symbols') {
        lines.push('', '### ' + String(block.title || trFn('stage.symbols.title')));
        const ids = ML.toArr(block.ids).map(String);
        if (ids.length) lines.push('', ids.join(', '));
      } else if (kind === 'lean') {
        lines.push('', '### ' + String(block.title || trFn('stage.kind.lean')));
        const imports = ML.toArr(block.imports).map(String).filter(Boolean);
        lines.push('', '```lean');
        if (imports.length) lines.push(imports.join('\n'), '');
        lines.push(String(block.code || ''), '```');
      } else if (kind === 'takeaway') {
        const markdown = takeawayMarkdown(block, block.title, t);
        lines.push('', markdown);
      }
    }
    if (ML.isObj(stage.takeaway)) {
      const hasTakeawayBlock = ML.toArr(stage.blocks).some(function (block) {
        return ML.isObj(block) && blockKindOf(block) === 'takeaway';
      });
      if (!hasTakeawayBlock) lines.push('', takeawayMarkdown(stage.takeaway, null, t));
    }
    lines.push('');
    return lines.join('\n');
  }

  const symbolsStore = { data: null, promise: null };

  function loadSymbolsData() {
    if (symbolsStore.data) return Promise.resolve(symbolsStore.data);
    if (!symbolsStore.promise) {
      symbolsStore.promise = ML.callMath('symbols.list', {})
        .then(function (data) {
          symbolsStore.data = ML.isObj(data) ? data : { fields: [], symbols: [] };
          return symbolsStore.data;
        })
        .catch(function (error) {
          symbolsStore.promise = null;
          throw error;
        });
    }
    return symbolsStore.promise;
  }

  function symbolIndex(data) {
    const index = new Map();
    for (const symbol of ML.toArr(data && data.symbols)) {
      if (!ML.isObj(symbol)) continue;
      const keys = [symbol.id, symbol.symbol, symbol.latex, symbol.unicode, symbol.name, symbol.name_zh];
      for (const key of keys) {
        if (typeof key !== 'string' || !key) continue;
        if (!index.has(key)) index.set(key, symbol);
        const lower = key.toLowerCase();
        if (!index.has(lower)) index.set(lower, symbol);
      }
    }
    return index;
  }

  function symbolLookup(index, id) {
    if (!index) return null;
    return index.get(id) || index.get(String(id).toLowerCase()) || null;
  }

  function symbolName(symbol, t) {
    const lang = ML.lang(tr(t));
    return ML.pick(lang, symbol.name_zh, symbol.name) || symbol.id || '';
  }

  function inlineNodes(text, keyPrefix) {
    const source = String(text === undefined || text === null ? '' : text);
    const parts = [];
    const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\$[^$\n]+\$)/g;
    let last = 0;
    let match;
    let index = 0;
    while ((match = re.exec(source)) !== null) {
      if (match.index > last) parts.push(source.slice(last, match.index));
      index += 1;
      const token = match[1];
      const key = keyPrefix + '-i' + index;
      if (token.slice(0, 2) === '**') parts.push(h('strong', { key: key }, token.slice(2, -2)));
      else if (token.slice(0, 1) === '`') parts.push(h('code', { key: key }, token.slice(1, -1)));
      else parts.push(h(ML.Math, { key: key, tex: token.slice(1, -1) }));
      last = match.index + token.length;
    }
    if (last < source.length) parts.push(source.slice(last));
    return parts;
  }

  function MarkdownLite(props) {
    const source =
      typeof props.text === 'string' ? props.text : ML.safeString(props.text === undefined ? '' : props.text, 8000);
    const className = 'stage-md' + (props.className ? ' ' + props.className : '');
    if (!source) return h('div', { className: className });
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const nodes = [];
    let key = 0;
    let paragraph = [];
    let listItems = [];
    let displayTex = null;

    const flushParagraph = function () {
      if (!paragraph.length) return;
      const content = [];
      paragraph.forEach(function (line, index) {
        if (index > 0) content.push(h('br', { key: 'br' + key + '-' + index }));
        const spans = inlineNodes(line, 'p' + key + '-' + index);
        for (const span of spans) content.push(span);
      });
      key += 1;
      nodes.push(h('p', { key: 'p' + key }, content));
      paragraph = [];
    };
    const flushList = function () {
      if (!listItems.length) return;
      key += 1;
      nodes.push(
        h(
          'ul',
          { key: 'ul' + key },
          listItems.map(function (itemNodes, index) {
            return h('li', { key: 'li' + index }, itemNodes);
          }),
        ),
      );
      listItems = [];
    };
    const flushAll = function () {
      flushParagraph();
      flushList();
    };

    let i = 0;
    while (i < lines.length) {
      const rawLine = lines[i];
      const line = rawLine.trim();
      if (displayTex !== null) {
        if (line.slice(-2) === '$$') {
          displayTex += (displayTex ? '\n' : '') + line.slice(0, -2);
          flushAll();
          key += 1;
          nodes.push(
            h(
              'div',
              { key: 'dm' + key, className: 'stage-display-math' },
              h(ML.Math, { tex: displayTex.trim(), display: true }),
            ),
          );
          displayTex = null;
        } else {
          displayTex += (displayTex ? '\n' : '') + rawLine;
        }
        i += 1;
        continue;
      }
      if (!line) {
        flushAll();
        i += 1;
        continue;
      }
      if (line.slice(0, 2) === '$$') {
        flushAll();
        const rest = line.slice(2);
        if (rest.length >= 2 && rest.slice(-2) === '$$') {
          key += 1;
          nodes.push(
            h(
              'div',
              { key: 'dm' + key, className: 'stage-display-math' },
              h(ML.Math, { tex: rest.slice(0, -2).trim(), display: true }),
            ),
          );
        } else {
          displayTex = rest;
        }
        i += 1;
        continue;
      }
      if (line.slice(0, 2) === '- ' || line.slice(0, 2) === '* ' || line === '-') {
        flushParagraph();
        const itemText = line.length > 2 ? line.slice(2) : '';
        listItems.push(inlineNodes(itemText, 'l' + key + '-' + listItems.length));
        i += 1;
        continue;
      }
      flushList();
      paragraph.push(line);
      i += 1;
    }
    flushAll();
    if (displayTex !== null) {
      key += 1;
      nodes.push(h('p', { key: 'dm-raw' + key }, displayTex));
    }
    return h('div', { className: className }, nodes);
  }

  function RawBlock(props) {
    const t = tr(props.t);
    return h(
      'div',
      { className: 'stage-raw' },
      h(ML.Banner, { tone: 'warn' }, props.label || String(t('stage.unknown.hint'))),
      h(ML.RawJSON, { value: props.block }),
    );
  }

  function BlockTitle(props) {
    return props.title ? h('div', { className: 'stage-block-title' }, String(props.title)) : null;
  }

  function SymbolChips(props) {
    const t = tr(props.t);
    const ids = ML.toArr(props.ids)
      .map(String)
      .filter(Boolean);
    const [index, setIndex] = useState(null);
    useEffect(function () {
      let alive = true;
      if (!ids.length) return undefined;
      loadSymbolsData()
        .then(function (data) {
          if (alive) setIndex(symbolIndex(data));
        })
        .catch(function () {

        });
      return function () {
        alive = false;
      };
    }, []);
    if (!ids.length) return null;
    return h(
      'div',
      { className: 'stage-chips' },
      props.label ? h('span', { className: 'stage-caption' }, String(props.label)) : null,
      ids.map(function (id, index_) {
        const symbol = symbolLookup(index, id);
        const latex = symbol && typeof symbol.latex === 'string' ? symbol.latex : '';
        const glyph = symbol ? String(symbol.unicode || symbol.symbol || id) : id;
        const name = symbol ? symbolName(symbol, t) : id;
        const isActive = props.activeSymbol === id;
        return h(
          'button',
          {
            key: index_ + ':' + id,
            type: 'button',
            className: 'stage-chip' + (isActive ? ' is-active' : ''),
            title:
              name +
              (latex ? ' · ' + latex : '') +
              ' · ' +
              String(t(props.onSymbolClick ? 'stage.symbol.focusHint' : 'common.copy')),
            onClick: function () {
              if (typeof props.onSymbolClick === 'function') props.onSymbolClick(isActive ? null : id);
              else ML.copy(latex || glyph);
            },
            onDoubleClick: function () {
              ML.copy(latex || glyph);
            },
          },
          latex ? h(ML.Math, { tex: latex }) : h('span', { className: 'stage-chip-glyph' }, glyph),
          h('span', { className: 'stage-chip-name' }, name),
        );
      }),
    );
  }

  function HeadingBlock(props) {
    const level = ML.clamp(parseInt(props.block && props.block.level, 10) || 2, 1, 3);
    const text = props.block && props.block.text !== undefined ? String(props.block.text) : '';
    return h('h' + (level + 1), { className: 'stage-h stage-h-' + level }, text);
  }

  function ProseBlock(props) {
    const block = props.block || {};
    const tone = ['insight', 'warning', 'question'].indexOf(String(block.tone || '')) >= 0 ? String(block.tone) : '';
    return h(
      'div',
      { className: 'stage-prose' + (tone ? ' stage-tone-' + tone : '') },
      h(MarkdownLite, { text: block.text === undefined ? '' : block.text }),
    );
  }

  function MathBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const tex = typeof block.latex === 'string' ? block.latex : '';
    if (!tex) return h(RawBlock, { block: block, t: t });
    return h(
      'div',
      { className: 'stage-math' },
      h(ML.FormulaBlock, { tex: tex, label: block.caption ? String(block.caption) : undefined }),
      h('div', { className: 'stage-math-bar' }, h(ML.CopyBtn, { text: tex, label: t('common.copyLatex'), size: 'sm' })),
    );
  }

  function JudgmentBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const verdict = typeof block.verdict === 'string' && block.verdict ? block.verdict : 'have';
    const tone = VERDICT_TONES[verdict] || 'idle';
    const verdictKey = 'stage.verdict.' + verdict;
    const label = String(t(verdictKey)) === verdictKey ? verdict : String(t(verdictKey));
    const symbols = ML.toArr(block.symbols)
      .map(String)
      .filter(Boolean);
    return h(
      'div',
      { className: 'stage-judgment stage-j-' + tone },
      h(
        'div',
        { className: 'stage-j-hd' },
        h(ML.Badge, { tone: tone }, label),
        block.rule
          ? h('span', { className: 'stage-j-rule' }, String(t('stage.verdict.rule')) + ' · ' + String(block.rule))
          : null,
      ),
      block.claim ? h('div', { className: 'stage-j-claim' }, h(MarkdownLite, { text: block.claim })) : null,
      block.reason ? h('div', { className: 'stage-j-reason' }, h(MarkdownLite, { text: block.reason })) : null,
      symbols.length
        ? h(SymbolChips, {
            ids: symbols,
            t: t,
            label: t('stage.judgment.symbols'),
            activeSymbol: props.activeSymbol,
            onSymbolClick: props.onSymbolClick,
          })
        : null,
    );
  }

  function StrategyNode(props) {
    const node = props.node;
    if (!ML.isObj(node)) {
      return h('li', { className: 'stage-tree-node' }, h('span', { className: 'stage-tree-text' }, ML.safeString(node, 300)));
    }
    const kind = String(node.kind || 'subgoal');
    const children = props.depth >= 8 ? [] : ML.toArr(node.children).slice(0, 40);
    const detail = node.detail !== undefined && node.detail !== null ? String(node.detail) : '';
    return h(
      'li',
      { className: 'stage-tree-node stage-node-' + kind },
      h(
        'div',
        { className: 'stage-tree-label' },
        h('span', { className: 'stage-tree-dot', 'aria-hidden': true }),
        h('span', { className: 'stage-tree-text' }, node.label === undefined || node.label === null ? '·' : String(node.label)),
      ),
      detail
        ? h(
            ML.Collapse,
            { title: props.t('stage.strategy.detail'), summary: detail.slice(0, 80) },
            h(MarkdownLite, { text: detail }),
          )
        : null,
      children.length
        ? h(
            'ul',
            { className: 'stage-tree-children' },
            children.map(function (child, index) {
              return h(StrategyNode, {
                key: index,
                node: child,
                depth: props.depth + 1,
                t: props.t,
              });
            }),
          )
        : null,
    );
  }

  function StrategyBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const root = ML.isObj(block.root) ? block.root : null;
    if (!root) return h(RawBlock, { block: block, t: t });
    return h(
      'div',
      { className: 'stage-strategy' },
      h(BlockTitle, { title: block.title }),
      h('ul', { className: 'stage-tree' }, h(StrategyNode, { node: root, depth: 0, t: t })),
    );
  }

  function ProofBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const lines = fitchLines(block);
    const nodes = ML.toArr(block.nodes);
    const [visible, setVisible] = useState(lines.length);
    const [treeMode, setTreeMode] = useState(false);
    useEffect(
      function () {
        setVisible(lines.length);
      },
      [lines.length],
    );
    const total = lines.length;
    const shown = ML.clamp(visible, 0, total);
    const valid = block.valid;
    const canTree = nodes.length > 0;
    const useTree = canTree && treeMode;
    const title = block.title ? String(block.title) : String(t('stage.proof.title'));
    const goal = block.goal !== undefined && block.goal !== null ? ML.safeString(block.goal, 800) : '';
    return h(
      'div',
      { className: 'stage-proof' },
      h(
        'div',
        { className: 'stage-proof-hd' },
        h('span', { className: 'stage-proof-title' }, title),
        valid === true
          ? h(ML.Badge, { tone: 'success' }, t('stage.proof.valid'))
          : valid === false
            ? h(ML.Badge, { tone: 'error' }, t('stage.proof.invalid'))
            : h(ML.Badge, { tone: 'idle' }, t('stage.proof.unknown')),
        canTree
          ? h(
              'div',
              { className: 'ml-tabs ml-tabs-sm' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'ml-tab' + (useTree ? '' : ' is-active'),
                  'aria-pressed': !useTree,
                  onClick: function () {
                    setTreeMode(false);
                  },
                },
                t('stage.proof.fitch'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'ml-tab' + (useTree ? ' is-active' : ''),
                  'aria-pressed': useTree,
                  onClick: function () {
                    setTreeMode(true);
                  },
                },
                t('stage.proof.tree'),
              ),
            )
          : null,
      ),
      goal
        ? h(
            'div',
            { className: 'stage-proof-goal' },
            h('span', { className: 'stage-caption' }, t('stage.proof.goal')),
            h(MarkdownLite, { text: goal }),
          )
        : null,
      useTree
        ? h(ML.ProofTree, { nodes: nodes })
        : h(
            'div',
            null,
            h(
              'div',
              { className: 'stage-proof-nav' },
              h(
                ML.Btn,
                {
                  size: 'sm',
                  onClick: function () {
                    setVisible(Math.max(0, shown - 1));
                  },
                  disabled: shown <= 0,
                  'aria-label': t('stage.prev'),
                },
                '‹ ' + t('stage.prev'),
              ),
              h('input', {
                type: 'range',
                className: 'stage-range',
                min: 0,
                max: total,
                value: shown,
                'aria-label': ML.fmt(t, 'stage.proof.line', { i: shown, n: total }),
                onChange: function (event) {
                  setVisible(ML.clamp(parseInt(event.target.value, 10) || 0, 0, total));
                },
              }),
              h(
                ML.Btn,
                {
                  size: 'sm',
                  onClick: function () {
                    setVisible(Math.min(total, shown + 1));
                  },
                  disabled: shown >= total,
                  'aria-label': t('stage.next'),
                },
                t('stage.next') + ' ›',
              ),
              h('span', { className: 'stage-caption' }, ML.fmt(t, 'stage.proof.line', { i: shown, n: total })),
            ),
            total === 0
              ? h(ML.Empty, { label: t('stage.proof.empty') })
              : shown === 0
                ? h(ML.Empty, { label: t('stage.proof.empty') })
                : h(ML.FitchProof, { proof: { fitch: lines.slice(0, shown) } }),
          ),
      h(ML.Collapse, { title: t('stage.proof.rules') }, h(ML.RuleLegend)),
    );
  }

  function DiagramBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const diagram = ML.isObj(block.diagram) ? block.diagram : null;
    if (!diagram) return h(RawBlock, { block: block, t: t });
    const kind = String(diagram.kind || '');
    const title = diagram.title || block.title || '';
    let body = null;
    if (kind === 'category' || (ML.isObj(diagram.category) && kind !== 'hasse' && kind !== 'cayley')) {
      const category = ML.isObj(diagram.category) ? diagram.category : null;
      body = category
        ? h(ML.CommutativeDiagram, { category: category, ariaLabel: title || String(t('stage.diagram.title')) })
        : h(ML.Empty, { label: t('stage.diagram.unknown') });
    } else if (kind === 'hasse') {
      body = h(ML.HasseDiagram, { nodes: ML.toArr(diagram.nodes), edges: ML.toArr(diagram.edges) });
    } else if (kind === 'cayley') {
      body = h(ML.CayleyTable, { elements: ML.toArr(diagram.elements), table: ML.toArr(diagram.table) });
    } else if (kind === 'strategy-graph') {
      const root = ML.isObj(diagram.root) ? diagram.root : ML.isObj(block.root) ? block.root : null;
      body = root
        ? h('ul', { className: 'stage-tree' }, h(StrategyNode, { node: root, depth: 0, t: t }))
        : h(ML.Empty, { label: t('stage.diagram.unknown') });
    } else {
      body = h(RawBlock, { block: diagram, t: t, label: t('stage.diagram.unknown') });
    }
    const verify = ML.isObj(diagram.verify) ? diagram.verify : ML.isObj(block.verify) ? block.verify : null;
    let verifyNode = null;
    if (verify) {
      const valid = verify.valid !== undefined ? verify.valid : verify.commutes;
      const violations = ML.toArr(verify.violations);
      verifyNode = h(
        'div',
        { className: 'stage-verify' },
        h('span', { className: 'stage-caption' }, t('stage.diagram.verify')),
        valid === true
          ? h(ML.Badge, { tone: 'success' }, t('stage.diagram.verified'))
          : valid === false
            ? h(ML.Badge, { tone: 'error' }, t('stage.diagram.invalid'))
            : h(ML.Badge, { tone: 'idle' }, t('stage.diagram.unknown')),
        verify.message ? h('span', { className: 'stage-caption' }, ML.safeString(verify.message, 400)) : null,
        violations.length
          ? h(
              'ul',
              { className: 'ml-list' },
              violations.map(function (item, index) {
                return h(
                  'li',
                  { key: index },
                  ML.isObj(item) ? ML.safeString(item.message || item.reason || item, 400) : String(item),
                );
              }),
            )
          : null,
      );
    }
    return h(
      'div',
      { className: 'stage-diagram-block' },
      h(BlockTitle, { title: title }),
      h('div', { className: 'stage-diagram-scroll' }, body),
      verifyNode,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
    );
  }

  const PLOT_OPS = [
    'plot.sample',
    'plot.sample_multi',
    'plot.parametric',
    'plot.polar',
    'plot.implicit',
    'plot.surface3d',
    'plot.field',
  ];

  function plotCurveSegments(curves) {
    const segments = [];
    ML.toArr(curves).forEach(function (curve, curveIndex) {
      const raw = curve && curve.points !== undefined ? curve.points : curve;
      if (!Array.isArray(raw) || raw.length === 0) return;
      const first = raw[0];
      const isPolyline = Array.isArray(first) && first.length >= 1 && typeof first[0] === 'number';
      const polylines = isPolyline ? [raw] : raw;
      polylines.forEach(function (points) {
        const clean = ML.toArr(points).filter(function (point) {
          return (
            Array.isArray(point) &&
            point.length >= 2 &&
            Number.isFinite(Number(point[0])) &&
            Number.isFinite(Number(point[1]))
          );
        });
        if (!clean.length) return;
        segments.push({
          points: clean.map(function (point) {
            return [Number(point[0]), Number(point[1])];
          }),
          label: curve && curve.expr !== undefined ? String(curve.expr) : undefined,
          colorIndex: curveIndex,
        });
      });
    });
    return segments;
  }

  function normalizePlotView(op, args, data) {
    const kind = String(op || '').replace(/^plot\./, '');
    const params = ML.isObj(args) ? args : {};
    if (kind === 'surface3d') {
      return {
        kind: 'surface3d',
        vertices: ML.toArr(data && data.vertices).filter(function (vertex) {
          return Array.isArray(vertex) && vertex.length >= 3;
        }),
        indices: ML.toArr(data && data.indices),
      };
    }
    if (kind === 'sample' || kind === 'sample_multi') {
      return {
        kind: '2d',
        segments: plotCurveSegments(data && data.curves),
        xRange: range2(data && data.range) || range2(params.range),
        yRange: range2(data && data.yRange) || range2(params.yRange),
      };
    }
    if (kind === 'implicit') {
      const segments = ML.toArr(data && data.segments).map(function (segment, index) {
        return {
          points: ML.toArr(segment)
            .filter(function (point) {
              return Array.isArray(point) && point.length >= 2;
            })
            .map(function (point) {
              return [Number(point[0]), Number(point[1])];
            }),
          colorIndex: index,
        };
      });
      return {
        kind: '2d',
        segments: segments.filter(function (segment) {
          return segment.points.length > 0;
        }),
        xRange: range2(params.xRange),
        yRange: range2(params.yRange),
      };
    }
    if (kind === 'parametric' || kind === 'polar') {
      const points = ML.toArr(data && data.points)
        .filter(function (point) {
          return (
            Array.isArray(point) &&
            point.length >= 2 &&
            Number.isFinite(Number(point[0])) &&
            Number.isFinite(Number(point[1]))
          );
        })
        .map(function (point) {
          return [Number(point[0]), Number(point[1])];
        });
      return {
        kind: '2d',
        segments: points.length ? [{ points: points, label: kind === 'polar' ? 'r(θ)' : 'x(t), y(t)', colorIndex: 0 }] : [],
      };
    }
    if (kind === 'field') {
      return {
        kind: '2d',
        arrows: ML.toArr(data && data.arrows).filter(function (arrow) {
          return Array.isArray(arrow) && arrow.length >= 4;
        }),
        xRange: range2(params.xRange),
        yRange: range2(params.yRange),
      };
    }
    if (data && Array.isArray(data.curves)) return normalizePlotView('plot.sample_multi', params, data);
    if (data && Array.isArray(data.points)) return normalizePlotView('plot.parametric', params, data);
    return null;
  }

  function PlotBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const op = typeof block.op === 'string' ? block.op : '';
    const args = ML.isObj(block.args) ? block.args : {};
    const argsKey = useMemo(
      function () {
        return ML.prettyJSON(args, 4000);
      },
      [block.args],
    );
    const [state, setState] = useState({ status: 'idle', data: null, error: null });
    const aliveRef = useRef(true);
    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);
    const run = useCallback(
      function () {
        if (PLOT_OPS.indexOf(op) < 0) return;
        setState({ status: 'loading', data: null, error: null });
        ML.callMath(op, args)
          .then(function (data) {
            if (aliveRef.current) setState({ status: 'ready', data: data, error: null });
          })
          .catch(function (error) {
            if (aliveRef.current) setState({ status: 'error', data: null, error: error });
          });
      },
      [op, argsKey],
    );
    useEffect(
      function () {
        run();
      },
      [run],
    );

    const title = block.title ? String(block.title) : String(t('stage.plot.title'));
    let body;
    if (PLOT_OPS.indexOf(op) < 0) {
      body = h(ML.Banner, { tone: 'warn' }, t('stage.plot.unsupported') + (op ? ' · ' + op : ''));
    } else if (state.status === 'loading') {
      body = h(ML.Loading, { label: t('stage.plot.loading') });
    } else if (state.status === 'error') {
      body = h(ML.ErrorBox, { error: state.error, onRetry: run });
    } else if (state.status === 'ready') {
      const view = normalizePlotView(op, args, state.data);
      if (!view) {
        body = h(RawBlock, { block: state.data, t: t, label: t('stage.plot.empty') });
      } else if (view.kind === 'surface3d') {
        body = view.vertices.length
          ? h(ML.Surface3D, {
              vertices: view.vertices,
              indices: view.indices,
              title: title,
              filename: 'stage-surface.svg',
            })
          : h(ML.Empty, { label: t('stage.plot.empty') });
      } else {
        body = h(ML.Plot2D, {
          segments: view.segments || [],
          arrows: view.arrows || [],
          xRange: view.xRange,
          yRange: view.yRange,
          xLabel: 'x',
          yLabel: 'y',
          resetKey: op + ':' + argsKey.slice(0, 120),
          filename: 'stage-plot.svg',
          hint: t('stage.plot.hint'),
        });
      }
    } else {
      body = h(ML.Empty, { label: t('stage.plot.empty') });
    }
    return h(
      'div',
      { className: 'stage-plot' },
      h(BlockTitle, { title: title }),
      body,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
    );
  }

  function ComputeResult(props) {
    const data = props.data;
    if (data === undefined || data === null) return h(ML.Empty, { label: String(tr(props.t)('common.noResult')) });
    if (ML.pickExpr(data)) return h(ML.ExprResult, { data: data });
    return h(ML.DataView, { data: data });
  }

  function ComputeBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const op = typeof block.op === 'string' ? block.op : '';
    const args = ML.isObj(block.args) ? block.args : {};
    const argsKey = useMemo(
      function () {
        return ML.prettyJSON(args, 4000);
      },
      [block.args],
    );
    const embedded = block.result !== undefined && block.result !== null ? block.result : null;
    const embeddedKey = useMemo(
      function () {
        return embedded === null ? '' : ML.prettyJSON(embedded, 8000);
      },
      [block.result],
    );
    const [state, setState] = useState({ status: embedded !== null ? 'ready' : 'idle', data: embedded, error: null });
    const aliveRef = useRef(true);
    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);
    const run = useCallback(
      function () {
        if (!op) return;
        setState({ status: 'loading', data: null, error: null });
        ML.callMath(op, args)
          .then(function (data) {
            if (aliveRef.current) setState({ status: 'ready', data: data, error: null });
          })
          .catch(function (error) {
            if (aliveRef.current) setState({ status: 'error', data: null, error: error });
          });
      },
      [op, argsKey],
    );
    useEffect(
      function () {
        if (embeddedKey) {
          setState(function (previous) {
            return { status: 'ready', data: embedded, error: null };
          });
          return;
        }
        run();
      },
      [embeddedKey, run],
    );
    const title = block.title ? String(block.title) : String(t('stage.compute.title'));
    let body;
    if (state.status === 'loading') body = h(ML.Loading, { label: t('stage.compute.running') });
    else if (state.status === 'error') body = h(ML.ErrorBox, { error: state.error, onRetry: run });
    else if (state.data === undefined || state.data === null) body = h(ML.Empty, { label: t('common.noResult') });
    else body = h(ComputeResult, { data: state.data, t: t });
    return h(
      'div',
      { className: 'stage-compute' },
      h(
        'div',
        { className: 'stage-compute-hd' },
        h('span', { className: 'stage-block-title' }, title),
        op ? h('code', { className: 'stage-op' }, op) : null,
        h('span', { className: 'stage-spacer' }),
        h(
          ML.Btn,
          { size: 'sm', onClick: run, disabled: !op || state.status === 'loading' },
          state.status === 'loading' ? t('stage.compute.running') : t('stage.compute.run'),
        ),
      ),
      body,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
      Object.keys(args).length
        ? h(ML.Collapse, { title: t('stage.compute.input') }, h(ML.RawJSON, { value: args }))
        : null,
    );
  }

  function SymbolGraph(props) {
    const rows = ML.toArr(props.rows)
      .filter(function (row) {
        return ML.isObj(row) && ML.toArr(row.steps).length > 0;
      })
      .slice(0, 8);
    if (rows.length === 0) return null;
    const steps = [];
    for (const row of rows) {
      for (const step of row.steps) if (steps.indexOf(step) < 0) steps.push(step);
    }
    steps.sort(function (a, b) {
      return a - b;
    });
    const height = Math.max(72, rows.length * 30 + 18, steps.length * 20 + 18);
    const width = 260;
    const leftX = 8;
    const rightX = width - 8;
    const rowY = function (index) {
      return 14 + index * ((height - 26) / Math.max(1, rows.length - 1));
    };
    const stepY = function (index) {
      return 14 + index * ((height - 26) / Math.max(1, steps.length - 1));
    };
    const stepPos = new Map(
      steps.map(function (step, index) {
        return [step, stepY(index)];
      }),
    );
    return h(
      'div',
      { className: 'stage-sym-graph' },
      h('div', { className: 'stage-caption' }, String(props.label || '')),
      h(
        'svg',
        { viewBox: '0 0 ' + width + ' ' + height, role: 'img', style: { width: '100%', height: height + 'px' } },
        rows.map(function (row, rowIndex) {
          const y = rowY(rowIndex);
          const glyph = String(row.symbol && (row.symbol.unicode || row.symbol.symbol) ? row.symbol.unicode || row.symbol.symbol : row.id).slice(0, 14);
          const active = props.activeSymbol === row.id;
          return h(
            'g',
            { key: 'sym-' + row.id },
            ML.toArr(row.steps).map(function (step) {
              return h('line', {
                key: 'line-' + step,
                x1: leftX + 78,
                y1: y,
                x2: rightX - 30,
                y2: stepPos.get(step),
                className: 'stage-sym-graph-line' + (active ? ' is-active' : ''),
              });
            }),
            h('circle', {
              cx: leftX + 78,
              cy: y,
              r: 3,
              className: 'stage-sym-graph-dot' + (active ? ' is-active' : ''),
            }),
            h(
              'text',
              {
                x: leftX,
                y: y + 4,
                className: 'stage-sym-graph-label' + (active ? ' is-active' : ''),
                onClick: function () {
                  if (typeof props.onSymbolClick === 'function') props.onSymbolClick(active ? null : row.id);
                },
              },
              glyph,
            ),
          );
        }),
        steps.map(function (step) {
          return h(
            'g',
            { key: 'step-' + step },
            h('circle', { cx: rightX - 30, cy: stepPos.get(step), r: 2.5, className: 'stage-sym-graph-dot' }),
            h(
              'text',
              {
                x: rightX,
                y: stepPos.get(step) + 4,
                textAnchor: 'end',
                className: 'stage-sym-graph-step',
                onClick: function () {
                  if (typeof props.jumpTo === 'function') props.jumpTo(step);
                },
              },
              '第 ' + (step + 1) + ' 步',
            ),
          );
        }),
      ),
    );
  }

  function SymbolsBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const [state, setState] = useState({ loading: true, error: null, data: null });
    const load = useCallback(function () {
      setState({ loading: true, error: null, data: null });
      loadSymbolsData()
        .then(function (data) {
          setState({ loading: false, error: null, data: data });
        })
        .catch(function (error) {
          setState({ loading: false, error: error, data: null });
        });
    }, []);
    useEffect(
      function () {
        load();
      },
      [load],
    );
    const data = state.data;
    const ids = ML.toArr(block.ids)
      .map(String)
      .filter(Boolean);
    const query = typeof block.query === 'string' ? block.query.trim().toLowerCase() : '';
    const field = typeof block.field === 'string' ? block.field : '';
    let list;
    if (ids.length) {
      const index = symbolIndex(data || {});
      list = ids.map(function (id) {
        return symbolLookup(index, id) || { id: id, name: id, name_zh: id, symbol: id, unicode: id };
      });
    } else {
      list = ML.toArr(data && data.symbols).filter(function (symbol) {
        if (!ML.isObj(symbol)) return false;
        if (field && String(symbol.field || '') !== field) return false;
        if (!query) return true;
        const haystack = [
          symbol.symbol,
          symbol.unicode,
          symbol.latex,
          symbol.name,
          symbol.name_zh,
          symbol.description,
          symbol.description_zh,
          ML.toArr(symbol.tags).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(query) >= 0;
      });
    }
    const limit = ML.clamp(parseInt(block.limit, 10) || 24, 1, 100);
    list = list.slice(0, limit);
    const title = block.title ? String(block.title) : String(t('stage.symbols.title'));
    const usage = props.symbolUsage instanceof Map ? props.symbolUsage : new Map();
    const activeSymbol = props.activeSymbol || null;
    const jumpTo = props.onJumpToIndex;
    let body;
    if (state.loading) body = h(ML.Loading, { label: t('stage.symbols.loading') });
    else if (state.error) body = h(ML.ErrorBox, { error: state.error, onRetry: load });
    else if (!list.length) body = h(ML.Empty, { label: t('stage.symbols.empty') });
    else {
      body = h(
        'div',
        { className: 'stage-sym-grid' },
        list.map(function (symbol, index) {
          const latex = typeof symbol.latex === 'string' ? symbol.latex : '';
          const glyph = String(symbol.unicode || symbol.symbol || symbol.id || '?');
          const name = symbolName(symbol, t);
          const altLang = ML.lang(t) === 'zh' ? 'en' : 'zh';
          const alt = ML.pick(altLang, symbol.name_zh, symbol.name);
          return h(
            'div',
            { key: String(symbol.id || index), className: 'stage-sym-card' },
            h('div', { className: 'stage-sym-glyph' }, latex ? h(ML.Math, { tex: latex }) : glyph),
            h('div', { className: 'stage-sym-name' }, name),
            alt && alt !== name ? h('div', { className: 'stage-sym-alt' }, alt) : null,
            latex ? h('div', { className: 'stage-sym-latex' }, latex) : null,
            h(
              'div',
              { className: 'stage-chips' },
              latex ? h(ML.CopyBtn, { size: 'sm', text: latex, label: t('stage.symbols.copyLatex') }) : null,
              glyph ? h(ML.CopyBtn, { size: 'sm', text: glyph, label: t('common.copyText') }) : null,
            ),
          );
        }),
      );
    }
    const usageRows = [];
    const seenUsage = new Set();
    for (const symbol of list) {
      const key = symbol && symbol.id ? String(symbol.id) : '';
      if (!key || seenUsage.has(key)) continue;
      const steps = usage.get(key) || [];
      if (!steps.length) continue;
      seenUsage.add(key);
      usageRows.push({ id: key, symbol: symbol, steps: steps });
    }
    return h(
      'div',
      { className: 'stage-symbols' + (activeSymbol ? ' has-active-symbol' : '') },
      h(BlockTitle, { title: title }),
      body,
      usageRows.length > 1
        ? h(SymbolGraph, {
            rows: usageRows,
            label: t('stage.symbols.graph'),
            activeSymbol: activeSymbol,
            onSymbolClick: props.onSymbolClick,
            jumpTo: jumpTo,
          })
        : null,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
    );
  }

  function LeanBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const code = typeof block.code === 'string' ? block.code : ML.safeString(block.code === undefined ? '' : block.code, 8000);
    const imports = ML.toArr(block.imports)
      .map(String)
      .filter(Boolean);
    const fullCode = (imports.length ? imports.join('\n') + '\n\n' : '') + code;
    const [check, setCheck] = useState({ loading: false, error: null, result: null });
    const aliveRef = useRef(true);
    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);
    const run = useCallback(
      function () {
        setCheck({ loading: true, error: null, result: null });
        ML.callMath('lean.check', { code: fullCode })
          .then(function (result) {
            if (aliveRef.current) setCheck({ loading: false, error: null, result: result });
          })
          .catch(function (error) {
            if (aliveRef.current) setCheck({ loading: false, error: error, result: null });
          });
      },
      [fullCode],
    );
    const result = check.result || null;
    const diagnostics = ML.toArr(block.diagnostics).length
      ? ML.toArr(block.diagnostics)
      : ML.toArr(result && result.diagnostics);
    const ok = result && result.ok !== undefined ? !!result.ok : undefined;
    const title = block.title ? String(block.title) : String(t('stage.lean.title'));
    return h(
      'div',
      { className: 'stage-lean' },
      h(
        'div',
        { className: 'stage-lean-hd' },
        h('span', { className: 'stage-block-title' }, title),
        ok === true
          ? h(ML.Badge, { tone: 'success' }, t('stage.lean.ok'))
          : ok === false
            ? h(ML.Badge, { tone: 'error' }, t('stage.lean.failed'))
            : null,
        h('span', { className: 'stage-spacer' }),
        h(ML.CopyBtn, { size: 'sm', text: fullCode, label: t('common.copyText') }),
        block.check === true
          ? h(
              ML.Btn,
              { size: 'sm', onClick: run, disabled: check.loading },
              check.loading ? t('stage.lean.checking') : t('stage.lean.check'),
            )
          : null,
      ),
      imports.length
        ? h(
            'div',
            { className: 'stage-chips' },
            h('span', { className: 'stage-caption' }, t('stage.lean.imports')),
            imports.map(function (item, index) {
              return h(ML.Badge, { key: index, tone: 'idle' }, item);
            }),
          )
        : null,
      h('pre', { className: 'ml-pre stage-code' }, fullCode),
      check.error ? h(ML.ErrorBox, { error: check.error, onRetry: run }) : null,
      check.loading ? h(ML.Loading, { label: t('stage.lean.checking') }) : null,
      diagnostics.length
        ? h(
            'div',
            null,
            h('div', { className: 'stage-caption' }, t('stage.lean.diagnostics')),
            h(ML.LabeledTable, {
              rowLabels: diagnostics.map(function (item, index) {
                return String(index + 1);
              }),
              colLabels: [t('lean.severity'), t('lean.line'), t('lean.column'), t('lean.message')],
              cells: diagnostics.map(function (diagnostic) {
                return [
                  String((diagnostic && diagnostic.severity) || 'info'),
                  diagnostic && diagnostic.line !== undefined ? String(diagnostic.line) : '',
                  diagnostic && diagnostic.column !== undefined ? String(diagnostic.column) : '',
                  ML.safeString(diagnostic && diagnostic.message !== undefined ? diagnostic.message : diagnostic, 800),
                ];
              }),
              cellClass: function (cell, rowIndex) {
                const diagnostic = diagnostics[rowIndex];
                const severity = String((diagnostic && diagnostic.severity) || '').toLowerCase();
                if (severity === 'error') return 'ml-tt-f';
                if (severity === 'warning') return 'ml-tt-result';
                return undefined;
              },
            }),
          )
        : result && diagnostics.length === 0
          ? h(ML.Banner, { tone: ok === false ? 'warn' : 'success' }, t('stage.lean.noDiagnostics'))
          : null,
      result && result.stdout ? h(ML.Collapse, { title: t('stage.lean.stdout') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stdout))) : null,
      result && result.stderr ? h(ML.Collapse, { title: t('stage.lean.stderr') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stderr))) : null,
      result ? h(ML.RawJSON, { value: result }) : null,
    );
  }

  function TakeawayCard(props) {
    const t = tr(props.t);
    const takeaway = ML.isObj(props.takeaway) ? props.takeaway : {};
    const title = props.title ? String(props.title) : String(t('stage.takeaway.title'));
    const rows = [
      ['claim', 'stage.takeaway.claim'],
      ['method', 'stage.takeaway.method'],
      ['generalization', 'stage.takeaway.generalization'],
      ['scope', 'stage.takeaway.scope'],
    ].filter(function (row) {
      const value = takeaway[row[0]];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
    const examples = ML.toArr(takeaway.examples)
      .map(String)
      .filter(Boolean);
    const references = ML.toArr(takeaway.references)
      .map(String)
      .filter(Boolean);
    const markdown = takeawayMarkdown(takeaway, title, t);
    const download = function () {
      ML.download('takeaway-' + slugify(title) + '.md', markdown, 'text/markdown;charset=utf-8');
    };
    return h(
      'section',
      { className: 'stage-takeaway', 'aria-label': title },
      h(
        'div',
        { className: 'stage-takeaway-hd' },
        h('span', { className: 'stage-takeaway-icon', 'aria-hidden': true }, '✦'),
        h('h3', { className: 'stage-takeaway-title' }, title),
        h('span', { className: 'stage-spacer' }),
        h(ML.CopyBtn, { size: 'sm', text: markdown, label: t('stage.takeaway.copy') }),
        h(ML.Btn, { size: 'sm', onClick: download }, t('stage.takeaway.download')),
      ),
      rows.map(function (row) {
        return h(
          'div',
          { className: 'stage-takeaway-row', key: row[0] },
          h('div', { className: 'stage-takeaway-label' }, t(row[1])),
          h('div', { className: 'stage-takeaway-value' }, h(MarkdownLite, { text: String(takeaway[row[0]]) })),
        );
      }),
      examples.length
        ? h(
            'div',
            { className: 'stage-takeaway-row' },
            h('div', { className: 'stage-takeaway-label' }, t('stage.takeaway.examples')),
            h(
              'div',
              { className: 'stage-takeaway-value' },
              h(
                'ul',
                { className: 'stage-takeaway-list' },
                examples.map(function (example, index) {
                  return h('li', { key: index }, h(MarkdownLite, { text: example }));
                }),
              ),
            ),
          )
        : null,
      references.length
        ? h(
            'div',
            { className: 'stage-takeaway-row' },
            h('div', { className: 'stage-takeaway-label' }, t('stage.takeaway.references')),
            h(
              'div',
              { className: 'stage-takeaway-value' },
              h(
                'ul',
                { className: 'stage-takeaway-list' },
                references.map(function (reference, index) {
                  return h('li', { key: index }, h(MarkdownLite, { text: reference }));
                }),
              ),
            ),
          )
        : null,
    );
  }

  function TakeawayBlock(props) {
    const block = props.block || {};
    return h(TakeawayCard, {
      takeaway: block,
      title: block.title,
      t: props.t,
    });
  }

  function NoteBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    return h(
      'div',
      { className: 'stage-note' },
      h('div', { className: 'stage-caption' }, t('stage.note.title')),
      h(MarkdownLite, { text: block.text === undefined ? '' : block.text }),
    );
  }

  function UnknownBlock(props) {
    return h(RawBlock, { block: props.block, t: props.t });
  }

  const VERDICT_TONES = {
    goal: 'brand',
    assume: 'warn',
    have: 'success',
    rule: 'idle',
    check: 'brand',
    contradiction: 'error',
    conclusion: 'success',
  };

  const KIND_LABELS = {
    heading: 'stage.kind.heading',
    prose: 'stage.kind.prose',
    math: 'stage.kind.math',
    judgment: 'stage.kind.judgment',
    strategy: 'stage.kind.strategy',
    proof: 'stage.kind.proof',
    diagram: 'stage.kind.diagram',
    plot: 'stage.kind.plot',
    compute: 'stage.kind.compute',
    symbols: 'stage.kind.symbols',
    lean: 'stage.kind.lean',
    takeaway: 'stage.kind.takeaway',
    note: 'stage.kind.note',
  };

  function kindLabel(kind, t) {
    const key = KIND_LABELS[kind];
    if (key) return String(t(key));
    return String(t('stage.kind.unknown')) + (kind ? ' · ' + kind : '');
  }

  function BlockContent(props) {
    const kind = blockKindOf(props.block);
    if (kind === 'heading') return h(HeadingBlock, props);
    if (kind === 'prose') return h(ProseBlock, props);
    if (kind === 'math') return h(MathBlock, props);
    if (kind === 'judgment') return h(JudgmentBlock, props);
    if (kind === 'strategy') return h(StrategyBlock, props);
    if (kind === 'proof') return h(ProofBlock, props);
    if (kind === 'diagram') return h(DiagramBlock, props);
    if (kind === 'plot') return h(PlotBlock, props);
    if (kind === 'compute') return h(ComputeBlock, props);
    if (kind === 'symbols') return h(SymbolsBlock, props);
    if (kind === 'lean') return h(LeanBlock, props);
    if (kind === 'takeaway') return h(TakeawayBlock, props);
    if (kind === 'note') return h(NoteBlock, props);
    return h(UnknownBlock, props);
  }

  function BlockView(props) {
    const t = tr(props.t);
    const block = props.block;
    const kind = blockKindOf(block);
    const [editorOpen, setEditorOpen] = useState(false);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const annotations = ML.toArr(props.annotations);
    const submit = function () {
      const text = String(note || '').trim();
      if (!text) {
        setSaveError(String(t('stage.annotate.empty')));
        return;
      }
      setSaving(true);
      setSaveError(null);
      ML.callMath('stage.annotate', { blockId: props.blockId, note: text, sessionId: props.sessionId })
        .then(function () {
          setSaving(false);
          setNote('');
          setEditorOpen(false);
          if (typeof props.onChanged === 'function') props.onChanged();
        })
        .catch(function (error) {
          setSaving(false);
          setSaveError(ML.errText(error, t));
        });
    };
    return h(
      'article',
      {
        className:
          'stage-block' +
          (props.current ? ' is-current' : '') +
          (props.activeSymbol && ML.toArr(block.symbols).map(String).indexOf(props.activeSymbol) >= 0
            ? ' is-symbol-focus'
            : '') +
          ' stage-block-' +
          kind,
        'data-stage-block': props.blockId,
        ref: props.innerRef,
        'aria-current': props.current ? 'step' : undefined,
      },
      h(
        'div',
        { className: 'stage-block-hd' },
        h(
          'button',
          {
            type: 'button',
            className: 'stage-step-no',
            title: ML.fmt(t, 'stage.jumpTo', { n: props.index + 1 }),
            'aria-label': ML.fmt(t, 'stage.jumpTo', { n: props.index + 1 }),
            onClick: function () {
              if (typeof props.onJump === 'function') props.onJump(props.index);
            },
          },
          String(props.index + 1),
        ),
        h('span', { className: 'stage-kind' }, kindLabel(kind, t)),
        block && typeof block.title === 'string' && block.title && kind !== 'heading' && kind !== 'takeaway'
          ? h('span', { className: 'stage-block-title' }, block.title)
          : null,
        h(
          'div',
          { className: 'stage-block-actions' },
          h(
            ML.Btn,
            {
              size: 'sm',
              variant: 'subtle',
              onClick: function () {
                setEditorOpen(function (open) {
                  return !open;
                });
              },
              'aria-expanded': editorOpen,
              title: t('stage.annotate'),
            },
            t('stage.annotate') + (annotations.length ? ' · ' + annotations.length : ''),
          ),
        ),
      ),
      h(ML.Boundary, null, h(BlockContent, {
        block: block,
        t: t,
        symbolUsage: props.symbolUsage,
        activeSymbol: props.activeSymbol,
        onSymbolClick: props.onSymbolClick,
        onJumpToIndex: props.onJumpToIndex,
      })),
      annotations.length
        ? h(
            'div',
            { className: 'stage-annot' },
            annotations.map(function (annotation, index) {
              const item = ML.isObj(annotation) ? annotation : { note: annotation };
              const text = item.note !== undefined && item.note !== null ? String(item.note) : ML.safeString(item);
              return h(
                'div',
                { key: String(item.id || index), className: 'stage-annot-item' },
                h('span', { className: 'stage-annot-mark', 'aria-hidden': true }, '✎'),
                h('span', { className: 'stage-annot-text' }, text),
                item.at ? h('time', { className: 'stage-annot-time' }, fmtTime(item.at)) : null,
              );
            }),
          )
        : null,
      editorOpen
        ? h(
            'div',
            { className: 'stage-annot-editor' },
            h(ML.Textarea, {
              rows: 3,
              value: note,
              placeholder: t('stage.annotate.placeholder'),
              'aria-label': t('stage.annotate'),
              onChange: function (event) {
                setNote(event.target.value);
              },
            }),
            saveError ? h(ML.Banner, { tone: 'error' }, saveError) : null,
            h(
              'div',
              { className: 'ml-row' },
              h(ML.Btn, { size: 'sm', variant: 'primary', onClick: submit, disabled: saving }, saving ? t('common.loading') : t('stage.annotate.save')),
              h(
                ML.Btn,
                {
                  size: 'sm',
                  onClick: function () {
                    setEditorOpen(false);
                    setSaveError(null);
                  },
                },
                t('common.close'),
              ),
            ),
          )
        : null,
    );
  }

  function StepStrip(props) {
    const count = props.count;
    if (!count || count < 2) return null;
    const buttons = [];
    for (let index = 0; index < count; index += 1) {
      buttons.push(
        h(
          'button',
          {
            key: index,
            type: 'button',
            className: 'stage-step-btn' + (index === props.index ? ' is-active' : ''),
            'aria-current': index === props.index ? 'step' : undefined,
            title: ML.fmt(props.t, 'stage.jumpTo', { n: index + 1 }),
            onClick: function () {
              props.onJump(index);
            },
          },
          String(index + 1),
        ),
      );
    }
    return h('div', { className: 'stage-steps', role: 'group', 'aria-label': props.label }, buttons);
  }

  function TraceView(props) {
    const t = tr(props.t);
    const trace = ML.toArr(props.trace);
    const entries = trace.slice().reverse().slice(0, 200);
    const copyAll = function () {
      ML.copy(ML.prettyJSON(trace)).then(function (ok) {
        if (typeof props.onToast === 'function') {
          props.onToast(ok ? t('stage.trace.copied') : t('common.copyFailed'), ok ? 'success' : 'error');
        }
      });
    };
    return h(
      'div',
      { className: 'stage-trace' },
      h('div', { className: 'stage-caption' }, t('stage.trace.hint')),
      h(
        'div',
        { className: 'stage-trace-toolbar' },
        h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'stage.trace.count', { n: trace.length })),
        h('span', { className: 'stage-spacer' }),
        h(ML.Btn, { size: 'sm', onClick: props.onRefresh, disabled: !!props.loading }, props.loading ? t('common.loading') : t('stage.refresh')),
        h(ML.Btn, { size: 'sm', onClick: copyAll, disabled: trace.length === 0 }, t('stage.trace.copyAll')),
      ),
      trace.length === 0
        ? h(ML.Empty, { label: t('stage.trace.empty') })
        : h(
            'ol',
            { className: 'stage-trace-list' },
            entries.map(function (entry, index) {
              const item = ML.isObj(entry) ? entry : { summary: String(entry) };
              const tool = item.tool || item.source || 'mathlab';
              const op = typeof item.op === 'string' ? item.op : '';
              return h(
                'li',
                { key: index, className: 'stage-trace-item' },
                h(
                  'div',
                  { className: 'stage-trace-hd' },
                  h(ML.Badge, { tone: 'brand' }, String(tool)),
                  op ? h('code', { className: 'stage-trace-op' }, op) : null,
                  item.summary ? h('span', { className: 'stage-trace-summary' }, ML.safeString(item.summary, 300)) : null,
                  h('span', { className: 'stage-spacer' }),
                  h(ML.CopyBtn, { size: 'sm', text: ML.prettyJSON(item), label: t('common.copy') }),
                  item.at ? h('time', { className: 'stage-trace-time' }, fmtTime(item.at)) : null,
                ),
                h(
                  ML.Collapse,
                  { title: t('common.details') },
                  h(
                    'div',
                    { className: 'stage-trace-cols' },
                    h(
                      'div',
                      null,
                      h('div', { className: 'stage-caption' }, t('stage.trace.args')),
                      h(ML.JSONTree, { value: item.args === undefined ? {} : item.args }),
                    ),
                    h(
                      'div',
                      null,
                      h('div', { className: 'stage-caption' }, t('stage.trace.result')),
                      h(ML.JSONTree, { value: item.result === undefined ? {} : item.result }),
                    ),
                  ),
                ),
              );
            }),
          ),
    );
  }

  function StageEmpty(props) {
    const t = tr(props.t);
    const trace = ML.toArr(props.trace);
    const samples = [t('stage.empty.sample1'), t('stage.empty.sample2'), t('stage.empty.sample3')];
    const recent = trace.slice(-5).reverse();
    return h(
      'div',
      { className: 'stage-empty' },
      h('div', { className: 'stage-empty-mark', 'aria-hidden': true }, '∎'),
      h('h2', { className: 'stage-empty-title' }, t('stage.empty.title')),
      h('div', { className: 'stage-empty-body' }, h(MarkdownLite, { text: t('stage.empty.body') })),
      h('div', { className: 'stage-empty-ask' }, t('stage.empty.ask')),
      h(
        'ul',
        { className: 'stage-empty-list' },
        samples.map(function (sample, index) {
          return h('li', { key: index }, h('code', { className: 'stage-empty-sample' }, String(sample)));
        }),
      ),
      h('div', { className: 'stage-empty-tool' }, h(MarkdownLite, { text: t('stage.empty.tool') })),
      recent.length
        ? h(
            ML.Collapse,
            { title: t('stage.trace.title'), summary: ML.fmt(t, 'stage.trace.count', { n: trace.length }) },
            h(
              'ol',
              { className: 'stage-trace-list' },
              recent.map(function (entry, index) {
                const item = ML.isObj(entry) ? entry : { summary: String(entry) };
                return h(
                  'li',
                  { key: index, className: 'stage-trace-item' },
                  h(
                    'div',
                    { className: 'stage-trace-hd' },
                    h(ML.Badge, { tone: 'brand' }, String(item.tool || item.source || 'mathlab')),
                    item.op ? h('code', { className: 'stage-trace-op' }, String(item.op)) : null,
                    h('span', { className: 'stage-trace-summary' }, ML.safeString(item.summary || '', 200)),
                    item.at ? h('time', { className: 'stage-trace-time' }, fmtTime(item.at)) : null,
                  ),
                );
              }),
            ),
          )
        : null,
    );
  }

  function QuestionBox(props) {
    const t = tr(props.t);
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);
    const stage = props.stage;
    const questions = ML.toArr(stage && stage.questions);
    const ask = function () {
      const value = String(text || '').trim();
      if (!value) {
        if (typeof props.onToast === 'function') props.onToast(t('stage.question.empty'), 'warn');
        return;
      }
      setSaving(true);
      ML.callMath('stage.question', { blockId: props.blockId || undefined, text: value, sessionId: props.sessionId })
        .then(function () {
          return ML.copy(value).then(function (copied) {
            setSaving(false);
            setText('');
            if (typeof props.onToast === 'function') {
              props.onToast(copied ? t('stage.question.saved') : t('stage.question.copiedOnly'), copied ? 'success' : 'warn');
            }
            if (typeof props.onChanged === 'function') props.onChanged();
          });
        })
        .catch(function (error) {

          ML.copy(value).then(function () {
            setSaving(false);
            if (typeof props.onToast === 'function') {
              props.onToast(ML.errText(error, t) + ' · ' + t('stage.question.copiedOnly'), 'error');
            }
          });
        });
    };
    return h(
      'section',
      { className: 'stage-question', 'aria-label': t('stage.question.title') },
      h(
        'h3',
        { className: 'stage-question-title' },
        t('stage.question.title'),
        props.blockId ? h('span', { className: 'stage-caption' }, ' · ' + t('stage.current') + ' #' + String(props.currentIndex + 1)) : null,
      ),
      h('div', { className: 'stage-hint' }, t('stage.question.hint')),
      h(ML.Textarea, {
        rows: 2,
        value: text,
        placeholder: t('stage.question.placeholder'),
        'aria-label': t('stage.question.title'),
        onChange: function (event) {
          setText(event.target.value);
        },
      }),
      h(
        'div',
        { className: 'ml-row' },
        h(ML.Btn, { variant: 'primary', onClick: ask, disabled: saving }, saving ? t('common.loading') : t('stage.question.submit')),
      ),
      questions.length
        ? h(
            'div',
            { className: 'stage-question-list' },
            h('div', { className: 'stage-caption' }, t('stage.question.list')),
            questions
              .slice()
              .reverse()
              .slice(0, 50)
              .map(function (question, index) {
                const item = ML.isObj(question) ? question : { text: String(question) };
                const body = item.text !== undefined && item.text !== null ? String(item.text) : ML.safeString(item);
                return h(
                  'div',
                  { key: String(item.id || index), className: 'stage-q-item' },
                  h('span', { className: 'stage-q-text' }, body),
                  item.quote ? h('div', { className: 'stage-q-quote' }, '「' + String(item.quote) + '」') : null,
                  item.blockId ? h(ML.Badge, { tone: 'idle' }, String(item.blockId)) : null,
                  item.at ? h('time', { className: 'stage-q-time' }, fmtTime(item.at)) : null,
                  h(ML.CopyBtn, { size: 'sm', text: (item.quote ? '「' + item.quote + '」\n' : '') + body, label: t('common.copy') }),
                );
              }),
          )
        : null,
    );
  }

  function useStageStream(sessionId, onRevision) {
    const callbackRef = React.useRef(onRevision);
    callbackRef.current = onRevision;
    useEffect(
      function () {
        if (!sessionId || typeof EventSource === 'undefined') return undefined;
        let source = null;
        let last = null;
        try {
          source = new EventSource('/mathlab/events?sessionId=' + encodeURIComponent(sessionId));
        } catch (streamError) {
          return undefined;
        }
        const onStage = function (event) {
          try {
            const payload = JSON.parse(event.data);
            const revision = payload && typeof payload.revision === 'number' ? payload.revision : null;
            if (revision !== null && revision !== last) {
              last = revision;
              if (typeof callbackRef.current === 'function') callbackRef.current();
            }
          } catch (parseError) {

          }
        };
        try {
          source.addEventListener('stage', onStage);
        } catch (listenError) {
          try {
            source.onmessage = onStage;
          } catch (assignError) {

          }
        }
        return function () {
          try {
            source.removeEventListener('stage', onStage);
          } catch (removeError) {

          }
          try {
            source.close();
          } catch (closeError) {

          }
        };
      },
      [sessionId],
    );
  }

  function StageTab(props) {
    const t = ML.useT();
    const sessionId = typeof props.sessionId === 'string' && props.sessionId !== '' ? props.sessionId : undefined;
    const embedded = props.embedded === true;
    const pinned = props.pinned === true;
    const withSession = function (extra) {
      const payload = Object.assign({}, extra);
      if (sessionId) payload.sessionId = sessionId;
      return payload;
    };
    const [doc, setDoc] = useState({ stage: null, revision: null, trace: [] });
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [syncedAt, setSyncedAt] = useState(null);
    const [view, setView] = useState('blocks');
    const [index, setIndex] = useState(0);
    const [follow, setFollow] = useState(true);
    const [toast, setToast] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [activeSymbol, setActiveSymbol] = useState(null);
    const [zoom, setZoom] = useState(function () {
      try {
        const stored = parseFloat(ML.storage.get('stage.zoom', '1'));
        return Number.isFinite(stored) ? Math.min(1.75, Math.max(0.75, stored)) : 1;
      } catch (storageError) {
        return 1;
      }
    });
    const changeZoom = function (delta) {
      setZoom(function (current) {
        const next = Math.min(1.75, Math.max(0.75, Math.round((current + delta) * 100) / 100));
        try {
          ML.storage.set('stage.zoom', String(next));
        } catch (storageError) {

        }
        return next;
      });
    };
    const [selectionAsk, setSelectionAsk] = useState(null);
    const [askOpen, setAskOpen] = useState(false);
    const [askText, setAskText] = useState('');
    const [askSaving, setAskSaving] = useState(false);
    const stageRootRef = useRef(null);
    const askBoxRef = useRef(null);

    const stage = doc.stage;
    const blocks = ML.toArr(stage && stage.blocks);
    const currentBlock = blocks[index] || null;
    const currentBlockId = currentBlock
      ? typeof currentBlock.id === 'string' && currentBlock.id
        ? currentBlock.id
        : 'b' + (index + 1)
      : undefined;

    const activeRef = useRef(false);
    const followRef = useRef(true);
    const blocksRef = useRef([]);
    const indexRef = useRef(0);
    const firstLoadRef = useRef(true);
    const prevRevisionRef = useRef(null);
    const focusRef = useRef(null);
    const sigRef = useRef(null);
    const autoSwitchRef = useRef(null);
    const toastTimer = useRef(null);
    const currentRef = useRef(null);
    const pushCursorRef = useRef(null);

    activeRef.current = !!props.active;
    followRef.current = follow;
    blocksRef.current = blocks;
    indexRef.current = index;

    const showToast = useCallback(function (message, tone) {
      setToast({ message: String(message === undefined || message === null ? '' : message), tone: tone || 'success' });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(function () {
        setToast(null);
      }, 2800);
    }, []);

    useEffect(function () {
      return function () {
        clearTimeout(toastTimer.current);
      };
    }, []);

    const applyPayload = useCallback(function (payload) {
      const normalized = normalizeStagePayload(payload);
      const nextStage = normalized.stage;
      const nextRevision = normalized.revision;
      const list = ML.toArr(nextStage && nextStage.blocks);
      const firstLoad = firstLoadRef.current;
      const isChange = !firstLoad && nextRevision !== null && prevRevisionRef.current !== null && nextRevision !== prevRevisionRef.current;
      let signature = '';
      try {

        signature = JSON.stringify(list);
      } catch (signatureError) {
        signature = '';
      }
      const blocksChanged = sigRef.current !== null && sigRef.current !== signature;
      const focusRaw = nextStage && nextStage.focus !== undefined && nextStage.focus !== null ? Number(nextStage.focus) : NaN;
      const focusChanged = Number.isFinite(focusRaw) && focusRef.current !== null && focusRaw !== focusRef.current;
      focusRef.current = Number.isFinite(focusRaw) ? focusRaw : null;

      setDoc({
        stage: nextStage,
        revision: nextRevision,
        trace: normalized.trace,
      });
      setLoading(false);
      setHasLoaded(true);
      setError(null);
      setSyncedAt(Date.now());

      if (followRef.current && (firstLoad || isChange || focusChanged)) {
        const target = Number.isFinite(focusRaw) ? focusRaw : indexRef.current;
        setIndex(clampIndex(target, list.length));
      } else if (list.length && indexRef.current > list.length - 1) {
        setIndex(list.length - 1);
      }

      if (!firstLoad && blocksChanged && nextStage && nextStage.autoShow !== false && !activeRef.current && !embedded && autoSwitchRef.current !== nextRevision) {
        autoSwitchRef.current = nextRevision;
        try {
          ML.bus.emit('activate', { tab: 'stage' });
        } catch (busError) {

        }
      }

      firstLoadRef.current = false;
      prevRevisionRef.current = nextRevision;
      sigRef.current = signature;
    }, []);

    const load = useCallback(
      async function () {
        try {
          const payload = await ML.callMath('stage.get', withSession({}));
          applyPayload(payload);
        } catch (loadError) {
          setError(loadError);
          setLoading(false);
        }
      },
      [applyPayload, sessionId],
    );

    useStageStream(sessionId, load);

    useEffect(
      function () {
        let alive = true;
        let timer = null;
        const tick = function () {
          if (!alive) return;
          ML.callMath('stage.get', withSession({}))
            .then(function (payload) {
              if (alive) applyPayload(payload);
            })
            .catch(function (loadError) {
              if (alive) {
                setError(loadError);
                setLoading(false);
              }
            })
            .then(function () {
              if (alive) timer = setTimeout(tick, 900);
            });
        };
        tick();
        return function () {
          alive = false;
          clearTimeout(timer);
        };
      },
      [applyPayload, sessionId],
    );

    useEffect(
      function () {
        if (props.active) load();
      },
      [props.active, load],
    );

    const postCursor = useCallback(function (value) {
      const list = blocksRef.current;
      if (!list.length) return;
      const target = clampIndex(value, list.length);
      const block = list[target];
      const payload = withSession({ index: target });
      if (block && typeof block.id === 'string' && block.id) payload.blockId = block.id;
      ML.callMath('stage.cursor', payload).catch(function () {

      });
    }, []);
    if (!pushCursorRef.current) pushCursorRef.current = ML.debounce(postCursor, 400);

    const setStep = useCallback(
      function (next, options) {
        const list = blocksRef.current;
        if (!list.length) return;
        const opts = options || {};
        const target = clampIndex(next, list.length);
        setIndex(target);
        if (opts.free !== false) setFollow(false);
        if (opts.sync !== false && pushCursorRef.current) pushCursorRef.current(target);
      },
      [],
    );

    const stepBy = useCallback(
      function (delta) {
        setStep(indexRef.current + delta);
      },
      [setStep],
    );

    const symbolUsage = useMemo(
      function () {
        const map = new Map();
        blocks.forEach(function (block, blockIndex) {
          if (!ML.isObj(block)) return;
          const ids = ML.toArr(block.symbols)
            .map(String)
            .filter(Boolean);
          for (const id of ids) {
            if (!map.has(id)) map.set(id, []);
            if (map.get(id).indexOf(blockIndex) < 0) map.get(id).push(blockIndex);
          }
        });
        return map;
      },
      [blocks],
    );

    const jumpToBlock = useCallback(
      function (target) {
        setStep(target);
      },
      [setStep],
    );

    useEffect(
      function () {
        if (!selectionAsk) return undefined;
        const onPointerDown = function (event) {
          if (askBoxRef.current && askBoxRef.current.contains(event.target)) return;
          const target = event.target;
          if (target && typeof target.closest === 'function' && target.closest('.stage-select-ask')) return;
          setSelectionAsk(null);
          setAskOpen(false);
        };
        const onKey = function (event) {
          if (event.key === 'Escape') {
            setSelectionAsk(null);
            setAskOpen(false);
          }
        };
        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('keydown', onKey, true);
        return function () {
          document.removeEventListener('mousedown', onPointerDown, true);
          document.removeEventListener('keydown', onKey, true);
        };
      },
      [selectionAsk],
    );

    const onStageMouseUp = function (event) {
      const target = event.target;
      if (target && typeof target.closest === 'function' && target.closest('input,textarea,[contenteditable="true"]')) return;
      let selection = null;
      try {
        selection = window.getSelection();
      } catch (selectionError) {
        return;
      }
      if (!selection || selection.isCollapsed) return;
      const text = String(selection.toString()).replace(/\s+/g, ' ').trim();
      if (text.length < 2 || text.length > 600) return;
      const anchor = selection.anchorNode;
      const element = anchor && anchor.nodeType === 1 ? anchor : anchor && anchor.parentElement;
      const blockElement = element && typeof element.closest === 'function' ? element.closest('[data-stage-block]') : null;
      if (!blockElement) return;
      if (stageRootRef.current && !stageRootRef.current.contains(blockElement)) return;
      let rect = null;
      try {
        rect = selection.getRangeAt(0).getBoundingClientRect();
      } catch (rangeError) {
        return;
      }
      if (!rect || (!rect.width && !rect.height)) return;
      setSelectionAsk({
        text: text,
        blockId: blockElement.getAttribute('data-stage-block'),
        x: rect.left + rect.width / 2,
        y: rect.top,
        bottom: rect.bottom,
      });
      setAskOpen(false);
    };

    const submitSelectionQuestion = function () {
      const question = askText.trim();
      if (!question) {
        showToast(t('stage.ask.empty'), 'warn');
        return;
      }
      if (!selectionAsk) return;
      setAskSaving(true);
      const combined = '「' + selectionAsk.text + '」\n' + question;
      ML.callMath('stage.question', withSession({ blockId: selectionAsk.blockId, text: combined }))
        .then(function () {
          setAskSaving(false);
          let delivered = false;
          try {
            delivered =
              typeof props.onAskQuestion === 'function'
                ? !!props.onAskQuestion(combined)
                : typeof ML.sendToComposer === 'function' && sessionId
                  ? !!ML.sendToComposer(sessionId, combined)
                  : false;
          } catch (sendError) {
            delivered = false;
          }
          ML.copy(combined).then(function (copied) {
            showToast(
              delivered ? t('stage.ask.sent') : copied ? t('stage.ask.saved') : t('stage.ask.savedNoCopy'),
              delivered || copied ? 'success' : 'warn',
            );
          });
          setSelectionAsk(null);
          setAskOpen(false);
          setAskText('');
          load();
        })
        .catch(function (error) {
          setAskSaving(false);
          showToast(ML.errText(error, t), 'error');
        });
    };

    const enableFollow = function () {
      setFollow(true);
      if (stage) {
        const focusRaw = stage.focus !== undefined && stage.focus !== null ? Number(stage.focus) : NaN;
        setIndex(clampIndex(Number.isFinite(focusRaw) ? focusRaw : 0, blocks.length));
      }
    };

    useEffect(
      function () {
        if (!props.active) return undefined;
        const onKeyDown = function (event) {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
          const target = event.target;
          const tag = target && target.tagName ? String(target.tagName).toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) return;

          if (target && typeof target.closest === 'function' && target.closest('.ml-tabs')) return;
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepBy(-1);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepBy(1);
          }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return function () {
          document.removeEventListener('keydown', onKeyDown, true);
        };
      },
      [props.active, stepBy],
    );

    useEffect(
      function () {
        const node = currentRef.current;
        if (!node || typeof node.scrollIntoView !== 'function') return;
        const scrollRoot = embedded && props.scrollRootRef ? props.scrollRootRef.current : null;
        if (scrollRoot) {
          const nodeRect = node.getBoundingClientRect();
          const rootRect = scrollRoot.getBoundingClientRect();
          const delta = nodeRect.top - rootRect.top - 8;
          if (Math.abs(delta) > 4) scrollRoot.scrollTop += delta;
          return;
        }
        try {
          node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } catch (scrollError) {

        }
      },
      [index, view],
    );

    const annotationsByBlock = useMemo(
      function () {
        const map = new Map();
        for (const annotation of ML.toArr(stage && stage.annotations)) {
          if (!ML.isObj(annotation)) continue;
          const key = typeof annotation.blockId === 'string' ? annotation.blockId : '';
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(annotation);
        }
        return map;
      },
      [stage],
    );

    const copyStep = function () {
      const block = blocksRef.current[indexRef.current];
      const text = blockLatex(block);
      if (!text) {
        showToast(t('common.noResult'), 'warn');
        return;
      }
      ML.copy(text).then(function (ok) {
        showToast(ok ? t('stage.copiedStep') : t('common.copyFailed'), ok ? 'success' : 'error');
      });
    };

    const exportMarkdown = function (copyOnly) {
      setExporting(true);
      const fallback = buildStageMarkdown(stage, t);
      ML.callMath('stage.export', withSession({ format: 'markdown' }))
        .then(function (result) {
          const data = ML.isObj(result) ? result : {};
          const markdown = typeof data.markdown === 'string' && data.markdown ? data.markdown : fallback;
          let filename = typeof data.filename === 'string' && data.filename ? data.filename : '';
          if (!filename) filename = 'stage-' + slugify(stage && stage.title) + '.md';
          if (!/\.(md|markdown)$/i.test(filename)) filename += '.md';
          if (copyOnly) {
            return ML.copy(markdown).then(function (ok) {
              showToast(ok ? t('stage.copiedMarkdown') : t('common.copyFailed'), ok ? 'success' : 'error');
            });
          }
          const ok = ML.download(filename, markdown, 'text/markdown;charset=utf-8');
          showToast(ok ? t('stage.exported') : t('common.copyFailed'), ok ? 'success' : 'error');
          return undefined;
        })
        .catch(function (exportError) {

          const filename = 'stage-' + slugify(stage && stage.title) + '.md';
          if (copyOnly) {
            return ML.copy(fallback).then(function (ok) {
              showToast(ok ? t('stage.copiedMarkdown') : t('common.copyFailed'), ok ? 'success' : 'error');
            });
          }
          const ok = ML.download(filename, fallback, 'text/markdown;charset=utf-8');
          showToast(ok ? t('stage.exported') : ML.errText(exportError, t), ok ? 'success' : 'error');
          return undefined;
        })
        .then(function () {
          setExporting(false);
        });
    };

    const statusRaw = stage && typeof stage.status === 'string' ? stage.status.toLowerCase() : '';
    const statusTone = statusRaw === 'final' ? 'success' : statusRaw === 'live' ? 'brand' : 'idle';
    const statusLabel =
      statusRaw === 'live'
        ? String(t('stage.status.live'))
        : statusRaw === 'final'
          ? String(t('stage.status.final'))
          : statusRaw || String(t('stage.status.live'));
    const generalAnnotations = ML.toArr(annotationsByBlock.get(''));

    const header = h(
      'header',
      { className: 'stage-hd' },
      h(
        'div',
        { className: 'stage-hd-main' },
        h(
          'div',
          { className: 'stage-hd-text' },
          h('h2', { className: 'stage-title' }, stage && typeof stage.title === 'string' && stage.title ? stage.title : t('stage.untitled')),
          stage && typeof stage.subtitle === 'string' && stage.subtitle
            ? h('p', { className: 'stage-subtitle' }, stage.subtitle)
            : null,
        ),
        h(
          'div',
          { className: 'stage-pills' },
          stage
            ? h(
                'span',
                { className: 'ml-badge ml-badge-' + statusTone + (statusRaw === 'live' ? ' stage-pill-live' : '') },
                h('span', { className: 'stage-status-dot', 'aria-hidden': true }),
                statusLabel,
              )
            : null,
          doc.revision !== null && doc.revision !== undefined
            ? h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'stage.rev', { n: doc.revision }))
            : null,
          stage ? h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'stage.blocks', { n: blocks.length })) : null,
          h(
            'span',
            { className: 'stage-sync', role: 'status', 'aria-live': 'polite' },
            error ? t('stage.offline') : syncedAt ? t('stage.rev.synced') + ' · ' + fmtTime(syncedAt) : t('common.loading'),
          ),
        ),
      ),
      h(
        'div',
        { className: 'stage-tools' },
        h(
          'div',
          { className: 'stage-nav' },
          h(
            ML.Btn,
            {
              size: 'sm',
              variant: 'subtle',
              onClick: function () {
                setStep(indexRef.current - 1);
              },
              disabled: !blocks.length || index <= 0,
              'aria-label': t('stage.prev'),
            },
            '‹ ' + t('stage.prev'),
          ),
          h('span', { className: 'stage-step-label' }, blocks.length ? ML.fmt(t, 'stage.step', { i: index + 1, n: blocks.length }) : t('common.empty')),
          h(
            ML.Btn,
            {
              size: 'sm',
              variant: 'subtle',
              onClick: function () {
                setStep(indexRef.current + 1);
              },
              disabled: !blocks.length || index >= blocks.length - 1,
              'aria-label': t('stage.next'),
            },
            t('stage.next') + ' ›',
          ),
        ),
        h(
          ML.Btn,
          {
            size: 'sm',
            variant: follow ? 'primary' : 'ghost',
            className: 'stage-follow' + (follow ? ' is-active' : ''),
            'aria-pressed': follow,
            onClick: function () {
              if (follow) setFollow(false);
              else enableFollow();
            },
          },
          follow ? t('stage.follow') : t('stage.free'),
        ),
        h(ML.Tabs, {
          items: [
            { id: 'blocks', label: t('stage.view.blocks') },
            { id: 'trace', label: t('stage.view.trace') },
          ],
          value: view,
          onChange: setView,
          ariaLabel: t('stage.view.label'),
          size: 'sm',
        }),
        h('span', { className: 'stage-spacer' }),
        h(ML.Btn, { size: 'sm', onClick: copyStep, disabled: !blocks.length }, t('stage.copyStep')),
        h(
          ML.Btn,
          { size: 'sm', onClick: function () { exportMarkdown(true); }, disabled: exporting },
          t('stage.copyMarkdown'),
        ),
        h(ML.Btn, { size: 'sm', variant: 'primary', onClick: function () { exportMarkdown(false); }, disabled: exporting }, exporting ? t('stage.exporting') : t('stage.export')),
        h(ML.Btn, { size: 'sm', onClick: load }, t('stage.refresh')),
      ),
    );

    const stepStrip =
      view === 'blocks' && stage
        ? h(StepStrip, {
            count: blocks.length,
            index: index,
            t: t,
            label: t('stage.title'),
            onJump: function (target) {
              setStep(target);
            },
          })
        : null;

    let body;
    if (view === 'trace') {
      body = h(TraceView, { trace: doc.trace, t: t, loading: loading, onRefresh: load, onToast: showToast });
    } else if (!hasLoaded) {
      body = loading
        ? h(ML.Loading, { label: t('stage.loading') })
        : error
          ? h(ML.ErrorBox, { error: error, onRetry: load, title: t('stage.error.title'), extra: t('stage.retryHint') })
          : h(ML.Loading, { label: t('stage.loading') });
    } else if (!stage) {
      body = h(StageEmpty, { t: t, trace: doc.trace });
    } else {
      body = h(
        'div',
        { className: 'stage-blocks' },
        error ? h(ML.Banner, { tone: 'warn' }, t('stage.offline')) : null,
        blocks.length === 0
          ? h(StageEmpty, { t: t, trace: doc.trace })
          : blocks.map(function (block, blockIndex) {
              const blockId = blockIdOf(block, blockIndex);
              return h(BlockView, {
                key: blockId,
                block: block,
                blockId: blockId,
                index: blockIndex,
                current: blockIndex === index,
                innerRef: blockIndex === index ? currentRef : undefined,
                annotations: annotationsByBlock.get(blockId) || [],
                sessionId: sessionId,
                symbolUsage: symbolUsage,
                activeSymbol: activeSymbol,
                onSymbolClick: setActiveSymbol,
                onJumpToIndex: jumpToBlock,
                t: t,
                onJump: function (target) {
                  setStep(target);
                },
                onChanged: load,
              });
            }),
        ML.isObj(stage.takeaway) ? h(TakeawayCard, { takeaway: stage.takeaway, t: t }) : null,
        generalAnnotations.length
          ? h(
              'div',
              { className: 'stage-general-notes' },
              h('div', { className: 'stage-caption' }, t('stage.annotation.general')),
              generalAnnotations.map(function (annotation, annotationIndex) {
                const item = ML.isObj(annotation) ? annotation : { note: annotation };
                const text = item.note !== undefined && item.note !== null ? String(item.note) : ML.safeString(item);
                return h(
                  'div',
                  { key: String(item.id || annotationIndex), className: 'stage-annot-item' },
                  h('span', { className: 'stage-annot-mark', 'aria-hidden': true }, '✎'),
                  h('span', { className: 'stage-annot-text' }, text),
                  item.at ? h('time', { className: 'stage-annot-time' }, fmtTime(item.at)) : null,
                );
              }),
            )
          : null,
        h(QuestionBox, {
          stage: stage,
          t: t,
          blockId: currentBlockId,
          currentIndex: index,
          sessionId: sessionId,
          onToast: showToast,
          onChanged: load,
        }),
      );
    }

    const toastNode = toast
      ? h(
          ML.Banner,
          { tone: toast.tone === 'error' ? 'error' : toast.tone === 'warn' ? 'warn' : 'success', className: 'stage-toast' },
          toast.message,
        )
      : null;
    const symbolNode = activeSymbol
      ? h(
          'div',
          { className: 'stage-symbol-focus' },
          h(
            'span',
            { className: 'stage-symbol-focus-label' },
            ML.fmt(t, 'stage.symbol.focusBanner', {
              symbol: activeSymbol,
              steps: (symbolUsage.get(activeSymbol) || [])
                .map(function (i) {
                  return '第 ' + (i + 1) + ' 步';
                })
                .join('、'),
            }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'stage-symbol-focus-clear',
              onClick: function () {
                setActiveSymbol(null);
              },
            },
            t('stage.symbol.clearFocus'),
          ),
        )
      : null;
    const zoomBar =
      pinned && view === 'blocks'
        ? h(
            'div',
            { className: 'stage-zoomctl', role: 'group', 'aria-label': t('stage.zoom.label') },
            h('button', { type: 'button', className: 'stage-zoom-btn', onClick: function () { changeZoom(-0.1); }, title: t('stage.zoom.out') }, 'A−'),
            h('span', { className: 'stage-zoom-val' }, Math.round(zoom * 100) + '%'),
            h('button', { type: 'button', className: 'stage-zoom-btn', onClick: function () { changeZoom(0.1); }, title: t('stage.zoom.in') }, 'A+'),
            h('button', { type: 'button', className: 'stage-zoom-btn', onClick: function () { setZoom(1); try { ML.storage.set('stage.zoom', '1'); } catch (storageError) { /* best effort */ } }, title: t('stage.zoom.reset') }, '⟲'),
          )
        : null;
    const top = pinned
      ? h('div', { className: 'stage-pin' }, header, toastNode, symbolNode, stepStrip, zoomBar)
      : h(React.Fragment, null, header, toastNode, symbolNode, stepStrip);

    const askLeft = selectionAsk && typeof window !== 'undefined'
      ? Math.max(12, Math.min(selectionAsk.x - 170, window.innerWidth - 350))
      : 0;
    const askTop = selectionAsk && typeof window !== 'undefined'
      ? Math.max(12, Math.min(selectionAsk.bottom + 8, window.innerHeight - 280))
      : 0;

    return h(
      'div',
      {
        className: 'stage-root' + (embedded ? ' stage-root-embedded' : '') + (pinned ? ' stage-root-pinned' : ''),
        role: 'region',
        'aria-label': t('stage.title'),
        ref: stageRootRef,
        onMouseUp: onStageMouseUp,
      },
      top,
      h(
        'div',
        { className: 'stage-zoom-body' + (pinned ? ' is-pinned' : ''), style: pinned ? { zoom: zoom } : null },
        body,
      ),
      selectionAsk && !askOpen
        ? h(
            'button',
            {
              type: 'button',
              className: 'stage-select-ask',
              style: {
                left: Math.round(Math.max(12, Math.min(selectionAsk.x - 40, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 120))) + 'px',
                top: Math.round(Math.max(8, selectionAsk.y - 42)) + 'px',
              },
              onMouseDown: function (event) {
                event.preventDefault();
                event.stopPropagation();
              },
              onClick: function () {
                setAskOpen(true);
              },
            },
            t('stage.ask.selection'),
          )
        : null,
      selectionAsk && askOpen
        ? h(
            'div',
            {
              className: 'stage-ask-pop',
              ref: askBoxRef,
              style: { left: Math.round(askLeft) + 'px', top: Math.round(askTop) + 'px' },
              role: 'dialog',
              'aria-label': t('stage.ask.title'),
            },
            h('div', { className: 'stage-ask-quote' }, '「' + selectionAsk.text + '」'),
            h('textarea', {
              className: 'stage-ask-input',
              value: askText,
              placeholder: t('stage.ask.placeholder'),
              rows: 3,
              onChange: function (event) {
                setAskText(event.target.value);
              },
              onKeyDown: function (event) {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submitSelectionQuestion();
              },
            }),
            h(
              'div',
              { className: 'stage-ask-actions' },
              h(
                ML.Btn,
                { size: 'sm', variant: 'primary', onClick: submitSelectionQuestion, disabled: askSaving },
                askSaving ? t('common.loading') : t('stage.ask.submit'),
              ),
              h(
                ML.Btn,
                {
                  size: 'sm',
                  variant: 'ghost',
                  onClick: function () {
                    setAskOpen(false);
                    setSelectionAsk(null);
                  },
                },
                t('stage.ask.cancel'),
              ),
            ),
          )
        : null,
    );
  }

  ML.CSS += `
  .stage-dock { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 12px; margin: 0 0 8px; overflow: hidden; }
  .stage-dock-bar { display: flex; align-items: center; gap: 8px; padding: 7px 10px; min-height: 34px; }
  .stage-dock-badge { flex: none; font-size: 11px; font-weight: 700; letter-spacing: .04em; color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent); border-radius: 999px; padding: 2px 8px; }
  .stage-dock-title { flex: 1 1 auto; min-width: 0; text-align: left; background: none; border: 0; padding: 0; margin: 0; color: inherit; font: inherit; font-weight: 600; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stage-dock-title:hover { text-decoration: underline; }
  .stage-dock-meta { flex: none; font-size: 12px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
  .stage-dock-body { border-top: 1px solid var(--dsw-alias-border-l1); max-height: min(62vh, 720px); overflow: auto; padding: 10px; background: var(--dsw-alias-bg-layer-1); }
  .stage-root-embedded { padding: 0; }
  .stage-root-embedded .stage-hd { padding: 4px 0 8px; }
  .stage-root-embedded .stage-hd-text { display: none; }
  .stage-surface-switch { display: inline-flex; flex: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; overflow: hidden; }
  .stage-surface-btn { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 2px 8px; font-size: 11px; line-height: 18px; cursor: pointer; }
  .stage-surface-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
  .stage-surface-btn.is-active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }
  .stage-native-host { height: 100%; min-height: 0; overflow: auto; box-sizing: border-box; padding: 8px 10px 16px; background: var(--dsw-alias-bg-base); }
  .stage-root-pinned { gap: 0; }
  .stage-pin { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; gap: 6px; padding: 2px 0 6px; margin-bottom: 8px; background: var(--dsw-alias-bg-base); border-bottom: 1px solid var(--dsw-alias-border-l1); }
  .stage-root-pinned .stage-block { scroll-margin-top: 190px; }
  .stage-zoomctl { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .stage-zoom-btn { appearance: none; cursor: pointer; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 6px; min-width: 26px; height: 22px; padding: 0 6px; font-size: 11px; line-height: 1; }
  .stage-zoom-btn:hover { background: var(--dsw-alias-bg-layer-1); }
  .stage-zoom-val { min-width: 38px; text-align: center; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
  .stage-prefs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 10px; margin-bottom: 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font-size: 12px; }
  .stage-prefs-title { font-weight: 600; color: var(--dsw-alias-label-primary); }
  .stage-prefs-hint { color: var(--dsw-alias-label-secondary); font-size: 11px; }
  .stage-pref { appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); border-radius: 999px; padding: 2px 8px 2px 4px; font-size: 11px; line-height: 18px; }
  .stage-pref-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--dsw-alias-border-l1); transition: background .12s ease; }
  .stage-pref.is-on { color: var(--dsw-alias-label-primary); }
  .stage-pref.is-on .stage-pref-dot { background: var(--dsw-alias-brand-primary); }
  .stage-native-tab-title { display: inline-flex; align-items: center; gap: 5px; }
  .stage-select-ask {
    position: fixed; z-index: 90; appearance: none; cursor: pointer;
    padding: 6px 10px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
    font-size: 12px; font-weight: 600; box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
  }
  .stage-select-ask:hover { background: var(--dsw-alias-bg-layer-2); }
  .stage-ask-pop {
    position: fixed; z-index: 91; width: 320px; max-width: calc(100vw - 24px);
    padding: 10px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1); box-shadow: 0 16px 44px rgba(0, 0, 0, .24);
    display: flex; flex-direction: column; gap: 8px;
  }
  .stage-ask-quote { font-size: 12px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 8px; padding: 6px 8px; max-height: 92px; overflow: auto; }
  .stage-ask-input { width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: inherit; padding: 6px 8px; font: inherit; font-size: 13px; }
  .stage-ask-actions { display: flex; justify-content: flex-end; gap: 6px; }
  .stage-symbol-focus { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); font-size: 12px; }
  .stage-symbol-focus-label { flex: 1 1 auto; color: var(--dsw-alias-label-secondary); }
  .stage-symbol-focus-clear { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); cursor: pointer; font-size: 12px; }
  .stage-block.is-symbol-focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, transparent); border-radius: 10px; }
  .stage-chip.is-active { border-color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); }
  .stage-sym-graph { margin-top: 8px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 8px; }
  .stage-sym-graph-line { stroke: var(--dsw-alias-border-l1); stroke-width: 1; opacity: .65; }
  .stage-sym-graph-line.is-active { stroke: var(--dsw-alias-brand-primary); stroke-width: 1.6; opacity: 1; }
  .stage-sym-graph-dot { fill: var(--dsw-alias-label-secondary); }
  .stage-sym-graph-dot.is-active { fill: var(--dsw-alias-brand-primary); }
  .stage-sym-graph-label { fill: var(--dsw-alias-label-primary); font-size: 11px; cursor: pointer; }
  .stage-sym-graph-label.is-active { fill: var(--dsw-alias-brand-primary); font-weight: 600; }
  .stage-sym-graph-step { fill: var(--dsw-alias-brand-primary); font-size: 10px; cursor: pointer; }
  `;

  function StageDock(props) {
    const t = ML.useT();
    const prefs = ML.useStagePrefs();
    const sessionId = typeof props.sessionId === 'string' && props.sessionId !== '' ? props.sessionId : undefined;
    const [doc, setDoc] = useState({ stage: null, revision: null });
    const [surface, setSurface] = useState(function () {
      try {
        const stored = ML.storage.get('stage.surface', 'right');
        return stored === 'inline' || stored === 'off' ? stored : 'right';
      } catch (storageError) {
        return 'right';
      }
    });
    const aliveRef = useRef(true);
    const bodyRef = useRef(null);
    const lastStageIdRef = useRef(null);

    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);

    useEffect(
      function () {
        if (!sessionId) return undefined;
        let alive = true;
        let timer = null;
        const tick = function () {
          if (!alive) return;
          ML.callMath('stage.get', { sessionId: sessionId })
            .then(function (payload) {
              if (!alive) return;
              const normalized = normalizeStagePayload(payload);
              setDoc({ stage: normalized.stage, revision: normalized.revision });
            })
            .catch(function () {

            })
            .then(function () {
              if (alive) timer = setTimeout(tick, 2000);
            });
        };
        tick();
        return function () {
          alive = false;
          clearTimeout(timer);
        };
      },
      [sessionId],
    );

    useStageStream(sessionId, function () {
      if (!sessionId) return;
      ML.callMath('stage.get', { sessionId: sessionId })
        .then(function (payload) {
          if (!aliveRef.current) return;
          const normalized = normalizeStagePayload(payload);
          setDoc({ stage: normalized.stage, revision: normalized.revision });
        })
        .catch(function () {

        });
    });

    const stage = doc.stage;
    const blocks = ML.toArr(stage && stage.blocks);
    const stageId = stage && typeof stage.id === 'string' ? stage.id : null;

    const applySurface = function (next) {
      if (next === 'right' && !prefs.right) return;
      setSurface(next);
      try {
        ML.storage.set('stage.surface', next);
      } catch (storageError) {

      }
      if (next === 'right') {
        if (typeof ML.openStageRight !== 'function' || !ML.openStageRight()) {
          setSurface('inline');
          try {
            ML.storage.set('stage.surface', 'inline');
          } catch (storageError) {

          }
        }
      } else if (typeof ML.collapseStageRight === 'function') {
        ML.collapseStageRight();
      }
    };

    useEffect(
      function () {
        if (!prefs.right && surface === 'right') {
          setSurface('inline');
          try {
            ML.storage.set('stage.surface', 'inline');
          } catch (storageError) {

          }
        }
      },
      [prefs.right, surface],
    );

    useEffect(
      function () {
        if (!stageId) {
          lastStageIdRef.current = null;
          return;
        }
        if (stageId !== lastStageIdRef.current) {
          lastStageIdRef.current = stageId;
          if (prefs.right && surface === 'right' && stage.autoShow !== false && typeof ML.openStageRight === 'function') ML.openStageRight();
        }
      },
      [stageId, surface, stage, prefs.right],
    );

    useEffect(
      function () {
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
      },
      [stageId],
    );

    if (!prefs.inline) return null;
    if (!stage || blocks.length === 0) return null;
    const revision = doc.revision !== null ? doc.revision : stage.revision;
    const focus = Number.isFinite(Number(stage.focus)) ? Math.max(0, Math.min(Number(stage.focus), blocks.length - 1)) : 0;
    const inlineOpen = surface === 'inline';
    const surfaces = [['inline', t('stage.surface.inline')], ['off', t('stage.surface.off')]];
    if (prefs.right) surfaces.unshift(['right', t('stage.surface.right')]);
    return h(
      'div',
      { className: 'stage-dock' + (inlineOpen ? ' is-open' : ''), 'data-mathlab-stage-dock': '' },
      h(
        'div',
        { className: 'stage-dock-bar' },
        h('span', { className: 'stage-dock-badge' }, t('stage.title')),
        h(
          'button',
          {
            type: 'button',
            className: 'stage-dock-title',
            onClick: function () {
              applySurface('right');
            },
            title: t('stage.right.open'),
          },
          stage.title || t('stage.untitled'),
        ),
        h('span', { className: 'stage-dock-meta' }, ML.fmt(t, 'stage.dockMeta', { current: focus + 1, total: blocks.length, revision: revision })),
        h(
          'div',
          { className: 'stage-surface-switch', role: 'group', 'aria-label': t('stage.surface.label') },
          surfaces.map(function (item) {
            return h(
              'button',
              {
                key: item[0],
                type: 'button',
                className: 'stage-surface-btn' + (surface === item[0] ? ' is-active' : ''),
                'aria-pressed': surface === item[0] ? 'true' : 'false',
                onClick: function () {
                  applySurface(item[0]);
                },
              },
              item[1],
            );
          }),
        ),
      ),
      inlineOpen
        ? h(
            'div',
            { className: 'stage-dock-body', ref: bodyRef },
            h(StageTab, { sessionId: sessionId, embedded: true, pinned: true, active: true, scrollRootRef: bodyRef }),
          )
        : null,
    );
  }

  function StagePrefsBar(props) {
    const t = tr(props.t);
    const prefs = ML.useStagePrefs();
    const toggle = function (key, label) {
      const on = !!prefs[key];
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': on ? 'true' : 'false',
          className: 'stage-pref' + (on ? ' is-on' : ''),
          onClick: function () {
            ML.stagePrefs.set(key, !on);
          },
        },
        h('span', { className: 'stage-pref-dot', 'aria-hidden': true }),
        h('span', null, label),
      );
    };
    return h(
      'div',
      { className: 'stage-prefs' },
      h('span', { className: 'stage-prefs-title' }, t('stage.prefs.title')),
      toggle('inline', t('stage.prefs.inline')),
      toggle('right', t('stage.prefs.right')),
      h('span', { className: 'stage-prefs-hint' }, t('stage.prefs.hint')),
    );
  }

  ML.StageTabWithPrefs = function (props) {
    return h(React.Fragment, null, h(StagePrefsBar, { t: props.t }), h(StageTab, props));
  };

  ML.assignStrings(
    {
      'stage.untitled': '（未命名讲解）',
      'stage.dockMeta': '第 {current}/{total} 步 · rev {revision}',
      'stage.surface.label': '讲解显示位置',
      'stage.surface.right': '右侧',
      'stage.surface.inline': '内嵌',
      'stage.surface.off': '关闭',
      'stage.right.open': '在右侧打开讲解',
      'stage.native.title': '讲解',
      'stage.native.desc': 'MathLab 讲解舞台：判断、证明、符号连接与交互图像',
      'stage.symbol.focusHint': '点击高亮使用该符号的步骤（双击复制）',
      'stage.symbol.focusBanner': '符号 {symbol} 出现在 {steps}；已高亮相关判断。',
      'stage.symbol.clearFocus': '取消高亮',
      'stage.symbols.graph': '符号—步骤连接图',
      'stage.ask.selection': '划词提问',
      'stage.ask.title': '针对选中文字提问',
      'stage.ask.placeholder': '关于这段话，你想问什么？',
      'stage.ask.submit': '记录并发送到对话',
      'stage.ask.cancel': '取消',
      'stage.ask.empty': '请先输入问题',
      'stage.ask.sent': '已记录问题，并放入对话输入框',
      'stage.ask.saved': '已记录问题并复制；粘贴到对话即可发送',
      'stage.ask.savedNoCopy': '已记录问题；复制失败，请手动输入到对话',
      'stage.zoom.label': '内容缩放',
      'stage.zoom.in': '放大',
      'stage.zoom.out': '缩小',
      'stage.zoom.reset': '重置缩放',
      'stage.prefs.title': '插件选项 · 讲解舞台',
      'stage.prefs.inline': '下侧栏',
      'stage.prefs.right': '右侧栏',
      'stage.prefs.hint': '可独立开关；关掉一侧不影响另一侧',
    },
    {
      'stage.untitled': '(untitled stage)',
      'stage.dockMeta': 'step {current}/{total} · rev {revision}',
      'stage.surface.label': 'Stage placement',
      'stage.surface.right': 'Right',
      'stage.surface.inline': 'Inline',
      'stage.surface.off': 'Off',
      'stage.right.open': 'Open the stage in the right sidebar',
      'stage.native.title': 'Stage',
      'stage.native.desc': 'MathLab Live Stage: judgments, proofs, symbol links and interactive figures',
      'stage.symbol.focusHint': 'Click to highlight the steps using this symbol (double-click copies)',
      'stage.symbol.focusBanner': 'Symbol {symbol} appears in {steps}; related judgments are highlighted.',
      'stage.symbol.clearFocus': 'Clear highlight',
      'stage.symbols.graph': 'Symbol–step connection graph',
      'stage.ask.selection': 'Ask about selection',
      'stage.ask.title': 'Ask about the selected text',
      'stage.ask.placeholder': 'What would you like to ask about this passage?',
      'stage.ask.submit': 'Record & send to chat',
      'stage.ask.cancel': 'Cancel',
      'stage.ask.empty': 'Type a question first',
      'stage.ask.sent': 'Question recorded and placed in the chat composer',
      'stage.ask.saved': 'Question recorded and copied — paste it into the chat',
      'stage.ask.savedNoCopy': 'Question recorded; copy failed, type it in the chat',
      'stage.zoom.label': 'Content zoom',
      'stage.zoom.in': 'Zoom in',
      'stage.zoom.out': 'Zoom out',
      'stage.zoom.reset': 'Reset zoom',
      'stage.prefs.title': 'Plugin options · Stage',
      'stage.prefs.inline': 'Bottom dock',
      'stage.prefs.right': 'Right sidebar',
      'stage.prefs.hint': 'Independent toggles; turning one off leaves the other',
    },
  );

  ML.StageDock = StageDock;
  ML.StageTab = StageTab;
  ML.tabs.stage = { id: 'stage', order: 5, Component: StageTab };
})();

(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;

  const RIGHT_KIND = 'mathlab-stage';
  const PREF_INLINE = 'stage.pref.inline';
  const PREF_RIGHT = 'stage.pref.right';

  ML.nativeStage = { right: null, tabs: null, ready: false, dispose: null, enabled: false };

  const prefListeners = new Set();

  function readPrefs() {
    const read = function (key) {
      try {
        return ML.storage.get(key, '1') !== '0';
      } catch (error) {
        return true;
      }
    };
    return { inline: read(PREF_INLINE), right: read(PREF_RIGHT) };
  }

  ML.stagePrefs = {
    get: readPrefs,
    set: function (key, value) {
      try {
        ML.storage.set(key === 'inline' ? PREF_INLINE : PREF_RIGHT, value ? '1' : '0');
      } catch (error) {

      }
      const snapshot = readPrefs();
      for (const listener of prefListeners) {
        try {
          listener(snapshot);
        } catch (error) {

        }
      }
      if (ML.host && typeof ML.host.syncRight === 'function') ML.host.syncRight();
    },
    subscribe: function (listener) {
      prefListeners.add(listener);
      return function () {
        prefListeners.delete(listener);
      };
    },
  };

  ML.useStagePrefs = function () {
    const [prefs, setPrefs] = useState(ML.stagePrefs.get());
    useEffect(function () {
      const unsubscribe = ML.stagePrefs.subscribe(setPrefs);
      setPrefs(ML.stagePrefs.get());
      return unsubscribe;
    }, []);
    return prefs;
  };

  ML.sendToComposer = function (sessionId, text) {
    try {
      const ctx = ML.host.ctx;
      if (!ctx) return false;
      const sessions = typeof ctx.get === 'function' ? ctx.get('sessions') : null;
      const conversation = typeof ctx.get === 'function' ? ctx.get('conversation') : null;
      if (!sessions || typeof sessions.scope !== 'function' || !conversation || !conversation.input) return false;
      const scope = sessions.scope(sessionId);
      if (!scope || typeof conversation.input.for !== 'function') return false;
      const input = conversation.input.for(scope);
      if (!input || typeof input.setDraft !== 'function' || !input.state) return false;
      const snapshot = input.state.getSnapshot();
      const draft = snapshot && typeof snapshot.draft === 'string' ? snapshot.draft : '';
      input.setDraft((draft.trim() ? draft + (/\s$/.test(draft) ? '' : ' ') : '') + String(text));
      return true;
    } catch (error) {
      return false;
    }
  };

  function NativeStagePanel(props) {
    const t = ML.useT();
    return h(
      'div',
      { className: 'stage-native-host' },
      h(ML.StageTab, {
        sessionId: props.sessionId,
        embedded: true,
        pinned: true,
        active: true,
        t: t,
        onAskQuestion: function (text) {
          return ML.sendToComposer(props.sessionId, text);
        },
      }),
    );
  }

  function installNow() {
    if (ML.nativeStage.dispose || !ML.nativeStage.seat) return false;
    const seat = ML.nativeStage.seat;
    const disposers = [];
    const own = function (disposer) {
      if (typeof disposer === 'function') disposers.push(disposer);
    };
    let dispose = null;
    try {
      own(
        seat.tabs.register({
          id: RIGHT_KIND,
          kind: RIGHT_KIND,
          title: () => seat.t('stage.native.title'),
          guide: [
            {
              order: 12,
              title: () => seat.t('stage.native.title'),
              description: () => seat.t('stage.native.desc'),
              icon: ML.Icon,
            },
          ],
        }),
      );
      own(
        seat.slots.inject('sidebar.right.pane.tab', () =>
          seat.slots.register({ name: 'sidebar.right.pane.tab', key: RIGHT_KIND }, (props) => h(NativeStagePanel, props)),
        ),
      );
      own(
        seat.slots.inject('sidebar.right.pane.tab.title', () =>
          seat.slots.register({ name: 'sidebar.right.pane.tab.title', key: RIGHT_KIND }, () =>
            h('span', { className: 'stage-native-tab-title' }, h(ML.Icon, { size: 14 }), seat.t('stage.native.title')),
          ),
        ),
      );
      dispose = function () {
        for (const disposer of disposers) {
          try {
            disposer();
          } catch (error) {

          }
        }
        ML.nativeStage.right = null;
        ML.nativeStage.enabled = false;
      };
      ML.nativeStage.dispose = dispose;
      ML.nativeStage.right = seat.right || null;
      ML.nativeStage.enabled = true;
      return true;
    } catch (error) {
      for (const disposer of disposers) {
        try {
          disposer();
        } catch (disposeError) {

        }
      }
      ML.nativeStage.right = null;
      ML.nativeStage.enabled = false;
      return false;
    }
  }

  function removeNow() {
    if (typeof ML.nativeStage.dispose === 'function') {
      try {
        ML.nativeStage.dispose();
      } catch (error) {

      }
    }
    ML.nativeStage.dispose = null;
    ML.nativeStage.right = null;
    ML.nativeStage.enabled = false;
  }

  ML.openStageRight = function () {
    if (!ML.stagePrefs.get().right) return false;
    if (!ML.nativeStage.enabled && !installNow() && !ML.nativeStage.enabled) return false;
    try {
      const right = ML.nativeStage.right;
      if (!right || typeof right.openTab !== 'function') return false;
      right.openTab(RIGHT_KIND);
      if (typeof right.isExpanded === 'function' && !right.isExpanded() && typeof right.toggleExpanded === 'function') {
        right.toggleExpanded();
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  ML.collapseStageRight = function () {
    try {
      const right = ML.nativeStage.right;
      if (!right) return false;
      let rows = [];
      try {
        rows = right.openTabs && typeof right.openTabs.getSnapshot === 'function' ? right.openTabs.getSnapshot() : [];
      } catch (error) {
        rows = [];
      }
      const ours = Array.isArray(rows) ? rows.find((row) => row && row.kind === RIGHT_KIND) : null;
      if (typeof right.closeTab === 'function' && ours) {
        right.closeTab(ours.tabId || ours.id);
        return true;
      }
      const active = typeof right.active === 'function' ? right.active() : null;
      const isOurs = !!(active && active.kind === RIGHT_KIND);
      if (!isOurs) return false;
      if (typeof right.isExpanded === 'function' && right.isExpanded() && typeof right.toggleExpanded === 'function') {
        right.toggleExpanded();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  ML.host = {
    ctx: null,
    syncRight: function () {
      if (!ML.nativeStage.ready) return;
      if (ML.stagePrefs.get().right) installNow();
      else removeNow();
    },
    install: function (ctx, t) {
      ML.host.ctx = ctx;
      ctx.inject(['slots', 'sidebarRightTabs', 'sidebarRight'], (injected) => {
        const tabs = injected.sidebarRightTabs;
        if (!tabs || typeof tabs.register !== 'function') {
          ML.nativeStage.ready = false;
          return undefined;
        }
        ML.nativeStage.ready = true;
        ML.nativeStage.seat = { tabs: tabs, right: injected.sidebarRight || null, slots: injected.slots, t: t };
        if (ML.stagePrefs.get().right) installNow();
        return function () {
          removeNow();
          ML.nativeStage.ready = false;
          ML.nativeStage.seat = null;
        };
      });
    },
  };
})();

(function () {
  'use strict';

  ML.makeT = function (ctx) {
    const resolveId = function () {
      try {
        const locale = ctx && ctx.locale && typeof ctx.locale.getLocale === 'function' ? ctx.locale.getLocale() : null;
        if (!locale) return 'zh';
        if (typeof locale === 'string') return locale;
        return locale.id || 'zh';
      } catch (error) {
        return 'zh';
      }
    };
    return function (key) {
      const id = resolveId();
      const dict = ML.DICT[id] || ML.DICT.zh;
      if (dict && dict[key] !== undefined) return dict[key];
      if (ML.DICT.zh[key] !== undefined) return ML.DICT.zh[key];
      return key;
    };
  };

  ML.Icon = function Icon(props) {
    const size = props && props.size ? props.size : 20;
    return h(
      'svg',
      { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
      h('rect', { x: 1.5, y: 1.5, width: 21, height: 21, rx: 6, fill: 'currentColor', opacity: 0.14 }),
      h('path', {
        d: 'M9 6.5c0-1.4 1.6-1.8 2.1-.5.4 1 .2 8.2.5 9.6.2 1 1.4.9 1.7-.1',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }),
      h('path', {
        d: 'M14.5 9.5 19 15M19 9.5 14.5 15',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }),
    );
  };

  ML.EngineStatus = function EngineStatus(props) {
    const t = ML.useT();
    const engine = props.engine;
    const info = engine.info || {};
    const status = engine.status === 'loading' ? 'starting' : engine.status || 'idle';
    const lean = info.lean || {};
    let leanText = t('engine.leanUnknown');
    if (lean.available) leanText = lean.version ? ML.fmt(t, 'engine.leanOnWith', { v: lean.version }) : t('engine.leanOn');
    else if (status === 'ready') leanText = t('engine.leanOff');
    const python = info.python ? ML.fmt(t, 'engine.python', { v: info.python }) : '';
    const errorText = engine.error ? ML.errInfo(engine.error).message : '';
    return h(
      'div',
      { className: 'ml-engine' },
      h(
        'span',
        {
          className: 'ml-pill',
          'data-status': status,
          role: 'status',
          'aria-live': 'polite',
          title: errorText || undefined,
        },
        h('span', { className: 'ml-pill-dot', 'aria-hidden': true }),
        ML.engineLabel(engine, t),
        engine.attempts > 0 && (status === 'starting' || status === 'down')
          ? h('span', { className: 'ml-muted' }, ' · ' + engine.attempts)
          : null,
      ),
      python ? h('span', { className: 'ml-pill', title: info.sympy ? 'SymPy ' + info.sympy : undefined }, python) : null,
      status === 'ready'
        ? h('span', { className: 'ml-pill', 'data-status': lean.available ? 'ready' : 'idle' }, leanText)
        : null,
      status === 'down' || status === 'starting'
        ? h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: engine.refresh }, t('engine.retry'))
        : null,
    );
  };

  ML.AboutFooter = function AboutFooter(props) {
    const t = ML.useT();
    const engine = props.engine;
    const info = engine.info || {};
    const version = info.pluginVersion || info.version || info.plugin || '0.1.0';
    const engineVersion = info.pluginVersion && info.version && info.version !== info.pluginVersion ? ' · engine ' + info.version : '';
    const pieces = [];
    if (info.python) pieces.push('Python ' + info.python);
    if (info.sympy) pieces.push('SymPy ' + info.sympy);
    if (info.lean && info.lean.available && info.lean.version) pieces.push('Lean ' + info.lean.version);
    return h(
      'footer',
      { className: 'ml-about' },
      h('span', null, 'MathLab ' + t('footer.version') + ' ' + version + engineVersion),
      h('span', null, t('footer.attribution')),
      pieces.length ? h('span', null, pieces.join(' · ')) : null,
      h('span', null, t('footer.note')),
    );
  };

  const readInitialTab = function () {
    try {
      const stored = ML.storage.get('ui.tab', null);
      if (typeof stored === 'string' && ML.tabs[stored]) return stored;
    } catch (error) {

    }
    const keys = Object.keys(ML.tabs);
    return keys.length ? keys[0] : 'compute';
  };

  ML.Panel = function Panel(props) {
    const t = typeof props.t === 'function' ? props.t : ML.fallbackT();
    const engine = ML.useEngine();
    const tabs = React.useMemo(function () {
      return Object.keys(ML.tabs)
        .map(function (id) {
          return ML.tabs[id];
        })
        .sort(function (a, b) {
          return a.order - b.order;
        });
    }, []);
    const [active, setActive] = React.useState(function () {
      const initial = readInitialTab();
      return ML.tabs[initial] ? initial : tabs.length ? tabs[0].id : 'compute';
    });
    const [openAction, setOpenAction] = React.useState(null);
    const openSeq = React.useRef(0);
    const lastUserTab = React.useRef(Date.now());

    React.useEffect(
      function () {
        const offOpen = ML.bus.on('open', function (payload) {
          if (!payload || !payload.panel || !ML.tabs[payload.panel]) return;
          openSeq.current += 1;
          setOpenAction({
            seq: openSeq.current,
            panel: payload.panel,
            op: payload.op,
            args: payload.args,
            title: payload.title,
          });
          setActive(payload.panel);
        });
        const offActivate = ML.bus.on('activate', function (payload) {
          if (!payload || !payload.tab || !ML.tabs[payload.tab]) return;

          if (payload.force !== true && Date.now() - lastUserTab.current < 1500) return;
          setActive(payload.tab);
        });
        return function () {
          offOpen();
          offActivate();
        };
      },
      [],
    );

    React.useEffect(
      function () {
        ML.storage.set('ui.tab', active);
      },
      [active],
    );

    const changeTab = function (id) {
      lastUserTab.current = Date.now();
      if (ML.tabs[id]) setActive(id);
    };

    const tabItems = tabs.map(function (tab) {
      return { id: tab.id, label: t('tab.' + tab.id) };
    });

    return h(
      ML.I18nContext.Provider,
      { value: t },
      h(
        'section',
        {
          className: 'ml-panel',
          'data-mathlab-root': '',
          'aria-label': t('panel'),
        },
        h(
          'div',
          { className: 'ml-inner' },
          h(
            'header',
            { className: 'ml-header' },
            h(
              'div',
              { className: 'ml-header-row' },
              h(
                'div',
                { className: 'ml-brand' },
                h('div', { className: 'ml-mark' }, h(ML.Icon, { size: 22 })),
                h(
                  'div',
                  { className: 'ml-hd-text' },
                  h('h1', { className: 'ml-title' }, t('title')),
                  h('p', { className: 'ml-sub' }, t('subtitle')),
                ),
              ),
              h(ML.EngineStatus, { engine: engine }),
            ),
          ),
          h(ML.Tabs, {
            items: tabItems,
            value: active,
            onChange: changeTab,
            ariaLabel: t('a11y.tablist'),
            idPrefix: 'ml-main',
            className: 'ml-main-tabs',
          }),
          h(
            'div',
            { className: 'ml-tab-panels' },
            tabs.map(function (tab) {
              const isActive = active === tab.id;
              return h(
                'div',
                {
                  key: tab.id,
                  id: 'ml-main-panel-' + tab.id,
                  role: 'tabpanel',
                  'aria-labelledby': 'ml-main-tab-' + tab.id,
                  className: 'ml-tabpanel',
                  hidden: !isActive,
                },
                h(
                  ML.Boundary,
                  null,
                  h(tab.id === 'stage' && ML.StageTabWithPrefs ? ML.StageTabWithPrefs : tab.Component, {
                    active: isActive,
                    openAction: openAction && openAction.panel === tab.id ? openAction : null,
                    engine: engine,
                    t: t,
                  }),
                ),
              );
            }),
          ),
          h(ML.AboutFooter, { engine: engine }),
        ),
      ),
    );
  };

  ML.plugin = {
    inject: ['slots', 'locale'],
    apply(ctx) {
      ML.installStyles(ctx);
      ctx.effect(() => ctx.locale.register(ML.NS, { zh: ML.DICT.zh, en: ML.DICT.en }), 'mathlab: locale');
      const t = ML.makeT(ctx);
      try {
        ML.host.install(ctx, t);
      } catch (error) {

      }
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'mathlab', locale: ML.NS }, (props) =>
          h(ML.Panel, Object.assign({}, props, { t: props.t ?? t })),
        ),
      );
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'mathlab',
            order: 30,
            label: () => t('panel'),
          },
          ML.Icon,
        ),
      );

      ctx.slots.inject('conversation.input.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.dock',
            id: 'mathlab-stage-dock',
            order: 35,
            locale: ML.NS,
          },
          (props) => h(ML.StageDock, props),
        ),
      );
    },
  };
})();
    return ML.plugin;
  },
});
