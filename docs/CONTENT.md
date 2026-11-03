# MathLab content data — authoring spec

Three JSON data files feed the panel and the agent tools. The Host reads them at runtime
from `data/`; keep them valid UTF-8 JSON (arrays/objects below), no trailing commas.

## 1. `data/symbols.json` — symbol atlas (target: 240–320 entries)

Schema:

```json
{
  "fields": [
    { "id": "analysis", "label": "Analysis", "label_zh": "分析" }
  ],
  "symbols": [
    {
      "id": "integral-definite",
      "symbol": "∫",
      "latex": "\\int_a^b f(x)\\,dx",
      "unicode": "∫",
      "name": "definite integral",
      "name_zh": "定积分",
      "field": "analysis",
      "description": "Integral of f over [a,b] (signed area / limit of Riemann sums).",
      "description_zh": "f 在 [a,b] 上的定积分（有向面积 / 黎曼和的极限）。",
      "lean": "MeasureTheory.integral",
      "sympy": "Integral(f, (x, a, b))",
      "tags": ["integral", "calculus"]
    }
  ]
}
```

Required fields per symbol: `id` (unique kebab-case), `symbol` (short display glyph),
`latex`, `unicode` (fallback glyph; may equal `symbol`), `name`, `name_zh`, `field`,
`description`, `description_zh`, `tags` (array). Optional: `lean`, `sympy`, `aka`
(array), `note`, `note_zh`.

