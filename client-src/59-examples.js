/* 59-tab-examples — worked-example gallery that opens the owning tab with prefilled action. */
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
