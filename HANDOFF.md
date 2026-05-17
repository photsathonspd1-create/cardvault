# CardVault — Agent Handoff Document
## Updated: 2026-05-17

---

## 🔗 Project Links

| Resource | URL |
|----------|-----|
| **เว็บ (Production)** | https://cardvault-drab.vercel.app/ |
| **GitHub Repo** | https://github.com/photsathonspd1-create/cardvault |
| **Vercel Dashboard** | https://vercel.com/photsathon-kumtaews-projects/cardvault |

---

## 🔑 Tokens & Credentials

> **⚠️ NEVER commit tokens to git. Use environment variables or pass them in chat.**

```
# Ask the human for these credentials:
GitHub PAT:       (ask human)
Vercel Token:     (ask human)
Vercel Project:   prj_FoW9G9bBDARIEK573IjP1ZDYwAZU
Supabase URL:     https://ruugptsudyxyozywevcu.supabase.co
Supabase Key:     (ask human)
Supabase Project: ruugptsudyxyozywevcu
```

---

## 📦 Tech Stack

- **Framework:** Next.js 14.2.21 (App Router)
- **Database:** Prisma + Supabase (PostgreSQL)
- **Auth:** NextAuth 5.0.0-beta.25
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion
- **Payment:** Omise (Thai payment gateway)
- **Hosting:** Vercel (auto-deploy from `main` branch)
- **Font:** Sarabun (Thai) + Inter (Latin) — Google Fonts

---

## 🎨 UI Redesign Status (Completed 2026-05-17)

**Theme: "Dark Gaming Luxury"** — zinc-950 bg, amber-500 accent, purple secondary

### ✅ Completed Pages (10/10)

| Page | File | Status |
|------|------|--------|
| Homepage | `app/(main)/page.tsx` | ✅ Redesigned |
| Browse | `app/(main)/browse/page.tsx` + `browse-content.tsx` | ✅ Redesigned |
| Listing Detail | `app/(main)/listing/[id]/page.tsx` + `listing-detail-client.tsx` | ✅ Redesigned |
| Sell/New (4-step wizard) | `app/sell/new/page.tsx` | ✅ Redesigned |
| Seller Dashboard | `app/sell/page.tsx` | ✅ Redesigned |
| Order Detail | `app/(main)/orders/[id]/page.tsx` | ✅ Redesigned |
| Profile | `app/(main)/profile/[username]/page.tsx` | ✅ Redesigned |
| Scammer Check | `app/check/page.tsx` | ✅ Redesigned |
| Admin Panel | `app/admin/page.tsx` | ✅ Redesigned |
| Auth (Login + Register) | `app/(auth)/login/page.tsx`, `register/page.tsx` | ✅ Redesigned |

### ✅ Completed Components

| Component | File |
|-----------|------|
| Navbar | `components/shared/header.tsx` |
| Footer | `components/shared/footer.tsx` |
| Mobile Bottom Nav | `components/shared/mobile-bottom-nav.tsx` |
| Live Toast | `components/shared/live-toast.tsx` |
| Hero Cards (floating) | `components/home/hero-cards.tsx` |
| Stats Counter | `components/home/stats-counter.tsx` |
| Scammer Check Bar | `components/home/scammer-check-bar.tsx` |
| Category Section | `components/home/category-section.tsx` |
| Hot This Week | `components/home/hot-this-week.tsx` |
| Verified Sellers | `components/home/verified-seller-spotlight.tsx` |
| Listing Card | `components/listing/listing-card.tsx` |
| Filter Sidebar | `components/browse/filter-sidebar.tsx` |

### ✅ Design System

| File | Description |
|------|-------------|
| `tailwind.config.ts` | Full color tokens, animations, shadows, gradients |
| `app/globals.css` | CSS variables for dark theme, utilities |
| `lib/design-tokens.ts` | Color constants, effects, animation configs, tier/condition colors |
| `app/layout.tsx` | Root layout with Sarabun + Inter fonts |

---

## ⚠️ Known Issues / Next Steps

1. **`@ts-nocheck` in `app/(main)/page.tsx`** — ต้องลบออกแล้ว fix type errors (ขัดกับ rule "ห้ามใช้ any type")
2. **Mock Data:** Seller dashboard, profile, hot-this-week, scammer check use mock data — need real API integration
3. **Missing Features:**
   - Realtime price history chart (Recharts) on listing detail
   - Card scanner camera integration (Step 1 of sell wizard)
   - Payment flow (Omise integration) on checkout
   - Chat/messaging between buyer/seller
   - Watchlist functionality
   - Notification system
4. **Pages Not Redesigned:**
   - `app/(main)/checkout/[listingId]/page.tsx` — checkout flow
   - `app/(main)/orders/page.tsx` — orders list
   - `app/sell/analytics/page.tsx` — analytics (currently Recharts)
   - `app/sell/subscription/page.tsx` — subscription plans
   - `app/sell/kyc/page.tsx` — KYC verification
   - `app/community/*` — forum pages
   - `app/(main)/how-it-works/page.tsx`
   - `app/(main)/faq/page.tsx`
   - `app/(main)/contact/page.tsx`
   - `app/(main)/escrow-info/page.tsx`
   - `app/(main)/terms/page.tsx`
   - `app/(main)/privacy/page.tsx`
5. **Seller Dashboard:** Uses client-side tab switching, not URL-based routing — sub-pages like `/sell/listings`, `/sell/orders` still have old code
6. **Admin Sub-pages:** `app/admin/listings/`, `app/admin/disputes/`, `app/admin/users/` still have old code — main admin page uses client-side tabs

