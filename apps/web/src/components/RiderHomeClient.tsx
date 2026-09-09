"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  getRiderInbox,
  setRiderAvailability,
  type RiderInboxJob,
} from "@/app/rider/actions";
import { JobRoadmap } from "@/components/JobRoadmap";
import { NavigateToDropoffButton, NavigateToShopButton } from "@/components/rider/NavigateButtons";
import { RiderJobActions } from "@/components/rider/RiderJobActions";
import { notify, requestNotifyPermission } from "@/lib/notify";

const POLL_MS = 3000;

function secondsLeft(deadline: string | null) {
  if (!deadline) return null;
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
}

export function RiderHomeClient({
  initiallyAvailable,
}: {
  initiallyAvailable: boolean;
}) {
  const [available, setAvailable] = useState(initiallyAvailable);
  const [incoming, setIncoming] = useState<RiderInboxJob[]>([]);
  const [active, setActive] = useState<RiderInboxJob | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const knownIds = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    void requestNotifyPermission();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const inbox = await getRiderInbox();
        if (cancelled) return;

        setAvailable(inbox.available);
        setIncoming(inbox.incoming);
        setActive(inbox.active);
        setLastSync(new Date());
        setError(null);

        const ids = new Set(inbox.incoming.map((j) => j.id));
        if (!primed.current) {
          knownIds.current = ids;
          primed.current = true;
        } else {
          for (const job of inbox.incoming) {
            if (!knownIds.current.has(job.id)) {
              notify(
                "nanobike — มีงานเข้า!",
                `${job.shop_name} · ค่าส่ง ${job.delivery_fee ?? "—"}฿`,
              );
            }
          }
          knownIds.current = ids;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "รีเฟรชไม่สำเร็จ");
        }
      }
    }

    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const roadmapStatus = incoming.length
    ? "pending_rider"
    : active?.status ?? (available ? "pending_rider" : "going_to_shop");

  return (
    <>
      <div className="mb-3 flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>
          รีเฟรชอัตโนมัติทุก 3 วิ
          {lastSync
            ? ` · อัปเดตล่าสุด ${lastSync.toLocaleTimeString("th-TH")}`
            : ""}
        </span>
        <span
          className={
            available
              ? "rounded-full bg-[var(--accent)] px-2 py-0.5 font-semibold text-[var(--ink)]"
              : "rounded-full border border-[var(--line)] px-2 py-0.5"
          }
        >
          {available ? "เปิดรับงาน" : "ปิดรับงาน"}
        </span>
      </div>

      {incoming.length > 0 ? (
        <section className="mb-4 space-y-3 rounded-2xl border-2 border-[var(--ink)] bg-[var(--accent)]/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-lg font-bold">มีคำขอฝากซื้อเข้า!</p>
            <span className="rounded-full bg-[var(--ink)] px-2.5 py-1 text-xs font-semibold text-white">
              {incoming.length} งาน
            </span>
          </div>
          <p className="text-sm">ลูกค้าขอให้ไปซื้อของ — กดรับหรือปฏิเสธภายในเวลา</p>
          {incoming.map((job) => {
            const left = secondsLeft(job.accept_deadline_at);
            return (
              <div
                key={job.id}
                className="rounded-xl border border-[var(--line)] bg-white/90 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{job.shop_name}</p>
                  <p className="text-sm font-bold">{job.delivery_fee ?? "—"}฿</p>
                </div>
                <p className="mt-1 line-clamp-3 text-sm">{job.shopping_list}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{job.dropoff_address}</p>
                {left != null ? (
                  <p className="mt-2 text-xs font-semibold text-red-700">
                    เหลือเวลารับงาน ~{Math.floor(left / 60)}:
                    {String(left % 60).padStart(2, "0")} นาที
                  </p>
                ) : null}
                <RiderJobActions jobId={job.id} />
              </div>
            );
          })}
        </section>
      ) : (
        <section className="mb-4 rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
          {available
            ? "ยังไม่มีคำขอฝากซื้อเข้า — ระบบเช็คให้อัตโนมัติทุก 3 วินาที"
            : "เปิดรับงานเพื่อรอคำขอฝากซื้อจากลูกค้า"}
        </section>
      )}

      {active ? (
        <div className="mb-4 rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3">
          <p className="text-xs text-[var(--muted)]">งานปัจจุบัน</p>
          <p className="font-semibold">{active.shop_name}</p>
          <p className="text-sm">{active.shopping_list}</p>
          {(active.status === "going_to_shop" || active.status === "at_shop") && (
            <NavigateToShopButton
              lat={active.shop_lat}
              lng={active.shop_lng}
              shopName={active.shop_name}
            />
          )}
          {active.status === "delivering" ? (
            <NavigateToDropoffButton
              lat={active.dropoff_lat}
              lng={active.dropoff_lng}
            />
          ) : null}
          <Link
            href="/rider/jobs"
            className="mt-2 block text-center text-sm font-medium underline"
          >
            ดูรายละเอียดงาน
          </Link>
        </div>
      ) : null}

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
                    "เปิดรับงานแล้ว — รอคำขอฝากซื้อได้เลย",
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

      <JobRoadmap status={roadmapStatus} role="rider" />

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
          {incoming.length ? ` (${incoming.length} รอดู)` : ""}
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
