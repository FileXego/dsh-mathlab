"""MathLab engine test suite (stdlib unittest).

Run from the project root::

    python -m unittest discover -s engine/tests -v

The suite mostly drives ``mathlab_engine.dispatch`` directly, plus a few
protocol-envelope tests through ``process_line`` so error mapping is covered
without spawning a subprocess (engine/smoke.py exercises the real pipe).
"""

from __future__ import annotations

import json
import math
import os
import sys
import unittest

ENGINE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

import mathlab_engine  # noqa: E402
from mlcore import EngineError  # noqa: E402


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------


def call(op: str, args: dict | None = None) -> dict:
    return mathlab_engine.dispatch(op, args or {})


def envelope(op: str, args: dict | None = None, request_id="t1") -> dict:
    line = json.dumps({"id": request_id, "op": op, "args": args or {}})
    return mathlab_engine.process_line(line)


def error_code(op: str, args: dict | None = None) -> str:
    response = envelope(op, args)
    if response.get("ok"):
        raise AssertionError(f"expected {op} to fail")
    return response["error"]["code"]


def matrix(values):
    return [[str(value) for value in row] for row in values]


class TestProtocol(unittest.TestCase):
    def test_meta_info(self):
        result = call("meta.info")
        for key in ("version", "python", "sympy", "numpy", "scipy", "networkx", "capabilities"):
            self.assertIn(key, result)
        self.assertIn("lean", result)
        self.assertIn("calc", result["capabilities"])
        for group in ("calc", "algebra", "category", "logic", "lean", "topology",
                      "geometry", "num", "prob", "opt", "graph", "plot"):
            self.assertIn(group, result["capabilities"], group)

    def test_help(self):
        result = call("help", {})
        self.assertIn("text", result)
        self.assertIn("calc", result["text"])
        topic = call("help", {"topic": "logic"})
        self.assertEqual(topic["topic"], "logic")
        self.assertIn("natural", topic["text"])

    def test_unknown_op(self):
        self.assertEqual(error_code("does.not.exist"), "unknown-op")

    def test_bad_request_shapes(self):
        self.assertEqual(mathlab_engine.process_line("{not json")["error"]["code"], "bad-request")
        self.assertEqual(
            mathlab_engine.process_line(json.dumps({"op": "calc.simplify"}))["error"]["code"],
            "bad-request",
        )
        self.assertEqual(
            mathlab_engine.process_line(json.dumps({"id": 1, "op": "calc.simplify", "args": []}))[
                "error"
            ]["code"],
            "bad-request",
        )

    def test_envelope_roundtrip(self):
        response = envelope("calc.simplify", {"expr": "x + x"}, request_id=42)
        self.assertEqual(response["id"], 42)
        self.assertTrue(response["ok"])
        self.assertEqual(response["result"]["result"], "2*x")

    def test_injection_is_rejected(self):
        response = envelope("calc.simplify", {"expr": "__import__('os').system('echo hi')"})
        self.assertFalse(response["ok"])
        self.assertIn(response["error"]["code"], ("parse-error", "bad-request"))

    def test_limits(self):
        self.assertEqual(error_code("calc.simplify", {"expr": "x" * 4001}), "limit")
        self.assertEqual(
            error_code("calc.matrix", {"op": "det", "matrix": [[1] * 13 for _ in range(13)]}),
            "limit",
        )
        self.assertEqual(
            error_code("algebra.group", {"op": "order", "generators": [[list(range(1, 10002))]]}),
            "limit",
        )

    def test_json_has_no_nan(self):
        response = call("calc.integrate", {"expr": "x", "lower": "0", "upper": "oo"})
        serialized = json.dumps(response, allow_nan=False)
        self.assertIn("oo", serialized)


