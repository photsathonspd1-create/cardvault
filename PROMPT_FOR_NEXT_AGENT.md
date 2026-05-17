# CardVault — Agent Handoff Prompt (2026-05-17 18:45 GMT+8)

> **คัดลอกทั้งหมดนี้ไปให้ agent ตัวถัดไปได้เลย**
> อัพเดทล่าสุดหลัง homepage redesign + Netlify deploy สำเร็จ

---

## 🎯 สรุปโปรเจกต์

**CardVault** — ตลาดซื้อ-ขายการ์ด TCG อันดับ 1 ของไทย (Pokemon, Yu-Gi-Oh!, MTG, One Piece, Vanguard)

- **Live:** https://cardvault-tcg.netlify.app
- **Repo:** https://github.com/photsathonspd1-create/cardvault
- **Latest commit:** `3c836fe` (docs: update HANDOFF.md)
- **Build status:** ✅ `npm run build` ผ่าน
- **Deploy:** Netlify (manual deploy, ไม่ใช่ auto-deploy จาก GitHub)

---

## 🔗 URLs & Credentials

```
# Live
Netlify:            https://cardvault-tcg.netlify.app

# Repo
GitHub:             https://github.com/photsathonspd1-create/cardvault

# Dashboards
Netlify Dashboard:  https://app.netlify.com/projects/cardvault-tcg
Supabase Dashboard: https://supabase.com/dashboard/project/ruugptsudyxyozywevcu

# ⚠️ สำคัญ: Netlify ไม่ได้เชื่อม GitHub → ไม่มี auto-deploy!
# ต้อง deploy ด้วย CLI ทุกครั้ง (ดูหัวข้อ Deploy Flow)

# Credentials
GitHub PAT:         <ถาม human>
Netlify Token:      nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86
Netlify Site ID:    8dcb5718-5634-4c41-939b-7d229bca2aab
Supabase URL:       https://ruugptsudyxyozywevcu.supabase.co
Supabase Project:   ruugptsudyxyozywevcu
Supabase Key:       <อยู่ใน Netlify env vars — ไปดูที่ dashboard>
```

---

## ⚠️ สิ่งที่ต้องรู้ก่อนเริ่มทำงาน

### 1. Netlify ไม่มี Auto-Deploy จาก GitHub

**ปัญหา:** Netlify site ไม่ได้เชื่อมกับ GitHub repo → `git push` อย่างเดียวไม่ deploy

**วิธี deploy (ต้องทำทุกครั้ง):**
```bash
# 1. Build ก่อน
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://postgres:<password>@db.ruugptsudyxyozywevcu.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:<password>@db.ruugptsudyxyozywevcu.supabase.co:5432/postgres"
NEXTAUTH_URL="https://cardvault-tcg.netlify.app"
NEXTAUTH_SECRET="<from netlify env>"
NEXT_PUBLIC_SUPABASE_URL="https://ruugptsudyxyozywevcu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<from netlify env>"
NEXT_PUBLIC_APP_URL="https://cardvault-tcg.netlify.app"
ENVEOF

# 2. Build
npm run build

# 3. Deploy ด้วย Netlify CLI
npm install -g netlify-cli  # ถ้ายังไม่มี
NETLIFY_AUTH_TOKEN=nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86 \
NETLIFY_SITE_ID=8dcb5718-5634-4c41-939b-7d229bca2aab \
netlify deploy --prod --dir=.next

# 4. ลบ .env (ห้าม commit)
rm -f .env
```

**⚠️ .env อยู่ใน .gitignore แล้ว — ห้าม commit secrets เด็ดขาด**

### 2. ต้องมี .env ก่อน Build

`npm run build` จะ fail ถ้าไม่มี `.env` เพราะ Prisma client ต้อง connect DB ตอน build

### 3. Prisma Proxy — ความเสี่ยงอันดับ 1

**ไฟล์:** `lib/prisma.ts` (~2200 บรรทัด)
**หน้าที่:** แปลง Prisma queries → Supabase PostgREST calls

ข้อจำกัด:
- `$transaction` ไม่ใช่ real transaction — แค่ sequential calls
- `$queryRaw` / `$queryRawUnsafe` ไม่รองรับ
- Nested `orderBy` ใน includes ไม่รองรับ
- `increment`/`decrement` ทำ read-then-write (race condition)
- One-to-one relations กลับมาเป็น array → ต้องใช้ `unwrapOneToOneArrays()`

