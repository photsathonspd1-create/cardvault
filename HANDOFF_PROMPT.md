# 🔧 CardVault — Handoff Prompt for Next Agent

## 📍 Project Info
- **Repo:** https://github.com/photsathonspd1-create/cardvault
- **Live:** https://cardvault-drab.vercel.app/
- **Stack:** Next.js 14.2.21, Custom Prisma-on-Supabase adapter (lib/prisma.ts), Supabase (PostgreSQL), Tailwind + shadcn/ui, NextAuth v5

### 🔑 Tokens
Tokens are stored in the previous agent's session. Ask the human for them, or check:
- **GitHub:** `ghp_...` (ask human)
- **Vercel:** `vcp_...` (ask human)
- **Supabase:** `sbp_...` (ask human)
- **Supabase Project:** `ruugptsudyxyozywevcu`
- **Vercel Project ID:** `prj_FoW9G9bBDARIEK573IjP1ZDYwAZU`

---

## ✅ Already Fixed (Don't Redo)

1. **Card Catalog Pages** (`/card/card_01`–`card_12`) — removed duplicate code block, added placeholder image, all 12 pages working
2. **Listing Pages** (`/listing/lst_01`–`lst_12`) — fixed `User.image` → `User.avatar` in Prisma select, all 12 pages working
3. **Browse Search** — fixed `card.name` relation filter (now queries CardCatalog first, uses `cardId.in`), fixed `mode:"insensitive"` leaking as PostgREST column filter in OR clauses
4. **Footer pages** (faq, how-it-works, escrow-info, contact, terms, privacy) — created
5. **`/forgot-password`** page — created
6. **`/grid.svg`** — created
7. **Login autoComplete** — added
8. **Homepage hardcoded stats** → real DB data
9. **Browse page nested filter** — fixed
10. **Favicon + OG image + PWA manifest** — created
11. **Sitemap** — includes all 10 static + 24 dynamic pages
12. **NEXTAUTH_SECRET** — randomized (40 chars)
13. **NEXTAUTH_URL / NEXT_PUBLIC_APP_URL** — set to `https://cardvault-drab.vercel.app`
14. **Middleware public paths** — includes forgot-password + footer pages
15. **`getRelativeTime()`** — now accepts both `Date` and `string`
16. **All `session!`** → `session?.` across 5 files
17. **All `seller.user.name`** → optional chaining across browse, listing, card, admin pages
18. **SellerProfile creation** — wrapped in try-catch
19. **Date serialization** — wrapped `.toLocaleDateString()` / `.toISOString()` with `new Date()`
20. **`@ts-nocheck`** restored on browse page (custom Prisma wrapper type issues)
21. **`framer-motion`** installed

---

## 🔴 REMAINING BUGS — Fix These

### Bug 1: `/profile` Page Error

**Symptom:** Page shows "เกิดข้อผิดพลาดที่ไม่คาดคิด" (unexpected error)

**Vercel Error Log:**
```
[supabase-db] findUnique User PostgREST error: PostgREST 400:
  "Could not find a relationship between 'SellerProfile' and '_count' in the schema cache"
[supabase-db] No FK mapping for User → SellerProfile
TypeError: Cannot read properties of undefined (reading 'buyerOrders')
  at j (/var/task/.next/server/app/(main)/profile/page.js:1:9903)
```

**Root Cause:** Two issues:
1. The Prisma query in `app/(main)/profile/page.tsx` includes `_count` on `SellerProfile`, but the custom Prisma adapter (`lib/prisma.ts`) does NOT support `_count` — it's skipped in `buildSelectStringSimple()` with `if (relation === "_count") continue`
2. The `fetchIncludes` function says "No FK mapping for User → SellerProfile" — but the mapping IS there. Check if `RELATION_MAP_SCOPED.User` → `SellerProfile` and `guessForeignKey("User", "SellerProfile")` work correctly.
3. The page tries to access `user.buyerOrders` but the query doesn't include that relation.

**Debug Steps:**
```bash
cat app/\(main\)/profile/page.tsx
```
Look at the Prisma query — check what `include` or `select` is used. The `_count` feature needs to be implemented in the adapter OR the query needs to be rewritten to not use `_count`.

**Fix approach:**
- Option A: Implement `_count` in `lib/prisma.ts` (count child rows via separate Supabase query)
- Option B: Rewrite the profile page query to not use `_count` — fetch counts separately using `prisma.listing.count()`, `prisma.order.count()`, etc.

---

### Bug 2: `/sell/orders` and `/orders` Pages — Order Ambiguous Relationship