class TestCalc(unittest.TestCase):
    def test_symbolic_transforms(self):
        self.assertEqual(call("calc.simplify", {"expr": "sin(x)**2 + cos(x)**2"})["result"], "1")
        self.assertEqual(call("calc.simplify", {"expr": "(x**2-1)/(x-1)"})["result"], "x + 1")
        expanded = call("calc.expand", {"expr": "(x+1)**3"})["result"]
        self.assertIn("x**3", expanded)
        self.assertEqual(call("calc.factor", {"expr": "x**2-1"})["result"], "(x - 1)*(x + 1)")
        apart = call("calc.apart", {"expr": "1/(x*(x+1))", "var": "x"})["result"]
        self.assertIn("1/x", apart)
        self.assertEqual(call("calc.cancel", {"expr": "x/x"})["result"], "1")
        rationalized = call("calc.rationalize", {"expr": "1/sqrt(2)"})["result"]
        self.assertIn("sqrt(2)", rationalized)

    def test_calculus(self):
        self.assertEqual(call("calc.diff", {"expr": "x**3", "var": "x"})["result"], "3*x**2")
        self.assertEqual(
            call("calc.diff", {"expr": "sin(x)", "var": "x", "order": 2})["result"], "-sin(x)"
        )
        gaussian = call(
            "calc.integrate", {"expr": "exp(-x**2)", "var": "x", "lower": "-oo", "upper": "oo"}
        )
        self.assertEqual(gaussian["result"], "sqrt(pi)")
        self.assertAlmostEqual(float(gaussian["approx"]), math.sqrt(math.pi), places=12)
        self.assertEqual(
            call("calc.integrate", {"expr": "x**2", "var": "x"})["result"], "x**3/3"
        )
        self.assertEqual(call("calc.limit", {"expr": "sin(x)/x", "point": "0"})["result"], "1")
        self.assertEqual(call("calc.limit", {"expr": "1/x", "point": "0", "direction": "+"})["result"], "oo")
        series_result = call("calc.series", {"expr": "exp(x)", "var": "x", "order": 4})["result"]
        self.assertIn("x**3", series_result)
        geometric = call("calc.sum", {"expr": "x**n", "var": "n", "lower": 0, "upper": "oo"})
        self.assertIn("1 - x", geometric["result"])
        product = call("calc.product", {"expr": "n", "var": "n", "lower": 1, "upper": "m"})
        self.assertEqual(product["result"], "factorial(m)")

    def test_solve(self):
        result = call("calc.solve", {"equations": ["x**2-1=0"], "vars": ["x"]})
        values = sorted(value["result"] for value in result["solutions"][0]["values"])
        self.assertEqual(values, ["-1", "1"])
        system = call(
            "calc.solve", {"equations": ["x+y=3", "x-y=1"], "vars": ["x", "y"]}
        )
        by_var = {entry["var"]: [value["result"] for value in entry["values"]] for entry in system["solutions"]}
        self.assertEqual(by_var["x"], ["2"])
        self.assertEqual(by_var["y"], ["1"])

    def test_dsolve(self):
        result = call(
            "calc.dsolve",
            {
                "eq": "y'' + y = 0",
                "func": "y",
                "var": "x",
                "ics": [{"x": 0, "y": 1}, {"x": 0, "dy": 0}],
            },
        )
        self.assertEqual(result["solution"], "cos(x)")
        self.assertEqual(result["order"], 2)
        self.assertIn("nth_linear_constant_coeff_homogeneous", result["classification"])

    def test_approx(self):
        result = call("calc.approx", {"expr": "sin(x)", "subs": {"x": 0.5}})
        self.assertAlmostEqual(float(result["value"]), math.sin(0.5), places=12)

    def test_matrix(self):
        det = call("calc.matrix", {"op": "det", "matrix": [[1, 2], [3, 4]]})
        self.assertEqual(det["value"]["result"], "-2")
        inverse = call("calc.matrix", {"op": "inv", "matrix": [[1, 2], [3, 4]]})
        self.assertEqual(inverse["matrix"][0][0], "-2")
        rank = call("calc.matrix", {"op": "rank", "matrix": [[1, 2], [2, 4]]})
        self.assertEqual(rank["rank"], 1)
        rref = call("calc.matrix", {"op": "rref", "matrix": [[1, 2], [3, 4]]})
        self.assertEqual(rref["rank"], 2)
        eigen = call("calc.matrix", {"op": "eigen", "matrix": [[2, 0], [0, 3]]})
        self.assertEqual(sorted(value["result"] for value in eigen["values"]), ["2", "3"])
        charpoly = call("calc.matrix", {"op": "charpoly", "matrix": [[1, 2], [3, 4]]})
        self.assertIn("lambda", charpoly["result"])
        nullspace = call("calc.matrix", {"op": "nullspace", "matrix": [[1, 2], [2, 4]]})
        self.assertEqual(nullspace["dimension"], 1)
        solve = call("calc.matrix", {"op": "solve", "matrix": [[1, 1], [1, -1]], "rhs": [2, 0]})
        self.assertEqual([value["result"] for value in solve["solution"][0]], ["1", "1"])
        least_squares = call(
            "calc.matrix", {"op": "lstsq", "matrix": [[1, 0], [0, 1], [1, 1]], "rhs": [1, 2, 3]}
        )
        self.assertEqual(len(least_squares["solution"]), 2)
        svd = call("calc.matrix", {"op": "svd", "matrix": [[1, 2], [3, 4]]})
        self.assertIn("U", svd)
        self.assertEqual(len(svd["S"]), 2)
        singular = envelope("calc.matrix", {"op": "inv", "matrix": [[1, 1], [1, 1]]})
        self.assertEqual(singular["error"]["code"], "domain-error")

    def test_vector(self):
        grad = call("calc.vector", {"op": "grad", "expr": "x**2*y", "vars": ["x", "y"]})
        self.assertEqual([item["result"] for item in grad["vector"]], ["2*x*y", "x**2"])
        curl = call(
            "calc.vector", {"op": "curl", "components": ["y", "-x", "0"], "vars": ["x", "y", "z"]}
        )
        self.assertEqual([item["result"] for item in curl["vector"]], ["0", "0", "-2"])
        div = call(
            "calc.vector", {"op": "div", "components": ["x", "y", "z"], "vars": ["x", "y", "z"]}
        )
        self.assertEqual(div["result"]["result"], "3")
        dot = call("calc.vector", {"op": "dot", "components": ["1", "2"], "other": ["3", "4"]})
        self.assertEqual(dot["result"]["result"], "11")
        cross = call(
            "calc.vector",
            {"op": "cross", "components": ["1", "0", "0"], "other": ["0", "1", "0"]},
        )
        self.assertEqual([item["result"] for item in cross["vector"]], ["0", "0", "1"])
        norm = call("calc.vector", {"op": "norm", "components": ["3", "4"]})
        self.assertEqual(norm["result"]["result"], "5")

    def test_number_theory(self):
        self.assertEqual(call("calc.number", {"op": "factorint", "n": 12})["value"], [[2, 2], [3, 1]])
        self.assertTrue(call("calc.number", {"op": "isprime", "n": 97})["value"])
        self.assertFalse(call("calc.number", {"op": "isprime", "n": 91})["value"])
        self.assertEqual(call("calc.number", {"op": "totient", "n": 10})["value"], 4)
        self.assertEqual(call("calc.number", {"op": "divisors", "n": 28})["value"][-1], 28)
        self.assertEqual(call("calc.number", {"op": "gcd", "n": 12, "k": 18})["value"], 6)
        self.assertEqual(call("calc.number", {"op": "lcm", "n": 4, "k": 6})["value"], 12)
        self.assertEqual(call("calc.number", {"op": "modinv", "n": 3, "modulus": 11})["value"], 4)
        self.assertEqual(call("calc.number", {"op": "crt", "pairs": [[2, 3], [3, 5]]})["value"], 8)
        self.assertEqual(call("calc.number", {"op": "fibonacci", "n": 10})["value"], 55)
        self.assertEqual(call("calc.number", {"op": "binomial", "n": 10, "k": 3})["value"], 120)
        self.assertEqual(call("calc.number", {"op": "mobius", "n": 30})["value"], -1)
        self.assertEqual(call("calc.ntheory", {"op": "isprime", "n": 7})["value"], True)

    def test_parse_errors(self):
        self.assertEqual(error_code("calc.simplify", {"expr": "sin("}), "parse-error")
        self.assertEqual(error_code("calc.simplify", {"expr": ""}), "parse-error")
        self.assertEqual(error_code("calc.simplify", {"expr": "2 + *"}), "parse-error")
        with self.assertRaises(EngineError):
            call("calc.number", {"op": "factorint", "n": 0})


