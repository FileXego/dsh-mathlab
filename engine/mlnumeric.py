"""Numerical, probability, optimization and graph ops.

Groups: ``num.*``, ``prob.*``, ``opt.*`` and ``graph.*`` (docs/API.md §numerics).
"""

from __future__ import annotations

import math

import numpy as np
import networkx as nx
import scipy.integrate
import scipy.optimize
import scipy.stats
import sympy

from mlcore import (
    EngineError,
    bad_request,
    domain,
    limit_error,
    parse_expression,
    parse_int_arg,
    parse_number,
    parse_symbols,
    parse_var,
    sanitize,
    text,
    truncate,
    unsupported,
)

MAX_GRAPH_NODES = 2000
MAX_GRAPH_EDGES = 20000
MAX_ODE_SAMPLES = 5000


# ---------------------------------------------------------------------------
# shared helpers
# ---------------------------------------------------------------------------


def _json_number(value, what: str = "value"):
    if value is None:
        return None
    if isinstance(value, sympy.Basic):
        return text(sympy.sstr(value))
    if isinstance(value, complex):
        return sanitize(value)
    try:
        number = float(value)
    except (TypeError, ValueError):
        return sanitize(value)
    if math.isnan(number):
        return None
    if math.isinf(number):
        return "oo" if number > 0 else "-oo"
    if number.is_integer():
        return int(number)
    return number


def _range_arg(raw, name: str = "range") -> tuple[float, float]:
    if not isinstance(raw, (list, tuple)) or len(raw) != 2:
        raise bad_request(f"'{name}' must be a two-element [min, max] array")
    start = float(parse_number(raw[0], name))
    end = float(parse_number(raw[1], name))
    if start == end:
        raise domain(f"'{name}' endpoints must differ")
    if start > end:
        start, end = end, start
    return start, end


def _make_function(expression, symbols):
    try:
        return sympy.lambdify(symbols, expression, modules=["numpy", "math"])
    except Exception as exc:  # pragma: no cover - defensive
        raise unsupported(f"could not compile expression numerically: {exc}") from exc


def _evaluate_scalar(function, arguments):
    try:
        with np.errstate(all="ignore"):
            value = function(*arguments)
    except Exception as exc:
        raise domain(f"numeric evaluation failed: {exc}") from exc
    try:
        array = np.asarray(value, dtype=float)
    except (TypeError, ValueError) as exc:
        raise domain(f"expression did not evaluate to a real number: {exc}") from exc
    if array.ndim == 0:
        return float(array)
    return array


# ---------------------------------------------------------------------------
# num.*
# ---------------------------------------------------------------------------


def num_root(args: dict) -> dict:
    parsed = parse_expression(args.get("expr"))
    var = parse_var(args, "var", "x")
    bracket = args.get("bracket")
    if not isinstance(bracket, (list, tuple)) or len(bracket) != 2:
        raise bad_request("'bracket' must be [a, b]")
    left = float(parse_number(bracket[0], "bracket"))
    right = float(parse_number(bracket[1], "bracket"))
    if left == right:
        raise domain("bracket endpoints must differ")
    if left > right:
        left, right = right, left
    function = _make_function(parsed, [var])
    f_left = _evaluate_scalar(function, [left])
    f_right = _evaluate_scalar(function, [right])
    if not math.isfinite(f_left) or not math.isfinite(f_right):
        raise domain("expression is not finite at the bracket endpoints")
    if f_left == 0.0:
        return {"root": _json_number(left), "value": 0, "iterations": 0, "method": "brentq", "bracket": [left, right]}
    if f_right == 0.0:
        return {"root": _json_number(right), "value": 0, "iterations": 0, "method": "brentq", "bracket": [left, right]}
    if f_left * f_right > 0:
        raise domain(
            f"function has the same sign at both bracket endpoints (f({left:g}) = {f_left:g}, "
            f"f({right:g}) = {f_right:g}); provide a bracket containing a sign change"
        )
    try:
        root, results = scipy.optimize.brentq(
            lambda value: float(_evaluate_scalar(function, [value])),
            left,
            right,
            xtol=1e-14,
            rtol=1e-14,
            maxiter=200,
            full_output=True,
        )
    except (ValueError, RuntimeError) as exc:
        raise domain(f"root finding failed: {exc}") from exc
    value = _evaluate_scalar(function, [root])
    return {
        "root": _json_number(root),
        "value": _json_number(value),
        "iterations": int(getattr(results, "iterations", 0)),
        "method": "brentq",
        "bracket": [left, right],
    }


