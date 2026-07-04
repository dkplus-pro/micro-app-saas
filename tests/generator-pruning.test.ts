import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTenant } from '../packages/generator/src/generateTenant.ts';

async function generateToTemp(tenant: string) {
  const dir = await mkdtemp(join(tmpdir(), `tenant-${tenant}-`));
  const config = await generateTenant({ tenant, outputDir: dir });
  const moduleEntry = await readFile(join(dir, 'module-entry.ts'), 'utf8');
  const homeModuleRenderer = await readFile(join(dir, 'home-module-renderer.vue'), 'utf8');
  const pageAAssets = await readFile(join(dir, 'page-a-assets.ts'), 'utf8');
  const subPackageModuleEntry = await readFile(join(dir, 'subpackage-module-entry.ts'), 'utf8');
  await rm(dir, { recursive: true, force: true });
  return { config, moduleEntry, homeModuleRenderer, pageAAssets, subPackageModuleEntry };
}

describe('tenant generator compile-time pruning', () => {
  it('generates App1 pages A/B/C and modules A/B/C/D only', async () => {
    const { config, moduleEntry, homeModuleRenderer, pageAAssets, subPackageModuleEntry } = await generateToTemp('app1');

    expect(config.pagesConfig.map((page) => page.key)).toEqual(['page-a', 'page-b', 'page-c', 'page-d']);
    expect((config.tabbarConfig as { list: Array<{ pagePath: string }> }).list.map((tab) => tab.pagePath)).toEqual(['pages/page-a/index', 'pages/page-b/index', 'pages/page-c/index']);
    expect(config.pagesConfig.find((page) => page.key === 'page-a')?.style.navigationBarTitleText).toBe('App1 首页');
    expect(config.pagesConfig.find((page) => page.key === 'page-a')?.modules?.map((module) => module.key)).toEqual(['module-a']);
    expect(config.pagesConfig.find((page) => page.key === 'page-b')?.modules?.map((module) => module.key)).toEqual([
      'module-a',
      'module-b',
      'module-c',
      'module-d'
    ]);
    expect(config.subPackagesConfig.map((subPackage) => subPackage.root)).toEqual(['pages/page-d', 'pages/module-assets']);
    expect(config.usedModules).toEqual(['module-a', 'module-b', 'module-c', 'module-d']);
    expect(config.homeModules).toEqual(['module-a']);
    expect(config.subPackageModules).toEqual(['module-b', 'module-c', 'module-d']);
    expect((config.runtimeConfig as { runtime: { assets: { pageAImage: { src: string } } } }).runtime.assets.pageAImage.src).toBe('assets/tenants/app1/page-a-demo.png');
    expect(pageAAssets).toContain("assets/tenants/app1/page-a-demo.png");
    expect(pageAAssets).not.toContain("assets/tenants/app2/page-a-demo.png");
    expect(moduleEntry).toContain("../modules/module-a");
    expect(moduleEntry).not.toContain("../modules/module-b");
    expect(moduleEntry).not.toContain("../modules/module-c");
    expect(moduleEntry).not.toContain("../modules/module-d");
    expect(homeModuleRenderer).toContain("../modules/module-a/index.vue");
    expect(homeModuleRenderer).not.toContain("../modules/module-b");
    expect(homeModuleRenderer).not.toContain("../modules/module-c");
    expect(homeModuleRenderer).not.toContain("../modules/module-d");
    expect(subPackageModuleEntry).toContain("'module-b':");
    expect(subPackageModuleEntry).toContain("'module-c':");
    expect(subPackageModuleEntry).toContain("'module-d':");
    expect(subPackageModuleEntry).not.toContain("../modules/");
    expect(moduleEntry).not.toContain("../modules/module-e");
    expect(moduleEntry).not.toContain("'module-e':");
    expect(config.pagesConfig.map((page) => page.key)).toContain('page-d');
  });

  it('generates App2 pages A/B/D and modules A/D/C only', async () => {
    const { config, moduleEntry, homeModuleRenderer, pageAAssets, subPackageModuleEntry } = await generateToTemp('app2');

    expect(config.pagesConfig.map((page) => page.key)).toEqual(['page-a', 'page-b', 'page-d']);
    expect((config.tabbarConfig as { list: Array<{ pagePath: string }> }).list.map((tab) => tab.pagePath)).toEqual(['pages/page-a/index', 'pages/page-b/index', 'pages/page-d/index']);
    expect(config.pagesConfig.find((page) => page.key === 'page-a')?.style.navigationBarTitleText).toBe('App2 首页');
    expect(config.pagesConfig.find((page) => page.key === 'page-a')?.modules).toEqual([]);
    expect(config.pagesConfig.find((page) => page.key === 'page-b')?.modules?.map((module) => module.key)).toEqual([
      'module-a',
      'module-d',
      'module-c'
    ]);
    expect(config.subPackagesConfig.map((subPackage) => subPackage.root)).toEqual(['pages/module-assets']);
    expect(config.usedModules).toEqual(['module-a', 'module-d', 'module-c']);
    expect(config.homeModules).toEqual([]);
    expect(config.subPackageModules).toEqual(['module-a', 'module-d', 'module-c']);
    expect((config.runtimeConfig as { runtime: { assets: { pageAImage: { src: string } } } }).runtime.assets.pageAImage.src).toBe('assets/tenants/app2/page-a-demo.png');
    expect(pageAAssets).toContain("assets/tenants/app2/page-a-demo.png");
    expect(pageAAssets).not.toContain("assets/tenants/app1/page-a-demo.png");
    expect(moduleEntry).not.toContain("../modules/module-a");
    expect(moduleEntry).not.toContain("../modules/module-d");
    expect(moduleEntry).not.toContain("../modules/module-c");
    expect(homeModuleRenderer).not.toContain("../modules/module-a");
    expect(homeModuleRenderer).not.toContain("../modules/module-d");
    expect(homeModuleRenderer).not.toContain("../modules/module-c");
    expect(subPackageModuleEntry).toContain("'module-a':");
    expect(subPackageModuleEntry).toContain("'module-d':");
    expect(subPackageModuleEntry).toContain("'module-c':");
    expect(subPackageModuleEntry).not.toContain("../modules/");
    expect(moduleEntry).not.toContain("../modules/module-b");
    expect(moduleEntry).not.toContain("../modules/module-e");
    expect(moduleEntry).not.toContain("'module-b':");
    expect(config.pagesConfig.map((page) => page.key)).not.toContain('page-c');
  });
});
