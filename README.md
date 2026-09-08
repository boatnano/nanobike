# nanobike / นาโน Bike

ชุมชนฝากซื้อสมุทรสงคราม — เว็บก่อน ห่อแอปทีหลัง

## โครงสร้าง

- `apps/web` — Next.js (App Router)
- `supabase/migrations` — schema + RLS

## Deploy (Vercel)

1. Import repo `boatnano/nanobike`
2. Set **Root Directory** = `apps/web` (สำคัญ — อย่า build จากรากโปรเจกต์)
3. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy / Redeploy

ไม่ต้องใส่ `outputDirectory` เอง — ให้ Vercel จัดการ Next.js

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
