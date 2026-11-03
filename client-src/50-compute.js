/* 50-tab-compute — symbolic workbench: expression editor, op picker, results, history,
 * plus vector calculus and number-theory mini tools. */
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
          /* ignore */
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
            /* calc.vector / calc.number / calc.matrix: show the real result inline. */
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
