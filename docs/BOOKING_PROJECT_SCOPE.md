# Booking project scope (frontend + backend + dashboard)

Use this scope when you want a clean BookingGG-only codebase:

## Included
- `apps/web` (Next.js frontend + admin dashboard)
- `apps/api` (NestJS backend)
- `packages/core`, `packages/integrations`, `packages/widget`
- `supabase` SQL files
- `docker` local infra
- Root workspace config (`package.json`, `pnpm-workspace.yaml`, lockfile, tsconfig/eslint)
- CI and release hardening docs

## Excluded by extraction output
- `node_modules`
- Git metadata
- Any local editor/system artifacts

## Command
```bash
./scripts/extract-booking-project.sh
```

Optional custom destination:
```bash
./scripts/extract-booking-project.sh /tmp/booking-project-clean
```
