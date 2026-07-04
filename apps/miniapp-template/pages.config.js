import { pagesConfig } from './src/generated/pages.config.js';
import { tabbarConfig } from './src/generated/tabbar.config.js';

export default {
  pages: pagesConfig.map((page) => ({ path: page.path, style: page.style })),
  tabBar: tabbarConfig
};
