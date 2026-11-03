/* 51-tab-linalg — matrix editor and linear-algebra operations. */
(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useEffect = React.useEffect;

  ML.assignStrings(
    {
      'tab.linalg': '线代',
      'linalg.title': '线性代数',
      'linalg.hint': '矩阵元素可以是数字或 SymPy 表达式。',
      'linalg.matrix': '矩阵 A',
      'linalg.rhs': '右端向量 b',
      'linalg.op': '运算',
      'linalg.paste': '从文本导入',
      'linalg.pasteHint': '支持 CSV / TSV / 空格分隔行，或 JSON 数组。',
      'linalg.import': '导入',
      'linalg.random': '随机整数',
      'linalg.identity': '单位矩阵',
      'linalg.zeros': '零矩阵',
      'linalg.squareWarn': '该运算需要方阵。',
      'linalg.rhsWarn': 'solve/lstsq 需要长度等于行数的右端向量。',
      'linalg.rankNote': 'rank(A) ≤ min(m, n)；nullity = n − rank。',
      'linalg.detNote': 'det(A) ≠ 0 说明 A 可逆。',
      'linalg.basis': '零空间基',
      'linalg.dimension': '维数',
      'linalg.eigenvalues': '特征值',
      'linalg.eigenvectors': '特征向量（按列）',
      'linalg.singular': '奇异值',
      'linalg.result': '结果',
      'linalg.copyMatrix': '复制矩阵',
      'linalg.invalidMatrix': '矩阵解析失败：',
      'linalg.emptyMatrix': '请先输入矩阵。',
      'linalg.dims': '维数',
      'linalg.op.det': '行列式 det',
      'linalg.op.inv': '逆矩阵 inv',
      'linalg.op.rank': '秩 rank',
      'linalg.op.rref': '行最简形 rref',
      'linalg.op.eigen': '特征分解 eigen',
      'linalg.op.charpoly': '特征多项式 charpoly',
      'linalg.op.nullspace': '零空间 nullspace',
      'linalg.op.solve': '求解 Ax=b',
      'linalg.op.lstsq': '最小二乘 lstsq',
      'linalg.op.svd': '奇异值分解 SVD',
      'linalg.op.transpose': '转置 transpose',
      'linalg.matrixU': 'U',
      'linalg.matrixS': 'Σ',
      'linalg.matrixV': 'V',
    },
    {
      'tab.linalg': 'Linear',
      'linalg.title': 'Linear algebra',
      'linalg.hint': 'Entries may be numbers or SymPy expressions.',
      'linalg.matrix': 'Matrix A',
      'linalg.rhs': 'Right-hand side b',
      'linalg.op': 'Operation',
      'linalg.paste': 'Import from text',
      'linalg.pasteHint': 'CSV / TSV / whitespace rows, or a JSON array.',
      'linalg.import': 'Import',
      'linalg.random': 'Random integers',
      'linalg.identity': 'Identity',
      'linalg.zeros': 'Zeros',
      'linalg.squareWarn': 'This operation needs a square matrix.',
      'linalg.rhsWarn': 'solve/lstsq need a right-hand side with one entry per row.',
      'linalg.rankNote': 'rank(A) ≤ min(m, n); nullity = n − rank.',
      'linalg.detNote': 'det(A) ≠ 0 implies A is invertible.',
      'linalg.basis': 'Null-space basis',
      'linalg.dimension': 'Dimension',
      'linalg.eigenvalues': 'Eigenvalues',
      'linalg.eigenvectors': 'Eigenvectors (columns)',
      'linalg.singular': 'Singular values',
      'linalg.result': 'Result',
      'linalg.copyMatrix': 'Copy matrix',
      'linalg.invalidMatrix': 'Could not parse the matrix: ',
      'linalg.emptyMatrix': 'Enter a matrix first.',
      'linalg.dims': 'dimensions',
      'linalg.op.det': 'Determinant',
      'linalg.op.inv': 'Inverse',
      'linalg.op.rank': 'Rank',
      'linalg.op.rref': 'Reduced row echelon form',
      'linalg.op.eigen': 'Eigen decomposition',
      'linalg.op.charpoly': 'Characteristic polynomial',
      'linalg.op.nullspace': 'Null space',
      'linalg.op.solve': 'Solve Ax = b',
      'linalg.op.lstsq': 'Least squares',
      'linalg.op.svd': 'SVD',
      'linalg.op.transpose': 'Transpose',
      'linalg.matrixU': 'U',
      'linalg.matrixS': 'Σ',
      'linalg.matrixV': 'V',
    },
  );

  const OPS = ['det', 'inv', 'rank', 'rref', 'eigen', 'charpoly', 'nullspace', 'solve', 'lstsq', 'svd', 'transpose'];
  const MATRIX_FIELDS = ['matrix', 'inverse', 'transpose', 'rref', 'basis', 'nullspace', 'result', 'value', 'solution', 'x'];

  const INITIAL_MATRIX = [
    ['1', '2', '3'],
    ['0', '1', '4'],
    ['5', '6', '0'],
  ];

  function randomMatrix(rows, cols) {
    return Array.from({ length: rows }, function () {
      return Array.from({ length: cols }, function () {
        return String(Math.floor(Math.random() * 19) - 9);
      });
    });
  }

  function identityMatrix(size) {
    return Array.from({ length: size }, function (row) {
      return Array.from({ length: size }, function (column) {
        return row === column ? '1' : '0';
      });
    });
  }

  function exprListToMath(values) {
    return ML.toArr(values).map(function (value) {
      if (ML.isObj(value)) return ML.exprLatex(value);
      return ML.safeString(value, 200);
    });
  }

  function findMatrix(data) {
    if (!ML.isObj(data)) return null;
    for (const key of MATRIX_FIELDS) {
      if (ML.matrixLike(data[key])) return { key: key, matrix: data[key] };
    }
    return null;
  }

  function MatrixResult(props) {
    const t = ML.useT();
    const data = props.data || {};
    const op = props.op;
    const fields = [];

    if (op === 'det') {
      const expr = ML.pickExpr(data);
      return expr
        ? h(ML.ExprResult, { data: expr })
        : h(ML.DataView, { data: data });
    }

    if (op === 'rank') {
      const rank = data.rank !== undefined ? data.rank : data.value;
      return h(
        'div',
        { className: 'ml-stack-sm' },
        h(ML.Stat, { label: 'rank(A)', value: ML.safeString(rank), sub: t('linalg.rankNote') }),
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    if (op === 'charpoly') {
      const expr = ML.pickExpr(data);
      if (expr) return h(ML.ExprResult, { data: expr });
      if (typeof data.poly === 'string' || typeof data.latex === 'string') {
        return h(
          'div',
          { className: 'ml-stack-sm' },
          h(ML.FormulaBlock, { tex: data.latex || data.poly }),
          h(ML.RawJSON, { value: data }),
        );
      }
      return h(ML.DataView, { data: data });
    }

    if (op === 'eigen') {
      const values = ML.toArr(data.values).map(function (value) {
        return ML.isObj(value) ? ML.exprLatex(value) : ML.safeString(value, 200);
      });
      const vectors = data.vectors;
      return h(
        'div',
        { className: 'ml-stack' },
        h(
          'div',
          null,
          h(ML.SectionTitle, null, t('linalg.eigenvalues')),
          h(
            'div',
            { className: 'ml-row' },
            values.length
              ? values.map(function (latex, index) {
                  return h(
                    'span',
                    { key: index, className: 'ml-badge ml-badge-brand' },
                    h(ML.Math, { tex: latex }),
                  );
                })
              : h(ML.Empty, null),
          ),
        ),
        vectors
          ? h(
              'div',
              null,
              h(ML.SectionTitle, null, t('linalg.eigenvectors')),
              h(ML.MatrixView, { matrix: vectors }),
            )
          : null,
        data.pretty ? h(ML.Collapse, { title: 'pretty' }, h('pre', { className: 'ml-pre' }, data.pretty)) : null,
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    if (op === 'svd') {
      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.MatrixView, { matrix: data.U, label: t('linalg.matrixU') }),
        Array.isArray(data.S) && !ML.matrixLike(data.S)
          ? h(
              'div',
              null,
              h(ML.SectionTitle, null, t('linalg.matrixS')),
              h(
                'div',
                { className: 'ml-row' },
                exprListToMath(data.S).map(function (latex, index) {
                  return h(ML.Math, { key: index, tex: latex });
                }),
              ),
            )
          : h(ML.MatrixView, { matrix: data.S, label: t('linalg.matrixS') }),
        h(ML.MatrixView, { matrix: data.V, label: t('linalg.matrixV') }),
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    if (op === 'nullspace') {
      const basis = data.basis !== undefined ? data.basis : findMatrix(data) ? findMatrix(data).matrix : null;
      const dimension = data.dimension !== undefined ? data.dimension : Array.isArray(basis) ? basis.length : null;
      return h(
        'div',
        { className: 'ml-stack' },
        basis ? h(ML.MatrixView, { matrix: basis, label: t('linalg.basis') }) : h(ML.Empty, null),
        h(ML.KV, {
          rows: [dimension !== null ? { label: t('linalg.dimension'), value: String(dimension) } : null].filter(Boolean),
        }),
        h(ML.Notes, { notes: data.notes }),
        h(ML.RawJSON, { value: data }),
      );
    }

    const found = findMatrix(data);
    if (found) {
      fields.push(
        h(
          'div',
          { key: 'matrix' },
          h(ML.SectionTitle, null, t('linalg.matrix')),
          h(ML.MatrixView, { matrix: found.matrix }),
          h(
            'div',
            { className: 'ml-row', style: { marginTop: 6 } },
            h(ML.CopyBtn, { text: ML.matrixText(found.matrix), label: t('linalg.copyMatrix') }),
          ),
        ),
      );
    }
    if (Array.isArray(data.solution) && !ML.matrixLike(data.solution)) {
      fields.push(
        h(
          'div',
          { key: 'sol' },
          h(ML.SectionTitle, null, t('common.result')),
          h(
            'div',
            { className: 'ml-row' },
            exprListToMath(data.solution).map(function (latex, index) {
              return h(ML.Math, { key: index, tex: latex });
            }),
          ),
        ),
      );
    }
    if (fields.length === 0) return h(ML.DataView, { data: data });
    return h('div', { className: 'ml-stack' }, fields, h(ML.Notes, { notes: data.notes }), h(ML.RawJSON, { value: data }));
  }

  ML.tabs.linalg = {
    id: 'linalg',
    order: 20,
    Component: function LinalgTab(props) {
      const t = ML.useT();
      const [matrix, setMatrix] = useState(INITIAL_MATRIX);
      const [rhs, setRhs] = useState(['1', '2', '3']);
      const [op, setOp] = useState('det');
      const [importText, setImportText] = useState('');
      const [importError, setImportError] = useState(null);
      const [localWarning, setLocalWarning] = useState(null);
      const call = ML.useCall();
      const inputRef = useRef(null);

      const rows = matrix.length;
      const cols = rows ? matrix[0].length : 0;
      const square = rows === cols;
      const needsRhs = op === 'solve' || op === 'lstsq';
      const needsSquare = op === 'det' || op === 'inv' || op === 'eigen' || op === 'charpoly';

      useEffect(
        function () {
          if (needsSquare && !square) setLocalWarning(t('linalg.squareWarn'));
          else if (needsRhs && rhs.length !== rows) setLocalWarning(t('linalg.rhsWarn'));
          else setLocalWarning(null);
        },
        [needsSquare, needsRhs, square, rows, rhs.length, t],
      );

      const run = function () {
        if (rows === 0 || cols === 0) {
          setLocalWarning(t('linalg.emptyMatrix'));
          return;
        }
        const args = { op: op, matrix: matrix };
        if (needsRhs) {
          const values = [];
          for (let index = 0; index < rows; index += 1) values.push(rhs[index] === undefined ? '0' : rhs[index]);
          args.rhs = values;
          setRhs(values);
        }
        setLocalWarning(null);
        call.run('calc.matrix', args);
      };

      const doImport = function () {
        const parsed = ML.parseMatrix(importText);
        if (parsed.error) {
          setImportError(parsed.error);
          return;
        }
        setImportError(null);
        setMatrix(parsed.matrix);
        setRhs(parsed.matrix.map(function () { return '0'; }));
        setImportText('');
      };

      const updateRhs = function (index, value) {
        setRhs(function (previous) {
          const next = previous.slice();
          while (next.length < rows) next.push('0');
          next[index] = value;
          return next.slice(0, Math.max(rows, 1));
        });
      };

      React.useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          if (action.op !== 'calc.matrix') return;
          const args = action.args || {};
          if (ML.matrixLike(args.matrix)) {
            setMatrix(args.matrix.map(function (row) {
              return row.map(function (cell) { return ML.safeString(cell, 200); });
            }));
          }
          if (Array.isArray(args.rhs)) {
            setRhs(args.rhs.map(function (cell) { return ML.safeString(cell, 200); }));
          }
          if (OPS.indexOf(args.op) >= 0) setOp(args.op);
          call.run('calc.matrix', args);
        },
        [props.openAction && props.openAction.seq],
      );

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('linalg.hint') }, t('linalg.title')),
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
                label: t('linalg.op'),
                children: (id) =>
                  h(ML.Select, {
                    id: id,
                    value: op,
                    onChange: function (event) {
                      setOp(event.target.value);
                    },
                    options: OPS.map(function (name) {
                      return { value: name, label: t('linalg.op.' + name) };
                    }),
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { alignItems: 'flex-end' } },
                h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
              ),
            ),
            h('div', { style: { marginTop: 12 } }, h(ML.MatrixEditor, {
              matrix: matrix,
              onChange: function (next) {
                setMatrix(next);
                setImportError(null);
              },
              minRows: 1,
              maxRows: 12,
              minCols: 1,
              maxCols: 12,
              ariaLabel: 'matrix A',
              extra: t('linalg.dims') + ' ' + rows + '×' + cols,
            })),
            needsRhs
              ? h(
                  'div',
                  { style: { marginTop: 12 } },
                  h(ML.SectionTitle, null, t('linalg.rhs')),
                  h(
                    'div',
                    { className: 'ml-row' },
                    Array.from({ length: rows }).map(function (unused, index) {
                      return h('input', {
                        key: index,
                        className: 'ml-matrix-input',
                        style: { width: 72 },
                        value: rhs[index] === undefined ? '0' : rhs[index],
                        'aria-label': 'b' + (index + 1),
                        onChange: function (event) {
                          updateRhs(index, event.target.value);
                        },
                      });
                    }),
                    h(ML.Btn, {
                      size: 'sm',
                      onClick: function () {
                        setRhs(Array.from({ length: rows }, function () { return String(Math.floor(Math.random() * 9) + 1); }));
                      },
                    }, t('linalg.random')),
                  ),
                )
              : null,
            h(
              'div',
              { className: 'ml-toolbar' },
              h(ML.Btn, {
                size: 'sm',
                onClick: function () {
                  setMatrix(function (previous) {
                    return randomMatrix(previous.length, previous[0] ? previous[0].length : 1);
                  });
                },
              }, t('linalg.random')),
              h(ML.Btn, {
                size: 'sm',
                onClick: function () {
                  const size = rows || 3;
                  setMatrix(identityMatrix(size));
                },
              }, t('linalg.identity')),
              h(ML.Btn, {
                size: 'sm',
                onClick: function () {
                  setMatrix(matrix.map(function (row) { return row.map(function () { return '0'; }); }));
                },
              }, t('linalg.zeros')),
              h(ML.CopyBtn, { text: ML.matrixText(matrix), label: t('linalg.copyMatrix') }),
            ),
            h(
              ML.Collapse,
              { title: t('linalg.paste') },
              h(ML.Field, {
                label: t('linalg.pasteHint'),
                children: (id) =>
                  h(ML.Textarea, {
                    id: id,
                    rows: 4,
                    value: importText,
                    placeholder: '1 2 3\n4 5 6\n7 8 10',
                    onChange: function (event) {
                      setImportText(event.target.value);
                    },
                  }),
              }),
              h(
                'div',
                { className: 'ml-row', style: { marginTop: 8 } },
                h(ML.Btn, { size: 'sm', variant: 'primary', onClick: doImport }, t('linalg.import')),
              ),
              importError ? h(ML.Banner, { tone: 'error' }, t('linalg.invalidMatrix') + importError) : null,
            ),
            localWarning ? h(ML.Banner, { tone: 'warn' }, localWarning) : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('linalg.result')),
            call.op ? h('span', { className: 'ml-hint' }, call.op) : null,
            call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            call.loading
              ? h(ML.Loading, null)
              : call.error
                ? h(ML.ErrorBox, { error: call.error, onRetry: run })
                : call.result === null || call.result === undefined
                  ? h(ML.Empty, { label: t('common.noResult') })
                  : h(MatrixResult, { data: call.result, op: op }),
          ),
        ),
        h(ML.Notes, { notes: [] }),
      );
    },
  };
})();
