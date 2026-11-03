"""Plot data generation (``plot.*``) and server-side SVG rendering.

The browser renderer consumes the data shapes; ``plot.svg`` provides a
self-contained SVG for agent/export use (2D plots; 3D surfaces are projected
to a wireframe).  No images are ever returned.
"""

from __future__ import annotations

import math

import numpy as np
import sympy

from mlcore import (
    bad_request,
    domain,
    limit_error,
    parse_expression,
    parse_int_arg,
    sanitize,
    text,
    truncate,
)

MAX_SAMPLES = 5000
MAX_IMPLICIT_GRID = 300
MAX_SURFACE_GRID = 80
MAX_FIELD_GRID = 40
MAX_SEGMENTS = 20000
SVG_MAX_CHARS = 19500

COLORS = [
    "#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed",
    "#0891b2", "#db2777", "#4d7c0f", "#b45309", "#475569",
]


# ---------------------------------------------------------------------------
# expression sampling helpers
# ---------------------------------------------------------------------------


def _symbol(args: dict, key: str, default: str) -> sympy.Symbol:
    name = args.get(key, default)
    if not isinstance(name, str) or not name.isidentifier():
        raise bad_request(f"invalid variable name in {key!r}")
    return sympy.Symbol(name)


def _range(args: dict, key: str, default, allowed=None) -> tuple[float, float]:
    raw = args.get(key, default)
    if not isinstance(raw, (list, tuple)) or len(raw) != 2:
        raise bad_request(f"'{key}' must be a two-element [min, max] array")
    try:
        low = float(raw[0])
        high = float(raw[1])
    except (TypeError, ValueError) as exc:
        raise bad_request(f"'{key}' bounds must be numbers") from exc
    if not math.isfinite(low) or not math.isfinite(high):
        raise domain(f"'{key}' bounds must be finite")
    if low == high:
        low, high = low - 1.0, high + 1.0
    if low > high:
        low, high = high, low
    return low, high


def _sample_count(args: dict, default: int = 400) -> int:
    samples = args.get("samples", default)
    if isinstance(samples, bool) or not isinstance(samples, int):
        raise bad_request("'samples' must be an integer")
    if samples < 2:
        raise domain("'samples' must be at least 2")
    if samples > MAX_SAMPLES:
        raise limit_error(f"'samples' exceeds limit {MAX_SAMPLES}")
    return samples


def _evaluate(expression: sympy.Expr, symbol: sympy.Symbol, values: np.ndarray) -> np.ndarray:
    try:
        function = sympy.lambdify([symbol], expression, modules=["numpy"])
        with np.errstate(all="ignore"):
            raw = function(values)
    except Exception:
        try:
            function = sympy.lambdify([symbol], expression, modules=["math", "numpy"])
            with np.errstate(all="ignore"):
                raw = np.array([function(value) for value in values], dtype=complex)
        except Exception as exc:
            raise domain(f"could not evaluate expression numerically: {exc}") from exc
    array = np.asarray(raw)
    if array.ndim == 0:
        array = np.full(values.shape, array, dtype=complex)
    if array.shape != values.shape:
        try:
            array = np.broadcast_to(array, values.shape).astype(complex)
        except Exception:  # pragma: no cover - defensive
            array = np.array([complex(np.asarray(raw).flat[0])] * len(values))
    try:
        complex_array = np.asarray(array, dtype=complex)
    except (TypeError, ValueError) as exc:
        raise domain(f"expression did not evaluate to numbers: {exc}") from exc
    real = complex_array.real.astype(float)
    imaginary = complex_array.imag.astype(float)
    invalid = ~np.isfinite(real) | ~np.isfinite(imaginary) | (np.abs(imaginary) > 1e-9)
    real[invalid] = np.nan
    return real


