import { tenantConfig } from '../generated/tenant.config.js';
import { runtimeConfig } from '../generated/runtime.config.js';

export function useTenantSnapshot() {
  return {
    tenant: tenantConfig,
    runtime: runtimeConfig
  };
}
