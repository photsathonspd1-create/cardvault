# 🃏 CardVault — Agent Handoff Document
**Last Updated:** 2026-05-16 21:28 GMT+8
**Repository:** https://github.com/photsathonspd1-create/cardvault
**Branch:** main

---

## 📋 สรุปโปรเจค

CardVault = Marketplace ซื้อ-ขายการ์ด TCG ในประเทศไทย
- Tech: Next.js 14, TypeScript, Prisma 5, PostgreSQL, Tailwind + shadcn/ui
- Auth: NextAuth.js v5 (JWT, Email+Password)
- Payment: Omise (PromptPay + Credit Card) with HMAC webhook verification
- Rate Limiting: Upstash Redis with in-memory fallback
- Card ID: Tesseract.js OCR + Pokemon TCG API fuzzy search
- Deploy target: Vercel (with cron jobs)

---

## ✅ สิ่งที่เสร็จแล้ว (Phase 1 MVP + Partial Phase 2)

### Infrastructure
- [x] Next.js 14 App Router setup
- [x] TypeScript strict mode
- [x] Tailwind CSS v3 + shadcn/ui (14 components)
- [x] Prisma 5 schema (30+ models, 15+ enums)
- [x] PostgreSQL connection config
- [x] Vercel deployment config + cron
- [x] `.env` template with all required vars

### Auth System
- [x] NextAuth.js v5 with JWT strategy
- [x] Email + Password login (bcrypt)
- [x] Registration with validation (zod)
- [x] Session callback with role/username/sellerProfile
- [x] Auth pages: `/login`, `/register` (Thai UI)
- [x] Auth layout with dark theme styling
- [ ] LINE Login (placeholder only)
- [ ] Google OAuth (not implemented)
- [ ] Email verification (not implemented)

### Database (Prisma Schema — 30+ models)
- [x] User, Account, Session, VerificationToken
- [x] SellerProfile, BankAccount, SellerSubscription
- [x] CardCatalog, PriceHistory
- [x] Listing, ListingImage, ShippingOption
- [x] Order, OrderStatusHistory
- [x] Dispute, DisputeEvidence
- [x] Review, Watchlist, PriceAlert
- [x] Notification, Report
- [x] AuditLog, SystemSetting
- [x] CommunityPost, PostComment, PostLike
- [x] ForumThread, ForumReply
- [x] ScammerReport
- [x] All enums (Role, SellerTier, KycStatus, CardSeries, Condition, etc.)
- [x] Seed data: 6 users, 12 Pokemon cards, 12 listings, 2 orders, reviews

### Pages — Main
- [x] Homepage — hero, stats, featured listings, series browse, trust section
- [x] `/browse` — filter (series/condition/price/graded), sort, pagination
- [x] `/listing/[id]` — image gallery, seller info, graded info, shipping, buy button
- [x] `/card/[catalogId]` — card detail, market price, active listings
- [x] `/checkout/[listingId]` — shipping form, order summary, escrow notice
- [x] `/orders` — buyer order list with status badges
- [x] `/orders/[id]` — order detail, timeline, confirm/dispute buttons
- [x] `/profile` — current user profile (private)
- [x] `/profile/[username]` — public profile, listings, reviews
- [x] `/community` — post feed with types (show/ask/sell/news)

### Pages — Seller
- [x] `/sell` — dashboard (stats, tier, recent orders)
- [x] `/sell/new` — 4-step create listing form
- [x] `/sell/listings` — my listings with status
- [x] `/sell/orders` — seller orders with shipping

### Pages — Admin
- [x] `/admin` — dashboard (stats overview)
- [x] `/admin/listings` — pending review queue + approve
- [x] `/admin/disputes` — dispute management
- [x] `/admin/users` — user management with ban/unban

### Pages — Other
- [x] `/check` — scammer check (public, no login required)