def _split_curve(xs: np.ndarray, ys: np.ndarray):
    """Split a sampled curve into polylines at NaN/Inf and large jumps."""
    finite = np.isfinite(ys)
    if not np.any(finite):
        return [], "no finite values in the sampled range"
    finite_values = np.abs(ys[finite])
    scale = float(np.median(finite_values))
    if scale <= 1e-12:
        scale = float(np.percentile(finite_values, 75)) if finite_values.size else 1.0
    if scale <= 1e-12:
        scale = 1.0
    jump_threshold = max(30.0 * scale, 1e-9)
    polylines: list[list[list[float]]] = []
    current: list[list[float]] = []
    previous_y = None
    split_note = None
    for x_value, y_value in zip(xs, ys):
        if not math.isfinite(float(y_value)):
            if len(current) >= 2:
                polylines.append(current)
            elif len(current) == 1 and polylines:
                pass
            current = []
            previous_y = None
            continue
        if previous_y is not None and abs(float(y_value) - previous_y) > jump_threshold:
            if len(current) >= 2:
                polylines.append(current)
            current = [[float(x_value), float(y_value)]]
            previous_y = float(y_value)
            continue
        current.append([float(x_value), float(y_value)])
        previous_y = float(y_value)
    if len(current) >= 2:
        polylines.append(current)
    if len(polylines) > 1:
        split_note = f"curve split into {len(polylines)} polylines at discontinuities"
    return polylines, split_note


def _y_range(curves) -> list[float] | None:
    values = []
    for curve in curves:
        for polyline in curve.get("points", []):
            for point in polyline:
                if len(point) >= 2 and math.isfinite(point[1]):
                    values.append(point[1])
    if not values:
        return None
    low, high = float(min(values)), float(max(values))
    if low == high:
        delta = max(abs(low) * 0.1, 1.0)
        low -= delta
        high += delta
    return [low, high]


def _curve_entry(points, valid: bool, **extra):
    entry = {"points": points, "valid": valid}
    entry.update(extra)
    return entry


# ---------------------------------------------------------------------------
# plot handlers
# ---------------------------------------------------------------------------


def plot_sample(args: dict) -> dict:
    expression = parse_expression(args.get("expr"))
    symbol = _symbol(args, "var", "x")
    low, high = _range(args, "range", [-5, 5])
    samples = _sample_count(args)
    xs = np.linspace(low, high, samples)
    ys = _evaluate(expression, symbol, xs)
    points, note = _split_curve(xs, ys)
    curve = _curve_entry(points, bool(points), expr=truncate(str(args.get("expr"))))
    if note:
        curve["note"] = note
    y_range = _y_range([curve]) or [-1.0, 1.0]
    return {
        "curves": [curve],
        "range": [low, high],
        "yRange": y_range,
        "samples": samples,
        "var": str(symbol),
    }


def plot_sample_multi(args: dict) -> dict:
    raw_expressions = args.get("exprs")
    if not isinstance(raw_expressions, list) or not raw_expressions:
        raise bad_request("'exprs' must be a non-empty array of expression strings")
    if len(raw_expressions) > 12:
        raise limit_error("at most 12 expressions are supported")
    symbol = _symbol(args, "var", "x")
    low, high = _range(args, "range", [-5, 5])
    samples = _sample_count(args)
    xs = np.linspace(low, high, samples)
    curves = []
    for index, expression_text in enumerate(raw_expressions):
        expression = parse_expression(expression_text)
        ys = _evaluate(expression, symbol, xs)
        points, note = _split_curve(xs, ys)
        entry = _curve_entry(
            points,
            bool(points),
            expr=truncate(str(expression_text)),
            color=COLORS[index % len(COLORS)],
        )
        if note:
            entry["note"] = note
        curves.append(entry)
    y_range = _y_range(curves) or [-1.0, 1.0]
    return {
        "curves": curves,
        "range": [low, high],
        "yRange": y_range,
        "samples": samples,
        "var": str(symbol),
    }


