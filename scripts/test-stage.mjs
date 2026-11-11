import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../client-src/60-stage-store.js', import.meta.url), 'utf8');
const ML = {
  fallbackT: () => (key) => key,
  clamp: (n, min, max) => Math.min(max, Math.max(min, n)),
  safeString: (value, limit) => String(value ?? '').slice(0, limit),
  isObj: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  toArr: (value) => (Array.isArray(value) ? value : []),
  pickExpr: () => undefined,
  exprLatex: () => '',
  prettyJSON: (value) => JSON.stringify(value),
};
vm.runInNewContext(source, { ML, React: {} });
const store = ML.stageStore;

test('clampIndex accepts numbers and clamps to the block range', () => {
  assert.equal(store.clampIndex(-3, 5), 0);
  assert.equal(store.clampIndex(99, 5), 4);
  assert.equal(store.clampIndex('2.4', 5), 2);
  assert.equal(store.clampIndex('not-a-number', 5), 0);
  assert.equal(store.clampIndex(3, 0), 0);
});

test('range2 only accepts increasing finite pairs', () => {
  assert.deepEqual(store.range2([-1, 2]), [-1, 2]);
  assert.equal(store.range2([2, 1]), undefined);
  assert.equal(store.range2(['a', 1]), undefined);
  assert.equal(store.range2([0]), undefined);
});

test('normalizeStagePayload tolerates stage/envelope shapes and keeps revision/trace', () => {
  const fromEnvelope = store.normalizeStagePayload({
    stage: { title: 'T', blocks: [{ kind: 'heading', text: 'H' }], revision: 4, trace: [{ op: 'x' }] },
    revision: 7,
  });
  assert.equal(fromEnvelope.stage.title, 'T');
  assert.equal(fromEnvelope.revision, 7);
  assert.deepEqual(fromEnvelope.trace, [{ op: 'x' }]);

  const direct = store.normalizeStagePayload({ title: 'D', blocks: [], revision: 2 });
  assert.equal(direct.stage.title, 'D');
  assert.equal(direct.revision, 2);
  assert.deepEqual(direct.trace, []);

  assert.deepEqual(store.normalizeStagePayload(null), { stage: null, revision: null, trace: [] });
});

test('block identity/kind helpers are deterministic', () => {
  assert.equal(store.blockIdOf({ id: 'intro' }, 0), 'intro');
  assert.equal(store.blockIdOf({}, 4), 'b5');
  assert.equal(store.blockKindOf({ kind: 'math' }), 'math');
  assert.equal(store.blockKindOf({}), 'unknown');
});

test('fitchLines reads direct and nested proof lines with defaults', () => {
  const direct = store.fitchLines({
    fitch: [{ line: 1, text: 'P', rule: 'premise' }, { text: 'Q', refs: ['1'] }],
  });
  assert.equal(direct[0].line, 1);
  assert.equal(direct[0].text, 'P');
  assert.equal(direct[1].line, 2);
  assert.deepEqual(direct[1].refs, ['1']);

  const nested = store.fitchLines({
    proof: { nodes: [{ conclusion: 'A', rule: 'assume', premises: [] }] },
  });
  assert.equal(nested[0].text, 'A');
  assert.equal(nested[0].rule, 'assume');
});

test('buildStageMarkdown exports headings, math and takeaway', () => {
  const markdown = store.buildStageMarkdown(
    {
      title: 'Demo',
      subtitle: 'sub',
      blocks: [
        { kind: 'heading', text: 'Intro', level: 2 },
        { kind: 'prose', text: 'Body' },
        { kind: 'math', latex: 'x^2', caption: 'square' },
      ],
      takeaway: { claim: 'C', method: 'M' },
    },
    (key) => key,
  );
  assert.match(markdown, /^# Demo/m);
  assert.match(markdown, /^> sub/m);
  assert.match(markdown, /^### Intro/m);
  assert.match(markdown, /Body/);
  assert.match(markdown, /\$\$x\^2\$\$/);
  assert.match(markdown, /square/);
  assert.match(markdown, /C/);
});
