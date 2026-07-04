import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repoRoot = path.resolve('.');

function run(args) {
  const child = spawnSync(process.execPath, ['scripts/emit-schema-json.ts', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(child.status, 0, `emit-schema-json failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  return child;
}

test('TS-first tenant schema source emits canonical JSON', async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), 'schema-json-'));
  const child = run(['--tenant=app1', '--out-dir', outDir]);

  assert.match(child.stdout, /WROTE schema/);
  const emitted = JSON.parse(await readFile(path.join(outDir, 'app1.schema.json'), 'utf8'));
  const current = JSON.parse(await readFile('schemas/tenants/app1.schema.json', 'utf8'));
  assert.deepEqual(emitted, current);
});

test('TS-first tenant schema source can check JSON drift', () => {
  const child = run(['--check', '--tenants', 'app1,app2']);

  assert.match(child.stdout, /CHECK schema app1/);
  assert.match(child.stdout, /CHECK schema app2/);
});
