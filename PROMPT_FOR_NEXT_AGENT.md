# 🎯 CardVault — Ready-to-Use Prompt for Next Agent

## Copy everything below this line:

---

## บทบาท

คุณเป็น Senior Full-Stack Developer ที่เชี่ยวชาญ Next.js 14, TypeScript, Prisma, Tailwind CSS, shadcn/ui

## 任务: ทำ CardVault Phase 2 ต่อจาก Agent ก่อนหน้า

CardVault เป็น Marketplace ซื้อ-ขายการ์ด TCG ในประเทศไทย

## Repository

```
https://github.com/photsathonspd1-create/cardvault
```

## สิ่งที่ต้องทำทันทีเมื่อเริ่ม

### 1. Clone & Setup
```bash
git clone https://github.com/photsathonspd1-create/cardvault.git
cd cardvault
npm install
npx prisma generate
```

### 2. อ่านไฟล์เหล่านี้ตามลำดับ
- `HANDOFF.md` — สถานะล่าสุดว่าอะไรเสร็จแล้ว อะไรยังไม่เสร็จ
- `PROMPT_FOR_NEXT_AGENT.md` — รายละเอียด task ที่ต้องทำ
- `prisma/schema.prisma` — database schema (30+ models)
- `CardVault_MasterSystem_v2.1.md` — spec เต็มของโปรเจค
- `README.md` — setup instructions

### 3. ตรวจสอบ TypeScript
```bash
npx tsc --noEmit
# ต้องผ่าน 0 errors
```

## สิ่งที่เสร็จแล้ว (ห้ามทำซ้ำ ❌)

ดู checklist เต็มใน `HANDOFF.md` สรุปคือ:

✅ Next.js 14 project + dependencies ทั้งหมด
✅ Prisma schema 30+ models + seed data
✅ shadcn/ui 14 components
✅ Auth system (NextAuth v5, Email+Password, JWT)
✅ Pages ครบ: Homepage, Browse, Listing, Checkout, Orders, Profile, Community, Admin, Scammer Check
✅ API Routes 18 routes (listings, orders, escrow, cards, users, community, scammer)
✅ Escrow service with auto-release cron
✅ Card identification (Tesseract.js + Pokemon TCG API)
✅ Rate limiting (Upstash Redis + in-memory fallback)
✅ Omise webhook with HMAC verification
✅ TypeScript strict — 0 errors

## สิ่งที่ต้องทำต่อ (เลือกทำทีละ 1 task)

### 🔴 Task 1: Card Scanner Component

สร้าง camera overlay สำหรับถ่ายรูปการ์ด TCG

**ไฟล์ที่ต้องสร้าง:**
- `components/scanner/CardScanner.tsx`
- `components/scanner/useCardScanner.ts`

**รายละเอียด:**
- ใช้ MediaDevices API (`facingMode: environment`)
- Overlay กรอบ aspect ratio 2.5:3.5 (TCG standard)
- Corner markers สีเขียว (animated)
- Auto-detect sharpness (Laplacian variance)
- ถ่าย 3 รูป: front → back → holo
- Crop ตาม frame อัตโนมัติ
- Convert to WebP (quality 0.92, max 2MB)
- Preview thumbnail แต่ละรูป
- "ถ่ายใหม่" และ "ใช้รูปนี้" buttons
- Fallback: "เลือกจาก Gallery"
- ภาษาไทยทั้งหมด

**Props:**
```typescript
interface CardScannerProps {
  onComplete: (images: File[], cardMatch: CardCatalog | null) => void
}
```

---

### 🔴 Task 2: Cloudflare R2 Image Upload

เปลี่ยนจาก mock URLs เป็น R2 จริง

**ไฟล์ที่ต้องสร้าง/แก้ไข:**
- สร้าง: `lib/r2.ts`
- แก้ไข: `app/api/upload/presigned-url/route.ts`

