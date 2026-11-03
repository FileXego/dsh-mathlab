# MathLab client panel — build guide

The Web UI half is a single browser artifact loaded by `window.__ModuleLoader__` from
`client.js`. It is plain JavaScript: **no JSX, no imports, no bundler**; `React` is the
only module available (`require('react')`). Source lives in `client-src/*.js` and is
concatenated by `node build-client.mjs` into `client.js` (the installed artifact).

## Already-working registration (do not change the shape)

```js
window.__ModuleLoader__.load({
  id: 'dsh-mathlab',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const ML = { React, h, NS: 'dsh-mathlab', DICT: {} };
    // ... client-src modules ...
    return ML.plugin;
  },
});
```

`90-root.js` must end with:

```js
ML.plugin = {
  inject: ['slots', 'locale'],
  apply(ctx) {
    ML.installStyles();                       // <style> element, cleaned up by ctx.effect
    ctx.effect(() => ctx.locale.register(ML.NS, { zh: ML.DICT.zh, en: ML.DICT.en }), 'mathlab: locale');
    const t = ML.makeT(ctx);
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'mathlab', locale: ML.NS },
      (props) => h(ML.Panel, { ...props, t: props.t ?? t })));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist', id: 'mathlab', order: 30, label: () => t('panel'),
    }, ML.Icon));
  },
};
```

The panel is rendered in the central `main` slot under key `mathlab`; the sidebar icon
selects it automatically (the sidebar row id addresses the main key). Panel component
props include the standard slot props plus `t` (a namespace-bound translator, may be
undefined — fall back to `ML.makeT`).

## Host API

```js
const res = await fetch('/mathlab/api', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ op: 'calc.simplify', args: { expr: 'sin(x)**2+cos(x)**2' } }),
});
const payload = await res.json();   // {ok:true,result} | {ok:false,error:{code,message}}
```

Wrap it once in `20-api.js`: `ML.callMath(op, args)` throws an `ML.MathLabError` carrying
`code`/`message`; `ML.useCall()` returns `{run, loading, error, result}` helpers. The
engine may be briefly unavailable while Python starts: show *引擎启动中…* and offer retry.
All ops are listed in `docs/API.md`; the same operations are exposed to the agent as tools.

Static assets served by the Host (load lazily, cache in a module promise):
- `/mathlab/assets/katex/katex.min.js`, `/mathlab/assets/katex/katex.min.css`,
  fonts under `/mathlab/assets/katex/fonts/`. Use `ML.renderMath(container, latex)` helper:
  KaTeX if available, otherwise `container.textContent = latex` (never throw).
- `ML.ensureKatex()` returns a shared Promise<boolean>.

## Visual language (must match the host)

- Colors only through theme tokens (append a safe fallback):
  `--dsw-alias-bg-base`, `--dsw-alias-bg-layer-1`, `--dsw-alias-bg-layer-2`,
  `--dsw-alias-bg-overlay`, `--dsw-alias-border-l1`, `--dsw-alias-border-l2`,
  `--dsw-alias-brand-primary`, `--dsw-alias-label-primary`, `--dsw-alias-label-secondary`,
  `--dsw-alias-state-error-primary`, `--dsw-alias-state-idle-primary`,
  `--dsw-alias-state-success-primary`, `--dsw-alias-state-warn-primary`.
  Hover/selection fills: `color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent)`.
- Same page frame as host panels: full-height `<section>`, centered content
  `max-width: 1100px`, `padding: 0 clamp(20px,4vw,44px) 44px`, h1 20px/500, secondary
  text 13px, controls 28–36px high, radius 8–12px, 0.5px borders.
- Every class prefixed `ml-`; inject all CSS once via one `<style data-mathlab-css>`.
- Light and dark both must read correctly (no hard-coded backgrounds/text colors).
- Accessibility: tabs are `<button role="tab" aria-selected>` with roving `tabIndex`,
  inputs have `<label>`, errors `role="alert"`, focus ring `outline: 2px solid brand`.
