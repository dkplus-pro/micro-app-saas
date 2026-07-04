import type { PageModuleConfig } from '../../../../../../packages/schema/src/types.js';
import type { PageAModuleViewModel } from '../types/page-a.type.js';
import { pagesConfig } from '../../../generated/pages.config.js';
import { routeConfig } from '../../../generated/route.config.js';
import { PAGE_A_KEY } from '../consts/module.const.js';
import { toPageAModules } from '../utils/module-visible.util.js';

interface GeneratedPageConfig {
  key: string;
  modules?: readonly PageModuleConfig[];
}

interface UniNavigationApi {
  navigateTo(options: { url: string }): void;
}

declare const uni: UniNavigationApi | undefined;

export function usePageAController() {
  const generatedPages = pagesConfig as readonly GeneratedPageConfig[];
  const pageA = generatedPages.find((page) => page.key === PAGE_A_KEY);
  const modules = toPageAModules(pageA?.modules ?? [], routeConfig);

  function navigateModule(module: PageAModuleViewModel): string | undefined {
    if (!module.navigationUrl) return undefined;
    if (typeof uni !== 'undefined') {
      uni.navigateTo({ url: module.navigationUrl });
    }
    return module.navigationUrl;
  }

  return {
    modules,
    navigateModule
  };
}
