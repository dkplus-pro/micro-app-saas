const { loadGeneratedConfig } = require('./manifest.config.js');

function createPagesConfig(
  pagesConfig = loadGeneratedConfig('pages.config', 'pagesConfig'),
  tabbarConfig = loadGeneratedConfig('tabbar.config', 'tabbarConfig')
) {
  return {
    pages: pagesConfig.map((page) => ({
      path: page.route,
      style: {
        navigationBarTitleText: page.title
      }
    })),
    tabBar: {
      list: tabbarConfig.map((tab) => ({
        text: tab.text,
        pagePath: tab.pagePath,
        iconPath: tab.iconPath,
        selectedIconPath: tab.selectedIconPath
      }))
    }
  };
}

module.exports = createPagesConfig();
module.exports.createPagesConfig = createPagesConfig;
