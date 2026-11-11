# MathLab Python engine

The computation half of the MathLab plugin. It implements every engine operation
in [`docs/API.md`](../docs/API.md) behind a single line-delimited JSON process,
using SymPy for exact mathematics and NumPy/SciPy/NetworkX for numerics,
probability, optimization and graphs.

The Host owns the HTTP API, agent tools, symbol/example metadata and
`lean.snippets`; this package owns only the computation.

## Protocol

The Host spawns exactly one worker:

```bash
python -u engine/mathlab_engine.py
```

Requests — one JSON object per line on stdin:

```json
{"id": 1, "op": "calc.simplify", "args": {"expr": "sin(x)**2+cos(x)**2"}}
```

Responses — one JSON object per line on stdout, in request order:

```json
{"id": 1, "ok": true, "result": {"input": "...", "result": "1", "pretty": "1", "latex": "1", "input_latex": "..."}}
{"id": 1, "ok": false, "error": {"code": "parse-error", "message": "..."}}
```

* **stdout is reserved for responses.** One line per request, always flushed.
* Startup may emit one `{"ready": true, ...}` line on **stderr** (informational).
* Unexpected tracebacks are logged to stderr; the loop keeps running.
* Every exception becomes a typed error — one bad request never kills the worker.
* Requests are serialized; the engine is not thread-safe by design.

Error codes: `parse-error`, `domain-error`, `unsupported`, `timeout`, `limit`,
`bad-request`, `unknown-op`, `internal`.

## Requirements

* Python ≥ 3.10 (developed and tested with **3.13.9**)
* `sympy` **1.14.0**, `numpy` **2.4.4**, `scipy` **1.17.1**, `networkx` **3.6.1**

Install the pinned versions with the interpreter that runs the engine:

```bash
python -m pip install -r engine/requirements.txt
```

The plugin's bridge probes all four imports before spawning the worker; if they
are missing it reports this exact `pip install -r .../engine/requirements.txt`
command (including the resolved interpreter path) instead of a vague spawn
failure. Set `MATHLAB_PYTHON` to choose the interpreter explicitly.

* Lean 4 is **optional** (see below)

## Files

| path | purpose |
| --- | --- |
| `mathlab_engine.py` | entrypoint: stdin/stdout loop, dispatch, `meta.info`, timeouts |
| `mlcore.py` | limits, restricted expression parser, ExprResult/JSON helpers, typed errors, wall-clock guard |
| `mlcalc.py` | `calc.*` (symbolic calculus, linear algebra, vector calculus, number theory) |
| `mlalgebra.py` | `algebra.*` (permutations, permutation groups, GF(p^n), polynomials, Z/nZ) |
| `mlcategory.py` | `category.*` (finite categories, functors, natural transformations, Set limits) |
| `mllogic.py` | `logic.*` (prop/FOL/modal parser, truth tables, natural deduction, bounded model checks) |
| `mllean.py` | `lean.*` (subprocess Lean integration with graceful absence) |
| `mltopology.py` | `topology.*` (simplicial homology with integer torsion, graph fundamental groups) |
| `mlgeometry.py` | `geometry.*` (Christoffel, Riemann/Ricci/scalar, exterior derivative, Lie bracket) |
| `mlnumeric.py` | `num.*`, `prob.*`, `opt.*`, `graph.*` |
| `mlplot.py` | `plot.*` data sampling and `plot.svg` rendering |
| `mlhelp.py` | `help` topic texts |
| `tests/test_engine.py` | stdlib unittest suite (68 tests) |
| `smoke.py` | spawns the engine and checks ~40 real protocol requests |

## Running the tests

From the project root:

```bash
python -m unittest discover -s engine/tests -v
python engine/smoke.py --verbose          # real subprocess protocol smoke
```

Both are dependency-free (stdlib `unittest`). The smoke test sends ~40 requests
covering every group and exits non-zero on the first mismatch.

## Safety and limits

* User expressions are **never** passed to Python `eval`/`exec`. Input is
  screened lexically and (when parseable as Python) by an AST allow-list, then
  handed to `sympy.parsing.sympy_parser.parse_expr` with only
  `standard_transformations + implicit_multiplication_application + convert_xor`
  and `evaluate=False`.
* Bounds: expression ≤ 4000 chars, matrix dims ≤ 12, group order ≤ 10000,
  any text field truncated at 20000 chars (with `…`), ~20 s soft wall clock per
  op (`MATHLAB_OP_TIMEOUT` overrides), JSON numbers are finite (`oo`/`-oo` are
  strings).
* Each op runs under a daemon-thread watchdog; a timed-out SymPy call answers
  `{"code":"timeout"}` instead of blocking the loop forever.

## Operation coverage

