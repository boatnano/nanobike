import Link from "next/link";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireRiderActor } from "@/lib/auth";

export default async function RiderShopsPage() {
  await requireRiderActor();

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="rider" />
      <Link href="/rider" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">เพิ่มร้าน + หมุด</h1>
      <p className="mt-3 rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-6 text-sm text-[var(--muted)]">
        ฟีเจอร์ส่งหมุดร้านรอทำขั้นถัดไป — ตอนนี้มีร้านตัวอย่างในระบบให้ลูกค้าค้นหาทดสอบได้แล้ว
      </p>
    </main>
  );
}
