/* 20-api — Host bridge (`POST /mathlab/api`), shared engine store, request hook. */
(function () {
  'use strict';

  const API_URL = '/mathlab/api';

  /** Error carrying the API error code (`engine-down`, `parse-error`, ...). */
  function MathLabError(code, message, cause) {
    const error = new Error(message || code || 'MathLab request failed');
    error.name = 'MathLabError';
    error.code = code || 'internal';
    if (cause !== undefined) error.cause = cause;
    return error;
  }
  MathLabError.prototype = Object.create(Error.prototype);
  MathLabError.prototype.constructor = MathLabError;
  ML.MathLabError = MathLabError;

  /**
   * Call one Host operation. Resolves with `result` (success envelope unwrapped),
   * rejects with {@link MathLabError}. Never throws synchronously.
   */
  ML.callMath = async function (op, args) {
    const request = { op: String(op || ''), args: args && typeof args === 'object' ? args : {} };
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
      ? setTimeout(function () {
          try {
            controller.abort();
          } catch (error) {
            /* ignore */
          }
        }, 45000)
      : null;
    let response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
        cache: 'no-store',
        signal: controller ? controller.signal : undefined,
      });
    } catch (error) {
      clearTimeout(timer);
      if (error && error.name === 'AbortError') {
        throw MathLabError('timeout', ML.fmt(ML.fallbackT(), 'error.timeout'), error);
      }
      throw MathLabError('engine-down', 'network error: ' + (error && error.message ? error.message : String(error)), error);
    }
    clearTimeout(timer);

    if (!response || typeof response.ok !== 'boolean') {
      throw MathLabError('engine-down', 'empty HTTP response');
    }
    if (!response.ok) {
      throw MathLabError('bad-request', 'HTTP ' + response.status + ' ' + (response.statusText || ''));
    }
    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw MathLabError('bad-request', 'response is not valid JSON', error);
    }
    if (!payload || typeof payload !== 'object') {
      throw MathLabError('bad-request', 'empty response payload');
    }
    if (payload.ok === false) {
      const info = ML.isObj(payload.error) ? payload.error : {};
      throw MathLabError(String(info.code || 'internal'), String(info.message || 'request failed'));
    }
    if (payload.ok === true && Object.prototype.hasOwnProperty.call(payload, 'result')) {
      return payload.result;
    }
    /* Tolerant path: some Host builds answer with the raw result object. */
    return payload;
  };

  /* ---------------- engine status store ---------------- */

  const engineState = {
    status: 'idle', // idle | loading | starting | ready | down
    info: null,
    error: null,
    attempts: 0,
    timer: null,
    subscribers: 0,
  };
  const engineListeners = new Set();

  function emitEngine() {
    for (const listener of Array.from(engineListeners)) {
      try {
        listener();
      } catch (error) {
        if (typeof console !== 'undefined') console.error('[mathlab] engine listener failed', error);
      }
    }
  }

  function setEngine(patch) {
    Object.assign(engineState, patch);
    emitEngine();
  }

  async function loadEngine(manual) {
    if (engineState.status === 'loading') return;
    clearTimeout(engineState.timer);
    setEngine({ status: 'loading', error: null });
    try {
      const info = await ML.callMath('meta.info', {});
      engineState.attempts = 0;
      setEngine({ status: 'ready', info: ML.normalizeInfo(info), error: null });
    } catch (error) {
      engineState.attempts += 1;
      const autoRetry = !manual && engineState.attempts < 5;
      if (autoRetry) {
        setEngine({ status: 'starting', error: error, timer: null });
        const delay = Math.min(6000, 800 * engineState.attempts + 600);
        engineState.timer = setTimeout(function () {
          if (engineState.subscribers > 0) loadEngine(false);
        }, delay);
      } else {
        setEngine({ status: 'down', error: error, timer: null });
      }
    }
  }

  ML.engine = {
    get: function () {
      return {
        status: engineState.status,
        info: engineState.info,
        error: engineState.error,
        attempts: engineState.attempts,
      };
    },
    subscribe: function (listener) {
      engineListeners.add(listener);
      return function () {
        engineListeners.delete(listener);
      };
    },
    ensure: function () {
      if (engineState.status === 'idle') loadEngine(false);
    },
    refresh: function () {
      engineState.attempts = 0;
      loadEngine(true);
    },
    retain: function () {
      engineState.subscribers += 1;
      return function () {
        engineState.subscribers = Math.max(0, engineState.subscribers - 1);
      };
    },
  };

  /** React hook: live engine status + manual refresh. */
  ML.useEngine = function () {
    const [snapshot, setSnapshot] = React.useState(function () {
      return ML.engine.get();
    });
    React.useEffect(function () {
      const release = ML.engine.retain();
      const unsubscribe = ML.engine.subscribe(function () {
        setSnapshot(ML.engine.get());
      });
      ML.engine.ensure();
      return function () {
        release();
        unsubscribe();
      };
    }, []);
    return Object.assign({}, snapshot, { refresh: ML.engine.refresh });
  };

  /* ---------------- per-component async call hook ---------------- */

  /**
   * `const { run, loading, error, result, reset } = ML.useCall()`
   * `run(op, args)` resolves `{ok, result}` / `{ok:false, error}` and updates state.
   * Only the latest request's state is applied (stale responses are dropped).
   */
  ML.useCall = function () {
    const [state, setState] = React.useState({
      loading: false,
      error: null,
      result: null,
      op: null,
      elapsed: null,
    });
    const seq = React.useRef(0);
    React.useEffect(function () {
      return function () {
        seq.current += 1;
      };
    }, []);

    const run = React.useCallback(async function (op, args) {
      const ticket = ++seq.current;
      const started = Date.now();
      setState({ loading: true, error: null, result: null, op: op, elapsed: null });
      try {
        const result = await ML.callMath(op, args);
        if (ticket === seq.current) {
          setState({ loading: false, error: null, result: result, op: op, elapsed: Date.now() - started });
        }
        return { ok: true, result: result };
      } catch (error) {
        if (ticket === seq.current) {
          setState({
            loading: false,
            error: error,
            result: null,
            op: op,
            elapsed: Date.now() - started,
          });
        }
        return { ok: false, error: error };
      }
    }, []);

    const reset = React.useCallback(function () {
      seq.current += 1;
      setState({ loading: false, error: null, result: null, op: null, elapsed: null });
    }, []);

    return Object.assign({}, state, { run: run, reset: reset });
  };

  /** Set a React state value from a possibly staler async callback. */
  ML.useMountedRef = function () {
    const ref = React.useRef(true);
    React.useEffect(function () {
      ref.current = true;
      return function () {
        ref.current = false;
      };
    }, []);
    return ref;
  };
})();
