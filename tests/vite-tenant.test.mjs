import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve('.');

test('tenant uni-app build wrapper generates code before mini-program build command', () => {
  rmSync(path.join(repoRoot, 'apps/miniapp-template/dist/build/mp-weixin'), { recursive: true, force: true });

  const child = spawnSync('npm', ['run', 'build:mp-weixin', '--', '--tenant=app1', '--dry-run'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, `uni-app tenant build dry-run failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  const jsonLine = child.stdout.split('\n').find((line) => line.trim().startsWith('{'));
  assert.ok(jsonLine, `expected JSON plan in stdout\n${child.stdout}`);
  const plan = JSON.parse(jsonLine);
  assert.deepEqual(plan.commandLine, ['node_modules/.bin/uni', 'build', '-p', 'mp-weixin']);
  assert.equal(existsSync(path.join(repoRoot, 'apps/miniapp-template/src/generated/tenant.config.ts')), true);
  assert.equal(existsSync(path.join(repoRoot, 'apps/miniapp-template/src/pages.json')), true);
  assert.equal(existsSync(path.join(repoRoot, 'apps/miniapp-template/src/manifest.json')), true);
});
