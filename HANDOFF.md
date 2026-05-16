# 🃏 CardVault — Agent Handoff Document
**Last Updated:** 2026-05-16 22:25 GMT+8
**Repository:** https://github.com/photsathonspd1-create/cardvault
**Branch:** main

---

## 📊 Progress Summary

```
Phase 1 MVP:     ████████████████████ 100% ✅
Phase 2:         ████████████████████ 100% ✅
Phase 3:         ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## ✅ เสร็จแล้วทั้งหมด (All Completed)

### Infrastructure ✅
- [x] Next.js 14 App Router setup
- [x] TypeScript strict mode (0 errors)
- [x] Tailwind CSS v3 + shadcn/ui (14+ components)
- [x] Prisma 5 schema (30+ models, 15+ enums)
- [x] PostgreSQL connection config
- [x] Vercel deployment config + cron (`vercel.json`)
- [x] `.env` template with all required vars

### Auth System ✅
- [x] NextAuth.js v5 (JWT strategy)
- [x] Email + Password login (bcrypt)
- [x] Registration with validation (zod)
- [x] Session callback (role, username, sellerProfile)
- [x] Login page (`/login`)
- [x] Register page (`/register`)
- [x] **LINE Login** — custom OAuth provider, auto user creation/linking
  - `lib/auth.ts` — LineProvider + JWT callback for LINE sign-in
  - `app/(auth)/login/page.tsx` — ปุ่ม LINE สีเขียว (#06C755) ใช้งานได้จริง
  - Env vars: `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET`

### Database ✅ (30+ models)
- [x] All models from Phase 1
- [x] Seed data (6 users, 12 cards, 12 listings, 2 orders)

### Pages — Main ✅
- [x] All pages from Phase 1
- [x] **Loading skeletons** ทุก route group (`loading.tsx`)
- [x] **Error pages** — `error.tsx` + `not-found.tsx` (global + per layout)
- [x] **SEO metadata** — title template, OpenGraph, Twitter cards

### Pages — Seller ✅ (NEW)
- [x] `/sell/analytics` — Revenue charts, top cards, conversion rate, tier progress
- [x] `/sell/kyc` — ID card + selfie upload, status tracking
- [x] `/sell/subscription` — FREE/PRO/BUSINESS plan selection

### Pages — Community ✅ (NEW)
- [x] `/community/forum` — Thread index grouped by TCG category
- [x] `/community/forum/[threadId]` — Thread detail, replies, best answer

### API Routes ✅ (24 routes total)
- [x] All 18 routes from Phase 1
- [x] **`POST /api/listings/[id]/feature`** — Paid boost (homepage/category/search)
- [x] **`GET /api/cards/[id]/price-history`** — Price history data (30/90/180 days)
- [x] **`GET/POST /api/users/me/kyc`** — KYC submission + status
- [x] **`GET/POST /api/subscriptions`** — Subscription plan management
- [x] **`GET/POST /api/forum/threads`** — Forum thread CRUD
- [x] **`GET/POST /api/forum/threads/[threadId]/replies`** — Forum replies

### Services ✅ (NEW)
- [x] **`services/tier.service.ts`** — Auto-upgrade tier (Bronze→Silver→Gold→Verified Pro)
  - Called automatically after each escrow release
  - `getTierProgress()` for analytics display
- [x] **`services/notification.service.ts`** — Email + in-app notifications
  - ORDER_PAID, ORDER_SHIPPED, ORDER_COMPLETED, DISPUTE_OPENED
  - Uses Resend API for email, Notification model for in-app

### Components ✅ (NEW)
- [x] **`components/scanner/CardScanner.tsx`** — Camera overlay with TCG frame
- [x] **`components/scanner/useCardScanner.ts`** — Camera hook (sharpness, capture, WebP)
- [x] **`components/shared/price-chart.tsx`** — Recharts line chart (30/90/180 day)
- [x] **`components/shared/analytics-charts.tsx`** — Revenue bar chart + top cards
- [x] **`components/browse-filters.tsx`** — Mobile collapsible filters
- [x] **`components/sell-mobile-nav.tsx`** — Mobile seller navigation

### Lib ✅ (NEW)
- [x] **`lib/r2.ts`** — Cloudflare R2 client (S3-compatible, presigned URLs)
- [x] **`lib/resend.ts`** — Resend email client + Thai HTML templates

### Security ✅
- [x] All from Phase 1
- [x] R2 upload validation (file type, size <5MB)
- [x] KYC data stored in private bucket

### SEO ✅ (NEW)
- [x] `app/sitemap.ts` — Dynamic sitemap (static + listings + cards)
- [x] `app/robots.ts` — Allow /, disallow /api/ and /admin/
- [x] `app/layout.tsx` — Full metadata (title template, OG, Twitter)
- [x] `generateMetadata` on listing detail + card catalog pages

### Mobile Responsive ✅ (NEW)
- [x] Browse page: collapsible filters on mobile
- [x] Listing detail: single column on mobile
- [x] Sell layout: mobile nav
- [x] Responsive grids throughout

---

## 🔧 สิ่งที่ต้องทำต่อ (If Anything Remains)

### อาจจะต้องทำ (Optional Enhancements)
- [ ] Google OAuth provider (ถ้าต้องการ)
- [ ] Email verification flow
- [ ] Bulk upload (BUSINESS plan feature)
- [ ] Admin KYC review UI (ปัจจุบันมีแค่ submission flow)
- [ ] Omise payment integration จริง (ปัจจุบัน webhook รองรับแล้ว แต่ frontend ยังไม่เชื่อม Omise drop-in)
- [ ] Card scanner integration ในหน้า `/sell/new`
- [ ] Price chart integration ในหน้า listing detail + card catalog

### Environment Variables ที่ต้องตั้ง
```env
# Existing
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://cardvault.co.th

