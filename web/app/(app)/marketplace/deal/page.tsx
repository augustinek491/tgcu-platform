import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DealPanel } from "@/components/marketplace/DealPanel";
import { ACTIVE_DEAL } from "@/lib/demo/marketplace";

export const metadata: Metadata = { title: "Deal" };

export default function DealPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-interactive hover:underline lg:min-h-0"
      >
        <ArrowLeft className="size-4" /> Back to marketplace
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">
            Deal #{ACTIVE_DEAL.dealId}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {Math.round(ACTIVE_DEAL.listing.quantityKg / 1000)} MT {ACTIVE_DEAL.listing.commodity} ·{" "}
            {ACTIVE_DEAL.seller.name} → {ACTIVE_DEAL.buyer.name}
          </p>
        </div>
        <Badge variant="warning">Demo · seeded data</Badge>
      </div>
      <DealPanel deal={ACTIVE_DEAL} />
    </div>
  );
}
