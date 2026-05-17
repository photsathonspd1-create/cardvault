# CardVault — Complete Agent Prompt

> **Copy this entire document to your next agent session.**
> It contains everything you need to pick up where the previous agent left off.

---

## 🎯 สรุปสั้นๆ

คุณกำลังทำงานบน **CardVault** — ตลาดซื้อ-ขายการ์ด TCG ออนไลน์อันดับ 1 ของไทย (Pokemon, Yu-Gi-Oh!, MTG, One Piece, Vanguard)

**สถานะปัจจุบัน:** เว็บ UI ใช้ได้ครบทุกหน้า แต่ยังซื้อ-ขายจริงไม่ได้ (ไม่มี payment, upload, email)
**สิ่งที่ต้องทำต่อ:** แก้ NextAuth บน Netlify → เพิ่ม Omise payment → R2 upload → Resend email

---

## 🔗 URLs & Credentials

```
# Live Sites
Netlify (active):    https://cardvault-tcg.netlify.app
Vercel (paused):     https://cardvault-drab.vercel.app  (deploy limit 100/day, resets ~2026-05-18 15:00)

# Repo
GitHub:              https://github.com/photsathonspd1-create/cardvault

# Dashboards
Netlify Dashboard:   https://app.netlify.com/sites/cardvault-tcg
Vercel Dashboard:    https://vercel.com/dashboard
Supabase Dashboard:  https://supabase.com/dashboard/project/ruugptsudyxyozywevcu

# Credentials (ask human if missing)
GitHub PAT:          <ask human>
Netlify Token:       nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86
Netlify Site ID:     8dcb5718-5634-4c41-939b-7d229bca2aab
Vercel Token:        <ask human>
Vercel Project ID:   prj_FoW9G9bBDARIEK573IjP1ZDYwAZU
Supabase URL:        https://ruugptsudyxyozywevcu.supabase.co
Supabase Project:    ruugptsudyxyozywevcu
Supabase Key:        <in env vars — check Netlify/Vercel dashboard>
```

---

## 🏗️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 App Router | `app/` directory, RSC, Server Actions |
| Styling | Tailwind CSS + shadcn/ui | Components in `components/ui/` |
| Animation | Framer Motion | Used on homepage, cards |
| Database | Supabase PostgreSQL | Accessed via **custom Prisma proxy** |
| ORM | Prisma (proxy) | `lib/prisma.ts` — translates to PostgREST |
| Auth | NextAuth v5 beta | Credentials + LINE OAuth |
| Payment | Omise | PromptPay QR + Credit Card (**NOT CONFIGURED**) |
| Storage | Cloudflare R2 | S3-compatible (**NOT CONFIGURED**) |
| Email | Resend | (**NOT CONFIGURED**) |
| OCR | Tesseract.js | Card scanner (crashes on serverless, has fallback) |
| Rate Limit | Upstash Redis | Or in-memory fallback |
| Charts | Recharts | Price history, analytics |

---

## ⚠️ CRITICAL: Prisma Proxy

**ไฟล์:** `lib/prisma.ts` (~2200 บรรทัด)
**หน้าที่:** แปลง Prisma queries → Supabase PostgREST calls

**นี่คือความเสี่ยงอันดับ 1 ของโปรเจคนี้** — ทุก query ที่ใช้ `prisma.model.findMany(...)` ผ่าน proxy นี้

### ข้อจำกัดที่รู้จัก:
- `$transaction` ไม่ใช่ real transaction — แค่ sequential calls
- `$queryRaw` / `$queryRawUnsafe` ไม่รองรับ
- Nested `orderBy` ใน includes ไม่รองรับ (ใช้ได้แค่ `take`)
- `increment`/`decrement` ทำ read-then-write (race condition ได้)
- `_count` ใน nested includes ต้องใช้ `processNestedCounts()` ที่เพิ่มมา
- One-to-one relations กลับมาเป็น array จาก PostgREST → ต้องใช้ `unwrapOneToOneArrays()`

### ฟังก์ชันหลักใน proxy:
```
buildSelectStringSimple()  — สร้าง PostgREST select string จาก Prisma include/select
buildPostgrestFilters()    — แปลง Prisma where → PostgREST filter params
remapTableKeys()           — PascalCase → camelCase (SellerProfile → sellerProfile)
unwrapOneToOneArrays()     — แปลง array เป็น object สำหรับ one-to-one
processNestedCounts()      — จัดการ _count ใน nested includes
fetchIncludes()            — Fallback: ดึง nested data แยก (ใช้เมื่อ PostgREST fail)
postgrestFetch()           — Raw fetch ไป Supabase PostgREST
```

