/* 25-katex — lazy KaTeX loader + safe math rendering component.
 * Assets are served by the Host on the authenticated channel at
 * /api/mathlab/assets/katex/. If anything fails the renderer degrades to
 * literal LaTeX text and never throws. */
(function () {
  'use strict';

  const KATEX_BASE = '/api/mathlab/assets/katex/';
  let katexPromise = null;
  let katexCssRequested = false;
  let lastFailureAt = 0;

  function injectCss() {
    if (katexCssRequested) return;
    katexCssRequested = true;
    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = KATEX_BASE + 'katex.min.css';
      link.setAttribute('data-mathlab-katex', 'css');
      document.head.appendChild(link);
    } catch (error) {
      /* a missing stylesheet only degrades appearance */
    }
  }

  function injectScript() {
    return new Promise(function (resolve) {
      try {
        if (window.katex && typeof window.katex.render === 'function') {
          resolve(true);
          return;
        }
        const existing = document.querySelector('script[data-mathlab-katex="js"]');
        if (existing) {
          existing.addEventListener('load', function () {
            resolve(!!window.katex);
          });
          existing.addEventListener('error', function () {
            resolve(false);
          });
          return;
        }
        const script = document.createElement('script');
        script.src = KATEX_BASE + 'katex.min.js';
        script.async = true;
        script.setAttribute('data-mathlab-katex', 'js');
        script.addEventListener('load', function () {
          resolve(!!(window.katex && typeof window.katex.render === 'function'));
        });
        script.addEventListener('error', function () {
          resolve(false);
        });
        document.head.appendChild(script);
        setTimeout(function () {
          resolve(!!(window.katex && typeof window.katex.render === 'function'));
        }, 12000);
      } catch (error) {
        resolve(false);
      }
    });
  }

  /** Shared promise resolving `true` when KaTeX is usable. Retries after 8s of failure. */
  ML.ensureKatex = function () {
    if (katexPromise) return katexPromise;
    if (window.katex && typeof window.katex.render === 'function') {
      injectCss();
      katexPromise = Promise.resolve(true);
      return katexPromise;
    }
    if (lastFailureAt && Date.now() - lastFailureAt < 8000) return Promise.resolve(false);
    injectCss();
    katexPromise = injectScript().then(function (ok) {
      if (!ok) {
        lastFailureAt = Date.now();
        katexPromise = null;
        return false;
      }
      return true;
    });
    return katexPromise;
  };

  ML.katexReady = function () {
    return !!(window.katex && typeof window.katex.render === 'function');
  };

  /**
   * Render LaTeX into a DOM node. Uses KaTeX when available (lazy load), otherwise
   * writes the literal LaTeX text. Never throws.
   * @returns {Promise<boolean>} whether KaTeX was used.
   */
  ML.renderMath = function (node, latex, options) {
    if (!node) return Promise.resolve(false);
    const text = typeof latex === 'string' ? latex : latex === undefined || latex === null ? '' : String(latex);
    const opts = options || {};
    const display = !!opts.display;
    const fallback = function () {
      try {
        node.textContent = text;
        node.setAttribute('data-mathlab-math', 'fallback');
      } catch (error) {
        /* detached node */
      }
      return false;
    };
    try {
      if (ML.katexReady()) {
        try {
          window.katex.render(text, node, {
            displayMode: display,
            throwOnError: false,
            strict: false,
            trust: false,
            output: 'html',
          });
          node.setAttribute('data-mathlab-math', 'katex');
          return Promise.resolve(true);
        } catch (error) {
          return Promise.resolve(fallback());
        }
      }
      if (!text) {
        node.textContent = '';
        return Promise.resolve(false);
      }
      fallback();
      return ML.ensureKatex().then(function (ok) {
        if (!ok || !node.isConnected) return ok;
        try {
          window.katex.render(text, node, {
            displayMode: display,
            throwOnError: false,
            strict: false,
            trust: false,
            output: 'html',
          });
          node.setAttribute('data-mathlab-math', 'katex');
          return true;
        } catch (error) {
          fallback();
          return false;
        }
      });
    } catch (error) {
      return Promise.resolve(fallback());
    }
  };

  /** Inline/block math node used across tabs. `tex` is a LaTeX string. */
  ML.Math = function Math(props) {
    const ref = React.useRef(null);
    const tex = typeof props.tex === 'string' ? props.tex : String(props.tex === undefined || props.tex === null ? '' : props.tex);
    const display = !!props.display;
    const className = props.className;
    React.useEffect(
      function () {
        let alive = true;
        ML.renderMath(ref.current, tex, { display: display }).then(function () {
          if (!alive) return;
          /* KaTeX markup is static for a given tex; nothing else to synchronise. */
        });
        return function () {
          alive = false;
        };
      },
      [tex, display],
    );
    return h('span', {
      ref: ref,
      className: 'ml-math' + (display ? ' ml-math-block' : '') + (className ? ' ' + className : ''),
      'aria-label': tex ? ML.safeString(tex, 400) : undefined,
    });
  };

  /** Convenience wrapper for a display-mode formula with a caption. */
  ML.FormulaBlock = function FormulaBlock(props) {
    return h(
      'div',
      { className: 'ml-formula' + (props.className ? ' ' + props.className : '') },
      props.label ? h('div', { className: 'ml-formula-label' }, props.label) : null,
      h(ML.Math, { tex: props.tex, display: true }),
    );
  };
})();
