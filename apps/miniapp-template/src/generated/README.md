# Generated tenant files

This directory is populated by `generate-tenant` before a tenant build.

The template imports these generated modules:

- `app.config` / `app.config.js` for `manifest.config.js`
- `pages.config` exporting `pagesConfig`
- `tabbar.config` exporting `tabbarConfig`
- `runtime.config` exporting `runtimeConfig`
- `module-entry` exporting tenant-scoped `moduleRegistry`

`module-entry` must import only enabled modules for the active tenant so disabled
modules have no static import edge in that tenant build.