def plot_parametric(args: dict) -> dict:
    x_expression = parse_expression(args.get("x"))
    y_expression = parse_expression(args.get("y"))
    symbol = _symbol(args, "t", "t")
    low, high = _range(args, "range", [0, 2 * math.pi])
    samples = _sample_count(args)
    parameters = np.linspace(low, high, samples)
    xs = _evaluate(x_expression, symbol, parameters)
    ys = _evaluate(y_expression, symbol, parameters)
    points = []
    segments = []
    current = []
    for x_value, y_value in zip(xs, ys):
        if not math.isfinite(float(x_value)) or not math.isfinite(float(y_value)):
            if len(current) >= 2:
                segments.append(current)
            current = []
            continue
        point = [float(x_value), float(y_value)]
        points.append(point)
        current.append(point)
    if len(current) >= 2:
        segments.append(current)
    result = {
        "points": points,
        "range": [low, high],
        "samples": samples,
        "t": str(symbol),
    }
    if len(segments) > 1:
        result["segments"] = segments
        result["note"] = f"parameter curve split into {len(segments)} polylines"
    if points:
        result["xRange"] = [min(p[0] for p in points), max(p[0] for p in points)]
        result["yRange"] = [min(p[1] for p in points), max(p[1] for p in points)]
    return result


def plot_polar(args: dict) -> dict:
    radius_expression = parse_expression(args.get("r"))
    symbol = _symbol(args, "theta", "theta")
    low, high = _range(args, "range", [0, 2 * math.pi])
    samples = _sample_count(args)
    angles = np.linspace(low, high, samples)
    radii = _evaluate(radius_expression, symbol, angles)
    points = []
    for angle, radius in zip(angles, radii):
        if not math.isfinite(float(angle)) or not math.isfinite(float(radius)):
            continue
        points.append([float(radius) * math.cos(float(angle)), float(radius) * math.sin(float(angle))])
    result = {
        "points": points,
        "range": [low, high],
        "samples": samples,
        "theta": str(symbol),
    }
    if points:
        result["xRange"] = [min(p[0] for p in points), max(p[0] for p in points)]
        result["yRange"] = [min(p[1] for p in points), max(p[1] for p in points)]
    return result


def _marching_squares(x_values, y_values, grid_values, level=0.0):
    segments = []
    if len(x_values) < 2 or len(y_values) < 2:
        return segments
    def interpolate(x0, y0, f0, x1, y1, f1):
        denominator = f1 - f0
        if abs(denominator) < 1e-15:
            return ((x0 + x1) / 2.0, (y0 + y1) / 2.0)
        t = (level - f0) / denominator
        t = min(1.0, max(0.0, t))
        return (x0 + t * (x1 - x0), y0 + t * (y1 - y0))

    for j in range(len(y_values) - 1):
        for i in range(len(x_values) - 1):
            x0, x1 = x_values[i], x_values[i + 1]
            y0, y1 = y_values[j], y_values[j + 1]
            f00 = grid_values[j][i]
            f10 = grid_values[j][i + 1]
            f11 = grid_values[j + 1][i + 1]
            f01 = grid_values[j + 1][i]
            if not all(math.isfinite(value) for value in (f00, f10, f11, f01)):
                continue
            index = 0
            if f00 > level:
                index |= 1
            if f10 > level:
                index |= 2
            if f11 > level:
                index |= 4
            if f01 > level:
                index |= 8
            if index in (0, 15):
                continue
            bottom = interpolate(x0, y0, f00, x1, y0, f10)
            right = interpolate(x1, y0, f10, x1, y1, f11)
            top = interpolate(x0, y1, f01, x1, y1, f11)
            left = interpolate(x0, y0, f00, x0, y1, f01)
            edges = {
                "bottom": bottom,
                "right": right,
                "top": top,
                "left": left,
            }
            cases = {
                1: [("left", "bottom")],
                2: [("bottom", "right")],
                3: [("left", "right")],
                4: [("right", "top")],
                5: [("left", "top"), ("bottom", "right")],
                6: [("bottom", "top")],
                7: [("left", "top")],
                8: [("top", "left")],
                9: [("top", "bottom")],
                10: [("top", "right"), ("left", "bottom")],
                11: [("right", "top")],
                12: [("right", "left")],
                13: [("bottom", "right")],
                14: [("left", "bottom")],
                15: [],
            }
            for edge_a, edge_b in cases.get(index, []):
                point_a = edges[edge_a]
                point_b = edges[edge_b]
                segments.append([[point_a[0], point_a[1]], [point_b[0], point_b[1]]])
                if len(segments) >= MAX_SEGMENTS:
                    return segments
    return segments


