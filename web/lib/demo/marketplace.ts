import type { Deal, Grade, Listing, ListingReference, ListingType, Party } from "@/lib/marketplace/model";
import { COMMODITIES, MARKETS, MONTHS, priceAt } from "./marketdata";
import { orgs } from "./membership";

/**
 * Seeded marketplace demo data — synthetic, sandbox, no real funds/goods (SCOPE §5.1,
 * FR-MKTPL-40 demo-money honesty). Shaped like the Firestore listings/deals model.
 * The signed-in demo member is a verified buyer in good standing.
 *
 * Honesty invariants (round-2 CON-R2-01 / CON-R2-04 — nothing here is hand-written
 * where the canon can supply it):
 *   – Counterparties come from the canonical member register (lib/demo/membership.ts
 *     `orgs`); "Verified" mirrors full KYC (level 2) in that register — never invented.
 *   – Reference prices DERIVE from the canonical market-data engine
 *     (lib/demo/marketdata.ts) at the latest period, carrying the commodity series'
 *     own source label — so every "Reference … · as of Jun 2026" line is
 *     arithmetically true and single-sourced. A non-reporting market (e.g. Lira)
 *     gets the national reporting-market average, labelled as such — never a
 *     fabricated local figure.
 */

const LATEST = MONTHS[23]; // Jun 2026 — the demo "now"
const AS_OF = `${LATEST.label} ${LATEST.year}`;

/** Marketplace display names for engine commodity ids (filters use these). */
const COMMODITY_DISPLAY = {
  maize: "Maize",
  beans: "Beans",
  rice: "Rice",
  sorghum: "Sorghum",
} as const;

type CommodityId = keyof typeof COMMODITY_DISPLAY;

/** Party derived from the member register — name and verification are read from the
 * canonical roster (verified = full KYC, level 2), only trade stats are seeded. */
function partyFromOrg(
  orgId: string,
  trade: { initials: string; rating?: number; deals: number; anchorBuyer?: boolean },
): Party {
  const org = orgs.find((o) => o.orgId === orgId);
  if (!org) throw new Error(`marketplace seed references an unregistered org: ${orgId}`);
  return { orgId, name: org.legalName, verified: org.kycLevel === 2, ...trade };
}

/** Reference anchor derived from the canonical engine — one source label per figure. */
function referenceFor(commodityId: CommodityId, marketId: string): ListingReference {
  const commodity = COMMODITIES.find((c) => c.id === commodityId)!;
  const market = MARKETS.find((m) => m.id === marketId)!;
  const local = priceAt(commodityId, marketId, LATEST.index);
  if (local != null) {
    return { ugxPerKg: local, basis: market.name, source: commodity.source, asOf: AS_OF };
  }
  // Latest-period gap (non-reporting market): fall back to the national
  // reporting-market average — the same population movers()/nationalOutlook() use.
  const vals = MARKETS.filter((m) => m.reporting)
    .map((m) => priceAt(commodityId, m.id, LATEST.index))
    .filter((v): v is number => v != null);
  return {
    ugxPerKg: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
    basis: `national avg — ${market.name} not reporting`,
    source: commodity.source,
    asOf: AS_OF,
  };
}

/** Listing whose market/region/commodity/reference all derive from canonical ids. */
function listing(seed: {
  listingId: string;
  type: ListingType;
  commodityId: CommodityId;
  quantityKg: number;
  grade: Grade;
  priceUGXPerKg: number | null;
  marketId: string;
  logistics: Listing["logistics"];
  group?: boolean;
  groupNote?: string;
  seller: Party;
  createdAt: string;
}): Listing {
  const { commodityId, marketId, ...rest } = seed;
  const market = MARKETS.find((m) => m.id === marketId)!;
  return {
    ...rest,
    commodity: COMMODITY_DISPLAY[commodityId],
    market: market.name,
    region: market.region,
    reference: referenceFor(commodityId, marketId),
  };
}

export const CURRENT_MEMBER: Party = partyFromOrg("org_aponye", {
  initials: "AP",
  rating: 4.8,
  deals: 52,
});

/** Mbale Produce Dealers appears on two listings + the active deal — one Party object
 * so its stats can never diverge across surfaces. */
const mbaleProduce = partyFromOrg("org_mbale_produce", { initials: "MP", rating: 4.8, deals: 63 });

