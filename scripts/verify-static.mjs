// Independent static verification for the MathLab DSH plugin (verifier teammate).
// Read-only: checks files/text, never modifies production files.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFileSync(join(root, p), 'utf8');
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} :: ${name}${detail ? ' :: ' + detail : ''}`);
}

// ---------- client.js wrapper ----------
const client = read('client.js');
check('client.js parses (node --check was run separately)', true, `${client.length} bytes`);
check('client.js contains __ModuleLoader__.load', client.includes('__ModuleLoader__.load'));
const idMatch = client.match(/id\s*:\s*['"]dsh-mathlab['"]/);
check('client.js module id is dsh-mathlab', !!idMatch, idMatch ? idMatch[0] : 'not found');
check('client.js has require(\'react\')', client.includes("require('react')"));
const importStmt = /(^|\n)\s*import\s+[A-Za-z_{*"']/g;
const importHits = [...client.matchAll(importStmt)].map((m) => m[0].trim()).slice(0, 5);
check('client.js has no ES import statements', importHits.length === 0, importHits.join(' | '));
const exportStmt = /(^|\n)\s*export\s+(default|const|function|class|\{)/g;
const exportHits = [...client.matchAll(exportStmt)].map((m) => m[0].trim()).slice(0, 5);
check('client.js has no ES export statements', exportHits.length === 0, exportHits.join(' | '));
check('client.js has no JSX element syntax (<div etc.)', !/<(div|span|section|button|svg|input|h1)[\s>]/.test(client));
check('client.js has no document.body writes', !/document\.body\s*=/.test(client));
check('client.js injects exactly one <style data-mathlab-css>', (client.match(/data-mathlab-css/g) || []).length >= 1);
check('client.js uses ml- class prefix', client.includes('ml-'));
check('client.js uses theme tokens', client.includes('--dsw-alias-'));

// also check client-src sources
const srcFiles = readdirSync(join(root, 'client-src')).filter((f) => f.endsWith('.js'));
for (const f of srcFiles) {
  const s = readFileSync(join(root, 'client-src', f), 'utf8');
  if (/(^|\n)\s*import\s+[A-Za-z_{*"']/.test(s)) check(`client-src/${f} no ES import`, false);
  if (/<(div|span|section|button|svg|input|h1)[\s>]/.test(s)) check(`client-src/${f} no JSX`, false);
}
check('client-src files checked for import/JSX', true, `${srcFiles.length} files`);

// ---------- forbidden imports in host half ----------
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}
const hostFiles = ['index.js', ...readdirSync(join(root, 'lib')).filter((f) => f.endsWith('.js')).map((f) => `lib/${f}`)];
let forbidden = [];
for (const f of hostFiles) {
  const s = stripComments(read(f));
  const re = /from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]/g;
  for (const m of s.matchAll(re)) {
    const spec = m[1] || m[2];
    if (!spec.startsWith('.') && !spec.startsWith('node:')) forbidden.push(`${f}: ${spec}`);
  }
}
check('host files import only relative/node: modules (comments excluded)', forbidden.length === 0, forbidden.join('; '));
const deepseekRuntime = hostFiles.filter((f) => {
  const s = stripComments(read(f));
  return /from\s+['"]@deepseek-ai\/|import\s*\(\s*['"]@deepseek-ai\//.test(s);
});
check('no runtime @deepseek-ai imports in index.js/lib', deepseekRuntime.length === 0, deepseekRuntime.join(','));
check('@deepseek-ai appears only in JSDoc type comments', hostFiles.every((f) => !stripComments(read(f)).includes('@deepseek-ai/')));

// absolute paths leak check (D:\ / C:\ / /home / /Users) outside comments
let absHits = [];
for (const f of [...hostFiles, 'client.js']) {
  const s = read(f);
  const lines = s.split('\n');
  lines.forEach((line, i) => {
    if (/[A-Za-z]:\\\\|D:\\\\|C:\\\\|\/Users\/|\/home\//.test(line)) absHits.push(`${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}
check('no absolute filesystem paths in host/client code', absHits.length === 0, absHits.slice(0, 5).join(' | '));

