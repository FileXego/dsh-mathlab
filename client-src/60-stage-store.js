/* 60-stage-store — pure Live Stage data layer.
 *
 * Stage JSON normalization, block identity/kind helpers, Fitch line extraction,
 * Markdown export and index utilities. No DOM and no React hooks: this module is
 * safe to exercise from Node's test runner (see scripts/test-stage.mjs). */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ helpers */

  function tr(t) {
    return typeof t === 'function' ? t : ML.fallbackT();
  }

  function clampIndex(value, length) {
    if (!length || length < 1) return 0;
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return 0;
    return ML.clamp(n, 0, length - 1);
  }

  function range2(value) {
    if (!Array.isArray(value) || value.length < 2) return undefined;
    const a = Number(value[0]);
    const b = Number(value[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !(b > a)) return undefined;
    return [a, b];
  }

  function fmtTime(value) {
    if (value === undefined || value === null || value === '') return '';
    try {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return ML.safeString(value, 40);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      return ML.safeString(value, 40);
    }
  }

  function slugify(text) {
    const raw = String(text === undefined || text === null ? '' : text).trim();
    const cleaned = raw
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    return cleaned || 'stage';
  }

  function blockIdOf(block, index) {
    if (block && typeof block.id === 'string' && block.id) return block.id;
    return 'b' + (index + 1);
  }

  function blockKindOf(block) {
    return block && typeof block.kind === 'string' && block.kind ? block.kind : 'unknown';
  }

  /** Normalize any tolerated `stage.get` payload into `{stage, revision, trace}`. */
  function normalizeStagePayload(payload) {
    if (!ML.isObj(payload)) return { stage: null, revision: null, trace: [] };
    let stage = null;
    if (ML.isObj(payload.stage)) stage = payload.stage;
    else if (Array.isArray(payload.blocks)) stage = payload;
    let revision = payload.revision;
    if (revision === undefined || revision === null) {
      revision = stage && stage.revision !== undefined && stage.revision !== null ? stage.revision : null;
    }
    const numeric = Number(revision);
    revision = Number.isFinite(numeric) ? numeric : null;
    const stageTrace = ML.toArr(stage && stage.trace);
    return { stage: stage, revision: revision, trace: stageTrace.length ? stageTrace : ML.toArr(payload.trace) };
  }

  /** Fitch lines come either as `block.fitch` or nested under `block.proof.fitch`. */
  function fitchLines(block) {
    if (!ML.isObj(block)) return [];
    const source = ML.isObj(block.proof) ? block.proof : block;
    const direct = ML.toArr(source.fitch);
    if (direct.length > 0) {
      return direct.map(function (line, index) {
        return {
          line: line && line.line !== undefined ? line.line : index + 1,
          indent: ML.clamp(Number(line && line.indent) || 0, 0, 10),
          text: line && line.text !== undefined ? String(line.text) : String((line && line.conclusion) || ''),
          rule: line && line.rule !== undefined ? String(line.rule) : '',
          refs: ML.toArr(line && line.refs),
        };
      });
    }
    const nodes = ML.toArr(source.nodes).length ? ML.toArr(source.nodes) : ML.toArr(block.nodes);
    return nodes.map(function (node, index) {
      const fitch = (node && node.fitch) || {};
      return {
        line: fitch.line !== undefined ? fitch.line : index + 1,
        indent: ML.clamp(Number(fitch.indent) || 0, 0, 10),
        text: fitch.text !== undefined ? String(fitch.text) : String((node && node.conclusion) || ''),
        rule: (node && node.rule) || fitch.rule || '',
        refs: ML.toArr(node && node.premises),
      };
    });
  }

  /** Plain text / LaTeX payload used by "copy step LaTeX". */
  function blockLatex(block) {
    if (!ML.isObj(block)) return '';
    if (typeof block.latex === 'string' && block.latex) return block.latex;
    if (blockKindOf(block) === 'proof') {
      const lines = fitchLines(block);
      if (lines.length) {
        return lines
          .map(function (line) {
            return line.text + (line.rule ? ' \\quad\\text{' + String(line.rule) + '}' : '');
          })
          .join(' \\\\\n');
      }
    }
    if (blockKindOf(block) === 'compute') {
      const expr = ML.pickExpr(block.result);
      const tex = expr ? ML.exprLatex(expr) : '';
      if (tex) return tex;
      if (typeof block.op === 'string' && block.op) {
        return block.op + ' ' + ML.prettyJSON(block.args || {}, 2000);
      }
    }
    if (typeof block.claim === 'string' && block.claim) return block.claim;
    if (typeof block.text === 'string' && block.text) return block.text;
    if (typeof block.title === 'string' && block.title) return block.title;
    return '';
  }

  function takeawayMarkdown(takeaway, title, t) {
    const trFn = tr(t);
    const data = ML.isObj(takeaway) ? takeaway : {};
    const lines = ['## ' + (title || String(trFn('stage.takeaway.title')))];
    const rows = [
      ['claim', 'stage.takeaway.claim'],
      ['method', 'stage.takeaway.method'],
      ['generalization', 'stage.takeaway.generalization'],
      ['scope', 'stage.takeaway.scope'],
    ];
    for (const row of rows) {
      const value = data[row[0]];
      if (value === undefined || value === null || String(value).trim() === '') continue;
      lines.push('', '**' + String(trFn(row[1])) + '**: ' + String(value));
    }
    const examples = ML.toArr(data.examples).map(String).filter(Boolean);
    if (examples.length) {
      lines.push('', '**' + String(trFn('stage.takeaway.examples')) + '**:');
      for (const example of examples) lines.push('- ' + example);
    }
    const references = ML.toArr(data.references).map(String).filter(Boolean);
    if (references.length) {
      lines.push('', '**' + String(trFn('stage.takeaway.references')) + '**:');
      for (const reference of references) lines.push('- ' + reference);
    }
    lines.push('');
    return lines.join('\n');
  }

  /** Client-side Markdown export fallback (also used before the Host op exists). */
  function buildStageMarkdown(stage, t) {
    const trFn = tr(t);
    if (!ML.isObj(stage)) return '';
    const lines = [];
    lines.push('# ' + (typeof stage.title === 'string' && stage.title ? stage.title : String(trFn('stage.untitled'))));
    if (typeof stage.subtitle === 'string' && stage.subtitle) lines.push('', '> ' + stage.subtitle);
    lines.push('');
    for (const block of ML.toArr(stage.blocks)) {
      if (!ML.isObj(block)) continue;
      const kind = blockKindOf(block);
      if (kind === 'heading') {
        const level = ML.clamp(parseInt(block.level, 10) || 2, 1, 3);
        lines.push('', '#'.repeat(level + 1) + ' ' + String(block.text || ''));
      } else if (kind === 'prose' || kind === 'note') {
        lines.push('', String(block.text || ''));
      } else if (kind === 'math') {
        lines.push('', '$$' + String(block.latex || '') + '$$');
        if (block.caption) lines.push('', '_' + String(block.caption) + '_');
      } else if (kind === 'judgment') {
        const verdict = String(block.verdict || 'have');
        lines.push('', '- **' + String(trFn('stage.verdict.' + verdict)) + '**: ' + String(block.claim || ''));
        if (block.rule) lines.push('  - ' + String(trFn('stage.verdict.rule')) + ': ' + String(block.rule));
        if (block.reason) lines.push('  - ' + String(block.reason));
      } else if (kind === 'strategy') {
        lines.push('', '### ' + String(block.title || trFn('stage.kind.strategy')));
        const walk = function (node, depth) {
          if (!ML.isObj(node) || depth > 8) return;
          lines.push('  '.repeat(depth) + '- ' + String(node.label === undefined ? '' : node.label));
          const children = ML.toArr(node.children);
          for (const child of children.slice(0, 40)) walk(child, depth + 1);
        };
        walk(ML.isObj(block.root) ? block.root : null, 0);
      } else if (kind === 'proof') {
        const proofLines = fitchLines(block);
        lines.push('', '### ' + String(block.title || trFn('stage.proof.title')));
        if (block.valid === true) lines.push('', '> ' + String(trFn('stage.proof.valid')));
        lines.push('', '```text');
        for (const line of proofLines) {
          lines.push('  '.repeat(line.indent) + line.text + (line.rule ? '    (' + line.rule + ')' : ''));
        }
        lines.push('```');
      } else if (kind === 'diagram') {
        const diagram = ML.isObj(block.diagram) ? block.diagram : {};
        lines.push('', '### ' + String(block.title || diagram.title || trFn('stage.kind.diagram')));
        lines.push('', '```json', ML.prettyJSON(diagram, 4000), '```');
      } else if (kind === 'plot') {
        lines.push('', '### ' + String(block.title || trFn('stage.plot.title')));
        lines.push('', '```json', ML.prettyJSON({ op: block.op, args: block.args }, 4000), '```');
      } else if (kind === 'compute') {
        lines.push('', '### ' + String(block.title || trFn('stage.compute.title')));
        if (block.op) lines.push('', '`' + String(block.op) + '`');
        const expr = ML.pickExpr(block.result);
        if (expr) {
          const tex = ML.exprLatex(expr);
          if (tex) lines.push('', '$$' + tex + '$$');
        }
      } else if (kind === 'symbols') {
        lines.push('', '### ' + String(block.title || trFn('stage.symbols.title')));
        const ids = ML.toArr(block.ids).map(String);
        if (ids.length) lines.push('', ids.join(', '));
      } else if (kind === 'lean') {
        lines.push('', '### ' + String(block.title || trFn('stage.kind.lean')));
        const imports = ML.toArr(block.imports).map(String).filter(Boolean);
        lines.push('', '```lean');
        if (imports.length) lines.push(imports.join('\n'), '');
        lines.push(String(block.code || ''), '```');
      } else if (kind === 'takeaway') {
        const markdown = takeawayMarkdown(block, block.title, t);
        lines.push('', markdown);
      }
    }
    if (ML.isObj(stage.takeaway)) {
      const hasTakeawayBlock = ML.toArr(stage.blocks).some(function (block) {
        return ML.isObj(block) && blockKindOf(block) === 'takeaway';
      });
      if (!hasTakeawayBlock) lines.push('', takeawayMarkdown(stage.takeaway, null, t));
    }
    lines.push('');
    return lines.join('\n');
  }


  ML.stageStore = {
    tr: tr,
    clampIndex: clampIndex,
    range2: range2,
    fmtTime: fmtTime,
    slugify: slugify,
    blockIdOf: blockIdOf,
    blockKindOf: blockKindOf,
    normalizeStagePayload: normalizeStagePayload,
    fitchLines: fitchLines,
    blockLatex: blockLatex,
    takeawayMarkdown: takeawayMarkdown,
    buildStageMarkdown: buildStageMarkdown,
  };
})();
