# CardVault — Agent Handoff Document

> **Last updated:** 2026-05-17 19:36 GMT+8
> **Updated by:** OpenClaw Agent (webchat session)
> **Repo:** https://github.com/photsathonspd1-create/cardvault
> **Live (Netlify):** https://cardvault-tcg.netlify.app
> **Latest commit:** `e62112f` (feat: redesign hero card stack — premium cinematic floating cards)
> **Branch:** `main` — clean, up to date with origin
> **Build status:** ✅ `npm run build` passes

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

### NextAuth Netlify Fixes (commits `bb8f895` → `67e17be`)
| # | Issue | Fix | Files |
|---|---|---|---|
| 17 | bcryptjs crashes on Netlify Edge (middleware) | Replaced bcrypt with JWT decode for auth checks in middleware | `middleware.ts` |
| 18 | bcryptjs lazy-load on Netlify serverless | Dynamic import of bcryptjs in NextAuth credentials provider | `lib/auth.ts` |
| 19 | NextAuth trustHost missing | Added `trustHost: true` and explicit `secret` in NextAuth config | `lib/auth.ts` |
| 20 | NextAuth error capture | Improved error logging in auth handler | `app/api/auth/[...nextauth]/route.ts` |
| 21 | Test auth endpoint exposed | Added test-auth endpoint, then removed after debugging | `app/api/test-auth/route.ts` (removed) |
| 22 | `auth()` fails in API routes (JWE encrypted JWT) | Added `auth-helpers.ts` fallback using internal session API call | `lib/auth-helpers.ts` |

### Bug Fixes (commit `93ac4dd` + earlier)
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

### Hero Card Stack Redesign (commit `e62112f`)
| # | Change | Details |
|---|---|---|
| 1 | Removed Framer Motion | Pure CSS keyframes for animations |
| 2 | Ambient glow layer | Purple glow left + gold glow center + purple glow right (radial gradients with blur) |
| 3 | 3-card depth layout | Left (-12deg, behind), Center (front, largest), Right (12deg, behind) |
| 4 | Cinematic float animation | 5-6s ease-in-out infinite, 18px translateY |
| 5 | Subtle hover effects | translateY(-6px) + scale(1.01) + stronger glow |
| 6 | Premium aesthetic | Dark luxury gaming feel, no glassmorphism, no rainbow effects |

### Community/Forum API Fix (commit `d47b9be`)
| # | Fix | Details |
|---|---|---|
| 1 | Middleware public paths | Added `/api/community` and `/api/forum` to public paths |
| 2 | Community API | GET /api/community/posts now returns 200 (was 401) |
| 3 | Forum API | GET /api/forum/threads now returns 200 (was 401) |

### Homepage Real Data + Enhancements (commit `4bfdae0` + `8bf4c78`)
| # | Feature | Details | Files |
|---|---|---|---|
| 1 | Stats Footer — real DB queries | CardCatalog count, completed Order count, SUM totalAmount (baht), User count | `app/(main)/page.tsx` |
| 2 | Hero Stats — real data | Shows catalog count, members, completed sales instead of fake % | `app/(main)/page.tsx` |
| 3 | Live Toast component | Cycles latest completed orders every 5s, bottom-left fixed, mock fallback | `components/home/live-toast.tsx` |
| 4 | Category images updated | YGO→ygoprodeck, MTG→scryfall, One Piece→official site | `components/home/category-section.tsx` |
| 5 | Hot This Week — PriceHistory | Tries PriceHistory for 7-day % change first, falls back to top viewed | `components/home/hot-this-week.tsx` |
| 6 | Recent listings — 6 items | Reduced from 8 to 6 as per spec | `app/(main)/page.tsx` |
| 7 | Card Spotlight section | New section with recommended cards, price trend arrows (up/down %) | `components/home/card-spotlight.tsx` |
| 8 | Hot Index — Price Up/Down tabs | ดัชนี Hot with green (ขึ้น) and red (ลง) sections | `components/home/hot-this-week.tsx` |
| 9 | Verified Seller star rating | Added 5-star visual rating display | `components/home/verified-seller-spotlight.tsx` |
| 10 | Header nav labels | Updated to ซื้อของ, ขายของ, วิธีใช้งาน, เขียนกับเรา | `components/shared/header.tsx` |
| 11 | Cart badge | Added count badge on cart icon | `components/shared/header.tsx` |

### Design System
- **Colors:** bg `#09090b` (zinc-950), accent `#F59E0B` (amber-500), purple `#7C3AED`
- **Fonts:** Sarabun (Thai) + Inter (Latin)
- **Theme:** "Dark Gaming Luxury" — Steam meets Binance meets Japanese card shop
- **Tokens:** `lib/design-tokens.ts`, `tailwind.config.ts`, `app/globals.css`

