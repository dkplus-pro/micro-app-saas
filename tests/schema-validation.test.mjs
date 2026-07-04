import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { SchemaValidationError, validateTenantSchema as validateTenantSchemaStrict } from '../packages/schema/src/validate.ts';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';

async function readTenantSchema(tenant) {
  return JSON.parse(await readFile(`schemas/tenants/${tenant}.schema.json`, 'utf8'));
}

test('runtime and backend validators accept bundled JSON tenant schemas', async () => {
  for (const tenant of ['app1', 'app2']) {
    const schema = await readTenantSchema(tenant);

    assert.deepEqual(validateTenantSchema(schema), { valid: true, errors: [] });
    assert.equal(validateTenantSchemaStrict(schema).tenant.tenantId, tenant);
  }
});

test('runtime and backend validators reject unsupported modules consistently', async () => {
  const schema = await readTenantSchema('app1');
  schema.pages['page-b'].modules.push({ key: 'module-x' });

  const result = validateTenantSchema(schema);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('unknown module module-x')));

  assert.throws(
    () => validateTenantSchemaStrict(schema),
    (error) => error instanceof SchemaValidationError
      && error.issues.some((issue) => issue.includes('unsupported module module-x'))
  );
});

test('runtime and backend validators reject non-object JSON payloads without crashing', () => {
  assert.deepEqual(validateTenantSchema(null), { valid: false, errors: ['schema must be an object'] });
  assert.throws(() => validateTenantSchemaStrict(null), SchemaValidationError);
});
