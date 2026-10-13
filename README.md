# AmazingDeal Multi-Tenant Commerce Platform 🚀

A high-performance, white-label, multi-tenant e-commerce platform built for offline retailers transitioning to modern digital commerce (zero-cash budget architecture).

---

## 🌟 Key Highlights & Architecture

- **Multi-Tenancy Engine**:
  - **Shared PostgreSQL Database, Column-Level Isolation**: Every tenant entity is partitioned via `tenant_id UUID NOT NULL` and enforced globally at the ORM layer using Hibernate 6 `@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")`.
  - **Inbound Tenant Resolution**:
    - **Buyer Storefront**: Resolved dynamically from HTTP `Host` header (custom domain or subdomain) or `?store=<slug>` parameter via Next.js Edge Middleware.
    - **Merchant Admin**: Resolved securely from authenticated JWT claims (`tenant_id`).
    - **Development/API Testing**: Resolved via `X-Tenant-Slug` or `X-Tenant-ID` headers.
  - **Context Propagation**: Managed via `TenantContextFilter` and stored in `ThreadLocal<TenantContext>`, safely evicted in a `finally` block to prevent thread pool leakage.
- **Domain Event-Driven Core**:
  - Spring domain event publisher decoupled checkout from catalog mutation (`OrderPlacedEvent` -> `OrderDomainEventListener`).
  - Automatic inventory decrement and merchant alerts triggered upon order placement without blocking user checkout response times.
- **Dynamic Buyer Storefront**:
  - Next.js 14 App Router with SSR/ISR for SEO optimization, Zustand cart drawer, and interactive checkout modal.
- **Merchant Admin Console**:
  - React 18 + Vite + Tailwind CSS + TanStack Query with dashboard metrics, full catalog and variant management, order processing, and branding customization.
- **Shared Types**:
  - `@amazingdeal/shared-types` monorepo package enforcing strict TypeScript DTO contracts between backend and client applications.

---

## 📁 Repository Structure

```text
amazingdeal-platform/
├── apps/
│   ├── admin-web/              # React 18 + Vite + Tailwind CSS Merchant Console
│   └── storefront-web/         # Next.js 14 App Router Dynamic Buyer Storefront
├── packages/
│   └── shared-types/           # Shared TypeScript interfaces & DTO contracts
├── services/
│   └── commerce-api/           # Spring Boot 3 (Java 21) Modular Monolith
│       ├── src/main/java/com/amazingdeal/commerce/
│       │   ├── core/           # Multi-tenancy filter, security, domain events, config
│       │   └── modules/        # tenant, catalog, cart, order, media
│       └── src/main/resources/
│           ├── application.yml # Dev (H2 PostgreSQL mode) & Prod (PostgreSQL)
│           └── db/migration/   # Flyway migrations (V1, V2, V3)
└── infra/
    └── docker-compose.yml      # Optional PostgreSQL 16, Redis 7, MinIO local services
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Java 21 LTS**
- **Node.js 18+ / 20+**
- **pnpm 9+ / 10+ / 12+**

### 1. Start Backend API (`services/commerce-api`)
The backend is pre-configured with Flyway migrations and an in-memory database in `dev` profile. It automatically seeds demo stores on initial launch:

```bash
cd services/commerce-api
./mvnw.cmd spring-boot:run
# Backend starts on http://localhost:8080
```

To run against PostgreSQL (via Docker or Supabase):
```bash
SPRING_PROFILES_ACTIVE=prod SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/amazingdeal_commerce ./mvnw.cmd spring-boot:run
```

### 2. Start Merchant Admin Console (`apps/admin-web`)
```bash
pnpm dev:admin
# Accessible at http://localhost:5173
```

### 3. Start Dynamic Buyer Storefront (`apps/storefront-web`)
```bash
pnpm dev:storefront
# Accessible at http://localhost:3000
```

---

## 🏪 Pre-Seeded Demo Stores & Credentials

The automatic database seeder initializes 2 full sample stores with distinct branding and catalogs:

### Store 1: Stride Footwear
- **Slug**: `footwear`
- **Storefront URL**: [http://localhost:3000/?store=footwear](http://localhost:3000/?store=footwear) (or `http://footwear.localhost:3000`)
- **Admin Console Login**:
  - **Email**: `admin@stridefootwear.com`
  - **Password**: `password123`

### Store 2: Urban Threads
- **Slug**: `threads`
- **Storefront URL**: [http://localhost:3000/?store=threads](http://localhost:3000/?store=threads) (or `http://threads.localhost:3000`)
- **Admin Console Login**:
  - **Email**: `admin@urbanthreads.com`
  - **Password**: `password123`

---

## 🧪 Verification & Automated Tests

All tests and builds pass cleanly:

```bash
# Run backend multi-tenancy & isolation tests
cd services/commerce-api && ./mvnw.cmd test

# Typecheck and build all frontend packages and apps
pnpm typecheck
pnpm build
```

---

## 🚀 Zero-Cash Budget Cloud Deployment Guide

1. **Database**: Provision a free PostgreSQL instance on [Supabase](https://supabase.com) or [Neon](https://neon.tech) ($0/month).
2. **Backend**: Deploy `services/commerce-api` to [Render](https://render.com) Web Service or [Railway](https://railway.app) ($0 hobby tier).
   - Set environment variables: `SPRING_PROFILES_ACTIVE=prod` and `SPRING_DATASOURCE_URL=<supabase_jdbc_url>`.
3. **Buyer Storefront**: Deploy `apps/storefront-web` to [Vercel](https://vercel.com) ($0 hobby tier).
   - Configure wildcard domains (`*.yourdomain.com`) in Vercel settings.
4. **Merchant Admin**: Deploy `apps/admin-web` to [Cloudflare Pages](https://pages.cloudflare.com) or Vercel static hosting ($0/month).
