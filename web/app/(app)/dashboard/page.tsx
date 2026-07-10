import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PriceTrendSvg } from "@/components/charts/PriceTrendSvg";
import { ChartTableSwitch } from "@/components/charts/ChartTableSwitch";
import { ChartMaximize } from "@/components/charts/ChartMaximize";
import { TrendDataTable } from "@/components/charts/TrendDataTable";
import { FreshnessIndicator } from "@/components/shell/FreshnessIndicator";
import { MoversCard, type MoverRow } from "@/components/market/MoversCard";
import { dashboardKpis, movers, priceTrend, asOfLabel } from "@/lib/demo/data";

export const metadata: Metadata = { title: "Dashboard" };

const TREND_SOURCE = "MAAIF / TGCU tracker";

export default function DashboardPage() {
  const moverSources = [...new Set(movers.map((m) => m.source))].join(" · ");
  // Market-level movers → shared A.7 card rows (label · sparkline · value · delta).
  const moverRows: MoverRow[] = movers.map((m) => ({
    key: `${m.market}-${m.commodity}`,
    label: `${m.commodity} · ${m.market}`,
    spark: m.spark,
    value: m.price,
    delta: { dir: m.dir, text: m.pct },
  }));

  // Legend chips + table are shared by the in-card view and the A.6 full-screen modal.
  const trendLegend = (
    <div className="flex flex-wrap gap-4">
      {priceTrend.series.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-2 text-xs text-muted">
          <span className="size-2.5 rounded-full" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  );
  const trendTable = (
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
  );

  return (
    // A.1 rhythm: 32px between page regions, 24px grid gutters (LAY-01).
    <div className="space-y-8">
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

      <section aria-label="Key indicators" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <StatCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* min-w-0: the toggled data table scrolls in-card, never inflates the track */}
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Maize price trend</CardTitle>
              {/* Cadence named explicitly — monthly, never implied live (DV-R2-09) */}
              <p className="text-sm text-muted">Wholesale · UGX/kg · monthly · 12 months</p>
            </div>
            <FreshnessIndicator asOf={asOfLabel} source={TREND_SOURCE} />
          </CardHeader>
          <CardContent>
            <ChartTableSwitch
              label="Maize price trend"
              toolbar={trendLegend}
              actions={
                /* A.6 maximize-2 → full-screen chart modal (DV-R2-03) */
                <ChartMaximize label="Maize price trend — full screen">
                  <ChartTableSwitch
                    label="Maize price trend (full screen)"
                    toolbar={trendLegend}
                    chart={<PriceTrendSvg plotHeights="h-[56vh] min-h-[280px]" source={TREND_SOURCE} />}
                    table={trendTable}
                  />
                  <p className="mt-3 text-xs text-muted">
                    Wholesale · UGX/kg · monthly · as of {asOfLabel} · {TREND_SOURCE}
                  </p>
                </ChartMaximize>
              }
              chart={<PriceTrendSvg source={TREND_SOURCE} />}
              table={trendTable}
            />
          </CardContent>
        </Card>

        {/* A.7 movers card — shared treatment with /market (DV-R2-01) */}
        <MoversCard
          subtitle="Biggest month-over-month changes"
          rows={moverRows}
          footerHref="/market"
          emptyAction={{ href: "/market", label: "Open market data →" }}
          asOf={asOfLabel}
          sources={moverSources}
        />
      </div>
    </div>
  );
}
