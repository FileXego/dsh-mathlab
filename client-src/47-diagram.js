/* 47-diagram — commutative diagram renderer, subgroup Hasse diagram and labelled tables. */
(function () {
  'use strict';
  const useState = React.useState;

  /* ---------------------------------------------------------------- helpers */

  function objectLabel(object) {
    if (!ML.isObj(object)) return String(object);
    return String(object.label || object.id || '?');
  }

  function identityMorphismIds(category) {
    const ids = new Set();
    for (const identity of ML.toArr(category && category.identities)) {
      if (identity && identity.morphism !== undefined) ids.add(String(identity.morphism));
    }
    for (const morphism of ML.toArr(category && category.morphisms)) {
      if (!morphism) continue;
      const id = String(morphism.id || '');
      const dom = String(morphism.dom || '');
      const cod = String(morphism.cod || '');
      if (dom && cod && dom === cod && (id === 'id' + dom || id === 'id_' + dom || id.toLowerCase() === ('id' + dom).toLowerCase())) {
        ids.add(id);
      }
    }
    return ids;
  }

  /** Longest-path layering for a small DAG; cyclic leftovers are appended in order. */
  function layerObjects(objects, edges) {
    const ids = objects.map(function (object) { return String(object.id); });
    const index = new Map(ids.map(function (id, position) { return [id, position]; }));
    const inDegree = new Map(ids.map(function (id) { return [id, 0]; }));
    const next = new Map(ids.map(function (id) { return [id, []]; }));
    for (const [from, to] of edges) {
      if (!index.has(from) || !index.has(to) || from === to) continue;
      next.get(from).push(to);
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }
    const layer = new Map();
    const queue = ids.filter(function (id) { return (inDegree.get(id) || 0) === 0; });
    queue.forEach(function (id) { layer.set(id, 0); });
    let guard = 0;
    while (queue.length && guard < 10000) {
      guard += 1;
      const id = queue.shift();
      for (const target of next.get(id) || []) {
        const candidate = (layer.get(id) || 0) + 1;
        if (candidate > (layer.get(target) || 0)) layer.set(target, candidate);
        inDegree.set(target, inDegree.get(target) - 1);
        if (inDegree.get(target) <= 0) queue.push(target);
      }
    }
    let maxLayer = 0;
    layer.forEach(function (value) { if (value > maxLayer) maxLayer = value; });
    for (const id of ids) {
      if (!layer.has(id)) {
        maxLayer += 1;
        layer.set(id, maxLayer);
      }
    }
    return layer;
  }

  function pointOnQuadratic(p0, c, p1, t) {
    const mt = 1 - t;
    return [mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0], mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1]];
  }

  /* --------------------------------------------------- commutative diagram */

  ML.CommutativeDiagram = function CommutativeDiagram(props) {
    const category = props.category || {};
    const objects = ML.toArr(category.objects).filter(Boolean);
    const morphisms = ML.toArr(category.morphisms).filter(Boolean);
    const hoverState = useState(null);
    const hovered = hoverState[0];
    const setHovered = hoverState[1];

    if (objects.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'empty category' });

    const identityIds = identityMorphismIds(category);
    const visible = morphisms.filter(function (morphism) {
      return !identityIds.has(String(morphism.id));
    });
    const edges = visible.map(function (morphism) {
      return [String(morphism.dom), String(morphism.cod)];
    });
    const layer = layerObjects(objects, edges);
    const byLayer = new Map();
    for (const object of objects) {
      const id = String(object.id);
      const level = layer.get(id) || 0;
      if (!byLayer.has(level)) byLayer.set(level, []);
      byLayer.get(level).push(object);
    }
    const levels = Array.from(byLayer.keys()).sort(function (a, b) { return a - b; });
    const maxLevel = levels.length ? levels[levels.length - 1] : 0;
    let maxCount = 1;
    byLayer.forEach(function (list) { if (list.length > maxCount) maxCount = list.length; });

    const nodeW = 120;
    const nodeH = 40;
    const stepX = 190;
    const stepY = 100;
    const marginX = 50;
    const marginY = 40;
    const width = Math.max(360, (maxLevel + 1) * stepX + marginX * 2);
    const height = Math.max(220, (maxCount - 1) * stepY + nodeH + marginY * 2 + (maxCount > 1 ? 30 : 0));
    const positions = new Map();
    for (const level of levels) {
      const list = byLayer.get(level);
      const x = marginX + level * stepX;
      const span = (list.length - 1) * stepY;
      const startY = marginY + (height - marginY * 2 - span) / 2;
      list.forEach(function (object, index) {
        positions.set(String(object.id), { x: x, y: startY + index * stepY, object: object });
      });
    }

    /* parallel/backward arrow geometry */
    const groups = new Map();
    for (const morphism of visible) {
      const key = String(morphism.dom) + '→' + String(morphism.cod);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(morphism);
    }
    const backwards = new Set();
    for (const key of groups.keys()) {
      const parts = key.split('→');
      if (groups.has(parts[1] + '→' + parts[0])) backwards.add(key);
    }

    const highlight = new Set(
      ML.toArr(props.highlightMorphismIds).map(function (id) {
        return String(id);
      }),
    );
    const dimOthers = highlight.size > 0 && props.dimOthers !== false;
    const isHot = function (morphismId) {
      return highlight.has(String(morphismId)) || hovered === String(morphismId);
    };

    const drawEdge = function (morphism, index) {
      const from = positions.get(String(morphism.dom));
      const to = positions.get(String(morphism.cod));
      const id = String(morphism.id);
      if (!from || !to) return null;
      const hot = isHot(id);
      const dim = dimOthers && !hot;
      const label = String(morphism.label || morphism.id || '');
      if (String(morphism.dom) === String(morphism.cod)) {
        /* self loop above the node, identity arrows are hidden earlier */
        const cx = from.x + nodeW / 2;
        const cy = from.y - nodeH / 2;
        const loopR = 26;
        const d =
          'M' + cx + ' ' + cy +
          ' C' + (cx + loopR) + ' ' + (cy - loopR * 1.6) + ' ' + (cx - loopR) + ' ' + (cy - loopR * 1.6) +
          ' ' + cx + ' ' + cy;
        return h(
          'g',
          { key: 'm' + index, onMouseEnter: function () { setHovered(id); }, onMouseLeave: function () { setHovered(null); } },
          h('path', {
            d: d,
            className: 'ml-dedge' + (hot ? ' is-highlight' : '') + (dim ? ' is-dim' : ''),
            markerEnd: 'url(#' + (props.markerId || 'ml-arrow') + ')',
          }),
          h(
            'text',
            { x: cx, y: cy - loopR * 1.9, className: 'ml-dlabel' + (hot ? ' is-highlight' : ''), textAnchor: 'middle' },
            label,
          ),
          h('title', null, id + ': ' + label + ' ∘ ' + label),
        );
      }
      const groupKey = String(morphism.dom) + '→' + String(morphism.cod);
      const siblings = groups.get(groupKey) || [morphism];
      const position = siblings.indexOf(morphism);
      const count = siblings.length;
      let offset = (position - (count - 1) / 2) * 34;
      if (backwards.has(groupKey) && count === 1) offset = 26;
      if (count === 1 && !backwards.has(groupKey)) offset = 0;

      const start = [from.x + nodeW / 2, from.y];
      const end = [to.x - nodeW / 2, to.y];
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      const normal = [-dy / length, dx / length];
      const mid = [(start[0] + end[0]) / 2 + normal[0] * offset, (start[1] + end[1]) / 2 + normal[1] * offset];
      const d = 'M' + start[0] + ' ' + start[1] + ' Q' + mid[0] + ' ' + mid[1] + ' ' + end[0] + ' ' + end[1];
      const tangentAngle = Math.atan2(end[1] - mid[1], end[0] - mid[0]);
      const arrowSize = 8;
      const arrowPoints = [
        [end[0], end[1]],
        [end[0] - arrowSize * Math.cos(tangentAngle - 0.38), end[1] - arrowSize * Math.sin(tangentAngle - 0.38)],
        [end[0] - arrowSize * Math.cos(tangentAngle + 0.38), end[1] - arrowSize * Math.sin(tangentAngle + 0.38)],
      ]
        .map(function (point) {
          return point[0] + ',' + point[1];
        })
        .join(' ');
      const labelPoint = pointOnQuadratic(start, mid, end, 0.5);
      const labelOffsetX = normal[0] * (offset >= 0 ? 10 : -10);
      const labelOffsetY = normal[1] * (offset >= 0 ? 10 : -10) - 3;
      return h(
        'g',
        { key: 'm' + index, onMouseEnter: function () { setHovered(id); }, onMouseLeave: function () { setHovered(null); } },
        h('path', { d: d, className: 'ml-dedge' + (hot ? ' is-highlight' : '') + (dim ? ' is-dim' : '') }),
        h('polygon', {
          points: arrowPoints,
          fill: hot ? 'var(--ml-brand)' : 'var(--ml-fg2)',
          opacity: dim ? 0.3 : 1,
        }),
        h(
          'text',
          {
            x: labelPoint[0] + labelOffsetX,
            y: labelPoint[1] + labelOffsetY,
            className: 'ml-dlabel' + (hot ? ' is-highlight' : ''),
            textAnchor: 'middle',
          },
          label,
        ),
        h('title', null, id + ': ' + String(morphism.dom) + ' → ' + String(morphism.cod)),
      );
    };

    const markerId = props.markerId || ML.uid('arrow');
    return h(
      'div',
      { className: 'ml-diagram' + (props.className ? ' ' + props.className : '') },
      h(
        'svg',
        {
          className: 'ml-diagram-svg',
          viewBox: '0 0 ' + width + ' ' + height,
          role: 'img',
          'aria-label': props.ariaLabel || 'commutative diagram',
        },
        h('defs', null, h('marker', {
          id: markerId,
          markerWidth: 10,
          markerHeight: 10,
          refX: 8,
          refY: 5,
          orient: 'auto',
          markerUnits: 'userSpaceOnUse',
        }, h('path', { d: 'M0,1 L9,5 L0,9 Z', fill: 'var(--ml-fg2)' }))),
        objects.map(function (object) {
          const id = String(object.id);
          const position = positions.get(id);
          if (!position) return null;
          const label = objectLabel(object);
          const hot = hovered === id;
          return h(
            'g',
            {
              key: 'n' + id,
              transform: 'translate(' + position.x + ',' + position.y + ')',
              className: 'ml-dnode' + (hot ? ' is-hover' : ''),
              onMouseEnter: function () { setHovered(id); },
              onMouseLeave: function () { setHovered(null); },
            },
            h('rect', {
              x: -nodeW / 2,
              y: -nodeH / 2,
              width: nodeW,
              height: nodeH,
              rx: 12,
            }),
            h(
              'text',
              { x: 0, y: 5, textAnchor: 'middle' },
              label.length > 16 ? label.slice(0, 15) + '…' : label,
            ),
            h('title', null, id + ' · ' + label),
          );
        }),
        visible.map(drawEdge),
      ),
      h(
        'div',
        { className: 'ml-diagram-legend' },
        h('span', null, props.legend || ''),
        h('span', null, visible.length + ' morphisms · ' + objects.length + ' objects · identity arrows hidden'),
      ),
    );
  };

  /* ------------------------------------------------------- Hasse diagram */

  ML.HasseDiagram = function HasseDiagram(props) {
    const nodes = ML.toArr(props.nodes).filter(Boolean);
    const edges = ML.toArr(props.edges).filter(function (edge) {
      return Array.isArray(edge) && edge.length >= 2;
    });
    if (nodes.length === 0) return h(ML.Empty, { label: props.emptyLabel || 'no subgroups' });
    const orders = Array.from(
      new Set(
        nodes.map(function (node) {
          const order = Number(node.order);
          return Number.isFinite(order) ? order : 0;
        }),
      ),
    ).sort(function (a, b) { return a - b; });
    const byOrder = new Map();
    for (const node of nodes) {
      const order = Number.isFinite(Number(node.order)) ? Number(node.order) : 0;
      if (!byOrder.has(order)) byOrder.set(order, []);
      byOrder.get(order).push(node);
    }
    let maxCount = 1;
    byOrder.forEach(function (list) { if (list.length > maxCount) maxCount = list.length; });
    const stepX = 150;
    const stepY = 74;
    const marginX = 60;
    const marginY = 46;
    const width = Math.max(360, (orders.length - 1) * stepX + marginX * 2);
    const height = Math.max(200, (maxCount - 1) * stepY + marginY * 2);
    const positions = new Map();
    orders.forEach(function (order, levelIndex) {
      const list = byOrder.get(order);
      const x = marginX + levelIndex * stepX;
      const span = (list.length - 1) * stepY;
      const startY = marginY + (height - marginY * 2 - span) / 2;
      list.forEach(function (node, index) {
        positions.set(String(node.id), { x: x, y: startY + index * stepY, node: node });
      });
    });
    return h(
      'div',
      { className: 'ml-diagram' },
      h(
        'svg',
        { className: 'ml-diagram-svg', viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': props.ariaLabel || 'subgroup lattice' },
        edges.map(function (edge, index) {
          const from = positions.get(String(edge[0]));
          const to = positions.get(String(edge[1]));
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const dx = to.x - from.x;
          const control = 'M' + from.x + ' ' + (from.y + 9) + ' C' + mx + ' ' + (from.y + stepY * 0.4) + ' ' + mx + ' ' + (to.y - stepY * 0.4) + ' ' + to.x + ' ' + (to.y - 9);
          return h('path', { key: 'e' + index, d: control, className: 'ml-hasse-edge' });
        }),
        nodes.map(function (node) {
          const position = positions.get(String(node.id));
          if (!position) return null;
          const label = String(node.label || ('|H|=' + node.order));
          const title = String(node.id) + ' · ' + label + ' · |H| = ' + String(node.order) + (node.isNormal ? ' · normal' : '') + (node.isMaximal ? ' · maximal' : '');
          return h(
            'g',
            {
              key: 'n' + String(node.id),
              className: 'ml-hasse-node' + (node.isNormal ? ' is-normal' : ''),
              transform: 'translate(' + position.x + ',' + position.y + ')',
            },
            h('circle', { r: node.isNormal ? 8 : 6, cx: 0, cy: 0 }),
            h('text', { className: 'ml-hasse-label', x: 11, y: 4, textAnchor: 'start' }, label.length > 14 ? label.slice(0, 13) + '…' : label),
            h('title', null, title),
          );
        }),
      ),
      h(
        'div',
        { className: 'ml-diagram-legend' },
        h('span', null, '○ subgroup'),
        h('span', null, '◎  normal subgroup (blue)'),
        h('span', null, 'edges: smaller → larger (normal covering)'),
      ),
    );
  };

  /* -------------------------------------------------------- labelled table */

  ML.CayleyTable = function CayleyTable(props) {
    const elements = ML.toArr(props.elements);
    const table = ML.toArr(props.table);
    if (elements.length === 0 || table.length === 0) return h(ML.Empty, null);
    const cellClass = function (cell) {
      if (props.highlight && String(cell) === String(props.highlight)) return 'ml-cell-hl';
      return undefined;
    };
    return h(ML.LabeledTable, {
      rowLabels: elements,
      colLabels: elements,
      corner: props.corner || '∘',
      cells: table.map(function (row) {
        return ML.toArr(row).map(function (index) {
          return elements[Number(index)] === undefined ? String(index) : elements[Number(index)];
        });
      }),
      cellClass: cellClass,
      className: props.className,
    });
  };
})();