class TestAlgebra(unittest.TestCase):
    def test_perm(self):
        result = call("algebra.perm", {"op": "multiply", "cycles": [[1, 2, 3]], "other": [[1, 2]]})
        self.assertEqual(result["cycles"], [[2, 3]])
        self.assertEqual(result["order"], 2)
        self.assertEqual(result["parity"], "odd")
        inverse = call("algebra.perm", {"op": "inverse", "cycles": [[1, 2, 3]]})
        self.assertEqual(inverse["mapping"], [3, 1, 2])
        mapping = call("algebra.perm", {"op": "from_mapping", "mapping": [2, 1, 3]})
        self.assertEqual(mapping["cycles"], [[1, 2]])
        sign = call("algebra.perm", {"op": "sign", "cycles": [[1, 2, 3, 4]]})
        self.assertEqual(sign["parity"], "odd")
        self.assertEqual(sign["cycle_type"], "4")

    def _s3(self):
        return {"generators": [[[1, 2, 3]], [[1, 2]]]}

    def test_group_basics(self):
        self.assertEqual(call("algebra.group", {"op": "order", **self._s3()})["order"], 6)
        elements = call("algebra.group", {"op": "elements", **self._s3()})
        self.assertEqual(len(elements["elements"]), 6)
        self.assertFalse(call("algebra.group", {"op": "is_abelian", **self._s3()})["value"])
        self.assertTrue(call("algebra.group", {"op": "is_solvable", **self._s3()})["value"])
        table = call("algebra.group", {"op": "cayley_table", **self._s3()})
        self.assertEqual(len(table["elements"]), 6)
        self.assertEqual(len(table["table"]), 6)
        orders = call("algebra.group", {"op": "element_orders", **self._s3()})
        self.assertEqual(orders["multiplicities"]["2"], 3)

    def test_sylow_s3(self):
        result = call("algebra.group", {"op": "sylow", **self._s3()})
        primes = {entry["p"]: entry for entry in result["primes"]}
        self.assertEqual(primes[2]["count"], 3)
        self.assertEqual(primes[3]["count"], 1)

    def test_subgroups_and_lattice(self):
        subgroups = call("algebra.group", {"op": "subgroups", **self._s3()})
        self.assertEqual(len(subgroups["subgroups"]), 6)
        self.assertEqual(sorted(entry["order"] for entry in subgroups["subgroups"]), [1, 2, 2, 2, 3, 6])
        lattice = call("algebra.group", {"op": "subgroup_lattice", **self._s3()})
        self.assertGreaterEqual(len(lattice["nodes"]), 6)
        self.assertGreaterEqual(len(lattice["edges"]), 4)
        normal = call("algebra.group", {"op": "normal_subgroups", **self._s3()})
        self.assertEqual(sorted(entry["order"] for entry in normal["subgroups"]), [1, 3, 6])
        center = call("algebra.group", {"op": "center", **self._s3()})
        self.assertTrue(center["is_trivial"])
        self.assertEqual(call("algebra.group", {"op": "is_simple", **self._s3()})["value"], False)

    def test_quotient(self):
        result = call(
            "algebra.group",
            {"op": "quotient", **self._s3(), "normal": [[[1, 2, 3]]]},
        )
        self.assertEqual(result["order"], 2)
        self.assertTrue(result["abelian"])
        self.assertEqual(result["name"], "C2")

    def test_homomorphism(self):
        trivial = call(
            "algebra.group",
            {
                "op": "homomorphism",
                "generators": [[[1, 2, 3]], [[1, 2]]],
                "target_generators": [[[1, 2]]],
                "images": [[], []],
            },
        )
        self.assertTrue(trivial["valid"])
        self.assertEqual(trivial["kernel_order"], 6)
        invalid = call(
            "algebra.group",
            {
                "op": "homomorphism",
                **self._s3(),
                "target_generators": [[[1, 2, 3]], [[1, 2]]],
                "images": [[[1, 2]], []],
            },
        )
        self.assertFalse(invalid["valid"])
        self.assertIn("reason", invalid)

    def test_permutation_group_of_order_6_with_3_sylow2(self):
        # acceptance example: S3 has order 6 and exactly three Sylow-2 subgroups
        result = call("algebra.group", {"op": "sylow", **self._s3()})
        sylow2 = [entry for entry in result["primes"] if entry["p"] == 2][0]
        self.assertEqual(result["order"], 6)
        self.assertEqual(sylow2["count"], 3)

    def test_finite_field(self):
        result = call("algebra.finitefield", {"p": 2, "n": 2, "op": "mul", "a": "x", "b": "x"})
        self.assertEqual(result["value"]["poly"], "x + 1")
        self.assertEqual(result["value"]["int"], 3)
        self.assertEqual(result["irreducible_poly"], [1, 1, 1])
        inverse = call("algebra.finitefield", {"p": 2, "n": 2, "op": "inv", "a": "x"})
        self.assertEqual(inverse["value"]["int"], 3)
        table = call("algebra.finitefield", {"p": 2, "n": 2, "op": "table"})
        self.assertEqual(len(table["add"]), 4)
        self.assertEqual(table["add"][2][2], 0)
        order = call("algebra.finitefield", {"p": 3, "n": 1, "op": "order"})
        self.assertEqual(order["value"], 2)
        primitive = call("algebra.finitefield", {"p": 2, "n": 3, "op": "primitive_element"})
        self.assertEqual(primitive["order"], 7)
        irreducible = call("algebra.finitefield", {"p": 2, "n": 1, "op": "is_irreducible", "a": "x^2+x+1"})
        self.assertTrue(irreducible["value"])

    def test_polynomial(self):
        roots = call("algebra.poly", {"coeffs": [-1, 0, 1], "op": "roots"})
        self.assertEqual(sorted(value["result"] for value in roots["roots"]), ["-1", "1"])
        factor = call("algebra.poly", {"coeffs": [1, 0, 1], "p": 2, "op": "factor"})
        self.assertEqual(factor["factors"][0]["poly"], "x + 1")
        self.assertEqual(factor["factors"][0]["multiplicity"], 2)
        irreducible = call("algebra.poly", {"coeffs": [1, 0, 1], "op": "is_irreducible"})
        self.assertTrue(irreducible["value"])
        degree = call("algebra.poly", {"coeffs": [1, 2, 3], "op": "degree"})
        self.assertEqual(degree["value"], 2)
        evaluate = call("algebra.poly", {"coeffs": [-1, 0, 1], "op": "evaluate", "at": 3})
        self.assertEqual(evaluate["value"]["result"], "8")
        gcd = call("algebra.poly", {"coeffs": [-1, 0, 1], "other": [1, -1], "op": "gcd"})
        self.assertIn("x - 1", gcd["value"])

    def test_ring(self):
        units = call("algebra.ring", {"op": "units", "n": 12})
        self.assertEqual(units["value"], [1, 5, 7, 11])
        self.assertTrue(call("algebra.ring", {"op": "is_field", "n": 13})["value"])
        self.assertFalse(call("algebra.ring", {"op": "is_field", "n": 12})["value"])
        self.assertTrue(call("algebra.ring", {"op": "is_integral_domain", "n": 7})["value"])
        zeros = call("algebra.ring", {"op": "zero_divisors", "n": 12})
        self.assertIn(6, zeros["value"])
        table = call("algebra.ring", {"op": "addition_table", "n": 3})
        self.assertEqual(table["table"][2][2], 1)


