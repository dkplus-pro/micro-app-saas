import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('modules own their implementations without a biz adapter layer', () => {
  const moduleRegistry = readFileSync('apps/miniapp-template/src/registry/module.registry.ts', 'utf8');

  assert.equal(existsSync('apps/miniapp-template/src/biz/modules'), false);
  assert.doesNotMatch(moduleRegistry, /biz\/modules|layer:\s*'biz'/);

  for (const moduleKey of ['module-a', 'module-b', 'module-c', 'module-d', 'module-e']) {
    const component = readFileSync(`apps/miniapp-template/src/modules/${moduleKey}/index.vue`, 'utf8');
    const entry = readFileSync(`apps/miniapp-template/src/modules/${moduleKey}/index.ts`, 'utf8');

    assert.doesNotMatch(component, /BizModule|biz\/modules/);
    assert.doesNotMatch(entry, /biz\/modules/);
  }
});
