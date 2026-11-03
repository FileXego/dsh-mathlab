/* 48-proof — Fitch natural-deduction renderer, proof tree, truth table, countermodels. */
(function () {
  'use strict';
  const useState = React.useState;

  const LINE_HEIGHT = 26;
  const LINE_PADDING = 10;

  const TRUE_GLYPH = 'T';
  const FALSE_GLYPH = 'F';

  function normalizeLines(proof) {
    const direct = ML.toArr(proof && proof.fitch);
    if (direct.length > 0) {
      return direct.map(function (line, index) {
        return {
          line: line && line.line !== undefined ? line.line : index + 1,
          indent: ML.clamp(Number(line && line.indent) || 0, 0, 10),
          text: line && line.text !== undefined ? String(line.text) : String((line && line.conclusion) || ''),
          rule: line && line.rule !== undefined ? String(line.rule) : '',
          refs: ML.toArr(line && line.refs),
          conclusion: line && line.conclusion,
        };
      });
    }
    const nodes = ML.toArr((proof && proof.proof && proof.proof.nodes) || (proof && proof.nodes));
    return nodes.map(function (node, index) {
      const fitch = (node && node.fitch) || {};
      return {
        line: fitch.line !== undefined ? fitch.line : index + 1,
        indent: ML.clamp(Number(fitch.indent) || 0, 0, 10),
        text: fitch.text !== undefined ? String(fitch.text) : String((node && node.conclusion) || ''),
        rule: (node && node.rule) || fitch.rule || '',
        refs: ML.toArr(node && node.premises),
        conclusion: node && node.conclusion,
      };
    });
  }

  function computeScopes(lines) {
    const scopes = [];
    const stack = [];
    lines.forEach(function (line, index) {
      const indent = line.indent;
      while (stack.length > 0 && stack[stack.length - 1].indent > indent) {
        const open = stack.pop();
        open.end = index;
        scopes.push(open);
      }
      const topIndent = stack.length > 0 ? stack[stack.length - 1].indent : 0;
      if (indent > topIndent) {
        stack.push({ indent: indent, start: index });
      }
    });
    while (stack.length > 0) {
      const open = stack.pop();
      open.end = lines.length - 1;
      scopes.push(open);
    }
    return scopes;
  }

  ML.FitchProof = function FitchProof(props) {
    const lines = normalizeLines(props.proof !== undefined ? props.proof : props);
    if (lines.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no proof lines' });
    const scopes = computeScopes(lines);
    const innerHeight = lines.length * LINE_HEIGHT;
    return h(
      'div',
      { className: 'ml-fitch', style: { paddingTop: LINE_PADDING, paddingBottom: LINE_PADDING } },
      h(
        'div',
        { className: 'ml-fitch-inner', style: { position: 'relative', height: innerHeight } },
        scopes.map(function (scope, index) {
          const top = scope.start * LINE_HEIGHT + 4;
          const height = (scope.end - scope.start + 1) * LINE_HEIGHT - 8;
          const left = 42 + (scope.indent - 1) * 16 + 2;
          return h('div', {
            key: 'bar' + index,
            className: 'ml-fitch-bar',
            style: { left: left, top: top, height: height },
            title: 'discharge scope',
          });
        }),
        lines.map(function (line, index) {
          return h(
            'div',
            { key: 'line' + index, className: 'ml-fitch-line' + (index === lines.length - 1 ? ' is-conclusion' : '') },
            h('span', { className: 'ml-fitch-no' }, String(line.line)),
            h(
              'span',
              { className: 'ml-fitch-body', style: { paddingLeft: line.indent * 16 } },
              line.text || (line.conclusion === undefined ? '' : ML.safeString(line.conclusion)),
            ),
            line.rule ? h('span', { className: 'ml-fitch-rule' }, line.rule) : null,
            line.refs.length ? h('span', { className: 'ml-fitch-refs' }, '[' + line.refs.join(', ') + ']') : null,
          );
        }),
      ),
    );
  };

  ML.ProofTree = function ProofTree(props) {
    const nodes = ML.toArr((props.proof && props.proof.nodes) || props.nodes);
    if (nodes.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no proof nodes' });
    const byId = new Map();
    for (const node of nodes) {
      if (node && node.id !== undefined) byId.set(String(node.id), node);
    }
    const referenced = new Set();
    for (const node of nodes) {
      for (const premise of ML.toArr(node && node.premises)) referenced.add(String(premise));
    }
    let roots = nodes.filter(function (node) {
      return node && !referenced.has(String(node.id));
    });
    if (roots.length === 0) roots = [nodes[nodes.length - 1]];
    const visited = new Set();

    const renderNode = function (node, depth) {
      const id = String(node && node.id);
      if (visited.has(id) || depth > 40) {
        return h('li', { key: 'cycle' + id }, h('span', { className: 'ml-muted' }, '…'));
      }
      visited.add(id);
      const children = ML.toArr(node.premises).map(function (premiseId) {
        return byId.get(String(premiseId));
      }).filter(Boolean);
      const discharged = ML.toArr(node.discharged);
      return h(
        'li',
        { key: id },
        h('span', null, node.conclusion !== undefined ? ML.safeString(node.conclusion, 400) : id),
        node.rule ? h('span', { className: 'ml-proof-rule' }, node.rule) : null,
        discharged.length ? h('span', { className: 'ml-proof-discharged' }, 'discharge [' + discharged.join(', ') + ']') : null,
        children.length
          ? h(
              'ul',
              null,
              children.map(function (child) {
                return renderNode(child, depth + 1);
              }),
            )
          : null,
      );
    };

    return h(
      'div',
      { className: 'ml-proof-tree' },
      h(
        'ul',
        null,
        roots.map(function (root, index) {
          return h(React.Fragment, { key: 'root' + index }, renderNode(root, 0));
        }),
      ),
    );
  };

  function boolCell(value) {
    if (value === true || value === 'true' || value === 1) return h('span', { className: 'ml-tt-t' }, TRUE_GLYPH);
    if (value === false || value === 'false' || value === 0) return h('span', { className: 'ml-tt-f' }, FALSE_GLYPH);
    return h('span', { className: 'ml-muted' }, '?');
  }

  ML.TruthTable = function TruthTable(props) {
    const data = props.data || {};
    const atoms = ML.toArr(data.atoms).map(String);
    const rows = ML.toArr(data.rows);
    if (rows.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no truth table' });
    return h(
      'div',
      { className: 'ml-tbl-wrap' },
      h(
        'table',
        { className: 'ml-table ml-truth-table' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            rows[0] && Array.isArray(rows[0].values)
              ? atoms.map(function (atom) {
                  return h('th', { key: atom, scope: 'col' }, atom);
                })
              : null,
            h('th', { scope: 'col', className: 'ml-tt-result' }, ML.toArr(data.atoms).length ? 'φ' : 'result'),
          ),
        ),
        h(
          'tbody',
          null,
          rows.map(function (row, index) {
            const values = Array.isArray(row && row.values) ? row.values : [];
            return h(
              'tr',
              { key: index },
              atoms.map(function (atom, columnIndex) {
                return h('td', { key: atom }, boolCell(values[columnIndex]));
              }),
              h('td', { className: 'ml-tt-result' }, boolCell(row && row.result)),
            );
          }),
        ),
      ),
    );
  };

  ML.Countermodel = function Countermodel(props) {
    const t = ML.useT();
    const model = props.countermodel;
    if (!model || !ML.isObj(model)) return h(ML.Empty, { label: props.emptyLabel || 'none' });
    const sections = [];

    if (ML.isObj(model.assignment)) {
      sections.push(
        h(
          'div',
          { key: 'assignment' },
          h(ML.SectionTitle, null, props.assignmentLabel || 'assignment'),
          h(ML.LabeledTable, {
            rowLabels: [],
            colLabels: Object.keys(model.assignment),
            cells: [Object.keys(model.assignment).map(function (key) {
              return boolCell(model.assignment[key]);
            })],
          }),
        ),
      );
    }

    if (model.worlds !== undefined) {
      const worldCount = Array.isArray(model.worlds) ? model.worlds.length : Number(model.worlds);
      const worlds = Array.from({ length: Number.isFinite(worldCount) ? worldCount : 0 }, function (unused, index) {
        return 'w' + (index + 1);
      });
      sections.push(
        h(
          'div',
          { key: 'worlds' },
          h(ML.SectionTitle, null, props.worldsLabel || 'worlds'),
          h(
            'div',
            { className: 'ml-row' },
            worlds.map(function (world) {
              return h(ML.Badge, { key: world, tone: 'brand' }, world);
            }),
          ),
        ),
      );
      const relations = model.relations;
      if (Array.isArray(relations) && relations.length > 0) {
        if (ML.matrixLike(relations)) {
          sections.push(
            h(
              'div',
              { key: 'relations' },
              h(ML.SectionTitle, null, props.relationsLabel || 'accessibility relation'),
              h(ML.MatrixView, { matrix: relations, small: true }),
            ),
          );
        } else {
          sections.push(
            h(
              'div',
              { key: 'relations' },
              h(ML.SectionTitle, null, props.relationsLabel || 'accessibility relation'),
              h(
                'div',
                { className: 'ml-row' },
                relations.map(function (pair, index) {
                  const from = Array.isArray(pair) ? pair[0] : undefined;
                  const to = Array.isArray(pair) ? pair[1] : undefined;
                  return h(
                    'span',
                    { key: index, className: 'ml-badge' },
                    'world ' + String(from) + ' → ' + String(to),
                  );
                }),
              ),
            ),
          );
        }
      }
      if (ML.isObj(model.valuation)) {
        const atomNames = Object.keys(model.valuation);
        sections.push(
          h(
            'div',
            { key: 'valuation' },
            h(ML.SectionTitle, null, props.valuationLabel || 'valuation'),
            h(ML.LabeledTable, {
              rowLabels: worlds,
              colLabels: atomNames,
              corner: 'w',
              cells: worlds.map(function (world, worldIndex) {
                return atomNames.map(function (atom) {
                  const values = model.valuation[atom];
                  const value = Array.isArray(values) ? values[worldIndex] : values;
                  return boolCell(value);
                });
              }),
            }),
          ),
        );
      }
    }

    const remaining = {};
    for (const key of Object.keys(model)) {
      if (key === 'assignment' || key === 'worlds' || key === 'relations' || key === 'valuation') continue;
      remaining[key] = model[key];
    }
    if (Object.keys(remaining).length > 0) {
      sections.push(
        h(
          'div',
          { key: 'rest' },
          h(ML.Collapse, { title: t('common.details') }, h(ML.JSONTree, { value: remaining })),
        ),
      );
    }
    if (sections.length === 0) return h(ML.DataView, { data: model });
    return h('div', { className: 'ml-stack' }, sections, h(ML.RawJSON, { value: model }));
  };

  /** Compact inference-rule cheatsheet reused by the logic tab. */
  ML.RuleLegend = function RuleLegend() {
    const rules = [
      ['∧I', 'and-intro'],
      ['∧E', 'and-elim'],
      ['∨I', 'or-intro'],
      ['∨E', 'or-elim'],
      ['→I', 'imp-intro'],
      ['→E', 'imp-elim'],
      ['↔I', 'iff-intro'],
      ['¬I', 'not-intro'],
      ['¬E', 'not-elim'],
      ['⊥E', 'contradiction-elim'],
      ['¬¬E', 'double-neg-elim'],
      ['LEM', 'law-excluded-middle'],
    ];
    return h(
      'div',
      { className: 'ml-chip-row' },
      rules.map(function (rule) {
        return h('span', { key: rule[1], className: 'ml-badge', title: rule[1] }, rule[0] + ' ' + rule[1]);
      }),
    );
  };
})();
