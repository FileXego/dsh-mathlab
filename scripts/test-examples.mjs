/**
 * Execute every example action in data/examples.json through the live MathLab API.
 * Usage: node scripts/test-examples.mjs [baseUrl]
 * Exits non-zero when an example fails; prints a compact table.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = (process.argv[2] ?? 'http://127.0.0.1:62937').replace(/\/$/, '');
const root = fileURLToPath(new URL('..', import.meta.url));
const data = JSON.parse(await readFile(`${root}/data/examples.json`, 'utf8'));
const examples = Array.isArray(data.examples) ? data.examples : [];

let failures = 0;
const rows = [];
for (const example of examples) {
  const op = example?.action?.op;
  const args = example?.action?.args ?? {};
  const label = `${example?.id ?? '?'} (${op ?? '?'})`;
  if (typeof op !== 'string') {
    rows.push([label, false, 'missing action.op']);
    failures++;
    continue;
  }
  try {
    const res = await fetch(`${base}/mathlab/api`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ op, args }),
    });
    const payload = await res.json();
    if (payload.ok === true) {
      rows.push([label, true, '']);
    } else {
      rows.push([label, false, `${payload.error?.code}: ${payload.error?.message}`]);
      failures++;
    }
  } catch (error) {
    rows.push([label, false, `request failed: ${error.message}`]);
    failures++;
  }
}

for (const [label, ok, detail] of rows) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
}
console.log(`\n${rows.length - failures}/${rows.length} examples execute`);
process.exitCode = failures === 0 ? 0 : 1;
