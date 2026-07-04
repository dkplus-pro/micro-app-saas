export const pagesConfig = [
    {
        "key": "page-a",
        "path": "pages/page-a/index",
        "style": {
            "navigationBarTitleText": "App2 首页"
        },
        "layout": "standard",
        "modules": []
    },
    {
        "key": "page-b",
        "path": "pages/page-b/index",
        "style": {
            "navigationBarTitleText": "App2 页面B"
        },
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
        ]
    },
    {
        "key": "page-d",
        "path": "pages/page-d/index",
        "style": {
            "navigationBarTitleText": "App2 页面D"
        },
        "layout": "standard",
        "modules": []
    }
];
