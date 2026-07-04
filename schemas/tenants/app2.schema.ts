import { defineTenantSchema } from '../../packages/schema/src/authoring.ts';

export default defineTenantSchema({
  "tenant": {
    "tenantId": "app2",
    "tenantName": "App2 租户"
  },
  "app": {
    "appKey": "app2",
    "appid": "wx_app2",
    "name": "App2 小程序",
    "version": "0.1.0"
  },
  "tabs": [
    {
      "key": "A",
      "text": "A",
      "page": "page-a"
    },
    {
      "key": "B",
      "text": "B",
      "page": "page-b"
    },
    {
      "key": "D",
      "text": "D",
      "page": "page-d"
    }
  ],
  "pages": [
    {
      "key": "page-a",
      "route": "pages/page-a/index",
      "title": "App2 首页",
      "enabled": true,
      "package": "main",
      "modules": []
    },
    {
      "key": "page-b",
      "route": "pages/page-b/index",
      "title": "App2 页面B",
      "enabled": true,
      "layout": "stream",
      "modules": [
        {
          "key": "module-a"
        },
        {
          "key": "module-d"
        },
        {
          "key": "module-c"
        }
      ],
      "package": "main"
    },
    {
      "key": "page-c",
      "route": "pages/page-c/index",
      "title": "App2 页面C",
      "enabled": false,
      "package": "subPackage"
    },
    {
      "key": "page-d",
      "route": "pages/page-d/index",
      "title": "App2 页面D",
      "enabled": true,
      "package": "main"
    }
  ],
  "features": {
    "pageA": true,
    "pageB": true,
    "pageC": false,
    "pageD": true,
    "moduleA": true,
    "moduleB": false,
    "moduleC": true,
    "moduleD": true,
    "moduleE": false
  },
  "runtime": {
    "themeColor": "#52c41a",
    "apiBase": "https://api.example.com/app2",
    "assets": {
      "pageAImage": {
        "src": "assets/tenants/app2/page-a-demo.png",
        "title": "App2 同位置图片",
        "description": "App2 引用自己的绿色租户资源"
      }
    }
  },
  "release": {
    "uploadEnabled": false,
    "auditEnabled": false,
    "releaseEnabled": false
  }
});
