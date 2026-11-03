"""Symbolic calculus / linear algebra / number theory ops (``calc.*``).

Every handler receives the raw ``args`` object from a protocol request and
returns a JSON-safe ``result`` object; failures raise :class:`EngineError`.
"""

from __future__ import annotations

import re

import sympy
from sympy.ntheory.modular import crt as _sympy_crt

from mlcore import (
    MAX_MATRIX_DIM,
    EngineError,
    add_note,
    bad_request,
    domain,
    expr_result,
    guard_matrix,
    limit_error,
    matrix_to_strings,
    parse_expression,
    parse_int_arg,
    parse_matrix_arg,
    parse_number,
    parse_symbols,
    parse_var,
    text,
    unsupported,
)


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------


def _assumptions(args: dict):
    value = args.get("assumptions")
    if value is None:
        return None
    if not isinstance(value, dict):
        raise bad_request("assumptions must be an object mapping symbol -> assumption")
    return value


def _parse(args: dict, key: str = "expr", assumptions=None):
    raw = args.get(key)
    if raw is None:
        raise bad_request(f"missing required argument: {key}")
    return parse_expression(raw, assumptions=assumptions)


def parse_relation(raw, assumptions=None):
    """Parse ``"lhs = rhs"`` (or ``"expr"`` meaning ``expr = 0``) into an Eq."""
    if raw is None:
        raise bad_request("missing equation")
    if not isinstance(raw, str):
        raise bad_request("equations must be strings")
    if raw.count("=") > 1:
        raise bad_request(f"invalid equation {raw!r}: expected a single '='")
    if "=" in raw:
        lhs_text, rhs_text = raw.split("=", 1)
        if not lhs_text.strip() or not rhs_text.strip():
            raise bad_request(f"invalid equation {raw!r}")
        lhs = parse_expression(lhs_text, assumptions=assumptions)
        rhs = parse_expression(rhs_text, assumptions=assumptions)
        return sympy.Eq(lhs, rhs)
    return sympy.Eq(parse_expression(raw, assumptions=assumptions), 0)


def _transform(args: dict, fn, *, parse_assumptions=False, extra_notes=None):
    assumptions = _assumptions(args) if parse_assumptions else None
    parsed = _parse(args, assumptions=assumptions)
    notes: list[str] = []
    result = fn(parsed)
    out = expr_result(parsed, str(args.get("expr")), notes=notes)
    if result is not parsed:
        out["result"] = text(sympy.sstr(result))
        out["pretty"] = text(sympy.pretty(result))
        out["latex"] = text(sympy.latex(result))
        approx = out.get("approx")
        out.pop("approx", None)
        from mlcore import _approx_text  # internal helper

        approx = _approx_text(result)
        if approx is not None:
            out["approx"] = text(approx)
    if extra_notes:
        for note in extra_notes(parsed, result):
            add_note(notes, note)
    if notes:
        out["notes"] = notes
    return out


def _run_simple(args: dict, fn, assumptions=False):
    parsed = _parse(args, assumptions=_assumptions(args) if assumptions else None)
    result = fn(parsed)
    return _expr_from(parsed, result, str(args.get("expr")))


def _expr_from(parsed_input, result, input_text: str = "", notes=None, extra=None) -> dict:
    out = expr_result(parsed_input, input_text, notes=notes)
    if result is not None and result is not parsed_input:
        out["result"] = text(sympy.sstr(result))
        out["pretty"] = text(sympy.pretty(result))
        out["latex"] = text(sympy.latex(result))
        out.pop("approx", None)
        from mlcore import _approx_text

        approx = _approx_text(result)
        if approx is not None:
            out["approx"] = text(approx)
    if extra:
        out["extra"] = {k: (text(sympy.sstr(v)) if isinstance(v, sympy.Basic) else v) for k, v in extra.items()}
    return out


# ---------------------------------------------------------------------------
# calc.* handlers
# ---------------------------------------------------------------------------


def op_simplify(args):
    return _run_simple(args, lambda e: sympy.simplify(e), assumptions=True)


