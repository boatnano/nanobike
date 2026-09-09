import Link from "next/link";
import { RoleModeNav } from "@/components/RoleModeNav";
import { RiderHomeClient } from "@/components/RiderHomeClient";
import { BRAND } from "@/lib/constants";

export default function RiderHomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="rider" />
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            {BRAND.name} rider
          </p>
          <h1 className="font-display text-2xl font-bold">รับงาน</h1>
        </div>
        <Link href="/rider/account" className="text-sm font-medium underline">
          บัญชีของฉัน
        </Link>
      </header>
      <RiderHomeClient />
    </main>
  );
}