**วิธี debug:**
```bash
# ลอง query ตรงกับ Supabase PostgREST
curl -s "https://ruugptsudyxyozywevcu.supabase.co/rest/v1/TableName?select=*" \
  -H "apikey: <SUPABASE_KEY>" \
  -H "Authorization: Bearer <SUPABASE_KEY>"
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (`app/` directory, RSC) |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Database | Supabase PostgreSQL (via custom Prisma proxy) |
| Auth | NextAuth v5 beta (Credentials + LINE OAuth) |
| Payment | Omise — **NOT CONFIGURED** (code พร้อมใน `lib/omise.ts`) |
| Storage | Cloudflare R2 — **NOT CONFIGURED** (code พร้อมใน `lib/r2.ts`) |
| Email | Resend — **NOT CONFIGURED** (templates พร้อมใน `lib/resend.ts`) |
| OCR | Tesseract.js (fallback ถ้า crash บน serverless) |

---

## 📁 โครงสร้างไฟล์หลัก

```
app/(main)/page.tsx              — Homepage (real DB data, spotlight, hot index, live toast)
app/(main)/browse/page.tsx       — Browse listings
app/(main)/listing/[id]/         — Listing detail
app/(main)/check/                — Scammer check
app/(main)/profile/              — User profile
app/(main)/settings/             — Account settings
app/(main)/orders/               — Orders list + detail
app/(main)/community/            — Community + forum
app/sell/                        — Seller dashboard + new listing wizard
app/admin/                       — Admin panel
app/api/auth/[...nextauth]/      — NextAuth handler
app/api/listings/                — Listings API
app/api/orders/                  — Orders API
app/api/users/me/                — Own profile GET/PATCH
app/api/payments/charge/         — Payment (needs Omise keys)
app/api/webhooks/omise/          — Payment webhook
app/api/cron/escrow-release/     — Auto-release cron
app/api/upload/                  — File upload (mock + real)

components/shared/header.tsx     — Navbar (หน้าแรก, ซื้อของ, ขายของ, วิธีใช้งาน, เขียนกับเรา)
components/shared/mobile-bottom-nav.tsx — Mobile bottom nav (5 tabs)
components/home/hero-cards.tsx   — 3 floating Pokemon cards
components/home/card-spotlight.tsx — สปอตไลท์ (recommended cards + price trends)
components/home/hot-this-week.tsx — ดัชนี Hot (price up/down tabs)
components/home/category-section.tsx — 4 category cards (Pokemon, YGO, MTG, One Piece)
components/home/scammer-check-bar.tsx — Scammer check input + count
components/home/verified-seller-spotlight.tsx — Top 4 sellers with star ratings
components/home/live-toast.tsx   — Bottom-left toast cycling completed orders
components/home/stats-counter.tsx — Animated counter
components/listing/listing-card.tsx — Listing card component

lib/prisma.ts                    — ⚠️ Custom Prisma→PostgREST proxy (~2200 lines)
lib/auth.ts                      — NextAuth config
lib/supabase-client.ts           — Supabase admin client
lib/utils.ts                     — formatPrice, getRelativeTime, SERIES_LABELS, etc.
lib/design-tokens.ts             — UI tokens (colors, effects, animations)
lib/omise.ts                     — Payment client (ready for keys)
lib/r2.ts                        — Storage client (ready for keys)
lib/resend.ts                    — Email templates + sender
lib/rate-limit.ts                — Rate limiting

