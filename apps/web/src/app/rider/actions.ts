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

  // PromptPay จะบังคับเต็มก่อนเปิดรับงานจริง — ช่วงทดสอบแอดมินข้ามได้
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
