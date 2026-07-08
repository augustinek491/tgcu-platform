import type { Metadata } from "next";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PriceTrendSvg } from "@/components/charts/PriceTrendSvg";
import { FreshnessIndicator } from "@/components/shell/FreshnessIndicator";
import { dashboardKpis, movers, priceTrend } from "@/lib/demo/data";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
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
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Maize price trend</CardTitle>
              <p className="text-sm text-muted">Wholesale · UGX/kg · 12 months</p>
            </div>
            <FreshnessIndicator asOf="Jun 2026" source="MAAIF / TGCU tracker" />
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-4">
              {priceTrend.series.map((s) => (
                <span key={s.name} className="inline-flex items-center gap-2 text-xs text-muted">
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
            <PriceTrendSvg />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movers</CardTitle>
            <p className="text-sm text-muted">Biggest month-on-month changes</p>
          </CardHeader>
          <CardContent className="space-y-1">
            {movers.map((m) => {
              const up = m.dir === "up";
              return (
                <div
                  key={`${m.market}-${m.commodity}`}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-2 hover:bg-surface-2"
                >
                  <div>
                    <div className="text-sm font-medium text-fg">{m.commodity}</div>
                    <div className="text-xs text-muted">{m.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-sm font-medium text-fg">{m.price}</div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                    >
                      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {m.pct}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
