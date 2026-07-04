import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repoRoot = path.resolve('.');

function run(args) {
  const child = runRaw(args);
  assert.equal(child.status, 0, `emit-schema-json failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  return child;
}

function runRaw(args) {
  const child = spawnSync(process.execPath, ['scripts/emit-schema-json.ts', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
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

test('TS-first tenant schema source validates before writing JSON', async () => {
  const sourceDir = await mkdtemp(path.join(tmpdir(), 'schema-source-'));
  const outDir = await mkdtemp(path.join(tmpdir(), 'schema-json-'));
  await writeFile(path.join(sourceDir, 'bad.schema.ts'), 'export default { tenant: { tenantId: "bad" } };\n');

  const child = runRaw(['--tenant=bad', '--source-dir', sourceDir, '--out-dir', outDir]);

  assert.notEqual(child.status, 0);
  assert.match(child.stderr, /Invalid tenant schema bad/);
});

test('TS-first tenant schema source reports stale JSON in check mode', async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), 'schema-json-'));
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'app1.schema.json'), '{}\n');

  const child = runRaw(['--check', '--tenant=app1', '--out-dir', outDir]);

  assert.notEqual(child.status, 0);
  assert.match(child.stderr, /Schema JSON is out of date/);
});

test('JSON tenant schema migrates to canonical TS source', async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), 'schema-source-'));
  const child = run(['--from-json', '--tenant=app1', '--out-dir', outDir]);

  assert.match(child.stdout, /WROTE schema source/);
  assert.equal(
    await readFile(path.join(outDir, 'app1.schema.ts'), 'utf8'),
    await readFile('schemas/tenants/app1.schema.ts', 'utf8')
  );
});

test('JSON tenant schema source reports stale TS in check mode', async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), 'schema-source-'));
  await writeFile(path.join(outDir, 'app1.schema.ts'), 'export default {};\n');

  const child = runRaw(['--from-json', '--check', '--tenant=app1', '--out-dir', outDir]);

  assert.notEqual(child.status, 0);
  assert.match(child.stderr, /Schema TS source is out of date/);
});
