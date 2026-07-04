import type { GeneratedModuleConfig } from '../../../types/generated-contract';

export function preserveSchemaModuleOrder(modules: readonly GeneratedModuleConfig[]): GeneratedModuleConfig[] {
  return [...modules];
}
