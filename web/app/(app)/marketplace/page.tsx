import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { MarketplaceBrowse } from "@/components/marketplace/MarketplaceBrowse";
import { ACTIVE_DEAL } from "@/lib/demo/marketplace";
import { dealAmount } from "@/lib/marketplace/model";
import { cn, formatUGX } from "@/lib/utils";

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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Demo · seeded data</Badge>
          <VerifiedBadge label="You're verified · good standing" />
        </div>
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
        <Link href="/marketplace/deal" className={cn(buttonVariants({ size: "sm" }), "h-11 lg:h-9")}>
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
