import type { GeneratedModuleEntry } from "../../../../../../../packages/schema/src/index.ts";

export function sortModulesBySchemaOrder<T extends Pick<GeneratedModuleEntry, "key">>(modules: readonly T[], order: readonly string[]): T[] {
  return [...modules].sort((left, right) => order.indexOf(left.key) - order.indexOf(right.key));
}
