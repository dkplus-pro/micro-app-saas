import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const generated = JSON.parse(readFileSync(resolve('apps/miniapp-template/src/generated/tenant.generated.json'), 'utf8'));

export default {
  pages: generated.pages.map((page) => ({
    path: page.route,
    style: {
      navigationBarTitleText: page.title
    }
  })),
  tabBar: {
    list: generated.tabs.map((tab) => ({
      text: tab.text,
      pagePath: tab.route
    }))
  }
};
