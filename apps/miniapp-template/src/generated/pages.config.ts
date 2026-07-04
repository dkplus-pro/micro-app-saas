export const pagesConfig = [
  {
    "key": "page-a",
    "route": "pages/page-a/index",
    "title": "App1 首页",
    "enabled": true
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
    ]
  },
  {
    "key": "page-c",
    "route": "pages/page-c/index",
    "title": "App1 页面C",
    "enabled": true
  }
] as const;
