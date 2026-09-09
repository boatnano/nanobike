"use server";

import { revalidatePath } from "next/cache";
import { requireRiderActor } from "@/lib/auth";

export async function acceptJob(jobId: string) {
  const { supabase, profile } = await requireRiderActor();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, rider_id, status, accept_deadline_at")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!job || job.rider_id !== profile.id) throw new Error("ไม่พบงานนี้");
  if (job.status !== "pending_rider") throw new Error("งานนี้ไม่รอการรับแล้ว");
  if (
    job.accept_deadline_at &&
    new Date(job.accept_deadline_at).getTime() < Date.now()
  ) {
    await supabase
      .from("jobs")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", jobId);
    throw new Error("หมดเวลารับงานแล้ว");
  }

  const { data: active } = await supabase
    .from("jobs")
    .select("id")
    .eq("rider_id", profile.id)
    .in("status", [
      "going_to_shop",
      "at_shop",
      "quote_pending",
      "awaiting_payment",
      "paid_pending",
      "shopping",
      "delivering",
    ])
    .limit(1);

  if (active?.length) {
    throw new Error("คุณมีงานค้างอยู่แล้ว — ปิดงานปัจจุบันก่อน");
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "going_to_shop",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "pending_rider");

  if (updateError) throw new Error(updateError.message);

  await supabase.from("job_events").insert({
    job_id: jobId,
    actor_id: profile.id,
    event_type: "rider_accepted",
    payload: {},
  });

  await supabase
    .from("rider_profiles")
    .update({ is_available: false, updated_at: new Date().toISOString() })
    .eq("user_id", profile.id);

  revalidatePath("/rider/jobs");
  revalidatePath("/customer/jobs");
}

export async function rejectJob(jobId: string) {
  const { supabase, profile } = await requireRiderActor();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, rider_id, status")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!job || job.rider_id !== profile.id) throw new Error("ไม่พบงานนี้");
  if (job.status !== "pending_rider") throw new Error("งานนี้ไม่รอการรับแล้ว");

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "rejected",
      cancel_reason: "ไรเดอร์ปฏิเสธ",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "pending_rider");

  if (updateError) throw new Error(updateError.message);

  await supabase.from("job_events").insert({
    job_id: jobId,
    actor_id: profile.id,
    event_type: "rider_rejected",
    payload: {},
  });

  revalidatePath("/rider/jobs");
  revalidatePath("/rider");
  revalidatePath("/customer/jobs");
}

export async function markArrivedAtShop(jobId: string) {
  const { supabase, profile } = await requireRiderActor();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, rider_id, status")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!job || job.rider_id !== profile.id) throw new Error("ไม่พบงานนี้");
  if (job.status !== "going_to_shop") {
    throw new Error("กดปุ่มนี้ได้ตอนกำลังไปร้านเท่านั้น");
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "at_shop",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "going_to_shop");

  if (updateError) throw new Error(updateError.message);

  await supabase.from("job_events").insert({
    job_id: jobId,
    actor_id: profile.id,
    event_type: "rider_arrived_shop",
    payload: {},
  });

  revalidatePath("/rider/jobs");
  revalidatePath("/rider");
  revalidatePath("/customer/jobs");
  revalidatePath(`/customer/jobs/${jobId}`);
}