Fields to cover (ids fixed): `logic`, `set`, `number`, `analysis`, `algebra`,
`linear-algebra`, `topology`, `geometry`, `category`, `probability`, `differential`,
`combinatorics`, `lean`. Each field >= 12 entries; logic/algebra/category/analysis >= 25.
Include multi-character notation as one entry (`∀ε>0`, `Hom(A,B)`, `f∗`, `⊢`, `⊨`,
`⊗`, `⊕`, `≅`, `∘`, `↠`, `↪`, `lim`, `∂`, `∇`, `Δ`, `∮`, `ℵ₀`, `℘`, `ℜ`, `⟨x,y⟩`,
`⌊x⌋`, `∑`, `∏`, `√`, `∞`, `∅`, `ℕ ℤ ℚ ℝ ℂ ℍ 𝔽_p`, `⊆ ⊂ ∈ ∉ ∪ ∩`, `≤ ≥ ≠ ≈ ≡`,
`→ ⇒ ↔ ⇔ ⊢ ⊤ ⊥ ¬ ∧ ∨`, `□ ◇`, `∀ ∃`, `λ Π Σ`, `α β γ … ω`, `ε δ`, `φ ψ`, `Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω`,
`∘ ⋆ ∗ ⊗`, `id`, `Hom`, `Ob(C)`, `Mor(C)`, `Fun(C,D)`, `Nat(F,G)`, `lim ←`, `colim →`,
`⊣` adjunction, `⇒` natural transformation, `π₁`, `H_n`, `∂`, `d`, `ω`, `Ω^k(M)`, `T_pM`, `g_{μν}`,
`R^ρ_{σμν}`, `Ric`, `R`, `P(A|B)`, `E[X]`, `Var`, `𝒩(μ,σ²)`, `Ber(p)`, `⨁`, `∏_{i∈I}`.
Lean column: use accurate Mathlib4 declaration names where known (`MeasureTheory.integral`,
`Filter.Tendsto`, `Set.mem_union`, `Finset.sum`, `ContinuousLinearMap`, `CategoryTheory.Functor`,
`AlgebraicGeometry.Scheme`, `Polynomial`, `LinearMap.det`, `Module.rank`, `Nat.Prime`,
`Irrational.sqrt_two`, `SimpleGraph`, `HomologicalComplex`, `SmoothManifold`). If unsure,
omit `lean` rather than inventing a name.

## 2. `data/examples.json` — worked examples (target: 40–60)

```json
{
  "examples": [
    {
      "id": "gaussian-integral",
      "title": "Gaussian integral",
      "title_zh": "高斯积分",
      "field": "analysis",
      "panel": "compute",
      "description": "Evaluate the classic probability integral.",
      "description_zh": "计算经典的概率积分。",
      "action": { "op": "calc.integrate", "args": { "expr": "exp(-x**2)", "var": "x", "lower": "-oo", "upper": "oo" } },
      "expect": "sqrt(pi)"
    }
  ]
}
```

Requirements: `panel` ∈ compute|linalg|algebra|category|logic|lean|topology|plot|symbols.
Every `action.op` must exist in `docs/API.md` and its args must be a *valid* request.
Include at least: 8 analysis (limits, series, integrals, ODE, Gauss integral, Taylor),
5 linear algebra (eigen, SVD, rank), 6 abstract algebra (S3, D4, A4 subgroups, quotient,
GF(4), Z/12), 5 category theory (small category laws, functor, natural transformation,
pullback in Set, product in Set, diagram commutativity), 5 logic (De Morgan, syllogism,
FOL validity, modal S5, equivalence), 3 Lean snippets as example `lean` panel entries
(`action` may be `{op:"lean.snippets", args:{id:...}}`), 4 topology/geometry (circle
homology, graph π₁, sphere curvature, torus metric), 4 plotting (damped sine, Lissajous,
polar rose, implicit conic), 2 probability/optimization.
`expect` is optional, short, human-checkable.

## 3. `data/lean-snippets.json` — Lean 4 library (target: 35–60)

```json
{
  "snippets": [
    {
      "id": "sqrt2-irrational",
      "title": "√2 is irrational",
      "title_zh": "√2 是无理数",
      "level": "beginner",
      "imports": ["Mathlib"],
      "code": "theorem sqrt_two_irrational : Irrational (Real.sqrt 2) := by\n  simpa using irrational_sqrt_two\n",
      "explanation": "Uses Mathlib's irrational_sqrt_two.",
      "explanation_zh": "使用 Mathlib 的 irrational_sqrt_two。",
      "tags": ["number theory", "irrational"]
    }
  ]
}
```

Levels: beginner|intermediate|advanced. Cover: logic basics (∧/∨/→/¬, quantifiers),
sets/functions, induction, number theory (irrationality, primes, gcd), analysis
(continuity, limits, derivative, sum), algebra (groups, rings, ideals, linear maps),
category theory (functors, natural transformations), topology (open sets, continuity),
combinatorics (Finset, binomial), Lean syntax (structure, inductive, typeclass, `simp`,
`omega`, `linarith`, `ring`, `exact`, `apply`, `rw`). Snippets should be plausible Lean 4
code; when using a custom definition, include it in the snippet. Prefer Mathlib names that
exist (`irrational_sqrt_two`, `Nat.Prime`, `Finset.sum_range_succ`, `Continuous`,
`HasDerivAt`, `Group`, `Ideal`, `Functor`, `Nat.choose`). Mark `imports` accurately
(`Mathlib` or `Mathlib.Tactic`); a snippet that cannot compile without a project is fine
because `lean.check` reports the environment truthfully.

## 4. `NOTICE.md`

List every third-party component whose code/data/artwork the plugin redistributes or
learns from, with license and URL: SymPy (BSD-3), Mathlib4 (Apache-2.0), Lean 4
(Apache-2.0), NetworkX (BSD-3), SciPy (BSD-3), NumPy (BSD-3), KaTeX (MIT; bundled assets),
Python (PSF). Also state that the plugin code itself is original work for this project.
The Lead appends the final bundled-version list; you provide the canonical list + notes.

## 5. Quality bar

- Bilingual: every user-visible string has a natural zh-CN and en version (zh is primary).
- Mathematics must be correct: check each example/`expect` mentally or run it through
  `python engine/mathlab_engine.py` once the engine exists (ask the Lead/engine teammate
  if the engine is not ready yet — you may also validate formulas with a short SymPy
  one-liner locally; Python + SymPy are installed).
- Lean/Mathlib names: only include names you are reasonably confident exist; otherwise
  omit. Never fabricate.
- JSON must parse: `python -c "import json;json.load(open('data/symbols.json',encoding='utf-8'))"`
  for all three files (run from `D:\dsh-work\mathlab`).
- No trailing whitespace, UTF-8, and stable ids (they are referenced by examples/tests).
