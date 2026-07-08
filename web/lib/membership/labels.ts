import type { EntitlementKey } from "./tiers";

/** Human labels for entitlement keys (portal display — FR-MEM-51/54). */
export const ENTITLEMENT_LABEL: Record<EntitlementKey, string> = {
  "market_data.current_prices": "Current market prices",
  "market_data.trends_dashboard": "Trends dashboard & seasonal comparison",
  "market_data.full_history_export": "Full history + CSV export with provenance",
  "market_data.forecasts_view": "Price forecasts (informational)",
  "market_data.full_database": "Full TGCU price database access",
  "directory.full_contact_visibility": "Full member-directory contact visibility",
  "support.priority": "Priority support",
  "reports.custom": "Custom reports",
  "marketplace.browse": "Browse the marketplace",
  "marketplace.trade": "Trade on the marketplace (verified members)",
  "logistics.tracking": "Tagtel goods-in-transit tracking",
};

/** Order in which to present entitlements. */
export const ENTITLEMENT_ORDER: EntitlementKey[] = [
  "market_data.current_prices",
  "market_data.trends_dashboard",
  "market_data.full_history_export",
  "market_data.full_database",
  "market_data.forecasts_view",
  "directory.full_contact_visibility",
  "marketplace.browse",
  "marketplace.trade",
  "logistics.tracking",
  "reports.custom",
  "support.priority",
];
