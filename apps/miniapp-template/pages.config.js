import { pagesConfig } from './src/generated/pages.config.js';
import { tabbarConfig } from './src/generated/tabbar.config.js';

function resolveTemplateRoot() {
  const candidates = [
    typeof __dirname === 'string' ? __dirname : '',
    process.cwd(),
    path.join(process.cwd(), 'apps/miniapp-template')
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, 'pages.config.js'))) {
      return candidate;
    }
  }

  return typeof __dirname === 'string' ? __dirname : process.cwd();
}

function pickExport(loaded, exportName) {
  if (exportName && loaded && Object.prototype.hasOwnProperty.call(loaded, exportName)) {
    return loaded[exportName];
  }
  if (loaded && Object.prototype.hasOwnProperty.call(loaded, 'default')) {
    return loaded.default;
  }
  return exportName ? undefined : loaded;
}

function loadGeneratedConfig(fileName, exportName) {
  const generatedDir = path.resolve(resolveTemplateRoot(), 'src/generated');
  const candidates = [
    path.join(generatedDir, `${fileName}.js`),
    path.join(generatedDir, `${fileName}.cjs`),
    path.join(generatedDir, `${fileName}.json`)
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const value = pickExport(require(candidate), exportName);
    if (value !== undefined) {
      return value;
    }
  }

  throw new Error(`Missing generated ${fileName} config. Run generate-tenant before building.`);
}

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
module.exports.loadGeneratedConfig = loadGeneratedConfig;
