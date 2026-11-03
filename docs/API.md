# MathLab v1 API contract

MathLab has one operation layer with two callers:

```
browser panel  ──POST /mathlab/api──▶  Host service  ──line-delimited JSON──▶  Python engine
agent tools    ──ctx.tools──────────▶  Host service  ──(same dispatch)───────▶  Python engine
```

Everything below is frozen for v1. The Host implements the dispatch + Python bridge;
the Python engine implements every `op` listed under **Engine ops**.

## 1. Browser → Host

`POST /mathlab/api`, `content-type: application/json`, body `{ "op": "<group.action>", "args": {...} }`.

Success: `200 { "ok": true, "result": <any JSON> }`
Failure: `200 { "ok": false, "error": { "code": "<code>", "message": "<human text>" } }`

Error codes: `parse-error`, `domain-error`, `unsupported`, `timeout`, `engine-down`, `bad-request`, `unknown-op`, `limit`, `forbidden`.

The Host answers these itself (no Python needed): `symbols.list`, `symbols.search`,
`examples.list`, `examples.get`, `lean.snippets`, `meta.info` (merges engine capabilities).

Same-origin `fetch('/mathlab/api', { method:'POST', body: JSON.stringify(...) })` is enough —
the route is fenced by Host/Origin checks, there is no CSRF token.

## 2. Host → Python engine

The Host spawns `python -u engine/mathlab_engine.py` once and writes one JSON line per request:

```
{"id": 1, "op": "calc.simplify", "args": {"expr": "sin(x)**2+cos(x)**2"}}
```

Responses, one JSON line each:

```
{"id": 1, "ok": true, "result": {...}}
{"id": 1, "ok": false, "error": {"code": "parse-error", "message": "..."}}
```

The engine may emit `{"ready": true, "info": {...}}` on startup (informational; ignored).
Requests are serialized. A crashed worker is restarted by the Host once per request.

## 3. Shared result shapes

**Expr result** — used by every symbolic op:

```json
{
  "input": "sin(x)**2+cos(x)**2",
  "result": "1",                    // sympy sstr()
  "pretty": "1",                     // sympy.pretty(), unicode
  "latex": "1",                      // sympy.latex() of the result
  "input_latex": "\\sin^{2}{\\left(x \\right)} + \\cos^{2}{\\left(x \\right)}",
  "approx": "1.0",                   // optional numeric approximation
  "notes": ["..."]                   // optional
}
```

Every symbolic op may also return `"extra": {...}` with op-specific detail. Arrays of
results use the same object shape per entry.

All limits: input string <= 4000 chars, matrix dimension <= 12, generated output text
<= 20000 chars per field (truncate with `notes`), computation wall clock <= 20 s per op
(use cheap defaults; heavy degrees/orders rejected with `limit`).

## 4. Engine ops

### meta
- `meta.info` → `{version, python, sympy, numpy, scipy, networkx, lean: {available, version|null, path|null}, capabilities: ["calc", "algebra", ...]}`

### calc — symbolic calculus / algebra
- `calc.simplify {expr, assumptions?}` → expr result
- `calc.expand {expr}` / `calc.factor {expr}` / `calc.apart {expr, var}` / `calc.cancel {expr}` / `calc.trigsimp {expr}` / `calc.rationalize {expr}` / `calc.powdenest {expr}` → expr result
- `calc.diff {expr, var="x", order=1}` → expr result
- `calc.integrate {expr, var="x", lower?, upper?}` → expr result (definite when lower & upper are numbers or expressions)
- `calc.limit {expr, var="x", point="0", direction="both"}` → expr result (`point` may be `"oo"`, `"-oo"`, `"pi"`, `"a"`)
- `calc.series {expr, var="x", point="0", order=6}` → expr result
- `calc.sum {expr, var="n", lower=0, upper="oo"}` → expr result
- `calc.product {expr, var="n", lower=1, upper="m"}` → expr result
- `calc.solve {equations: ["x**2-1=0"], vars: ["x"], domain?}` → `{solutions: [{var, values: [expr result]}], latex, pretty, notes}`; higher-degree/transcendental may return partial or `domain-error`.
- `calc.dsolve {eq: "y'' + y = 0", func: "y", var: "x", ics?: [{"x":0,"y":1}, {"x":0,"dy":0}]}` → `{solution, latex, pretty, order, notes, classification?}`
- `calc.approx {expr, subs: {"x": 0.5}, digits=15}` → `{value: "0.4794...", complex: "..."? , latex?}`
- `calc.matrix {op, matrix, rhs?}` where op ∈ `det|inv|rank|rref|eigen|charpoly|nullspace|transpose|solve|lstsq|svd`
  - `matrix`: `[[1,2],[3,4]]` (entries are expression strings or numbers)
  - `solve`/`lstsq` use `rhs: [1,2]`
  - result: `{op, ...}`; e.g. `det` → `{value: expr result}`; `eigen` → `{values: [expr result], vectors: [[...strings]], pretty}`; `rref` → `{matrix: [[...]], rank}`; `nullspace` → `{basis: [[...]], dimension}`; `svd` → `{U, S, V}`.