class TestCategory(unittest.TestCase):
    def _walking_arrow(self):
        return {
            "objects": [{"id": "A", "label": "A"}, {"id": "B", "label": "B"}],
            "morphisms": [
                {"id": "idA", "dom": "A", "cod": "A"},
                {"id": "idB", "dom": "B", "cod": "B"},
                {"id": "f", "dom": "A", "cod": "B"},
            ],
            "identities": [{"object": "A", "morphism": "idA"}, {"object": "B", "morphism": "idB"}],
            "compositions": [
                {"first": "idA", "second": "idA", "result": "idA"},
                {"first": "idB", "second": "idB", "result": "idB"},
                {"first": "f", "second": "idB", "result": "f"},
                {"first": "idA", "second": "f", "result": "f"},
            ],
        }

    def test_validate(self):
        result = call("category.validate", {"category": self._walking_arrow()})
        self.assertTrue(result["valid"])
        self.assertEqual(result["summary"]["objects"], 2)
        self.assertEqual(result["summary"]["morphisms"], 3)
        broken = self._walking_arrow()
        broken["compositions"] = broken["compositions"][:2]
        result = call("category.validate", {"category": broken})
        self.assertFalse(result["valid"])
        codes = {violation["code"] for violation in result["violations"]}
        self.assertIn("missing-composite", codes)

    def test_compose(self):
        result = call(
            "category.compose",
            {"category": self._walking_arrow(), "first": "f", "second": "idB"},
        )
        self.assertEqual(result["result"], "f")
        response = envelope(
            "category.compose",
            {"category": self._walking_arrow(), "first": "idA", "second": "idA"},
        )
        self.assertTrue(response["ok"])

    def test_functor(self):
        identity_functor = {
            "onObjects": [{"from": "A", "to": "A"}, {"from": "B", "to": "B"}],
            "onMorphisms": [
                {"from": "idA", "to": "idA"},
                {"from": "idB", "to": "idB"},
                {"from": "f", "to": "f"},
            ],
        }
        result = call(
            "category.functor",
            {"source": self._walking_arrow(), "target": self._walking_arrow(), **identity_functor},
        )
        self.assertTrue(result["valid"])
        self.assertTrue(result["laws"]["identity"])
        self.assertTrue(result["laws"]["composition"])
        bad = call(
            "category.functor",
            {
                "source": self._walking_arrow(),
                "target": self._walking_arrow(),
                "onObjects": [{"from": "A", "to": "A"}, {"from": "B", "to": "A"}],
                "onMorphisms": [
                    {"from": "idA", "to": "idA"},
                    {"from": "idB", "to": "idA"},
                    {"from": "f", "to": "idB"},
                ],
            },
        )
        self.assertFalse(bad["valid"])

    def test_natural_transformation(self):
        identity_functor = {
            "onObjects": [{"from": "A", "to": "A"}, {"from": "B", "to": "B"}],
            "onMorphisms": [
                {"from": "idA", "to": "idA"},
                {"from": "idB", "to": "idB"},
                {"from": "f", "to": "f"},
            ],
        }
        result = call(
            "category.natural",
            {
                "source": self._walking_arrow(),
                "target": self._walking_arrow(),
                "F": identity_functor,
                "G": identity_functor,
                "components": [
                    {"object": "A", "morphism": "idA"},
                    {"object": "B", "morphism": "idB"},
                ],
            },
        )
        self.assertTrue(result["valid"])
        self.assertEqual(len(result["naturality"]), 3)
        self.assertTrue(all(entry["square"]["ok"] for entry in result["naturality"]))

    def test_verify_diagram(self):
        result = call(
            "category.verify_diagram",
            {"category": self._walking_arrow(), "pairs": [{"from": "A", "to": "B"}]},
        )
        self.assertTrue(result["ok"])
        pair = result["pairs"][0]
        self.assertEqual(pair["paths"], [["f"]])
        self.assertTrue(pair["equal"])
        triangle = {
            "objects": [{"id": "A"}, {"id": "B"}, {"id": "C"}],
            "morphisms": [
                {"id": "idA", "dom": "A", "cod": "A"},
                {"id": "idB", "dom": "B", "cod": "B"},
                {"id": "idC", "dom": "C", "cod": "C"},
                {"id": "f", "dom": "A", "cod": "B"},
                {"id": "g", "dom": "B", "cod": "C"},
                {"id": "h", "dom": "A", "cod": "C"},
            ],
            "identities": [
                {"object": "A", "morphism": "idA"},
                {"object": "B", "morphism": "idB"},
                {"object": "C", "morphism": "idC"},
            ],
            "compositions": [
                {"first": "idA", "second": "idA", "result": "idA"},
                {"first": "idB", "second": "idB", "result": "idB"},
                {"first": "idC", "second": "idC", "result": "idC"},
                {"first": "f", "second": "idB", "result": "f"},
                {"first": "idA", "second": "f", "result": "f"},
                {"first": "g", "second": "idC", "result": "g"},
                {"first": "idB", "second": "g", "result": "g"},
                {"first": "h", "second": "idC", "result": "h"},
                {"first": "idA", "second": "h", "result": "h"},
                {"first": "f", "second": "g", "result": "h"},
            ],
        }
        commutative = call(
            "category.verify_diagram",
            {"category": triangle, "pairs": [{"from": "A", "to": "C"}]},
        )
        self.assertTrue(commutative["ok"])
        self.assertEqual(commutative["pairs"][0]["paths"], [["h"], ["f", "g"]])
        self.assertEqual(commutative["pairs"][0]["composites"], ["h", "h"])

    def test_limits(self):
        product = call("category.limit", {"kind": "product", "sets": {"A": ["a1", "a2"], "B": ["b1"]}})
        self.assertEqual(len(product["object"]), 2)
        self.assertEqual(product["projections"]["A"], ["a1", "a2"])
        coproduct = call(
            "category.limit", {"kind": "coproduct", "sets": {"A": ["a1"], "B": ["b1"]}}
        )
        self.assertEqual(coproduct["object"][0], {"tag": "A", "value": "a1"})
        equalizer = call(
            "category.limit",
            {"kind": "equalizer", "domain": ["x1", "x2", "x3"], "codomain": ["c1", "c2"], "f": [0, 1, 1], "g": [0, 0, 1]},
        )
        self.assertEqual(equalizer["object"], [0, 2])
        coequalizer = call(
            "category.limit", {"kind": "coequalizer", "codomain": ["c1", "c2", "c3"], "f": [0], "g": [1]}
        )
        self.assertEqual(coequalizer["object"], [["c1", "c2"], ["c3"]])
        self.assertEqual(coequalizer["quotientMap"], [0, 0, 1])
        pullback = call(
            "category.limit",
            {"kind": "pullback", "A": ["a1", "a2"], "B": ["b1"], "C": ["c1", "c2"], "f": [0, 1], "g": [0]},
        )
        self.assertEqual(pullback["object"], [["a1", "b1"]])
        pushout = call(
            "category.limit",
            {"kind": "pushout", "C": ["c1"], "A": ["a1"], "B": ["b1", "b2"], "f": [0], "g": [1]},
        )
        self.assertEqual(len(pushout["object"]), 2)
        self.assertEqual(pushout["injections"]["A"], [0])
        self.assertEqual(call("category.limit", {"kind": "terminal"})["object"], [None])
        self.assertEqual(call("category.limit", {"kind": "initial"})["object"], [])

    def test_equivalence(self):
        identity_functor = {
            "onObjects": [{"from": "A", "to": "A"}, {"from": "B", "to": "B"}],
            "onMorphisms": [
                {"from": "idA", "to": "idA"},
                {"from": "idB", "to": "idB"},
                {"from": "f", "to": "f"},
            ],
        }
        result = call(
            "category.equivalence",
            {"source": self._walking_arrow(), "target": self._walking_arrow(), "functor": identity_functor},
        )
        self.assertTrue(result["valid"])
        self.assertTrue(result["faithful"])
        self.assertTrue(result["full"])
        self.assertTrue(result["dense"])


