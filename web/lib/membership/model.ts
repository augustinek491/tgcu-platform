import { tierEntitlements, type EntitlementKey, type TierId } from "./tiers";

/**
 * Membership identity model + the derived rules (standing, entitlement resolution).
 * Mirrors the Firestore shape (DR-01..05) so the demo data layer is swappable for live
 * Firebase with no UI change. Standing is a pure function of dues state (FR-MEM-33);
 * entitlements resolve as tier ∩ standing ∩ RBAC (FR-MEM-11/12).
 */

export type OrgType =
  | "producer"
  | "handler"
  | "trader"
  | "processor"
  | "exporter"
  | "cooperative"
  | "individual";
export type Standing = "good" | "grace" | "suspended" | "lapsed";
export type MemberRole = "org_admin" | "member_user";
/** KYC: 0 registered · 1 contact-verified · 2 member-verified (badge). FR-MEM-41. */
export type KycLevel = 0 | 1 | 2;

export type Org = {
  orgId: string;
  legalName: string;
  tradingName?: string;
  type: OrgType;
  commodities: string[];
  district: string;
  contactName: string;
  phone: string; // E.164
  email?: string;
  tierId: TierId;
  standing: Standing;
  kycLevel: KycLevel;
  memberSince: string; // ISO date
};

export type InvoiceStatus = "issued" | "paid" | "part_paid" | "overdue" | "void";

export type Invoice = {
  invoiceId: string;
  number: string;
  orgId: string;
  tierId: TierId;
  periodLabel: string;
  amountUGX: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidUGX: number;
};

export type PaymentMethod =
  | "flutterwave"
  | "dpo"
  | "iotec"
  | "card"
  | "mobile_money"
  | "cash"
  | "bank_transfer"
  | "sandbox";

export type Receipt = {
  receiptId: string;
  number: string;
  invoiceId: string;
  orgId: string;
  amountUGX: number;
  method: PaymentMethod;
  /** "recorded manually" for offline payments (FR-MEM-28). */
  manual: boolean;
  reference: string;
  date: string;
};

/** Verified "TGCU Member" badge = good standing AND member-verified KYC (FR-MEM-03). */
export function isVerified(org: Pick<Org, "standing" | "kycLevel">): boolean {
  return org.standing === "good" && org.kycLevel >= 2;
}

/**
 * Resolve a single entitlement (FR-MEM-11 AC). Baseline keys are always on; premium
 * keys need a tier grant AND standing that hasn't been suspended (grace keeps full
 * access — FR-MEM-31). marketplace.trade has no tier floor: KYC-L2 + good standing
 * (the anti-Kudu posture, FR-MKTPL-90).
 */
export function hasEntitlement(org: Org, key: EntitlementKey): boolean {
  if (key === "marketplace.browse") return true;
  if (key === "marketplace.trade") return org.kycLevel >= 2 && org.standing === "good";

  const granted = tierEntitlements(org.tierId).has(key);
  if (!granted) return false;
  // Suspended/lapsed lose premium entitlements; good & grace keep them.
  return org.standing === "good" || org.standing === "grace";
}

export function resolvedEntitlements(org: Org): EntitlementKey[] {
  const all: EntitlementKey[] = [
    ...tierEntitlements(org.tierId),
    "marketplace.browse",
    "marketplace.trade",
  ];
  return all.filter((k, i, arr) => arr.indexOf(k) === i && hasEntitlement(org, k));
}

export const STANDING_LABEL: Record<Standing, string> = {
  good: "Good standing",
  grace: "In grace period",
  suspended: "Suspended — dues overdue",
  lapsed: "Lapsed",
};
