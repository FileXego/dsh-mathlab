# MathLab verification & operations notes (for the verifier and future maintainers)

## Live environment

- DSH desktop profile: `C:\Users\hp\.dsh\profiles\desktop`
- MathLab package (linked workspace bundle): `D:\dsh-work\mathlab`
- Plugin row id: `mathlab` (`include:mathlab`); bundle `dsh-mathlab`; client module id `dsh-mathlab`
- Web GUI: `http://127.0.0.1:62937` (desktop window title contains `DeepSeek Harness`)
- The plugin is installed through `plugin_manager`; **do not** remove/reinstall it. After host-half edits the
  Lead toggles `include:mathlab` off/on to activate a fresh module generation. The Web page picks up a
  changed `client.js` through the client HMR receiver when the bundle graph changes; a page reload also works.

## HTTP API (works from any local shell; no auth header needed)

The route is fenced by Host/Origin only:

```bat
node scripts/test-http.mjs
:: or
node scripts/test-http.mjs http://127.0.0.1:62937
```

Manual probe:

```powershell
$body = '{"op":"meta.info","args":{}}'
Invoke-WebRequest -Method POST -Uri http://127.0.0.1:62937/mathlab/api -ContentType application/json -Body $body
```

Envelope: `{ok:true,result}` or `{ok:false,error:{code,message}}`. `meta.info` should report
`engine.available:true` with Python/SymPy versions once the engine file exists; `content.symbols > 0`
once `data/symbols.json` is present; `lean.available` reflects the real toolchain (expected `false`
on this machine until Lean is installed).

Static assets: `GET /mathlab/assets/katex/katex.min.js` (200 `text/javascript`),
`/mathlab/assets/katex/katex.min.css`, `/mathlab/assets/katex/fonts/<font>.woff2`,
`/mathlab/assets/katex/LICENSE`. Anything else under the prefix must 404.

## Agent tools (registered on the harness tool registry)

`mathlab`, `mathlab_plot`, `mathlab_lean`, `mathlab_reference`, `mathlab_status`.
A fresh agent turn (or a freshly spawned subagent) sees them. Exercise each at least once and check
the tool result text + `data` JSON; verify error envelopes for bad input (unknown op, parse error,
out-of-range matrix) are returned as tool errors with actionable messages, not crashes.

## Web panel

The sidebar contains a **数学研究台** row (order 30) that selects the `main` panel keyed `mathlab`.
UI verification in the running desktop app can use the Windows computer-use lane:

1. `mcp__wincu__windows_computer_use_snapshot` with `windowTitle: "DeepSeek Harness"`,
   `captureWindow: true`, `includeScreenshot: true`; read the UIA tree.
2. Find the `数学研究台` button under the 全局面板 group and `windows_computer_use_invoke` it
   (background invoke; do not move the user's mouse unless necessary).
3. Snapshot again: the central panel is the MathLab page; check header, engine status pill and the
   tab bar (`计算/线代/代数/范畴/逻辑/Lean/拓扑几何/绘图/符号/例子`), then at least one tab's
   interactive result (for example run a compute example, open the symbol atlas, open a plot SVG).
4. Light/dark: the desktop app theme follows the app setting; inspect tokens rather than forcing a
   theme, and report what was actually seen.

If the page still shows the old scaffold after a client change, the HMR receiver may not have
refreshed it; note that limitation instead of editing the app.

## Acceptance checklist

- [ ] `node --check client.js`, `node --check index.js`, all `lib/*.js` parse.
- [ ] `python -m unittest discover -s engine/tests -v` green.
- [ ] `python -m json.tool data/symbols.json` etc. parse; counts meet `docs/CONTENT.md`.
- [ ] `/mathlab/api` meta.info: engine available, content counts > 0.
- [ ] At least 15 varied ops return mathematically correct results (integral, group lattice, truth
      table, ND proof, category validation, set pullback, circle homology, curvature, plot sample,
      prob/opt/graph, Lean info/check diagnostic).
- [ ] Error paths: bad expression → `parse-error`; unknown op → `bad-request`/`unsupported`; oversized input → `limit`; malformed limit input → `bad-request`.
- [ ] Live Stage: `mathlab_stage present` renders the 讲解 tab (title/blocks/focus), `get` returns learner annotations/questions, `export` returns Markdown; every `mathlab`/`mathlab_plot`/`mathlab_lean` call appends to `stage.trace`; system-prompt section `mathlab-teaching` is present.
- [ ] All five tools callable with correct schemas; `mathlab_plot` SVG saved to a path and valid XML.
- [ ] Sidebar 数学研究台 opens the panel; tabs render; no console/slot crash; KaTeX or fallback visible.
- [ ] `mathlab_status` honestly reports Lean missing.
- [ ] `NOTICE.md`/`README.md` present and accurate.
