import type { PageModuleConfig } from '../../../../../../packages/schema/src/types.js';
import type { PageBModuleViewModel } from '../types/page-b.type.js';

export function toVisibleModules(modules: readonly PageModuleConfig[] = []): PageBModuleViewModel[] {
  return modules.map((module) => ({ key: module.key, props: module.props ?? {} }));
}
