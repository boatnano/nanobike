"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitPaymentSlip } from "@/app/customer/actions";
import { createClient } from "@/lib/supabase/client";

function promptpayQrUrl(id: string, amount: number) {
  const cleaned = id.replace(/\D/g, "");
  if (!cleaned) return null;
  const amt = Math.round(amount * 100) / 100;
  return `https://promptpay.io/${cleaned}/${amt}.png`;
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-xs font-medium"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          alert(value);
        }
      }}
    >
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}

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
  const total = Math.round((Number(goodsConfirmed) + Number(deliveryFee || 0)) * 100) / 100;
  const qrUrl = promptpayId ? promptpayQrUrl(promptpayId, total) : null;

  return (
    <section className="mt-4 space-y-4 rounded-2xl border-2 border-[var(--ink)] bg-white p-4 text-sm">
      <div>
        <p className="font-display text-lg font-bold">โอนเงินให้ไรเดอร์</p>
        <p className="text-xs text-[var(--muted)]">
          โอนตรงเข้าพร้อมเพย์ไรเดอร์ แล้วอัปสลิปเพื่อให้ไรเดอร์เริ่มซื้อของ
        </p>
      </div>

      <div className="rounded-xl bg-[var(--wash)] px-4 py-3">
        <p className="text-xs text-[var(--muted)]">ยอดที่ต้องโอน</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="font-display text-3xl font-extrabold tabular-nums">
            {total.toLocaleString("th-TH", {
              minimumFractionDigits: total % 1 ? 2 : 0,
              maximumFractionDigits: 2,
            })}
            <span className="ml-1 text-lg">฿</span>
          </p>
          <CopyButton label="คัดลอกยอด" value={String(total)} />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          ค่าของ {goodsConfirmed}฿ + ค่าส่ง {deliveryFee}฿
        </p>
      </div>

      {promptpayId ? (
        <div className="space-y-3 rounded-xl border border-[var(--line)] p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[var(--muted)]">พร้อมเพย์ไรเดอร์</p>
              <p className="font-semibold tracking-wide">{promptpayId}</p>
            </div>
            <CopyButton label="คัดลอกเลข" value={promptpayId.replace(/\D/g, "")} />
          </div>
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="QR พร้อมเพย์"
              className="mx-auto w-52 rounded-xl bg-white"
            />
          ) : null}
          <p className="text-center text-xs text-[var(--muted)]">
            สแกน QR หรือโอนด้วยเลขพร้อมเพย์ด้านบน ตามยอดเป๊ะ
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          ไรเดอร์ยังไม่ได้ใส่พร้อมเพย์ในโปรไฟล์ — ติดต่อไรเดอร์ขอเลขโอนก่อน
          แล้วอัปสลิปได้หลังโอน
        </p>
      )}

      {payDeadlineAt ? (
        <p className="text-xs text-[var(--muted)]">
          โอนภายใน {new Date(payDeadlineAt).toLocaleTimeString("th-TH")}
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-semibold">
          ขั้นถัดไป: อัปรูปสลิปโอน
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          capture="environment"
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
                    contentType: file.type || "image/jpeg",
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
        <p className="text-xs text-[var(--muted)]">กำลังอัปโหลดสลิป...</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
