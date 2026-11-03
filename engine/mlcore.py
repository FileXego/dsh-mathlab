"""Shared infrastructure for the MathLab Python engine.

This module owns the wire-format helpers (JSON-safe conversion, text
truncation), the restricted symbolic parser, size/limit policy, the typed
error model and the per-operation wall-clock guard.

The engine never evaluates Python source authored by a client.  Expressions
are parsed with ``sympy.parsing.sympy_parser.parse_expr`` after a strict
lexical/AST screen; the transform chain only enables implicit multiplication,
factorial notation and ``^`` -> ``**``.
"""

from __future__ import annotations

import ast
import json
import math
import re
import threading

import sympy
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

# ---------------------------------------------------------------------------
# Limits (docs/API.md section 3)
# ---------------------------------------------------------------------------

MAX_EXPR_LEN = 4000
MAX_MATRIX_DIM = 12
MAX_GROUP_ORDER = 10000
MAX_TEXT = 20000
DEFAULT_TIMEOUT = 20.0
MAX_INPUT_LINE = 1_000_000
ENGINE_VERSION = "1.0.0"

TRANSFORMATIONS = (
    standard_transformations + (implicit_multiplication_application, convert_xor)
)

# Characters that may appear in a symbolic expression.  Notably absent:
# quotes, brackets/braces, semicolons, backslashes, '#', '@', ':' -- those
# have no meaning in the supported expression language and only widen the
# surface of the underlying Python expression parser.
_SAFE_EXPR_CHARS = set(
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789_+-*/^().,! "
)
_SAFE_EXPR_RE = re.compile(r"^[A-Za-z0-9_+\-*/^().,! ]+$")
_IDENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_']{0,63}$")

_ALLOWED_NODES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Call,
    ast.Name,
    ast.Load,
    ast.Constant,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.Pow,
    ast.BitXor,
    ast.USub,
    ast.UAdd,
    ast.Mod,
)

_ALLOWED_NAMES = frozenset(
    n for n in dir(sympy) if not n.startswith("_") and not n.endswith("__")
) | {
    "oo",
    "inf",
    "nan",
    "zoo",
    "pi",
    "E",
    "I",
    "True",
    "False",
}

# Names that never appear in legitimate math input and only exist to reach the
# Python runtime.  Dunder names are already rejected lexically.
_FORBIDDEN_NAMES = frozenset(
    {
        "eval", "exec", "compile", "open", "input", "breakpoint",
        "__builtins__", "__import__", "globals", "locals", "vars", "dir",
        "getattr", "setattr", "delattr", "hasattr", "system", "popen",
        "subprocess", "os", "sys", "importlib", "builtins",
    }
)

# A small explicit allow-list: symbolic constants and functions users may call.
_CALLABLE_NAMES = frozenset(
    {
        "Abs", "acos", "acosh", "acot", "acoth", "acsc", "acsch", "arg", "asec",
        "asech", "asin", "asinh", "atan", "atan2", "atanh", "binomial", "ceiling",
        "conjugate", "cos", "cosh", "cot", "coth", "csc", "csch", "Dummy",
        "Eq", "erf", "erfc", "exp", "factorial", "fibonacci", "floor", "Frac",
        "Function", "gamma", "gcd", "Heaviside", "im", "Integral", "lcm",
        "Limit", "log", "Max", "Min", "Mod", "N", "Piecewise", "polygamma",
        "Product", "Rational", "re", "root", "sec", "sech", "sign", "signum",
        "sin", "sinc", "sinh", "sqrt", "Sum", "Symbol", "tan", "tanh",
        "Derivative", "DiracDelta", "KroneckerDelta", "S", "Integer", "Float",
        "factorial2", "bernoulli", "harmonic", "catalan", "euler", "zeta",
        "prime", "primepi", "totient", "divisor_sigma", "mobius", "igcd",
        "ilcm", "imod", "sqrt", "cbrt", "expint", "Ei", "Si", "Ci", "Li",
        "LambertW", "besselj", "bessely", "legendre", "assoc_legendre",
        "hermite", "laguerre", "chebyshevt", "chebyshevu", "hypersimp",
    }
)

