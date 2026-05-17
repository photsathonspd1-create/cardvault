# CardVault — Agent Handoff Document

> Last updated: 2026-05-17 14:29 GMT+8
> Repo: https://github.com/photsathonspd1-create/cardvault
> Live: https://cardvault-drab.vercel.app/

---

## 📋 Project Overview

TCG Card Marketplace for Thailand. Next.js 14, Supabase (PostgREST), Vercel deployment.

**Architecture:**
- Frontend: Next.js 14 App Router, Tailwind CSS, shadcn/ui, Framer Motion
- Database: Supabase PostgreSQL (accessed via custom Prisma proxy → PostgREST)
- Auth: NextAuth v5 beta (Credentials + LINE OAuth)
- Payment: Omise (PromptPay QR + Credit Card)
- Storage: Cloudflare R2 (S3-compatible)
- Email: Resend
- OCR: Tesseract.js (card scanner)

**Key Custom Component — Prisma Proxy (`lib/prisma.ts`):**
~1100 lines. Translates Prisma-style queries into Supabase PostgREST calls.
This is the BIGGEST risk area — any Prisma feature not implemented in the proxy will silently fail.

---

## ✅ COMPLETED (commit 93ac4dd)

### 1. Prisma Proxy Key Remapping
- **Problem:** PostgREST returns nested data with PascalCase table names (`ListingImage`, `SellerProfile`) but frontend expects camelCase Prisma relation names (`images`, `seller`)
- **Fix:** Added `remapTableKeys()` function that recursively renames table keys back to relation names after PostgREST fetch
- **Files:** `lib/prisma.ts`
- **Status:** ✅ Committed & pushed

### 2. Homepage Crash
- **Problem:** `images: { take: 1, orderBy: { order: "asc" } }` inside include — proxy can't handle orderBy inside nested includes in PostgREST select string
- **Fix:** Removed `orderBy` from images include (data is still returned, just unordered within the take:1)
- **Files:** `app/(main)/page.tsx`, `app/(main)/browse/page.tsx`
- **Status:** ✅ Committed & pushed

### 3. Register API 500 Error
- **Problem:** `prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })` — proxy OR filter generates wrong PostgREST format
- **Fix:** Replaced with two separate `findUnique` calls (one by email, one by username)
- **Files:** `app/api/auth/register/route.ts`
- **Status:** ✅ Committed & pushed

### 4. Nested Select Missing `*`
- **Problem:** `buildSelectStringSimple` generated `SellerProfile(User(name,username))` but PostgREST needs `SellerProfile(*,User(name,username))` — the `*` is required
- **Fix:** Always include `*` as first element in `innerParts` for nested includes
- **Files:** `lib/prisma.ts`
- **Status:** ✅ Committed & pushed

### 5. OR Filter Format
- **Problem:** `buildPostgrestFilters` generated `or=(a),(b)` instead of `or=(a,b)`
- **Fix:** Changed join separator from `),(` to `,`
- **Files:** `lib/prisma.ts`
- **Status:** ✅ Committed & pushed

### 6. Debug Endpoint Security
- **Problem:** `/api/debug` publicly accessible — exposes Supabase URL, query patterns, DB structure
- **Fix:** Added auth check — only ADMIN users can access
- **Files:** `app/api/debug/route.ts`
- **Status:** ✅ Committed & pushed

### 7. Hardcoded Secrets Removed
- **Problem:** Supabase service role key hardcoded as fallback in `lib/prisma.ts` and `lib/supabase-client.ts`
- **Fix:** Removed fallbacks, added `throw new Error()` if env vars missing
- **Files:** `lib/prisma.ts`, `lib/supabase-client.ts`
- **Status:** ✅ Committed & pushed

### 8. Escrow Cron Auth
- **Problem:** Only checked `Authorization: Bearer` but Vercel Cron sends `x-vercel-cron-secret` header
- **Fix:** Accept both auth methods + allow in development mode
- **Files:** `app/api/cron/escrow-release/route.ts`
- **Status:** ✅ Committed & pushed

### 9. Card Scanner Fallback
- **Problem:** Tesseract.js v5 uses worker threads — crashes on Vercel serverless
- **Fix:** Try-catch around Tesseract import, returns empty text on failure so caller can use alternative search
- **Files:** `services/card-identify.service.ts`
- **Status:** ✅ Committed & pushed

### 10. Mock Upload Handler
- **Problem:** When R2 not configured, presigned URL endpoint returns mock URL that doesn't exist
- **Fix:** Created actual `/api/upload/mock` handler that accepts PUT/POST
- **Files:** `app/api/upload/mock/route.ts` (new)
- **Status:** ✅ Committed & pushed

### 11. Checkout Auth Check
- **Problem:** Checkout page didn't check if user was logged in before showing form
- **Fix:** Added `status === "unauthenticated"` check with redirect UI
- **Files:** `app/(main)/checkout/[listingId]/page.tsx`
- **Status:** ✅ Committed & pushed

### 12. Duplicate Email Service
- **Problem:** Two email files (`lib/email.ts` + `lib/resend.ts`) with duplicate `sendEmail`
- **Fix:** `lib/email.ts` now re-exports from `lib/resend.ts`; added `sendPasswordResetEmail` to resend.ts
- **Files:** `lib/email.ts`, `lib/resend.ts`
- **Status:** ✅ Committed & pushed

---

## 🔴 STILL BROKEN / NEEDS WORK