- Do not write outside your own subtree, do not touch `document.body`/`head` beyond the
  one style element, do not read other plugins' DOM.

## Panel shell

Header: product mark + title `MathLab · 数学研究台`, subtitle, engine status pill
(`engine ready / python ×.xx / Lean ✓/—`), then a tab bar. Tabs (ids):

`compute` 计算 · `linalg` 线代 · `algebra` 代数 · `category` 范畴 · `logic` 逻辑 ·
`lean` Lean · `topology` 拓扑 · `plot` 绘图 · `symbols` 符号 · `examples` 例子 ·
`stage` 讲解（Live Stage，order 5，默认第一页签；poll `stage.get` 每 ~900ms + SSE 推送，块渲染与逐步导航见
[STAGE.md](STAGE.md)）

另外注册 `conversation.input.dock`（会话输入区上方的内联讲解条，order 35）：按 **当前 Session** 显示
「讲解舞台 · 标题 · 第 x/y 步 · rev」，带 **右侧 / 内嵌 / 关闭** 三态开关（选择持久化，三种表面互斥）。
右侧模式注册 DSH 原生右侧 Sidebar 的 `mathlab-stage` tab（`sidebarRightTabs` + `sidebar.right.pane.tab` +
标题 seat + 「开始」页 guide 入口），是真正挤压聊天宽度的分栏；顶栏（步进/标签/步骤条/缩放）固定（sticky），
正文独立滚动；`A−/A+/⟲` 对正文与图像做 75%–175% 缩放并记住比例。内嵌模式在输入框上方展开；关闭只保留一行。
宿主缺少原生服务时自动退回内嵌。SSE 实时更新。

Each tab is a component in its own module registered into `ML.tabs[i] = {id,labelKey,Component}`;
`90-root.js` renders the active one. Keep panel state per tab when switching (render all
tabs but hide inactive ones, or keep state in a top-level store — hidden-render is fine for
v1, but avoid running network calls for never-opened tabs).

## Tab requirements

### compute — symbolic workbench
Expression textarea + insert-symbol palette (∫ ∑ √ π ∞ ∂ ∇ etc. insert at caret).
Op picker (simplify / expand / factor / apart / diff / integrate / limit / series / solve /
sum / product / dsolve / approx) with the relevant argument fields shown conditionally
(var, order, point, lower/upper, equations, ics). Run (Ctrl/Cmd+Enter), cancel not required.
Result card: KaTeX display of `input_latex` → `latex`, pretty text (monospace), approx,
copy-LaTeX/copy-pretty buttons, notes. History list (last 20, click to restore),
built-in quick examples. Errors inline with code.

### linalg — matrices
Grid editor 1–8×1–8 (add/remove row/col, paste from CSV/whitespace), op picker
(det, inv, rank, rref, eigen, charpoly, nullspace, solve with rhs editor, lstsq, svd,
transpose), result renderer: scalar, matrix grid, eigen list (value + vector + copy).
Show rank/dimension notes.

### algebra — abstract algebra
Sub-tabs:
1. Permutation calculator: cycle input (`(1 2 3)(4 5)` parser or raw `[[1,2,3],[4,5]]`),
   multiply/inverse/order/type/sign/conjugate; show mapping table.
2. Group explorer: generators input, |G|, elements (order, parity), is_abelian, center,
   conjugacy classes, Cayley table (sticky header, element labels), subgroup lattice as
   Hasse SVG from `algebra.group` `subgroup_lattice`, normal-subgroup badges.
3. Finite field GF(p^n): p, n inputs, arithmetic (add/mul/inv/pow) and addition/
   multiplication table (≤ 256 elements), primitive element, irreducible polynomial.
4. Ring Z/nZ: units, zero divisors, table (n ≤ 40), field/integral-domain flags.

