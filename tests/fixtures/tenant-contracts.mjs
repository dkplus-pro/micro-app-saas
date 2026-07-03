import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

export const PAGE_CATALOG = {
  a: { id: 'a', route: 'pages/a/index', type: 'standard' },
  b: { id: 'b', route: 'pages/b/index', type: 'flow' },
  c: { id: 'c', route: 'pages/c/index', type: 'standard' },
  d: { id: 'd', route: 'pages/d/index', type: 'standard' },
};

export const MODULE_CATALOG = {
  a: { id: 'a', component: 'src/modules/a/index.vue' },
  b: { id: 'b', component: 'src/modules/b/index.vue' },
  c: { id: 'c', component: 'src/modules/c/index.vue' },
  d: { id: 'd', component: 'src/modules/d/index.vue' },
  e: { id: 'e', component: 'src/modules/e/index.vue' },
};

export const TENANT_SCHEMAS = {
  app1: {
    id: 'app1',
    name: 'App1',
    displayName: 'App One',
    schemaVersion: '2026-07-03.1',
    platforms: {
      'mp-weixin': {
        appid: 'wx-app1-demo',
        versionName: '1.0.0-app1',
      },
    },
    theme: {
      primaryColor: '#1677ff',
      tabColor: '#6b7280',
      selectedColor: '#1677ff',
      backgroundColor: '#ffffff',
    },
    tabs: [
      { id: 'tab-a', label: 'A', pageId: 'a', icon: '/static/app1/a.png', selectedIcon: '/static/app1/a-active.png', order: 1 },
      { id: 'tab-b', label: 'B', pageId: 'b', icon: '/static/app1/b.png', selectedIcon: '/static/app1/b-active.png', order: 2 },
      { id: 'tab-c', label: 'C', pageId: 'c', icon: '/static/app1/c.png', selectedIcon: '/static/app1/c-active.png', order: 3 },
    ],
    pages: [
      { pageId: 'a', title: 'App1 Page A', isTab: true },
      { pageId: 'b', title: 'App1 Flow B', isTab: true },
      { pageId: 'c', title: 'App1 Page C', isTab: true },
    ],
    layouts: {
      b: [
        { moduleId: 'a', order: 1, props: { title: 'Module A' } },
        { moduleId: 'b', order: 2, props: { title: 'Module B' } },
        { moduleId: 'c', order: 3, props: { title: 'Module C' } },
        { moduleId: 'd', order: 4, props: { title: 'Module D' } },
      ],
    },
  },
  app2: {
    id: 'app2',
    name: 'App2',
    displayName: 'App Two',
    schemaVersion: '2026-07-03.1',
    platforms: {
      'mp-weixin': {
        appid: 'wx-app2-demo',
        versionName: '1.0.0-app2',
      },
    },
    theme: {
      primaryColor: '#10b981',
      tabColor: '#64748b',
      selectedColor: '#10b981',
      backgroundColor: '#f8fafc',
    },
    tabs: [
      { id: 'tab-a', label: 'A', pageId: 'a', icon: '/static/app2/a.png', selectedIcon: '/static/app2/a-active.png', order: 1 },
      { id: 'tab-b', label: 'B', pageId: 'b', icon: '/static/app2/b.png', selectedIcon: '/static/app2/b-active.png', order: 2 },
      { id: 'tab-d', label: 'D', pageId: 'd', icon: '/static/app2/d.png', selectedIcon: '/static/app2/d-active.png', order: 3 },
    ],
    pages: [
      { pageId: 'a', title: 'App2 Page A', isTab: true },
      { pageId: 'b', title: 'App2 Flow B', isTab: true },
      { pageId: 'd', title: 'App2 Page D', isTab: true },
    ],
    layouts: {
      b: [
        { moduleId: 'a', order: 1, props: { title: 'Module A' } },
        { moduleId: 'd', order: 2, props: { title: 'Module D' } },
        { moduleId: 'c', order: 3, props: { title: 'Module C' } },
      ],
    },
  },
};

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function configHashFor(schema) {
  return createHash('sha256').update(stableStringify(schema)).digest('hex');
}