**Vercel Error Log:**
```
[supabase-db] findMany Order PostgREST error: PostgREST 300:
  "Could not embed because more than one relationship was found for 'Order' and 'User'"
  hint: "Try changing 'User' to one of: 'User!Order_buyerId_fkey', 'User!Order_sellerId_fkey'"
```

**Root Cause:** The `Order` model has TWO foreign keys to `User`: `buyerId` and `sellerId`. When the Prisma adapter builds a select string like `Order(*,User(*))`, PostgREST can't determine which relationship to use.

**Fix approach:**
- The `RELATION_MAP_SCOPED` in `lib/prisma.ts` needs to handle ambiguous relationships
- For Order → User, you need TWO separate fetches: one for buyer and one for seller
- Or use PostgREST's explicit hint syntax: `User!Order_buyerId_fkey(*)` and `User!Order_sellerId_fkey(*)`
- Update `buildSelectStringSimple()` and `fetchIncludes()` to handle this case

---

### Bug 3: `/orders` and `/profile` — Missing FK mapping

**Error:** `[supabase-db] No FK mapping for User → SellerProfile`

**Root Cause:** In `guessForeignKey("User", "SellerProfile")`, the function checks `fkChild["User"]` which has `SellerProfile: "userId"` and `fkParent["User"]` which has `SellerProfile: "userId"`. But the function returns `{ fkColumn: "userId", parentFk: "userId" }` — this means it thinks the FK is on BOTH sides, which confuses the one-to-one detection.

**Fix:** In `guessForeignKey`, when both `fkChild` and `fkParent` point to the same column, prioritize the correct direction. For User → SellerProfile, the FK (`userId`) is on the **child** table (SellerProfile), so `isOneToOne("User", "SellerProfile")` should return `false` (it's actually one-to-one but fetched from child side).

---

## 🟡 Known Lower Priority Issues

- **Supabase service_role key** was exposed in chat history — should rotate when possible
- **`conditionColors` in `lib/design-tokens.ts`** uses short keys (NM, EX, GD, PL, PR) but Prisma enum uses full names (NEAR_MINT, EXCELLENT, GOOD, PLAYED, POOR) — listing detail page works via fallback but condition indicator dots won't match

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `lib/prisma.ts` | **Custom Prisma-on-Supabase adapter** — THIS IS WHERE MOST FIXES GO |
| `lib/design-tokens.ts` | Color tokens, condition colors, seller tiers |
| `lib/utils.ts` | formatPrice, getRelativeTime, SERIES_LABELS, CONDITION_LABELS |
| `app/(main)/profile/page.tsx` | **🔴 HAS BUG — profile page** |
| `app/(main)/sell/orders/page.tsx` | **🔴 HAS BUG — seller orders** |
| `app/(main)/orders/page.tsx` | **🔴 HAS BUG — buyer orders** |
| `app/(main)/card/[catalogId]/page.tsx` | Card catalog (FIXED ✅) |
| `app/(main)/listing/[id]/page.tsx` | Listing detail (FIXED ✅) |
| `app/(main)/browse/page.tsx` | Browse/search (FIXED ✅) |
| `middleware.ts` | Auth guard + security headers |
| `prisma/schema.prisma` | Database schema |

---

## 🚀 Deploy & Verify Workflow

```bash
# Clone & setup
git clone https://github.com/photsathonspd1-create/cardvault.git
cd cardvault
npm install
npx prisma generate

# Fix, commit, push (Vercel auto-deploys from main)
git config user.email "bot@cardvault.co.th"
git config user.name "CardVault Bot"
git add -A
git commit -m "fix: [describe fix]"
git remote set-url origin https://[GITHUB_TOKEN]@github.com/photsathonspd1-create/cardvault.git
git pull --rebase origin main
git push origin main

# Wait ~60s for Vercel deploy, then verify
sleep 60
curl -s -o /dev/null -w "%{http_code}" "https://cardvault-drab.vercel.app/profile"

# Check for errors
npx vercel logs https://cardvault-drab.vercel.app --token [VERCEL_TOKEN] --level error --expand --since 2m -n 10
```

---

## ⚠️ Important Notes

1. **`lib/prisma.ts` is NOT a real Prisma client** — it's a custom adapter that translates Prisma-style queries into Supabase PostgREST calls. Many Prisma features (`_count`, nested relation filters with `mode`, ambiguous relations) are NOT supported.
2. **Always add `// @ts-nocheck`** to pages that use `prisma` — the adapter's types don't match real Prisma.
3. **Test locally with `npm run build`** before pushing — Vercel build failures are silent (just "Error" status).
4. **Run `git pull --rebase origin main`** before pushing — there's another agent that also pushes changes.
