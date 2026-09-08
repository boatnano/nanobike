# nanobike / นาโน Bike

ชุมชนฝากซื้อสมุทรสงคราม — เว็บก่อน ห่อแอปทีหลัง

## โครงสร้าง

- `apps/web` — Next.js (App Router)
- `supabase/migrations` — schema + RLS

## เริ่มต้น

```bash
cd apps/web
cp .env.example .env.local
# ใส่ SUPABASE URL / anon key
npm install
npm run dev
```

สร้างโปรเจกต์ Supabase แล้วรัน migration ใน `supabase/migrations/20260908100000_init_nanobike.sql`

Auth ใช้เบอร์โทร + รหัสผ่าน โดยเก็บอีเมลภายในรูปแบบ `08xxxxxxxx@users.nanobike.local` (ไม่เสียค่า SMS)

## แบรนด์

- EN: nanobike
- TH: นาโน Bike
