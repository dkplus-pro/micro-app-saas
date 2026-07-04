# Generated tenant files

This directory is populated by `generate-tenant` before a tenant dev session or build.

Only this README is tracked. Generated TypeScript and JSON files in this directory
are local build artifacts and must not be committed; run one of these commands to
recreate them for the active tenant:

```bash
npm run generate:tenant -- --tenant=app1
npm run dev:tenant -- --tenant=app1
npm run build:vite:tenant -- --tenant=app1
```

The template imports these generated TypeScript modules:

- `pages.config` exporting `pagesConfig`
- `tabbar.config` exporting `tabbarConfig`
- `runtime.config` exporting `runtimeConfig`
- `module-entry` exporting tenant-scoped `moduleEntries`

The UniApp root config adapters (`manifest.config.js` and `pages.config.js`) also
load build-time generated config from this directory. They support `.js`, `.mjs`,
`.cjs`, or `.json` mirrors for Node-side config loading.

`module-entry` must import only enabled modules for the active tenant so disabled
modules have no static import edge in that tenant build.