class TestLogic(unittest.TestCase):
    def test_parse(self):
        prop = call("logic.parse", {"formula": "A & ~B -> C"})
        self.assertTrue(prop["wellFormed"])
        self.assertEqual(prop["atoms"], ["A", "B", "C"])
        fol = call("logic.parse", {"formula": "forall x. P(x) -> exists y. Q(y)", "logic": "fol"})
        self.assertTrue(fol["wellFormed"])
        self.assertEqual(fol["predicates"], {"P": 1, "Q": 1})
        modal = call("logic.parse", {"formula": "[]A -> <>B", "logic": "modal"})
        self.assertTrue(modal["wellFormed"])
        broken = call("logic.parse", {"formula": "A &"})
        self.assertFalse(broken["wellFormed"])

    def test_truthtable(self):
        tautology = call("logic.truthtable", {"formula": "A | ~A"})
        self.assertTrue(tautology["tautology"])
        self.assertTrue(tautology["satisfiable"])
        self.assertEqual(tautology["cnf"], "T")
        self.assertEqual(tautology["dnf"], "T")
        contradiction = call("logic.truthtable", {"formula": "A & ~A"})
        self.assertTrue(contradiction["contradiction"])
        self.assertFalse(contradiction["satisfiable"])
        rows = call("logic.truthtable", {"formula": "A -> B"})
        self.assertEqual(len(rows["rows"]), 4)
        self.assertIn("~A", rows["cnf"])

    def test_prove_classical(self):
        result = call("logic.prove", {"premises": [], "goal": "A | ~A"})
        self.assertTrue(result["valid"])
        self.assertIsNotNone(result["proof"])
        self.assertTrue(result["fitch"])
        rules = {entry["rule"] for entry in result["fitch"]}
        self.assertIn("law-excluded-middle", rules)
        self.assertIn("or-elim", rules)
        for entry in result["fitch"]:
            self.assertIn("line", entry)
            self.assertIn("indent", entry)
            self.assertEqual(set(entry), {"line", "indent", "text", "rule", "conclusion", "refs"})
        implication = call("logic.prove", {"premises": ["P", "P -> Q"], "goal": "Q"})
        self.assertTrue(implication["valid"])
        self.assertEqual(implication["proof"]["conclusion"], "Q")

    def test_prove_invalid(self):
        result = call("logic.prove", {"premises": [], "goal": "A"})
        self.assertFalse(result["valid"])
        self.assertEqual(result["countermodel"]["assignment"], {"A": False})

    def test_prove_fol(self):
        valid = call(
            "logic.prove_fol", {"premises": ["forall x. P(x)"], "goal": "P(a)"}
        )
        self.assertTrue(valid["valid"])
        self.assertGreater(valid["searched"], 0)
        invalid = call("logic.prove_fol", {"premises": ["P(a)"], "goal": "forall x. P(x)"})
        self.assertFalse(invalid["valid"])
        self.assertEqual(invalid["countermodel"]["domainSize"], 2)
        self.assertIn("P", invalid["countermodel"]["predicates"])

    def test_resolve(self):
        result = call("logic.resolve", {"premises": ["P -> Q", "P"], "goal": "Q"})
        self.assertTrue(result["refutable"])
        self.assertTrue(any("[]" in step[2] for step in result["steps"]))
        not_refutable = call("logic.resolve", {"premises": ["P"], "goal": "Q"})
        self.assertFalse(not_refutable["refutable"])

    def test_modal(self):
        valid_t = call("logic.modal", {"frame": "T", "formula": "[]A -> A", "worlds": 3})
        self.assertTrue(valid_t["valid"])
        invalid_k = call("logic.modal", {"frame": "K", "formula": "[]A -> A", "worlds": 3})
        self.assertFalse(invalid_k["valid"])
        self.assertIn("countermodel", invalid_k)
        valid_s5 = call("logic.modal", {"frame": "S5", "formula": "<>A -> []<>A", "worlds": 3})
        self.assertTrue(valid_s5["valid"])

    def test_equivalent(self):
        equivalent = call("logic.equivalent", {"a": "A -> B", "b": "~A | B"})
        self.assertTrue(equivalent["equivalent"])
        different = call("logic.equivalent", {"a": "A", "b": "B"})
        self.assertFalse(different["equivalent"])
        self.assertIsNotNone(different["countermodel"])


