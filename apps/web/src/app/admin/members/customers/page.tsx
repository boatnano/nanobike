import Link from "next/link";
import { AdminMemberActions } from "@/components/AdminMemberActions";
import { RoleModeNav } from "@/components/RoleModeNav";
import { accountLabel, requireAdmin } from "@/lib/admin";

export default async function AdminCustomersPage() {
  const { supabase } = await requireAdmin();

  const { data: customers, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, account_status, role, created_at")
    .in("role", ["customer", "admin"])
    .order("created_at", { ascending: false });

  const customerIds = (customers ?? []).map((c) => c.id);
  const completed = new Map<string, number>();
  const riskFlags = new Map<string, number>();

  if (customerIds.length > 0) {
    const [{ data: doneJobs }, { data: problemJobs }] = await Promise.all([
      supabase
        .from("jobs")
        .select("customer_id")
        .in("customer_id", customerIds)
        .eq("status", "completed"),
      supabase
        .from("jobs")
        .select("customer_id")
        .in("customer_id", customerIds)
        .not("cancel_reason", "is", null),
    ]);

    for (const row of doneJobs ?? []) {
      completed.set(row.customer_id, (completed.get(row.customer_id) ?? 0) + 1);
    }
    for (const row of problemJobs ?? []) {
      riskFlags.set(row.customer_id, (riskFlags.get(row.customer_id) ?? 0) + 1);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <RoleModeNav current="admin" />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">สมาชิก · ลูกค้า</h1>
          <p className="text-sm text-[var(--muted)]">ดูสถิติธงเสี่ยง / พักแบนรายเคส</p>
        </div>
        <nav className="flex gap-3 text-sm font-medium">
          <span className="rounded-full bg-[var(--accent)] px-3 py-1">ลูกค้า</span>
          <Link href="/admin/members/riders" className="underline">
            ไรเดอร์
          </Link>
        </nav>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/85">
        <div className="grid grid-cols-5 gap-2 border-b border-[var(--line)] bg-[var(--wash)] px-3 py-2 text-xs font-semibold">
          <span>ชื่อ</span>
          <span>เบอร์</span>
          <span>สำเร็จ</span>
          <span>ธงเสี่ยง</span>
          <span>สถานะ</span>
        </div>

        {error ? (
          <p className="px-4 py-8 text-center text-sm text-red-600">{error.message}</p>
        ) : !customers?.length ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
            ยังไม่มีลูกค้าในระบบ
          </p>
        ) : (
          <ul>
            {customers.map((customer) => (
              <li
                key={customer.id}
                className="grid grid-cols-5 gap-2 border-b border-[var(--line)] px-3 py-3 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium">
                    {customer.full_name}
                    {customer.role === "admin" ? (
                      <span className="ml-1 text-[11px] text-[var(--muted)]">(admin)</span>
                    ) : null}
                  </p>
                  <AdminMemberActions
                    userId={customer.id}
                    kind="customer"
                    accountStatus={customer.account_status}
                  />
                </div>
                <span className="pt-0.5">{customer.phone}</span>
                <span className="pt-0.5">{completed.get(customer.id) ?? 0}</span>
                <span className="pt-0.5">{riskFlags.get(customer.id) ?? 0}</span>
                <span className="pt-0.5">{accountLabel(customer.account_status)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
