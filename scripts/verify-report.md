# MathLab independent verification report

- Verifier: teammate `verifier` (independent; did not read Lead results before probing)
- Date: 2026-11-04 (Asia/Shanghai)
- Target: `D:\dsh-work\mathlab` (bundle `dsh-mathlab`, plugin row `mathlab`), running DSH desktop app, Web GUI `http://127.0.0.1:62937`
- Environment: Windows, Node v24.13.0, Python 3.13.9 / SymPy 1.14.0, Lean **not installed**
- Artifacts added (verifier-only): `scripts/verify-static.mjs`, `scripts/verify-http.mjs`, `scripts/verify-content.mjs`, this report. No production file was modified.

## Verdict

**PASS with defects.** Static gates, engine tests, HTTP API, error envelopes, panel UI and content are largely correct; two genuine mathematical correctness defects and one agent-tool rendering defect were found. No crashes, no engine leaks, no honesty violations about Lean.

## Checklist results

| Area | Check | Result | Evidence |
| --- | --- | --- | --- |
| Static | `node --check index.js`, `lib/*.js`, `build-client.mjs`, `client.js`, `client-src/*.js` | PASS | all exit 0 |
| Static | `python -m unittest discover -s engine/tests -v` | PASS | `Ran 68 tests ... OK` (2.35 s) |
| Static | `data/*.json` parse + counts vs docs/CONTENT.md | PASS | 294 symbols / 13 fields, 57 examples, 52 snippets; 240–320 / 40–60 / 35–60 targets met |
| Static | symbol integrity (unique ids, required text, field refs, all fields ≥12, logic/algebra/category/analysis ≥25) | PASS | logic 29, algebra 30, category 29, analysis 30 |
| Static | example integrity (unique ids, bilingual, `action.op` documented, panel enum) | PASS | 57/57; panel counts compute 18, linalg 6, algebra 6, category 7, logic 6, lean 3, topology 6, plot 5 |
| Static | `client.js` wrapper id `dsh-mathlab`, no ES import/export, no JSX, `require('react')`, one `<style data-mathlab-css>`, `ml-` classes, theme tokens | PASS | 49/49 `verify-static.mjs` checks |
| Static | host half has no runtime `@deepseek-ai/*` imports / absolute paths | PASS | only JSDoc `import('@deepseek-ai/cordis')` type comments |
| Static | `package.json` / `cordis.patch.yml` / `locale/*.json` / `icon.svg` consistency | PASS | row `mathlab`↔`dsh-mathlab`, exports/files/icon referenced, locale meta bilingual |
| HTTP | provided `node scripts/test-http.mjs` | PASS | 24/24, incl. assets 200 + correct content types |
| HTTP | provided `node scripts/test-examples.mjs` | PASS | 57/57 examples execute |
| HTTP | own probes: ≥15 ops independently re-derived (calc.dsolve/series/limit/sum/product/integrate/diff/apart/trigsimp/approx/matrix det-inv-eigen-charpoly-solve-svd-lstsq/rref/nullspace, vector grad/div/curl/laplacian, number factorint/totient/mobius/crt/fib, algebra S3/D4/GF(4)/GF(8)/poly/ring, category validate/compose/verify_diagram/limit pullback-pushout-product-equalizer-coequalizer-terminal-initial, logic truthtable/prove/prove_fol/modal K-T-S4-S5/equiv/resolve/parse, topology torus-circle-RP²-π₁, geometry christoffel/curvature/lie_bracket/exterior_derivative, num root/integrate/ode, prob dist/expectation, opt stationary/minimize, graph 9 ops, plot 7 kinds + SVG) | PASS (154/157 checks; 2 failures are real defects below, 1 doc/behavior mismatch) | `scripts/verify-http.mjs`; SymPy used as an independent oracle (separately spawned `python -c`, not the plugin) |
| HTTP | error envelopes: bad expr→`parse-error`; oversized expr→`limit`; 13×13→`limit`; order 1e6→`limit`; singular→`domain-error`; bad `n`→`bad-request`; malformed JSON→HTTP 400; GET→405; cross-origin→403; unknown asset→404; engine answers correctly after all errors | PASS | `calc.simplify 2+2=4` after probes; meta.info still `engine.available:true` |
| Tools | all five tools callable with realistic args | PARTIAL | `mathlab` calc.integrate/dsolve/simplify OK; `mathlab_plot` svg saved `D:\dsh\mathlab-plot-1793723794372.svg` (5456 chars) and returned path; `mathlab_lean` info/check callable (check→actionable Lean-missing error); `mathlab_reference` search/examples/help/status callable; `mathlab_status` callable |
| Tools | result text/data useful; error handling | **FAIL (D3)** | rendered text for `mathlab_status`, `mathlab {op:"algebra.group"}`, `{op:"logic.prove"}`, `mathlab_plot sample`, `mathlab_reference search/symbols/examples`, `mathlab_lean info` is only the `## op` heading; the JSON `data` payload is never rendered (see D3) |
| UI | sidebar 数学研究台 opens panel; header/title/subtitle/status pill/tab bar | PASS | observed: `MathLab · 数学研究台`, subtitle, pill `引擎就绪 · Python 3.13.9 · Lean —`, tabs `计算 线代 代数 范畴 逻辑 Lean 拓扑 绘图 符号 例子` |
| UI | tabs render without slot crash; compute works | PASS | observed 符号/线代/代数/范畴/绘图/计算; category editor shows an SVG commutative-diagram preview; plot tab rendered `sin(x)/cos(x)/x**2/8` sample_multi chart (37 ms, 3 curves, legend); 计算 ran chip 三角恒等式 → `calc.simplify` 44 ms, KaTeX renders `sin²(x)+cos²(x)=1`, approx `1.0`, copy buttons, history updated |
| UI | light/dark | NOT TESTED | app was in light theme; no dark-mode forcing performed |
| Content | all 294 symbol LaTeX strings compile in KaTeX with `throwOnError` | PASS | bundled `assets/katex/katex.min.js` (0.16.47) via vm sandbox |
| Content | 10 sampled symbols mathematically accurate | PASS | definite integral, limit, ∀, ∃, ∅(\varnothing), ∇, Δ, ℘, ⊢, ⊗; names/descriptions correct; Lean names plausible |
| Content | 5+ examples match `expect` | PASS | gaussian-integral=√π, basel=π²/6, s3-order=6, circle-homology betti [1,1], normal-pdf=0.3989422804, factor-quartic result exactly `(x - 1)*(x + 1)*(x**2 + 1)`, torus-christoffel Γ verified symbolically |
| Content | 5 sampled Lean snippets audited for real Mathlib names | PASS (no fabrication found) | `irrational_sqrt_two`, `Nat.Prime`, `F ⊣ G` (CategoryTheory.Adjunction), `∫ x, f x ∂μ` (MeasureTheory.integral), `F.obj`; imports only `Mathlib`/`Mathlib.Tactic` across all 52 |
| Honesty | `meta.info`/`mathlab_status` report Lean unavailable; install hint; no fake success | PASS | `meta.info.lean.available=false`, `lean.info.note` = install hint, `lean.check` → `unsupported` with actionable message; README says Lean not installed |
| Honesty | README/NOTICE accuracy | PARTIAL (D5, D6) | NOTICE lists SymPy/Mathlib/Lean/NetworkX/SciPy/NumPy/Python/KaTeX (+ MIT LICENSE bundled) — correct; but README credits `dsh-better-sidebar` “见 NOTICE” and NOTICE has no such entry; README says SVG export is 2D-only while `plot.svg surface3d` works |

