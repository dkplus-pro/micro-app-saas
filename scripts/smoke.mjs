#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function assertTenantSnapshot({ tenantId, root, expectedPages, expectedTabs, expectedTitle, expectedModules, expectedAppid }) {
  const pages = await readJson(`${root}/pages.json`);
  const manifest = await readJson(`${root}/manifest.json`);
  const runtime = await readJson(`${root}/generated/runtime-config.json`);
  const metadata = await readJson(`${root}/generated/metadata.json`);

  assert.equal(runtime.tenantId, tenantId);
  assert.deepEqual(pages.pages.map((page) => page.path), expectedPages);
  assert.deepEqual(pages.tabBar.list.map((tab) => tab.text), expectedTabs);
  assert.equal(pages.pages[0].style.navigationBarTitleText, expectedTitle);
  assert.deepEqual(runtime.layouts.B.modules.map((module) => module.moduleId), expectedModules);
  assert.equal(manifest['mp-weixin'].appid, expectedAppid);
  assert.equal(metadata.configHash, runtime.configHash);
}

const rootPages = await readJson('pages.json');
const rootManifest = await readJson('manifest.json');
const rootRuntime = await readJson('src/generated/runtime-config.json');
const rootMetadata = await readJson('src/generated/metadata.json');
assert.equal(rootRuntime.tenantId, 'app1');
assert.deepEqual(rootPages.pages.map((page) => page.path), ['pages/a/index', 'pages/b/index', 'pages/c/index']);
assert.deepEqual(rootPages.tabBar.list.map((tab) => tab.text), ['A', 'B', 'C']);
assert.equal(rootPages.pages[0].style.navigationBarTitleText, 'App1 首页');
assert.deepEqual(rootRuntime.layouts.B.modules.map((module) => module.moduleId), ['a', 'b', 'c', 'd']);
assert.equal(rootManifest['mp-weixin'].appid, 'wx-app1-placeholder');
assert.equal(rootMetadata.configHash, rootRuntime.configHash);

await assertTenantSnapshot({
  tenantId: 'app1',
  root: 'dist/tenants/app1',
  expectedPages: ['pages/a/index', 'pages/b/index', 'pages/c/index'],
  expectedTabs: ['A', 'B', 'C'],
  expectedTitle: 'App1 首页',
  expectedModules: ['a', 'b', 'c', 'd'],
  expectedAppid: 'wx-app1-placeholder'
});

await assertTenantSnapshot({
  tenantId: 'app2',
  root: 'dist/tenants/app2',
  expectedPages: ['pages/a/index', 'pages/b/index', 'pages/d/index'],
  expectedTabs: ['A', 'B', 'D'],
  expectedTitle: 'App2 工作台',
  expectedModules: ['a', 'd', 'c'],
  expectedAppid: 'wx-app2-placeholder'
});

console.log('smoke: PASS (App1 root plus App1/App2 tenant snapshots verified)');
