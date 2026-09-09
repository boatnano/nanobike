import Link from "next/link";
import { RoleModeNav } from "@/components/RoleModeNav";
import { RiderHomeClient } from "@/components/RiderHomeClient";
import { requireRiderActor } from "@/lib/auth";
import { BRAND } from "@/lib/constants";

export default async function RiderHomePage() {
  const { supabase, profile } = await requireRiderActor();
  const { data: rider } = await supabase
    .from("rider_profiles")
    .select("is_available")
    .eq("user_id", profile.id)
    .maybeSingle();

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
      <RiderHomeClient initiallyAvailable={Boolean(rider?.is_available)} />
    </main>
  );
}
