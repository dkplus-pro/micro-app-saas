# Generated tenant files

This directory is populated by `npm run generate:tenant -- --tenant=<id>` and by the tenant-aware uni-app wrappers before local dev/build.

The generated TypeScript and JSON files in this directory are local build artifacts and must not be committed. Git should track only this README (or a non-generated placeholder if needed).

The template imports these generated TypeScript modules after generation:

- `pages.config` exporting `pagesConfig`
- `subpackages.config` exporting `subPackagesConfig`
- `tabbar.config` exporting `tabbarConfig`
- `runtime.config` exporting `runtimeConfig`, including normalized `capabilities`, legacy `features` compatibility data, and tenant assets such as `runtime.assets.pageAImage`
- `page-a-assets` importing the current tenant's Page A image asset
- `module-entry` exporting homepage/main-package `moduleEntries`
- `home-module-renderer.vue` rendering homepage modules with tenant-specific static imports
- `subpackage-module-entry` exporting `subPackageModuleEntries` for modules not referenced by Page A
- `pages/module-assets/module-entry.ts` exporting the same non-home module registry from a technical subpackage root

Run one of these before opening the app locally:

```bash
npm run dev -- --tenant=app1
npm run build -- --tenant=app1
```

`subpackages.config` must keep non-home, non-tab pages out of the main package. `module-entry` and `home-module-renderer.vue` must import only modules referenced by Page A; modules used only outside Page A belong in `subpackage-module-entry` and the `pages/module-assets` technical subpackage so they do not create a static import edge from the homepage bundle.

Tenant schemas should prefer `pages: [{ key, enabled, ... }]` for structural composition/page inclusion and `capabilities.modules` for module ability switches. The generator still accepts legacy page maps and module-only `features` for backend JSON compatibility, but generated page files are always derived from `pages[].enabled`.

For TS-first authoring, define tenant source with `defineTenantSchema(...)`, emit JSON for the existing runtime/build pipeline, and keep runtime validation as the compatibility gate for backend-produced JSON.
