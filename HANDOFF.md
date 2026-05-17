# CardVault — Agent Handoff Document
## Updated: 2026-05-17 12:54 GMT+8

---

## 🔗 Project Links

| Resource | URL |
|----------|-----|
| **เว็บ (Production)** | https://cardvault-drab.vercel.app/ |
| **GitHub Repo** | https://github.com/photsathonspd1-create/cardvault |
| **Vercel Dashboard** | https://vercel.com/photsathon-kumtaews-projects/cardvault |
| **Supabase Project** | `ruugptsudyxyozywevcu` |
| **Supabase URL** | https://ruugptsudyxyozywevcu.supabase.co |

---

## 📦 Tech Stack

- **Framework:** Next.js 14.2.21 (App Router)
- **Database:** Prisma + Supabase (PostgreSQL)
- **Auth:** NextAuth 5.0.0-beta.25 (Credentials + LINE OAuth)
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion
- **Payment:** Omise (Thai payment gateway) — webhook handler done, frontend not wired
- **Hosting:** Vercel (auto-deploy from `main` branch)
- **Font:** Sarabun (Thai) + Inter (Latin) — Google Fonts
- **Rate Limiting:** Upstash Redis (fallback: in-memory)
- **Card OCR:** Tesseract.js + Pokemon TCG API

---

## ✅ สิ่งที่เสร็จแล้ว (Verified Working)

### Frontend → Backend Wiring (2026-05-17 12:54)

| # | Feature | File | Status |
|---|---------|------|--------|
| 1 | **Login** | `app/(auth)/login/page.tsx` | ✅ `signIn("credentials")` + error display + redirect |
| 2 | **Register** | `app/(auth)/register/page.tsx` | ✅ `POST /api/auth/register` + auto login + validation |
| 3 | **Forgot Password** | `app/(auth)/forgot-password/page.tsx` | ✅ `POST /api/auth/forgot-password` (real API) |
| 4 | **Forgot Password API** | `app/api/auth/forgot-password/route.ts` | ✅ Token generation + VerificationToken storage |
| 5 | **Sell — Condition Enum** | `app/sell/new/page.tsx` | ✅ Fixed: NM→NEAR_MINT, EX→EXCELLENT, GD→GOOD, PL→PLAYED |
| 6 | **Sell — File Upload** | `app/sell/new/page.tsx` | ✅ `<input type="file">` + preview grid + remove |
| 7 | **Sell — Submit** | `app/sell/new/page.tsx` | ✅ `POST /api/listings` + redirect to /sell/listings |
| 8 | **Sell — Card Search** | `app/sell/new/page.tsx` | ✅ Pokemon TCG API search integration |
| 9 | **Homepage Search** | `app/(main)/page.tsx` | ✅ `<form action="/browse?q=...">` |
| 10 | **Header Auth** | `components/shared/header.tsx` | ✅ Login/Register when unauthenticated, User menu + Logout when authenticated |
| 11 | **Header Search** | `components/shared/header.tsx` | ✅ Search form navigates to /browse?q= |
| 12 | **Orders Auth Guard** | `app/(main)/orders/page.tsx` | ✅ `redirect("/login")` if not authenticated |
| 13 | **Footer Social Links** | `components/shared/footer.tsx` | ✅ Updated from `#` to real URLs |

### UI Redesign (Prior Agent — 2026-05-17)

| # | Page | Status |
|---|------|--------|
| 1 | Homepage | ✅ Redesigned (hero, categories, hot this week, verified sellers) |
| 2 | Browse | ✅ Redesigned (filter sidebar, grid) |
| 3 | Listing Detail | ✅ Redesigned |
| 4 | Sell/New (4-step wizard) | ✅ Redesigned + Fixed |
| 5 | Seller Dashboard | ✅ Redesigned |
| 6 | Profile | ✅ Redesigned |
| 7 | Scammer Check | ✅ Redesigned |
| 8 | Admin Panel | ✅ Redesigned |
| 9 | Auth (Login + Register) | ✅ Redesigned + Wired |
| 10 | How It Works / FAQ / Contact / Escrow / Terms / Privacy | ✅ Redesigned |
| 11 | Checkout | ✅ Fixed types + working form |
| 12 | All shared components | ✅ Navbar, Footer, MobileNav, LiveToast, Hero, etc. |

