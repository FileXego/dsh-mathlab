/* 53-tab-category — finite-category editor, commutative diagram renderer, functor and
 * natural-transformation checks, diagram commutativity, and limits in Set. */
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

  /* ------------------------------------------------------------ editor */

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

  /* ----------------------------------------------------------- functors */

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

  /* ------------------------------------------------------ diagram verify */

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

  /* ------------------------------------------------------------- limits */

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

  /* ------------------------------------------------------------ container */

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
