import { usePageBModulesController } from './usePageBModulesController.js';

export function usePageBController() {
  const modules = usePageBModulesController();
  return {
    modules
  };
}
