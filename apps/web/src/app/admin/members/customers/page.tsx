import Link from "next/link";

export default function AdminCustomersPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
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
        <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
          เชื่อม Supabase แล้วรายการลูกค้าจะขึ้นที่นี่
        </p>
      </div>
    </main>
  );
}