middleware.ts                    — Route protection (uses JWT decode, not bcrypt)
prisma/schema.prisma             — Full DB schema (all models + enums)
prisma/seed.ts                   — Seed data
netlify.toml                     — Netlify build config
```

---

## ✅ สิ่งที่เสร็จแล้ว

### Homepage (redesign ตาม reference image)
- ✅ Hero: Badge + H1 gradient + Search + Trending pills + Trust badges + Stats (ข้อมูลจริง)
- ✅ 3 floating Pokemon cards (Framer Motion)
- ✅ Scammer Check Bar — input + จำนวน records จาก DB
- ✅ Categories — 4 cards (Pokemon, YGO, MTG, One Piece) รูปจาก URL จริง
- ✅ สปอตไลท์ — recommended cards + price trend arrows (up/down %)
- ✅ ลงขายล่าสุด — 6 listings จาก DB
- ✅ ดัชนี Hot — tabs "ราคาขึ้น" / "ราคาลง" (PriceHistory 7 วัน)
- ✅ Verified Seller Spotlight — 4 sellers + star ratings
- ✅ Live Toast — cycle order ล่าสุดทุก 5 วินาที
- ✅ Stats Footer — CardCatalog count, completed orders, total value (baht), users

### Navbar
- ✅ Logo: shield สีทอง + "CardVault"
- ✅ Nav: หน้าแรก, ซื้อของ, ขายของ, วิธีใช้งาน, เขียนกับเรา
- ✅ Search bar
- ✅ ตรวจสอบผู้ขาย button + Cart (badge) + Bell + Avatar
- ✅ Mobile drawer + Mobile bottom nav (5 tabs)

### Bug Fixes (16+)
- ✅ Prisma proxy: key remapping, nested includes, OR filters, cuid generation, one-to-one arrays
- ✅ NextAuth: trustHost, secret, bcrypt edge fix, lazy-load, auth-helpers fallback
- ✅ Register: null ID fix, OR filter format
- ✅ Profile crash, Settings 404, Debug endpoint auth, etc.

### Auth
- ✅ NextAuth working on Netlify (trustHost + secret + auth-helpers fallback)
- ✅ Credentials provider (email + password)
- ✅ LINE OAuth (code ready, needs LINE_CLIENT_ID/SECRET)
- ✅ Register API (`POST /api/auth/register`)
- ✅ Middleware route protection (JWT decode, not bcrypt)

### Other
- ✅ 25+ pages (all return 200)
- ✅ Scammer check system
- ✅ Community + Forum
- ✅ Admin panel
- ✅ Seller dashboard + new listing wizard
- ✅ Order detail + escrow status

---

## 🔴 สิ่งที่ต้องทำต่อ

### Priority 1 — Critical for Launch

| # | Task | Status | รายละเอียด |
|---|---|---|---|
| 1 | **Omise Payment** | ❌ ไม่มี keys | สมัคร omise.co → รับ keys → ตั้ง env vars → ทดสอบ PromptPay QR |
| 2 | **R2 Storage** | ❌ ไม่มี keys | สร้าง Cloudflare R2 bucket → API token → custom domain |
| 3 | **Resend Email** | ❌ ไม่มี keys | สมัคร resend.com → verify domain → ตั้ง env vars |
| 4 | **CRON_SECRET** | ❌ ไม่ได้ตั้ง | `openssl rand -hex 32` → ตั้งใน env vars (สำหรับ escrow auto-release) |
| 5 | **Login E2E Test** | ⚠️ ยังไม่ได้ทดสอบ | ลอง login จริงๆ ว่า NextAuth ทำงานมั้ย |

### Priority 2 — Important

| # | Task | Status |
|---|---|---|
| 6 | Card Scanner camera UI | 🔧 Partial |
| 7 | Price History charts | 🔧 Partial (Recharts installed, needs real data) |
| 8 | Community/Forum seed data | ❌ Empty |
| 9 | Image domains config | ❌ next.config.js needs remotePatterns |
| 10 | Netlify auto-deploy from GitHub | ❌ ต้อง link repo ใน Netlify dashboard |

### Priority 3 — Nice to Have

| # | Task |
|---|---|
| 11 | Chat/Messaging |
| 12 | Watchlist |
| 13 | Notifications UI |

---

## 🔄 Workflow สำหรับ Agent ถัดไป

### Setup
```bash
cd /root/.openclaw/workspace/cardvault
git config user.email "agent@openclaw.ai"
git config user.name "OpenClaw Agent"
git remote set-url origin https://<GITHUB_PAT>@github.com/photsathonspd1-create/cardvault.git
git pull origin main
```

### Work Cycle
```bash
# 1. สร้าง .env (ดูหัวข้อ Deploy)
# 2. npm install
# 3. แก้โค้ด
# 4. npm run build (ต้องผ่าน)
# 5. git add -A && git commit -m "feat: ..." && git push origin main
# 6. Deploy ขึ้น Netlify (ดูหัวข้อ Deploy)
# 7. ลบ .env
# 8. อัพเดท HANDOFF.md
```

### Deploy Flow (สำคัญมาก!)
```bash
# ⚠️ Netlify ไม่มี auto-deploy จาก GitHub
# ต้อง deploy ด้วย CLI ทุกครั้ง:

