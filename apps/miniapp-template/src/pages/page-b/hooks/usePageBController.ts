import { tenantConfig } from '../../../generated/tenant.config.js';
import { runtimeConfig } from '../../../generated/runtime.config.js';
import { usePageBModulesController } from './usePageBModulesController.js';

export function usePageBController() {
  const moduleController = usePageBModulesController();
  return {
    tenant: tenantConfig,
    runtime: runtimeConfig,
    modules: moduleController.modules
  };
}
