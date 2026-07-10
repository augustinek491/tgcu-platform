"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SERIES_COLORS } from "@/components/charts/palette";
import { cn, formatUGXPerKg } from "@/lib/utils";
import { MARKETS, MONTHS, latest, priceAt, commodityById } from "@/lib/demo/marketdata";
import { MapSkeleton } from "./MapSkeleton";
import type { MapPin } from "./UgandaMap";

// The ONLY route to the MapLibre chunk: lazy island, no SSR, skeleton at the
// exact final size (zero CLS). maplibre-gl/pmtiles never appear in First-Load.
const UgandaMap = dynamic(() => import("./UgandaMap").then((m) => m.UgandaMap), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * National commodities map card (FR-MKT-17/18; rubric M12; DS §9.9 AM-29…35).
 * Pins-only (8 markets cannot honestly paint 135 districts): price-ramped
 * DOM pins on a real MapLibre basemap, ADM1 region lines for geographic
 * credibility, theme-true ramp legend with UGX/kg ticks, "k of N reporting"
 * pill, and the always-visible market table (AF-8) — every row toggles the
 * SAME selection the pins and trend chart use (AM-30; state lives in
 * MarketExplorer, the single owner).
 */

// Brand price ramp (--brand-300 → --brand-600, 06 H.1 dark-safe): endpoints are
// the live tokens; mid steps are token mixes, so the ramp can never drift from
// the theme. Non-reporting markets are excluded and hatched, never ramped.
const RAMP: string[] = [
  "var(--brand-300)",
  "color-mix(in oklab, var(--brand-300) 67%, var(--brand-600))",
  "color-mix(in oklab, var(--brand-300) 33%, var(--brand-600))",
  "var(--brand-600)",
];

function rampIndex(price: number, min: number, max: number): number {
  if (max <= min) return RAMP.length - 1;
  return Math.min(RAMP.length - 1, Math.floor(((price - min) / (max - min)) * RAMP.length));
}

const monthLabel = (m: { label: string; year: number }) => `${m.label} ${m.year}`;

export function CommoditiesMap({
  commodityId,
  selectedIds,
  onToggleMarket,
}: {
  commodityId: string;
  selectedIds: string[];
  onToggleMarket: (id: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const commodity = commodityById(commodityId);
  const period = monthLabel(MONTHS[23]);

  const rows = MARKETS.map((m) => ({ market: m, latest: latest(commodityId, m.id) }));
  const reportingRows = rows.filter((r) => r.market.reporting && r.latest);
  const prices = reportingRows.map((r) => r.latest!.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const reportingCount = MARKETS.filter((m) => m.reporting).length;

  const pins: MapPin[] = rows.map(({ market, latest: l }) => {
    const reporting = market.reporting && !!l;
    const now = reporting ? priceAt(commodityId, market.id, 23) : null;
    const prior = reporting ? priceAt(commodityId, market.id, 22) : null;
    const pct = now != null && prior != null ? ((now - prior) / prior) * 100 : null;
    return {
      id: market.id,
      name: market.name,
      lat: market.lat,
      lon: market.lon,
      reporting,
      fill: reporting ? RAMP[rampIndex(l!.price, min, max)] : "var(--color-border)",
      selected: selectedIds.includes(market.id),
      ariaLabel: reporting
        ? `${market.name} — ${commodity.name} ${formatUGXPerKg(l!.price)}, as of ${monthLabel(l!.month)}`
        : `${market.name} — no recent data`,
      price: reporting ? formatUGXPerKg(l!.price) : null,
      delta:
        pct != null
          ? {
              text: `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`,
              dir: pct >= 0 ? ("up" as const) : ("down" as const),
            }
          : null,
      meta: reporting
        ? `as of ${monthLabel(l!.month)} · ${commodity.source}`
        : l
          ? `last reported ${monthLabel(l.month)}`
          : "no reports yet",
    };
  });

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <div>
          {/* §9.9 header format: "National outlook — Maize, Jun 2026" */}
          <CardTitle>
            National outlook — {commodity.name}, {period}
          </CardTitle>
          <p className="text-sm text-muted">Latest wholesale price by market</p>
        </div>
        {/* Coverage honesty pill — computed, never hardcoded (preserved) */}
        <span className="whitespace-nowrap rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
          {reportingCount} of {MARKETS.length} markets reporting
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <UgandaMap
              pins={pins}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              regionLabel={`Map of Uganda showing ${commodity.name} prices at reporting markets; non-reporting markets marked as not reporting.`}
              onTogglePin={onToggleMarket}
            />

            {/* Theme-true legend: ramp swatches + UGX/kg ticks + "Not reporting"
                hatch (AM-31 — the swatches carry the meaning, never "darker = higher") */}
            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2 text-xs text-muted">
              <div>
                <span className="mb-1 block">Latest price (UGX/kg)</span>
                <div className="flex items-center" aria-hidden="true">
                  {RAMP.map((c, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2.5 w-8 border border-[var(--color-border)]",
                        i === 0 && "rounded-l-[var(--radius-pill)]",
                        i === RAMP.length - 1 && "rounded-r-[var(--radius-pill)]",
                        i > 0 && "border-l-0",
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="tabular mt-1 flex w-32 justify-between">
                  <span>{min.toLocaleString()}</span>
                  <span>{max.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pb-0.5">
                <span
                  className="inline-block size-3.5 rounded-[3px] border border-dashed border-[var(--color-muted)]"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, var(--color-border) 0 2.5px, var(--color-surface) 2.5px 5px)",
                  }}
                  aria-hidden="true"
                />
                <span>Not reporting</span>
              </div>
            </div>
          </div>

          {/* Table fallback (a11y + coverage honesty) — always visible, never a
              toggle (AF-8 preserved). Rows drive the SAME selection as the pins
              and the trend chart; dot color = the market's series color. */}
          <div className="min-w-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Latest {commodity.name} wholesale price by market; non-reporting markets listed as
                not reporting. Selecting a market plots it on the price trend chart.
              </caption>
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs text-muted">
                  <th scope="col" className="px-3 py-2 text-left font-semibold">
                    Market
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">
                    Region
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Price (UGX/kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ market, latest: l }) => {
                  const selected = selectedIds.includes(market.id);
                  const seriesColor = selected
                    ? SERIES_COLORS[selectedIds.indexOf(market.id) % SERIES_COLORS.length]
                    : undefined;
                  return (
                    <tr
                      key={market.id}
                      className={cn(
                        "border-b border-[var(--color-border)] last:border-0",
                        selected && "bg-surface-2/60",
                      )}
                    >
                      {/* Cell padding on-token (LAY-08 2/6px family): 8/4px micro;
                          the 44px row button keeps the row ≥48. */}
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => onToggleMarket(market.id)}
                          aria-pressed={selected}
                          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left font-medium text-fg transition-colors hover:bg-surface-2"
                        >
                          <span
                            className="inline-block size-2 shrink-0 rounded-full border"
                            style={
                              seriesColor
                                ? { background: seriesColor, borderColor: seriesColor }
                                : { borderColor: "var(--color-muted)" }
                            }
                            aria-hidden="true"
                          />
                          {market.name}
                          <span className="sr-only">
                            {selected ? "— remove from trend chart" : "— add to trend chart"}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-1 text-xs text-muted">{market.region}</td>
                      <td className="px-3 py-1 text-right">
                        {market.reporting && l ? (
                          <span className="tabular font-medium text-fg">
                            {l.price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">not reporting</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card-level provenance (AF-9/DV-02): visible at every breakpoint, ≥12px */}
        <p className="mt-3 text-xs text-muted">
          as of {period} · {commodity.source}
        </p>
      </CardContent>
    </Card>
  );
}
