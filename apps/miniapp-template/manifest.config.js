// UniApp adapters read generated tenant config at build time.
import { appConfig } from './src/generated/app.config.js';

export default {
  name: appConfig.name,
  appid: appConfig.appid,
  versionName: appConfig.version,
  'mp-weixin': {
    appid: appConfig.appid
  }
};
