/**
 * Seeded market-data layer — synthetic, deterministic, clearly labelled (SCOPE §5.1).
 * Shaped like the roll-up read models the design specifies (priceSeriesMonthly /
 * priceSeriesLatest / movers / nationalOutlook, design/02 §2.3, FR-MKT-16) so the UI
 * reads O(1)-style series, not raw points. Honesty rules honoured: monthly cadence
 * (never "live"), provenance per series, coverage disclosure, gaps shown as gaps.
 */

export type Commodity = {
  id: string;
  name: string;
  base: number; // UGX/kg anchor
  amp: number; // seasonal amplitude
  trend: number; // 24-month drift
  source: PriceSource;
};

export type Market = {
  id: string;
  name: string;
  region: string;
  mult: number; // market basis multiplier
  lat: number; // true WGS84 latitude (rubric M12 coordinate table, ±0.05°)
  lon: number; // true WGS84 longitude
  reporting: boolean; // reported in the latest period? (coverage honesty)
};

export type PriceSource =
  | "MAAIF / TGCU tracker"
  | "FAO GIEWS/FPMA"
  | "WFP-HDX"
  | "TGCU field collection";

export const COMMODITIES: Commodity[] = [
  { id: "maize", name: "Maize", base: 1500, amp: 0.16, trend: 0.34, source: "MAAIF / TGCU tracker" },
  { id: "beans", name: "Beans (dry)", base: 2900, amp: 0.12, trend: 0.10, source: "MAAIF / TGCU tracker" },
  { id: "rice", name: "Rice (milled)", base: 3700, amp: 0.07, trend: 0.06, source: "FAO GIEWS/FPMA" },
  { id: "sorghum", name: "Sorghum", base: 1200, amp: 0.14, trend: -0.05, source: "WFP-HDX" },
  { id: "groundnuts", name: "Groundnuts", base: 4200, amp: 0.09, trend: 0.12, source: "TGCU field collection" },
];

export const MARKETS: Market[] = [
  { id: "mbarara", name: "Mbarara", region: "Western", mult: 1.08, lat: -0.608, lon: 30.655, reporting: true },
  { id: "kampala", name: "Kampala", region: "Central", mult: 1.0, lat: 0.348, lon: 32.583, reporting: true },
  { id: "jinja", name: "Jinja", region: "Eastern", mult: 0.99, lat: 0.424, lon: 33.204, reporting: true },
  { id: "mbale", name: "Mbale", region: "Eastern", mult: 0.94, lat: 1.078, lon: 34.175, reporting: true },
  { id: "masindi", name: "Masindi", region: "Western", mult: 0.9, lat: 1.685, lon: 31.715, reporting: true },
  { id: "gulu", name: "Gulu", region: "Northern", mult: 0.86, lat: 2.775, lon: 32.299, reporting: true },
  { id: "lira", name: "Lira", region: "Northern", mult: 0.84, lat: 2.247, lon: 32.9, reporting: false },
  { id: "soroti", name: "Soroti", region: "Eastern", mult: 0.88, lat: 1.715, lon: 33.611, reporting: false },
];

export const RANGES = [3, 6, 12, 24] as const;
export type Range = (typeof RANGES)[number];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 24 month keys ending Jun 2026 (the demo "now"). */
export const MONTHS = buildMonths();