### API Routes
- [x] `POST /api/auth/register` — user registration
- [x] `GET/POST /api/listings` — browse + create
- [x] `GET /api/listings/[id]` — listing detail
- [x] `PATCH/DELETE /api/listings/[id]/edit` — edit/delete
- [x] `POST /api/listings/approve` — admin approve
- [x] `POST /api/orders` — create order
- [x] `GET /api/orders/[id]` — order detail
- [x] `POST /api/orders/[id]/ship` — mark shipped
- [x] `POST /api/orders/[id]/confirm` — confirm received
- [x] `POST /api/orders/[id]/dispute` — open dispute
- [x] `GET/POST /api/cards/identify` — OCR + Pokemon TCG search
- [x] `POST /api/upload/presigned-url` — file upload (mock)
- [x] `POST /api/webhooks/omise` — payment webhook with HMAC
- [x] `GET /api/cron/escrow-release` — auto-release cron
- [x] `GET /api/users/[id]` — public profile
- [x] `POST /api/users/me/seller-apply` — become seller
- [x] `GET/POST /api/community/posts` — community feed
- [x] `GET/POST /api/reports/scammer` — scammer check/report

### Services
- [x] `escrow.service.ts` — hold, release, refund, freeze, auto-release
- [x] `card-identify.service.ts` — Tesseract OCR + Pokemon TCG API

### Components
- [x] 14 shadcn/ui components (button, input, card, badge, dialog, select, tabs, etc.)
- [x] Header with auth state, mobile menu
- [x] Footer with links
- [x] SellerSidebar, AdminSidebar
- [x] SellerBadge (tier + rating + KYC)
- [x] EscrowStatus (status + countdown)
- [x] OrderConfirmButton, OrderDisputeButton
- [x] Providers (SessionProvider + Toaster)

### Security
- [x] Rate limiting on 5 endpoints (Upstash + fallback)
- [x] Omise webhook HMAC verification
- [x] Cron secret verification
- [x] Zod validation on all API inputs
- [x] Auth guards on protected routes
- [x] Role-based access (USER/SELLER/ADMIN)

---

## ❌ สิ่งที่ยังไม่เสร็จ (ทำต่อได้เลย)

### Priority 1 — Core Missing Features

#### 1. Card Scanner Component (`components/scanner/CardScanner.tsx`)
- Camera overlay with 2.5:3.5 aspect ratio frame
- Auto-detect sharpness (Laplacian variance)
- 3-step capture: front → back → holo
- Crop, compress to WebP, preview
- Fallback: gallery upload
- **Files to create:** `components/scanner/CardScanner.tsx`, `components/scanner/useCardScanner.ts`

#### 2. Image Upload to Cloudflare R2 (`lib/r2.ts`)
- Currently using mock URLs
- Need: `@aws-sdk/client-s3` for R2 presigned URLs
- Update `/api/upload/presigned-url` to generate real R2 URLs
- **Files to update:** `lib/r2.ts` (new), `app/api/upload/presigned-url/route.ts`

#### 3. LINE Login Integration
- Add LINE OAuth provider to NextAuth config
- Create LINE channel in LINE Developers Console
- Update `/login` page with working LINE button
- **Files to update:** `lib/auth.ts`, `app/(auth)/login/page.tsx`

#### 4. Email Notifications (Resend)
- Install: `resend`, `react-email`
- Create email templates: order confirmation, shipped, completed, dispute
- Update notification service to send emails
- **Files to create:** `lib/resend.ts`, `emails/` templates, `services/notification.service.ts`

#### 5. Full-text Search (PostgreSQL tsvector)
- Add `search_vector` column to Listing table
- Create migration SQL for tsvector + trigger
- Update browse page to use full-text search
- **Files to create:** `prisma/migrations/` SQL file

### Priority 2 — Phase 2 Features

#### 6. Seller Tier Auto-upgrade Logic
- After order COMPLETED → check if seller qualifies for tier up
- Bronze → Silver: 10+ sales, 4.5+ rating, 0 disputes lost
- Silver → Gold: 50+ sales, 4.7+ rating, KYC verified
- **Files to create:** `services/tier.service.ts`, update `escrow.service.ts`

#### 7. KYC Flow
- Upload ID card + selfie
- Store in private R2 bucket (encrypted paths)
- Admin review interface
- Auto-check against ScammerReport on submit
- **Files to create:** `app/sell/kyc/page.tsx`, `/api/users/me/kyc`

#### 8. Seller Subscription Plans
- FREE (10 listings, manual approve)
- PRO (299฿/mo, unlimited, auto-approve)
- BUSINESS (899฿/mo, bulk upload, analytics)
- **Files to create:** `app/sell/subscription/page.tsx`, `/api/subscriptions`

