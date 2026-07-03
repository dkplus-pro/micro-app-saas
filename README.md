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

## Runner

`npm run runner:build` generates every tenant schema into `dist/tenants/<tenant>` and records `dist/runner-report.json`. Local runner upload is intentionally stubbed as `skipped-local-runner` so CI can replace it with a platform uploader.
