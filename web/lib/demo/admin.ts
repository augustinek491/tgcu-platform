/**
 * Seeded admin/governance demo data (FR-ADM). Field submissions carry provenance +
 * auto-screening flags + external cross-check (FR-ADM-06/08/09); audit entries are
 * append-only (FR-ADM-13); the RBAC matrix mirrors the canonical six-role model
 * (FR-ADM-12). Synthetic, clearly labelled.
 */

export type SubmissionState =
  | "SUBMITTED"
  | "SCREENED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED";

export type ScreeningFlag = "deviation" | "spike" | "duplicate" | "geo-missing";

export type FieldSubmission = {
  id: string;
  officer: string;
  officerAccuracy: number; // approval rate %
  commodity: string;
  market: string;
  priceUGXPerKg: number;
  observationDate: string;
  submittedAt: string;
  geo: { lat: number; lng: number } | null; // null → geo-missing
  hasPhoto: boolean;
  flags: ScreeningFlag[];
  /** External benchmark for cross-check (FR-ADM-09), or null if none available. */
  benchmark: { value: number; source: string; date: string } | null;
  state: SubmissionState;
};

export const submissions: FieldSubmission[] = [
  {
    id: "FS-3391",
    officer: "Moses Okot",
    officerAccuracy: 94,
    commodity: "Maize",
    market: "Gulu",
    priceUGXPerKg: 1610,
    observationDate: "6 Jul 2026",
    submittedAt: "6 Jul 2026, 14:22",
    geo: { lat: 2.774, lng: 32.299 },
    hasPhoto: true,
    flags: [],
    benchmark: { value: 1585, source: "WFP-HDX", date: "May 2026" },
    state: "SCREENED",
  },
  {
    id: "FS-3390",
    officer: "Sarah Nakato",
    officerAccuracy: 88,
    commodity: "Beans",
    market: "Mbale",
    priceUGXPerKg: 8100,
    observationDate: "6 Jul 2026",
    submittedAt: "6 Jul 2026, 12:05",
    geo: { lat: 1.082, lng: 34.175 },
    hasPhoto: false,
    flags: ["deviation"],
    benchmark: { value: 4650, source: "FAO GIEWS/FPMA", date: "Jun 2026" },
    state: "SCREENED",
  },
  {
    id: "FS-3389",
    officer: "David Ochieng",
    officerAccuracy: 71,
    commodity: "Maize",
    market: "Lira",
    priceUGXPerKg: 1720,
    observationDate: "5 Jul 2026",
    submittedAt: "5 Jul 2026, 16:40",
    geo: null,
    hasPhoto: false,
    flags: ["geo-missing"],
    benchmark: { value: 1585, source: "WFP-HDX", date: "May 2026" },
    state: "SUBMITTED",
  },
  {
    id: "FS-3388",
    officer: "Moses Okot",
    officerAccuracy: 94,
    commodity: "Sorghum",
    market: "Soroti",
    priceUGXPerKg: 1180,
    observationDate: "5 Jul 2026",
    submittedAt: "5 Jul 2026, 11:12",
    geo: { lat: 1.715, lng: 33.611 },
    hasPhoto: true,
    flags: ["duplicate"],
    benchmark: null,
    state: "IN_REVIEW",
  },
  {
    id: "FS-3387",
    officer: "Sarah Nakato",
    officerAccuracy: 88,
    commodity: "Rice",
    market: "Jinja",
    priceUGXPerKg: 3880,
    observationDate: "4 Jul 2026",
    submittedAt: "4 Jul 2026, 09:30",
    geo: { lat: 0.424, lng: 33.204 },
    hasPhoto: true,
    flags: [],
    benchmark: { value: 3910, source: "FAO GIEWS/FPMA", date: "Jun 2026" },
    state: "SCREENED",
  },
];

