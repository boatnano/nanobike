"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { normalizePhone, phoneToAuthEmail } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "rider" ? "rider" : "customer";

  const [role, setRole] = useState<"customer" | "rider">(initialRole);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (role === "rider" ? "สมัครไรเดอร์" : "สมัครลูกค้า"),
    [role],
  );

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
      const email = phoneToAuthEmail(normalized);
      const { data, error: signError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signError) throw signError;
      const uid = data.user?.id;
      if (!uid) throw new Error("สมัครไม่สำเร็จ");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: uid,
        role,
        full_name: fullName.trim(),
        phone: normalized,
        accepted_rules_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;

      if (role === "rider") {
        const { error: riderError } = await supabase.from("rider_profiles").insert({
          user_id: uid,
          approval_status: "pending",
        });
        if (riderError) throw riderError;
        router.push("/rider");
      } else {
        router.push("/customer");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 w-full max-w-md space-y-4 rounded-2xl border border-[var(--line)] bg-white/85 p-6"
    >
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <div className="flex gap-2">
        {(["customer", "rider"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold ${
              role === r ? "bg-[var(--accent)]" : "bg-[var(--wash)]"
            }`}
          >
            {r === "customer" ? "ลูกค้า" : "ไรเดอร์"}
          </button>
        ))}
      </div>
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
        {loading ? "กำลังสมัคร..." : "สมัครใช้งาน"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        มีบัญชีแล้ว? <Link href="/login" className="underline">เข้าสู่ระบบ</Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <main>
      <SiteHeader />
      <Suspense fallback={<p className="p-6 text-center">โหลด...</p>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
