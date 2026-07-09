/**
 * Demo-scoped global search over the canonical seeded dataset (SCOPE §5.1).
 * One index built from the same modules that power the pages, so results can
 * never disagree with what a route shows: members (lib/demo/membership),
 * markets (lib/demo/marketdata) and listings (lib/demo/marketplace).
 */

import { orgs } from "./membership";
import { MARKETS } from "./marketdata";
import { LISTINGS } from "./marketplace";

export type SearchGroup = "Members" | "Markets" | "Listings";

export type SearchHit = {
  id: string;
  group: SearchGroup;
  label: string;
  sub: string;
  href: string;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const SEARCH_INDEX: SearchHit[] = [
  ...orgs.map((o) => ({
    id: `org-${o.orgId}`,
    group: "Members" as const,
    label: o.legalName,
    sub: `${cap(o.type)} · ${o.district}`,
    href: "/admin/members",
  })),
  ...MARKETS.map((m) => ({
    id: `mkt-${m.id}`,
    group: "Markets" as const,
    label: m.name,
    sub: `${m.region} region · ${m.reporting ? "reporting" : "not reporting"}`,
    href: "/market",
  })),
  ...LISTINGS.map((l) => ({
    id: `lst-${l.listingId}`,
    group: "Listings" as const,
    label: `${l.type === "buy" ? "Buy" : "Sell"} · ${l.commodity} · ${Math.round(l.quantityKg / 1000)} MT`,
    sub: `${l.seller.name} · ${l.market}`,
    href: "/marketplace",
  })),
];

/** Case-insensitive substring match over label + sub, prefix matches first. */
export function searchSeeded(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  return SEARCH_INDEX.filter(
    (h) => h.label.toLowerCase().includes(q) || h.sub.toLowerCase().includes(q),
  )
    .sort((a, b) => {
      const ap = a.label.toLowerCase().startsWith(q) ? 0 : 1;
      const bp = b.label.toLowerCase().startsWith(q) ? 0 : 1;
      return ap - bp;
    })
    .slice(0, limit);
}
