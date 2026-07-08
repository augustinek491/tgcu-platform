import type { Metadata } from "next";
import { Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIERS } from "@/lib/membership/tiers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Membership plans",
  description:
    "Choose a TGCU data plan — deeper grain price history and market tracking as your needs grow. Pricing announced at launch.",
};

// Static: tier definitions + public copy are stable → SSG/ISR, no Firebase (design/02 §1.1).
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="brand" className="mb-4">
          TGCU Membership
        </Badge>
        <h1 className="font-display text-4xl font-semibold text-fg">Choose your data plan</h1>
        <p className="mt-4 text-lg text-muted">
          Unlock deeper grain price history and market tracking. Every plan builds on the last —
          start with today&apos;s prices, then reach further back and follow goods in transit as
          your needs grow.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "relative flex flex-col p-6",
              tier.popular && "ring-2 ring-[var(--tier-gold)]",
            )}
          >
            {tier.popular && (
              <span
                className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold text-white"
                style={{ background: "var(--tier-gold)" }}
              >
                <Star className="size-3.5 fill-current" /> Most popular
              </span>
            )}
            <div
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: tier.accentVar }}
            >
              {tier.name}
            </div>
            <p className="mt-1 text-sm text-muted">{tier.tagline}</p>

            <div className="mt-5">
              <div className="font-display text-2xl font-semibold text-fg">Coming soon</div>
              <div className="text-xs text-muted">Pricing announced at launch</div>
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-fg">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="mt-6 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium text-muted"
            >
              Available soon
            </button>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted">
        Plans unlock how far back you can see and what you can track — prices are monthly wholesale
        figures with provenance shown per record. History depth per FR-MEM-11.1. Informational, not
        financial advice. · Demo screen; pricing announced at launch.
      </p>
    </section>
  );
}
