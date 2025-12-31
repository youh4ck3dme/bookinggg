# UBM — Universal Booking Middleware (PWA + Headless API + CMS/PWA Connectors)
> Codex Runbook — postupné prompty (kopíruj po jednom, po každom kroku spusti testy a commitni)

## Cieľ
Vybuduj 100% funkčný **booking systém** ako:
- **Headless Backend API** (multi-tenant, adapter pattern, normalizovaná cache)
- **PWA Dashboard** (offline, manifest, install prompt, fallback page)
- **Embeddable Booking Widget** (vložíš do ľubovoľného CMS/PWA ako 1 `<script>` alebo Web Component)
- **Integrations layer** (WordPress / Bookio / Google Calendar / Custom REST / Direct DB)

## Kľúčové princípy “lepidla”
- Jednotné **DTO/types** medzi backend↔frontend (aby sa nerozpadla normalizácia)
- **Provider Registry + Factory** (žiadny switch-case hell):contentReference[oaicite:2]{index=2}
- **Tenant → Integration → Provider config store** (PrismaTenantConfigStore)
- **Idempotency-Key** pre create booking (unique constraint + concurrency safe fallback):contentReference[oaicite:3]{index=3}:contentReference[oaicite:4]{index=4}
- **Unified error shape** (frontend vždy dostane rovnaký formát chyby)
- PWA essentials: **manifest + service worker caching + offline UX**:contentReference[oaicite:5]{index=5}

---

# PROMPT 1 — Repo skeleton + workspace
## Úloha pre Codex
Vygeneruj monorepo štruktúru (pnpm workspace), TypeScript strict, shared packages.

### Požadovaná štruktúra
- `apps/api` = NestJS API (Prisma)
- `apps/web` = Next.js App Router PWA (Tailwind + shadcn/ui)
- `packages/core` = čisté DTO + ports (Provider interface, registry port, domain types)
- `packages/integrations` = provider implementácie (wordpress, mock, bookio, gcal, custom-rest)
- `packages/widget` = embeddable booking widget (Web Component / vanilla TS)
- `docker/` = postgres + redis (dev)

### Output pravidlá
- Vygeneruj všetky súbory kompletne (nie pseudokód).
- Nežiadaj odo mňa otázky, urob rozumné defaulty.
- Každý súbor označ komentárom “File: /path”.

### Acceptance
- `pnpm -w install` prejde
- Typecheck prejde (tsc -b)
- Repo má základné README a .env.example pre api/web

STOP po dokončení a vypíš príkazy na spustenie (dev).

---

# PROMPT 2 — Prisma schema (multi-tenant + cache)
## Úloha pre Codex
V `apps/api` nastav Prisma + PostgreSQL schému:

### Modely (minimum)
- `Tenant` (id, name, slug, timezone, createdAt)
- `Integration` (id, tenantId, providerKey, baseUrl, settings JSON, secretsEnc TEXT, isEnabled, updatedAt, deletedAt)
- `UnifiedBooking` (id, tenantId, integrationId, providerId, externalReservationId, status, startAt, endAt, customerName, customerEmail, customerPhone, notes, idempotencyKey?, createdAt, updatedAt, cancelledAt?)
- (voliteľné) `AuditLog` (tenantId, action, meta JSON, createdAt)

### Kritické constraints/indexy
- Unique: `@@unique([tenantId, idempotencyKey])` (idempotency):contentReference[oaicite:6]{index=6}
- Indexy na tenantId + startAt (listovanie)
- `Integration` filter: tenantId + isEnabled + deletedAt null

### Seed
- Vytvor seed s `tenant_1` a `integration` providerKey=`mock`
- Vygeneruj `prisma/seed.ts` a scripts v package.json

### Acceptance
- `pnpm -C apps/api prisma:migrate` prejde
- `pnpm -C apps/api prisma:seed` vytvorí tenant + integration

STOP po dokončení.

---

# PROMPT 3 — Core DTO + Provider ports (adapter pattern)
## Úloha pre Codex
V `packages/core` definuj:
- DTO: `CreateBookingInput`, `BookingDTO`, `AvailabilitySlot`
- Ports: `BookingProvider`, `ProviderRegistry`, `ProviderContext`, `TenantProviderConfig`

Použi dizajn:
- `BookingProvider` má: `ping`, `listAvailability`, `createBooking`, `cancelBooking`, `listBookings`:contentReference[oaicite:7]{index=7}
- `ProviderRegistry.getProvider(providerKey)` (port)
- Žiadny NestJS import v core (čisté TS).

