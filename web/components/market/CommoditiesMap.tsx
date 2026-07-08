import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MARKETS, latest, commodityById } from "@/lib/demo/marketdata";

/**
 * National commodities map (FR-MKT-17/18). Coverage honesty: reporting markets get a
 * filled, price-scaled pin; non-reporting markets render as a distinct hollow "no data"
 * marker — never a stale price shown as current. Ships a table fallback (a11y, NFR-99).
 * A stylised Uganda outline (not MapLibre) keeps the demo offline + tile-key-free; the
 * design's MapLibre choropleth is the production upgrade once a tile source is chosen.
 */
export function CommoditiesMap({ commodityId = "maize" }: { commodityId?: string }) {
  const commodity = commodityById(commodityId);
  const rows = MARKETS.map((m) => ({ market: m, latest: latest(commodityId, m.id) }));
  const prices = rows.filter((r) => r.market.reporting && r.latest).map((r) => r.latest!.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const reportingCount = MARKETS.filter((m) => m.reporting).length;

  const radius = (p: number) => 4 + ((p - min) / (max - min || 1)) * 6;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>National footprint — {commodity.name}</CardTitle>
          <p className="text-sm text-muted">Latest price by market · darker = higher</p>
        </div>
        <span className="rounded-[var(--radius-pill)] bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
          {reportingCount} of {MARKETS.length} markets reporting
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
          <svg
            viewBox="0 0 220 180"
            width="100%"
            height="200"
            role="img"
            aria-label={`Map of Uganda showing ${commodity.name} prices at reporting markets; non-reporting markets marked no data.`}
          >
            <path
              d="M40 60 Q35 40 55 34 L92 26 Q120 20 140 30 L175 40 Q198 48 196 70 L192 104 Q190 130 168 140 L150 150 Q120 162 92 152 L60 140 Q38 132 38 108 Z"
              fill="var(--brand-300)"
              fillOpacity="0.18"
              stroke="var(--brand-600)"
              strokeWidth="1.4"
              strokeOpacity="0.5"
            />
            {rows.map(({ market, latest: l }) => {
              if (!market.reporting || !l) {
                return (
                  <g key={market.id}>
                    <circle
                      cx={market.x}
                      cy={market.y}
                      r="4"
                      fill="var(--color-surface)"
                      stroke="var(--color-muted)"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />
                  </g>
                );
              }
              const op = 0.45 + ((l.price - min) / (max - min || 1)) * 0.55;
              return (
                <circle
                  key={market.id}
                  cx={market.x}
                  cy={market.y}
                  r={radius(l.price)}
                  fill="var(--data)"
                  fillOpacity={op}
                >
                  <title>
                    {market.name}: {l.price.toLocaleString()} UGX/kg (as of {l.month.label}{" "}
                    {l.month.year})
                  </title>
                </circle>
              );
            })}
          </svg>

          {/* Table fallback (a11y + coverage honesty) */}
          <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <tbody>
                {rows.map(({ market, latest: l }) => (
                  <tr key={market.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-1.5 text-fg">{market.name}</td>
                    <td className="px-3 py-1.5 text-xs text-muted">{market.region}</td>
                    <td className="px-3 py-1.5 text-right">
                      {market.reporting && l ? (
                        <span className="tabular font-medium text-fg">
                          {l.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">no recent data</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
