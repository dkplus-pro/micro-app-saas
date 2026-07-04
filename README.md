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
npm run build:vite:app1
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
- `npm run vite:build:tenant -- --tenant=app1` (alias: `npm run build:tenant:vite -- --tenant=app1`) generates App1 config, then runs `vite build`.
- `npm run guard:no-tracked-artifacts` fails if generated tenant files, Vite output, `dist/`, `.runner-records/`, or `node_modules/` are tracked.

```bash
npm run dev:tenant -- --tenant=app1
npm run dev:app1
npm run build:vite:tenant -- --tenant=app1
npm run build:vite:app1
```

Switching tenants requires rerunning the tenant command so `src/generated/` reflects the new tenant before Vite starts.

## Compile-time pruning contract

- `app1` generates pages A/B/C and modules `module-a,module-b,module-c,module-d`.
- `app2` generates pages A/B/D and modules `module-a,module-d,module-c`.
- The generated `module-entry.ts` statically imports only modules used by the selected tenant.


## Generated tenant artifacts

`apps/miniapp-template/src/generated/` is local generated output. Keep the explanatory
`README.md` tracked, but do not commit generated TypeScript or JSON from that
directory. Tenant-specific Vite commands regenerate the selected tenant before
starting dev or building:

```bash
npm run dev:tenant -- --tenant=app1
npm run build:tenant:vite -- --tenant=app1
```

The guard `npm run guard:no-tracked-generated` fails if generated tenant output is
reintroduced to git tracking.