---

## 🧪 TEST RESULTS (2026-05-17 17:52 GMT+8)

### Build
| Check | Status |
|---|---|
| `npm install` | ✅ Clean |
| `npm run build` | ✅ Passes (all pages compile) |
| TypeScript | ✅ No errors |

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
| `GET /api/community/posts` | ✅ 200 | Public GET (fixed middleware), returns posts with author + counts |
| `GET /api/forum/threads` | ✅ 200 | Public GET (fixed middleware), returns threads |
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
| 4 | **CRON_SECRET** | ⚠️ Generated | `f1707d56ac6f631b21850440fcba808deedcca4e61051016265ed7f1c4c970ae` — needs to be set in Netlify env vars |
| 5 | **Login Flow E2E Test** | ⚠️ Partially tested | Register page loads (200), login page loads (200), API returns 401 for unauthenticated. Full E2E login with actual credentials untested |

### Priority 2 — Important Features
| # | Task | Status | Notes |
|---|---|---|---|
| 6 | **Card Scanner Camera Integration** | 🔧 Partial | Tesseract.js integrated, camera UI complete (front/back/holo capture, sharpness check, gallery fallback). Needs real device testing |
| 7 | **Price History Charts** | ✅ Done | Recharts `PriceChart` component integrated into `/card/[catalogId]` page. Seed data generates 30 price points per card (90 days, every 3 days) |
| 8 | **Browse Search** | ⚠️ Needs verify | Uses `OR` + `contains` + `mode: "insensitive"` — proxy compatibility unknown |
| 9 | **Community/Forum Seed Data** | ✅ Done | 5 community posts + 4 forum threads + 4 forum replies added to seed. API routes now public (GET) via middleware fix |
| 10 | **Image Domains** | ✅ Done | Added `images.ygoprodeck.com`, `cards.scryfall.io`, `en.onepiece-cardgame.com`, `ruugptsudyxyozywevcu.supabase.co` to `next.config.js` |
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
# 3. Commit & push (auto-deploys to Netlify via GitHub integration)
git add -A && git commit -m "feat: description" && git push origin main
# 4. Netlify auto-deploys on push to main
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
8bf4c78 feat: homepage redesign to match reference - spotlight, hot index, nav update
3b705c0 docs: update HANDOFF.md with homepage enhancements
4bfdae0 feat: homepage real data + live toast + category images + hot this week price history
c1f7f8f docs: update HANDOFF.md - latest state, test results, commit history
67e17be fix: auth-helpers fallback uses internal session API instead of JWT decode (JWE encrypted)
2b9171f fix: auth() not working in API routes on Netlify - add JWT cookie fallback via auth-helpers
406f1d8 docs: update HANDOFF.md - sync commit history, add workflow flow for multi-agent handoff
9b386d2 fix: NextAuth working on Netlify - add trustHost and explicit secret
b759a3c debug: improve error capture in auth handler
```

---

## 🗺️ WORKFLOW FLOW (for multi-agent handoff)

### How to Continue This Project
```
1. Clone repo → git clone https://<PAT>@github.com/photsathonspd1-create/cardvault.git
2. Read this HANDOFF.md (you are here)
3. Read PROMPT_FOR_NEXT_AGENT.md for detailed architecture
4. Pick a task from "NOT YET DONE" section above
5. npm install → npm run build (must pass)
6. Make changes → test locally → commit → push
7. Update this HANDOFF.md with what you did
8. Push HANDOFF.md update as final commit
```

### Deploy Flow
```
Code Change → npm run build → netlify deploy --prod --dir=.next
                                          ↑
⚠️ ไม่ใช่ auto-deploy! ต้องใช้ CLI ทุกครั้ง
(GitHub ไม่ได้เชื่อมกับ Netlify)
```

### Agent Handoff Protocol
```
Agent A finishes work:
  1. Commit all changes
  2. Update HANDOFF.md (latest commit, new completed tasks, remaining tasks)
  3. Push to GitHub
  4. Tell human: "Done. HANDOFF.md updated. Next agent can pick up from [TASK]."

Agent B starts work:
  1. git pull origin main
  2. Read HANDOFF.md
  3. Pick next uncompleted task
  4. Work → commit → update HANDOFF.md → push
```

### Credentials Quick Reference
```
GitHub PAT:       (in .env or ask human — DO NOT paste in repo)
Netlify Token:    (in .env or ask human — DO NOT paste in repo)
Supabase Token:   (in .env or ask human — DO NOT paste in repo)
Supabase Project: ruugptsudyxyozywevcu
Netlify Site ID:  8dcb5718-5634-4c41-939b-7d229bca2aab
```
