# UBM - Universal Booking Middleware

Monorepo for a headless booking system with PWA dashboard, embeddable widget, and multi-provider integrations.

## Repository Structure

```
ubm-monorepo/
├── apps/
│   ├── api/          # NestJS API (Prisma + PostgreSQL)
│   └── web/          # Next.js PWA Dashboard
├── packages/
│   ├── core/         # Shared DTO types and ports
│   ├── integrations/ # Provider implementations (Mock, WordPress, etc.)
│   └── widget/       # Embeddable booking widget
├── docker/           # PostgreSQL + Redis for development
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose (for local development)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start development services (PostgreSQL + Redis)

```bash
cd docker
docker-compose up -d
```

### 3. Set up the API

```bash
# Copy environment file
cp apps/api/.env.example apps/api/.env

# Generate Prisma client
cd apps/api
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database
pnpm prisma:seed
```

### 4. Set up the Web app

```bash
# Copy environment file
cp apps/web/.env.example apps/web/.env
```

### 5. Run development servers

```bash
# From root directory
pnpm dev

# Or run individually:
# pnpm -C apps/api dev
# pnpm -C apps/web dev
```

The API will be available at http://localhost:3001
The Web dashboard will be available at http://localhost:3000

## Available Scripts

From the root directory:

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run tests in all packages
- `pnpm typecheck` - Type check all packages
- `pnpm clean` - Clean all build artifacts

## Development Roadmap

This repository follows the prompts outlined in the README:

- ✅ PROMPT 1: Repo skeleton + workspace (COMPLETED)
- ⏳ PROMPT 2: Prisma schema (multi-tenant + cache)
- ⏳ PROMPT 3: Core DTO + Provider ports (adapter pattern)
- ⏳ PROMPT 4: Integrations registry + Mock provider + WordPress skeleton
- ⏳ PROMPT 5: NestJS API "BookingAdapterService" (orchestration + idempotency)
- ⏳ PROMPT 6: Next.js PWA (manifest + SW + offline + install prompt)
- ⏳ PROMPT 7: Embeddable Booking Widget

## Architecture

### Core Principles

- **Adapter Pattern**: No switch-case hell, provider registry with factory pattern
- **Multi-tenant**: Tenant → Integration → Provider config store
- **Idempotency**: Unique constraints for safe concurrent booking creation
- **Type Safety**: Shared DTO types across backend and frontend
- **PWA**: Offline support, service worker, install prompt

### Provider Interface

All booking providers implement:
- `ping()` - Health check
- `listAvailability()` - Get available time slots
- `createBooking()` - Create a new booking
- `cancelBooking()` - Cancel an existing booking
- `listBookings()` - List bookings

## License

Private - All rights reserved
