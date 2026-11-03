#!/usr/bin/env python
"""End-to-end protocol smoke test for the MathLab engine.

Spawns ``mathlab_engine.py`` as a real subprocess, writes ~30 line-delimited
JSON requests covering every operation group, and validates the responses.

Run from the project root::

    python engine/smoke.py [--verbose]

Exit code 0 means every response was well-formed and the math checked out.
"""

from __future__ import annotations

import json
import math
import os
import subprocess
import sys
import time

ENGINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mathlab_engine.py")

VERBOSE = "--verbose" in sys.argv or "-v" in sys.argv


class Failure(Exception):
    pass


def expect(condition, message: str) -> None:
    if not condition:
        raise Failure(message)


def result_of(response: dict) -> dict:
    expect(response.get("ok") is True, f"expected ok response, got {response}")
    return response["result"]


def near(actual, expected, tolerance=1e-9) -> bool:
    try:
        return abs(float(actual) - float(expected)) <= tolerance
    except (TypeError, ValueError):
        return False


# ---------------------------------------------------------------------------
# request definitions: (label, line-or-None, args, check, expect_error)
# ---------------------------------------------------------------------------


def check_meta(response):
    result = result_of(response)
    expect("calc" in result["capabilities"], "calc capability missing")
    expect("lean" in result, "lean block missing")
    expect(result["version"], "engine version missing")


def check_simplify(response):
    expect(result_of(response)["result"] == "1", "sin^2+cos^2 != 1")


def check_gaussian(response):
    result = result_of(response)
    expect(result["result"] == "sqrt(pi)", f"Gaussian integral = {result['result']}")
    expect(near(result["approx"], math.sqrt(math.pi), 1e-10), "Gaussian approx wrong")


def check_solve(response):
    result = result_of(response)
    values = sorted(value["result"] for value in result["solutions"][0]["values"])
    expect(values == ["-1", "1"], f"solutions = {values}")


def check_dsolve(response):
    expect(result_of(response)["solution"] == "cos(x)", "dsolve initial-value solution wrong")


def check_matrix(response):
    expect(result_of(response)["value"]["result"] == "-2", "det([[1,2],[3,4]]) != -2")


def check_number(response):
    expect(result_of(response)["value"] == [[2, 2], [3, 1]], "factorint(12) wrong")


def check_perm(response):
    result = result_of(response)
    expect(result["order"] == 2 and result["parity"] == "even", "permutation order/parity wrong")


def check_group(response):
    result = result_of(response)
    expect(result["order"] == 6, "S3 order != 6")
    sylow2 = [entry for entry in result["primes"] if entry["p"] == 2][0]
    expect(sylow2["count"] == 3, f"S3 Sylow-2 count = {sylow2['count']}")


def check_field(response):
    result = result_of(response)
    expect(result["value"]["poly"] == "x + 1", f"GF(4) x*x = {result['value']['poly']}")


def check_ring(response):
    expect(result_of(response)["value"] == [1, 5, 7, 11], "units of Z/12Z wrong")


def check_category_validate(response):
    expect(result_of(response)["valid"] is True, "walking-arrow category invalid")


def check_category_limit(response):
    result = result_of(response)
    expect(len(result["object"]) == 2, "product object size wrong")
    expect(result["projections"]["A"] == ["a1", "a2"], "product projection wrong")


def check_truthtable(response):
    result = result_of(response)
    expect(result["tautology"] is True, "A|~A not a tautology")


def check_prove(response):
    result = result_of(response)
    expect(result["valid"] is True, "A|~A not proved")
    expect(len(result["fitch"]) > 0, "empty Fitch proof")
    rules = {entry["rule"] for entry in result["fitch"]}
    expect("law-excluded-middle" in rules, "classical rule missing from proof")


def check_prove_fol(response):
    expect(result_of(response)["valid"] is True, "FOL syllogism not valid")


def check_modal(response):
    expect(result_of(response)["valid"] is True, "T-frame []A->A not valid")


def check_lean_info(response):
    result = result_of(response)
    expect("available" in result, "lean.info lacks availability")


def check_homology_circle(response):
    result = result_of(response)
    expect(result["betti"] == [1, 1], f"circle homology = {result['betti']}")


def check_homology_torus(response):
    result = result_of(response)
    expect(result["betti"] == [1, 2, 1], f"torus homology = {result['betti']}")
    expect(result["torsion"] == [[], [], []], f"torus torsion = {result['torsion']}")


def check_geometry(response):
    expect(result_of(response)["scalar"] == "2", "unit sphere scalar curvature != 2")


def check_root(response):
    expect(near(result_of(response)["root"], math.sqrt(2), 1e-10), "sqrt(2) root wrong")


def check_num_integrate(response):
    expect(near(result_of(response)["value"], math.sqrt(math.pi), 1e-8), "numeric Gaussian wrong")


def check_prob(response):
    result = result_of(response)
    expect(near(result["value"], 1 / math.sqrt(2 * math.pi), 1e-12), "normal pdf wrong")


