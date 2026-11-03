#!/usr/bin/env python
"""MathLab Python engine — one process, line-delimited JSON protocol.

The Host spawns::

    python -u engine/mathlab_engine.py

and writes one JSON request per line on stdin::

    {"id": 1, "op": "calc.simplify", "args": {"expr": "sin(x)**2+cos(x)**2"}}

Every line is answered with exactly one JSON line on stdout::

    {"id": 1, "ok": true, "result": {...}}
    {"id": 1, "ok": false, "error": {"code": "parse-error", "message": "..."}}

Only responses are written to stdout.  Startup diagnostics and unexpected
tracebacks go to stderr.  See docs/API.md and engine/README.md.
"""

from __future__ import annotations

import difflib
import json
import os
import platform
import sys
import traceback

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import mlcore  # noqa: E402
from mlcore import (  # noqa: E402
    ENGINE_VERSION,
    MAX_TEXT,
    EngineError,
    bad_request,
    json_line,
    run_with_timeout,
    truncate,
)

# Modules that contribute HANDLERS; each may be absent while the tree is being
# built, in which case the engine still starts (with a stderr warning).
_MODULE_NAMES = (
    "mlcalc",
    "mlalgebra",
    "mlcategory",
    "mllogic",
    "mllean",
    "mltopology",
    "mlgeometry",
    "mlnumeric",
    "mlplot",
    "mlhelp",
)

HANDLERS: dict = {}
MODULES: dict = {}
for _name in _MODULE_NAMES:
    try:
        _module = __import__(_name)
    except Exception as _exc:  # pragma: no cover - import diagnostics
        print(f"mathlab-engine: could not import {_name}: {_exc}", file=sys.stderr, flush=True)
        continue
    MODULES[_name] = _module
    module_handlers = getattr(_module, "HANDLERS", {})
    if isinstance(module_handlers, dict):
        HANDLERS.update(module_handlers)

# Import mllean explicitly for meta.info even if it were missing from HANDLERS.
try:
    import mllean  # noqa: E402
except Exception:  # pragma: no cover - lean is optional
    mllean = None  # type: ignore[assignment]


# ---------------------------------------------------------------------------
# meta.info
# ---------------------------------------------------------------------------


def _module_version(name: str) -> str | None:
    try:
        module = __import__(name)
        return getattr(module, "__version__", None)
    except Exception:  # pragma: no cover - optional dependency
        return None


def _python_version() -> str:
    return platform.python_version()


def capabilities() -> list[str]:
    groups = set()
    for op in HANDLERS:
        if "." in op:
            groups.add(op.split(".", 1)[0])
    groups.discard("meta")
    return sorted(groups)


def meta_info(args: dict | None = None) -> dict:
    lean = {"available": False, "version": None, "path": None}
    if mllean is not None:
        try:
            info = mllean.lean_info()
            lean = {
                "available": bool(info.get("available")),
                "version": info.get("version"),
                "path": info.get("path"),
            }
        except Exception as exc:  # pragma: no cover - defensive
            lean = {"available": False, "version": None, "path": None, "note": str(exc)}
    return {
        "version": ENGINE_VERSION,
        "python": _python_version(),
        "platform": sys.platform,
        "sympy": _module_version("sympy"),
        "numpy": _module_version("numpy"),
        "scipy": _module_version("scipy"),
        "networkx": _module_version("networkx"),
        "lean": lean,
        "capabilities": capabilities(),
        "ops": sorted(HANDLERS),
        "modules": sorted(MODULES),
        "limits": {
            "expr_chars": mlcore.MAX_EXPR_LEN,
            "matrix_dim": mlcore.MAX_MATRIX_DIM,
            "op_timeout_s": float(os.environ.get("MATHLAB_OP_TIMEOUT", mlcore.DEFAULT_TIMEOUT)),
            "text_chars": MAX_TEXT,
        },
    }


META_HANDLERS = {"meta.info": meta_info}


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------


def op_timeout(op: str, args: dict) -> float | None:
    """Per-op wall clock budget; ``None`` disables the outer guard.

    Lean operations have their own subprocess timeout computed from
    ``timeoutMs`` so the outer 20 s default must not cut them short.
    """
    if op in ("lean.check", "lean.check_file"):
        return None
    raw = os.environ.get("MATHLAB_OP_TIMEOUT")
    try:
        return float(raw) if raw else mlcore.DEFAULT_TIMEOUT
    except ValueError:
        return mlcore.DEFAULT_TIMEOUT


