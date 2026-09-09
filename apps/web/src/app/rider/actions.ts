"use server";

import { revalidatePath } from "next/cache";
import { requireRiderActor } from "@/lib/auth";

export async function setRiderAvailability(isAvailable: boolean) {
  const { supabase, profile } = await requireRiderActor();

  const { data: rider } = await supabase
    .from("rider_profiles")
    .select("approval_status, promptpay_id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!rider || rider.approval_status !== "approved") {
    throw new Error("ต้องผ่านการอนุมัติก่อนเปิดรับงาน");
  }

  if (isAvailable && profile.role !== "admin" && !rider.promptpay_id) {
    throw new Error("กรุณาใส่พร้อมเพย์ในบัญชีก่อนเปิดรับงาน");
  }

  const { error } = await supabase
    .from("rider_profiles")
    .update({
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.id);

  if (error) throw new Error(error.message);
  revalidatePath("/rider");
  revalidatePath("/rider/map");
}

export async function upsertRiderLocation(input: {
  lat: number;
  lng: number;
  accuracy?: number | null;
  source?: "gps" | "manual";
}) {
  const { supabase, profile } = await requireRiderActor();

  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
    throw new Error("พิกัดไม่ถูกต้อง");
  }

  const { error } = await supabase.from("rider_locations").upsert(
    {
      rider_id: profile.id,
      lat: input.lat,
      lng: input.lng,
      accuracy: input.accuracy ?? null,
      source: input.source ?? "gps",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "rider_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/rider/map");
}

export type RiderInboxJob = {
  id: string;
  shop_name: string;
  status: string;
  delivery_fee: number | null;
  shopping_list: string;
  dropoff_address: string;
  accept_deadline_at: string | null;
  created_at: string;
};

export async function getRiderInbox(): Promise<{
  available: boolean;
  incoming: RiderInboxJob[];
  active: RiderInboxJob | null;
}> {
  const { supabase, profile } = await requireRiderActor();

  const [{ data: rider }, { data: jobs, error }] = await Promise.all([
    supabase
      .from("rider_profiles")
      .select("is_available")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select(
        "id, shop_name, status, delivery_fee, shopping_list, dropoff_address, accept_deadline_at, created_at",
      )
      .eq("rider_id", profile.id)
      .in("status", [
        "pending_rider",
        "going_to_shop",
        "at_shop",
        "quote_pending",
        "awaiting_payment",
        "paid_pending",
        "shopping",
        "delivering",
      ])
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (error) throw new Error(error.message);

  const list = (jobs ?? []) as RiderInboxJob[];
  const incoming = list.filter((j) => j.status === "pending_rider");
  const active = list.find((j) => j.status !== "pending_rider") ?? null;

  return {
    available: Boolean(rider?.is_available),
    incoming,
    active,
  };
}
