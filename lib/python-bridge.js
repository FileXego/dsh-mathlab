/**
 * Persistent Python worker bridge.
 *
 * One long-lived `python -u engine/mathlab_engine.py` child speaks line-delimited
 * JSON over stdin/stdout. Requests are matched to responses by integer id. A
 * timeout, an exit, or a spawn failure rejects every pending request and lets the
 * next request lazily start a fresh worker (one controlled retry per call site).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DEFAULT_TIMEOUT_MS = 30_000;

/** Candidate interpreter paths for this deployment, most specific first. */
function pythonCandidates() {
  const candidates = [];
  const push = (value) => {
    if (typeof value === 'string' && value.trim() !== '' && !candidates.includes(value)) candidates.push(value);
  };
  push(process.env.MATHLAB_PYTHON);
  const localAppData = process.env.LOCALAPPDATA;
  const programFiles = process.env.ProgramFiles;
  if (localAppData) {
    push(join(localAppData, 'Microsoft', 'WindowsApps', 'python.exe'));
    push(join(localAppData, 'Microsoft', 'WindowsApps', 'python3.exe'));
    const programs = join(localAppData, 'Programs', 'Python');
    try {
      for (const name of readdirSync(programs).filter((entry) => /^Python3\d+$/.test(entry)).sort().reverse()) {
        push(join(programs, name, 'python.exe'));
      }
    } catch {
      /* no per-user installs */
    }
  }
  if (programFiles) {
    try {
      for (const name of readdirSync(programFiles).filter((entry) => /^Python3\d+$/.test(entry)).sort().reverse()) {
        push(join(programFiles, name, 'python.exe'));
      }
    } catch {
      /* no machine-wide installs */
    }
  }
  push('python');
  push('python3');
  return candidates;
}

/** Whether a candidate executable exists before trying to spawn it. */
function looksRunnable(candidate) {
  if (!candidate.includes('\\') && !candidate.includes('/')) return true;
  return existsSync(candidate);
}

/** Probe one interpreter for the packages the engine needs. */
function probeInterpreter(candidate) {
  try {
    const result = spawnSync(candidate, ['-c', 'import sys, sympy, numpy; print(sys.version.split()[0]); print(sympy.__version__)'], {
      encoding: 'utf8',
      timeout: 20_000,
      windowsHide: true,
    });
    if (result.error || result.status !== 0) return undefined;
    return { path: candidate, probe: (result.stdout ?? '').trim().replace(/\r/g, '') };
  } catch {
    return undefined;
  }
}

/** Engine unavailable / crashed. */
export class EngineUnavailableError extends Error {
  constructor(message, code = 'engine-down') {
    super(message);
    this.name = 'EngineUnavailableError';
    this.code = code;
  }
}

/** One protocol failure returned by the engine. */
export class EngineOpError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'EngineOpError';
    this.code = code;
  }
}

export class PythonBridge {
  /**
   * @param {{ enginePath?: string, pythonPath?: string, timeoutMs?: number, maxLineBytes?: number, onLog?: (line: string) => void }} options
   */
  constructor(options = {}) {
    this.enginePath = options.enginePath ?? fileURLToPath(new URL('../engine/mathlab_engine.py', import.meta.url));
    this.configuredPython = options.pythonPath ?? process.env.MATHLAB_PYTHON ?? undefined;
    this.pythonPath = undefined;
    this.pythonProbe = undefined;
    this.pythonError = undefined;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxLineBytes = options.maxLineBytes ?? 8 * 1024 * 1024;
    this.onLog = options.onLog ?? (() => {});
    this.seq = 0;
    this.proc = undefined;
    this.pending = new Map();
    this.buffer = '';
    this.lastError = undefined;
    this.stderrTail = '';
    this.disposed = false;
  }

  /** Absolute engine script path (diagnostics surface it). */
  get scriptPath() {
    return this.enginePath;
  }

  /** Whether a worker process is currently alive. */
  get running() {
    return this.proc !== undefined;
  }

