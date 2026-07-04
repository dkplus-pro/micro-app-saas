import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { SchemaValidationError, validateTenantSchema } from '../packages/schema/src/validate.ts';
import type { TenantPage, TenantSchema } from '../packages/schema/src/types.ts';

describe('tenant schema validation', () => {
  it('accepts bundled App1 and App2 schemas', async () => {
    for (const tenant of ['app1', 'app2']) {
      const schema = JSON.parse(await readFile(`schemas/tenants/${tenant}.schema.json`, 'utf8'));
      expect(validateTenantSchema(schema).tenant.tenantId).toBe(tenant);
    }
  });

  it('rejects unsupported modules before generation', async () => {
    const schema = JSON.parse(await readFile('schemas/tenants/app1.schema.json', 'utf8'));
    pageByKey(schema, 'page-b').modules!.push({ key: 'module-x' });

    expect(() => validateTenantSchema(schema)).toThrow(SchemaValidationError);
    expect(() => validateTenantSchema(schema)).toThrow(/unsupported module module-x/);
  });

  it('rejects tabs that point at disabled pages', async () => {
    const schema = JSON.parse(await readFile('schemas/tenants/app2.schema.json', 'utf8'));
    schema.tabs.push({ key: 'C', text: 'C', page: 'page-c' });

    expect(() => validateTenantSchema(schema)).toThrow(/page-c must reference an enabled page/);
  });
});


function pageByKey(schema: TenantSchema, key: string): TenantPage {
  const page = Array.isArray(schema.pages) ? schema.pages.find((entry) => entry.key === key) : schema.pages[key as keyof typeof schema.pages];
  if (!page) throw new Error(`Missing test page ${key}`);
  return page;
}
