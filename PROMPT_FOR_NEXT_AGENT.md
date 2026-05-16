# 🃏 CardVault — Continuation Prompt for Next Agent

## Copy this prompt to start a new agent session:

---

You are continuing development of **CardVault** — a Thai TCG card marketplace.

**Repository:** `https://github.com/photsathonspd1-create/cardvault`
**Branch:** `main`

### First Steps (MANDATORY):
```bash
git clone https://github.com/photsathonspd1-create/cardvault.git
cd cardvault
npm install
npx prisma generate
```

Then read these files in order:
1. `HANDOFF.md` — full status of what's done vs pending
2. `CardVault_MasterSystem_v2.1.md` — master spec document
3. `prisma/schema.prisma` — database schema (30+ models)
4. `README.md` — setup instructions

### What's Already Done (DO NOT redo):
- ✅ Next.js 14 project setup + all dependencies
- ✅ Prisma schema with 30+ models + seed data
- ✅ All shadcn/ui components (14 components)
- ✅ Auth system (NextAuth v5, Email+Password, JWT)
- ✅ All main pages (Homepage, Browse, Listing Detail, Checkout, Orders, Profile, Community, Admin)
- ✅ All API routes (18 routes — listings, orders, escrow, cards, users, community, scammer)
- ✅ Escrow service with auto-release cron
- ✅ Card identification (Tesseract.js + Pokemon TCG API)
- ✅ Rate limiting (Upstash Redis + in-memory fallback)
- ✅ Omise webhook with HMAC verification
- ✅ Scammer check page (public)
- ✅ TypeScript strict — 0 errors

### What Needs To Be Done (pick ONE task at a time):

#### 🔴 Priority 1 — Core Missing

**Task 1: Card Scanner Component**
```
Create: components/scanner/CardScanner.tsx, components/scanner/useCardScanner.ts
- Camera overlay with 2.5:3.5 aspect ratio frame (TCG standard)
- Auto-detect sharpness (Laplacian variance)
- 3-step capture: front → back → holo
- Crop + compress to WebP (max 2MB)
- Fallback: "เลือกจาก Gallery" button
- After capture: POST to /api/cards/identify
- Thai UI text throughout
```

**Task 2: Cloudflare R2 Image Upload**
```
Create: lib/r2.ts
Update: app/api/upload/presigned-url/route.ts
- Install: @aws-sdk/client-s3
- Generate real presigned URLs for R2
- Validate: file type (webp/jpeg/png), size (<5MB)
- Return: { uploadUrl, publicUrl, key }
```

**Task 3: LINE Login**
```
Update: lib/auth.ts, app/(auth)/login/page.tsx
- Add LINE OAuth provider to NextAuth
- Working LINE button on login page
- LINE_CLIENT_ID and LINE_CLIENT_SECRET env vars
```

**Task 4: Email Notifications (Resend)**
```
Create: lib/resend.ts, services/notification.service.ts, emails/ templates
- Install: resend, react-email
- Templates: order_confirmation, order_shipped, order_completed, dispute_opened
- Update notification service to send emails for important events
```

**Task 5: Full-text Search**
```
Create: prisma migration SQL
Update: app/(main)/browse/page.tsx
- Add search_vector tsvector column to Listing
- Thai language support in PostgreSQL
- Update browse page to use full-text search
```

#### 🟡 Priority 2 — Phase 2 Features

**Task 6: Seller Tier Auto-upgrade**
```
Create: services/tier.service.ts
- After order COMPLETED → check tier upgrade eligibility
- Bronze→Silver: 10+ sales, 4.5+ rating
- Silver→Gold: 50+ sales, 4.7+ rating, KYC verified
```

**Task 7: KYC Flow**
```
Create: app/sell/kyc/page.tsx, app/api/users/me/kyc/route.ts
- Upload ID card + selfie
- Store in private R2 bucket
- Admin review interface
- Auto-check against ScammerReport
```

**Task 8: Subscription Plans**
```
Create: app/sell/subscription/page.tsx, app/api/subscriptions/route.ts
- FREE: 10 listings, manual approve
- PRO: 299฿/mo, unlimited, auto-approve
- BUSINESS: 899฿/mo, bulk upload, analytics
```

**Task 9: Featured Listings**
```
Create: app/api/listings/[id]/feature/route.ts
- Homepage banner: 299฿/day
- Category top: 99฿/day
- Auto-expire when sold or time up
```

**Task 10: Price History Charts**
```
Create: components/shared/price-chart.tsx
- Install: recharts
- Line chart showing price history
- Add to listing detail + card catalog pages
```

**Task 11: Forum Pages**
```
Create: app/community/forum/page.tsx, app/community/forum/[threadId]/page.tsx
- Thread index by TCG category
- Thread detail with replies
- Best answer marking
```

**Task 12: Seller Analytics**
```
Create: app/sell/analytics/page.tsx
- Revenue chart (monthly)
- Top selling cards
- Conversion rate
- Tier progress bar
```

#### 🟢 Priority 3 — Polish

**Task 13-16:** Mobile responsive, loading skeletons, error pages, SEO

### Coding Conventions (MUST follow):
- Thai UI text for all user-facing strings
- TypeScript strict — NO `any` types
- Server Components by default, client only when needed
- All API routes: auth guard + zod validation + try-catch
- All pages: loading states + error handling
- Mobile-first responsive design
- Prices stored in สตางค์ (100 = 1 บาท)

### After Each Task:
1. Run `npx tsc --noEmit` — must pass with 0 errors
2. `git add -A && git commit -m "feat: [description]" && git push`
3. Update `HANDOFF.md` — mark completed tasks with [x]

### Test Accounts (after `npm run db:seed`):
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cardvault.co.th | password123 |
| Seller | seller1@example.com | password123 |
| Buyer | buyer1@example.com | password123 |

---

*Start with Task 1 (Card Scanner) unless the user specifies otherwise.*