def num_integrate(args: dict) -> dict:
    parsed = parse_expression(args.get("expr"))
    var = parse_var(args, "var", "x")
    lower, upper = _range_arg(args.get("range"), "range")
    method = str(args.get("method", "quad")).strip().lower()
    function = _make_function(parsed, [var])
    if method not in ("quad", "adaptive", "gauss"):
        raise unsupported(f"unsupported numerical integration method {method!r}; use 'quad'")
    try:
        value, error = scipy.integrate.quad(
            lambda t: float(_evaluate_scalar(function, [t])),
            lower,
            upper,
            epsabs=1e-12,
            epsrel=1e-12,
            limit=200,
        )
    except (ValueError, RuntimeError) as exc:
        raise domain(f"numerical integration failed: {exc}") from exc
    if not math.isfinite(value):
        raise domain("numerical integral did not converge to a finite value")
    notes = []
    if error is not None and math.isfinite(error) and abs(error) > 1e-6 * max(1.0, abs(value)):
        notes.append(f"estimated absolute error is {error:g}")
    return {
        "value": _json_number(value),
        "error": _json_number(error),
        "method": "quad",
        "range": [lower, upper],
        **({"note": " | ".join(notes)} if notes else {}),
    }


def num_ode(args: dict) -> dict:
    raw_rhs = args.get("rhs")
    if isinstance(raw_rhs, str):
        rhs_list = [raw_rhs]
    elif isinstance(raw_rhs, (list, tuple)) and raw_rhs and all(isinstance(item, str) for item in raw_rhs):
        rhs_list = list(raw_rhs)
    else:
        raise bad_request("'rhs' must be an expression string or an array of expression strings")
    dimension = len(rhs_list)
    time_name = args.get("tVar") or args.get("timeVar") or "t"
    if not isinstance(time_name, str) or not time_name.isidentifier():
        raise bad_request("invalid time variable name")
    state_names = args.get("stateVars")
    if state_names is None:
        state_names = ["y"] if dimension == 1 else [f"y{i + 1}" for i in range(dimension)]
    if not isinstance(state_names, list) or len(state_names) != dimension or not all(
        isinstance(name, str) and name.isidentifier() for name in state_names
    ):
        raise bad_request(f"'stateVars' must be {dimension} valid symbol names")
    symbols = [sympy.Symbol(time_name)] + [sympy.Symbol(name) for name in state_names]
    expressions = [parse_expression(source, symbols={symbol.name: symbol for symbol in symbols}) for source in rhs_list]
    functions = [_make_function(expression, symbols) for expression in expressions]
    y0_raw = args.get("y0")
    if y0_raw is None:
        raise bad_request("'y0' is required")
    if not isinstance(y0_raw, (list, tuple)):
        y0_raw = [y0_raw]
    if len(y0_raw) != dimension:
        raise domain(f"'y0' must have {dimension} component(s)")
    y0 = [float(parse_number(value, "y0")) for value in y0_raw]
    start, end = _range_arg(args.get("tRange"), "tRange")
    if start > end:
        start, end = end, start
    method = str(args.get("method", "RK45")).strip()
    allowed = {"RK45", "RK23", "DOP853", "Radau", "BDF", "LSODA"}
    if method not in allowed:
        raise unsupported(f"unsupported ODE method {method!r}; use one of {sorted(allowed)}")
    samples = parse_int_arg(args.get("samples"), "samples", 201, minimum=2, maximum=MAX_ODE_SAMPLES)

    def derivative(t, state):
        return np.array([float(function(t, *state)) for function in functions], dtype=float)

    t_eval = np.linspace(start, end, samples)
    try:
        solution = scipy.integrate.solve_ivp(
            derivative,
            (start, end),
            np.array(y0, dtype=float),
            method=method,
            t_eval=t_eval,
            rtol=1e-8,
            atol=1e-10,
        )
    except (ValueError, RuntimeError) as exc:
        raise domain(f"ODE integration failed: {exc}") from exc
    if not solution.success:
        raise domain(f"ODE integration failed: {solution.message}")
    series = [[_json_number(value) for value in row] for row in solution.y.T]
    result = {
        "t": [_json_number(value) for value in solution.t],
        "y": [row[0] for row in series] if dimension == 1 else series,
        "dim": dimension,
        "method": method,
        "success": bool(solution.success),
        "message": str(solution.message),
        "stateVars": state_names,
        "tVar": time_name,
    }
    if dimension == 1:
        result["y"] = [row[0] for row in series]
    return result


