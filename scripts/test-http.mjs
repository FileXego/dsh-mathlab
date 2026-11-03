/**
 * MathLab HTTP smoke test.
 * Usage: node scripts/test-http.mjs [baseUrl]
 * Exits non-zero when a required probe fails; prints a compact report.
 */
const base = (process.argv[2] ?? 'http://127.0.0.1:62937').replace(/\/$/, '');
let failures = 0;

/** @param {string} label @param {boolean} ok @param {string} detail */
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
  if (!ok) failures++;
}

/**
 * POST one op.
 * @param {string} op @param {object} args
 */
async function call(op, args = {}) {
  const res = await fetch(`${base}/mathlab/api`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ op, args }),
  });
  const payload = await res.json().catch(() => ({ ok: false, error: { code: 'bad-json', message: 'non-JSON response' } }));
  return { status: res.status, ...payload };
}

function textOf(result) {
  if (result === null || result === undefined) return '';
  if (typeof result === 'string') return result;
  if (typeof result.pretty === 'string') return result.pretty;
  if (typeof result.latex === 'string') return result.latex;
  if (typeof result.text === 'string') return result.text;
  return JSON.stringify(result).slice(0, 200);
}

const probes = [
  ['meta.info', {}, (r) => r?.engine?.available === true, (r) => `engine=${r?.engine?.available} python=${r?.engine?.python ?? '?'}`],
  ['symbols.list', {}, (r) => Array.isArray(r?.symbols) && r.symbols.length > 100, (r) => `${r?.symbols?.length ?? 0} symbols`],
  ['examples.list', {}, (r) => Array.isArray(r?.examples) && r.examples.length > 20, (r) => `${r?.examples?.length ?? 0} examples`],
  ['calc.simplify', { expr: 'sin(x)**2+cos(x)**2' }, (r) => /^1$/.test(String(r?.result)), (r) => textOf(r)],
  ['calc.diff', { expr: 'x**3', var: 'x' }, (r) => String(r?.result).includes('3'), (r) => textOf(r)],
  ['calc.integrate', { expr: 'exp(-x**2)', var: 'x', lower: '-oo', upper: 'oo' }, (r) => String(r?.result).includes('sqrt(pi)'), (r) => textOf(r)],
  ['calc.solve', { equations: ['x**2-1=0'], vars: ['x'] }, (r) => Array.isArray(r?.solutions), (r) => JSON.stringify(r?.solutions)?.slice(0, 120)],
  ['calc.matrix', { op: 'det', matrix: [['1', '2'], ['3', '4']] }, (r) => /-2/.test(JSON.stringify(r?.value ?? r?.result)), (r) => textOf(r?.value)],
  ['algebra.perm', { op: 'order', cycles: [[1, 2, 3]] }, (r) => Number(r?.order) === 3, (r) => `order=${r?.order}`],
  ['algebra.group', { op: 'subgroups', generators: [[[1, 2, 3]], [[1, 2]]] }, (r) => Array.isArray(r?.subgroups) && r.subgroups.length === 6, (r) => `${r?.subgroups?.length} subgroups`],
  ['algebra.finitefield', { p: 2, n: 2, op: 'table' }, (r) => Array.isArray(r?.mul) || Array.isArray(r?.table), (r) => 'GF(4) table'],
  ['category.validate', {
    category: {
      objects: [{ id: 'A' }, { id: 'B' }],
      morphisms: [{ id: 'idA', dom: 'A', cod: 'A' }, { id: 'idB', dom: 'B', cod: 'B' }, { id: 'f', dom: 'A', cod: 'B' }],
      identities: [{ object: 'A', morphism: 'idA' }, { object: 'B', morphism: 'idB' }],
      compositions: [
        { first: 'idA', second: 'f', result: 'f' }, { first: 'f', second: 'idB', result: 'f' },
        { first: 'idA', second: 'idA', result: 'idA' }, { first: 'idB', second: 'idB', result: 'idB' },
      ],
    },
  }, (r) => r?.valid === true, (r) => `valid=${r?.valid} violations=${r?.violations?.length ?? 0}`],
  ['logic.truthtable', { formula: 'A | ~A' }, (r) => r?.tautology === true, (r) => `tautology=${r?.tautology}`],
  ['logic.prove', { premises: ['A -> B', 'A'], goal: 'B' }, (r) => r?.valid === true, (r) => `valid=${r?.valid} steps=${r?.fitch?.length ?? 0}`],
  ['topology.homology', { simplices: { '0': [['a'], ['b'], ['c']], '1': [['a', 'b'], ['b', 'c'], ['c', 'a']] } }, (r) => r?.betti?.[0] === 1 && r?.betti?.[1] === 1, (r) => `betti=${JSON.stringify(r?.betti)}`],
  ['graph.analyze', { edges: [['a', 'b'], ['b', 'c']], op: 'components' }, (r) => Array.isArray(r?.components) && r.components.length === 1, (r) => JSON.stringify(r?.components)?.slice(0, 80)],
  ['plot.sample', { expr: 'sin(x)', var: 'x', range: [-3, 3], samples: 50 }, (r) => Array.isArray(r?.curves) && JSON.stringify(r).length > 100, (r) => 'curves sampled'],
  ['prob.dist', { dist: 'normal', params: { mu: 0, sigma: 1 }, op: 'mean' }, (r) => Number(r?.value) === 0 || String(r?.value) === '0', (r) => `mean=${r?.value}`],
  ['lean.info', {}, (r) => typeof r?.available === 'boolean', (r) => `available=${r?.available}`],
  ['help', {}, (r) => typeof r?.text === 'string' && r.text.length > 20, (r) => `${r?.text?.length ?? 0} chars`],
];

for (const [op, args, predicate, detail] of probes) {
  try {
    const payload = await call(op, args);
    if (!payload.ok) {
      check(op, false, `error ${payload.error?.code}: ${payload.error?.message}`);
      continue;
    }
    let ok = false;
    let detailText = '';
    try {
      ok = Boolean(predicate(payload.result));
      detailText = detail ? String(detail(payload.result)) : '';
    } catch (error) {
      ok = false;
      detailText = `predicate threw: ${error.message}`;
    }
    check(op, ok, detailText);
  } catch (error) {
    check(op, false, `request failed: ${error.message}`);
  }
}

// Static assets
for (const [path, expectType] of [
  ['/mathlab/assets/katex/katex.min.js', 'javascript'],
  ['/mathlab/assets/katex/katex.min.css', 'css'],
  ['/mathlab/assets/katex/LICENSE', 'text'],
]) {
  try {
    const res = await fetch(base + path);
    const type = res.headers.get('content-type') ?? '';
    check(`GET ${path}`, res.status === 200 && type.includes(expectType), `${res.status} ${type}`);
  } catch (error) {
    check(`GET ${path}`, false, error.message);
  }
}

console.log(failures === 0 ? '\nALL PROBES PASSED' : `\n${failures} PROBE(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
