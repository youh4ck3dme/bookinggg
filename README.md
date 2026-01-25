# UBM — Universal Booking Middleware (PWA + Headless API + CMS/PWA Connectors)
> Codex Runbook — postupné prompty (kopíruj po jednom, po každom kroku spusti testy a commitni)

## VS Code + AI: odporúčaný setup (aj pre "najlepšie modely")
Ak chceš z VS Code spraviť poriadne “AI‑boostnutý” editor, toto je najrýchlejší a stabilný setup:

1. **Použi oficiálny VS Code + rozšírenie pre tvojho providera AI**
   - Udržíš si rýchle aktualizácie, stabilitu a lepšie logovanie požiadaviek.
   - Nevytvára to lock‑in do jedného modelu – môžeš prepínať podľa potreby.

2. **Model‑agnostické workflow**
   - Rozdeľ úlohu na menšie prompty (kontext je obmedzený).
   - Pre kritické zmeny si nechaj vygenerovať testy a nechaj AI vysvetliť diff.
   - Pred merge vždy spusti aspoň lint/test/typecheck.

3. **Bezpečný prístup k tajomstvam**
   - API kľúče drž v `.env` a nikdy ich necommituj.
   - Pre tím používaj secrets manager (GitHub Actions, Vercel, Doppler, 1Password, atď.).

4. **Najlepší výsledok dá kombinácia**
   - Rýchly model na rutinné úlohy (refaktoring, dopĺňanie).
   - Silnejší model na architektúru, návrhy a debugging.

> Tip: Ak chceš, môžeme tento repozitár doplniť o konkrétny `.vscode` setup (tasks, snippets, launch config, odporúčané extensions) a workflow pre viac AI providerov.

## Blueprint pre Codex agenta: Antigravity extensions (VS Code)
Skopíruj celý blok nižšie do Codex agenta. Je to presný blueprint, ktorý má vygenerovať kompletné VS Code rozšírenie pre „Antigravity“ (podľa tvojich špecifikácií) vrátane UI, príkazov, konfigu, testov a dokumentácie.

```text
ROLE: You are a senior VS Code extension engineer.
GOAL: Build a production-ready VS Code extension named "antigravity" with full docs, tests, and packaging.
LANGUAGE: Slovak for user-facing text, English for code comments.

CONTEXT
- The extension should integrate with the Antigravity editor and offer AI-assisted workflows.
- Assume no existing code. Create a complete new extension scaffold.
- Prefer TypeScript, strict mode, ESLint, Prettier, and VS Code Extension Testing.

FEATURES (MVP)
1) Commands
   - antigravity.connect (connect to local/remote Antigravity service)
   - antigravity.openEditor (open Antigravity editor view)
   - antigravity.runTask (run a task with AI assistance)
   - antigravity.syncProjects (sync project list)

2) UI
   - Activity Bar view "Antigravity" with tree view: Projects, Recent, Favorites.
   - Webview panel for the editor with toolbar buttons (Connect, Sync, Run Task).

3) Configuration
   - antigravity.apiBase (string)
   - antigravity.apiKey (string, secret storage)
   - antigravity.autoSync (boolean)
   - antigravity.defaultModel (string)

4) Telemetry & Logging
   - OutputChannel "Antigravity"
   - Optional telemetry toggle (off by default)

5) Security
   - Store secrets in VS Code SecretStorage
   - Never log secrets

6) Packaging
   - Provide package.json contributions (commands, views, configuration)
   - Provide README, CHANGELOG, and LICENSE

DELIVERABLES
- Fully working extension source in a new folder (e.g., /extensions/antigravity)
- Install/build scripts
- Unit tests + basic integration test
- Clear README with setup and usage

ACCEPTANCE CRITERIA
- `npm install` and `npm run compile` pass
- `npm test` passes
- Extension loads in VS Code Extension Development Host

OUTPUT RULES
- Output all files with clear file headers, e.g. "File: /extensions/antigravity/src/extension.ts"
- No pseudocode; full content for every file
- Use concise, production-ready defaults
```

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
