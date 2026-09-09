"use server";

import { revalidatePath } from "next/cache";
import { requireRiderActor } from "@/lib/auth";
import { TIMEOUTS } from "@/lib/constants";

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

export async function submitGoodsQuote(jobId: string, amountBaht: number) {
  const { supabase, profile } = await requireRiderActor();

  if (!Number.isFinite(amountBaht) || amountBaht < 0) {
    throw new Error("ยอดค่าของไม่ถูกต้อง");
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, rider_id, status")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!job || job.rider_id !== profile.id) throw new Error("ไม่พบงานนี้");
  if (job.status !== "at_shop") {
    throw new Error("สรุปยอดได้ตอนถึงร้านแล้วเท่านั้น");
  }

  const quoteDeadline = new Date(
    Date.now() + TIMEOUTS.quoteSec * 1000,
  ).toISOString();

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      goods_quote: Math.round(amountBaht * 100) / 100,
      quote_deadline_at: quoteDeadline,
      status: "quote_pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "at_shop");

  if (updateError) throw new Error(updateError.message);

  await supabase.from("job_events").insert({
    job_id: jobId,
    actor_id: profile.id,
    event_type: "goods_quote_submitted",
    payload: { goods_quote: amountBaht },
  });

  revalidatePath("/rider/jobs");
  revalidatePath("/rider");
  revalidatePath("/customer/jobs");
  revalidatePath(`/customer/jobs/${jobId}`);
}

export async function cancelShopUnavailable(
  jobId: string,
  reason: "shop_closed" | "out_of_stock",
) {
  const { supabase, profile } = await requireRiderActor();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, rider_id, status")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!job || job.rider_id !== profile.id) throw new Error("ไม่พบงานนี้");
  if (job.status !== "at_shop" && job.status !== "going_to_shop") {
    throw new Error("แจ้งร้านปิด/ของหมดได้ตอนไปร้านหรือถึงร้านแล้ว");
  }

  const reasonText =
    reason === "shop_closed" ? "ร้านปิด" : "ของหมด/ซื้อไม่ได้ตามรายการ";

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "cancelled_shop",
      cancel_reason: reasonText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (updateError) throw new Error(updateError.message);

  await supabase.from("job_events").insert({
    job_id: jobId,
    actor_id: profile.id,
    event_type: "shop_unavailable",
    payload: { reason },
  });

  await supabase
    .from("rider_profiles")
    .update({ is_available: true, updated_at: new Date().toISOString() })
    .eq("user_id", profile.id);

  revalidatePath("/rider/jobs");
  revalidatePath("/rider");
  revalidatePath("/customer/jobs");
  revalidatePath(`/customer/jobs/${jobId}`);
}
