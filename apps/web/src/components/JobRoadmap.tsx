"use client";

import { JOB_ROADMAP } from "@/lib/constants";
import { roadmapHint, roadmapIndexForStatus } from "@/lib/roadmap";

type Props = {
  status: string;
  role: "customer" | "rider";
  deadlineLabel?: string | null;
};

export function JobRoadmap({ status, role, deadlineLabel }: Props) {
  const current = roadmapIndexForStatus(status);
  const ended = ["cancelled", "rejected", "cancelled_shop"].includes(status);
  const hint = roadmapHint(status, role);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--muted)]">
            ขั้นตอนงาน
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {ended
              ? hint
              : `ขั้นตอนที่ ${Math.max(current, 0) + 1}/${JOB_ROADMAP.length} — ${hint}`}
          </p>
        </div>
        {deadlineLabel ? (
          <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            {deadlineLabel}
          </span>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {JOB_ROADMAP.map((step, index) => {
          const done = !ended && index < current;
          const active = !ended && index === current;
          return (
            <div
              key={step.key}
              className={`min-w-[4.5rem] flex-1 rounded-xl px-2 py-2 text-center text-[11px] leading-tight ${
                active
                  ? "bg-[var(--accent)] text-[var(--ink)] font-bold"
                  : done
                    ? "bg-[var(--ink)] text-white/90"
                    : "bg-[var(--wash)] text-[var(--muted)]"
              }`}
            >
              <div className="mb-1 text-[10px] opacity-70">{index + 1}</div>
              {step.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