## Defects (with reproduction)

### D1 (high, math correctness) — `algebra.group subgroup_lattice` marks non-normal C2 subgroups of S₃ as normal
- Where: `engine/malgebra.py:423` (`entry["isNormal"] = bool(sub.is_normal(group))`), triggered after `_group_notation()` (`engine/malgebra.py:291-299`) caches `PermutationGroup.is_abelian`; SymPy 1.14.0's `is_normal` has the shortcut `if self._is_abelian: return True` (verified in local SymPy source), which is false for abelian non-normal subgroups. The same cache effect can include non-normal covers in `edges` (`engine/malgebra.py:446`).
- Repro: `POST /mathlab/api {"op":"algebra.group","args":{"op":"subgroup_lattice","generators":[[[1,2,3]],[[1,2]]],"n":3}}`
- Observed: all 6 nodes `"isNormal": true` (`normalOrders [1,2,2,2,3,6]`). Correct: only order 1 (trivial), 3 (A₃) and 6 (S₃) are normal → `[1,3,6]`. Cross-check: same request with `"op":"normal_subgroups"` correctly returns count 3 (orders 1,3,6), and `sylow` correctly reports `is_normal:false` for the p=2 Sylow.
- Impact: wrong mathematical labels in the subgroup-lattice SVG/UI and API data; the Hasse edge filter is also bypassed.

