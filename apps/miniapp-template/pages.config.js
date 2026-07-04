import { pagesConfig } from './src/generated/pages.config.js';
import { subPackagesConfig } from './src/generated/subpackages.config.js';
import { tabbarConfig } from './src/generated/tabbar.config.js';

export default {
  pages: pagesConfig.filter((page) => page.package === 'main').map((page) => ({ path: page.path, style: page.style })),
  subPackages: subPackagesConfig,
  tabBar: tabbarConfig
};
