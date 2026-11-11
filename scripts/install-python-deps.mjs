#!/usr/bin/env node
/**
 * Install the pinned Python engine dependencies into the interpreter MathLab
 * will use. This is deliberately an explicit user action (no hidden install
 * script): run `npm run setup:python` from the plugin checkout, or copy the
 * absolute `pip install -r ...` command printed by the plugin's engine error.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const requirements = fileURLToPath(new URL('../engine/requirements.txt', import.meta.url));
const python = process.env.MATHLAB_PYTHON || process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
console.log(`[mathlab] installing Python dependencies with: ${python}`);
console.log(`[mathlab] requirements: ${requirements}`);
const result = spawnSync(python, ['-m', 'pip', 'install', '-r', requirements], {
  stdio: 'inherit',
  windowsHide: true,
});
if (result.error) {
  console.error(`[mathlab] could not run ${python}: ${result.error.message}`);
  console.error('[mathlab] set MATHLAB_PYTHON to a Python 3.13 interpreter, then retry.');
  process.exit(1);
}
process.exit(result.status ?? 1);