export const LISTINGS: Listing[] = [
  listing({
    listingId: "lst_mbarara_grain",
    type: "buy",
    commodityId: "maize",
    quantityKg: 120000,
    grade: "EAS2-Grade1",
    priceUGXPerKg: 2250, // anchor buyer bids above the Kampala reference to attract volume
    marketId: "kampala",
    logistics: "—",
    seller: partyFromOrg("org_mbarara_grain", { initials: "MG", rating: 4.9, deals: 214, anchorBuyer: true }),
    createdAt: "2026-07-06",
  }),
  listing({
    listingId: "lst_jinja_exporters",
    type: "buy",
    commodityId: "beans",
    quantityKg: 80000,
    grade: "EAS2-Grade2",
    priceUGXPerKg: null,
    marketId: "jinja",
    logistics: "—",
    seller: partyFromOrg("org_jinja_exporters", { initials: "JE", rating: 4.7, deals: 96, anchorBuyer: true }),
    createdAt: "2026-07-05",
  }),
  listing({
    listingId: "lst_mbale_maize",
    type: "sell",
    commodityId: "maize",
    quantityKg: 40000,
    grade: "EAS2-Grade1",
    priceUGXPerKg: 1980, // asks just under the Mbale reference (2,020)
    marketId: "mbale",
    logistics: "Seller delivers",
    seller: mbaleProduce,
    createdAt: "2026-07-04",
  }),
  listing({
    listingId: "lst_masindi_beans",
    type: "sell",
    commodityId: "beans",
    quantityKg: 25000,
    grade: "EAS2-Grade2",
    priceUGXPerKg: 2950, // just under the Masindi reference (3,000)
    marketId: "masindi",
    logistics: "Buyer collects",
    seller: partyFromOrg("org_masindi_coop", { initials: "MC", rating: 4.6, deals: 41 }),
    createdAt: "2026-07-04",
  }),
  listing({
    listingId: "lst_lira_sorghum",
    type: "sell",
    commodityId: "sorghum",
    quantityKg: 60000,
    grade: "EAS2-Grade2",
    priceUGXPerKg: null,
    marketId: "lira", // not reporting in Jun 2026 → national-average reference, labelled
    logistics: "Seller delivers",
    group: true,
    groupNote: "Group listing · 3 cooperatives",
    seller: partyFromOrg("org_lira_farmers", { initials: "LF", rating: 4.9, deals: 88 }),
    createdAt: "2026-07-03",
  }),
  listing({
    listingId: "lst_gulu_maize",
    type: "sell",
    commodityId: "maize",
    quantityKg: 32000,
    grade: "ungraded",
    priceUGXPerKg: 1790, // just under the Gulu reference (1,830)
    marketId: "gulu",
    logistics: "Buyer collects",
    // KYC level 1 in the register → renders unverified (the "Verified sellers only"
    // filter case) — truthfully, not via an invented org.
    seller: partyFromOrg("org_gulu_traders", { initials: "GT", deals: 0 }),
    createdAt: "2026-07-02",
  }),
  listing({
    listingId: "lst_mbale_rice",
    type: "sell",
    commodityId: "rice", // rice series is FAO GIEWS/FPMA-sourced — label derives with it
    quantityKg: 18000,
    grade: "ungraded",
    priceUGXPerKg: 3750, // just under the Mbale rice reference (3,790)
    marketId: "mbale",
    logistics: "Buyer collects",
    seller: mbaleProduce,
    createdAt: "2026-07-01",
  }),
];

export const TOTAL_ACTIVE = 24;

/** The member's active in-progress deal — derived from the Mbale maize listing so the
 * marketplace card, deal room and escrow figures can never disagree (same lot, same
 * ask, same registered seller). */
const dealListing = LISTINGS.find((l) => l.listingId === "lst_mbale_maize")!;

export const ACTIVE_DEAL: Deal = {
  dealId: "TGCU-4821",
  listing: {
    commodity: dealListing.commodity,
    quantityKg: dealListing.quantityKg,
    grade: dealListing.grade,
  },
  seller: dealListing.seller,
  buyer: CURRENT_MEMBER,
  priceUGXPerKg: dealListing.priceUGXPerKg!, // agreed at the listing ask
  state: "in_transit",
  autoReleaseDays: 7,
  transporter: { name: "Kagera Freight Services", vehicle: "Isuzu FVR · plate UBK 742J" },
};

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.listingId === id);
}
