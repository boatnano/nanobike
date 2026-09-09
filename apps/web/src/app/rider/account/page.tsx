import Link from "next/link";
import { PromptPayForm } from "@/components/rider/PromptPayForm";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireRiderActor } from "@/lib/auth";
import { BRAND } from "@/lib/constants";

export default async function RiderAccountPage() {
  const { supabase, profile } = await requireRiderActor();
  const { data: rider } = await supabase
    .from("rider_profiles")
    .select("promptpay_id, approval_status, is_available")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <RoleModeNav current="rider" />
      <Link href="/rider" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">บัญชีของฉัน</h1>
      <p className="text-sm text-[var(--muted)]">{BRAND.nameTh} · ไรเดอร์</p>

      <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3 text-sm">
        <p>
          <span className="text-[var(--muted)]">ชื่อ: </span>
          {profile.full_name}
        </p>
        <p>
          <span className="text-[var(--muted)]">เบอร์: </span>
          {profile.phone}
        </p>
        <p>
          <span className="text-[var(--muted)]">สถานะอนุมัติ: </span>
          {rider?.approval_status ?? "—"}
        </p>
      </section>

      <PromptPayForm initialId={rider?.promptpay_id ?? null} />

      <ul className="mt-6 space-y-3 text-sm">
        {["คะแนน / งานสำเร็จ", "ร้านที่ฉันส่ง", "เปลี่ยนรหัสผ่าน"].map((item) => (
          <li
            key={item}
            className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3 text-[var(--muted)]"
          >
            {item} (เร็วๆ นี้)
          </li>
        ))}
      </ul>
    </main>
  );
}
