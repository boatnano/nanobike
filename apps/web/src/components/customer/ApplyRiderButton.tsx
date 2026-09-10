"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function ApplyRiderButton({
  status,
}: {
  status: "none" | "pending" | "approved" | "rejected";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "approved") {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        บัญชีนี้เป็นไรเดอร์ที่อนุมัติแล้ว — ไปเมนูไรเดอร์ได้จากโหมดทดสอบ/ล็อกอินไรเดอร์
      </p>
    );
  }

  if (status === "pending") {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        ส่งคำขอเป็นไรเดอร์แล้ว — รอแอดมินอนุมัติ
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold disabled:opacity-50"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const supabase = createClient();
              const { error: rpcError } = await supabase.rpc("apply_rider");
              if (rpcError) throw new Error(rpcError.message);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "สมัครไรเดอร์ไม่สำเร็จ");
            }
          });
        }}
      >
        {pending
          ? "กำลังส่งคำขอ..."
          : status === "rejected"
            ? "สมัครไรเดอร์อีกครั้ง"
            : "สมัครเป็นไรเดอร์"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
