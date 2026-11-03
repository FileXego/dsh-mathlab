/* 40-style — the single injected stylesheet. Every colour derives from host theme
 * tokens (with light-mode fallbacks) so the panel follows light/dark themes. */
(function () {
  'use strict';

  ML.CSS = `/* MathLab panel styles — scoped under .ml-panel, all classes ml- prefixed. */
.ml-panel {
  --ml-fg: var(--dsw-alias-label-primary, #1f2328);
  --ml-fg2: var(--dsw-alias-label-secondary, #5b6470);
  --ml-bg: var(--dsw-alias-bg-base, #ffffff);
  --ml-l1: var(--dsw-alias-bg-layer-1, #f7f8fa);
  --ml-l2: var(--dsw-alias-bg-layer-2, #eef0f4);
  --ml-ov: var(--dsw-alias-bg-overlay, #ffffff);
  --ml-b1: var(--dsw-alias-border-l1, rgba(20, 24, 32, 0.10));
  --ml-b2: var(--dsw-alias-border-l2, rgba(20, 24, 32, 0.18));
  --ml-brand: var(--dsw-alias-brand-primary, #4d6bfe);
  --ml-err: var(--dsw-alias-state-error-primary, #cf3232);
  --ml-idle: var(--dsw-alias-state-idle-primary, #8b949e);
  --ml-ok: var(--dsw-alias-state-success-primary, #1a7f46);
  --ml-warn: var(--dsw-alias-state-warn-primary, #b45f06);
  --ml-hover: color-mix(in srgb, var(--dsw-alias-label-primary, #1f2328) 7%, transparent);
  --ml-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  --ml-ring: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, transparent);
  --ml-c1: var(--dsw-alias-brand-primary, #4d6bfe);
  --ml-c2: var(--dsw-alias-state-success-primary, #1a7f46);
  --ml-c3: var(--dsw-alias-state-warn-primary, #b45f06);
  --ml-c4: var(--dsw-alias-state-error-primary, #cf3232);
  --ml-c5: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 52%, var(--dsw-alias-state-success-primary, #1a7f46));
  --ml-c6: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, var(--dsw-alias-state-warn-primary, #b45f06));
  --ml-c7: color-mix(in srgb, var(--dsw-alias-state-success-primary, #1a7f46) 55%, var(--dsw-alias-state-warn-primary, #b45f06));
  --ml-c8: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 40%, var(--dsw-alias-state-idle-primary, #8b949e));
  --ml-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: var(--ml-bg);
  color: var(--ml-fg);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.ml-panel *, .ml-panel *::before, .ml-panel *::after { box-sizing: border-box; }
.ml-panel :focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe); outline-offset: 2px; border-radius: 6px; }
.ml-panel button { font: inherit; }
.ml-panel a { color: var(--ml-brand); text-decoration: none; }
.ml-panel a:hover { text-decoration: underline; }
.ml-panel ::selection { background: var(--ml-active); }
.ml-inner { max-width: 1100px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 44px) 44px; }

/* ---------- header ---------- */
.ml-header { padding: 26px 0 0; }
.ml-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.ml-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ml-mark {
  width: 40px; height: 40px; flex: none; display: grid; place-items: center;
  border-radius: 12px; color: var(--ml-brand);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 28%, transparent);
}
.ml-hd-text { min-width: 0; }
.ml-title { margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: 0.1px; }
.ml-sub { margin: 2px 0 0; font-size: 13px; color: var(--ml-fg2); }
.ml-engine { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 4px; }
.ml-pill {
  display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px;
  border-radius: 999px; font-size: 12px; color: var(--ml-fg2);
  border: 0.5px solid var(--ml-b1); background: var(--ml-l1);
  white-space: nowrap;
}
.ml-pill[data-status="ready"] { color: var(--ml-ok); border-color: color-mix(in srgb, var(--ml-ok) 35%, transparent); background: color-mix(in srgb, var(--ml-ok) 9%, transparent); }
.ml-pill[data-status="down"] { color: var(--ml-err); border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); background: color-mix(in srgb, var(--ml-err) 8%, transparent); }
.ml-pill[data-status="starting"], .ml-pill[data-status="loading"] { color: var(--ml-warn); border-color: color-mix(in srgb, var(--ml-warn) 35%, transparent); background: color-mix(in srgb, var(--ml-warn) 9%, transparent); }
.ml-pill-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex: none; }
.ml-pill[data-status="starting"] .ml-pill-dot, .ml-pill[data-status="loading"] .ml-pill-dot { animation: ml-pulse 1.1s ease-in-out infinite; }
.ml-pill-sep { width: 1px; height: 12px; background: var(--ml-b2); }
@keyframes ml-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

/* ---------- tabs ---------- */
.ml-tabs {
  display: flex; gap: 2px; align-items: stretch; overflow-x: auto; scrollbar-width: thin;
  margin: 18px 0 0; border-bottom: 0.5px solid var(--ml-b1);
}
.ml-tab {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  padding: 8px 12px 10px; margin: 0; font-size: 13px; color: var(--ml-fg2);
  border-bottom: 2px solid transparent; white-space: nowrap; border-radius: 6px 6px 0 0;
  display: inline-flex; align-items: center; gap: 6px;
}
.ml-tab:hover { color: var(--ml-fg); background: var(--ml-hover); }
.ml-tab.is-active { color: var(--ml-fg); border-bottom-color: var(--ml-brand); font-weight: 500; }
.ml-tab:disabled { opacity: 0.45; cursor: default; }
.ml-tab-badge { font-size: 11px; color: var(--ml-fg2); background: var(--ml-l2); border-radius: 999px; padding: 0 6px; line-height: 16px; }
.ml-tabs-sm { margin: 0; border-bottom: 0; gap: 4px; background: var(--ml-l1); border: 0.5px solid var(--ml-b1); border-radius: 9px; padding: 3px; display: inline-flex; }
.ml-tabs-sm .ml-tab { border-bottom: 0; border-radius: 6px; padding: 3px 10px; }
.ml-tabs-sm .ml-tab.is-active { background: var(--ml-ov); color: var(--ml-fg); box-shadow: 0 0 0 0.5px var(--ml-b2); }
.ml-tabpanel { padding-top: 20px; }
.ml-tabpanel[hidden] { display: none !important; }

/* ---------- buttons ---------- */
.ml-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; padding: 0 12px; border-radius: 8px; cursor: pointer;
  border: 0.5px solid var(--ml-b1); background: transparent; color: var(--ml-fg);
  font-size: 13px; line-height: 1; white-space: nowrap; transition: background 120ms ease, border-color 120ms ease;
}
.ml-btn:hover { background: var(--ml-hover); }
.ml-btn:disabled { opacity: 0.45; cursor: not-allowed; background: transparent; }
.ml-btn-primary {
  background: var(--dsw-alias-brand-primary, #4d6bfe); border-color: transparent; color: var(--dsw-alias-bg-base, #fff);
  font-weight: 500;
}
.ml-btn-primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 84%, var(--dsw-alias-label-primary, #000)); }
.ml-btn-primary:disabled { background: var(--ml-idle); }
.ml-btn-subtle { border-color: transparent; color: var(--ml-fg2); }
.ml-btn-subtle:hover { color: var(--ml-fg); }
.ml-btn-danger { color: var(--ml-err); border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); }
.ml-btn-sm { height: 26px; padding: 0 9px; font-size: 12px; border-radius: 7px; }
.ml-btn-md { height: 32px; }
.ml-copy-glyph { font-size: 12px; opacity: 0.75; }
.ml-btn[data-copied="ok"] { color: var(--ml-ok); }
.ml-btn[data-copied="fail"] { color: var(--ml-err); }

/* ---------- form controls ---------- */
.ml-input, .ml-textarea, .ml-select {
  width: 100%; min-height: 32px; padding: 5px 9px; border-radius: 8px;
  border: 0.5px solid var(--ml-b2); background: var(--ml-ov); color: var(--ml-fg);
  font-size: 13px; font-family: inherit; line-height: 1.5;
}
.ml-input:hover, .ml-textarea:hover, .ml-select:hover { border-color: var(--ml-fg2); }
.ml-input:focus, .ml-textarea:focus, .ml-select:focus { outline: 2px solid var(--ml-ring); outline-offset: 0; border-color: var(--ml-brand); }
.ml-textarea { resize: vertical; min-height: 66px; font-family: var(--ml-mono); font-size: 12.5px; line-height: 1.55; }
.ml-textarea-mono, .ml-mono { font-family: var(--ml-mono); }
.ml-select { appearance: auto; cursor: pointer; }
.ml-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.ml-field-inline { flex-direction: row; align-items: center; gap: 8px; }
.ml-label { font-size: 12px; color: var(--ml-fg2); font-weight: 500; }
.ml-hint { font-size: 11.5px; color: var(--ml-fg2); line-height: 1.45; }
.ml-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.ml-form-grid-wide { grid-template-columns: 1fr; }
.ml-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ml-row-end { justify-content: flex-end; }
.ml-stack { display: flex; flex-direction: column; gap: 14px; }
.ml-stack-sm { display: flex; flex-direction: column; gap: 8px; }
.ml-grow { flex: 1 1 auto; min-width: 0; }
.ml-split { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.ml-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0 0; }
.ml-muted { color: var(--ml-fg2); }
.ml-small { font-size: 12px; }
.ml-center { text-align: center; }
.ml-nowrap { white-space: nowrap; }

/* ---------- cards ---------- */
.ml-card { border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-l1); overflow: hidden; }
.ml-card-hd { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 12px 16px 0; }
.ml-card-title { margin: 0; font-size: 14px; font-weight: 500; }
.ml-card-sub { margin: 0; font-size: 12px; color: var(--ml-fg2); }
.ml-card-actions { margin-left: auto; display: flex; gap: 6px; align-items: center; }
.ml-card-bd { padding: 12px 16px 16px; }
.ml-section-title { display: flex; align-items: baseline; gap: 10px; margin: 0 0 10px; }
.ml-h2 { margin: 0; font-size: 14px; font-weight: 500; }
.ml-formula { padding: 10px 4px; overflow-x: auto; }
.ml-formula-label, .ml-result-caption { font-size: 11px; letter-spacing: 0.06em; color: var(--ml-fg2); text-transform: uppercase; margin-bottom: 4px; }
.ml-math { display: inline-block; max-width: 100%; }
.ml-math-block { display: block; overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
.ml-math .katex { font-size: 1.06em; }
.ml-math-block .katex-display { margin: 0.2em 0; }
.ml-math[data-mathlab-math="fallback"] { font-family: var(--ml-mono); font-size: 12.5px; color: var(--ml-fg2); word-break: break-word; white-space: pre-wrap; }

/* ---------- badges / banners / states ---------- */
.ml-badge { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 999px; font-size: 11px; border: 0.5px solid var(--ml-b1); background: var(--ml-l2); color: var(--ml-fg2); white-space: nowrap; }
.ml-badge-success { color: var(--ml-ok); border-color: color-mix(in srgb, var(--ml-ok) 35%, transparent); background: color-mix(in srgb, var(--ml-ok) 9%, transparent); }
.ml-badge-error { color: var(--ml-err); border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); background: color-mix(in srgb, var(--ml-err) 8%, transparent); }
.ml-badge-warn { color: var(--ml-warn); border-color: color-mix(in srgb, var(--ml-warn) 35%, transparent); background: color-mix(in srgb, var(--ml-warn) 9%, transparent); }
.ml-badge-brand { color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 35%, transparent); background: color-mix(in srgb, var(--ml-brand) 9%, transparent); }
.ml-banner { border-radius: 10px; padding: 10px 12px; font-size: 13px; border: 0.5px solid var(--ml-b1); background: var(--ml-l1); color: var(--ml-fg); }
.ml-banner-warn { border-color: color-mix(in srgb, var(--ml-warn) 35%, transparent); background: color-mix(in srgb, var(--ml-warn) 8%, transparent); }
.ml-banner-error { border-color: color-mix(in srgb, var(--ml-err) 35%, transparent); background: color-mix(in srgb, var(--ml-err) 7%, transparent); }
.ml-banner-success { border-color: color-mix(in srgb, var(--ml-ok) 35%, transparent); background: color-mix(in srgb, var(--ml-ok) 8%, transparent); }
.ml-error { border: 0.5px solid color-mix(in srgb, var(--ml-err) 40%, transparent); background: color-mix(in srgb, var(--ml-err) 7%, transparent); border-radius: 10px; padding: 10px 12px; font-size: 13px; }
.ml-error-warn { border-color: color-mix(in srgb, var(--ml-warn) 40%, transparent); background: color-mix(in srgb, var(--ml-warn) 8%, transparent); }
.ml-error-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ml-error-hd .ml-btn { margin-left: auto; }
.ml-error-code { font-family: var(--ml-mono); font-size: 11px; padding: 0 5px; border-radius: 4px; background: var(--ml-l2); color: var(--ml-fg2); }
.ml-error-msg { margin-top: 4px; white-space: pre-wrap; word-break: break-word; font-family: var(--ml-mono); font-size: 12px; }
.ml-error-hint { margin-top: 4px; color: var(--ml-fg2); font-size: 12px; }
.ml-loading { display: flex; align-items: center; gap: 9px; padding: 18px 4px; color: var(--ml-fg2); font-size: 13px; }
.ml-spinner { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--ml-b2); border-top-color: var(--ml-brand); animation: ml-spin 0.8s linear infinite; flex: none; }
@keyframes ml-spin { to { transform: rotate(360deg); } }
.ml-empty { padding: 20px 4px; color: var(--ml-fg2); font-size: 13px; text-align: center; border: 0.5px dashed var(--ml-b2); border-radius: 10px; }
.ml-notes { margin-top: 10px; padding: 8px 10px; background: var(--ml-l2); border-radius: 8px; font-size: 12px; color: var(--ml-fg2); }
.ml-notes-hd { font-weight: 500; color: var(--ml-fg); margin-bottom: 2px; }
.ml-notes ul { margin: 0; padding-left: 18px; }

/* ---------- result / data ---------- */
.ml-result { border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-l1); padding: 12px 16px 14px; }
.ml-result-title { font-weight: 500; font-size: 13px; margin-bottom: 6px; }
.ml-result-input { border-bottom: 0.5px dashed var(--ml-b2); padding-bottom: 6px; margin-bottom: 6px; }
.ml-result-block { margin-top: 8px; }
.ml-result-block code { font-family: var(--ml-mono); font-size: 12.5px; }
.ml-result-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.ml-data-view { display: flex; flex-direction: column; gap: 8px; }
.ml-pre { margin: 0; background: var(--ml-l2); border: 0.5px solid var(--ml-b1); border-radius: 8px; padding: 9px 11px; font-family: var(--ml-mono); font-size: 12.5px; line-height: 1.5; overflow: auto; max-height: 320px; white-space: pre-wrap; word-break: break-word; }
.ml-json-list { margin: 0; padding-left: 20px; }
.ml-json-obj { margin: 0; }
.ml-json-row { display: grid; grid-template-columns: minmax(70px, 160px) 1fr; gap: 8px; padding: 1px 0; }
.ml-json-row dt { color: var(--ml-fg2); font-family: var(--ml-mono); font-size: 12px; overflow-wrap: anywhere; }
.ml-json-row dd { margin: 0; min-width: 0; }
.ml-json-string { color: var(--ml-fg); font-family: var(--ml-mono); font-size: 12.5px; overflow-wrap: anywhere; }
.ml-json-atom { color: var(--ml-brand); font-family: var(--ml-mono); font-size: 12.5px; }
.ml-json-null { color: var(--ml-fg2); font-family: var(--ml-mono); font-size: 12.5px; }
.ml-json-index { color: var(--ml-fg2); font-family: var(--ml-mono); font-size: 11.5px; }
.ml-kv { margin: 0; display: flex; flex-direction: column; gap: 4px; }
.ml-kv-row { display: grid; grid-template-columns: minmax(96px, 200px) 1fr; gap: 10px; }
.ml-kv-row dt { color: var(--ml-fg2); font-size: 12px; }
.ml-kv-row dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.ml-collapse { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); overflow: hidden; margin-top: 8px; }
.ml-collapse > summary { cursor: pointer; padding: 8px 12px; font-size: 12.5px; color: var(--ml-fg2); display: flex; align-items: center; gap: 10px; user-select: none; }
.ml-collapse > summary:hover { background: var(--ml-hover); }
.ml-collapse > summary .ml-collapse-extra { margin-left: auto; font-size: 11.5px; }
.ml-collapse-bd { padding: 4px 12px 12px; }
.ml-raw > summary .ml-btn { margin-left: auto; }
.ml-stat { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); padding: 10px 12px; min-width: 92px; }
.ml-stat-label { font-size: 11.5px; color: var(--ml-fg2); }
.ml-stat-value { font-size: 19px; font-weight: 500; line-height: 1.35; }
.ml-stat-sub { font-size: 11.5px; color: var(--ml-fg2); }
.ml-stats { display: flex; gap: 10px; flex-wrap: wrap; }

/* ---------- tables / matrices ---------- */
.ml-tbl-wrap { overflow: auto; max-height: 460px; border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-ov); }
.ml-table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
.ml-table th, .ml-table td { border-bottom: 0.5px solid var(--ml-b1); border-right: 0.5px solid var(--ml-b1); padding: 5px 9px; text-align: left; vertical-align: top; }
.ml-table th { position: sticky; top: 0; z-index: 2; background: var(--ml-l2); font-weight: 500; color: var(--ml-fg2); white-space: nowrap; }
.ml-table tbody tr:hover td { background: var(--ml-hover); }
.ml-table .ml-th-row { position: sticky; left: 0; z-index: 1; background: var(--ml-l2); white-space: nowrap; }
.ml-table .ml-th-corner { left: 0; z-index: 3; }
.ml-table td:last-child, .ml-table th:last-child { border-right: 0; }
.ml-table tr:last-child td, .ml-table tr:last-child th { border-bottom: 0; }
.ml-tbl-scroll { overflow: auto; max-height: 460px; }
.ml-matrix-wrap { display: inline-block; max-width: 100%; overflow: auto; }
.ml-matrix-label { font-size: 11.5px; color: var(--ml-fg2); margin-bottom: 4px; }
.ml-matrix { border-collapse: collapse; font-family: var(--ml-mono); font-size: 12.5px; }
.ml-matrix td { padding: 4px 10px; text-align: right; border: 0; min-width: 34px; }
.ml-matrix-wrap { border-left: 2px solid var(--ml-fg2); border-right: 2px solid var(--ml-fg2); border-radius: 4px; padding: 2px 4px; }
.ml-matrix-sm .ml-matrix td { padding: 2px 7px; font-size: 12px; }
.ml-matrix-editor { display: flex; flex-direction: column; gap: 8px; }
.ml-matrix-editor-hd { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ml-matrix-dims { font-family: var(--ml-mono); font-size: 12px; color: var(--ml-fg2); }
.ml-matrix-btns { display: flex; gap: 4px; flex-wrap: wrap; margin-left: auto; }
.ml-matrix-grid { display: grid; gap: 4px; }
.ml-matrix-input { width: 100%; min-width: 0; height: 30px; padding: 3px 6px; border: 0.5px solid var(--ml-b2); border-radius: 6px; background: var(--ml-ov); color: var(--ml-fg); font-family: var(--ml-mono); font-size: 12px; text-align: center; }
.ml-matrix-input:focus { outline: 2px solid var(--ml-ring); border-color: var(--ml-brand); }
.ml-matrix-bracket { color: var(--ml-fg2); }

/* ---------- plots ---------- */
.ml-plot-wrap { position: relative; border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-bg); overflow: hidden; }
.ml-plot-svg { display: block; width: 100%; height: auto; touch-action: none; cursor: crosshair; }
.ml-plot-svg.is-dragging { cursor: grabbing; }
.ml-plot-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 10px; border-bottom: 0.5px solid var(--ml-b1); background: var(--ml-l1); }
.ml-plot-readout { margin-left: auto; font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-fg2); }
.ml-grid-line { stroke: var(--ml-b1); stroke-width: 0.6; }
.ml-grid-line-major { stroke: var(--ml-b2); stroke-width: 0.6; }
.ml-axis-line { stroke: var(--ml-fg2); stroke-width: 0.9; }
.ml-tick-label { fill: var(--ml-fg2); font-size: 10.5px; font-family: var(--ml-mono); }
.ml-axis-label { fill: var(--ml-fg2); font-size: 11.5px; }
.ml-curve { fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ml-plot-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; padding: 6px 10px 8px; font-size: 12px; color: var(--ml-fg2); }
.ml-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.ml-legend-swatch { width: 14px; height: 2.5px; border-radius: 2px; display: inline-block; }
.ml-point-dot { fill: var(--ml-brand); }
.ml-arrow-line { stroke: var(--ml-fg2); stroke-width: 1; }
.ml-quiver-arrow { stroke: var(--ml-fg2); stroke-width: 1.1; }
.ml-surface-edge { stroke: var(--ml-brand); stroke-width: 0.6; fill: none; }
.ml-3d-label { fill: var(--ml-fg2); font-size: 10.5px; font-family: var(--ml-mono); }
.ml-plot-hint { padding: 6px 10px; font-size: 11.5px; color: var(--ml-fg2); border-top: 0.5px solid var(--ml-b1); background: var(--ml-l1); }

/* ---------- commutative diagrams / Hasse ---------- */
.ml-diagram { width: 100%; border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-bg); overflow: hidden; }
.ml-diagram-svg { display: block; width: 100%; height: auto; }
.ml-dedge { fill: none; stroke: var(--ml-fg2); stroke-width: 1.2; }
.ml-dedge.is-highlight { stroke: var(--ml-brand); stroke-width: 2; }
.ml-dedge.is-dim { opacity: 0.28; }
.ml-dlabel { fill: var(--ml-fg); font-size: 12px; font-family: var(--ml-mono); paint-order: stroke; stroke: var(--ml-bg); stroke-width: 3px; stroke-linejoin: round; }
.ml-dlabel.is-highlight { fill: var(--ml-brand); font-weight: 600; }
.ml-dnode circle, .ml-dnode ellipse, .ml-dnode rect { fill: var(--ml-l1); stroke: var(--ml-b2); stroke-width: 1.1; }
.ml-dnode text { fill: var(--ml-fg); font-size: 13px; font-weight: 500; font-family: var(--ml-mono); }
.ml-dnode.is-hover circle, .ml-dnode.is-hover rect { stroke: var(--ml-brand); stroke-width: 2; fill: var(--ml-active); }
.ml-dnode.is-normal circle, .ml-dnode.is-normal rect { stroke: var(--ml-brand); }
.ml-diagram-legend { display: flex; gap: 14px; flex-wrap: wrap; padding: 8px 12px; font-size: 11.5px; color: var(--ml-fg2); border-top: 0.5px solid var(--ml-b1); background: var(--ml-l1); }
.ml-hasse-node text { font-family: var(--ml-mono); }
.ml-hasse-node circle { fill: var(--ml-ov); stroke: var(--ml-fg2); stroke-width: 1.1; }
.ml-hasse-node.is-normal circle { stroke: var(--ml-brand); stroke-width: 2; fill: var(--ml-active); }
.ml-hasse-edge { stroke: var(--ml-fg2); stroke-width: 1; fill: none; }
.ml-hasse-label { fill: var(--ml-fg2); font-size: 10.5px; font-family: var(--ml-mono); }
.ml-cell-hl { background: var(--ml-active) !important; color: var(--ml-fg); font-weight: 500; }

/* ---------- proof ---------- */
.ml-fitch { position: relative; border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-ov); padding: 10px 4px 10px 0; overflow: auto; max-height: 560px; font-family: var(--ml-mono); font-size: 12.5px; }
.ml-fitch-bars { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.ml-fitch-bar { position: absolute; width: 1.5px; background: var(--ml-b2); border-radius: 1px; }
.ml-fitch-line { position: relative; display: flex; align-items: baseline; gap: 8px; height: 26px; line-height: 26px; padding-right: 12px; white-space: nowrap; }
.ml-fitch-line:hover { background: var(--ml-hover); }
.ml-fitch-no { width: 34px; text-align: right; color: var(--ml-fg2); font-size: 11.5px; flex: none; }
.ml-fitch-body { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ml-fitch-rule { color: var(--ml-fg2); font-size: 11.5px; flex: none; margin-left: 12px; }
.ml-fitch-refs { color: var(--ml-fg2); font-size: 11px; flex: none; }
.ml-fitch-line.is-conclusion .ml-fitch-body { font-weight: 600; }
.ml-proof-tree { font-family: var(--ml-mono); font-size: 12.5px; overflow: auto; max-height: 560px; padding: 6px 2px; }
.ml-proof-tree ul { list-style: none; margin: 0; padding-left: 22px; border-left: 0.5px solid var(--ml-b2); }
.ml-proof-tree > ul { padding-left: 0; border-left: 0; }
.ml-proof-tree li { padding: 2px 0; }
.ml-proof-rule { color: var(--ml-brand); font-size: 11.5px; margin-left: 8px; }
.ml-proof-discharged { color: var(--ml-fg2); font-size: 11px; margin-left: 8px; }
.ml-tt-t { color: var(--ml-ok); font-weight: 600; }
.ml-tt-f { color: var(--ml-err); }
.ml-tt-result { background: var(--ml-active) !important; }

/* ---------- symbols / examples / about ---------- */
.ml-sym-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 12px; }
.ml-chip-row { display: flex; gap: 6px; flex-wrap: wrap; }
.ml-chip { appearance: none; cursor: pointer; border: 0.5px solid var(--ml-b1); background: var(--ml-l1); color: var(--ml-fg2); border-radius: 999px; height: 26px; padding: 0 11px; font-size: 12px; }
.ml-chip:hover { background: var(--ml-hover); color: var(--ml-fg); }
.ml-chip.is-active { background: var(--ml-active); color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 40%, transparent); font-weight: 500; }
.ml-sym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
.ml-sym-card { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.ml-sym-glyph { font-size: 22px; line-height: 1.25; color: var(--ml-fg); overflow-x: auto; }
.ml-sym-name { font-size: 13px; font-weight: 500; }
.ml-sym-name-alt { font-size: 11.5px; color: var(--ml-fg2); }
.ml-sym-code { font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-fg2); word-break: break-all; background: var(--ml-l2); border-radius: 5px; padding: 1px 5px; }
.ml-sym-desc { font-size: 12px; color: var(--ml-fg2); }
.ml-sym-actions { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
.ml-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border: 0.5px solid var(--ml-b2); border-radius: 6px; background: var(--ml-ov); font-family: var(--ml-mono); font-size: 13px; cursor: pointer; }
.ml-kbd:hover { background: var(--ml-hover); border-color: var(--ml-brand); color: var(--ml-brand); }
.ml-example-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 10px; }
.ml-example { border: 0.5px solid var(--ml-b1); border-radius: 10px; background: var(--ml-l1); padding: 11px 13px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ml-example-hd { display: flex; align-items: baseline; gap: 8px; }
.ml-example-title { font-size: 13px; font-weight: 500; }
.ml-example-desc { font-size: 12px; color: var(--ml-fg2); flex: 1; }
.ml-example-actions { display: flex; gap: 6px; align-items: center; }
.ml-about { margin-top: 34px; padding: 14px 0 0; border-top: 0.5px solid var(--ml-b1); font-size: 11.5px; color: var(--ml-fg2); display: flex; gap: 8px 20px; flex-wrap: wrap; }
.ml-about-sep { opacity: 0.5; }

/* ---------- misc ---------- */
.ml-scroll-x { overflow-x: auto; max-width: 100%; }
.ml-divider { height: 0.5px; background: var(--ml-b1); margin: 16px 0; border: 0; }
.ml-list { margin: 0; padding-left: 18px; font-size: 13px; }
.ml-list li { margin: 2px 0; }
.ml-li-code { font-family: var(--ml-mono); font-size: 12px; }
.ml-sep { color: var(--ml-fg2); opacity: 0.6; padding: 0 4px; }
.ml-hidden { display: none !important; }
.ml-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ml-wrap-anywhere { overflow-wrap: anywhere; }
.ml-vscroll { max-height: 360px; overflow: auto; }

@media (max-width: 820px) {
  .ml-split { grid-template-columns: 1fr; }
  .ml-json-row { grid-template-columns: 1fr; gap: 0; }
  .ml-kv-row { grid-template-columns: 1fr; gap: 0; }
}
@media (max-width: 560px) {
  .ml-inner { padding-left: 14px; padding-right: 14px; }
  .ml-title { font-size: 18px; }
  .ml-tab { padding: 7px 9px 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .ml-spinner, .ml-pill[data-status="starting"] .ml-pill-dot { animation: none; }
}
`;

  ML.installStyles = function (ctx) {
    const doc = typeof document === 'undefined' ? null : document;
    if (!doc || !doc.head) return null;
    const existing = doc.querySelector('style[data-mathlab-css]');
    if (existing) return existing;
    const style = doc.createElement('style');
    style.setAttribute('data-mathlab-css', '');
    style.textContent = ML.CSS;
    doc.head.appendChild(style);
    if (ctx && typeof ctx.effect === 'function') {
      ctx.effect(
        function () {
          return function () {
            try {
              style.remove();
            } catch (error) {
              /* ignore */
            }
          };
        },
        'mathlab: styles',
      );
    }
    return style;
  };
})();


