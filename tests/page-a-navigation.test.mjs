import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePageAModuleNavigationUrl } from '../apps/miniapp-template/src/pages/page-a/utils/module-navigation.util.ts';
import { toPageAModules } from '../apps/miniapp-template/src/pages/page-a/utils/module-visible.util.ts';

test('Page A renders generated modules in schema order', () => {
  const modules = toPageAModules([
    { key: 'module-a', props: { title: 'Primary action' } },
    { key: 'module-d' }
  ], { 'page-d': 'subpkg/page-d/index' });

  assert.deepEqual(modules.map((module) => module.key), ['module-a', 'module-d']);
  assert.equal(modules[0].displayName, 'Primary action');
  assert.equal(modules[0].navigationUrl, '/subpkg/page-d/index');
  assert.equal(modules[1].navigationUrl, undefined);
});

test('module-a only navigates to Page D when generated routeConfig registers Page D', () => {
  assert.equal(resolvePageAModuleNavigationUrl('module-a', { 'page-d': 'subpkg/page-d/index' }), '/subpkg/page-d/index');
  assert.equal(resolvePageAModuleNavigationUrl('module-a', {}), undefined);
  assert.equal(resolvePageAModuleNavigationUrl('module-b', { 'page-d': 'subpkg/page-d/index' }), undefined);
});
