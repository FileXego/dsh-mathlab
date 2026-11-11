// Independent HTTP API verification for MathLab (verifier teammate).
// Usage: node scripts/verify-http.mjs
// Talks to the running Host over HTTP; checks math against hand-derived
// expectations, cross-checked with a separately spawned local SymPy process.
import { execFileSync } from 'node:child_process';

const API = process.env.MATHLAB_API || 'http://localhost:62937/api/mathlab/api';
const records = [];
const defects = [];

let transientResets = 0;
async function post(op, args = {}, attempt = 0) {
  const t0 = Date.now();
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ op, args }),
    });
    const text = await res.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { parseFailure: text.slice(0, 200) }; }
    return { status: res.status, payload, ms: Date.now() - t0 };
  } catch (e) {
    const code = String(e?.cause?.code ?? e?.message ?? '');
    if (attempt < 2 && /ECONNRESET|fetch failed|other side closed/i.test(code)) {
      transientResets += 1;
      await new Promise((r) => setTimeout(r, 250));
      return post(op, args, attempt + 1);
    }
    throw e;
  }
}

function record(name, ok, detail, defect) {
  records.push({ name, ok, detail, defect: !!defect });
  if (!ok && defect) defects.push({ name, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} :: ${name}${detail ? ' :: ' + detail : ''}`);
}

async function getOk(op, args, label, check) {
  const r = await post(op, args);
  const p = r.payload;
  if (!p || p.ok !== true) {
    record(label || `${op} ok`, false, `status=${r.status} payload=${JSON.stringify(p).slice(0, 300)}`);
    return null;
  }
  if (check) {
    let verdict;
    try { verdict = check(p.result, r); } catch (e) { verdict = { ok: false, detail: `check threw: ${e.message}` }; }
    record(label || op, verdict.ok, verdict.detail, verdict.defect);
  } else record(label || op, true, `${r.ms}ms`);
  return p.result;
}

async function getErr(op, args, expectedCode, label, defect) {
  const r = await post(op, args);
  const p = r.payload;
  const code = p?.error?.code;
  const envOk = p?.ok === false && typeof code === 'string' && typeof p.error.message === 'string' && p.error.message.length > 0;
  const ok = envOk && (expectedCode ? code === expectedCode : true);
  record(label || `${op} error ${expectedCode || ''}`, ok, `status=${r.status} code=${code} message=${String(p?.error?.message).slice(0, 130)}`, defect);
  return p;
}

// ---- independent symbolic oracle: local sympy, separate from the plugin engine ----
function pySympy(code) {
  return execFileSync('python', ['-c', code], { encoding: 'utf8', timeout: 60000 }).trim();
}
function sympyCheck(a, b) {
  const code = `from sympy import sympify, simplify, sstr\na=sympify(${JSON.stringify(a)}); b=sympify(${JSON.stringify(b)})\nfor v in (a,b):\n    try: v=v.removeO()\n    except Exception: pass\ntry:\n    print("YES" if simplify(a-b)==0 else "NO:"+sstr(a)+" vs "+sstr(b))\nexcept Exception as e:\n    print("ERR:"+str(e))`;
  try {
    const out = pySympy(code);
    return out === 'YES' ? { ok: true, detail: `${a} == ${b}` } : { ok: false, detail: out.slice(0, 300) };
  } catch (e) {
    return { ok: false, detail: `sympy spawn failed: ${e.message}` };
  }
}
function sympySet(exprs, expected) {
  const code = `import json\nfrom sympy import sympify, simplify, sstr\nA=[sympify(x) for x in ${JSON.stringify(exprs)}]\nE=[sympify(x) for x in ${JSON.stringify(expected)}]\ncanon=lambda x: sstr(simplify(x))\nca=sorted(canon(x) for x in A); ce=sorted(canon(x) for x in E)\nprint(json.dumps({"a":ca,"e":ce,"equal":ca==ce}))`;
  try {
    const j = JSON.parse(pySympy(code));
    return { ok: j.equal, detail: j.equal ? 'sets equal' : `got ${JSON.stringify(j.a).slice(0, 180)} want ${JSON.stringify(j.e).slice(0, 180)}` };
  } catch (e) {
    return { ok: false, detail: `sympy spawn failed: ${e.message}` };
  }
}
const num = (v) => (typeof v === 'number' ? v : Number(v));
const close = (v, expected, tol) => Math.abs(num(v) - expected) <= tol;

// =====================================================================
// meta / honesty / host content
// =====================================================================
const meta = await getOk('meta.info', {}, 'meta.info ok', (r) => {
  const ok = r?.engine?.available === true && typeof r.engine.python === 'string' && typeof r.engine.sympy === 'string'
    && r?.content?.symbols >= 240 && r?.content?.examples >= 40;
  return { ok, detail: `plugin=${r?.plugin} version=${r?.version} engine=${r?.engine?.available} py=${r?.engine?.python} sympy=${r?.engine?.sympy} content=${JSON.stringify(r?.content)} lean.available=${r?.lean?.available}` };
});
record('meta.info lean.available=false (honesty)', meta?.lean?.available === false && meta?.engine?.lean?.available === false, `lean=${JSON.stringify(meta?.lean)} engine.lean=${JSON.stringify(meta?.engine?.lean)}`);
record('meta.info capabilities include core groups', Array.isArray(meta?.engine?.capabilities) && ['calc', 'algebra', 'category', 'logic', 'topology', 'graph'].every((c) => meta.engine.capabilities.includes(c)), JSON.stringify(meta?.engine?.capabilities));
record('meta.info ops list covers documented groups', Array.isArray(meta?.engine?.ops) && meta.engine.ops.length >= 60 && meta.engine.ops.includes('calc.dsolve') && meta.engine.ops.includes('plot.svg'), `ops=${meta?.engine?.ops?.length}`);

const leanInfo = await getOk('lean.info', {}, 'lean.info reports unavailable truthfully with install hint', (r) => ({
  ok: r?.available === false && r?.version === null && typeof r?.note === 'string' && /install|not found/i.test(r.note),
  detail: `available=${r?.available} version=${r?.version} lake=${r?.lake} note=${String(r?.note).slice(0, 120)}`,
}));

await getOk('symbols.list', {}, 'symbols.list fields/symbols', (r) => ({ ok: Array.isArray(r?.fields) && r.fields.length === 13 && Array.isArray(r?.symbols) && r.symbols.length >= 240, detail: `fields=${r?.fields?.length} symbols=${r?.symbols?.length}` }));
await getOk('symbols.search', { query: 'integral', limit: 10 }, 'symbols.search integral', (r) => ({ ok: Array.isArray(r?.symbols) && r.symbols.length > 0 && r.symbols.every((s) => typeof s.latex === 'string'), detail: `hits=${r?.symbols?.length} first=${r?.symbols?.[0]?.id}` }));
await getOk('examples.list', {}, 'examples.list 57', (r) => ({ ok: Array.isArray(r?.examples) && r.examples.length === 57, detail: `examples=${r?.examples?.length}` }));
const gaussExample = await getOk('examples.get', { id: 'gaussian-integral' }, 'examples.get gaussian-integral', (r) => ({ ok: r?.example?.id === 'gaussian-integral' && r.example.action?.op === 'calc.integrate', detail: `id=${r?.example?.id} op=${r?.example?.action?.op} expect=${r?.example?.expect}` }));
await getOk('lean.snippets', {}, 'lean.snippets list >= 35', (r) => ({ ok: Array.isArray(r?.snippets) && r.snippets.length >= 35, detail: `snippets=${r?.snippets?.length}` }));
await getOk('help', { topic: 'calc' }, 'help returns markdown', (r) => ({ ok: typeof r?.text === 'string' && r.text.length > 100, detail: `len=${r?.text?.length}` }));

// =====================================================================
// calc
// =====================================================================
await getOk('calc.dsolve', { eq: "y'' + y = 0", func: 'y', var: 'x', ics: [{ x: 0, y: 1 }, { x: 0, dy: 0 }] }, "calc.dsolve y''+y=0 y(0)=1,y'(0)=0 -> cos(x)", (r) => ({
  ok: r?.solution === 'cos(x)' && r?.order === 2 && String(r?.latex).includes('cos'), detail: `solution=${r?.solution} order=${r?.order}`,
}));
await getOk('calc.dsolve', { eq: "y' = y", func: 'y', var: 'x' }, "calc.dsolve y'=y -> C1*exp(x)", (r) => sympyCheck(String(r?.solution), 'C1*exp(x)'));
await getOk('calc.series', { expr: 'sin(x)', var: 'x', point: '0', order: 8 }, 'calc.series sin(x) order 8', (r) => sympyCheck(String(r?.result), 'x - x**3/6 + x**5/120 - x**7/5040'));
await getOk('calc.limit', { expr: '(1 + 1/x)**x', var: 'x', point: 'oo' }, 'calc.limit (1+1/x)^x -> E', (r) => sympyCheck(String(r?.result), 'E'));
await getOk('calc.limit', { expr: '(sin(x))/x', var: 'x', point: '0' }, 'calc.limit sin(x)/x -> 1', (r) => ({ ok: String(r?.result) === '1', detail: `result=${r?.result}` }));
await getOk('calc.sum', { expr: '1/n**2', var: 'n', lower: 1, upper: 'oo' }, 'calc.sum 1/n^2 -> pi^2/6', (r) => sympyCheck(String(r?.result), 'pi**2/6'));
await getOk('calc.product', { expr: '1 - 1/n**2', var: 'n', lower: 2, upper: 'm' }, 'calc.product (1-1/n^2) n=2..m -> (m+1)/(2m)', (r) => sympyCheck(String(r?.result), '(m+1)/(2*m)'));
await getOk('calc.integrate', { expr: 'exp(-x**2)', var: 'x', lower: '-oo', upper: 'oo' }, 'calc.integrate exp(-x^2) over R -> sqrt(pi)', (r) => sympyCheck(String(r?.result), 'sqrt(pi)'));
await getOk('calc.diff', { expr: 'x**x', var: 'x' }, 'calc.diff x^x -> x^x*(log(x)+1)', (r) => sympyCheck(String(r?.result), 'x**x*(log(x)+1)'));
await getOk('calc.solve', { equations: ['x**2 - 2*x - 3 = 0'], vars: ['x'] }, 'calc.solve x^2-2x-3=0 -> {-1,3}', (r) => {
  const values = (r?.solutions?.[0]?.values || []).map((v) => String(v.result));
  const sorted = values.map((v) => v.replace(/\s/g, '')).sort();
  return { ok: sorted.length === 2 && sorted[0] === '-1' && sorted[1] === '3', detail: `values=${values.join(',')}` };
});
await getOk('calc.apart', { expr: '1/(x**2 - 1)', var: 'x' }, 'calc.apart 1/(x^2-1)', (r) => sympyCheck(String(r?.result), '1/(2*(x-1)) - 1/(2*(x+1))'));
await getOk('calc.trigsimp', { expr: 'sin(x)**2 + cos(x)**2' }, 'calc.trigsimp Pythagorean -> 1', (r) => ({ ok: String(r?.result) === '1', detail: `result=${r?.result}` }));
await getOk('calc.approx', { expr: 'sqrt(2)', subs: {}, digits: 15 }, 'calc.approx sqrt(2) = 1.41421356237310', (r) => ({ ok: String(r?.value).startsWith('1.41421356237310'), detail: `value=${r?.value}` }));

await getOk('calc.matrix', { op: 'det', matrix: [['1', '2'], ['3', '4']] }, 'calc.matrix det [[1,2],[3,4]] = -2', (r) => ({ ok: String(r?.value?.result ?? r?.value) === '-2', detail: `value=${r?.value?.result}` }));
await getOk('calc.matrix', { op: 'inv', matrix: [['1', '2'], ['3', '4']] }, 'calc.matrix inv [[1,2],[3,4]] = [[-2,1],[3/2,-1/2]]', (r) => {
  const m = r?.matrix || [];
  return { ok: JSON.stringify(m) === JSON.stringify([['-2', '1'], ['3/2', '-1/2']]), detail: `matrix=${JSON.stringify(m)}` };
});
await getOk('calc.matrix', { op: 'eigen', matrix: [['2', '1'], ['1', '2']] }, 'calc.matrix eigen [[2,1],[1,2]] -> {3,1}', (r) => {
  const vals = (r?.values || []).map((v) => String(v.result || v));
  return sympySet(vals, ['3', '1']);
});
await getOk('calc.matrix', { op: 'charpoly', matrix: [['2', '1'], ['1', '2']] }, 'calc.matrix charpoly = lambda^2-4lambda+3', (r) => sympyCheck(String(r?.result).replace(/lambda/g, 'L'), 'L**2 - 4*L + 3'));
await getOk('calc.matrix', { op: 'rref', matrix: [['1', '2', '3'], ['2', '4', '6'], ['0', '0', '0']] }, 'calc.matrix rref rank 1', (r) => ({ ok: r?.rank === 1, detail: `rank=${r?.rank} matrix=${JSON.stringify(r?.matrix)}` }));
await getOk('calc.matrix', { op: 'nullspace', matrix: [['1', '1', '0'], ['0', '0', '1']] }, 'calc.matrix nullspace dim 1', (r) => ({ ok: r?.dimension === 1 && Array.isArray(r?.basis) && r.basis.length === 1, detail: `dimension=${r?.dimension} basis=${JSON.stringify(r?.basis)}` }));
await getOk('calc.matrix', { op: 'solve', matrix: [['2', '1'], ['1', '3']], rhs: ['5', '10'] }, 'calc.matrix solve -> x=1,y=3', (r) => {
  const vec = r?.solution?.[0] || [];
  return sympySet(vec.map((v) => String(v.result || v)), ['1', '3']);
});
await getOk('calc.matrix', { op: 'svd', matrix: [['1', '0'], ['0', '2']] }, 'calc.matrix svd singular values {1,2}', (r) => sympySet((r?.S || []).map(String), ['1', '2']));
await getOk('calc.matrix', { op: 'lstsq', matrix: [['1', '0'], ['0', '1'], ['1', '1']], rhs: ['1', '2', '3'] }, 'calc.matrix lstsq solution [1,2] (normal equations)', (r) => {
  const vec = (r?.solution || []).map((v) => String(v.result || v));
  return sympySet(vec, ['1', '2']);
});

await getOk('calc.vector', { op: 'grad', expr: 'x**2*y', vars: ['x', 'y'] }, 'calc.vector grad x^2y -> [2xy,x^2]', (r) => sympySet((r?.vector || []).map((v) => String(v.result || v)), ['2*x*y', 'x**2']));
await getOk('calc.vector', { op: 'div', components: ['x', 'y', 'z'], vars: ['x', 'y', 'z'] }, 'calc.vector div (x,y,z) = 3', (r) => ({ ok: String(r?.result?.result) === '3', detail: `result=${r?.result?.result}` }));
await getOk('calc.vector', { op: 'curl', components: ['y', '-x', '0'], vars: ['x', 'y', 'z'] }, 'calc.vector curl (y,-x,0) = (0,0,-2)', (r) => sympySet((r?.vector || []).map((v) => String(v.result || v)), ['0', '0', '-2']));
await getOk('calc.vector', { op: 'laplacian', expr: 'x**2 + y**2', vars: ['x', 'y'] }, 'calc.vector laplacian x^2+y^2 = 4', (r) => ({ ok: String(r?.result?.result) === '4', detail: `result=${r?.result?.result}` }));

await getOk('calc.number', { op: 'factorint', n: 360 }, 'calc.number factorint 360 = 2^3*3^2*5', (r) => {
  const s = JSON.stringify(r?.value ?? r);
  return { ok: s.includes('[2,3]') && s.includes('[3,2]') && s.includes('[5,1]'), detail: s.slice(0, 160) };
});
await getOk('calc.number', { op: 'totient', n: 36 }, 'calc.number totient 36 = 12', (r) => ({ ok: Number(r?.value ?? r) === 12, detail: JSON.stringify(r).slice(0, 120) }));
await getOk('calc.number', { op: 'mobius', n: 30 }, 'calc.number mobius 30 = -1', (r) => ({ ok: Number(r?.value ?? r) === -1, detail: JSON.stringify(r).slice(0, 120) }));
await getOk('calc.number', { op: 'crt', pairs: [[2, 3], [3, 5], [2, 7]] }, 'calc.number crt (2 mod3, 3 mod5, 2 mod7) -> 23', (r) => {
  const v = r?.value ?? r?.result ?? r;
  return { ok: Number(v) === 23, detail: JSON.stringify(r).slice(0, 160) };
});
await getOk('calc.number', { op: 'fibonacci', n: 20 }, 'calc.number fibonacci 20 = 6765', (r) => ({ ok: Number(r?.value ?? r) === 6765, detail: JSON.stringify(r).slice(0, 120) }));

// =====================================================================
// algebra
// =====================================================================
const s3 = { generators: [[[1, 2, 3]], [[1, 2]]], n: 3 };
await getOk('algebra.group', { op: 'subgroup_lattice', ...s3 }, 'algebra.group S3 subgroup_lattice: 6 nodes, 8 covers, normal = orders {1,3,6}', (r) => {
  const nodes = r?.nodes || [];
  const orders = nodes.map((n) => n.order).sort((a, b) => a - b);
  const normalOrders = nodes.filter((n) => n.isNormal).map((n) => n.order).sort((a, b) => a - b);
  const edges = r?.edges || [];
  const ok = JSON.stringify(orders) === JSON.stringify([1, 2, 2, 2, 3, 6]) && JSON.stringify(normalOrders) === JSON.stringify([1, 3, 6]) && edges.length === 8;
  return { ok, detail: `orders=${JSON.stringify(orders)} normalOrders=${JSON.stringify(normalOrders)} (expected [1,3,6]; S3's three C2 subgroups are NOT normal) edges=${edges.length}`, defect: true };
});
await getOk('algebra.group', { op: 'normal_subgroups', ...s3 }, 'algebra.group S3 normal_subgroups count 3 (cross-check of lattice flags)', (r) => ({ ok: r?.count === 3, detail: `count=${r?.count} orders=${JSON.stringify((r?.subgroups || []).map((s) => s.order))}` }));
await getOk('algebra.group', { op: 'is_abelian', ...s3 }, 'algebra.group S3 is_abelian=false', (r) => ({ ok: r?.value === false, detail: `value=${r?.value}` }));
await getOk('algebra.group', { op: 'center', ...s3 }, 'algebra.group S3 center order 1', (r) => ({ ok: r?.order === 1 && r?.is_trivial === true, detail: `order=${r?.order} is_trivial=${r?.is_trivial}` }));
await getOk('algebra.group', { op: 'cayley_table', ...s3 }, 'algebra.group S3 Cayley table 6x6 Latin square', (r) => {
  const table = r?.table || [], n = (r?.elements || []).length;
  const latin = table.length === n && table.every((row) => row.length === n && new Set(row).size === n);
  return { ok: n === 6 && latin, detail: `n=${n} latin=${latin}` };
});
await getOk('algebra.group', { op: 'subgroups', generators: [[[1, 2, 3, 4]], [[1, 2], [3, 4]]], n: 4 }, 'algebra.group D4 subgroups count 10 with orders [1,2^5,4^3,8]', (r) => {
  const arr = r?.subgroups || [];
  const orders = arr.map((s) => s.order).sort((a, b) => a - b);
  return { ok: arr.length === 10 && JSON.stringify(orders) === JSON.stringify([1, 2, 2, 2, 2, 2, 4, 4, 4, 8]), detail: `count=${arr.length} orders=${JSON.stringify(orders)}` };
});
await getOk('algebra.group', { op: 'sylow', ...s3 }, 'algebra.group S3 Sylow: n2=3 (not normal), n3=1 (normal)', (r) => {
  const primes = r?.primes || [];
  const p2 = primes.find((x) => x.p === 2), p3 = primes.find((x) => x.p === 3);
  return { ok: p2?.count === 3 && p2?.is_normal === false && p3?.count === 1 && p3?.is_normal === true, detail: JSON.stringify(primes).slice(0, 240) };
});
await getErr('algebra.group', { op: 'quotient', ...s3, normal: [[[1, 2]]] }, 'domain-error', 'algebra.group quotient by non-normal C2 rejected (domain-error)');
await getOk('algebra.group', { op: 'quotient', ...s3, normal: [[[1, 2, 3]]] }, 'algebra.group S3/A3 quotient order 2 abelian', (r) => ({ ok: r?.order === 2 && r?.abelian === true, detail: `order=${r?.order} abelian=${r?.abelian} name=${r?.name}` }));
await getOk('algebra.group', { op: 'is_simple', ...s3 }, 'algebra.group S3 not simple', (r) => ({ ok: r?.value === false, detail: `value=${r?.value} normal_count=${r?.normal_subgroup_count}` }));
await getOk('algebra.group', { op: 'homomorphism', ...s3, target_generators: [[[1, 2]]], images: [[], [[1, 2]]] }, 'algebra.group S3->C2 sign homomorphism valid, kernel A3 (order 3)', (r) => ({ ok: r?.valid === true && r?.kernel?.length === 3, detail: `valid=${r?.valid} kernel=${JSON.stringify(r?.kernel).slice(0, 120)} image=${JSON.stringify(r?.image).slice(0, 80)}` }));

await getOk('algebra.perm', { op: 'multiply', cycles: [[1, 2, 3]], other: [[1, 2]] }, 'algebra.perm multiply (123)(12): order 2, cycle type 2+1 (left-to-right convention)', (r) => ({ ok: r?.order === 2 && JSON.stringify(r?.cycles) === JSON.stringify([[2, 3]]), detail: `cycles=${JSON.stringify(r?.cycles)} order=${r?.order} cycle_type=${r?.cycle_type}` }));
await getOk('algebra.perm', { op: 'sign', cycles: [[1, 2, 3]] }, 'algebra.perm sign of 3-cycle = +1 (even)', (r) => {
  const s = JSON.stringify(r);
  return { ok: /"parity":"even"|"sign":1|"sign":"1"|"parity":"\\+"/.test(s) || r?.parity === 'even', detail: s.slice(0, 200) };
});
await getOk('algebra.finitefield', { p: 2, n: 2, op: 'table' }, 'algebra.finitefield GF(4) tables: x*x=x+1, (x+1)^2=x', (r) => {
  const mul = r?.mul || [], add = r?.add || [];
  const ok = mul.length === 4 && JSON.stringify(mul[2]) === JSON.stringify([0, 2, 3, 1]) && JSON.stringify(mul[3]) === JSON.stringify([0, 3, 1, 2]) && JSON.stringify(add[2]) === JSON.stringify([2, 3, 0, 1]);
  return { ok, detail: `mul=${JSON.stringify(mul)} add=${JSON.stringify(add)}` };
});
await getOk('algebra.finitefield', { p: 2, n: 2, op: 'mul', a: [0, 1], b: [0, 1] }, 'algebra.finitefield GF(4) x*x = x+1', (r) => ({ ok: JSON.stringify(r?.value?.coeffs) === JSON.stringify([1, 1]), detail: `value=${JSON.stringify(r?.value)}` }));
await getOk('algebra.finitefield', { p: 2, n: 2, op: 'inv', a: [1, 1] }, 'algebra.finitefield GF(4) (x+1)^-1 = x', (r) => ({ ok: JSON.stringify(r?.value?.coeffs) === JSON.stringify([0, 1]), detail: `value=${JSON.stringify(r?.value)}` }));
await getOk('algebra.finitefield', { p: 2, n: 3, op: 'table' }, 'algebra.finitefield GF(8) tables 8x8', (r) => ({ ok: (r?.add || []).length === 8 && (r?.mul || []).length === 8, detail: `q=${r?.q} add=${(r?.add || []).length} mul=${(r?.mul || []).length} irreducible=${r?.irreducible_poly_str}` }));
await getOk('algebra.poly', { coeffs: [1, 0, 0, 0, -1], op: 'factor' }, 'algebra.poly factor x^4-1 over Q', (r) => {
  const s = JSON.stringify(r?.factors ?? r?.value ?? r);
  return { ok: /x - 1/.test(s) && /x \+ 1/.test(s) && /x\^2 \+ 1/.test(s), detail: s.slice(0, 240) };
});
await getOk('algebra.poly', { coeffs: [1, 0, 1], op: 'factor' }, 'algebra.poly x^2+1 irreducible over Q', (r) => ({ ok: r?.is_irreducible === true, detail: `is_irreducible=${r?.is_irreducible} factors=${JSON.stringify(r?.factors).slice(0, 150)}` }));
await getOk('algebra.poly', { coeffs: [1, 0, 1], p: 5, op: 'roots' }, 'algebra.poly x^2+1 over GF(5) roots = {2,3}', (r) => {
  const vals = (r?.roots || []).map((x) => String(x.result));
  const ok = sympySet(vals, ['2', '3']).ok;
  return { ok, detail: `got ${JSON.stringify(vals)} domain=${r?.domain} (over GF(5), x^2+1=(x-2)(x-3))`, defect: true };
});
await getOk('algebra.poly', { coeffs: [1, 0, 1], p: 5, op: 'factor' }, 'algebra.poly x^2+1 over GF(5) factors (x+2)(x-2)', (r) => {
  const s = JSON.stringify(r?.factors ?? r?.value ?? r);
  return { ok: /x \+ 2/.test(s) && /x - 2/.test(s), detail: s.slice(0, 200) };
});
await getOk('algebra.ring', { op: 'units', n: 12 }, 'algebra.ring Z/12 units {1,5,7,11}', (r) => {
  const vals = (r?.units || r?.value || []).map(String).sort();
  return { ok: JSON.stringify(vals) === JSON.stringify(['1', '11', '5', '7']), detail: JSON.stringify(r?.value ?? r?.units) };
});
await getOk('algebra.ring', { op: 'zero_divisors', n: 12 }, 'algebra.ring Z/12 zero divisors', (r) => {
  const v = (r?.value || r?.zero_divisors || []).map(Number).sort((a, b) => a - b);
  return { ok: JSON.stringify(v) === JSON.stringify([2, 3, 4, 6, 8, 9, 10]), detail: JSON.stringify(r).slice(0, 200) };
});

// =====================================================================
// category
// =====================================================================
const invalidCat = {
  objects: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
  morphisms: [{ id: 'f', dom: 'A', cod: 'B', label: 'f' }, { id: 'g', dom: 'B', cod: 'A', label: 'g' }],
  identities: [{ object: 'A', morphism: 'idA' }],
  compositions: [],
};
await getOk('category.validate', { category: invalidCat }, 'category.validate detects missing identity/closure', (r) => {
  const codes = (r?.violations || []).map((v) => v.code);
  return { ok: r?.valid === false && codes.includes('missing-identity') && codes.length >= 2, detail: `valid=${r?.valid} codes=${JSON.stringify(codes)}` };
});
const catSmall = {
  objects: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
  morphisms: [
    { id: 'f', dom: 'A', cod: 'B', label: 'f' },
    { id: 'idA', dom: 'A', cod: 'A', label: 'idA' },
    { id: 'idB', dom: 'B', cod: 'B', label: 'idB' },
  ],
  identities: [{ object: 'A', morphism: 'idA' }, { object: 'B', morphism: 'idB' }],
  compositions: [
    { first: 'idA', second: 'f', result: 'f' },
    { first: 'f', second: 'idB', result: 'f' },
    { first: 'idA', second: 'idA', result: 'idA' },
    { first: 'idB', second: 'idB', result: 'idB' },
  ],
};
await getOk('category.validate', { category: catSmall }, 'category.validate valid 2-object category', (r) => ({ ok: r?.valid === true && (r?.violations || []).length === 0, detail: `valid=${r?.valid} summary=${JSON.stringify(r?.summary)}` }));
await getOk('category.compose', { category: catSmall, first: 'idA', second: 'f' }, 'category.compose idA then f = f', (r) => ({ ok: r?.result === 'f', detail: JSON.stringify(r).slice(0, 160) }));
await getOk('category.verify_diagram', { category: catSmall, pairs: [{ from: 'A', to: 'B' }] }, 'category.verify_diagram A->B paths equal', (r) => ({ ok: r?.ok === true && r?.pairs?.[0]?.equal === true, detail: `ok=${r?.ok} pairs=${JSON.stringify(r?.pairs).slice(0, 160)}` }));
await getOk('category.limit', { kind: 'pullback', A: ['a1', 'a2', 'a3'], B: ['b1', 'b2'], C: ['c1', 'c2', 'c3'], f: [0, 1, 2], g: [1, 0] }, 'category.limit pullback = sum_c |f^-1(c)|*|g^-1(c)| = 2', (r) => {
  const obj = r?.object || [];
  const s = JSON.stringify(obj);
  return { ok: obj.length === 2 && s.includes('a1') && s.includes('b2') && s.includes('a2') && s.includes('b1'), detail: `object=${s.slice(0, 200)} projections=${JSON.stringify(r?.projections).slice(0, 140)}` };
});
await getOk('category.limit', { kind: 'pushout', C: ['c1', 'c2'], A: ['a1', 'a2'], B: ['b1', 'b2'], f: [0, 1], g: [1, 0] }, 'category.limit pushout: a1~b2, a2~b1 -> 2 classes', (r) => {
  const obj = r?.object || [];
  const s = JSON.stringify(obj);
  return { ok: obj.length === 2 && s.includes('a1') && s.includes('b2') && s.includes('a2') && s.includes('b1'), detail: `object=${s.slice(0, 240)} injections=${JSON.stringify(r?.injections).slice(0, 140)}` };
});
await getOk('category.limit', { kind: 'product', sets: { A: ['a1', 'a2'], B: ['b1', 'b2'] } }, 'category.limit product A×B = 4 pairs', (r) => {
  const obj = r?.object || [];
  return { ok: obj.length === 4, detail: `object=${JSON.stringify(obj)} projections=${JSON.stringify(r?.projections).slice(0, 140)}` };
});
await getOk('category.limit', { kind: 'equalizer', domain: ['x1', 'x2', 'x3'], f: [0, 1, 0], g: [0, 0, 1] }, 'category.limit equalizer of two maps picks index 0', (r) => ({ ok: (r?.object || []).length === 1, detail: JSON.stringify(r).slice(0, 240) }));
await getOk('category.limit', { kind: 'coequalizer', codomain: ['c1', 'c2', 'c3'], f: [0, 1], g: [1, 1] }, 'category.limit coequalizer 3 elements -> classes', (r) => ({ ok: Array.isArray(r?.object) && r.object.length >= 2, detail: JSON.stringify(r).slice(0, 240) }));
await getOk('category.limit', { kind: 'terminal' }, 'category.limit terminal = [null]', (r) => ({ ok: JSON.stringify(r?.object) === '[null]', detail: JSON.stringify(r?.object) }));
await getOk('category.limit', { kind: 'initial' }, 'category.limit initial = []', (r) => ({ ok: JSON.stringify(r?.object) === '[]', detail: JSON.stringify(r?.object) }));
const cat2 = {
  objects: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'C', label: 'C' }],
  morphisms: [
    { id: 'f', dom: 'A', cod: 'B', label: 'f' }, { id: 'g', dom: 'B', cod: 'C', label: 'g' }, { id: 'h', dom: 'A', cod: 'C', label: 'h' },
    { id: 'idA', dom: 'A', cod: 'A' }, { id: 'idB', dom: 'B', cod: 'B' }, { id: 'idC', dom: 'C', cod: 'C' },
  ],
  identities: [{ object: 'A', morphism: 'idA' }, { object: 'B', morphism: 'idB' }, { object: 'C', morphism: 'idC' }],
  compositions: [
    { first: 'f', second: 'g', result: 'h' },
    { first: 'idA', second: 'f', result: 'f' }, { first: 'f', second: 'idB', result: 'f' },
    { first: 'idB', second: 'g', result: 'g' }, { first: 'g', second: 'idC', result: 'g' },
    { first: 'idA', second: 'h', result: 'h' }, { first: 'h', second: 'idC', result: 'h' },
    { first: 'idA', second: 'idA', result: 'idA' }, { first: 'idB', second: 'idB', result: 'idB' }, { first: 'idC', second: 'idC', result: 'idC' },
  ],
};
await getOk('category.functor', { source: cat2, target: cat2, onObjects: [{ from: 'A', to: 'A' }, { from: 'B', to: 'B' }, { from: 'C', to: 'C' }], onMorphisms: [{ from: 'f', to: 'f' }, { from: 'g', to: 'g' }, { from: 'h', to: 'h' }, { from: 'idA', to: 'idA' }, { from: 'idB', to: 'idB' }, { from: 'idC', to: 'idC' }] }, 'category.functor identity functor valid', (r) => ({ ok: r?.valid === true, detail: `valid=${r?.valid} laws=${JSON.stringify(r?.laws)} violations=${JSON.stringify(r?.violations).slice(0, 160)}` }));
await getOk('category.natural', { source: cat2, target: cat2, F: { onObjects: [{ from: 'A', to: 'A' }, { from: 'B', to: 'B' }, { from: 'C', to: 'C' }], onMorphisms: [{ from: 'f', to: 'f' }, { from: 'g', to: 'g' }, { from: 'h', to: 'h' }, { from: 'idA', to: 'idA' }, { from: 'idB', to: 'idB' }, { from: 'idC', to: 'idC' }] }, G: { onObjects: [{ from: 'A', to: 'A' }, { from: 'B', to: 'B' }, { from: 'C', to: 'C' }], onMorphisms: [{ from: 'f', to: 'f' }, { from: 'g', to: 'g' }, { from: 'h', to: 'h' }, { from: 'idA', to: 'idA' }, { from: 'idB', to: 'idB' }, { from: 'idC', to: 'idC' }] }, components: [{ object: 'A', morphism: 'idA' }, { object: 'B', morphism: 'idB' }, { object: 'C', morphism: 'idC' }] }, 'category.natural identity natural transformation: all squares commute', (r) => ({ ok: r?.valid === true && (r?.naturality || []).length >= 3 && r.naturality.every((x) => x.square?.ok === true), detail: `valid=${r?.valid} squares=${(r?.naturality || []).length} labels=${JSON.stringify((r?.naturality || []).map((x) => x.object))} (engine labels by morphism id; API.md says object)` }));

