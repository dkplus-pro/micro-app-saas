import { pagesConfig } from '../../../generated/pages.config.js';
import { moduleEntries } from '../../../generated/module-entry.js';
import { PAGE_B_KEY } from '../consts/module.const.js';
import { toVisibleModules } from '../utils/module-visible.util.js';
export function usePageBModulesController() {
    const generatedPages = pagesConfig;
    const pageB = generatedPages.find((page) => page.key === PAGE_B_KEY);
    const modules = toVisibleModules(pageB?.modules ?? []);
    return {
        modules,
        moduleEntries
    };
}