### 1. Prisma Proxy — Fundamental Limitations
The custom PostgREST proxy has many edge cases. Known issues:
- `$transaction` is NOT a real database transaction — just sequential calls. Order creation could have data inconsistency
- `$queryRaw` / `$queryRawUnsafe` uses Supabase Management API (not configured)
- Nested `orderBy` inside includes not supported (only `take` works)
- `dispute: null` in where clause may not work (needed for escrow auto-release)
- `_count` with nested relations may return wrong counts
- `increment`/`decrement` in updates does read-then-write (race condition possible)

**Recommendation:** Consider switching to Supabase's direct PostgreSQL connection (Transaction pooler) with real Prisma Client, OR thoroughly test every query path through the proxy.

### 2. Omise Payment — Not Configured
**What's needed:**
- Sign up at https://www.omise.co
- Get `OMISE_PUBLIC_KEY` (pkey_...) and `OMISE_SECRET_KEY` (skey_...)
- Set `OMISE_WEBHOOK_SECRET` for webhook verification
- Add Omise.js SDK to frontend for credit card tokenization
- Set env vars in Vercel

**Files involved:**
- `lib/omise.ts` — client wrapper (ready, just needs keys)
- `app/api/payments/charge/route.ts` — create charges
- `app/api/webhooks/omise/route.ts` — handle payment callbacks
- `services/escrow.service.ts` — escrow hold/release/refund

### 3. Cloudflare R2 Storage — Not Configured
**What's needed:**
- Create Cloudflare R2 bucket
- Generate API token with R2 permissions
- Set env vars: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- Configure custom domain for public access

**Files involved:**
- `lib/r2.ts` — S3-compatible client (ready, just needs keys)
- `app/api/upload/presigned-url/route.ts` — generates presigned PUT URLs

### 4. Resend Email — Not Configured
**What's needed:**
- Sign up at https://resend.com
- Get `RESEND_API_KEY` (re_...)
- Set `RESEND_FROM_EMAIL` (e.g., "CardVault <noreply@cardvault.co.th>")
- Verify domain in Resend dashboard

**Files involved:**
- `lib/resend.ts` — email templates ready (order paid, shipped, completed, dispute, password reset)

### 5. CRON_SECRET Not Set
**What's needed:**
- Generate random string: `openssl rand -hex 32`
- Set as `CRON_SECRET` in Vercel env vars
- Escrow auto-release cron will then work

### 6. Login May Still Fail
**Issue:** Login uses `prisma.user.findUnique({ where: { email } })` which should work with the proxy now, but:
- Seed data may not have been run on the live Supabase database
- The `passwordHash` field needs to exist in the returned data

**To verify:** Run `npx prisma db seed` against the live database, or manually check if users exist in Supabase dashboard.

### 7. Browse Search Uses OR (Now Fixed, But...)
The browse page search uses `OR` with `customName contains` and `cardId in [...]`. The OR format is fixed, but the `contains` with `mode: "insensitive"` needs to work through the proxy. Verify this works after deploy.

### 8. Community/Forum — Empty
No seed data for community posts, forum threads. Pages load but show empty states.

### 9. Image Domains Not Configured
`next.config.js` may need `images.remotePatterns` for external image domains (Pokémon TCG API images, Supabase storage URLs).

---

## 🔧 ENV VARS NEEDED (set in Vercel)

```
# Required (already set — verify these are correct)
NEXT_PUBLIC_SUPABASE_URL=https://ruugptsudyxyozywevcu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXTAUTH_SECRET=<random string>
NEXTAUTH_URL=https://cardvault-drab.vercel.app

# Payment (Omise) — TODO
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
OMISE_WEBHOOK_SECRET=...

# Storage (R2) — TODO
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=cardvault-assets
R2_PUBLIC_URL=https://assets.cardvault.co.th

# Email (Resend) — TODO
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=CardVault <noreply@cardvault.co.th>

# Cron — TODO
CRON_SECRET=<random hex string>

# Optional
LINE_CLIENT_ID=...
LINE_CLIENT_SECRET=...
POKEMON_TCG_API_KEY=...
```

---

## 📁 Key Files Reference

```
lib/prisma.ts          — Custom Prisma→PostgREST proxy (⚠️ complex, fragile)
lib/supabase-client.ts — Supabase admin client
lib/auth.ts            — NextAuth config (Credentials + LINE OAuth)
lib/omise.ts           — Payment client (ready for keys)
lib/r2.ts              — Storage client (ready for keys)
lib/resend.ts          — Email templates + sender
lib/rate-limit.ts      — Rate limiting (Upstash or in-memory fallback)
services/escrow.service.ts  — Escrow hold/release/refund logic
services/card-identify.service.ts — OCR + Pokemon TCG API search
services/tier.service.ts    — Seller tier auto-upgrade
middleware.ts           — Route protection + security headers
prisma/schema.prisma    — Database schema
prisma/seed.ts          — Seed data (users, listings, cards)
```

---

## 🚀 Deploy Flow

1. Code changes → push to `main` branch
2. Vercel auto-deploys from GitHub
3. Set env vars in Vercel dashboard: https://vercel.com/dashboard
4. Run seed: `npx prisma db seed` (against live Supabase)

---

## ⚠️ Known Risks

1. **Prisma proxy is the #1 risk** — any Prisma query pattern not handled will silently return empty/wrong data
2. **No real transactions** — order creation could leave inconsistent state if something fails mid-way
3. **Supabase RLS** — using service role key bypasses RLS, which is fine for server-side but means ALL server code has full DB access
4. **Tesseract OCR** — may not work well for Thai text on cards (designed for English/Japanese)
