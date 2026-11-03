/* 35-svg — small SVG/geometry helpers shared by plots, diagrams and proofs. */
(function () {
  'use strict';

  /** Tiny createElement alias that reads better for SVG trees. */
  ML.s = function s(tag, attrs) {
    const children = Array.prototype.slice.call(arguments, 2);
    return h.apply(null, [tag, attrs].concat(children));
  };

  /** Nice linear scale: domain [d0,d1] -> range [r0,r1]. Returns forward + inverse. */
  ML.scale = function (d0, d1, r0, r1) {
    const span = d1 - d0 || 1;
    return {
      map: function (value) {
        return r0 + ((value - d0) / span) * (r1 - r0);
      },
      invert: function (pixel) {
        return d0 + ((pixel - r0) / (r1 - r0 || 1)) * span;
      },
      domain: [d0, d1],
      range: [r0, r1],
    };
  };

  /** Extend [min,max] to a "nice" numeric range. */
  ML.niceRange = function (min, max) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = -1;
      max = 1;
    }
    if (min === max) {
      const delta = Math.abs(min) > 0 ? Math.abs(min) * 0.5 : 1;
      min -= delta;
      max += delta;
    }
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    return [min, max];
  };

  /** "Nice" step for ticks: 1/2/5 × 10^k covering `count` intervals. */
  ML.niceStep = function (span, count) {
    const rough = span / Math.max(1, count || 6);
    const power = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1e-12))));
    const fraction = rough / power;
    let nice;
    if (fraction <= 1) nice = 1;
    else if (fraction <= 2) nice = 2;
    else if (fraction <= 5) nice = 5;
    else nice = 10;
    return nice * power;
  };

  /** Tick values across [min,max] (at most ~24 ticks). */
  ML.ticks = function (min, max, count) {
    const [lo, hi] = ML.niceRange(min, max);
    const step = ML.niceStep(hi - lo, count || 6);
    const first = Math.ceil(lo / step) * step;
    const values = [];
    for (let value = first; value <= hi + step * 1e-6 && values.length < 24; value += step) {
      values.push(Math.abs(value) < step * 1e-9 ? 0 : value);
    }
    return { min: lo, max: hi, step: step, values: values };
  };

  ML.pointPath = function (points) {
    if (!points || points.length === 0) return '';
    let d = '';
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      if (!point) continue;
      d += (index === 0 ? 'M' : 'L') + ML.fmtNum(point[0], 8) + ' ' + ML.fmtNum(point[1], 8);
    }
    return d;
  };

  /** Curve palette derived only from theme tokens. */
  ML.CURVE_COLORS = [
    'var(--ml-c1)',
    'var(--ml-c2)',
    'var(--ml-c3)',
    'var(--ml-c4)',
    'var(--ml-c5)',
    'var(--ml-c6)',
    'var(--ml-c7)',
    'var(--ml-c8)',
  ];

  ML.curveColor = function (index) {
    return ML.CURVE_COLORS[((index % ML.CURVE_COLORS.length) + ML.CURVE_COLORS.length) % ML.CURVE_COLORS.length];
  };

  const EXPORT_PROPS = [
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-dasharray',
    'stroke-linecap',
    'stroke-linejoin',
    'opacity',
    'font-size',
    'font-family',
    'font-weight',
    'font-style',
    'text-anchor',
    'dominant-baseline',
    'letter-spacing',
  ];

  /**
   * Serialize an SVG element to a standalone file. Computed presentation styles are
   * inlined so the exported file does not depend on the panel stylesheet.
   */
  ML.exportSvg = function (svgEl, filename) {
    try {
      const clone = svgEl.cloneNode(true);
      const originals = [svgEl].concat(Array.prototype.slice.call(svgEl.querySelectorAll('*')));
      const copies = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
      const computedSvg = window.getComputedStyle(svgEl);
      let bg = computedSvg.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        const parent = svgEl.parentElement;
        if (parent) bg = window.getComputedStyle(parent).backgroundColor;
      }
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = '#ffffff';
      for (let index = 0; index < Math.min(originals.length, copies.length); index += 1) {
        const style = window.getComputedStyle(originals[index]);
        const target = copies[index];
        for (const prop of EXPORT_PROPS) {
          const value = style.getPropertyValue(prop);
          if (!value) continue;
          try {
            target.style.setProperty(prop, value);
          } catch (error) {
            /* unsupported CSS property on SVG element */
          }
        }
      }
      const viewBox = (svgEl.getAttribute('viewBox') || '0 0 800 480').split(/\s+/);
      const width = Number(viewBox[2]) || 800;
      const height = Number(viewBox[3]) || 480;
      clone.setAttribute('width', String(width));
      clone.setAttribute('height', String(height));
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      clone.style.background = bg;
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', viewBox[0] || '0');
      bgRect.setAttribute('y', viewBox[1] || '0');
      bgRect.setAttribute('width', String(width));
      bgRect.setAttribute('height', String(height));
      bgRect.setAttribute('fill', bg);
      clone.insertBefore(bgRect, clone.firstChild);
      const text = new XMLSerializer().serializeToString(clone);
      const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + text], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || 'mathlab.svg';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4000);
      return true;
    } catch (error) {
      if (typeof console !== 'undefined') console.error('[mathlab] SVG export failed', error);
      return false;
    }
  };
})();
