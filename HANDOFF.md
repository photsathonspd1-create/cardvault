# 🃏 CardVault — Agent Handoff Document
**Last Updated:** 2026-05-16 23:20 GMT+8
**Repository:** https://github.com/photsathonspd1-create/cardvault
**Branch:** main
**Last Commit:** `434b794` — feat: complete all remaining enhancements

---

## 📊 Progress Summary

```
Phase 1 MVP:     ████████████████████ 100% ✅
Phase 2:         ████████████████████ 100% ✅
TypeScript:      ████████████████████   0 errors ✅
Build:           ████████████████████ success ✅
Enhancements:    ████████████████████ 100% ✅
Phase 3:         ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🏗️ สิ่งที่เสร็จแล้วทั้งหมด

### Infrastructure ✅
- [x] Next.js 14 App Router (124 files, ~15,000 lines TypeScript)
- [x] TypeScript strict mode — **0 errors**
- [x] Tailwind CSS v3 + shadcn/ui (33 components)
- [x] Prisma 5 schema (30+ models, 15+ enums)
- [x] PostgreSQL connection config
- [x] Vercel deployment config + cron (`vercel.json`)
- [x] `.env.example` with all required/optional vars
- [x] `npm run build` — **success**

### Auth System ✅
- [x] NextAuth.js v5 (JWT strategy)
- [x] Email + Password login (bcrypt)
- [x] Registration with validation (zod)
- [x] Session callback (role, username, sellerProfile)
- [x] Login page (`/login`) — wrapped in Suspense boundary
- [x] Register page (`/register`)
- [x] **LINE Login** — custom OAuth provider, auto user creation/linking

### Database ✅ (30+ models)
- [x] All models: User, Account, Session, SellerProfile, BankAccount, SellerSubscription, CardCatalog, PriceHistory, Listing, ListingImage, ShippingOption, Order, OrderStatusHistory, Dispute, DisputeEvidence, Review, Watchlist, PriceAlert, Notification, Report, AuditLog, SystemSetting, CommunityPost, PostComment, PostLike, ForumThread, ForumReply, ScammerReport
- [x] Seed data (6 users, 12 cards, 12 listings, 2 orders)
- [x] All enums: Role, SellerTier, KycStatus, CardSeries, CardLanguage, Condition, ListingStatus, OrderStatus, EscrowStatus, DisputeReason, DisputeStatus, ReportReason, PostType, TcgCategory, ScammerReportStatus, PlanType

### Pages — Main (8 pages) ✅
- [x] Homepage (`/`) — hero, featured listings, series cards, stats
- [x] Browse (`/browse`) — filters, search, mobile collapsible
- [x] Listing Detail (`/listing/[id]`) — gallery, seller info, buy button
- [x] Card Catalog (`/card/[catalogId]`) — price history, listings
- [x] Checkout (`/checkout/[listingId]`) — shipping + payment form
- [x] Orders (`/orders`) — buyer order history
- [x] Order Detail (`/orders/[id]`) — tracking, escrow status, dispute button
- [x] Profile (`/profile`, `/profile/[username]`) — seller badge, reviews

### Pages — Auth (2 pages) ✅
- [x] Login (`/login`) — email + LINE, Suspense wrapped
- [x] Register (`/register`) — validation

### Pages — Seller (8 pages) ✅
- [x] Dashboard (`/sell`) — stats overview
- [x] Create Listing (`/sell/new`) — multi-step wizard (530 lines)
- [x] My Listings (`/sell/listings`) — status filter, edit/pause/delete
- [x] Orders (`/sell/orders`) — seller order management
- [x] Analytics (`/sell/analytics`) — revenue charts, top cards, tier progress
- [x] KYC (`/sell/kyc`) — ID card + selfie upload, status tracking
- [x] Subscription (`/sell/subscription`) — FREE/PRO/BUSINESS plans
- [x] Layout with seller sidebar + mobile nav

### Pages — Admin (5 pages) ✅
- [x] Dashboard (`/admin`) — GMV, orders, listings stats
- [x] Listings Queue (`/admin/listings`) — approve/reject
- [x] Disputes (`/admin/disputes`) — evidence, resolve
- [x] Users (`/admin/users`) — search, ban, tier management
- [x] Layout with admin sidebar + role guard

### Pages — Community (3 pages) ✅
- [x] Feed (`/community`) — posts with card tagging
- [x] Forum Index (`/community/forum`) — threads by TCG category
- [x] Thread Detail (`/community/forum/[threadId]`) — replies, best answer

### Pages — Trust & Safety (1 page) ✅
- [x] Scammer Check (`/check`) — public, search by phone/bank account

### API Routes (26 routes) ✅
- [x] `POST /api/auth/register` — user registration
- [x] `GET/POST /api/listings` — browse + create
- [x] `GET/PATCH/DELETE /api/listings/[id]` — single listing CRUD
- [x] `PATCH /api/listings/[id]/edit` — edit listing
- [x] `POST /api/listings/[id]/feature` — paid boost
- [x] `POST /api/listings/approve` — admin approve
- [x] `GET/POST /api/orders` — buyer orders
- [x] `GET /api/orders/[id]` — order detail
- [x] `POST /api/orders/[id]/ship` — seller ship
- [x] `POST /api/orders/[id]/confirm` — buyer confirm
- [x] `POST /api/orders/[id]/dispute` — open dispute
- [x] `POST /api/payments/charge` — **Omise charge creation (NEW)**
- [x] `POST /api/webhooks/omise` — Omise webhook handler
- [x] `GET /api/cron/escrow-release` — auto-release cron
- [x] `POST /api/cards/identify` — card OCR identification
- [x] `GET /api/cards/[id]/price-history` — price data
- [x] `POST /api/upload/presigned-url` — R2 image upload
- [x] `GET/POST /api/users/me/kyc` — KYC submission
- [x] `POST /api/users/me/seller-apply` — seller registration
- [x] `GET /api/users/[id]` — user profile
- [x] `GET/POST /api/subscriptions` — plan management
- [x] `GET/POST /api/forum/threads` — forum CRUD
- [x] `GET/POST /api/forum/threads/[threadId]/replies` — replies
- [x] `GET/POST /api/community/posts` — community posts
- [x] `POST /api/reports/scammer` — scammer reports
- [x] `POST /api/reports/scammer/check` — public scammer check

### Services (4 services) ✅
- [x] `escrow.service.ts` (188 lines) — fee calculation, release logic
- [x] `notification.service.ts` (309 lines) — email + in-app notifications
- [x] `tier.service.ts` (174 lines) — auto tier upgrade after escrow release
- [x] `card-identify.service.ts` (225 lines) — OCR + Pokemon TCG API

### Lib (7 modules) ✅
- [x] `auth.ts` — NextAuth config + LINE provider
- [x] `prisma.ts` — Prisma client singleton
- [x] `omise.ts` — **Omise payment client (NEW)** — PromptPay, card, transfers, refunds
- [x] `r2.ts` — Cloudflare R2 client (presigned URLs)
- [x] `resend.ts` — Resend email client + Thai templates
- [x] `rate-limit.ts` — Upstash Redis + in-memory fallback
- [x] `utils.ts` — formatPrice, labels, helpers

### Components (33 components) ✅
- [x] **UI (19):** avatar, badge, button, card, checkbox, dialog, dropdown-menu, input, label, progress, select, separator, skeleton, tabs, textarea, toast, toaster, tooltip, use-toast
- [x] **Scanner (2):** CardScanner.tsx, useCardScanner.ts
- [x] **Shared (7):** header, footer, seller-sidebar, admin-sidebar, providers, seller-badge, price-chart, analytics-charts
- [x] **Order (3):** escrow-status, order-confirm-button, order-dispute-button
- [x] **Other (2):** browse-filters, sell-mobile-nav

### Security ✅
- [x] `middleware.ts` — Edge middleware (auth guard, admin role guard, security headers)
- [x] Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] Rate limiting on all sensitive endpoints
- [x] R2 upload validation (file type + size <5MB)
- [x] Zod validation on all API routes
- [x] Auth guards on all protected routes

### SEO ✅
- [x] `app/sitemap.ts` — dynamic sitemap
- [x] `app/robots.ts` — allow /, disallow /api/ and /admin/
- [x] `app/layout.tsx` — full metadata (title template, OG, Twitter)
- [x] `generateMetadata` on listing detail + card catalog pages

### Mobile Responsive ✅
- [x] Browse page: collapsible filters on mobile
- [x] Listing detail: single column on mobile
- [x] Sell layout: mobile nav
- [x] Responsive grids throughout

### Loading & Error States ✅
- [x] Loading skeletons (8 files): main, browse, listing, orders, profile, admin, sell, community
- [x] Error pages (6 files): global, main, admin, sell, community, not-found
- [x] Not-found pages (6 files): global, main, admin, sell

---

## 🔧 สิ่งที่ต้องทำต่อ (Optional Enhancements)

### Priority 1 — เสร็จหมดแล้ว ✅
- [x] **Omise frontend integration** — checkout page แสดง PromptPay QR / credit card form หลังสร้าง order
- [x] **Card scanner integration ในหน้า `/sell/new`** — เพิ่ม step 0 สแกนการ์ดด้วยกล้อง + auto-fill ข้อมูลผ่าน OCR
- [x] **Price chart integration ใน listing detail** — PriceHistorySection server component + SimilarListingsCard
- [x] **Email verification flow** — POST/GET /api/auth/verify-email (Thai HTML template)
- [x] **Admin KYC review UI** — /admin/kyc page พร้อม approve/reject + ดูรูปบัตร

### Priority 2 — ถ้ามีเวลา
- [ ] Google OAuth provider
- [ ] Bulk upload (BUSINESS plan feature)
- [ ] PWA (installable, offline browsing)
- [ ] Push notifications (Web Push)
- [ ] AI condition assessment (photo → condition suggestion)
- [ ] MTG / Vanguard / Digimon support (schema รองรับแล้ว)
- [ ] Grading service integration (PSA Thailand)
- [ ] B2B API (ราคาตลาด)
- [ ] Referral program

---

## 📁 ไฟล์ที่สร้าง/แก้ไขในรอบนี้ (31 files, +1,661 lines)

```
NEW FILES:
├── lib/omise.ts                          # Omise payment client
├── middleware.ts                          # Edge middleware (auth + security)
├── app/api/payments/charge/route.ts      # Omise charge creation API
├── app/admin/error.tsx                   # Admin error boundary
├── app/sell/error.tsx                    # Sell error boundary
├── app/community/error.tsx               # Community error boundary
├── public/line-logo.svg                  # LINE login button logo
└── .env.example                          # Environment variables template