def check_expectation(response):
    expect(near(result_of(response)["numeric"], 1.0, 1e-6), "E[X^2] for N(0,1) != 1")


def check_minimize(response):
    result = result_of(response)
    expect(result["success"] is True, "minimization unsuccessful")
    expect(near(result["point"]["x"], 1.0, 1e-3), "minimizer x wrong")


def check_stationary(response):
    expect(result_of(response)["points"][0]["classification"] == "minimum", "classification wrong")


def check_graph(response):
    expect(result_of(response)["path"] == ["a", "b", "c"], "shortest path wrong")


def check_plot_sample(response):
    curve = result_of(response)["curves"][0]
    expect(curve["valid"] is True, "sample curve invalid")
    expect(len(curve["points"][0]) == 120, "sample point count wrong")


def check_plot_svg(response):
    expect(result_of(response)["svg"].startswith("<svg"), "svg output malformed")


def check_help(response):
    expect("calc" in result_of(response)["text"], "help text lacks calc")


def check_error(code):
    def _check(response):
        expect(response.get("ok") is False, f"expected failure, got {response}")
        expect(response["error"]["code"] == code, f"expected {code}, got {response['error']}")
    return _check


REQUESTS = []

_AUTO_ID = object()


def add(label, op, args, check, request_id=_AUTO_ID, raw_line=None):
    if request_id is _AUTO_ID:
        request_id = len(REQUESTS) + 1
    line = raw_line if raw_line is not None else json.dumps({"id": request_id, "op": op, "args": args})
    REQUESTS.append((label, line, request_id, check))


add("meta.info", "meta.info", {}, check_meta)
add("help", "help", {"topic": "calc"}, check_help)
add("calc.simplify", "calc.simplify", {"expr": "sin(x)**2+cos(x)**2"}, check_simplify)
add("calc.integrate (Gaussian)", "calc.integrate",
    {"expr": "exp(-x**2)", "var": "x", "lower": "-oo", "upper": "oo"}, check_gaussian)
add("calc.solve", "calc.solve", {"equations": ["x**2-1=0"], "vars": ["x"]}, check_solve)
add("calc.dsolve", "calc.dsolve",
    {"eq": "y'' + y = 0", "func": "y", "var": "x", "ics": [{"x": 0, "y": 1}, {"x": 0, "dy": 0}]},
    check_dsolve)
add("calc.matrix", "calc.matrix", {"op": "det", "matrix": [[1, 2], [3, 4]]}, check_matrix)
add("calc.number", "calc.number", {"op": "factorint", "n": 12}, check_number)
add("algebra.perm", "algebra.perm", {"op": "order", "cycles": [[1, 2], [3, 4]]}, check_perm)
add("algebra.group (S3 Sylow)", "algebra.group",
    {"op": "sylow", "generators": [[[1, 2, 3]], [[1, 2]]]}, check_group)
add("algebra.finitefield", "algebra.finitefield", {"p": 2, "n": 2, "op": "mul", "a": "x", "b": "x"},
    check_field)
add("algebra.ring", "algebra.ring", {"op": "units", "n": 12}, check_ring)
add("category.validate", "category.validate",
    {"category": {
        "objects": [{"id": "A"}, {"id": "B"}],
        "morphisms": [{"id": "idA", "dom": "A", "cod": "A"}, {"id": "idB", "dom": "B", "cod": "B"},
                      {"id": "f", "dom": "A", "cod": "B"}],
        "identities": [{"object": "A", "morphism": "idA"}, {"object": "B", "morphism": "idB"}],
        "compositions": [
            {"first": "idA", "second": "idA", "result": "idA"},
            {"first": "idB", "second": "idB", "result": "idB"},
            {"first": "f", "second": "idB", "result": "f"},
            {"first": "idA", "second": "f", "result": "f"},
        ],
    }}, check_category_validate)
add("category.limit (product)", "category.limit",
    {"kind": "product", "sets": {"A": ["a1", "a2"], "B": ["b1"]}}, check_category_limit)
add("logic.truthtable", "logic.truthtable", {"formula": "A | ~A"}, check_truthtable)
add("logic.prove", "logic.prove", {"premises": [], "goal": "A | ~A"}, check_prove)
add("logic.prove_fol", "logic.prove_fol",
    {"premises": ["forall x. P(x)"], "goal": "P(a)"}, check_prove_fol)
add("logic.modal", "logic.modal", {"frame": "T", "formula": "[]A -> A", "worlds": 3}, check_modal)
add("lean.info", "lean.info", {}, check_lean_info)
add("lean.check (typed error when Lean absent)", "lean.check",
    {"code": "theorem t : 1 = 1 := rfl"}, check_error("unsupported"))
add("topology.homology (circle)", "topology.homology",
    {"simplices": {"0": [["a"], ["b"], ["c"]], "1": [["a", "b"], ["b", "c"], ["c", "a"]]}},
    check_homology_circle)