| group | ops |
| --- | --- |
| `meta` | `meta.info` (versions, lean availability, capabilities, op list, limits) |
| `calc` | simplify, expand, factor, apart, cancel, trigsimp, rationalize, powdenest, diff, integrate, limit, series, sum, product, solve, dsolve, approx, matrix (`det/inv/rank/rref/eigen/charpoly/nullspace/transpose/solve/lstsq/svd`), vector (`grad/div/curl/dot/cross/norm/laplacian`), number/ntheory (`factorint/isprime/primes/totient/divisors/gcd/lcm/modinv/crt/fibonacci/binomial/sigma/mobius`) |
| `algebra` | perm (`multiply/inverse/order/cycle_type/sign/conjugate/to_mapping/from_mapping`), group (`order/elements/is_abelian/element_orders/center/commutator/conjugacy_classes/subgroups/subgroup_lattice/normal_subgroups/quotient/cayley_table/is_solvable/is_nilpotent/is_simple/sylow/homomorphism`), finitefield (`add/sub/mul/div/inv/pow/table/order/primitive_element/is_irreducible`), poly (`degree/factor/roots/gcd/is_irreducible/evaluate`), ring (`units/zero_divisors/is_field/is_integral_domain/addition_table/multiplication_table`) |
| `category` | validate, compose, functor, natural, verify_diagram, limit (`product/coproduct/equalizer/coequalizer/pullback/pushout/terminal/initial`), equivalence |
| `logic` | parse, truthtable, prove (classical ND tree + Fitch lines), prove_fol (bounded), resolve, modal (bounded K/T/S4/S5), equivalent |
| `lean` | info, check, check_file, version |
| `topology` | homology (integer, torsion via Smith normal form), fundamental_group |
| `geometry` | christoffel, curvature, exterior_derivative, lie_bracket |
| `num` | root, integrate, ode |
| `prob` | dist, expectation |
| `opt` | minimize, stationary |
| `graph` | analyze (`components/shortest_path/spanning_tree/degree_sequence/coloring/diameter/is_tree/is_bipartite/pagerank`) |
| `plot` | sample, sample_multi, parametric, polar, implicit, surface3d, field, svg (`explicit/sample/parametric/polar/implicit/field/surface3d`) |
| `help` | topic help text |

Result shapes follow `docs/API.md` §3–§4. Symbolic ops return the shared
`ExprResult` (`input`, `result`, `pretty`, `latex`, `input_latex`, optional
`approx`/`notes`/`extra`); every other op returns the shapes documented in the
contract, with a few extra informational keys (e.g. `notes`, `extra`,
`generator_details`) where useful. Extra keys are always additive.

## Lean

Lean is not installed on this machine. `lean.info` reports
`{available:false, version:null, path:null, lake:false, note:"Lean toolchain
not found ..."}` and `lean.check`/`lean.check_file` answer the typed
`unsupported` diagnostic. When a toolchain appears (`lean`/`lake` on `PATH`, or
`MATHLAB_LEAN=/path/to/lean`), the real subprocess implementation is used:

* `lean.check` writes the code to a temp `.lean` file, runs `lean <file>` with a
  bounded timeout, parses `file:line:col: severity: message` diagnostics, and
  returns `{ok, diagnostics, stdout, stderr, elapsedMs, leanVersion}`.
* `lean.check_file` checks an existing absolute `.lean` path from a temporary
  copy so the original tree stays read-only (relative imports may need path setup).
* `import Mathlib` requires a Mathlib-enabled project; when it is missing the
  Lean diagnostics explain it (the engine does not fake success).

## Known limitations / deliberate bounds

* **Logic**: `logic.prove` is classical natural deduction (`system="nd"` only;
  intuitionistic/minimal modes return `unsupported`). Proof search is a
  semantic case split, so it is complete for ≤ 6 atoms (validity itself is
  decided up to 12 atoms; above that a proof is omitted with a `note`).
  `logic.prove_fol` is a *bounded* model check: domains 1..`domainSize`
  (max 4) and a 250k-structure budget; "valid" means "no countermodel up to the
  domain bound". `logic.modal` is likewise bounded (≤ 4 worlds, K/T/S4/S5
  frame axioms, 250k-model budget).
* **Groups**: subgroup enumeration/lattice/quotient-by-normal-subgroup is
  limited to groups of order ≤ 2000 (and ≤ 400 subgroups); other ops work up to
  order 10000. Sylow counts are computed from the normalizer orbit.
* **Finite fields**: construction is limited to `q = p^n ≤ 4096`; Cayley tables
  require `q ≤ 256`.
* **Plot**: `plot.implicit` grid ≤ 300 (marching squares, no labels),
  `plot.surface3d` grid ≤ 80, `plot.field` grid ≤ 40. Curves split at NaN/Inf
  and at jumps larger than ~30× the median magnitude (heuristic; a genuine
  near-vertical segment may be split too). `plot.svg` is capped at ~19.5 KB of
  markup; 3D is an isometric wireframe projection.
* **Category limits** are concrete finite Set limits with aligned projection/
  injection arrays (Object and universal morphisms are constructed explicitly;
  the universal property note is by construction, not an independent proof).
* **Numerics** are real-valued; complex results are rejected by numerical ops.
  `prob.expectation` returns a best-effort symbolic form for common continuous
  distributions plus always a numeric value.
* `factorint` supports `|n| ≤ 10^12`; `divisors`/`sigma` ≤ 10^7; matrix ops
  ≤ 12×12; `num.ode` publishes at most 5000 time points.

## Example requests

```jsonl
{"id": 1, "op": "calc.integrate", "args": {"expr": "exp(-x**2)", "var": "x", "lower": "-oo", "upper": "oo"}}
{"id": 2, "op": "algebra.group", "args": {"op": "sylow", "generators": [[[1,2,3]],[[1,2]]]}}
{"id": 3, "op": "logic.prove", "args": {"premises": [], "goal": "A | ~A"}}
{"id": 4, "op": "topology.homology", "args": {"simplices": {"0": [["a"],["b"],["c"]], "1": [["a","b"],["b","c"],["c","a"]]}}}
{"id": 5, "op": "plot.svg", "args": {"kind": "explicit", "expr": "sin(x)", "range": [-5, 5], "samples": 200}}
```
