export declare const pagesConfig: readonly [{
    readonly key: "page-a";
    readonly path: "pages/page-a/index";
    readonly style: {
        readonly navigationBarTitleText: "App2 首页";
    };
    readonly layout: "standard";
    readonly modules: readonly [];
}, {
    readonly key: "page-b";
    readonly path: "pages/page-b/index";
    readonly style: {
        readonly navigationBarTitleText: "App2 页面B";
    };
    readonly layout: "stream";
    readonly modules: readonly [{
        readonly key: "module-a";
    }, {
        readonly key: "module-d";
    }, {
        readonly key: "module-c";
    }];
}, {
    readonly key: "page-d";
    readonly path: "pages/page-d/index";
    readonly style: {
        readonly navigationBarTitleText: "App2 页面D";
    };
    readonly layout: "standard";
    readonly modules: readonly [];
}];