- `calc.vector {op, expr?, components?, vars?}` for `grad|laplacian` (use `expr` + `vars`), `div|curl` (use `components` + `vars`), and `dot|cross|norm` (use `components`) → `{result | vector: [expr result]}`.
- `calc.number {op, n?, k?, modulus?}` with op ∈ `factorint|isprime|primes|totient|divisors|gcd|lcm|modinv|crt|fibonacci|binomial|sigma|mobius`
  → plain JSON numbers/arrays; `factorint` → `{"12": [[2,2],[3,1]]}` style `{value: [[p,e],...]}`.
- `calc.ntheory` (alias of calc.number, keep both)
- `calc.truth` is NOT here — see logic.

### algebra — abstract algebra
Permutation encoding: `cycles` is a list of 1-based cycle lists, e.g. `[[1,2,3],[4,5]]`;
missing points are fixed. `n` is optional (inferred when omitted).

- `algebra.perm {op, cycles?, other?, n?}` with op ∈ `multiply|inverse|order|cycle_type|sign|conjugate|to_mapping|from_mapping`
  → `{cycles, mapping, order, parity, cycle_type, pretty}`. Cycle multiplication applies the right-hand
  permutation first: `(1 2 3)(1 2)` is `x ↦ (1 2 3)((1 2)(x))`.
- `algebra.group {op, generators: [[[...]]], n?}` — each generator is a permutation `cycles`.
  op ∈ `order|elements|is_abelian|element_orders|center|commutator|conjugacy_classes|subgroups|subgroup_lattice|normal_subgroups|quotient|cayley_table|is_solvable|is_nilpotent|is_simple|sylow|homomorphism`
  - `elements` → `{elements: [{id, cycles, mapping, order, parity}], order}`
  - `cayley_table` → `{elements: [label], table: [[idx]]}`
  - `subgroups` → `{subgroups: [{id, order, generators, cycles: [labels]}]}`
  - `subgroup_lattice` → `{nodes: [{id, label, order, isNormal, isMaximal}], edges: [[nodeId, nodeId]], normalEdges: [[nodeId, nodeId]]}` (edges are cover relations, smaller → larger; `normalEdges` is the normal-covering subset used for `quotient`-style highlights)
  - `normal_subgroups` → `{subgroups: [...]}`
  - `quotient {generators, normal: [[...]]}` → `{order, elements: [{label, coset}], abelian, name?}`
  - `homomorphism {generators, n?, target_generators, images}` → `{valid, reason?, kernel: [...], image: [...]}`
  - `sylow` → `{primes: [{p, count, orders}]}`
  - guard: |G| <= 10000; prefer generator-based enumeration.
- `algebra.finitefield {p, n=1, op, a?, b?}` with op ∈ `add|sub|mul|div|inv|pow|table|order|primitive_element|is_irreducible`
  `a`, `b` are polynomial coefficient arrays low→high or strings like `"x^2+1"`; result includes
  `{value: {coeffs: [...], poly: "x^2 + 1", int: 5}, irreducible_poly: [1,0,1]}`.
  `table` → `{add: [[...]], mul: [[...]], elements: [...]}` (only for q = p^n <= 256).
- `algebra.poly {coeffs: [..], p=0, op, other?}` with op ∈ `degree|factor|roots|gcd|is_irreducible|evaluate` (p=0 means Q; p prime means GF(p)).
- `algebra.ring {op, n}` with op ∈ `units|zero_divisors|is_field|is_integral_domain|addition_table|multiplication_table` for Z/nZ (n <= 1000 for tables).

### category — finite category theory
A **finite category** is always:

```json
{
  "objects": [{"id": "A", "label": "A"}],
  "morphisms": [{"id": "f", "dom": "A", "cod": "B", "label": "f"}],
  "identities": [{"object": "A", "morphism": "idA"}],
  "compositions": [{"first": "f", "second": "g", "result": "h"}]   // g ∘ f = h
}
```

