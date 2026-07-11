import type { PageModuleConfig } from '../../../../../../packages/schema/src/types.js';
import { pagesConfig } from '../../../generated/pages.config.js';
import { PAGE_B_KEY } from '../consts/module.const.js';
import { toVisibleModules } from '../utils/module-visible.util.js';

interface GeneratedPageConfig {
  key: string;
  style: {
    navigationBarTitleText?: string;
  };
  modules?: readonly PageModuleConfig[];
}

export function usePageBModulesController() {
  const generatedPages = pagesConfig as readonly GeneratedPageConfig[];
  const pageB = generatedPages.find((page) => page.key === PAGE_B_KEY);
  const modules = toVisibleModules(pageB?.modules ?? []);
  return {
    title: pageB?.style.navigationBarTitleText ?? 'Page B',
    modules
  };
}
