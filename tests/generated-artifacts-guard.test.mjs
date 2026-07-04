import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repoRoot = process.cwd();

test('generated tenant TS/JSON and build outputs stay untracked and ignored', () => {
  const guard = spawnSync(process.execPath, ['scripts/check-generated-artifacts.mjs'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  assert.equal(guard.status, 0, `guard failed\nSTDOUT:${guard.stdout}\nSTDERR:${guard.stderr}`);
  assert.match(guard.stdout, /PASS generated artifact guard/);
});