# ---------------------------------------------------------------------------
# prob.*
# ---------------------------------------------------------------------------

_DIST_ALIASES = {
    "normal": "norm",
    "gaussian": "norm",
    "binomial": "binom",
    "poisson": "poisson",
    "exponential": "expon",
    "uniform": "uniform",
    "beta": "beta",
    "gamma": "gamma",
    "chi2": "chi2",
    "chi-square": "chi2",
    "chi_squared": "chi2",
    "t": "t",
    "student": "t",
    "f": "f",
}


def _distribution(dist_name: str, params):
    if not isinstance(params, dict):
        raise bad_request("'params' must be an object")
    key = _DIST_ALIASES.get(str(dist_name).strip().lower())
    if key is None:
        raise unsupported(f"unsupported distribution {dist_name!r}")
    values = {}
    lowered = {str(name).strip().lower(): value for name, value in params.items()}

    def take(*names, default=None):
        for name in names:
            if name in lowered:
                return lowered[name]
        return default

    if key == "norm":
        location = take("mu", "mean", "loc", default=0)
        scale = take("sigma", "std", "sd", "scale", default=1)
        values = {"loc": float(parse_number(location, "mu")), "scale": float(parse_number(scale, "sigma"))}
    elif key == "binom":
        count = take("n", "trials")
        probability = take("p", "prob", "probability")
        if count is None or probability is None:
            raise bad_request("binomial needs params {n, p}")
        values = {"n": parse_int_arg(count, "n", minimum=1, maximum=10**9), "p": float(parse_number(probability, "p"))}
        if not 0.0 <= values["p"] <= 1.0:
            raise domain("binomial p must be between 0 and 1")
    elif key == "poisson":
        mu = take("mu", "lambda", "lam", "rate")
        if mu is None:
            raise bad_request("poisson needs params {mu}")
        values = {"mu": float(parse_number(mu, "mu"))}
    elif key == "expon":
        rate = take("rate", "lambda", "lam")
        scale = take("scale", "beta")
        if rate is not None:
            values = {"scale": 1.0 / float(parse_number(rate, "rate"))}
        elif scale is not None:
            values = {"scale": float(parse_number(scale, "scale"))}
        else:
            raise bad_request("exponential needs params {rate} or {scale}")
    elif key == "uniform":
        low = take("a", "low", "loc", default=0)
        high = take("b", "high")
        scale = take("scale")
        low_value = float(parse_number(low, "a"))
        if high is not None:
            high_value = float(parse_number(high, "b"))
            values = {"loc": low_value, "scale": high_value - low_value}
        elif scale is not None:
            values = {"loc": low_value, "scale": float(parse_number(scale, "scale"))}
        else:
            raise bad_request("uniform needs params {a, b} or {loc, scale}")
        if values["scale"] <= 0:
            raise domain("uniform scale must be positive")
    elif key == "beta":
        a = take("a", "alpha", "shape1")
        b = take("b", "beta", "shape2")
        if a is None or b is None:
            raise bad_request("beta needs params {a, b}")
        values = {"a": float(parse_number(a, "a")), "b": float(parse_number(b, "b"))}
    elif key == "gamma":
        shape = take("a", "k", "shape", "alpha")
        scale = take("scale", "theta", default=1)
        if shape is None:
            raise bad_request("gamma needs params {a, scale}")
        values = {"a": float(parse_number(shape, "a")), "scale": float(parse_number(scale, "scale"))}
    elif key == "chi2":
        df = take("df", "k", "n")
        if df is None:
            raise bad_request("chi2 needs params {df}")
        values = {"df": float(parse_number(df, "df"))}
    elif key == "t":
        df = take("df", "n")
        if df is None:
            raise bad_request("t needs params {df}")
        values = {"df": float(parse_number(df, "df"))}
    elif key == "f":
        dfn = take("dfn", "df1", "d1")
        dfd = take("dfd", "df2", "d2")
        if dfn is None or dfd is None:
            raise bad_request("f needs params {dfn, dfd}")
        values = {"dfn": float(parse_number(dfn, "dfn")), "dfd": float(parse_number(dfd, "dfd"))}
    return getattr(scipy.stats, key)(**values), key, values