def plot_implicit(args: dict) -> dict:
    expression = parse_expression(args.get("expr"))
    x_low, x_high = _range(args, "xRange", [-5, 5])
    y_low, y_high = _range(args, "yRange", [-5, 5])
    grid = args.get("grid", 120)
    if isinstance(grid, bool) or not isinstance(grid, int):
        raise bad_request("'grid' must be an integer")
    if not 8 <= grid <= MAX_IMPLICIT_GRID:
        raise limit_error(f"'grid' must be between 8 and {MAX_IMPLICIT_GRID}")
    xs = np.linspace(x_low, x_high, grid)
    ys = np.linspace(y_low, y_high, grid)
    x_symbol = sympy.Symbol("x")
    y_symbol = sympy.Symbol("y")
    try:
        function = sympy.lambdify([x_symbol, y_symbol], expression, modules=["numpy"])
        with np.errstate(all="ignore"):
            raw = function(xs[None, :], ys[:, None])
        values = np.asarray(raw, dtype=float)
        if values.shape != (grid, grid):
            values = np.full((grid, grid), np.nan)
    except Exception as exc:
        raise domain(f"could not evaluate implicit expression: {exc}") from exc
    values[~np.isfinite(values)] = np.nan
    segments = _marching_squares([float(value) for value in xs], [float(value) for value in ys], values.tolist())
    return {
        "segments": segments,
        "contourLevels": [0.0],
        "xRange": [x_low, x_high],
        "yRange": [y_low, y_high],
        "grid": grid,
        "note": "marching squares at level 0; ambiguous saddle cells are split by the average value",
    }


def plot_surface3d(args: dict) -> dict:
    expression = parse_expression(args.get("expr"))
    x_symbol = _symbol(args, "xVar", "x")
    y_symbol = _symbol(args, "yVar", "y")
    if x_symbol == y_symbol:
        raise bad_request("xVar and yVar must differ")
    x_low, x_high = _range(args, "xRange", [-3, 3])
    y_low, y_high = _range(args, "yRange", [-3, 3])
    n = args.get("n", 40)
    if isinstance(n, bool) or not isinstance(n, int):
        raise bad_request("'n' must be an integer")
    if not 4 <= n <= MAX_SURFACE_GRID:
        raise limit_error(f"'n' must be between 4 and {MAX_SURFACE_GRID}")
    xs = np.linspace(x_low, x_high, n)
    ys = np.linspace(y_low, y_high, n)
    try:
        function = sympy.lambdify([x_symbol, y_symbol], expression, modules=["numpy"])
        with np.errstate(all="ignore"):
            raw = function(xs[None, :], ys[:, None])
        z_values = np.asarray(raw, dtype=float)
        if z_values.shape != (n, n):
            z_values = np.full((n, n), np.nan)
    except Exception as exc:
        raise domain(f"could not evaluate surface expression: {exc}") from exc
    z_values[~np.isfinite(z_values)] = np.nan
    vertices = []
    for j in range(n):
        for i in range(n):
            z_value = float(z_values[j][i])
            vertices.append(
                [float(xs[i]), float(ys[j]), z_value if math.isfinite(z_value) else None]
            )
    indices = []
    for j in range(n - 1):
        for i in range(n - 1):
            a = j * n + i
            b = j * n + i + 1
            c = (j + 1) * n + i + 1
            d = (j + 1) * n + i
            if all(vertices[index][2] is not None for index in (a, b, c)):
                indices.append([a, b, c])
            if all(vertices[index][2] is not None for index in (a, c, d)):
                indices.append([a, c, d])
    finite_z = [vertex[2] for vertex in vertices if vertex[2] is not None]
    if finite_z:
        z_range = [float(min(finite_z)), float(max(finite_z))]
        if z_range[0] == z_range[1]:
            z_range = [z_range[0] - 1.0, z_range[0] + 1.0]
    else:
        z_range = [-1.0, 1.0]
    result = {
        "vertices": vertices,
        "indices": indices,
        "zRange": z_range,
        "xRange": [x_low, x_high],
        "yRange": [y_low, y_high],
        "n": n,
        "xVar": str(x_symbol),
        "yVar": str(y_symbol),
        "note": "vertices are row-major over yVar then xVar; indices are triangles",
    }
    if any(vertex[2] is None for vertex in vertices):
        result["note"] += "; non-finite vertices are set to null and excluded from the mesh"
    return result


