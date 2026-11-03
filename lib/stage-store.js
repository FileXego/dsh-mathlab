/**
 * Live Stage store — one stage per Session.
 *
 * The agent presents a stage in its Session (tool calls carry the session id)
 * and the conversation-embedded dock reads exactly that Session's stage. The
 * MathLab main panel without a session shows the most recently updated stage.
 *
 * Realtime: the store exposes `subscribe()`; the HTTP layer turns those
 * notifications into a Server-Sent-Events stream, while the panel/dock keep a
 * low-frequency poll fallback.
 *
 * Learner annotations/questions/cursor live inside the stage and are read back
 * by the agent through `mathlab_stage action:"get"`.
 */
import { MathLabError } from './errors.js';

const MAX_BLOCKS = 120;
const MAX_STAGE_BYTES = 256 * 1024;
const MAX_TEXT = 8_000;
const MAX_TRACE = 80;
const MAX_TRACE_RESULT = 4_000;
const MAX_NOTES = 200;
const MAX_QUESTIONS = 200;
const GLOBAL_KEY = '_global';

export const BLOCK_KINDS = new Set([
  'heading', 'prose', 'math', 'judgment', 'strategy', 'proof',
  'diagram', 'plot', 'compute', 'symbols', 'lean', 'takeaway', 'note',
]);

const VERDICTS = new Set(['goal', 'assume', 'have', 'rule', 'check', 'contradiction', 'conclusion']);

let seq = 0;
const nextId = (prefix) => {
  seq += 1;
  return `${prefix}${seq}`;
};

const now = () => new Date().toISOString();

/** @param {unknown} value @param {string} fallback */
function textOf(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).slice(0, MAX_TEXT);
}

/** @param {unknown} value */
function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {unknown} value @param {number} min @param {number} max */
function clamp(value, min, max) {
  if (!Number.isFinite(Number(value))) return min;
  return Math.max(min, Math.min(max, Math.trunc(Number(value))));
}

/**
 * Normalize one agent-authored block. Unknown kinds are preserved (the panel
 * renders a JSON fallback) but still byte-bounded.
 * @param {unknown} raw
 * @param {number} index
 */
function normalizeBlock(raw, index) {
  if (!plainObject(raw)) {
    throw new MathLabError('bad-request', `block #${index} must be an object`);
  }
  const kind = typeof raw.kind === 'string' ? raw.kind.trim().toLowerCase() : '';
  if (kind === '') throw new MathLabError('bad-request', `block #${index} is missing kind`);
  const block = { ...raw, id: typeof raw.id === 'string' && raw.id !== '' ? raw.id : nextId('b'), kind };
  if (kind === 'judgment') {
    block.claim = textOf(block.claim);
    block.reason = textOf(block.reason);
    block.verdict = VERDICTS.has(block.verdict) ? block.verdict : 'have';
    if (block.rule !== undefined) block.rule = textOf(block.rule);
    if (block.symbols !== undefined) block.symbols = Array.isArray(block.symbols) ? block.symbols.slice(0, 24).map(String) : [];
  }
  if (kind === 'strategy') {
    block.root = normalizeStrategyNode(block.root, 0);
    if (block.title !== undefined) block.title = textOf(block.title);
  }
  if (kind === 'proof') {
    if (block.fitch !== undefined) block.fitch = Array.isArray(block.fitch) ? block.fitch.slice(0, 200) : [];
    if (block.nodes !== undefined) block.nodes = Array.isArray(block.nodes) ? block.nodes.slice(0, 200) : [];
    if (block.title !== undefined) block.title = textOf(block.title);
    if (block.goal !== undefined) block.goal = textOf(block.goal);
  }
  if (kind === 'plot') {
    block.op = textOf(block.op);
    if (!plainObject(block.args)) block.args = {};
    if (block.title !== undefined) block.title = textOf(block.title);
    if (block.caption !== undefined) block.caption = textOf(block.caption);
  }
  if (kind === 'compute') {
    block.op = textOf(block.op);
    if (!plainObject(block.args)) block.args = {};
  }
  if (kind === 'symbols') {
    if (block.ids !== undefined) block.ids = Array.isArray(block.ids) ? block.ids.slice(0, 60).map(String) : [];
    if (block.query !== undefined) block.query = textOf(block.query);
    if (block.title !== undefined) block.title = textOf(block.title);
    block.limit = clamp(block.limit ?? 24, 1, 60);
  }
  if (kind === 'lean') {
    block.code = textOf(block.code);
    if (block.title !== undefined) block.title = textOf(block.title);
    if (Array.isArray(block.imports)) block.imports = block.imports.slice(0, 20).map(String);
    if (block.diagnostics !== undefined && !Array.isArray(block.diagnostics)) delete block.diagnostics;
  }
  if (kind === 'takeaway') {
    block.claim = textOf(block.claim);
    block.method = textOf(block.method);
    block.generalization = textOf(block.generalization);
    block.scope = textOf(block.scope);
    if (Array.isArray(block.references)) block.references = block.references.slice(0, 20).map(String);
    if (Array.isArray(block.examples)) block.examples = block.examples.slice(0, 20).map(String);
  }
  return block;
}

