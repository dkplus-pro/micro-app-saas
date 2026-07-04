# Generated tenant files

This directory is populated by `generate-tenant` before a tenant build.

The template imports these generated TypeScript modules:

- `pages.config` exporting `pagesConfig`
- `tabbar.config` exporting `tabbarConfig`
- `runtime.config` exporting `runtimeConfig`
- `module-entry` exporting tenant-scoped `moduleRegistry`

The UniApp root config adapters (`manifest.config.js` and `pages.config.js`) also
load build-time generated config from this directory. They support `.js`, `.mjs`,
`.cjs`, or `.json` mirrors for Node-side config loading.

`module-entry` must import only enabled modules for the active tenant so disabled
modules have no static import edge in that tenant build.
