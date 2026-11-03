/**
 * HTTP surface of MathLab:
 *   POST /mathlab/api        JSON operation endpoint used by the Web panel
 *   GET  /mathlab/events     Server-Sent-Events revision stream for the live stage
 *   GET  /mathlab/assets/... bundled KaTeX assets (script, CSS, fonts, license)
 *
 * All routes apply the same browser-trust fence as the harness API gateway.
 * Static assets are an explicit allowlist; no path from the URL is joined
 * before validation beyond a fixed set of names.
 */
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isTrustedApiRequest } from './fence.js';
import { MathLabError } from './math-service.js';

const ASSET_ROOT = fileURLToPath(new URL('../assets/', import.meta.url));
const MAX_BODY_BYTES = 1024 * 1024;

const CONTENT_TYPES = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '': 'application/octet-stream',
};

/** Only these asset paths are servable. */
const ALLOWED_ASSETS = new Set([
  'katex/katex.min.js',
  'katex/katex.min.css',
  'katex/LICENSE',
]);

/** @param {string} name */
function isFontName(name) {
  return /^[A-Za-z0-9_.-]+\.(woff2|woff|ttf)$/.test(name);
}

/** @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} payload */
function writeJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

/** @param {import('node:http').IncomingMessage} req */
async function readBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) throw new MathLabError('limit', `request body exceeds ${MAX_BODY_BYTES} bytes`);
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (text.trim() === '') return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new MathLabError('bad-request', 'request body is not valid JSON');
  }
}

/** @param {unknown} payload */
function normalizeEnvelope(payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return { op: undefined, args: undefined };
  }
  return { op: payload.op, args: payload.args };
}

/**
 * Register the MathLab HTTP routes.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {import('./math-service.js').MathLabService} service
 */
export function registerHttpApi(ctx, service) {
  const trustedHosts = () => {
    const webRuntime = ctx.get('webRuntime');
    return Array.isArray(webRuntime?.trustedHosts) ? webRuntime.trustedHosts : [];
  };
  const fence = (req) => isTrustedApiRequest(req, trustedHosts());

  const apiDisposer = ctx.webServer.register({
    kind: 'prefix',
    path: '/mathlab/api',
    handler: async (req, res) => {
      if (!fence(req)) {
        writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
        return;
      }
      if (req.method !== 'POST') {
        writeJson(res, 405, { ok: false, error: { code: 'bad-request', message: 'POST required' } });
        return;
      }
      let payload;
      try {
        payload = await readBody(req);
      } catch (error) {
        writeJson(res, 400, {
          ok: false,
          error: { code: error?.code ?? 'bad-request', message: error instanceof Error ? error.message : String(error) },
        });
        return;
      }
      const { op, args } = normalizeEnvelope(payload);
      try {
        const result = await service.call(op, args);
        writeJson(res, 200, { ok: true, result });
      } catch (error) {
        writeJson(res, 200, {
          ok: false,
          error: {
            code: error?.code ?? 'internal',
            message: error instanceof Error ? error.message : String(error),
          },
        });
      }
    },
  });

  const eventsDisposer = ctx.webServer.register({
    kind: 'exact',
    path: '/mathlab/events',
    handler: (req, res) => {
      if (!fence(req)) {
        res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('forbidden');
        return;
      }
      if (req.method !== 'GET') {
        res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('method not allowed');
        return;
      }
      let url;
      try {
        url = new URL(req.url ?? '/', 'http://mathlab.internal');
      } catch {
        res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('bad request');
        return;
      }
      const sessionQuery = url.searchParams.get('sessionId');
      const sessionId = sessionQuery === null || sessionQuery === '' ? undefined : sessionQuery;
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
        'x-content-type-options': 'nosniff',
      });
      res.write('retry: 3000\n\n');
      let closed = false;
      const send = (event) => {
        if (closed) return;
        try {
          res.write(`event: stage\ndata: ${JSON.stringify(event)}\n\n`);
        } catch {
          /* client vanished */
        }
      };
      try {
        const snapshot = service.stage.get(sessionId);
        send({ sessionId: sessionId ?? null, revision: snapshot.revision });
      } catch {
        send({ sessionId: sessionId ?? null, revision: 0 });
      }
      const unsubscribe = service.stage.subscribe((event) => {
        if (sessionId !== undefined && event.sessionId !== sessionId) return;
        send(event);
      });
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          res.write(': heartbeat\n\n');
        } catch {
          /* client vanished */
        }
      }, 15_000);
      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        try {
          unsubscribe();
        } catch {
          /* already released */
        }
      };
      res.on('close', cleanup);
      req.on('close', cleanup);
    },
  });

  const assetsDisposer = ctx.webServer.register({
    kind: 'prefix',
    path: '/mathlab/assets',
    handler: async (req, res) => {
      if (!fence(req)) {
        res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('forbidden');
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('method not allowed');
        return;
      }
      let pathname;
      try {
        pathname = new URL(req.url ?? '/', 'http://mathlab.internal').pathname;
      } catch {
        res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('bad request');
        return;
      }
      const prefix = '/mathlab/assets/';
      if (!pathname.startsWith(prefix)) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('not found');
        return;
      }
      const relative = pathname.slice(prefix.length);
      let target;
      if (ALLOWED_ASSETS.has(relative)) {
        target = join(ASSET_ROOT, relative);
      } else if (/^katex\/fonts\/[^/]+$/.test(relative) && isFontName(relative.split('/').pop() ?? '')) {
        target = join(ASSET_ROOT, 'katex', 'fonts', relative.split('/').pop());
      } else {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('not found');
        return;
      }
      let info;
      try {
        info = await stat(target);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('not found');
        return;
      }
      if (!info.isFile()) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('not found');
        return;
      }
      const isLicense = relative === 'katex/LICENSE';
      const data = await readFile(target);
      res.writeHead(200, {
        'content-type': isLicense ? 'text/plain; charset=utf-8' : (CONTENT_TYPES[extname(target).toLowerCase()] ?? CONTENT_TYPES['']),
        'content-length': data.length,
        'cache-control': relative.endsWith('.js') || relative.endsWith('.css')
          ? 'public, max-age=86400'
          : 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
      });
      if (req.method === 'HEAD') res.end();
      else res.end(data);
    },
  });

  return () => {
    eventsDisposer();
    apiDisposer();
    assetsDisposer();
  };
}