def prob_dist(args: dict) -> dict:
    dist_name = args.get("dist")
    if not isinstance(dist_name, str):
        raise bad_request("'dist' is required (e.g. normal, binomial, poisson)")
    distribution, key, values = _distribution(dist_name, args.get("params"))
    op = str(args.get("op", "pdf")).strip().lower()
    mean = None
    variance = None
    try:
        mean_value = distribution.mean()
        variance_value = distribution.var()
        mean = _json_number(mean_value) if mean_value is not None else None
        variance = _json_number(variance_value) if variance_value is not None else None
    except Exception:  # pragma: no cover - some distributions lack moments
        pass
    result = {"dist": key, "params": values, "op": op, "mean": mean, "variance": variance}
    x_raw = args.get("x")
    if op in ("mean", "variance", "std"):
        if op == "mean":
            result["value"] = mean
        elif op == "variance":
            result["value"] = variance
        else:
            try:
                result["value"] = _json_number(distribution.std())
            except Exception:  # pragma: no cover
                result["value"] = None
        return result
    if op == "support":
        try:
            low, high = distribution.support()
            result["value"] = [_json_number(low), _json_number(high)]
        except Exception as exc:  # pragma: no cover
            raise domain(f"support unavailable: {exc}") from exc
        return result
    if op == "sample":
        size = args.get("n", args.get("size", 10))
        size = parse_int_arg(size, "n", 10, minimum=1, maximum=10000)
        try:
            samples = distribution.rvs(size=size)
        except Exception as exc:  # pragma: no cover
            raise domain(f"sampling failed: {exc}") from exc
        result["value"] = [_json_number(value) for value in np.atleast_1d(samples)]
        return result
    if op not in ("pdf", "pmf", "cdf", "sf", "ppf", "isf", "logpdf", "logpmf", "hazard"):
        raise unsupported(f"unsupported distribution op {op!r}")
    if x_raw is None:
        raise bad_request(f"'{op}' requires 'x'")
    if isinstance(x_raw, (list, tuple)):
        points = [float(parse_number(value, "x")) for value in x_raw]
        values_out = []
        for point in points:
            values_out.append(_apply_dist_op(distribution, op, point))
        result["value"] = values_out
        result["x"] = points
        return result
    point = float(parse_number(x_raw, "x"))
    if op == "ppf" and not 0.0 <= point <= 1.0:
        raise domain("ppf requires x in [0, 1]")
    result["value"] = _apply_dist_op(distribution, op, point)
    result["x"] = point
    return result


def _apply_dist_op(distribution, op: str, point: float):
    try:
        if op in ("pdf", "pmf"):
            value = distribution.pmf(point) if hasattr(distribution.dist, "pmf") and distribution.dist.name in (
                "binom", "poisson"
            ) else distribution.pdf(point)
        elif op == "cdf":
            value = distribution.cdf(point)
        elif op == "sf":
            value = distribution.sf(point)
        elif op == "isf":
            value = distribution.isf(point)
        elif op == "ppf":
            value = distribution.ppf(point)
        elif op == "logpdf":
            value = distribution.logpdf(point)
        elif op == "logpmf":
            value = distribution.logpmf(point)
        elif op == "hazard":
            value = distribution.pdf(point) / distribution.sf(point)
        else:  # pragma: no cover - validated above
            raise unsupported(f"unsupported distribution op {op!r}")
    except Exception as exc:
        raise domain(f"distribution evaluation failed: {exc}") from exc
    return _json_number(value)


_PER_CASE = {
    "norm": (sympy.Symbol("mu"), sympy.Symbol("sigma")),
    "expon": (sympy.Symbol("rate"),),
    "uniform": (sympy.Symbol("a"), sympy.Symbol("b")),
    "gamma": (sympy.Symbol("a"), sympy.Symbol("scale")),
    "beta": (sympy.Symbol("a"), sympy.Symbol("b")),
}