def op_expand(args):
    return _run_simple(args, lambda e: sympy.expand(e))


def op_factor(args):
    return _run_simple(args, lambda e: sympy.factor(e))


def op_apart(args):
    var = parse_var(args, "var", "x")
    parsed = _parse(args)
    result = sympy.apart(parsed, var)
    return _expr_from(parsed, result, str(args.get("expr")))


def op_cancel(args):
    return _run_simple(args, lambda e: sympy.cancel(e))


def op_trigsimp(args):
    return _run_simple(args, lambda e: sympy.trigsimp(e))


def op_rationalize(args):
    return _run_simple(args, lambda e: sympy.radsimp(e))


def op_powdenest(args):
    return _run_simple(args, lambda e: sympy.powdenest(e, force=True))


def op_diff(args):
    parsed = _parse(args)
    var = parse_var(args, "var", "x")
    order = parse_int_arg(args.get("order"), "order", 1, minimum=1, maximum=50)
    result = sympy.diff(parsed, var, order)
    out = _expr_from(parsed, result, str(args.get("expr")))
    out.setdefault("extra", {})["order"] = order
    out["extra"]["var"] = str(var)
    return out


def op_integrate(args):
    parsed = _parse(args)
    var = parse_var(args, "var", "x")
    lower_raw = args.get("lower")
    upper_raw = args.get("upper")
    notes: list[str] = []
    if lower_raw is None and upper_raw is None:
        result = sympy.integrate(parsed, var)
        out = _expr_from(parsed, result, str(args.get("expr")))
        out.setdefault("extra", {})["definite"] = False
        if result.has(sympy.Integral):
            out.setdefault("notes", []).append("integral has no elementary closed form")
        return out
    if lower_raw is None or upper_raw is None:
        raise domain("definite integration needs both 'lower' and 'upper'")
    lower = parse_number(lower_raw, "lower")
    upper = parse_number(upper_raw, "upper")
    result = sympy.integrate(parsed, (var, lower, upper))
    out = _expr_from(parsed, result, str(args.get("expr")), notes=notes)
    out.setdefault("extra", {})["definite"] = True
    out["extra"]["lower"] = lower_raw
    out["extra"]["upper"] = upper_raw
    if result.has(sympy.Integral):
        out.setdefault("notes", []).append("definite integral could not be evaluated in closed form")
    return out


def op_limit(args):
    parsed = _parse(args)
    var = parse_var(args, "var", "x")
    point = parse_number(args.get("point", "0"), "point")
    direction = str(args.get("direction", "both")).strip().lower()
    direction_map = {"both": "+-", "two-sided": "+-", "+": "+", "right": "+", "-": "-", "left": "-"}
    if direction not in direction_map:
        raise bad_request("direction must be one of: both, +, -, left, right")
    result = sympy.limit(parsed, var, point, dir=direction_map[direction])
    out = _expr_from(parsed, result, str(args.get("expr")))
    out.setdefault("extra", {})["direction"] = direction
    out["extra"]["point"] = text(sympy.sstr(point))
    return out


def op_series(args):
    parsed = _parse(args)
    var = parse_var(args, "var", "x")
    point = parse_number(args.get("point", "0"), "point")
    order = parse_int_arg(args.get("order"), "order", 6, minimum=1, maximum=50)
    raw_series = sympy.series(parsed, var, point, order)
    result = raw_series.removeO() if hasattr(raw_series, "removeO") else raw_series
    out = _expr_from(parsed, result, str(args.get("expr")))
    out.setdefault("extra", {})["series"] = text(sympy.sstr(raw_series))
    out["extra"]["order"] = order
    return out


def op_sum(args):
    parsed = _parse(args)
    var = parse_var(args, "var", "n")
    lower = parse_number(args.get("lower", 0), "lower")
    upper = parse_number(args.get("upper", "oo"), "upper")
    result = sympy.summation(parsed, (var, lower, upper))
    out = _expr_from(parsed, result, str(args.get("expr")))
    out.setdefault("extra", {})["lower"] = text(sympy.sstr(lower))
    out["extra"]["upper"] = text(sympy.sstr(upper))
    if result.has(sympy.Sum):
        out.setdefault("notes", []).append("sum did not reduce to a closed form")
    return out


