import type { Metadata } from "next";
import Image from "next/image";
import { Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIERS } from "@/lib/membership/tiers";
import { cn } from "@/lib/utils";
import cropsMacro from "@/assets/crops-macro.jpg";

export const metadata: Metadata = {
  title: "Membership tiers",
  description:
    "Choose a TGCU membership tier — deeper grain price history and market tracking as your needs grow. Pricing announced at launch.",
};

// Static: tier definitions + public copy are stable → SSG/ISR, no Firebase (design/02 §1.1).
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-section-sm">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="brand" className="mb-4">
          TGCU Membership
        </Badge>
        <h1 className="font-display text-3xl font-semibold text-fg md:text-4xl lg:text-5xl">
          Choose your membership tier
        </h1>
        <p className="mt-4 text-lg text-muted">
          Unlock deeper grain price history and market tracking. Every tier builds on the last —
          start with today&apos;s prices, then reach further back and follow goods in transit as
          your needs grow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                // Gold-family pill: ≤10% tint + gold text-safe pair, never white-on-gold
                // (DS §9.1, ratified 2026-07-10). Solid mix over surface so the pill
                // stays opaque where it straddles the card edge.
                className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--tier-gold-text)] px-3 py-1 text-xs font-semibold"
                style={{
                  background: "color-mix(in srgb, var(--tier-gold) 10%, var(--color-surface))",
                  color: "var(--tier-gold-text)",
                }}
              >
                <Star className="size-3.5 fill-current" /> Most popular
              </span>
            )}
            <div
              className="text-sm font-semibold uppercase tracking-wider"
              // Tier NAME is text → tier text-safe pair; accentVar stays for fills only (AM-04).
              style={{ color: `var(--tier-${tier.id}-text)` }}
            >
              {tier.name}
            </div>
            <p className="mt-1 text-sm text-muted">{tier.tagline}</p>

            <div className="mt-6">
              <div className="font-display text-2xl font-semibold text-fg">Coming soon</div>
              <div className="text-xs text-muted">Pricing announced at launch</div>
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-fg">
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

      {/* Placement 3 (IMAGERY-PROGRAMME / IMG-01): the crop close-up family as a
          restrained low-height band BELOW the tier data — data-first, never competing.
          Lazy by default (no priority); ≤120KB served via sizes + quality. */}
      <figure className="mt-12 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
        {/* q74 (was 60) — the grain-macro texture read soft on retina at 60 (CE M17
            lever). Source is 2560px so next/image serves a sharp 2× variant; the short
            band keeps bytes modest. */}
        <Image
          src={cropsMacro}
          alt="Dried maize and sorghum grains in golden light"
          placeholder="blur"
          quality={74}
          sizes="(min-width: 1328px) 1232px, calc(100vw - 48px)"
          className="h-[200px] w-full object-cover md:h-[220px]"
        />
      </figure>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted">
        Tiers differ only in how far back you can see and what you can track — prices are monthly
        wholesale figures with provenance shown per record. Informational, not financial advice. ·
        Demo screen; pricing announced at launch.
      </p>
    </section>
  );
}