// =====================================================================
// logic
// =====================================================================
await getOk('logic.truthtable', { formula: 'A -> B' }, 'logic.truthtable A->B: 4 rows, 3 true, not tautology', (r) => {
  const rows = r?.rows || [];
  const results = rows.map((x) => x.result);
  return { ok: r?.atoms?.length === 2 && rows.length === 4 && r?.tautology === false && results.filter(Boolean).length === 3, detail: `atoms=${JSON.stringify(r?.atoms)} rows=${rows.length} taut=${r?.tautology} cnf=${r?.cnf}` };
});
await getOk('logic.truthtable', { formula: '(A -> B) & A -> B' }, 'logic.truthtable modus ponens tautology', (r) => ({ ok: r?.tautology === true && r?.rows?.length === 4, detail: `tautology=${r?.tautology} rows=${r?.rows?.length}` }));
await getOk('logic.truthtable', { formula: '~(A & B) <-> (~A | ~B)' }, 'logic.truthtable De Morgan tautology', (r) => ({ ok: r?.tautology === true, detail: `tautology=${r?.tautology} cnf=${r?.cnf}` }));
await getOk('logic.prove', { premises: ['A -> B', 'A'], goal: 'B', system: 'nd' }, 'logic.prove modus ponens: valid, Fitch proof, conclusion B', (r) => {
  const fitch = r?.fitch || [];
  const last = fitch[fitch.length - 1] || {};
  const rules = new Set(fitch.map((f) => f.rule));
  return { ok: r?.valid === true && last.conclusion === 'B' && fitch.length > 1 && r?.proof?.conclusion === 'B' && rules.has('assumption'), detail: `valid=${r?.valid} fitch=${fitch.length} last=${last.conclusion} rules=${[...rules].slice(0, 12).join(',')}` };
});
await getOk('logic.prove', { premises: ['A -> B'], goal: 'B', system: 'nd' }, 'logic.prove invalid implication rejected + countermodel', (r) => ({ ok: r?.valid === false && !!r?.countermodel, detail: `valid=${r?.valid} countermodel=${JSON.stringify(r?.countermodel)}` }));
await getOk('logic.prove_fol', { premises: ['forall x. (Man(x) -> Mortal(x))', 'Man(socrates)'], goal: 'Mortal(socrates)' }, 'logic.prove_fol syllogism valid', (r) => ({ ok: r?.valid === true && r?.searched > 0, detail: `valid=${r?.valid} searched=${r?.searched}` }));
await getOk('logic.prove_fol', { premises: ['Mortal(socrates)'], goal: 'forall x. Mortal(x)' }, 'logic.prove_fol invalid converse + countermodel domain', (r) => ({ ok: r?.valid === false && r?.countermodel?.domainSize >= 1, detail: `valid=${r?.valid} countermodel=${JSON.stringify(r?.countermodel).slice(0, 180)}` }));
await getOk('logic.modal', { frame: 'T', formula: '[]A -> A', worlds: 3 }, 'logic.modal T: []A->A valid', (r) => ({ ok: r?.valid === true, detail: `valid=${r?.valid}` }));
await getOk('logic.modal', { frame: 'K', formula: '[]A -> A', worlds: 3 }, 'logic.modal K: []A->A invalid + countermodel', (r) => ({ ok: r?.valid === false && !!r?.countermodel, detail: `valid=${r?.valid} countermodel=${JSON.stringify(r?.countermodel).slice(0, 160)}` }));
await getOk('logic.modal', { frame: 'S4', formula: '[]A -> [][]A', worlds: 3 }, 'logic.modal S4: []A->[][]A valid', (r) => ({ ok: r?.valid === true, detail: `valid=${r?.valid} countermodel=${JSON.stringify(r?.countermodel ?? null).slice(0, 120)}` }));
await getOk('logic.modal', { frame: 'K', formula: '[]A -> [][]A', worlds: 3 }, 'logic.modal K: []A->[][]A invalid', (r) => ({ ok: r?.valid === false, detail: `valid=${r?.valid}` }));
await getOk('logic.modal', { frame: 'S5', formula: '<>A -> []<>A', worlds: 3 }, 'logic.modal S5: <>A->[]<>A valid', (r) => ({ ok: r?.valid === true, detail: `valid=${r?.valid}` }));
await getOk('logic.equivalent', { a: '(A -> B)', b: '~A | B' }, 'logic.equivalent implication/OR true', (r) => ({ ok: r?.equivalent === true, detail: `equivalent=${r?.equivalent}` }));
await getOk('logic.equivalent', { a: 'A & B', b: 'A | B' }, 'logic.equivalent A&B vs A|B false + countermodel', (r) => ({ ok: r?.equivalent === false && !!r?.countermodel, detail: `equivalent=${r?.equivalent}` }));
await getOk('logic.resolve', { premises: ['P -> Q', 'P'], goal: 'Q' }, 'logic.resolve modus ponens refutable', (r) => ({ ok: r?.refutable === true, detail: `refutable=${r?.refutable} clauses=${JSON.stringify(r?.clauses).slice(0, 140)}` }));
await getOk('logic.parse', { formula: 'forall x. P(x) -> Q(x)', logic: 'fol' }, 'logic.parse FOL wellFormed', (r) => ({ ok: r?.wellFormed === true && Array.isArray(r?.freeVars), detail: `wellFormed=${r?.wellFormed} freeVars=${JSON.stringify(r?.freeVars)}` }));
await getOk('logic.parse', { formula: '□(A → B) ↔ (◇¬A ∨ □B)', logic: 'modal' }, 'logic.parse Unicode modal formula wellFormed', (r) => ({ ok: r?.wellFormed === true, detail: `wellFormed=${r?.wellFormed} pretty=${r?.pretty}` }));

