import type { Org, Invoice, Receipt } from "@/lib/membership/model";
import type { TierId } from "@/lib/membership/tiers";

/**
 * Seeded Membership demo data — synthetic, clearly labelled (SCOPE §5.1). Shaped like
 * the Firestore collections (organisations / invoices / payments) so swapping in live
 * Firebase is a data-source change, not a UI change.
 *
 * Dues amounts are ILLUSTRATIVE ONLY — real tier pricing is "announced at launch"
 * (an open business decision; not invented as fact). The pricing page shows no prices.
 */

/** Illustrative annual dues by tier (UGX). Framed as illustrative in the UI. */
export const ILLUSTRATIVE_DUES: Record<TierId, number> = {
  bronze: 300000,
  silver: 600000,
  gold: 1200000,
  platinum: 2500000,
};

export const orgs: Org[] = [
  {
    orgId: "org_aponye",
    legalName: "Aponye (U) Ltd",
    tradingName: "Aponye",
    type: "processor",
    commodities: ["Maize", "Rice"],
    district: "Kampala",
    contactName: "Annet Twebaze",
    phone: "+256772000001",
    email: "procurement@aponye.example",
    tierId: "gold",
    standing: "good",
    kycLevel: 2,
    memberSince: "2016-04-12",
  },
  {
    orgId: "org_masindi_coop",
    legalName: "Masindi Produce Co-operative",
    type: "cooperative",
    commodities: ["Maize", "Beans"],
    district: "Masindi",
    contactName: "James Okello",
    phone: "+256772000002",
    tierId: "gold",
    standing: "good",
    kycLevel: 2,
    memberSince: "2018-09-03",
  },
  {
    orgId: "org_mbarara_grain",
    legalName: "Mbarara Grain Millers Ltd",
    type: "processor",
    commodities: ["Maize"],
    district: "Mbarara",
    contactName: "Grace Ainembabazi",
    phone: "+256772000003",
    tierId: "platinum",
    standing: "good",
    kycLevel: 2,
    memberSince: "2015-01-20",
  },
  {
    orgId: "org_kaali",
    legalName: "Kaali Millers Ltd",
    type: "processor",
    commodities: ["Maize", "Sorghum"],
    district: "Wakiso",
    contactName: "Ronald Ssebunya",
    phone: "+256772000004",
    tierId: "silver",
    standing: "grace",
    kycLevel: 2,
    memberSince: "2019-06-11",
  },
  {
    orgId: "org_gulu_traders",
    legalName: "Gulu Grain Traders Assoc.",
    type: "trader",
    commodities: ["Maize", "Beans", "Simsim"],
    district: "Gulu",
    contactName: "Betty Aciro",
    phone: "+256772000005",
    tierId: "bronze",
    standing: "suspended",
    kycLevel: 1,
    memberSince: "2021-02-08",
  },
  {
    orgId: "org_jinja_exporters",
    legalName: "Jinja Grain Exporters Ltd",
    type: "exporter",
    commodities: ["Maize", "Beans"],
    district: "Jinja",
    contactName: "Samuel Mukisa",
    phone: "+256772000006",
    tierId: "gold",
    standing: "good",
    kycLevel: 2,
    memberSince: "2017-11-30",
  },
  {
    orgId: "org_lira_farmers",
    legalName: "Lira Farmers Union",
    type: "producer",
    commodities: ["Sorghum", "Simsim", "Sunflower"],
    district: "Lira",
    contactName: "Denis Ogwal",
    phone: "+256772000007",
    tierId: "silver",
    standing: "good",
    kycLevel: 2,
    memberSince: "2020-03-17",
  },
  {
    orgId: "org_soroti_handlers",
    legalName: "Soroti Handlers Ltd",
    type: "handler",
    commodities: ["Maize", "Groundnuts"],
    district: "Soroti",
    contactName: "Mary Akello",
    phone: "+256772000008",
    tierId: "bronze",
    standing: "grace",
    kycLevel: 1,
    memberSince: "2022-07-25",
  },
  {
    orgId: "org_mbale_produce",
    legalName: "Mbale Produce Dealers",
    type: "trader",
    commodities: ["Maize", "Rice", "Beans"],
    district: "Mbale",
    contactName: "Peter Wanyama",
    phone: "+256772000009",
    tierId: "gold",
    standing: "good",
    kycLevel: 2,
    memberSince: "2016-10-05",
  },
  {
    orgId: "org_kasese_millers",
    legalName: "Kasese Millers & Traders",
    type: "processor",
    commodities: ["Maize"],
    district: "Kasese",
    contactName: "Joan Biira",
    phone: "+256772000010",
    tierId: "bronze",
    standing: "lapsed",
    kycLevel: 0,
    memberSince: "2023-05-14",
  },
];

