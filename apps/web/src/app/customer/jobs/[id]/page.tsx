import Link from "next/link";
import { notFound } from "next/navigation";
import { JobRoadmap } from "@/components/JobRoadmap";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireCustomerActor } from "@/lib/auth";
import { roadmapHint } from "@/lib/roadmap";

export default async function CustomerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireCustomerActor();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (!job) notFound();

  let riderName: string | null = null;
  if (job.rider_id && job.status !== "pending_rider") {
    const { data: rider } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", job.rider_id)
      .maybeSingle();
    riderName = rider ? `${rider.full_name} · ${rider.phone}` : null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="customer" />
      <Link href="/customer/jobs" className="text-sm text-[var(--muted)]">
        ← งานของฉัน
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">{job.shop_name}</h1>
      <p className="text-sm text-[var(--muted)]">{roadmapHint(job.status, "customer")}</p>

      <div className="mt-4">
        <JobRoadmap status={job.status} role="customer" />
      </div>

      <section className="mt-4 space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4 text-sm">
        <p>
          <span className="text-[var(--muted)]">รายการ: </span>
          {job.shopping_list}
        </p>
        <p>
          <span className="text-[var(--muted)]">จุดส่ง: </span>
          {job.dropoff_address}
        </p>
        <p>
          <span className="text-[var(--muted)]">ค่าส่ง: </span>
          <strong>{job.delivery_fee}฿</strong>
          {job.distance_source === "straight" ? " (ระยะประมาณ)" : ""}
        </p>
        {job.goods_budget != null ? (
          <p>
            <span className="text-[var(--muted)]">งบค่าของ: </span>
            {job.goods_budget}฿
          </p>
        ) : null}
        {riderName ? (
          <p>
            <span className="text-[var(--muted)]">ไรเดอร์: </span>
            {riderName}
          </p>
        ) : (
          <p className="text-[var(--muted)]">
            รอไรเดอร์รับงาน
            {job.accept_deadline_at
              ? ` (ถึง ${new Date(job.accept_deadline_at).toLocaleTimeString("th-TH")})`
              : ""}
          </p>
        )}
      </section>
    </main>
  );
}