export const FLAG_LABEL: Record<ScreeningFlag, string> = {
  deviation: ">50% from series median",
  spike: "≥100× median (hard flag)",
  duplicate: "Suspected duplicate (same officer/day)",
  "geo-missing": "Location not captured",
};

// ── Audit log (append-only) ──────────────────────────────────────────────────
export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  detail: string;
};

export const auditLog: AuditEntry[] = [
  { id: "AL-8842", at: "2026-07-06 14:25", actor: "system", role: "System", action: "SCREENED", entity: "FS-3391", detail: "Auto-screen: 0 flags" },
  { id: "AL-8841", at: "2026-07-06 12:06", actor: "system", role: "System", action: "SCREENED", entity: "FS-3390", detail: "Auto-screen: flag deviation (+74% vs median)" },
  { id: "AL-8840", at: "2026-07-06 10:14", actor: "Grace Auma", role: "Data Officer", action: "APPROVED", entity: "FS-3384", detail: "Maize · Mbarara · UGX 2,050/kg → published" },
  { id: "AL-8839", at: "2026-07-06 09:52", actor: "Grace Auma", role: "Data Officer", action: "REJECTED", entity: "FS-3383", detail: "Reason: price implausible, no photo" },
  { id: "AL-8838", at: "2026-07-05 17:20", actor: "Henry Kasumba", role: "Secretariat Staff", action: "TIER_CHANGE", entity: "org_kaali", detail: "Silver → Silver (grace applied)" },
  { id: "AL-8837", at: "2026-07-05 16:41", actor: "system", role: "System", action: "SUBMITTED", entity: "FS-3389", detail: "Field submission · Lira · geo-missing" },
  { id: "AL-8836", at: "2026-07-05 11:30", actor: "Robert Mwanje", role: "Super-Admin", action: "ROLE_ASSIGN", entity: "user_gauma", detail: "Assigned role: Data Officer" },
  { id: "AL-8835", at: "2026-07-04 15:02", actor: "Henry Kasumba", role: "Secretariat Staff", action: "PAYMENT_MANUAL", entity: "inv_apy_2025", detail: "Recorded manual payment · Stanbic slip" },
  { id: "AL-8834", at: "2026-07-04 10:11", actor: "Grace Auma", role: "Data Officer", action: "THRESHOLD_CHANGE", entity: "screening.deviationPctFromMedian", detail: "40% → 50%" },
];

// ── RBAC matrix (FR-ADM-12) ──────────────────────────────────────────────────
export const RBAC_ROLES = [
  "Super-Admin",
  "Secretariat Staff",
  "Data Officer",
  "Field Officer",
  "Org Admin",
  "Member",
] as const;

export const RBAC_MATRIX: { capability: string; perms: string[] }[] = [
  { capability: "Member / org records", perms: ["CRUD", "CRU", "R", "—", "RU (own)", "R (own)"] },
  { capability: "Dues / defaulter view", perms: ["R", "R", "—", "—", "R (own)", "R (own)"] },
  { capability: "Field submission — create", perms: ["—", "—", "—", "C", "—", "—"] },
  { capability: "Field submission — review", perms: ["A", "A", "A", "—", "—", "—"] },
  { capability: "Price data edit (audited)", perms: ["U", "R", "U", "—", "—", "R"] },
  { capability: "Screening thresholds", perms: ["U", "R", "U", "—", "—", "—"] },
  { capability: "Content (notices)", perms: ["CRUD", "CRU", "—", "—", "—", "R"] },
  { capability: "Reports & exports", perms: ["R+exp", "R+exp", "R", "—", "R (own)", "—"] },
  { capability: "Notifications — broadcast", perms: ["C", "C", "—", "—", "—", "—"] },
  { capability: "RBAC — assign roles", perms: ["U", "—", "—", "—", "—", "—"] },
  { capability: "Audit log — read", perms: ["R", "R (own)", "R (data)", "—", "—", "—"] },
  { capability: "Platform settings", perms: ["U", "—", "—", "—", "—", "—"] },
];
