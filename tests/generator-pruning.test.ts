import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTenant } from '../packages/generator/src/generateTenant.ts';

async function generateToTemp(tenant: string) {
  const dir = await mkdtemp(join(tmpdir(), `tenant-${tenant}-`));
  const config = await generateTenant({ tenant, outputDir: dir });
  const moduleEntry = await readFile(join(dir, 'module-entry.ts'), 'utf8');
  await rm(dir, { recursive: true, force: true });
  return { config, moduleEntry };
}

describe('tenant generator compile-time pruning', () => {
  it('generates App1 pages A/B/C and modules A/B/C/D only', async () => {
    const { config, moduleEntry } = await generateToTemp('app1');

    expect(config.pages.map((page) => page.key)).toEqual(['page-a', 'page-b', 'page-c', 'page-d']);
    expect(config.tabs.map((tab) => tab.page)).toEqual(['page-a', 'page-b', 'page-c']);
    expect(config.pages.find((page) => page.key === 'page-a')?.title).toBe('App1 首页');
    expect(config.pages.find((page) => page.key === 'page-a')?.modules?.map((module) => module.key)).toEqual(['module-a']);
    expect(config.pages.find((page) => page.key === 'page-b')?.modules?.map((module) => module.key)).toEqual([
      'module-a',
      'module-b',
      'module-c',
      'module-d'
    ]);
    expect(config.modules).toEqual(['module-a', 'module-b', 'module-c', 'module-d']);
    expect(moduleEntry).not.toContain("../modules/module-e");
    expect(moduleEntry).not.toContain("'module-e':");
    expect(config.pages.map((page) => page.key)).toContain('page-d');
  });

  it('generates App2 pages A/B/D and modules A/D/C only', async () => {
    const { config, moduleEntry } = await generateToTemp('app2');

    expect(config.pages.map((page) => page.key)).toEqual(['page-a', 'page-b', 'page-d']);
    expect(config.tabs.map((tab) => tab.page)).toEqual(['page-a', 'page-b', 'page-d']);
    expect(config.pages.find((page) => page.key === 'page-a')?.title).toBe('App2 首页');
    expect(config.pages.find((page) => page.key === 'page-a')?.modules).toEqual([]);
    expect(config.pages.find((page) => page.key === 'page-b')?.modules?.map((module) => module.key)).toEqual([
      'module-a',
      'module-d',
      'module-c'
    ]);
    expect(config.modules).toEqual(['module-a', 'module-d', 'module-c']);
    expect(moduleEntry).not.toContain("../modules/module-b");
    expect(moduleEntry).not.toContain("../modules/module-e");
    expect(moduleEntry).not.toContain("'module-b':");
    expect(config.pages.map((page) => page.key)).not.toContain('page-c');
  });
});
