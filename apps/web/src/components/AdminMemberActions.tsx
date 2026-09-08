"use client";

import { useTransition } from "react";
import { setAccountStatus, setRiderApproval } from "@/app/admin/actions";

type Props = {
  userId: string;
  kind: "rider" | "customer";
  accountStatus: string;
  approvalStatus?: string;
};

export function AdminMemberActions({
  userId,
  kind,
  accountStatus,
  approvalStatus,
}: Props) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        alert(err instanceof Error ? err.message : "ทำรายการไม่สำเร็จ");
      }
    });
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {kind === "rider" && approvalStatus !== "approved" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setRiderApproval(userId, "approved"))}
          className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
        >
          อนุมัติ
        </button>
      )}
      {kind === "rider" && approvalStatus === "pending" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setRiderApproval(userId, "rejected"))}
          className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] disabled:opacity-50"
        >
          ปฏิเสธ
        </button>
      )}
      {accountStatus === "active" ? (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() => setAccountStatus(userId, "suspended", "พักโดยแอดมิน"))
            }
            className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] disabled:opacity-50"
          >
            พัก
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() => setAccountStatus(userId, "banned", "แบนโดยแอดมิน"))
            }
            className="rounded-full border border-red-300 px-2.5 py-1 text-[11px] text-red-700 disabled:opacity-50"
          >
            แบน
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setAccountStatus(userId, "active"))}
          className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
        >
          ปลดสถานะ
        </button>
      )}
    </div>
  );
}
