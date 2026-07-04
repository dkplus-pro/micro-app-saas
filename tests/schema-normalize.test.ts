import { describe, expect, it } from 'vitest';
import { defineTenantSchema } from '../packages/schema/src/authoring.ts';
import { isModuleCapabilityEnabled, normalizeTenantCapabilities, tenantPagesToRecord } from '../packages/schema/src/normalize.ts';
import type { TenantSchema } from '../packages/schema/src/types.ts';

const baseSchema = defineTenantSchema({
  tenant: { tenantId: 'typed', tenantName: 'Typed Tenant' },
  app: { appKey: 'typed', appid: 'wx_typed', name: 'Typed 小程序' },
  tabs: [{ key: 'A', text: 'A', page: 'page-a' }],
  pages: [
    {
      key: 'page-a',
      route: 'pages/page-a/index',
      title: 'Typed A',
      enabled: true,
      package: 'main',
      modules: [{ key: 'module-a' }]
    },
    {
      key: 'page-d',
      route: 'pages/page-d/index',
      title: 'Typed D',
      enabled: true,
      package: 'subPackage'
    }
  ],
  features: { moduleA: true, moduleB: false },
  capabilities: { modules: { 'module-a': false, 'module-b': true } }
} satisfies TenantSchema);

describe('tenant schema normalization and TS authoring', () => {
  it('converts array pages with explicit keys into keyed records', () => {
    const pages = tenantPagesToRecord(baseSchema.pages);

    expect(pages['page-a']?.route).toBe('pages/page-a/index');
    expect(pages['page-d']?.package).toBe('subPackage');
  });

  it('lets capabilities.modules override legacy features', () => {
    const capabilities = normalizeTenantCapabilities(baseSchema);

    expect(capabilities.modules?.['module-a']).toBe(false);
    expect(capabilities.modules?.['module-b']).toBe(true);
    expect(isModuleCapabilityEnabled(baseSchema, 'module-a')).toBe(false);
    expect(isModuleCapabilityEnabled(baseSchema, 'module-b')).toBe(true);
  });
});