### Backend API (Already Working)

| API Endpoint | Status |
|-------------|--------|
| `POST /api/auth/register` | ✅ |
| `GET/POST /api/auth/[...nextauth]` | ✅ Credentials + LINE |
| `POST /api/auth/forgot-password` | ✅ NEW |
| `GET/POST /api/listings` | ✅ |
| `POST /api/orders` | ✅ |
| `POST /api/cards/identify` | ✅ OCR + Pokemon TCG |
| `POST /api/webhooks/omise` | ✅ HMAC verify |
| `GET /api/cron/escrow-release` | ✅ Auto-release |

### Escrow System (Complete)

- Hold → Release → Refund → Freeze → Auto-release (7 days)
- Platform fee calculation (5% base, tier-based)
- Seller tier auto-upgrade

---

## ❌ สิ่งที่ยังไม่เสร็จ / ต้องทำต่อ

### 🔴 Critical — ต้องทำก่อนใช้งานจริง

| # | Issue | Detail |
|---|-------|--------|
| 1 | **Environment Variables** | ต้อง set ใน Vercel Dashboard: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| 2 | **Database Migration** | รัน `npx prisma db push` หรือ `npx prisma migrate deploy` บน Supabase |
| 3 | **Seed Data** | รัน `npx prisma db seed` หรือ import `seed.sql` |
| 4 | **Image Upload** | ยังใช้ data URL — ต้องเปลี่ยนเป็น Supabase Storage หรือ S3 |
| 5 | **Email Service** | Forgot password สร้าง token แล้วแต่ยังไม่ส่งอีเมลจริง — ต้องเพิ่ม Resend/SendGrid |

### 🟡 Important — ควรทำ

| # | Feature | Detail |
|---|---------|--------|
| 6 | **Omise Payment Frontend** | Backend webhook ทำงาน แต่ frontend ไม่มี Omise.js integration — จ่ายเงินไม่ได้ |
| 7 | **Seller Dashboard → Real Data** | ตอนนี้ใช้ mock data ต้อง query จาก DB จริง |
| 8 | **Profile Page → Real Data** | `/profile` ควรดึงจาก session + DB |
| 9 | **Hot This Week → Real Data** | Component ใช้ mock data |
| 10 | **Rate Limiting** | In-memory fallback ไม่ work ใน serverless — ต้อง set Upstash Redis env |
| 11 | **LINE OAuth** | ต้อง set `LINE_CLIENT_ID` + `LINE_CLIENT_SECRET` ใน env |
| 12 | **Cron Job** | ต้องตั้ง `CRON_SECRET` env + vercel.json cron config |
| 13 | **Admin Sub-pages** | `/admin/listings`, `/admin/disputes`, `/admin/users` — ยังมี `@ts-nocheck` บางไฟล์ |

### 🟢 Nice to Have

| # | Feature | Detail |
|---|---------|--------|
| 14 | Price history chart (Recharts) | Listing detail page |
| 15 | Card scanner camera | Step 1 of sell wizard — ตอนนี้แค่ file upload |
| 16 | Chat/messaging | Buyer ↔ Seller |
| 17 | Watchlist functionality | Schema มี แต่ UI ไม่มี |
| 18 | Notification system | Schema มี แต่ UI ไม่มี |
| 19 | Community/Forum pages | Schema มี แต่ UI ยัง incomplete |

---

## ⚠️ Known Issues

