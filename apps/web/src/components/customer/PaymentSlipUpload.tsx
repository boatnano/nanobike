"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitPaymentSlip } from "@/app/customer/actions";
import { createClient } from "@/lib/supabase/client";

export function PaymentSlipUpload({
  jobId,
  goodsConfirmed,
  deliveryFee,
  promptpayId,
  payDeadlineAt,
}: {
  jobId: string;
  goodsConfirmed: number;
  deliveryFee: number;
  promptpayId: string | null;
  payDeadlineAt: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const total = Number(goodsConfirmed) + Number(deliveryFee || 0);

  return (
    <section className="mt-4 space-y-3 rounded-2xl border-2 border-[var(--ink)] bg-white p-4 text-sm">
      <p className="font-display text-lg font-bold">โอนเงิน + อัปสลิป</p>
      <p>
        ค่าของ {goodsConfirmed}฿ + ค่าส่ง {deliveryFee}฿ ={" "}
        <strong>{total}฿</strong>
      </p>
      {promptpayId ? (
        <p>
          พร้อมเพย์ไรเดอร์: <strong>{promptpayId}</strong>
        </p>
      ) : (
        <p className="text-[var(--muted)]">
          ไรเดอร์ยังไม่ได้ใส่พร้อมเพย์ — โอนตามที่ตกลงแล้วอัปสลิปได้
        </p>
      )}
      {payDeadlineAt ? (
        <p className="text-xs text-[var(--muted)]">
          โอนภายใน {new Date(payDeadlineAt).toLocaleTimeString("th-TH")}
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--muted)]">
          รูปสลิปโอน (JPG/PNG)
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={pending}
          className="w-full text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError(null);
            startTransition(async () => {
              try {
                if (file.size > 5 * 1024 * 1024) {
                  throw new Error("ไฟล์ใหญ่เกิน 5MB");
                }
                const supabase = createClient();
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error("กรุณาเข้าสู่ระบบใหม่");

                const ext =
                  file.type === "image/png"
                    ? "png"
                    : file.type === "image/webp"
                      ? "webp"
                      : "jpg";
                const path = `${user.id}/${jobId}/${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                  .from("job-proofs")
                  .upload(path, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                  });
                if (uploadError) throw new Error(uploadError.message);

                const { data: pub } = supabase.storage
                  .from("job-proofs")
                  .getPublicUrl(path);

                await submitPaymentSlip(jobId, pub.publicUrl);
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "อัปสลิปไม่สำเร็จ",
                );
              }
            });
          }}
        />
      </label>
      {pending ? (
        <p className="text-xs text-[var(--muted)]">กำลังอัปโหลด...</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
