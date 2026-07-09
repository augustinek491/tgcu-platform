import { CircleCheck, MapPin, ShoppingCart, Tag, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { GRADE_LABEL, type Listing } from "@/lib/marketplace/model";
import type { OfferDraft } from "./OfferDialog";

/**
 * A marketplace listing card (07 §6.0 F.M1) — type pill, price hero + reference
 * anchor, grade/meta chips, verified seller, full-width action. Stacked footer so
 * content fits the grid slot at every breakpoint (LAY-01/MOB-02: no overflow, no
 * page h-scroll); `mt-auto` keeps action rows bottom-aligned across a card row.
 */
export function ListingCard({
  listing,
  sentOffer,
  onAction,
}: {
  listing: Listing;
  /** Offer already recorded in the demo-sandbox session for this listing. */
  sentOffer?: OfferDraft;
  onAction?: (listing: Listing) => void;
}) {
  const { seller } = listing;
  const isBuy = listing.type === "buy";
  const mt = Math.round(listing.quantityKg / 1000);

  return (
    <Card className="flex flex-col p-card-dense">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg font-semibold text-fg">
            {mt} MT {listing.commodity}
          </div>
          <div className="text-xs text-muted">
            {isBuy ? `Wanted · deliver to ${listing.market}` : `Available now · ex-store ${listing.market}`}
          </div>
        </div>
        {/* Type pill (F.M1): SELL brand-600 tint / BUY grain-gold tint, icon + label.
            Gold tint held at 10% so grain-700 text stays ≥4.5:1 (A11Y-03 caveat). */}
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-semibold ${
            isBuy
              ? "bg-grain-500/10 text-grain-700 dark:bg-grain-500/20 dark:text-grain-300"
              : "bg-brand-600/14 text-brand-800 dark:bg-brand-600/20 dark:text-brand-300"
          }`}
        >
          {isBuy ? (
            <ShoppingCart className="size-3" aria-hidden="true" />
          ) : (
            <Tag className="size-3" aria-hidden="true" />
          )}
          {isBuy ? "BUY" : "SELL"}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        {listing.priceUGXPerKg ? (
          <>
            <span className="tabular font-display text-xl font-semibold text-fg">
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
      <div className="tabular mt-0.5 text-xs text-muted">
        Reference UGX {listing.referenceUGXPerKg.toLocaleString()}/kg · MAAIF / TGCU tracker · as of Jun 2026
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="rounded-[var(--radius-pill)] bg-surface-2 px-2 py-0.5 text-fg">
            {GRADE_LABEL[listing.grade]}
          </span>
          self-declared
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3 shrink-0" aria-hidden="true" /> {listing.market} · {listing.region}
        </span>
        {listing.logistics !== "—" && (
          <span className="inline-flex items-center gap-1">
            <Truck className="size-3 shrink-0" aria-hidden="true" /> {listing.logistics}
          </span>
        )}
        {listing.group && (
          <span className="rounded-[var(--radius-pill)] bg-surface-2 px-2 py-0.5 text-xs">
            {listing.groupNote}
          </span>
        )}
      </div>

      {/* Footer — stacked (identity / trust / action) so nothing competes for one
          cramped row; flex-1 + justify-end bottom-aligns it across the card row. */}
      <div className="mt-4 flex flex-1 flex-col justify-end">
        <div className="space-y-2.5 border-t border-[var(--color-border)] pt-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-800 text-xs font-semibold text-white">
              {seller.initials}
            </span>
            <span className="min-w-0 truncate text-xs font-medium text-fg">{seller.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            {seller.verified ? (
              <>
                <VerifiedBadge />
                <span className="tabular">{seller.rating?.toFixed(1)}★</span>
                <span className="tabular">{seller.deals} deals</span>
              </>
            ) : (
              <span>New seller · no deals yet</span>
            )}
            {seller.anchorBuyer && (
              <span className="rounded-[var(--radius-pill)] bg-grain-500/10 px-2 py-0.5 text-xs font-medium text-grain-700 dark:bg-grain-500/20 dark:text-grain-300">
                Anchor buyer
              </span>
            )}
          </div>
          {sentOffer && (
            <p role="status" className="flex items-start gap-1 text-xs text-brand-700 dark:text-brand-300">
              <CircleCheck className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              <span className="tabular">
                Offer sent · UGX {sentOffer.priceUGXPerKg.toLocaleString()}/kg · sandbox — no real commitment
              </span>
            </p>
          )}
          <Button
            size="sm"
            variant={sentOffer ? "secondary" : isBuy ? "cta" : "primary"}
            className="h-11 w-full lg:h-9"
            onClick={() => onAction?.(listing)}
          >
            {sentOffer ? "Edit offer" : isBuy ? "Respond" : "Make offer"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