class TestLean(unittest.TestCase):
    def test_info(self):
        info = call("lean.info")
        self.assertIn("available", info)
        self.assertIn("note", info)
        if not info["available"]:
            self.assertIsNone(info["version"])
            self.assertIsNone(info["path"])

    def test_check_unavailable_is_typed(self):
        info = call("lean.info")
        if info["available"]:
            self.skipTest("Lean toolchain is installed on this machine")
        response = envelope("lean.check", {"code": "theorem t : 1 = 1 := rfl"})
        self.assertFalse(response["ok"])
        self.assertEqual(response["error"]["code"], "unsupported")
        self.assertIn("Lean toolchain not found", response["error"]["message"])

    def test_version(self):
        version = call("lean.version")
        self.assertIn("version", version)
        self.assertIn("path", version)
        self.assertIn("available", version)


class TestTopology(unittest.TestCase):
    def test_circle_homology(self):
        circle = {
            "0": [["a"], ["b"], ["c"]],
            "1": [["a", "b"], ["b", "c"], ["c", "a"]],
        }
        result = call("topology.homology", {"simplices": circle})
        self.assertEqual(result["betti"], [1, 1])
        self.assertEqual(result["torsion"], [[], []])
        self.assertEqual(result["euler"], 0)

    def test_torus_homology(self):
        vertices = list(range(9))

        def index(i, j):
            return i * 3 + j

        edges = []
        faces = []
        for i in range(3):
            for j in range(3):
                edges.append([index(i, j), index((i + 1) % 3, j)])
                edges.append([index(i, j), index(i, (j + 1) % 3)])
                faces.append([index(i, j), index((i + 1) % 3, j), index((i + 1) % 3, (j + 1) % 3)])
                faces.append([index(i, j), index((i + 1) % 3, (j + 1) % 3), index(i, (j + 1) % 3)])
        torus = {"0": [[vertex] for vertex in vertices], "1": edges, "2": faces}
        result = call("topology.homology", {"simplices": torus})
        self.assertEqual(result["betti"], [1, 2, 1])
        self.assertEqual(result["torsion"], [[], [], []])
        self.assertEqual(result["euler"], 0)
        self.assertEqual(result["chain_ranks"][0], 9)

    def test_torsion(self):
        # minimal triangulation of RP^2: H_0 = Z, H_1 = Z/2, H_2 = 0
        vertices = [1, 2, 3, 4, 5, 6]
        faces = [
            [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 6], [1, 6, 2],
            [2, 3, 5], [3, 4, 6], [4, 5, 2], [5, 6, 3], [6, 2, 4],
        ]
        result = call(
            "topology.homology",
            {"simplices": {"0": [[vertex] for vertex in vertices], "2": faces}},
        )
        self.assertEqual(result["betti"], [1, 0, 0])
        self.assertEqual(result["torsion"], [[], [2], []])
        self.assertEqual(result["chain_ranks"], [6, 15, 10])

    def test_fundamental_group(self):
        circle = call(
            "topology.fundamental_group",
            {"vertices": ["a", "b", "c"], "edges": [["a", "b"], ["b", "c"], ["c", "a"]]},
        )
        self.assertEqual(circle["betti1"], 1)
        self.assertEqual(len(circle["generators"]), 1)
        self.assertEqual(circle["abelianization"], "Z")
        two_loops = call(
            "topology.fundamental_group",
            {"vertices": ["a"], "edges": [["a", "a"], ["a", "a"]]},
        )
        self.assertEqual(two_loops["betti1"], 2)
        self.assertEqual(two_loops["relations"], [])
        self.assertEqual(two_loops["abelianization"], "Z^2")


