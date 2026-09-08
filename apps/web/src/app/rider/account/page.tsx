import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function RiderAccountPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <Link href="/rider" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">บัญชีของฉัน</h1>
      <p className="text-sm text-[var(--muted)]">{BRAND.nameTh} · ไรเดอร์</p>

      <ul className="mt-6 space-y-3 text-sm">
        {[
          "ข้อมูลส่วนตัว",
          "พร้อมเพย์ + QR (บังคับก่อนเปิดรับงาน)",
          "สถานะอนุมัติจากแอดมิน",
          "คะแนน / งานสำเร็จ / หมุดรอจ่าย",
          "ร้านที่ฉันส่ง",
          "เปลี่ยนรหัสผ่าน",
        ].map((item) => (
          <li
            key={item}
            className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3"
          >
            {item}
          </li>
        ))}
      </ul>
    </main>
  );
}