### วิธี debug เมื่อ query ไม่ทำงาน:
1. เช็ค Vercel/Netlify function logs
2. ลอง query ตรงกับ Supabase PostgREST:
   ```bash
   curl -s "https://ruugptsudyxyozywevcu.supabase.co/rest/v1/TableName?select=*" \
     -H "apikey: <SUPABASE_KEY>" \
     -H "Authorization: Bearer <SUPABASE_KEY>"
   ```
3. ดูว่า `buildSelectStringSimple()` สร้าง select string ถูกมั้ย
4. เช็คว่า `remapTableKeys()` remap ชื่อถูกมั้ย

---

## ✅ สิ่งที่เสร็จแล้ว (15 bug fixes)

| # | ปัญหา | แก้ไข | ไฟล์ |
|---|---|---|---|
| 1 | PostgREST ส่ง PascalCase แต่ frontend คาด camelCase | `remapTableKeys()` | `lib/prisma.ts` |
| 2 | Homepage crash — orderBy ใน nested include | เอา orderBy ออก | `app/(main)/page.tsx` |
| 3 | Register 500 — OR filter ผิด format | แยกเป็น 2 findUnique | `app/api/auth/register/route.ts` |
| 4 | Nested select ขาด `*` | เพิ่ม `*` ใน innerParts | `lib/prisma.ts` |
| 5 | OR filter `or=(a),(b)` แทน `or=(a,b)` | เปลี่ยน join separator | `lib/prisma.ts` |
| 6 | Debug endpoint เปิด public | เพิ่ม auth check (ADMIN only) | `app/api/debug/route.ts` |
| 7 | Hardcoded secrets เป็น fallback | ลบออก, throw ถ้าไม่มี env var | `lib/prisma.ts`, `lib/supabase-client.ts` |
| 8 | Escrow cron ตรวจแค่ Bearer | รับทั้ง Bearer + x-vercel-cron-secret | `app/api/cron/escrow-release/route.ts` |
| 9 | Tesseract.js crash บน serverless | Try-catch fallback | `services/card-identify.service.ts` |
| 10 | Mock upload handler ไม่มี | สร้าง `/api/upload/mock` | `app/api/upload/mock/route.ts` |
| 11 | Checkout ไม่ตรวจ auth | เพิ่ม redirect UI | `app/(main)/checkout/[listingId]/page.tsx` |
| 12 | Email service ซ้ำกัน | รวมเป็น lib/resend.ts | `lib/email.ts`, `lib/resend.ts` |
| 13 | PostgREST insert ขาด defaults | เพิ่ม createdAt/updatedAt | `lib/prisma.ts` |
| 14 | **Profile crash** — 1:1 relation เป็น array | `unwrapOneToOneArrays()` + `processNestedCounts()` | `lib/prisma.ts` |
| 15 | **Settings 404** | สร้าง /settings + PATCH /api/users/me | `app/(main)/settings/page.tsx` |

### UI ที่เสร็จแล้ว (10 pages redesigned):
Homepage, Browse, Listing Detail, Sell/New (4-step wizard), Seller Dashboard, Order Detail, Profile, Scammer Check, Admin Panel, Auth (Login + Register)

### Design System:
```
Background:   #09090b (zinc-950)
Accent:       #F59E0B (amber-500)
Purple:       #7C3AED
Font Thai:    Sarabun
Font Latin:   Inter
Theme:        "Dark Gaming Luxury" — Steam meets Binance meets Japanese card shop
Tokens:       lib/design-tokens.ts, tailwind.config.ts, app/globals.css
```

---

## 🔴 สิ่งที่ต้องทำต่อ (เรียงตามความสำคัญ)

### 1. NextAuth บน Netlify — พังอยู่ (สำคัญที่สุด)

**ปัญหา:** `/api/auth/session` return 500 บน Netlify Login/register น่าจะไม่ทำงาน

**สาเหตุ:** NextAuth edge runtime + Netlify edge functions ไม่เข้ากัน
- `middleware.ts` import `auth` จาก `lib/auth.ts` → import `prisma` → import `supabase-client`
- Netlify แปลง middleware เป็น edge function → ตอน bundle ไม่มี env vars → crash

