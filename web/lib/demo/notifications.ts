/**
 * Seeded notifications for the topbar bell — synthetic, clearly labelled
 * (SCOPE §5.1). Every item cross-references a record that actually exists in
 * the canonical seed (submissions, audit log, membership, marketdata gaps,
 * listings), so the bell never announces something the platform can't show.
 */

export type SeededNotification = {
  id: string;
  title: string;
  body: string;
  /** Member-facing date style per DS §9.7 (mono/ISO only in admin tables). */
  at: string;
  href: string;
};

export const SEEDED_NOTIFICATIONS: SeededNotification[] = [
  {
    id: "ntf-fs3390",
    title: "Field submission flagged",
    body: "FS-3390 Beans · Mbale screened at +74% vs the FAO GIEWS/FPMA benchmark and needs review.",
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
    id: "ntf-ugm-listing",
    title: "New buy listing",
    body: "Uganda Grain Millers Ltd posted a 120 MT Maize buy at 1,900 UGX/kg (Kampala).",
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
