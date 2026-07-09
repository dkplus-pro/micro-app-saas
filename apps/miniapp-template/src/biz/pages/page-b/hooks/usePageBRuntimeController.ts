import { computed } from 'vue';
import { getGeneratedRuntimeConfig } from '../../../../app-shell/generated-config.ts';

export function usePageBRuntimeController() {
  const runtimeConfig = getGeneratedRuntimeConfig();

  const theme = computed(() => runtimeConfig.theme || {});

  return {
    runtimeConfig,
    theme
  };
}
