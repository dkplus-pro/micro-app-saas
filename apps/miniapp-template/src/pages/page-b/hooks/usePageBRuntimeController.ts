import { computed } from 'vue';
import { getGeneratedRuntimeConfig } from '../../../adapters/generated-config.ts';

export function usePageBRuntimeController() {
  const runtimeConfig = getGeneratedRuntimeConfig();

  const theme = computed(() => runtimeConfig.theme || {});

  return {
    runtimeConfig,
    theme
  };
}
