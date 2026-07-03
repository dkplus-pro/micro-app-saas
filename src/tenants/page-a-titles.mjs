export const PAGE_A_TITLES = Object.freeze({
  app1: 'App1 首页',
  app2: 'App2 工作台',
});

export function pageATitleForTenant(tenantId) {
  const title = PAGE_A_TITLES[tenantId];
  if (!title) {
    throw new Error(`Unknown tenant for page A title: ${tenantId}`);
  }
  return title;
}
