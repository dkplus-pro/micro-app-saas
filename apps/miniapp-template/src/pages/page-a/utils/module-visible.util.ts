import type { PageModuleConfig } from '../../../../../../packages/schema/src/types.js';
import type { PageAModuleViewModel } from '../types/page-a.type.js';
import type { GeneratedRouteConfig } from './module-navigation.util.js';
import { resolvePageAModuleNavigationUrl } from './module-navigation.util.js';

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
