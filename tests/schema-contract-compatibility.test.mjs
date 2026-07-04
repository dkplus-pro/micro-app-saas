import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createArtifacts } from '../packages/generator/src/generator.ts';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';

async function loadSchema(tenant) {
  return JSON.parse(await readFile(`schemas/tenants/${tenant}.schema.json`, 'utf8'));
}

test('legacy page feature flags are rejected instead of competing with pages/tabs', async () => {
  const schema = await loadSchema('app1');
  schema.features.pageD = false;

  const validation = validateTenantSchema(schema);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /features\.pageD is not supported/);
  assert.match(validation.errors.join('\n'), /pages\[\]\.enabled/);
});

test('legacy module feature flags remain a runtime JSON compatibility gate', async () => {
  const schema = await loadSchema('app1');
  schema.features.moduleA = false;

  const validation = validateTenantSchema(schema);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /page-a\.modules references disabled capability moduleA/);
});
