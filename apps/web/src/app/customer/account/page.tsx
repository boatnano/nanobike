import Link from "next/link";
import { ApplyRiderButton } from "@/components/customer/ApplyRiderButton";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireCustomerActor } from "@/lib/auth";
import { BRAND } from "@/lib/constants";

export default async function CustomerAccountPage() {
  const { supabase, profile } = await requireCustomerActor();
  const { data: rider } = await supabase
    .from("rider_profiles")
    .select("approval_status")
    .eq("user_id", profile.id)
    .maybeSingle();

  const riderStatus =
    rider?.approval_status === "approved" ||
    rider?.approval_status === "pending" ||
    rider?.approval_status === "rejected"
      ? rider.approval_status
      : "none";

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <RoleModeNav current="customer" />
      <Link href="/customer" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">บัญชีของฉัน</h1>
      <p className="text-sm text-[var(--muted)]">{BRAND.nameTh} · สมาชิก</p>

      <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3 text-sm">
        <p>
          <span className="text-[var(--muted)]">ชื่อ: </span>
          {profile.full_name}
        </p>
        <p>
          <span className="text-[var(--muted)]">เบอร์: </span>
          {profile.phone}
        </p>
      </section>

      <section className="mt-4 space-y-2 rounded-2xl border border-[var(--line)] bg-white/85 p-4">
        <p className="font-semibold">อยากรับงานฝากซื้อ?</p>
        <p className="text-sm text-[var(--muted)]">
          สมัครเป็นไรเดอร์ในระบบ แล้วรอแอดมินอนุมัติก่อนเปิดรับงาน
        </p>
        <ApplyRiderButton status={riderStatus} />
        {riderStatus === "approved" || profile.role === "rider" || profile.role === "admin" ? (
          <Link href="/rider" className="block text-center text-sm font-medium underline">
            ไปหน้าไรเดอร์
          </Link>
        ) : null}
      </section>

      <ul className="mt-6 space-y-3 text-sm">
        {[
          "จุดส่งที่บันทึก",
          "ประวัติงาน",
          "เปลี่ยนรหัสผ่าน",
          "กติกาชุมชน",
          "สนับสนุนระบบ",
        ].map((item) => (
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
