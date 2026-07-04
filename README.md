# Schema UniApp SaaS Factory Scaffold

This repository is a runnable scaffold for the `DESIGN.md` proposal: one **uni-app WeChat mini-program** template, multiple tenant schemas, compile-time generated pages/tabs/module entries, and dry-run runner scripts.

The primary local target is `mp-weixin`. The uni-app CLI uses Vite internally, so local dev/build should go through the tenant wrapper instead of committing generated code.

## Commands

```bash
npm install
npm run validate:schema
npm run generate:tenant -- --tenant=app1
npm run dev:mp-weixin -- --tenant=app1
npm run build:mp-weixin -- --tenant=app1
npm run dev:app1:mp-weixin
npm run build:app1:mp-weixin
npm run build:app1
npm run build:app2
npm run batch:build -- --tenants=app1,app2
npm run upload:tenant -- --tenant=app1 --dry-run
npm run release:tenant -- --tenant=app1 --dry-run
npm run typecheck
npm run lint
npm test
```

Upload and release scripts are intentionally dry-run only; they never call external mini-program services.

## Local tenant uni-app dev/build

Generated tenant files are local-only build artifacts and must not be committed:

- `apps/miniapp-template/src/generated/*` — generated TypeScript/JSON consumed by template code.
- `apps/miniapp-template/src/pages.json` — generated uni-app pages/tabBar config for the selected tenant.
- `apps/miniapp-template/src/manifest.json` — generated uni-app manifest with tenant `mp-weixin.appid`.
- `apps/miniapp-template/dist/` — uni-app dev/build output.

Recommended commands:

```bash
npm run dev:mp-weixin -- --tenant=app1
npm run build:mp-weixin -- --tenant=app1
npm run dev:app1:mp-weixin
npm run build:app1:mp-weixin
```

Legacy aliases such as `npm run dev:tenant -- --tenant=app1` and `npm run build:vite -- --tenant=app1` are kept for convenience, but they now route to the uni-app `mp-weixin` target.

Per uni-app CLI conventions, `dev` output is under `apps/miniapp-template/dist/dev/mp-weixin/` and production build output is under `apps/miniapp-template/dist/build/mp-weixin/`.

Switching tenants requires rerunning the tenant command so `src/generated/`, `src/pages.json`, and `src/manifest.json` reflect the selected tenant before uni-app starts.

## Compile-time pruning contract

- `app1` generates pages A/B/C and modules `module-a,module-b,module-c,module-d`.
- `app2` generates pages A/B/D and modules `module-a,module-d,module-c`.
- The generated `module-entry.ts` statically imports only modules used by the selected tenant.
- `pages.json` includes only enabled pages and tabBar items for the selected tenant, so disabled pages are not part of that tenant's mini-program build graph.

## Generated artifact guard

Run this before committing:

```bash
npm run guard:no-tracked-artifacts
```

The guard fails if generated tenant files, generated uni-app config, uni-app build output, `dist/`, `.runner-records/`, or `node_modules/` are tracked by git. Keep only `apps/miniapp-template/src/generated/README.md` tracked in the generated directory.
