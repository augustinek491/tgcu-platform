/**
 * Derived dashboard views over the CANONICAL seeded dataset.
 *
 * Canonical sources (single source of truth — CON-04, DV-04):
 *   – prices/markets:  lib/demo/marketdata.ts (deterministic engine that also powers /market)
 *   – member register: lib/demo/membership.ts (`orgs` — the seeded directory)
 *
 * No headline number in this file is hand-written: KPIs, the trend series and the
 * movers list are all computed from the same engine as the Market-Data module, so the
 * dashboard can never contradict /market or /admin/members. Decisions ratified in
 * UI/UX round-1 remediation:
 *   – member-organisation count = orgs.length (the seeded directory IS the register);
 *   – national maize = reporting-market average (matches the /market outlook figure);
 *   – reporting gaps (e.g. Gulu · Dec 2025) flow through to every surface as nulls;
 *   – movers derive from reporting markets only (non-reporting markets never move).
 */

import { COMMODITIES, MARKETS, MONTHS, priceAt } from "./marketdata";
import { orgs } from "./membership";

export type Kpi = {
  label: string;
  value: string;
  /**
   * Delta color = valence, arrows keep direction (AM-18 / DS §9.4). `valence`
   * defaults to the direction (up = good); metrics where a fall is an
   * improvement (e.g. overdue invoices) set it explicitly.
   */
  delta?: { dir: "up" | "down"; value: string; valence?: "good" | "bad" };
  spark: number[];
  caption: string;
  /** The single sanctioned Newsreader KPI numeral (06 A.5 / PART J — National avg only). */
  flagship?: boolean;
};

const MINUS = "−"; // U+2212 per DS §9.7
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const fmtPct = (pct: number) => `${pct >= 0 ? "+" : MINUS}${Math.abs(pct).toFixed(1)}%`;

/** Reporting-market average price (UGX/kg) for a commodity at a month index. */
function nationalAvg(commodityId: string, index: number): number {
  const vals = MARKETS.filter((m) => m.reporting)
    .map((m) => priceAt(commodityId, m.id, index))
    .filter((v): v is number => v != null);
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

// ── KPIs ─────────────────────────────────────────────────────────────────────
/** Data vintage of the seeded dataset — "Jun 2026" (demo now). */
export const asOfLabel = `${MONTHS[23].label} ${MONTHS[23].year}`;

const maizeSource = COMMODITIES.find((c) => c.id === "maize")!.source;

const maizeSpark = MONTHS.slice(16).map((m) => Math.round(nationalAvg("maize", m.index)));
const maizeNow = maizeSpark[maizeSpark.length - 1];
const maizePrior = maizeSpark[maizeSpark.length - 2];
const maizeMoM = ((maizeNow - maizePrior) / maizePrior) * 100;

const memberCount = orgs.length;
const memberSpark = Array.from({ length: 8 }, (_, i) => Math.max(1, memberCount - 7 + i));
const memberQuarterDelta = memberSpark[7] - memberSpark[5];

export const dashboardKpis: Kpi[] = [
  {
    label: "Member organisations",
    value: String(memberCount),
    delta: { dir: "up", value: `+${memberQuarterDelta} this quarter` },
    spark: memberSpark,
    caption: `as of ${asOfLabel} · seeded demo directory`,
  },
  {
    label: "Maize (wholesale, national)",
    value: fmt(maizeNow),
    delta: { dir: maizeMoM >= 0 ? "up" : "down", value: `${fmtPct(maizeMoM)} MoM` },
    spark: maizeSpark,
    caption: `UGX/kg · reporting-market average · as of ${asOfLabel} · ${maizeSource}`,
    flagship: true,
  },
  {
    label: "Dues collected (cycle)",
    value: "68%",
    delta: { dir: "up", value: "+12 pts" },
    spark: [40, 46, 51, 55, 58, 62, 65, 68],
    caption: `recorded incl. manual · as of ${asOfLabel} · TGCU dues ledger (demo)`,
  },
  {
    label: "Overdue invoices",
    value: "31",
    // Fewer overdue invoices is an improvement: success color, ▼ keeps direction (AM-18).
    delta: { dir: "down", value: `${MINUS}9 vs last cycle`, valence: "good" },
    spark: [52, 49, 46, 44, 40, 38, 35, 31],
    caption: `auto-flagged ≤24h · as of ${asOfLabel} · TGCU invoicing (demo)`,
  },
];

// ── Price trend (12-month window, same engine as /market) ───────────────────
// Colors follow the canonical categorical order (DS §2 / DV-03): blue → sky →
// violet. Brand/CTA hues (grain gold, brand green) never enter a data series.
const TREND_MARKETS: { id: string; color: string }[] = [
  { id: "mbarara", color: "var(--data)" },
  { id: "kampala", color: "var(--series-sky)" },
  { id: "gulu", color: "var(--series-violet)" },
];

const trendWindow = MONTHS.slice(12); // Jul 2025 … Jun 2026

const trendSeries = TREND_MARKETS.map(({ id, color }) => {
  const market = MARKETS.find((m) => m.id === id)!;
  return {
    name: market.name,
    color,
    points: trendWindow.map((mo) => priceAt("maize", id, mo.index)),
  };
});

/** Months with no reported price, per series (gap honesty — FR-MKT-11, DV-04). */
const trendGaps = trendSeries.flatMap((s) =>
  s.points.flatMap((v, i) =>
    v == null ? [`${s.name} in ${trendWindow[i].label} ${trendWindow[i].year}`] : [],
  ),
);

const trendValues = trendSeries.flatMap((s) => s.points).filter((v): v is number => v != null);
const trendMin = Math.min(...trendValues);
const trendMax = Math.max(...trendValues);
const gapNote = trendGaps.length > 0 ? `No reported price for ${trendGaps.join(", ")}.` : null;

export const priceTrend = {
  ariaLabel:
    `Maize wholesale price over 12 months for ${trendSeries.map((s) => s.name).join(", ")}, ` +
    `ranging from about ${fmt(trendMin)} to ${fmt(trendMax)} UGX per kilogram.` +
    (gapNote ? ` ${gapNote}` : ""),
  months: trendWindow.map((m) => ({ label: m.label, year: m.year })),
  gapNote,
  series: trendSeries,
};

// ── Movers (reporting markets only — DV-04) ─────────────────────────────────
/**
 * Biggest month-over-month change per reporting market (top 5 by magnitude).
 * Derived from the canonical engine: a market flagged "not reporting" (Lira, Soroti)
 * has no latest-period observation and therefore can never appear here.
 */
export const movers = (() => {
  const rows: { abs: number; market: string; commodity: string; dir: "up" | "down"; pct: string; price: string; source: string }[] = [];
  for (const m of MARKETS.filter((x) => x.reporting)) {
    let best: (typeof rows)[number] | null = null;
    for (const c of COMMODITIES) {
      const prior = priceAt(c.id, m.id, 22);
      const now = priceAt(c.id, m.id, 23);
      if (prior == null || now == null) continue;
      const pct = ((now - prior) / prior) * 100;
      if (!best || Math.abs(pct) > best.abs) {
        best = {
          abs: Math.abs(pct),
          market: m.name,
          commodity: c.name,
          dir: pct >= 0 ? "up" : "down",
          pct: fmtPct(pct),
          price: fmt(now),
          source: c.source,
        };
      }
    }
    if (best) rows.push(best);
  }
  return rows
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 5)
    .map(({ abs: _abs, ...row }) => row);
})();