/** @param {unknown} raw @param {number} depth */
function normalizeStrategyNode(raw, depth) {
  if (!plainObject(raw)) return { label: '…', children: [] };
  if (depth > 5) return { label: textOf(raw.label, '…'), detail: textOf(raw.detail), kind: textOf(raw.kind, 'subgoal'), children: [] };
  return {
    label: textOf(raw.label, '…'),
    detail: raw.detail === undefined ? '' : textOf(raw.detail),
    kind: typeof raw.kind === 'string' ? raw.kind : 'subgoal',
    children: Array.isArray(raw.children) ? raw.children.slice(0, 30).map((child) => normalizeStrategyNode(child, depth + 1)) : [],
  };
}

function emptyStage() {
  return {
    id: `stg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    revision: 1,
    title: '',
    subtitle: '',
    status: 'live',
    autoShow: true,
    focus: 0,
    blocks: [],
    takeaway: null,
    trace: [],
    annotations: [],
    questions: [],
    cursor: null,
    presentedBy: null,
    createdAt: now(),
    updatedAt: now(),
  };
}

export class StageStore {
  constructor() {
    /** @type {Map<string, ReturnType<typeof emptyStage>>} */
    this.stages = new Map();
    this.latestKey = GLOBAL_KEY;
    /** @type {Set<(event: {sessionId: string|null, revision: number}) => void>} */
    this.listeners = new Set();
    this.stages.set(GLOBAL_KEY, emptyStage());
  }

  /** @param {unknown} sessionId */
  keyOf(sessionId) {
    if (sessionId === undefined || sessionId === null || sessionId === '') return GLOBAL_KEY;
    return String(sessionId);
  }

  #stage(key, create = false) {
    let stage = this.stages.get(key);
    if (stage === undefined && create) {
      stage = emptyStage();
      this.stages.set(key, stage);
    }
    return stage;
  }

  #publicKey(key) {
    return key === GLOBAL_KEY ? null : key;
  }

  /** Snapshot of one Session's stage. Omit sessionId → most recently updated. */
  get(sessionId) {
    const key = sessionId === undefined || sessionId === null || sessionId === ''
      ? this.latestKey
      : this.keyOf(sessionId);
    const stage = this.#stage(key, sessionId !== undefined && sessionId !== null && sessionId !== '') ?? emptyStage();
    return { stage, revision: stage.revision, sessionId: this.#publicKey(key) };
  }

  get revision() {
    return this.get().revision;
  }

  get stage() {
    return this.get().stage;
  }

  /** Subscribe to stage mutations; returns the disposer. */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  #notify(key) {
    const payload = { sessionId: this.#publicKey(key), revision: this.#stage(key)?.revision ?? 0 };
    for (const listener of [...this.listeners]) {
      try {
        listener(payload);
      } catch {
        /* a broken stream must not break the store */
      }
    }
  }

  #bump(key) {
    const stage = this.#stage(key, true);
    stage.revision += 1;
    stage.updatedAt = now();
    this.latestKey = key;
    const bytes = Buffer.byteLength(JSON.stringify(stage), 'utf8');
    if (bytes > MAX_STAGE_BYTES) {
      throw new MathLabError('limit', `stage exceeds ${MAX_STAGE_BYTES} bytes; trim blocks or trace`);
    }
    this.#notify(key);
    return { stage, revision: stage.revision, sessionId: this.#publicKey(key) };
  }

  /** @param {object} input @param {{sessionId?: string}} meta */
  set(input, meta = {}) {
    if (!plainObject(input)) throw new MathLabError('bad-request', 'stage.set expects an object');
    const blocksRaw = Array.isArray(input.blocks) ? input.blocks : [];
    if (blocksRaw.length > MAX_BLOCKS) throw new MathLabError('limit', `at most ${MAX_BLOCKS} blocks`);
    const blocks = blocksRaw.map(normalizeBlock);
    const stage = emptyStage();
    stage.title = textOf(input.title);
    stage.subtitle = textOf(input.subtitle);
    stage.status = input.status === 'final' ? 'final' : 'live';
    stage.autoShow = input.autoShow !== false;
    stage.focus = clamp(input.focus ?? 0, 0, Math.max(0, blocks.length - 1));
    stage.blocks = blocks;
    stage.takeaway = plainObject(input.takeaway) ? normalizeBlock({ ...input.takeaway, kind: 'takeaway' }, 0) : null;
    stage.presentedBy = meta.sessionId === undefined || meta.sessionId === null ? null : { sessionId: String(meta.sessionId) };
    const key = this.keyOf(meta.sessionId);
    this.stages.set(key, stage);
    return this.#bump(key);
  }

  /** @param {unknown[]} rawBlocks @param {{sessionId?: string, focus?: number}} meta */
  append(rawBlocks, meta = {}) {
    if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) throw new MathLabError('bad-request', 'stage.append expects a non-empty blocks array');
    const key = this.keyOf(meta.sessionId);
    const stage = this.#stage(key, true);
    if (stage.blocks.length + rawBlocks.length > MAX_BLOCKS) throw new MathLabError('limit', `at most ${MAX_BLOCKS} blocks`);
    const blocks = rawBlocks.map(normalizeBlock);
    stage.blocks = stage.blocks.concat(blocks);
    if (meta.sessionId !== undefined && meta.sessionId !== null) stage.presentedBy = { sessionId: String(meta.sessionId) };
    if (meta.focus !== undefined) stage.focus = clamp(meta.focus, 0, Math.max(0, stage.blocks.length - 1));
    return this.#bump(key);
  }

  /** @param {object} patch @param {string} [sessionId] */
  update(patch, sessionId) {
    if (!plainObject(patch)) throw new MathLabError('bad-request', 'stage.update expects an object');
    const key = this.keyOf(sessionId);
    const stage = this.#stage(key, true);
    if (patch.title !== undefined) stage.title = textOf(patch.title);
    if (patch.subtitle !== undefined) stage.subtitle = textOf(patch.subtitle);
    if (patch.status !== undefined) stage.status = patch.status === 'final' ? 'final' : 'live';
    if (patch.autoShow !== undefined) stage.autoShow = patch.autoShow !== false;
    if (patch.focus !== undefined) stage.focus = clamp(patch.focus, 0, Math.max(0, stage.blocks.length - 1));
    if (patch.takeaway !== undefined) {
      stage.takeaway = patch.takeaway === null ? null : normalizeBlock({ ...patch.takeaway, kind: 'takeaway' }, 0);
    }
    return this.#bump(key);
  }

  /** User annotation from the panel/dock. */
  annotate(input, sessionId) {
    if (!plainObject(input)) throw new MathLabError('bad-request', 'stage.annotate expects an object');
    const note = textOf(input.note).trim();
    if (note === '') throw new MathLabError('bad-request', 'annotation note is empty');
    const key = this.keyOf(sessionId);
    const stage = this.#stage(key, true);
    if (stage.annotations.length >= MAX_NOTES) stage.annotations.shift();
    const entry = { id: nextId('an'), blockId: typeof input.blockId === 'string' ? input.blockId : null, note, at: now() };
    stage.annotations.push(entry);
    this.#bump(key);
    return { annotation: entry, stage, sessionId: this.#publicKey(key) };
  }

  /** Learner question from the panel/dock. */
  question(input, sessionId) {
    if (!plainObject(input)) throw new MathLabError('bad-request', 'stage.question expects an object');
    const text = textOf(input.text).trim();
    if (text === '') throw new MathLabError('bad-request', 'question text is empty');
    const key = this.keyOf(sessionId);
    const stage = this.#stage(key, true);
    if (stage.questions.length >= MAX_QUESTIONS) stage.questions.shift();
    const entry = {
      id: nextId('q'),
      blockId: typeof input.blockId === 'string' ? input.blockId : null,
      text,
      quote: typeof input.quote === 'string' ? textOf(input.quote, '').slice(0, 600) : null,
      at: now(),
    };
    stage.questions.push(entry);
    this.#bump(key);
    return { question: entry, stage, sessionId: this.#publicKey(key) };
  }

  /** The step the learner is viewing (not a content edit). */
  cursor(input, sessionId) {
    if (!plainObject(input)) throw new MathLabError('bad-request', 'stage.cursor expects an object');
    const key = this.keyOf(sessionId);
    const stage = this.#stage(key, true);
    const index = clamp(input.index, 0, Math.max(0, stage.blocks.length - 1));
    stage.cursor = {
      index,
      blockId: typeof input.blockId === 'string' ? input.blockId : (stage.blocks[index]?.id ?? null),
      at: now(),
    };
    return this.#bump(key);
  }

  clear(sessionId) {
    const key = this.keyOf(sessionId);
    this.stages.set(key, emptyStage());
    return this.#bump(key);
  }

  /**
   * Automatic audit record of one math operation the agent performed.
   * @param {{tool: string, op?: string, args?: unknown, result?: unknown, summary?: string, sessionId?: string}} input
   */
  recordTrace(input) {
    if (!plainObject(input)) return this.get();
    const key = this.keyOf(input.sessionId);
    const stage = this.#stage(key, true);
    let summary = typeof input.summary === 'string' ? input.summary : '';
    if (summary === '' && input.result !== undefined) {
      try {
        summary = JSON.stringify(input.result);
      } catch {
        summary = String(input.result);
      }
    }
    let resultText = '';
    try {
      resultText = JSON.stringify(input.result ?? null);
    } catch {
      resultText = String(input.result ?? '');
    }
    stage.trace.push({
      id: nextId('tr'),
      at: now(),
      tool: textOf(input.tool, 'mathlab'),
      op: textOf(input.op, ''),
      args: input.args === undefined ? null : input.args,
      summary: summary.slice(0, 500),
      result: resultText.slice(0, MAX_TRACE_RESULT),
      sessionId: input.sessionId === undefined || input.sessionId === null ? null : String(input.sessionId),
    });
    if (stage.trace.length > MAX_TRACE) stage.trace = stage.trace.slice(-MAX_TRACE);
    return this.#bump(key);
  }

  /** Markdown export of one stage (annotations excluded; questions listed). */
  exportMarkdown(sessionId) {
    const { stage } = this.get(sessionId);
    const lines = [];
    lines.push(`# ${stage.title || 'MathLab 讲解'}`, '');
    if (stage.subtitle) lines.push(`> ${stage.subtitle}`, '');
    lines.push(`_Exported from MathLab · ${new Date().toISOString()} · revision ${stage.revision}_`, '');
    for (const block of stage.blocks) lines.push(...blockToMarkdown(block), '');
    if (stage.takeaway) {
      lines.push('## 可迁移的一般化 / Generalization', '');
      lines.push(`- **命题/结论**: ${stage.takeaway.claim}`, '');
      lines.push(`- **方法**: ${stage.takeaway.method}`, '');
      lines.push(`- **一般化**: ${stage.takeaway.generalization}`, '');
      lines.push(`- **适用范围/边界**: ${stage.takeaway.scope}`, '');
      if (Array.isArray(stage.takeaway.examples) && stage.takeaway.examples.length > 0) {
        lines.push(`- **例子**: ${stage.takeaway.examples.join('；')}`, '');
      }
      if (Array.isArray(stage.takeaway.references) && stage.takeaway.references.length > 0) {
        lines.push(`- **参考**: ${stage.takeaway.references.join('；')}`, '');
      }
    }
    if (stage.questions.length > 0) {
      lines.push('## 学习过程中的问题', '');
      for (const question of stage.questions) lines.push(`- ${question.blockId ? `\`${question.blockId}\` ` : ''}${question.text}`);
      lines.push('');
    }
    const slug = (stage.title || 'mathlab-stage').replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 60).toLowerCase();
    return { markdown: lines.join('\n'), filename: `${slug}.md` };
  }
}

/** @param {any} block */
function blockToMarkdown(block) {
  switch (block.kind) {
    case 'heading':
      return [`${'#'.repeat(clamp(block.level ?? 2, 1, 3) + 1)} ${block.text || ''}`];
    case 'prose':
      return [String(block.text || '')];
    case 'note':
      return [`> ${String(block.text || '')}`];
    case 'math':
      return ['$$', String(block.latex || ''), '$$', ...(block.caption ? ['', `*${block.caption}*`] : [])];
    case 'judgment':
      return [`- **${block.verdict}${block.rule ? ` · ${block.rule}` : ''}**：${block.claim || ''} — ${block.reason || ''}`];
    case 'strategy': {
      const out = ['### 思路树', ''];
      const walk = (node, depth) => {
        out.push(`${'  '.repeat(depth)}- ${node.label}${node.detail ? `：${node.detail}` : ''}`);
        for (const child of node.children || []) walk(child, depth + 1);
      };
      if (block.root) walk(block.root, 0);
      if (block.title) out.splice(0, 2, `### ${block.title}`, '');
      return out;
    }
    case 'proof': {
      const out = ['### 证明', ''];
      if (block.title) out.splice(0, 2, `### ${block.title}`, '');
      const fitch = Array.isArray(block.fitch) ? block.fitch : [];
      if (fitch.length > 0) {
        out.push('```text');
        for (const line of fitch) out.push(`${'  '.repeat(Number(line.indent) || 0)}${line.line ?? ''}. ${line.text ?? ''}   [${line.rule ?? ''}]`);
        out.push('```');
      } else if (Array.isArray(block.nodes) && block.nodes.length > 0) {
        out.push('```text');
        for (const node of block.nodes) out.push(`${node.id ?? ''}: ${node.conclusion ?? ''}  [${node.rule ?? ''}]`);
        out.push('```');
      }
      if (block.goal) out.push('', `Goal: $${block.goal}$`);
      return out;
    }
    case 'diagram': {
      const diagram = block.diagram || {};
      return [`### ${block.title || '图'}`, '', `- kind: \`${diagram.kind || 'category'}\``, '', '> 交互图请用 MathLab 面板复现（数据已包含在导出源中）。'];
    }
    case 'plot':
      return [`### ${block.title || '图像'}`, '', `复现命令：\`${block.op}\` ${JSON.stringify(block.args || {})}`];
    case 'compute':
      return [`### ${block.title || '计算'}`, '', `复现命令：\`${block.op}\` ${JSON.stringify(block.args || {})}`];
    case 'symbols':
      return [`### ${block.title || '符号'}`, '', `符号 id：${(block.ids || []).join(', ')}${block.query ? `（搜索 ${block.query}）` : ''}`];
    case 'lean':
      return [`### ${block.title || 'Lean 4'}`, '', '```lean', String(block.code || ''), '```'];
    case 'takeaway':
      return ['### 提炼', '', `- 命题：${block.claim || ''}`, `- 方法：${block.method || ''}`, `- 一般化：${block.generalization || ''}`, `- 边界：${block.scope || ''}`];
    default:
      return [`### 未识别块 \`${block.kind || '?'}\``, '', '```json', JSON.stringify(block, null, 2).slice(0, 4000), '```'];
  }
}