add("topology.homology (torus)", "topology.homology",
    {"simplices": {
        "0": [[index] for index in range(9)],
        "1": [
            [i * 3 + j, ((i + 1) % 3) * 3 + j] for i in range(3) for j in range(3)
        ] + [
            [i * 3 + j, i * 3 + (j + 1) % 3] for i in range(3) for j in range(3)
        ] + [
            [i * 3 + j, ((i + 1) % 3) * 3 + (j + 1) % 3] for i in range(3) for j in range(3)
        ],
        "2": [
            face
            for i in range(3)
            for j in range(3)
            for face in (
                [i * 3 + j, ((i + 1) % 3) * 3 + j, ((i + 1) % 3) * 3 + (j + 1) % 3],
                [i * 3 + j, ((i + 1) % 3) * 3 + (j + 1) % 3, i * 3 + (j + 1) % 3],
            )
        ],
    }}, check_homology_torus)
add("geometry.curvature (S2)", "geometry.curvature",
    {"coords": ["t", "p"], "metric": [["1", "0"], ["0", "sin(t)**2"]]}, check_geometry)
add("num.root", "num.root", {"expr": "x**2-2", "var": "x", "bracket": [0, 2]}, check_root)
add("num.integrate", "num.integrate", {"expr": "exp(-x**2)", "range": [-10, 10]}, check_num_integrate)
add("prob.dist", "prob.dist", {"dist": "normal", "params": {"mu": 0, "sigma": 1}, "op": "pdf", "x": 0},
    check_prob)
add("prob.expectation", "prob.expectation",
    {"expr": "x**2", "dist": "normal", "params": {"mu": 0, "sigma": 1}}, check_expectation)
add("opt.minimize", "opt.minimize", {"expr": "(x-1)**2 + (y-2)**2", "vars": ["x", "y"]}, check_minimize)
add("opt.stationary", "opt.stationary", {"expr": "x**2 + y**2", "vars": ["x", "y"]}, check_stationary)
add("graph.analyze", "graph.analyze",
    {"edges": [["a", "b"], ["b", "c"]], "op": "shortest_path", "source": "a", "target": "c"},
    check_graph)
add("plot.sample", "plot.sample", {"expr": "sin(x)", "range": [-5, 5], "samples": 120},
    check_plot_sample)
add("plot.svg", "plot.svg", {"kind": "sample", "expr": "sin(x)", "samples": 80}, check_plot_svg)
add("unknown-op", "nope.op", {}, check_error("unknown-op"))
add("over-limit expression", "calc.simplify", {"expr": "x" * 4001}, check_error("limit"))
add("malformed JSON line", None, None, check_error("bad-request"), request_id=None, raw_line="{not json")


def main() -> int:
    if not os.path.isfile(ENGINE):
        print(f"FAIL: engine not found at {ENGINE}", file=sys.stderr)
        return 2
    lines = [line for _, line, _, _ in REQUESTS]
    stdin_data = "\n".join(lines) + "\n"
    started = time.time()
    try:
        process = subprocess.run(
            [sys.executable, "-u", ENGINE],
            input=stdin_data,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=180,
            cwd=os.path.dirname(ENGINE) or None,
        )
    except subprocess.TimeoutExpired:
        print("FAIL: engine did not finish within 180s", file=sys.stderr)
        return 2
    elapsed = time.time() - started
    stdout_lines = [line for line in process.stdout.splitlines() if line.strip()]
    failures = 0
    if len(stdout_lines) != len(REQUESTS):
        print(
            f"FAIL: expected {len(REQUESTS)} response lines, got {len(stdout_lines)}",
            file=sys.stderr,
        )
        for line in stdout_lines[len(REQUESTS):][:5]:
            print(f"  extra: {line[:200]}", file=sys.stderr)
        failures += 1
    if "ready" not in process.stderr:
        print("WARN: no ready line seen on stderr", file=sys.stderr)
    for index, (label, _line, request_id, check) in enumerate(REQUESTS):
        if index >= len(stdout_lines):
            break
        raw = stdout_lines[index]
        try:
            response = json.loads(raw)
        except json.JSONDecodeError as exc:
            print(f"FAIL [{label}]: response is not JSON ({exc}): {raw[:160]}", file=sys.stderr)
            failures += 1
            continue
        if request_id is not None and response.get("id") != request_id:
            print(f"FAIL [{label}]: id {response.get('id')!r} != {request_id!r}", file=sys.stderr)
            failures += 1
            continue
        try:
            check(response)
            if VERBOSE:
                print(f"ok   {label}")
        except Failure as exc:
            print(f"FAIL [{label}]: {exc}", file=sys.stderr)
            failures += 1
    if process.returncode not in (0, None):
        print(f"FAIL: engine exited with code {process.returncode}", file=sys.stderr)
        failures += 1
    print(
        f"{'PASS' if failures == 0 else 'FAIL'}: {len(REQUESTS) - failures}/{len(REQUESTS)} "
        f"protocol requests in {elapsed:.2f}s (python {sys.version.split()[0]})"
    )
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
