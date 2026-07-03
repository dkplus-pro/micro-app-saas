import runtimeConfig from '../generated/tenant.js';

export function getRuntimeConfig() {
  return runtimeConfig;
}

export function getTenantId() {
  return runtimeConfig.tenantId;
}

export function getThemeToken(tokenName, fallback = '') {
  return runtimeConfig.theme?.[tokenName] ?? fallback;
}
