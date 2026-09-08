import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, account_status, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.account_status !== "active") {
    redirect("/login");
  }

  return { supabase, user, profile };
}

export function approvalLabel(status: string) {
  switch (status) {
    case "approved":
      return "อนุมัติแล้ว";
    case "rejected":
      return "ปฏิเสธ";
    default:
      return "รออนุมัติ";
  }
}

export function accountLabel(status: string) {
  switch (status) {
    case "suspended":
      return "พักใช้งาน";
    case "banned":
      return "แบน";
    default:
      return "ปกติ";
  }
}
