"""Differential geometry ops (``geometry.*``): Christoffel symbols, curvature,
exterior derivative and Lie bracket for a coordinate chart with a metric.
"""

from __future__ import annotations

import sympy

from mlcore import (
    bad_request,
    domain,
    limit_error,
    parse_expression,
    parse_number,
    text,
    truncate,
)

MAX_COORDS = 4
MAX_TEXT_FIELD = 20000


def _parse_coords(raw) -> list[sympy.Symbol]:
    if raw is None:
        names = ["x", "y"]
    elif isinstance(raw, (list, tuple)):
        names = [str(item) for item in raw]
    else:
        raise bad_request("'coords' must be an array of symbol names")
    if not 1 <= len(names) <= MAX_COORDS:
        raise limit_error(f"1..{MAX_COORDS} coordinates are supported")
    symbols = []
    for name in names:
        if not name.isidentifier():
            raise bad_request(f"invalid coordinate name {name!r}")
        symbols.append(sympy.Symbol(name))
    return symbols


def _parse_metric(raw, coords: list[sympy.Symbol]) -> sympy.Matrix:
    if not isinstance(raw, (list, tuple)) or not raw:
        raise bad_request("'metric' must be a square matrix of expression strings")
    if len(raw) != len(coords):
        raise domain(f"metric must be {len(coords)}x{len(coords)} for the given coordinates")
    rows = []
    for index, row in enumerate(raw):
        if not isinstance(row, (list, tuple)) or len(row) != len(coords):
            raise domain(f"metric row {index} must have {len(coords)} entries")
        parsed_row = []
        for cell in row:
            if isinstance(cell, (int, float)):
                parsed_row.append(parse_number(cell, "metric"))
            elif isinstance(cell, str):
                parsed_row.append(parse_expression(cell))
            else:
                raise bad_request("metric entries must be numbers or expression strings")
        rows.append(parsed_row)
    metric = sympy.Matrix(rows)
    if metric != metric.T:
        # symmetrise with a note instead of refusing: the symmetric part is the
        # geometrically meaningful object.
        metric = (metric + metric.T) / 2
    try:
        inverse = metric.inv()
    except Exception as exc:
        raise domain(f"metric is not invertible: {exc}") from exc
    return metric, inverse


def _simplify_component(expression):
    try:
        if sympy.count_ops(expression) > 200:
            return expression
        return sympy.simplify(expression)
    except Exception:  # pragma: no cover - defensive
        return expression


def _christoffel(coords, metric, inverse):
    dimension = len(coords)
    derivative = [[sympy.diff(metric[i, j], coords[k]) for j in range(dimension)] for i in range(dimension) for k in range(dimension)]
    # derivative[(i,k)][j] = d_k g_{i j}
    def dg(i, j, k):
        return sympy.diff(metric[i, j], coords[k])

    symbols = [[[sympy.Integer(0) for _ in range(dimension)] for _ in range(dimension)] for _ in range(dimension)]
    for upper in range(dimension):
        for lower1 in range(dimension):
            for lower2 in range(dimension):
                value = sympy.Integer(0)
                for middle in range(dimension):
                    value += inverse[upper, middle] * (
                        dg(lower1, middle, lower2)
                        + dg(lower2, middle, lower1)
                        - dg(lower1, lower2, middle)
                    )
                symbols[upper][lower1][lower2] = _simplify_component(value / 2)
    return symbols


def _latex_christoffel(coords, symbols) -> str:
    lines = []
    for upper in range(len(coords)):
        for lower1 in range(len(coords)):
            for lower2 in range(len(coords)):
                value = symbols[upper][lower1][lower2]
                if value == 0:
                    continue
                lines.append(
                    f"\\Gamma^{{{coords[upper]}}}_{{{coords[lower1]}{coords[lower2]}}} = {sympy.latex(value)}"
                )
                if sum(len(line) for line in lines) > MAX_TEXT_FIELD:
                    return truncate("\\\\\n".join(lines))
    return truncate("\\\\\n".join(lines)) if lines else "\\text{all Christoffel symbols vanish}"


def op_christoffel(args: dict) -> dict:
    coords = _parse_coords(args.get("coords"))
    metric, inverse = _parse_metric(args.get("metric"), coords)
    symbols = _christoffel(coords, metric, inverse)
    return {
        "christoffel": [
            [[text(sympy.sstr(symbols[i][j][k])) for k in range(len(coords))] for j in range(len(coords))]
            for i in range(len(coords))
        ],
        "latex": _latex_christoffel(coords, symbols),
        "note": "christoffel[i][j][k] = Gamma^i_{jk} = 1/2 g^{il}(g_{lj,k} + g_{lk,j} - g_{jk,l})",
    }


