"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { normalizePhone, phoneToAuthEmail } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("กรุณายอมรับกติกาชุมชน");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const normalized = normalizePhone(phone);

      const { error: regError } = await supabase.rpc("register_member", {
        p_phone: normalized,
        p_password: password,
        p_full_name: fullName.trim(),
      });
      if (regError) throw new Error(regError.message);

      const email = phoneToAuthEmail(normalized);
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) throw signError;

      router.push("/customer");
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "สมัครไม่สำเร็จ";
      setError(raw.replace(/^.*ERROR:\s*/i, "").split("\n")[0]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <SiteHeader />
      <form
        onSubmit={onSubmit}
        className="mx-auto mt-8 w-full max-w-md space-y-4 rounded-2xl border border-[var(--line)] bg-white/85 p-6"
      >
        <h1 className="font-display text-2xl font-bold">สมัครสมาชิก</h1>
        <p className="text-sm text-[var(--muted)]">
          สมัครครั้งแรกเป็นสมาชิกทั่วไป (ลูกค้า) ก่อน แล้วค่อยสมัครเป็นไรเดอร์ในบัญชีได้ภายหลัง
        </p>
        <label className="block text-sm">
          ชื่อที่แสดง
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          เบอร์โทร
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxx"
            required
          />
        </label>
        <label className="block text-sm">
          รหัสผ่าน
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            ยอมรับ{" "}
            <Link href="/rules" className="underline" target="_blank">
              กติกาชุมชน nanobike
            </Link>
          </span>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          disabled={loading}
          className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>
        <p className="text-center text-sm text-[var(--muted)]">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </main>
  );
}
