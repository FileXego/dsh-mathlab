/* 52-tab-algebra — permutations, finite groups (with Hasse/Cayley), finite fields, Z/nZ. */
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

  /* ------------------------------------------------------------- helpers */

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

  /* Local replacement for ML.useCall in nested components (hook must come from React). */
  function useCallSafe() {
    return ML.useCall();
  }

  /* ---------------------------------------------------------- container */

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
