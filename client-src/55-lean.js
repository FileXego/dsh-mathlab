/* 55-tab-lean — Lean 4 status, snippet library, code checker and notation cheatsheet. */
(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;

  ML.assignStrings(
    {
      'tab.lean': 'Lean',
      'lean.title': 'Lean 4 工作台',
      'lean.status': '环境状态',
      'lean.available': 'Lean 可用',
      'lean.unavailable': 'Lean 未安装',
      'lean.checking': '正在检测 Lean 环境…',
      'lean.version': '版本',
      'lean.path': '路径',
      'lean.lake': 'lake',
      'lean.note': '说明',
      'lean.installHint': '安装方式：先安装 elan（Lean 版本管理器），再运行 `elan default leanprover/lean4:stable`。插件会自动检测 PATH 中的 lean / lake；Mathlib 项目请配置 lakefile 后使用 `lake env lean`。',
      'lean.retryInfo': '重新检测',
      'lean.editor': '代码检查',
      'lean.code': 'Lean 代码',
      'lean.filename': '虚拟文件名',
      'lean.timeout': '超时（毫秒）',
      'lean.check': '检查',
      'lean.checking2': '正在运行 lean…',
      'lean.ok': '通过',
      'lean.failed': '有错误',
      'lean.diagnostics': '诊断信息',
      'lean.severity': '级别',
      'lean.line': '行',
      'lean.column': '列',
      'lean.message': '信息',
      'lean.stdout': '标准输出',
      'lean.stderr': '标准错误',
      'lean.elapsed': '耗时',
      'lean.leanVersion': 'Lean 版本',
      'lean.noDiagnostics': '没有诊断信息。',
      'lean.snippets': '片段库',
      'lean.searchSnippets': '搜索片段…',
      'lean.level': '级别',
      'lean.all': '全部',
      'lean.beginner': '入门',
      'lean.intermediate': '进阶',
      'lean.advanced': '高级',
      'lean.insert': '插入代码',
      'lean.loadSnippets': '加载片段库',
      'lean.noSnippets': '片段库为空或尚未加载。',
      'lean.imports': '导入',
      'lean.cheatsheet': '符号与 Mathlib 名称',
      'lean.cheatsheetHint': '常用记号在 Lean 4 / Mathlib4 中的写法。',
      'lean.checkFile': '检查文件（只读）',
      'lean.filePath': '绝对路径',
      'lean.checkFileBtn': '检查文件',
      'lean.snippetInserted': '已插入编辑器',
      'lean.engineDown': 'Lean 信息需要 Python 引擎（lean.info）；引擎启动后会自动可用，可手动重试。',
      'lean.fileHint': 'lean.check_file 只读取文件，不会修改。',
    },
    {
      'tab.lean': 'Lean',
      'lean.title': 'Lean 4 workbench',
      'lean.status': 'Environment',
      'lean.available': 'Lean available',
      'lean.unavailable': 'Lean not installed',
      'lean.checking': 'Detecting the Lean toolchain…',
      'lean.version': 'Version',
      'lean.path': 'Path',
      'lean.lake': 'lake',
      'lean.note': 'Note',
      'lean.installHint': 'Install elan (the Lean version manager), then run `elan default leanprover/lean4:stable`. The plugin auto-detects lean / lake on PATH; for Mathlib projects use `lake env lean` inside the project.',
      'lean.retryInfo': 'Re-detect',
      'lean.editor': 'Check code',
      'lean.code': 'Lean code',
      'lean.filename': 'Virtual filename',
      'lean.timeout': 'Timeout (ms)',
      'lean.check': 'Check',
      'lean.checking2': 'Running lean…',
      'lean.ok': 'passed',
      'lean.failed': 'has errors',
      'lean.diagnostics': 'Diagnostics',
      'lean.severity': 'Severity',
      'lean.line': 'Line',
      'lean.column': 'Column',
      'lean.message': 'Message',
      'lean.stdout': 'stdout',
      'lean.stderr': 'stderr',
      'lean.elapsed': 'elapsed',
      'lean.leanVersion': 'Lean version',
      'lean.noDiagnostics': 'No diagnostics.',
      'lean.snippets': 'Snippet library',
      'lean.searchSnippets': 'Search snippets…',
      'lean.level': 'Level',
      'lean.all': 'all',
      'lean.beginner': 'beginner',
      'lean.intermediate': 'intermediate',
      'lean.advanced': 'advanced',
      'lean.insert': 'Insert code',
      'lean.loadSnippets': 'Load snippets',
      'lean.noSnippets': 'The snippet library is empty or not loaded yet.',
      'lean.imports': 'imports',
      'lean.cheatsheet': 'Notation and Mathlib names',
      'lean.cheatsheetHint': 'How common notation is written in Lean 4 / Mathlib4.',
      'lean.checkFile': 'Check a file (read-only)',
      'lean.filePath': 'Absolute path',
      'lean.checkFileBtn': 'Check file',
      'lean.snippetInserted': 'Inserted into the editor',
      'lean.engineDown': 'Lean info comes from the Python engine (lean.info); it becomes available once the engine is up — retry manually if needed.',
      'lean.fileHint': 'lean.check_file only reads the file; it is never modified.',
    },
  );

  const CHEATSHEET = [
    ['∀', 'forall', '∀ x, P x'],
    ['∃', 'exists', '∃ x, P x'],
    ['λ', 'fun', 'fun x => x + 1'],
    ['→', '→', 'P → Q'],
    ['↔', '↔', 'P ↔ Q'],
    ['∧', 'And', 'P ∧ Q'],
    ['∨', 'Or', 'P ∨ Q'],
    ['¬', 'Not', '¬ P'],
    ['≠', 'Ne', 'a ≠ b'],
    ['≤', 'le', 'a ≤ b'],
    ['⊢', '⊢', 'goal separator'],
    ['⊤', 'True', 'True'],
    ['⊥', 'False', 'False'],
    ['⋃', 'Set.iUnion', '⋃ i, s i'],
    ['⋂', 'Set.iInter', '⋂ i, s i'],
    ['∘', 'Function.comp', 'f ∘ g'],
    ['∑', 'Finset.sum', '∑ i in s, f i'],
    ['∏', 'Finset.prod', '∏ i in s, f i'],
    ['∫', 'MeasureTheory.integral', '∫ x, f x'],
    ['∂', 'deriv', 'deriv f x'],
    ['lim', 'Filter.Tendsto', 'Filter.Tendsto f l l\''],
    ['ℕ', 'Nat', 'Nat'],
    ['ℤ', 'Int', 'Int'],
    ['ℚ', 'Rat', 'Rat'],
    ['ℝ', 'Real', 'Real'],
    ['ℂ', 'Complex', 'Complex'],
    ['⋃/⋂', 'Set.union / Set.inter', 's ∪ t'],
  ];

  const LEVELS = ['beginner', 'intermediate', 'advanced'];

  function snippetImports(snippet) {
    return ML.toArr(snippet && snippet.imports);
  }

  function snippetCode(snippet) {
    const imports = snippetImports(snippet);
    const code = String((snippet && snippet.code) || '');
    if (imports.length === 0) return code;
    return imports.map(function (name) { return 'import ' + name; }).join('\n') + '\n\n' + code;
  }

  ML.tabs.lean = {
    id: 'lean',
    order: 60,
    Component: function LeanTab(props) {
      const t = ML.useT();
      const [info, setInfo] = useState(null);
      const [infoError, setInfoError] = useState(null);
      const [infoLoading, setInfoLoading] = useState(false);
      const [snippets, setSnippets] = useState([]);
      const [snippetsLoading, setSnippetsLoading] = useState(false);
      const [snippetsError, setSnippetsError] = useState(null);
      const [query, setQuery] = useState('');
      const [level, setLevel] = useState('all');
      const [code, setCode] = useState(
        'import Mathlib\n\n-- 在 MathLab 中检查 Lean 4 代码（无需 lake 项目时仅基础环境可用）\nexample (P Q : Prop) : P → Q → P := by\n  intro hP hQ\n  exact hP\n',
      );
      const [filename, setFilename] = useState('MathLab.lean');
      const [timeoutMs, setTimeoutMs] = useState('15000');
      const [filePath, setFilePath] = useState('');
      const [checkCall, setCheckCall] = useState(null);
      const started = useRef(false);
      const checkRequest = useRef(null);

      const loadInfo = async function () {
        setInfoLoading(true);
        setInfoError(null);
        try {
          const result = await ML.callMath('lean.info', {});
          setInfo(result || {});
        } catch (error) {
          setInfoError(error);
          setInfo(null);
        } finally {
          setInfoLoading(false);
        }
      };

      const loadSnippets = async function () {
        setSnippetsLoading(true);
        setSnippetsError(null);
        try {
          const result = await ML.callMath('lean.snippets', {});
          setSnippets(ML.toArr(result && result.snippets));
        } catch (error) {
          setSnippetsError(error);
        } finally {
          setSnippetsLoading(false);
        }
      };

      useEffect(
        function () {
          if (!props.active || started.current) return;
          started.current = true;
          loadInfo();
          loadSnippets();
        },
        [props.active],
      );

      useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          const opName = String(action.op || '');
          if (opName === 'lean.snippets' || opName === 'lean.get_snippet') {
            if (started.current) loadSnippets();
            else {
              started.current = true;
              loadInfo();
              loadSnippets();
            }
            const targetId = action.args && action.args.id;
            if (targetId) {
              const apply = function () {
                const found = snippets.filter(function (snippet) { return String(snippet.id) === String(targetId); })[0];
                if (found) setCode(snippetCode(found));
              };
              if (snippets.length > 0) apply();
              else ML.callMath('lean.snippets', {}).then(function (result) {
                const list = ML.toArr(result && result.snippets);
                setSnippets(list);
                const found = list.filter(function (snippet) { return String(snippet.id) === String(targetId); })[0];
                if (found) setCode(snippetCode(found));
              }).catch(function () {});
            }
            return;
          }
          if (opName === 'lean.check' && action.args) {
            setCode(String(action.args.code || code));
            runCheck(action.args);
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const runCheck = async function (argsOverride) {
        const args = argsOverride || {
          code: code,
          filename: filename || 'MathLab.lean',
          timeoutMs: parseInt(timeoutMs, 10) || 15000,
        };
        checkRequest.current = args;
        setCheckCall({ loading: true, error: null, result: null });
        try {
          const result = await ML.callMath('lean.check', args);
          setCheckCall({ loading: false, error: null, result: result });
        } catch (error) {
          setCheckCall({ loading: false, error: error, result: null });
        }
      };

      const runCheckFile = async function () {
        if (!String(filePath).trim()) return;
        const args = { path: String(filePath).trim(), timeoutMs: parseInt(timeoutMs, 10) || 15000 };
        checkRequest.current = args;
        setCheckCall({ loading: true, error: null, result: null });
        try {
          const result = await ML.callMath('lean.check_file', args);
          setCheckCall({ loading: false, error: null, result: result });
        } catch (error) {
          setCheckCall({ loading: false, error: error, result: null });
        }
      };

      const filteredSnippets = useMemo(function () {
        const needle = String(query || '').trim().toLowerCase();
        return snippets.filter(function (snippet) {
          if (level !== 'all' && String(snippet.level) !== level) return false;
          if (!needle) return true;
          const haystack = [
            snippet.title,
            snippet.title_zh,
            snippet.code,
            snippet.explanation,
            snippet.explanation_zh,
            ML.toArr(snippet.imports).join(' '),
            ML.toArr(snippet.tags).join(' '),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.indexOf(needle) >= 0;
        });
      }, [snippets, query, level]);

      const lang = ML.lang(t);
      const check = checkCall || { loading: false, error: null, result: null };
      const result = check.result || null;
      const diagnostics = ML.toArr(result && result.diagnostics);
      const available = !!(info && info.available);

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('lean.cheatsheetHint') }, t('lean.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('lean.status')),
            h(
              'div',
              { className: 'ml-card-actions' },
              available ? h(ML.Badge, { tone: 'success' }, t('lean.available')) : infoLoading ? h(ML.Badge, { tone: 'warn' }, t('lean.checking')) : h(ML.Badge, { tone: 'idle' }, t('lean.unavailable')),
              h(ML.Btn, { size: 'sm', onClick: loadInfo, disabled: infoLoading }, t('lean.retryInfo')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            infoLoading ? h(ML.Loading, { label: t('lean.checking') }) : null,
            infoError
              ? h(ML.ErrorBox, { error: infoError, onRetry: loadInfo, extra: t('lean.engineDown') })
              : null,
            info
              ? h(
                  'div',
                  { className: 'ml-stack-sm' },
                  h(ML.KV, {
                    rows: [
                      info.version ? { label: t('lean.version'), value: String(info.version), mono: true } : null,
                      info.path ? { label: t('lean.path'), value: String(info.path), mono: true } : null,
                      info.lake !== undefined && info.lake !== null ? { label: t('lean.lake'), value: ML.safeString(info.lake), mono: true } : null,
                      info.note ? { label: t('lean.note'), value: String(info.note) } : null,
                    ].filter(Boolean),
                  }),
                  available
                    ? null
                    : h(ML.Banner, { tone: 'warn' }, t('lean.installHint')),
                )
              : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('lean.editor')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', variant: 'ghost', onClick: function () { ML.copy(code); } }, t('common.copy')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h(ML.Field, {
              label: t('lean.code'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  rows: 12,
                  value: code,
                  className: 'ml-mono',
                  spellCheck: false,
                  onChange: function (event) { setCode(event.target.value); },
                }),
            }),
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('lean.filename'),
                children: (id) => h(ML.Input, { id: id, value: filename, onChange: function (event) { setFilename(event.target.value); } }),
              }),
              h(ML.Field, {
                label: t('lean.timeout'),
                children: (id) => h(ML.Input, { id: id, value: timeoutMs, inputMode: 'numeric', onChange: function (event) { setTimeoutMs(event.target.value); } }),
              }),
            ),
            h(
              'div',
              { className: 'ml-row' },
              h(ML.Btn, { variant: 'primary', onClick: function () { runCheck(); }, disabled: check.loading }, check.loading ? t('lean.checking2') : t('lean.check')),
              result && result.ok !== undefined
                ? h(ML.Badge, { tone: result.ok ? 'success' : 'error' }, result.ok ? t('lean.ok') : t('lean.failed'))
                : null,
              result && result.elapsedMs !== undefined ? h('span', { className: 'ml-hint' }, result.elapsedMs + ' ms') : null,
              result && result.leanVersion ? h('span', { className: 'ml-hint' }, result.leanVersion) : null,
            ),
            check.error ? h(ML.ErrorBox, { error: check.error, onRetry: function () { if (checkRequest.current) ML.callMath('lean.check', checkRequest.current).then(function (r) { setCheckCall({ loading: false, error: null, result: r }); }).catch(function (e) { setCheckCall({ loading: false, error: e, result: null }); }); } }) : null,
            check.loading ? h(ML.Loading, { label: t('lean.checking2') }) : null,
            result
              ? h(
                  'div',
                  { className: 'ml-stack' },
                  h(ML.SectionTitle, null, t('lean.diagnostics')),
                  diagnostics.length === 0
                    ? h(ML.Banner, { tone: result.ok ? 'success' : 'warn' }, t('lean.noDiagnostics'))
                    : h(ML.LabeledTable, {
                        rowLabels: diagnostics.map(function (diagnostic, index) { return String(index + 1); }),
                        colLabels: [t('lean.severity'), t('lean.line'), t('lean.column'), t('lean.message')],
                        cells: diagnostics.map(function (diagnostic) {
                          return [
                            String(diagnostic.severity || 'info'),
                            diagnostic.line === undefined ? '' : String(diagnostic.line),
                            diagnostic.column === undefined ? '' : String(diagnostic.column),
                            ML.safeString(diagnostic.message, 800),
                          ];
                        }),
                        cellClass: function (cell, rowIndex) {
                          const diagnostic = diagnostics[rowIndex];
                          if (!diagnostic) return undefined;
                          if (String(diagnostic.severity).toLowerCase() === 'error') return 'ml-tt-f';
                          if (String(diagnostic.severity).toLowerCase() === 'warning') return 'ml-tt-result';
                          return undefined;
                        },
                      }),
                  result.stdout ? h(ML.Collapse, { title: t('lean.stdout') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stdout))) : null,
                  result.stderr ? h(ML.Collapse, { title: t('lean.stderr') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stderr))) : null,
                  h(ML.RawJSON, { value: result }),
                )
              : null,
            h(
              ML.Collapse,
              { title: t('lean.checkFile') },
              h(ML.Field, {
                label: t('lean.filePath'),
                hint: t('lean.fileHint'),
                children: (id) => h(ML.Input, { id: id, value: filePath, className: 'ml-mono', placeholder: 'D:/project/MathLab.lean', onChange: function (event) { setFilePath(event.target.value); } }),
              }),
              h(
                'div',
                { className: 'ml-toolbar' },
                h(ML.Btn, { onClick: runCheckFile, disabled: !String(filePath).trim() }, t('lean.checkFileBtn')),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('lean.snippets')),
            h(
              'div',
              { className: 'ml-card-actions' },
              h(ML.Btn, { size: 'sm', onClick: loadSnippets, disabled: snippetsLoading }, snippetsLoading ? t('common.loading') : t('lean.loadSnippets')),
            ),
          ),
          h(
            'div',
            { className: 'ml-card-bd ml-stack' },
            h(
              'div',
              { className: 'ml-form-grid' },
              h(ML.Field, {
                label: t('lean.searchSnippets'),
                children: (id) =>
                  h(ML.Input, { id: id, value: query, onChange: function (event) { setQuery(event.target.value); } }),
              }),
              h(ML.Field, {
                label: t('lean.level'),
                children: (id) =>
                  h(ML.Select, {
                    id: id,
                    value: level,
                    onChange: function (event) { setLevel(event.target.value); },
                    options: [{ value: 'all', label: t('lean.all') }].concat(
                      LEVELS.map(function (name) {
                        return { value: name, label: t('lean.' + name) };
                      }),
                    ),
                  }),
              }),
            ),
            snippetsLoading ? h(ML.Loading, null) : null,
            snippetsError ? h(ML.ErrorBox, { error: snippetsError, onRetry: loadSnippets }) : null,
            !snippetsLoading && !snippetsError && snippets.length === 0 ? h(ML.Empty, { label: t('lean.noSnippets') }) : null,
            filteredSnippets.length
              ? h(
                  'div',
                  { className: 'ml-stack' },
                  filteredSnippets.map(function (snippet) {
                    return h(
                      'div',
                      { key: snippet.id, className: 'ml-card' },
                      h(
                        'div',
                        { className: 'ml-card-hd' },
                        h('h2', { className: 'ml-card-title' }, ML.pick(lang, snippet.title_zh, snippet.title)),
                        h(ML.Badge, { tone: 'brand' }, String(snippet.level || '')),
                        h(
                          'div',
                          { className: 'ml-card-actions' },
                          h(
                            ML.Btn,
                            {
                              size: 'sm',
                              onClick: function () {
                                setCode(snippetCode(snippet));
                              },
                            },
                            t('lean.insert'),
                          ),
                        ),
                      ),
                      h(
                        'div',
                        { className: 'ml-card-bd ml-stack-sm' },
                        h('pre', { className: 'ml-pre' }, ML.safeString(snippet.code, 1800)),
                        h(ML.KV, {
                          rows: [
                            snippetImports(snippet).length
                              ? { label: t('lean.imports'), value: snippetImports(snippet).join(', '), mono: true }
                              : null,
                          ].filter(Boolean),
                        }),
                        h('div', { className: 'ml-hint' }, ML.pick(lang, snippet.explanation_zh, snippet.explanation)),
                      ),
                    );
                  }),
                )
              : snippets.length > 0
                ? h(ML.Empty, { label: t('common.empty') })
                : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h('div', { className: 'ml-card-hd' }, h('h2', { className: 'ml-card-title' }, t('lean.cheatsheet'))),
          h(
            'div',
            { className: 'ml-card-bd' },
            h(ML.LabeledTable, {
              rowLabels: CHEATSHEET.map(function (row) { return row[0]; }),
              colLabels: [t('logic.palette'), 'Lean / Mathlib', 'usage'],
              cells: CHEATSHEET.map(function (row) {
                return [row[0], row[1], row[2]];
              }),
              className: 'ml-cheat',
            }),
          ),
        ),
      );
    },
  };
})();
