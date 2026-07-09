import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { DeltaPill } from "@/components/ui/delta-pill";
import { PriceTrendSvg } from "@/components/charts/PriceTrendSvg";
import { ChartTableSwitch } from "@/components/charts/ChartTableSwitch";
import { TrendDataTable } from "@/components/charts/TrendDataTable";
import { FreshnessIndicator } from "@/components/shell/FreshnessIndicator";
import { WheatSheafIllustration } from "@/components/illustrations/empty-states";
import { dashboardKpis, movers, priceTrend, asOfLabel } from "@/lib/demo/data";

export const metadata: Metadata = { title: "Dashboard" };

const TREND_SOURCE = "MAAIF / TGCU tracker";

export default function DashboardPage() {
  const moverSources = [...new Set(movers.map((m) => m.source))].join(" · ");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">National outlook</h1>
          <p className="mt-1 text-sm text-muted">
            Grain markets, membership and dues at a glance.
          </p>
        </div>
        <Badge variant="warning" aria-label="Demo data notice">
          Demo · seeded data
        </Badge>
      </div>

      <section aria-label="Key indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <StatCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* min-w-0: the toggled data table scrolls in-card, never inflates the track */}
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Maize price trend</CardTitle>
              <p className="text-sm text-muted">Wholesale · UGX/kg · 12 months</p>
            </div>
            <FreshnessIndicator asOf={asOfLabel} source={TREND_SOURCE} />
          </CardHeader>
          <CardContent>
            <ChartTableSwitch
              label="Maize price trend"
              toolbar={
                <div className="flex flex-wrap gap-4">
                  {priceTrend.series.map((s) => (
                    <span key={s.name} className="inline-flex items-center gap-2 text-xs text-muted">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </span>
                  ))}
                </div>
              }
              chart={<PriceTrendSvg />}
              table={
                <TrendDataTable
                  seriesNames={priceTrend.series.map((s) => s.name)}
                  rows={priceTrend.months.map((m, i) => ({
                    period: `${m.label} ${m.year}`,
                    asOf: `${m.label} ${m.year}`,
                    values: priceTrend.series.map((s) => s.points[i]),
                  }))}
                  source={TREND_SOURCE}
                  caption="Maize monthly wholesale prices in UGX per kilogram by market, last 12 months"
                />
              }
            />
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Movers</CardTitle>
            <p className="text-sm text-muted">Biggest month-over-month changes</p>
          </CardHeader>
          <CardContent>
            {movers.length === 0 && (
              /* A.11/A.7 empty state — line-art family (PART I.2). Unreachable
                 with the seeded engine (movers always derive from reporting
                 markets) but designed, not an afterthought. */
              <div className="py-6 text-center">
                <WheatSheafIllustration size={64} className="mx-auto" />
                <p className="mt-2 text-sm text-muted">No moves this month</p>
              </div>
            )}
            <ul className="space-y-1">
              {movers.map((m) => (
                <li
                  key={`${m.market}-${m.commodity}`}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-2 transition-colors duration-[var(--dur-fast)] hover:bg-surface-2"
                >
                  <div>
                    <div className="text-sm font-medium text-fg">{m.commodity}</div>
                    <div className="text-xs text-muted">{m.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-sm font-medium text-fg">
                      {m.price} <span className="text-xs font-normal text-muted">UGX/kg</span>
                    </div>
                    <DeltaPill dir={m.dir} className="mt-0.5">
                      {m.pct}
                    </DeltaPill>
                  </div>
                </li>
              ))}
            </ul>
            {/* Card-level provenance (AF-9) */}
            <p className="mt-3 text-xs text-muted">
              as of {asOfLabel} · {moverSources}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
