import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createArtifacts } from '../packages/generator/src/generator.ts';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';

async function loadSchema(tenant) {
  return JSON.parse(await readFile(`schemas/tenants/${tenant}.schema.json`, 'utf8'));
}

function pageByKey(schema, key) {
  const page = Array.isArray(schema.pages) ? schema.pages.find((entry) => entry.key === key) : schema.pages[key];
  if (!page) throw new Error(`Missing test page ${key}`);
  return page;
}

test('built-in schemas use capabilities.modules and no legacy features', async () => {
  for (const tenant of ['app1', 'app2']) {
    const schema = await loadSchema(tenant);

    assert.equal(schema.features, undefined);
    assert.ok(schema.capabilities?.modules, `${tenant} should declare module capabilities`);
  }
});

test('pages[].enabled is the only page inclusion switch', async () => {
  const schema = await loadSchema('app1');
  pageByKey(schema, 'page-d').enabled = false;

  const validation = validateTenantSchema(schema);
  assert.deepEqual(validation.errors, []);

  const artifacts = createArtifacts(schema);
  assert.deepEqual(
    artifacts.pagesConfig.map((page) => page.key),
    ['page-a', 'page-b', 'page-c']
  );
  assert.deepEqual(
    artifacts.subPackagesConfig.map((subPackage) => subPackage.root),
    ['pages/module-assets']
  );
});

test('legacy page feature flags are rejected instead of controlling page inclusion', async () => {
  const schema = await loadSchema('app1');
  schema.features = { pageD: false };

  const validation = validateTenantSchema(schema);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /features\.pageD is no longer supported; use pages\[\]\.enabled/);
});

test('legacy module feature flags remain a runtime JSON compatibility gate', async () => {
  const schema = await loadSchema('app1');
  delete schema.capabilities;
  schema.features.moduleA = false;

  const validation = validateTenantSchema(schema);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /page-a\.modules references disabled capability moduleA/);
});
