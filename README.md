# 🃏 CardVault Thailand

Marketplace ซื้อ-ขายการ์ด TCG ที่ใหญ่ที่สุดในประเทศไทย

## Tech Stack

- **Framework:** Next.js 14 (App Router + Server Actions)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma 5
- **Auth:** NextAuth.js v5 (JWT)
- **UI:** Tailwind CSS v3 + shadcn/ui
- **Rate Limiting:** Upstash Redis
- **Card OCR:** Tesseract.js
- **Card API:** Pokemon TCG API (pokemontcg.io)

## Features

- 🏠 Homepage with hero section, featured listings, browse by series
- 🔍 Browse listings with filters (series, condition, price, graded)
- 📄 Listing detail with image gallery, seller info, buy button
- 🔐 Email + Password authentication + LINE Login (OAuth)
- 💳 Omise payment integration (PromptPay QR + Credit Card)
- 📊 Seller analytics with revenue charts + tier progress
- 🛡️ KYC verification system
- 💎 Subscription plans (FREE / PRO / BUSINESS)
- 🏆 Seller tier auto-upgrade (Bronze → Silver → Gold → Verified Pro)
- 📱 Community forum with TCG categories
- 🔍 Scammer database + public check page
- 📈 Price history charts (30/90/180 days)
- 🔔 Email + in-app notification system
- 🛡️ Edge middleware (auth guard + security headers)
- 📝 Multi-step create listing form
- 📊 Seller dashboard with listings and orders
- 🛒 Order flow: buy → checkout → payment → confirmation
- 💰 Escrow system with auto-release (7 days)
- 👤 User profile with seller badge and reviews
- 🔧 Admin panel: listing approval, user management, disputes
- 🖼️ Card identification via OCR (Tesseract.js) + Pokemon TCG API
- ⚡ Rate limiting on all sensitive endpoints

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials (see .env.example for all options)
```

### 3. Set up database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with mock data
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test Accounts

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Admin  | admin@cardvault.co.th  | password123 |
| Seller | seller1@example.com    | password123 |
| Seller | seller3@example.com    | password123 |
| Buyer  | buyer1@example.com     | password123 |

## Project Structure

```
cardvault/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (main)/          # Main layout with header/footer
│   │   ├── browse/      # Browse listings
│   │   ├── listing/     # Listing detail
│   │   ├── checkout/    # Checkout flow
│   │   ├── orders/      # Buyer orders
│   │   └── profile/     # User profile
│   ├── sell/            # Seller pages
│   │   ├── new/         # Create listing (multi-step)
│   │   ├── listings/    # My listings
│   │   └── orders/      # Seller orders
│   ├── admin/           # Admin panel
│   │   ├── listings/    # Approve/reject listings
│   │   ├── disputes/    # Manage disputes
│   │   └── users/       # User management
│   └── api/             # API routes
│       ├── auth/        # NextAuth + register
│       ├── listings/    # CRUD listings
│       ├── orders/      # Create orders
│       ├── cards/       # Card identification (OCR)
│       ├── upload/      # File upload
│       ├── webhooks/    # Omise payment webhooks
│       └── cron/        # Escrow auto-release
├── components/
│   ├── ui/              # shadcn/ui components
│   └── shared/          # Header, Footer, Sidebar
├── lib/                 # Utilities, auth, rate limiting
├── services/            # Business logic (escrow, card identify)
└── prisma/              # Schema + seed data
```

## API Rate Limits

| Endpoint              | Limit              |
|-----------------------|--------------------|
| `/api/cards/identify` | 20 req/hr/user     |
| `/api/upload/*`       | 30 req/10min/user  |
| `/api/orders` POST    | 20 req/hr/user     |
| `/api/listings` POST  | 10 req/hr/user     |
| `/api/auth/login`     | 5 req/15min/IP     |

## Escrow System

1. Buyer pays → funds held in escrow (HOLDING)
2. Seller ships → order marked SHIPPED
3. Buyer confirms receipt → funds released (RELEASED)
4. Auto-release after 7 days if no response
5. Dispute freezes escrow (FROZEN)

## Deployment (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard (see `.env.example`)
4. Vercel Cron runs `/api/cron/escrow-release` daily at 20:00 UTC (3:00 AM ICT)

### Required env vars for production:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random string (32+ chars)
- `NEXTAUTH_URL` — Your domain (https://cardvault.co.th)
- `OMISE_PUBLIC_KEY` / `OMISE_SECRET_KEY` — Omise payment keys
- `R2_*` — Cloudflare R2 credentials for image storage
- `RESEND_API_KEY` — Resend email API key

### Optional:
- `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` — LINE Login
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis rate limiting
- `POKEMON_TCG_API_KEY` — Card identification API

## License

MIT

## New in This Update

### Payment System (Omise)
- PromptPay QR code payment
- Credit card payment via Omise.js
- Webhook handler for payment confirmation
- Automatic escrow hold on payment

### Seller System
- **Tier system**: Bronze → Silver → Gold → Verified Pro (auto-upgrade)
- **KYC verification**: ID card + selfie upload
- **Analytics dashboard**: Revenue charts, top cards, conversion rate
- **Subscriptions**: FREE / PRO / BUSINESS plans

### Community
- Forum threads grouped by TCG category
- Post feed with card tagging and listing links
- Like, comment, and bookmark

### Trust & Safety
- Public scammer database (`/check`)
- Community scammer reports with admin review
- Auto-check against blacklist during KYC

### Security
- Edge middleware with auth + role guards
- Security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting on all sensitive endpoints
- R2 presigned URL validation (type + size)
