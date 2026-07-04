export declare function useTenantSnapshot(): {
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
};