### D2 (medium, math correctness) — `algebra.poly roots` ignores `p` (GF(p) domain)
- Where: `engine/malgebra.py:1074-1079`; for p>0 it calls `sympy.roots(poly.as_expr(), x, modulus=p)` — SymPy 1.14.0's `roots` accepts no `modulus` semantics and returns complex roots.
- Repro: `POST /mathlab/api {"op":"algebra.poly","args":{"coeffs":[1,0,1],"p":5,"op":"roots"}}`
- Observed: `domain:"GF(5)"` but roots `["-I","I"]`. Correct: x²+1=(x−2)(x−3) over GF(5) → roots {2,3}. Cross-check: same poly with `"op":"factor"` correctly returns `(x + 2)*(x - 2)`, and `sympy.Poly(x**2+1, modulus=5).ground_roots()` gives `{-2:1, 2:1}`.
- Fix hint: use `poly.ground_roots()` (respects the modulus) instead of `sympy.roots(..., modulus=p)`.

### D3 (medium, agent UX) — all MathLab tools drop their `data` payload from the model-facing result
- Where: `lib/define-tool.js:52` default `render` returns only `[{type:'text', text: value.text}]`; `lib/tools.js:59` puts the full JSON in `data`, and `lib/tools.js:6-7/90` promises "Results include ... in `data`". Observed rendered text:
  - `mathlab_status` → `## meta.info` only (no engine/Lean status at all)
  - `mathlab {op:"algebra.group"...}` → `## algebra.group` only
  - `mathlab {op:"logic.prove"...}` → `## logic.prove` only
  - `mathlab_plot {action:"sample"...}` → `## plot.sample` only
  - `mathlab_reference {action:"search"/"symbols"/"examples"}` → heading only
  - `mathlab_lean {action:"info"}` → `## lean.info` only
  Expressions with `pretty`/`solution`/`value` text (e.g. calc.integrate, calc.dsolve) still render, and `mathlab_plot svg` renders a saved path, and `help` renders body text — so the defect is confined to structured results whose payload lives only in `data`.
- Repro: call `mathlab_status` and inspect the returned text; `mathlab {op:"algebra.group"}`.
- Note: this does not affect the HTTP API or the web panel; it blocks agents from seeing structured results (including the honesty-relevant Lean status). Suggested fix: extend `render` to append truncated `value.data`.

### D4 (low, docs/contract) — unknown op returns `bad-request`, docs say `unsupported`
- Where: `lib/math-service.js:45` raises `bad-request` `invalid op`; `docs/HOST.md:73` acceptance says "unknown op → `unsupported`". Engine-level unknown op (dir `engine/tests`) uses `unknown-op`. Repro: `POST {"op":"definitely.not.an.op","args":{}}` → `{ok:false,error:{code:"bad-request"}}`.
- Impact: doc/behavior mismatch only; envelope is still well-formed with an actionable message.

### D5 (low, attribution) — README credits `dsh-better-sidebar` “see NOTICE”, but NOTICE has no such entry
- Where: `README.md:94` vs `NOTICE.md` (no `dsh-better-sidebar`, no license/URL). Either add it to NOTICE or drop the credit.

### D6 (low, docs) — README says SVG export covers 2D only; `plot.svg surface3d` produces a valid wireframe SVG
- Where: `README.md:102` vs observed `POST {"op":"plot.svg","args":{"kind":"surface3d",...}}` → well-formed SVG (19 683 chars). Understated, not dishonest.

### D7 (low, schema/data shape) — `category.natural` labels naturality entries with the morphism id in the `object` field
- Where: `engine/mlcategory.py:589,621` (`"object": morphism_id`); `docs/API.md:136` documents `{object, square}`. Observed: components `{object:"A",morphism:"idA"}` → naturality `[{object:"idA",...}]`. Squares themselves commute correctly (`valid:true`).
- Repro: `POST {"op":"category.natural","args":{...identity functor on a 2-object category...}}`.

### D8 (low, robustness) — malformed category morphism mapping returns `code:"internal"` + raw TypeError text
- Where: `engine/mcategory.py` pushout path (engine `process_line` wraps unexpected exceptions as `internal`). Repro: `POST {"op":"category.limit","args":{"kind":"pushout","C":["c1","c2"],"A":["a1"],"B":["b1"],"f":[0],"g":[0]}}` → `{"ok":false,"error":{"code":"internal","message":"TypeError: 'list' object is not callable"}}`. Should be `bad-request`/`limit`. No crash; valid pushout/pullback calls are correct.

