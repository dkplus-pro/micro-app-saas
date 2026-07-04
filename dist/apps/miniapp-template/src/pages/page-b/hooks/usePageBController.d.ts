export declare function usePageBController(): {
    tenant: {
        readonly tenantId: "app2";
        readonly tenantName: "App2 租户";
    };
    runtime: {
        readonly features: {
            readonly pageA: true;
            readonly pageB: true;
            readonly pageC: false;
            readonly pageD: true;
            readonly moduleA: true;
            readonly moduleB: false;
            readonly moduleC: true;
            readonly moduleD: true;
            readonly moduleE: false;
        };
        readonly runtime: {
            readonly themeColor: "#52c41a";
            readonly apiBase: "https://api.example.com/app2";
        };
    };
    modules: import("../types/page-b.type.js").PageBModuleViewModel[];
    moduleEntries: {
        readonly 'module-a': {
            readonly key: "module-a";
            readonly renderLabel: "module-a";
        };
        readonly 'module-d': {
            readonly key: "module-d";
            readonly renderLabel: "module-d";
        };
        readonly 'module-c': {
            readonly key: "module-c";
            readonly renderLabel: "module-c";
        };
    };
};
