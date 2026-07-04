import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createArtifacts, generateTenant, loadTenantSchema } from '../packages/generator/src/generator.ts';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';

async function buildSummary(tenant: string) {
  const artifacts = await generateTenant({ tenant });
  const moduleEntry = await readFile(path.join(process.cwd(), 'apps/miniapp-template/src/generated/module-entry.ts'), 'utf8');
  return { artifacts, moduleEntry };
}

test('schemas validate strictly for app1 and app2', async () => {
  for (const tenant of ['app1', 'app2']) {
    const schema = await loadTenantSchema(tenant);
    const result = validateTenantSchema(schema);
    assert.deepEqual(result, { valid: true, errors: [] });
  }
});

test('app1 generation enables page-a module and subpackages while pruning module-e', async () => {
  const { artifacts, moduleEntry } = await buildSummary('app1');
  assert.equal(artifacts.tenantId, 'app1');
  assert.deepEqual(artifacts.pageRoutes, ['pages/page-a/index', 'pages/page-b/index', 'pages/page-c/index', 'pages/page-d/index']);
  assert.deepEqual(artifacts.usedModules, ['module-a', 'module-b', 'module-c', 'module-d']);
  assert.match(JSON.stringify(artifacts.pagesConfig), /App1 首页/);
  assert.deepEqual(artifacts.pagesConfig.find((page) => page.key === 'page-a')?.modules?.map((module) => module.key), ['module-a']);
  assert.match(JSON.stringify(artifacts.pagesConfig), /pages\/page-d\/index/);
  assert.deepEqual((artifacts.uniPagesJson as { pages: Array<{ path: string }> }).pages.map((page) => page.path), ['pages/page-a/index']);
  assert.deepEqual(artifacts.subPackagesConfig.map((subPackage) => subPackage.root), ['pages/page-b', 'pages/page-c', 'pages/page-d']);
  assert.match(moduleEntry, /module-a/);
  assert.match(moduleEntry, /module-b/);
  assert.match(moduleEntry, /module-c/);
  assert.match(moduleEntry, /module-d/);
  assert.doesNotMatch(moduleEntry, /module-e/);
});

test('app2 generation prunes page-c, module-b, and module-e while preserving module order', async () => {
  const { artifacts, moduleEntry } = await buildSummary('app2');
  assert.equal(artifacts.tenantId, 'app2');
  assert.deepEqual(artifacts.pageRoutes, ['pages/page-a/index', 'pages/page-b/index', 'pages/page-d/index']);
  assert.deepEqual(artifacts.usedModules, ['module-a', 'module-d', 'module-c']);
  assert.deepEqual(artifacts.pagesConfig.find((page) => page.key === 'page-a')?.modules, []);
  assert.deepEqual((artifacts.uniPagesJson as { pages: Array<{ path: string }> }).pages.map((page) => page.path), ['pages/page-a/index']);
  assert.deepEqual(artifacts.subPackagesConfig.map((subPackage) => subPackage.root), ['pages/page-b', 'pages/page-d']);
  assert.match(JSON.stringify(artifacts.pagesConfig), /App2 首页/);
  assert.doesNotMatch(JSON.stringify(artifacts.pagesConfig), /pages\/page-c\/index/);
  assert.match(moduleEntry, /module-a/);
  assert.match(moduleEntry, /module-d/);
  assert.match(moduleEntry, /module-c/);
  assert.doesNotMatch(moduleEntry, /module-b/);
  assert.doesNotMatch(moduleEntry, /module-e/);
});

test('validator rejects tabs pointing at disabled pages and unknown modules', async () => {
  const schema = await loadTenantSchema('app1');
  const badSchema = structuredClone(schema);
  badSchema.tabs = [{ key: 'D', text: 'D', page: 'page-d' }];
  badSchema.pages['page-b'].modules = [{ key: 'module-x' as never }];
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
