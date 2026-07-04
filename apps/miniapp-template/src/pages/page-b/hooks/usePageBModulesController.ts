import { computed } from 'vue';
import { getGeneratedModuleRegistry, getGeneratedPage } from '../../../adapters/generated-config';
import { PAGE_B_KEY } from '../consts';
import { isGeneratedModuleAvailable, preserveSchemaModuleOrder } from '../utils';
import type { PageBModuleViewModel } from '../types';

export function usePageBModulesController() {
  const moduleRegistry = getGeneratedModuleRegistry();

  const modules = computed<PageBModuleViewModel[]>(() => {
    const pageConfig = getGeneratedPage(PAGE_B_KEY);
    const schemaModules = preserveSchemaModuleOrder(pageConfig?.modules || []);

    return schemaModules
      .filter((moduleConfig) => isGeneratedModuleAvailable(moduleConfig, moduleRegistry))
      .map((moduleConfig, index) => ({
        ...moduleConfig,
        component: moduleRegistry[moduleConfig.key],
        order: index + 1
      }));
  });

  return {
    modules
  };
}
