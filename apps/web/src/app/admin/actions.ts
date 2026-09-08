"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export async function setRiderApproval(
  riderId: string,
  approvalStatus: "pending" | "approved" | "rejected",
) {
  const { supabase, profile } = await requireAdmin();

  const { error } = await supabase
    .from("rider_profiles")
    .update({
      approval_status: approvalStatus,
      approval_reason:
        approvalStatus === "rejected" ? "ปฏิเสธโดยแอดมิน" : null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", riderId);

  if (error) throw new Error(error.message);

  await supabase.from("admin_audit_log").insert({
    admin_id: profile.id,
    target_user_id: riderId,
    action: `rider_approval_${approvalStatus}`,
    payload: {},
  });

  revalidatePath("/admin/members/riders");
}

export async function setAccountStatus(
  userId: string,
  accountStatus: "active" | "suspended" | "banned",
  reason?: string,
) {
  const { supabase, profile } = await requireAdmin();

  if (userId === profile.id) {
    throw new Error("ไม่สามารถเปลี่ยนสถานะบัญชีตัวเองได้");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      account_status: accountStatus,
      status_reason: reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await supabase.from("admin_audit_log").insert({
    admin_id: profile.id,
    target_user_id: userId,
    action: `account_${accountStatus}`,
    reason: reason ?? null,
    payload: {},
  });

  revalidatePath("/admin/members/riders");
  revalidatePath("/admin/members/customers");
}
