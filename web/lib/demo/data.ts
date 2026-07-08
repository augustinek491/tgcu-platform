/**
 * Seeded demo data for the v1 demo. Synthetic, clearly labelled — never presented as
 * live/verified (SCOPE §5.1). Real reads come from the roll-up read models in later
 * slices; this keeps the foundation shell demonstrable with honest provenance cues.
 */

export type Kpi = {
  label: string;
  value: string;
  delta?: { dir: "up" | "down"; value: string };
  spark: number[];
  caption: string;
};

export const dashboardKpis: Kpi[] = [
  {
    label: "Member organisations",
    value: "412",
    delta: { dir: "up", value: "+7 this quarter" },
    spark: [380, 388, 391, 397, 402, 405, 409, 412],
    caption: "of 400+ tracked · directory",
  },
  {
    label: "Maize (wholesale, national)",
    value: "1,880",
    delta: { dir: "up", value: "+4.2% MoM" },
    spark: [1500, 1540, 1580, 1620, 1700, 1760, 1820, 1880],
    caption: "UGX/kg · as of Jun 2026",
  },
  {
    label: "Dues collected (cycle)",
    value: "68%",
    delta: { dir: "up", value: "+12 pts" },
    spark: [40, 46, 51, 55, 58, 62, 65, 68],
    caption: "recorded incl. manual · demo",
  },
  {
    label: "Overdue invoices",
    value: "31",
    delta: { dir: "down", value: "−9 vs last cycle" },
    spark: [52, 49, 46, 44, 40, 38, 35, 31],
    caption: "auto-flagged ≤24h",
  },
];

export const priceTrend = {
  ariaLabel:
    "Maize wholesale price over 12 months for Mbarara, Kampala and Gulu, all trending upward from around 1,500 to between 1,600 and 2,000 UGX per kilogram.",
  months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  series: [
    { name: "Mbarara", color: "var(--data)", points: [1500, 1520, 1545, 1580, 1650, 1710, 1760, 1810, 1870, 1930, 1990, 2050] },
    { name: "Kampala", color: "var(--grain-500)", points: [1440, 1480, 1500, 1560, 1620, 1660, 1720, 1760, 1820, 1870, 1940, 1880] },
    { name: "Gulu", color: "var(--series-sky)", points: [1360, 1390, 1430, 1470, 1540, 1590, 1650, 1700, 1760, 1810, 1870, 1620] },
  ],
};

export const movers = [
  { market: "Mbarara", commodity: "Maize", dir: "up" as const, pct: "+6.1%", price: "2,050" },
  { market: "Kampala", commodity: "Beans", dir: "up" as const, pct: "+3.4%", price: "3,120" },
  { market: "Lira", commodity: "Sorghum", dir: "down" as const, pct: "−2.2%", price: "1,180" },
  { market: "Jinja", commodity: "Rice", dir: "up" as const, pct: "+1.9%", price: "3,880" },
  { market: "Gulu", commodity: "Maize", dir: "down" as const, pct: "−1.4%", price: "1,620" },
];
