import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { PythonBridge, REQUIREMENTS_PATH } from '../lib/python-bridge.js';

test('pinned Python requirements file exists and names all engine dependencies', () => {
  assert.equal(existsSync(REQUIREMENTS_PATH), true);
  const text = readFileSync(REQUIREMENTS_PATH, 'utf8');
  for (const packageName of ['sympy', 'numpy', 'scipy', 'networkx']) {
    assert.match(text, new RegExp(`^${packageName}==\\d+\\.\\d+\\.\\d+`, 'm'), `${packageName} must be pinned`);
  }
});

test('bridge exposes the engine script and requirements path in diagnostics', () => {
  const bridge = new PythonBridge({ pythonPath: process.execPath });
  const diagnostic = bridge.diagnostic();
  assert.match(diagnostic.scriptPath, /mathlab_engine\.py$/);
  assert.equal(diagnostic.requirementsPath, REQUIREMENTS_PATH);
});
