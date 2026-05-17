# CardVault — Full Verification Prompt

## ใช้กับ Agent ตัวถัดไป

---

```
คุณเป็น QA + DevOps agent สำหรับ CardVault — Thai TCG Marketplace

## เป้าหมาย
ตรวจเช็คว่า https://cardvault-drab.vercel.app/ พร้อมใช้งานจริง 100%

## สิ่งที่ต้องทำ

### 1. เช็คทุกหน้าว่า Return 200 (หรือ 307 สำหรับ auth pages)
- `/` (Homepage)
- `/browse` (Browse listings)
- `/listing/[id]` (ใช้ listing id จริงจาก DB)
- `/login`
- `/register`
- `/check` (Scammer check)
- `/how-it-works`
- `/faq`
- `/contact`
- `/escrow-info`
- `/terms`
- `/privacy`
- `/profile/[username]` (ใช้ username จริงจาก DB)
- `/sell` → 307 redirect to /login (ไม่ auth)
- `/admin` → 307 redirect to /login (ไม่ admin)

### 2. เช็ค Database Connection
- Homepage แสดง listings จริง (ไม่ใช่ empty state)
- `/browse` แสดง listings จริง
- `/check` ทำงานไม่ error
- `/profile/admin` (username: admin) แสดงข้อมูลจริง

### 3. เช็ค Design System
ทุกหน้าต้องใช้ Dark Gaming Luxury theme:
- bg: zinc-950 (#09090b)
- accent: amber-500 (#F59E0B)
- text: zinc-50 (#FAFAFA)
- font: Sarabun (Thai) + Inter (Latin)
- ห้ามมี light theme (bg-white, text-black)

### 4. เช็ค Type Safety
```bash
npx tsc --noEmit  # ต้อง 0 errors (เฉพาะ UI pages, ไม่รวม api/)
grep -rn "@ts-nocheck\|: any\|as any" app/ components/ --include="*.tsx" | grep -v "api/"
# ต้องไม่มีผลลัพธ์
```

### 5. เช็ค Build
```bash
npm run build  # ต้อง success
```

### 6. เช็ค Responsive
ทุกหน้าต้อง responsive ที่:
- 375px (iPhone SE)
- 768px (Tablet)
- 1440px (Desktop)

### 7. เช็ค Error Handling
- หน้าที่ใช้ DB ต้องมี loading state (skeleton)
- หน้าที่ใช้ DB ต้องมี error boundary
- ไม่ auth → redirect ไป /login (ไม่ใช่แสดง empty)

### 8. รายงานผล
สรุปผลเป็น checklist:
- [ ] ทุกหน้า return 200/307
- [ ] Database connection ทำงาน
- [ ] ข้อมูลจริงแสดง (ไม่ใช่ mock data)
- [ ] Design system ถูกต้อง
- [ ] Type safety: 0 errors
- [ ] Build: success
- [ ] Responsive: ทุก breakpoint
- [ ] Error handling: proper states

ถ้าพบปัญหา → fix แล้ว commit + push

## Tokens
ถาม human ขอ token:
- GitHub PAT
- Vercel Token
- Supabase Token
- Supabase Project ID
- Vercel Project ID
- DATABASE_URL

## Repo
https://github.com/photsathonspd1-create/cardvault

## Env
DATABASE_URL=postgresql://cardvault_app:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
(ถาม human ขอ password)

## วิธี deploy
```bash
git add -A && git commit -m "fix: ..." && git pull --rebase origin main && git push origin main
# Vercel auto-deploy จาก main branch
```
```