**วิธีแก้ที่ลองได้:**
1. **Option A:** ย้าย auth check ออกจาก middleware → ใช้ server component check แทน
2. **Option B:** ใช้ `export const config = { runtime: 'nodejs' }` ใน API routes
3. **Option C:** ใช้ Netlify's built-in identity แทน NextAuth
4. **Option D:** ตั้ง `NEXTAUTH_URL` ให้ถูก + เช็คว่า edge function รับ env vars ได้

**Debug:**
```bash
# ดู Netlify function logs
# ไปที่ https://app.netlify.com/sites/cardvault-tcg/logs/functions
# หรือ
netlify functions:list
```

**ไฟล์ที่เกี่ยว:**
- `middleware.ts` — route protection
- `lib/auth.ts` — NextAuth config
- `app/api/auth/[...nextauth]/route.ts` — handler

### 2. Omise Payment

**ต้องการ:** `OMISE_PUBLIC_KEY` (pkey_...), `OMISE_SECRET_KEY` (skey_...), `OMISE_WEBHOOK_SECRET`

**ขั้นตอน:**
1. สมัคร https://www.omise.co
2. รับ API keys จาก dashboard
3. ตั้ง env vars ใน Netlify/Vercel
4. เพิ่ม Omise.js SDK ใน frontend สำหรับ credit card tokenization
5. ทดสอบ PromptPay QR flow

**ไฟล์ที่เกี่ยว:**
- `lib/omise.ts` — client wrapper (ready, แค่ใส่ keys)
- `app/api/payments/charge/route.ts` — สร้าง charges
- `app/api/webhooks/omise/route.ts` — รับ payment callbacks
- `services/escrow.service.ts` — escrow hold/release/refund

### 3. Cloudflare R2 Storage

