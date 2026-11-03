/* 30-ui — reusable, accessible UI primitives and result renderers. */
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

  /* ---------------- layout & controls ---------------- */

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

  /* ---------------- tabs (accessible, roving tab index) ---------------- */

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

  /* ---------------- data renderers ---------------- */

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

  /** Collapsible raw payload with a copy button. */
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

  /**
   * N×M text-cell matrix editor. `matrix` is string[][]; `onChange(nextMatrix)`.
   */
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

  /** Simple label/value stat tile. */
  ML.Stat = function Stat(props) {
    return h(
      'div',
      { className: 'ml-stat' },
      h('div', { className: 'ml-stat-label' }, props.label),
      h('div', { className: 'ml-stat-value' + (props.mono ? ' ml-mono' : '') }, props.value),
      props.sub ? h('div', { className: 'ml-stat-sub' }, props.sub) : null,
    );
  };

  /** Labeled table used for Cayley tables / finite-field tables / truth tables. */
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

  /* ---------------- expression result card ---------------- */

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

  /** Tolerant renderer for arbitrary API payloads. */
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

  /* ---------------- error boundary ---------------- */

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

  /* ---------------- small helpers used by tab modules ---------------- */

  /** Standard "loading / error / result" envelope around an async call. */
  ML.AsyncState = function AsyncState(props) {
    const call = props.call;
    const t = ML.useT();
    if (call.loading) return h(ML.Loading, null);
    if (call.error) return h(ML.ErrorBox, { error: call.error, onRetry: props.onRetry });
    if (call.result !== null && call.result !== undefined) return props.children;
    if (props.idle) return h(ML.Empty, { label: t('common.noResult') });
    return null;
  };

  /** Localized label for engine status. */
  ML.engineLabel = function (engine, t) {
    const status = engine.status;
    if (status === 'ready') return t('engine.ready');
    if (status === 'down') return t('engine.down');
    if (status === 'idle') return t('engine.idle');
    return t('engine.starting');
  };
})();
