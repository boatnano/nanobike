"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateRiderPromptPay } from "@/app/rider/job-actions";

export function PromptPayForm({ initialId }: { initialId: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initialId ?? "");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="mt-4 space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        startTransition(async () => {
          try {
            await updateRiderPromptPay(value);
            setMsg("บันทึกพร้อมเพย์แล้ว");
            router.refresh();
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
          }
        });
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">เลขพร้อมเพย์</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="เบอร์โทรหรือเลขบัตร"
          className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก..." : "บันทึกพร้อมเพย์"}
      </button>
      {msg ? <p className="text-xs text-[var(--muted)]">{msg}</p> : null}
    </form>
  );
}