def prob_expectation(args: dict) -> dict:
    expr_text = args.get("expr")
    parsed = parse_expression(expr_text)
    x = sympy.Symbol("x")
    free = {str(symbol) for symbol in parsed.free_symbols}
    if free - {"x"}:
        raise domain(f"expectation expression may only use the variable x (got {sorted(free)})")
    dist_name = args.get("dist")
    if not isinstance(dist_name, str):
        raise bad_request("'dist' is required")
    distribution, key, values = _distribution(dist_name, args.get("params"))
    # numeric expectation over the support
    numeric = None
    symbolic = None
    try:
        if key in ("binom", "poisson"):
            if key == "binom":
                n = int(values["n"])
                p = values["p"]
                mean_k = n * p
                spread = max(1.0, math.sqrt(max(n * p * (1 - p), 0.0)))
                function = sympy.lambdify(x, parsed, modules=["math", "numpy"])
                total = 0.0
                for k in range(0, n + 1):
                    weight = float(distribution.pmf(k))
                    if weight == 0.0:
                        continue
                    total += float(function(k)) * weight
                numeric = total
            else:
                function = sympy.lambdify(x, parsed, modules=["math", "numpy"])
                lower = 0
                upper = int(values["mu"] + 12 * math.sqrt(values["mu"]) + 20)
                total = 0.0
                for k in range(lower, upper + 1):
                    weight = float(distribution.pmf(k))
                    total += float(function(k)) * weight
                numeric = total
        else:
            low, high = distribution.support()
            low = float(low) if np.isfinite(low) else -np.inf
            high = float(high) if np.isfinite(high) else np.inf
            function = _make_function(parsed, [x])
            numeric, _error = scipy.integrate.quad(
                lambda t: float(function(t)) * float(distribution.pdf(t)),
                low,
                high,
                limit=200,
            )
        if numeric is not None and not math.isfinite(float(numeric)):
            numeric = None
    except Exception as exc:
        raise domain(f"numeric expectation failed: {exc}") from exc
    # best-effort symbolic expectation for smooth densities
    if key in _PER_CASE and sympy.count_ops(parsed) <= 60:
        try:
            substitutions = {}
            if key == "norm":
                mu, sigma = _PER_CASE[key]
                density = sympy.exp(-((x - mu) ** 2) / (2 * sigma ** 2)) / (sympy.sqrt(2 * sympy.pi) * sigma)
                substitutions = {mu: values["loc"], sigma: values["scale"]}
                symbolic = sympy.integrate(parsed * density, (x, -sympy.oo, sympy.oo))
            elif key == "expon":
                (rate,) = _PER_CASE[key]
                density = rate * sympy.exp(-rate * x)
                substitutions = {rate: 1.0 / values["scale"]}
                symbolic = sympy.integrate(parsed * density, (x, 0, sympy.oo))
            elif key == "uniform":
                a, b = _PER_CASE[key]
                density = 1 / (b - a)
                substitutions = {a: values["loc"], b: values["loc"] + values["scale"]}
                symbolic = sympy.integrate(parsed * density, (x, a, b))
            elif key == "gamma":
                a, scale = _PER_CASE[key]
                from sympy import gamma as gamma_function
                density = x ** (a - 1) * sympy.exp(-x / scale) / (gamma_function(a) * scale ** a)
                substitutions = {a: values["a"], scale: values["scale"]}
                symbolic = sympy.integrate(parsed * density, (x, 0, sympy.oo))
            elif key == "beta":
                a, b = _PER_CASE[key]
                from sympy import gamma as gamma_function
                density = x ** (a - 1) * (1 - x) ** (b - 1) / (
                    gamma_function(a) * gamma_function(b) / gamma_function(a + b)
                )
                substitutions = {a: values["a"], b: values["b"]}
                symbolic = sympy.integrate(parsed * density, (x, 0, 1))
            if symbolic is not None and substitutions:
                symbolic = symbolic.subs(substitutions)
            if symbolic is not None and not symbolic.has(sympy.Integral):
                symbolic = sympy.simplify(symbolic)
            else:
                symbolic = None
        except Exception:
            symbolic = None
    result_text = text(sympy.sstr(symbolic)) if symbolic is not None else text(
        str(_json_number(numeric)) if numeric is not None else "nan"
    )
    result = {
        "input": truncate(str(expr_text)),
        "result": result_text,
        "pretty": truncate(sympy.pretty(symbolic) if symbolic is not None else result_text),
        "latex": truncate(sympy.latex(symbolic)) if symbolic is not None else "",
        "numeric": _json_number(numeric),
        "dist": key,
        "params": values,
        "evaluatedAt": "x",
    }
    if symbolic is not None and numeric is not None:
        result["approx"] = text(sympy.sstr(sympy.N(symbolic, 15)))
    return result