/** The signed-in demo member (org-admin of Aponye). */
export const CURRENT_ORG_ID = "org_aponye";
export function currentOrg(): Org {
  return orgs.find((o) => o.orgId === CURRENT_ORG_ID)!;
}

export const invoices: Invoice[] = [
  // Current member (Aponye) — one paid, one issued/current (good standing).
  {
    invoiceId: "inv_apy_2025",
    number: "TGCU-2025-0142",
    orgId: "org_aponye",
    tierId: "gold",
    periodLabel: "Jan–Dec 2025",
    amountUGX: 1200000,
    issueDate: "2025-01-05",
    dueDate: "2025-01-19",
    status: "paid",
    paidUGX: 1200000,
  },
  {
    invoiceId: "inv_apy_2026",
    number: "TGCU-2026-0210",
    orgId: "org_aponye",
    tierId: "gold",
    periodLabel: "Jan–Dec 2026",
    amountUGX: 1200000,
    issueDate: "2026-06-20",
    dueDate: "2026-07-18",
    status: "issued",
    paidUGX: 0,
  },
  // Arrears cases
  {
    invoiceId: "inv_kaali_2026",
    number: "TGCU-2026-0188",
    orgId: "org_kaali",
    tierId: "silver",
    periodLabel: "Jan–Dec 2026",
    amountUGX: 600000,
    issueDate: "2026-05-30",
    dueDate: "2026-06-27",
    status: "overdue",
    paidUGX: 0,
  },
  {
    invoiceId: "inv_gulu_2026",
    number: "TGCU-2026-0151",
    orgId: "org_gulu_traders",
    tierId: "bronze",
    periodLabel: "Jan–Dec 2026",
    amountUGX: 300000,
    issueDate: "2026-04-10",
    dueDate: "2026-04-24",
    status: "overdue",
    paidUGX: 0,
  },
  {
    invoiceId: "inv_soroti_2026",
    number: "TGCU-2026-0199",
    orgId: "org_soroti_handlers",
    tierId: "bronze",
    periodLabel: "Jan–Dec 2026",
    amountUGX: 300000,
    issueDate: "2026-06-12",
    dueDate: "2026-06-26",
    status: "overdue",
    paidUGX: 100000,
  },
];

export const receipts: Receipt[] = [
  {
    receiptId: "rc_apy_2025",
    number: "RC-2025-0142",
    invoiceId: "inv_apy_2025",
    orgId: "org_aponye",
    amountUGX: 1200000,
    method: "mobile_money",
    manual: false,
    reference: "MOMO-8842217",
    date: "2025-01-14",
  },
  {
    receiptId: "rc_apy_2024",
    number: "RC-2024-0119",
    invoiceId: "inv_apy_2024",
    orgId: "org_aponye",
    amountUGX: 1000000,
    method: "bank_transfer",
    manual: true,
    reference: "Stanbic slip 55193",
    date: "2024-01-16",
  },
];

/** Days overdue for an invoice as of a reference date (default: today). */
export function daysOverdue(inv: Invoice, ref = new Date("2026-07-08")): number {
  const due = new Date(inv.dueDate);
  return Math.max(0, Math.floor((ref.getTime() - due.getTime()) / 86_400_000));
}

export function invoicesForOrg(orgId: string): Invoice[] {
  return invoices.filter((i) => i.orgId === orgId);
}
export function receiptsForOrg(orgId: string): Receipt[] {
  return receipts.filter((r) => r.orgId === orgId);
}
export function orgById(orgId: string): Org | undefined {
  return orgs.find((o) => o.orgId === orgId);
}

/** Orgs in arrears (grace/suspended/lapsed with outstanding balance) — FR-MEM-35. */
export function arrears() {
  return invoices
    .filter((i) => i.status === "overdue")
    .map((i) => {
      const org = orgById(i.orgId)!;
      return {
        org,
        invoice: i,
        outstanding: i.amountUGX - i.paidUGX,
        days: daysOverdue(i),
      };
    })
    .sort((a, b) => b.days - a.days);
}
