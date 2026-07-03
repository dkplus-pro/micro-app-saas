import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  configHashFor,
  loadTenantContractOutput,
  TENANT_SCHEMAS,
} from '../fixtures/tenant-contracts.mjs';

function layoutOrder(runtimeConfig, pageId = 'b') {
  return runtimeConfig.layouts[pageId].map((module) => module.moduleId);
}

function sortedKeys(value) {
  return Object.keys(value).sort();
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

    assert.deepEqual(sortedKeys(app1.moduleRegistry), ['a', 'b', 'c', 'd']);
    assert.deepEqual(sortedKeys(app2.moduleRegistry), ['a', 'c', 'd']);
    assert.ok(!('e' in app1.moduleRegistry));
    assert.ok(!('e' in app2.moduleRegistry));
    assert.ok(!('b' in app2.moduleRegistry));
  });

  it('runtime config snapshots are tenant-scoped and carry reproducible metadata', async () => {
    const app1 = await loadTenantContractOutput('app1');
    const app2 = await loadTenantContractOutput('app2');

    assert.equal(app1.runtimeConfig.tenantId, 'app1');
    assert.equal(app2.runtimeConfig.tenantId, 'app2');
    assert.equal(app1.runtimeConfig.schemaVersion, TENANT_SCHEMAS.app1.schemaVersion);
    assert.equal(app2.runtimeConfig.schemaVersion, TENANT_SCHEMAS.app2.schemaVersion);
    assert.match(app1.runtimeConfig.configHash, /^[a-f0-9]{64}$/);
    assert.match(app2.runtimeConfig.configHash, /^[a-f0-9]{64}$/);
    assert.equal(app1.runtimeConfig.configHash, configHashFor(TENANT_SCHEMAS.app1));
    assert.equal(app2.runtimeConfig.configHash, configHashFor(TENANT_SCHEMAS.app2));
    assert.notEqual(app1.runtimeConfig.configHash, app2.runtimeConfig.configHash);
  });

  it('runtime config never requires a cross-tenant lookup for tabs, pages, or layouts', async () => {
    for (const tenantId of ['app1', 'app2']) {
      const { runtimeConfig } = await loadTenantContractOutput(tenantId);
      const runtimePageIds = new Set(runtimeConfig.pages.map((page) => page.pageId));

      assert.ok(runtimeConfig.tabs.every((tab) => tab.route && runtimePageIds.has(tab.pageId)));
      assert.ok(Object.keys(runtimeConfig.layouts).every((pageId) => runtimePageIds.has(pageId)));
      assert.ok(Object.values(runtimeConfig.layouts).flat().every((module) => module.moduleId));
    }
  });
});