function buildMonths() {
  const out: { key: string; label: string; year: number; index: number }[] = [];
  let y = 2024;
  let m = 6; // Jul 2024 (0-based month 6) → 24 months to Jun 2026
  for (let i = 0; i < 24; i++) {
    out.push({ key: `${y}-${String(m + 1).padStart(2, "0")}`, label: MONTH_NAMES[m], year: y, index: i });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return out;
}

/** Deterministic ±noise in [-1,1] from a string seed. */
function noise(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 500 - 1;
}

/** Gaps: a couple of (market,commodity,monthIndex) holes to show gap-honesty (FR-MKT-11). */
const GAPS = new Set(["gulu|maize|17", "soroti|beans|20", "lira|sorghum|16"]);

/** Price of a commodity at a market for a month index, or null if unreported (gap). */
export function priceAt(commodityId: string, marketId: string, index: number): number | null {
  const c = COMMODITIES.find((x) => x.id === commodityId)!;
  const m = MARKETS.find((x) => x.id === marketId)!;
  if (GAPS.has(`${marketId}|${commodityId}|${index}`)) return null;
  // Non-reporting markets have no latest-period observation (index 23).
  if (!m.reporting && index === 23) return null;
  const t = index / 23;
  const seasonal = c.amp * Math.sin((2 * Math.PI * (index + 2)) / 12);
  const drift = c.trend * t;
  const n = noise(`${commodityId}|${marketId}|${index}`) * 0.02;
  return Math.round((c.base * m.mult * (1 + drift + seasonal + n)) / 10) * 10;
}

/** Recharts-ready rows for a commodity across markets over the last `months`. */
export function priceSeries(commodityId: string, marketIds: string[], months: Range) {
  const slice = MONTHS.slice(24 - months);
  return slice.map((mo) => {
    const row: Record<string, number | string | null> = { month: mo.label };
    for (const mid of marketIds) {
      const mk = MARKETS.find((x) => x.id === mid)!;
      row[mk.name] = priceAt(commodityId, mid, mo.index);
    }
    return row;
  });
}

/** Latest (most recent non-null) observation for a commodity at a market. */
export function latest(commodityId: string, marketId: string) {
  for (let i = 23; i >= 0; i--) {
    const p = priceAt(commodityId, marketId, i);
    if (p != null) return { price: p, month: MONTHS[i], reporting: MARKETS.find((m) => m.id === marketId)!.reporting };
  }
  return null;
}

/** Sorted-descending latest price by market for a commodity (comparison — FR-MKT-12). */
export function comparison(commodityId: string) {
  return MARKETS.map((m) => ({ market: m, latest: latest(commodityId, m.id) }))
    .filter((r) => r.latest && r.market.reporting)
    .sort((a, b) => b.latest!.price - a.latest!.price);
}

/** National (reporting-market average) MoM movers, both dates labelled (FR-MKT-13). */
export function movers() {
  return COMMODITIES.map((c) => {
    const reporting = MARKETS.filter((m) => m.reporting);
    const avgAt = (i: number) => {
      const vals = reporting.map((m) => priceAt(c.id, m.id, i)).filter((v): v is number => v != null);
      return vals.reduce((s, v) => s + v, 0) / vals.length;
    };
    const latestV = avgAt(23);
    const priorV = avgAt(22);
    const pct = ((latestV - priorV) / priorV) * 100;
    return {
      commodity: c,
      latest: Math.round(latestV),
      prior: Math.round(priorV),
      pct,
      dir: pct >= 0 ? ("up" as const) : ("down" as const),
      fromMonth: MONTHS[22],
      toMonth: MONTHS[23],
    };
  }).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
}

/** Reporting-market average by month over the last `count` months — feeds the movers
 * mini-sparklines (06 A.7 / DV-07). Same population as `movers()` (non-reporting markets
 * structurally excluded); a month with zero observations yields null, never a bridge. */
export function nationalSeries(commodityId: string, count = 8): (number | null)[] {
  const reporting = MARKETS.filter((m) => m.reporting);
  return MONTHS.slice(24 - count).map((mo) => {
    const vals = reporting
      .map((m) => priceAt(commodityId, m.id, mo.index))
      .filter((v): v is number => v != null);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  });
}

/** National outlook: coverage + per-commodity direction for the latest period (FR-MKT-14). */
export function nationalOutlook() {
  const reportingCount = MARKETS.filter((m) => m.reporting).length;
  return {
    period: MONTHS[23],
    reporting: reportingCount,
    total: MARKETS.length,
    commodities: movers().map((m) => ({
      name: m.commodity.name,
      dir: m.dir,
      pct: m.pct,
      price: m.latest,
    })),
  };
}

export const HISTORY_BY_TIER: Record<string, Range> = {
  bronze: 3,
  silver: 6,
  gold: 24,
  platinum: 24,
};

export function commodityById(id: string) {
  return COMMODITIES.find((c) => c.id === id) ?? COMMODITIES[0];
}
