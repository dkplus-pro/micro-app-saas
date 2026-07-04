import type { ModuleKey } from '../../../../../../packages/schema/src/types.js';
import type { ModuleAdapter } from '../../../modules/types.js';

export function resolvePageModules(
  moduleConfigs: readonly { readonly key: ModuleKey }[],
  registry: Partial<Record<ModuleKey, ModuleAdapter>>
): ModuleAdapter[] {
  return moduleConfigs.flatMap((moduleConfig) => {
    const adapter = registry[moduleConfig.key];
    return adapter ? [adapter] : [];
  });
}
