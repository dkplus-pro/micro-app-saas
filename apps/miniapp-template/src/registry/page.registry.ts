export type MiniappPageKey = 'page-a' | 'page-b' | 'page-c' | 'page-d';

export interface PageRegistryEntry {
  key: MiniappPageKey;
  route: `pages/${string}/index`;
  componentPath: `@/biz/pages/${MiniappPageKey}/index.vue`;
  routeShimPath: `@/pages/${MiniappPageKey}/index.vue`;
  layer: 'biz';
}

function pageEntry(key: MiniappPageKey): PageRegistryEntry {
  return {
    key,
    route: `pages/${key}/index`,
    componentPath: `@/biz/pages/${key}/index.vue`,
    routeShimPath: `@/pages/${key}/index.vue`,
    layer: 'biz'
  };
}

export const pageRegistry = {
  'page-a': pageEntry('page-a'),
  'page-b': pageEntry('page-b'),
  'page-c': pageEntry('page-c'),
  'page-d': pageEntry('page-d')
} as const satisfies Record<MiniappPageKey, PageRegistryEntry>;

export const pageKeys = Object.keys(pageRegistry) as MiniappPageKey[];
