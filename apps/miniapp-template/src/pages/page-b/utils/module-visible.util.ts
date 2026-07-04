import type { GeneratedModuleConfig, GeneratedModuleRegistry } from '../../../types/generated-contract';

export function isGeneratedModuleAvailable(
  moduleConfig: GeneratedModuleConfig,
  registry: GeneratedModuleRegistry
): boolean {
  return Boolean(moduleConfig.key && registry[moduleConfig.key]);
}
