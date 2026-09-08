"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JobRoadmap } from "@/components/JobRoadmap";
import { BRAND } from "@/lib/constants";
import { notify, requestNotifyPermission } from "@/lib/notify";

export default function RiderHomePage() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    void requestNotifyPermission();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            {BRAND.name} rider
          </p>
          <h1 className="font-display text-2xl font-bold">รับงาน</h1>
        </div>
        <Link href="/rider/account" className="text-sm font-medium underline">
          บัญชีของฉัน
        </Link>
      </header>

      <label className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3">
        <span className="text-sm font-semibold">เปิดรับงาน</span>
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => {
            setAvailable(e.target.checked);
            if (e.target.checked) {
              notify("nanobike", "เปิดรับงานแล้ว — เก็บหน้านี้เปิดไว้เพื่ออัปเดตพิกัด");
            }
          }}
        />
      </label>

      <JobRoadmap status="going_to_shop" role="rider" />

      <section className="mt-6 grid gap-3">
        <Link
          href="/rider/map"
          className="rounded-2xl bg-[var(--accent)] px-4 py-4 text-center text-sm font-semibold"
        >
          แผนที่ตำแหน่งฉัน (รีเฟรช / ลากแก้)
        </Link>
        <Link
          href="/rider/jobs"
          className="rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-4 text-center text-sm font-semibold"
        >
          งานเข้า / งานปัจจุบัน
        </Link>
        <Link
          href="/rider/shops"
          className="rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-4 text-center text-sm font-semibold"
        >
          เพิ่มร้าน + หมุด (1฿ หลังอนุมัติ)
        </Link>
      </section>
    </main>
  );
}
