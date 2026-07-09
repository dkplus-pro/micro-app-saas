import type { ModuleKey } from '../../../../../../../packages/schema/src/types.js';
import { MODULE_A_KEY, PAGE_D_KEY } from '../consts/module.const.ts';

export type GeneratedRouteConfig = Readonly<Record<string, string | undefined>>;

export function normalizeUniRoute(route: string | undefined): string | undefined {
  if (!route) return undefined;
  return route.startsWith('/') ? route : `/${route}`;
}

export function resolvePageAModuleNavigationUrl(
  moduleKey: ModuleKey | string,
  routeConfig: GeneratedRouteConfig,
  targetPageKey = PAGE_D_KEY
): string | undefined {
  if (moduleKey !== MODULE_A_KEY) return undefined;
  return normalizeUniRoute(routeConfig[targetPageKey]);
}
