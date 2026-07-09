import { Card } from "./card";
import { DeltaPill } from "./delta-pill";
import { DrawIn } from "@/components/charts/DrawIn";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/demo/data";
import styles from "@/components/charts/draw.module.css";

/**
 * KPI sparkline (06 A.5.4): 8–12 points, full card width, h28, single-hue `--data`
 * blue — never direction-colored (ratified DS §9.4 / DV-05). Percent-space SVG +
 * HTML end dot so nothing distorts as the card stretches. Draw-in honours
 * reduced-motion via the shared module.
 */
function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  // 6% vertical inset keeps the 1.5px stroke inside the box at the extremes.
  const yPct = (v: number) => 6 + (1 - (v - min) / range) * 88;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * 100).toFixed(2)},${yPct(v).toFixed(2)}`)
    .join(" ");
  return (
    <DrawIn className="relative mt-3 h-7 w-full" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <polyline
          points={pts}
          fill="none"
          stroke="var(--data)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={styles.draw}
        />
      </svg>
      <span
        className="absolute right-0 size-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--data)]"
        style={{ top: `${yPct(data[data.length - 1])}%` }}
      />
    </DrawIn>
  );
}

/**
 * KPI stat card (06 A.5): label · hero numeral (Public Sans 40/600 tabular; the single
 * flagship National-avg may use Newsreader — TYP-01) · delta pill colored by VALENCE
 * with ▲/▼ keeping direction (AM-18) · sparkline · "as of · source" caption (AF-9).
 */
export function StatCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-medium text-muted">{kpi.label}</div>
      <div
        className={cn(
          "tabular mt-2 text-[40px] leading-none text-fg",
          kpi.flagship ? "font-display font-medium" : "font-semibold",
        )}
      >
        {kpi.value}
      </div>
      {kpi.delta && (
        <div className="mt-3">
          <DeltaPill dir={kpi.delta.dir} valence={kpi.delta.valence}>
            {kpi.delta.value}
          </DeltaPill>
        </div>
      )}
      <Sparkline data={kpi.spark} />
      <p className="mt-2 text-xs text-muted">{kpi.caption}</p>
    </Card>
  );
}