def _curvature(coords, metric, inverse):
    dimension = len(coords)
    symbols = _christoffel(coords, metric, inverse)

    def gamma(upper, lower1, lower2):
        return symbols[upper][lower1][lower2]

    riemann = [
        [[[sympy.Integer(0) for _ in range(dimension)] for _ in range(dimension)] for _ in range(dimension)]
        for _ in range(dimension)
    ]
    # riemann[upper][i][j][k] = R^upper_{i j k}
    for upper in range(dimension):
        for i in range(dimension):
            for j in range(dimension):
                for k in range(dimension):
                    value = sympy.diff(gamma(upper, i, k), coords[j]) - sympy.diff(
                        gamma(upper, i, j), coords[k]
                    )
                    for middle in range(dimension):
                        value += gamma(upper, j, middle) * gamma(middle, i, k) - gamma(
                            upper, k, middle
                        ) * gamma(middle, i, j)
                    riemann[upper][i][j][k] = _simplify_component(value)
    ricci = [[sympy.Integer(0) for _ in range(dimension)] for _ in range(dimension)]
    for i in range(dimension):
        for j in range(dimension):
            value = sympy.Integer(0)
            for upper in range(dimension):
                value += riemann[upper][i][upper][j]
            ricci[i][j] = _simplify_component(value)
    scalar = sympy.Integer(0)
    for i in range(dimension):
        for j in range(dimension):
            scalar += inverse[i, j] * ricci[i][j]
    scalar = _simplify_component(scalar)
    return symbols, riemann, ricci, scalar


def op_curvature(args: dict) -> dict:
    coords = _parse_coords(args.get("coords"))
    metric, inverse = _parse_metric(args.get("metric"), coords)
    symbols, riemann, ricci, scalar = _curvature(coords, metric, inverse)
    latex_lines = [_latex_christoffel(coords, symbols)]
    for upper in range(len(coords)):
        for i in range(len(coords)):
            for j in range(len(coords)):
                for k in range(len(coords)):
                    value = riemann[upper][i][j][k]
                    if value == 0:
                        continue
                    latex_lines.append(
                        f"R^{{{coords[upper]}}}_{{{coords[i]}{coords[j]}{coords[k]}}} = {sympy.latex(value)}"
                    )
                    if sum(len(line) for line in latex_lines) > MAX_TEXT_FIELD:
                        break
    for i in range(len(coords)):
        for j in range(len(coords)):
            if ricci[i][j] != 0:
                latex_lines.append(f"R_{{{coords[i]}{coords[j]}}} = {sympy.latex(ricci[i][j])}")
    latex_lines.append(f"R = {sympy.latex(scalar)}")
    return {
        "christoffel": [
            [[text(sympy.sstr(symbols[i][j][k])) for k in range(len(coords))] for j in range(len(coords))]
            for i in range(len(coords))
        ],
        "riemann": [
            [
                [
                    [text(sympy.sstr(riemann[upper][i][j][k])) for k in range(len(coords))]
                    for j in range(len(coords))
                ]
                for i in range(len(coords))
            ]
            for upper in range(len(coords))
        ],
        "ricci": [
            [text(sympy.sstr(ricci[i][j])) for j in range(len(coords))] for i in range(len(coords))
        ],
        "scalar": text(sympy.sstr(scalar)),
        "latex": truncate("\\\\\n".join(latex_lines)),
        "note": (
            "riemann[up][i][j][k] = R^up_{i j k} = d_j Gamma^up_{i k} - d_k Gamma^up_{i j} "
            "+ Gamma^up_{j m} Gamma^m_{i k} - Gamma^up_{k m} Gamma^m_{i j}; "
            "ricci[i][j] = R^k_{i k j}; scalar = g^{ij} Ricci_{ij}"
        ),
    }