// =====================================================================
// topology / geometry
// =====================================================================
function torusSimplices() {
  const n = 3;
  const idx = (i, j) => i * n + j;
  const edges = [], faces = [], verts = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    verts.push([idx(i, j)]);
    edges.push([idx(i, j), idx((i + 1) % n, j)]);
    edges.push([idx(i, j), idx(i, (j + 1) % n)]);
    faces.push([idx(i, j), idx((i + 1) % n, j), idx((i + 1) % n, (j + 1) % n)]);
    faces.push([idx(i, j), idx((i + 1) % n, (j + 1) % n), idx(i, (j + 1) % n)]);
  }
  return { 0: verts, 1: edges, 2: faces };
}
await getOk('topology.homology', { simplices: torusSimplices() }, 'topology.homology torus: betti [1,2,1], torsion 0, euler 0', (r) => ({
  ok: JSON.stringify(r?.betti) === JSON.stringify([1, 2, 1]) && JSON.stringify(r?.torsion) === JSON.stringify([[], [], []]) && r?.euler === 0,
  detail: `betti=${JSON.stringify(r?.betti)} torsion=${JSON.stringify(r?.torsion)} euler=${r?.euler} chain_ranks=${JSON.stringify(r?.chain_ranks)}`,
}));
await getOk('topology.homology', { simplices: { 0: [['a'], ['b'], ['c']], 1: [['a', 'b'], ['b', 'c'], ['c', 'a']] } }, 'topology.homology circle: betti [1,1], euler 0', (r) => ({ ok: JSON.stringify(r?.betti) === JSON.stringify([1, 1]) && r?.euler === 0, detail: `betti=${JSON.stringify(r?.betti)} euler=${r?.euler}` }));
await getOk('topology.homology', { simplices: { 0: [[1], [2], [3], [4], [5], [6]], 2: [[1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 6], [1, 6, 2], [2, 3, 5], [3, 4, 6], [4, 5, 2], [5, 6, 3], [6, 2, 4]] } }, 'topology.homology RP2: betti [1,0,0], torsion Z/2', (r) => ({ ok: JSON.stringify(r?.betti) === JSON.stringify([1, 0, 0]) && JSON.stringify(r?.torsion) === JSON.stringify([[], [2], []]), detail: `betti=${JSON.stringify(r?.betti)} torsion=${JSON.stringify(r?.torsion)}` }));
await getOk('topology.fundamental_group', { vertices: ['a', 'b', 'c'], edges: [['a', 'b'], ['b', 'c'], ['c', 'a']] }, 'topology.fundamental_group triangle: pi1 = Z (1 generator, 0 relations, betti1 1)', (r) => ({ ok: r?.betti1 === 1 && (r?.generators || []).length === 1 && (r?.relations || []).length === 0, detail: `generators=${(r?.generators || []).length} relations=${JSON.stringify(r?.relations).slice(0, 120)} abelianization=${JSON.stringify(r?.abelianization).slice(0, 100)}` }));
await getOk('topology.fundamental_group', { vertices: ['a', 'b'], edges: [['a', 'b']] }, 'topology.fundamental_group tree: trivial', (r) => ({ ok: r?.betti1 === 0, detail: `generators=${JSON.stringify(r?.generators)} betti1=${r?.betti1}` }));
await getOk('geometry.christoffel', { coords: ['t', 'p'], metric: [['1', '0'], ['0', 'sin(t)**2']] }, 'geometry.christoffel sphere: Γ^p_tp=Γ^p_pt=cot t, Γ^t_pp=-sin t cos t, others 0', (r) => {
  const g = r?.christoffel || [];
  const gtp = g?.[1]?.[0]?.[1] ?? '';
  const gpt = g?.[1]?.[1]?.[0] ?? '';
  const gpp = g?.[0]?.[1]?.[1] ?? '';
  const zeros = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]].map(([i, j, k]) => ({ i, j, k, v: g?.[i]?.[j]?.[k] })).filter((x) => x.v !== '0' && x.v !== 0 && x.v !== 0.0);
  const a = sympyCheck(String(gtp), 'cos(t)/sin(t)');
  const b = sympyCheck(String(gpp), '-sin(t)*cos(t)');
  const c = sympyCheck(String(gtp), String(gpt));
  return { ok: a.ok && b.ok && c.ok && zeros.length === 0, detail: `Γ^p_tp=${JSON.stringify(gtp)} Γ^p_pt=${JSON.stringify(gpt)} Γ^t_pp=${JSON.stringify(gpp)} zerosOk=${zeros.length === 0} ${a.ok ? '' : a.detail} ${b.ok ? '' : b.detail}` };
});
await getOk('geometry.curvature', { coords: ['t', 'p'], metric: [['1', '0'], ['0', 'sin(t)**2']] }, 'geometry.curvature unit sphere: scalar 2, Ricci=g', (r) => {
  const ricci = r?.ricci || [];
  const ricciOk = sympyCheck(String(ricci?.[0]?.[0] ?? 'X'), '1').ok && sympyCheck(String(ricci?.[1]?.[1] ?? 'X'), 'sin(t)**2').ok;
  return { ok: String(r?.scalar) === '2' && ricciOk, detail: `scalar=${r?.scalar} ricci=${JSON.stringify(ricci).slice(0, 180)}` };
});
await getOk('geometry.curvature', { coords: ['x', 'y'], metric: [['1', '0'], ['0', '1']] }, 'geometry.curvature flat plane: scalar 0, Riemann 0', (r) => ({ ok: String(r?.scalar) === '0' && /0/.test(JSON.stringify(r?.riemann)), detail: `scalar=${r?.scalar} ricci=${JSON.stringify(r?.ricci)}` }));
await getOk('geometry.lie_bracket', { coords: ['x', 'y'], X: ['y', '0'], Y: ['x', '0'] }, 'geometry.lie_bracket [y∂x, x∂x] = y∂x', (r) => sympySet((r?.result || []).map(String), ['y', '0']));
await getOk('geometry.exterior_derivative', { coords: ['x', 'y'], components: { 0: 'x*y' }, formDegree: 0 }, 'geometry.exterior_derivative d(xy) = (y, x)', (r) => {
  const comp = r?.components || {};
  const vals = Object.keys(comp).sort().map((k) => comp[k]);
  return sympySet(vals.map(String), ['y', 'x']);
});

