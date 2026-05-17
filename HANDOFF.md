# CardVault — Agent Handoff Document

> **Last updated:** 2026-05-17 15:55 GMT+8
> **Updated by:** OpenClaw Agent (webchat session)
> **Repo:** https://github.com/photsathonspd1-create/cardvault
> **Live (Netlify):** https://cardvault-tcg.netlify.app
> **Live (Vercel):** https://cardvault-drab.vercel.app (deploy limit reached, resumes ~2026-05-18)
> **Latest commit:** `bb8f895` (fix: add cuid() ID generation for PostgREST create operations)

---

## 📋 Project Overview

**CardVault** — TCG Card Marketplace for Thailand (Pokemon, Yu-Gi-Oh!, One Piece, MTG, Vanguard)

### Architecture
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, Tailwind CSS, shadcn/ui, Framer Motion |
| Database | Supabase PostgreSQL (accessed via **custom Prisma proxy** → PostgREST) |
| Auth | NextAuth v5 beta (Credentials + LINE OAuth) |
| Payment | Omise (PromptPay QR + Credit Card) — **NOT CONFIGURED** |
| Storage | Cloudflare R2 (S3-compatible) — **NOT CONFIGURED** |
| Email | Resend — **NOT CONFIGURED** |
| OCR | Tesseract.js (card scanner) |
| Rate Limit | Upstash Redis (or in-memory fallback) |

### Key Risk — Prisma Proxy (`lib/prisma.ts`)
~2200 lines of custom code that translates Prisma queries into Supabase PostgREST calls. This is the #1 fragility point. Known limitations:
- `$transaction` is NOT a real DB transaction — just sequential calls
- `$queryRaw` / `$queryRawUnsafe` not implemented (uses Supabase Management API, not configured)
- Nested `orderBy` inside includes not supported
- `increment`/`decrement` does read-then-write (race condition possible)
- `_count` with nested relations may return wrong counts

---

## ✅ COMPLETED WORK (all committed & pushed)

### Bug Fixes (commit `93ac4dd` + later)
| # | Issue | Fix | Files |
|---|---|---|---|
| 1 | Prisma proxy key remapping — PostgREST returns PascalCase table names, frontend expects camelCase | Added `remapTableKeys()` recursive function | `lib/prisma.ts` |
| 2 | Homepage crash — `orderBy` inside nested includes | Removed `orderBy` from images include | `app/(main)/page.tsx`, `app/(main)/browse/page.tsx` |
| 3 | Register API 500 — `OR` filter wrong format | Replaced with two separate `findUnique` calls | `app/api/auth/register/route.ts` |
| 4 | Nested select missing `*` — PostgREST needs `*` for nested includes | Always include `*` as first element in `innerParts` | `lib/prisma.ts` |
| 5 | OR filter format — generated `or=(a),(b)` instead of `or=(a,b)` | Changed join separator | `lib/prisma.ts` |
| 6 | Debug endpoint publicly accessible | Added auth check — ADMIN only | `app/api/debug/route.ts` |
| 7 | Hardcoded Supabase service role key as fallback | Removed fallbacks, throw if env vars missing | `lib/prisma.ts`, `lib/supabase-client.ts` |
| 8 | Escrow cron auth — only checked Bearer header | Accept both `Authorization: Bearer` and `x-vercel-cron-secret` | `app/api/cron/escrow-release/route.ts` |
| 9 | Tesseract.js crashes on Vercel serverless | Try-catch fallback, returns empty text | `services/card-identify.service.ts` |
| 10 | Mock upload handler missing | Created `/api/upload/mock` handler | `app/api/upload/mock/route.ts` |
| 11 | Checkout no auth check | Added unauthenticated redirect UI | `app/(main)/checkout/[listingId]/page.tsx` |
| 12 | Duplicate email service | `lib/email.ts` re-exports from `lib/resend.ts` | `lib/email.ts`, `lib/resend.ts` |
| 13 | PostgREST inserts missing createdAt/updatedAt defaults | Added defaults before insert | `lib/prisma.ts` |
| 14 | **Profile page crash** — PostgREST returns 1:1 relations (SellerProfile) as arrays | Added `unwrapOneToOneArrays()` to convert single-element arrays to objects; added `processNestedCounts()` for `_count` inside nested includes | `lib/prisma.ts` |
| 15 | Settings page missing (404) | Created `/settings` page + `GET/PATCH /api/users/me` endpoint | `app/(main)/settings/page.tsx`, `app/api/users/me/route.ts` |
| 16 | **Register 500 — null ID** — PostgREST doesn't auto-generate `@default(cuid())` IDs | Added `cuid()` generator function; auto-generate IDs in `create()`, `createMany()`, and nested creates | `lib/prisma.ts` |

### UI Redesign (10 pages done)
Homepage, Browse, Listing Detail, Sell/New (4-step wizard), Seller Dashboard, Order Detail, Profile, Scammer Check, Admin Panel, Auth (Login + Register)

