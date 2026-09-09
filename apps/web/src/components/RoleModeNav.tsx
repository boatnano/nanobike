import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const MODES = [
  { id: "admin", href: "/admin/members/riders", label: "Admin" },
  { id: "customer", href: "/customer", label: "ลูกค้า" },
  { id: "rider", href: "/rider", label: "ไรเดอร์" },
] as const;

export async function RoleModeNav({
  current,
}: {
  current: "admin" | "customer" | "rider";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.account_status !== "active") {
    return null;
  }

  return (
    <div className="mb-4 rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-3 py-2">
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-[var(--muted)] uppercase">
        โหมดทดสอบ (Admin)
      </p>
      <nav className="flex flex-wrap gap-2">
        {MODES.map((mode) => {
          const active = current === mode.id;
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className={
                active
                  ? "rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold"
                  : "rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium"
              }
            >
              {mode.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
