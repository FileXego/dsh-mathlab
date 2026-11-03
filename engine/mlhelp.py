"""``help`` operation: short capability help as Markdown (docs/API.md §help)."""

from __future__ import annotations

from mlcore import truncate

_OVERVIEW = """# MathLab engine help

MathLab evaluates exact mathematics with SymPy plus numerical SciPy/NetworkX
support. Every operation is `{"op": "<group.action>", "args": {...}}`.

**Groups**

| group | highlights |
| --- | --- |
| `calc.*` | simplify/expand/factor/apart/cancel/trigsimp/rationalize/powdenest, diff, integrate (indefinite & definite), limit, series, sum, product, solve, dsolve, approx, matrix, vector calculus, number theory (`calc.number` / `calc.ntheory`) |
| `algebra.*` | permutations, permutation groups (order, elements, Sylow, subgroups, quotient, homomorphism), finite fields GF(p^n), polynomials over Q and GF(p), Z/nZ |
| `category.*` | finite-category validation, composition, functors, natural transformations, commutative diagrams, concrete Set limits, equivalence |
| `logic.*` | prop/FOL/modal parser, truth tables + CNF/DNF, classical natural-deduction proofs, bounded FOL model checks, resolution, bounded Kripke checks, equivalence |
| `lean.*` | Lean 4 info / type-check (requires a local Lean toolchain) |
| `topology.*` | simplicial homology with integer torsion, graph fundamental group |
| `geometry.*` | Christoffel symbols, curvature, exterior derivative, Lie bracket |
| `num.*` | root finding, numerical integration, ODE initial value problems |
| `prob.*` | distributions and expectations |
| `opt.*` | numerical minimisation and symbolic stationary points |
| `graph.*` | components, shortest path, spanning tree, colouring, PageRank, ... |
| `plot.*` | data for the browser renderer (`plot.svg` renders 2D SVG server-side) |

**Conventions**

- Expressions are SymPy syntax strings (`sin(x)**2`, `exp(-x**2)`, `oo`).
- Symbolic results use the shared `ExprResult` shape: `input`, `result`,
  `pretty`, `latex`, `input_latex`, optional `approx`/`notes`/`extra`.
- Limits: expression strings ≤ 4000 chars, matrix dimensions ≤ 12, group
  orders ≤ 10000, ~20 s per operation, single text field ≤ 20000 chars.
- Errors: `parse-error`, `domain-error`, `unsupported`, `timeout`, `limit`,
  `bad-request`, `unknown-op`, `internal`.
"""

