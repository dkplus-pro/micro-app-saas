import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadTenantContractOutput } from '../fixtures/tenant-contracts.mjs';

function layoutOrder(runtimeConfig, pageId = 'B') {
  return runtimeConfig.layouts[pageId].modules.map((module) => module.moduleId);
}

function registryOrder(moduleRegistry, pageId = 'B') {
  return moduleRegistry.pageModules[pageId].map((module) => module.moduleId);
}

describe('tenant module registry and runtime config contracts', () => {
  it('Page B module stream is tenant-specific and ordered', async () => {
    const app1 = await loadTenantContractOutput('app1');
    const app2 = await loadTenantContractOutput('app2');

    assert.deepEqual(layoutOrder(app1.runtimeConfig), ['a', 'b', 'c', 'd']);
    assert.deepEqual(layoutOrder(app2.runtimeConfig), ['a', 'd', 'c']);
  });

  it('module registry includes only modules referenced by the current tenant layout', async () => {
    const app1 = await loadTenantContractOutput('app1');
    const app2 = await loadTenantContractOutput('app2');

    assert.deepEqual(registryOrder(app1.moduleRegistry), ['a', 'b', 'c', 'd']);
    assert.deepEqual(registryOrder(app2.moduleRegistry), ['a', 'd', 'c']);
    assert.ok(!registryOrder(app1.moduleRegistry).includes('e'));
    assert.ok(!registryOrder(app2.moduleRegistry).includes('e'));
    assert.ok(!registryOrder(app2.moduleRegistry).includes('b'));
  });

  it('runtime config snapshots are tenant-scoped and carry reproducible metadata', async () => {
    const app1 = await loadTenantContractOutput('app1');
    const app2 = await loadTenantContractOutput('app2');

    assert.equal(app1.runtimeConfig.tenantId, 'app1');
    assert.equal(app2.runtimeConfig.tenantId, 'app2');
    assert.equal(app1.runtimeConfig.schemaVersion, app1.tenant.schemaVersion);
    assert.equal(app2.runtimeConfig.schemaVersion, app2.tenant.schemaVersion);
    assert.match(app1.runtimeConfig.configHash, /^[a-f0-9]{16}$/);
    assert.match(app2.runtimeConfig.configHash, /^[a-f0-9]{16}$/);
    assert.equal(app1.runtimeConfig.configHash, app1.metadata.configHash);
    assert.equal(app2.runtimeConfig.configHash, app2.metadata.configHash);
    assert.notEqual(app1.runtimeConfig.configHash, app2.runtimeConfig.configHash);
  });

  it('runtime config never requires a cross-tenant lookup for tabs, pages, or layouts', async () => {
    for (const tenantId of ['app1', 'app2']) {
      const { runtimeConfig } = await loadTenantContractOutput(tenantId);
      const runtimePageIds = new Set(runtimeConfig.pages.map((page) => page.pageId));

      assert.ok(runtimeConfig.tabs.every((tab) => tab.route && runtimePageIds.has(tab.pageId)));
      assert.ok(Object.keys(runtimeConfig.layouts).every((pageId) => runtimePageIds.has(pageId)));
      assert.ok(Object.values(runtimeConfig.layouts).flatMap((layout) => layout.modules).every((module) => module.moduleId));
    }
  });
});
