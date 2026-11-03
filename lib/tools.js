/**
 * Agent-facing MathLab tools.
 *
 * The tools are thin adapters over the same MathLabService the Web panel uses:
 * one operation, two callers (docs/API.md). Results carry a short human summary
 * plus the complete JSON payload in the `data` field so the model can inspect
 * exact values.
 */
import { defineHostTool } from './define-tool.js';
import { MathLabError } from './math-service.js';

const MAX_TEXT = 12_000;
const MAX_DATA = 60_000;

/** @param {string} value */
function truncate(value, limit) {
  return value.length <= limit ? value : `${value.slice(0, limit)}\n… (truncated, ${value.length - limit} chars omitted)`;
}

/** Pretty one-line-ish preview of an expression result. */
function preview(result) {
  if (result === null || result === undefined) return 'null';
  if (typeof result === 'string') return result;
  if (typeof result !== 'object') return String(result);
  if (Array.isArray(result)) return `[${result.length} items] ${JSON.stringify(result.slice(0, 3))}`;
  if (typeof result.pretty === 'string') return result.pretty;
  if (typeof result.text === 'string') return result.text;
  if (typeof result.value === 'string') return result.value;
  if (typeof result.latex === 'string') return result.latex;
  if (typeof result.svg === 'string') return `[SVG ${result.svg.length} bytes]`;
  const keys = Object.keys(result);
  return `{${keys.slice(0, 8).join(', ')}${keys.length > 8 ? ', …' : ''}}`;
}

/** @param {unknown} exec */
function sessionIdOf(exec) {
  try {
    return exec?.agent?.session?.id;
  } catch {
    return undefined;
  }
}

/** Append the operation to the live stage trace; never blocks or throws. */
function traceCall(service, tool, op, args, result, exec) {
  try {
    service.recordTrace({
      tool,
      op,
      args,
      result,
      summary: truncate(preview(result), 450),
      sessionId: sessionIdOf(exec),
    });
  } catch {
    /* trace is best-effort */
  }
}

/** Short model-facing description of a stage snapshot. */
function stageSummary(stage) {
  if (!stage || !Array.isArray(stage.blocks)) return 'no stage';
  const lines = [
    `revision ${stage.revision}: "${stage.title || '(untitled)'}"`,
    `${stage.blocks.length} blocks, focus ${stage.focus}, status ${stage.status}`,
    `annotations ${stage.annotations?.length ?? 0}, questions ${stage.questions?.length ?? 0}, trace ${stage.trace?.length ?? 0}`,
  ];
  if (stage.questions?.length) {
    lines.push('learner questions:', ...stage.questions.slice(-5).map((entry) => `- ${entry.blockId ? `[${entry.blockId}] ` : ''}${entry.text}`));
  }
  if (stage.annotations?.length) {
    lines.push('learner annotations:', ...stage.annotations.slice(-5).map((entry) => `- ${entry.blockId ? `[${entry.blockId}] ` : ''}${entry.note}`));
  }
  if (stage.takeaway) lines.push('takeaway: present');
  return lines.join('\n');
}

/**
 * Format one op result for the model.
 * @param {string} op
 * @param {any} result
 */
function formatResult(op, result) {
  const lines = [`## ${op}`, ''];
  let payload;
  try {
    payload = JSON.stringify(result);
  } catch {
    payload = String(result);
  }
  if (payload === undefined) payload = 'null';
  const fullPayload = payload;
  if (payload.length > MAX_DATA) payload = `${payload.slice(0, MAX_DATA)}\n…truncated`;
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    if (typeof result.pretty === 'string' && result.pretty.trim() !== '') lines.push('```text', result.pretty, '```');
    if (typeof result.latex === 'string' && result.latex.trim() !== '') lines.push(`LaTeX: \`${result.latex}\``);
    if (typeof result.text === 'string' && result.pretty === undefined) lines.push(result.text);
    if (typeof result.solution === 'string') lines.push(`Solution: ${result.solution}`);
    if (typeof result.svg === 'string') lines.push(`SVG (${result.svg.length} chars) is in \`data\`; write it to a .svg file to present it.`);
    if (typeof result.value === 'string') lines.push(`Value: ${result.value}`);
  } else if (typeof result === 'string') {
    lines.push(result);
  }
  if (lines.length <= 2 && fullPayload !== 'null' && fullPayload !== '{}') {
    lines.push('```json', fullPayload.slice(0, 8000), '```');
  }
  return { text: truncate(lines.join('\n'), MAX_TEXT), data: payload };
}