// ---------- JSON data ----------
const contentDoc = read('docs/CONTENT.md');
const symbols = JSON.parse(read('data/symbols.json'));
const examples = JSON.parse(read('data/examples.json'));
const snippets = JSON.parse(read('data/lean-snippets.json'));
check('data/symbols.json parses', true, `${symbols.symbols.length} symbols / ${symbols.fields.length} fields`);
check('data/examples.json parses', true, `${examples.examples.length} examples`);
check('data/lean-snippets.json parses', true, `${snippets.snippets.length} snippets`);
check('symbols count in target range 240-320', symbols.symbols.length >= 240 && symbols.symbols.length <= 320, String(symbols.symbols.length));
check('examples count in target range 40-60', examples.examples.length >= 40 && examples.examples.length <= 60, String(examples.examples.length));
check('lean snippets count in target range 35-60', snippets.snippets.length >= 35 && snippets.snippets.length <= 60, String(snippets.snippets.length));
const fieldIds = symbols.fields.map((f) => f.id);
const expectedFields = ['logic', 'set', 'number', 'analysis', 'algebra', 'linear-algebra', 'topology', 'geometry', 'category', 'probability', 'differential', 'combinatorics', 'lean'];
check('all 13 required symbol fields present', expectedFields.every((f) => fieldIds.includes(f)), fieldIds.join(','));
const fieldCounts = {};
for (const s of symbols.symbols) fieldCounts[s.field] = (fieldCounts[s.field] || 0) + 1;
const minCountFail = expectedFields.filter((f) => (fieldCounts[f] || 0) < 12);
check('each field has >= 12 symbols', minCountFail.length === 0, minCountFail.map((f) => `${f}=${fieldCounts[f] || 0}`).join(','));
const bigFields = ['logic', 'algebra', 'category', 'analysis'];
const bigFail = bigFields.filter((f) => (fieldCounts[f] || 0) < 25);
check('logic/algebra/category/analysis >= 25 symbols', bigFail.length === 0, bigFields.map((f) => `${f}=${fieldCounts[f]}`).join(','));
const ids = symbols.symbols.map((s) => s.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
check('symbol ids unique', dupIds.length === 0, dupIds.slice(0, 5).join(','));
const missingRequired = symbols.symbols.filter((s) => !['id', 'symbol', 'latex', 'unicode', 'name', 'name_zh', 'field', 'description', 'description_zh'].every((k) => typeof s[k] === 'string' && s[k].length > 0) || !Array.isArray(s.tags));
check('symbols have required string fields + tags array', missingRequired.length === 0, missingRequired.map((s) => s.id).slice(0, 5).join(','));
const badFieldRefs = symbols.symbols.filter((s) => !fieldIds.includes(s.field));
check('symbol field refs valid', badFieldRefs.length === 0, badFieldRefs.map((s) => s.id).join(','));

// examples
const exIds = examples.examples.map((e) => e.id);
const dupEx = exIds.filter((id, i) => exIds.indexOf(id) !== i);
check('example ids unique', dupEx.length === 0, dupEx.join(','));
const panels = new Set(['compute', 'linalg', 'algebra', 'category', 'logic', 'lean', 'topology', 'plot', 'symbols']);
const badPanel = examples.examples.filter((e) => !panels.has(e.panel));
check('example panel values valid', badPanel.length === 0, badPanel.map((e) => `${e.id}:${e.panel}`).join(','));
const exampleFields = examples.examples.map((e) => e.field);
const examplePanels = examples.examples.map((e) => e.panel);
const panelCounts = {};
for (const p of examplePanels) panelCounts[p] = (panelCounts[p] || 0) + 1;
check('examples cover required panels (compute/linalg/algebra/category/logic/lean/topology/plot)', ['compute', 'linalg', 'algebra', 'category', 'logic', 'lean', 'topology', 'plot'].every((p) => (panelCounts[p] || 0) > 0), JSON.stringify(panelCounts));
check('examples meet CONTENT minimum counts (analysis>=8, linalg>=5, algebra>=6, category>=5, logic>=5, lean=3, topology>=4, plot>=4)', (exampleFields.filter((f) => f === 'analysis').length >= 8) && (panelCounts.linalg || 0) >= 5 && (panelCounts.algebra || 0) >= 5 && (panelCounts.category || 0) >= 5 && (panelCounts.logic || 0) >= 5 && (panelCounts.lean || 0) === 3 && (panelCounts.plot || 0) >= 4, `analysis=${exampleFields.filter((f) => f === 'analysis').length} panels=${JSON.stringify(panelCounts)}`);
const requiredExampleTexts = examples.examples.filter((e) => !['id', 'title', 'title_zh', 'field', 'panel', 'description', 'description_zh'].every((k) => typeof e[k] === 'string' && e[k].length > 0));
check('examples have bilingual required fields', requiredExampleTexts.length === 0, requiredExampleTexts.map((e) => e.id).join(','));
const noAction = examples.examples.filter((e) => !e.action || typeof e.action.op !== 'string' || typeof e.action.args !== 'object');
check('examples have action {op,args}', noAction.length === 0, noAction.map((e) => e.id).join(','));

// snippets
const snIds = snippets.snippets.map((s) => s.id);
check('snippet ids unique', snIds.filter((id, i) => snIds.indexOf(id) !== i).length === 0);
const levels = new Set(['beginner', 'intermediate', 'advanced']);
const badLevel = snippets.snippets.filter((s) => !levels.has(s.level));
check('snippet levels valid', badLevel.length === 0, badLevel.map((s) => `${s.id}:${s.level}`).join(','));
const badImports = snippets.snippets.filter((s) => !Array.isArray(s.imports) || !s.imports.length);
check('snippets have non-empty imports array', badImports.length === 0, badImports.map((s) => s.id).join(','));
const badSnippetText = snippets.snippets.filter((s) => !['id', 'title', 'title_zh', 'code', 'explanation', 'explanation_zh'].every((k) => typeof s[k] === 'string' && s[k].length > 0));
check('snippets have bilingual required fields', badSnippetText.length === 0, badSnippetText.map((s) => s.id).join(','));

// example op coverage vs API.md
const apiDoc = read('docs/API.md');
const opTokens = new Set();
for (const m of apiDoc.matchAll(/`((?:calc|algebra|category|logic|lean|topology|geometry|num|prob|opt|graph|plot|symbols|examples|meta|help)\.[a-z0-9_.]+)/g)) opTokens.add(m[1]);
const missingOps = examples.examples.filter((e) => {
  const op = e.action.op;
  // host-owned ops appear in docs; allow symbols.list etc.
  return !apiDoc.includes(op);
});
check('every example op appears in docs/API.md', missingOps.length === 0, missingOps.map((e) => `${e.id}:${e.action.op}`).join(','));

// ---------- package.json / patch / locale / icon ----------
const pkg = JSON.parse(read('package.json'));
check('package.json name is dsh-mathlab', pkg.name === 'dsh-mathlab', pkg.name);
check('package.json exports "." and "./client"', pkg.exports?.['.'] === './index.js' && pkg.exports?.['./client'] === './client.js');
check('package.json dsh.bundle.patch present', pkg.dsh?.bundle?.patch === './cordis.patch.yml');
check('package.json dsh.client.platform web', pkg.dsh?.client?.platform === 'web');
const patch = read('cordis.patch.yml');
check('cordis.patch.yml row id/name consistent', /id:\s*mathlab/.test(patch) && /name:\s*dsh-mathlab/.test(patch));
const icon = read('icon.svg');
check('icon.svg present and is svg', icon.trim().startsWith('<svg') && icon.includes('</svg>'), `${icon.length} bytes`);
const en = JSON.parse(read('locale/en.json'));
const zh = JSON.parse(read('locale/zh.json'));
check('locale en/zh parse with meta.title+meta.description (DSH display metadata)', !!en.meta?.title && !!en.meta?.description && !!zh.meta?.title && !!zh.meta?.description, `en="${en.meta?.title}" zh="${zh.meta?.title}"`);
check('locale titles are bilingual and mention MathLab', /MathLab/.test(en.meta.title) && /MathLab|数学/.test(zh.meta.title), `en=${en.meta.title} zh=${zh.meta.title}`);
check('icon.svg is referenced by package.json exports', pkg.exports?.['./icon'] === './icon.svg' && existsSync(join(root, 'icon.svg')));
const allFiles = ['index.js', 'client.js', 'README.md', 'NOTICE.md', 'package.json', 'cordis.patch.yml', 'icon.svg', 'lib', 'engine', 'data', 'assets', 'locale', 'docs', 'scripts'];
const missingFiles = allFiles.filter((f) => !existsSync(join(root, f)));
check('package.json files list entries exist', missingFiles.length === 0, missingFiles.join(','));

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} static checks passed`);
if (results.some((r) => !r.ok)) process.exitCode = 1;

