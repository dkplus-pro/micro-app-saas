import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const templateRoot = path.dirname(fileURLToPath(import.meta.url));

function pickExport(loaded, exportName) {
  if (exportName && loaded && Object.prototype.hasOwnProperty.call(loaded, exportName)) {
    return loaded[exportName];
  }
  if (loaded && Object.prototype.hasOwnProperty.call(loaded, 'default')) {
    return loaded.default;
  }
  return exportName ? undefined : loaded;
}

export function loadGeneratedConfig(fileName, exportName) {
  const generatedDir = path.resolve(templateRoot, 'src/generated');
  const candidates = [
    path.join(generatedDir, `${fileName}.js`),
    path.join(generatedDir, `${fileName}.mjs`),
    path.join(generatedDir, `${fileName}.cjs`),
    path.join(generatedDir, `${fileName}.json`)
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const value = pickExport(require(candidate), exportName);
    if (value !== undefined) {
      return value;
    }
  }

  throw new Error(`Missing generated ${fileName} config. Run generate-tenant before building.`);
}

export function createManifestConfig(appConfig = loadGeneratedConfig('app.config', 'appConfig')) {
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

export default createManifestConfig();
