import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createArtifacts, generateTenant, loadTenantSchema } from '../packages/generator/src/generator.ts';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';
import type { TenantPage, TenantSchema } from '../packages/schema/src/types.ts';

async function buildSummary(tenant: string) {
  const artifacts = await generateTenant({ tenant });
  const moduleEntry = await readFile(path.join(process.cwd(), 'apps/miniapp-template/src/generated/module-entry.ts'), 'utf8');
  const homeModuleRenderer = await readFile(path.join(process.cwd(), 'apps/miniapp-template/src/generated/home-module-renderer.vue'), 'utf8');
  const pageAAssets = await readFile(path.join(process.cwd(), 'apps/miniapp-template/src/generated/page-a-assets.ts'), 'utf8');
  const subPackageModuleEntry = await readFile(path.join(process.cwd(), 'apps/miniapp-template/src/generated/subpackage-module-entry.ts'), 'utf8');
  return { artifacts, moduleEntry, homeModuleRenderer, pageAAssets, subPackageModuleEntry };
}

test('schemas validate strictly for app1 and app2', async () => {
  for (const tenant of ['app1', 'app2']) {
    const schema = await loadTenantSchema(tenant);
    const result = validateTenantSchema(schema);
    assert.deepEqual(result, { valid: true, errors: [] });
  }
});

test('app1 generation enables page-a module and subpackages while pruning module-e', async () => {
  const { artifacts, moduleEntry, homeModuleRenderer, pageAAssets, subPackageModuleEntry } = await buildSummary('app1');
  const runtime = artifacts.runtimeConfig as { runtime: { assets: { pageAImage: { src: string } } } };
  assert.equal(artifacts.tenantId, 'app1');
  assert.deepEqual(artifacts.pageRoutes, ['pages/page-a/index', 'pages/page-b/index', 'pages/page-c/index', 'pages/page-d/index']);
  assert.deepEqual(artifacts.usedModules, ['module-a', 'module-b', 'module-c', 'module-d']);
  assert.deepEqual(artifacts.homeModules, ['module-a']);
  assert.deepEqual(artifacts.subPackageModules, ['module-b', 'module-c', 'module-d']);
  assert.equal(runtime.runtime.assets.pageAImage.src, 'assets/tenants/app1/page-a-demo.png');
  assert.match(pageAAssets, /assets\/tenants\/app1\/page-a-demo\.png/);
  assert.doesNotMatch(pageAAssets, /assets\/tenants\/app2\/page-a-demo\.png/);
  assert.match(JSON.stringify(artifacts.pagesConfig), /App1 首页/);
  assert.deepEqual(artifacts.pagesConfig.find((page) => page.key === 'page-a')?.modules?.map((module) => module.key), ['module-a']);
  assert.match(JSON.stringify(artifacts.pagesConfig), /pages\/page-d\/index/);
  assert.deepEqual((artifacts.uniPagesJson as { pages: Array<{ path: string }> }).pages.map((page) => page.path), ['pages/page-a/index', 'pages/page-b/index', 'pages/page-c/index']);
  assert.deepEqual((artifacts.uniPagesJson as { tabBar: { list: Array<{ text: string }> } }).tabBar.list.map((tab) => tab.text), ['A', 'B', 'C']);
  assert.deepEqual(artifacts.subPackagesConfig.map((subPackage) => subPackage.root), ['pages/page-d', 'pages/module-assets']);
  assert.match(moduleEntry, /module-a/);
  assert.doesNotMatch(moduleEntry, /module-b/);
  assert.doesNotMatch(moduleEntry, /module-c/);
  assert.doesNotMatch(moduleEntry, /module-d/);
  assert.match(homeModuleRenderer, /module-a/);
  assert.doesNotMatch(homeModuleRenderer, /module-b/);
  assert.doesNotMatch(homeModuleRenderer, /module-c/);
  assert.doesNotMatch(homeModuleRenderer, /module-d/);
  assert.match(subPackageModuleEntry, /module-b/);
  assert.match(subPackageModuleEntry, /module-c/);
  assert.match(subPackageModuleEntry, /module-d/);
  assert.doesNotMatch(subPackageModuleEntry, /\.\.\/modules/);
  assert.doesNotMatch(moduleEntry, /module-e/);
});

