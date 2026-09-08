"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { normalizePhone, phoneToAuthEmail } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const email = phoneToAuthEmail(normalizePhone(phone));
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) throw signError;

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("ไม่พบผู้ใช้");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (profile?.role === "rider") router.push("/rider");
      else if (profile?.role === "admin") router.push("/admin/members/riders");
      else router.push("/customer");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
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
        <h1 className="font-display text-2xl font-bold">เข้าสู่ระบบ</h1>
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
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          disabled={loading}
          className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
        <p className="text-center text-sm text-[var(--muted)]">
          ยังไม่มีบัญชี? <Link href="/signup" className="underline">สมัคร</Link>
        </p>
      </form>
    </main>
  );
}
