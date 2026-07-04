exports.pagesConfig = [
  { key: 'page-a', route: 'pages/page-a/index', title: 'App1 首页', enabled: true },
  { key: 'page-b', route: 'pages/page-b/index', title: 'App1 页面B', enabled: true, layout: 'stream', modules: [{ key: 'module-a' }] }
];
