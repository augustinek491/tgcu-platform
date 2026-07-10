"use client";

import { useState, type ReactNode } from "react";
import { ChartLine, Table2 } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";

/**
 * In-place data-table alternative for a chart (AF-8 / DESIGN-SYSTEM §6, 06 A.6/A.10):
 * a keyboard-accessible "Chart | Table" segmented control that swaps the visual for
 * its accessible table equivalent. `toolbar` renders left of the control (e.g. the
 * chart legend) so the row reads legend → view switch; `actions` renders after the
 * switch (e.g. the A.6 maximize-2 icon-button).
 */
export function ChartTableSwitch({
  label,
  chart,
  table,
  toolbar,
  actions,
}: {
  /** Accessible name for the control group, e.g. "Maize price trend". */
  label: string;
  chart: ReactNode;
  table: ReactNode;
  toolbar?: ReactNode;
  actions?: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">{toolbar}</div>
        <div className="flex items-center gap-2">
          <Segmented
            label={`${label} — view as chart or table`}
            value={view}
            onChange={setView}
            className="inline-flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]"
            optionClassName="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-medium duration-[var(--dur-fast)]"
            options={[
              { value: "chart", label: "Chart", icon: <ChartLine className="size-3.5" aria-hidden /> },
              { value: "table", label: "Table", icon: <Table2 className="size-3.5" aria-hidden /> },
            ]}
          />
          {actions}
        </div>
      </div>
      {view === "chart" ? chart : table}
    </div>
  );
}
