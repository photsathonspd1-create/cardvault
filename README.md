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
- 🔐 Email + Password authentication (LINE Login placeholder)
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

Copy `.env` and configure:

```bash
cp .env .env.local
# Edit .env.local with your database credentials
```

### 3. Set up database

```bash
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
3. Set environment variables
4. Vercel Cron runs `/api/cron/escrow-release` daily at 3:00 AM ICT

## License

MIT
