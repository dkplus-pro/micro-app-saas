import type { PageModuleConfig } from '../../../../../../packages/schema/src/types.ts';
import type { PageBModuleViewModel } from '../types/page-b.type.ts';

export function toVisibleModules(modules: readonly PageModuleConfig[] = []): PageBModuleViewModel[] {
  return modules.map((module, index) => ({
    key: module.key,
    props: module.props ?? {},
    order: index
  }));
}