def op_product(args):
    parsed = _parse(args)
    var = parse_var(args, "var", "n")
    lower = parse_number(args.get("lower", 1), "lower")
    upper = parse_number(args.get("upper", "m"), "upper")
    result = sympy.product(parsed, (var, lower, upper))
    out = _expr_from(parsed, result, str(args.get("expr")))
    out.setdefault("extra", {})["lower"] = text(sympy.sstr(lower))
    out["extra"]["upper"] = text(sympy.sstr(upper))
    if result.has(sympy.Product):
        out.setdefault("notes", []).append("product did not reduce to a closed form")
    return out


_DOMAIN_FILTERS = {
    "real": lambda v: v.is_real is True,
    "complex": lambda v: True,
    "integer": lambda v: v.is_integer is True,
    "positive": lambda v: v.is_positive is True,
    "negative": lambda v: v.is_negative is True,
    "rational": lambda v: v.is_rational is True,
}


def op_solve(args):
    raw_equations = args.get("equations")
    if raw_equations is None:
        raw_equations = [args.get("equation")] if args.get("equation") else None
    if not isinstance(raw_equations, (list, tuple)) or not raw_equations:
        raise bad_request("'equations' must be a non-empty array of strings")
    if len(raw_equations) > 10:
        raise limit_error("at most 10 equations are supported")
    assumptions = _assumptions(args)
    equations = [parse_relation(raw, assumptions=assumptions) for raw in raw_equations]
    raw_vars = args.get("vars")
    if raw_vars:
        variables = parse_symbols(raw_vars)
    else:
        symbols = set()
        for eq in equations:
            symbols.update(eq.free_symbols)
        variables = sorted(symbols, key=lambda s: s.name)
        if not variables:
            raise domain("cannot infer variables to solve for")
    if len(variables) > 10:
        raise limit_error("at most 10 variables are supported")
    domain_name = args.get("domain")
    if domain_name is not None:
        domain_name = str(domain_name).strip().lower()
        if domain_name not in _DOMAIN_FILTERS:
            raise bad_request(f"unsupported domain {domain_name!r}; use real, complex, integer, positive, negative or rational")
    notes: list[str] = []
    try:
        solutions = sympy.solve(equations, variables, dict=True)
    except EngineError:
        raise
    except NotImplementedError as exc:
        raise unsupported(f"solve could not handle this system: {exc}") from exc
    except Exception as exc:
        raise domain(f"solve failed: {exc}") from exc
    if solutions is None:
        solutions = []
    # normalise into per-variable value lists
    values_by_var = {str(v): [] for v in variables}
    kept_dicts = []
    for solution in solutions:
        if not isinstance(solution, dict):
            continue
        if domain_name:
            predicate = _DOMAIN_FILTERS[domain_name]
            keep = True
            for v in variables:
                candidate = solution.get(v)
                if candidate is None:
                    continue
                try:
                    ok = predicate(candidate)
                except Exception:  # pragma: no cover - defensive
                    ok = False
                if not ok:
                    keep = False
                    break
            if not keep:
                continue
        kept_dicts.append({str(k): v for k, v in solution.items()})
        for v in variables:
            candidate = solution.get(v)
            values_by_var[str(v)].append(candidate)
    search_vars = variables
    if not search_vars:
        for sol in kept_dicts:
            for key in sol:
                search_vars.append(sympy.Symbol(key))
        search_vars = list(dict.fromkeys(search_vars))
    out_solutions = []
    for v in variables:
        vals = [expr_result(c) for c in values_by_var[str(v)]]
        out_solutions.append({"var": str(v), "values": vals})
    pretty_lines = []
    latex_parts = []
    for sol in kept_dicts:
        pieces = [f"{name} = {text(sympy.sstr(val))}" for name, val in sol.items()]
        pretty_lines.append("{" + ", ".join(pieces) + "}")
        latex_parts.append(
            "\\left\\{" + ",\\; ".join(
                f"{name} = {text(sympy.latex(val))}" for name, val in sol.items()
            ) + "\\right\\}"
        )
    if not kept_dicts:
        add_note(notes, "no solutions found" + (f" in domain {domain_name}" if domain_name else ""))
    return {
        "solutions": out_solutions,
        "solution_count": len(kept_dicts),
        "solutions_by_dict": [
            {name: text(sympy.sstr(val)) for name, val in sol.items()} for sol in kept_dicts
        ],
        "pretty": text("\n".join(pretty_lines)),
        "latex": text(", ".join(latex_parts)),
        "variables": [str(v) for v in variables],
        "notes": notes,
    }


