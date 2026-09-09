"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelShopUnavailable,
  submitGoodsQuote,
} from "@/app/rider/job-actions";

export function RiderQuotePanel({
  jobId,
  shoppingList,
  goodsBudget,
}: {
  jobId: string;
  shoppingList: string;
  goodsBudget?: number | null;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--wash)] p-3">
      <p className="text-sm font-semibold">สรุปยอดค่าของที่ร้าน</p>
      <p className="text-xs text-[var(--muted)] line-clamp-3">รายการ: {shoppingList}</p>
      {goodsBudget != null ? (
        <p className="text-xs text-[var(--muted)]">งบลูกค้าคร่าวๆ: {goodsBudget}฿</p>
      ) : null}
      <label className="block text-sm">
        ยอดค่าของ (บาท)
        <input
          type="number"
          min={0}
          step="0.01"
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="เช่น 120"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={pending || !amount}
        className="w-full rounded-xl bg-[var(--accent)] px-3 py-3 text-sm font-semibold disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              await submitGoodsQuote(jobId, Number(amount));
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "ส่งยอดไม่สำเร็จ");
            }
          })
        }
      >
        {pending ? "กำลังส่ง..." : "ส่งยอดให้ลูกค้ายืนยัน"}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={pending}
          className="rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-xs font-medium disabled:opacity-50"
          onClick={() =>
            startTransition(async () => {
              try {
                await cancelShopUnavailable(jobId, "shop_closed");
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "ไม่สำเร็จ");
              }
            })
          }
        >
          ร้านปิด
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-xs font-medium disabled:opacity-50"
          onClick={() =>
            startTransition(async () => {
              try {
                await cancelShopUnavailable(jobId, "out_of_stock");
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "ไม่สำเร็จ");
              }
            })
          }
        >
          ของหมด
        </button>
      </div>
    </div>
  );
}