// =====================================================================
// numeric / prob / opt / graph
// =====================================================================
await getOk('num.ode', { rhs: '-y', y0: [1], tRange: [0, 1], method: 'RK45' }, "num.ode y'=-y y0=1 -> y(1)=e^-1", (r) => {
  const t = r?.t || [], y = r?.y || [];
  const last = Array.isArray(y[0]) ? y[0][y[0].length - 1] : y[y.length - 1];
  return { ok: Math.abs(last - Math.exp(-1)) < 5e-3 && Math.abs(t[t.length - 1] - 1) < 1e-9, detail: `t_end=${t?.[t.length - 1]} y_end=${last} expected=${Math.exp(-1).toFixed(6)}` };
});
await getOk('num.root', { expr: 'x**3 - x - 2', var: 'x', bracket: [1, 2] }, 'num.root x^3-x-2 root = 1.5213797068', (r) => {
  const v = num(r?.root);
  return { ok: Math.abs(v - 1.5213797068045676) < 1e-6 && r?.iterations > 0, detail: `root=${r?.root} iterations=${r?.iterations}` };
});
await getOk('num.integrate', { expr: 'sin(x)', var: 'x', range: [0, Math.PI] }, 'num.integrate sin on [0,pi] = 2', (r) => ({ ok: close(r?.value, 2, 1e-6), detail: `value=${r?.value}` }));
await getOk('prob.dist', { dist: 'normal', params: { mu: 0, sigma: 1 }, op: 'mean' }, 'prob.dist normal mean 0 variance 1', (r) => ({ ok: num(r?.mean) === 0 && num(r?.variance) === 1, detail: `mean=${r?.mean} variance=${r?.variance}` }));
await getOk('prob.dist', { dist: 'normal', params: { mu: 0, sigma: 1 }, op: 'pdf', x: 0 }, 'prob.dist normal pdf(0)=1/sqrt(2pi)', (r) => ({ ok: close(r?.value, 1 / Math.sqrt(2 * Math.PI), 1e-12), detail: `value=${r?.value}` }));
await getOk('prob.dist', { dist: 'binomial', params: { n: 10, p: 0.3 }, op: 'pmf', x: 3 }, 'prob.dist Binomial(10,.3) P(X=3)=0.266827932', (r) => ({ ok: close(r?.value, 0.266827932, 1e-9), detail: `value=${r?.value}` }));
await getOk('prob.dist', { dist: 'poisson', params: { lam: 2 }, op: 'pmf', x: 3 }, 'prob.dist Poisson(2) P(X=3)=0.180447044', (r) => ({ ok: close(r?.value, 8 * Math.exp(-2) / 6, 1e-9), detail: `value=${r?.value}` }));
await getOk('prob.expectation', { expr: 'x**2', dist: 'normal', params: { mu: 0, sigma: 1 } }, 'prob.expectation normal E[X^2]=1', (r) => ({ ok: close(r?.numeric, 1, 1e-9), detail: `numeric=${r?.numeric}` }));
await getOk('prob.expectation', { expr: 'x', dist: 'exponential', params: { lam: 2 } }, 'prob.expectation Exp(2) E[X]=1/2', (r) => ({ ok: close(r?.numeric, 0.5, 1e-9), detail: `numeric=${r?.numeric}` }));
await getOk('opt.stationary', { expr: 'x**2 + y**2', vars: ['x', 'y'] }, 'opt.stationary x^2+y^2 -> minimum at (0,0), H=2I', (r) => {
  const p = r?.points?.[0] || {};
  const pt = p.point || {};
  const ok = p.classification === 'minimum' && num(pt.x) === 0 && num(pt.y) === 0 && JSON.stringify(p.hessian) === JSON.stringify([['2', '0'], ['0', '2']]);
  return { ok, detail: `point=${JSON.stringify(p).slice(0, 260)}` };
});
await getOk('opt.stationary', { expr: 'x**2 - y**2', vars: ['x', 'y'] }, 'opt.stationary x^2-y^2 -> saddle', (r) => ({ ok: r?.points?.[0]?.classification === 'saddle', detail: `classification=${r?.points?.[0]?.classification}` }));
await getOk('opt.minimize', { expr: '(x-1)**2 + (y-2)**2', vars: ['x', 'y'], start: [0, 0] }, 'opt.minimize -> (1,2)', (r) => {
  const pt = r?.point || {};
  return { ok: close(pt.x ?? pt[0], 1, 1e-4) && close(pt.y ?? pt[1], 2, 1e-4), detail: `point=${JSON.stringify(pt)} value=${r?.value} success=${r?.success}` };
});
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['c', 'a']], op: 'components' }, 'graph.analyze triangle 1 component', (r) => ({ ok: r?.count === 1, detail: JSON.stringify(r).slice(0, 140) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a']], op: 'is_bipartite' }, 'graph.analyze C4 bipartite true', (r) => ({ ok: r?.value === true, detail: JSON.stringify(r).slice(0, 140) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['c', 'a']], op: 'is_bipartite' }, 'graph.analyze C3 bipartite false', (r) => ({ ok: r?.value === false, detail: JSON.stringify(r).slice(0, 140) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['a', 'c']], op: 'shortest_path', source: 'a', target: 'c' }, 'graph.analyze shortest_path a->c length 1', (r) => ({ ok: JSON.stringify(r?.path) === JSON.stringify(['a', 'c']) && r?.length === 1, detail: JSON.stringify(r).slice(0, 160) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c']], op: 'is_tree' }, 'graph.analyze path is_tree true', (r) => ({ ok: r?.value === true, detail: JSON.stringify(r).slice(0, 140) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['a', 'c']], op: 'spanning_tree' }, 'graph.analyze spanning_tree n-1=2 edges', (r) => ({ ok: (r?.edges || []).length === 2, detail: JSON.stringify(r).slice(0, 160) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c']], op: 'diameter' }, 'graph.analyze path diameter 2', (r) => ({ ok: r?.diameter === 2, detail: JSON.stringify(r).slice(0, 120) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['a', 'c']], op: 'coloring' }, 'graph.analyze C3 needs 3 colors', (r) => ({ ok: r?.colorCount === 3, detail: JSON.stringify(r).slice(0, 140) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c']], op: 'degree_sequence' }, 'graph.analyze degrees path = [2,1,1]', (r) => ({ ok: JSON.stringify(r?.sequence) === JSON.stringify([2, 1, 1]), detail: JSON.stringify(r).slice(0, 140) }));
await getOk('graph.analyze', { edges: [['a', 'b'], ['b', 'c'], ['a', 'c']], op: 'pagerank' }, 'graph.analyze C3 pagerank all 1/3', (r) => {
  const ranks = Object.values(r?.ranks || {});
  return { ok: ranks.length === 3 && ranks.every((v) => Math.abs(v - 1 / 3) < 1e-9), detail: JSON.stringify(r?.ranks) };
});

