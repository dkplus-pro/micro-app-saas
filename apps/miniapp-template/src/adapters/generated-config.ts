import type {
  GeneratedModuleRegistry,
  GeneratedPageConfig,
  RuntimeConfig,
  TabBarItemConfig
} from '../types/generated-contract.ts';

import { pagesConfig } from '../generated/pages.config.ts';
import { tabbarConfig } from '../generated/tabbar.config.ts';
import { runtimeConfig } from '../generated/runtime.config.ts';
import { moduleEntries } from '../generated/module-entry.ts';

type RawGeneratedPage = (typeof pagesConfig)[number];

function normalizePage(page: RawGeneratedPage): GeneratedPageConfig {
  return {
    key: page.key,
    route: page.path,
    title: page.style.navigationBarTitleText,
    enabled: true,
    layout: page.layout,
    modules: [...(page.modules ?? [])]
  };
}

export function getGeneratedPages(): readonly GeneratedPageConfig[] {
  return pagesConfig.map((page) => normalizePage(page));
}

export function getGeneratedPage(routeOrKey: string): GeneratedPageConfig | undefined {
  return getGeneratedPages().find((page) => page.key === routeOrKey || page.route === routeOrKey);
}

export function getGeneratedTabBar(): readonly TabBarItemConfig[] {
  return tabbarConfig.list;
}

export function getGeneratedRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

export function getGeneratedModuleRegistry(): GeneratedModuleRegistry {
  return moduleEntries;
}
