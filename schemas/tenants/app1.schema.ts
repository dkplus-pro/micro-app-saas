import { defineTenantSchema } from '../../packages/schema/src/authoring.ts';

export default defineTenantSchema({
  "tenant": {
    "tenantId": "app1",
    "tenantName": "App1 租户"
  },
  "app": {
    "appKey": "app1",
    "appid": "wx_app1",
    "name": "App1 小程序",
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
      "key": "C",
      "text": "C",
      "page": "page-c"
    }
  ],
  "pages": [
    {
      "key": "page-a",
      "route": "pages/page-a/index",
      "title": "App1 首页",
      "enabled": true,
      "package": "main",
      "modules": [
        {
          "key": "module-a",
          "props": {
            "title": "App1 专属 Module A",
            "description": "点击进入页面D",
            "targetPage": "page-d"
          }
        }
      ]
    },
    {
      "key": "page-b",
      "route": "pages/page-b/index",
      "title": "App1 页面B",
      "enabled": true,
      "layout": "stream",
      "modules": [
        {
          "key": "module-a"
        },
        {
          "key": "module-b"
        },
        {
          "key": "module-c"
        },
        {
          "key": "module-d"
        }
      ],
      "package": "main"
    },
    {
      "key": "page-c",
      "route": "pages/page-c/index",
      "title": "App1 页面C",
      "enabled": true,
      "package": "main"
    },
    {
      "key": "page-d",
      "route": "pages/page-d/index",
      "title": "App1 页面D",
      "enabled": true,
      "package": "subPackage"
    }
  ],
  "capabilities": {
    "modules": {
      "module-a": true,
      "module-b": true,
      "module-c": true,
      "module-d": true,
      "module-e": false
    }
  },
  "runtime": {
    "themeColor": "#1677ff",
    "apiBase": "https://api.example.com/app1",
    "assets": {
      "pageAImage": {
        "src": "assets/tenants/app1/page-a-demo.png",
        "title": "App1 同位置图片",
        "description": "App1 引用自己的蓝色租户资源"
      }
    }
  },
  "release": {
    "uploadEnabled": false,
    "auditEnabled": false,
    "releaseEnabled": false
  }
});