### Acceptance
- `pnpm -w test` (ak spravíš testy) alebo aspoň `pnpm -w typecheck` prejde
STOP.

---

# PROMPT 4 — Integrations registry + Mock provider + WordPress skeleton
## Úloha pre Codex
V `packages/integrations`:
- Implementuj `InMemoryProviderRegistry` s `.register()` a `.getProvider()`:contentReference[oaicite:8]{index=8}
- Pridaj `MockProvider` (vracia fake slots + vytvára booking)
- Pridaj `WordPressProvider` skeleton (HTTP client injected), s endpointmi:
  - GET `/wp-json/ubm/v1/slots`
  - POST `/wp-json/ubm/v1/bookings`
  - POST `/wp-json/ubm/v1/bookings/:id/cancel`:contentReference[oaicite:9]{index=9}

### Acceptance
- registry funguje bez switch-case
- mock provider má unit test na základný flow

STOP.

---

# PROMPT 5 — NestJS API “BookingAdapterService” (orchestrácia + idempotency)
## Úloha pre Codex
V `apps/api` implementuj:
- `PrismaTenantConfigStore`: vyberie najnovšiu enabled integráciu pre tenant a vráti provider config (settings + secretsEnc parse):contentReference[oaicite:10]{index=10}
- `ProviderRegistry` wrapper/factory (createProvider podľa providerKey):contentReference[oaicite:11]{index=11}
- `BookingAdapterService`:
  - `getSlots(tenantId, from,to,serviceId?,staffId?)`
  - `createBooking(tenantId, input, idempotencyKey?)`:
    - ak existuje UnifiedBooking pre (tenantId,idempotencyKey) → vráť existujúci:contentReference[oaicite:12]{index=12}
    - inak zavolaj provider, ulož do UnifiedBooking
    - concurrency-safe: ak padne unique violation, dotiahni existujúci a vráť:contentReference[oaicite:13]{index=13}
  - `cancelBooking(tenantId, bookingId)`:
    - update UnifiedBooking status=CANCELLED

- Controller endpoints:
  - `GET /api/tenants/:tenantId/slots`
  - `POST /api/tenants/:tenantId/bookings` (Idempotency-Key header)
  - `POST /api/tenants/:tenantId/bookings/:id/cancel`
  - `GET /api/tenants/:tenantId/bookings?from&to`

- Security baseline:
  - CORS origins z env
  - `ApiKeyGuard` (x-api-key) ako global guard pre /api:contentReference[oaicite:14]{index=14}
  - `GlobalErrorFilter` ktorý mapuje chyby na jednotný payload

### Acceptance
- Jest test: idempotency (rovnaký key → rovnaký booking id):contentReference[oaicite:15]{index=15}
- `pnpm -C apps/api test` prejde

STOP.

---

# PROMPT 6 — Next.js PWA (manifest + SW + offline + install prompt)
## Úloha pre Codex
V `apps/web` nastav PWA:
- `public/manifest.json` (standalone, icons, theme):contentReference[oaicite:16]{index=16}
- `next.config.mjs` s `@ducanh2912/next-pwa` (disable v dev, offline fallback `/~offline`):contentReference[oaicite:17]{index=17}
- `app/~offline/page.tsx` (offline fallback):contentReference[oaicite:18]{index=18}
- `components/pwa/OfflineAlert.tsx` (banner keď offline)
- `components/pwa/InstallPrompt.tsx` (beforeinstallprompt flow)

UI:
- basic dashboard page:
  - vyber tenant (default `tenant_1`)
  - načítaj bookings list z API
  - create booking form (serviceId + startAt + endAt + customerName)
  - cancel booking button
- použij Tailwind + shadcn/ui

### Acceptance
- `pnpm -C apps/web build` prejde
- offline fallback route funguje (aspoň lokálne po build)
- install prompt komponent je client-only a nepadá SSR

STOP.

---

# PROMPT 7 — Embeddable Booking Widget (pre každý CMS/PWA)
## Úloha pre Codex
V `packages/widget` vytvor “drop-in” widget:
- build výstup: `dist/widget.js` (UMD alebo IIFE)
- použitie:
  ```html
  <script src="https://YOUR_HOST/widget.js"></script>
  <booking-widget
    api-base="https://api.example.com/api"
    tenant-id="tenant_1"
    api-key="..."
  ></booking-widget>
