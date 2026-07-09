export type MiniappModuleKey = 'module-a' | 'module-b' | 'module-c' | 'module-d' | 'module-e';

export interface ModuleRegistryEntry {
  key: MiniappModuleKey;
  componentPath: `@/biz/modules/${MiniappModuleKey}/index.vue`;
  entryPath: `@/biz/modules/${MiniappModuleKey}/index.ts`;
  layer: 'biz';
}

function moduleEntry(key: MiniappModuleKey): ModuleRegistryEntry {
  return {
    key,
    componentPath: `@/biz/modules/${key}/index.vue`,
    entryPath: `@/biz/modules/${key}/index.ts`,
    layer: 'biz'
  };
}

export const moduleRegistry = {
  'module-a': moduleEntry('module-a'),
  'module-b': moduleEntry('module-b'),
  'module-c': moduleEntry('module-c'),
  'module-d': moduleEntry('module-d'),
  'module-e': moduleEntry('module-e')
} as const satisfies Record<MiniappModuleKey, ModuleRegistryEntry>;

export const moduleKeys = Object.keys(moduleRegistry) as MiniappModuleKey[];
