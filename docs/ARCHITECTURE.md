# MathLab architecture — cohesion and host boundaries

MathLab is deliberately split into layers with a narrow seam to DeepSeek Harness.

```
user
 │
 ├─ DSH Web UI (slots, locale, theme tokens)
 │    └─ client-src/90-root.js        plugin entry: registers main / sidebar / dock seats
 │         ├─ client-src/85-host.js   ONLY optional-DSH seam: native right-Sidebar tab,
 │         │                           composer draft, stage preferences
 │         ├─ client-src/60-stage-store.js  pure stage data: payload normalization,
 │         │                                 block identity, Fitch lines, Markdown
 │         ├─ client-src/61-stage-render.js block renderers + shared display pieces
 │         ├─ client-src/62-stage-transport.js SSE stream + polling fallback
 │         ├─ client-src/63-stage-extras.js symbol–step graph and optional widgets
 │         ├─ client-src/64-stage-tab.js   StageTab: reading pane, annotations,
 │         │                                export, selection-to-question
 │         ├─ client-src/65-stage-dock.js  inline dock, placement prefs, registration
 │         └─ client-src/10..59       panel, tools, plots, algebra, logic, Lean views
 │
 ├─ Host plugin (index.js, lib/)
 │    ├─ lib/tools.js                 agent tools (mathlab, mathlab_stage, …)
 │    ├─ lib/math-service.js          operation dispatcher + stage store
 │    ├─ lib/http-api.js              /api/mathlab/* on the authenticated connection channel (default deny)
 │    └─ engine/                      Python/SymPy engine (subprocess)
 │
 └─ docs/                            protocol and UI documentation
```

## The host seam

`client-src/85-host.js` is the only file that reads DSH client services directly:

| Capability | DSH service | Missing-host behaviour |
| --- | --- | --- |
| Native right-Sidebar tab and guide button | `sidebarRightTabs`, `sidebarRight` | `openStageRight()` returns false; the plugin falls back to the inline dock |
| One-click question → composer | `sessions`, `conversation` | question is recorded + copied to clipboard only |
| Placement preferences | localStorage only | defaults: both surfaces on |

Everything else calls the small facade (`ML.openStageRight`, `ML.collapseStageRight`,
`ML.sendToComposer`, `ML.stagePrefs`, `ML.useStagePrefs`) and never assumes a service exists.
The native tab registration is installed lazily when `sidebarRightTabs` appears and is
disposed when the right-sidebar preference is turned off; re-enabling installs it again.

## Non-DSH core

The stage protocol, block renderer, HTTP API, SSE stream, engine bridge, symbol atlas,
algebra/category/logic/plot modules know nothing about DSH tabs or sessions. They communicate
through plain data (`stage` JSON, `/api/mathlab/api` ops) in `lib/` and the client modules below
`60-stage-store`. The host tools are defined with local plain-JSON tool definitions
(`lib/define-tool.js`) rather than importing private DSH tool packages, which keeps the host
half installable on a stock DSH context.

The remaining coupling is the public plugin contract: the manifest in `package.json`
(`dsh.bundle.patch`, `dsh.client`), the documented slots (`main`, `sidebar.panellist`,
`conversation.input.dock`, `sidebar.right.pane.tab`), the locale service, and the design
tokens in `40-style.js`. Those are versioned DSH extension points, isolated behind the
adapter and the stylesheet rather than spread through the math engine.

## Cohesion rules

- One module owns one domain: `50..59` are operation UIs, `60..65` own the teaching
  surface, `85-host` owns host integration, `90-root` owns registration/shell.
- Fail closed on optional services: every `ctx.get`/`ctx.inject` is capability-checked and
  has a visible fallback; a missing service never disables the math tools.
- Keep the shipped client under the build budget (`build-client.mjs` refuses oversized
  bundles); documentation comments are stripped from the artifact only.

