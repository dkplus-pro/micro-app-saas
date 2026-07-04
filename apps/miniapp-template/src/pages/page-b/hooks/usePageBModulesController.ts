import { pagesConfig } from '../../../generated/pages.config.js';
import { moduleRegistry } from '../../../generated/module-entry.js';
import { PAGE_B_KEY } from '../consts/index.js';
import { resolvePageModules } from '../utils/index.js';

export function usePageBModulesController() {
  const pageB = pagesConfig.find((page) => page.key === PAGE_B_KEY);
  return resolvePageModules(pageB?.modules ?? [], moduleRegistry);
}
