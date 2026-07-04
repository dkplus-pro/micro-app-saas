import type { PageBModuleViewModel } from '../types';

export function usePageBTrackController() {
  function trackModuleExpose(module: PageBModuleViewModel) {
    // Hook point for analytics. Keep side effects outside generated module assembly.
    return {
      event: 'page_b_module_expose',
      moduleKey: module.key,
      order: module.order
    };
  }

  return {
    trackModuleExpose
  };
}
