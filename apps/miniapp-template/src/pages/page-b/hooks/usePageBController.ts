import { computed } from 'vue';
import { getGeneratedPage } from '../../../adapters/generated-config';
import { DEFAULT_PAGE_B_TITLE, PAGE_B_KEY } from '../consts';
import { usePageBModulesController } from './usePageBModulesController';
import { usePageBRuntimeController } from './usePageBRuntimeController';
import { usePageBTrackController } from './usePageBTrackController';

export function usePageBController() {
  const pageConfig = computed(() => getGeneratedPage(PAGE_B_KEY));
  const pageTitle = computed(() => pageConfig.value?.title || DEFAULT_PAGE_B_TITLE);
  const { modules } = usePageBModulesController();
  const { runtimeConfig, theme } = usePageBRuntimeController();
  const { trackModuleExpose } = usePageBTrackController();

  return {
    modules,
    pageConfig,
    pageTitle,
    runtimeConfig,
    theme,
    trackModuleExpose
  };
}
