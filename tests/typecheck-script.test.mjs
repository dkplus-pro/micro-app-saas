import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('typecheck script can verify a non-default generated tenant', () => {
  const child = spawnSync(process.execPath, ['scripts/typecheck.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, TYPECHECK_TENANTS: 'app2' }
  });

  assert.equal(child.status, 0, `typecheck failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  assert.match(child.stdout, /\[typecheck\] generated tenant app2/);
  assert.match(child.stdout, /\[typecheck\] PASS tsc --noEmit for tenants: app2/);

  const summary = JSON.parse(readFileSync('apps/miniapp-template/src/generated/build-summary.json', 'utf8'));
  assert.equal(summary.tenantId, 'app2');
});