def _parse_ode_side(source: str, func, var, local_symbols, func_name: str):
    # replace y', y'', ... with Derivative(...) where y is the target function;
    # a bare ``y`` stands for ``y(x)``.

    def _replace(match):
        base = match.group(1)
        count = len(match.group(2))
        return f"Derivative({base}({var}), {var}, {count})"

    bare = re.compile(rf"\b{re.escape(func_name)}\b(?!\s*[('])")
    source = bare.sub(f"{func_name}({var})", source)
    converted = re.sub(r"\b([A-Za-z_][A-Za-z0-9_]*)('+)", _replace, source)
    return parse_expression(converted, symbols=local_symbols, allow_calls=frozenset({func_name}))


def op_dsolve(args):
    raw_eq = args.get("eq")
    if not isinstance(raw_eq, str):
        raise bad_request("'eq' must be a string such as \"y'' + y = 0\"")
    if raw_eq.count("=") > 1:
        raise bad_request("equation must contain a single '='")
    func_name = args.get("func", "y")
    var_name = args.get("var", "x")
    if not isinstance(func_name, str) or not re.match(r"^[A-Za-z_][A-Za-z0-9_']{0,63}$", func_name):
        raise bad_request(f"invalid function name: {func_name!r}")
    var = parse_var({"var": var_name}, "var", "x")
    func = sympy.Function(func_name)
    local_symbols = {func_name: func, var_name: var}
    if "=" in raw_eq:
        lhs_text, rhs_text = raw_eq.split("=", 1)
        lhs = _parse_ode_side(lhs_text, func, var, local_symbols, func_name)
        rhs = _parse_ode_side(rhs_text, func, var, local_symbols, func_name)
        equation = sympy.Eq(lhs, rhs)
    else:
        lhs = _parse_ode_side(raw_eq, func, var, local_symbols, func_name)
        equation = sympy.Eq(lhs, 0)
    notes: list[str] = []
    ics_arg = args.get("ics")
    ics = None
    if ics_arg:
        if not isinstance(ics_arg, list):
            raise bad_request("'ics' must be an array such as [{\"x\":0,\"y\":1}]")
        ics = {}
        for item in ics_arg:
            if not isinstance(item, dict):
                raise bad_request("each initial condition must be an object")
            at_raw = item.get("x", item.get("at", 0))
            at = parse_number(at_raw, "initial condition point")
            for key, value in item.items():
                if key in ("x", "at"):
                    continue
                key = str(key)
                if key == func_name:
                    lhs_ic = func(at)
                else:
                    match = re.match(r"^d(\d*)(.+)$", key)
                    if not match or match.group(2) != func_name:
                        raise bad_request(f"unsupported initial condition key: {key!r}")
                    order = int(match.group(1) or 1)
                    lhs_ic = sympy.Subs(sympy.Derivative(func(var), var, order), var, at)
                ics[lhs_ic] = parse_number(value, f"initial condition {key}")
    try:
        raw_solution = sympy.dsolve(equation, func(var), ics=ics)
    except EngineError:
        raise
    except NotImplementedError as exc:
        raise unsupported(f"dsolve could not handle this equation: {exc}") from exc
    except Exception as exc:
        raise domain(f"dsolve failed: {exc}") from exc
    solutions = raw_solution if isinstance(raw_solution, list) else [raw_solution]
    if not solutions:
        raise domain("dsolve returned no solution")
    first = solutions[0]
    rhs_expr = first.rhs if isinstance(first, sympy.Eq) else first
    try:
        order = sympy.ode_order(equation, func(var))
    except Exception:  # pragma: no cover - defensive
        order = None
    classification = []
    try:
        classification = [hint for hint in sympy.classify_ode(equation, func(var)) if hint][:8]
    except Exception:  # pragma: no cover - classification is best-effort
        classification = []
    if len(solutions) > 1:
        add_note(notes, f"{len(solutions)} solution families returned; showing the first")
    result = {
        "solution": text(sympy.sstr(rhs_expr)),
        "equation": text(sympy.sstr(first)),
        "latex": text(sympy.latex(rhs_expr)),
        "pretty": text(sympy.pretty(rhs_expr)),
        "order": order,
        "classification": classification,
        "notes": notes,
    }
    if len(solutions) > 1:
        result["other_solutions"] = [text(sympy.sstr(sol)) for sol in solutions[1:]]
    return result


