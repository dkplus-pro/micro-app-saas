import assert from 'node:assert/strict';
import { rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, 'apps', 'miniapp-template');

test('Vite tenant build generates app1 locally before building', async () => {
  await rm(path.join(appRoot, 'src', 'generated', 'tenant.config.ts'), { force: true });
  await rm(path.join(appRoot, 'dist', 'vite'), { recursive: true, force: true });

  const child = spawnSync(process.execPath, ['scripts/vite-tenant.ts', 'build', '--tenant=app1'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, `vite tenant build failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  assert.match(child.stdout, /PASS generated tenant app1/);
  await stat(path.join(appRoot, 'src', 'generated', 'tenant.config.ts'));
  await stat(path.join(appRoot, 'dist', 'vite', 'index.html'));
});
