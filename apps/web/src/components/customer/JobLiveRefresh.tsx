"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Soft-refresh job detail while waiting on the other party. */
export function JobLiveRefresh({
  enabled,
  intervalMs = 4000,
}: {
  enabled: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, router]);

  return null;
}
