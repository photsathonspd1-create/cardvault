# 🔄 CardVault — Agent Handoff Document

**Last Updated:** 2026-05-17 00:10 GMT+8
**Working Directory:** `/root/.openclaw/workspace/cardvault`

---

## 📋 Project Overview

**CardVault** — Thai TCG (Trading Card Game) buy/sell marketplace with escrow system.

- **Live URL:** https://cardvault-drab.vercel.app
- **GitHub:** https://github.com/photsathonspd1-create/cardvault
- **Supabase Project Ref:** `ruugptsudyxyozywevcu`
- **Supabase Region:** `ap-southeast-1` (Singapore)
- **Vercel Project:** `photsathon-kumtaews-projects/cardvault`

---

## ✅ What's Done

### 1. Database Schema — COMPLETE ✅
- Created **29 tables** on Supabase via Management API SQL
- All enums (16), indexes, foreign keys, constraints created
- Tables: User, Account, Session, VerificationToken, SellerProfile, SellerSubscription, BankAccount, CardCatalog, PriceHistory, Listing, ListingImage, ShippingOption, Order, OrderStatusHistory, Dispute, DisputeEvidence, Review, Watchlist, PriceAlert, Notification, Report, AuditLog, SystemSetting, CommunityPost, PostComment, PostLike, ForumThread, ForumReply, ScammerReport

### 2. Seed Data — COMPLETE ✅
- **6 users** (1 admin, 3 sellers, 2 buyers) — password: `password123`
- **3 seller profiles** (GOLD, SILVER, VERIFIED_PRO tiers)
- **12 Pokemon cards** in CardCatalog (Charizard VMAX, Pikachu VMAX, Mew ex, etc.)
- **12 active listings** with images and shipping options
- **2 sample orders** (1 DELIVERED, 1 COMPLETED)
- **1 review**, **3 watchlist entries**, **2 notifications**, **4 system settings**

### 3. Vercel Environment Variables — PARTIALLY DONE ⚠️
Set via Vercel CLI:
- `DATABASE_URL` — set but **NOT WORKING** (see blockers below)
- `NEXTAUTH_SECRET` — ✅ set
- `NEXTAUTH_URL` — ✅ set to `https://cardvault-drab.vercel.app`
- `NEXT_PUBLIC_APP_URL` — ✅ set
- `PLATFORM_FEE_PERCENT` — ✅ set to `6`
- `ESCROW_AUTO_RELEASE_DAYS` — ✅ set to `7`

### 4. Deployment — DEPLOYED BUT DB NOT CONNECTED ⚠️
- Site builds and deploys on Vercel ✅
- Pages render but **no data loads** because DB connection fails at runtime

---

## 🚧 Blockers — MUST FIX FIRST

### **BLOCKER: Database Connection Not Working**

The Supabase database connection string is not working from Vercel. Tested multiple formats:

| Format | Result |
|--------|--------|
| `postgresql://postgres:%2F%2ASa0834145774@db.ruugptsudyxyozywevcu.supabase.co:5432/postgres` | Can't reach server (port 5432 blocked) |
| `postgresql://postgres.ruugptsudyxyozywevcu:...@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` | "tenant/user not found" |
| `postgresql://postgres.ruugptsudyxyozywevcu:...@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` | "tenant/user not found" |

**Root Cause:** The Supabase connection pooler (Supavisor) is rejecting the connection. Possible reasons:
1. The database password `/*Sa0834145774` might be incorrect (user-provided, unverified)
2. The pooler might not be enabled on this project
3. The connection string format might be wrong for this Supabase project version

**How to Fix:**
1. Go to **Supabase Dashboard** → cardvault project → **Settings** → **Database**
2. Find the **Connection string** section → copy the **URI** (pooler or direct)
3. If password is unknown, click **Reset database password** and set a new one
4. Update `DATABASE_URL` in Vercel environment variables:
   - Vercel Dashboard → cardvault → Settings → Environment Variables → edit `DATABASE_URL`
   - Or use CLI: `vercel env rm DATABASE_URL production --yes && echo 'NEW_URL' | vercel env add DATABASE_URL production`
5. Redeploy: `vercel --prod --yes`

**Supabase Management API Access (for SQL queries):**
- Personal Access Token: `[SET_IN_ENV — SUPABASE_PAT]`
- Can run SQL via: `POST https://api.supabase.com/v1/projects/ruugptsudyxyozywevcu/database/query`
- Example: `curl -s -X POST "https://api.supabase.com/v1/projects/ruugptsudyxyozywevcu/database/query" -H "Authorization: Bearer $SUPABASE_PAT" -H "Content-Type: application/json" -d '{"query": "SELECT count(*) FROM \"User\""}'`

---

## 📁 Project Structure

