import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generateTenant } from '../scripts/lib/generator.mjs';

test('App1 generation registers only A/B/C tabs and modules a/b/c/d', async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'micro-app-saas-'));
  try {
    const result = await generateTenant({
      tenantId: 'app1',
      rootDir: process.cwd(),
      writeRoot: false,
      snapshotRoot: path.join(tempDir, 'app1')
    });

    assert.equal(result.tenant.id, 'app1');
    assert.deepEqual(result.pagesJson.pages.map((page) => page.path), ['pages/a/index', 'pages/b/index', 'pages/c/index']);
    assert.deepEqual(result.pagesJson.tabBar.list.map((tab) => tab.text), ['A', 'B', 'C']);
    assert.equal(result.pagesJson.pages[0].style.navigationBarTitleText, 'App1 首页');
    assert.deepEqual(result.runtimeConfig.layouts.B.modules.map((module) => module.moduleId), ['a', 'b', 'c', 'd']);
    assert.equal(result.manifestJson['mp-weixin'].appid, 'wx-app1-placeholder');
    assert.match(result.configHash, /^[a-f0-9]{16}$/);

    const registry = await readFile(path.join(tempDir, 'app1/generated/module-registry.js'), 'utf8');
    assert.match(registry, /import ModuleA/);
    assert.match(registry, /import ModuleD/);
    assert.doesNotMatch(registry, /import ModuleE/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
