import { buildTenantArtifacts, loadInputs } from '../../scripts/lib/generator.mjs';

export async function loadTenantContractOutput(tenantId) {
  const artifacts = buildTenantArtifacts(await loadInputs(process.cwd(), tenantId));
  return {
    tenant: artifacts.tenant,
    pagesJson: artifacts.pagesJson,
    manifestJson: artifacts.manifestJson,
    routeConfig: artifacts.routeConfig,
    moduleRegistry: artifacts.moduleRegistry,
    runtimeConfig: artifacts.runtimeConfig,
    metadata: artifacts.metadata,
    configHash: artifacts.configHash
  };
}