MODIFIED FILES:
├── lib/auth.ts                           # Fix type errors (logoDark, providers)
├── components/shared/analytics-charts.tsx # Fix recharts type errors
├── components/shared/price-chart.tsx     # Fix recharts type errors
├── app/(auth)/login/page.tsx             # Suspense boundary for useSearchParams
├── app/(main)/page.tsx                   # force-dynamic
├── app/(main)/browse/page.tsx            # force-dynamic
├── app/(main)/listing/[id]/page.tsx      # force-dynamic
├── app/(main)/card/[catalogId]/page.tsx  # force-dynamic
├── app/(main)/orders/page.tsx            # force-dynamic
├── app/(main)/orders/[id]/page.tsx       # force-dynamic
├── app/(main)/profile/page.tsx           # force-dynamic
├── app/(main)/profile/[username]/page.tsx # force-dynamic
├── app/admin/page.tsx                    # force-dynamic
├── app/admin/listings/page.tsx           # force-dynamic
├── app/admin/disputes/page.tsx           # force-dynamic
├── app/admin/users/page.tsx              # force-dynamic
├── app/sell/page.tsx                     # force-dynamic
├── app/sell/listings/page.tsx            # force-dynamic
├── app/sell/orders/page.tsx              # force-dynamic
├── app/sell/analytics/page.tsx           # force-dynamic
├── app/community/forum/page.tsx          # force-dynamic
├── app/community/forum/[threadId]/page.tsx # force-dynamic
├── package.json                          # +recharts, @aws-sdk/*
├── package-lock.json
└── README.md                             # Updated features + deployment guide
```

---

## 🔧 Environment Variables ที่ต้องตั้ง

```env
# ═══ Required ═══
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=https://cardvault.co.th
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=cardvault-assets
R2_PUBLIC_URL=https://assets.cardvault.co.th
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=CardVault <noreply@cardvault.co.th>
NEXT_PUBLIC_APP_URL=https://cardvault.co.th

# ═══ Optional ═══
LINE_CLIENT_ID=...
LINE_CLIENT_SECRET=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
POKEMON_TCG_API_KEY=...
OMISE_WEBHOOK_SECRET=...
PLATFORM_FEE_PERCENT=6
ESCROW_AUTO_RELEASE_DAYS=7
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
# ต้องผ่าน 0 errors ✅
```

### Build
```bash
npm run build
# ต้อง success ✅ (ไม่มี DATABASE_URL ก็ build ได้)
```

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

// 6. Pages ที่ query DB ต้องมี:
export const dynamic = "force-dynamic"
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
9. Omise for payment (PromptPay + Credit Card)
10. Edge middleware for route protection

---

## 📊 Stats
- **Total files:** 127 TypeScript files
- **Total lines:** ~15,015
- **Pages:** 26
- **API Routes:** 28
- **Components:** 33
- **Services:** 4
- **Lib modules:** 7
- **Prisma models:** 30+
- **TypeScript errors:** 0
- **Build status:** ✅ success

---

*Phase 1 + Phase 2 เสร็จ 100% แล้ว 🎉*
*Agent ตัวถัดไป: clone, setup env, แล้วลุย optional enhancements ได้เลย!*
