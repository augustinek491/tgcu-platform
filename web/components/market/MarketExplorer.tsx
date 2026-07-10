"use client";

import { useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FreshnessIndicator } from "@/components/shell/FreshnessIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartTableSwitch } from "@/components/charts/ChartTableSwitch";
import { ChartMaximize } from "@/components/charts/ChartMaximize";
import { TrendDataTable } from "@/components/charts/TrendDataTable";
import { SERIES_COLORS } from "@/components/charts/palette";
import { CommoditiesMap } from "@/components/market/CommoditiesMap";
import styles from "@/components/charts/draw.module.css";
import { cn, formatUGXPerKg } from "@/lib/utils";
import {
  COMMODITIES,
  MARKETS,
  MONTHS,
  RANGES,
  priceSeries,
  comparison,
  commodityById,
  type Range,
} from "@/lib/demo/marketdata";

// Recharts arrives as a lazy chunk on this route only (design/02 §5.5, NFR-12).
// Chart heights: 200 mobile / 240 tablet (06 PART G) / 280 desktop — the
// user-ratified AM-16 value (supersedes A.6's pre-ratification 320; MOB-03).
const CHART_HEIGHTS = "h-[200px] sm:h-[240px] lg:h-[280px]";

const PriceTrendChart = dynamic(
  () => import("@/components/charts/PriceTrendChart").then((m) => m.PriceTrendChart),
  { ssr: false, loading: () => <Skeleton className={cn("w-full", CHART_HEIGHTS)} /> },
);

const tickLabel = (m: { label: string; year: number }) => `${m.label} '${String(m.year).slice(-2)}`;
const fullLabel = (m: { label: string; year: number }) => `${m.label} ${m.year}`;

/**
 * Market-data explorer: commodity + market + range controls driving the interactive
 * trend chart and the comparison bars. History range is tier-gated (`maxRange`,
 * FR-MEM-11.1 history-depth) — ranges beyond the member's plan render locked, not broken.
 * Chips and chart series key off ONE selection-ordered list against the canonical
 * palette, so the visible color key can never lie (DV-03/06). Every chart carries an
 * in-place data-table alternative (AF-8) and card-level "as of · source" (AF-9).
 *
 * The Uganda map island mounts INSIDE this component (DS §9.9/AM-30): pin
 * selection, map-table rows, market chips and trend series all share the ONE
 * `{commodityId, selected}` state owned here — no second selection can exist.
 * `moversSlot` lets the server page keep its movers card beside the map.
 */
