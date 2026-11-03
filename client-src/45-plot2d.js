/* 45-plot2d — interactive 2-D SVG chart: curves, implicit contour segments,
 * vector fields, axes/ticks/grid/legend, wheel zoom, drag pan, reset, SVG export. */
(function () {
  'use strict';
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;

  const VIEW_W = 800;
  const MARGIN = { left: 56, right: 18, top: 16, bottom: 38 };

  function pointsBounds(segments, arrows) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const segment of ML.toArr(segments)) {
      for (const point of ML.toArr(segment.points)) {
        const x = Number(point && point[0]);
        const y = Number(point && point[1]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    for (const arrow of ML.toArr(arrows)) {
      const x = Number(arrow[0]);
      const y = Number(arrow[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (!Number.isFinite(minX)) return null;
    return { x: [minX, maxX], y: [minY, maxY] };
  }

  function padRange(range, factor) {
    const span = range[1] - range[0] || 1;
    const pad = span * (factor === undefined ? 0.04 : factor);
    return [range[0] - pad, range[1] + pad];
  }

  ML.Plot2D = function Plot2D(props) {
    const t = ML.useT();
    const svgRef = useRef(null);
    const wrapRef = useRef(null);
    const viewRef = useRef(null);
    const dragRef = useRef(null);
    const height = props.height || 460;
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const plotW = VIEW_W - MARGIN.left - MARGIN.right;

    const segments = ML.toArr(props.segments);
    const arrows = ML.toArr(props.arrows);
    const markers = ML.toArr(props.markers);

    const auto = useMemo(function () {
      return pointsBounds(segments, arrows);
    }, [segments, arrows]);

    const computeInitial = useMemo(function () {
      return function () {
        const bounds = auto;
        let x0;
        let x1;
        let y0;
        let y1;
        if (props.xRange && props.xRange.length === 2 && isFinite(props.xRange[0]) && isFinite(props.xRange[1])) {
          x0 = Number(props.xRange[0]);
          x1 = Number(props.xRange[1]);
        } else if (bounds) {
          [x0, x1] = padRange(bounds.x);
        } else {
          x0 = -5;
          x1 = 5;
        }
        if (props.yRange && props.yRange.length === 2 && isFinite(props.yRange[0]) && isFinite(props.yRange[1])) {
          y0 = Number(props.yRange[0]);
          y1 = Number(props.yRange[1]);
        } else if (bounds) {
          [y0, y1] = padRange(bounds.y);
        } else {
          y0 = -3;
          y1 = 3;
        }
        if (!(x1 > x0)) x1 = x0 + 1;
        if (!(y1 > y0)) y1 = y0 + 1;
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
      };
    }, [auto, props.xRange, props.yRange]);
    const computeInitialRef = useRef(computeInitial);
    computeInitialRef.current = computeInitial;
    const initialRef = useRef(null);

    const resetSig = useMemo(function () {
      if (props.resetKey !== undefined && props.resetKey !== null) return 'k' + String(props.resetKey);
      return (
        JSON.stringify(props.xRange || null) +
        '|' +
        JSON.stringify(props.yRange || null) +
        '|' +
        segments.length +
        '|' +
        arrows.length
      );
    }, [props.resetKey, props.xRange, props.yRange, segments.length, arrows.length]);

    const [view, setView] = useState(function () {
      const start = computeInitial();
      initialRef.current = start;
      return start;
    });
    viewRef.current = view;
    const [hover, setHover] = useState(null);
    const [dragging, setDragging] = useState(false);

    useEffect(
      function () {
        const next = computeInitialRef.current();
        initialRef.current = next;
        setView(next);
      },
      [resetSig],
    );

    const xScale = ML.scale(view.x0, view.x1, MARGIN.left, MARGIN.left + plotW);
    const yScale = ML.scale(view.y0, view.y1, MARGIN.top + plotH, MARGIN.top);
    const xTicks = ML.ticks(view.x0, view.x1, 8);
    const yTicks = ML.ticks(view.y0, view.y1, 6);

    /* Native non-passive wheel listener so the page does not scroll while zooming. */
    useEffect(
      function () {
        const node = svgRef.current;
        if (!node) return undefined;
        const onWheel = function (event) {
          event.preventDefault();
          const rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const scale = VIEW_W / rect.width;
          const px = (event.clientX - rect.left) * scale;
          const py = (event.clientY - rect.top) * scale;
          const current = viewRef.current;
          const base = initialRef.current || current;
          const cursorX = current.x0 + ((px - MARGIN.left) / plotW) * (current.x1 - current.x0);
          const cursorY = current.y1 - ((py - MARGIN.top) / plotH) * (current.y1 - current.y0);
          const factor = event.deltaY < 0 ? 0.86 : 1.163;
          const baseSpanX = base.x1 - base.x0 || 1;
          const baseSpanY = base.y1 - base.y0 || 1;
          const currentSpanX = current.x1 - current.x0 || 1;
          const currentSpanY = current.y1 - current.y0 || 1;
          const nextSpanX = ML.clamp(currentSpanX * factor, baseSpanX * 1e-4, baseSpanX * 1e4);
          const nextSpanY = ML.clamp(currentSpanY * factor, baseSpanY * 1e-4, baseSpanY * 1e4);
          const ratioX = nextSpanX / currentSpanX;
          const ratioY = nextSpanY / currentSpanY;
          setView({
            x0: cursorX - (cursorX - current.x0) * ratioX,
            x1: cursorX + (current.x1 - cursorX) * ratioX,
            y0: cursorY - (cursorY - current.y0) * ratioY,
            y1: cursorY + (current.y1 - cursorY) * ratioY,
          });
        };
        node.addEventListener('wheel', onWheel, { passive: false });
        return function () {
          node.removeEventListener('wheel', onWheel);
        };
      },
      [height, plotW, plotH],
    );

    const toSvgPoint = function (event) {
      const node = svgRef.current;
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const scale = VIEW_W / rect.width;
      return {
        px: (event.clientX - rect.left) * scale,
        py: (event.clientY - rect.top) * scale,
      };
    };

    const onPointerDown = function (event) {
      if (event.button !== 0) return;
      const point = toSvgPoint(event);
      if (!point) return;
      dragRef.current = {
        startPx: point.px,
        startPy: point.py,
        view: Object.assign({}, viewRef.current),
        moved: false,
      };
      setDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch (error) {
        /* pointer capture unsupported */
      }
    };

    const onPointerMove = function (event) {
      const point = toSvgPoint(event);
      if (point) {
        setHover({ x: xScale.invert(point.px), y: yScale.invert(point.py) });
      }
      const drag = dragRef.current;
      if (!drag || !point) return;
      const dx = point.px - drag.startPx;
      const dy = point.py - drag.startPy;
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      const spanX = drag.view.x1 - drag.view.x0;
      const spanY = drag.view.y1 - drag.view.y0;
      const worldDx = (dx / plotW) * spanX;
      const worldDy = (dy / plotH) * spanY;
      setView({
        x0: drag.view.x0 - worldDx,
        x1: drag.view.x1 - worldDx,
        y0: drag.view.y0 + worldDy,
        y1: drag.view.y1 + worldDy,
      });
    };

    const endDrag = function (event) {
      dragRef.current = null;
      setDragging(false);
      try {
        if (event && event.currentTarget && event.currentTarget.releasePointerCapture) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch (error) {
        /* ignore */
      }
    };

    const resetView = function () {
      setView(initialRef.current || computeInitialRef.current());
    };

    const download = function () {
      if (svgRef.current) ML.exportSvg(svgRef.current, props.filename || 'mathlab-plot.svg');
    };

    const clipId = useMemo(function () {
      return ML.uid('clip');
    }, []);
    const legendItems = useMemo(function () {
      const seen = [];
      for (const segment of segments) {
        if (segment && segment.label && seen.indexOf(segment.label) < 0) {
          seen.push(segment.label);
        }
      }
      return seen;
    }, [segments]);

    const axisX = view.y0 <= 0 && view.y1 >= 0 ? yScale.map(0) : MARGIN.top + plotH;
    const axisY = view.x0 <= 0 && view.x1 >= 0 ? xScale.map(0) : MARGIN.left;
    const plotLeft = MARGIN.left;
    const plotRight = MARGIN.left + plotW;
    const plotTop = MARGIN.top;
    const plotBottom = MARGIN.top + plotH;
    const arrowLen = 6;

    const empty = segments.length === 0 && arrows.length === 0 && markers.length === 0;

    return h(
      'div',
      { className: 'ml-plot-wrap', ref: wrapRef },
      h(
        'div',
        { className: 'ml-plot-toolbar' },
        h(ML.Btn, { size: 'sm', variant: 'ghost', onClick: resetView, disabled: empty }, '⤢ ' + t('common.reset')),
        h(ML.Btn, { size: 'sm', variant: 'ghost', onClick: download, disabled: empty }, '⤓ SVG'),
        props.extraControls || null,
        h(
          'span',
          { className: 'ml-plot-readout' },
          hover && !empty
            ? 'x = ' + ML.fmtNum(hover.x, 5) + '   y = ' + ML.fmtNum(hover.y, 5)
            : props.hint || '×',
        ),
      ),
      empty
        ? h('div', { className: 'ml-empty' }, props.emptyLabel || t('common.noResult'))
        : h(
            'svg',
            {
              ref: svgRef,
              className: 'ml-plot-svg' + (dragging ? ' is-dragging' : ''),
              viewBox: '0 0 ' + VIEW_W + ' ' + height,
              role: 'img',
              'aria-label': props.ariaLabel || props.title || 'plot',
              onPointerDown: onPointerDown,
              onPointerMove: onPointerMove,
              onPointerUp: endDrag,
              onPointerCancel: endDrag,
              onPointerLeave: function () {
                setHover(null);
                endDrag();
              },
              onDoubleClick: resetView,
            },
            h(
              'defs',
              null,
              h(
                'clipPath',
                { id: clipId },
                h('rect', { x: plotLeft, y: plotTop, width: plotW, height: plotH }),
              ),
              h(
                'marker',
                {
                  id: clipId + '-arrow',
                  markerWidth: 7,
                  markerHeight: 7,
                  refX: 6,
                  refY: 3,
                  orient: 'auto',
                  markerUnits: 'userSpaceOnUse',
                },
                h('path', { d: 'M0,0 L6,3 L0,6 Z', fill: 'var(--ml-fg2)' }),
              ),
            ),
            h(
              'g',
              { 'aria-hidden': 'true' },
              /* grid */
              xTicks.values.map(function (value, index) {
                const x = xScale.map(value);
                if (x < plotLeft - 0.5 || x > plotRight + 0.5) return null;
                const major = Math.abs(value) < 1e-9;
                return h('line', {
                  key: 'gx' + index,
                  x1: x,
                  x2: x,
                  y1: plotTop,
                  y2: plotBottom,
                  className: major ? 'ml-grid-line-major' : 'ml-grid-line',
                });
              }),
              yTicks.values.map(function (value, index) {
                const y = yScale.map(value);
                if (y < plotTop - 0.5 || y > plotBottom + 0.5) return null;
                const major = Math.abs(value) < 1e-9;
                return h('line', {
                  key: 'gy' + index,
                  x1: plotLeft,
                  x2: plotRight,
                  y1: y,
                  y2: y,
                  className: major ? 'ml-grid-line-major' : 'ml-grid-line',
                });
              }),
              /* axes */
              h('line', { x1: plotLeft, x2: plotRight, y1: axisX, y2: axisX, className: 'ml-axis-line' }),
              h('line', { x1: axisY, x2: axisY, y1: plotTop, y2: plotBottom, className: 'ml-axis-line' }),
              /* tick labels */
              xTicks.values.map(function (value, index) {
                const x = xScale.map(value);
                if (x < plotLeft - 2 || x > plotRight + 2) return null;
                return h(
                  'text',
                  {
                    key: 'tx' + index,
                    x: x,
                    y: plotBottom + 15,
                    className: 'ml-tick-label',
                    textAnchor: 'middle',
                  },
                  ML.fmtNum(value, 4),
                );
              }),
              yTicks.values.map(function (value, index) {
                const y = yScale.map(value);
                if (y < plotTop - 2 || y > plotBottom + 2) return null;
                return h(
                  'text',
                  {
                    key: 'ty' + index,
                    x: plotLeft - 7,
                    y: y + 3.5,
                    className: 'ml-tick-label',
                    textAnchor: 'end',
                  },
                  ML.fmtNum(value, 4),
                );
              }),
              /* axis titles */
              props.xLabel
                ? h(
                    'text',
                    {
                      x: plotRight - 2,
                      y: plotBottom + 30,
                      className: 'ml-axis-label',
                      textAnchor: 'end',
                    },
                    props.xLabel,
                  )
                : null,
              props.yLabel
                ? h(
                    'text',
                    {
                      x: plotLeft - 40,
                      y: plotTop + 2,
                      className: 'ml-axis-label',
                      textAnchor: 'start',
                    },
                    props.yLabel,
                  )
                : null,
              /* curves */
              h(
                'g',
                { clipPath: 'url(#' + clipId + ')' },
                segments.map(function (segment, index) {
                  const points = ML.toArr(segment.points)
                    .map(function (point) {
                      const x = Number(point && point[0]);
                      const y = Number(point && point[1]);
                      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
                      return [xScale.map(x), yScale.map(y)];
                    })
                    .filter(Boolean);
                  if (points.length === 0) return null;
                  const d = ML.pointPath(points);
                  const color = segment.color || ML.curveColor(segment.colorIndex === undefined ? index : segment.colorIndex);
                  if (segment.type === 'dots') {
                    return h(
                      'g',
                      { key: 'seg' + index },
                      points.map(function (point, pointIndex) {
                        return h('circle', {
                          key: pointIndex,
                          cx: point[0],
                          cy: point[1],
                          r: segment.radius || 2,
                          fill: color,
                        });
                      }),
                    );
                  }
                  return h('path', {
                    key: 'seg' + index,
                    d: d,
                    className: 'ml-curve',
                    style: { stroke: color },
                    strokeDasharray: segment.dashed ? '5 4' : undefined,
                  });
                }),
                markers.map(function (marker, index) {
                  const x = xScale.map(Number(marker[0]));
                  const y = yScale.map(Number(marker[1]));
                  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
                  return h('circle', {
                    key: 'marker' + index,
                    cx: x,
                    cy: y,
                    r: 4,
                    fill: 'var(--ml-brand)',
                    stroke: 'var(--ml-bg)',
                    strokeWidth: 1.5,
                  });
                }),
              ),
              /* vector field arrows */
              h(
                'g',
                { clipPath: 'url(#' + clipId + ')' },
                arrows.map(function (arrow, index) {
                  const x = Number(arrow[0]);
                  const y = Number(arrow[1]);
                  const dx = Number(arrow[2]);
                  const dy = Number(arrow[3]);
                  if (![x, y, dx, dy].every(Number.isFinite)) return null;
                  const x1 = xScale.map(x);
                  const y1 = yScale.map(y);
                  const x2 = xScale.map(x + dx);
                  const y2 = yScale.map(y + dy);
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  const tipX = x2 - Math.cos(angle) * 0.5 * arrowLen;
                  const tipY = y2 - Math.sin(angle) * 0.5 * arrowLen;
                  return h(
                    'g',
                    { key: 'arrow' + index },
                    h('line', {
                      x1: x1,
                      y1: y1,
                      x2: tipX,
                      y2: tipY,
                      className: 'ml-quiver-arrow',
                    }),
                    h('path', {
                      d:
                        'M' +
                        x2 +
                        ',' +
                        y2 +
                        ' L' +
                        (x2 - arrowLen * Math.cos(angle - 0.42)) +
                        ',' +
                        (y2 - arrowLen * Math.sin(angle - 0.42)) +
                        ' L' +
                        (x2 - arrowLen * Math.cos(angle + 0.42)) +
                        ',' +
                        (y2 - arrowLen * Math.sin(angle + 0.42)) +
                        ' Z',
                      fill: 'var(--ml-fg2)',
                    }),
                  );
                }),
              ),
              /* in-SVG legend (also survives SVG export) */
              legendItems.length
                ? h(
                    'g',
                    null,
                    (function () {
                      const shown = legendItems.slice(0, 8);
                      const boxW = Math.min(220, Math.max.apply(null, shown.map(function (label) { return String(label).length * 6.4 + 34; }).concat([80])));
                      const boxX = plotRight - boxW - 6;
                      const boxY = plotTop + 6;
                      const boxH = shown.length * 16 + 10;
                      return h(
                        'g',
                        null,
                        h('rect', {
                          x: boxX,
                          y: boxY,
                          width: boxW,
                          height: boxH,
                          rx: 6,
                          fill: 'var(--ml-bg)',
                          stroke: 'var(--ml-b1)',
                          opacity: 0.92,
                        }),
                        shown.map(function (label, index) {
                          const color = ML.curveColor(index);
                          return h(
                            'g',
                            { key: 'lg' + index },
                            h('line', {
                              x1: boxX + 10,
                              x2: boxX + 24,
                              y1: boxY + 13 + index * 16,
                              y2: boxY + 13 + index * 16,
                              stroke: color,
                              strokeWidth: 2,
                            }),
                            h(
                              'text',
                              {
                                x: boxX + 29,
                                y: boxY + 16.5 + index * 16,
                                className: 'ml-tick-label',
                                style: { fill: 'var(--ml-fg)' },
                              },
                              ML.safeString(label, 26),
                            ),
                          );
                        }),
                      );
                    })(),
                  )
                : null,
            ),
          ),
      legendItems.length
        ? h(
            'div',
            { className: 'ml-plot-legend' },
            legendItems.map(function (label, index) {
              return h(
                'span',
                { className: 'ml-legend-item', key: index },
                h('span', { className: 'ml-legend-swatch', style: { background: ML.curveColor(index) } }),
                h('span', null, label),
              );
            }),
          )
        : null,
      h('div', { className: 'ml-plot-hint' }, props.hint || '滚轮缩放 · 拖拽平移 · 双击重置'),
    );
  };
})();
