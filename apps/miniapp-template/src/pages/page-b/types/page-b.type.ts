import type { GeneratedModuleConfig } from '../../../types/generated-contract';

export interface PageBModuleViewModel extends GeneratedModuleConfig {
  component: unknown;
  order: number;
}

export interface PageBViewModel {
  title: string;
  modules: PageBModuleViewModel[];
}
