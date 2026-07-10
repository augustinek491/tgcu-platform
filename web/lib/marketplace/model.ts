/**
 * Marketplace domain model + the server-owned deal state machine and escrow ledger
 * rules (FR-MKTPL-31/41, DR-14). Pure logic — mirrors what Cloud Functions enforce in
 * production; the demo drives the same transition table client-side. Money integrity:
 * only buyer-confirm or the audited auto-release timer moves escrow (FR-MKTPL-52).
 */

export type ListingType = "sell" | "buy";
export type Grade = "EAS2-Grade1" | "EAS2-Grade2" | "EAS2-Grade3" | "ungraded";

export const GRADE_LABEL: Record<Grade, string> = {
  "EAS2-Grade1": "EAS 2 · Grade 1",
  "EAS2-Grade2": "EAS 2 · Grade 2",
  "EAS2-Grade3": "EAS 2 · Grade 3",
  ungraded: "Ungraded",
};

export type Party = {
  orgId: string;
  name: string;
  initials: string;
  verified: boolean;
  rating?: number;
  deals: number;
  anchorBuyer?: boolean;
};

/** A reference-price anchor whose figure, source and period are derived together
 * from the canonical market-data engine — one source label per figure (CON-R2-01). */
export type ListingReference = {
  ugxPerKg: number;
  /** Which figure this is: a reporting market's latest (e.g. "Mbale") or the
   * national average when the listing market is not reporting. */
  basis: string;
  /** The commodity series' own canonical source label. */
  source: string;
  /** Month label of the observation, e.g. "Jun 2026". */
  asOf: string;
};

export type Listing = {
  listingId: string;
  type: ListingType;
  commodity: string;
  quantityKg: number;
  grade: Grade;
  priceUGXPerKg: number | null; // null = open to offers
  reference: ListingReference;
  market: string;
  region: string;
  logistics: "Seller delivers" | "Buyer collects" | "—";
  group?: boolean;
  groupNote?: string;
  seller: Party;
  createdAt: string;
};

// ── Deal state machine ────────────────────────────────────────────────────────
export type DealState =
  | "agreed"
  | "funded"
  | "in_transit"
  | "delivered"
  | "completed"
  | "disputed"
  | "cancelled";

export const DEAL_TRANSITIONS: Record<DealState, DealState[]> = {
  agreed: ["funded", "cancelled"],
  funded: ["in_transit", "disputed"],
  in_transit: ["delivered", "disputed"],
  delivered: ["completed", "disputed"],
  disputed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const TERMINAL_STATES: DealState[] = ["completed", "cancelled"];

export function canTransition(from: DealState, to: DealState): boolean {
  return DEAL_TRANSITIONS[from].includes(to);
}

export const DEAL_STEPS: { state: DealState; label: string }[] = [
  { state: "agreed", label: "Agreed" },
  { state: "funded", label: "Funded" },
  { state: "in_transit", label: "In transit" },
  { state: "delivered", label: "Delivered" },
  { state: "completed", label: "Completed" },
];

// ── Escrow ledger ─────────────────────────────────────────────────────────────
export type EscrowState = "none" | "held" | "released" | "refunded" | "frozen";

export type EscrowLedger = {
  funded: number;
  released: number;
  refunded: number;
  state: EscrowState;
};

/** Ledger invariant: held == funded − released − refunded (FR-MKTPL-41). */
export function escrowHeld(l: EscrowLedger): number {
  return l.funded - l.released - l.refunded;
}
export function escrowInvariantHolds(l: EscrowLedger, expectedHeld: number): boolean {
  return escrowHeld(l) === expectedHeld;
}

// ── Tracking (Tagtel seam) ────────────────────────────────────────────────────
export type TrackingMilestone = {
  label: string;
  at: string;
  note?: string;
  done: boolean;
};

export type Deal = {
  dealId: string;
  listing: Pick<Listing, "commodity" | "quantityKg" | "grade">;
  seller: Party;
  buyer: Party;
  priceUGXPerKg: number;
  state: DealState;
  autoReleaseDays: number;
  transporter?: { name: string; vehicle: string };
};

export function dealAmount(d: Pick<Deal, "listing" | "priceUGXPerKg">): number {
  return d.listing.quantityKg * d.priceUGXPerKg;
}
