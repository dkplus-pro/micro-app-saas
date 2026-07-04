import type { GeneratedModuleEntry } from "../../../../../packages/schema/src/index.ts";

export function toDisplayModules<T extends Pick<GeneratedModuleEntry, "key" | "displayName" | "props">>(modules: readonly T[]): readonly T[] {
  return modules.filter((moduleRef) => Boolean(moduleRef.key));
}