class TestGeometry(unittest.TestCase):
    def test_christoffel_polar(self):
        result = call(
            "geometry.christoffel", {"coords": ["r", "t"], "metric": [["1", "0"], ["0", "r**2"]]}
        )
        self.assertEqual(result["christoffel"][0][1][1], "-r")
        self.assertEqual(result["christoffel"][1][0][1], "1/r")
        self.assertIn("Gamma", result["latex"])

    def test_curvature_sphere(self):
        result = call(
            "geometry.curvature",
            {"coords": ["t", "p"], "metric": [["1", "0"], ["0", "sin(t)**2"]]},
        )
        self.assertEqual(result["scalar"], "2")
        self.assertEqual(result["ricci"][0][0], "1")
        self.assertEqual(result["riemann"][0][0][0][0], "0")

    def test_exterior_derivative(self):
        zero_form = call(
            "geometry.exterior_derivative",
            {"coords": ["x", "y"], "components": {"0": "x*y"}, "formDegree": 0},
        )
        self.assertEqual(zero_form["components"], {"0": "y", "1": "x"})
        one_form = call(
            "geometry.exterior_derivative",
            {"coords": ["x", "y"], "components": {"1": ["y", "x"]}, "formDegree": 1},
        )
        self.assertEqual(one_form["components"]["0,1"], "0")

    def test_lie_bracket(self):
        result = call(
            "geometry.lie_bracket", {"coords": ["x", "y"], "X": ["y", "0"], "Y": ["0", "x"]}
        )
        self.assertEqual(result["result"], ["-x", "y"])


class TestNumeric(unittest.TestCase):
    def test_root(self):
        result = call("num.root", {"expr": "x**2-2", "var": "x", "bracket": [0, 2]})
        self.assertAlmostEqual(result["root"], math.sqrt(2), places=12)
        self.assertGreater(result["iterations"], 0)

    def test_integrate(self):
        result = call("num.integrate", {"expr": "exp(-x**2)", "var": "x", "range": [-10, 10]})
        self.assertAlmostEqual(result["value"], math.sqrt(math.pi), places=8)

    def test_ode(self):
        result = call("num.ode", {"rhs": "-0.5*y", "y0": [2], "tRange": [0, 2], "samples": 21})
        self.assertAlmostEqual(result["y"][0], 2.0, places=12)
        self.assertAlmostEqual(result["y"][-1], 2.0 * math.exp(-1.0), places=6)
        self.assertEqual(len(result["t"]), 21)

    def test_distributions(self):
        pdf = call("prob.dist", {"dist": "normal", "params": {"mu": 0, "sigma": 1}, "op": "pdf", "x": 0})
        self.assertAlmostEqual(pdf["value"], 1 / math.sqrt(2 * math.pi), places=12)
        cdf = call("prob.dist", {"dist": "normal", "params": {"mu": 0, "sigma": 1}, "op": "cdf", "x": 0})
        self.assertAlmostEqual(cdf["value"], 0.5, places=12)
        mean = call("prob.dist", {"dist": "binomial", "params": {"n": 10, "p": 0.5}, "op": "mean"})
        self.assertEqual(mean["value"], 5)
        sample = call("prob.dist", {"dist": "uniform", "params": {"a": 0, "b": 1}, "op": "sample", "n": 5})
        self.assertEqual(len(sample["value"]), 5)

    def test_expectation(self):
        result = call(
            "prob.expectation", {"expr": "x**2", "dist": "normal", "params": {"mu": 0, "sigma": 1}}
        )
        self.assertAlmostEqual(float(result["numeric"]), 1.0, places=6)
        uniform = call(
            "prob.expectation", {"expr": "x", "dist": "uniform", "params": {"a": 0, "b": 1}}
        )
        self.assertAlmostEqual(float(uniform["numeric"]), 0.5, places=6)

    def test_optimization(self):
        minimized = call("opt.minimize", {"expr": "(x-1)**2 + (y+2)**2", "vars": ["x", "y"]})
        self.assertTrue(minimized["success"])
        self.assertAlmostEqual(minimized["point"]["x"], 1.0, places=4)
        self.assertAlmostEqual(minimized["point"]["y"], -2.0, places=4)
        stationary = call(
            "opt.stationary", {"expr": "x**2 + y**2", "vars": ["x", "y"]}
        )
        self.assertEqual(stationary["points"][0]["classification"], "minimum")
        saddle = call(
            "opt.stationary", {"expr": "x**2 - y**2", "vars": ["x", "y"]}
        )
        self.assertEqual(saddle["points"][0]["classification"], "saddle")

    def test_graph(self):
        triangle = {"edges": [["a", "b"], ["b", "c"], ["c", "a"]], "op": "components"}
        self.assertEqual(call("graph.analyze", triangle)["count"], 1)
        path = call(
            "graph.analyze",
            {"edges": [["a", "b"], ["b", "c"]], "op": "shortest_path", "source": "a", "target": "c"},
        )
        self.assertEqual(path["path"], ["a", "b", "c"])
        weighted = call(
            "graph.analyze",
            {"edges": [["a", "b", 2], ["b", "c", 3], ["a", "c", 10]], "op": "shortest_path", "source": "a", "target": "c"},
        )
        self.assertEqual(weighted["length"], 5)
        self.assertTrue(call("graph.analyze", {"edges": [["a", "b"], ["b", "c"]], "op": "is_tree"})["value"])
        coloring = call("graph.analyze", {"edges": [["a", "b"], ["b", "c"], ["c", "a"]], "op": "coloring"})
        self.assertEqual(coloring["colorCount"], 3)
        ranks = call("graph.analyze", {"edges": [["a", "b"], ["b", "c"], ["c", "a"]], "op": "pagerank"})
        self.assertEqual(len(ranks["ranks"]), 3)
        tree = call("graph.analyze", {"edges": [["a", "b"], ["b", "c"]], "op": "spanning_tree"})
        self.assertEqual(tree["edgeCount"], 2)
        bipartite = call(
            "graph.analyze", {"edges": [["a", "b"], ["b", "c"], ["c", "a"]], "op": "is_bipartite"}
        )
        self.assertFalse(bipartite["value"])
        diameter = call(
            "graph.analyze", {"edges": [["a", "b"], ["b", "c"]], "op": "diameter"}
        )
        self.assertEqual(diameter["diameter"], 2)


