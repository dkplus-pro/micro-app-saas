# Micro App SaaS uni-app Scaffold

Schema-driven multi-tenant uni-app scaffold generated from `DESIGN.md`.

## Tenant model

- Catalog pages live in `schemas/catalog/pages.json`.
- Catalog modules live in `schemas/catalog/modules.json`.
- Tenant schemas live in `schemas/tenants/*.json`.
- Generated uni-app entry files are `pages.json`, `manifest.json`, and `src/generated/*`.

## App1

App1 declares tabs `A/B/C`, page A title `App1 首页`, and page B modules `a → b → c → d`.

```bash
npm run generate:app1
npm run verify
```

## App2

App2 declares tabs `A/B/D`, page A title `App2 工作台`, and page B modules `a → d → c`.

```bash
npm run generate:app2
npm run runner:build
npm run smoke
```

## uni-app CLI project

This repository is now a real uni-app Vue3/Vite CLI project:

- `src/main.js` creates the uni-app Vue3 SSR app.
- `src/App.vue` is the uni-app root component.
- `vite.config.js` loads `@dcloudio/vite-plugin-uni`.
- `src/pages.json` and `src/manifest.json` are generated for the uni-app CLI source root.
- root `pages.json` / `manifest.json` are kept as generated review snapshots.

Build a tenant for Weixin Mini Program:

```bash
npm run uni:build:app1
npm run uni:build:app2
```

The uni-app compiler writes the runnable mini-program to `dist/build/mp-weixin`, which is intentionally ignored by git.

## Runner

`npm run runner:build` generates every tenant schema into `dist/tenants/<tenant>` and records `dist/runner-report.json`. Local runner upload is intentionally stubbed as `skipped-local-runner` so CI can replace it with a platform uploader.
