"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markDelivered, markShoppingDone } from "@/app/rider/job-actions";
import { NavigateToDropoffButton } from "@/components/rider/NavigateButtons";

export function DeliveryProgressButtons({
  jobId,
  status,
  dropoffLat,
  dropoffLng,
}: {
  jobId: string;
  status: string;
  dropoffLat: number;
  dropoffLng: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "shopping") {
    return (
      <button
        type="button"
        disabled={pending}
        className="mt-3 w-full rounded-xl bg-[var(--accent)] px-3 py-3 text-sm font-semibold disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await markShoppingDone(jobId);
              router.refresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ");
            }
          })
        }
      >
        {pending ? "กำลังบันทึก..." : "ซื้อของครบ — เริ่มส่ง"}
      </button>
    );
  }

  if (status === "delivering") {
    return (
      <>
        <NavigateToDropoffButton lat={dropoffLat} lng={dropoffLng} />
        <button
          type="button"
          disabled={pending}
          className="mt-3 w-full rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
          onClick={() =>
            startTransition(async () => {
              try {
                await markDelivered(jobId);
                router.refresh();
              } catch (err) {
                alert(err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ");
              }
            })
          }
        >
          {pending ? "กำลังบันทึก..." : "ส่งถึงแล้ว — จบงาน"}
        </button>
      </>
    );
  }

  return null;
}
