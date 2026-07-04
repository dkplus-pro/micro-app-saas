import type { GeneratedModuleEntry } from "../../../../../../packages/schema/src/index.ts";

export function toVisibleModules(modules: readonly PageModuleConfig[] = []): PageBModuleViewModel[] {
  return modules.map((module) => ({ key: module.key, props: module.props ?? {} }));
}
