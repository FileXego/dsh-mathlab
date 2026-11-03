/**
 * MathLab service: one operation layer shared by the HTTP API and the agent tools.
 *
 * Host-owned ops (symbols/examples/lean snippets/meta) are answered from local
 * data; everything else is forwarded to the Python worker. Errors stay typed so
 * both callers can present the same failure envelope.
 */
import { PythonBridge, EngineOpError, EngineUnavailableError } from './python-bridge.js';
import { ContentCatalog } from './catalog.js';
import { StageStore } from './stage-store.js';
import { MathLabError } from './errors.js';

export { MathLabError };

const OP_PATTERN = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*){0,2}$/;

export class MathLabService {
  /**
   * @param {{ version: string, pythonPath?: string, engineTimeoutMs?: number, logger?: { info?: Function, warn?: Function } }} options
   */
  constructor(options) {
    this.version = options.version;
    this.catalog = new ContentCatalog();
    this.stage = new StageStore();
    this.bridge = new PythonBridge({
      pythonPath: options.pythonPath,
      timeoutMs: options.engineTimeoutMs,
      onLog: (line) => options.logger?.warn?.(`mathlab python: ${line}`),
    });
    this.startedAt = Date.now();
    this.logger = options.logger;
  }

  /** Append one automatic audit entry to the live stage trace; never throws. */
  recordTrace(entry) {
    try {
      this.stage.recordTrace(entry);
    } catch (error) {
      this.logger?.warn?.(`mathlab: trace record skipped: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute one operation.
   * @param {unknown} rawOp
   * @param {unknown} rawArgs
   * @returns {Promise<any>}
   */
  async call(rawOp, rawArgs) {
    if (typeof rawOp !== 'string' || !OP_PATTERN.test(rawOp)) {
      throw new MathLabError('bad-request', `invalid op ${JSON.stringify(rawOp)}`);
    }
    const args = rawArgs === undefined || rawArgs === null ? {} : rawArgs;
    if (typeof args !== 'object' || Array.isArray(args)) {
      throw new MathLabError('bad-request', 'args must be a JSON object');
    }
    switch (rawOp) {
      case 'symbols.list':
        return this.catalog.listSymbols(args);
      case 'symbols.search':
        return this.catalog.searchSymbols(args);
      case 'examples.list':
        return this.catalog.listExamples();
      case 'examples.get': {
        const found = await this.catalog.getExample(args.id);
        if (found === undefined) throw new MathLabError('bad-request', `unknown example ${JSON.stringify(args.id)}`);
        return found;
      }
      case 'lean.snippets': {
        if (typeof args.id === 'string' && args.id !== '') {
          const found = await this.catalog.getSnippet(args.id);
          if (found === undefined) throw new MathLabError('bad-request', `unknown snippet ${JSON.stringify(args.id)}`);
          return found;
        }
        return this.catalog.listSnippets(args);
      }
      case 'meta.info':
        return this.info();
      case 'stage.get':
        return this.stage.get(args.sessionId);
      case 'stage.set':
        return this.stage.set(args, { sessionId: args.sessionId });
      case 'stage.append':
        return this.stage.append(args.blocks, { sessionId: args.sessionId, focus: args.focus });
      case 'stage.update':
        return this.stage.update(args, args.sessionId);
      case 'stage.annotate':
        return this.stage.annotate(args, args.sessionId);
      case 'stage.question':
        return this.stage.question(args, args.sessionId);
      case 'stage.cursor':
        return this.stage.cursor(args, args.sessionId);
      case 'stage.clear':
        return this.stage.clear(args.sessionId);
      case 'stage.export':
        return this.stage.exportMarkdown(args.sessionId);
      default:
        return this.#engine(rawOp, args);
    }
  }

  async #engine(op, args) {
    try {
      return await this.bridge.request(op, args);
    } catch (error) {
      if (error instanceof EngineUnavailableError) {
        throw new MathLabError(error.code ?? 'engine-down', error.message);
      }
      if (error instanceof EngineOpError) {
        throw new MathLabError(error.code, error.message);
      }
      throw new MathLabError('internal', error instanceof Error ? error.message : String(error));
    }
  }

  /** Combined capability report; never throws. */
  async info() {
    const counts = await this.catalog.counts();
    let engine;
    try {
      const info = await this.bridge.probe();
      engine = { available: true, ...info };
    } catch (error) {
      engine = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
        code: error?.code ?? 'engine-down',
        diagnostic: this.bridge.diagnostic(),
      };
    }
    const lean = engine.available && engine.lean && typeof engine.lean === 'object'
      ? engine.lean
      : { available: false, version: null, path: null, note: 'Lean detection requires the Python engine.' };
    return {
      plugin: 'mathlab',
      version: this.version,
      uptimeMs: Date.now() - this.startedAt,
      engine,
      lean,
      content: counts,
      contentWarnings: this.catalog.warnings.slice(0, 10),
      stage: { revision: this.stage.revision, sessions: this.stage.stages.size, hasStage: this.stage.stage.blocks.length > 0 },
      assets: { katex: true },
    };
  }

  /** Engine liveness for the status pill without paying a full probe cost. */
  engineState() {
    return this.bridge.running ? 'running' : 'idle';
  }

  stop() {
    this.bridge.stop();
  }
}