1. **Sell page preview** — ยังใช้ `SERIES_LABELS` จาก utils ซึ่งอาจ undefined ถ้าไม่มี export
2. **`@ts-nocheck`** — ยังมีอยู่ใน API routes (ไม่กระทบ UI แต่ควรแก้)
3. **Omise Payment** — ไม่มี frontend charge creation → checkout สร้าง order ได้แต่จ่ายเงินไม่ได้
4. **Supabase** — project นี้ใช้ Prisma ตรง ไม่ได้ใช้ Supabase Auth — Supabase เป็นแค่ PostgreSQL host

---

## 🔑 Environment Variables ที่ต้อง set ใน Vercel

```
DATABASE_URL=postgresql://...  (from Supabase)
NEXTAUTH_SECRET=<random string>
NEXTAUTH_URL=https://cardvault-drab.vercel.app
SUPABASE_URL=https://ruugptsudyxyozywevcu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OMISE_SECRET_KEY=<omise key>
OMISE_WEBHOOK_SECRET=<omise webhook secret>
CRON_SECRET=<random string>
LINE_CLIENT_ID=<optional>
LINE_CLIENT_SECRET=<optional>
POKEMON_TCG_API_KEY=<optional>
UPSTASH_REDIS_REST_URL=<optional>
UPSTASH_REDIS_REST_TOKEN=<optional>
```

---

## 🚀 Deploy Flow

```bash
# Push to main = auto deploy on Vercel
git add -A && git commit -m "message" && git push origin main
```

---

## 📁 Project Structure

```
cardvault/
├── app/
│   ├── (auth)/              # Login, Register, Forgot Password
│   ├── (main)/              # Main layout (Header/Footer/MobileNav)
│   │   ├── browse/          # Browse with filter sidebar
│   │   ├── listing/[id]     # Listing detail
│   │   ├── orders/          # Orders (auth guarded)
│   │   ├── checkout/[id]    # Checkout flow
│   │   ├── profile/         # User profile (auth guarded)
│   │   └── page.tsx         # Homepage
│   ├── admin/               # Admin panel
│   ├── sell/                # Seller pages
│   │   ├── new/             # 4-step sell wizard (FIXED)
│   │   ├── listings/        # My listings
│   │   └── orders/          # Seller orders
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth + register + forgot-password
│   │   ├── listings/        # CRUD listings
│   │   ├── orders/          # Create orders
│   │   ├── cards/identify/  # Card OCR + search
│   │   ├── webhooks/omise/  # Payment webhook
│   │   └── cron/            # Escrow auto-release
│   └── check/               # Scammer check
├── components/
│   ├── home/                # Homepage components
│   ├── browse/              # Browse components
│   ├── shared/              # Header, Footer, MobileNav, Providers
│   ├── listing/             # Listing components
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── auth.ts              # NextAuth config (Credentials + LINE)
│   ├── prisma.ts            # Prisma client
│   ├── utils.ts             # Utilities
│   └── rate-limit.ts        # Rate limiting (Upstash + in-memory fallback)
├── services/
│   ├── escrow.service.ts    # Escrow system (hold/release/refund/freeze)
│   ├── card-identify.service.ts  # OCR + Pokemon TCG API
│   └── tier.service.ts      # Seller tier auto-upgrade
├── prisma/
│   └── schema.prisma        # Full schema (User, Listing, Order, Dispute, etc.)
└── vercel.json              # Vercel config
```

---

## 🎯 Design System

```
bg:       zinc-950 (#09090b)
accent:   amber-500 (#F59E0B)
purple:   violet-600 (#7C3AED)
text:     zinc-50 (#FAFAFA)
muted:    zinc-400 (#A1A1AA)
border:   zinc-800 (#27272A)
success:  green-500 (#22C55E)
danger:   red-500 (#EF4444)
Font TH:  Sarabun
Font EN:  Inter
```

---

*Last Updated: 2026-05-17 12:54 GMT+8*
*Commit: 7d2576d — "fix: wire up frontend to backend APIs"*
