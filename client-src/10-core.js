/* 10-core — dictionaries, i18n plumbing, tiny utilities and the client event bus.
 * Everything is attached to the shared `ML` object; this module must stay first. */
(function () {
  'use strict';

  ML.DICT.zh = ML.DICT.zh || {};
  ML.DICT.en = ML.DICT.en || {};

  /* ---------- i18n ---------- */

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
      'engine.setupTitle': 'Python 依赖未就绪',
      'engine.setupHint': '复制下面的 pip 命令到终端运行，然后重新连接。',
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
      'engine.setupTitle': 'Python deps missing',
      'engine.setupHint': 'Copy the pip command below into a terminal, then reconnect.',
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

  /** Translate then substitute `{name}` placeholders from `vars`. */
  ML.fmt = function (t, key, vars) {
    let text = String(t(key));
    if (vars) {
      for (const name of Object.keys(vars)) {
        text = text.split('{' + name + '}').join(String(vars[name]));
      }
    }
    return text;
  };

  /** `t`-derived current language; dictionaries carry a `__lang` sentinel. */
  ML.lang = function (t) {
    try {
      return t('__lang') === 'en' ? 'en' : 'zh';
    } catch (error) {
      return 'zh';
    }
  };

  /** Pick the language-appropriate string (zh primary). */
  ML.pick = function (lang, zh, en) {
    if (lang === 'en') return en || zh || '';
    return zh || en || '';
  };

  /** Fallback translator when the slot does not inject one. */
  ML.fallbackT = function () {
    return function (key) {
      return ML.DICT.zh[key] !== undefined ? ML.DICT.zh[key] : key;
    };
  };

  /* ---------- generic helpers ---------- */

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

  /** Format a number compactly for axes/readouts. */
  ML.fmtNum = function (value, digits) {
    if (typeof value === 'string') return value;
    if (!Number.isFinite(value)) return String(value);
    const abs = Math.abs(value);
    const d = digits === undefined ? 6 : digits;
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-4)) return value.toExponential(Math.min(d, 4));
    const rounded = Number(value.toPrecision(d));
    return String(rounded);
  };

  /** Tolerant error projection: {code, message}. */
  ML.errInfo = function (error) {
    if (!error) return { code: 'internal', message: 'unknown error' };
    const code = typeof error.code === 'string' && error.code ? error.code : 'internal';
    const message = typeof error.message === 'string' && error.message ? error.message : String(error);
    return { code: code, message: message };
  };

  /** Localized one-line description for an error object. */
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

  /* ---------- storage (small UI preferences only) ---------- */

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
        /* storage may be unavailable or full — preferences are best-effort */
      }
    },
    remove: function (key) {
      try {
        window.localStorage.removeItem('mathlab.' + key);
      } catch (error) {
        /* ignore */
      }
    },
  };

  /* ---------- tiny event bus (panel <-> example gallery <-> symbol keyboard) ---------- */

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

  /* ---------- clipboard / download (user-initiated only) ---------- */

  ML.copy = async function (text) {
    const value = String(text === undefined || text === null ? '' : text);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (error) {
      /* fall through to execCommand */
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

  /** Insert text into the focused input/textarea inside the MathLab panel.
   *  Falls back to copying when no suitable field is focused. */
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
        /* some input types do not support selection ranges */
      }
      active.focus();
      return true;
    } catch (error) {
      return false;
    }
  };

  /* ---------- parsers shared by several tabs ---------- */

  /**
   * Parse a matrix from text: JSON (`[[1,2],[3,4]]`), CSV/TSV rows, or whitespace rows.
   * Cells stay strings so the engine can parse expressions.
   * @returns {{matrix: string[][], error: string|null}}
   */
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

  /** Split a textarea into trimmed non-empty lines. */
  ML.lines = function (text) {
    return String(text === undefined || text === null ? '' : text)
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });
  };

  /** Parse comma/space separated numbers or expression strings. */
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

  /** Parse permutation notation: `(1 2 3)(4 5)`, `[[1,2,3],[4,5]]` or
   *  comma/space separated cycles. @returns {{cycles:number[][], error:string|null}} */
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

  /** Parse mapping lines `a -> b` (also `=>`, `→`, `:`); returns [[from,to],...]. */
  ML.parseMappings = function (text) {
    const pairs = [];
    for (const line of ML.lines(text)) {
      const match = line.split(/\s*(?:->|=>|→|:)\s*/);
      if (match.length >= 2 && match[0] && match[1]) pairs.push([match[0].trim(), match[1].trim()]);
    }
    return pairs;
  };

  /* ---------- result-shape helpers ---------- */

  ML.exprLike = function (value) {
    return (
      ML.isObj(value) &&
      (typeof value.latex === 'string' ||
        typeof value.pretty === 'string' ||
        typeof value.result === 'string' ||
        typeof value.result === 'number')
    );
  };

  /** Find the "expression result" inside a response (`{value: {...}}`, direct, ...). */
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

  /** Detect a matrix-valued payload: array of arrays of scalars. */
  ML.matrixLike = function (value) {
    if (!Array.isArray(value) || value.length === 0) return false;
    return value.every(function (row) {
      return Array.isArray(row) && row.every(function (cell) {
        return typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean';
      });
    });
  };

  /** Pretty JSON that never throws (cycles, big values). */
  ML.prettyJSON = function (value, max) {
    try {
      const text = JSON.stringify(value, null, 2);
      return ML.safeString(text, max || 20000);
    } catch (error) {
      return ML.safeString(value);
    }
  };

  /* ---------- engine info normalization ---------- */

  /** Normalize any tolerated meta.info payload into a stable shape. */
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

  /* ---------- tab registry ---------- */

  ML.tabs = {};
  ML.registerTab = function (id, order, zhLabel, enLabel, Component) {
    ML.tabs[id] = {
      id: id,
      order: order,
      Component: Component,
    };
    ML.assignStrings({ ['tab.' + id]: zhLabel }, { ['tab.' + id]: enLabel });
  };

  /** Shared "feature unavailable" hook used by tabs that need a mounted engine. */
  ML.needsEngine = function (status) {
    return status === 'idle' || status === 'starting' || status === 'loading' || status === 'down';
  };
})();
