/* 85-host — the only DSH-client integration seam.
 *
 * Everything that depends on a DSH client service lives here: the native
 * right-Sidebar tab (optional capability), the chat-composer draft hook, and
 * the two stage preferences. The stage UI itself only calls the small
 * ML.openStageRight / ML.collapseStageRight / ML.sendToComposer / useStagePrefs
 * surface, so a host without those services degrades to the inline/global views.
 */
(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;

  const RIGHT_KIND = 'mathlab-stage';
  const PREF_INLINE = 'stage.pref.inline';
  const PREF_RIGHT = 'stage.pref.right';

  ML.nativeStage = { right: null, tabs: null, ready: false, dispose: null, enabled: false };

  const prefListeners = new Set();

  function readPrefs() {
    const read = function (key) {
      try {
        return ML.storage.get(key, '1') !== '0';
      } catch (error) {
        return true;
      }
    };
    return { inline: read(PREF_INLINE), right: read(PREF_RIGHT) };
  }

  ML.stagePrefs = {
    get: readPrefs,
    set: function (key, value) {
      try {
        ML.storage.set(key === 'inline' ? PREF_INLINE : PREF_RIGHT, value ? '1' : '0');
      } catch (error) {
        /* preference is a convenience */
      }
      const snapshot = readPrefs();
      for (const listener of prefListeners) {
        try {
          listener(snapshot);
        } catch (error) {
          /* a bad subscriber must not break the setting */
        }
      }
      if (ML.host && typeof ML.host.syncRight === 'function') ML.host.syncRight();
    },
    subscribe: function (listener) {
      prefListeners.add(listener);
      return function () {
        prefListeners.delete(listener);
      };
    },
  };

  ML.useStagePrefs = function () {
    const [prefs, setPrefs] = useState(ML.stagePrefs.get());
    useEffect(function () {
      const unsubscribe = ML.stagePrefs.subscribe(setPrefs);
      setPrefs(ML.stagePrefs.get());
      return unsubscribe;
    }, []);
    return prefs;
  };

  /* --------------------------------------------------------------- composer */

  ML.sendToComposer = function (sessionId, text) {
    try {
      const ctx = ML.host.ctx;
      if (!ctx) return false;
      const sessions = typeof ctx.get === 'function' ? ctx.get('sessions') : null;
      const conversation = typeof ctx.get === 'function' ? ctx.get('conversation') : null;
      if (!sessions || typeof sessions.scope !== 'function' || !conversation || !conversation.input) return false;
      const scope = sessions.scope(sessionId);
      if (!scope || typeof conversation.input.for !== 'function') return false;
      const input = conversation.input.for(scope);
      if (!input || typeof input.setDraft !== 'function' || !input.state) return false;
      const snapshot = input.state.getSnapshot();
      const draft = snapshot && typeof snapshot.draft === 'string' ? snapshot.draft : '';
      input.setDraft((draft.trim() ? draft + (/\s$/.test(draft) ? '' : ' ') : '') + String(text));
      return true;
    } catch (error) {
      return false;
    }
  };

  /* ------------------------------------------------- native right Sidebar */

  function NativeStagePanel(props) {
    const t = ML.useT();
    return h(
      'div',
      { className: 'stage-native-host' },
      h(ML.StageTab, {
        sessionId: props.sessionId,
        embedded: true,
        pinned: true,
        active: true,
        t: t,
        onAskQuestion: function (text) {
          return ML.sendToComposer(props.sessionId, text);
        },
      }),
    );
  }

  function installNow() {
    if (ML.nativeStage.dispose || !ML.nativeStage.seat) return false;
    const seat = ML.nativeStage.seat;
    const disposers = [];
    const own = function (disposer) {
      if (typeof disposer === 'function') disposers.push(disposer);
    };
    let dispose = null;
    try {
      own(
        seat.tabs.register({
          id: RIGHT_KIND,
          kind: RIGHT_KIND,
          title: () => seat.t('stage.native.title'),
          guide: [
            {
              order: 12,
              title: () => seat.t('stage.native.title'),
              description: () => seat.t('stage.native.desc'),
              icon: ML.Icon,
            },
          ],
        }),
      );
      own(
        seat.slots.inject('sidebar.right.pane.tab', () =>
          seat.slots.register({ name: 'sidebar.right.pane.tab', key: RIGHT_KIND }, (props) => h(NativeStagePanel, props)),
        ),
      );
      own(
        seat.slots.inject('sidebar.right.pane.tab.title', () =>
          seat.slots.register({ name: 'sidebar.right.pane.tab.title', key: RIGHT_KIND }, () =>
            h('span', { className: 'stage-native-tab-title' }, h(ML.Icon, { size: 14 }), seat.t('stage.native.title')),
          ),
        ),
      );
      dispose = function () {
        for (const disposer of disposers) {
          try {
            disposer();
          } catch (error) {
            /* best effort */
          }
        }
        ML.nativeStage.right = null;
        ML.nativeStage.enabled = false;
      };
      ML.nativeStage.dispose = dispose;
      ML.nativeStage.right = seat.right || null;
      ML.nativeStage.enabled = true;
      return true;
    } catch (error) {
      for (const disposer of disposers) {
        try {
          disposer();
        } catch (disposeError) {
          /* best effort */
        }
      }
      ML.nativeStage.right = null;
      ML.nativeStage.enabled = false;
      return false;
    }
  }

  function removeNow() {
    if (typeof ML.nativeStage.dispose === 'function') {
      try {
        ML.nativeStage.dispose();
      } catch (error) {
        /* best effort */
      }
    }
    ML.nativeStage.dispose = null;
    ML.nativeStage.right = null;
    ML.nativeStage.enabled = false;
  }

  ML.openStageRight = function () {
    if (!ML.stagePrefs.get().right) return false;
    if (!ML.nativeStage.enabled && !installNow() && !ML.nativeStage.enabled) return false;
    try {
      const right = ML.nativeStage.right;
      if (!right || typeof right.openTab !== 'function') return false;
      right.openTab(RIGHT_KIND);
      if (typeof right.isExpanded === 'function' && !right.isExpanded() && typeof right.toggleExpanded === 'function') {
        right.toggleExpanded();
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  ML.collapseStageRight = function () {
    try {
      const right = ML.nativeStage.right;
      if (!right) return false;
      let rows = [];
      try {
        rows = right.openTabs && typeof right.openTabs.getSnapshot === 'function' ? right.openTabs.getSnapshot() : [];
      } catch (error) {
        rows = [];
      }
      const ours = Array.isArray(rows) ? rows.find((row) => row && row.kind === RIGHT_KIND) : null;
      if (typeof right.closeTab === 'function' && ours) {
        right.closeTab(ours.tabId || ours.id);
        return true;
      }
      const active = typeof right.active === 'function' ? right.active() : null;
      const isOurs = !!(active && active.kind === RIGHT_KIND);
      if (!isOurs) return false;
      if (typeof right.isExpanded === 'function' && right.isExpanded() && typeof right.toggleExpanded === 'function') {
        right.toggleExpanded();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  ML.host = {
    ctx: null,
    syncRight: function () {
      if (!ML.nativeStage.ready) return;
      if (ML.stagePrefs.get().right) installNow();
      else removeNow();
    },
    install: function (ctx, t) {
      ML.host.ctx = ctx;
      ctx.inject(['slots', 'sidebarRightTabs', 'sidebarRight'], (injected) => {
        const tabs = injected.sidebarRightTabs;
        if (!tabs || typeof tabs.register !== 'function') {
          ML.nativeStage.ready = false;
          return undefined;
        }
        ML.nativeStage.ready = true;
        ML.nativeStage.seat = { tabs: tabs, right: injected.sidebarRight || null, slots: injected.slots, t: t };
        if (ML.stagePrefs.get().right) installNow();
        return function () {
          removeNow();
          ML.nativeStage.ready = false;
          ML.nativeStage.seat = null;
        };
      });
    },
  };
})();
