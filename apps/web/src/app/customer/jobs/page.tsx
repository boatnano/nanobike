import Link from "next/link";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireCustomerActor } from "@/lib/auth";
import { roadmapHint } from "@/lib/roadmap";

export default async function CustomerJobsPage() {
  const { supabase, profile } = await requireCustomerActor();

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, shop_name, status, delivery_fee, shopping_list, created_at, accept_deadline_at",
    )
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="customer" />
      <Link href="/customer" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">งานของฉัน</h1>

      <ul className="mt-4 space-y-3">
        {(jobs ?? []).map((job) => (
          <li key={job.id}>
            <Link
              href={`/customer/jobs/${job.id}`}
              className="block rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{job.shop_name}</p>
                <p className="text-sm font-bold">{job.delivery_fee ?? "—"}฿</p>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                {job.shopping_list}
              </p>
              <p className="mt-2 text-xs font-medium">
                {roadmapHint(job.status, "customer")}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {!jobs?.length ? (
        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          ยังไม่มีงาน —{" "}
          <Link href="/customer/new" className="underline">
            เริ่มฝากซื้อ
          </Link>
        </p>
      ) : null}
    </main>
  );
}