def _parse_form_components(raw, degree: int, dimension: int):
    """Return dict {index tuple: sympy expression} for a ``degree``-form."""
    if degree == 0:
        if isinstance(raw, str):
            return {(): parse_expression(raw)}
        if isinstance(raw, (int, float)):
            return {(): parse_number(raw, "components")}
        if isinstance(raw, dict):
            for key in ("", "0", "(0,)"):
                if key in raw:
                    value = raw[key]
                    if isinstance(value, list):
                        if len(value) != 1:
                            raise domain("a 0-form has exactly one component")
                        value = value[0]
                    return {(): value if isinstance(value, str) else parse_number(value, "components")}
            if len(raw) == 1:
                value = next(iter(raw.values()))
                if isinstance(value, list):
                    value = value[0]
                return {(): value if isinstance(value, str) else parse_number(value, "components")}
            raise bad_request("a 0-form needs a scalar component (e.g. components: {\"0\": \"f\"})")
        raise bad_request("invalid 0-form components")
    from itertools import combinations

    index_tuples = list(combinations(range(dimension), degree))
    if isinstance(raw, dict):
        if str(degree) in raw and isinstance(raw[str(degree)], (list, tuple)):
            values = raw[str(degree)]
            if len(values) != len(index_tuples):
                raise domain(
                    f"a {degree}-form on {dimension} coordinates needs "
                    f"{len(index_tuples)} components (got {len(values)})"
                )
            parsed = {}
            for index_tuple, value in zip(index_tuples, values):
                parsed[index_tuple] = value if isinstance(value, str) else parse_number(value, "components")
            return parsed
        parsed = {}
        for key, value in raw.items():
            try:
                parts = [int(part) for part in str(key).replace(" ", "").strip("()").split(",") if part != ""]
            except ValueError as exc:
                raise bad_request(f"invalid component key {key!r}") from exc
            if len(parts) != degree:
                raise domain(f"component key {key!r} does not have {degree} indices")
            if len(set(parts)) != degree:
                raise domain(f"component key {key!r} repeats an index")
            if any(part < 0 or part >= dimension for part in parts):
                raise domain(f"component key {key!r} uses an index out of range")
            index_tuple = tuple(sorted(parts))
            if index_tuple in parsed:
                raise bad_request(f"component {index_tuple} is specified twice")
            parsed[index_tuple] = value if isinstance(value, str) else parse_number(value, "components")
        missing = [index_tuple for index_tuple in index_tuples if index_tuple not in parsed]
        if missing:
            raise domain(f"missing {degree}-form components: {missing}")
        return parsed
    raise bad_request("'components' must be an object mapping index tuples to expressions")


def op_exterior_derivative(args: dict) -> dict:
    coords = _parse_coords(args.get("coords"))
    dimension = len(coords)
    degree = args.get("formDegree", 0)
    if isinstance(degree, bool) or not isinstance(degree, int):
        raise bad_request("formDegree must be an integer")
    if not 0 <= degree <= dimension:
        raise domain(f"formDegree must be between 0 and {dimension}")
    components = _parse_form_components(args.get("components"), degree, dimension)
    from itertools import combinations

    if degree == dimension:
        return {
            "components": {},
            "formDegree": degree,
            "degree": degree + 1,
            "latex": "d\\omega = 0 \\quad (\\text{top-degree form on a %d-dimensional chart})" % dimension,
            "note": "the exterior derivative of a top-degree form on this chart is zero",
        }
    new_components = {}
    for index_tuple in combinations(range(dimension), degree + 1):
        value = sympy.Integer(0)
        for position in range(degree + 1):
            sign = (-1) ** position
            reduced = index_tuple[:position] + index_tuple[position + 1 :]
            partial = sympy.diff(components[reduced], coords[index_tuple[position]])
            value += sign * partial
        new_components[index_tuple] = _simplify_component(value)
    result = {
        ",".join(str(index) for index in index_tuple): text(sympy.sstr(expression))
        for index_tuple, expression in new_components.items()
    }
    latex_lines = []
    for index_tuple, expression in new_components.items():
        if expression == 0:
            continue
        latex_lines.append(
            f"\\left(d\\omega\\right)_{{{','.join(str(i) for i in index_tuple)}}} = {sympy.latex(expression)}"
        )
    return {
        "components": result,
        "formDegree": degree,
        "degree": degree + 1,
        "latex": truncate("\\\\\n".join(latex_lines)) if latex_lines else "d\\omega = 0",
        "note": "(d omega)_{i0...ik} = sum_j (-1)^j d_{i_j} omega_{i0...hat{i_j}...ik}",
    }


def op_lie_bracket(args: dict) -> dict:
    coords = _parse_coords(args.get("coords"))
    dimension = len(coords)
    x_raw = args.get("X")
    y_raw = args.get("Y")
    if not isinstance(x_raw, (list, tuple)) or len(x_raw) != dimension:
        raise domain(f"'X' must have {dimension} components")
    if not isinstance(y_raw, (list, tuple)) or len(y_raw) != dimension:
        raise domain(f"'Y' must have {dimension} components")
    X = [parse_number(value, "X") for value in x_raw]
    Y = [parse_number(value, "Y") for value in y_raw]
    result = []
    for component in range(dimension):
        value = sympy.Integer(0)
        for index in range(dimension):
            value += X[index] * sympy.diff(Y[component], coords[index])
            value -= Y[index] * sympy.diff(X[component], coords[index])
        result.append(_simplify_component(value))
    latex = ", ".join(
        f"\\left[X,Y\\right]^{{{coords[index]}}} = {sympy.latex(value)}" for index, value in enumerate(result)
    )
    return {
        "result": [text(sympy.sstr(value)) for value in result],
        "latex": truncate(latex),
        "note": "[X,Y]^k = X^i d_i Y^k - Y^i d_i X^k",
    }


HANDLERS = {
    "geometry.christoffel": op_christoffel,
    "geometry.curvature": op_curvature,
    "geometry.exterior_derivative": op_exterior_derivative,
    "geometry.lie_bracket": op_lie_bracket,
}
