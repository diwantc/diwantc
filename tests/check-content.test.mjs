import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const run = (...args) =>
  spawnSync(process.execPath, ['scripts/check-content.mjs', ...args], {
    encoding: 'utf8',
    env: { ...process.env, GITHUB_ACTIONS: '' },
  });

test('valid fixtures pass', () => {
  const result = run('tests/fixtures/lessons');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('valid fixtures fail the approval gate (they are drafts)', () => {
  const result = run('tests/fixtures/lessons', '--require-approved');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /only approved lessons can be merged/);
});

test('broken fixture is rejected for each rule', () => {
  const result = run('tests/fixtures/invalid');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /lessonId should be "safety-l0-98"/);
  assert.match(result.stdout, /at least one source is required/);
  assert.match(result.stdout, /has no alt text/);
  assert.match(result.stdout, /missing language version\(s\): en, fr/);
});

test('empty lessons folder passes', () => {
  const result = run('tests/fixtures/does-not-exist');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /nothing to check/);
});
