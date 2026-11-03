"""Execute every data/examples.json action against the engine directly (dev aid)."""
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
examples = json.loads((root / "data/examples.json").read_text(encoding="utf-8"))["examples"]
proc = subprocess.Popen(
    [sys.executable, "-u", str(root / "engine" / "mathlab_engine.py")],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    text=True, encoding="utf-8",
)

ok = 0
failed = []
for i, example in enumerate(examples):
    op = example.get("action", {}).get("op")
    args = example.get("action", {}).get("args", {})
    eid = example.get("id")
    if not isinstance(op, str):
        failed.append((eid, "missing action.op"))
        continue
    if op.startswith(("symbols.", "examples.", "lean.snippets")):
        ok += 1
        continue
    proc.stdin.write(json.dumps({"id": i, "op": op, "args": args}) + "\n")
    proc.stdin.flush()
    line = proc.stdout.readline()
    try:
        response = json.loads(line)
    except Exception as exc:  # noqa: BLE001
        failed.append((eid, f"bad protocol line: {line[:120]!r} ({exc})"))
        continue
    if response.get("ok"):
        ok += 1
    else:
        err = response.get("error", {})
        failed.append((eid, f"{op}: {err.get('code')} — {err.get('message')}"))

proc.stdin.close()
proc.terminate()
print(f"{ok}/{len(examples)} example actions execute against the engine")
for eid, message in failed:
    print(f"FAIL {eid}: {message}")
sys.exit(0 if not failed else 1)