def op_approx(args):
    parsed = _parse(args)
    subs_arg = args.get("subs") or {}
    if not isinstance(subs_arg, dict):
        raise bad_request("'subs' must be an object mapping variables to values")
    substitutions = {}
    for name, value in subs_arg.items():
        if not isinstance(name, str):
            raise bad_request("substitution keys must be symbol names")
        symbol = sympy.Symbol(name)
        substitutions[symbol] = parse_number(value, f"subs[{name}]")
    digits = parse_int_arg(args.get("digits"), "digits", 15, minimum=1, maximum=50)
    substituted = parsed.subs(substitutions)
    value = sympy.N(substituted, digits)
    out = {"value": text(sympy.sstr(value)), "latex": text(sympy.latex(value))}
    if value.is_complex and not value.is_real:
        out["complex"] = text(sympy.sstr(value))
    out.setdefault("notes", [])
    if substituted.free_symbols:
        add_note(out["notes"], "result still contains free symbols: " + ", ".join(sorted(str(s) for s in substituted.free_symbols)))
    if not out["notes"]:
        out.pop("notes")
    return out


# ---------------------------------------------------------------------------
# calc.matrix
# ---------------------------------------------------------------------------


def op_matrix(args):
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    matrix = None
    if args.get("matrix") is not None:
        matrix = parse_matrix_arg(args.get("matrix"))
        guard_matrix(matrix)
    if matrix is None:
        raise bad_request("missing required argument: matrix")
    rhs_arg = args.get("rhs")
    if op == "det":
        if matrix.rows != matrix.cols:
            raise domain("determinant requires a square matrix")
        return {"op": op, "value": expr_result(matrix.det())}
    if op == "inv":
        if matrix.rows != matrix.cols:
            raise domain("inverse requires a square matrix")
        if matrix.det() == 0:
            raise domain("matrix is singular (det = 0)")
        inverse = matrix.inv()
        return {
            "op": op,
            "value": expr_result(inverse),
            "matrix": matrix_to_strings(inverse),
            "det": text(sympy.sstr(matrix.det())),
        }
    if op == "rank":
        return {"op": op, "rank": int(matrix.rank()), "value": int(matrix.rank())}
    if op == "rref":
        reduced, pivots = matrix.rref()
        return {
            "op": op,
            "matrix": matrix_to_strings(reduced),
            "rank": int(reduced.rank()),
            "pivots": [int(p) for p in pivots],
        }
    if op == "transpose":
        return {"op": op, "matrix": matrix_to_strings(matrix.T)}
    if op == "charpoly":
        expression = matrix.charpoly().as_expr()
        value = expr_result(expression)
        return {
            "op": op,
            "value": value,
            "result": value["result"],
            "latex": value["latex"],
            "variable": str(matrix.charpoly().gens[0]),
        }
    if op == "eigen":
        try:
            eigenvals = matrix.eigenvals()
        except Exception as exc:
            raise unsupported(f"exact eigenvalues unavailable: {exc}") from exc
        values = []
        for value, multiplicity in eigenvals.items():
            item = expr_result(value)
            item["multiplicity"] = int(multiplicity)
            values.append(item)
        try:
            raw_vectors = matrix.eigenvects()
        except Exception:  # pragma: no cover - defensive
            raw_vectors = []
        vectors = []
        for value, multiplicity, basis in raw_vectors:
            for vector in basis:
                vectors.append([text(sympy.sstr(vector[i])) for i in range(vector.rows)])
        pretty = text(sympy.sstr(eigenvals))
        return {"op": op, "values": values, "vectors": vectors, "pretty": pretty}
    if op == "nullspace":
        basis = matrix.nullspace()
        return {
            "op": op,
            "basis": [[text(sympy.sstr(v[i])) for i in range(v.rows)] for v in basis],
            "dimension": len(basis),
        }
    if op == "solve":
        if rhs_arg is None:
            raise bad_request("'rhs' is required for matrix solve")
        rhs = parse_matrix_arg([[x] for x in rhs_arg], "rhs") if isinstance(rhs_arg, (list, tuple)) else None
        if rhs is None:
            raise bad_request("'rhs' must be an array of values")
        if rhs.rows != matrix.rows:
            raise domain("rhs length must equal the number of matrix rows")
        solution_set = sympy.linsolve((matrix, rhs))
        solution_rows = []
        for solution in solution_set:
            solution_rows.append([expr_result(value) for value in solution])
        if not solution_rows:
            raise domain("linear system is inconsistent (no solution)")
        return {"op": op, "solution": solution_rows, "solutions": len(solution_rows)}
    if op == "lstsq":
        if rhs_arg is None:
            raise bad_request("'rhs' is required for least squares")
        rhs = parse_matrix_arg([[x] for x in rhs_arg], "rhs")
        if rhs.rows != matrix.rows:
            raise domain("rhs length must equal the number of matrix rows")
        solution = matrix.solve_least_squares(rhs)
        return {
            "op": op,
            "solution": [expr_result(solution[i]) for i in range(solution.rows)],
            "matrix": matrix_to_strings(solution),
        }
    if op == "svd":
        try:
            u, s, v = matrix.singular_value_decomposition()
        except Exception as exc:
            raise unsupported(f"singular value decomposition unavailable: {exc}") from exc
        return {
            "op": op,
            "U": matrix_to_strings(u),
            "S": [text(sympy.sstr(s[i, i])) for i in range(min(s.rows, s.cols))],
            "V": matrix_to_strings(v),
        }
    raise unsupported(f"unsupported matrix op: {op}")


