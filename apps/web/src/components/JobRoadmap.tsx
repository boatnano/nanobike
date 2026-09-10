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
  const activeStep = !ended && current >= 0 ? JOB_ROADMAP[current] : null;
  const progress =
    ended || current < 0
      ? 0
      : JOB_ROADMAP.length <= 1
        ? 100
        : (current / (JOB_ROADMAP.length - 1)) * 100;

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white/95 via-white/80 to-[var(--accent-soft)]/40 px-4 py-4 shadow-[0_10px_40px_-24px_rgba(20,33,43,0.45)] ring-1 ring-[var(--line)]/60">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[var(--accent)]/35 blur-2xl"
      />

      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">
            ขั้นตอนงาน
            {!ended && current >= 0 ? (
              <span className="ml-2 tracking-normal text-[var(--ink)]/55">
                {current + 1}/{JOB_ROADMAP.length}
              </span>
            ) : null}
          </p>
          <p className="font-display mt-1 truncate text-lg font-bold leading-snug text-[var(--ink)]">
            {ended ? "งานสิ้นสุด" : (activeStep?.label ?? "กำลังดำเนินการ")}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
            {hint}
          </p>
        </div>
        {deadlineLabel ? (
          <span className="shrink-0 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[11px] font-semibold text-white">
            {deadlineLabel}
          </span>
        ) : null}
      </div>

      <div className="relative px-1 pt-1 pb-0.5">
        <div className="absolute top-[11px] right-3 left-3 h-[2px] rounded-full bg-[var(--line)]/80" />
        <div
          className="absolute top-[11px] left-3 h-[2px] rounded-full bg-[var(--ink)] transition-[width] duration-500 ease-out"
          style={{
            width: ended ? "0%" : `calc(${progress}% - 0px)`,
            maxWidth: "calc(100% - 1.5rem)",
          }}
        />

        <ol className="relative flex items-start justify-between">
          {JOB_ROADMAP.map((step, index) => {
            const done = !ended && index < current;
            const active = !ended && index === current;
            return (
              <li
                key={step.key}
                className="flex w-5 flex-col items-center"
                title={step.label}
              >
                <span
                  className={[
                    "relative z-[1] flex h-[22px] w-[22px] items-center justify-center rounded-full transition-all duration-300",
                    active
                      ? "bg-[var(--accent)] shadow-[0_0_0_4px_rgba(214,245,106,0.35)]"
                      : done
                        ? "bg-[var(--ink)]"
                        : "bg-white ring-2 ring-[var(--line)]",
                  ].join(" ")}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-2.5 w-2.5 text-white"
                      aria-hidden
                    >
                      <path
                        fill="currentColor"
                        d="M6.2 11.4 2.8 8l1.1-1.1 2.3 2.3 5-5L12.3 5.3z"
                      />
                    </svg>
                  ) : active ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ink)]" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {!ended && activeStep ? (
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
          <span className="truncate">
            {current > 0 ? JOB_ROADMAP[current - 1].label : "เริ่มงาน"}
          </span>
          <span className="rounded-full bg-white/70 px-2.5 py-1 font-semibold text-[var(--ink)] ring-1 ring-[var(--line)]/70">
            {activeStep.label}
          </span>
          <span className="truncate text-right">
            {current < JOB_ROADMAP.length - 1
              ? JOB_ROADMAP[current + 1].label
              : "จบงาน"}
          </span>
        </div>
      ) : null}
    </section>
  );
}
