# MathLab verification & operations notes (for the verifier and future maintainers)

## Live environment

- DSH desktop profile: `C:\Users\hp\.dsh\profiles\desktop`
- MathLab package (linked workspace bundle): `D:\dsh-work\mathlab`
- Plugin row id: `mathlab` (`include:mathlab`); bundle `dsh-mathlab`; client module id `dsh-mathlab`
- Web GUI: `http://127.0.0.1:62937` (desktop window title contains `DeepSeek Harness`)
- The plugin is installed through `plugin_manager`; **do not** remove/reinstall it. After host-half edits the
  Lead toggles `include:mathlab` off/on to activate a fresh module generation. The Web page picks up a
  changed `client.js` through the client HMR receiver when the bundle graph changes; a page reload also works.

## HTTP API (authenticated DSH channel only)

The routes are registered on `ctx.connection.fetch` (DSH's authenticated browser channel).
There is **no unauthenticated webServer route and no fallback**. A CLI without the browser's
session must receive `401` for `/api/mathlab/*` and must not get a `200` from the removed legacy `/mathlab/*` surface (`GET` is `404`; the DSH server may answer other methods with `405`). That is the expected default-deny behaviour.

```bat
node scripts/test-http.mjs
:: with the GUI URL to also run live unauthenticated probes:
node scripts/test-http.mjs http://127.0.0.1:53640
```

Manual probe from a local shell (expected: `401`, never `200`):

```powershell
Invoke-WebRequest -Method POST -Uri http://127.0.0.1:53640/api/mathlab/api -ContentType application/json -Body '{"op":"lean.info","args":{}}' -SkipHttpErrorCheck
```

Authenticated checks are performed through the running Web panel (engine status, KaTeX
rendering, stage list/SSE). The envelope is `{ok:true,result}` or
`{ok:false,error:{code,message}}`. `meta.info` should report `engine.available:true` with
Python/SymPy versions; `content.symbols > 0`; `lean.available` reflects the real toolchain
(expected `false` here until Lean is installed).

Static assets are served only through the same authenticated channel at
`/api/mathlab/assets/katex/...`; unauthenticated requests are `401`, unknown names are `404`.

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
- [ ] `/api/mathlab/api` meta.info through the authenticated panel: engine available, content counts > 0.
- [ ] Security: `node scripts/test-http.mjs` passes; unauthenticated POST to `/api/mathlab/api` (including `lean.info`) is `401`; legacy `/mathlab/api` is not `200` (GET `404`, POST `405`); unauthenticated asset/SSE requests are not `200`; missing `connection.fetch` registers no route.
- [ ] At least 15 varied ops return mathematically correct results (integral, group lattice, truth
      table, ND proof, category validation, set pullback, circle homology, curvature, plot sample,
      prob/opt/graph, Lean info/check diagnostic).
- [ ] Error paths: bad expression → `parse-error`; unknown op → `bad-request`/`unsupported`; oversized input → `limit`; malformed limit input → `bad-request`.
- [ ] Live Stage: `mathlab_stage present` renders the 讲解 tab (title/blocks/focus), `get` returns learner annotations/questions, `export` returns Markdown; every `mathlab`/`mathlab_plot`/`mathlab_lean` call appends to `stage.trace`; system-prompt section `mathlab-teaching` is present.
- [ ] All five tools callable with correct schemas; `mathlab_plot` SVG saved to a path and valid XML.
- [ ] Sidebar 数学研究台 opens the panel; tabs render; no console/slot crash; KaTeX or fallback visible.
- [ ] `mathlab_status` honestly reports Lean missing.
- [ ] `NOTICE.md`/`README.md` present and accurate.

