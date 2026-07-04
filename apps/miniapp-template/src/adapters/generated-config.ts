import type {
  GeneratedModuleRegistry,
  GeneratedPageConfig,
  RuntimeConfig,
  TabBarItemConfig
} from '../types/generated-contract';

import { pagesConfig } from '../generated/pages.config';
import { tabbarConfig } from '../generated/tabbar.config';
import { runtimeConfig } from '../generated/runtime.config';
import { moduleRegistry } from '../generated/module-entry';

export function getGeneratedPages(): readonly GeneratedPageConfig[] {
  return pagesConfig;
}

export function getGeneratedPage(routeOrKey: string): GeneratedPageConfig | undefined {
  return pagesConfig.find((page) => page.key === routeOrKey || page.route === routeOrKey);
}

export function getGeneratedTabBar(): readonly TabBarItemConfig[] {
  return tabbarConfig;
}

export function getGeneratedRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

export function getGeneratedModuleRegistry(): GeneratedModuleRegistry {
  return moduleRegistry;
}
