# Prompt for Next Agent — CardVault UI Redesign Continuation

## Copy this entire prompt to your next agent session:

---

You are working on **CardVault** — a premium Thai TCG card marketplace.

**เว็บ:** https://cardvault-drab.vercel.app/
**Repo:** https://github.com/photsathonspd1-create/cardvault

### Credentials (ask the human for these)
```
GitHub PAT:       (ask human — needed for git push)
Vercel Token:     (ask human — needed for deploy trigger)
Vercel Project:   prj_FoW9G9bBDARIEK573IjP1ZDYwAZU
Supabase URL:     https://ruugptsudyxyozywevcu.supabase.co
Supabase Key:     (ask human)
Supabase Project: ruugptsudyxyozywevcu
```

### Tech Stack
Next.js 14, Prisma + Supabase, NextAuth, Tailwind CSS, shadcn/ui, Framer Motion, Omise payment

### Design System (already implemented)
- bg: #09090b (zinc-950), accent: #F59E0B (amber-500), purple: #7C3AED
- Fonts: Sarabun (Thai) + Inter (Latin)
- Theme: "Dark Gaming Luxury" — Steam meets Binance meets Japanese card shop
- All tokens in `lib/design-tokens.ts`, `tailwind.config.ts`, `app/globals.css`

### What's Already Done (10 pages redesigned)
Homepage, Browse, Listing Detail, Sell/New (4-step wizard), Seller Dashboard, Order Detail, Profile, Scammer Check, Admin Panel, Auth (Login + Register)

All shared components: Navbar, Footer, MobileBottomNav, LiveToast, HeroCards, StatsCounter, FilterSidebar, ListingCard, etc.

### What Needs To Be Done
See `HANDOFF.md` in the repo root for full list of remaining work:
- Connect mock data to real APIs
- Implement card scanner camera integration
- Add price history charts (Recharts)
- Build payment flow
- Redesign remaining pages (checkout, orders list, analytics, subscription, KYC, community, how-it-works, FAQ, contact, escrow-info, terms, privacy)
- Add chat/messaging, watchlist, notifications

### Critical Rules
1. DO NOT modify API routes, Prisma schema, or business logic — UI layer only
2. Use `next/image` for all images
3. Mobile responsive (375px + 1440px)
4. `npm run build` must pass before pushing
5. Push to `main` = auto-deploy on Vercel
6. NEVER commit tokens/secrets to git — GitHub will block the push
7. If Vercel doesn't auto-deploy, trigger via API (ask human for token)

### Git Setup
```bash
cd /root/.openclaw/workspace/cardvault
# Ask human for GitHub PAT, then:
git remote set-url origin https://photsathonspd1-create:<GITHUB_PAT>@github.com/photsathonspd1-create/cardvault.git
git pull origin main
```

### Deploy
```bash
git add -A && git commit -m "feat: description" && git push origin main
```

---