test('app2 generation prunes page-c, module-b, and module-e while preserving module order', async () => {
  const { artifacts, moduleEntry, homeModuleRenderer, pageAAssets, subPackageModuleEntry } = await buildSummary('app2');
  const runtime = artifacts.runtimeConfig as { runtime: { assets: { pageAImage: { src: string } } } };
  assert.equal(artifacts.tenantId, 'app2');
  assert.deepEqual(artifacts.pageRoutes, ['pages/page-a/index', 'pages/page-b/index', 'pages/page-d/index']);
  assert.deepEqual(artifacts.usedModules, ['module-a', 'module-d', 'module-c']);
  assert.deepEqual(artifacts.homeModules, []);
  assert.deepEqual(artifacts.subPackageModules, ['module-a', 'module-d', 'module-c']);
  assert.equal(runtime.runtime.assets.pageAImage.src, 'assets/tenants/app2/page-a-demo.png');
  assert.match(pageAAssets, /assets\/tenants\/app2\/page-a-demo\.png/);
  assert.doesNotMatch(pageAAssets, /assets\/tenants\/app1\/page-a-demo\.png/);
  assert.deepEqual(artifacts.pagesConfig.find((page) => page.key === 'page-a')?.modules, []);
  assert.deepEqual((artifacts.uniPagesJson as { pages: Array<{ path: string }> }).pages.map((page) => page.path), ['pages/page-a/index', 'pages/page-b/index', 'pages/page-d/index']);
  assert.deepEqual((artifacts.uniPagesJson as { tabBar: { list: Array<{ text: string }> } }).tabBar.list.map((tab) => tab.text), ['A', 'B', 'D']);
  assert.deepEqual(artifacts.subPackagesConfig.map((subPackage) => subPackage.root), ['pages/module-assets']);
  assert.match(JSON.stringify(artifacts.pagesConfig), /App2 首页/);
  assert.doesNotMatch(JSON.stringify(artifacts.pagesConfig), /pages\/page-c\/index/);
  assert.doesNotMatch(moduleEntry, /module-a/);
  assert.doesNotMatch(moduleEntry, /module-d/);
  assert.doesNotMatch(moduleEntry, /module-c/);
  assert.doesNotMatch(homeModuleRenderer, /module-a/);
  assert.doesNotMatch(homeModuleRenderer, /module-d/);
  assert.doesNotMatch(homeModuleRenderer, /module-c/);
  assert.match(subPackageModuleEntry, /module-a/);
  assert.match(subPackageModuleEntry, /module-d/);
  assert.match(subPackageModuleEntry, /module-c/);
  assert.doesNotMatch(subPackageModuleEntry, /\.\.\/modules/);
  assert.doesNotMatch(moduleEntry, /module-b/);
  assert.doesNotMatch(moduleEntry, /module-e/);
});

test('validator rejects tabs pointing at disabled pages and unknown modules', async () => {
  const schema = await loadTenantSchema('app1');
  const badSchema = structuredClone(schema);
  badSchema.tabs = [{ key: 'D', text: 'D', page: 'page-d' }];
  pageByKey(badSchema, 'page-b').modules = [{ key: 'module-x' as never }];
  const result = validateTenantSchema(badSchema);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('subPackage page')));
  assert.ok(result.errors.some((error) => error.includes('unknown module')));
});

test('artifact creation is pure and does not require loading all tenants', async () => {
  const schema = await loadTenantSchema('app2');
  const artifacts = createArtifacts(schema);
  assert.deepEqual(artifacts.routeConfig, {
    'page-a': 'pages/page-a/index',
    'page-b': 'pages/page-b/index',
    'page-d': 'pages/page-d/index'
  });
});


function pageByKey(schema: TenantSchema, key: string): TenantPage {
  const page = Array.isArray(schema.pages) ? schema.pages.find((entry) => entry.key === key) : schema.pages[key as keyof typeof schema.pages];
  if (!page) throw new Error(`Missing test page ${key}`);
  return page;
}
