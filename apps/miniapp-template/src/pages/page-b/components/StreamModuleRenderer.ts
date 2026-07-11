import type { PageBModuleViewModel } from '../types/page-b.type.js';

export function resolveStreamModuleLabels(modules: readonly PageBModuleViewModel[]): string[] {
  return modules.map((module) => module.key);
}