### D9 (low, docs/schema) — tool/API description gaps
- `mathlab_reference` parameter enum includes `"status"` (`lib/tools.js:212`) but the description (`lib/tools.js:208`) omits it.
- `docs/API.md:90` omits that `calc.vector grad/laplacian` need `expr` and `evaluate` needs `at` (actual behavior from tests is sensible).
- `docs/API.md:173` implies `lean.check` returns `{ok, diagnostics}`; without a toolchain it returns a `unsupported` error envelope (arguably fine, but undocumented).
- `docs/API.md:215` says `meta.info` exposes top-level `symbols`/`examples` counts; actual result nests them under `content` (`{"content":{"symbols":294,"examples":57,...}}`), plus extra useful fields. Update docs or response.
- `docs/UI.md:93` names the 8th tab `拓扑几何`; the running UI/client dict uses `拓扑` (`client.js` `'tab.topology': '拓扑'`; title `'topology.title': '拓扑与几何'`).

## Other observations (not defects)

- A transient `ECONNRESET` occurred once per full probe run while local SymPy oracle calls paused between requests; retried once and succeeded. DSH host uptime was continuous and engine answered, so this is transport/keep-alive flakiness in the probe, not an engine crash. Worth a note if agents batch long calls.
- `algebra.perm multiply` uses the left-to-right convention `(1 2 3)(1 2) = (2 3)`; docs/API.md does not state the composition convention (the web panel labels its own composition convention). Minor doc gap.
- UI light theme only; KaTeX rendered correctly; SVG plots/commutative diagram render; no console/slot errors observed (visual inspection).
- Tool `mathlab_plot svg` writes into the session working directory (`D:\dsh`), as documented.

## Verification limits

- Lean is not installed, so Lean snippets were reviewed against knowledge, not compiled.
- UI was inspected visually via Windows UIA/screenshots for 6 of 10 tabs; other tabs inferred present but not individually opened.
- Tool `data` visibility was determined from the model-facing rendered result; the HTTP layer and panel are unaffected.
- Independent math oracle used local SymPy 1.14.0 (separately invoked), which is the same library the engine uses; hand-derived expectations were used wherever practical (integrals, series, groups, homology, modal/logic models, curvature, optimization).

## Lead resolution (post-report, 2026-11-04)

All findings were fixed before delivery; the fixes were re-verified against the live plugin.

| Finding | Fix | Verification |
| --- | --- | --- |
| D1 HIGH — S3 lattice marks C2 subgroups normal | `engine/malgebra.py`: new `_is_normal_subgroup()` conjugation-closure test; all `is_normal` call sites replaced (SymPy's abelian short-cut no longer trusted). Subgroup-lattice `edges` now returns every cover relation plus `normalEdges`. | `algebra.group subgroup_lattice` live: normals `[1:T, C2:F, C2:F, C2:F, C3:T, S3:T]`; `edges` 8, `normalEdges` 5; `scripts/test-http.mjs` PASS (6-subgroup assertion still green). |
| D2 MED — `algebra.poly roots` ignores GF(p) | roots branch now uses `poly.ground_roots()` (respects the GF(p) domain). | live `x²+1 mod 5` → roots `["-2","2"]` (= 2,3 mod 5). |
| D3 MED — tool `data` never rendered | `lib/define-tool.js` default render appends a fenced JSON block; `lib/tools.js` `formatResult` adds a JSON fallback body for status-like objects. | direct render unit: `render => "hello world\n```json\n{\"a\":1,\"b\":[2,3]}\n```"`; all 5 tools still register/activate. |
| D4 low — unknown-op code drift | `docs/HOST.md` acceptance now says `bad-request`/`unsupported`. | doc only. |
| D5 low — NOTICE missing attribution | `NOTICE.md` adds DSH and dsh-better-sidebar (fence adaptation). | reviewed. |
| D6 low — README SVG scope understated | README states 2D SVG + isometric 3D wireframe SVG. | docs. |
| D7 low — `category.natural` object label | naturality entries now carry `object: <domain object>`. | live identity-functor check: `object:"A"`, square ok. |
| D8 low — malformed pushout `internal` | `engine/mlcategory.py` `_limit_safe` wrapper maps `KeyError/TypeError/IndexError/ValueError` to `bad-request`. | live malformed pushout → `{"code":"bad-request","message":"'f' must be an array"}`. |
| D9 docs/schema drift | API.md: `calc.vector` argument shapes, permutation convention, `lean.check` unsupported envelope, `meta.info` nested `content` shape; UI.md tab `拓扑`; `mathlab_reference` description includes `status`. | docs. |

Regression evidence after fixes: `python -m unittest discover -s engine/tests -v` → 68/68 OK;
`node scripts/test-http.mjs` → ALL PROBES PASSED; `node scripts/test-examples.mjs` → 57/57;
`node --check` on every JS file; panel re-inspected via UIA/screenshot (compute, algebra,
category diagram, logic proof, Lean status, plot, symbols all render).

