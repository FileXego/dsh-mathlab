// Content spot-check for MathLab (verifier): KaTeX validity of every symbol latex,
// 10 sampled symbols, 5 examples executed against their `expect`, 5 Lean snippets.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFileSync(join(root, p), 'utf8');
const require = createRequire(import.meta.url);
const katex = (() => {
  const src = read('assets/katex/katex.min.js');
  const sandbox = { module: { exports: {} }, exports: {}, console };
  sandbox.exports = sandbox.module.exports;
  const vm = require('node:vm');
  vm.runInNewContext(src, sandbox, { filename: 'katex.min.js' });
  return sandbox.module.exports.katex || sandbox.module.exports || sandbox.exports.katex || sandbox.katex;
})();
if (!katex || typeof katex.renderToString !== 'function') { console.log('FAIL :: cannot load KaTeX from assets'); process.exit(1); }
const API = 'http://127.0.0.1:62937/api/mathlab/api';
const results = [];
function record(name, ok, detail) { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} :: ${name}${detail ? ' :: ' + detail : ''}`); }
async function call(op, args) {
  const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op, args }) });
  return r.json();
}

// ---------- every symbol latex must parse in KaTeX (strict) ----------
const symbols = JSON.parse(read('data/symbols.json'));
const badLatex = [];
for (const s of symbols.symbols) {
  try { katex.renderToString(String(s.latex), { throwOnError: true, displayMode: false }); }
  catch (e) { badLatex.push(`${s.id}: ${s.latex} -> ${e.message}`); }
}
record(`KaTeX parses all ${symbols.symbols.length} symbol LaTeX strings (throwOnError)`, badLatex.length === 0, badLatex.slice(0, 4).join(' | ') || 'no errors');

// ---------- 10 sampled symbols for mathematical accuracy ----------
const picks = [
  ['∫', 'definite integral'], ['lim', 'limit'], ['∀', 'forall'], ['∃', 'exists'], ['∅', 'empty set'],
  ['∇', 'nabla/gradient'], ['Δ', 'laplacian'], ['℘', 'power set'], ['⊢', 'turnstile'], ['⊗', 'tensor'],
];
const chosen = [];
for (const [glyph, label] of picks) {
  const hit = symbols.symbols.find((s) => s.symbol === glyph || s.unicode === glyph || (s.symbol || '').includes(glyph));
  if (!hit) { record(`sample symbol ${label} (${glyph}) present`, false, 'not found'); continue; }
  chosen.push(hit);
  record(`sample symbol ${label} #${hit.id}`, true, `symbol=${hit.symbol} name=${hit.name} / ${hit.name_zh} latex=${hit.latex} lean=${hit.lean || '-'}`);
}
// accuracy assertions for a couple of unambiguous ones
const byId = (id) => symbols.symbols.find((s) => s.id === id);
const emptySet = symbols.symbols.find((s) => s.symbol === '∅');
if (emptySet) record('∅ latex uses \\emptyset or \\varnothing', /\\emptyset|\\varnothing/.test(emptySet.latex), emptySet.latex);
const forallSym = symbols.symbols.find((s) => s.symbol === '∀');
if (forallSym) record('∀ latex uses \\forall', /\\forall/.test(forallSym.latex), forallSym.latex);
const tensorSym = symbols.symbols.find((s) => s.symbol === '⊗');
if (tensorSym) record('⊗ latex uses \\otimes', /\\otimes/.test(tensorSym.latex), tensorSym.latex);
const turnstile = symbols.symbols.find((s) => s.symbol === '⊢');
if (turnstile) record('⊢ latex uses \\vdash or \\turnstile', /\\vdash|\\turnstile/.test(turnstile.latex), turnstile.latex);

