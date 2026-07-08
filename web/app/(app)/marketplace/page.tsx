import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketplaceBrowse } from "@/components/marketplace/MarketplaceBrowse";
import { ACTIVE_DEAL } from "@/lib/demo/marketplace";
import { dealAmount } from "@/lib/marketplace/model";
import { formatUGX } from "@/lib/utils";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">Grain marketplace</h1>
          <p className="mt-1 text-sm text-muted">
            Verified members trade maize, beans, rice &amp; sorghum. Escrow protects both sides.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-success)]/12 px-3 py-1 text-sm font-medium text-[var(--color-success)]">
          <BadgeCheck className="size-4" /> You&apos;re verified · good standing
        </span>
      </div>

      {/* Sandbox honesty banner */}
      <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 p-3 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
        <p className="text-fg">
          <span className="font-semibold">Sandbox demo:</span>{" "}
          <span className="text-muted">
            no real funds are moved and no real goods ship. Escrow, tracking &amp; payments use scripted
            demo data only.
          </span>
        </p>
      </div>

      {/* Active deal link */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-fg">Your active deal</span>
            <Badge variant="info">In transit</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {Math.round(ACTIVE_DEAL.listing.quantityKg / 1000)} MT {ACTIVE_DEAL.listing.commodity} ·{" "}
            {ACTIVE_DEAL.seller.name} → you · {formatUGX(dealAmount(ACTIVE_DEAL))} in escrow · Deal #
            {ACTIVE_DEAL.dealId}
          </p>
        </div>
        <Link href="/marketplace/deal" className={buttonVariants({ size: "sm" })}>
          Open deal <ArrowRight className="size-4" />
        </Link>
      </Card>

      <MarketplaceBrowse />

      <p className="text-xs text-muted">
        Grades are self-declared by sellers, not lab-certified. Reference prices are monthly wholesale
        figures with provenance shown. No real funds move in this demo (sandbox). Not financial advice ·
        Demo data.
      </p>
    </div>
  );
}
