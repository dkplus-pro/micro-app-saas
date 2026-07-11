export type MiniappPageKey = 'page-a' | 'page-b' | 'page-c' | 'page-d';

export interface PageRegistryEntry {
  key: MiniappPageKey;
  route: `pages/${string}/index`;
  entryPath: `@/pages/${MiniappPageKey}/index.vue`;
}

function pageEntry(key: MiniappPageKey): PageRegistryEntry {
  return {
    key,
    route: `pages/${key}/index`,
    entryPath: `@/pages/${key}/index.vue`
  };
}

export const pageRegistry = {
  'page-a': pageEntry('page-a'),
  'page-b': pageEntry('page-b'),
  'page-c': pageEntry('page-c'),
  'page-d': pageEntry('page-d')
} as const satisfies Record<MiniappPageKey, PageRegistryEntry>;

export const pageKeys = Object.keys(pageRegistry) as MiniappPageKey[];
