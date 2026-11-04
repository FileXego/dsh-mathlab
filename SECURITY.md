# Security model — MathLab

## Trust boundary

MathLab's browser routes are served **only** on DeepSeek Harness's authenticated
`connection.fetch` channel (`ctx.connection.fetch.register`). DSH authenticates the browser
session and applies its Host/Origin checks before dispatching a request. The plugin does not
register a `webServer` route and has no fallback that accepts Host/Origin-only requests.

If the host does not expose `connection.fetch`, no MathLab HTTP route exists at all
(**default deny**). Agent tools and the global MathLab panel still work; the panel shows
engine/connection errors instead of silently opening an unauthenticated surface.

Unauthenticated probes (verified 2026-11-04 on DSH 0.2.1-rc.5, Windows desktop):

| Request | Result |
| --- | --- |
| `POST /api/mathlab/api` with a Lean or math op | `401` from the DSH gateway — handler never runs |
| `GET /api/mathlab/events` | `401` |
| `GET /api/mathlab/assets/katex/...` | `401` |
| legacy `POST /mathlab/api` | `404` (route removed) |
| any route on a fake host without `connection.fetch` | no registration; warning logged |

`node scripts/test-http.mjs` includes a fake-channel contract test, a default-deny test and
(optionally, with the GUI URL) live unauthenticated probes.

## Request controls

- JSON content-type required for the operation endpoint;
- 1 MiB body limit;
- at most 8 concurrent operation requests (429 when exceeded);
- at most 16 concurrent stage SSE streams (503 when exceeded), with cleanup on abort/cancel;
- fixed asset allowlist (no URL path joins/traversal); only KaTeX files are served;
- operation names still pass the service's `OP_PATTERN`/unknown-op validation.

## Code execution

- All mathematics runs in the bundled Python engine as a local subprocess; expressions are
  parsed by the restricted parser, not passed to a shell.
- `lean.*` runs the locally installed Lean binary against a temporary `.lean` file (or a
  copied file for `lean.check_file`) with a timeout. It is a local developer tool: it can
  elaborate arbitrary Lean code and `lean.check_file` can read a caller-specified local
  `.lean` file. This capability is reachable only through the authenticated browser session
  or the harness agent tools, never through an unauthenticated HTTP route. Treat the
  authenticated DSH session as a local-user trust boundary.
- The plugin does not fetch the network, does not read credentials/keys, and ships no
  install scripts or obfuscated code.

## Reporting

Please report security issues privately to the maintainer (`FileXego` on GitHub) before
opening a public issue. Do not include credentials or private paths in reports.
