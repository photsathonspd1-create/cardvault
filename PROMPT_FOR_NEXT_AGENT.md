# CardVault — Agent Handoff Prompt

> Copy this entire prompt to your next agent session.

---

You are working on **CardVault** — a premium Thai TCG card marketplace.

## URLs
- **Netlify (active):** https://cardvault-tcg.netlify.app
- **Vercel (deploy limit reached):** https://cardvault-drab.vercel.app
- **Repo:** https://github.com/photsathonspd1-create/cardvault
- **Netlify Dashboard:** https://app.netlify.com/sites/cardvault-tcg

## Credentials
```
GitHub PAT:       <ask human>
Vercel Token:     <ask human — deploys paused until ~2026-05-18 15:00 due to 100/day limit>
Netlify Token:    nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86
Netlify Site ID:  8dcb5718-5634-4c41-939b-7d229bca2aab
Supabase URL:     https://ruugptsudyxyozywevcu.supabase.co
Supabase Key:     <in env vars — ask human or check Vercel/Netlify dashboard>
Supabase Project: ruugptsudyxyozywevcu
```

## Tech Stack
Next.js 14 App Router, Supabase PostgreSQL (via custom Prisma proxy → PostgREST), NextAuth v5 beta, Tailwind CSS, shadcn/ui, Framer Motion

## Git Setup
```bash
cd /root/.openclaw/workspace/cardvault
git config user.email "agent@openclaw.ai"
git config user.name "OpenClaw Agent"
git remote set-url origin https://<GITHUB_PAT>@github.com/photsathonspd1-create/cardvault.git
git pull origin main
```

## Deploy Flow
```bash
# Netlify deploy (preferred — Vercel limit reached)
export NETLIFY_AUTH_TOKEN="nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86"
cd /root/.openclaw/workspace/cardvault
netlify deploy --prod --build

# Vercel deploy (when limit resets ~2026-05-18 15:00)
git push origin main  # auto-deploys
```

## Current Status — What's Done (15 bug fixes + full UI)

### Bug Fixes (all committed & pushed)
1. Prisma proxy key remapping (PascalCase → camelCase)
2. Homepage crash (orderBy in nested includes)
3. Register API 500 (OR filter format)
4. Nested select missing `*` for PostgREST
5. OR filter format `or=(a,b)`
6. Debug endpoint security (admin only)
7. Hardcoded secrets removed
8. Escrow cron auth (Bearer + x-vercel-cron-secret)
9. Tesseract.js crash fallback
10. Mock upload handler
11. Checkout auth check
12. Duplicate email service consolidated
13. PostgREST insert defaults (createdAt/updatedAt)
14. **Profile page crash** — PostgREST 1:1 arrays not unwrapped (added `unwrapOneToOneArrays()` + `processNestedCounts()`)
15. **Settings page** — created `/settings` + `GET/PATCH /api/users/me`

### Pages Working (all return 200)
Homepage, Browse, Listing Detail, Card Detail, Profile (own + public), Settings, Login, Register, Forgot Password, Reset Password, Sell Dashboard, Sell/New, Sell/Analytics, Sell/KYC, Sell/Listings, Sell/Orders, Sell/Subscription, Admin Panel (5 sub-pages), Orders, Order Detail, Checkout, Check (Scammer), Community, Forum, FAQ, How-it-works, Terms, Privacy, Contact, Escrow-info

### Design System
- bg: `#09090b` (zinc-950), accent: `#F59E0B` (amber-500), purple: `#7C3AED`
- Fonts: Sarabun (Thai) + Inter (Latin)
- Theme: "Dark Gaming Luxury"
- Tokens: `lib/design-tokens.ts`, `tailwind.config.ts`, `app/globals.css`

## 🔴 CRITICAL — Fix These Next

### 1. NextAuth broken on Netlify (HIGHEST PRIORITY)
**Problem:** `/api/auth/session` returns 500 on Netlify. Login/register likely don't work.
**Cause:** NextAuth edge runtime + Netlify edge functions compatibility issue.
**Debug steps:**
1. Check Netlify function logs: https://app.netlify.com/sites/cardvault-tcg/logs/functions
2. Check edge function logs: https://app.netlify.com/sites/cardvault-tcg/logs/edge-functions
3. The `middleware.ts` imports `auth` from `lib/auth.ts` which imports `prisma` — edge bundling may fail
4. Consider: move auth check out of middleware, or use Netlify's built-in auth, or configure NextAuth for Netlify

**Key files:**
- `middleware.ts` — route protection (uses `auth()`)
- `lib/auth.ts` — NextAuth config (Credentials + LINE OAuth)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler

### 2. Omise Payment — Not Configured
Need `OMISE_PUBLIC_KEY`, `OMISE_SECRET_KEY`, `OMISE_WEBHOOK_SECRET`
Files: `lib/omise.ts`, `app/api/payments/charge/route.ts`, `app/api/webhooks/omise/route.ts`

### 3. Cloudflare R2 Storage — Not Configured
Need `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
Files: `lib/r2.ts`, `app/api/upload/presigned-url/route.ts`

### 4. Resend Email — Not Configured
Need `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
Files: `lib/resend.ts`

### 5. CRON_SECRET — Not Set
Generate: `openssl rand -hex 32`
For escrow auto-release cron

## Key Files
```
lib/prisma.ts              — Custom Prisma→PostgREST proxy (⚠️ fragile, ~2200 lines)
lib/supabase-client.ts     — Supabase admin client (lazy init via Proxy)
lib/auth.ts                — NextAuth config
lib/omise.ts               — Payment client (ready for keys)
lib/r2.ts                  — Storage client (ready for keys)
lib/resend.ts              — Email templates
lib/rate-limit.ts          — Rate limiting
lib/design-tokens.ts       — UI tokens
services/escrow.service.ts      — Escrow logic
services/card-identify.service.ts — OCR
services/tier.service.ts        — Seller tiers
services/notification.service.ts — Notifications
middleware.ts               — Route protection
prisma/schema.prisma        — DB schema
prisma/seed.ts              — Seed data
HANDOFF.md                  — Detailed status doc
CardVault_MasterSystem_v2.1.md — Full system spec (2500+ lines)
```

## Critical Rules
1. **NEVER commit secrets to git** — GitHub blocks pushes with tokens
2. `npx tsc --noEmit` must pass before pushing
3. Use Netlify deploy for now (Vercel limit reached)
4. The Prisma proxy is fragile — test any new query pattern carefully
5. Mobile responsive (375px + 1440px)
6. `next/image` for all images
7. Env vars are lazy-initialized (getSupabaseUrl()/getSupabaseServiceKey()) — don't add top-level throws

## Known Risks
1. Prisma proxy is #1 risk — any unhandled query pattern silently fails
2. No real transactions — sequential calls only
3. Supabase RLS bypassed (service role key)
4. Tesseract OCR may not work for Thai text
5. No error monitoring (no Sentry)
