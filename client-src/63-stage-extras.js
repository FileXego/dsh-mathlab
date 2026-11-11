/* 63-stage-extras — render-only extras.
 *
 * The symbol -> step bipartite graph and other non-core widgets. Kept separate
 * from block renderers so the optional visualization can be tested/replaced
 * without touching the common block path. */
(function () {
  'use strict';

  function SymbolGraph(props) {
    const rows = ML.toArr(props.rows)
      .filter(function (row) {
        return ML.isObj(row) && ML.toArr(row.steps).length > 0;
      })
      .slice(0, 8);
    if (rows.length === 0) return null;
    const steps = [];
    for (const row of rows) {
      for (const step of row.steps) if (steps.indexOf(step) < 0) steps.push(step);
    }
    steps.sort(function (a, b) {
      return a - b;
    });
    const height = Math.max(72, rows.length * 30 + 18, steps.length * 20 + 18);
    const width = 260;
    const leftX = 8;
    const rightX = width - 8;
    const rowY = function (index) {
      return 14 + index * ((height - 26) / Math.max(1, rows.length - 1));
    };
    const stepY = function (index) {
      return 14 + index * ((height - 26) / Math.max(1, steps.length - 1));
    };
    const stepPos = new Map(
      steps.map(function (step, index) {
        return [step, stepY(index)];
      }),
    );
    return h(
      'div',
      { className: 'stage-sym-graph' },
      h('div', { className: 'stage-caption' }, String(props.label || '')),
      h(
        'svg',
        { viewBox: '0 0 ' + width + ' ' + height, role: 'img', style: { width: '100%', height: height + 'px' } },
        rows.map(function (row, rowIndex) {
          const y = rowY(rowIndex);
          const glyph = String(row.symbol && (row.symbol.unicode || row.symbol.symbol) ? row.symbol.unicode || row.symbol.symbol : row.id).slice(0, 14);
          const active = props.activeSymbol === row.id;
          return h(
            'g',
            { key: 'sym-' + row.id },
            ML.toArr(row.steps).map(function (step) {
              return h('line', {
                key: 'line-' + step,
                x1: leftX + 78,
                y1: y,
                x2: rightX - 30,
                y2: stepPos.get(step),
                className: 'stage-sym-graph-line' + (active ? ' is-active' : ''),
              });
            }),
            h('circle', {
              cx: leftX + 78,
              cy: y,
              r: 3,
              className: 'stage-sym-graph-dot' + (active ? ' is-active' : ''),
            }),
            h(
              'text',
              {
                x: leftX,
                y: y + 4,
                className: 'stage-sym-graph-label' + (active ? ' is-active' : ''),
                onClick: function () {
                  if (typeof props.onSymbolClick === 'function') props.onSymbolClick(active ? null : row.id);
                },
              },
              glyph,
            ),
          );
        }),
        steps.map(function (step) {
          return h(
            'g',
            { key: 'step-' + step },
            h('circle', { cx: rightX - 30, cy: stepPos.get(step), r: 2.5, className: 'stage-sym-graph-dot' }),
            h(
              'text',
              {
                x: rightX,
                y: stepPos.get(step) + 4,
                textAnchor: 'end',
                className: 'stage-sym-graph-step',
                onClick: function () {
                  if (typeof props.jumpTo === 'function') props.jumpTo(step);
                },
              },
              '第 ' + (step + 1) + ' 步',
            ),
          );
        }),
      ),
    );
  }


  ML.stageExtras = { SymbolGraph: SymbolGraph };
})();
