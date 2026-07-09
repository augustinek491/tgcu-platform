import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeltaPill } from "@/components/ui/delta-pill";
import { MarketExplorer } from "@/components/market/MarketExplorer";
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

/** Mini sparkline geometry (06 A.7: w64 h20) — single-hue `--data` per ratified
 * DS §9.4/DV-05; direction is carried by the delta pill, never by color alone. */
function sparkPoints(vals: (number | null)[], w = 64, h = 20, pad = 2): string {
  const nums = vals.filter((v): v is number => v != null);
  if (nums.length < 2) return "";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return vals
    .map((v, i) =>
      v == null
        ? null
        : `${(pad + (i * (w - 2 * pad)) / (vals.length - 1)).toFixed(1)},${(max === min
            ? h / 2
            : pad + (h - 2 * pad) * (1 - (v - min) / (max - min))
          ).toFixed(1)}`,
    )
    .filter(Boolean)
    .join(" ");
}

export default function MarketPage() {
  const org = currentOrg();
  const tier = tierById(org.tierId);
  const maxRange = HISTORY_BY_TIER[org.tierId];
  const outlook = nationalOutlook();
  const movementList = movers();
  const periodLabel = `${outlook.period.label} ${outlook.period.year}`;
  // Union of the canonical source labels behind the cross-commodity aggregates (AF-9).
  const aggregateSources = [...new Set(COMMODITIES.map((c) => c.source))].join(" · ");

  return (
    <div className="space-y-6">
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
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Movers</CardTitle>
              <p className="text-sm text-muted">
                Month-over-month · national average, UGX/kg · {movementList[0].fromMonth.label} →{" "}
                {movementList[0].toMonth.label} {movementList[0].toMonth.year}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {movementList.map((m) => (
                  <li
                    key={m.commodity.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] px-2 py-2 transition-colors duration-[var(--dur-fast)] hover:bg-surface-2"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-fg">
                      {m.commodity.name}
                    </span>
                    {/* Mini sparkline (A.7/DV-07) — decorative; the value + pill
                        are the data record. 8-month reporting-market average. */}
                    <svg
                      viewBox="0 0 64 20"
                      width="64"
                      height="20"
                      aria-hidden="true"
                      className="ml-auto shrink-0 text-[var(--data)]"
                    >
                      <polyline
                        points={sparkPoints(nationalSeries(m.commodity.id, 8))}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-right">
                      <div className="tabular text-sm text-fg">{m.latest.toLocaleString()}</div>
                      <DeltaPill dir={m.dir} className="mt-0.5">
                        {m.pct >= 0 ? "+" : "−"}
                        {Math.abs(m.pct).toFixed(1)}%
                      </DeltaPill>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Footer link (A.7/DV-07) — the dashboard carries the
                  market-level movers list */}
              <Link
                href="/dashboard"
                className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-brand-interactive hover:underline"
              >
                View all movers →
              </Link>
              {/* Card-level provenance (AF-9) */}
              <p className="mt-1 text-xs text-muted">
                as of {periodLabel} · {aggregateSources}
              </p>
            </CardContent>
          </Card>
        }
      />

      {/* Honest forecasting note (FR-MKT-19/23 — v1 = historical + seasonal only) */}
      <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-2 p-4 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          v1 shows <span className="font-medium text-fg">historical data and seasonal context only</span> —
          no price forecasts. Model-driven forecasting arrives in a later release, limited to
          well-covered markets with backtested intervals, and is always{" "}
          <span className="font-medium text-fg">informational, not financial advice</span>.
        </p>
      </div>
    </div>
  );
}
