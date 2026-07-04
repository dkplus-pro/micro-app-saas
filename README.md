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
npm run vite:build:tenant -- --tenant=app1
npm run dev:tenant -- --tenant=app1
npm run batch:build -- --tenants=app1,app2
npm run upload:tenant -- --tenant=app1 --dry-run
npm run release:tenant -- --tenant=app1 --dry-run
npm run typecheck
npm run lint
npm test
```

Upload and release scripts are intentionally dry-run only; they never call external mini-program services.


## Local tenant dev/build

Generated tenant files under `apps/miniapp-template/src/generated/` are local build artifacts.
They are ignored by git and should be regenerated for the tenant you are working on instead of committed.

- `npm run dev:tenant -- --tenant=app1` generates App1 config, then starts Vite for `apps/miniapp-template`.
- `npm run vite:build:tenant -- --tenant=app1` generates App1 config, then runs `vite build`.
- `npm run guard:no-tracked-artifacts` fails if generated tenant files, Vite output, `dist/`, `.runner-records/`, or `node_modules/` are tracked.

The generated directory keeps only `README.md` tracked as documentation; generated TypeScript and JSON files must stay untracked.

## Compile-time pruning contract

- `app1` generates pages A/B/C and modules `module-a,module-b,module-c,module-d`.
- `app2` generates pages A/B/D and modules `module-a,module-d,module-c`.
- The generated `module-entry.ts` statically imports only modules used by the selected tenant.

## Generated tenant artifacts

Generated files under `apps/miniapp-template/src/generated/` are local build artifacts. Only the explanatory README is tracked; generated TypeScript/JSON outputs are ignored and must be recreated with `npm run generate:tenant -- --tenant=<tenant>`, `npm run dev:tenant -- --tenant=<tenant>`, or `npm run build:vite:tenant -- --tenant=<tenant>`. The Vite tenant scripts generate the selected tenant first, then run `vite` or `vite build` from `apps/miniapp-template`.
