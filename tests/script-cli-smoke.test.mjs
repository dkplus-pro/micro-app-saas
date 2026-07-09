import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function runScript(script, args = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('validate-schema CLI validates selected bundled tenants', () => {
  const child = runScript('scripts/validate-schema.ts', ['--tenants', 'app1,app2']);

  assert.equal(child.status, 0, `validate-schema failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  assert.match(child.stdout, /PASS schema app1/);
  assert.match(child.stdout, /PASS schema app2/);
});

test('validate-schema CLI reports invalid selected tenant schemas', () => {
  const badSchema = 'schemas/tenants/invalid-cli.schema.json';
  writeFileSync(badSchema, JSON.stringify({ tenant: { tenantId: 'invalid-cli' } }, null, 2));
  try {
    const child = runScript('scripts/validate-schema.ts', ['--tenant', 'invalid-cli']);

    assert.notEqual(child.status, 0);
    assert.match(child.stderr, /FAIL schema invalid-cli\.schema\.json/);
  } finally {
    rmSync(badSchema, { force: true });
  }
});

test('generate-tenant CLI emits tenant summary for selected tenant', () => {
  const child = runScript('scripts/generate-tenant.ts', ['--tenant', 'app1']);

  assert.equal(child.status, 0, `generate-tenant failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  const summary = JSON.parse(child.stdout);
  assert.equal(summary.tenantId, 'app1');
  assert.deepEqual(summary.homeModules, ['module-a']);
  assert.ok(summary.pageRoutes.includes('pages/page-a/index'));
});