// =====================================================================
// plot
// =====================================================================
await getOk('plot.sample', { expr: 'sin(x)', var: 'x', range: [-Math.PI, Math.PI], samples: 201 }, 'plot.sample sin: 201 points, yRange [-1,1]', (r) => {
  const pts = r?.curves?.[0]?.points?.[0] || [];
  const ok = pts.length === 201 && Math.abs(num(pts[100][1])) < 1e-9 && Math.abs(num(r?.yRange?.[0]) + 1) < 1e-6 && Math.abs(num(r?.yRange?.[1]) - 1) < 1e-6;
  return { ok, detail: `n=${pts.length} mid=${JSON.stringify(pts[100])} yRange=${JSON.stringify(r?.yRange)}` };
});
await getOk('plot.sample', { expr: 'tan(x)', var: 'x', range: [-2, 2], samples: 201 }, 'plot.sample tan split at asymptote', (r) => {
  const n = (r?.curves?.[0]?.points || []).length;
  return { ok: n >= 2, detail: `polylines=${n}` };
});
await getOk('plot.sample_multi', { exprs: ['sin(x)', 'cos(x)'], var: 'x', range: [0, Math.PI], samples: 51 }, 'plot.sample_multi 2 curves, 51 points each', (r) => ({ ok: (r?.curves || []).length === 2 && r.curves.every((c) => (c.points?.[0] || []).length === 51), detail: `curves=${(r?.curves || []).length} pts=${(r?.curves?.[0]?.points?.[0] || []).length}` }));
await getOk('plot.polar', { r: 'cos(4*theta)', theta: 'theta', range: [0, 6.2832], samples: 101 }, 'plot.polar rose 4 petals: 101 points', (r) => ({ ok: (r?.points || []).length === 101, detail: `points=${(r?.points || []).length}` }));
await getOk('plot.parametric', { x: 'cos(t)', y: 'sin(t)', t: 't', range: [0, 2 * Math.PI], samples: 101 }, 'plot.parametric circle: |p|=1 on sampled points', (r) => {
  const pts = r?.points || [];
  const ok = pts.length === 101 && pts.every(([x, y]) => Math.abs(Math.hypot(x, y) - 1) < 1e-9);
  return { ok, detail: `points=${pts.length} first=${JSON.stringify(pts[0])}` };
});
await getOk('plot.implicit', { expr: 'x**2 + y**2 - 1', xRange: [-2, 2], yRange: [-2, 2], grid: 80 }, 'plot.implicit circle segments on radius ~1', (r) => ({ ok: (r?.segments || []).length > 20, detail: `segments=${(r?.segments || []).length}` }));
await getOk('plot.field', { P: '-y', Q: 'x', xVar: 'x', yVar: 'y', xRange: [-1, 1], yRange: [-1, 1], n: 5 }, 'plot.field rotation field: 25 arrows', (r) => ({ ok: (r?.arrows || []).length === 25, detail: `arrows=${(r?.arrows || []).length} first=${JSON.stringify(r?.arrows?.[0])}` }));
await getOk('plot.surface3d', { expr: 'x**2 - y**2', xVar: 'x', yVar: 'y', xRange: [-1, 1], yRange: [-1, 1], n: 4 }, 'plot.surface3d: 16 vertices, 18 triangles', (r) => ({ ok: (r?.vertices || []).length === 16 && (r?.indices || []).length === 18, detail: `vertices=${(r?.vertices || []).length} indices=${(r?.indices || []).length} zRange=${JSON.stringify(r?.zRange)}` }));
function svgCheck(svg, needAxes) {
  const s = String(svg || '').trim();
  const hasDraw = /<(path|polyline|line)\b/.test(s);
  const ok = /^<svg[\s>]/.test(s) && /<\/svg>$/.test(s) && /viewBox=/.test(s) && !/NaN|Infinity/.test(s) && hasDraw;
  return { ok, detail: `len=${s.length} head=${s.slice(0, 70)} hasDraw=${hasDraw} hasViewBox=${/viewBox=/.test(s)}` };
}
await getOk('plot.svg', { kind: 'sample', expr: 'sin(x)', var: 'x', range: [-Math.PI, Math.PI], samples: 200 }, 'plot.svg sample: well-formed SVG with path', (r) => svgCheck(r?.svg, true));
await getOk('plot.svg', { kind: 'surface3d', expr: 'x**2 - y**2', xVar: 'x', yVar: 'y', xRange: [-1, 1], yRange: [-1, 1], n: 12 }, 'plot.svg surface3d wireframe', (r) => svgCheck(r?.svg, false));
await getOk('plot.svg', { kind: 'parametric', x: 'cos(t)', y: 'sin(t)', t: 't', range: [0, 6.2832], samples: 100 }, 'plot.svg parametric', (r) => svgCheck(r?.svg, false));
await getOk('plot.svg', { kind: 'polar', r: 'cos(4*theta)', theta: 'theta', range: [0, 6.2832], samples: 100 }, 'plot.svg polar', (r) => svgCheck(r?.svg, false));
await getOk('plot.svg', { kind: 'field', P: '-y', Q: 'x', xVar: 'x', yVar: 'y', xRange: [-1, 1], yRange: [-1, 1], n: 5 }, 'plot.svg field', (r) => svgCheck(r?.svg, false));
await getOk('plot.svg', { kind: 'implicit', expr: 'x**2+y**2-1', xRange: [-2, 2], yRange: [-2, 2], grid: 60 }, 'plot.svg implicit', (r) => svgCheck(r?.svg, false));