export function generateExpectedTenantOutput(schema) {
  const pagesById = new Map(schema.pages.map((page) => [page.pageId, page]));
  const sortedTabs = [...schema.tabs].sort((left, right) => left.order - right.order);
  const sortedLayouts = Object.fromEntries(
    Object.entries(schema.layouts).map(([pageId, modules]) => [
      pageId,
      [...modules].sort((left, right) => left.order - right.order),
    ]),
  );
  const usedModuleIds = [...new Set(Object.values(sortedLayouts).flat().map((module) => module.moduleId))];
  const configHash = configHashFor(schema);

  return {
    pagesJson: {
      pages: schema.pages.map((page) => ({
        path: PAGE_CATALOG[page.pageId].route,
        style: {
          navigationBarTitleText: page.title,
        },
      })),
      tabBar: {
        color: schema.theme.tabColor,
        selectedColor: schema.theme.selectedColor,
        backgroundColor: schema.theme.backgroundColor,
        list: sortedTabs.map((tab) => ({
          pagePath: PAGE_CATALOG[tab.pageId].route,
          text: tab.label,
          iconPath: tab.icon,
          selectedIconPath: tab.selectedIcon,
        })),
      },
    },
    manifestJson: {
      name: schema.name,
      appid: schema.id,
      versionName: schema.platforms['mp-weixin'].versionName,
      'mp-weixin': {
        appid: schema.platforms['mp-weixin'].appid,
      },
    },
    moduleRegistry: Object.fromEntries(
      usedModuleIds.map((moduleId) => [moduleId, MODULE_CATALOG[moduleId]]),
    ),
    runtimeConfig: {
      tenantId: schema.id,
      schemaVersion: schema.schemaVersion,
      configHash,
      displayName: schema.displayName,
      theme: schema.theme,
      tabs: sortedTabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        pageId: tab.pageId,
        route: PAGE_CATALOG[tab.pageId].route,
      })),
      pages: schema.pages.map((page) => ({
        pageId: page.pageId,
        route: PAGE_CATALOG[page.pageId].route,
        type: PAGE_CATALOG[page.pageId].type,
        title: page.title,
        isTab: page.isTab,
      })),
      layouts: sortedLayouts,
    },
  };
}

const CANDIDATE_OUTPUTS = {
  pagesJson: (tenantId) => [
    `src/generated/${tenantId}/pages.json`,
    `generated/${tenantId}/pages.json`,
    `dist/generated/${tenantId}/pages.json`,
    `pages.${tenantId}.json`,
  ],
  manifestJson: (tenantId) => [
    `src/generated/${tenantId}/manifest.json`,
    `generated/${tenantId}/manifest.json`,
    `dist/generated/${tenantId}/manifest.json`,
    `manifest.${tenantId}.json`,
  ],
  moduleRegistry: (tenantId) => [
    `src/generated/${tenantId}/module-registry.json`,
    `generated/${tenantId}/module-registry.json`,
    `dist/generated/${tenantId}/module-registry.json`,
  ],
  runtimeConfig: (tenantId) => [
    `src/generated/${tenantId}/runtime-config.json`,
    `generated/${tenantId}/runtime-config.json`,
    `dist/generated/${tenantId}/runtime-config.json`,
  ],
};

async function readFirstJson(candidates) {
  for (const candidate of candidates) {
    const absolutePath = path.resolve(candidate);
    try {
      await access(absolutePath);
      return JSON.parse(await readFile(absolutePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return undefined;
}

export async function loadTenantContractOutput(tenantId) {
  const schema = TENANT_SCHEMAS[tenantId];
  const expected = generateExpectedTenantOutput(schema);

  return {
    schema,
    expected,
    pagesJson: (await readFirstJson(CANDIDATE_OUTPUTS.pagesJson(tenantId))) ?? expected.pagesJson,
    manifestJson: (await readFirstJson(CANDIDATE_OUTPUTS.manifestJson(tenantId))) ?? expected.manifestJson,
    moduleRegistry: (await readFirstJson(CANDIDATE_OUTPUTS.moduleRegistry(tenantId))) ?? expected.moduleRegistry,
    runtimeConfig: (await readFirstJson(CANDIDATE_OUTPUTS.runtimeConfig(tenantId))) ?? expected.runtimeConfig,
  };
}
