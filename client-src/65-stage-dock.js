/* 65-stage-dock — conversation dock, placement prefs and registration.
 *
 * Depends on 64-stage-tab for StageTab; styles and i18n are loaded there. */
(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const tr = ML.stageStore.tr;
  const normalizeStagePayload = ML.stageStore.normalizeStagePayload;
  const useStageStream = ML.stageTransport.useStageStream;
  const StageTab = ML.StageTab;


  /* ------------------------------------------------------- conversation dock */

  ML.CSS += `
  .stage-dock { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 12px; margin: 0 0 8px; overflow: hidden; }
  .stage-dock-bar { display: flex; align-items: center; gap: 8px; padding: 7px 10px; min-height: 34px; }
  .stage-dock-badge { flex: none; font-size: 11px; font-weight: 700; letter-spacing: .04em; color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent); border-radius: 999px; padding: 2px 8px; }
  .stage-dock-title { flex: 1 1 auto; min-width: 0; text-align: left; background: none; border: 0; padding: 0; margin: 0; color: inherit; font: inherit; font-weight: 600; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stage-dock-title:hover { text-decoration: underline; }
  .stage-dock-meta { flex: none; font-size: 12px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
  .stage-dock-body { border-top: 1px solid var(--dsw-alias-border-l1); max-height: min(62vh, 720px); overflow: auto; padding: 10px; background: var(--dsw-alias-bg-layer-1); }
  .stage-root-embedded { padding: 0; }
  .stage-root-embedded .stage-hd { padding: 4px 0 8px; }
  .stage-root-embedded .stage-hd-text { display: none; }
  .stage-surface-switch { display: inline-flex; flex: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; overflow: hidden; }
  .stage-surface-btn { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 2px 8px; font-size: 11px; line-height: 18px; cursor: pointer; }
  .stage-surface-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
  .stage-surface-btn.is-active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }
  .stage-native-host { height: 100%; min-height: 0; overflow: auto; box-sizing: border-box; padding: 8px 10px 16px; background: var(--dsw-alias-bg-base); }
  .stage-root-pinned { gap: 0; }
  .stage-pin { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; gap: 6px; padding: 2px 0 6px; margin-bottom: 8px; background: var(--dsw-alias-bg-base); border-bottom: 1px solid var(--dsw-alias-border-l1); }
  .stage-root-pinned .stage-block { scroll-margin-top: 190px; }
  .stage-zoomctl { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .stage-zoom-btn { appearance: none; cursor: pointer; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 6px; min-width: 26px; height: 22px; padding: 0 6px; font-size: 11px; line-height: 1; }
  .stage-zoom-btn:hover { background: var(--dsw-alias-bg-layer-1); }
  .stage-zoom-val { min-width: 38px; text-align: center; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
  .stage-prefs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 10px; margin-bottom: 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font-size: 12px; }
  .stage-prefs-title { font-weight: 600; color: var(--dsw-alias-label-primary); }
  .stage-prefs-hint { color: var(--dsw-alias-label-secondary); font-size: 11px; }
  .stage-pref { appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); border-radius: 999px; padding: 2px 8px 2px 4px; font-size: 11px; line-height: 18px; }
  .stage-pref-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--dsw-alias-border-l1); transition: background .12s ease; }
  .stage-pref.is-on { color: var(--dsw-alias-label-primary); }
  .stage-pref.is-on .stage-pref-dot { background: var(--dsw-alias-brand-primary); }
  .stage-native-tab-title { display: inline-flex; align-items: center; gap: 5px; }
  .stage-select-ask {
    position: fixed; z-index: 90; appearance: none; cursor: pointer;
    padding: 6px 10px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
    font-size: 12px; font-weight: 600; box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
  }
  .stage-select-ask:hover { background: var(--dsw-alias-bg-layer-2); }
  .stage-ask-pop {
    position: fixed; z-index: 91; width: 320px; max-width: calc(100vw - 24px);
    padding: 10px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1); box-shadow: 0 16px 44px rgba(0, 0, 0, .24);
    display: flex; flex-direction: column; gap: 8px;
  }
  .stage-ask-quote { font-size: 12px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 8px; padding: 6px 8px; max-height: 92px; overflow: auto; }
  .stage-ask-input { width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: inherit; padding: 6px 8px; font: inherit; font-size: 13px; }
  .stage-ask-actions { display: flex; justify-content: flex-end; gap: 6px; }
  .stage-symbol-focus { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); font-size: 12px; }
  .stage-symbol-focus-label { flex: 1 1 auto; color: var(--dsw-alias-label-secondary); }
  .stage-symbol-focus-clear { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); cursor: pointer; font-size: 12px; }
  .stage-block.is-symbol-focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, transparent); border-radius: 10px; }
  .stage-chip.is-active { border-color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); }
  .stage-sym-graph { margin-top: 8px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 8px; }
  .stage-sym-graph-line { stroke: var(--dsw-alias-border-l1); stroke-width: 1; opacity: .65; }
  .stage-sym-graph-line.is-active { stroke: var(--dsw-alias-brand-primary); stroke-width: 1.6; opacity: 1; }
  .stage-sym-graph-dot { fill: var(--dsw-alias-label-secondary); }
  .stage-sym-graph-dot.is-active { fill: var(--dsw-alias-brand-primary); }
  .stage-sym-graph-label { fill: var(--dsw-alias-label-primary); font-size: 11px; cursor: pointer; }
  .stage-sym-graph-label.is-active { fill: var(--dsw-alias-brand-primary); font-weight: 600; }
  .stage-sym-graph-step { fill: var(--dsw-alias-brand-primary); font-size: 10px; cursor: pointer; }
  `;


  function StageDock(props) {
    const t = ML.useT();
    const prefs = ML.useStagePrefs();
    const sessionId = typeof props.sessionId === 'string' && props.sessionId !== '' ? props.sessionId : undefined;
    const [doc, setDoc] = useState({ stage: null, revision: null });
    const [surface, setSurface] = useState(function () {
      try {
        const stored = ML.storage.get('stage.surface', 'right');
        return stored === 'inline' || stored === 'off' ? stored : 'right';
      } catch (storageError) {
        return 'right';
      }
    });
    const aliveRef = useRef(true);
    const bodyRef = useRef(null);
    const lastStageIdRef = useRef(null);

    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);

    useEffect(
      function () {
        if (!sessionId) return undefined;
        let alive = true;
        let timer = null;
        const tick = function () {
          if (!alive) return;
          ML.callMath('stage.get', { sessionId: sessionId })
            .then(function (payload) {
              if (!alive) return;
              const normalized = normalizeStagePayload(payload);
              setDoc({ stage: normalized.stage, revision: normalized.revision });
            })
            .catch(function () {
              /* dock hides itself rather than blocking the composer */
            })
            .then(function () {
              if (alive) timer = setTimeout(tick, 2000);
            });
        };
        tick();
        return function () {
          alive = false;
          clearTimeout(timer);
        };
      },
      [sessionId],
    );

    useStageStream(sessionId, function () {
      if (!sessionId) return;
      ML.callMath('stage.get', { sessionId: sessionId })
        .then(function (payload) {
          if (!aliveRef.current) return;
          const normalized = normalizeStagePayload(payload);
          setDoc({ stage: normalized.stage, revision: normalized.revision });
        })
        .catch(function () {
          /* polling remains */
        });
    });

    const stage = doc.stage;
    const blocks = ML.toArr(stage && stage.blocks);
    const stageId = stage && typeof stage.id === 'string' ? stage.id : null;

    const applySurface = function (next) {
      if (next === 'right' && !prefs.right) return;
      setSurface(next);
      try {
        ML.storage.set('stage.surface', next);
      } catch (storageError) {
        /* preference is a convenience */
      }
      if (next === 'right') {
        if (typeof ML.openStageRight !== 'function' || !ML.openStageRight()) {
          setSurface('inline');
          try {
            ML.storage.set('stage.surface', 'inline');
          } catch (storageError) {
            /* preference is a convenience */
          }
        }
      } else if (typeof ML.collapseStageRight === 'function') {
        ML.collapseStageRight();
      }
    };

    useEffect(
      function () {
        if (!prefs.right && surface === 'right') {
          setSurface('inline');
          try {
            ML.storage.set('stage.surface', 'inline');
          } catch (storageError) {
            /* preference is a convenience */
          }
        }
      },
      [prefs.right, surface],
    );

    useEffect(
      function () {
        if (!stageId) {
          lastStageIdRef.current = null;
          return;
        }
        if (stageId !== lastStageIdRef.current) {
          lastStageIdRef.current = stageId;
          if (prefs.right && surface === 'right' && stage.autoShow !== false && typeof ML.openStageRight === 'function') ML.openStageRight();
        }
      },
      [stageId, surface, stage, prefs.right],
    );

    useEffect(
      function () {
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
      },
      [stageId],
    );

    if (!prefs.inline) return null;
    if (!stage || blocks.length === 0) return null;
    const revision = doc.revision !== null ? doc.revision : stage.revision;
    const focus = Number.isFinite(Number(stage.focus)) ? Math.max(0, Math.min(Number(stage.focus), blocks.length - 1)) : 0;
    const inlineOpen = surface === 'inline';
    const surfaces = [['inline', t('stage.surface.inline')], ['off', t('stage.surface.off')]];
    if (prefs.right) surfaces.unshift(['right', t('stage.surface.right')]);
    return h(
      'div',
      { className: 'stage-dock' + (inlineOpen ? ' is-open' : ''), 'data-mathlab-stage-dock': '' },
      h(
        'div',
        { className: 'stage-dock-bar' },
        h('span', { className: 'stage-dock-badge' }, t('stage.title')),
        h(
          'button',
          {
            type: 'button',
            className: 'stage-dock-title',
            onClick: function () {
              applySurface('right');
            },
            title: t('stage.right.open'),
          },
          stage.title || t('stage.untitled'),
        ),
        h('span', { className: 'stage-dock-meta' }, ML.fmt(t, 'stage.dockMeta', { current: focus + 1, total: blocks.length, revision: revision })),
        h(
          'div',
          { className: 'stage-surface-switch', role: 'group', 'aria-label': t('stage.surface.label') },
          surfaces.map(function (item) {
            return h(
              'button',
              {
                key: item[0],
                type: 'button',
                className: 'stage-surface-btn' + (surface === item[0] ? ' is-active' : ''),
                'aria-pressed': surface === item[0] ? 'true' : 'false',
                onClick: function () {
                  applySurface(item[0]);
                },
              },
              item[1],
            );
          }),
        ),
      ),
      inlineOpen
        ? h(
            'div',
            { className: 'stage-dock-body', ref: bodyRef },
            h(StageTab, { sessionId: sessionId, embedded: true, pinned: true, active: true, scrollRootRef: bodyRef }),
          )
        : null,
    );
  }

  /* ------------------------------------------------------- plugin settings */


  function StagePrefsBar(props) {
    const t = tr(props.t);
    const prefs = ML.useStagePrefs();
    const toggle = function (key, label) {
      const on = !!prefs[key];
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': on ? 'true' : 'false',
          className: 'stage-pref' + (on ? ' is-on' : ''),
          onClick: function () {
            ML.stagePrefs.set(key, !on);
          },
        },
        h('span', { className: 'stage-pref-dot', 'aria-hidden': true }),
        h('span', null, label),
      );
    };
    return h(
      'div',
      { className: 'stage-prefs' },
      h('span', { className: 'stage-prefs-title' }, t('stage.prefs.title')),
      toggle('inline', t('stage.prefs.inline')),
      toggle('right', t('stage.prefs.right')),
      h('span', { className: 'stage-prefs-hint' }, t('stage.prefs.hint')),
    );
  }

  ML.StageTabWithPrefs = function (props) {
    return h(React.Fragment, null, h(StagePrefsBar, { t: props.t }), h(StageTab, props));
  };


  /* ------------------------------------------------------------- registration */

  ML.assignStrings(
    {
      'stage.untitled': '（未命名讲解）',
      'stage.dockMeta': '第 {current}/{total} 步 · rev {revision}',
      'stage.surface.label': '讲解显示位置',
      'stage.surface.right': '右侧',
      'stage.surface.inline': '内嵌',
      'stage.surface.off': '关闭',
      'stage.right.open': '在右侧打开讲解',
      'stage.native.title': '讲解',
      'stage.native.desc': 'MathLab 讲解舞台：判断、证明、符号连接与交互图像',
      'stage.symbol.focusHint': '点击高亮使用该符号的步骤（双击复制）',
      'stage.symbol.focusBanner': '符号 {symbol} 出现在 {steps}；已高亮相关判断。',
      'stage.symbol.clearFocus': '取消高亮',
      'stage.symbols.graph': '符号—步骤连接图',
      'stage.ask.selection': '划词提问',
      'stage.ask.title': '针对选中文字提问',
      'stage.ask.placeholder': '关于这段话，你想问什么？',
      'stage.ask.submit': '记录并发送到对话',
      'stage.ask.cancel': '取消',
      'stage.ask.empty': '请先输入问题',
      'stage.ask.sent': '已记录问题，并放入对话输入框',
      'stage.ask.saved': '已记录问题并复制；粘贴到对话即可发送',
      'stage.ask.savedNoCopy': '已记录问题；复制失败，请手动输入到对话',
      'stage.zoom.label': '内容缩放',
      'stage.zoom.in': '放大',
      'stage.zoom.out': '缩小',
      'stage.zoom.reset': '重置缩放',
      'stage.prefs.title': '插件选项 · 讲解舞台',
      'stage.prefs.inline': '下侧栏',
      'stage.prefs.right': '右侧栏',
      'stage.prefs.hint': '可独立开关；关掉一侧不影响另一侧',
    },
    {
      'stage.untitled': '(untitled stage)',
      'stage.dockMeta': 'step {current}/{total} · rev {revision}',
      'stage.surface.label': 'Stage placement',
      'stage.surface.right': 'Right',
      'stage.surface.inline': 'Inline',
      'stage.surface.off': 'Off',
      'stage.right.open': 'Open the stage in the right sidebar',
      'stage.native.title': 'Stage',
      'stage.native.desc': 'MathLab Live Stage: judgments, proofs, symbol links and interactive figures',
      'stage.symbol.focusHint': 'Click to highlight the steps using this symbol (double-click copies)',
      'stage.symbol.focusBanner': 'Symbol {symbol} appears in {steps}; related judgments are highlighted.',
      'stage.symbol.clearFocus': 'Clear highlight',
      'stage.symbols.graph': 'Symbol–step connection graph',
      'stage.ask.selection': 'Ask about selection',
      'stage.ask.title': 'Ask about the selected text',
      'stage.ask.placeholder': 'What would you like to ask about this passage?',
      'stage.ask.submit': 'Record & send to chat',
      'stage.ask.cancel': 'Cancel',
      'stage.ask.empty': 'Type a question first',
      'stage.ask.sent': 'Question recorded and placed in the chat composer',
      'stage.ask.saved': 'Question recorded and copied — paste it into the chat',
      'stage.ask.savedNoCopy': 'Question recorded; copy failed, type it in the chat',
      'stage.zoom.label': 'Content zoom',
      'stage.zoom.in': 'Zoom in',
      'stage.zoom.out': 'Zoom out',
      'stage.zoom.reset': 'Reset zoom',
      'stage.prefs.title': 'Plugin options · Stage',
      'stage.prefs.inline': 'Bottom dock',
      'stage.prefs.right': 'Right sidebar',
      'stage.prefs.hint': 'Independent toggles; turning one off leaves the other',
    },
  );

  ML.StageDock = StageDock;
  ML.StageTab = StageTab;

  ML.StageDock = StageDock;
  ML.tabs.stage = { id: 'stage', order: 5, Component: ML.StageTab };
})();
