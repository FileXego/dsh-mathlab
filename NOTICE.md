# NOTICE — MathLab third-party attribution

MathLab is a DeepSeek Harness plugin for graduate-level mathematics. The plugin's own
source code (Host service, browser panel, Python engine, client build script, data files
and documentation) is original work written for this project, unless stated otherwise
below.

## Runtime dependencies (not bundled, installed separately)

| Component | License | Canonical source | How MathLab uses it |
| --- | --- | --- | --- |
| **SymPy** | BSD-3-Clause | https://github.com/sympy/sympy | Python engine: symbolic calculus, algebra, linear algebra, number theory, ODEs. Imported as a dependency; no SymPy source is copied into this repository. |
| **Mathlib4** | Apache-2.0 | https://github.com/leanprover-community/mathlib4 | Referenced by the Lean 4 snippet library and by the Lean/Mathlib names in the symbol atlas. Snippets are short original examples using the public Mathlib4 API; Mathlib source is not redistributed. |
| **Lean 4** | Apache-2.0 | https://github.com/leanprover/lean4 | Optional toolchain used by `lean.*` operations to type-check user code (`lean`, `lake`). Not bundled. |
| **NetworkX** | BSD-3-Clause | https://networkx.org/ | Python engine: graph analysis (`graph.analyze`). Imported as a dependency; not bundled. |
| **SciPy** | BSD-3-Clause | https://scipy.org/ | Python engine: numerical roots, quadrature, ODE integration, optimisation. Imported as a dependency; not bundled. |
| **NumPy** | BSD-3-Clause | https://numpy.org/ | Python engine: array/numeric support for SciPy and plotting data. Imported as a dependency; not bundled. |
| **Python** | PSF-2.0 | https://www.python.org/ | Interpreter that runs the engine (`python -u engine/mathlab_engine.py`). Not bundled. |

## Assets redistributed with the plugin

| Component | License | Canonical source | Notes |
| --- | --- | --- | --- |
| **KaTeX** (browser assets: `katex.min.js`, `katex.min.css`, `fonts/*`) | MIT | https://katex.org/ ; https://github.com/KaTeX/KaTeX | Bundled under `assets/katex/` so the panel can render LaTeX offline. The upstream MIT license text must accompany the bundled assets; the release owner records the exact pinned KaTeX version and vendored file list. |

## Design/API reference (no code redistributed beyond the fence adaptation)

| Component | License | Canonical source | How MathLab uses it |
| --- | --- | --- | --- |
| **DeepSeek Harness (DSH)** | MIT | https://github.com/deepseek-ai/deepseek-harness | Plugin, slot, tool-registry and web-route APIs this bundle targets. |
| **dsh-better-sidebar** | MIT | https://github.com/omdsh-dev/DSH-better-sidebar | The browser-trust fence in `lib/fence.js` is adapted from its `trust-fence.ts` (which mirrors the DSH `/api` gateway fence): Host-header loopback/trusted-authority check plus Origin/sec-fetch-site check. |

## Data files

`data/symbols.json`, `data/examples.json` and `data/lean-snippets.json` are original
work for this project: encyclopaedic summaries of standard mathematical notation and
textbook results, written independently. Standard notation and named theorems are not
copyrightable; the wording, selection, structure and Lean code examples are ours.

## Notes

- No third-party code, images, fonts or datasets other than the components listed above
  are redistributed by this repository.
- The icon (`icon.svg`) and all user-visible strings are original to this project.
- Exact pinned versions of bundled components (KaTeX in particular) are recorded by the
  release owner alongside this file; this NOTICE lists the canonical upstream sources and
  licenses.
- If you redistribute a build of MathLab, keep this NOTICE and the full license texts of
  every bundled component (currently: the MIT license shipped with the KaTeX assets).
