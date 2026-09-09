import Link from "next/link";
import { AdminMemberActions } from "@/components/AdminMemberActions";
import { RoleModeNav } from "@/components/RoleModeNav";
import { accountLabel, approvalLabel, requireAdmin } from "@/lib/admin";

type RiderRow = {
  id: string;
  full_name: string;
  phone: string;
  account_status: string;
  role: string;
  rider_profiles:
    | {
        approval_status: string;
        rating_avg: number | string;
        rating_count: number;
      }
    | {
        approval_status: string;
        rating_avg: number | string;
        rating_count: number;
      }[]
    | null;
};

function riderProfile(row: RiderRow) {
  const rp = row.rider_profiles;
  if (!rp) return null;
  return Array.isArray(rp) ? rp[0] ?? null : rp;
}

export default async function AdminRidersPage() {
  const { supabase } = await requireAdmin();

  const { data: riders, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, account_status, role, rider_profiles!inner(approval_status, rating_avg, rating_count)",
    )
    .order("created_at", { ascending: false });

  const riderIds = (riders ?? []).map((r) => r.id);
  const pendingPins = new Map<string, number>();

  if (riderIds.length > 0) {
    const { data: earnings } = await supabase
      .from("shop_earnings")
      .select("rider_id")
      .in("rider_id", riderIds)
      .in("status", ["pending_review", "confirmed"]);

    for (const row of earnings ?? []) {
      pendingPins.set(row.rider_id, (pendingPins.get(row.rider_id) ?? 0) + 1);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <RoleModeNav current="admin" />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">สมาชิก · ไรเดอร์</h1>
          <p className="text-sm text-[var(--muted)]">อนุมัติ / พัก / แบน เป็นรายเคส</p>
        </div>
        <nav className="flex gap-3 text-sm font-medium">
          <Link href="/admin/members/customers" className="underline">
            ลูกค้า
          </Link>
          <span className="rounded-full bg-[var(--accent)] px-3 py-1">ไรเดอร์</span>
        </nav>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/85">
        <div className="grid grid-cols-5 gap-2 border-b border-[var(--line)] bg-[var(--wash)] px-3 py-2 text-xs font-semibold">
          <span>ชื่อ</span>
          <span>เบอร์</span>
          <span>สถานะ</span>
          <span>คะแนน</span>
          <span>หมุดรอจ่าย</span>
        </div>

        {error ? (
          <p className="px-4 py-8 text-center text-sm text-red-600">{error.message}</p>
        ) : !riders?.length ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
            ยังไม่มีไรเดอร์ในระบบ
          </p>
        ) : (
          <ul>
            {(riders as RiderRow[]).map((rider) => {
              const rp = riderProfile(rider);
              const approval = rp?.approval_status ?? "pending";
              const ratingAvg = Number(rp?.rating_avg ?? 0);
              const ratingCount = rp?.rating_count ?? 0;

              return (
                <li
                  key={rider.id}
                  className="grid grid-cols-5 gap-2 border-b border-[var(--line)] px-3 py-3 text-sm last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {rider.full_name}
                      {rider.role === "admin" ? (
                        <span className="ml-1 text-[11px] text-[var(--muted)]">(admin)</span>
                      ) : null}
                    </p>
                    <AdminMemberActions
                      userId={rider.id}
                      kind="rider"
                      accountStatus={rider.account_status}
                      approvalStatus={approval}
                    />
                  </div>
                  <span className="pt-0.5">{rider.phone}</span>
                  <div className="pt-0.5 text-xs leading-5">
                    <p>{approvalLabel(approval)}</p>
                    <p className="text-[var(--muted)]">
                      บัญชี: {accountLabel(rider.account_status)}
                    </p>
                  </div>
                  <span className="pt-0.5">
                    {ratingCount > 0 ? `${ratingAvg.toFixed(1)} (${ratingCount})` : "—"}
                  </span>
                  <span className="pt-0.5">{pendingPins.get(rider.id) ?? 0}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
