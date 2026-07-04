import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve('.');

test('tenant Vite build generates tenant code first and writes ignored Vite output', () => {
  rmSync(path.join(repoRoot, 'apps/miniapp-template/dist/vite'), { recursive: true, force: true });

  const child = spawnSync('npm', ['run', 'vite:build:tenant', '--', '--tenant=app1'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, `vite tenant build failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  assert.match(child.stdout, /generated apps\/miniapp-template\/src\/generated for app1/);
  assert.equal(existsSync(path.join(repoRoot, 'apps/miniapp-template/src/generated/tenant.config.ts')), true);
  assert.equal(existsSync(path.join(repoRoot, 'apps/miniapp-template/dist/vite/index.html')), true);
});
