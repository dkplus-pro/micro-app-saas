import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createArtifacts } from '../packages/generator/src/generator.ts';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';

async function loadSchema(tenant) {
  return JSON.parse(await readFile(`schemas/tenants/${tenant}.schema.json`, 'utf8'));
}

test('page structure is driven by pages/tabs rather than legacy page feature flags', async () => {
  const schema = await loadSchema('app1');
  schema.features.pageD = false;

  const validation = validateTenantSchema(schema);
  assert.deepEqual(validation.errors, []);

  const artifacts = createArtifacts(schema);
  assert.deepEqual(
    artifacts.pagesConfig.map((page) => page.key),
    ['page-a', 'page-b', 'page-c', 'page-d']
  );
  assert.deepEqual(
    artifacts.subPackagesConfig.map((subPackage) => subPackage.root),
    ['pages/page-d', 'pages/module-assets']
  );
});

test('legacy module feature flags remain a runtime JSON compatibility gate', async () => {
  const schema = await loadSchema('app1');
  schema.features.moduleA = false;

  const validation = validateTenantSchema(schema);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /page-a\.modules references disabled capability moduleA/);
});
