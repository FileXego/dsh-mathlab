/* 54-tab-logic — propositional / first-order / modal logic: parse, truth tables,
 * natural-deduction proofs (Fitch + tree), bounded FOL validity, resolution, modal checks. */
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
          /* ignore */
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
          /* The engine returns the whole proof under `proof` plus flat `fitch`
           * lines and `nodes`; pass the full result so both renderers see them. */
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