# Names supplied explicitly to the restricted evaluator dict so the symbol and
# function vocabulary stays stable across SymPy versions.
_EVAL_LOCALS = {
    name: getattr(sympy, name)
    for name in dir(sympy)
    if not name.startswith("_") and not name.endswith("__")
}
_EVAL_LOCALS.update(
    {
        "oo": sympy.oo,
        "nan": sympy.nan,
        "zoo": sympy.zoo,
        "pi": sympy.pi,
        "E": sympy.E,
        "I": sympy.I,
        "True": sympy.true,
        "False": sympy.false,
    }
)

_SYMBOL_CACHE: dict[tuple[str, tuple[str, ...]], sympy.Symbol] = {}
_SYMBOL_CACHE_LOCK = threading.Lock()


# ---------------------------------------------------------------------------
# Typed errors
# ---------------------------------------------------------------------------


class EngineError(Exception):
    """A client-visible, typed operation failure."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = str(message)

    def to_dict(self) -> dict:
        return {"code": self.code, "message": truncate(self.message)}


def domain(message: str) -> EngineError:
    return EngineError("domain-error", message)


def unsupported(message: str) -> EngineError:
    return EngineError("unsupported", message)


def limit_error(message: str) -> EngineError:
    return EngineError("limit", message)


def parse_error(message: str) -> EngineError:
    return EngineError("parse-error", message)


def bad_request(message: str) -> EngineError:
    return EngineError("bad-request", message)


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------


def text(value) -> str:
    """Stringify a SymPy object (or anything) with the wire size limit."""
    return truncate(str(value))


def truncate(value: str, max_len: int = MAX_TEXT) -> str:
    if not isinstance(value, str):
        value = str(value)
    if len(value) > max_len:
        return value[: max_len - 1] + "\u2026"
    return value


def _approx_text(expr) -> str | None:
    """Numeric approximation as a JSON-safe string, or ``None``."""
    if not isinstance(expr, sympy.Basic) or not expr.is_number:
        return None
    try:
        n = sympy.N(expr, 15)
    except Exception:  # pragma: no cover - defensive
        return None
    if n.has(sympy.nan):
        return "nan"
    if n is sympy.oo or n == sympy.oo:
        return "oo"
    if n is -sympy.oo or n == -sympy.oo:
        return "-oo"
    if n is sympy.zoo or n == sympy.zoo:
        return "zoo"
    try:
        if n.is_real:
            f = float(n)
            if math.isnan(f):
                return "nan"
            if math.isinf(f):
                return "oo" if f > 0 else "-oo"
            return repr(f)
        return str(sympy.sstr(n))
    except Exception:  # pragma: no cover - defensive
        return str(sympy.sstr(n))


def expr_result(
    parsed,
    input_text: str = "",
    notes: list[str] | None = None,
    result_expr=None,
) -> dict:
    """Build the shared ExprResult shape from docs/API.md section 3."""
    if result_expr is None:
        result_expr = parsed
    out = {
        "input": truncate(input_text),
        "result": text(sympy.sstr(result_expr)),
        "pretty": truncate(sympy.pretty(result_expr)),
        "latex": truncate(sympy.latex(result_expr)),
    }
    try:
        if parsed is not None:
            out["input_latex"] = truncate(sympy.latex(parsed))
    except Exception:  # pragma: no cover - unparseable input rendering
        out["input_latex"] = ""
    approx = _approx_text(result_expr)
    if approx is not None:
        out["approx"] = truncate(approx)
    if notes:
        out["notes"] = [truncate(n) for n in notes if n]
    return out


def add_note(notes: list[str], message: str) -> None:
    if message and message not in notes:
        notes.append(message)


# ---------------------------------------------------------------------------
# JSON sanitisation
# ---------------------------------------------------------------------------


def sanitize(value):
    """Recursively convert to JSON-safe primitives (numbers stay numbers)."""
    if value is None or isinstance(value, (bool, str)):
        return truncate(value) if isinstance(value, str) else value
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if math.isnan(value):
            return "nan"
        if math.isinf(value):
            return "oo" if value > 0 else "-oo"
        return value
    if isinstance(value, complex):
        if value.imag == 0:
            return sanitize(value.real)
        return str(value)
    if isinstance(value, sympy.Basic):
        if value.is_Integer:
            return int(value)
        if value.is_Float:
            return sanitize(float(value))
        return text(sympy.sstr(value))
    if isinstance(value, sympy.MatrixBase):
        return [[sanitize(value[i, j]) for j in range(value.cols)] for i in range(value.rows)]
    if isinstance(value, dict):
        return {truncate(str(k)): sanitize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set, frozenset)):
        return [sanitize(v) for v in value]
    # numpy scalars / arrays and anything generic
    tolist = getattr(value, "tolist", None)
    if callable(tolist):
        try:
            return sanitize(tolist())
        except Exception:  # pragma: no cover - defensive
            pass
    item = getattr(value, "item", None)
    if callable(item):
        try:
            return sanitize(item())
        except Exception:  # pragma: no cover - defensive
            pass
    return text(str(value))


def json_line(payload: dict) -> str:
    try:
        return json.dumps(sanitize(payload), ensure_ascii=False, allow_nan=False)
    except (TypeError, ValueError) as exc:  # pragma: no cover - defensive
        fallback = {
            "id": payload.get("id"),
            "ok": False,
            "error": {"code": "internal", "message": f"serialization failure: {exc}"},
        }
        return json.dumps(fallback, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Symbol / expression parsing
# ---------------------------------------------------------------------------


def make_symbol(name: str, assumptions: dict | None = None) -> sympy.Symbol:
    if not isinstance(name, str) or not _IDENT_RE.match(name):
        raise bad_request(f"invalid symbol name: {name!r}")
    assumptions = assumptions or {}
    key = (name, tuple(sorted(assumptions.items())))
    with _SYMBOL_CACHE_LOCK:
        sym = _SYMBOL_CACHE.get(key)
        if sym is None:
            try:
                sym = sympy.Symbol(name, **assumptions)
            except Exception as exc:
                raise bad_request(f"invalid assumptions for {name}: {exc}") from exc
            _SYMBOL_CACHE[key] = sym
        return sym


def parse_symbols(names) -> list[sympy.Symbol]:
    if names is None:
        return []
    if isinstance(names, str):
        names = [n for n in re.split(r"[,\s]+", names) if n]
    if not isinstance(names, (list, tuple)):
        raise bad_request("symbol list must be an array of names")
    if len(names) > 40:
        raise limit_error("too many symbols (max 40)")
    return [make_symbol(str(n)) for n in names]


def _screen_expression(source: str, allowed_callables: frozenset | set = frozenset()) -> None:
    if not isinstance(source, str):
        raise parse_error("expression must be a string")
    if len(source) > MAX_EXPR_LEN:
        raise limit_error(f"expression too long ({len(source)} > {MAX_EXPR_LEN} chars)")
    if not source.strip():
        raise parse_error("empty expression")
    if not _SAFE_EXPR_RE.match(source):
        bad = sorted(set(source) - _SAFE_EXPR_CHARS)
        raise parse_error(f"expression contains unsupported characters: {''.join(bad)[:20]}")
    if "__" in source:
        raise parse_error("expression contains a forbidden name fragment")
    lowered = source.lower()
    for word in ("import", "lambda", "eval", "exec", "global", "del ", "open("):
        if word in lowered:
            raise parse_error(f"expression contains a forbidden keyword: {word.strip()}")
    # AST screen when the raw syntax happens to be valid Python.  Implicit
    # multiplication / factorial notation can make raw parsing fail; the
    # lexical screen above already rejects the dangerous surface there.
    try:
        tree = ast.parse(source, mode="eval")
    except SyntaxError:
        return
    for node in ast.walk(tree):
        if not isinstance(node, _ALLOWED_NODES):
            raise parse_error(f"unsupported syntax: {type(node).__name__}")
        if isinstance(node, ast.Name):
            if not _IDENT_RE.match(node.id):
                raise parse_error(f"invalid name: {node.id!r}")
            if node.id in _FORBIDDEN_NAMES:
                raise parse_error(f"forbidden name: {node.id}")
        if isinstance(node, ast.Call):
            func = node.func
            if not isinstance(func, ast.Name):
                raise parse_error("unsupported function call in expression")
            if func.id not in _CALLABLE_NAMES and func.id not in allowed_callables:
                raise parse_error(f"unsupported function call in expression: {func.id}")
            if node.keywords:
                raise parse_error("keyword arguments are not supported")
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            raise parse_error("string literals are not allowed")


def parse_expression(source, symbols: dict | None = None, assumptions: dict | None = None, allow_calls=frozenset()):
    """Restricted ``parse_expr``; never executes arbitrary Python."""
    _screen_expression(source, allow_calls)
    local = dict(_EVAL_LOCALS)
    if symbols:
        for name, sym in symbols.items():
            local[name] = sym
    if assumptions:
        for name, value in assumptions.items():
            if not _IDENT_RE.match(str(name)):
                raise bad_request(f"invalid assumption symbol: {name!r}")
            if isinstance(value, str):
                spec = {value: True}
            elif isinstance(value, list) and all(isinstance(x, str) for x in value):
                spec = {x: True for x in value}
            else:
                raise bad_request("assumptions must map symbol -> string")
            local[str(name)] = make_symbol(str(name), spec)
    try:
        return parse_expr(source, local_dict=local, transformations=TRANSFORMATIONS, evaluate=False)
    except EngineError:
        raise
    except (SyntaxError, TypeError, ValueError, AttributeError) as exc:
        raise parse_error(f"could not parse expression: {exc}") from exc
    except Exception as exc:  # pragma: no cover - sympy internals
        raise parse_error(f"could not parse expression: {exc}") from exc


def parse_expr_plain(source, assumptions: dict | None = None):
    """Parse an expression that may reference free ``x, y, z, t, ...`` names."""
    return parse_expression(source, assumptions=assumptions)


def parse_input_expr(args: dict, key: str = "expr", assumptions=None):
    raw = args.get(key)
    if raw is None:
        raise bad_request(f"missing required argument: {key}")
    return parse_expression(raw, assumptions=assumptions)


def parse_number(value, name: str = "value"):
    """Parse a number/expression argument into a SymPy object."""
    if isinstance(value, bool):
        raise bad_request(f"{name} must be a number or expression string")
    if isinstance(value, (int, float)):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            raise domain_error_number(name)
        return sympy.S(sympy.Rational(str(value))) if isinstance(value, float) else sympy.Integer(value)
    if isinstance(value, str):
        return parse_expression(value)
    raise bad_request(f"{name} must be a number or expression string")


def domain_error_number(name: str):
    return domain(f"{name} must be a finite number")


def parse_int_arg(value, name: str, default=None, minimum=None, maximum=None) -> int:
    if value is None:
        if default is None:
            raise bad_request(f"missing required argument: {name}")
        value = default
    try:
        if isinstance(value, bool):
            raise ValueError
        if isinstance(value, float) and not value.is_integer():
            raise ValueError
        ivalue = int(value)
    except (TypeError, ValueError) as exc:
        raise bad_request(f"{name} must be an integer") from exc
    if minimum is not None and ivalue < minimum:
        raise limit_error(f"{name} must be >= {minimum}")
    if maximum is not None and ivalue > maximum:
        raise limit_error(f"{name} must be <= {maximum}")
    return ivalue


def parse_float_arg(value, name: str, default=None, minimum=None, maximum=None) -> float:
    if value is None:
        if default is None:
            raise bad_request(f"missing required argument: {name}")
        value = default
    try:
        if isinstance(value, bool):
            raise ValueError
        fvalue = float(value)
    except (TypeError, ValueError) as exc:
        raise bad_request(f"{name} must be a number") from exc
    if math.isnan(fvalue) or math.isinf(fvalue):
        raise domain(f"{name} must be a finite number")
    if minimum is not None and fvalue < minimum:
        raise limit_error(f"{name} must be >= {minimum}")
    if maximum is not None and fvalue > maximum:
        raise limit_error(f"{name} must be <= {maximum}")
    return fvalue


def parse_var(args: dict, key: str = "var", default: str = "x") -> sympy.Symbol:
    name = args.get(key, default)
    if not isinstance(name, str) or not _IDENT_RE.match(name):
        raise bad_request(f"invalid variable name: {name!r}")
    return make_symbol(name)


# ---------------------------------------------------------------------------
# Matrix parsing / conversion
# ---------------------------------------------------------------------------


def parse_matrix_arg(value, name: str = "matrix") -> sympy.Matrix:
    if value is None:
        raise bad_request(f"missing required argument: {name}")
    if isinstance(value, dict):
        raise bad_request(f"{name} must be a rectangular array of rows")
    if not isinstance(value, (list, tuple)) or not value:
        raise bad_request(f"{name} must be a non-empty list of rows")
    rows = len(value)
    if rows > MAX_MATRIX_DIM:
        raise limit_error(f"matrix row count {rows} exceeds limit {MAX_MATRIX_DIM}")
    parsed_rows = []
    cols = None
    for row in value:
        if not isinstance(row, (list, tuple)):
            raise bad_request(f"{name} must be a list of rows")
        if cols is None:
            cols = len(row)
        elif len(row) != cols:
            raise bad_request(f"{name} rows must have equal length")
        if cols is None or cols == 0 or cols > MAX_MATRIX_DIM:
            raise limit_error(f"matrix column count exceeds limit {MAX_MATRIX_DIM}")
        parsed_rows.append([_parse_cell(cell, name) for cell in row])
    if cols is None:
        raise bad_request(f"{name} is empty")
    return sympy.Matrix(parsed_rows)


def _parse_cell(cell, name: str):
    if isinstance(cell, bool):
        raise bad_request(f"{name} cells must be numbers or expression strings")
    if isinstance(cell, (int, float)):
        return parse_number(cell, name)
    if isinstance(cell, str):
        return parse_expression(cell)
    raise bad_request(f"{name} cells must be numbers or expression strings")


def matrix_to_strings(matrix: sympy.MatrixBase) -> list[list[str]]:
    return [[text(sympy.sstr(matrix[i, j])) for j in range(matrix.cols)] for i in range(matrix.rows)]


def matrix_list(matrix: sympy.MatrixBase) -> list[list]:
    return [[sanitize(matrix[i, j]) for j in range(matrix.cols)] for i in range(matrix.rows)]


def vector_to_results(coords) -> list[dict]:
    return [expr_result(c) for c in coords]


# ---------------------------------------------------------------------------
# Construction guard (bounded work)
# ---------------------------------------------------------------------------


def guard_order(order: int, what: str = "group") -> None:
    if order > MAX_GROUP_ORDER:
        raise limit_error(f"{what} order {order} exceeds limit {MAX_GROUP_ORDER}")


def guard_matrix(matrix: sympy.MatrixBase) -> None:
    if matrix.rows > MAX_MATRIX_DIM or matrix.cols > MAX_MATRIX_DIM:
        raise limit_error(
            f"matrix dimensions {matrix.rows}x{matrix.cols} exceed limit "
            f"{MAX_MATRIX_DIM}x{MAX_MATRIX_DIM}"
        )


# ---------------------------------------------------------------------------
# Wall-clock isolation
# ---------------------------------------------------------------------------


def run_with_timeout(fn, timeout: float | None = None):
    """Run ``fn`` in a daemon thread and enforce a soft wall-clock budget.

    The operation runs in its own thread so a runaway SymPy call cannot block
    the protocol loop; results are returned or the typed ``timeout`` error is
    raised.  Python threads cannot be force-killed, so a timed-out operation
    may keep burning CPU in the background.  The dispatch loop logs it.
    """
    if timeout is None:
        timeout = DEFAULT_TIMEOUT
    box: dict = {}

    def _target():
        try:
            box["value"] = fn()
        except BaseException as exc:  # noqa: BLE001 - transported to caller
            box["error"] = exc

    worker = threading.Thread(target=_target, name="mathlab-op", daemon=True)
    worker.start()
    worker.join(timeout)
    if worker.is_alive():
        raise EngineError("timeout", f"operation exceeded {timeout:g}s")
    if "error" in box:
        raise box["error"]
    return box.get("value")


def truth(value) -> bool:
    return bool(value)