# New
LINE_CLIENT_ID=...
LINE_CLIENT_SECRET=...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=cardvault-assets
R2_PUBLIC_URL=https://assets.cardvault.co.th
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=CardVault <noreply@cardvault.co.th>
NEXT_PUBLIC_APP_URL=https://cardvault.co.th
POKEMON_TCG_API_KEY=...  # optional
```

### Database Migration ที่ต้องรัน
```sql
-- Full-text search (Thai) — รันใน PostgreSQL
-- ดูไฟล์ prisma/migrations/001_fulltext_search.sql
```

---

## 🔄 Workflow สำหรับ Agent ตัวถัดไป

### ขั้นตอนทันที
```bash
git clone https://github.com/photsathonspd1-create/cardvault.git
cd cardvault
npm install
npx prisma generate
```

### ตรวจสอบ TypeScript
```bash
npx tsc --noEmit
# ต้องผ่าน 0 errors (อาจมี error จาก dependencies ที่ยังไม่ได้ install)
```

### สิ่งที่ทำได้ทันที
1. **ตั้งค่า env vars** ตามรายการด้านบน
2. **รัน migration** — `prisma/migrations/001_fulltext_search.sql`
3. **ทดสอบ build** — `npm run build`
4. **Integrate card scanner** ในหน้า `/sell/new`
5. **Integrate price chart** ในหน้า listing detail + card catalog

### Coding Conventions (ต้องตาม)
```typescript
// 1. Thai UI text ทั้งหมด
<Button>ซื้อเลย</Button>  // ✅
<Button>Buy Now</Button>    // ❌

// 2. TypeScript strict — ห้ามใช้ any (เลี่ยงไม่ได้ใช้ as)
const userId = (session?.user as any).id  // ✅ (เลี่ยงไม่ได้)

// 3. Server Components เป็นหลัก
export default async function Page() { ... }  // ✅
"use client"                                   // เฉพาะที่จำเป็น