# ---------------------------------------------------------------------------
# opt.*
# ---------------------------------------------------------------------------


def opt_minimize(args: dict) -> dict:
    parsed = parse_expression(args.get("expr"))
    variables = parse_symbols(args.get("vars") or ["x", "y"])
    if len(variables) > 12:
        raise limit_error("at most 12 variables are supported")
    function = _make_function(parsed, variables)
    start_raw = args.get("start")
    if start_raw is None:
        start = [0.0] * len(variables)
    elif isinstance(start_raw, (list, tuple)):
        if len(start_raw) != len(variables):
            raise domain("'start' must have one value per variable")
        start = [float(parse_number(value, "start")) for value in start_raw]
    elif isinstance(start_raw, dict):
        start = [float(parse_number(start_raw.get(str(symbol), 0), "start")) for symbol in variables]
    else:
        raise bad_request("'start' must be an array or object")
    bounds = None
    bounds_raw = args.get("bounds")
    if bounds_raw is not None:
        if not isinstance(bounds_raw, (list, tuple)):
            raise bad_request("'bounds' must be an array of [min, max] pairs")
        bounds = []
        for item in bounds_raw:
            if item is None:
                bounds.append((None, None))
                continue
            if not isinstance(item, (list, tuple)) or len(item) != 2:
                raise bad_request("each bounds entry must be [min, max] or null")
            low = None if item[0] is None else float(parse_number(item[0], "bounds"))
            high = None if item[1] is None else float(parse_number(item[1], "bounds"))
            bounds.append((low, high))
        if len(bounds) != len(variables):
            raise domain("'bounds' must have one [min, max] pair per variable")
    method = args.get("method")
    if method is None:
        method = "L-BFGS-B" if bounds is not None else "BFGS"
    if not isinstance(method, str):
        raise bad_request("'method' must be a string")
    try:
        result = scipy.optimize.minimize(
            lambda values: float(_evaluate_scalar(function, list(values))),
            np.array(start, dtype=float),
            method=method,
            bounds=bounds,
        )
    except (ValueError, TypeError) as exc:
        raise domain(f"optimization failed: {exc}") from exc
    point = {}
    for symbol, value in zip(variables, result.x):
        point[str(symbol)] = _json_number(value)
    return {
        "point": point,
        "value": _json_number(result.fun),
        "method": method,
        "success": bool(result.success),
        "message": truncate(str(result.message)),
        "iterations": int(getattr(result, "nit", 0) or 0),
        "gradient_norm": _json_number(float(np.linalg.norm(result.jac)) if result.jac is not None else None),
    }


def opt_stationary(args: dict) -> dict:
    parsed = parse_expression(args.get("expr"))
    variables = parse_symbols(args.get("vars") or ["x", "y"])
    if len(variables) > 8:
        raise limit_error("at most 8 variables are supported")
    free = {str(symbol) for symbol in parsed.free_symbols}
    unknown = free - {str(symbol) for symbol in variables}
    if unknown:
        raise domain(f"expression contains variables not listed in 'vars': {sorted(unknown)}")
    equations = [sympy.Eq(sympy.diff(parsed, symbol), 0) for symbol in variables]
    for equation in equations:
        left = equation.lhs
        if not isinstance(left, (sympy.Expr,)):
            raise unsupported("stationary-point search needs a scalar expression")
    try:
        solutions = sympy.solve(equations, variables, dict=True)
    except EngineError:
        raise
    except NotImplementedError as exc:
        raise unsupported(f"symbolic stationary-point search failed: {exc}") from exc
    except Exception as exc:
        raise domain(f"symbolic stationary-point search failed: {exc}") from exc
    if solutions is None:
        solutions = []
    if len(solutions) > 25:
        raise limit_error(f"found {len(solutions)} stationary points; limit is 25")
    hessian_expression = sympy.Matrix(
        [[sympy.diff(parsed, first, second) for second in variables] for first in variables]
    )
    points = []
    for solution in solutions:
        full_solution = {symbol: solution.get(symbol, sympy.Integer(0)) for symbol in variables}
        hessian = hessian_expression.subs(full_solution)
        value = parsed.subs(full_solution)
        try:
            eigenvalues = [complex(sympy.N(value, 12)) for value in hessian.eigenvals().keys()]
        except Exception:  # pragma: no cover - fallback
            eigenvalues = []
        numeric_eigenvalues = []
        for eigenvalue in eigenvalues:
            if abs(eigenvalue.imag) > 1e-12:
                numeric_eigenvalues = []
                break
            numeric_eigenvalues.append(eigenvalue.real)
        if numeric_eigenvalues:
            if all(value > 1e-12 for value in numeric_eigenvalues):
                classification = "minimum"
            elif all(value < -1e-12 for value in numeric_eigenvalues):
                classification = "maximum"
            elif any(abs(value) <= 1e-12 for value in numeric_eigenvalues):
                classification = "degenerate"
            else:
                classification = "saddle"
        else:
            classification = "unknown"
        points.append(
            {
                "point": {str(symbol): text(sympy.sstr(full_solution[symbol])) for symbol in variables},
                "value": text(sympy.sstr(value)),
                "hessian": [
                    [text(sympy.sstr(hessian[i, j])) for j in range(hessian.cols)]
                    for i in range(hessian.rows)
                ],
                "classification": classification,
                "eigenvalues": [_json_number(value) for value in numeric_eigenvalues],
            }
        )
    return {"points": points, "count": len(points), "vars": [str(symbol) for symbol in variables]}


