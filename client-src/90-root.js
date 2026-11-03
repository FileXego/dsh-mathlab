/* 90-root — panel shell (header, engine status, tab bar, about footer), sidebar icon
 * and the plugin registration object. Must be the last module. */
(function () {
  'use strict';

  /** Namespace-bound translator built from the host locale service (zh primary). */
  ML.makeT = function (ctx) {
    const resolveId = function () {
      try {
        const locale = ctx && ctx.locale && typeof ctx.locale.getLocale === 'function' ? ctx.locale.getLocale() : null;
        if (!locale) return 'zh';
        if (typeof locale === 'string') return locale;
        return locale.id || 'zh';
      } catch (error) {
        return 'zh';
      }
    };
    return function (key) {
      const id = resolveId();
      const dict = ML.DICT[id] || ML.DICT.zh;
      if (dict && dict[key] !== undefined) return dict[key];
      if (ML.DICT.zh[key] !== undefined) return ML.DICT.zh[key];
      return key;
    };
  };

  ML.Icon = function Icon(props) {
    const size = props && props.size ? props.size : 20;
    return h(
      'svg',
      { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
      h('rect', { x: 1.5, y: 1.5, width: 21, height: 21, rx: 6, fill: 'currentColor', opacity: 0.14 }),
      h('path', {
        d: 'M9 6.5c0-1.4 1.6-1.8 2.1-.5.4 1 .2 8.2.5 9.6.2 1 1.4.9 1.7-.1',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }),
      h('path', {
        d: 'M14.5 9.5 19 15M19 9.5 14.5 15',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }),
    );
  };

  ML.EngineStatus = function EngineStatus(props) {
    const t = ML.useT();
    const engine = props.engine;
    const info = engine.info || {};
    const status = engine.status === 'loading' ? 'starting' : engine.status || 'idle';
    const lean = info.lean || {};
    let leanText = t('engine.leanUnknown');
    if (lean.available) leanText = lean.version ? ML.fmt(t, 'engine.leanOnWith', { v: lean.version }) : t('engine.leanOn');
    else if (status === 'ready') leanText = t('engine.leanOff');
    const python = info.python ? ML.fmt(t, 'engine.python', { v: info.python }) : '';
    const errorText = engine.error ? ML.errInfo(engine.error).message : '';
    return h(
      'div',
      { className: 'ml-engine' },
      h(
        'span',
        {
          className: 'ml-pill',
          'data-status': status,
          role: 'status',
          'aria-live': 'polite',
          title: errorText || undefined,
        },
        h('span', { className: 'ml-pill-dot', 'aria-hidden': true }),
        ML.engineLabel(engine, t),
        engine.attempts > 0 && (status === 'starting' || status === 'down')
          ? h('span', { className: 'ml-muted' }, ' · ' + engine.attempts)
          : null,
      ),
      python ? h('span', { className: 'ml-pill', title: info.sympy ? 'SymPy ' + info.sympy : undefined }, python) : null,
      status === 'ready'
        ? h('span', { className: 'ml-pill', 'data-status': lean.available ? 'ready' : 'idle' }, leanText)
        : null,
      status === 'down' || status === 'starting'
        ? h(ML.Btn, { size: 'sm', variant: 'subtle', onClick: engine.refresh }, t('engine.retry'))
        : null,
    );
  };

  ML.AboutFooter = function AboutFooter(props) {
    const t = ML.useT();
    const engine = props.engine;
    const info = engine.info || {};
    const version = info.pluginVersion || info.version || info.plugin || '0.1.0';
    const engineVersion = info.pluginVersion && info.version && info.version !== info.pluginVersion ? ' · engine ' + info.version : '';
    const pieces = [];
    if (info.python) pieces.push('Python ' + info.python);
    if (info.sympy) pieces.push('SymPy ' + info.sympy);
    if (info.lean && info.lean.available && info.lean.version) pieces.push('Lean ' + info.lean.version);
    return h(
      'footer',
      { className: 'ml-about' },
      h('span', null, 'MathLab ' + t('footer.version') + ' ' + version + engineVersion),
      h('span', null, t('footer.attribution')),
      pieces.length ? h('span', null, pieces.join(' · ')) : null,
      h('span', null, t('footer.note')),
    );
  };

  const readInitialTab = function () {
    try {
      const stored = ML.storage.get('ui.tab', null);
      if (typeof stored === 'string' && ML.tabs[stored]) return stored;
    } catch (error) {
      /* ignore */
    }
    const keys = Object.keys(ML.tabs);
    return keys.length ? keys[0] : 'compute';
  };

  ML.Panel = function Panel(props) {
    const t = typeof props.t === 'function' ? props.t : ML.fallbackT();
    const engine = ML.useEngine();
    const tabs = React.useMemo(function () {
      return Object.keys(ML.tabs)
        .map(function (id) {
          return ML.tabs[id];
        })
        .sort(function (a, b) {
          return a.order - b.order;
        });
    }, []);
    const [active, setActive] = React.useState(function () {
      const initial = readInitialTab();
      return ML.tabs[initial] ? initial : tabs.length ? tabs[0].id : 'compute';
    });
    const [openAction, setOpenAction] = React.useState(null);
    const openSeq = React.useRef(0);
    const lastUserTab = React.useRef(Date.now());

    React.useEffect(
      function () {
        const offOpen = ML.bus.on('open', function (payload) {
          if (!payload || !payload.panel || !ML.tabs[payload.panel]) return;
          openSeq.current += 1;
          setOpenAction({
            seq: openSeq.current,
            panel: payload.panel,
            op: payload.op,
            args: payload.args,
            title: payload.title,
          });
          setActive(payload.panel);
        });
        const offActivate = ML.bus.on('activate', function (payload) {
          if (!payload || !payload.tab || !ML.tabs[payload.tab]) return;
          // Do not steal the tab the user just clicked (1.5s grace); a forced
          // activation (explicit user action) always wins.
          if (payload.force !== true && Date.now() - lastUserTab.current < 1500) return;
          setActive(payload.tab);
        });
        return function () {
          offOpen();
          offActivate();
        };
      },
      [],
    );

    React.useEffect(
      function () {
        ML.storage.set('ui.tab', active);
      },
      [active],
    );

    const changeTab = function (id) {
      lastUserTab.current = Date.now();
      if (ML.tabs[id]) setActive(id);
    };

    const tabItems = tabs.map(function (tab) {
      return { id: tab.id, label: t('tab.' + tab.id) };
    });

    return h(
      ML.I18nContext.Provider,
      { value: t },
      h(
        'section',
        {
          className: 'ml-panel',
          'data-mathlab-root': '',
          'aria-label': t('panel'),
        },
        h(
          'div',
          { className: 'ml-inner' },
          h(
            'header',
            { className: 'ml-header' },
            h(
              'div',
              { className: 'ml-header-row' },
              h(
                'div',
                { className: 'ml-brand' },
                h('div', { className: 'ml-mark' }, h(ML.Icon, { size: 22 })),
                h(
                  'div',
                  { className: 'ml-hd-text' },
                  h('h1', { className: 'ml-title' }, t('title')),
                  h('p', { className: 'ml-sub' }, t('subtitle')),
                ),
              ),
              h(ML.EngineStatus, { engine: engine }),
            ),
          ),
          h(ML.Tabs, {
            items: tabItems,
            value: active,
            onChange: changeTab,
            ariaLabel: t('a11y.tablist'),
            idPrefix: 'ml-main',
            className: 'ml-main-tabs',
          }),
          h(
            'div',
            { className: 'ml-tab-panels' },
            tabs.map(function (tab) {
              const isActive = active === tab.id;
              return h(
                'div',
                {
                  key: tab.id,
                  id: 'ml-main-panel-' + tab.id,
                  role: 'tabpanel',
                  'aria-labelledby': 'ml-main-tab-' + tab.id,
                  className: 'ml-tabpanel',
                  hidden: !isActive,
                },
                h(
                  ML.Boundary,
                  null,
                  h(tab.id === 'stage' && ML.StageTabWithPrefs ? ML.StageTabWithPrefs : tab.Component, {
                    active: isActive,
                    openAction: openAction && openAction.panel === tab.id ? openAction : null,
                    engine: engine,
                    t: t,
                  }),
                ),
              );
            }),
          ),
          h(ML.AboutFooter, { engine: engine }),
        ),
      ),
    );
  };

  ML.plugin = {
    inject: ['slots', 'locale'],
    apply(ctx) {
      ML.installStyles(ctx);
      ctx.effect(() => ctx.locale.register(ML.NS, { zh: ML.DICT.zh, en: ML.DICT.en }), 'mathlab: locale');
      const t = ML.makeT(ctx);
      try {
        ML.host.install(ctx, t);
      } catch (error) {
        /* every host capability is optional; the global panel still works */
      }
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'mathlab', locale: ML.NS }, (props) =>
          h(ML.Panel, Object.assign({}, props, { t: props.t ?? t })),
        ),
      );
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'mathlab',
            order: 30,
            label: () => t('panel'),
          },
          ML.Icon,
        ),
      );
      /* In-conversation Live Stage: a per-Session dock above the composer. */
      ctx.slots.inject('conversation.input.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.dock',
            id: 'mathlab-stage-dock',
            order: 35,
            locale: ML.NS,
          },
          (props) => h(ML.StageDock, props),
        ),
      );
    },
  };
})();