// 4. API routes ต้องมีครบ
export async function POST(request: NextRequest) {
  const session = await auth()           // auth guard
  if (!session) return 401
  
  const parsed = schema.safeParse(body)  // zod validation
  if (!parsed.success) return 400
  
  try { ... } catch { ... }              // error handling
}

// 5. Prices ในสตางค์
const price = 150000  // = 1,500 บาท
formatPrice(price)    // "฿1,500"
```

### หลังทำแต่ละ Task
```bash
npx tsc --noEmit
git add -A
git commit -m "feat: [คำอธิบาย]"
git push
# อัพเดท HANDOFF.md
```

---

## 📝 Key Decisions
1. Prices ในสตางค์ (100 = 1 บาท)
2. JWT sessions (not database)
3. Tesseract.js for OCR (free, no API cost)
4. Thai-first UI
5. In-memory rate limit fallback for dev
6. Resend for email (fetch-based, no SDK)
7. Cloudflare R2 for image storage (S3-compatible)
8. Recharts for charts (client components)

---

## 📁 New Files Summary (49 files changed, +5037 lines)

```
components/scanner/CardScanner.tsx          # Card camera scanner
components/scanner/useCardScanner.ts        # Scanner hook
components/shared/price-chart.tsx           # Price history chart
components/shared/analytics-charts.tsx      # Seller analytics charts
components/browse-filters.tsx               # Mobile collapsible filters
components/sell-mobile-nav.tsx              # Mobile seller nav

lib/r2.ts                                   # Cloudflare R2 client
lib/resend.ts                               # Resend email + templates

services/tier.service.ts                    # Auto tier upgrade
services/notification.service.ts            # Email + in-app notifications

app/sell/analytics/page.tsx                 # Seller analytics
app/sell/kyc/page.tsx                       # KYC submission
app/sell/subscription/page.tsx              # Subscription plans

app/community/forum/page.tsx                # Forum index
app/community/forum/[threadId]/page.tsx     # Thread detail
app/community/forum/[threadId]/reply-form.tsx

app/api/listings/[id]/feature/route.ts      # Featured listings
app/api/cards/[id]/price-history/route.ts   # Price history API
app/api/users/me/kyc/route.ts              # KYC API
app/api/subscriptions/route.ts              # Subscriptions API
app/api/forum/threads/route.ts              # Forum threads API
app/api/forum/threads/[threadId]/replies/route.ts

app/sitemap.ts                              # Dynamic sitemap
app/robots.ts                               # Robots.txt

app/(main)/loading.tsx                      # Loading skeletons (8 files)
app/(main)/browse/loading.tsx
app/(main)/listing/[id]/loading.tsx
app/(main)/orders/loading.tsx
app/(main)/profile/loading.tsx
app/admin/loading.tsx
app/community/loading.tsx
app/sell/loading.tsx

app/not-found.tsx                           # Error pages (6 files)
app/error.tsx
app/(main)/not-found.tsx
app/(main)/error.tsx
app/sell/not-found.tsx
app/admin/not-found.tsx

app/(auth)/login/page.tsx                   # Modified: LINE login
app/(main)/browse/page.tsx                  # Modified: FTS + mobile filters
app/(main)/card/[catalogId]/page.tsx        # Modified: SEO metadata
app/(main)/listing/[id]/page.tsx            # Modified: SEO metadata
app/api/upload/presigned-url/route.ts       # Modified: R2 integration
app/layout.tsx                              # Modified: full SEO
app/globals.css                             # Modified: mobile utilities
app/sell/layout.tsx                         # Modified: mobile nav
components/shared/seller-sidebar.tsx        # Modified: new nav items
lib/auth.ts                                 # Modified: LINE provider
services/escrow.service.ts                  # Modified: tier check
```

---

*Phase 2 ครบ 100% แล้ว 🎉 Agent ตัวถัดไป: clone, setup env, test build, แล้วลุย optional enhancements ได้เลย!*
