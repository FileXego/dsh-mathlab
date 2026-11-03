/* 56-tab-topology — simplicial homology, graph fundamental group, metric curvature. */
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