#### 9. Featured Listings (Paid Boost)
- Homepage banner: 299฿/day
- Category top: 99฿/day
- Search boost: 49฿/day
- **Files to create:** `/api/listings/[id]/feature`, payment integration

#### 10. Price History Charts
- Install: `recharts`
- Create PriceChart component
- Add to listing detail and card catalog pages
- **Files to create:** `components/shared/price-chart.tsx`

#### 11. Forum Pages
- `/community/forum` — thread index by category
- `/community/forum/[threadId]` — thread detail + replies
- **Files to create:** `app/community/forum/page.tsx`, `app/community/forum/[threadId]/page.tsx`

#### 12. Seller Analytics Dashboard
- Revenue chart (monthly)
- Top selling cards
- Conversion rate
- Tier progress bar
- **Files to create:** `app/sell/analytics/page.tsx`

### Priority 3 — Polish & Optimization

#### 13. Mobile Responsive Fixes
- Test all pages on mobile viewport
- Fix any overflow/layout issues
- Add bottom navigation for mobile

#### 14. Loading States & Skeletons
- Add skeleton loaders to all async pages
- Add loading.tsx for each route group

#### 15. Error Handling
- Create `error.tsx` for each route group
- Add `not-found.tsx` pages
- Improve API error responses

#### 16. SEO & Meta Tags
- Add metadata to all pages
- Create sitemap.xml
- Add Open Graph images

---

## 🔄 Work Flow for Next Agent

### Step 1: Clone & Setup
```bash
git clone https://github.com/photsathonspd1-create/cardvault.git
cd cardvault
npm install
cp .env .env.local
# Edit .env.local with real credentials
npx prisma db push
npm run db:seed
npm run dev
```

### Step 2: Pick a Task
Choose from the "ยังไม่เสร็จ" list above. Each task has:
- Description of what to build
- Files to create/update
- Dependencies to install

### Step 3: Implement
- Follow existing code patterns (Thai UI text, Server Components, etc.)
- TypeScript strict — no `any` types
- All API routes need: auth guard, zod validation, try-catch
- All pages need: loading states, error handling, mobile responsive

### Step 4: Test & Push
```bash
npx tsc --noEmit  # Must pass with 0 errors
git add -A
git commit -m "feat: [description]"
git push
```

### Step 5: Update Handoff
Update this file with:
- What you completed
- What's next
- Any blockers or decisions made

---

## 📁 Project Structure

```
cardvault/
├── app/
│   ├── (auth)/login, register
│   ├── (main)/browse, listing, card, checkout, orders, profile, community
│   ├── sell/dashboard, new, listings, orders
│   ├── admin/dashboard, listings, disputes, users
│   ├── check/scammer-check
│   └── api/auth, listings, orders, cards, upload, webhooks, cron, users, community, reports
├── components/ui/, order/, shared/
├── lib/prisma, auth, rate-limit, utils
├── services/escrow, card-identify
└── prisma/schema (30+ models), seed
```

---

## 🧪 Test Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cardvault.co.th | password123 |
| Seller | seller1@example.com | password123 |
| Seller | seller3@example.com | password123 |
| Buyer | buyer1@example.com | password123 |

---

## 📝 Key Decisions Made

1. **Prices in สตางค์** — All prices stored as integers (100 = 1 บาท)
2. **JWT sessions** — Not database sessions (simpler, faster)
3. **Prisma over Drizzle** — Better TypeScript support, mature ecosystem
4. **Tesseract.js over cloud OCR** — Free, runs on server, no API costs
5. **In-memory rate limit fallback** — Works without Redis in dev
6. **Thai-first UI** — All text in Thai, English only in code

---

## ⚠️ Known Issues

1. **No PostgreSQL running** — `next build` fails at static generation (needs DB)
2. **Image upload is mock** — Returns placeholder URLs, needs R2 integration
3. **LINE Login not working** — Placeholder button only
4. **No email sending** — Notification service creates DB records only
5. **Card scanner not built** — Uses file upload form instead

---

*Handoff complete. Next agent: pick any task from "ยังไม่เสร็จ" and continue! 🚀*
