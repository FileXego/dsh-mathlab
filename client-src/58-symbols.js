/* 58-tab-symbols — searchable bilingual symbol atlas with a notation keyboard. */
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