# ---------------------------------------------------------------------------
# calc.vector
# ---------------------------------------------------------------------------


def _vector_components(args, key="components"):
    raw = args.get(key)
    if raw is None:
        raise bad_request(f"missing required argument: {key}")
    if not isinstance(raw, (list, tuple)) or not raw:
        raise bad_request(f"{key} must be a non-empty array of expression strings")
    if len(raw) > MAX_MATRIX_DIM:
        raise limit_error(f"vector dimension exceeds limit {MAX_MATRIX_DIM}")
    return [parse_number(cell, key) for cell in raw]


def op_vector(args):
    op = str(args.get("op", "")).strip().lower()
    vars_arg = args.get("vars") or args.get("coords") or ["x", "y", "z"]
    variables = parse_symbols(vars_arg)
    result = None
    vector = None
    if op == "grad":
        parsed = _parse(args)
        if len(variables) < 1:
            raise bad_request("gradient needs at least one variable")
        vector = [sympy.diff(parsed, v) for v in variables]
    elif op == "div":
        components = _vector_components(args)
        if len(components) != len(variables):
            raise domain("divergence needs one component per variable")
        result = sum(sympy.diff(components[i], variables[i]) for i in range(len(variables)))
        result = sympy.simplify(result)
    elif op == "curl":
        components = _vector_components(args)
        if len(components) != 3 or len(variables) != 3:
            raise domain("curl needs three components and three variables")
        x1, x2, x3 = variables
        c1, c2, c3 = components
        result = sympy.Matrix([
            sympy.diff(c3, x2) - sympy.diff(c2, x3),
            sympy.diff(c1, x3) - sympy.diff(c3, x1),
            sympy.diff(c2, x1) - sympy.diff(c1, x2),
        ])
        vector = [result[i] for i in range(3)]
    elif op == "dot":
        first = _vector_components(args)
        second = _vector_components(args, "other")
        if len(first) != len(second):
            raise domain("dot product needs vectors of equal length")
        result = sympy.simplify(sum(a * b for a, b in zip(first, second)))
    elif op == "cross":
        first = _vector_components(args)
        second = _vector_components(args, "other")
        if len(first) != 3 or len(second) != 3:
            raise domain("cross product needs two 3-component vectors")
        vector = list(sympy.Matrix(first).cross(sympy.Matrix(second)))
    elif op == "norm":
        if args.get("components") is not None:
            components = _vector_components(args)
        else:
            parsed = _parse(args)
            components = [parsed]
        result = sympy.sqrt(sympy.simplify(sum(c * c for c in components)))
    elif op == "laplacian":
        parsed = _parse(args)
        result = sympy.simplify(sum(sympy.diff(parsed, v, 2) for v in variables))
    else:
        raise unsupported(f"unsupported vector op: {op}")
    if vector is not None:
        return {
            "op": op,
            "vector": [expr_result(component) for component in vector],
            "components": [text(sympy.sstr(component)) for component in vector],
        }
    out = {"op": op, "result": expr_result(result)}
    out["value"] = out["result"]["result"]
    return out


