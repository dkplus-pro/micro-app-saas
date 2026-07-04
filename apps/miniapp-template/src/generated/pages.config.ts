export const pagesConfig = [
  {
    "key": "page-a",
    "path": "pages/page-a/index",
    "style": {
      "navigationBarTitleText": "App1 首页"
    },
    "layout": "standard",
    "modules": []
  },
  {
    "key": "page-b",
    "path": "pages/page-b/index",
    "style": {
      "navigationBarTitleText": "App1 页面B"
    },
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
    ]
  },
  {
    "key": "page-c",
    "path": "pages/page-c/index",
    "style": {
      "navigationBarTitleText": "App1 页面C"
    },
    "layout": "standard",
    "modules": []
  }
] as const;
