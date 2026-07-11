import type { PageModuleConfig } from '../../../../../../packages/schema/src/types.js';
import type { PageAModuleViewModel } from '../types/page-a.type.ts';
import type { GeneratedRouteConfig } from './module-navigation.util.ts';
import { resolvePageAModuleNavigationUrl } from './module-navigation.util.ts';

export function toPageAModules(
  modules: readonly PageModuleConfig[] = [],
  routeConfig: GeneratedRouteConfig = {}
): PageAModuleViewModel[] {
  return modules.map((module, index) => ({
    key: module.key,
    displayName: String(module.props?.title ?? module.key),
    props: module.props ?? {},
    order: index,
    navigationUrl: resolvePageAModuleNavigationUrl(module.key, routeConfig)
  }));
}