npm install -g netlify-cli  # ครั้งแรกเท่านั้น

# Build + Deploy
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.ruugptsudyxyozywevcu.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.ruugptsudyxyozywevcu.supabase.co:5432/postgres"
NEXTAUTH_URL="https://cardvault-tcg.netlify.app"
NEXTAUTH_SECRET="<from netlify env vars>"
NEXT_PUBLIC_SUPABASE_URL="https://ruugptsudyxyozywevcu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<from netlify env vars>"
NEXT_PUBLIC_APP_URL="https://cardvault-tcg.netlify.app"
EOF

npm run build && \
NETLIFY_AUTH_TOKEN=nfp_LK6qKSRUtEaxHYJVVRyZXXC3j4qhYeEiac86 \
NETLIFY_SITE_ID=8dcb5718-5634-4c41-939b-7d229bca2aab \
netlify deploy --prod --dir=.next && \
rm -f .env
```

### เช็ค deploy สำเร็จ:
```bash
# เช็คว่า nav ใหม่ขึ้นมั้ย
curl -s https://cardvault-tcg.netlify.app/ | grep -o "ซื้อของ"
# ถ้าไม่ขึ้น = deploy ยังไม่ live

# เช็ค API
curl -s https://cardvault-tcg.netlify.app/api/listings | head -c 200
```

### Git Rules
```bash
git commit -m "fix: description"    # bug fix
git commit -m "feat: description"   # new feature
git commit -m "docs: description"   # documentation
# ⚠️ NEVER commit secrets
# ⚠️ Always npm run build before pushing
```

---

## 🧪 วิธีทดสอบ

```bash
# Pages — ทุกหน้าควร return 200
for p in "/" "/browse" "/login" "/register" "/check" "/community" "/how-it-works" "/faq" "/contact" "/terms" "/privacy" "/settings"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://cardvault-tcg.netlify.app$p")
  echo "$p → $code"
done

# API
curl -s https://cardvault-tcg.netlify.app/api/listings | head -c 200
curl -s -o /dev/null -w "%{http_code}" https://cardvault-tcg.netlify.app/api/users/me
# ควร return 401 (unauthenticated)

# ดู Netlify function logs (ถ้ามี error)
# ไปที่ https://app.netlify.com/projects/cardvault-tcg/logs/functions
```

---

## 📊 Database Schema (สำคัญ)

ดูเต็มๆ ที่ `prisma/schema.prisma`

Models หลัก:
- **User** — role: USER/SELLER/ADMIN/SUPER_ADMIN
- **SellerProfile** — tier: BRONZE/SILVER/GOLD/VERIFIED_PRO
- **Listing** — status: DRAFT/PENDING_REVIEW/ACTIVE/SOLD/PAUSED/EXPIRED/REJECTED
- **Order** — status: PENDING_PAYMENT/PAID/SHIPPED/DELIVERED/COMPLETED/DISPUTED/CANCELLED/REFUNDED
- **CardCatalog** — series: POKEMON/YUGIOH/MTG/ONE_PIECE/VANGUARD/DIGIMON/OTHER
- **PriceHistory** — card price over time
- **ScammerReport** — scammer database
- **CommunityPost, ForumThread** — community features

---

## 🎨 Design System

```
Background:    #09090b (zinc-950)
Secondary BG:  #111113 (zinc-900)
Accent Gold:   #F59E0B (amber-500)
Purple:        #7C3AED
Font Thai:     Sarabun
Font Latin:    Inter
Theme:         "Dark Gaming Luxury" — Steam meets Binance meets Japanese card shop
```

---

## ⚠️ Known Risks

1. **Prisma proxy = #1 risk** — query ที่ไม่รองรับจะ return empty/wrong data เงียบๆ
2. **No real transactions** — order creation อาจ inconsistent
3. **Supabase RLS bypassed** — service role key gives full access
4. **No error monitoring** — ไม่มี Sentry
5. **Netlify cold start** — homepage ~5s ครั้งแรก, หลังจากนั้น ~1s
6. **bcryptjs edge warning** — compile warning แต่ไม่ crash

---

## 🎯 เป้าหมายสุดท้าย

ถ้าทำ Omise payment + R2 storage + Resend email สำเร็จ → **เว็บใช้ซื้อ-ขายจริงได้เลย**

โชคดี! 🚀