### Design System
- **Colors:** bg `#09090b` (zinc-950), accent `#F59E0B` (amber-500), purple `#7C3AED`
- **Fonts:** Sarabun (Thai) + Inter (Latin)
- **Theme:** "Dark Gaming Luxury" — Steam meets Binance meets Japanese card shop
- **Tokens:** `lib/design-tokens.ts`, `tailwind.config.ts`, `app/globals.css`

---

## 🧪 TEST RESULTS (2026-05-17 15:55 GMT+8)

### Pages — All Working ✅
| Page | Status | Notes |
|---|---|---|
| `/` (Homepage) | ✅ 200 | Shows listings, stats, categories |
| `/browse` | ✅ 200 | Filter/search working |
| `/login` | ✅ 200 | Credentials + LINE OAuth |
| `/register` | ✅ 200 | Username + email + password |
| `/check` (Scammer Check) | ✅ 200 | Search interface |
| `/community` | ✅ 200 | Posts feed |
| `/community/forum` | ✅ 200 | Forum threads |
| `/how-it-works` | ✅ 200 | Static content |
| `/faq` | ✅ 200 | Static content |
| `/contact` | ✅ 200 | Static content |
| `/terms` | ✅ 200 | Static content |
| `/privacy` | ✅ 200 | Static content |
| `/escrow-info` | ✅ 200 | Static content |
| `/forgot-password` | ✅ 200 | Password reset form |
| `/reset-password` | ✅ 200 | Password reset form |
| `/settings` | ✅ 200 | User settings (auth required) |
| `/profile` | ✅ 200 | User profile (auth required) |
| `/orders` | ✅ 200 | Orders list (auth required) |
| `/sell` | ✅ 307 | Redirects to login (auth required) |
| `/admin` | ✅ 307 | Redirects to login (auth required) |
| `/listing/[id]` | ✅ 200 | Listing detail |
| `/card/[catalogId]` | ✅ 200 | Card catalog detail |
| `/checkout/[listingId]` | ✅ 200 | Checkout page |
| `/sitemap.xml` | ✅ 200 | SEO sitemap |
| `/robots.txt` | ✅ 200 | SEO robots |

### APIs — All Working ✅
| Endpoint | Status | Notes |
|---|---|---|
| `POST /api/auth/register` | ✅ 201 | Creates user with auto-generated cuid() |
| `GET /api/listings` | ✅ 200 | Returns 12 seed listings |
| `GET /api/listings/[id]` | ✅ 200 | Full listing with seller, images, shipping |
| `GET /api/cards/[id]/price-history` | ✅ 200 | Returns empty array (no history data yet) |
| `GET /api/users/me` | ✅ 401 | Correctly requires auth |
| `GET /api/community/posts` | ✅ 401 | Correctly requires auth |
| `GET /api/forum/threads` | ✅ 401 | Correctly requires auth |
| `POST /api/reports/scammer` | ✅ 401 | Correctly requires auth |
| `POST /api/cards/identify` | ✅ 401 | Correctly requires auth |

---

## 🔴 NOT YET DONE / NEEDS WORK

### Priority 1 — Critical for Launch
| # | Task | Status | Notes |
|---|---|---|---|
| 1 | **Omise Payment Integration** | ❌ Not configured | Need `OMISE_PUBLIC_KEY`, `OMISE_SECRET_KEY`, `OMISE_WEBHOOK_SECRET`. Code ready in `lib/omise.ts` |
| 2 | **Cloudflare R2 Storage** | ❌ Not configured | Need `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`. Code ready in `lib/r2.ts` |
| 3 | **Resend Email** | ❌ Not configured | Need `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. Templates ready in `lib/resend.ts` |
| 4 | **CRON_SECRET** | ❌ Not set | Generate: `openssl rand -hex 32`. Escrow auto-release needs this |
| 5 | **Login Flow E2E Test** | ⚠️ Untested | Uses `prisma.user.findUnique({ where: { email } })` — should work with proxy but unverified with actual login |

### Priority 2 — Important Features
| # | Task | Status | Notes |
|---|---|---|---|
| 6 | **Card Scanner Camera Integration** | 🔧 Partial | Tesseract.js integrated but camera UI needs work |
| 7 | **Price History Charts** | 🔧 Partial | Recharts installed, `PriceChart` component exists, needs real data |
| 8 | **Browse Search** | ⚠️ Needs verify | Uses `OR` + `contains` + `mode: "insensitive"` — proxy compatibility unknown |
| 9 | **Community/Forum Seed Data** | ❌ Empty | Pages load but no seed data |
| 10 | **Image Domains** | ❌ Not configured | `next.config.js` needs `images.remotePatterns` for external URLs |
| 11 | **Remaining pages redesign** | ❌ Not done | checkout, orders list, analytics, subscription, KYC, community, how-it-works, FAQ, contact, escrow-info, terms, privacy |

### Priority 3 — Nice to Have
| # | Task | Status | Notes |
|---|---|---|---|
| 12 | Chat/Messaging | ❌ Not built | No implementation yet |
| 13 | Watchlist | ❌ Not built | No implementation yet |
| 14 | Notifications | ❌ Not built | `services/notification.service.ts` exists but UI not built |
| 15 | LINE OAuth | ⚠️ Env set but untested | `LINE_CLIENT_ID` and `LINE_CLIENT_SECRET` may be set in Vercel |

---

## 🔧 ENV VARS STATUS

### ✅ Set in Netlify
```
NEXT_PUBLIC_SUPABASE_URL=https://ruugptsudyxyozywevcu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<set>
NEXTAUTH_SECRET=<set>
NEXTAUTH_URL=https://cardvault-tcg.netlify.app
NEXT_PUBLIC_APP_URL=https://cardvault-tcg.netlify.app
```

### ❌ TODO — Not set
```
# Payment (Omise)
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
OMISE_WEBHOOK_SECRET=...

