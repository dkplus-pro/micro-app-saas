import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { SchemaValidationError, validateTenantSchema } from '../packages/schema/src/validate.js';

describe('tenant schema validation', () => {
  it('accepts bundled App1 and App2 schemas', async () => {
    for (const tenant of ['app1', 'app2']) {
      const schema = JSON.parse(await readFile(`schemas/tenants/${tenant}.schema.json`, 'utf8'));
      expect(validateTenantSchema(schema).tenant.tenantId).toBe(tenant);
    }
  });

  it('rejects unsupported modules before generation', async () => {
    const schema = JSON.parse(await readFile('schemas/tenants/app1.schema.json', 'utf8'));
    schema.pages['page-b'].modules.push({ key: 'module-x' });

    expect(() => validateTenantSchema(schema)).toThrow(SchemaValidationError);
    expect(() => validateTenantSchema(schema)).toThrow(/unsupported module module-x/);
  });

  it('rejects tabs that point at disabled pages', async () => {
    const schema = JSON.parse(await readFile('schemas/tenants/app1.schema.json', 'utf8'));
    schema.tabs.push({ key: 'D', text: 'D', page: 'page-d' });

    expect(() => validateTenantSchema(schema)).toThrow(/page-d must reference an enabled page/);
  });
});
