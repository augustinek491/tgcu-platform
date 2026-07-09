"use client";

import { useState, type ReactNode } from "react";
import { ChartLine, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * In-place data-table alternative for a chart (AF-8 / DESIGN-SYSTEM §6, 06 A.6/A.10):
 * a keyboard-accessible "Chart | Table" segmented control that swaps the visual for
 * its accessible table equivalent. `toolbar` renders left of the control (e.g. the
 * chart legend) so the row reads legend → view switch.
 */
export function ChartTableSwitch({
  label,
  chart,
  table,
  toolbar,
}: {
  /** Accessible name for the control group, e.g. "Maize price trend". */
  label: string;
  chart: ReactNode;
  table: ReactNode;
  toolbar?: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  const segment = (target: "chart" | "table", icon: ReactNode, text: string) => {
    const active = view === target;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => setView(target)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-medium transition-colors duration-[var(--dur-fast)]",
          active ? "bg-brand-800 text-white" : "text-muted hover:bg-surface-2",
        )}
      >
        {icon}
        {text}
      </button>
    );
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">{toolbar}</div>
        <div
          role="group"
          aria-label={`${label} — view as chart or table`}
          className="inline-flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]"
        >
          {segment("chart", <ChartLine className="size-3.5" aria-hidden />, "Chart")}
          {segment("table", <Table2 className="size-3.5" aria-hidden />, "Table")}
        </div>
      </div>
      {view === "chart" ? chart : table}
    </div>
  );
}
