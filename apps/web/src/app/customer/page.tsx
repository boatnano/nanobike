import Link from "next/link";
import { JobRoadmap } from "@/components/JobRoadmap";
import { RoleModeNav } from "@/components/RoleModeNav";
import { BRAND } from "@/lib/constants";

export default function CustomerHomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="customer" />
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            {BRAND.name}
          </p>
          <h1 className="font-display text-2xl font-bold">ฝากซื้อ</h1>
        </div>
        <Link href="/customer/account" className="text-sm font-medium underline">
          บัญชีของฉัน
        </Link>
      </header>

      <JobRoadmap status="pending_rider" role="customer" deadlineLabel="เหลือ 4:32" />

      <section className="mt-6 space-y-3">
        <Link
          href="/customer/new"
          className="block rounded-2xl bg-[var(--ink)] px-4 py-4 text-center text-sm font-semibold text-white"
        >
          เริ่มฝากซื้อ — ค้นหาร้าน
        </Link>
        <Link
          href="/customer/jobs"
          className="block rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 text-center text-sm font-semibold"
        >
          งานของฉัน
        </Link>
      </section>

      <p className="mt-6 text-sm text-[var(--muted)]">
        ลำดับ: ค้นร้าน → ยืนยันจุดส่ง → แมพไรเดอร์+ค่าส่ง → เลือกคน → ตาม Roadmap จนส่งสำเร็จ
      </p>
    </main>
  );
}
