/* 46-plot3d — 3-D surface wireframe with drag rotation and SVG export. */
(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useMemo = React.useMemo;

  const VIEW_W = 800;
  const VIEW_H = 480;

  function buildEdges(vertices, indices) {
    const edges = [];
    const seen = new Set();
    const addEdge = function (a, b) {
      if (!Number.isInteger(a) || !Number.isInteger(b) || a === b) return;
      if (a < 0 || b < 0 || a >= vertices.length || b >= vertices.length) return;
      const key = a < b ? a + ':' + b : b + ':' + a;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push([a, b]);
    };
    const triangles = ML.toArr(indices);
    if (triangles.length > 0) {
      for (const face of triangles) {
        const tri = ML.toArr(face);
        if (tri.length >= 3) {
          addEdge(tri[0], tri[1]);
          addEdge(tri[1], tri[2]);
          addEdge(tri[2], tri[0]);
        }
      }
    } else {
      return null;
    }
    return edges;
  }

  ML.Surface3D = function Surface3D(props) {
    const t = ML.useT();
    const svgRef = useRef(null);
    const dragRef = useRef(null);
    const [yaw, setYaw] = useState(0.72);
    const [pitch, setPitch] = useState(0.52);
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);

    const vertices = ML.toArr(props.vertices).filter(function (vertex) {
      return Array.isArray(vertex) && vertex.length >= 3;
    });
    const edges = useMemo(function () {
      return buildEdges(vertices, props.indices) || [];
    }, [vertices, props.indices]);

    const shape = useMemo(
      function () {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        for (const vertex of vertices) {
          const x = Number(vertex[0]);
          const y = Number(vertex[1]);
          const z = Number(vertex[2]);
          if (![x, y, z].every(Number.isFinite)) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }
        if (!Number.isFinite(minX)) {
          return { center: [0, 0, 0], extent: 2, zRange: [-1, 1], box: null };
        }
        const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
        const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1e-6);
        return {
          center: center,
          extent: extent,
          zRange: [minZ, maxZ],
          box: [minX, maxX, minY, maxY, minZ, maxZ],
        };
      },
      [vertices],
    );

    const scale = (Math.min(VIEW_W, VIEW_H) * 0.42 * zoom) / shape.extent;

    const project = function (vertex) {
      const x = Number(vertex[0]) - shape.center[0];
      const y = Number(vertex[1]) - shape.center[1];
      const z = Number(vertex[2]) - shape.center[2];
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const x1 = x * cy - y * sy;
      const y1 = x * sy + y * cy;
      const y2 = y1 * cp - z * sp;
      const z2 = y1 * sp + z * cp;
      return {
        x: VIEW_W / 2 + x1 * scale,
        y: VIEW_H / 2 - z2 * scale,
        depth: y2,
      };
    };

    const projected = useMemo(function () {
      return vertices.map(project);
    }, [vertices, yaw, pitch, zoom, shape.extent]);

    const projectedEdges = useMemo(
      function () {
        const list = [];
        for (const [a, b] of edges) {
          const pa = projected[a];
          const pb = projected[b];
          if (!pa || !pb) continue;
          list.push({ a: pa, b: pb, depth: (pa.depth + pb.depth) / 2 });
        }
        list.sort(function (left, right) {
          return right.depth - left.depth;
        });
        return list;
      },
      [edges, projected],
    );

    const endDrag = function () {
      dragRef.current = null;
      setDragging(false);
    };

    const download = function () {
      if (svgRef.current) ML.exportSvg(svgRef.current, props.filename || 'mathlab-surface.svg');
    };

    const box = shape.box;
    const boxEdges = useMemo(
      function () {
        if (!box) return [];
        const [x0, x1, y0, y1, z0, z1] = box;
        const corners = [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y1, z0],
          [x0, y1, z0],
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ];
        const pairs = [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 4],
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ];
        return pairs.map(function (pair) {
          return [project(corners[pair[0]]), project(corners[pair[1]])];
        });
      },
      [box, yaw, pitch, zoom],
    );

    const boxLabels = useMemo(
      function () {
        if (!box) return [];
        const [x0, x1, y0, y1, z0, z1] = box;
        return [
          { text: 'x', at: project([x1, y0, z0]) },
          { text: 'y', at: project([x0, y1, z0]) },
          { text: 'z', at: project([x0, y0, z1]) },
        ];
      },
      [box, yaw, pitch, zoom],
    );

    const zText =
      shape.zRange && Number.isFinite(shape.zRange[0])
        ? ML.fmtNum(shape.zRange[0], 3) + ' … ' + ML.fmtNum(shape.zRange[1], 3)
        : '';

    return h(
      'div',
      { className: 'ml-plot-wrap' },
      h(
        'div',
        { className: 'ml-plot-toolbar' },
        h(
          ML.Btn,
          {
            size: 'sm',
            onClick: function () {
              setYaw(0.72);
              setPitch(0.52);
              setZoom(1);
            },
          },
          '⤢ ' + t('common.reset'),
        ),
        h(ML.Btn, { size: 'sm', onClick: download, disabled: vertices.length === 0 }, '⤓ SVG'),
        h(
          'span',
          { className: 'ml-plot-readout' },
          zText ? 'z ∈ [' + zText + ']' : '',
          vertices.length ? '   ' + vertices.length + ' 顶点 / ' + projectedEdges.length + ' 边' : '',
        ),
      ),
      vertices.length === 0
        ? h('div', { className: 'ml-empty' }, t('common.noResult'))
        : h(
            'svg',
            {
              ref: svgRef,
              className: 'ml-plot-svg' + (dragging ? ' is-dragging' : ''),
              viewBox: '0 0 ' + VIEW_W + ' ' + VIEW_H,
              role: 'img',
              'aria-label': props.title || '3D surface',
              style: { cursor: dragging ? 'grabbing' : 'grab' },
              onPointerDown: function (event) {
                if (event.button !== 0) return;
                dragRef.current = {
                  x: event.clientX,
                  y: event.clientY,
                  yaw: yaw,
                  pitch: pitch,
                };
                setDragging(true);
                try {
                  event.currentTarget.setPointerCapture(event.pointerId);
                } catch (error) {
                  /* ignore */
                }
              },
              onPointerMove: function (event) {
                const drag = dragRef.current;
                if (!drag) return;
                const dx = event.clientX - drag.x;
                const dy = event.clientY - drag.y;
                setYaw(drag.yaw + dx * 0.008);
                setPitch(ML.clamp(drag.pitch + dy * 0.006, -1.45, 1.45));
              },
              onPointerUp: endDrag,
              onPointerCancel: endDrag,
              onPointerLeave: endDrag,
              onWheel: function (event) {
                setZoom(function (previous) {
                  return ML.clamp(previous * (event.deltaY < 0 ? 1.08 : 0.925), 0.35, 4);
                });
              },
            },
            boxEdges.map(function (edge, index) {
              if (!edge[0] || !edge[1]) return null;
              return h('line', {
                key: 'box' + index,
                x1: edge[0].x,
                y1: edge[0].y,
                x2: edge[1].x,
                y2: edge[1].y,
                stroke: 'var(--ml-b1)',
                strokeWidth: 0.8,
                strokeDasharray: '3 4',
              });
            }),
            boxLabels.map(function (label, index) {
              return h(
                'text',
                {
                  key: 'bl' + index,
                  x: label.at.x,
                  y: label.at.y,
                  className: 'ml-3d-label',
                  textAnchor: 'middle',
                },
                label.text,
              );
            }),
            projectedEdges.map(function (edge, index) {
              const depthOpacity = ML.clamp(0.42 + (1 - (edge.depth + shape.extent / 2) / shape.extent) * 0.58, 0.35, 0.95);
              return h('line', {
                key: 'e' + index,
                x1: edge.a.x,
                y1: edge.a.y,
                x2: edge.b.x,
                y2: edge.b.y,
                stroke: 'var(--ml-brand)',
                strokeWidth: 0.75,
                opacity: depthOpacity,
              });
            }),
            h(
              'text',
              {
                x: 14,
                y: VIEW_H - 14,
                className: 'ml-3d-label',
                textAnchor: 'start',
              },
              props.caption || '拖拽旋转 · 滚轮缩放',
            ),
          ),
      h('div', { className: 'ml-plot-hint' }, props.hint || '拖动旋转视角，滚轮缩放；SVG 可导出。'),
    );
  };
})();