def plot_field(args: dict) -> dict:
    p_expression = parse_expression(args.get("P"))
    q_expression = parse_expression(args.get("Q"))
    x_symbol = _symbol(args, "xVar", "x")
    y_symbol = _symbol(args, "yVar", "y")
    x_low, x_high = _range(args, "xRange", [-5, 5])
    y_low, y_high = _range(args, "yRange", [-5, 5])
    n = args.get("n", 15)
    if isinstance(n, bool) or not isinstance(n, int):
        raise bad_request("'n' must be an integer")
    if not 2 <= n <= MAX_FIELD_GRID:
        raise limit_error(f"'n' must be between 2 and {MAX_FIELD_GRID}")
    normalize = bool(args.get("normalize", True))
    xs = np.linspace(x_low, x_high, n)
    ys = np.linspace(y_low, y_high, n)
    try:
        p_function = sympy.lambdify([x_symbol, y_symbol], p_expression, modules=["numpy"])
        q_function = sympy.lambdify([x_symbol, y_symbol], q_expression, modules=["numpy"])
        with np.errstate(all="ignore"):
            px = np.asarray(p_function(xs[None, :], ys[:, None]), dtype=float)
            py = np.asarray(q_function(xs[None, :], ys[:, None]), dtype=float)
        px = np.broadcast_to(px, (n, n)).astype(float)
        py = np.broadcast_to(py, (n, n)).astype(float)
    except Exception as exc:
        raise domain(f"could not evaluate vector field: {exc}") from exc
    arrows = []
    maximum = 0.0
    raw_arrows = []
    for j in range(n):
        for i in range(n):
            dx = float(px[j][i])
            dy = float(py[j][i])
            if not math.isfinite(dx) or not math.isfinite(dy):
                continue
            maximum = max(maximum, math.hypot(dx, dy))
            raw_arrows.append([float(xs[i]), float(ys[j]), dx, dy])
    for x_value, y_value, dx, dy in raw_arrows:
        if normalize:
            length = math.hypot(dx, dy)
            scale = 0.45 * min((x_high - x_low), (y_high - y_low)) / max(n - 1, 1)
            if length > 1e-15:
                dx = dx / length * scale
                dy = dy / length * scale
            else:
                dx = dy = 0.0
        arrows.append([x_value, y_value, dx, dy])
    return {
        "arrows": arrows,
        "xRange": [x_low, x_high],
        "yRange": [y_low, y_high],
        "n": n,
        "normalize": normalize,
        "maxMagnitude": maximum,
        "note": "arrows are [x, y, dx, dy]; normalized arrows all have the same visual length",
    }


# ---------------------------------------------------------------------------
# SVG rendering
# ---------------------------------------------------------------------------


class _SvgCanvas:
    def __init__(self, width: int = 720, height: int = 480, margin: int = 52):
        self.width = width
        self.height = height
        self.margin = margin
        self.elements: list[str] = []
        self.x_domain = None
        self.y_domain = None

    def set_domains(self, x_domain, y_domain):
        self.x_domain = x_domain
        self.y_domain = y_domain

    def map_x(self, value: float) -> float:
        low, high = self.x_domain
        if high == low:
            high = low + 1
        return self.margin + (value - low) / (high - low) * (self.width - 2 * self.margin)

    def map_y(self, value: float) -> float:
        low, high = self.y_domain
        if high == low:
            high = low + 1
        return self.height - self.margin - (value - low) / (high - low) * (self.height - 2 * self.margin)

    def add(self, fragment: str) -> None:
        if sum(len(element) for element in self.elements) < SVG_MAX_CHARS:
            self.elements.append(fragment)

    def render(self) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" height="{self.height}" '
            f'viewBox="0 0 {self.width} {self.height}">'
            '<rect width="100%" height="100%" fill="#ffffff"/>'
            + "".join(self.elements)
            + "</svg>"
        )


