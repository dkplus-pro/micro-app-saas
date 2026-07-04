import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const generated = JSON.parse(readFileSync(resolve('apps/miniapp-template/src/generated/tenant.generated.json'), 'utf8'));

export default {
  name: generated.app.name,
  appid: generated.app.appid,
  versionName: generated.app.version,
  'mp-weixin': {
    appid: generated.app.appid,
    setting: {
      minified: true,
      es6: true
    }
  }
};