def dispatch(op: str, args: dict) -> dict:
    handler = META_HANDLERS.get(op) or HANDLERS.get(op)
    if handler is None:
        suggestions = difflib.get_close_matches(op, list(HANDLERS) + list(META_HANDLERS), n=3)
        suffix = f" (did you mean: {', '.join(suggestions)}?)" if suggestions else ""
        raise EngineError("unknown-op", f"unknown operation: {op}{suffix}")
    result = handler(args)
    if result is None:
        raise EngineError("internal", f"operation {op} returned no result")
    if not isinstance(result, dict):
        result = {"value": result}
    return result


def handle_request(payload) -> dict:
    if not isinstance(payload, dict):
        raise bad_request("request must be a JSON object")
    request_id = payload.get("id")
    op = payload.get("op")
    if not isinstance(op, str) or not op:
        raise bad_request("request is missing a string 'op'")
    args = payload.get("args")
    if args is None:
        args = {}
    if not isinstance(args, dict):
        raise bad_request("'args' must be a JSON object")
    timeout = op_timeout(op, args)
    result = run_with_timeout(lambda: dispatch(op, args), timeout)
    return {"id": request_id, "ok": True, "result": result}


def _error_response(request_id, error: EngineError) -> dict:
    return {"id": request_id, "ok": False, "error": error.to_dict()}


def _internal_response(request_id, exc: BaseException) -> dict:
    print(
        f"mathlab-engine: internal error for request {request_id!r}: "
        f"{type(exc).__name__}: {exc}",
        file=sys.stderr,
        flush=True,
    )
    traceback.print_exc(file=sys.stderr)
    try:
        sys.stderr.flush()
    except Exception:  # pragma: no cover - defensive
        pass
    return {
        "id": request_id,
        "ok": False,
        "error": {
            "code": "internal",
            "message": truncate(f"{type(exc).__name__}: {exc}"),
        },
    }


def process_line(line: str) -> dict:
    """Process one raw protocol line into a response envelope."""
    request_id = None
    try:
        if len(line) > mlcore.MAX_INPUT_LINE:
            raise EngineError("limit", f"request line exceeds {mlcore.MAX_INPUT_LINE} bytes")
        try:
            payload = json.loads(line)
        except json.JSONDecodeError as exc:
            raise bad_request(f"invalid JSON request: {exc}") from exc
        if isinstance(payload, dict):
            request_id = payload.get("id")
        return handle_request(payload)
    except EngineError as exc:
        return _error_response(request_id, exc)
    except RecursionError:
        return _error_response(request_id, EngineError("limit", "recursion limit exceeded"))
    except MemoryError:
        return _error_response(request_id, EngineError("limit", "out of memory"))
    except NotImplementedError as exc:
        return _error_response(request_id, EngineError("unsupported", str(exc) or "not implemented"))
    except BaseException as exc:  # noqa: BLE001 - the worker must survive anything
        return _internal_response(request_id, exc)


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------


def _configure_stdio() -> None:
    for stream_name in ("stdin", "stdout"):
        stream = getattr(sys, stream_name, None)
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            try:
                reconfigure(encoding="utf-8", errors="replace")
            except Exception:  # pragma: no cover - defensive
                pass


def emit(payload: dict) -> None:
    sys.stdout.write(json_line(payload) + "\n")
    sys.stdout.flush()


def main(argv: list[str]) -> int:
    _configure_stdio()
    ready = {
        "ready": True,
        "engine": "mathlab",
        "version": ENGINE_VERSION,
        "python": _python_version(),
        "ops": len(HANDLERS),
        "modules": sorted(MODULES),
    }
    print(json.dumps(ready), file=sys.stderr, flush=True)

    if "--selftest" in argv:
        samples = [
            {"id": 1, "op": "meta.info", "args": {}},
            {"id": 2, "op": "calc.simplify", "args": {"expr": "sin(x)**2+cos(x)**2"}},
            {"id": 3, "op": "help", "args": {"topic": "overview"}},
        ]
        for sample in samples:
            emit(process_line(json.dumps(sample)))
        return 0

    while True:
        try:
            line = sys.stdin.readline()
        except KeyboardInterrupt:
            return 0
        except Exception as exc:  # pragma: no cover - stdin failure
            print(f"mathlab-engine: stdin failure: {exc}", file=sys.stderr, flush=True)
            return 1
        if line == "":
            return 0
        line = line.strip()
        if not line:
            continue
        try:
            response = process_line(line)
        except BaseException as exc:  # noqa: BLE001 - last-resort guard
            response = _internal_response(None, exc)
        emit(response)


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except SystemExit:
        raise
    except BaseException as exc:  # pragma: no cover - fatal startup failure
        print(f"mathlab-engine: fatal: {exc}", file=sys.stderr)
        raise