_TOPICS = {
    "overview": _OVERVIEW,
    "calc": """## calc

Symbolic calculus and linear algebra. Every op returns an `ExprResult`
(`input`, `result`, `pretty`, `latex`, `input_latex`, optional `approx`).

- `calc.simplify {expr, assumptions?}` — assumptions map e.g. `{"x":"positive"}`.
- `calc.expand|factor|apart|trigsimp|rationalize|powdenest {expr, var?}`
- `calc.diff {expr, var="x", order=1}`; `calc.integrate {expr, var, lower?, upper?}`
  (definite when both bounds are given; `oo` allowed).
- `calc.limit {expr, var, point, direction="both"}`;
  `calc.series {expr, var, point, order=6}`;
  `calc.sum {expr, var, lower=0, upper="oo"}`;
  `calc.product {expr, var, lower=1, upper="m"}`.
- `calc.solve {equations:["x**2-1=0"], vars:["x"], domain?}`.
- `calc.dsolve {eq:"y'' + y = 0", func:"y", var:"x", ics?:[{"x":0,"y":1},{"x":0,"dy":0}]}`.
- `calc.approx {expr, subs:{"x":0.5}, digits=15}`.
- `calc.matrix {op, matrix, rhs?}` with op in
  `det|inv|rank|rref|eigen|charpoly|nullspace|transpose|solve|lstsq|svd`.
- `calc.vector {op, expr?, components?, other?, vars?}` with op in
  `grad|div|curl|dot|cross|norm|laplacian`.
- `calc.number` / `calc.ntheory {op, n?, k?, modulus?}` with op in
  `factorint|isprime|primes|totient|divisors|gcd|lcm|modinv|crt|fibonacci|binomial|sigma|mobius`.
""",
    "algebra": """## algebra

Permutations use 1-based cycles: `[[1,2,3],[4,5]]` means 1→2→3→1, 4→5→4;
fixed points may be omitted. Mappings are 1-based image lists.

- `algebra.perm {op, cycles?, other?, mapping?, n?}` with op in
  `multiply|inverse|order|cycle_type|sign|conjugate|to_mapping|from_mapping`.
  `multiply` composes `other` first, then `cycles`.
- `algebra.group {op, generators, n?}`; generators are cycle arrays, e.g.
  S3 = `[[[1,2,3]],[[1,2]]]`. ops: `order|elements|is_abelian|element_orders|center|`
  `commutator|conjugacy_classes|subgroups|subgroup_lattice|normal_subgroups|quotient|`
  `cayley_table|is_solvable|is_nilpotent|is_simple|sylow|homomorphism`.
  `quotient` also takes `normal` cycles; `homomorphism` takes
  `target_generators` + one `images` cycle per generator.
- `algebra.finitefield {p, n=1, op, a?, b?}`; `a`/`b` are coefficient arrays
  low→high or polynomial strings such as `"x^2+1"`. ops:
  `add|sub|mul|div|inv|pow|table|order|primitive_element|is_irreducible`.
- `algebra.poly {coeffs, p=0, op, other?, at?}` with op in
  `degree|factor|roots|gcd|is_irreducible|evaluate` (`p=0` ⇒ over Q).
- `algebra.ring {op, n}` for Z/nZ: `units|zero_divisors|is_field|`
  `is_integral_domain|addition_table|multiplication_table` (tables n ≤ 1000).
""",
    "category": """## category

A finite category is
`{objects:[{id,label}], morphisms:[{id,dom,cod,label}],`
`identities:[{object,morphism}], compositions:[{first,second,result}]}`
where the table row `{first:f, second:g, result:h}` means **g ∘ f = h**.

- `category.validate {category}` → `{valid, violations, summary}`.
- `category.compose {category, first, second}` → `{result}`.
- `category.functor {source, target, onObjects, onMorphisms}`.
- `category.natural {source, target, F, G, components}`.
- `category.verify_diagram {category, pairs:[{from,to}]}`.
- `category.limit {kind, ...}` for `product|coproduct|equalizer|coequalizer|`
  `pullback|pushout|terminal|initial` (concrete finite Set limits; the
  universal morphisms are returned as aligned projection/injection arrays).
- `category.equivalence {source, target, functor}`.
""",
    "logic": """## logic

Formula syntax: `~` (not), `&` (and), `|` (or), `->`, `<->`, `T`, `F`, atoms
`[A-Za-z_][A-Za-z0-9_']*`, parentheses. First-order additionally supports
`forall x.` / `exists x.`, `P(x)`, `f(x,y)`, `=`. Modal adds `[]` and `<>`;
unicode aliases `¬ ∧ ∨ → ↔ ∀ ∃ □ ◇` are accepted.

- `logic.parse {formula, logic="prop"}`.
- `logic.truthtable {formula}` → rows, tautology/satisfiability, CNF, DNF.
- `logic.prove {premises, goal, system="nd"}` → classical natural-deduction
  proof tree plus Fitch lines (rules: assumption, and-intro, or-elim,
  imp-intro/elim, not-intro/elim, contradiction-elim, double-neg-elim,
  law-excluded-middle, ...).
- `logic.prove_fol {premises, goal, domainSize=4}` → bounded model search.
- `logic.resolve {premises, goal}`.
- `logic.modal {frame="K", formula, worlds=3}` → bounded Kripke check for
  frames `K|T|S4|S5`.
- `logic.equivalent {a, b}`.
""",
    "lean": """## lean

- `lean.info` → `{available, version, path, lake, note}`.
- `lean.check {code, filename?, timeoutMs?}` → `{ok, diagnostics, stdout, stderr, elapsedMs, leanVersion}`.
- `lean.check_file {path, timeoutMs?}` → same, checking an existing `.lean` file.

Lean is optional. When `lean` is not installed, `lean.info` reports
`available:false` and checks answer a clear `unsupported` diagnostic. Set
`MATHLAB_LEAN` to the executable or install Lean 4 via elan. `lean.snippets`
is Host-owned.
""",
    "topology": """## topology

- `topology.homology {simplices: {"0": [["a"],["b"]], "1": [["a","b"]]}}` →
  `{betti, torsion, chain_ranks, euler, boundary_matrices, note}`.
  Integer homology; torsion is read from the Smith normal form of the
  boundary maps. Missing faces are added automatically (noted).
- `topology.fundamental_group {vertices, edges}` → free-group presentation of
  the graph's fundamental group, abelianisation and `betti1`.
""",
    "geometry": """## geometry

Coordinate list and metric components are SymPy expression strings.

- `geometry.christoffel {coords, metric}`.
- `geometry.curvature {coords, metric}` → Christoffel, Riemann, Ricci, scalar.
- `geometry.exterior_derivative {coords, components, formDegree}`; components
  is a map from comma-joined index tuple to expression, or `{"0": "f"}` for a
  0-form.
- `geometry.lie_bracket {coords, X, Y}`.
""",
    "numeric": """## numerics, probability, optimization, graphs

- `num.root {expr, var="x", bracket:[a,b]}` → `{root, value, iterations}`.
- `num.integrate {expr, var, range:[a,b], method="quad"}`.
- `num.ode {rhs, y0, tRange:[t0,t1], method?}`; `rhs` is a string in `t` and
  the state symbol (default `y`); arrays `{t, y}` are returned.
- `prob.dist {dist, params, op, x?}` with `op` in
  `pdf|cdf|sf|ppf|mean|variance|support|sample`; distributions: normal,
  binomial, poisson, exponential, uniform, beta, gamma, chi2, t, f.
- `prob.expectation {expr, dist, params}`.
- `opt.minimize {expr, vars, start?, bounds?}`.
- `opt.stationary {expr, vars}`.
- `graph.analyze {edges, directed=false, op}` with `edges` entries `[u,v]` or
  `[u,v,w]`; op in `components|shortest_path|spanning_tree|degree_sequence|`
  `coloring|diameter|is_tree|is_bipartite|pagerank`.
""",
    "plot": """## plot (data for the browser renderer — never images)

- `plot.sample {expr, var="x", range=[-5,5], samples=400}` → `{curves, range, yRange}`;
  each curve's `points` is a list of polylines (split at discontinuities).
- `plot.sample_multi {exprs, var, range, samples}`.
- `plot.parametric {x, y, t="t", range=[0,6.28], samples}` → `{points, range}`.
- `plot.polar {r, theta="theta", range, samples}` → `{points}`.
- `plot.implicit {expr, xRange, yRange, grid=120}` → `{segments, contourLevels}`.
- `plot.surface3d {expr, xVar, yVar, xRange, yRange, n=40}` → `{vertices, indices, zRange}`.
- `plot.field {P, Q, xVar, yVar, ranges, n=15, normalize=true}` → `{arrows}`.
- `plot.svg {kind, ...same args}` → `{svg}` for agent/export use (2D plots;
  3D surfaces are projected as a wireframe).
""",
    "protocol": """## protocol

The Host spawns `python -u engine/mathlab_engine.py` once and writes one JSON
request per line:

```
{"id": 1, "op": "calc.simplify", "args": {"expr": "sin(x)**2+cos(x)**2"}}
```

Each line answered exactly once, on stdout:

```
{"id": 1, "ok": true, "result": {...}}
{"id": 1, "ok": false, "error": {"code": "parse-error", "message": "..."}}
```

Requests are serialised; every exception becomes a typed error so the worker
never dies on a single bad request. Startup may emit one `{"ready": true}` line
on stderr (stdout is reserved for responses).
""",
}


def help_op(args: dict) -> dict:
    topic = args.get("topic")
    if topic is None or topic == "":
        return {"text": _OVERVIEW, "topic": "overview", "topics": sorted(_TOPICS)}
    topic = str(topic).strip().lower()
    if topic in _TOPICS:
        return {"text": _TOPICS[topic], "topic": topic, "topics": sorted(_TOPICS)}
    available = ", ".join(sorted(_TOPICS))
    return {
        "text": truncate(f"Unknown help topic {topic!r}. Available topics: {available}.\n\n" + _OVERVIEW),
        "topic": topic,
        "topics": sorted(_TOPICS),
        "note": "unknown topic; returning the overview",
    }


HANDLERS = {
    "help": help_op,
}
