"use client";

import { useTransition } from "react";
import { acceptJob, rejectJob } from "@/app/rider/job-actions";

export function RiderJobActions({ jobId }: { jobId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={pending}
        className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await acceptJob(jobId);
            } catch (err) {
              alert(err instanceof Error ? err.message : "รับงานไม่สำเร็จ");
            }
          })
        }
      >
        รับงาน
      </button>
      <button
        type="button"
        disabled={pending}
        className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            try {
              await rejectJob(jobId);
            } catch (err) {
              alert(err instanceof Error ? err.message : "ปฏิเสธไม่สำเร็จ");
            }
          })
        }
      >
        ปฏิเสธ
      </button>
    </div>
  );
}