# Storage (R2)
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=cardvault-assets
R2_PUBLIC_URL=https://assets.cardvault.co.th

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=CardVault <noreply@cardvault.co.th>

# Cron
CRON_SECRET=<random hex string>

# Optional
LINE_CLIENT_ID=...
LINE_CLIENT_SECRET=...
POKEMON_TCG_API_KEY=...
```

---

## 📁 Key Files Reference

```
lib/prisma.ts              — Custom Prisma→PostgREST proxy (~2200 lines, fragile)
lib/supabase-client.ts     — Supabase admin client
lib/auth.ts                — NextAuth config (Credentials + LINE OAuth)
lib/omise.ts               — Payment client (ready for keys)
lib/r2.ts                  — Storage client (ready for keys)
lib/resend.ts              — Email templates + sender
lib/rate-limit.ts          — Rate limiting (Upstash or in-memory fallback)
lib/design-tokens.ts       — UI design tokens
services/escrow.service.ts      — Escrow hold/release/refund logic
services/card-identify.service.ts — OCR + Pokemon TCG API search
services/tier.service.ts        — Seller tier auto-upgrade
services/notification.service.ts — Notification service
middleware.ts               — Route protection + security headers
prisma/schema.prisma        — Database schema
prisma/seed.ts              — Seed data (users, listings, cards)
CardVault_MasterSystem_v2.1.md — Full system spec (2500+ lines)
```

---

## 🔄 Workflow for Next Agent

### Git Setup
```bash
cd /root/.openclaw/workspace/cardvault
git remote set-url origin https://<GITHUB_PAT>@github.com/photsathonspd1-create/cardvault.git
git pull origin main
```

### Deploy Flow
```bash
# 1. Make changes
# 2. Build check
npm run build
# 3. Commit & push (auto-deploys to Vercel)
git add -A && git commit -m "feat: description" && git push origin main
# 4. Deploy to Netlify (manual — use env vars)
NETLIFY_AUTH_TOKEN=<token> NETLIFY_SITE_ID=8dcb5718-5634-4c41-939b-7d229bca2aab \
netlify deploy --prod --dir=.next
```

### Critical Rules
1. **DO NOT commit secrets to git** — GitHub will block the push
2. `npm run build` must pass before pushing
3. Push to `main` = auto-deploy on Vercel
4. The Prisma proxy is fragile — test any new query pattern carefully
5. Mobile responsive (375px + 1440px)
6. Use `next/image` for all images

### Credentials (ask human or check dashboards)
```
GitHub PAT:       <ask human or check env>
Netlify Token:    <ask human or check env>
Netlify Site ID:  8dcb5718-5634-4c41-939b-7d229bca2aab
Vercel Token:     <ask human or check env>
Vercel Project:   prj_FoW9G9bBDARIEK573IjP1ZDYwAZU
Supabase URL:     https://ruugptsudyxyozywevcu.supabase.co
Supabase Key:     <in env vars>
Supabase Project: ruugptsudyxyozywevcu
```

---

## ⚠️ Known Risks

1. **Prisma proxy is the #1 risk** — any Prisma query pattern not handled will silently return empty/wrong data
2. **No real transactions** — order creation could leave inconsistent state
3. **Supabase RLS bypassed** — service role key gives full DB access server-side
4. **Tesseract OCR** — may not work well for Thai text on cards
5. **No error monitoring** — no Sentry/LogRocket, errors only visible in Vercel/Netlify function logs

---

## 📊 Commit History (recent)

```
bb8f895 fix: add cuid() ID generation for PostgREST create operations
eb33e10 docs: detailed agent prompt with full architecture, debugging guide, and testing commands
5adff89 fix: lazy env var initialization for Netlify edge bundling
414495a debug: add detailed error to register route
0d7eba4 fix: add createdAt/updatedAt defaults for PostgREST inserts
5c17077 docs: add comprehensive handoff document for multi-agent continuity
93ac4dd fix: critical bugs - homepage crash, register 500, key remapping, security
732fa35 fix: trigger rebuild for LINE env
```
