import type { Listing, Party, Deal } from "@/lib/marketplace/model";

/**
 * Seeded marketplace demo data — synthetic, sandbox, no real funds/goods (SCOPE §5.1,
 * FR-MKTPL-40 demo-money honesty). Shaped like the Firestore listings/deals model.
 * The signed-in demo member is a verified buyer in good standing.
 */

export const CURRENT_MEMBER: Party = {
  orgId: "org_aponye",
  name: "Aponye (U) Ltd",
  initials: "AP",
  verified: true,
  rating: 4.8,
  deals: 52,
};

const p = (o: Partial<Party> & Pick<Party, "orgId" | "name" | "initials">): Party => ({
  verified: true,
  deals: 0,
  ...o,
});

export const LISTINGS: Listing[] = [
  {
    listingId: "lst_ugm",
    type: "buy",
    commodity: "Maize",
    quantityKg: 120000,
    grade: "EAS2-Grade1",
    priceUGXPerKg: 1900,
    referenceUGXPerKg: 1820,
    market: "Kampala",
    region: "Central",
    logistics: "—",
    seller: p({ orgId: "org_ugm", name: "Uganda Grain Millers Ltd", initials: "UG", rating: 4.9, deals: 214, anchorBuyer: true }),
    createdAt: "2026-07-06",
  },
  {
    listingId: "lst_nile",
    type: "buy",
    commodity: "Beans",
    quantityKg: 80000,
    grade: "EAS2-Grade2",
    priceUGXPerKg: null,
    referenceUGXPerKg: 4650,
    market: "Jinja",
    region: "Eastern",
    logistics: "—",
    seller: p({ orgId: "org_nile", name: "Nile Foods Processing", initials: "NF", rating: 4.7, deals: 96, anchorBuyer: true }),
    createdAt: "2026-07-05",
  },
  {
    listingId: "lst_mbale",
    type: "sell",
    commodity: "Maize",
    quantityKg: 40000,
    grade: "EAS2-Grade1",
    priceUGXPerKg: 1780,
    referenceUGXPerKg: 1820,
    market: "Mbale",
    region: "Eastern",
    logistics: "Seller delivers",
    seller: p({ orgId: "org_mbale_coop", name: "Mbale Farmers Co-op", initials: "MC", rating: 4.8, deals: 63 }),
    createdAt: "2026-07-04",
  },
  {
    listingId: "lst_ankole",
    type: "sell",
    commodity: "Beans",
    quantityKg: 25000,
    grade: "EAS2-Grade2",
    priceUGXPerKg: 4520,
    referenceUGXPerKg: 4650,
    market: "Mbarara",
    region: "Western",
    logistics: "Buyer collects",
    seller: p({ orgId: "org_ankole", name: "Ankole Produce Ltd", initials: "AK", rating: 4.6, deals: 41 }),
    createdAt: "2026-07-04",
  },
  {
    listingId: "lst_lira_grp",
    type: "sell",
    commodity: "Maize",
    quantityKg: 60000,
    grade: "EAS2-Grade2",
    priceUGXPerKg: null,
    referenceUGXPerKg: 1820,
    market: "Lira",
    region: "Northern",
    logistics: "Seller delivers",
    group: true,
    groupNote: "Group listing · 3 cooperatives",
    seller: p({ orgId: "org_lira_assn", name: "Lira Area Growers Assn", initials: "LA", rating: 4.9, deals: 88 }),
    createdAt: "2026-07-03",
  },
  {
    listingId: "lst_gulu_rice",
    type: "sell",
    commodity: "Rice",
    quantityKg: 18000,
    grade: "ungraded",
    priceUGXPerKg: 4700,
    referenceUGXPerKg: 4780,
    market: "Gulu",
    region: "Northern",
    logistics: "Buyer collects",
    seller: p({ orgId: "org_sokello", name: "Samuel Okello", initials: "SO", verified: false, deals: 0 }),
    createdAt: "2026-07-02",
  },
  {
    listingId: "lst_ngt_sorghum",
    type: "sell",
    commodity: "Sorghum",
    quantityKg: 32000,
    grade: "EAS2-Grade1",
    priceUGXPerKg: 1940,
    referenceUGXPerKg: 1910,
    market: "Lira",
    region: "Northern",
    logistics: "Seller delivers",
    seller: p({ orgId: "org_ngt", name: "Northern Grain Traders", initials: "NG", rating: 4.5, deals: 37 }),
    createdAt: "2026-07-01",
  },
];

export const TOTAL_ACTIVE = 24;

/** The member's active in-progress deal (matches the mockup — funded, in transit). */
export const ACTIVE_DEAL: Deal = {
  dealId: "TGCU-4821",
  listing: { commodity: "Maize", quantityKg: 40000, grade: "EAS2-Grade1" },
  seller: p({ orgId: "org_mbale_coop", name: "Mbale Farmers Co-op", initials: "MC", rating: 4.8, deals: 63 }),
  buyer: CURRENT_MEMBER,
  priceUGXPerKg: 1780,
  state: "in_transit",
  autoReleaseDays: 7,
  transporter: { name: "Kagera Freight Services", vehicle: "Isuzu FVR · plate UBK 742J" },
};

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.listingId === id);
}
