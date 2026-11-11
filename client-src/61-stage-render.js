/* 61-stage-render — Live Stage block renderers.
 *
 * Presentational components only: symbols/markdown-lite helpers, block cards,
 * step strip, trace view, question box and BlockView. State and transport live
 * in 60-stage-store / 62-stage-transport; the shell lives in 64-stage-shell. */
(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;
  const useCallback = React.useCallback;
  const tr = ML.stageStore.tr;
  const range2 = ML.stageStore.range2;
  const fmtTime = ML.stageStore.fmtTime;
  const slugify = ML.stageStore.slugify;
  const blockKindOf = ML.stageStore.blockKindOf;
  const fitchLines = ML.stageStore.fitchLines;
  const takeawayMarkdown = ML.stageStore.takeawayMarkdown;

  /* ------------------------------------------------------- symbols (shared) */

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

  /* ------------------------------------------------------- markdown-lite */

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

  /** Safe markdown-lite renderer: paragraphs, `- ` lists, **bold**, `code`, $x$ / $$x$$. */
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

  /* ------------------------------------------------ small shared components */

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
          /* chips still render as plain ids */
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


  /* -------------------------------------------------------- block renderers */

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

  /* Bipartite symbol → step graph: a compact visual index of which judgments cite each symbol. */

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
        ? h(ML.stageExtras.SymbolGraph, {
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
          /* the question was not recorded, but copying it still helps the user */
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


  ML.stageRender = {
    RawBlock: RawBlock,
    BlockTitle: BlockTitle,
    SymbolChips: SymbolChips,
    MarkdownLite: MarkdownLite,
    inlineNodes: inlineNodes,
    HeadingBlock: HeadingBlock,
    ProseBlock: ProseBlock,
    MathBlock: MathBlock,
    JudgmentBlock: JudgmentBlock,
    StrategyBlock: StrategyBlock,
    ProofBlock: ProofBlock,
    DiagramBlock: DiagramBlock,
    PlotBlock: PlotBlock,
    ComputeBlock: ComputeBlock,
    SymbolsBlock: SymbolsBlock,
    LeanBlock: LeanBlock,
    TakeawayBlock: TakeawayBlock,
    NoteBlock: NoteBlock,
    UnknownBlock: UnknownBlock,
    BlockContent: BlockContent,
    BlockView: BlockView,
    StepStrip: StepStrip,
    TraceView: TraceView,
    StageEmpty: StageEmpty,
    QuestionBox: QuestionBox,
  };
})();
