import { submissions } from "./admin";
import { LISTINGS } from "./marketplace";

/**
 * Seeded notifications for the topbar bell — synthetic, clearly labelled
 * (SCOPE §5.1). Every item cross-references a record that actually exists in
 * the canonical seed (submissions, audit log, membership, marketdata gaps,
 * listings), so the bell never announces something the platform can't show.
 * Figures and names are DERIVED from those records (CON-R2-01/04/06): the
 * flagged-submission delta computes from the stored benchmark, and the listing
 * announcement reads straight from the marketplace seed. Prose currency uses
 * the DS §9.7 form ("UGX 2,250/kg").
 */

export type SeededNotification = {
  id: string;
  title: string;
  body: string;
  /** Member-facing date style per DS §9.7 (mono/ISO only in admin tables). */
  at: string;
  href: string;
};

// FS-3390: the deviation-flagged submission — delta derives from its own benchmark,
// keeping the benchmark's single source label (FAO GIEWS/FPMA) attached to the figure.
const flagged = submissions.find((s) => s.id === "FS-3390")!;
const flaggedPct = Math.round(
  ((flagged.priceUGXPerKg - flagged.benchmark!.value) / flagged.benchmark!.value) * 100,
);

// The seeded anchor-buyer listing — announced with the same numbers the card shows.
const buyListing = LISTINGS.find((l) => l.type === "buy" && l.priceUGXPerKg != null)!;

export const SEEDED_NOTIFICATIONS: SeededNotification[] = [
  {
    id: "ntf-fs3390",
    title: "Field submission flagged",
    body: `${flagged.id} ${flagged.commodity} · ${flagged.market} screened at +${flaggedPct}% vs the ${flagged.benchmark!.source} benchmark and needs review.`,
    at: "6 Jul 2026",
    href: "/admin/verification",
  },
  {
    id: "ntf-fs3389",
    title: "Submission missing location",
    body: "FS-3389 Maize · Lira arrived without geo capture — provenance incomplete.",
    at: "5 Jul 2026",
    href: "/admin/verification",
  },
  {
    id: "ntf-kaali-grace",
    title: "Member entered grace period",
    body: "Kaali Millers Ltd has an outstanding dues invoice and moved to grace standing.",
    at: "5 Jul 2026",
    href: "/admin/members",
  },
  {
    id: "ntf-buy-listing",
    title: "New buy listing",
    body: `${buyListing.seller.name} posted a ${Math.round(buyListing.quantityKg / 1000)} MT ${buyListing.commodity} buy at UGX ${buyListing.priceUGXPerKg!.toLocaleString()}/kg (${buyListing.market}).`,
    at: "6 Jul 2026",
    href: "/marketplace",
  },
  {
    id: "ntf-gulu-gap",
    title: "Reporting gap on record",
    body: "Gulu has no Maize price for Dec 2025 — the gap is shown, not interpolated.",
    at: "8 Jan 2026",
    href: "/market",
  },
];
