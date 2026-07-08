/**
 * Membership tiers + entitlement catalogue — the single source of truth for entitlement
 * KEYS and the tier→entitlement mapping (FR-MEM-11 / FR-MEM-11.1). The v1 model is
 * history-depth (SCOPE §6). Higher tiers are a strict superset of lower ones (FR-MEM-10).
 * Pricing is "announced at launch" (open business decision — not invented here).
 */

export type TierId = "bronze" | "silver" | "gold" | "platinum";

/** Canonical entitlement keys — no other module may coin a variant (FR-MEM-11). */
export type EntitlementKey =
  | "market_data.current_prices"
  | "market_data.trends_dashboard"
  | "market_data.full_history_export"
  | "market_data.forecasts_view"
  | "market_data.full_database"
  | "directory.full_contact_visibility"
  | "support.priority"
  | "reports.custom"
  | "marketplace.browse"
  | "marketplace.trade"
  | "logistics.tracking";

export type Tier = {
  id: TierId;
  name: string;
  rank: number;
  tagline: string;
  /** History depth headline for this tier. */
  historyLabel: string;
  /** Entitlements this tier ADDS (cumulative resolution below). */
  grants: EntitlementKey[];
  /** Marketing feature bullets (from the tiers mockup). */
  features: string[];
  popular?: boolean;
  /** CSS var for the tier accent (chips/cards only — DESIGN-SYSTEM §2). */
  accentVar: string;
};

export const TIERS: Tier[] = [
  {
    id: "bronze",
    name: "Bronze",
    rank: 1,
    tagline: "Get started with current prices",
    historyLabel: "3-month price history",
    grants: ["market_data.current_prices", "marketplace.browse"],
    features: [
      "Current market prices, updated monthly",
      "3-month price history",
      "All reporting markets & commodities",
    ],
    accentVar: "var(--tier-bronze)",
  },
  {
    id: "silver",
    name: "Silver",
    rank: 2,
    tagline: "Look further back",
    historyLabel: "6-month price history",
    grants: ["market_data.trends_dashboard", "directory.full_contact_visibility"],
    features: ["Everything in Bronze", "6-month price history", "Seasonal comparison view"],
    accentVar: "var(--tier-silver)",
  },
  {
    id: "gold",
    name: "Gold",
    rank: 3,
    tagline: "Long-term analysis & advantage",
    historyLabel: "Full historical data",
    grants: ["market_data.full_history_export"],
    features: [
      "Everything in Silver",
      "Full historical data",
      "Long-term trend analysis",
      "CSV export with provenance",
    ],
    popular: true,
    accentVar: "var(--tier-gold)",
  },
  {
    id: "platinum",
    name: "Platinum",
    rank: 4,
    tagline: "Total visibility",
    historyLabel: "Full TGCU price database",
    grants: [
      "market_data.full_database",
      "logistics.tracking",
      "support.priority",
      "reports.custom",
    ],
    features: [
      "Everything in Gold",
      "Full TGCU price database",
      "Tagtel real-time goods-in-transit tracking",
      "Priority support",
    ],
    accentVar: "var(--tier-platinum)",
  },
];

export function tierById(id: TierId): Tier {
  return TIERS.find((t) => t.id === id)!;
}

/** Cumulative entitlement set for a tier (this tier + all lower ranks). */
export function tierEntitlements(id: TierId): Set<EntitlementKey> {
  const rank = tierById(id).rank;
  const keys = TIERS.filter((t) => t.rank <= rank).flatMap((t) => t.grants);
  return new Set(keys);
}
