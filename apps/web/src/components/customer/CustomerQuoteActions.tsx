"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { confirmGoodsQuote, rejectGoodsQuote } from "@/app/customer/actions";

export function CustomerQuoteActions({
  jobId,
  goodsQuote,
  deliveryFee,
  quoteDeadlineAt,
}: {
  jobId: string;
  goodsQuote: number;
  deliveryFee: number;
  quoteDeadlineAt: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const total = Number(goodsQuote) + Number(deliveryFee || 0);

  return (
    <div className="mt-4 space-y-3 rounded-2xl border-2 border-[var(--ink)] bg-[var(--accent)]/30 p-4">
      <p className="font-display text-lg font-bold">ยืนยันยอดค่าของ</p>
      <div className="space-y-1 text-sm">
        <p>
          ค่าของ: <strong>{goodsQuote}฿</strong>
        </p>
        <p>
          ค่าส่ง: <strong>{deliveryFee}฿</strong>
        </p>
        <p className="text-base">
          รวมโอนประมาณ: <strong>{total}฿</strong>
        </p>
        {quoteDeadlineAt ? (
          <p className="text-xs text-[var(--muted)]">
            ยืนยันภายใน {new Date(quoteDeadlineAt).toLocaleTimeString("th-TH")}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await confirmGoodsQuote(jobId);
              router.refresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "ยืนยันไม่สำเร็จ");
            }
          })
        }
      >
        {pending ? "กำลังยืนยัน..." : "ยืนยันยอด — ไปโอนเงิน"}
      </button>
      <button
        type="button"
        disabled={pending}
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await rejectGoodsQuote(jobId);
              router.refresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "ส่งกลับไม่สำเร็จ");
            }
          })
        }
      >
        ไม่โอเค — ให้ไรเดอร์สรุปยอดใหม่
      </button>
    </div>
  );
}
