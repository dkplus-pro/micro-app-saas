import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PAGE_A_TITLES, pageATitleForTenant } from '../../src/tenants/page-a-titles.mjs';

describe('Page A tenant title contract', () => {
  it('uses different navigation titles for App1 and App2', () => {
    assert.equal(pageATitleForTenant('app1'), 'App1 首页');
    assert.equal(pageATitleForTenant('app2'), 'App2 工作台');
    assert.notEqual(PAGE_A_TITLES.app1, PAGE_A_TITLES.app2);
  });

  it('fails closed for unknown tenants instead of falling back to another title', () => {
    assert.throws(
      () => pageATitleForTenant('missing-tenant'),
      /Unknown tenant for page A title: missing-tenant/,
    );
  });
});
