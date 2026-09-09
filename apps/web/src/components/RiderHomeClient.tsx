"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { setRiderAvailability } from "@/app/rider/actions";
import { JobRoadmap } from "@/components/JobRoadmap";
import { notify, requestNotifyPermission } from "@/lib/notify";

export function RiderHomeClient({
  initiallyAvailable,
}: {
  initiallyAvailable: boolean;
}) {
  const [available, setAvailable] = useState(initiallyAvailable);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void requestNotifyPermission();
  }, []);

  return (
    <>
      <label className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3">
        <span className="text-sm font-semibold">เปิดรับงาน</span>
        <input
          type="checkbox"
          checked={available}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            startTransition(async () => {
              setError(null);
              try {
                await setRiderAvailability(next);
                setAvailable(next);
                if (next) {
                  notify(
                    "nanobike",
                    "เปิดรับงานแล้ว — ไปอัปเดตพิกัดที่แผนที่ด้วย",
                  );
                }
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "เปลี่ยนสถานะไม่สำเร็จ",
                );
              }
            });
          }}
        />
      </label>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <JobRoadmap status={available ? "pending_rider" : "going_to_shop"} role="rider" />

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
    </>
  );
}
