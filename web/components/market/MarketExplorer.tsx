"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FreshnessIndicator } from "@/components/shell/FreshnessIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  COMMODITIES,
  MARKETS,
  RANGES,
  priceSeries,
  comparison,
  commodityById,
  type Range,
} from "@/lib/demo/marketdata";

// Recharts arrives as a lazy chunk on this route only (design/02 §5.5, NFR-12).
const PriceTrendChart = dynamic(
  () => import("@/components/charts/PriceTrendChart").then((m) => m.PriceTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> },
);

const SERIES_COLORS = [
  "var(--data)",
  "var(--series-gold)",
  "var(--series-sky)",
  "var(--series-violet)",
  "var(--series-teal)",
  "var(--series-red)",
];

/**
 * Market-data explorer: commodity + market + range controls driving the interactive
 * trend chart and the comparison bars. History range is tier-gated (`maxRange`,
 * FR-MEM-11.1 history-depth) — ranges beyond the member's plan render locked, not broken.
 */
export function MarketExplorer({ maxRange, tierName }: { maxRange: Range; tierName: string }) {
  const [commodityId, setCommodityId] = useState("maize");
  const [selected, setSelected] = useState<string[]>(["mbarara", "kampala", "gulu"]);
  const [range, setRange] = useState<Range>(Math.min(12, maxRange) as Range);

  const commodity = commodityById(commodityId);
  const marketNames = useMemo(
    () => MARKETS.filter((m) => selected.includes(m.id)).map((m) => m.name),
    [selected],
  );
  const data = useMemo(
    () => priceSeries(commodityId, selected, range),
    [commodityId, selected, range],
  );
  const bars = useMemo(() => comparison(commodityId), [commodityId]);
  const maxBar = bars[0]?.latest?.price ?? 1;

  function toggleMarket(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Commodity"
          value={commodityId}
          onChange={(e) => setCommodityId(e.target.value)}
          className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 text-sm outline-none focus-visible:border-[var(--color-primary)]"
        >
          {COMMODITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
          {RANGES.map((r) => {
            const locked = r > maxRange;
            const activeR = r === range;
            return (
              <button
                key={r}
                disabled={locked}
                onClick={() => setRange(r)}
                title={locked ? `${tierName} plan covers ${maxRange}mo — upgrade for more` : undefined}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
                  activeR ? "bg-brand-800 text-white" : "text-muted hover:bg-surface-2",
                  locked && "cursor-not-allowed opacity-50",
                )}
              >
                {locked && <Lock className="size-3" />} {r}mo
              </button>
            );
          })}
        </div>
        <span className="text-xs text-muted">
          {tierName} plan · up to {maxRange === 24 ? "full" : `${maxRange}mo`} history
        </span>
      </div>

      {/* Market toggles */}
      <div className="flex flex-wrap gap-2">
        {MARKETS.map((m, i) => {
          const on = selected.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggleMarket(m.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-medium transition-colors",
                on
                  ? "border-transparent text-white"
                  : "border-[var(--color-border)] text-muted hover:bg-surface-2",
                !m.reporting && "opacity-70",
              )}
              style={on ? { background: SERIES_COLORS[selected.indexOf(m.id) % SERIES_COLORS.length] } : undefined}
            >
              {m.name}
              {!m.reporting && <span className="text-[10px]">· no data</span>}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{commodity.name} price trend</CardTitle>
              <p className="text-sm text-muted">Wholesale · UGX/kg · monthly · last {range}mo</p>
            </div>
            <FreshnessIndicator asOf="Jun 2026" source={commodity.source} />
          </CardHeader>
          <CardContent>
            {marketNames.length ? (
              <PriceTrendChart data={data} markets={marketNames} source={commodity.source} />
            ) : (
              <div className="grid h-[280px] place-items-center text-sm text-muted">
                Select at least one market to plot.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Market comparison</CardTitle>
            <p className="text-sm text-muted">Latest {commodity.name} · reporting markets</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {bars.map((b) => (
              <div key={b.market.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-fg">{b.market.name}</span>
                  <span className="tabular text-muted">{b.latest!.price.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div
                    className="h-2 rounded-full bg-[var(--data)]"
                    style={{ width: `${(b.latest!.price / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1 text-[11px] text-muted">
              Spread reflects real spatial price dispersion · as of Jun 2026.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