// =====================================================================
// error envelopes + survival
// =====================================================================
await getErr('calc.simplify', { expr: 'sin(' }, 'parse-error', 'error: bad expression -> parse-error');
await getErr('calc.simplify', { expr: 'x +' }, 'parse-error', 'error: trailing operator -> parse-error');
await getErr('definitely.not.an.op', {}, 'unsupported', 'error: unknown op -> unsupported (docs/HOST.md checklist)', true);
await getErr('calc.simplify', { expr: 'x+'.repeat(2100) }, 'limit', 'error: oversized expression -> limit');
await getErr('calc.matrix', { op: 'det', matrix: Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => '1')) }, 'limit', 'error: 13x13 matrix -> limit');
await getErr('calc.diff', { expr: 'x', var: 'x', order: 1000000 }, 'limit', 'error: excessive derivative order -> limit');
await getErr('calc.matrix', { op: 'inv', matrix: [['1', '2'], ['2', '4']] }, 'domain-error', 'error: singular matrix -> domain-error');
await getErr('algebra.group', { op: 'order', generators: [[[1, 2, 3]]], n: 'not-a-number' }, 'bad-request', 'error: bad n type -> bad-request');
await getErr('category.limit', { kind: 'pushout', C: ['c1', 'c2'], A: ['a1'], B: ['b1'], f: [0], g: [0] }, null, 'error: malformed pushout mapping -> typed error (not crash)', true);
const after = await post('meta.info', {});
record('engine still answers after error probes', after.payload?.ok === true && after.payload?.result?.engine?.available === true, `status=${after.status}`);
const ping = await post('calc.simplify', { expr: '2+2' });
record('calc.simplify still correct after errors', ping.payload?.ok === true && String(ping.payload.result.result) === '4', JSON.stringify(ping.payload).slice(0, 160));

