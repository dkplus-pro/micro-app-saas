import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, 'apps', 'miniapp-template', 'dist', 'tenants');

async function runScript(script, args) {
  return execFileAsync(process.execPath, [script, ...args], { cwd: repoRoot });
}

async function readBuild(tenant) {
  const text = await readFile(path.join(distRoot, tenant, 'build.generated.json'), 'utf8');
  return JSON.parse(text);
}

async function readModuleEntry(tenant) {
  return readFile(path.join(distRoot, tenant, 'module-entry.ts'), 'utf8');
}

test('app1/app2 generated pages, tabs, titles, and modules are tenant-pruned', async () => {
  await rm(path.join(repoRoot, 'apps', 'miniapp-template', 'dist'), { recursive: true, force: true });
  await runScript('scripts/build-tenant.ts', ['--tenant=app1']);
  await runScript('scripts/build-tenant.ts', ['--tenant=app2']);

  const app1 = await readBuild('app1');
  const app2 = await readBuild('app2');

  assert.deepEqual(app1.pages.map((page) => page.path), ['pages/page-a/index', 'pages/page-b/index', 'pages/page-c/index', 'pages/page-d/index']);
  assert.deepEqual(app2.pages.map((page) => page.path), ['pages/page-a/index', 'pages/page-b/index', 'pages/page-d/index']);
  assert.equal(app1.pages.find((page) => page.path === 'pages/page-a/index').style.navigationBarTitleText, 'App1 首页');
  assert.equal(app2.pages.find((page) => page.path === 'pages/page-a/index').style.navigationBarTitleText, 'App2 首页');
  assert.deepEqual(app1.tabBar.list.map((tab) => tab.text), ['A']);
  assert.deepEqual(app2.tabBar.list.map((tab) => tab.text), ['A']);
  assert.deepEqual(app1.modules.map((moduleEntry) => moduleEntry.key), ['module-a', 'module-b', 'module-c', 'module-d']);
  assert.deepEqual(app1.subPackages.map((subPackage) => subPackage.root), ['pages/page-b', 'pages/page-c', 'pages/page-d']);
  assert.deepEqual(app2.subPackages.map((subPackage) => subPackage.root), ['pages/page-b', 'pages/page-d']);
  assert.deepEqual(app2.modules.map((moduleEntry) => moduleEntry.key), ['module-a', 'module-d', 'module-c']);

  const app1Entry = await readModuleEntry('app1');
  const app2Entry = await readModuleEntry('app2');
  assert.match(app1Entry, /module-b/);
  assert.doesNotMatch(app1Entry, /module-e/);
  assert.match(JSON.stringify(app1), /pages\/page-d\/index/);
  assert.doesNotMatch(app2Entry, /module-b/);
  assert.doesNotMatch(app2Entry, /module-e/);
  assert.doesNotMatch(JSON.stringify(app2), /pages\/page-c\/index/);
});

test('invalid schema fails before build output is produced', async () => {
  const badTenant = 'invalid-module';
  const schemaDir = path.join(repoRoot, 'schemas', 'tenants');
  const badSchemaPath = path.join(schemaDir, `${badTenant}.schema.json`);
  await mkdir(schemaDir, { recursive: true });
  await writeFile(badSchemaPath, JSON.stringify({
    tenant: { tenantId: badTenant, tenantName: 'Bad Tenant' },
    app: { appKey: badTenant, appid: 'wx_bad', name: 'Bad 小程序' },
    tabs: [
      { key: 'A', text: 'A', page: 'page-a' },
      { key: 'B', text: 'B', page: 'page-b' }
    ],
    pages: {
      'page-a': { route: 'pages/page-a/index', title: 'Bad A', enabled: true },
      'page-b': {
        route: 'pages/page-b/index',
        title: 'Bad B',
        enabled: true,
        layout: 'stream',
        modules: [{ key: 'module-x' }]
      }
    }
  }, null, 2));

  await assert.rejects(
    runScript('scripts/build-tenant.ts', [`--tenant=${badTenant}`]),
    /unknown module module-x/
  );
  await rm(badSchemaPath, { force: true });
});
