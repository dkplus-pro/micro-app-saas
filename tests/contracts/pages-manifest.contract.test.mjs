import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadTenantContractOutput } from '../fixtures/tenant-contracts.mjs';

const tenants = ['app1', 'app2'];

function pagePaths(pagesJson) {
  return pagesJson.pages.map((page) => page.path);
}

function tabLabels(pagesJson) {
  return pagesJson.tabBar.list.map((tab) => tab.text);
}

function titleFor(pagesJson, path) {
  return pagesJson.pages.find((page) => page.path === path)?.style?.navigationBarTitleText;
}

describe('tenant pages.json and manifest contracts', () => {
  for (const tenantId of tenants) {
    it(`${tenantId} generated pages are limited to the tenant tab surface`, async () => {
      const { pagesJson, tenant } = await loadTenantContractOutput(tenantId);

      assert.deepEqual(pagePaths(pagesJson), tenant.pages.map((page) => `pages/${page.pageId.toLowerCase()}/index`));
      assert.deepEqual(tabLabels(pagesJson), tenant.tabs.map((tab) => tab.label));
      assert.deepEqual(
        pagesJson.tabBar.list.map((tab) => tab.pagePath),
        tenant.tabs.map((tab) => `pages/${tab.pageId.toLowerCase()}/index`)
      );
    });

    it(`${tenantId} manifest uses isolated tenant identity and mp-weixin appid`, async () => {
      const { manifestJson, tenant } = await loadTenantContractOutput(tenantId);

      assert.equal(manifestJson._tenantId, tenant.id);
      assert.equal(manifestJson.name, tenant.displayName);
      assert.equal(manifestJson['mp-weixin'].appid, tenant.platforms['mp-weixin'].appid);
    });
  }

  it('App1 registers A/B/C and never leaks App2-only page D', async () => {
    const { pagesJson } = await loadTenantContractOutput('app1');

    assert.deepEqual(tabLabels(pagesJson), ['A', 'B', 'C']);
    assert.deepEqual(pagePaths(pagesJson), ['pages/a/index', 'pages/b/index', 'pages/c/index']);
    assert.ok(!pagePaths(pagesJson).includes('pages/d/index'));
  });

  it('App2 registers A/B/D and never leaks App1-only page C', async () => {
    const { pagesJson } = await loadTenantContractOutput('app2');

    assert.deepEqual(tabLabels(pagesJson), ['A', 'B', 'D']);
    assert.deepEqual(pagePaths(pagesJson), ['pages/a/index', 'pages/b/index', 'pages/d/index']);
    assert.ok(!pagePaths(pagesJson).includes('pages/c/index'));
  });

  it('Page A navigation title differs by tenant', async () => {
    const app1 = await loadTenantContractOutput('app1');
    const app2 = await loadTenantContractOutput('app2');

    assert.equal(titleFor(app1.pagesJson, 'pages/a/index'), 'App1 首页');
    assert.equal(titleFor(app2.pagesJson, 'pages/a/index'), 'App2 工作台');
    assert.notEqual(
      titleFor(app1.pagesJson, 'pages/a/index'),
      titleFor(app2.pagesJson, 'pages/a/index')
    );
  });
});