---

## ✅ PHASE B + C — Verified Complete (2026-05-17 11:03)

Agent ตรวจสอบแล้ว — ทุกไฟล์ใน PHASE B (Shared Components) และ PHASE C (Homepage) ทำครบแล้ว:

| # | Component | File | Status |
|---|-----------|------|--------|
| 1 | Design Tokens | `tailwind.config.ts` | ✅ colors, animations, shadows, gradients |
| 2 | Google Fonts | `app/layout.tsx` | ✅ Sarabun + Inter |
| 3 | Navbar | `components/shared/header.tsx` | ✅ scroll blur, mobile drawer, active underline |
| 4 | Footer | `components/shared/footer.tsx` | ✅ 4-column, social links, bottom bar |
| 5 | Mobile Bottom Nav | `components/shared/mobile-bottom-nav.tsx` | ✅ 5 tabs, center amber, badge |
| 6 | Hero Cards | `components/home/hero-cards.tsx` | ✅ floating animation, mouse parallax, glow |
| 7 | Scammer Check Bar | `components/home/scammer-check-bar.tsx` | ✅ search + stats |
| 8 | Category Section | `components/home/category-section.tsx` | ✅ 4 series cards, hover scale |
| 9 | Hot This Week | `components/home/hot-this-week.tsx` | ✅ up/down tabs, price table |
| 10 | Verified Sellers | `components/home/verified-seller-spotlight.tsx` | ✅ 4 seller cards, tier badges |
| 11 | Live Toast | `components/shared/live-toast.tsx` | ✅ auto-cycle 5s, close button |
| 12 | Homepage Assembly | `app/(main)/page.tsx` | ✅ all components assembled |

**CSS Utilities ครบ:** `hero-gradient`, `text-gradient`, `glass`, `glow-gold`, `card-hover-effect`, `safe-bottom`

**Next agent:** เริ่มจาก PHASE D (Browse page) หรือ fix `@ts-nocheck` issue ก่อน

---

## 🚀 How to Deploy

```bash
# Git push to main = auto deploy on Vercel
cd /root/.openclaw/workspace/cardvault
git add -A && git commit -m "message" && git push origin main

# If Vercel doesn't auto-deploy, trigger via API:
curl -s -X POST \
  -H "Authorization: Bearer <VERCEL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"cardvault","gitSource":{"type":"github","ref":"main","repoId":1240720011}}' \
  "https://api.vercel.com/v13/deployments"
```

---

## 📁 Project Structure

```
cardvault/
├── app/
│   ├── (auth)/          # Login, Register (split-screen layout)
│   ├── (main)/          # Main layout with Header/Footer/MobileNav/LiveToast
│   │   ├── browse/      # Browse with filter sidebar
│   │   ├── listing/[id] # Listing detail
│   │   ├── orders/      # Orders
│   │   ├── profile/     # User profiles
│   │   └── page.tsx     # Homepage
│   ├── admin/           # Admin panel (sidebar layout)
│   ├── sell/            # Seller pages (sidebar layout)
│   │   ├── new/         # 4-step wizard
│   │   └── page.tsx     # Dashboard
│   ├── check/           # Scammer check
│   ├── api/             # API routes (DO NOT MODIFY)
│   └── layout.tsx       # Root layout
├── components/
│   ├── home/            # Homepage components
│   ├── browse/          # Browse components
│   ├── listing/         # Listing components
│   ├── shared/          # Header, Footer, MobileNav, LiveToast, etc.
│   ├── order/           # Order components
│   ├── scanner/         # Card scanner
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── design-tokens.ts # Design system constants
│   ├── utils.ts         # Utilities (formatPrice, SERIES_LABELS, etc.)
│   ├── prisma.ts        # Prisma client
│   └── auth.ts          # NextAuth config
├── prisma/              # Schema + seed
└── services/            # Business logic (escrow, card identify)
```

---

## 🎯 Design System Reference

```
bg-primary:     #09090b (zinc-950)
bg-secondary:   #18181b (zinc-900)
bg-card:        #27272A (zinc-800)
accent-gold:    #F59E0B (amber-500)
accent-purple:  #7C3AED (violet-600)
text-primary:   #FAFAFA (zinc-50)
text-secondary: #A1A1AA (zinc-400)
text-muted:     #52525B (zinc-600)
border:         #27272A (zinc-800)
success:        #22C55E (green-500)
danger:         #EF4444 (red-500)

Font Thai:  Sarabun (Google Fonts)
Font Latin: Inter (Google Fonts)
```

---

## ⚡ Critical Rules (ห้ามลืม)

1. **ห้ามแก้ API routes, Prisma schema, business logic** — UI layer only
2. **ทุก image ต้องใช้ next/image** — ห้าม `<img>`
3. **ทุก component mobile responsive** — test 375px + 1440px
4. **Framer Motion: reduced-motion check** ทุก animation
5. **Thai text: Sarabun font เสมอ**
6. **Error + Loading states** ทุก async component
7. **Build ต้องผ่านก่อน push** — `npm run build`
8. **Vercel auto-deploy จาก main** — push = deploy
9. **ห้าม commit token/secret ลง git** — GitHub secret scanning จะ block

---

*Generated: 2026-05-17 10:49 GMT+8*
*Updated: 2026-05-17 11:03 GMT+8 — PHASE B+C verified complete*