**ติดตั้ง:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**รายละเอียด:**
- สร้าง R2 client ใน `lib/r2.ts`
- Generate presigned URL สำหรับ upload
- Validate: file type (webp/jpeg/png), size (<5MB)
- Return: `{ uploadUrl, publicUrl, key }`
- Key format: `uploads/{userId}/{uuid}.{ext}`

---

### 🔴 Task 3: LINE Login

เพิ่ม LINE OAuth เข้า NextAuth

**ไฟล์ที่ต้องแก้ไข:**
- `lib/auth.ts` — เพิ่ม LINE provider
- `app/(auth)/login/page.tsx` — ปุ่ม LINE ใช้งานได้จริง

**ติดตั้ง:**
```bash
npm install next-auth@beta
```

**รายละเอียด:**
- เพิ่ม LINE OAuth provider ใน NextAuth config
- Callback URL: `/api/auth/callback/line`
- Env vars: `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET`
- ปุ่ม LINE สีเขียว (#06C755) บนหน้า login

---

### 🔴 Task 4: Email Notifications (Resend)

ส่ง email เมื่อมีเหตุการณ์สำคัญ

**ไฟล์ที่ต้องสร้าง:**
- `lib/resend.ts`
- `services/notification.service.ts`
- `emails/order-confirmation.tsx`
- `emails/order-shipped.tsx`
- `emails/order-completed.tsx`
- `emails/dispute-opened.tsx`

**ติดตั้ง:**
```bash
npm install resend react-email @react-email/components
```

**รายละเอียด:**
- ใช้ Resend API
- React Email templates (Thai text)
- ส่ง email เฉพาะ events สำคัญ: ORDER_PAID, ORDER_SHIPPED, ORDER_COMPLETED, DISPUTE_OPENED
- Update existing notification code ให้เรียก email service

---

### 🔴 Task 5: Full-text Search (PostgreSQL tsvector)

เพิ่ม full-text search ภาษาไทย

**ไฟล์ที่ต้องสร้าง/แก้ไข:**
- สร้าง: SQL migration
- แก้ไข: `app/(main)/browse/page.tsx`

**รายละเอียด:**
```sql
ALTER TABLE "Listing" ADD COLUMN search_vector tsvector;
CREATE INDEX listing_search_idx ON "Listing" USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('thai',
    coalesce(NEW."customName", '') || ' ' ||
    coalesce(NEW."customSet", '') || ' ' ||
    coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_search_trigger
BEFORE INSERT OR UPDATE ON "Listing"
FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();
```

- Update browse page ให้ใช้ `WHERE search_vector @@ to_tsquery('thai', $1)`

---

### 🟡 Task 6: Seller Tier Auto-upgrade

อัพเกรด tier อัตโนมัติหลังขายสำเร็จ

**ไฟล์ที่ต้องสร้าง:**
- `services/tier.service.ts`

**ไฟล์ที่ต้องแก้ไข:**
- `services/escrow.service.ts` — เรียก tier check หลัง release

**เงื่อนไข:**
- Bronze → Silver: 10+ sales, ★4.5+, 0 disputes lost
- Silver → Gold: 50+ sales, ★4.7+, KYC verified
- Gold → Verified Pro: 200+ sales, ★4.8+, manual approval

---

### 🟡 Task 7: KYC Flow

ระบบยืนยันตัวตนผู้ขาย

**ไฟล์ที่ต้องสร้าง:**
- `app/sell/kyc/page.tsx`
- `app/api/users/me/kyc/route.ts`

**รายละเอียด:**
- Upload บัตรประชาชน + selfie
- Store ใน private R2 bucket (encrypted path)
- Status: NONE → PENDING → APPROVED/REJECTED
- Admin review ในหน้า `/admin/users`
- Auto-check กับ ScammerReport table

---

### 🟡 Task 8: Subscription Plans

ระบบสมาชิกแบบจ่ายเงิน

**ไฟล์ที่ต้องสร้าง:**
- `app/sell/subscription/page.tsx`
- `app/api/subscriptions/route.ts`

**แผน:**
- FREE: 10 listings, manual approve
- PRO (299฿/เดือน): unlimited listings, auto-approve, 1 featured/month
- BUSINESS (899฿/เดือน): ทุกอย่างของ PRO + bulk upload + analytics + API access

---

### 🟡 Task 9: Featured Listings (Paid Boost)

โปรโมท listing แบบจ่ายเงิน

**ไฟล์ที่ต้องสร้าง:**
- `app/api/listings/[id]/feature/route.ts`

**ราคา:**
- Homepage banner: 299฿/วัน (max 3 slots)
- Category top: 99฿/วัน
- Search boost: 49฿/วัน
- Auto-expire เมื่อ sold หรือหมดเวลา

---

### 🟡 Task 10: Price History Charts

กราฟแสดงราคาตลาด

**ไฟล์ที่ต้องสร้าง:**
- `components/shared/price-chart.tsx`

**ติดตั้ง:**
```bash
npm install recharts
```

**รายละเอียด:**
- Line chart แสดงราคา 30/90/180 วัน
- ใช้ Recharts library
- เพิ่มในหน้า listing detail และ card catalog

---

### 🟡 Task 11: Forum Pages

กระดานสนทนาแยกตาม TCG

**ไฟล์ที่ต้องสร้าง:**
- `app/community/forum/page.tsx`
- `app/community/forum/[threadId]/page.tsx`

**รายละเอียด:**
- Thread index แยกตาม category (Pokemon, Yu-Gi-Oh, etc.)
- Thread detail + replies
- Upvote + mark best answer
- Pinned threads

---

### 🟡 Task 12: Seller Analytics

แดชบอร์ดวิเคราะห์สำหรับผู้ขาย

**ไฟล์ที่ต้องสร้าง:**
- `app/sell/analytics/page.tsx`

**รายละเอียด:**
- Revenue chart (monthly) — ใช้ Recharts
- Top selling cards
- Conversion rate (views → orders)
- Tier progress bar

---

### 🟢 Task 13-16: Polish

- [ ] Mobile responsive fixes
- [ ] Loading skeletons (`loading.tsx` ทุก route group)
- [ ] Error pages (`error.tsx`, `not-found.tsx`)
- [ ] SEO (metadata, sitemap.xml, OG images)

---

## Coding Conventions (ต้องตาม)

```typescript
// 1. Thai UI text ทั้งหมด
<Button>ซื้อเลย</Button>  // ✅
<Button>Buy Now</Button>    // ❌

// 2. TypeScript strict — ห้ามใช้ any
const userId = (session?.user as any).id  // ✅ (เลี่ยงไม่ได้)
const userId = session.user.id            // ❌ (type error)

// 3. Server Components เป็นหลัก
export default async function Page() { ... }  // ✅
"use client"                                   // เฉพาะที่จำเป็น

// 4. API routes ต้องมีครบ
export async function POST(request: NextRequest) {
  const session = await auth()           // auth guard
  if (!session) return 401
  
  const parsed = schema.safeParse(body)  // zod validation
  if (!parsed.success) return 400
  
  try { ... } catch { ... }              // error handling
}

// 5. Prices ในสตางค์
const price = 150000  // = 1,500 บาท
formatPrice(price)    // "฿1,500"
```

## หลังทำแต่ละ Task

```bash
# 1. ตรวจสอบ TypeScript
npx tsc --noEmit

# 2. Commit & Push
git add -A
git commit -m "feat: [คำอธิบาย]"
git push

# 3. อัพเดท HANDOFF.md
# เปลี่ยน [ ] เป็น [x] สำหรับ task ที่เสร็จ
```

## Test Accounts (หลัง run `npm run db:seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cardvault.co.th | password123 |
| Seller | seller1@example.com | password123 |
| Seller | seller3@example.com | password123 |
| Buyer | buyer1@example.com | password123 |

---

**เริ่มจาก Task 1 (Card Scanner) เว้นแต่ผู้ใช้จะบอกให้ทำอย่างอื่นก่อน**
