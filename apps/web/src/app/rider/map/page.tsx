import Link from "next/link";
import { RoleModeNav } from "@/components/RoleModeNav";
import { RiderMapClient } from "@/components/rider/RiderMapClient";
import { requireRiderActor } from "@/lib/auth";

export default async function RiderMapPage() {
  const { supabase, profile } = await requireRiderActor();

  const [{ data: loc }, { data: rider }] = await Promise.all([
    supabase
      .from("rider_locations")
      .select("lat, lng")
      .eq("rider_id", profile.id)
      .maybeSingle(),
    supabase
      .from("rider_profiles")
      .select("is_available")
      .eq("user_id", profile.id)
      .maybeSingle(),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="rider" />
      <Link href="/rider" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <RiderMapClient
        initialLat={loc?.lat ?? null}
        initialLng={loc?.lng ?? null}
        initiallyAvailable={Boolean(rider?.is_available)}
      />
    </main>
  );
}