// ---------- 5 examples executed against expect ----------
const examples = JSON.parse(read('data/examples.json')).examples;
function normalize(s) { return String(s).replace(/\s+/g, '').replace(/\*\*/g, '^'); }
const checks = [
  ['gaussian-integral', (r) => String(r?.result) === 'sqrt(pi)' || normalize(r?.latex || '').includes('\\sqrt{\\pi}')],
  ['basel-problem', (r) => normalize(r?.result || '').includes('pi^2/6')],
  ['s3-order', (r) => Number(r?.order ?? r?.value) === 6],
  ['circle-homology', (r) => JSON.stringify(r?.betti) === JSON.stringify([1, 1])],
  ['normal-pdf', (r) => Math.abs(Number(r?.value) - 1 / Math.sqrt(2 * Math.PI)) < 1e-6],
  ['factor-quartic', (r) => {
    const s = JSON.stringify(r);
    return /x - 1/.test(s) && /x \+ 1/.test(s) && /x\*\*2 \+ 1/.test(s);
  }],
  ['torus-christoffel', (r) => {
    // metric diag(R^2,(r+R cos u)^2): Gamma^u_vv = (r+R cos u) sin u / R; Gamma^v_uv = -R sin u/(r+R cos u)
    const g = r?.christoffel || [];
    const guu = g?.[0]?.[1]?.[1] ?? '';
    const gvu = g?.[1]?.[0]?.[1] ?? '';
    const py = `from sympy import symbols, sympify, simplify\nR,r,u=symbols('R r u')\na=sympify(${JSON.stringify(String(guu))}); b=sympify(${JSON.stringify(String(gvu))})\nprint((simplify(a-(r+R*sympify('cos(u)'))*sympify('sin(u)')/R)==0) and (simplify(b+R*sympify('sin(u)')/(r+R*sympify('cos(u)')))==0))`;
    const { execFileSync } = require('node:child_process');
    const ok = execFileSync('python', ['-c', py], { encoding: 'utf8' }).trim() === 'True';
    return ok;
  }],
];
for (const [id, check] of checks) {
  const ex = examples.find((e) => e.id === id);
  if (!ex) { record(`example ${id} present`, false, 'not found'); continue; }
  const res = await call(ex.action.op, ex.action.args);
  if (res.ok !== true) { record(`example ${id} executes`, false, `${ex.action.op} -> ${JSON.stringify(res.error)}`); continue; }
  let verdict = false, detail = '';
  try { verdict = !!check(res.result); detail = `expect=${ex.expect} result=${JSON.stringify(res.result).slice(0, 220)}`; }
  catch (e) { detail = `check threw: ${e.message}`; }
  record(`example ${id} math matches expect (${ex.action.op})`, verdict, detail);
}

// ---------- 5 Lean snippets: print for manual Mathlib-name audit ----------
const snippets = JSON.parse(read('data/lean-snippets.json')).snippets;
const sampleIds = ['irrational-sqrt2', 'nat-prime-seven', 'adjunction', 'measure-integral', 'category-functor'];
for (const id of sampleIds) {
  const sn = snippets.find((s) => s.id === id);
  if (!sn) { record(`lean snippet ${id} present`, false, 'not found'); continue; }
  record(`lean snippet ${id} (${sn.level}) imports=${sn.imports.join(',')}`, true, '\n--- code ---\n' + sn.code + '\n--- explanation ---\n' + sn.explanation);
}
// import sanity: every snippet imports Mathlib or Mathlib.Tactic only
const badImports = snippets.filter((s) => !s.imports.every((i) => i === 'Mathlib' || i === 'Mathlib.Tactic'));
record('all Lean snippet imports are Mathlib / Mathlib.Tactic', badImports.length === 0, badImports.map((s) => `${s.id}:${s.imports}`).join(','));

// suspicious declaration heuristic: names stated in explanation vs code
const suspicious = [];
for (const s of snippets) {
  const named = [...String(s.explanation).matchAll(/`([A-Za-z_][A-Za-z0-9_.'₀-₉]*[A-Za-z0-9_])`/g)].map((m) => m[1]);
  for (const n of named) if (!String(s.code).includes(n) && /^[a-zA-Z_][a-zA-Z0-9_.']*$/.test(n) && n.length > 6) suspicious.push(`${s.id}:${n}`);
}
record('explanation-cited Mathlib names appear in snippet code', suspicious.length === 0, suspicious.slice(0, 8).join(','));

const pass = results.filter((r) => r.ok).length;
console.log(`\n${pass}/${results.length} content checks passed`);
if (results.some((r) => !r.ok)) process.exitCode = 1;

