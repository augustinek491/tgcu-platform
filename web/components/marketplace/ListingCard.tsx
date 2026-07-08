import { BadgeCheck, MapPin, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GRADE_LABEL, type Listing } from "@/lib/marketplace/model";

/** A marketplace listing card — type, qty, grade, price + reference anchor, verified seller. */
export function ListingCard({ listing }: { listing: Listing }) {
  const { seller } = listing;
  const isBuy = listing.type === "buy";
  const mt = Math.round(listing.quantityKg / 1000);

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-lg font-semibold text-fg">
            {mt} MT {listing.commodity}
          </div>
          <div className="text-xs text-muted">
            {isBuy ? `Wanted · deliver to ${listing.market}` : `Available now · ex-store ${listing.market}`}
          </div>
        </div>
        <span
          className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-semibold ${
            isBuy
              ? "bg-[var(--color-info)]/12 text-[var(--color-info)]"
              : "bg-brand-300/30 text-brand-800 dark:text-brand-300"
          }`}
        >
          {isBuy ? "BUY" : "SELL"}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        {listing.priceUGXPerKg ? (
          <>
            <span className="tabular font-display text-2xl font-semibold text-fg">
              {listing.priceUGXPerKg.toLocaleString()}
            </span>
            <span className="text-sm text-muted">UGX/kg</span>
          </>
        ) : (
          <span className="font-display text-xl font-semibold text-grain-700 dark:text-grain-300">
            Open to offers
          </span>
        )}
      </div>
      <div className="mt-0.5 text-[11px] text-muted">
        Reference {listing.referenceUGXPerKg.toLocaleString()} UGX/kg · MAAIF/TGCU · as of Jun 2026
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="text-fg">
          {GRADE_LABEL[listing.grade]} <span className="text-muted">· self-declared</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" /> {listing.market} · {listing.region}
        </span>
        {listing.logistics !== "—" && (
          <span className="inline-flex items-center gap-1">
            <Truck className="size-3" /> {listing.logistics}
          </span>
        )}
        {listing.group && (
          <span className="rounded-[var(--radius-pill)] bg-surface-2 px-2 py-0.5 text-[11px]">
            {listing.groupNote}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-brand-800 text-[11px] font-semibold text-white">
            {seller.initials}
          </span>
          <div className="leading-tight">
            <div className="text-xs font-medium text-fg">{seller.name}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              {seller.verified ? (
                <span className="inline-flex items-center gap-0.5 text-brand-700 dark:text-brand-500">
                  <BadgeCheck className="size-3" /> Verified
                </span>
              ) : (
                <span>New seller · no deals yet</span>
              )}
              {seller.verified && (
                <>
                  <span>· {seller.rating?.toFixed(1)}★</span>
                  <span>· {seller.deals} deals</span>
                </>
              )}
              {seller.anchorBuyer && (
                <span className="rounded-[var(--radius-pill)] bg-grain-500/15 px-1.5 text-[10px] font-medium text-grain-700 dark:text-grain-300">
                  Anchor buyer
                </span>
              )}
            </div>
          </div>
        </div>
        <Button size="sm" variant={isBuy ? "cta" : "primary"}>
          {isBuy ? "Respond" : "Make offer"}
        </Button>
      </div>
    </Card>
  );
}
