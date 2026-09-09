import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
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

  if (!profile || profile.account_status !== "active") {
    redirect("/login");
  }

  return { supabase, user, profile };
}

export async function requireCustomerActor() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "customer" && ctx.profile.role !== "admin") {
    redirect("/login");
  }
  return ctx;
}

export async function requireRiderActor() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "rider" && ctx.profile.role !== "admin") {
    redirect("/login");
  }
  return ctx;
}
