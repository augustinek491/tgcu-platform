import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketExplorer } from "@/components/market/MarketExplorer";
import { CommoditiesMap } from "@/components/market/CommoditiesMap";
import { movers, nationalOutlook, HISTORY_BY_TIER } from "@/lib/demo/marketdata";
import { currentOrg } from "@/lib/demo/membership";
import { tierById } from "@/lib/membership/tiers";

export const metadata: Metadata = { title: "Market Data" };

export default function MarketPage() {
  const org = currentOrg();
  const tier = tierById(org.tierId);
  const maxRange = HISTORY_BY_TIER[org.tierId];
  const outlook = nationalOutlook();
  const movementList = movers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">Market Data & Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Monthly wholesale grain prices with provenance — never presented as live.
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
            <CardTitle>National outlook — {outlook.period.label} {outlook.period.year}</CardTitle>
            <p className="text-sm text-muted">
              Month-over-month direction · {outlook.reporting} of {outlook.total} markets reporting
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {outlook.commodities.map((c) => {
              const up = c.dir === "up";
              return (
                <div key={c.name} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <div className="text-sm font-medium text-fg">{c.name}</div>
                  <div className="tabular mt-1 text-lg font-semibold text-fg">
                    {c.price.toLocaleString()}
                  </div>
                  <div
                    className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                  >
                    {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {c.pct >= 0 ? "+" : ""}
                    {c.pct.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive explorer (trend + comparison) */}
      <MarketExplorer maxRange={maxRange} tierName={tier.name} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Movers — MoM labelled (FR-MKT-13) */}
        <Card>
          <CardHeader>
            <CardTitle>Movers</CardTitle>
            <p className="text-sm text-muted">
              Month-over-month · {movementList[0].fromMonth.label} → {movementList[0].toMonth.label}
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            {movementList.map((m) => {
              const up = m.dir === "up";
              return (
                <div
                  key={m.commodity.id}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-2 hover:bg-surface-2"
                >
                  <span className="text-sm font-medium text-fg">{m.commodity.name}</span>
                  <div className="text-right">
                    <div className="tabular text-sm text-fg">{m.latest.toLocaleString()}</div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                    >
                      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {m.pct >= 0 ? "+" : ""}
                      {m.pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Map */}
        <div className="lg:col-span-2">
          <CommoditiesMap commodityId="maize" />
        </div>
      </div>

      {/* Honest forecasting note (FR-MKT-19/23 — v1 = historical + seasonal only) */}
      <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-2 p-4 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          v1 shows <span className="font-medium text-fg">historical data and seasonal context only</span> —
          no price forecasts. Model-driven forecasting arrives in a later phase, limited to
          well-covered markets with backtested intervals, and is always{" "}
          <span className="font-medium text-fg">informational, not financial advice</span>.
        </p>
      </div>
    </div>
  );
}