**ต้องการ:** `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

**ขั้นตอน:**
1. สร้าง Cloudflare R2 bucket
2. สร้าง API token ที่มี R2 permissions
3. ตั้ง env vars
4. Config custom domain สำหรับ public access

**ไฟล์ที่เกี่ยว:**
- `lib/r2.ts` — S3-compatible client (ready)
- `app/api/upload/presigned-url/route.ts` — presigned PUT URLs

### 4. Resend Email

**ต้องการ:** `RESEND_API_KEY` (re_...), `RESEND_FROM_EMAIL`

**ขั้นตอน:**
1. สมัคร https://resend.com
2. รับ API key
3. Verify domain ใน Resend dashboard
4. ตั้ง env vars

**ไฟล์ที่เกี่ยว:**
- `lib/resend.ts` — email templates (order paid, shipped, completed, dispute, password reset)

### 5. CRON_SECRET

```bash
openssl rand -hex 32
# ตั้งเป็น CRON_SECRET ใน env vars
# สำหรับ escrow auto-release cron
```

---

## 📁 โครงสร้างไฟล์

```
cardvault/
├── app/
│   ├── (auth)/                    # Auth pages (login, register, forgot-password, reset-password)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (main)/                    # Main layout pages (header + footer + mobile nav)
│   │   ├── page.tsx               # Homepage
│   │   ├── browse/page.tsx        # Browse listings
│   │   ├── listing/[id]/page.tsx  # Listing detail
│   │   ├── card/[catalogId]/page.tsx # Card catalog detail
│   │   ├── checkout/[listingId]/page.tsx
│   │   ├── profile/page.tsx       # Own profile (auth required)
│   │   ├── profile/[username]/page.tsx # Public profile
│   │   ├── settings/page.tsx      # Account settings (NEW)
│   │   ├── orders/page.tsx        # Orders list
│   │   ├── orders/[id]/page.tsx   # Order detail
│   │   ├── check/page.tsx         # Scammer check
│   │   ├── community/page.tsx     # Community feed
│   │   ├── community/forum/page.tsx
│   │   ├── community/forum/[threadId]/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── contact/page.tsx
│   │   └── escrow-info/page.tsx
│   ├── admin/                     # Admin panel (ADMIN role required)
│   │   ├── page.tsx               # Dashboard
│   │   ├── users/page.tsx
│   │   ├── listings/page.tsx
│   │   ├── kyc/page.tsx
│   │   └── disputes/page.tsx
│   ├── sell/                      # Seller dashboard (auth required)
│   │   ├── page.tsx               # Dashboard
│   │   ├── new/page.tsx           # New listing wizard
│   │   ├── listings/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── kyc/page.tsx
│   │   └── subscription/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   ├── register/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── listings/route.ts      # GET listings
│   │   ├── listings/[id]/route.ts
│   │   ├── orders/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── users/
│   │   │   ├── [id]/route.ts      # GET user profile
│   │   │   └── me/route.ts        # GET/PATCH own profile (NEW)
│   │   ├── payments/charge/route.ts
│   │   ├── webhooks/omise/route.ts
│   │   ├── upload/route.ts
│   │   ├── upload/mock/route.ts
│   │   ├── upload/presigned-url/route.ts
│   │   ├── community/posts/route.ts
│   │   ├── forum/threads/route.ts
│   │   ├── cron/escrow-release/route.ts
│   │   ├── debug/route.ts
│   │   └── ...
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles + CSS variables
│   ├── error.tsx                  # Global error boundary
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── shared/                    # Header, Footer, MobileBottomNav, LiveToast, etc.
│   ├── home/                      # Homepage sections
│   ├── browse/                    # Filter sidebar
│   ├── listing/                   # Listing card
│   ├── order/                     # Escrow status, confirm/dispute buttons
│   ├── scanner/                   # Card scanner (Tesseract.js)
│   └── sell-mobile-nav.tsx
├── lib/
│   ├── prisma.ts                  # ⚠️ Custom Prisma→PostgREST proxy (~2200 lines)
│   ├── supabase-client.ts         # Supabase admin (lazy init via Proxy)
│   ├── auth.ts                    # NextAuth config
│   ├── omise.ts                   # Payment client
│   ├── r2.ts                      # Storage client
│   ├── resend.ts                  # Email sender
│   ├── rate-limit.ts              # Rate limiting
│   ├── design-tokens.ts           # UI tokens
│   ├── email.ts                   # Re-exports from resend.ts
│   └── utils.ts                   # formatPrice, getInitials, getRelativeTime, etc.
├── services/
│   ├── escrow.service.ts          # Escrow hold/release/refund
│   ├── card-identify.service.ts   # OCR + Pokemon TCG API
│   ├── tier.service.ts            # Seller tier auto-upgrade
│   └── notification.service.ts    # Notifications
├── prisma/
│   ├── schema.prisma              # Database schema (all models + enums)
│   └── seed.ts                    # Seed data
├── middleware.ts                   # Route protection + security headers
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── netlify.toml                   # Netlify config (NEW)
├── vercel.json                    # Vercel config
├── HANDOFF.md                     # Detailed status doc
├── PROMPT_FOR_NEXT_AGENT.md       # This file
├── CardVault_MasterSystem_v2.1.md # Full system spec (2500+ lines)
└── .env.example                   # Env vars template
```

---

## 🔄 Workflow

### Setup
```bash
cd /root/.openclaw/workspace/cardvault
git config user.email "agent@openclaw.ai"
git config user.name "OpenClaw Agent"
git remote set-url origin https://<GITHUB_PAT>@github.com/photsathonspd1-create/cardvault.git
git pull origin main
npm install
```

### Build & Test
```bash
npx tsc --noEmit          # TypeScript check (ต้องไม่มี error)
npm run build             # Full build (ต้องมี env vars)
```

### Deploy
```bash
# Netlify (preferred — Vercel limit reached)
export NETLIFY_AUTH_TOKEN="nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86"
netlify deploy --prod --build

# Vercel (เมื่อ limit reset)
git push origin main      # auto-deploy
```

### Git Rules
```bash
# Commit format
git commit -m "fix: description"    # bug fix
git commit -m "feat: description"   # new feature
git commit -m "docs: description"   # documentation

# ⚠️ NEVER commit secrets — GitHub will block the push
# ⚠️ Always run npx tsc --noEmit before pushing
```

---

## 🧪 วิธีทดสอบ

### เช็คหน้าเว็บ:
```bash
# ทุกหน้าควร return 200
curl -s -o /dev/null -w "%{http_code}" https://cardvault-tcg.netlify.app/
curl -s -o /dev/null -w "%{http_code}" https://cardvault-tcg.netlify.app/browse
curl -s -o /dev/null -w "%{http_code}" https://cardvault-tcg.netlify.app/settings
curl -s -o /dev/null -w "%{http_code}" https://cardvault-tcg.netlify.app/profile
curl -s -o /dev/null -w "%{http_code}" https://cardvault-tcg.netlify.app/login
```

### เช็ค API:
```bash
# Listings API (ควร return ข้อมูล)
curl -s https://cardvault-tcg.netlify.app/api/listings | python3 -m json.tool | head -20

