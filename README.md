# Schema UniApp SaaS Factory Scaffold

This repository is a minimal runnable scaffold for the `DESIGN.md` proposal: one UniApp-style miniapp template, multiple tenant schemas, compile-time generated pages/tabs/module entries, and dry-run runner scripts.

## Commands

```bash
npm install
npm run validate:schema
npm run generate:tenant -- --tenant=app1
npm run dev:tenant -- --tenant=app1
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

## Compile-time pruning contract

- `app1` generates pages A/B/C and modules `module-a,module-b,module-c,module-d`.
- `app2` generates pages A/B/D and modules `module-a,module-d,module-c`.
- The generated `module-entry.ts` statically imports only modules used by the selected tenant.


## Generated tenant artifacts

`apps/miniapp-template/src/generated/` is local generated output. The committed source of truth is the tenant schema under `schemas/tenants/`; generated `.ts`/`.json` files, Vite output, runner records, `dist/`, and `node_modules/` must stay untracked.

Use `npm run dev:tenant -- --tenant=app1` for local Vite development. The script regenerates `src/generated/` for the selected tenant, then starts Vite in `apps/miniapp-template`. Use `npm run build:vite:tenant -- --tenant=app1` or `npm run build:vite:app1` for a smokeable production build.

`npm run lint` includes `guard:generated-untracked`, which fails if generated tenant TS/JSON files are tracked again.