```
cardvault/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (main)/           # Main layout
│   │   ├── browse/       # Browse listings (browse/page.tsx)
│   │   ├── listing/      # Listing detail
│   │   ├── checkout/     # Checkout flow
│   │   ├── orders/       # Buyer orders
│   │   └── profile/      # User profile
│   ├── sell/             # Seller pages
│   │   ├── new/          # Create listing (multi-step)
│   │   ├── listings/     # My listings
│   │   └── orders/       # Seller orders
│   ├── admin/            # Admin panel
│   │   ├── listings/     # Approve/reject
│   │   ├── disputes/     # Manage disputes
│   │   ├── kyc/          # KYC review
│   │   └── users/        # User management
│   ├── api/              # API routes (REST)
│   │   ├── auth/         # NextAuth + register
│   │   ├── listings/     # CRUD listings
│   │   ├── orders/       # Create orders
│   │   ├── cards/        # Card identification (OCR)
│   │   ├── community/    # Community posts
│   │   ├── forum/        # Forum threads/replies
│   │   ├── payments/     # Omise payment
│   │   ├── reports/      # Scammer reports
│   │   ├── subscriptions/# Seller subscriptions
│   │   ├── upload/       # File upload (R2 presigned URLs)
│   │   ├── users/        # User management
│   │   ├── webhooks/     # Omise webhooks
│   │   └── cron/         # Escrow auto-release
│   ├── community/        # Community page
│   ├── card/             # Card catalog detail
│   ├── check/            # Check page
│   └── login/register    # Auth pages
├── components/
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Header, Footer, etc.
├── lib/                  # Utilities, auth config, rate limiting
├── services/             # Business logic (escrow, card identify)
├── prisma/
│   ├── schema.prisma     # Database schema (29 tables, 16 enums)
│   └── seed.ts           # Seed script (Node.js version)
├── seed.sql              # SQL seed (already executed on Supabase)
└── .env.example          # Environment variable template
```

---

## 🔑 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| ORM | Prisma 5.22 |
| Database | Supabase (PostgreSQL 17.6) |
| Auth | NextAuth.js (credentials + LINE login) |
| Payment | Omise (Thai payment gateway) |
| Storage | Cloudflare R2 (images) |
| UI | shadcn/ui + Tailwind CSS |
| Hosting | Vercel |
| Rate Limiting | Upstash Redis (optional, falls back to in-memory) |
| Email | Resend |
| Card OCR | Pokemon TCG API (optional) |

---

## 📝 What's Left To Do

### Critical (site won't work without these)
1. **Fix DATABASE_URL** — Get correct connection string from Supabase dashboard
2. **Set remaining env vars on Vercel** (optional but needed for full functionality):
   - `OMISE_PUBLIC_KEY` / `OMISE_SECRET_KEY` — for payments
   - `R2_ENDPOINT` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` — for image uploads
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — for email notifications
   - `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` — for LINE login (optional)
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — for rate limiting (optional)

### Important
3. **Generate Prisma Client on Vercel** — `postinstall` script handles this, but needs DB connection for `db push`
4. **Run `prisma db push`** against Supabase from a machine with network access to port 5432 (or use pooler)
5. **Test all flows** — browse, login, create listing, checkout, orders, admin panel

### Nice to Have
6. **Set up Supabase RLS policies** (Row Level Security) — currently no RLS
7. **Set up Supabase Storage** as alternative to Cloudflare R2
8. **Configure custom domain** on Vercel (cardvault.co.th)
9. **Set up Omise webhook** endpoint for payment confirmations
10. **Cron job for escrow auto-release** (Vercel Cron or Supabase pg_cron)

---

## 🔐 Credentials Summary

| Service | Credential | Status |
|---------|-----------|--------|
| Supabase Management API | `[SUPABASE_PAT]` | Working ✅ |
| Supabase Anon Key | Available in Supabase Dashboard → API | Available |
| Supabase Service Role | Available in Supabase Dashboard → API | Available |
| Supabase DB Password | **Needs verification from Supabase Dashboard** | **Unverified** ⚠️ |
| Vercel Token | `[VERCEL_TOKEN]` | Working ✅ |
| GitHub Token | `[GITHUB_TOKEN]` | Working ✅ |

---

## 🧪 Test Accounts (Seeded Data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cardvault.co.th | password123 |
| Seller (GOLD) | seller1@example.com | password123 |
| Seller (SILVER) | seller2@example.com | password123 |
| Seller (VERIFIED_PRO) | seller3@example.com | password123 |
| Buyer | buyer1@example.com | password123 |
| Buyer | buyer2@example.com | password123 |

---

## 🛠️ Useful Commands

```bash
# Navigate to project
cd /root/.openclaw/workspace/cardvault

# Run SQL on Supabase via Management API
curl -s -X POST "https://api.supabase.com/v1/projects/ruugptsudyxyozywevcu/database/query" \
  -H "Authorization: Bearer $SUPABASE_PAT" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR_SQL_HERE"}'

# Deploy to Vercel
vercel --prod --token "$VERCEL_TOKEN" --yes

# Set Vercel env var
echo 'VALUE' | vercel env add KEY_NAME production --token "$VERCEL_TOKEN"

# Push to GitHub
git add -A && git commit -m "message" && git push origin main
```

---

## ⚡ Next Agent: Start Here

1. **First priority:** Fix the DATABASE_URL by getting the correct connection string from Supabase Dashboard
2. Then set it on Vercel and redeploy
3. Verify the site loads data at https://cardvault-drab.vercel.app/browse
4. Test login with test accounts above
