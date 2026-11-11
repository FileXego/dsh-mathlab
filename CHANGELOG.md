# Changelog

All notable changes to MathLab are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions use
[Semantic Versioning](https://semver.org/).

## [0.2.4] — 2026-11-12

### Fixed

- README screenshots and documentation links now use absolute GitHub URLs, so
  images render on the npm package page after `docs/` was removed from the tarball.

## [0.2.3] — 2026-11-12

### Added

- GitHub issue templates (bug / feature) and a README feedback section linking
  Issues and Discussions, so users have a clear place to report problems.
- The panel now shows a visible, copyable Python-dependency setup card when the
  engine is unavailable, instead of only a status tooltip.

### Changed

- Slimmed the npm package: `docs/` screenshots, dev-only verification scripts and
  engine tests are no longer shipped; only `scripts/install-python-deps.mjs`
  remains for `npm run setup:python`.
- Clarified in the README that MathLab is a mathematics workbench, not MATLAB.

### Fixed

- Static-scanner false positives: the Lean/elan hint no longer contains a
  `curl | sh` pattern, and local verification scripts use `localhost`/environment
  variables instead of a hard-coded loopback IP.

## [0.2.2] — 2026-11-11

### Added

- Published to npm as `dsh-mathlab@0.2.2` (`latest`); the `dsh plugin add dsh-mathlab` install path now works.
- `engine/requirements.txt` with pinned SymPy/NumPy/SciPy/NetworkX versions, and a
  bridge probe that reports the exact `pip install -r engine/requirements.txt`
  command when imports are missing.
- GitHub Actions CI: Python 3.13 dependency install, engine unit/smoke tests,
  client build budget, syntax checks, Stage store tests, HTTP auth/default-deny
  contract, and example execution.
- `scripts/test-stage.mjs`: Node test-runner coverage for the pure Stage data
  layer (payload normalization, block identity, Fitch lines, Markdown export).
- Tag-triggered npm publish workflow (requires an `NPM_TOKEN` repository secret).
- Stage source split into store / render / transport / extras / shell modules.

### Changed

- `60-stage.js` is no longer a 153 KB monolith; it is split into
  `60-stage-store.js`, `61-stage-render.js`, `62-stage-transport.js`,
  `63-stage-extras.js`, `64-stage-tab.js`, and `65-stage-dock.js` by responsibility.

## [0.2.1] — 2026-11-04

### Security

- Browser HTTP routes are registered only on DSH's authenticated
  `connection.fetch` channel; missing authentication support means **no route**
  (default deny), never a Host/Origin-only fallback.
- Removed the legacy unauthenticated `/mathlab/*` routes and `lib/fence.js`.
- API, stage SSE, and KaTeX assets now share the authenticated channel.
- Added JSON content-type enforcement, 1 MiB body cap, 8 concurrent operation
  requests, 16 stage SSE streams, and fixed asset allowlisting.
- Added `SECURITY.md` with the trust boundary and Lean execution caveat.

## [0.2.0] — 2026-11-03

### Added

- Live Stage with per-session isolation, SSE push, stage store, questions,
  annotations, trace and Markdown export.
- Native DSH right-sidebar tab, conversation inline dock, guide capsule, pinned
  step/zoom controls, selection-to-question delivery, and symbol–step graph.
- Independent bottom/right placement preferences with a narrowed DSH host seam.
- 20+ math operation families (SymPy, algebra, category theory, logic,
  topology/geometry, numerics, plots, Lean 4) and a searchable symbol atlas.
- `SECURITY.md`, docs, screenshots, and the first public GitHub release.

[Unreleased]: https://github.com/FileXego/dsh-mathlab/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/FileXego/dsh-mathlab/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/FileXego/dsh-mathlab/releases/tag/v0.2.1
[0.2.0]: https://github.com/FileXego/dsh-mathlab/releases/tag/v0.2.0
