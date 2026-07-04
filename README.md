# Schema UniApp SaaS Factory Scaffold

This repository is a minimal runnable scaffold for the `DESIGN.md` proposal: one UniApp-style miniapp template, multiple tenant schemas, compile-time generated pages/tabs/module entries, and dry-run runner scripts.

## Commands

```bash
npm install
npm run validate:schema
npm run generate:tenant -- --tenant=app1
npm run dev:app1
npm run build:vite:app1
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


## Local tenant Vite development

Generated tenant files under `apps/miniapp-template/src/generated/` are local build artifacts. They are regenerated for the selected tenant and must not be committed; keep generated TypeScript/JSON, Vite output, `dist/`, `node_modules/`, and `.runner-records/` out of git.

Use the tenant Vite commands when developing or smoke-testing a tenant locally. Each command generates the selected tenant first, then runs Vite from `apps/miniapp-template`:

```bash
npm run dev:tenant -- --tenant=app1
npm run dev:app1
npm run build:vite -- --tenant=app1
npm run build:vite:app1
```

Switching tenants requires rerunning the tenant command so `src/generated/` reflects the new tenant before Vite starts.

## Compile-time pruning contract

- `app1` generates pages A/B/C and modules `module-a,module-b,module-c,module-d`.
- `app2` generates pages A/B/D and modules `module-a,module-d,module-c`.
- The generated `module-entry.ts` statically imports only modules used by the selected tenant.

## Generated tenant artifacts

Generated files under `apps/miniapp-template/src/generated/` are local build artifacts. Only the explanatory README is tracked; generated TypeScript/JSON outputs are ignored and must be recreated with `npm run generate:tenant -- --tenant=<tenant>`, `npm run dev:tenant -- --tenant=<tenant>`, or `npm run build:vite:tenant -- --tenant=<tenant>`. The Vite tenant scripts generate the selected tenant first, then run `vite` or `vite build` from `apps/miniapp-template`.
