# CardVault — Master System Document
**เว็บ Marketplace ซื้อ-ขายการ์ด Pokemon / TCG ในประเทศไทย**
Version 2.0 | พฤษภาคม 2025 | ครอบคลุมทุก Layer ตั้งแต่ Vision ถึง Deployment

---

# สารบัญ

1. [Vision & Strategy](#1-vision--strategy)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack & Infrastructure](#3-tech-stack--infrastructure)
4. [Database Schema (Prisma)](#4-database-schema)
5. [API Routes Specification](#5-api-routes-specification)
6. [User Flow Diagrams](#6-user-flow-diagrams)
7. [Feature Modules (ละเอียด)](#7-feature-modules)
8. [Security & Business Rules](#8-security--business-rules)
9. [UI/UX Pages & Components](#9-uiux-pages--components)
10. [Monetization & Business Logic](#10-monetization--business-logic)
11. [Phase Roadmap](#11-phase-roadmap)
12. [Windsurf Implementation Prompt](#12-windsurf-implementation-prompt)

---

# 1. Vision & Strategy

## 1.1 Problem Statement
ตลาดการ์ด TCG ในไทย (Pokemon, Yu-Gi-Oh!, One Piece, MTG, Vanguard) มูลค่าหลายร้อยล้านบาท/ปี แต่กระจัดกระจายอยู่บน:
- Facebook Group / Marketplace — ไม่มีคนกลาง โกงง่าย
- LINE OpenChat — ไม่มี escrow ไม่มี reputation
- Instagram — ไม่มี search ไม่มีราคาอ้างอิง

**ผลลัพธ์:** คนโกงเยอะ, ของปลอมระบาด, ราคาไม่โปร่งใส, ผู้ซื้อใหม่กลัวเข้าตลาด

## 1.2 Solution
CardVault = Marketplace เฉพาะ TCG ที่สร้าง Trust Layer ผ่าน:
- **Escrow**: เงินค้างระบบ ไม่ถึงผู้ขายจนกว่าผู้ซื้อยืนยัน
- **Card Scanner**: ถ่ายรูปการ์ด → AI identify → auto-fill ข้อมูล
- **Verified Seller**: KYC + deposit + tier system
- **Dispute System**: admin ตัดสินอย่างเป็นธรรม พร้อมหลักฐาน
- **Price Guide**: ราคาตลาดไทย real-time จาก transaction จริง

## 1.3 Target Users
| กลุ่ม | ลักษณะ | Pain Point |
|---|---|---|
| นักสะสมทั่วไป (ผู้ซื้อ) | ซื้อการ์ดเสริม collection | โกงง่าย, ของปลอม, ราคาไม่โปร่งใส |
| เทรดเดอร์ (ผู้ขาย) | ซื้อ-ขายเพื่อกำไร | ไม่มีแพลตฟอร์มที่น่าเชื่อถือ |
| ร้านค้า (Pro Seller) | ขายออนไลน์ควบคู่หน้าร้าน | ต้องการ inventory management |
| นักเล่นแข่งขัน | ต้องการการ์ดเฉพาะ set | หาของยาก, ไม่รู้ราคาตลาด |

## 1.4 Competitive Landscape
| แพลตฟอร์ม | จุดแข็ง | จุดอ่อน |
|---|---|---|
| Facebook Marketplace | ผู้ใช้เยอะ | ไม่มี escrow, โกงง่าย |
| Shopee | มี escrow | ไม่เฉพาะทาง TCG, ค่าธรรมเนียมสูง |
| TCGPlayer (US) | ดีที่สุดในโลก | ไม่รองรับไทย, ราคาเป็น USD |
| LINE Group | สะดวก | ไม่มี infrastructure |

**CardVault Moat:** ราคาตลาดไทย + Card Scanner + ภาษาไทยเป็นหลัก + Escrow ที่ใช้งานง่าย

---

# 2. System Architecture

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Browser (Next.js SSR/CSR)  │  Mobile PWA  │  Future: App       │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                          │
│  CDN (Static Assets)  │  Edge Middleware (Auth, Rate Limit)      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│                   NEXT.JS APPLICATION (Vercel)                   │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │  App Router │  │  API Routes │  │  Server Actions          │ │
│  │  (RSC/SSR)  │  │  /api/...   │  │  (form submissions)      │ │
│  └─────────────┘  └──────┬──────┘  └──────────────────────────┘ │
│                           │                                       │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │                   SERVICE LAYER                             │ │
│  │  AuthService │ ListingService │ OrderService │ EscrowService│ │
│  │  DisputeService │ NotificationService │ SearchService       │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌────────▼────────┐  ┌──────▼──────────┐
│  PostgreSQL   │  │  Cloudflare R2  │  │  Redis (Cache)  │
│  (Supabase)   │  │  (Images/Video) │  │  (Sessions/Job) │
│               │  │                 │  │  Upstash        │
└───────────────┘  └─────────────────┘  └─────────────────┘

EXTERNAL SERVICES:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐
│    Omise     │  │ Pokemon TCG  │  │    Resend    │  │   LINE   │
│  (Payment)   │  │     API      │  │   (Email)    │  │  Login   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────┘
```

## 2.2 Data Flow — Order + Escrow

```
ผู้ซื้อกด "ซื้อเลย"
    │
    ▼
POST /api/orders/create
    │── validate listing (status=ACTIVE, qty>0)
    │── calculate total (price + shipping + platform fee)
    │── create Order (status=PENDING_PAYMENT)
    │
    ▼
POST /api/payments/charge (Omise)
    │── charge PromptPay / Card
    │── Omise webhook → POST /api/webhooks/omise
    │
    ▼
Order status = PAID (เงินอยู่ใน Omise, ยังไม่โอนให้ผู้ขาย)
    │── notify ผู้ขาย (Email + LINE)
    │── listing qty -= 1
    │
    ▼
ผู้ขาย: POST /api/orders/{id}/ship (ใส่ tracking)
    │── Order status = SHIPPED
    │── escrowReleaseAt = now + 7 days
    │── notify ผู้ซื้อ
    │
    ▼
ผู้ซื้อกด "รับของแล้ว" หรือ auto-release หลัง 7 วัน
    │
    ▼
POST /api/escrow/release
    │── transfer to seller (Omise → bank account)
    │── deduct platform fee
    │── Order status = COMPLETED
    │── unlock review form
```

## 2.3 Image Pipeline

```
ผู้ขายถ่ายรูปในกล้อง (browser camera API)
    │
    ▼
Client: crop + compress (Canvas API, max 2MB, WebP)
    │
    ▼
POST /api/upload/presigned-url
    │── generate R2 presigned URL (expires 10 min)
    │── return { uploadUrl, publicUrl }
    │
    ▼
Client: PUT {uploadUrl} (direct to R2, bypass server)
    │
    ▼
POST /api/listings/{id}/images (save publicUrl to DB)
    │── validate file type (image/webp, image/jpeg only)
    │── validate size < 5MB
    │── limit 8 images per listing
```

## 2.4 Card Identification Pipeline

```
กล้องถ่ายการ์ด (camera overlay)
    │
    ▼
Client: auto-crop ตาม aspect ratio 2.5:3.5
    │
    ▼
POST /api/cards/identify
    │── resize image → 400px width
    │── call Pokemon TCG API (search by image hash / name OCR)
    │── หรือ fuzzy search ใน CardCatalog ด้วย OCR text
    │── return: cardId, name, set, rarity, marketPrice
    │
    ▼
Auto-fill listing form
    │── ผู้ขาย verify หรือแก้ไข
    │── ถ้าหาไม่เจอ → manual fill
```

---

# 3. Tech Stack & Infrastructure

## 3.1 Core Stack

```
Framework:      Next.js 14 (App Router + Server Actions)
Language:       TypeScript (strict mode)
Styling:        Tailwind CSS v3 + shadcn/ui
Database:       PostgreSQL 15 via Supabase
ORM:            Prisma 5
Auth:           NextAuth.js v5 (JWT strategy)
File Storage:   Cloudflare R2
Cache:          Upstash Redis
Email:          Resend + React Email templates
Payment:        Omise (PromptPay + Credit Card)
Deploy:         Vercel (Pro plan)
Monitoring:     Sentry (errors) + Vercel Analytics
```

## 3.2 Auth Providers
```
- Email + Password (bcrypt)
- LINE Login (OAuth 2.0) — สำคัญมากสำหรับคนไทย
- Google OAuth
- Future: Apple Sign In (ถ้าทำ iOS app)
```

## 3.3 Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://cardvault.th

# LINE
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=

# Omise
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
OMISE_WEBHOOK_SECRET=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=cardvault-images
R2_PUBLIC_URL=https://images.cardvault.th

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Pokemon TCG API
POKEMON_TCG_API_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://cardvault.th
PLATFORM_FEE_PERCENT=6
ESCROW_AUTO_RELEASE_DAYS=7
```

## 3.4 Folder Structure
```
cardvault/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          ← Navbar + Footer
│   │   ├── page.tsx            ← Homepage
│   │   ├── browse/
│   │   │   ├── page.tsx        ← All listings
│   │   │   └── [series]/page.tsx
│   │   ├── card/[catalogId]/page.tsx
│   │   ├── listing/[id]/page.tsx
│   │   ├── profile/[username]/page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── sell/
│   │   ├── layout.tsx          ← Seller sidebar
│   │   ├── page.tsx            ← Dashboard
│   │   ├── new/page.tsx        ← Create listing (scanner)
│   │   ├── listings/page.tsx
│   │   ├── orders/page.tsx
│   │   └── analytics/page.tsx
│   ├── admin/
│   │   ├── layout.tsx          ← Admin sidebar (role guard)
│   │   ├── page.tsx            ← Dashboard
│   │   ├── listings/page.tsx
│   │   ├── disputes/page.tsx
│   │   └── users/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── listings/
│       │   ├── route.ts        ← GET (browse), POST (create)
│       │   └── [id]/
│       │       ├── route.ts    ← GET, PATCH, DELETE
│       │       └── images/route.ts
│       ├── orders/
│       │   ├── route.ts        ← POST (create)
│       │   └── [id]/
│       │       ├── route.ts    ← GET
│       │       ├── ship/route.ts
│       │       ├── confirm/route.ts
│       │       └── dispute/route.ts
│       ├── escrow/
│       │   └── release/route.ts
│       ├── cards/
│       │   ├── route.ts        ← GET (search catalog)
│       │   └── identify/route.ts ← POST (AI identify)
│       ├── upload/
│       │   └── presigned-url/route.ts
│       ├── payments/
│       │   └── charge/route.ts
│       ├── webhooks/
│       │   └── omise/route.ts
│       └── users/
│           └── [id]/route.ts
├── components/
│   ├── ui/                     ← shadcn components
│   ├── scanner/
│   │   ├── CardScanner.tsx     ← camera overlay
│   │   ├── ScanResult.tsx
│   │   └── useCardScanner.ts
│   ├── listing/
│   │   ├── ListingCard.tsx
│   │   ├── ListingForm.tsx
│   │   └── ListingDetail.tsx
│   ├── order/
│   │   ├── OrderCard.tsx
│   │   ├── EscrowStatus.tsx
│   │   └── DisputeForm.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── SellerBadge.tsx
│       └── PriceChart.tsx
├── lib/
│   ├── prisma.ts               ← Prisma client singleton
│   ├── auth.ts                 ← NextAuth config
│   ├── omise.ts                ← Omise client
│   ├── r2.ts                   ← Cloudflare R2 client
│   ├── redis.ts                ← Upstash Redis client
│   ├── pokemon-tcg.ts          ← Pokemon TCG API client
│   └── resend.ts               ← Email client
├── services/
│   ├── listing.service.ts
│   ├── order.service.ts
│   ├── escrow.service.ts
│   ├── dispute.service.ts
│   └── notification.service.ts
├── types/
│   └── index.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

# 4. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════
// AUTH & USERS
// ═══════════════════════════════════════

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime?
  passwordHash    String?
  name            String
  username        String    @unique   // สำหรับ URL /profile/username
  avatar          String?
  phone           String?
  phoneVerified   Boolean   @default(false)
  lineId          String?   @unique
  role            Role      @default(USER)
  isActive        Boolean   @default(true)
  isBanned        Boolean   @default(false)
  banReason       String?
  bannedAt        DateTime?

  // Relations
  sellerProfile   SellerProfile?
  accounts        Account[]         // NextAuth
  sessions        Session[]         // NextAuth
  buyerOrders     Order[]           @relation("BuyerOrders")
  sellerOrders    Order[]           @relation("SellerOrders")
  reviewsGiven    Review[]          @relation("ReviewsGiven")
  reviewsReceived Review[]          @relation("ReviewsReceived")
  reports         Report[]
  watchlist       Watchlist[]
  notifications   Notification[]
  disputes        Dispute[]         @relation("DisputeRaiser")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([username])
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ═══════════════════════════════════════
// SELLER
// ═══════════════════════════════════════

model SellerProfile {
  id              String     @id @default(cuid())
  userId          String     @unique
  user            User       @relation(fields: [userId], references: [id])
  displayName     String
  bio             String?    @db.Text
  tier            SellerTier @default(BRONZE)

  // KYC
  isKycVerified   Boolean    @default(false)
  kycStatus       KycStatus  @default(NONE) // NONE | PENDING | APPROVED | REJECTED
  kycIdCardUrl    String?    // encrypted path
  kycSelfieUrl    String?
  kycSubmittedAt  DateTime?
  kycReviewedAt   DateTime?
  kycNote         String?    // admin note on rejection

  // Deposit (เงินค้ำประกัน ป้องกัน fraud)
  depositAmount   Int        @default(0) // สตางค์ (500000 = 5,000 บาท)
  depositStatus   String     @default("NONE") // NONE | PAID | FROZEN | RELEASED

  // Stats
  totalSales      Int        @default(0)
  totalRevenue    Int        @default(0) // สตางค์
  completedOrders Int        @default(0)
  cancelledOrders Int        @default(0)
  disputesLost    Int        @default(0)
  rating          Float      @default(0)
  ratingCount     Int        @default(0)

  // Subscription
  subscription    SellerSubscription?

  // Bank
  bankAccount     BankAccount?

  // Relations
  listings        Listing[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BankAccount {
  id            String        @id @default(cuid())
  sellerId      String        @unique
  seller        SellerProfile @relation(fields: [sellerId], references: [id])
  bankCode      String        // "SCB" | "KBANK" | "KTB" etc.
  bankName      String        // ชื่อบัญชี
  accountNumber String        // encrypted
  isVerified    Boolean       @default(false)
  omiseRecipientId String?    // Omise recipient ID for payout
  createdAt     DateTime      @default(now())
}

model SellerSubscription {
  id          String    @id @default(cuid())
  sellerId    String    @unique
  seller      SellerProfile @relation(fields: [sellerId], references: [id])
  plan        PlanType  // FREE | PRO | BUSINESS
  price       Int       // สตางค์/เดือน
  startedAt   DateTime
  expiresAt   DateTime
  autoRenew   Boolean   @default(true)
  omiseSubId  String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

// ═══════════════════════════════════════
// CARD CATALOG
// ═══════════════════════════════════════

model CardCatalog {
  id              String    @id @default(cuid())
  tcgApiId        String?   @unique   // pokemon-tcg.io id
  series          CardSeries // POKEMON | YUGIOH | MTG | ONE_PIECE | VANGUARD | OTHER
  name            String
  nameTh          String?
  setName         String
  setCode         String
  cardNumber      String
  rarity          String
  artist          String?
  imageUrl        String
  imageUrlHi      String?
  types           String[]  // ["Fire", "Flying"] for Pokemon
  hp              Int?      // Pokemon HP
  supertype       String?   // "Pokémon" | "Trainer" | "Energy"

  // Market data
  marketPriceRaw  Int?      // ราคาตลาดไทย (สตางค์) จาก transactions จริง
  marketPriceExt  Int?      // ราคาจาก TCGPlayer/Cardmarket (USD แปลงเป็นบาท)
  priceUpdatedAt  DateTime?

  // Relations
  listings        Listing[]
  priceHistory    PriceHistory[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([series, setCode, cardNumber])
  @@index([name])
  @@index([series])
}

model PriceHistory {
  id          String      @id @default(cuid())
  cardId      String
  card        CardCatalog @relation(fields: [cardId], references: [id])
  price       Int         // สตางค์
  condition   Condition
  source      String      // "sale" | "listing"
  recordedAt  DateTime    @default(now())

  @@index([cardId, recordedAt])
}

// ═══════════════════════════════════════
// LISTING
// ═══════════════════════════════════════

model Listing {
  id              String        @id @default(cuid())
  sellerId        String
  seller          SellerProfile @relation(fields: [sellerId], references: [id])

  // Card reference
  cardId          String?
  card            CardCatalog?  @relation(fields: [cardId], references: [id])

  // Manual fill (ถ้าหาใน catalog ไม่เจอ)
  customName      String?
  customSet       String?
  customSeries    String?

  series          CardSeries
  condition       Condition
  language        CardLanguage  @default(THAI) // THAI | JAPANESE | ENGLISH | OTHER

  // Graded card
  isGraded        Boolean       @default(false)
  gradingCompany  String?       // "PSA" | "BGS" | "CGC" | "TAG"
  gradeScore      String?       // "10" | "9.5" | "9" | "Authentic"
  gradeCertNo     String?       // certificate number สำหรับ verify
  gradeSlabImage  String?

  // Pricing
  price           Int           // สตางค์
  originalPrice   Int?          // ราคาที่ซื้อมา (private, ใช้ analytics)
  isNegotiable    Boolean       @default(false)
  quantity        Int           @default(1)
  soldCount       Int           @default(0)

  // Content
  description     String?       @db.Text
  images          ListingImage[]
  videoUrl        String?       // required สำหรับ Gold seller + การ์ดราคา > 1000฿

  // Shipping
  shippingOptions  ShippingOption[]
  weight          Int?          // กรัม สำหรับคำนวณค่าส่ง

  // Status & visibility
  status          ListingStatus @default(PENDING_REVIEW)
  rejectionReason String?
  isFeatured      Boolean       @default(false)
  featuredUntil   DateTime?
  featuredSlot    String?       // "homepage" | "category" | "search"

  // Metrics
  views           Int           @default(0)
  watchCount      Int           @default(0)
  shareCount      Int           @default(0)

  // Relations
  orders          Order[]
  reports         Report[]
  watchlists      Watchlist[]
  priceAlerts     PriceAlert[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  expiresAt DateTime? // listing หมดอายุ (default 60 วัน)

  @@index([series, status])
  @@index([price])
  @@index([createdAt])
  @@index([sellerId])
}

model ListingImage {
  id        String  @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  type      String  // "front" | "back" | "holo" | "detail" | "graded_front" | "graded_back"
  order     Int     @default(0)
}

model ShippingOption {
  id          String  @id @default(cuid())
  listingId   String
  listing     Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  provider    String  // "THAILAND_POST" | "FLASH" | "KERRY" | "J&T" | "SELF_PICKUP"
  name        String  // "ไปรษณีย์ไทย ลงทะเบียน"
  price       Int     // สตางค์
  estimatedDays String // "2-3 วัน"
}

// ═══════════════════════════════════════
// ORDER & ESCROW
// ═══════════════════════════════════════

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique @default(cuid()) // CV-20250501-XXXXX

  listingId       String
  listing         Listing     @relation(fields: [listingId], references: [id])
  buyerId         String
  buyer           User        @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId        String
  seller          User        @relation("SellerOrders", fields: [sellerId], references: [id])

  // Snapshot ณ เวลาซื้อ (ไม่ให้ราคาเปลี่ยนทีหลัง)
  cardName        String
  cardImage       String
  condition       String
  quantity        Int

  // Pricing (สตางค์)
  unitPrice       Int
  subtotal        Int
  shippingFee     Int
  platformFee     Int         // คำนวณจาก subtotal × fee%
  totalAmount     Int         // subtotal + shippingFee (buyer pays)
  sellerReceives  Int         // subtotal - platformFee (seller gets)

  // Shipping address
  shippingName    String
  shippingPhone   String
  shippingAddress String      @db.Text
  shippingDistrict String
  shippingProvince String
  shippingPostcode String
  shippingProvider String?
  trackingNumber  String?
  shippedAt       DateTime?
  estimatedDelivery DateTime?

  // Payment
  paymentMethod   String?     // "promptpay" | "credit_card"
  omiseChargeId   String?     @unique
  omisePaymentUrl String?     // QR code URL for PromptPay
  paidAt          DateTime?

  // Escrow
  escrowStatus    EscrowStatus @default(HOLDING)
  escrowReleaseAt DateTime?   // auto-release timestamp
  releasedAt      DateTime?
  omiseTransferId String?     // transfer to seller

  // Status
  status          OrderStatus @default(PENDING_PAYMENT)
  cancelReason    String?
  cancelledAt     DateTime?
  deliveredAt     DateTime?
  confirmedAt     DateTime?
  completedAt     DateTime?

  // Relations
  dispute         Dispute?
  review          Review?
  statusHistory   OrderStatusHistory[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
}

model OrderStatusHistory {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  status    String
  note      String?
  createdBy String?  // userId หรือ "SYSTEM"
  createdAt DateTime @default(now())
}

// ═══════════════════════════════════════
// DISPUTE
// ═══════════════════════════════════════

model Dispute {
  id            String        @id @default(cuid())
  orderId       String        @unique
  order         Order         @relation(fields: [orderId], references: [id])
  raisedById    String
  raisedBy      User          @relation("DisputeRaiser", fields: [raisedById], references: [id])

  reason        DisputeReason
  description   String        @db.Text
  evidence      DisputeEvidence[]

  status        DisputeStatus @default(OPEN)
  adminNote     String?       @db.Text
  resolution    String?       // "REFUND_BUYER" | "RELEASE_SELLER" | "PARTIAL"
  refundAmount  Int?          // สตางค์ (ถ้า partial)

  // Timeline
  sellerRespondBy DateTime?   // deadline ให้ผู้ขายตอบ (48 ชม.)
  adminResolveBy  DateTime?   // deadline admin ตัดสิน (72 ชม.)
  resolvedAt    DateTime?
  resolvedBy    String?       // admin userId

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DisputeEvidence {
  id        String  @id @default(cuid())
  disputeId String
  dispute   Dispute @relation(fields: [disputeId], references: [id])
  addedById String
  type      String  // "image" | "video" | "text"
  url       String?
  content   String? @db.Text
  side      String  // "buyer" | "seller" | "admin"
  createdAt DateTime @default(now())
}

// ═══════════════════════════════════════
// REVIEW
// ═══════════════════════════════════════

model Review {
  id          String   @id @default(cuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  reviewerId  String
  reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  revieweeId  String
  reviewee    User     @relation("ReviewsReceived", fields: [revieweeId], references: [id])

  rating      Int      // 1-5
  comment     String?  @db.Text
  imageUrl    String?  // รูปการ์ดที่ได้รับจริง
  type        String   // "buyer_to_seller" | "seller_to_buyer"

  // Seller response to review
  sellerReply String?  @db.Text
  repliedAt   DateTime?

  isHidden    Boolean  @default(false)  // admin hide ได้
  createdAt   DateTime @default(now())

  @@index([revieweeId])
}

// ═══════════════════════════════════════
// ENGAGEMENT
// ═══════════════════════════════════════

model Watchlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, listingId])
}

model PriceAlert {
  id          String   @id @default(cuid())
  userId      String
  listingId   String?
  listing     Listing? @relation(fields: [listingId], references: [id])
  cardName    String   // ชื่อการ์ดที่ต้องการ
  series      String?
  targetPrice Int      // แจ้งเตือนเมื่อราคา ≤ นี้
  isActive    Boolean  @default(true)
  triggeredAt DateTime?
  createdAt   DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // "ORDER_PAID" | "ORDER_SHIPPED" | "DISPUTE_OPENED" | "PRICE_ALERT" | etc.
  title     String
  body      String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

model Report {
  id          String       @id @default(cuid())
  listingId   String
  listing     Listing      @relation(fields: [listingId], references: [id])
  reporterId  String
  reporter    User         @relation(fields: [reporterId], references: [id])
  reason      ReportReason
  description String?      @db.Text
  status      String       @default("PENDING") // PENDING | REVIEWED | DISMISSED | ACTION_TAKEN
  adminNote   String?
  createdAt   DateTime     @default(now())
}

// ═══════════════════════════════════════
// ADMIN & SYSTEM
// ═══════════════════════════════════════

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?  // null = SYSTEM
  action      String   // "LISTING_APPROVED" | "USER_BANNED" | "DISPUTE_RESOLVED"
  targetType  String   // "Listing" | "User" | "Order" | "Dispute"
  targetId    String
  metadata    Json?    // extra data
  ip          String?
  createdAt   DateTime @default(now())

  @@index([targetType, targetId])
}

model SystemSetting {
  key       String @id
  value     String @db.Text
  updatedAt DateTime @updatedAt
}

// ═══════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════

enum Role {
  USER
  SELLER
  ADMIN
  SUPER_ADMIN
}

enum SellerTier {
  BRONZE     // ใหม่, limit 10 listings, ต้อง admin approve ทุก listing
  SILVER     // 10+ sales, 4.0+ rating, auto-approve listing < 500฿
  GOLD       // 50+ sales, 4.5+ rating, KYC ผ่าน, auto-approve ทุก listing
  VERIFIED_PRO // ร้านค้า / ผ่าน audit พิเศษ
}

enum KycStatus {
  NONE
  PENDING
  APPROVED
  REJECTED
}

enum CardSeries {
  POKEMON
  YUGIOH
  MTG
  ONE_PIECE
  VANGUARD
  DIGIMON
  OTHER
}

enum CardLanguage {
  THAI
  JAPANESE
  ENGLISH
  KOREAN
  OTHER
}

enum Condition {
  MINT          // PSA 10 เทียบเท่า
  NEAR_MINT     // PSA 9
  EXCELLENT     // PSA 8
  GOOD          // PSA 7
  PLAYED        // PSA 4-6
  POOR          // PSA 1-3
}

enum ListingStatus {
  DRAFT           // บันทึกชั่วคราว ยังไม่ submit
  PENDING_REVIEW  // รอ admin approve
  ACTIVE          // ขายอยู่
  SOLD            // ขายหมดแล้ว
  PAUSED          // ผู้ขาย pause เอง
  EXPIRED         // หมดอายุ 60 วัน
  REJECTED        // admin reject
}

enum OrderStatus {
  PENDING_PAYMENT   // รอชำระ (expire 30 นาที)
  PAID              // จ่ายแล้ว รอผู้ขายส่ง
  SHIPPED           // ผู้ขายส่งแล้ว
  DELIVERED         // ขนส่งยืนยัน
  COMPLETED         // ผู้ซื้อยืนยัน + escrow released
  DISPUTED          // มี dispute
  CANCELLED         // ยกเลิก
  REFUNDED          // คืนเงินแล้ว
}

enum EscrowStatus {
  HOLDING     // เงินค้างอยู่
  RELEASING   // กำลัง transfer
  RELEASED    // โอนให้ผู้ขายแล้ว
  REFUNDED    // คืนให้ผู้ซื้อแล้ว
  FROZEN      // dispute อยู่
}

enum DisputeReason {
  FAKE_CARD           // การ์ดปลอม
  NOT_AS_DESCRIBED    // ไม่ตรงตามที่ลง (condition, ชื่อ)
  NOT_RECEIVED        // ไม่ได้รับของ
  WRONG_ITEM          // ได้รับผิดชิ้น
  DAMAGED_IN_TRANSIT  // เสียหายระหว่างส่ง
  OTHER
}

enum DisputeStatus {
  OPEN            // เพิ่งเปิด รอผู้ขายตอบ
  SELLER_REPLIED  // ผู้ขายตอบแล้ว รอ admin
  UNDER_REVIEW    // admin กำลังพิจารณา
  RESOLVED_BUYER  // ตัดสินให้ผู้ซื้อ → refund
  RESOLVED_SELLER // ตัดสินให้ผู้ขาย → release escrow
  RESOLVED_PARTIAL // แบ่ง
  ESCALATED       // ส่งให้ทีมกฎหมาย
  CLOSED          // ปิด
}

enum ReportReason {
  FAKE_CARD
  WRONG_PRICE
  DUPLICATE
  INAPPROPRIATE
  COPYRIGHT
  OTHER
}

enum PlanType {
  FREE
  PRO
  BUSINESS
}
```

---

# 5. API Routes Specification

## 5.1 Listings

### GET /api/listings
```typescript
// Query params
{
  series?: CardSeries
  condition?: Condition
  language?: CardLanguage
  minPrice?: number     // สตางค์
  maxPrice?: number
  isGraded?: boolean
  gradingCompany?: string
  sellerTier?: SellerTier
  search?: string       // full-text search
  sort?: "price_asc" | "price_desc" | "newest" | "popular" | "rating"
  page?: number         // default 1
  limit?: number        // default 24, max 48
}

// Response
{
  listings: ListingCard[]
  total: number
  page: number
  totalPages: number
}
```

### POST /api/listings
```typescript
// Auth: SELLER role required
// Body
{
  cardId?: string          // จาก CardCatalog
  customName?: string      // ถ้าไม่มีใน catalog
  customSet?: string
  series: CardSeries
  condition: Condition
  language: CardLanguage
  isGraded: boolean
  gradingCompany?: string
  gradeScore?: string
  gradeCertNo?: string
  price: number            // สตางค์
  quantity: number
  description?: string
  isNegotiable: boolean
  imageUrls: string[]      // R2 URLs (อัพโหลดแล้ว)
  videoUrl?: string
  shippingOptions: {
    provider: string
    name: string
    price: number
    estimatedDays: string
  }[]
  weight?: number
}

// Response
{ listing: Listing }

// Validation
- imageUrls: min 2, max 8 (หน้า + หลัง บังคับ)
- videoUrl: required ถ้า price > 100000 (1,000฿) หรือ seller tier Bronze
- price: min 100 (1฿), max 10000000 (100,000฿)
- shippingOptions: min 1
```

### GET /api/listings/:id
```typescript
// Public
// Response: Listing + seller profile + price history + similar listings
```

### PATCH /api/listings/:id
```typescript
// Auth: listing owner หรือ ADMIN
// Body: Partial<Listing> (price, description, status, quantity)
```

### DELETE /api/listings/:id
```typescript
// Auth: listing owner (status=DRAFT|ACTIVE|PAUSED only) หรือ ADMIN
```

## 5.2 Orders

### POST /api/orders
```typescript
// Auth: USER
// Body
{
  listingId: string
  quantity: number
  shippingOptionId: string
  shippingAddress: {
    name: string
    phone: string
    address: string
    district: string
    province: string
    postcode: string
  }
  paymentMethod: "promptpay" | "credit_card"
}

// Logic
1. Lock listing (transaction)
2. Validate qty available
3. Calculate pricing
4. Create order (PENDING_PAYMENT)
5. Create Omise charge
6. Return payment URL / QR code
```

### GET /api/orders/:id
```typescript
// Auth: buyer หรือ seller ของ order นั้น หรือ ADMIN
// Response: Order + listing snapshot + tracking + dispute
```

### POST /api/orders/:id/ship
```typescript
// Auth: seller ของ order นี้
// Body
{
  shippingProvider: string
  trackingNumber: string
  estimatedDelivery?: string
}
// Updates: status=SHIPPED, escrowReleaseAt=now+7days
// Notify: buyer (email + notification)
```

### POST /api/orders/:id/confirm
```typescript
// Auth: buyer ของ order นี้
// No body
// Updates: status=COMPLETED, trigger escrow release
// Unlock: review form
```

### POST /api/orders/:id/dispute
```typescript
// Auth: buyer ของ order นี้ (ภายใน 7 วัน หลัง delivered/confirmed)
// Body
{
  reason: DisputeReason
  description: string
  evidenceUrls: string[]  // รูป/วิดีโอ
}
// Updates: order status=DISPUTED, escrow=FROZEN
// Notify: seller + admin
```

## 5.3 Escrow

### POST /api/escrow/release (Internal / Cron)
```typescript
// Called by: Vercel Cron (daily) + manual confirm
// Logic:
// SELECT orders WHERE status=SHIPPED AND escrowReleaseAt <= now
// For each: call Omise transfer API → update escrow=RELEASED, status=COMPLETED
```

## 5.4 Cards

### GET /api/cards
```typescript
// Query: search, series, setCode, page, limit
// Response: CardCatalog[]
```

### POST /api/cards/identify
```typescript
// Auth: SELLER
// Body: { imageBase64: string }
// Logic:
// 1. OCR ชื่อการ์ด (ถ้ามี text)
// 2. Search Pokemon TCG API
// 3. Fuzzy match ใน CardCatalog
// Response: { matches: CardCatalog[], confidence: number }
```

## 5.5 Upload

### POST /api/upload/presigned-url
```typescript
// Auth: USER
// Body: { fileName: string, fileType: string, purpose: "listing" | "kyc" | "dispute" }
// Response: { uploadUrl: string, publicUrl: string, key: string }
// Rate limit: 20 req/min per user
```

## 5.6 Users & Profiles

### GET /api/users/:username/profile
```typescript
// Public
// Response: Seller info, stats, active listings, reviews
```

### PATCH /api/users/me
```typescript
// Auth: USER (self)
// Body: { name, avatar, bio, phone }
```

### POST /api/users/me/seller-apply
```typescript
// Auth: USER
// Body: { displayName, bankCode, bankName, accountNumber }
// Creates SellerProfile (tier=BRONZE)
```

## 5.7 Webhooks

### POST /api/webhooks/omise
```typescript
// Verify Omise webhook signature
// Events:
// charge.complete → update order PENDING_PAYMENT → PAID
// charge.failed   → cancel order
// transfer.sent   → update escrow RELEASED
```

## 5.8 Admin

### GET /api/admin/listings?status=PENDING_REVIEW
### POST /api/admin/listings/:id/approve
### POST /api/admin/listings/:id/reject
```typescript
// Body: { reason: string }
```

### GET /api/admin/disputes
### POST /api/admin/disputes/:id/resolve
```typescript
// Body: { resolution: "REFUND_BUYER" | "RELEASE_SELLER" | "PARTIAL", note: string, refundAmount?: number }
```

### POST /api/admin/users/:id/ban
```typescript
// Body: { reason: string }
```

---

# 6. User Flow Diagrams

## 6.1 Buyer Journey

```
[Homepage / Browse]
    │
    ▼
ค้นหา / กรองการ์ดที่ต้องการ
    │
    ▼
[Listing Detail Page]
    │── ดูรูป (สไลด์)
    │── ดูวิดีโอ holo proof
    │── ดู seller tier + rating
    │── ดูราคาตลาดเปรียบเทียบ
    │── เพิ่ม Watchlist (ถ้าไม่ซื้อตอนนี้)
    │
    ▼
กด "ซื้อเลย" หรือ "ต่อราคา"
    │
    ├── ยังไม่ login → redirect /login → กลับมา
    │
    ▼
[Checkout Page]
    │── เลือก shipping option
    │── ใส่ที่อยู่จัดส่ง (หรือดึง saved address)
    │── เลือกวิธีชำระ (PromptPay / บัตร)
    │── ยืนยันคำสั่งซื้อ
    │
    ▼
[Payment Page]
    │── QR Code PromptPay (expire 30 นาที)
    │── หรือ กรอก card (Omise.js)
    │
    ▼
ชำระสำเร็จ → [Order Confirmation Page]
    │── แสดง order number
    │── แจ้ง: "เงินของคุณปลอดภัยอยู่ใน escrow รอผู้ขายส่งของ"
    │── Email confirmation
    │
    ▼
รอผู้ขายส่ง → ได้รับ notification "ผู้ขายส่งของแล้ว"
    │── มี tracking number
    │
    ▼
รับของแล้ว
    ├── กด "ได้รับของแล้ว" → escrow release → เขียน review
    ├── ของไม่ตรง / ปลอม → กด "แจ้งปัญหา" → Dispute flow
    └── ไม่กดอะไร → auto-release หลัง 7 วัน
```

## 6.2 Seller Journey

```
[Register] → [Apply เป็น Seller]
    │── ใส่ displayName, เบอร์โทร (OTP)
    │── ใส่บัญชีธนาคาร
    │── ได้ tier BRONZE
    │
    ▼
[Sell → New Listing]
    │
    ├── STEP 1: Scan การ์ด
    │   ├── เปิดกล้อง → วางการ์ดในกรอบ
    │   ├── ถ่าย: หน้า → หลัง → มุม holo
    │   ├── AI identify → auto-fill ชื่อ, set, rarity
    │   └── ยืนยัน / แก้ไข
    │
    ├── STEP 2: รายละเอียด
    │   ├── เลือก condition
    │   ├── เลือก language
    │   ├── ใส่ description
    │   └── ถ้า graded: ใส่ cert no.
    │
    ├── STEP 3: ราคาและการจัดส่ง
    │   ├── ตั้งราคา (เห็นราคาตลาดเปรียบเทียบ)
    │   ├── เลือก shipping options
    │   └── ระบุน้ำหนัก
    │
    └── STEP 4: Submit
        ├── BRONZE → PENDING_REVIEW (รอ admin)
        └── GOLD+ → ACTIVE ทันที
    │
    ▼
มีคนสั่งซื้อ → notification
    │
    ▼
[Sell → Orders]
    │── เห็น order ใหม่
    │── เตรียมของ จัดส่ง
    │── กรอก tracking number
    │── กด "ส่งแล้ว"
    │
    ▼
รอผู้ซื้อยืนยัน (7 วัน)
    │
    ▼
ได้รับเงิน (หัก platform fee)
    │── notification "ได้รับเงิน ฿XXX"
    │── เงินเข้าบัญชีธนาคาร (Omise transfer)
```

## 6.3 Escrow State Machine

```
HOLDING ──────────────────────────────────────────────────────┐
   │                                                            │
   │ buyer confirms / auto-release                              │ dispute filed
   │                                                            │
   ▼                                                            ▼
RELEASING ─────────────────────────► FROZEN (dispute)
   │                                        │
   │ Omise transfer success                 │ admin resolves
   │                                        │
   ▼                              ┌─────────┴──────────┐
RELEASED                    RELEASED             REFUNDED
(seller gets paid)          (seller wins)        (buyer wins)
```

## 6.4 Dispute Flow

```
ผู้ซื้อกด "แจ้งปัญหา"
    │
    ▼
เลือกเหตุผล + ใส่คำอธิบาย + แนบหลักฐาน
    │── escrow → FROZEN
    │── order → DISPUTED
    │── notify seller + admin
    │
    ▼
ผู้ขายมี 48 ชม. ตอบ + แนบหลักฐาน
    │
    ├── ผู้ขายไม่ตอบใน 48 ชม. → auto resolve REFUND_BUYER
    │
    ▼
Admin พิจารณา (ภายใน 72 ชม.)
    │── ดูหลักฐานทั้งสองฝ่าย
    │── ตัดสิน
    │
    ├── RESOLVED_BUYER → refund ผู้ซื้อ, warning/ban seller
    ├── RESOLVED_SELLER → release escrow ให้ seller
    └── RESOLVED_PARTIAL → แบ่งตามสัดส่วน
```

## 6.5 Seller KYC Flow (SILVER tier)

```
ผู้ขาย apply SILVER tier
    │
    ▼
กรอกข้อมูล:
1. ถ่ายรูปบัตรประชาชน (กรอบ scanner)
2. ถ่าย selfie กับบัตร
3. ยืนยันเบอร์โทร (OTP)
4. ยืนยันบัญชีธนาคาร (โอน 1฿ เพื่อยืนยัน)
    │
    ▼
Admin review ภายใน 24 ชม.
    │
    ├── Approve → tier = SILVER, badge ปรากฏ
    └── Reject + reason → ส่ง email + สามารถ resubmit ได้
```

---

# 7. Feature Modules (ละเอียด)

## 7.1 Card Scanner

### Tech Implementation
```typescript
// components/scanner/CardScanner.tsx

const CARD_ASPECT_RATIO = 2.5 / 3.5  // standard TCG card

export function CardScanner({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [step, setStep] = useState<'front' | 'back' | 'holo'>('front')

  // เปิดกล้อง
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 1920, height: 1080 }
    }).then(stream => {
      videoRef.current!.srcObject = stream
    })
  }, [])

  // Auto-detect: ตรวจสอบ sharpness ทุก 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const sharpness = measureSharpness(videoRef.current!, canvasRef.current!)
      if (sharpness > SHARPNESS_THRESHOLD && !isDetecting) {
        captureAndProcess()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Crop ตาม overlay frame
  function captureAndProcess() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    // วาด video frame
    ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height)
    // Crop ตาม frame overlay
    const { x, y, w, h } = getFrameCoords(canvas)
    const cropped = ctx.getImageData(x, y, w, h)
    // Convert to blob → upload
    canvas.toBlob(blob => onCapture(blob!, step), 'image/webp', 0.92)
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      
      {/* Overlay กรอบการ์ด */}
      <CardOverlay step={step} />
      
      {/* Instructions */}
      <div className="absolute bottom-32 w-full text-center text-white">
        {step === 'front' && 'วางด้านหน้าการ์ดในกรอบ'}
        {step === 'back' && 'พลิกการ์ด วางด้านหลังในกรอบ'}
        {step === 'holo' && 'เอียงการ์ดเล็กน้อยให้เห็น holo สะท้อน'}
      </div>
      
      {/* Shutter button (manual) */}
      <ShutterButton onClick={captureAndProcess} />
    </div>
  )
}
```

### ขั้นตอนการถ่าย
1. **หน้าการ์ด** (บังคับ) — ถ่ายตรง, เห็นชื่อและรูปชัด
2. **หลังการ์ด** (บังคับ) — ยืนยัน back pattern ของแท้
3. **มุม holo** (บังคับถ้าราคา > 500฿) — เอียงให้เห็น foil สะท้อน
4. **รูปเสริม** (optional, max 5 ใบ) — detail, edge, corner damage

## 7.2 Search & Discovery

```typescript
// Full-text search ด้วย PostgreSQL tsvector
// ใน schema.prisma เพิ่ม:
// search_vector Unsupported("tsvector")?

// Migration SQL:
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

### Filter Logic
```typescript
// services/listing.service.ts
async function searchListings(params: SearchParams) {
  const where: Prisma.ListingWhereInput = {
    status: 'ACTIVE',
    ...(params.series && { series: params.series }),
    ...(params.condition && { condition: params.condition }),
    ...(params.minPrice && { price: { gte: params.minPrice } }),
    ...(params.maxPrice && { price: { lte: params.maxPrice } }),
    ...(params.isGraded !== undefined && { isGraded: params.isGraded }),
    ...(params.sellerTier && { seller: { tier: params.sellerTier } }),
  }

  const orderBy = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    newest: { createdAt: 'desc' },
    popular: { views: 'desc' },
    rating: { seller: { rating: 'desc' } },
  }[params.sort || 'newest']

  return prisma.listing.findMany({
    where,
    orderBy,
    skip: (params.page - 1) * params.limit,
    take: params.limit,
    include: {
      seller: { select: { displayName: true, tier: true, rating: true } },
      images: { take: 1, orderBy: { order: 'asc' } },
      card: { select: { marketPriceRaw: true } },
    },
  })
}
```

## 7.3 Price Guide

### Price Calculation
```typescript
// services/price.service.ts

// เมื่อ order COMPLETED → record price history
async function recordSalePrice(order: Order) {
  await prisma.priceHistory.create({
    data: {
      cardId: order.listing.cardId!,
      price: order.unitPrice,
      condition: order.condition as Condition,
      source: 'sale',
      recordedAt: new Date(),
    }
  })
  
  // Update market price (moving average 30 วัน)
  const recent = await prisma.priceHistory.findMany({
    where: {
      cardId: order.listing.cardId!,
      condition: order.condition as Condition,
      source: 'sale',
      recordedAt: { gte: subDays(new Date(), 30) }
    }
  })
  
  if (recent.length >= 3) {
    const avg = recent.reduce((sum, r) => sum + r.price, 0) / recent.length
    await prisma.cardCatalog.update({
      where: { id: order.listing.cardId! },
      data: { marketPriceRaw: Math.round(avg), priceUpdatedAt: new Date() }
    })
  }
}
```

## 7.4 Notification System

### Types
```typescript
type NotificationType =
  | 'ORDER_PLACED'        // seller: มีคนสั่งซื้อ
  | 'ORDER_PAID'          // seller: ได้รับการชำระ
  | 'ORDER_SHIPPED'       // buyer: ผู้ขายส่งของแล้ว
  | 'ORDER_DELIVERED'     // buyer: ของถึงแล้ว กดยืนยัน
  | 'ORDER_COMPLETED'     // seller: ได้รับเงินแล้ว
  | 'ESCROW_RELEASED'     // seller: เงิน release แล้ว
  | 'DISPUTE_OPENED'      // seller + admin
  | 'DISPUTE_REPLIED'     // buyer + admin
  | 'DISPUTE_RESOLVED'    // buyer + seller
  | 'LISTING_APPROVED'    // seller
  | 'LISTING_REJECTED'    // seller + reason
  | 'PRICE_ALERT'         // buyer: การ์ดที่ต้องการลดราคาแล้ว
  | 'REVIEW_RECEIVED'     // seller: มีรีวิวใหม่
  | 'KYC_APPROVED'        // seller
  | 'KYC_REJECTED'        // seller + reason
```

### Channels
```typescript
// services/notification.service.ts
async function notify(userId: string, type: NotificationType, data: any) {
  // 1. In-app notification (เสมอ)
  await prisma.notification.create({ data: { userId, type, ...data } })
  
  // 2. Email (สำหรับ order events สำคัญ)
  if (EMAIL_TYPES.includes(type)) {
    await resend.emails.send({
      from: 'CardVault <noreply@cardvault.th>',
      to: user.email,
      subject: getEmailSubject(type),
      react: EmailTemplate({ type, data }),
    })
  }
  
  // 3. LINE Notify (future - ถ้า user ผูก LINE)
  if (user.lineId) {
    await lineNotify(user.lineId, getMessage(type, data))
  }
}
```

---

# 8. Security & Business Rules

## 8.1 Authentication & Authorization

### Middleware (Edge)
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Protected routes
  if (path.startsWith('/sell') && !token) {
    return redirect('/login?callbackUrl=' + path)
  }
  
  if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
    return redirect('/')
  }
  
  // Rate limiting (Upstash Redis)
  const ip = request.ip ?? 'unknown'
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
}
```

### API Route Guards
```typescript
// lib/auth-guard.ts
export function withAuth(handler: Handler, options?: { role?: Role }) {
  return async (req: Request, ctx: Context) => {
    const session = await getServerSession(authOptions)
    if (!session) return new Response('Unauthorized', { status: 401 })
    if (options?.role && session.user.role !== options.role) {
      return new Response('Forbidden', { status: 403 })
    }
    return handler(req, ctx, session)
  }
}
```

## 8.2 Rate Limiting

```typescript
// Rate limits per IP/User
const limits = {
  'api/listings POST':        { requests: 10,  window: '1h'  },  // สร้าง listing
  'api/orders POST':          { requests: 20,  window: '1h'  },  // สร้าง order
  'api/upload/presigned-url': { requests: 30,  window: '10m' },  // upload
  'api/cards/identify':       { requests: 20,  window: '1h'  },  // AI identify
  'api/auth/login':           { requests: 5,   window: '15m' },  // login attempts
  'api/*':                    { requests: 100, window: '1m'  },  // global
}
```

## 8.3 Input Validation

```typescript
// ใช้ zod สำหรับทุก API input
const createListingSchema = z.object({
  price: z.number().int().min(100).max(10_000_000),
  quantity: z.number().int().min(1).max(999),
  series: z.nativeEnum(CardSeries),
  condition: z.nativeEnum(Condition),
  imageUrls: z.array(z.string().url()).min(2).max(8),
  description: z.string().max(2000).optional(),
  // ...
})
```

## 8.4 File Upload Security

```typescript
// ก่อนออก presigned URL
const ALLOWED_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'video/mp4']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

// ใน R2: ตั้ง CORS policy เฉพาะ cardvault.th
// ใช้ content-type validation บน server ก่อน presign
// ชื่อไฟล์ random UUID ป้องกัน path traversal
```

## 8.5 Escrow Business Rules

```
กฎที่ต้อง enforce ในโค้ด (ห้ามผ่านได้เด็ดขาด):

1. เงิน ไม่โอนให้ผู้ขาย ถ้า escrowStatus != HOLDING
2. release ได้ก็ต่อเมื่อ:
   - buyer กด confirm, หรือ
   - escrowReleaseAt <= now AND !dispute
3. ถ้ามี dispute OPEN → escrow FROZEN ทันที
4. admin เท่านั้นที่ unfreeze escrow ได้
5. ห้าม release ถ้า seller isBanned = true
6. platform fee หัก ณ เวลา release (ไม่ใช่เวลาจ่าย)
7. refund ผู้ซื้อได้เฉพาะ: PENDING_PAYMENT, CANCELLED, dispute won
```

## 8.6 Anti-Fraud Rules

```
Listing creation:
- Bronze seller: max 10 active listings พร้อมกัน
- ราคา > 5,000฿: admin review บังคับ (ทุก tier)
- ราคา > 1,000฿: video proof บังคับ
- ห้าม listing ซ้ำ (same card + same condition + price ต่างกัน < 5%) ใน 24 ชม.

Order:
- ห้ามซื้อ listing ตัวเอง
- ห้ามซื้อถ้า buyer isBanned
- Pending payment expire 30 นาที → auto cancel + unlock qty

Seller:
- ถ้า dispute lost 3 ครั้ง → force KYC review
- ถ้า dispute lost 5 ครั้ง → suspend account
- rating ต่ำกว่า 3.0 หลัง 10 sales → ลง tier 1 ระดับ
```

## 8.7 Data Privacy

```
- เลขบัตรประชาชน: เข้ารหัส AES-256 ก่อน store
- เลขบัญชี: เข้ารหัส AES-256
- รูป KYC: store ใน private bucket (ไม่ public URL)
- ลบรูป KYC หลัง 1 ปี (ถ้า approved)
- GDPR-ready: export + delete data on request
- Audit log ทุก sensitive action
```

---

# 9. UI/UX Pages & Components

## 9.1 Homepage
```
Hero Section:
- Headline: "ซื้อ-ขายการ์ด TCG ได้อย่างปลอดภัย"
- Sub: "ระบบ Escrow คุ้มครองทุกการซื้อขาย"
- CTA: "เริ่มซื้อ" / "เริ่มขาย"
- Trust stats: X listing, Y transactions, Z% dispute resolved

Trust Badges:
- "Escrow ปลอดภัย" | "AI ตรวจสอบการ์ด" | "Verified Seller" | "คืนเงิน 7 วัน"

Featured Listings (carousel):
- การ์ด featured ที่จ่าย boost
- แสดง: รูป, ชื่อ, seller tier badge, ราคา, ราคาตลาดเปรียบเทียบ

Categories:
- Pokemon | Yu-Gi-Oh! | One Piece | MTG | Vanguard | Digimon

Latest Listings:
- grid 4 columns (desktop) / 2 columns (mobile)
- filter bar: All | Pokemon | Graded | Under 500฿

Price Movers:
- การ์ดที่ราคาขึ้น/ลงมากที่สุดใน 7 วัน

How It Works:
- 3 steps: ลงสินค้า → ซื้อผ่าน Escrow → ยืนยัน & ได้เงิน
```

## 9.2 Listing Detail Page
```
Layout: 2 columns (desktop) | stack (mobile)

Left Column:
- Image gallery (swiper) + video player
- "รูปจริง ถ่ายโดยผู้ขาย" badge

Right Column:
- ชื่อการ์ด + set badge + language badge
- Condition badge (color-coded)
- ราคา (bold, large)
- ราคาตลาดเปรียบเทียบ: "ราคาตลาด ฿X | ต่ำกว่าตลาด 15%" (ถ้าราคาดี)
- Grading info (ถ้ามี): PSA 9 | Cert #12345678 [verify link]
- "ซื้อเลย" button (primary)
- "เพิ่ม Watchlist" button
- "ต่อราคา" button (ถ้า isNegotiable)
- Shipping options table
- Escrow guarantee badge: "เงินค้างระบบจนกว่าคุณจะรับของ"

Seller Card:
- Avatar + displayName
- Tier badge + rating (stars) + จำนวน reviews
- Stats: X sales | Y% response rate
- "ดู profile" link

Price History Chart:
- Line chart 30/90/180 วัน
- Powered by Recharts

Similar Listings:
- การ์ดชนิดเดียวกัน condition เดียวกัน

Report button (เล็กๆ ด้านล่าง)
```

## 9.3 Create Listing (Sell → New)
```
Step indicator: [1. สแกน] [2. รายละเอียด] [3. ราคา] [4. ยืนยัน]

Step 1 — Scanner:
- Full-screen camera overlay
- กรอบการ์ด + corner markers
- Step indicator: หน้า → หลัง → holo
- Thumbnail preview ของแต่ละรูป
- "ถ่ายใหม่" / "ใช้รูปนี้"
- "อัพโหลดจาก Gallery" option

Step 2 — Details:
- Card identity (auto-filled หรือ manual):
  - ชื่อการ์ด, Set, Series (dropdown)
- Condition (visual selector พร้อมตัวอย่างรูป)
- Language
- Is Graded toggle → ถ้า yes: company, score, cert no.
- Description (markdown-lite editor)

Step 3 — Pricing:
- ราคา input พร้อม: "ราคาตลาด: ฿X" (reference)
- Quantity
- Is Negotiable toggle
- Shipping options (เพิ่ม/ลบ option)
- Weight (คำนวณค่าส่งอัตโนมัติ)

Step 4 — Preview & Submit:
- Preview listing จริงๆ (ตัวอย่างหน้าตาที่คนอื่นจะเห็น)
- Terms checkbox
- Submit button
- หลัง submit: "อยู่ระหว่างรอ approve" / "ลงขายแล้ว!"
```

## 9.4 Seller Dashboard
```
Overview cards:
- ยอดขายเดือนนี้ | รายได้สุทธิ | Listings active | Orders pending

Orders tab:
- Tabs: ทั้งหมด | รอส่ง | ส่งแล้ว | สำเร็จ | ปัญหา
- แต่ละ row: order number, ชื่อการ์ด, ราคา, buyer, status, actions

Listings tab:
- Status filter
- Edit / Pause / Delete actions
- "ทำ Featured" upgrade button

Analytics tab (PRO+):
- Revenue chart (monthly)
- Top selling cards
- Conversion rate
- Tier progress bar
```

## 9.5 Admin Panel
```
Dashboard:
- GMV วันนี้ / สัปดาห์ / เดือน
- Orders: pending | disputed | completed
- Listings: pending review | active | rejected
- New sellers: pending KYC

Listings Queue (pending review):
- Card: รูป, ชื่อ, ราคา, seller tier
- Actions: Approve | Reject (with reason template)
- ดู listing preview
- Flag ถ้าดูน่าสงสัย

Disputes:
- Sorted by: deadline (72h timer)
- แสดง: timeline, evidence ทั้ง 2 ฝ่าย
- Resolve modal: outcome + admin note

Users:
- Search by email / username
- ดู order history, listing history, dispute history
- Actions: Ban | Downgrade tier | Force KYC
```

## 9.6 Key Components

### SellerBadge
```typescript
// BRONZE: 🥉 gray badge
// SILVER: 🥈 silver badge + checkmark
// GOLD: 🥇 gold badge + KYC verified icon
// VERIFIED_PRO: 💎 purple badge + "Pro"
```

### EscrowStatus
```typescript
// Visual timeline:
// [จ่ายแล้ว] → [รอส่ง] → [ระหว่างขนส่ง] → [รอยืนยัน] → [สำเร็จ]
// แสดง countdown timer สำหรับ auto-release
```

### PriceCompare
```typescript
// แสดงราคา listing vs market price
// ถ้า < market: "ต่ำกว่าตลาด X%" (green badge)
// ถ้า > market: "สูงกว่าตลาด X%" (amber badge)
// ถ้าใกล้เคียง: "ราคาตลาด" (gray badge)
```

---

# 10. Monetization & Business Logic

## 10.1 Revenue Streams

### Transaction Fee
```
Bronze: 8% ของ subtotal
Silver: 6%
Gold: 5%
Verified Pro: 4%

คำนวณ ณ เวลา escrow release:
sellerReceives = subtotal - (subtotal × feePercent / 100)
```

### Subscription Plans
```
FREE (default):
- max 10 active listings
- manual approve ทุก listing
- basic analytics

PRO (299฿/เดือน หรือ 2,990฿/ปี):
- unlimited listings
- 1 featured listing/เดือน (฿99 มูลค่า)
- auto-approve (tier Silver+)
- price history chart
- priority support

BUSINESS (899฿/เดือน หรือ 8,990฿/ปี):
- ทุกอย่างของ PRO
- bulk upload (CSV)
- advanced analytics + export
- API access
- dedicated account manager (>50 sales/month)
- 3 featured listings/เดือน
```

### Featured Listings
```
Homepage banner: 299฿/วัน (max 3 slots)
Category top: 99฿/วัน per category
Search boost: 49฿/วัน
"Hot Deal" badge: 29฿/วัน

Auto-expire เมื่อ listing sold หรือ หมดเวลา
```

### Future Revenue (Phase 3+)
```
- Grading service partnership: 10% commission จาก PSA/TAG
- Insurance: 1-2% ของ order value (partner กับประกันภัย)
- CardVault Academy: คอร์ส online ตีราคาการ์ด
- B2B API: ราคาตลาดสำหรับ external apps
```

## 10.2 Fee Calculator Example
```
ผู้ซื้อจ่าย: 1,000฿ + ค่าส่ง 60฿ = 1,060฿
Platform fee (Silver seller 6%): 60฿
ผู้ขายได้: 1,000 - 60 = 940฿
CardVault ได้: 60฿
```

---

# 11. Phase Roadmap

## Phase 1 — MVP (สัปดาห์ 1-8)
**เป้าหมาย:** ระบบ core ซื้อ-ขายได้จริง

```
Week 1-2: Foundation
☐ Next.js setup + Prisma migrate + auth (email + LINE)
☐ Basic user registration + seller apply
☐ R2 image upload pipeline

Week 3-4: Listings
☐ Card Scanner (camera + crop)
☐ Pokemon TCG API integration
☐ Create listing flow (4 steps)
☐ Browse + search + filter

Week 5-6: Payments & Orders
☐ Omise integration (PromptPay + credit card)
☐ Order creation + escrow holding
☐ Seller: mark shipped + tracking
☐ Buyer: confirm received
☐ Auto-release cron job

Week 7-8: Trust & Launch prep
☐ Review system
☐ Basic dispute (report to admin)
☐ Admin panel (approve listings, view orders)
☐ Email notifications
☐ In-app notifications
☐ Mobile responsive
☐ Bug fix + performance
```

## Phase 2 — Trust & Growth (เดือน 3-4)
```
☐ Full KYC (ID card scan + selfie)
☐ Seller tier auto-upgrade logic
☐ Seller deposit system
☐ Full dispute system (seller reply + admin resolve)
☐ Featured listings (paid boost)
☐ Subscription plans (PRO + BUSINESS)
☐ Price history charts
☐ Watchlist + price alerts
☐ Seller analytics dashboard
☐ Bulk listing upload (CSV)
☐ Yu-Gi-Oh! / One Piece support
```

## Phase 3 — Scale (เดือน 5-8)
```
☐ PWA (installable, offline browsing)
☐ Push notifications (Web Push)
☐ AI condition assessment (photo → condition suggestion)
☐ MTG / Vanguard / Digimon support
☐ Grading service integration (PSA Thailand)
☐ B2B API (ราคาตลาด)
☐ Referral program
☐ CardVault Academy (content)
☐ React Native app (iOS + Android)
```

## Phase 4 — Expansion (ปีที่ 2)
```
☐ ขยายไป SEA (Malaysia, Singapore)
☐ Multi-currency (MYR, SGD)
☐ Live auction feature
☐ Card vault / storage service (physical)
☐ Insurance partnership
☐ IPO / funding
```

---

# 12. Windsurf Implementation Prompt

## Master Prompt (วาง context นี้ทั้งหมดให้ Windsurf)

```
You are implementing CardVault — a Thai-language TCG card marketplace.

TECH STACK:
- Next.js 14 (App Router, TypeScript, strict)
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Supabase)
- NextAuth.js v5
- Omise payment
- Cloudflare R2

DESIGN SYSTEM:
- ภาษาไทยเป็นหลักทุก UI text
- Dark theme: bg-zinc-950, accent สีทอง (#F59E0B) สำหรับ premium feel
- Light theme: bg-white, accent เดียวกัน
- Font: Sarabun (Thai) + Inter (Latin)
- Border radius: 12px สำหรับ cards
- Animation: subtle, ไม่ distract

CODING CONVENTIONS:
- ทุก API route ต้องมี: auth guard, zod validation, try-catch, typed response
- ทุก server action ต้องมี: revalidatePath หลัง mutation
- ใช้ React Server Components (RSC) เป็นหลัก, client component เฉพาะที่จำเป็น
- Error handling: ทุก error แสดงเป็น Thai message ให้ user
- Loading states: ทุก async action ต้องมี skeleton หรือ spinner
- Optimistic updates: สำหรับ watchlist, like
- Images: ทุก <img> ต้องใช้ next/image พร้อม blur placeholder

FILE NAMING:
- Components: PascalCase.tsx
- Utilities: camelCase.ts
- API routes: route.ts
- Services: camelCase.service.ts

IMPLEMENT IN THIS ORDER (Phase 1):
1. prisma/schema.prisma → migrate
2. lib/ (prisma, auth, omise, r2, resend)
3. app/api/auth → NextAuth
4. app/(auth)/login + register pages
5. app/(main)/layout (Navbar + Footer)
6. app/(main)/page (Homepage skeleton)
7. app/api/listings (GET + POST)
8. components/scanner/CardScanner
9. app/sell/new (listing creation wizard)
10. app/(main)/browse (search + filter)
11. app/(main)/listing/[id] (detail page)
12. app/api/orders + Omise integration
13. app/orders (buyer order history)
14. app/sell/orders (seller order management)
15. app/api/webhooks/omise
16. Escrow auto-release cron
17. app/api/upload/presigned-url
18. Notification system (in-app + email)
19. app/admin (basic panel)
20. Review system

DO NOT:
- ใช้ any type
- Skip error handling
- Hardcode Thai text แบบ magic string (ให้ define constants)
- Forget to add indexes ใน schema
- Skip mobile responsive
- Use localStorage สำหรับ sensitive data
```

## Phase-by-Phase Prompts

### Prompt 1: Project Setup
```
Set up CardVault Next.js 14 project:
1. npx create-next-app@latest cardvault --typescript --tailwind --app --src-dir=false
2. Install: prisma @prisma/client @auth/prisma-adapter next-auth@beta
3. Install: shadcn/ui (init + add: button, input, card, badge, dialog, form, select, toast)
4. Install: zod react-hook-form @hookform/resolvers
5. Install: omise @aws-sdk/client-s3 resend react-email
6. Install: @upstash/redis @upstash/ratelimit
7. Create folder structure ตาม spec
8. Setup prisma/schema.prisma ตาม schema spec ข้างบน
9. Setup .env.local ตาม environment variables spec
10. Run: npx prisma migrate dev --name init
```

### Prompt 2: Auth
```
Implement NextAuth.js v5 สำหรับ CardVault:
- Providers: Credentials (email+password), LINE OAuth, Google OAuth
- Session strategy: JWT
- Callbacks: jwt (add role, username), session (expose role, username)
- ต้องมี: /login, /register pages ภาษาไทย
- Register: email, password (bcrypt), name, username (auto-generate จาก email)
- Error messages ภาษาไทยทั้งหมด
- Redirect หลัง login → callbackUrl หรือ /
```

### Prompt 3: Card Scanner
```
Implement CardScanner component สำหรับ CardVault:

Technical requirements:
- ใช้ MediaDevices API (facingMode: environment)
- Overlay กรอบ aspect ratio 2.5:3.5 (TCG standard)
- Corner markers สีเขียว (animated)
- Auto-detect sharpness (Laplacian variance)
- ถ่าย 3 รูป: front → back → holo (แต่ละ step มี instruction ภาษาไทย)
- Crop ตาม frame โดยอัตโนมัติ
- Convert to WebP (quality 0.92, max 2MB)
- Preview thumbnail แต่ละรูป
- "ถ่ายใหม่" และ "ใช้รูปนี้" buttons
- Fallback: "เลือกจาก Gallery" สำหรับ browser ที่ไม่รองรับ camera

หลังถ่ายครบ:
- POST /api/cards/identify พร้อม front image
- แสดง loading "กำลังตรวจสอบการ์ด..."
- แสดงผล: ชื่อ, set, rarity, ราคาตลาด
- User confirm หรือ manual fill

Component props:
interface CardScannerProps {
  onComplete: (images: File[], cardMatch: CardCatalog | null) => void
}
```

---

*CardVault Master System Document v2.0*
*เอกสารนี้ครอบคลุม L1-L8 ทุก layer ตั้งแต่ Vision จนถึง Windsurf Implementation Prompt*
*พร้อม implement Phase 1 ได้ทันที*

---

# 13. Community Module

## 13.1 Overview
Community เป็น feature ที่ดึงผู้ใช้ออกจาก Facebook Group มาอยู่บนแพลตฟอร์ม CardVault โดยตรง เพิ่ม engagement และ retention ระยะยาว

## 13.2 Feature หลัก

### Post Feed (หน้า `/community`)
- โพสต์ข้อความ + รูปภาพ (สูงสุด 8 รูป/โพสต์)
- Tag การ์ดจาก CardCatalog ได้ → แสดงราคาตลาดอัตโนมัติใน post
- Tag listing ตัวเองได้ → แสดงปุ่ม "ซื้อเลย" inline ใน feed
- Hashtag หมวด: `#โชว์การ์ด` `#ถามราคา` `#ข่าวสาร` `#ประกาศซื้อ-ขาย`
- Like / Comment / Share / Bookmark

### Forum Threads (หน้า `/community/forum`)
- หัวข้อแยกตาม TCG: Pokemon / Yu-Gi-Oh! / One Piece / MTG / Vanguard
- Thread อ่านย้อนหลังได้ Quote reply ได้
- Hot threads ขึ้น sidebar
- Upvote คำตอบ + mark "Best Answer" ได้ (เหมาะกับ "ถามราคา")

### ผูกกับ Marketplace
- โพสต์ใน feed → แนบ listing → ผู้ซื้อซื้อได้ทันที
- Card page มี Community tab → แสดง feed ที่ tag การ์ดนั้น + listing ราคาล่าสุด
- โพสต์ "ถามราคา" + tag การ์ด → ระบบดึง price history ขึ้นให้อัตโนมัติ

## 13.3 Database Schema เพิ่มเติม

```prisma
model CommunityPost {
  id          String      @id @default(cuid())
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
  content     String      @db.Text
  images      String[]    // R2 URLs
  hashtags    String[]
  taggedCards String[]    // CardCatalog IDs
  taggedListings String[] // Listing IDs
  type        PostType    @default(GENERAL) // GENERAL | SHOW | ASK_PRICE | SELL | NEWS
  likeCount   Int         @default(0)
  commentCount Int        @default(0)
  isPinned    Boolean     @default(false)
  isHidden    Boolean     @default(false) // admin hide
  comments    PostComment[]
  likes       PostLike[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
  @@index([type])
  @@index([createdAt])
}

model PostComment {
  id        String        @id @default(cuid())
  postId    String
  post      CommunityPost @relation(fields: [postId], references: [id])
  authorId  String
  author    User          @relation(fields: [authorId], references: [id])
  content   String        @db.Text
  parentId  String?       // สำหรับ reply
  parent    PostComment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   PostComment[] @relation("CommentReplies")

  createdAt DateTime @default(now())
}

model PostLike {
  id        String        @id @default(cuid())
  postId    String
  post      CommunityPost @relation(fields: [postId], references: [id])
  userId    String
  user      User          @relation(fields: [userId], references: [id])

  @@unique([postId, userId])
}

model ForumThread {
  id          String        @id @default(cuid())
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  title       String
  content     String        @db.Text
  category    TcgCategory   // POKEMON | YUGIOH | ONEPIECE | MTG | VANGUARD
  isPinned    Boolean       @default(false)
  isLocked    Boolean       @default(false)
  viewCount   Int           @default(0)
  replyCount  Int           @default(0)
  replies     ForumReply[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@index([createdAt])
}

model ForumReply {
  id          String      @id @default(cuid())
  threadId    String
  thread      ForumThread @relation(fields: [threadId], references: [id])
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
  content     String      @db.Text
  upvoteCount Int         @default(0)
  isBestAnswer Boolean    @default(false)
  parentId    String?

  createdAt DateTime @default(now())
}

enum PostType {
  GENERAL
  SHOW
  ASK_PRICE
  SELL
  NEWS
}
```

## 13.4 API Routes เพิ่มเติม

```
GET    /api/community/posts              ← feed (pagination, filter by hashtag)
POST   /api/community/posts              ← สร้างโพสต์ใหม่
GET    /api/community/posts/[id]         ← ดูโพสต์ + comments
DELETE /api/community/posts/[id]         ← ลบโพสต์ตัวเอง
POST   /api/community/posts/[id]/like    ← like/unlike
POST   /api/community/posts/[id]/comment ← comment

GET    /api/community/forum              ← forum threads (filter by category)
POST   /api/community/forum              ← สร้าง thread
GET    /api/community/forum/[id]         ← ดู thread + replies
POST   /api/community/forum/[id]/reply   ← reply
PATCH  /api/community/forum/[id]/reply/[replyId]/best ← mark best answer
```

## 13.5 Folder Structure เพิ่มเติม

```
app/
├── community/
│   ├── page.tsx              ← Feed หลัก
│   ├── forum/
│   │   ├── page.tsx          ← Forum index (แยก category)
│   │   └── [threadId]/page.tsx
│   └── [postId]/page.tsx     ← Single post view

components/
├── community/
│   ├── PostCard.tsx
│   ├── PostComposer.tsx      ← rich editor + tag การ์ด + แนบ listing
│   ├── PostFeed.tsx
│   ├── ForumCard.tsx
│   ├── ForumThread.tsx
│   └── CardTag.tsx           ← inline card chip แสดงราคา
```

## 13.6 Phase Roadmap ของ Community
- **Phase 2**: Feed + PostComposer + tag listing + Like/Comment
- **Phase 2**: Forum threads + category filter + best answer
- **Phase 3**: Notification เมื่อมีคนตอบ thread / comment โพสต์เรา
- **Phase 3**: Push notification (Web Push) สำหรับ hot thread

---

# 14. Trust & Safety Module

## 14.1 Overview
Trust & Safety layer คือสิ่งที่ทำให้ CardVault แตกต่างจาก Facebook Group ชัดเจนที่สุด ประกอบด้วย Scammer Database, Reputation System และ Buyer Score

## 14.2 Scammer Database

### Community Report System
ผู้ใช้ทุกคนสามารถ "รายงานโกง" ได้โดยกรอกข้อมูล:
- เบอร์โทรศัพท์
- เลขบัญชีธนาคาร (ระบุธนาคาร + เลขบัญชี)
- ชื่อบัญชี
- Facebook URL / LINE ID / ช่องทางอื่น
- หลักฐาน (รูป screenshot สูงสุด 5 รูป)
- คำอธิบายเหตุการณ์

Admin verify → ถ้าผ่าน → ขึ้น Scammer List สาธารณะ

### Scammer Check Page (`/check`)
- ค้นหาได้ด้วย: เบอร์โทร, เลขบัญชี, ชื่อบัญชี
- แสดงผล: จำนวนรายงาน, ธนาคาร, ชื่อบัญชี (masked บางส่วน), วันที่ report, หลักฐานที่ admin อนุมัติ
- ใครก็ค้นได้ ไม่ต้อง login (เพื่อให้ viral และใช้ได้กว้าง)

### Auto-check ตอน KYC
- ผู้ขายสมัคร KYC ใส่เลขบัญชีธนาคาร → ระบบ auto-check กับ ScammerReport table
- ถ้าตรงกับ blacklist → block การสมัคร + แจ้ง admin ทันที

## 14.3 Database Schema เพิ่มเติม

```prisma
model ScammerReport {
  id            String              @id @default(cuid())
  reporterId    String
  reporter      User                @relation(fields: [reporterId], references: [id])
  phone         String?
  bankCode      String?             // "SCB" | "KBANK" | "KTB" etc.
  bankNumber    String?             // masked เมื่อแสดงสาธารณะ
  bankName      String?             // ชื่อบัญชี
  facebookUrl   String?
  lineId        String?
  description   String              @db.Text
  evidenceUrls  String[]            // R2 URLs
  status        ScammerReportStatus @default(PENDING) // PENDING | APPROVED | REJECTED
  adminNote     String?
  reviewedBy    String?             // admin userId
  reviewedAt    DateTime?
  isPublic      Boolean             @default(false) // true เมื่อ admin approve

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([phone])
  @@index([bankNumber])
  @@index([status])
}

enum ScammerReportStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## 14.4 Reputation System

### Seller Score
แสดงในทุกที่ที่มีชื่อ seller:
```
★ 4.9  (127 รีวิว)  🛡️ Verified  🥇 Gold Seller
```

องค์ประกอบคะแนน:
| ปัจจัย | น้ำหนัก |
|---|---|
| รีวิวจากผู้ซื้อ (1-5 ดาว) | 50% |
| ส่งของตรงเวลา (vs escrow deadline) | 25% |
| Response rate ใน 24h | 15% |
| Dispute แพ้ | ลบหนัก |
| บัญชีถูก report และผ่าน admin | suspend pending |

### Seller Tier (อัพเกรดอัตโนมัติ)
```
🥉 Bronze  — เริ่มต้น (ทุกคน)
🥈 Silver  — 10+ sales, ★4.5+, 0 disputes แพ้
🥇 Gold    — 50+ sales, ★4.7+, KYC verified
💎 Diamond — 200+ sales, ★4.8+, pro seller
```

### Buyer Score
Seller มีสิทธิ์ดูคะแนน buyer ก่อนขาย:
- Buyer cancel order เกิน 3 ครั้ง → warning badge
- ไม่กด "รับของแล้ว" เกินกำหนด → ระบบนับอัตโนมัติ แต่บันทึก pattern
- Seller tier Gold+ สามารถปฏิเสธ buyer ที่มี bad score ได้

## 14.5 Seller Profile Page (อัพเดท)

```
[Avatar] ชื่อ | @username | สมาชิกตั้งแต่ ม.ค. 2025

🛡️ Verified KYC    ★ 4.9 (127 รีวิว)    🥇 Gold Seller
📦 ส่งแล้ว 134 ออเดอร์    ⚡ ตอบภายใน 2 ชม.    ✅ 0 disputes

Tab: [ Listings ]  [ รีวิว ]  [ Community Posts ]
```

## 14.6 API Routes เพิ่มเติม

```
POST   /api/reports/scammer              ← รายงานคนโกง
GET    /api/reports/scammer/check        ← ค้นหา ?phone=xxx หรือ ?bank=xxx
GET    /api/admin/reports                ← admin ดู pending reports
PATCH  /api/admin/reports/[id]           ← approve / reject
GET    /api/users/[id]/score             ← ดู buyer/seller score
```

## 14.7 Folder Structure เพิ่มเติม

```
app/
├── check/
│   └── page.tsx              ← Scammer Check (public, ไม่ต้อง login)
├── admin/
│   └── reports/page.tsx      ← Admin: review scammer reports

components/
├── trust/
│   ├── SellerBadge.tsx       ← ★ rating + tier badge (ใช้ทั่วทั้งแพลตฟอร์ม)
│   ├── ScammerReportForm.tsx
│   ├── ScammerCheckResult.tsx
│   └── BuyerScoreBadge.tsx
```

## 14.8 Phase Roadmap ของ Trust & Safety
- **Phase 1 MVP**: รีวิว + ดาว + basic report form (ส่งหา admin)
- **Phase 2**: Scammer Database สาธารณะ + Seller Tier auto-upgrade + Buyer score
- **Phase 2**: KYC auto-check กับ blacklist ตอนสมัคร
- **Phase 3**: API สาธารณะให้ community อื่นดึงข้อมูล scammer blacklist ได้ (growth loop)

---

*เพิ่มเติมจาก v2.0 — Section 13 (Community Module) และ Section 14 (Trust & Safety Module)*
*พร้อม implement ต่อจาก Phase 1 ได้ทันที*