# ---------------------------------------------------------------------------
# graph.*
# ---------------------------------------------------------------------------


def _edge_weight(entry) -> float | None:
    if len(entry) >= 3:
        try:
            return float(parse_number(entry[2], "weight"))
        except Exception:
            raise bad_request("edge weights must be numbers")
    return None


def _build_graph(args: dict) -> tuple[nx.Graph, bool, bool]:
    edges = args.get("edges")
    if not isinstance(edges, list) or not edges:
        raise bad_request("'edges' must be a non-empty array")
    if len(edges) > MAX_GRAPH_EDGES:
        raise limit_error(f"at most {MAX_GRAPH_EDGES} edges are supported")
    directed = bool(args.get("directed", False))
    graph = nx.DiGraph() if directed else nx.Graph()
    weighted = False
    nodes = set()
    for index, entry in enumerate(edges):
        if not isinstance(entry, (list, tuple)) or len(entry) < 2:
            raise bad_request(f"edge {index} must be [u, v] or [u, v, w]")
        source = str(entry[0])
        target = str(entry[1])
        nodes.add(source)
        nodes.add(target)
        if len(nodes) > MAX_GRAPH_NODES:
            raise limit_error(f"graph exceeds {MAX_GRAPH_NODES} nodes")
        weight = _edge_weight(entry)
        if weight is None:
            if len(entry) >= 3:
                raise bad_request(f"edge {index} weight is invalid")
            graph.add_edge(source, target)
        else:
            weighted = True
            graph.add_edge(source, target, weight=weight)
    return graph, directed, weighted


