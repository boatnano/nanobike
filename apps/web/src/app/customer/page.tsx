import Link from "next/link";
import { JobRoadmap } from "@/components/JobRoadmap";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireCustomerActor } from "@/lib/auth";
import { BRAND } from "@/lib/constants";

export default async function CustomerHomePage() {
  const { supabase, profile } = await requireCustomerActor();

  const { data: activeJob } = await supabase
    .from("jobs")
    .select("id, shop_name, status, delivery_fee")
    .eq("customer_id", profile.id)
    .not("status", "in", "(completed,cancelled,rejected,cancelled_shop)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="customer" />
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            {BRAND.name}
          </p>
          <h1 className="font-display text-2xl font-bold">ฝากซื้อ</h1>
        </div>
        <Link href="/customer/account" className="text-sm font-medium underline">
          บัญชีของฉัน
        </Link>
      </header>

      {activeJob ? (
        <Link
          href={`/customer/jobs/${activeJob.id}`}
          className="mb-4 block rounded-[1.75rem] bg-white/50 p-2 ring-1 ring-[var(--line)]/50"
        >
          <div className="px-3 pt-2">
            <p className="text-xs text-[var(--muted)]">งานปัจจุบัน</p>
            <p className="font-semibold">{activeJob.shop_name}</p>
          </div>
          <div className="mt-2">
            <JobRoadmap status={activeJob.status} role="customer" />
          </div>
        </Link>
      ) : (
        <JobRoadmap status="pending_rider" role="customer" />
      )}

      <section className="mt-6 space-y-3">
        <Link
          href="/customer/new"
          className="block rounded-2xl bg-[var(--ink)] px-4 py-4 text-center text-sm font-semibold text-white"
        >
          เริ่มฝากซื้อ — ค้นหาร้าน
        </Link>
        <Link
          href="/customer/jobs"
          className="block rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 text-center text-sm font-semibold"
        >
          งานของฉัน
        </Link>
      </section>

      <p className="mt-6 text-sm text-[var(--muted)]">
        ลำดับ: ค้นร้าน → รายการฝากซื้อ → ยืนยันจุดส่ง → แมพไรเดอร์+ค่าส่ง → เลือกคน
      </p>
    </main>
  );
}
