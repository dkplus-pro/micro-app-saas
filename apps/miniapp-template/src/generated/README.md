# Generated tenant files

This directory is populated by `npm run generate:tenant -- --tenant=<id>` and by the tenant-aware uni-app wrappers before local dev/build.

The generated TypeScript and JSON files in this directory are local build artifacts and must not be committed. Git should track only this README (or a non-generated placeholder if needed).

The template imports these generated TypeScript modules after generation:

- `pages.config` exporting `pagesConfig`
- `tabbar.config` exporting `tabbarConfig`
- `runtime.config` exporting `runtimeConfig`
- `module-entry` exporting tenant-scoped `moduleEntries`

Run one of these before opening the app locally:

```bash
npm run dev -- --tenant=app1
npm run build -- --tenant=app1
```

`module-entry` must import only enabled modules for the active tenant so disabled modules have no static import edge in that tenant build.
