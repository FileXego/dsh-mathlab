"""Lean 4 integration (``lean.*``).

The engine shells out to ``lean`` when a toolchain is available.  On machines
without Lean (including the development machine for this plugin) every
operation except ``lean.info``/``lean.version`` answers a typed ``unsupported``
error that names the problem, so the Host can render a friendly message.
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
import time

from mlcore import EngineError, bad_request, truncate, unsupported

MAX_CODE_BYTES = 512_000
MAX_FILE_BYTES = 2_000_000
DEFAULT_TIMEOUT_MS = 15_000
MAX_TIMEOUT_MS = 120_000

_DIAG_RE = re.compile(
    r"^(?P<file>[^:\r\n]+):(?P<line>\d+):(?P<col>\d+):\s*"
    r"(?P<severity>error|warning|info|information):\s*(?P<message>.*)$"
)
_LEAN_VERSION_RE = re.compile(r"Lean \(version (?P<version>[^,\s)]+)")


def find_lean() -> str | None:
    env = os.environ.get("MATHLAB_LEAN")
    if env:
        candidate = env.strip().strip('"')
        if candidate and os.path.isfile(candidate):
            return os.path.abspath(candidate)
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
        return None
    return shutil.which("lean")


def find_lake() -> str | None:
    env = os.environ.get("MATHLAB_LAKE")
    if env:
        resolved = shutil.which(env.strip().strip('"')) or (
            os.path.abspath(env) if os.path.isfile(env) else None
        )
        if resolved:
            return resolved
    return shutil.which("lake")


def _lean_version(lean_path: str) -> dict:
    try:
        proc = subprocess.run(
            [lean_path, "--version"],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"version": None, "error": str(exc)}
    output = (proc.stdout or "") + (proc.stderr or "")
    match = _LEAN_VERSION_RE.search(output)
    version = match.group("version") if match else output.strip().splitlines()[0] if output.strip() else None
    return {"version": version, "output": truncate(output.strip())}


def lean_info(args=None) -> dict:
    lean_path = find_lean()
    lake_path = find_lake()
    if not lean_path:
        return {
            "available": False,
            "version": None,
            "path": None,
            "lake": bool(lake_path),
            "lakePath": lake_path,
            "note": (
                "Lean toolchain not found. Install Lean 4 (for example via elan: download "
                "https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh, review it, "
                "then run it with `sh`), or point MATHLAB_LEAN at the `lean` executable. "
                "The algebra/analysis panels work without Lean; only lean.* operations need it."
            ),
        }
    result = {
        "available": True,
        "path": lean_path,
        "lake": bool(lake_path),
        "lakePath": lake_path,
        "backend": "subprocess",
    }
    version = _lean_version(lean_path)
    result["version"] = version.get("version")
    if version.get("error"):
        result["note"] = f"Lean executable found but `lean --version` failed: {version['error']}"
    return result


def lean_version(args=None) -> dict:
    info = lean_info()
    return {
        "version": info.get("version"),
        "path": info.get("path"),
        "available": info.get("available", False),
        "note": info.get("note"),
    }


def _require_lean() -> tuple[str, str | None]:
    lean_path = find_lean()
    if not lean_path:
        raise unsupported(
            "Lean toolchain not found: install Lean 4 (e.g. via elan) or set "
            "MATHLAB_LEAN to the lean executable. lean.check is unavailable until then."
        )
    return lean_path, lean_info().get("version")


def _timeout_seconds(raw) -> float:
    if raw is None:
        return DEFAULT_TIMEOUT_MS / 1000.0
    if isinstance(raw, bool) or not isinstance(raw, (int, float)):
        raise bad_request("timeoutMs must be a number")
    value = float(raw)
    if value <= 0:
        raise bad_request("timeoutMs must be positive")
    return min(value, MAX_TIMEOUT_MS) / 1000.0


def _parse_diagnostics(output: str) -> list[dict]:
    diagnostics: list[dict] = []
    current: dict | None = None
    for line in output.splitlines():
        match = _DIAG_RE.match(line.strip())
        if match:
            if current is not None:
                diagnostics.append(current)
            current = {
                "severity": "info" if match.group("severity").startswith("info") else match.group("severity"),
                "line": int(match.group("line")),
                "column": int(match.group("col")),
                "message": match.group("message").strip(),
                "file": match.group("file"),
            }
        elif current is not None and line.strip():
            current["message"] = (current["message"] + "\n" + line.strip())[:4000]
        elif current is not None:
            diagnostics.append(current)
            current = None
    if current is not None:
        diagnostics.append(current)
    return diagnostics


def _run_lean(lean_path: str, target_file: str, timeout_s: float, version):
    started = time.monotonic()
    try:
        proc = subprocess.run(
            [lean_path, target_file],
            capture_output=True,
            text=True,
            timeout=timeout_s,
            check=False,
            cwd=os.path.dirname(target_file) or None,
        )
    except subprocess.TimeoutExpired:
        raise EngineError("timeout", f"lean exceeded the {timeout_s:g}s timeout")
    except OSError as exc:
        raise unsupported(f"could not launch Lean: {exc}") from exc
    elapsed_ms = int((time.monotonic() - started) * 1000)
    stdout = truncate(proc.stdout or "")
    stderr = truncate(proc.stderr or "")
    diagnostics = _parse_diagnostics(stderr + "\n" + stdout)
    errors = [d for d in diagnostics if d["severity"] == "error"]
    result = {
        "ok": proc.returncode == 0 and not errors,
        "diagnostics": diagnostics[:200],
        "stdout": stdout,
        "stderr": stderr,
        "elapsedMs": elapsed_ms,
        "leanVersion": version,
        "returnCode": proc.returncode,
    }
    if result["ok"] is False and not diagnostics:
        result["note"] = "Lean exited non-zero without a structured diagnostic; inspect stderr."
    return result


def lean_check(args: dict) -> dict:
    lean_path, version = _require_lean()
    code = args.get("code")
    if code is None:
        code = args.get("source")
    if not isinstance(code, str) or not code.strip():
        raise bad_request("'code' must be a non-empty Lean source string")
    if len(code.encode("utf-8")) > MAX_CODE_BYTES:
        raise EngineError("limit", f"Lean source exceeds {MAX_CODE_BYTES} bytes")
    filename = args.get("filename") or "MathLab.lean"
    if not isinstance(filename, str) or not filename.endswith(".lean") or "/" in filename or "\\" in filename:
        filename = "MathLab.lean"
    timeout_s = _timeout_seconds(args.get("timeoutMs"))
    temp_dir = tempfile.mkdtemp(prefix="mathlab-lean-")
    target = os.path.join(temp_dir, filename)
    try:
        with open(target, "w", encoding="utf-8") as handle:
            handle.write(code)
        result = _run_lean(lean_path, target, timeout_s, version)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
    if "import Mathlib" in code:
        result.setdefault("notes", []).append(
            "Source imports Mathlib; this only works when the configured Lean "
            "installation (MATHLAB_LEAN) is inside a Mathlib-enabled project."
        )
    return result


def lean_check_file(args: dict) -> dict:
    lean_path, version = _require_lean()
    path = args.get("path")
    if not isinstance(path, str) or not path:
        raise bad_request("'path' must be an absolute .lean file path")
    if not os.path.isabs(path):
        raise bad_request("'path' must be absolute")
    if not os.path.isfile(path):
        raise bad_request(f"file not found: {path}")
    if not path.endswith(".lean"):
        raise bad_request("'path' must end with .lean")
    if os.path.getsize(path) > MAX_FILE_BYTES:
        raise EngineError("limit", f"Lean file exceeds {MAX_FILE_BYTES} bytes")
    timeout_s = _timeout_seconds(args.get("timeoutMs"))
    # Run on a copy in a temporary directory so the caller's tree stays read-only.
    temp_dir = tempfile.mkdtemp(prefix="mathlab-lean-file-")
    target = os.path.join(temp_dir, os.path.basename(path))
    try:
        shutil.copyfile(path, target)
        result = _run_lean(lean_path, target, timeout_s, version)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
    result["file"] = path
    result.setdefault("notes", []).append(
        "The file is checked from a temporary copy so the original location stays read-only; "
        "relative imports may need module path configuration."
    )
    return result


def lean_snippets(args: dict) -> dict:
    # Host-owned per docs/API.md section 5; never handled by the engine.
    raise unsupported("lean.snippets is served by the Host, not the Python engine")


HANDLERS = {
    "lean.info": lean_info,
    "lean.check": lean_check,
    "lean.check_file": lean_check_file,
    "lean.version": lean_version,
}