/** Resolve the calling session's working directory, if available. */
function sessionCwd(ctx, exec) {
  try {
    const workingDirectory = ctx.get('workingDirectory');
    const session = exec?.agent?.session;
    if (workingDirectory && session) return workingDirectory.get(session);
  } catch {
    /* fall through */
  }
  return process.cwd();
}

/**
 * Register every MathLab tool on the context.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {import('./math-service.js').MathLabService} service
 */
export function registerTools(ctx, service) {
  const disposers = [];
  const register = (definition) => disposers.push(ctx.tools.register(definition));

  register(defineHostTool({
    name: 'mathlab',
    description: [
      'Run one MathLab operation in the graduate mathematics workbench (SymPy-backed).',
      'Ops are "<family>.<action>"; pass `args` as a JSON object.',
      'Families: calc.* (simplify, expand, factor, apart, cancel, trigsimp, diff, integrate, limit, series, sum, product, solve, dsolve, approx, matrix, vector, number), algebra.* (perm, group, finitefield, poly, ring), category.* (validate, compose, functor, natural, verify_diagram, limit, equivalence), logic.* (parse, truthtable, prove, prove_fol, resolve, modal, equivalent), topology.* (homology, fundamental_group), geometry.* (christoffel, curvature, exterior_derivative, lie_bracket), num.* (root, integrate, ode), prob.* (dist, expectation), opt.* (minimize, stationary), graph.analyze, plot.* (sample, sample_multi, parametric, polar, implicit, surface3d, field, svg), lean.*, help.',
      'Call `mathlab_reference` with action "help" for argument details, or "examples" for ready-made requests.',
      'Expressions use SymPy syntax (sin(x), exp(-x**2), Matrix entries as strings). Results include pretty text and LaTeX in `data`.',
    ].join(' '),
    parameters: {
      op: { schema: { type: 'string' }, required: true, description: 'Operation id, e.g. "calc.integrate" or "algebra.group".' },
      args: {
        schema: { type: 'object', additionalProperties: true },
        description: 'Operation arguments (JSON object). Omit for empty args.',
      },
    },
    execute: async (args, exec) => {
      if (typeof args.op !== 'string' || args.op.trim() === '') throw new MathLabError('bad-request', '`op` is required');
      const opArgs = args.args !== null && typeof args.args === 'object' && !Array.isArray(args.args) ? args.args : {};
      const result = await service.call(args.op.trim(), opArgs);
      traceCall(service, 'mathlab', args.op.trim(), opArgs, result, exec);
      return formatResult(args.op.trim(), result);
    },
    timeoutMs: 60_000,
  }));

  register(defineHostTool({
    name: 'mathlab_plot',
    description: [
      'Produce plotting data or a ready-to-view SVG for a mathematical figure.',
      'action: sample | sample_multi | parametric | polar | implicit | surface3d | field | svg.',
      'For "svg", the SVG is written next to the session working directory (returned path) and also returned in data; present it to the user with the present tool.',
      'For data actions, the sampled points/surfaces are returned as JSON in `data`; choose the matching 2D/3D renderer in the MathLab panel by sharing the command.',
    ].join(' '),
    parameters: {
      action: { schema: { type: 'string', enum: ['sample', 'sample_multi', 'parametric', 'polar', 'implicit', 'surface3d', 'field', 'svg'] }, required: true },
      args: { schema: { type: 'object', additionalProperties: true }, description: 'Plot arguments per docs/API.md (expr, var, range, samples, xRange, yRange, grid, n, kind, ...).' },
      save: { schema: { type: 'boolean' }, description: 'For action "svg": write the .svg file into the session working directory (default true).' },
    },
    execute: async (args, exec) => {
      const plotArgs = args.args && typeof args.args === 'object' && !Array.isArray(args.args) ? { ...args.args } : {};
      if (args.action === 'svg') {
        const kind = typeof plotArgs.kind === 'string' ? plotArgs.kind : 'sample';
        if (kind === 'explicit') plotArgs.kind = 'sample';
        else if (plotArgs.kind === undefined) plotArgs.kind = 'sample';
        const result = await service.call('plot.svg', plotArgs);
        const svg = typeof result?.svg === 'string' ? result.svg : '';
        traceCall(service, 'mathlab_plot', 'plot.svg', plotArgs, { svgChars: svg.length }, exec);
        let savedPath = '';
        if (args.save !== false && svg !== '') {
          try {
            const cwd = sessionCwd(ctx, exec);
            const file = `${cwd}\\mathlab-plot-${Date.now()}.svg`;
            const { writeFile } = await import('node:fs/promises');
            await writeFile(file, svg, 'utf8');
            savedPath = file;
          } catch (error) {
            ctx.logger?.warn?.(`mathlab: cannot save plot: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        return {
          text: savedPath
            ? `SVG saved to ${savedPath} (${svg.length} chars). Present this file to the user.`
            : `SVG (${svg.length} chars) is in data; no file was written.`,
          data: JSON.stringify({ svg, path: savedPath || null }),
        };
      }
      const op = `plot.${args.action}`;
      const result = await service.call(op, plotArgs);
      traceCall(service, 'mathlab_plot', op, plotArgs, result, exec);
      return formatResult(op, result);
    },
    timeoutMs: 60_000,
  }));

  register(defineHostTool({
    name: 'mathlab_lean',
    description: [
      'Lean 4 actions for MathLab: inspect the local Lean toolchain, type-check Lean code or a file, and browse the bundled Mathlib snippet library.',
      'action "info": toolchain availability/path. "check": compile inline code (returns diagnostics). "check_file": compile an absolute .lean path. "snippets"/"snippet": browse the library. "version": lean version.',
      'Lean is optional: when no toolchain is detected, check returns a precise diagnostic instead of pretending to compile.',
    ].join(' '),
    parameters: {
      action: { schema: { type: 'string', enum: ['info', 'check', 'check_file', 'snippets', 'snippet', 'version'] }, required: true },
      code: { schema: { type: 'string' }, description: 'Lean source for action "check".' },
      path: { schema: { type: 'string' }, description: 'Absolute .lean file path for action "check_file".' },
      filename: { schema: { type: 'string' }, description: 'Virtual filename used in diagnostics (default MathLab.lean).' },
      id: { schema: { type: 'string' }, description: 'Snippet id for action "snippet".' },
      query: { schema: { type: 'string' }, description: 'Snippet search text.' },
      level: { schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] } },
      timeoutMs: { schema: { type: 'integer' }, description: 'Lean check timeout in milliseconds (default 15000, max 60000).' },
    },
    execute: async (args, exec) => {
      switch (args.action) {
        case 'info':
          return formatResult('lean.info', await service.call('lean.info', {}));
        case 'version':
          return formatResult('lean.version', await service.call('lean.version', {}));
        case 'check': {
          if (typeof args.code !== 'string' || args.code.trim() === '') throw new MathLabError('bad-request', '`code` is required for action check');
          const timeoutMs = Math.max(1000, Math.min(Number(args.timeoutMs) || 15_000, 60_000));
          const result = await service.call('lean.check', { code: args.code, filename: args.filename ?? 'MathLab.lean', timeoutMs });
          traceCall(service, 'mathlab_lean', 'lean.check', { filename: args.filename ?? 'MathLab.lean' }, result, exec);
          return formatResult('lean.check', result);
        }
        case 'check_file': {
          if (typeof args.path !== 'string' || args.path.trim() === '') throw new MathLabError('bad-request', '`path` is required for action check_file');
          const timeoutMs = Math.max(1000, Math.min(Number(args.timeoutMs) || 15_000, 60_000));
          const result = await service.call('lean.check_file', { path: args.path, timeoutMs });
          traceCall(service, 'mathlab_lean', 'lean.check_file', { path: args.path }, result, exec);
          return formatResult('lean.check_file', result);
        }
        case 'snippets': {
          const result = await service.call('lean.snippets', { query: args.query ?? '', level: args.level });
          return formatResult('lean.snippets', result);
        }
        case 'snippet': {
          if (typeof args.id !== 'string' || args.id === '') throw new MathLabError('bad-request', '`id` is required for action snippet');
          return formatResult('lean.snippets', await service.call('lean.snippets', { id: args.id }));
        }
        default:
          throw new MathLabError('bad-request', `unknown action ${JSON.stringify(args.action)}`);
      }
    },
    timeoutMs: 90_000,
  }));

  register(defineHostTool({
    name: 'mathlab_reference',
    description: [
      'Browse MathLab reference content: the bilingual symbol atlas, worked examples, Lean snippet index, and the operation help text.',
      'action: symbols (optionally field) | search (query, field?, limit?) | examples | example (id) | snippets | snippet (id) | help (topic?) | status.',
      'Use "search" to find notation (e.g. "integral", "adjunction", "homology") before using it in a formula.',
    ].join(' '),
    parameters: {
      action: { schema: { type: 'string', enum: ['symbols', 'search', 'examples', 'example', 'snippets', 'snippet', 'help', 'status'] }, required: true },
      query: { schema: { type: 'string' } },
      field: { schema: { type: 'string' }, description: 'Symbol field id: logic, set, number, analysis, algebra, linear-algebra, topology, geometry, category, probability, differential, combinatorics, lean.' },
      id: { schema: { type: 'string' }, description: 'Example or snippet id.' },
      topic: { schema: { type: 'string' }, description: 'Help topic for action help.' },
      limit: { schema: { type: 'integer' } },
    },
    execute: async (args) => {
      switch (args.action) {
        case 'symbols':
          return formatResult('symbols.list', await service.call('symbols.list', { field: args.field }));
        case 'search':
          return formatResult('symbols.search', await service.call('symbols.search', { query: args.query ?? '', field: args.field, limit: args.limit ?? 50 }));
        case 'examples':
          return formatResult('examples.list', await service.call('examples.list', {}));
        case 'example':
          if (typeof args.id !== 'string' || args.id === '') throw new MathLabError('bad-request', '`id` is required for action example');
          return formatResult('examples.get', await service.call('examples.get', { id: args.id }));
        case 'snippets':
          return formatResult('lean.snippets', await service.call('lean.snippets', { query: args.query ?? '' }));
        case 'snippet':
          if (typeof args.id !== 'string' || args.id === '') throw new MathLabError('bad-request', '`id` is required for action snippet');
          return formatResult('lean.snippets', await service.call('lean.snippets', { id: args.id }));
        case 'help':
          return formatResult('help', await service.call('help', { topic: args.topic }));
        case 'status':
          return formatResult('meta.info', await service.call('meta.info', {}));
        default:
          throw new MathLabError('bad-request', `unknown action ${JSON.stringify(args.action)}`);
      }
    },
    timeoutMs: 45_000,
  }));

  register(defineHostTool({
    name: 'mathlab_stage',
    description: [
      'Present and drive the MathLab "Live Stage" — the 讲解 tab of the MathLab panel — a live mathematical blackboard shown beside the conversation while you explain.',
      'Use it whenever you explain or teach mathematics: proofs, derivations, constructions, combinatorics, analysis, abstract algebra, category theory, logic. The learner sees your strategy tree, every explicit judgment step, the formal proof, interactive plots/diagrams, the logic-language symbols, a generalizable takeaway, and can step through, annotate and ask.',
      'Workflow: action "get" first (read learner annotations/questions and the step they are viewing) → action "present" with a full blocks list → while narrating, action "update" focus to move the live cursor or "append" more steps → finish with a takeaway block and action "export" for shareable Markdown.',
      'Block kinds (JSON objects in `blocks`): heading{text}; prose{text}; math{latex,caption?}; judgment{claim,verdict:goal|assume|have|rule|check|contradiction|conclusion,reason,rule?,symbols?}; strategy{title?,root:{label,detail?,kind?,children?}}; proof{fitch:[{line,indent,text,rule,refs?}],nodes?,goal?,valid?,title?}; diagram{diagram:{kind:"category"|"hasse"|"cayley",...}}; plot{op:"plot.sample"|"plot.sample_multi"|"plot.parametric"|"plot.polar"|"plot.implicit"|"plot.surface3d"|"plot.field",args}; compute{op,args,result?}; symbols{ids?|query?,limit?}; lean{code,title?,diagnostics?}; takeaway{claim,method,generalization,scope,examples?,references?}; note{text}. Text supports markdown-lite with $inline$ and $$display$$ LaTeX.',
      'Every mathlab / mathlab_plot / mathlab_lean call is automatically recorded in the stage trace, so the learner can audit the raw computations behind the narrative.',
      'Keep the chat reply short and point at the stage: "看第 3 步" / "拖动图像". This is the intended teaching surface; do not answer a substantial math explanation without it unless the user asks for text only.',
    ].join(' '),
    parameters: {
      action: { schema: { type: 'string', enum: ['present', 'append', 'update', 'get', 'clear', 'export', 'focus'] }, required: true, description: 'Stage operation.' },
      title: { schema: { type: 'string' }, description: 'Stage title (required for present).' },
      subtitle: { schema: { type: 'string' }, description: 'One-line subtitle / framing.' },
      blocks: { schema: { type: 'array', items: { type: 'object', additionalProperties: true } }, description: 'Block objects for present/append (see docs/STAGE.md).' },
      takeaway: { schema: { type: 'object', additionalProperties: true }, description: 'Generalizable takeaway card: {claim, method, generalization, scope, examples?, references?}.' },
      focus: { schema: { type: 'integer' }, description: 'Step index the learner\'s cursor should jump to (0-based).' },
      autoShow: { schema: { type: 'boolean' }, description: 'Auto-switch the panel to the Stage tab when this revision arrives (default true).' },
      status: { schema: { type: 'string', enum: ['live', 'final'] }, description: 'Stage lifecycle badge.' },
      format: { schema: { type: 'string', enum: ['markdown'] }, description: 'Export format (markdown).' },
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec);
      const stageData = (stage, extra) => {
        const payload = JSON.stringify({ revision: stage.revision, title: stage.title, blocks: stage.blocks.length, focus: stage.focus, ...extra });
        return { data: payload };
      };
      switch (args.action) {
        case 'present': {
          if (typeof args.title !== 'string' || args.title.trim() === '') throw new MathLabError('bad-request', '`title` is required for action present');
          const { stage } = service.stage.set(
            {
              title: args.title,
              subtitle: args.subtitle,
              blocks: args.blocks,
              takeaway: args.takeaway,
              focus: args.focus,
              autoShow: args.autoShow,
              status: args.status,
            },
            { sessionId },
          );
          return {
            text: `Stage presented: revision ${stage.revision}, ${stage.blocks.length} blocks. The learner's MathLab panel will show it; explain in the chat and use focus/append to follow along.`,
            ...stageData(stage),
          };
        }
        case 'append': {
          const { stage } = service.stage.append(Array.isArray(args.blocks) ? args.blocks : [], { sessionId, focus: args.focus });
          return { text: `Stage appended: revision ${stage.revision}, ${stage.blocks.length} blocks total.`, ...stageData(stage) };
        }
        case 'update': {
          const patch = {};
          for (const key of ['title', 'subtitle', 'status', 'autoShow', 'focus', 'takeaway']) {
            if (args[key] !== undefined) patch[key] = args[key];
          }
          if (Object.keys(patch).length === 0) throw new MathLabError('bad-request', 'action update needs at least one of title/subtitle/status/autoShow/focus/takeaway');
          const { stage } = service.stage.update(patch, sessionId);
          return { text: `Stage updated: revision ${stage.revision}, focus ${stage.focus}.`, ...stageData(stage) };
        }
        case 'focus': {
          if (!Number.isFinite(Number(args.focus))) throw new MathLabError('bad-request', '`focus` is required for action focus');
          const { stage } = service.stage.update({ focus: args.focus }, sessionId);
          return { text: `Stage focus moved to ${stage.focus} (revision ${stage.revision}).`, ...stageData(stage) };
        }
        case 'get': {
          const snapshot = service.stage.get(sessionId);
          let payload = JSON.stringify(snapshot);
          if (payload.length > 60_000) payload = `${payload.slice(0, 60_000)}\n…truncated`;
          return { text: stageSummary(snapshot.stage), data: payload };
        }
        case 'clear': {
          const { stage } = service.stage.clear(sessionId);
          return { text: 'Stage cleared.', ...stageData(stage) };
        }
        case 'export': {
          const { markdown, filename } = service.stage.exportMarkdown(sessionId);
          let savedPath = '';
          try {
            const cwd = sessionCwd(ctx, exec);
            const file = `${cwd}\\${filename}`;
            const { writeFile } = await import('node:fs/promises');
            await writeFile(file, markdown, 'utf8');
            savedPath = file;
          } catch (error) {
            ctx.logger?.warn?.(`mathlab: cannot save stage export: ${error instanceof Error ? error.message : String(error)}`);
          }
          const text = savedPath
            ? `Stage exported to ${savedPath} (${markdown.length} chars). Markdown is also in data; present the file to the user as shareable notes.`
            : `Stage markdown (${markdown.length} chars) is in data.`;
          return { text, data: JSON.stringify({ filename, path: savedPath || null, markdown: markdown.length > 60_000 ? `${markdown.slice(0, 60_000)}\n…truncated` : markdown }) };
        }
        default:
          throw new MathLabError('bad-request', `unknown action ${JSON.stringify(args.action)}`);
      }
    },
    timeoutMs: 30_000,
  }));

  register(defineHostTool({
    name: 'mathlab_status',
    description: 'Report MathLab plugin, Python engine and Lean toolchain readiness.',
    parameters: {},
    execute: async () => formatResult('meta.info', await service.call('meta.info', {})),
    timeoutMs: 30_000,
  }));

  return () => {
    for (const disposer of disposers.reverse()) {
      try {
        disposer();
      } catch {
        /* dispose best-effort */
      }
    }
  };
}
