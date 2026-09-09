"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRiderInbox, type RiderInboxJob } from "@/app/rider/actions";
import { ArriveAtShopButton } from "@/components/rider/ArriveAtShopButton";
import { DeliveryProgressButtons } from "@/components/rider/DeliveryProgressButtons";
import { NavigateToShopButton } from "@/components/rider/NavigateButtons";
import { PaymentConfirmPanel } from "@/components/rider/PaymentConfirmPanel";
import { RiderJobActions } from "@/components/rider/RiderJobActions";
import { RiderQuotePanel } from "@/components/rider/RiderQuotePanel";
import { roadmapHint } from "@/lib/roadmap";

const POLL_MS = 3000;

export function RiderJobsClient() {
  const [incoming, setIncoming] = useState<RiderInboxJob[]>([]);
  const [active, setActive] = useState<RiderInboxJob | null>(null);
  const [historyHint, setHistoryHint] = useState("กำลังโหลด...");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const inbox = await getRiderInbox();
        if (cancelled) return;
        setIncoming(inbox.incoming);
        setActive(inbox.active);
        setLastSync(new Date());
        setHistoryHint(
          inbox.incoming.length || inbox.active
            ? ""
            : "ยังไม่มีงาน — เปิดรับงานและอัปเดตพิกัดที่แผนที่",
        );
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "โหลดงานไม่สำเร็จ");
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

  const jobs = [...incoming, ...(active ? [active] : [])];

  return (
    <>
      <Link href="/rider" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">งานเข้า / งานปัจจุบัน</h1>
      <p className="mt-1 text-[11px] text-[var(--muted)]">
        รีเฟรชทุก 3 วิ
        {lastSync ? ` · ${lastSync.toLocaleTimeString("th-TH")}` : ""}
      </p>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {incoming.length > 0 ? (
        <div className="mt-4 rounded-2xl border-2 border-[var(--ink)] bg-[var(--accent)]/35 px-3 py-2 text-sm font-semibold">
          มีคำขอฝากซื้อรอรับ {incoming.length} งาน
        </div>
      ) : null}

      <ul className="mt-4 space-y-3">
        {jobs.map((job) => (
          <li
            key={job.id}
            className={`rounded-2xl border px-4 py-3 ${
              job.status === "pending_rider"
                ? "border-[var(--ink)] bg-[var(--accent)]/25"
                : "border-[var(--line)] bg-white/85"
            }`}
          >
            {job.status === "pending_rider" ? (
              <p className="mb-2 text-xs font-bold tracking-wide uppercase">
                คำขอฝากซื้อเข้าใหม่
              </p>
            ) : null}
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{job.shop_name}</p>
              <p className="text-sm font-bold">{job.delivery_fee ?? "—"}฿</p>
            </div>
            <p className="mt-1 line-clamp-2 text-sm">{job.shopping_list}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{job.dropoff_address}</p>
            <p className="mt-2 text-xs font-medium">
              {roadmapHint(job.status, "rider")}
            </p>
            {job.status === "pending_rider" ? (
              <RiderJobActions jobId={job.id} />
            ) : null}
            {job.status === "going_to_shop" ? (
              <>
                <NavigateToShopButton
                  lat={job.shop_lat}
                  lng={job.shop_lng}
                  shopName={job.shop_name}
                />
                <ArriveAtShopButton jobId={job.id} />
              </>
            ) : null}
            {job.status === "at_shop" ? (
              <RiderQuotePanel
                jobId={job.id}
                shoppingList={job.shopping_list}
                goodsBudget={job.goods_budget}
              />
            ) : null}
            {job.status === "quote_pending" ? (
              <p className="mt-3 rounded-xl bg-[var(--wash)] px-3 py-2 text-sm">
                ส่งยอด {job.goods_quote ?? "—"}฿ แล้ว — รอลูกค้ายืนยัน
              </p>
            ) : null}
            {job.status === "awaiting_payment" ? (
              <p className="mt-3 rounded-xl bg-[var(--wash)] px-3 py-2 text-sm">
                รอลูกค้าโอน (ค่าของ {job.goods_confirmed ?? "—"}฿ + ค่าส่ง{" "}
                {job.delivery_fee ?? "—"}฿)
              </p>
            ) : null}
            {job.status === "paid_pending" ? (
              <PaymentConfirmPanel
                jobId={job.id}
                slipUrl={job.payment_slip_url}
                goodsConfirmed={job.goods_confirmed}
                deliveryFee={job.delivery_fee}
              />
            ) : null}
            {job.status === "shopping" || job.status === "delivering" ? (
              <DeliveryProgressButtons
                jobId={job.id}
                status={job.status}
                dropoffLat={job.dropoff_lat}
                dropoffLng={job.dropoff_lng}
              />
            ) : null}
          </li>
        ))}
      </ul>

      {!jobs.length ? (
        <p className="mt-8 text-center text-sm text-[var(--muted)]">{historyHint}</p>
      ) : null}
    </>
  );
}