### category — finite categories
Editor for objects (id + label) and morphisms (id, dom, cod, label), identity mapping,
composition table with add/remove rows; Validate button → violations list (codes are
clickable-highlight), summary counts.
Additional tools: functor checker (two small categories + object/morphism mapping textareas),
natural transformation checker, `category.verify_diagram` wiring, and a **commutative
diagram renderer** (SVG): nodes laid out by longest-path layers, arrows with labels,
parallel morphisms curved, self-loops, identity arrows hidden, hover highlights. The same
renderer draws the source category while editing.
Limits toolbox: product/coproduct/equalizer/coequalizer/pullback/pushout with JSON set
inputs (prefilled valid examples), result object displayed as table/JSON tree.

### logic — logic & proof
Formula editor with symbol palette (`¬ ∧ ∨ → ↔ ∀ ∃ □ ◇ ⊢ ⊨`), logic selector (prop / FOL /
modal), actions: parse, truth table (rendered grid, tautology badge), natural-deduction
proof (Fitch-style rendered proof with rule names and discharge bars; tree view toggle),
FOL bounded validity, resolution, modal (frame selector), equivalence.
Countermodel display (assignment/table). Invalid proofs show diagnostic.

### lean — Lean 4
Status card (available?, version, path, install hints when missing: elan/lean4 command and
that the plugin auto-detects `lean`/`lake` on PATH). Snippet library: search + level filter,
cards with title, code preview, Import/Insert button. Code editor textarea (monospace,
line numbers optional) with files to check: `lean.check`; diagnostics list with severity
icons, line:col, message; stdout/stderr collapsed. A notation/cheat-sheet card
(∀ ∃ λ Π Σ ⟨⟩ ∣ ⊢ ≠ ≤ ⊤ ⊥ ⋃ ⋂ ∘ → ↔ ↔) with the Mathlib names from `data/symbols.json`.
Never claim Lean is installed when `lean.info.available` is false.

### topology — graduate topology & geometry
Three sub-tools: simplicial homology (simplex rows input, betti/torsion/euler display),
fundamental group of a graph (edge list → generators/relations/betti1), and metric
curvature (coordinate names + metric matrix of expressions → Christoffel/Ricci/scalar
tables, LaTeX). Keep result tables scrollable.

### plot — graphs
2D: expression list editor, range, sample count; canvas/SVG plot with grid, axes ticks,
labels, legend, discontinuities, zoom (wheel) and pan (drag), reset, download SVG.
Modes: explicit / parametric / polar / implicit contour / vector field.
3D: surface `z=f(x,y)` wireframe with drag-rotate, z-range legend.
All rendering client-side from `plot.*` data; no server images.

### symbols — symbol atlas
Search box + field filter chips (from `symbols.list`), result cards grouped by field:
glyph (KaTeX/unicode) large, name zh/en, LaTeX code, Lean name, SymPy name, description,
copy buttons. Also a compact "notation keyboard" at top that inserts into the last focused
MathLab input if feasible (otherwise copy-to-clipboard is enough).

### examples — gallery
Cards from `examples.list`, grouped by field; title zh/en, description, "打开" button that
switches to the example's tab and prefills `action` (use a tiny `ML.bus` pub/sub: panel
publishes `{tab, op, args}`, tabs subscribe). Show the underlying `op` and args in a details
toggle; copyable JSON.

### about (footer of panel)
Small footer: version, Python/SymPy/Lean status, links to notes in README, open-source
attribution summary (SymPy, Mathlib4, Lean, NetworkX, SciPy, KaTeX) — no marketing copy.

## Module/build workflow

```bat
node build-client.mjs     :: concatenates client-src/*.js -> client.js
node --check client.js    :: syntax gate
```

Keep every module < ~40 KB, pure functions where possible, and React hooks correct
(no conditional hooks). The panel must survive `payload.ok === false` for every call and
must not throw on malformed server data (defensive reads with defaults).

Local iteration: after editing, run the build; the Host serves `client.js` from the
linked plugin directory, and a page reload (or plugin toggle by the Lead) picks it up.
Do not attempt to install/uninstall the plugin or edit `index.js`, `lib/`, `engine/`,
`data/`, or `package.json` — the Lead owns those.