class TestPlot(unittest.TestCase):
    def test_sample(self):
        result = call("plot.sample", {"expr": "sin(x)", "range": [-5, 5], "samples": 100})
        curve = result["curves"][0]
        self.assertTrue(curve["valid"])
        self.assertEqual(len(curve["points"][0]), 100)
        self.assertEqual(result["range"], [-5.0, 5.0])
        low, high = result["yRange"]
        self.assertLess(low, high)

    def test_discontinuity_split(self):
        result = call("plot.sample", {"expr": "1/x", "range": [-2, 2], "samples": 200})
        self.assertGreaterEqual(len(result["curves"][0]["points"]), 2)

    def test_multi(self):
        result = call(
            "plot.sample_multi", {"exprs": ["sin(x)", "cos(x)"], "range": [-5, 5], "samples": 80}
        )
        self.assertEqual(len(result["curves"]), 2)
        self.assertIn("color", result["curves"][0])

    def test_parametric_and_polar(self):
        parametric = call(
            "plot.parametric", {"x": "cos(t)", "y": "sin(t)", "range": [0, 6.28], "samples": 100}
        )
        self.assertEqual(len(parametric["points"]), 100)
        self.assertAlmostEqual(parametric["points"][0][0], 1.0, places=6)
        polar = call("plot.polar", {"r": "1", "range": [0, 6.28], "samples": 50})
        self.assertEqual(len(polar["points"]), 50)

    def test_implicit(self):
        result = call(
            "plot.implicit", {"expr": "x**2+y**2-1", "xRange": [-2, 2], "yRange": [-2, 2], "grid": 40}
        )
        self.assertGreater(len(result["segments"]), 20)
        self.assertEqual(result["contourLevels"], [0.0])

    def test_surface3d(self):
        result = call("plot.surface3d", {"expr": "x**2-y**2", "n": 10})
        self.assertEqual(len(result["vertices"]), 100)
        self.assertGreater(len(result["indices"]), 100)
        self.assertLess(result["zRange"][0], result["zRange"][1])
        broken = call("plot.surface3d", {"expr": "sqrt(-x**2-y**2)", "n": 8})
        self.assertTrue(any(vertex[2] is None for vertex in broken["vertices"]))

    def test_field(self):
        result = call("plot.field", {"P": "-y", "Q": "x", "n": 6})
        self.assertEqual(len(result["arrows"]), 36)
        self.assertTrue(result["normalize"])

    def test_svg(self):
        sample = call("plot.svg", {"kind": "sample", "expr": "sin(x)", "samples": 50})
        self.assertTrue(sample["svg"].startswith("<svg"))
        self.assertIn("</svg>", sample["svg"])
        explicit = call(
            "plot.svg", {"kind": "explicit", "expr": "sin(x)", "var": "x", "range": [-5, 5]}
        )
        self.assertTrue(explicit["svg"].startswith("<svg"))
        implicit = call(
            "plot.svg", {"kind": "implicit", "expr": "x**2+y**2-1", "grid": 30}
        )
        self.assertIn("line", implicit["svg"])
        parametric = call(
            "plot.svg", {"kind": "parametric", "x": "cos(t)", "y": "sin(t)", "range": [0, 6.28]}
        )
        self.assertTrue(parametric["svg"].startswith("<svg"))
        polar = call("plot.svg", {"kind": "polar", "r": "1+cos(theta)", "samples": 60})
        self.assertTrue(polar["svg"].startswith("<svg"))
        surface = call("plot.svg", {"kind": "surface3d", "expr": "x**2-y**2", "n": 6})
        self.assertIn("wireframe", surface["svg"].lower())


if __name__ == "__main__":
    unittest.main(verbosity=2)
