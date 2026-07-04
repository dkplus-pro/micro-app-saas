const path = require('node:path');

function loadGeneratedConfig(fileName, exportName) {
  const generatedDir = path.resolve(__dirname, 'src/generated');
  const candidates = [
    path.join(generatedDir, `${fileName}.js`),
    path.join(generatedDir, `${fileName}.cjs`),
    path.join(generatedDir, `${fileName}.json`)
  ];

  for (const candidate of candidates) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const loaded = require(candidate);
      return exportName ? loaded[exportName] || loaded.default || loaded : loaded.default || loaded;
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
    }
  }

  throw new Error(`Missing generated ${fileName} config. Run generate-tenant before building.`);
}

function createManifestConfig(appConfig = loadGeneratedConfig('app.config', 'appConfig')) {
  return {
    name: appConfig.name,
    appid: appConfig.uniAppId || appConfig.appid,
    versionName: appConfig.versionName || '0.1.0',
    versionCode: String(appConfig.versionCode || 1),
    transformPx: false,
    'mp-weixin': {
      appid: appConfig.appid,
      setting: {
        urlCheck: false,
        es6: true,
        postcss: true,
        minified: true
      },
      usingComponents: true
    }
  };
}

module.exports = createManifestConfig();
module.exports.createManifestConfig = createManifestConfig;
module.exports.loadGeneratedConfig = loadGeneratedConfig;
