/* 57-tab-plot — plotting workbench driven by plot.* data ops and the local SVG renderers. */
(function () {
  'use strict';
  const useState = React.useState;
  const useRef = React.useRef;
  const useEffect = React.useEffect;
  const useMemo = React.useMemo;

  ML.assignStrings(
    {
      'tab.plot': '绘图',
      'plot.title': '函数绘图',
      'plot.hint': '所有图形在浏览器端由 plot.* 数据绘制为 SVG。',
      'plot.mode.explicit': '显式函数',
      'plot.mode.parametric': '参数曲线',
      'plot.mode.polar': '极坐标',
      'plot.mode.implicit': '隐式曲线',
      'plot.mode.field': '向量场',
      'plot.mode.surface3d': '三维曲面',
      'plot.exprs': '表达式（每行一个）',
      'plot.var': '自变量',
      'plot.xRange': 'x 范围',
      'plot.yRange': 'y 范围',
      'plot.range': '参数范围',
      'plot.samples': '采样点数',
      'plot.grid': '网格密度',
      'plot.n': '箭头 / 网格数',
      'plot.paramX': 'x(t)',
      'plot.paramY': 'y(t)',
      'plot.theta': '角度变量',
      'plot.polarR': 'r(θ)',
      'plot.implicitExpr': '方程 F(x, y) = 0',
      'plot.fieldP': 'P(x, y)',
      'plot.fieldQ': 'Q(x, y)',
      'plot.surfaceExpr': 'z = f(x, y)',
      'plot.xVar': 'x 变量',
      'plot.yVar': 'y 变量',
      'plot.rotateHint': '拖动旋转视角，滚轮缩放；可导出 SVG。',
      'plot.panHint': '滚轮缩放 · 拖拽平移 · 双击重置。',
      'plot.invalidRange': '范围必须是两个数字，且 min < max。',
      'plot.invalidNumber': '请输入合法的数字。',
      'plot.noExpr': '请输入至少一个表达式。',
      'plot.curves': '条曲线',
      'plot.arrows': '个箭头',
      'plot.segments': '段轮廓',
      'plot.points': '个点',
      'plot.discontinuity': '断点已自动拆分。',
      'plot.preset': '预设',
      'plot.preset.damped': '阻尼正弦',
      'plot.preset.poly': '多项式族',
      'plot.preset.lissajous': '利萨茹',
      'plot.preset.rose': '玫瑰线',
      'plot.preset.circle': '圆',
      'plot.preset.saddle': '马鞍面',
      'plot.preset.ripple': '涟漪面',
      'plot.preset.vortex': '旋涡场',
      'plot.rawData': '原始数据',
      'plot.exportedNote': '导出使用浏览器端 SVG 序列化。',
    },
    {
      'tab.plot': 'Plot',
      'plot.title': 'Plotting',
      'plot.hint': 'Every figure is rendered client-side as SVG from plot.* data.',
      'plot.mode.explicit': 'Explicit',
      'plot.mode.parametric': 'Parametric',
      'plot.mode.polar': 'Polar',
      'plot.mode.implicit': 'Implicit',
      'plot.mode.field': 'Vector field',
      'plot.mode.surface3d': '3-D surface',
      'plot.exprs': 'Expressions (one per line)',
      'plot.var': 'Variable',
      'plot.xRange': 'x range',
      'plot.yRange': 'y range',
      'plot.range': 'Parameter range',
      'plot.samples': 'Samples',
      'plot.grid': 'Grid',
      'plot.n': 'Arrows / grid size',
      'plot.paramX': 'x(t)',
      'plot.paramY': 'y(t)',
      'plot.theta': 'Angle variable',
      'plot.polarR': 'r(θ)',
      'plot.implicitExpr': 'Equation F(x, y) = 0',
      'plot.fieldP': 'P(x, y)',
      'plot.fieldQ': 'Q(x, y)',
      'plot.surfaceExpr': 'z = f(x, y)',
      'plot.xVar': 'x variable',
      'plot.yVar': 'y variable',
      'plot.rotateHint': 'Drag to rotate, wheel to zoom; SVG export available.',
      'plot.panHint': 'Wheel zoom · drag pan · double-click reset.',
      'plot.invalidRange': 'A range needs two numbers with min < max.',
      'plot.invalidNumber': 'Enter a valid number.',
      'plot.noExpr': 'Enter at least one expression.',
      'plot.curves': 'curves',
      'plot.arrows': 'arrows',
      'plot.segments': 'contour segments',
      'plot.points': 'points',
      'plot.discontinuity': 'Discontinuities split automatically.',
      'plot.preset': 'Presets',
      'plot.preset.damped': 'Damped sine',
      'plot.preset.poly': 'Polynomial family',
      'plot.preset.lissajous': 'Lissajous',
      'plot.preset.rose': 'Rose curve',
      'plot.preset.circle': 'Circle',
      'plot.preset.saddle': 'Saddle',
      'plot.preset.ripple': 'Ripple',
      'plot.preset.vortex': 'Vortex field',
      'plot.rawData': 'Raw data',
      'plot.exportedNote': 'Export serialises the browser SVG.',
    },
  );

  const MODES = ['explicit', 'parametric', 'polar', 'implicit', 'field', 'surface3d'];

  function parseRange(minText, maxText) {
    const min = parseFloat(String(minText).replace('−', '-'));
    const max = parseFloat(String(maxText).replace('−', '-'));
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { range: null, error: 'number' };
    if (!(min < max)) return { range: null, error: 'order' };
    return { range: [min, max], error: null };
  }

  function RangeFields(props) {
    const t = props.t;
    return h(
      'div',
      { className: 'ml-row', style: { alignItems: 'flex-end', gap: 8 } },
      h(
        'div',
        { className: 'ml-field', style: { width: 96 } },
        h('label', { className: 'ml-label', htmlFor: props.id + '-min' }, props.label + ' min'),
        h('input', {
          id: props.id + '-min',
          className: 'ml-input',
          value: props.min,
          inputMode: 'decimal',
          onChange: function (event) {
            props.onMin(event.target.value);
          },
        }),
      ),
      h(
        'div',
        { className: 'ml-field', style: { width: 96 } },
        h('label', { className: 'ml-label', htmlFor: props.id + '-max' }, props.label + ' max'),
        h('input', {
          id: props.id + '-max',
          className: 'ml-input',
          value: props.max,
          inputMode: 'decimal',
          onChange: function (event) {
            props.onMax(event.target.value);
          },
        }),
      ),
      props.hint ? h('span', { className: 'ml-hint' }, props.hint) : null,
    );
  }

  /** Normalize `plot.sample*` curve payloads into renderer segments. */
  function curveSegments(curves) {
    const segments = [];
    ML.toArr(curves).forEach(function (curve, curveIndex) {
      const raw = curve && curve.points !== undefined ? curve.points : curve;
      if (!Array.isArray(raw) || raw.length === 0) return;
      const first = raw[0];
      const isPolyline = Array.isArray(first) && first.length >= 1 && typeof first[0] === 'number';
      const polylines = isPolyline ? [raw] : raw;
      polylines.forEach(function (points) {
        const clean = ML.toArr(points).filter(function (point) {
          return Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1]));
        });
        if (clean.length === 0) return;
        segments.push({
          points: clean.map(function (point) {
            return [Number(point[0]), Number(point[1])];
          }),
          label: curve && curve.expr !== undefined ? String(curve.expr) : undefined,
          colorIndex: curveIndex,
        });
      });
    });
    return segments;
  }

  ML.tabs.plot = {
    id: 'plot',
    order: 80,
    Component: function PlotTab(props) {
      const t = ML.useT();
      const [mode, setMode] = useState('explicit');
      const [exprs, setExprs] = useState('sin(x)\ncos(x)\nx**2/8');
      const [variable, setVariable] = useState('x');
      const [xMin, setXMin] = useState('-6');
      const [xMax, setXMax] = useState('6');
      const [yMin, setYMin] = useState('-3');
      const [yMax, setYMax] = useState('3');
      const [tMin, setTMin] = useState('0');
      const [tMax, setTMax] = useState('6.283');
      const [samples, setSamples] = useState('480');
      const [gridN, setGridN] = useState('120');
      const [arrowN, setArrowN] = useState('17');
      const [paramX, setParamX] = useState('sin(3*t)');
      const [paramY, setParamY] = useState('sin(2*t)');
      const [theta, setTheta] = useState('theta');
      const [polarR, setPolarR] = useState('cos(3*theta)');
      const [implicitExpr, setImplicitExpr] = useState('x**2 + y**2 - 4');
      const [fieldP, setFieldP] = useState('-y');
      const [fieldQ, setFieldQ] = useState('x');
      const [surfaceExpr, setSurfaceExpr] = useState('sin(x)*cos(y)');
      const [surfaceN, setSurfaceN] = useState('36');
      const [localError, setLocalError] = useState(null);
      const [lastMode, setLastMode] = useState('explicit');
      const [runSeq, setRunSeq] = useState(0);
      const call = ML.useCall();
      const lastRun = useRef(null);
      const startedRef = useRef(false);

      const execute = function (opName, args, renderMode) {
        lastRun.current = { op: opName, args: args };
        setLastMode(renderMode);
        setLocalError(null);
        setRunSeq(function (previous) {
          return previous + 1;
        });
        call.run(opName, args);
      };

      const run = function () {
        const sampleCount = parseInt(samples, 10);
        const nValue = parseInt(mode === 'field' ? arrowN : mode === 'surface3d' ? surfaceN : gridN, 10);
        const xr = parseRange(xMin, xMax);
        const yr = parseRange(yMin, yMax);
        const tr = parseRange(tMin, tMax);
        const fail = function (message) {
          setLocalError(message);
        };
        if (mode === 'explicit') {
          const list = ML.lines(exprs);
          if (list.length === 0) return fail(t('plot.noExpr'));
          if (xr.error) return fail(t('plot.invalidRange'));
          execute('plot.sample_multi', {
            exprs: list,
            var: variable.trim() || 'x',
            range: xr.range,
            samples: Number.isFinite(sampleCount) && sampleCount > 1 ? sampleCount : 400,
          }, 'explicit');
          return;
        }
        if (mode === 'parametric') {
          if (!paramX.trim() || !paramY.trim()) return fail(t('plot.noExpr'));
          if (tr.error) return fail(t('plot.invalidRange'));
          execute('plot.parametric', {
            x: paramX,
            y: paramY,
            t: 't',
            range: tr.range,
            samples: Number.isFinite(sampleCount) && sampleCount > 1 ? sampleCount : 400,
          }, 'parametric');
          return;
        }
        if (mode === 'polar') {
          if (!polarR.trim()) return fail(t('plot.noExpr'));
          if (tr.error) return fail(t('plot.invalidRange'));
          execute('plot.polar', {
            r: polarR,
            theta: theta.trim() || 'theta',
            range: tr.range,
            samples: Number.isFinite(sampleCount) && sampleCount > 1 ? sampleCount : 400,
          }, 'polar');
          return;
        }
        if (mode === 'implicit') {
          if (!implicitExpr.trim()) return fail(t('plot.noExpr'));
          if (xr.error || yr.error) return fail(t('plot.invalidRange'));
          execute('plot.implicit', {
            expr: implicitExpr,
            xRange: xr.range,
            yRange: yr.range,
            grid: Number.isFinite(nValue) && nValue >= 20 ? nValue : 120,
          }, 'implicit');
          return;
        }
        if (mode === 'field') {
          if (!fieldP.trim() || !fieldQ.trim()) return fail(t('plot.noExpr'));
          if (xr.error || yr.error) return fail(t('plot.invalidRange'));
          execute('plot.field', {
            P: fieldP,
            Q: fieldQ,
            xVar: 'x',
            yVar: 'y',
            xRange: xr.range,
            yRange: yr.range,
            n: Number.isFinite(nValue) && nValue > 1 ? nValue : 17,
            normalize: true,
          }, 'field');
          return;
        }
        if (mode === 'surface3d') {
          if (!surfaceExpr.trim()) return fail(t('plot.noExpr'));
          if (xr.error || yr.error) return fail(t('plot.invalidRange'));
          execute('plot.surface3d', {
            expr: surfaceExpr,
            xVar: 'x',
            yVar: 'y',
            xRange: xr.range,
            yRange: yr.range,
            n: Number.isFinite(nValue) && nValue >= 8 ? nValue : 36,
          }, 'surface3d');
        }
      };

      const applyPreset = function (preset) {
        if (preset === 'damped') {
          setMode('explicit');
          setExprs('exp(-x/6)*sin(2*x)');
          setVariable('x');
          setXMin('0');
          setXMax('18');
          setYMin('-1');
          setYMax('1');
          setMode('explicit');
          execute('plot.sample_multi', { exprs: ['exp(-x/6)*sin(2*x)'], var: 'x', range: [0, 18], samples: 480 }, 'explicit');
        } else if (preset === 'poly') {
          setMode('explicit');
          setExprs('x\nx**2/4\nx**3/16');
          setXMin('-4');
          setXMax('4');
          execute(
            'plot.sample_multi',
            { exprs: ['x', 'x**2/4', 'x**3/16'], var: 'x', range: [-4, 4], samples: 480 },
            'explicit',
          );
        } else if (preset === 'lissajous') {
          setMode('parametric');
          setParamX('sin(3*t)');
          setParamY('sin(2*t)');
          setTMin('0');
          setTMax('6.283');
          execute('plot.parametric', { x: 'sin(3*t)', y: 'sin(2*t)', t: 't', range: [0, 6.283], samples: 480 }, 'parametric');
        } else if (preset === 'rose') {
          setMode('polar');
          setPolarR('cos(3*theta)');
          setTMin('0');
          setTMax('6.283');
          execute('plot.polar', { r: 'cos(3*theta)', theta: 'theta', range: [0, 6.283], samples: 480 }, 'polar');
        } else if (preset === 'circle') {
          setMode('implicit');
          setImplicitExpr('x**2 + y**2 - 4');
          setXMin('-3');
          setXMax('3');
          setYMin('-3');
          setYMax('3');
          execute('plot.implicit', { expr: 'x**2 + y**2 - 4', xRange: [-3, 3], yRange: [-3, 3], grid: 140 }, 'implicit');
        } else if (preset === 'saddle') {
          setMode('surface3d');
          setSurfaceExpr('x**2 - y**2');
          setXMin('-2');
          setXMax('2');
          setYMin('-2');
          setYMax('2');
          execute('plot.surface3d', { expr: 'x**2 - y**2', xVar: 'x', yVar: 'y', xRange: [-2, 2], yRange: [-2, 2], n: 32 }, 'surface3d');
        } else if (preset === 'ripple') {
          setMode('surface3d');
          setSurfaceExpr('sin(sqrt(x**2+y**2)*2)/(1+sqrt(x**2+y**2))');
          execute(
            'plot.surface3d',
            { expr: 'sin(sqrt(x**2+y**2)*2)/(1+sqrt(x**2+y**2))', xVar: 'x', yVar: 'y', xRange: [-6, 6], yRange: [-6, 6], n: 44 },
            'surface3d',
          );
        } else if (preset === 'vortex') {
          setMode('field');
          setFieldP('-y');
          setFieldQ('x');
          execute('plot.field', { P: '-y', Q: 'x', xVar: 'x', yVar: 'y', xRange: [-3, 3], yRange: [-3, 3], n: 17, normalize: true }, 'field');
        }
      };

      const view = useMemo(function () {
        const data = call.result;
        if (!data) return { kind: lastMode };
        if (lastMode === 'explicit') {
          return {
            kind: lastMode,
            segments: curveSegments(data.curves),
            xRange: Array.isArray(data.range) ? data.range : null,
            yRange: Array.isArray(data.yRange) ? data.yRange : null,
            filename: 'mathlab-curves.svg',
          };
        }
        if (lastMode === 'parametric' || lastMode === 'polar') {
          const points = ML.toArr(data.points).filter(function (point) {
            return Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1]));
          }).map(function (point) {
            return [Number(point[0]), Number(point[1])];
          });
          return {
            kind: lastMode,
            segments: points.length
              ? [
                  {
                    points: points,
                    label: lastMode === 'parametric' ? 'x(t), y(t)' : 'r(θ)',
                    colorIndex: 0,
                  },
                ]
              : [],
            filename: 'mathlab-' + lastMode + '.svg',
          };
        }
        if (lastMode === 'implicit') {
          const segments = ML.toArr(data.segments).map(function (segment, index) {
            return {
              points: ML.toArr(segment).map(function (point) {
                return [Number(point[0]), Number(point[1])];
              }),
              colorIndex: 0,
            };
          });
          return {
            kind: lastMode,
            segments: segments,
            xRange: [parseFloat(xMin), parseFloat(xMax)],
            yRange: [parseFloat(yMin), parseFloat(yMax)],
            filename: 'mathlab-implicit.svg',
          };
        }
        if (lastMode === 'field') {
          return {
            kind: lastMode,
            arrows: ML.toArr(data.arrows),
            xRange: [parseFloat(xMin), parseFloat(xMax)],
            yRange: [parseFloat(yMin), parseFloat(yMax)],
            filename: 'mathlab-field.svg',
          };
        }
        return { kind: lastMode };
      }, [call.result, lastMode]);

      React.useEffect(
        function () {
          if (!props.active || startedRef.current) return;
          startedRef.current = true;
          run();
        },
        [props.active],
      );

      React.useEffect(
        function () {
          if (!props.openAction) return;
          const action = props.openAction;
          const args = action.args || {};
          const opName = String(action.op || '');
          if (opName.indexOf('plot.') !== 0) return;
          setRunSeq(function (previous) {
            return previous + 1;
          });
          if (opName === 'plot.sample_multi' || opName === 'plot.sample') {
            setMode('explicit');
            if (Array.isArray(args.exprs)) setExprs(args.exprs.join('\n'));
            else if (typeof args.expr === 'string') setExprs(args.expr);
            if (Array.isArray(args.range)) {
              setXMin(String(args.range[0]));
              setXMax(String(args.range[1]));
            }
            lastRun.current = { op: opName === 'plot.sample' ? 'plot.sample_multi' : opName, args: args };
            setLastMode('explicit');
            call.run(opName === 'plot.sample' ? 'plot.sample' : 'plot.sample_multi', args);
          } else if (opName === 'plot.parametric') {
            setMode('parametric');
            if (args.x) setParamX(args.x);
            if (args.y) setParamY(args.y);
            if (Array.isArray(args.range)) {
              setTMin(String(args.range[0]));
              setTMax(String(args.range[1]));
            }
            lastRun.current = { op: opName, args: args };
            setLastMode('parametric');
            call.run(opName, args);
          } else if (opName === 'plot.polar') {
            setMode('polar');
            if (args.r) setPolarR(args.r);
            if (Array.isArray(args.range)) {
              setTMin(String(args.range[0]));
              setTMax(String(args.range[1]));
            }
            lastRun.current = { op: opName, args: args };
            setLastMode('polar');
            call.run(opName, args);
          } else if (opName === 'plot.implicit') {
            setMode('implicit');
            if (args.expr) setImplicitExpr(args.expr);
            if (Array.isArray(args.xRange)) {
              setXMin(String(args.xRange[0]));
              setXMax(String(args.xRange[1]));
            }
            if (Array.isArray(args.yRange)) {
              setYMin(String(args.yRange[0]));
              setYMax(String(args.yRange[1]));
            }
            lastRun.current = { op: opName, args: args };
            setLastMode('implicit');
            call.run(opName, args);
          } else if (opName === 'plot.field') {
            setMode('field');
            if (args.P) setFieldP(args.P);
            if (args.Q) setFieldQ(args.Q);
            lastRun.current = { op: opName, args: args };
            setLastMode('field');
            call.run(opName, args);
          } else if (opName === 'plot.surface3d') {
            setMode('surface3d');
            if (args.expr) setSurfaceExpr(args.expr);
            lastRun.current = { op: opName, args: args };
            setLastMode('surface3d');
            call.run(opName, args);
          }
        },
        [props.openAction && props.openAction.seq],
      );

      const modeTabs = MODES.map(function (id) {
        return { id: id, label: t('plot.mode.' + id) };
      });

      const modeForm = function () {
        if (mode === 'explicit') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.exprs'),
              children: (id) =>
                h(ML.Textarea, {
                  id: id,
                  rows: 4,
                  value: exprs,
                  onChange: function (event) {
                    setExprs(event.target.value);
                  },
                }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(ML.Field, {
                label: t('plot.var'),
                inline: true,
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: variable,
                    style: { width: 70 },
                    onChange: function (event) {
                      setVariable(event.target.value);
                    },
                  }),
              }),
              h(RangeFields, {
                t: t,
                id: 'plot-x',
                label: t('plot.xRange'),
                min: xMin,
                max: xMax,
                onMin: setXMin,
                onMax: setXMax,
              }),
              h(ML.Field, {
                label: t('plot.samples'),
                children: (id) =>
                  h(ML.Input, {
                    id: id,
                    value: samples,
                    inputMode: 'numeric',
                    style: { width: 90 },
                    onChange: function (event) {
                      setSamples(event.target.value);
                    },
                  }),
              }),
            ),
          );
        }
        if (mode === 'parametric') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.paramX'),
              children: (id) =>
                h(ML.Input, { id: id, value: paramX, className: 'ml-mono', onChange: function (event) { setParamX(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('plot.paramY'),
              children: (id) =>
                h(ML.Input, { id: id, value: paramY, className: 'ml-mono', onChange: function (event) { setParamY(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(RangeFields, { t: t, id: 'plot-t', label: 't', min: tMin, max: tMax, onMin: setTMin, onMax: setTMax }),
              h(ML.Field, {
                label: t('plot.samples'),
                children: (id) =>
                  h(ML.Input, { id: id, value: samples, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setSamples(event.target.value); } }),
              }),
            ),
          );
        }
        if (mode === 'polar') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.polarR'),
              children: (id) =>
                h(ML.Input, { id: id, value: polarR, className: 'ml-mono', onChange: function (event) { setPolarR(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(ML.Field, {
                label: t('plot.theta'),
                inline: true,
                children: (id) =>
                  h(ML.Input, { id: id, value: theta, style: { width: 90 }, onChange: function (event) { setTheta(event.target.value); } }),
              }),
              h(RangeFields, { t: t, id: 'plot-theta', label: 'θ', min: tMin, max: tMax, onMin: setTMin, onMax: setTMax }),
              h(ML.Field, {
                label: t('plot.samples'),
                children: (id) =>
                  h(ML.Input, { id: id, value: samples, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setSamples(event.target.value); } }),
              }),
            ),
          );
        }
        if (mode === 'implicit') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.implicitExpr'),
              children: (id) =>
                h(ML.Input, { id: id, value: implicitExpr, className: 'ml-mono', onChange: function (event) { setImplicitExpr(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(RangeFields, { t: t, id: 'plot-ix', label: t('plot.xRange'), min: xMin, max: xMax, onMin: setXMin, onMax: setXMax }),
              h(RangeFields, { t: t, id: 'plot-iy', label: t('plot.yRange'), min: yMin, max: yMax, onMin: setYMin, onMax: setYMax }),
              h(ML.Field, {
                label: t('plot.grid'),
                children: (id) =>
                  h(ML.Input, { id: id, value: gridN, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setGridN(event.target.value); } }),
              }),
            ),
          );
        }
        if (mode === 'field') {
          return h(
            'div',
            { className: 'ml-stack-sm' },
            h(ML.Field, {
              label: t('plot.fieldP'),
              children: (id) =>
                h(ML.Input, { id: id, value: fieldP, className: 'ml-mono', onChange: function (event) { setFieldP(event.target.value); } }),
            }),
            h(ML.Field, {
              label: t('plot.fieldQ'),
              children: (id) =>
                h(ML.Input, { id: id, value: fieldQ, className: 'ml-mono', onChange: function (event) { setFieldQ(event.target.value); } }),
            }),
            h(
              'div',
              { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
              h(RangeFields, { t: t, id: 'plot-fx', label: t('plot.xRange'), min: xMin, max: xMax, onMin: setXMin, onMax: setXMax }),
              h(RangeFields, { t: t, id: 'plot-fy', label: t('plot.yRange'), min: yMin, max: yMax, onMin: setYMin, onMax: setYMax }),
              h(ML.Field, {
                label: t('plot.n'),
                children: (id) =>
                  h(ML.Input, { id: id, value: arrowN, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setArrowN(event.target.value); } }),
              }),
            ),
          );
        }
        return h(
          'div',
          { className: 'ml-stack-sm' },
          h(ML.Field, {
            label: t('plot.surfaceExpr'),
            children: (id) =>
              h(ML.Input, { id: id, value: surfaceExpr, className: 'ml-mono', onChange: function (event) { setSurfaceExpr(event.target.value); } }),
          }),
          h(
            'div',
            { className: 'ml-row', style: { alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' } },
            h(RangeFields, { t: t, id: 'plot-sx', label: t('plot.xRange'), min: xMin, max: xMax, onMin: setXMin, onMax: setXMax }),
            h(RangeFields, { t: t, id: 'plot-sy', label: t('plot.yRange'), min: yMin, max: yMax, onMin: setYMin, onMax: setYMax }),
            h(ML.Field, {
              label: t('plot.n'),
              children: (id) =>
                h(ML.Input, { id: id, value: surfaceN, inputMode: 'numeric', style: { width: 90 }, onChange: function (event) { setSurfaceN(event.target.value); } }),
            }),
          ),
        );
      };

      const presets = [
        { id: 'damped', label: t('plot.preset.damped') },
        { id: 'poly', label: t('plot.preset.poly') },
        { id: 'lissajous', label: t('plot.preset.lissajous') },
        { id: 'rose', label: t('plot.preset.rose') },
        { id: 'circle', label: t('plot.preset.circle') },
        { id: 'saddle', label: t('plot.preset.saddle') },
        { id: 'ripple', label: t('plot.preset.ripple') },
        { id: 'vortex', label: t('plot.preset.vortex') },
      ];

      const result = call.result || {};
      const notes = ML.toArr(result.note || result.notes);
      const counts = [];
      if (view.kind === 'explicit') counts.push(ML.toArr(view.segments).length + ' ' + t('plot.segments'));
      if (view.kind === 'field') counts.push(ML.toArr(view.arrows).length + ' ' + t('plot.arrows'));
      if (view.kind === 'parametric' || view.kind === 'polar') counts.push(ML.toArr(result.points).length + ' ' + t('plot.points'));
      if (view.kind === 'implicit') counts.push(ML.toArr(view.segments).length + ' ' + t('plot.segments'));

      return h(
        'div',
        { className: 'ml-stack' },
        h(ML.SectionTitle, { hint: t('plot.hint') }, t('plot.title')),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-bd' },
            h(ML.Tabs, {
              items: modeTabs,
              value: mode,
              onChange: function (next) {
                setMode(next);
                setLocalError(null);
              },
              size: 'sm',
              ariaLabel: t('plot.title'),
            }),
            h('div', { style: { marginTop: 12 } }, modeForm()),
            h(
              'div',
              { className: 'ml-toolbar' },
              h(ML.Btn, { variant: 'primary', onClick: run, disabled: call.loading }, call.loading ? t('common.running') : t('common.run')),
              props.engine && props.engine.status !== 'ready'
                ? h('span', { className: 'ml-hint' }, t('engine.starting'))
                : null,
              h('span', { className: 'ml-hint' }, t('plot.preset')),
              presets.map(function (preset) {
                return h(
                  'button',
                  {
                    key: preset.id,
                    type: 'button',
                    className: 'ml-chip',
                    onClick: function () {
                      applyPreset(preset.id);
                    },
                  },
                  preset.label,
                );
              }),
            ),
            localError ? h(ML.Banner, { tone: 'error' }, localError) : null,
          ),
        ),
        h(
          'div',
          { className: 'ml-card' },
          h(
            'div',
            { className: 'ml-card-hd' },
            h('h2', { className: 'ml-card-title' }, t('common.result')),
            h('span', { className: 'ml-hint' }, call.op || ''),
            call.elapsed !== null ? h('span', { className: 'ml-hint' }, call.elapsed + ' ms') : null,
            counts.length ? h('span', { className: 'ml-hint' }, counts.join(' · ')) : null,
          ),
          h(
            'div',
            { className: 'ml-card-bd' },
            call.loading
              ? h(ML.Loading, null)
              : call.error
                ? h(ML.ErrorBox, {
                    error: call.error,
                    onRetry: function () {
                      if (lastRun.current) call.run(lastRun.current.op, lastRun.current.args);
                    },
                  })
                : !call.result
                  ? h(ML.Empty, { label: t('common.noResult') })
                  : view.kind === 'surface3d'
                    ? h(ML.Surface3D, {
                        vertices: result.vertices,
                        indices: result.indices,
                        title: t('plot.mode.surface3d'),
                        filename: 'mathlab-surface.svg',
                      })
                    : h(ML.Plot2D, {
                        segments: view.segments || [],
                        arrows: view.arrows || [],
                        xRange: view.xRange,
                        yRange: view.yRange,
                        xLabel: view.kind === 'polar' ? 'x' : 'x',
                        yLabel: 'y',
                        resetKey: runSeq + ':' + lastMode,
                        filename: view.filename,
                        hint: view.kind === 'field' ? t('plot.panHint') : t('plot.panHint'),
                      }),
            notes.length
              ? h(ML.Notes, { notes: notes.concat(view.kind === 'explicit' ? [t('plot.discontinuity')] : []) })
              : view.kind === 'explicit' && call.result
                ? h(ML.Notes, { notes: [t('plot.discontinuity')] })
                : null,
            call.result ? h(ML.RawJSON, { value: view.kind === 'surface3d' ? { zRange: result.zRange, note: result.note } : call.result }) : null,
          ),
        ),
      );
    },
  };
})();