export function MarketExplorer({
  maxRange,
  tierName,
  moversSlot,
}: {
  maxRange: Range;
  tierName: string;
  moversSlot?: ReactNode;
}) {
  const [commodityId, setCommodityId] = useState("maize");
  const [selected, setSelected] = useState<string[]>(["mbarara", "kampala", "gulu"]);
  const [range, setRange] = useState<Range>(Math.min(12, maxRange) as Range);

  const commodity = commodityById(commodityId);
  // ONE ordered list (selection insertion order) drives chip colors, chart series
  // colors and table columns alike — the only way the color key stays truthful.
  const activeMarkets = useMemo(
    () => selected.map((id) => MARKETS.find((m) => m.id === id)!).filter(Boolean),
    [selected],
  );
  const marketNames = useMemo(() => activeMarkets.map((m) => m.name), [activeMarkets]);
  const windowMonths = useMemo(() => MONTHS.slice(24 - range), [range]);
  const data = useMemo<Record<string, number | string | null>[]>(
    () =>
      priceSeries(commodityId, selected, range).map((row, i) => ({
        ...row,
        // Year-disambiguated ticks — "Jul '25", never twelve bare duplicates (DV-12).
        month: tickLabel(windowMonths[i]),
      })),
    [commodityId, selected, range, windowMonths],
  );
  const bars = useMemo(() => comparison(commodityId), [commodityId]);
  const maxBar = bars[0]?.latest?.price ?? 1;
  const comparisonAsOf = bars[0]?.latest ? fullLabel(bars[0].latest.month) : "Jun 2026";
  // Coverage honesty (A.8/DV-08): non-reporting markets are shown, not omitted.
  const nonReporting = MARKETS.filter((m) => !m.reporting);
  // Spread callout (A.8/DV-09; FR-MKT-12): dispersion across reporting markets.
  const spread =
    bars.length >= 2
      ? {
          value: bars[0].latest!.price - bars[bars.length - 1].latest!.price,
          top: bars[0].market.name,
          bottom: bars[bars.length - 1].market.name,
        }
      : null;

  const trendRows = useMemo(
    () =>
      windowMonths.map((m, i) => ({
        period: fullLabel(m),
        asOf: fullLabel(m),
        values: marketNames.map((name) => data[i]?.[name] as number | null),
      })),
    [windowMonths, marketNames, data],
  );

  function toggleMarket(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    // A.1 rhythm: 32px between chart-row regions; the control cluster keeps its
    // own 16px internal rhythm (LAY-01).
    <div className="space-y-8">
      <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Commodity"
          value={commodityId}
          onChange={(e) => setCommodityId(e.target.value)}
          className="h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 text-base focus-visible:border-ring"
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
                aria-pressed={activeR}
                onClick={() => setRange(r)}
                title={locked ? `${tierName} tier covers ${maxRange}mo — upgrade for more` : undefined}
                className={cn(
                  // min-h-11 = 44px touch target (A11Y-R2-12); keyboard ring stays global.
                  "inline-flex min-h-11 items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
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
          {tierName} tier · up to {maxRange === 24 ? "full" : `${maxRange}mo`} history
        </span>
      </div>

      {/* Market toggles — chip color = series color (same list, same order) */}
      <div className="flex flex-wrap gap-2">
        {MARKETS.map((m) => {
          const on = selected.includes(m.id);
          const seriesColor = on
            ? SERIES_COLORS[selected.indexOf(m.id) % SERIES_COLORS.length]
            : undefined;
          return (
            <button
              key={m.id}
              onClick={() => toggleMarket(m.id)}
              aria-pressed={on}
              className={cn(
                // Selected chip = AM-05: series-tinted bg + series border + --fg text +
                // series dot — the dot/border keep the chip↔series color key honest.
                // §9.10 effective-target rule (A11Y-R3-06): wrapped rows annihilate big
                // pseudo-extensions, so the chip carries REAL pitch — min-h-9 (36px)
                // + row gap 8 = 44px pitch; ::after ±4px bridges the gap.
                "relative inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-medium transition-colors after:absolute after:inset-x-0 after:-inset-y-1",
                on
                  ? "text-fg"
                  : "border-[var(--color-border)] text-muted hover:bg-surface-2",
                // Non-reporting is encoded by the "· not reporting" words — never by
                // dimming text below the sanctioned muted token (DS §8 / A11Y-06).
              )}
              style={
                seriesColor
                  ? {
                      background: `color-mix(in srgb, ${seriesColor} 14%, transparent)`,
                      borderColor: seriesColor,
                    }
                  : undefined
              }
            >
              {seriesColor && (
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: seriesColor }}
                />
              )}
              {m.name}
              {!m.reporting && <span>· not reporting</span>}
            </button>
          );
        })}
      </div>
      </div>

      {/* Gutter 24 per A.1 (LAY-01) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend — min-w-0 so the in-card table scrolls instead of inflating the grid track */}
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{commodity.name} price trend</CardTitle>
              <p className="text-sm text-muted">Wholesale · UGX/kg · monthly · last {range}mo</p>
            </div>
            <FreshnessIndicator asOf="Jun 2026" source={commodity.source} />
          </CardHeader>
          <CardContent>
            {marketNames.length ? (
              <ChartTableSwitch
                label={`${commodity.name} price trend`}
                actions={
                  /* A.6 maximize-2 → full-screen chart modal (DV-R2-03) */
                  <ChartMaximize label={`${commodity.name} price trend — full screen`}>
                    <ChartTableSwitch
                      label={`${commodity.name} price trend (full screen)`}
                      chart={
                        <div className="h-[56vh] min-h-[280px]">
                          <PriceTrendChart
                            data={data}
                            markets={marketNames}
                            source={commodity.source}
                          />
                        </div>
                      }
                      table={
                        <TrendDataTable
                          seriesNames={marketNames}
                          rows={trendRows}
                          source={commodity.source}
                          caption={`${commodity.name} monthly wholesale prices in UGX per kilogram by market, last ${range} months`}
                        />
                      }
                    />
                    <p className="mt-3 text-xs text-muted">
                      Wholesale · UGX/kg · monthly · as of Jun 2026 · {commodity.source}
                    </p>
                  </ChartMaximize>
                }
                chart={
                  <div className={CHART_HEIGHTS}>
                    <PriceTrendChart data={data} markets={marketNames} source={commodity.source} />
                  </div>
                }
                table={
                  <TrendDataTable
                    seriesNames={marketNames}
                    rows={trendRows}
                    source={commodity.source}
                    caption={`${commodity.name} monthly wholesale prices in UGX per kilogram by market, last ${range} months`}
                  />
                }
              />
            ) : (
              <div className={cn("grid place-items-center", CHART_HEIGHTS)}>
                <div className="text-center">
                  <p className="text-base font-semibold text-fg">No markets selected</p>
                  <p className="mt-1 text-sm text-muted">
                    Pick a market chip above to plot its monthly series.
                  </p>
                  <button
                    onClick={() => setSelected(["kampala"])}
                    className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
                  >
                    Show Kampala
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card className="min-w-0">
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Market comparison</CardTitle>
              <p className="text-sm text-muted">Latest {commodity.name} · UGX/kg · reporting markets</p>
            </div>
            {spread && (
              <span className="whitespace-nowrap rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
                Spread {formatUGXPerKg(spread.value)} · {spread.top}↔{spread.bottom}
              </span>
            )}
          </CardHeader>
          <CardContent>
            <ChartTableSwitch
              label={`${commodity.name} market comparison`}
              chart={
                /* A.8 bar anatomy (LAY-02): fixed 96px label gutter · 20px bars ·
                   12px row gap · track --border@40% · value at bar end. Hover =
                   fill darkens + row tooltip with source/as-of (DV-R2-07);
                   fill stays the `--data` family per ratified §9.4/AM-11. */
                <div className="space-y-3">
                  {bars.map((b) => (
                    <div
                      key={b.market.id}
                      className="group flex items-center gap-3"
                      title={`${b.market.name} — ${formatUGXPerKg(b.latest!.price)} · as of ${comparisonAsOf} · ${commodity.source}`}
                    >
                      <span className="w-24 shrink-0 truncate text-xs font-medium text-fg">
                        {b.market.name}
                      </span>
                      <div className="h-5 min-w-0 flex-1 rounded-[4px] bg-[var(--color-border)]/40">
                        <div
                          className="h-5 rounded-[4px] bg-[var(--data)] transition-colors duration-[var(--dur-fast)] group-hover:bg-[color-mix(in_srgb,var(--data)_75%,black)]"
                          style={{ width: `${(b.latest!.price / maxBar) * 100}%` }}
                        />
                      </div>
                      <span
                        key={`${b.market.id}-${b.latest!.price}`}
                        className={cn(
                          "tabular w-20 shrink-0 text-right text-xs font-semibold text-fg",
                          styles.fade,
                        )}
                      >
                        {b.latest!.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {/* Not omitted, not zero — hatched track + words (A.8/DV-08) */}
                  {nonReporting.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 truncate text-xs text-muted">{m.name}</span>
                      <div
                        className="h-5 min-w-0 flex-1 rounded-[4px]"
                        style={{
                          background:
                            "repeating-linear-gradient(135deg, var(--color-border) 0 3px, transparent 3px 6px)",
                        }}
                        aria-hidden="true"
                      />
                      <span className="w-20 shrink-0 text-right text-xs text-muted">
                        not reporting
                      </span>
                    </div>
                  ))}
                </div>
              }
              table={
                <div className="overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <caption className="sr-only">
                      Latest {commodity.name} wholesale price by market, UGX per kilogram;
                      non-reporting markets listed as not reporting
                    </caption>
                    <thead className="sticky top-0 z-10 bg-surface">
                      <tr className="border-b border-[var(--color-border)] text-xs text-muted">
                        <th scope="col" className="px-3 py-2 text-left font-semibold">
                          Market
                        </th>
                        <th scope="col" className="px-3 py-2 text-right font-semibold">
                          Price (UGX/kg)
                        </th>
                        <th scope="col" className="px-3 py-2 text-left font-semibold">
                          Source
                        </th>
                        <th scope="col" className="px-3 py-2 text-left font-semibold">
                          As of
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bars.map((b) => (
                        <tr
                          key={b.market.id}
                          className="border-b border-[var(--color-border)] last:border-0"
                        >
                          <th scope="row" className="px-3 py-2 text-left font-medium text-fg">
                            {b.market.name}
                          </th>
                          <td className="tabular px-3 py-2 text-right text-fg">
                            {b.latest!.price.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted">{commodity.source}</td>
                          <td className="tabular px-3 py-2 text-xs text-muted">
                            {fullLabel(b.latest!.month)}
                          </td>
                        </tr>
                      ))}
                      {nonReporting.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-[var(--color-border)] last:border-0"
                        >
                          <th scope="row" className="px-3 py-2 text-left font-medium text-muted">
                            {m.name}
                          </th>
                          <td className="px-3 py-2 text-right text-xs text-muted">
                            not reporting
                          </td>
                          <td className="px-3 py-2 text-xs text-muted">—</td>
                          <td className="px-3 py-2 text-xs text-muted">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            />
            <p className="max-w-[72ch] pt-3 text-xs text-muted">
              Markets differ — spatial price spread like this is typical · seeded demo values · as
              of {comparisonAsOf} · {commodity.source}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map row — the island mounts here so pins, map-table rows, chips and
          trend series share the ONE selection + commodity state (AM-30; kills
          the page's old hardcoded "maize" map, MAP-11). */}
      <div className="grid gap-6 lg:grid-cols-3">
        {moversSlot && <div className="min-w-0">{moversSlot}</div>}
        <div className={cn("min-w-0", moversSlot ? "lg:col-span-2" : "lg:col-span-3")}>
          <CommoditiesMap
            commodityId={commodityId}
            selectedIds={selected}
            onToggleMarket={toggleMarket}
          />
        </div>
      </div>
    </div>
  );
}
