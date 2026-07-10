import type { Metadata } from "next";
import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeltaPill } from "@/components/ui/delta-pill";
import { MarketExplorer } from "@/components/market/MarketExplorer";
import { MoversCard, type MoverRow } from "@/components/market/MoversCard";
import {
  COMMODITIES,
  movers,
  nationalOutlook,
  nationalSeries,
  HISTORY_BY_TIER,
} from "@/lib/demo/marketdata";
import { currentOrg } from "@/lib/demo/membership";
import { tierById } from "@/lib/membership/tiers";

export const metadata: Metadata = { title: "Market data" };

export default function MarketPage() {
  const org = currentOrg();
  const tier = tierById(org.tierId);
  const maxRange = HISTORY_BY_TIER[org.tierId];
  const outlook = nationalOutlook();
  const movementList = movers();
  const periodLabel = `${outlook.period.label} ${outlook.period.year}`;
  // Union of the canonical source labels behind the cross-commodity aggregates (AF-9).
  const aggregateSources = [...new Set(COMMODITIES.map((c) => c.source))].join(" · ");
  // Commodity-level movers → shared A.7 card rows (label · sparkline · value · delta).
  const moverRows: MoverRow[] = movementList.map((m) => ({
    key: m.commodity.id,
    label: m.commodity.name,
    spark: nationalSeries(m.commodity.id, 8),
    value: m.latest.toLocaleString(),
    delta: {
      dir: m.dir,
      text: `${m.pct >= 0 ? "+" : "−"}${Math.abs(m.pct).toFixed(1)}%`,
    },
  }));

  return (
    // A.1 rhythm: 32px between page regions (LAY-01).
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">Market data & analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Wholesale grain prices with provenance — updated monthly, never live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">Monthly · official</Badge>
          <Badge variant="warning">Demo · seeded data</Badge>
        </div>
      </div>

      {/* National outlook */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>National outlook — {periodLabel}</CardTitle>
            <p className="text-sm text-muted">
              Month-over-month direction · {outlook.reporting} of {outlook.total} markets reporting
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stat-strip gutter unified at 24 (A.1; LAY-01 "gutter vocabulary") */}
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {outlook.commodities.map((c) => (
              <div key={c.name} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                <div className="text-sm font-medium text-fg">{c.name}</div>
                <div className="tabular mt-1 text-lg font-semibold text-fg">
                  {c.price.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-muted">UGX/kg</span>
                </div>
                <DeltaPill dir={c.dir} className="mt-1.5">
                  {c.pct >= 0 ? "+" : "−"}
                  {Math.abs(c.pct).toFixed(1)}%
                </DeltaPill>
              </div>
            ))}
          </div>
          {/* Card-level provenance (AF-9) */}
          <p className="mt-3 text-xs text-muted">
            as of {periodLabel} · {aggregateSources}
          </p>
        </CardContent>
      </Card>

      {/* Interactive explorer (trend + comparison + the Uganda map island —
          commodity + market selection live in ONE client owner, AM-30/MAP-11).
          The movers card rides along as a server-rendered slot beside the map. */}
      <MarketExplorer
        maxRange={maxRange}
        tierName={tier.name}
        moversSlot={
          /* Shared A.7 movers treatment (DV-R2-01) — the dashboard carries the
             market-level movers list, hence the cross-link. */
          <MoversCard
            subtitle={`Month-over-month · national average, UGX/kg · ${movementList[0].fromMonth.label} → ${movementList[0].toMonth.label} ${movementList[0].toMonth.year}`}
            rows={moverRows}
            footerHref="/dashboard"
            asOf={periodLabel}
            sources={aggregateSources}
          />
        }
      />

      {/* Honest forecasting note (FR-MKT-19/23 — v1 = historical + seasonal only).
          p-5/gap-3: default card padding — not a dense surface (LAY-10 / DS §9.3). */}
      <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-2 p-5 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p className="max-w-[72ch]">
          v1 shows <span className="font-medium text-fg">historical data and seasonal context only</span> —
          no price forecasts. Model-driven forecasting arrives in a later release, limited to
          well-covered markets with backtested intervals, and is always{" "}
          <span className="font-medium text-fg">informational, not financial advice</span>.
        </p>
      </div>
    </div>
  );
}
