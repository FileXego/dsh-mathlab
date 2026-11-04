/**
 * Execute every example action in data/examples.json directly through the
 * MathLabService (no HTTP/auth required; the HTTP surface is browser-session
 * authenticated and covered by scripts/test-http.mjs).
 * Usage: node scripts/test-examples.mjs
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MathLabService } from '../lib/math-service.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const data = JSON.parse(await readFile(`${root}/data/examples.json`, 'utf8'));
const examples = Array.isArray(data.examples) ? data.examples : [];
const service = new MathLabService({
  version: 'test',
  engineTimeoutMs: 30_000,
  logger: { info() {}, warn() {}, error() {} },
});

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
    await service.call(op, args);
    rows.push([label, true, '']);
  } catch (error) {
    rows.push([label, false, `${error?.code ?? 'error'}: ${error?.message ?? error}`]);
    failures++;
  }
}
service.stop();

for (const [label, ok, detail] of rows) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
}
console.log(`\n${rows.length - failures}/${rows.length} examples execute`);
process.exitCode = failures === 0 ? 0 : 1;
