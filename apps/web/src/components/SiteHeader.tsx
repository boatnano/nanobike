import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function SiteHeader({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <header
      className={`flex items-center justify-between px-4 py-4 sm:px-6 ${
        dark ? "text-white" : "text-[var(--ink)]"
      }`}
    >
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-xl font-black tracking-tight sm:text-2xl">
          {BRAND.name}
        </span>
        <span
          className={`text-sm font-medium ${dark ? "text-white/70" : "text-[var(--muted)]"}`}
        >
          {BRAND.nameTh}
        </span>
      </Link>
      <nav className="flex items-center gap-3 text-sm font-medium">
        <Link href="/rules" className="opacity-80 hover:opacity-100">
          กติกา
        </Link>
        <Link href="/donate" className="opacity-80 hover:opacity-100">
          บริจาค
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-[var(--ink)]"
        >
          เข้าสู่ระบบ
        </Link>
      </nav>
    </header>
  );
}