def _nice_ticks(low: float, high: float, count: int = 5):
    if high <= low:
        high = low + 1
    span = high - low
    step = 10 ** math.floor(math.log10(span / max(count, 1)))
    for multiplier in (1, 2, 2.5, 5, 10):
        candidate = step * multiplier
        if span / candidate <= count + 1:
            step = candidate
            break
    start = math.ceil(low / step) * step
    ticks = []
    value = start
    while value <= high + step * 0.5 and len(ticks) < 20:
        ticks.append(round(value, 10))
        value += step
    return ticks


def _draw_axes(canvas: _SvgCanvas, x_label: str = "x", y_label: str = "y") -> None:
    width, height, margin = canvas.width, canvas.height, canvas.margin
    for tick in _nice_ticks(*canvas.x_domain):
        x_pixel = canvas.map_x(tick)
        canvas.add(
            f'<line x1="{x_pixel:.2f}" y1="{margin}" x2="{x_pixel:.2f}" y2="{height - margin}" '
            'stroke="#e5e7eb" stroke-width="1"/>'
        )
        canvas.add(
            f'<text x="{x_pixel:.2f}" y="{height - margin + 18}" font-family="sans-serif" '
            f'font-size="11" fill="#6b7280" text-anchor="middle">{tick:g}</text>'
        )
    for tick in _nice_ticks(*canvas.y_domain):
        y_pixel = canvas.map_y(tick)
        canvas.add(
            f'<line x1="{margin}" y1="{y_pixel:.2f}" x2="{width - margin}" y2="{y_pixel:.2f}" '
            'stroke="#e5e7eb" stroke-width="1"/>'
        )
        canvas.add(
            f'<text x="{margin - 8}" y="{y_pixel + 4:.2f}" font-family="sans-serif" '
            f'font-size="11" fill="#6b7280" text-anchor="end">{tick:g}</text>'
        )
    # zero axes when they are inside the viewport
    if canvas.x_domain[0] <= 0 <= canvas.x_domain[1]:
        x_zero = canvas.map_x(0)
        canvas.add(
            f'<line x1="{x_zero:.2f}" y1="{margin}" x2="{x_zero:.2f}" y2="{height - margin}" '
            'stroke="#9ca3af" stroke-width="1"/>'
        )
    if canvas.y_domain[0] <= 0 <= canvas.y_domain[1]:
        y_zero = canvas.map_y(0)
        canvas.add(
            f'<line x1="{margin}" y1="{y_zero:.2f}" x2="{width - margin}" y2="{y_zero:.2f}" '
            'stroke="#9ca3af" stroke-width="1"/>'
        )
    canvas.add(
        f'<text x="{width - margin}" y="{height - 12}" font-family="sans-serif" font-size="12" '
        f'fill="#374151" text-anchor="end">{x_label}</text>'
    )
    canvas.add(
        f'<text x="{margin - 34}" y="{margin - 10}" font-family="sans-serif" font-size="12" '
        f'fill="#374151">{y_label}</text>'
    )


def _polyline(canvas: _SvgCanvas, points, color: str = COLORS[0], width: float = 1.8) -> None:
    if len(points) < 2:
        return
    coordinates = " ".join(f"{canvas.map_x(point[0]):.2f},{canvas.map_y(point[1]):.2f}" for point in points)
    canvas.add(
        f'<polyline points="{coordinates}" fill="none" stroke="{color}" '
        f'stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>'
    )


def _bounds_from_curves(curves):
    xs = []
    ys = []
    for curve in curves:
        for polyline in curve.get("points", []):
            for point in polyline:
                if len(point) >= 2 and math.isfinite(point[0]) and math.isfinite(point[1]):
                    xs.append(point[0])
                    ys.append(point[1])
    return xs, ys


