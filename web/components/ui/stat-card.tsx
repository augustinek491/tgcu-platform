import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/demo/data";

function Sparkline({ data, dir }: { data: number[]; dir: "up" | "down" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 96;
  const h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = dir === "up" ? "var(--color-success)" : "var(--color-danger)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** KPI stat card: label, big tabular number, delta with ▲/▼ + text, sparkline, caption. */
export function StatCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.delta?.dir === "up";
  return (
    <Card className="p-5">
      <div className="text-sm font-medium text-muted">{kpi.label}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="tabular font-display text-[28px] font-semibold leading-none text-fg">
          {kpi.value}
        </div>
        {kpi.delta && <Sparkline data={kpi.spark} dir={kpi.delta.dir} />}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {kpi.delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              up ? "text-[var(--color-success)]" : "text-[var(--color-danger)]",
            )}
          >
            {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {kpi.delta.value}
          </span>
        )}
        <span className="text-xs text-muted">· {kpi.caption}</span>
      </div>
    </Card>
  );
}