// =====================================================================
// route fencing + assets
// =====================================================================
{
  const base = new URL(API);
  const getRes = await fetch(`${base.origin}/api/mathlab/api`);
  record('GET /api/mathlab/api -> 405', getRes.status === 405, `status=${getRes.status}`);
  const badJson = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{not json' });
  record('malformed JSON body -> 400 bad-request', badJson.status === 400, `status=${badJson.status} body=${(await badJson.text()).slice(0, 140)}`);
  const evil = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://evil.example' }, body: JSON.stringify({ op: 'meta.info', args: {} }) });
  record('cross-origin POST rejected (403 forbidden)', evil.status === 403, `status=${evil.status} body=${(await evil.text()).slice(0, 140)}`);
  const miss = await fetch(`${base.origin}/api/mathlab/assets/nope.js`);
  record('unknown asset path -> 404', miss.status === 404, `status=${miss.status}`);
  const katex = await fetch(`${base.origin}/api/mathlab/assets/katex/katex.min.js`);
  const katexCss = await fetch(`${base.origin}/api/mathlab/assets/katex/katex.min.css`);
  const font = await fetch(`${base.origin}/api/mathlab/assets/katex/fonts/KaTeX_Main-Regular.woff2`);
  record('KaTeX assets served with correct content types', katex.status === 200 && /javascript/.test(katex.headers.get('content-type') || '') && katexCss.status === 200 && /text\/css/.test(katexCss.headers.get('content-type') || '') && font.status === 200 && /font\/woff2/.test(font.headers.get('content-type') || ''), `js=${katex.status}/${katex.headers.get('content-type')} css=${katexCss.status} font=${font.status}/${font.headers.get('content-type')}`);
}

// =====================================================================
// summary
// =====================================================================
if (transientResets) console.log(`NOTE: ${transientResets} transient ECONNRESET(s) retried`);
const pass = records.filter((r) => r.ok).length;
console.log(`\n${pass}/${records.length} HTTP checks passed`);
const fails = records.filter((r) => !r.ok);
if (fails.length) {
  console.log('\nFAILURES:');
  for (const f of fails) console.log(`- ${f.name}: ${f.detail}`);
  process.exitCode = 1;
}