def _padding(low: float, high: float) -> tuple[float, float]:
    if low == high:
        return low - 1.0, high + 1.0
    margin = (high - low) * 0.06
    return low - margin, high + margin


def svg_sample(args: dict, multi: bool = False) -> dict:
    data = plot_sample_multi(args) if multi else plot_sample(args)
    curves = data["curves"]
    xs, ys = _bounds_from_curves(curves)
    if not xs:
        raise domain("no finite data points to render")
    x_domain = _padding(min(xs), max(xs))
    y_domain = _padding(min(ys), max(ys))
    canvas = _SvgCanvas()
    canvas.set_domains(x_domain, y_domain)
    _draw_axes(canvas, str(data.get("var", "x")), "y")
    for index, curve in enumerate(curves):
        color = curve.get("color", COLORS[index % len(COLORS)])
        for polyline_points in curve.get("points", []):
            _polyline(canvas, polyline_points, color=color)
    return {"svg": canvas.render(), "kind": "sample_multi" if multi else "sample"}


def svg_parametric(args: dict) -> dict:
    data = plot_parametric(args)
    points = data["points"]
    if not points:
        raise domain("no finite parametric points to render")
    canvas = _SvgCanvas()
    canvas.set_domains(_padding(data["xRange"][0], data["xRange"][1]), _padding(data["yRange"][0], data["yRange"][1]))
    _draw_axes(canvas, str(data.get("t", "t")), "y")
    segments = data.get("segments") or [points]
    for segment in segments:
        _polyline(canvas, segment, color=COLORS[0])
    return {"svg": canvas.render(), "kind": "parametric"}


def svg_polar(args: dict) -> dict:
    data = plot_polar(args)
    points = data["points"]
    if not points:
        raise domain("no finite polar points to render")
    canvas = _SvgCanvas()
    canvas.set_domains(_padding(data["xRange"][0], data["xRange"][1]), _padding(data["yRange"][0], data["yRange"][1]))
    _draw_axes(canvas)
    _polyline(canvas, points, color=COLORS[4])
    return {"svg": canvas.render(), "kind": "polar"}


def svg_implicit(args: dict) -> dict:
    data = plot_implicit(args)
    segments = data["segments"]
    if not segments:
        raise domain("no contour segments found (the expression may not cross level 0 in this window)")
    xs = [segment[0][0] for segment in segments] + [segment[1][0] for segment in segments]
    ys = [segment[0][1] for segment in segments] + [segment[1][1] for segment in segments]
    canvas = _SvgCanvas()
    canvas.set_domains(_padding(min(xs), max(xs)), _padding(min(ys), max(ys)))
    _draw_axes(canvas)
    for segment in segments:
        x1 = canvas.map_x(segment[0][0])
        y1 = canvas.map_y(segment[0][1])
        x2 = canvas.map_x(segment[1][0])
        y2 = canvas.map_y(segment[1][1])
        canvas.add(
            f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{COLORS[1]}" stroke-width="1.6"/>'
        )
    return {"svg": canvas.render(), "kind": "implicit", "segments": len(segments)}


def svg_field(args: dict) -> dict:
    data = plot_field(args)
    arrows = data["arrows"]
    if not arrows:
        raise domain("no finite field vectors to render")
    canvas = _SvgCanvas()
    canvas.set_domains(_padding(data["xRange"][0], data["xRange"][1]), _padding(data["yRange"][0], data["yRange"][1]))
    _draw_axes(canvas)
    for x_value, y_value, dx, dy in arrows:
        x0 = canvas.map_x(x_value)
        y0 = canvas.map_y(y_value)
        x1 = canvas.map_x(x_value + dx)
        y1 = canvas.map_y(y_value + dy)
        canvas.add(
            f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" '
            f'stroke="{COLORS[0]}" stroke-width="1.2" marker-end="url(#arrow)"/>'
        )
    canvas.add(
        '<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">'
        f'<path d="M0,0 L6,3 L0,6 z" fill="{COLORS[0]}"/></marker></defs>'
    )
    return {"svg": canvas.render(), "kind": "field"}