# ---------------------------------------------------------------------------
# calc.number / calc.ntheory
# ---------------------------------------------------------------------------


def _arg_number(args, *names, required=True):
    for name in names:
        if args.get(name) is not None:
            return parse_number(args[name], name)
    if required:
        raise bad_request(f"missing required argument: {' or '.join(names)}")
    return None


def op_number(args):
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    if op == "factorint":
        n = parse_int_arg(_arg_number(args, "n"), "n")
        if n == 0:
            raise domain("factorint(0) is undefined")
        if abs(n) > 10**12:
            raise limit_error("factorint supports |n| <= 10^12")
        factors = sympy.factorint(abs(n))
        pairs = [[int(p), int(e)] for p, e in sorted(factors.items())]
        return {"op": op, "n": n, "value": pairs, "factors": pairs}
    if op == "isprime":
        n = parse_int_arg(_arg_number(args, "n"), "n")
        return {"op": op, "n": n, "value": bool(sympy.isprime(n))}
    if op == "primes":
        if args.get("count") is not None or args.get("k") is not None:
            count = parse_int_arg(args.get("count", args.get("k")), "count", 10, minimum=1, maximum=1000)
        else:
            count = parse_int_arg(args.get("n"), "n", 10, minimum=1, maximum=1000)
        primes = list(sympy.primerange(1, max(15, count * 20)))
        while len(primes) < count:
            primes = list(sympy.primerange(1, primes[-1] * 2 if primes else 20))
        values = [int(p) for p in primes[:count]]
        return {"op": op, "count": len(values), "primes": values, "value": values}
    if op == "totient":
        n = parse_int_arg(_arg_number(args, "n"), "n", minimum=1)
        return {"op": op, "n": n, "value": int(sympy.totient(n))}
    if op == "divisors":
        n = parse_int_arg(_arg_number(args, "n"), "n", minimum=1)
        if n > 10**7:
            raise limit_error("divisors supports n <= 10^7")
        return {"op": op, "n": n, "value": [int(d) for d in sympy.divisors(n)]}
    if op in ("gcd", "lcm"):
        a = parse_int_arg(_arg_number(args, "n", "a"), "n")
        b = parse_int_arg(_arg_number(args, "k", "b"), "k")
        value = sympy.gcd(a, b) if op == "gcd" else sympy.lcm(a, b)
        return {"op": op, "a": a, "b": b, "value": int(value)}
    if op == "modinv":
        n = parse_int_arg(_arg_number(args, "n", "a"), "n")
        modulus = parse_int_arg(args.get("modulus", args.get("m")), "modulus", minimum=2)
        try:
            value = sympy.mod_inverse(n, modulus)
        except Exception as exc:
            raise domain(f"no modular inverse: {exc}") from exc
        return {"op": op, "n": n, "modulus": modulus, "value": int(value % modulus)}
    if op == "crt":
        residues = args.get("residues")
        moduli = args.get("moduli")
        pairs = args.get("pairs")
        if pairs:
            if not isinstance(pairs, (list, tuple)) or not pairs:
                raise bad_request("'pairs' must be an array of [residue, modulus] pairs")
            residues = [p[0] for p in pairs]
            moduli = [p[1] for p in pairs]
        if not isinstance(residues, (list, tuple)) or not isinstance(moduli, (list, tuple)):
            raise bad_request("crt needs 'pairs' or 'residues' and 'moduli'")
        if len(residues) != len(moduli) or not residues:
            raise domain("crt needs paired residues and moduli")
        if len(residues) > 20:
            raise limit_error("crt supports at most 20 congruences")
        res = [parse_int_arg(r, "residue") for r in residues]
        mods = [parse_int_arg(m, "modulus", minimum=2) for m in moduli]
        solution, combined = _sympy_crt(mods, res)
        if solution is None:
            raise domain("crt system is inconsistent")
        return {
            "op": op,
            "value": int(solution),
            "modulus": int(combined),
            "residues": res,
            "moduli": mods,
        }
    if op == "fibonacci":
        n = parse_int_arg(_arg_number(args, "n"), "n", minimum=0, maximum=10**6)
        return {"op": op, "n": n, "value": int(sympy.fibonacci(n))}
    if op == "binomial":
        n = parse_int_arg(_arg_number(args, "n"), "n", minimum=0, maximum=10**6)
        k = parse_int_arg(_arg_number(args, "k"), "k", minimum=0, maximum=10**6)
        return {"op": op, "n": n, "k": k, "value": int(sympy.binomial(n, k))}
    if op == "sigma":
        n = parse_int_arg(_arg_number(args, "n"), "n", minimum=1, maximum=10**7)
        k = parse_int_arg(args.get("k"), "k", 1, minimum=0, maximum=10)
        return {"op": op, "n": n, "k": k, "value": int(sympy.divisor_sigma(n, k))}
    if op == "mobius":
        n = parse_int_arg(_arg_number(args, "n"), "n", minimum=1, maximum=10**12)
        return {"op": op, "n": n, "value": int(sympy.mobius(n))}
    raise unsupported(f"unsupported number theory op: {op}")


# ---------------------------------------------------------------------------
# handler registry
# ---------------------------------------------------------------------------

HANDLERS = {
    "calc.simplify": op_simplify,
    "calc.expand": op_expand,
    "calc.factor": op_factor,
    "calc.apart": op_apart,
    "calc.cancel": op_cancel,
    "calc.trigsimp": op_trigsimp,
    "calc.rationalize": op_rationalize,
    "calc.powdenest": op_powdenest,
    "calc.diff": op_diff,
    "calc.integrate": op_integrate,
    "calc.limit": op_limit,
    "calc.series": op_series,
    "calc.sum": op_sum,
    "calc.product": op_product,
    "calc.solve": op_solve,
    "calc.dsolve": op_dsolve,
    "calc.approx": op_approx,
    "calc.matrix": op_matrix,
    "calc.vector": op_vector,
    "calc.number": op_number,
    "calc.ntheory": op_number,
}