def graph_analyze(args: dict) -> dict:
    graph, directed, weighted = _build_graph(args)
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    nodes = sorted(graph.nodes)
    if op == "components":
        if directed:
            groups = [sorted(component) for component in nx.weakly_connected_components(graph)]
            note = "weakly connected components (directed graph)"
        else:
            groups = [sorted(component) for component in nx.connected_components(graph)]
            note = None
        groups.sort(key=lambda group: (-len(group), group))
        result = {
            "count": len(groups),
            "components": groups,
            "sizes": [len(group) for group in groups],
            "nodeCount": len(nodes),
        }
        if note:
            result["note"] = note
        return result
    if op == "shortest_path":
        source = args.get("source")
        target = args.get("target")
        weight = args.get("weight", "weight" if weighted else None)
        if source is not None and target is not None:
            source, target = str(source), str(target)
            if source not in graph or target not in graph:
                raise domain("source/target must be nodes of the graph")
            try:
                path = nx.shortest_path(graph, source, target, weight=weight)
                length = nx.shortest_path_length(graph, source, target, weight=weight)
            except nx.NetworkXNoPath as exc:
                raise domain(f"no path from {source} to {target}") from exc
            return {
                "source": source,
                "target": target,
                "path": path,
                "length": _json_number(length),
                "weighted": weight is not None,
            }
        try:
            if directed:
                distances = {node: dict(nx.single_source_dijkstra_path_length(graph, node, weight=weight)) for node in nodes}
            else:
                distances = nx.all_pairs_dijkstra_path_length(graph, weight=weight)
                distances = {node: dict(values) for node, values in distances}
        except Exception as exc:  # pragma: no cover - defensive
            raise domain(f"shortest paths failed: {exc}") from exc
        return {
            "distances": {
                source: {target: _json_number(value) for target, value in targets.items()}
                for source, targets in distances.items()
            },
            "weighted": weight is not None,
        }
    if op == "spanning_tree":
        if directed:
            raise domain("spanning_tree is only defined for undirected graphs (set directed=false)")
        try:
            tree = nx.minimum_spanning_tree(graph)
        except Exception as exc:
            raise domain(f"spanning tree failed: {exc}") from exc
        edges = []
        for source, target, data in sorted(tree.edges(data=True)):
            entry = [source, target]
            if weighted and "weight" in data:
                entry.append(_json_number(data["weight"]))
            edges.append(entry)
        return {
            "edges": edges,
            "edgeCount": tree.number_of_edges(),
            "nodeCount": tree.number_of_nodes(),
            "connected": nx.is_connected(graph) if graph.number_of_nodes() else True,
        }
    if op == "degree_sequence":
        if directed:
            return {
                "degrees": {node: int(graph.degree(node)) for node in nodes},
                "inDegrees": {node: int(graph.in_degree(node)) for node in nodes},
                "outDegrees": {node: int(graph.out_degree(node)) for node in nodes},
                "sequence": sorted((int(graph.degree(node)) for node in nodes), reverse=True),
            }
        return {
            "degrees": {node: int(graph.degree(node)) for node in nodes},
            "sequence": sorted((int(graph.degree(node)) for node in nodes), reverse=True),
        }
    if op == "coloring":
        if directed:
            graph = graph.to_undirected()
        try:
            coloring = nx.coloring.greedy_color(graph, strategy="largest_first")
        except Exception as exc:  # pragma: no cover - defensive
            raise domain(f"coloring failed: {exc}") from exc
        colors = sorted({int(color) for color in coloring.values()})
        return {
            "coloring": {node: int(color) for node, color in coloring.items()},
            "colorCount": len(colors),
            "colors": colors,
        }
    if op == "diameter":
        if directed:
            raise domain("diameter is only defined for undirected graphs here (set directed=false)")
        if not nx.is_connected(graph):
            components = list(nx.connected_components(graph))
            best = None
            best_component = None
            for component in components:
                subgraph = graph.subgraph(component)
                try:
                    candidate = nx.diameter(subgraph)
                except Exception:  # pragma: no cover - defensive
                    continue
                if best is None or candidate > best:
                    best = candidate
                    best_component = component
            if best is None:
                raise domain("could not compute a diameter")
            return {
                "diameter": int(best),
                "connected": False,
                "component": sorted(best_component),
                "note": "graph is disconnected; the value is the largest component diameter",
            }
        return {"diameter": int(nx.diameter(graph)), "connected": True}
    if op == "is_tree":
        if directed:
            return {
                "value": False,
                "note": "is_tree is only meaningful for the underlying undirected graph",
            }
        return {
            "value": bool(nx.is_tree(graph)) if graph.number_of_nodes() else False,
            "nodeCount": graph.number_of_nodes(),
            "edgeCount": graph.number_of_edges(),
        }
    if op == "is_bipartite":
        target = graph if not directed else graph.to_undirected()
        value = bool(nx.is_bipartite(target))
        result = {"value": value}
        if value:
            try:
                colors = nx.bipartite.color(target)
                result["coloring"] = {node: int(color) for node, color in colors.items()}
            except Exception:  # pragma: no cover - defensive
                pass
        return result
    if op == "pagerank":
        try:
            ranks = nx.pagerank(graph, weight="weight" if weighted else None)
        except Exception as exc:  # pragma: no cover - defensive
            raise domain(f"pagerank failed: {exc}") from exc
        total = sum(ranks.values()) or 1.0
        return {
            "ranks": {node: _json_number(value / total) for node, value in ranks.items()},
            "nodeCount": len(nodes),
        }
    raise unsupported(f"unsupported graph op: {op}")


HANDLERS = {
    "num.root": num_root,
    "num.integrate": num_integrate,
    "num.ode": num_ode,
    "prob.dist": prob_dist,
    "prob.expectation": prob_expectation,
    "opt.minimize": opt_minimize,
    "opt.stationary": opt_stationary,
    "graph.analyze": graph_analyze,
}