def svg_surface3d(args: dict) -> dict:
    data = plot_surface3d(args)
    vertices = data["vertices"]
    indices = data["indices"]
    n = data["n"]
    # isometric wireframe projection
    cos30 = math.cos(math.pi / 6)
    sin30 = math.sin(math.pi / 6)
    projected = []
    for x_value, y_value, z_value in vertices:
        if z_value is None:
            projected.append(None)
            continue
        px = (x_value - y_value) * cos30
        py = (x_value + y_value) * sin30 - z_value
        projected.append((px, py))
    valid = [point for point in projected if point is not None]
    if not valid:
        raise domain("no finite surface points to render")
    xs = [point[0] for point in valid]
    ys = [point[1] for point in valid]
    canvas = _SvgCanvas(margin=40)
    canvas.set_domains(_padding(min(xs), max(xs)), _padding(min(ys), max(ys)))
    for j in range(n):
        for i in range(n - 1):
            a = projected[j * n + i]
            b = projected[j * n + i + 1]
            if a is None or b is None:
                continue
            canvas.add(
                f'<line x1="{canvas.map_x(a[0]):.2f}" y1="{canvas.map_y(a[1]):.2f}" '
                f'x2="{canvas.map_x(b[0]):.2f}" y2="{canvas.map_y(b[1]):.2f}" '
                f'stroke="{COLORS[0]}" stroke-width="0.9" opacity="0.75"/>'
            )
    for i in range(n):
        for j in range(n - 1):
            a = projected[j * n + i]
            b = projected[(j + 1) * n + i]
            if a is None or b is None:
                continue
            canvas.add(
                f'<line x1="{canvas.map_x(a[0]):.2f}" y1="{canvas.map_y(a[1]):.2f}" '
                f'x2="{canvas.map_x(b[0]):.2f}" y2="{canvas.map_y(b[1]):.2f}" '
                f'stroke="{COLORS[1]}" stroke-width="0.9" opacity="0.6"/>'
            )
    canvas.add(
        f'<text x="{canvas.width - 40}" y="{canvas.height - 14}" font-family="sans-serif" '
        f'font-size="12" fill="#374151" text-anchor="end">{data["xVar"]}, {data["yVar"]} (wireframe)</text>'
    )
    return {"svg": canvas.render(), "kind": "surface3d", "note": data.get("note")}


def plot_svg(args: dict) -> dict:
    kind = args.get("kind")
    if kind is None:
        if "exprs" in args:
            kind = "sample_multi"
        elif "x" in args and "y" in args:
            kind = "parametric"
        elif "r" in args:
            kind = "polar"
        elif "segments" in args:
            kind = "implicit"
        elif "P" in args and "Q" in args:
            kind = "field"
        else:
            kind = "sample"
    kind = str(kind).strip().lower()
    if kind in ("explicit", "sample", "function", "plot", "curve", "2d"):
        result = svg_sample(args, multi=False)
    elif kind in ("sample_multi", "multi", "curves", "multi_explicit"):
        if "exprs" not in args:
            raise bad_request("plot.svg kind='sample_multi' needs 'exprs'")
        result = svg_sample(args, multi=True)
    elif kind in ("parametric", "param", "parameter"):
        result = svg_parametric(args)
    elif kind in ("polar", "radial"):
        result = svg_polar(args)
    elif kind in ("implicit", "contour", "level"):
        result = svg_implicit(args)
    elif kind in ("field", "vector", "vector_field"):
        result = svg_field(args)
    elif kind in ("surface3d", "surface", "3d"):
        result = svg_surface3d(args)
    else:
        raise bad_request(f"unsupported plot.svg kind {kind!r}")
    return result


HANDLERS = {
    "plot.sample": plot_sample,
    "plot.sample_multi": plot_sample_multi,
    "plot.parametric": plot_parametric,
    "plot.polar": plot_polar,
    "plot.implicit": plot_implicit,
    "plot.surface3d": plot_surface3d,
    "plot.field": plot_field,
    "plot.svg": plot_svg,
}