  /** Resolve the first interpreter that has the engine's dependencies. */
  #resolvePython() {
    if (this.pythonPath !== undefined) return this.pythonPath;
    if (this.pythonError !== undefined) throw new EngineUnavailableError(this.pythonError);
    const preferred = this.configuredPython === undefined ? [] : [this.configuredPython];
    const candidates = [...preferred, ...pythonCandidates()];
    const tried = [];
    for (const candidate of candidates) {
      if (tried.includes(candidate)) continue;
      tried.push(candidate);
      if (!looksRunnable(candidate)) continue;
      const probed = probeInterpreter(candidate);
      if (probed !== undefined) {
        this.pythonPath = probed.path;
        this.pythonProbe = probed.probe;
        this.onLog(`python interpreter: ${probed.path}`);
        return probed.path;
      }
    }
    this.pythonError = `no usable Python found (need python with sympy+numpy; tried: ${tried.join(', ')}). Set MATHLAB_PYTHON to an interpreter path.`;
    throw new EngineUnavailableError(this.pythonError);
  }

  /** Resolved interpreter info for diagnostics. */
  diagnostic() {
    return { pythonPath: this.pythonPath ?? null, probe: this.pythonProbe ?? null, error: this.pythonError ?? null, scriptPath: this.enginePath };
  }

  #spawn() {
    if (this.disposed) throw new EngineUnavailableError('MathLab engine bridge is disposed');
    const python = this.#resolvePython();
    const cwd = dirname(this.enginePath);
    let child;
    try {
      child = spawn(python, ['-u', this.enginePath], {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
          PYTHONUTF8: '1',
          PYTHONDONTWRITEBYTECODE: '1',
        },
      });
    } catch (error) {
      this.lastError = error;
      throw new EngineUnavailableError(`cannot start Python (${this.pythonPath}): ${error instanceof Error ? error.message : String(error)}`);
    }
    this.proc = child;
    this.lastError = undefined;
    this.buffer = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => this.#onStdout(String(chunk)));
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      const text = String(chunk);
      this.stderrTail = (this.stderrTail + text).slice(-4000);
      for (const line of text.split('\n')) if (line.trim() !== '') this.onLog(line);
    });
    child.on('error', (error) => {
      this.lastError = error;
      this.#failAll(new EngineUnavailableError(`Python worker error: ${error.message}`));
    });
    child.on('exit', (code, signal) => {
      if (this.proc === child) this.proc = undefined;
      const detail = this.stderrTail.trim().split('\n').filter(Boolean).slice(-4).join(' | ');
      this.#failAll(new EngineUnavailableError(
        `Python engine exited (${signal ?? code ?? 'unknown'})${detail ? `: ${detail}` : ''}`,
      ));
    });
  }

  /** @param {string} chunk */
  #onStdout(chunk) {
    this.buffer += chunk;
    for (;;) {
      const newline = this.buffer.indexOf('\n');
      if (newline < 0) break;
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (line === '') continue;
      if (line.length > this.maxLineBytes) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        this.onLog(`unparsable engine line: ${line.slice(0, 200)}`);
        continue;
      }
      if (message?.ready === true) {
        this.onLog(`engine ready${message.info ? ` (${message.info.sympy ?? 'sympy'})` : ''}`);
        continue;
      }
      const id = Number(message?.id);
      const entry = this.pending.get(id);
      if (entry === undefined) continue;
      this.pending.delete(id);
      clearTimeout(entry.timer);
      if (message.ok === true) entry.resolve(message.result);
      else entry.reject(new EngineOpError(message?.error?.code ?? 'internal', message?.error?.message ?? 'engine error'));
    }
    if (this.buffer.length > this.maxLineBytes) {
      this.buffer = '';
      this.#failAll(new EngineUnavailableError('engine produced an oversized protocol line'));
      this.#kill();
    }
  }

  /** @param {Error} error */
  #failAll(error) {
    for (const [id, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(error);
      this.pending.delete(id);
    }
  }

  #kill() {
    const child = this.proc;
    this.proc = undefined;
    if (child === undefined) return;
    try {
      child.stdin?.end();
      child.kill();
    } catch {
      /* already gone */
    }
  }

  /**
   * Send one engine op and await its result. Rejects with EngineUnavailableError
   * or EngineOpError (typed code from the engine).
   * @param {string} op
   * @param {unknown} args
   * @param {{ timeoutMs?: number }} [options]
   * @returns {Promise<any>}
   */
  async request(op, args, options = {}) {
    if (this.disposed) throw new EngineUnavailableError('MathLab engine bridge is disposed');
    if (this.proc === undefined) this.#spawn();
    const id = ++this.seq;
    const timeoutMs = Math.max(1_000, Math.min(options.timeoutMs ?? this.timeoutMs, 120_000));
    const child = this.proc;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.#kill();
        reject(new EngineUnavailableError(`MathLab engine timed out after ${timeoutMs} ms on ${op}`, 'timeout'));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try {
        child.stdin.write(`${JSON.stringify({ id, op, args: args ?? {} })}\n`);
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        this.#kill();
        reject(new EngineUnavailableError(`cannot write to Python engine: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  /** Cheap liveness probe used by meta.info. */
  async probe() {
    const result = await this.request('meta.info', {}, { timeoutMs: 15_000 });
    return result;
  }

  /** Stop the worker and reject pending work. */
  stop() {
    this.disposed = true;
    this.#failAll(new EngineUnavailableError('MathLab engine bridge stopped'));
    this.#kill();
  }
}
