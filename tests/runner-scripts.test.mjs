import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve('.');

test('runner scripts build/upload/release a tenant with simulated external phases', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'runner-ok-'));
  mkdirSync(path.join(root, 'schemas/tenants'), { recursive: true });
  writeFileSync(path.join(root, 'schemas/tenants/app1.schema.json'), JSON.stringify({
    schemaVersion: 'test',
    app: { appKey: 'app1' },
  }));

  run('scripts/build-tenant.ts', ['--tenant', 'app1', '--root-dir', root, '--skip-validate', '--skip-generate']);
  run('scripts/upload-tenant.ts', ['--tenant', 'app1', '--root-dir', root]);
  const release = run('scripts/release-tenant.ts', ['--tenant', 'app1', '--root-dir', root]);
  const record = JSON.parse(release.stdout);

  assert.equal(record.buildStatus, 'success');
  assert.equal(record.uploadStatus, 'success');
  assert.equal(record.releaseStatus, 'success');
  assert.equal(record.simulated, true);
  assert.match(record.previewQrCode, /^simulated:\/\/preview\/app1\//);
});

test('batch build isolates tenant failures', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'runner-batch-'));
  mkdirSync(path.join(root, 'schemas/tenants'), { recursive: true });
  writeFileSync(path.join(root, 'schemas/tenants/app1.schema.json'), JSON.stringify({ app: { appKey: 'app1' } }));

  const child = spawnSync(process.execPath, [
    path.join(repoRoot, 'scripts/batch-build.ts'),
    '--tenants', 'app1,missing',
    '--root-dir', root,
  ], { encoding: 'utf8' });

  assert.equal(child.status, 1);
  const summary = JSON.parse(child.stdout);
  assert.deepEqual(summary.success, ['app1']);
  assert.deepEqual(summary.failed.map((failure) => failure.tenantId), ['missing']);
});

function run(script, args) {
  const child = spawnSync(process.execPath, [path.join(repoRoot, script), ...args], { encoding: 'utf8' });
  assert.equal(child.status, 0, `${script} failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  return child;
}
