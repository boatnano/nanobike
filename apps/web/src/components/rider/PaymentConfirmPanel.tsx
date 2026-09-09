"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  confirmPaymentReceived,
  rejectPaymentSlip,
} from "@/app/rider/job-actions";

export function PaymentConfirmPanel({
  jobId,
  slipUrl,
  goodsConfirmed,
  deliveryFee,
}: {
  jobId: string;
  slipUrl: string | null;
  goodsConfirmed: number | null;
  deliveryFee: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const goods = Number(goodsConfirmed ?? 0);
  const fee = Number(deliveryFee ?? 0);

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--wash)] p-3 text-sm">
      <p className="font-semibold">ตรวจสลิปโอน</p>
      <p>
        ค่าของ {goods}฿ + ค่าส่ง {fee}฿ = <strong>{goods + fee}฿</strong>
      </p>
      {slipUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <a href={slipUrl} target="_blank" rel="noreferrer" className="block">
          <img
            src={slipUrl}
            alt="สลิปโอน"
            className="max-h-48 w-full rounded-lg object-contain bg-white"
          />
          <span className="mt-1 block text-xs underline">เปิดรูปเต็ม</span>
        </a>
      ) : (
        <p className="text-[var(--muted)]">ยังไม่มีรูปสลิป</p>
      )}
      <button
        type="button"
        disabled={pending || !slipUrl}
        className="w-full rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await confirmPaymentReceived(jobId);
              router.refresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "ยืนยันไม่สำเร็จ");
            }
          })
        }
      >
        {pending ? "กำลังบันทึก..." : "ได้รับเงินแล้ว — เริ่มซื้อของ"}
      </button>
      <button
        type="button"
        disabled={pending}
        className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-700 disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await rejectPaymentSlip(jobId, "สลิปไม่ถูกต้อง");
              router.refresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "ปัดสลิปไม่สำเร็จ");
            }
          })
        }
      >
        สลิปไม่โอเค — ให้ลูกค้าโอนใหม่
      </button>
    </div>
  );
}
