/**
 * MathLab HTTP surface test.
 *
 * The real HTTP routes ride DSH's authenticated connection.fetch channel, so a
 * CLI cannot call them without the browser's session. This script therefore:
 *  1. registers the handlers against a fake connection channel and exercises
 *     the API/SSE/asset handlers directly (paths, status codes, streaming);
 *  2. proves default deny: a host without connection.fetch registers nothing;
 *  3. if a base URL is passed, proves unauthenticated access is rejected
 *     (legacy /mathlab/api, authenticated /api/mathlab/*, and assets).
 *
 * Usage: node scripts/test-http.mjs [http://127.0.0.1:PORT]
 */
import { registerHttpApi } from '../lib/http-api.js';

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
  if (!ok) failures++;
}

function fakeHost(registerSink) {
  const routes = new Map();
  const ctx = {
    logger: { warn() {}, info() {} },
    get(name) {
      if (name !== 'connection') return undefined;
      return {
        fetch: {
          register(route) {
            routes.set(route.path, route);
            if (registerSink) registerSink(route);
            return () => routes.delete(route.path);
          },
        },
      };
    },
  };
  return { ctx, routes };
}

function fakeService() {
  const listeners = new Set();
  return {
    calls: [],
    async call(op, args) {
      this.calls.push({ op, args });
      return { echo: op, args: args ?? {} };
    },
    stage: {
      get() {
        return { revision: 7 };
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      emit(event) {
        for (const listener of listeners) listener(event);
      },
    },
  };
}

/* 1. Registration and handler contract on an authenticated channel. */
const host = fakeHost();
const service = fakeService();
const dispose = registerHttpApi(host.ctx, service);
check('authenticated channel registers API route', host.routes.has('/api/mathlab/api'));
check('authenticated channel registers SSE route', host.routes.has('/api/mathlab/events'));
check('authenticated channel registers KaTeX JS asset', host.routes.has('/api/mathlab/assets/katex/katex.min.js'));
check('authenticated channel registers KaTeX font asset', host.routes.has('/api/mathlab/assets/katex/fonts/KaTeX_Main-Regular.woff2'));

try {
  const response = await host.routes.get('/api/mathlab/api').fetch(
    new Request('http://localhost/api/mathlab/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ op: 'calc.simplify', args: { expr: '1+1' } }),
    }),
  );
  const payload = await response.json();
  check('API handler calls service and returns JSON', response.status === 200 && payload.ok === true && payload.result.echo === 'calc.simplify');
} catch (error) {
  check('API handler calls service and returns JSON', false, error.message);
}

try {
  const response = await host.routes.get('/api/mathlab/assets/katex/katex.min.js').fetch(
    new Request('http://localhost/api/mathlab/assets/katex/katex.min.js', { method: 'GET' }),
  );
  const text = await response.text();
  check('asset handler serves allowlisted file', response.status === 200 && text.length > 100 && text.includes('katex'));
} catch (error) {
  check('asset handler serves allowlisted file', false, error.message);
}

try {
  const response = await host.routes.get('/api/mathlab/assets/katex/katex.min.js').fetch(
    new Request('http://localhost/api/mathlab/assets/katex/katex.min.js', { method: 'HEAD' }),
  );
  check('asset handler supports HEAD', response.status === 200 && response.body === null);
} catch (error) {
  check('asset handler supports HEAD', false, error.message);
}

try {
  const events = host.routes.get('/api/mathlab/events');
  const controller = new AbortController();
  const response = await events.fetch(
    new Request('http://localhost/api/mathlab/events?sessionId=s1', { method: 'GET', signal: controller.signal }),
  );
  const reader = response.body.getReader();
  const first = await reader.read();
  const second = await reader.read();
  const chunk = new TextDecoder().decode(first.value) + new TextDecoder().decode(second.value);
  await reader.cancel();
  controller.abort();
  check('SSE handler streams retry + initial revision', response.status === 200 && chunk.includes('retry:') && chunk.includes('event: stage'));
} catch (error) {
  check('SSE handler streams retry + initial revision', false, error.message);
}

/* 2. Default deny: no connection service means no registration and a warning. */
let deniedWarnings = 0;
const denyCtx = {
  logger: {
    warn() {
      deniedWarnings++;
    },
    info() {},
  },
  get() {
    return undefined;
  },
};
const disposeDenied = registerHttpApi(denyCtx, fakeService());
check('default deny: no connection.fetch registers no routes', deniedWarnings === 1);
disposeDenied();

/* 3. Live unauthenticated probes when a GUI base URL is supplied. */
const liveBase = (process.argv[2] ?? process.env.MATHLAB_BASE ?? '').replace(/\/$/, '');
if (liveBase) {
  const probes = [
    ['legacy /mathlab/api is gone', '/mathlab/api', { method: 'POST', body: '{}' }],
    ['authenticated /api/mathlab/api rejects unauthenticated calls', '/api/mathlab/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }],
    ['unauthenticated lean.info is rejected', '/api/mathlab/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op: 'lean.info', args: {} }) }],
    ['authenticated /api/mathlab/assets rejects unauthenticated calls', '/api/mathlab/assets/katex/katex.min.js', { method: 'GET' }],
    ['authenticated /api/mathlab/events rejects unauthenticated calls', '/api/mathlab/events', { method: 'GET' }],
  ];
  for (const [label, path, init] of probes) {
    try {
      const response = await fetch(liveBase + path, init);
      check(label, response.status !== 200, `status=${response.status}`);
    } catch (error) {
      check(label, true, 'connection refused/closed (denied)');
    }
  }
} else {
  console.log('INFO  no base URL supplied; skipped live unauthenticated probes');
}

dispose();
console.log(failures === 0 ? '\nALL PROBES PASSED' : `\n${failures} PROBE(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