# Auth session (⚠️ currently 500 on Netlify)
curl -s https://cardvault-tcg.netlify.app/api/auth/session
```

### เช็ค Supabase ตรง:
```bash
# ดู users ใน database
curl -s "https://ruugptsudyxyozywevcu.supabase.co/rest/v1/User?select=id,email,name,username,role&limit=5" \
  -H "apikey: <SUPABASE_KEY>" \
  -H "Authorization: Bearer <SUPABASE_KEY>"

# ดู listings
curl -s "https://ruugptsudyxyozywevcu.supabase.co/rest/v1/Listing?select=id,customName,price,status&limit=5" \
  -H "apikey: <SUPABASE_KEY>" \
  -H "Authorization: Bearer <SUPABASE_KEY>"
```

---

## 📊 Database Schema (สำคัญ)

### Models หลัก:
- **User** — ผู้ใช้ (role: USER/SELLER/ADMIN/SUPER_ADMIN)
- **SellerProfile** — โปรไฟล์ผู้ขาย (tier: BRONZE/SILVER/GOLD/VERIFIED_PRO)
- **Listing** — รายการขาย (status: DRAFT/PENDING_REVIEW/ACTIVE/SOLD/PAUSED/EXPIRED/REJECTED)
- **Order** — ออเดอร์ (status: PENDING_PAYMENT/PAID/SHIPPED/DELIVERED/COMPLETED/DISPUTED/CANCELLED/REFUNDED)
- **CardCatalog** — แคตตาล็อกการ์ด
- **Review** — รีวิว
- **Dispute** — ข้อพิพาท
- **CommunityPost** — โพสต์ชุมชน
- **ForumThread/ForumReply** — ฟอรั่ม
- **ScammerReport** — รายงานมิจฉาชีพ

### Enums สำคัญ:
```
CardSeries:    POKEMON, YUGIOH, MTG, ONE_PIECE, VANGUARD, DIGIMON, OTHER
Condition:     MINT, NEAR_MINT, EXCELLENT, GOOD, PLAYED, POOR
CardLanguage:  THAI, JAPANESE, ENGLISH, KOREAN, OTHER
```

### Seed Data (prisma/seed.ts):
มี users 3 คน (admin, seller1, seller2), listings 5 รายการ, cards ใน CardCatalog

---

## ⚠️ Known Risks & Gotchas

1. **Prisma proxy = #1 risk** — query pattern ที่ไม่รองรับจะ return empty/wrong data เงียบๆ
2. **No real transactions** — order creation อาจ inconsistent ถ้า fail กลางทาง
3. **Supabase RLS bypassed** — service role key gives full access
4. **Tesseract OCR** — อาจไม่ทำงานกับภาษาไทย
5. **No error monitoring** — ไม่มี Sentry, ดูแค่ function logs
6. **bcryptjs edge warning** — compile warning แต่ไม่ crash (ใช้ nodejs runtime ไม่ใช่ edge)
7. **Env vars lazy init** — `getSupabaseUrl()` / `getSupabaseServiceKey()` ไม่ throw ตอน import, throw ตอนใช้
8. **Image domains** — `next.config.js` อาจต้องเพิ่ม `images.remotePatterns` สำหรับ Pokémon TCG API images
9. **Vercel deploy limit** — 100 deploys/day (free tier), หมดแล้ว, reset ~2026-05-18 15:00

---

## 🎯 ถ้าทำ NextAuth สำเร็จ → เว็บใช้ได้จริง

NextAuth เป็นจุดที่ block อยู่ ถ้าแก้ได้:
- ✅ Login/Register ทำงาน
- ✅ Profile/Settings แสดงข้อมูลจริง
- ✅ Sell dashboard ใช้ได้
- ✅ Admin panel ใช้ได้
- ✅ Checkout flow เริ่มได้ (ยังจ่ายเงินไม่ได้จนกว่าจะ config Omise)

**ขอให้โชคดี! 🚀**
