import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

const app1Pages = await readJson('src/generated/tenants/app1/pages.json');
const app2Pages = await readJson('src/generated/tenants/app2/pages.json');
const app1Manifest = await readJson('src/generated/tenants/app1/manifest.json');
const app2Manifest = await readJson('src/generated/tenants/app2/manifest.json');
const app1Routes = await readJson('src/generated/tenants/app1/route-config.json');
const app2Routes = await readJson('src/generated/tenants/app2/route-config.json');
const app1Modules = await readJson('src/generated/tenants/app1/module-registry.json');
const app2Modules = await readJson('src/generated/tenants/app2/module-registry.json');
const app1Runtime = await readJson('src/generated/tenants/app1/runtime-config.json');
const app2Runtime = await readJson('src/generated/tenants/app2/runtime-config.json');
const rootPages = await readJson('pages.json');
const rootManifest = await readJson('manifest.json');
const rootRuntime = await readJson('src/generated/runtime-config.json');

assert.deepEqual(app1Pages.pages.map((page) => page.path), ['pages/a/index', 'pages/b/index', 'pages/c/index']);
assert.deepEqual(app2Pages.pages.map((page) => page.path), ['pages/a/index', 'pages/b/index', 'pages/d/index']);
assert.equal(app1Pages.pages[0].style.navigationBarTitleText, 'App1 首页');
assert.equal(app2Pages.pages[0].style.navigationBarTitleText, 'App2 工作台');
assert.deepEqual(app1Pages.tabBar.list.map((tab) => tab.text), ['A', 'B', 'C']);
assert.deepEqual(app2Pages.tabBar.list.map((tab) => tab.text), ['A', 'B', 'D']);
assert.deepEqual(app1Modules.pageModules.b.map((module) => module.moduleId), ['a', 'b', 'c', 'd']);
assert.deepEqual(app2Modules.pageModules.b.map((module) => module.moduleId), ['a', 'd', 'c']);
assert.deepEqual(app1Runtime.layouts.b.moduleOrder, ['a', 'b', 'c', 'd']);
assert.deepEqual(app2Runtime.layouts.b.moduleOrder, ['a', 'd', 'c']);
assert.equal(app1Runtime.configHash, app1Pages._configHash);
assert.equal(app1Runtime.configHash, app1Manifest._configHash);
assert.equal(app1Runtime.configHash, app1Routes.configHash);
assert.equal(app1Runtime.configHash, app1Modules.configHash);
assert.equal(app2Runtime.configHash, app2Pages._configHash);
assert.equal(app2Runtime.configHash, app2Manifest._configHash);
assert.equal(app1Manifest['mp-weixin'].appid, 'wx-app1-placeholder');
assert.equal(app2Manifest['mp-weixin'].appid, 'wx-app2-placeholder');
assert.equal(rootPages._tenantId, 'app1');
assert.equal(rootManifest._tenantId, 'app1');
assert.equal(rootRuntime.tenantId, 'app1');

console.log('generated tenant config assertions passed');
