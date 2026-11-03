"""Direct engine checks for the verifier-reported defects (dev aid)."""
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
cases = [
    ("algebra.group", {"op": "subgroup_lattice", "generators": [[[1, 2, 3]], [[1, 2]]]}),
    ("algebra.poly", {"coeffs": [1, 0, 1], "p": 5, "op": "roots"}),
    ("category.natural", {
        "source": {
            "objects": [{"id": "A"}],
            "morphisms": [{"id": "idA", "dom": "A", "cod": "A"}],
            "identities": [{"object": "A", "morphism": "idA"}],
            "compositions": [{"first": "idA", "second": "idA", "result": "idA"}],
        },
        "target": {
            "objects": [{"id": "X"}],
            "morphisms": [{"id": "idX", "dom": "X", "cod": "X"}],
            "identities": [{"object": "X", "morphism": "idX"}],
            "compositions": [{"first": "idX", "second": "idX", "result": "idX"}],
        },
        "F": {"onObjects": [{"from": "A", "to": "X"}], "onMorphisms": [{"from": "idA", "to": "idX"}]},
        "G": {"onObjects": [{"from": "A", "to": "X"}], "onMorphisms": [{"from": "idA", "to": "idX"}]},
        "components": [{"object": "A", "morphism": "idX"}],
    }),
    ("category.limit", {"kind": "pushout", "A": ["a"], "B": ["b"], "C": ["c"]}),
    ("calc.simplify", {"expr": "sin(x)**2+cos(x)**2"}),
]

proc = subprocess.Popen(
    [sys.executable, "-u", str(root / "engine" / "mathlab_engine.py")],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    text=True, encoding="utf-8",
)
for index, (op, args) in enumerate(cases):
    proc.stdin.write(json.dumps({"id": index, "op": op, "args": args}) + "\n")
    proc.stdin.flush()
    response = json.loads(proc.stdout.readline())
    if not response.get("ok"):
        print("ERR ", op, response.get("error"))
        continue
    result = response["result"]
    if op == "algebra.group":
        print("lattice normals:", [(node["label"], node["isNormal"]) for node in result["nodes"]])
        print("edges:", result["edges"])
    elif op == "algebra.poly":
        print("roots over GF(5):", [entry.get("result") for entry in result["roots"]])
    elif op == "category.natural":
        print("naturality:", result["naturality"])
    elif op == "category.limit":
        print("malformed pushout:", response.get("error"))
    else:
        print(op, "result:", result.get("result"))
proc.stdin.close()
proc.terminate()
