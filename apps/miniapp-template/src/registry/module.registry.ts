export type MiniappModuleKey = 'module-a' | 'module-b' | 'module-c' | 'module-d' | 'module-e';

export interface ModuleRegistryEntry {
  key: MiniappModuleKey;
  componentPath: `@/modules/${MiniappModuleKey}/index.vue`;
  entryPath: `@/modules/${MiniappModuleKey}/index.ts`;
}

function moduleEntry(key: MiniappModuleKey): ModuleRegistryEntry {
  return {
    key,
    componentPath: `@/modules/${key}/index.vue`,
    entryPath: `@/modules/${key}/index.ts`
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
