"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markArrivedAtShop } from "@/app/rider/job-actions";

export function ArriveAtShopButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="mt-3 w-full rounded-xl bg-[var(--accent)] px-3 py-3 text-sm font-semibold disabled:opacity-50"
      onClick={() =>
        startTransition(async () => {
          try {
            await markArrivedAtShop(jobId);
            router.refresh();
          } catch (err) {
            alert(err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ");
          }
        })
      }
    >
      {pending ? "กำลังบันทึก..." : "ถึงร้านแล้ว"}
    </button>
  );
}