- `category.validate {category}` → `{valid, violations: [{code, message, where}], summary: {objects, morphisms, composites}}`
  checks: identity laws, dom/cod compatibility, closure/completeness of composites, associativity.
- `category.compose {category, first, second}` → `{result}` (only when the category's table contains it).
- `category.functor {source, target, onObjects: [{"from","to"}], onMorphisms: [{"from","to"}]}` → `{valid, violations, laws: {identity, composition}}`
- `category.natural {source, target, F: {onObjects, onMorphisms}, G: {...}, components: [{"object","morphism"}]}` → `{valid, violations, naturality: [{object, square: {source, target, ok}}]}`
- `category.verify_diagram {category, pairs: [{"from":"A","to":"B"}]}` → `{ok, pairs: [{from, to, paths: [[morphism ids]], equal: true, composites: [morphism ids]}]}` — the UI renders the commutative diagram from `category` plus the result.
- `category.limit {kind, ...sets}` — concrete limits in **Set** for finite inputs; every `op` returns
  the universal object plus the universal morphisms and the verification of their universal property:
  - `kind="product"` args `{sets: {"A": ["a1","a2"], "B": ["b1"]}}` → `{object: [["a1","b1"]], projections: {...}}`
  - `kind="coproduct"` args `{sets: {"A": ["a1"], "B": ["b1"]}}` → `{object: [{"tag":"A","value":"a1"}, ...], injections: {...}}`
  - `kind="equalizer"` args `{domain: ["x1","x2"], f: [/*values*/], g: [/*values*/]}` → `{object: [indices], map: [...]}`
  - `kind="coequalizer"` args `{codomain: ["c1","c2"], f: [...], g: [...]}` → `{object: [[classes]], quotientMap: [...]}`
  - `kind="pullback"` args `{A: [...], B: [...], C: [...], f: [...], g: [...]}` → `{object: [[a,b]...], projections}`
  - `kind="pushout"` args `{C:[...], A:[...], B:[...], f:[...], g:[...]}` → `{object: [[classes]], injections}`
  - `kind="terminal"` args `{sets: {...}}` → `{object: [null]}`; `kind="initial"` → `{object: []}`.
  Values are lossless JSON (strings recommended).
- `category.equivalence {source, target, functor}` → `{valid, violations}` (essentially full/faithful/dense checks on finite categories).

### logic — mathematical logic
Formula syntax (both logics):
- propositional: `~`, `&`, `|`, `->`, `<->`, `T`, `F`, atoms `[A-Za-z_][A-Za-z0-9_']*`; parentheses.
- first-order: additionally `forall x.`, `exists x.`, `P(x)`, `f(x,y)`, equality `=`.
- modal: propositional + `[]` (necessarily), `<>` (possibly); frames `K|T|S4|S5`.
- Unicode aliases accepted: `¬ ∧ ∨ → ↔ ∀ ∃ □ ◇`.

- `logic.parse {formula, logic="prop"}` → `{ast, pretty, latex, atoms, freeVars, wellFormed}`
- `logic.truthtable {formula}` → `{atoms: [...], rows: [{values: [true...], result: true}], tautology, contradiction, satisfiable, cnf, dnf, latex}`
- `logic.prove {premises: [], goal, system="nd"}` → `{valid, proof: <proof tree>, countermodel?: {assignment}}`
  Proof tree node: `{id, rule, conclusion, premises: [ids], discharged: [ids], fitch: {line, indent, text}}`
  `rule` uses natural-deduction names: `assumption, reiteration, and-intro, and-elim-l, and-elim-r,
  or-intro-l, or-intro-r, or-elim, imp-intro, imp-elim, iff-intro, iff-elim-l, iff-elim-r,
  not-intro, not-elim, contradiction-elim, double-neg-elim, law-excluded-middle` (last one only
  in classical mode; use intuitionistic rules otherwise).
  Also return `fitch: [{line, indent, text, rule, conclusion, refs}]` for direct UI rendering.
- `logic.prove_fol {premises, goal, domainSize=4, maxSolutions=1}` → `{valid, countermodel?, searched, note}` — bounded model search over domains of size 1..domainSize.
- `logic.resolve {premises, goal}` → `{refutable, clauses, steps: [[...]], note}` (first-order resolution may report unsupported for non-clause input).
- `logic.modal {frame="K", formula, worlds?=3}` → `{valid, countermodel?: {worlds, relations, valuation}, note}`
- `logic.equivalent {a, b}` → `{equivalent, countermodel?}`

### lean — Lean 4 integration
- `lean.info` → `{available, version, path, lake, note}`
- `lean.check {code, filename?="MathLab.lean", timeoutMs=15000}` → `{ok, diagnostics: [{severity, line, column, message}], stdout, stderr, elapsedMs, leanVersion}`
  Runs `lean <tmpfile>` (no `lake` project; `import Mathlib` is only accepted when a configured
  Mathlib-enabled lean/lake is available, otherwise the diagnostic explains it). Timeout bounded.
  Without any Lean toolchain the request answers an `unsupported` error envelope with install guidance
  instead of a result object.
- `lean.check_file {path, timeoutMs}` → same, for an existing `.lean` file (absolute path, read-only).
- `lean.version` → `{version, path}`

### topology / geometry
- `topology.homology {simplices: {"0": [["a"],["b"]], "1": [["a","b"],["b","c"]], "2": [[...]]}}` → `{betti: [b0,b1,b2], torsion: [[], [], []], chain_ranks: [n0,n1,n2], euler, boundary_matrices, note}`
- `topology.fundamental_group {vertices: ["a","b"], edges: [["a","b"]]}` → `{generators, relations, abelianization, betti1, note}` (graph → free group presentation)
- `geometry.christoffel {coords: ["x","y"], metric: [["1","0"],["0","x**2"]]}` → `{christoffel: [[[expr...]]], latex, note}`
- `geometry.curvature {coords, metric}` → `{christoffel, riemann: [[[[expr...]]]], ricci: [[expr]], scalar, latex, note}`
- `geometry.exterior_derivative {coords, components: {"0": "f", "1": ["f_x","f_y"]}, formDegree}` → `{components: {...}, latex}`
- `geometry.lie_bracket {coords, X: ["..."], Y: ["..."]}` → `{result: [...], latex}`

### numerics / probability / optimization / graphs
- `num.root {expr, var="x", bracket: [a,b]}` → `{root, value, iterations}`; `num.integrate {expr, var, range, method="quad"}`; `num.ode {rhs, y0, tRange, method}` (scipy solve_ivp) → `{t, y}` arrays.
- `prob.dist {dist, params, op, x?}` → `{value, latex?, mean?, variance?}` (normal, binomial, poisson, exponential, uniform, beta, gamma, chi2, t, f).
- `prob.expectation {expr, dist, params}` → expr result + numeric.
- `opt.minimize {expr, vars, start?, bounds?}` → `{point, value, method, success, message}` (scipy).
- `opt.stationary {expr, vars}` → `{points: [{point, value, hessian, classification}]}` (sympy).
- `graph.analyze {edges, directed=false, op}` → op ∈ `components|shortest_path|spanning_tree|degree_sequence|coloring|diameter|is_tree|is_bipartite|pagerank` → JSON; `edges` entries `[u, v]` (u,v strings) or `[u, v, w]`.

### plot — data for the browser renderer (never images)
Coordinates are plain numbers; all ranges are two-element `[min,max]` number arrays.
- `plot.sample {expr, var="x", range=[-5,5], samples=400}` → `{curves: [{points: [[[x,y],...], ...], valid: bool, note?}], range, yRange}` — each `points` entry is one polyline, split at discontinuities/NaN.
- `plot.sample_multi {exprs: ["sin(x)","x**2"], var="x", range, samples}` → `{curves: [{expr, points: [[[x,y],...], ...], color?}], range, yRange}`
- `plot.parametric {x, y, t="t", range=[0,6.28], samples=400}` → `{points: [[x,y]...], range}`
- `plot.polar {r, theta="theta", range=[0,6.28], samples=400}` → `{points: [[x,y]...]}`
- `plot.implicit {expr, xRange=[-5,5], yRange=[-5,5], grid=120}` → `{segments: [[[x1,y1],[x2,y2]]...], contourLevels?}`
- `plot.surface3d {expr, xVar="x", yVar="y", xRange=[-3,3], yRange=[-3,3], n=40}` → `{vertices: [[x,y,z]...], indices: [[i,j,k]...], zRange, note?}`
- `plot.field {P, Q, xVar="x", yVar="y", xRange, yRange, n=15, normalize=true}` → `{arrows: [[x,y,dx,dy]...], note}`
- `plot.svg {kind, ...same args}` → `{svg: "..."}` server-rendered SVG for agent/export; `kind` ∈ `sample|sample_multi|parametric|polar|implicit|field|surface3d` (`explicit` is accepted as an alias of `sample`; 2D kinds draw axes, `surface3d` emits an isometric wireframe projection).

### help
- `help {topic?}` → `{text}` short capability help (Markdown). The client embeds its own copy; the agent tool may use it.

## 5. Host-owned ops (no Python)
- `symbols.list {field?}` → `{fields: [{id, label, count}], symbols: [{id, symbol, latex, unicode, name, name_zh, field, description, description_zh, lean?, sympy?, tags: []}]}`
- `symbols.search {query, field?, limit=50}` → `{symbols: [...]}`
- `examples.list {}` → `{examples: [{id, title, title_zh, field, description, description_zh, inputs: {...}, action: {...}}]}`
- `examples.get {id}` → `{example}`
- `lean.snippets {id?}` → `{snippets: [{id, title, title_zh, level, imports, code, explanation, explanation_zh, tags}]}` or `{snippet}`
- `meta.info` (Host merge): `{plugin, version, engine: {available, version, python, sympy, ...}, lean: {available, version, path, note}, content: {symbols, symbolFields, examples, leanSnippets}, stage: {revision, hasStage}, assets: {katex: true}}` — the human-facing plugin version is top-level `version`, while `engine.version` is the Python engine version.
- Live Stage ops (shared by the panel, the conversation dock and the `mathlab_stage` tool; full schema in [STAGE.md](STAGE.md)). All ops accept an optional `sessionId`; without it, reads use the most recently updated stage and writes use the global stage:
  - `stage.get {sessionId?}` → `{stage, revision, sessionId}`; stage = `{id, revision, title, subtitle, status, autoShow, focus, blocks[], takeaway|null, trace[], annotations[], questions[], cursor|null, presentedBy|null, createdAt, updatedAt}`.
  - `stage.set {title, subtitle?, blocks?, takeaway?, focus?, autoShow?, status?, sessionId?}` → `{stage, revision}` (new presentation for that Session).
  - `stage.append {blocks, focus?, sessionId?}` → `{stage, revision}`; `stage.update {title?, subtitle?, status?, autoShow?, focus?, takeaway?, sessionId?}` → `{stage, revision}`.
  - `stage.annotate {blockId?, note, sessionId?}` → `{annotation, stage}`; `stage.question {blockId?, text, quote?, sessionId?}` → `{question, stage}` (a panel/dock text selection supplies `quote` along with the question); `stage.cursor {index, blockId?, sessionId?}` → `{stage, revision}`.
  - `stage.clear {sessionId?}` → `{stage, revision}`; `stage.export {sessionId?}` → `{markdown, filename}`.
  Blocks are validated server-side (kinds: heading, prose, math, judgment, strategy, proof, diagram, plot, compute, symbols, lean, takeaway, note; ≤120 blocks, ≤256 KiB serialized stage). Unknown block kinds are preserved and rendered as JSON by the panel rather than failing.
- `GET /mathlab/events?sessionId=…` → Server-Sent-Events stream (`text/event-stream`; `retry: 3000`; `event: stage` frames with `{sessionId, revision}`; 15 s heartbeat). The initial frame carries the current revision. Used by the conversation dock and the panel for push updates, with polling as fallback.

## 6. Data formats (shared with `data/`)
`data/symbols.json`:
```json
{ "fields": [{"id":"analysis","label":"Analysis","label_zh":"分析"}],
  "symbols": [{"id":"int-def","symbol":"∫","latex":"\\int_a^b f(x)\\,dx","unicode":"∫",
    "name":"definite integral","name_zh":"定积分","field":"analysis",
    "description":"...", "description_zh":"...", "lean":"MeasureTheory.integral", "sympy":"Integral", "tags":["integral"]}] }
```
`data/examples.json`:
```json
{ "examples": [{"id":"gauss-integral","title":"Gaussian integral","title_zh":"高斯积分","field":"analysis",
  "description":"...", "description_zh":"...", "panel":"compute", "action":{"op":"calc.integrate","args":{...}} }] }
```
`data/lean-snippets.json`:
```json
{ "snippets": [{"id":"irrational-sqrt2","title":"√2 is irrational","title_zh":"√2 是无理数","level":"beginner",
  "imports":["Mathlib"], "code":"theorem ... := by ...", "explanation":"...", "explanation_zh":"...", "tags":["number theory"]}] }
```

## 7. Conventions
- SymPy expression strings are the wire format; the engine parses with a restricted parser
  (`parse_expr` with standard transformations, evaluate=False) and **never** `eval()`s Python.
- Labels/ids in responses are strings; numbers may be numbers or numeric strings.
- Truncate any single string field to 20000 chars and append `"…"`.
- For unsupported-but-valid requests use `unsupported`; never crash the worker—wrap op
  dispatch in try/except and answer `domain-error`/`internal`.
- The worker must flush every response line (`print(..., flush=True)`).
