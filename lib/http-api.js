/**
 * HTTP surface of MathLab, served on DSH's **authenticated `/api` channel**
 * (`ctx.connection.fetch`). That channel authenticates the browser session and
 * validates Host/Origin before a handler runs. If the host does not expose the
 * channel, these routes are not registered at all (default deny); MathLab's
 * agent tools and the global panel continue to work without HTTP.
 *
 *   POST /api/mathlab/api       JSON operation endpoint used by the Web panel
 *   GET  /api/mathlab/events    Server-Sent-Events revision stream for the stage
 *   GET  /api/mathlab/assets/*  bundled KaTeX assets (script, CSS, fonts, license)
 *
 * No unauthenticated webServer route is registered.
 */
import { readFile, stat } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MathLabError } from './math-service.js';

const ASSET_ROOT = fileURLToPath(new URL('../assets/', import.meta.url));
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_INFLIGHT_API = 8;
const MAX_SSE_CLIENTS = 16;

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

/** Only these files are servable. KaTeX fonts are enumerated from the bundle. */
function assetNames() {
  const names = new Set(['katex/katex.min.js', 'katex/katex.min.css', 'katex/LICENSE']);
  try {
    for (const file of readdirSync(join(ASSET_ROOT, 'katex', 'fonts'))) {
      if (/^[A-Za-z0-9_.-]+\.(woff2|woff|ttf)$/.test(file)) names.add('katex/fonts/' + file);
    }
  } catch {
    /* the fixed assets remain the minimum */
  }
  return [...names];
}

/** @param {number} status @param {unknown} payload */
function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

/** @param {unknown} payload */
function normalizeEnvelope(payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return { op: undefined, args: undefined };
  }
  return { op: payload.op, args: payload.args };
}

/**
 * Build one authenticated SSE response. The host channel aborts the request
 * when the browser page or connection goes away; we also release the stage
 * subscription from the stream's cancel hook.
 * @param {Request} request
 * @param {import('./math-service.js').MathLabService} service
 * @param {{ count: number }} state
 */
function stageEventsResponse(request, service, state) {
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return jsonResponse(400, { ok: false, error: { code: 'bad-request', message: 'bad request' } });
  }
  const raw = url.searchParams.get('sessionId');
  const sessionId = raw === null || raw === '' ? undefined : raw;
  if (state.count >= MAX_SSE_CLIENTS) {
    return jsonResponse(503, { ok: false, error: { code: 'busy', message: 'too many stage streams' } });
  }
  state.count += 1;
  const encoder = new TextEncoder();
  let closed = false;
  let unsubscribe = null;
  let heartbeat = null;
  let controllerRef = null;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    state.count = Math.max(0, state.count - 1);
    if (heartbeat !== null) clearInterval(heartbeat);
    try {
      unsubscribe?.();
    } catch {
      /* already released */
    }
    try {
      controllerRef?.close();
    } catch {
      /* already closed */
    }
  };
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      const send = (event) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: stage\ndata: ${JSON.stringify(event)}\n\n`));
        } catch {
          cleanup();
        }
      };
      controller.enqueue(encoder.encode('retry: 3000\n\n'));
      try {
        send({ sessionId: sessionId ?? null, revision: service.stage.get(sessionId).revision });
      } catch {
        send({ sessionId: sessionId ?? null, revision: 0 });
      }
      unsubscribe = service.stage.subscribe((event) => {
        if (sessionId !== undefined && event.sessionId !== sessionId) return;
        send(event);
      });
      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          cleanup();
        }
      }, 15_000);
      heartbeat.unref?.();
      request.signal.addEventListener('abort', cleanup, { once: true });
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-content-type-options': 'nosniff',
      'x-accel-buffering': 'no',
    },
  });
}

/** @param {string} relative */
async function assetResponse(relative) {
  const target = join(ASSET_ROOT, relative);
  let info;
  try {
    info = await stat(target);
  } catch {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  if (!info.isFile()) {
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  const data = await readFile(target);
  const contentType = relative === 'katex/LICENSE'
    ? 'text/plain; charset=utf-8'
    : (CONTENT_TYPES[extname(target).toLowerCase()] ?? CONTENT_TYPES['']);
  return new Response(data, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-length': String(data.length),
      'cache-control': relative.endsWith('.js') || relative.endsWith('.css')
        ? 'public, max-age=86400'
        : 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}

/**
 * Register the MathLab routes on the authenticated connection channel.
 * Missing `connection.fetch` is a hard no-registration (default deny).
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {import('./math-service.js').MathLabService} service
 */
export function registerHttpApi(ctx, service) {
  const connection = typeof ctx.get === 'function' ? ctx.get('connection') : ctx.connection;
  const face = connection && connection.fetch;
  if (!face || typeof face.register !== 'function') {
    ctx.logger?.warn?.('mathlab: HTTP API not registered — host connection.fetch is unavailable (default deny)');
    return () => {};
  }

  const disposers = [];
  const register = (path, methods, handler) => {
    try {
      const dispose = face.register({
        path,
        methods,
        requestBody: 'buffered',
        fetch: handler,
      });
      if (typeof dispose === 'function') disposers.push(dispose);
    } catch (error) {
      ctx.logger?.warn?.(`mathlab: route ${path} was refused by the host: ${error?.message ?? error}`);
    }
  };

  const apiState = { count: 0 };
  register('/api/mathlab/api', ['POST'], async (request) => {
    if (apiState.count >= MAX_INFLIGHT_API) {
      return jsonResponse(429, { ok: false, error: { code: 'busy', message: 'too many concurrent requests' } });
    }
    const contentType = request.headers.get('content-type') ?? '';
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      return jsonResponse(415, { ok: false, error: { code: 'bad-request', message: 'content-type must be application/json' } });
    }
    let text;
    try {
      text = await request.text();
    } catch {
      return jsonResponse(400, { ok: false, error: { code: 'bad-request', message: 'unreadable request body' } });
    }
    if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
      return jsonResponse(413, { ok: false, error: { code: 'limit', message: 'request body too large' } });
    }
    let payload;
    try {
      payload = text.trim() === '' ? {} : JSON.parse(text);
    } catch {
      return jsonResponse(400, { ok: false, error: { code: 'bad-request', message: 'request body is not valid JSON' } });
    }
    const { op, args } = normalizeEnvelope(payload);
    apiState.count += 1;
    try {
      const result = await service.call(op, args);
      return jsonResponse(200, { ok: true, result });
    } catch (error) {
      const code = typeof error?.code === 'string' ? error.code : 'internal';
      const message = error instanceof Error ? error.message : String(error);
      return jsonResponse(200, { ok: false, error: { code, message: message.slice(0, 2000) } });
    } finally {
      apiState.count = Math.max(0, apiState.count - 1);
    }
  });

  const sseState = { count: 0 };
  register('/api/mathlab/events', ['GET'], (request) => stageEventsResponse(request, service, sseState));

  for (const relative of assetNames()) {
    register('/api/mathlab/assets/' + relative, ['GET', 'HEAD'], async (request) => {
      const response = await assetResponse(relative);
      if (request.method === 'HEAD') {
        return new Response(null, { status: response.status, headers: response.headers });
      }
      return response;
    });
  }

  return () => {
    for (const dispose of disposers) {
      try {
        dispose();
      } catch {
        /* best effort */
      }
    }
  };
}
