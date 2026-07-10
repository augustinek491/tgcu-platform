import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { LineChart, Users, Store, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import heroMaizeField from "@/assets/hero-maize-field.jpg";
import traderWarehouse from "@/assets/trader-warehouse.jpg";
import { orgs } from "@/lib/demo/membership";
import { MARKETS, MONTHS } from "@/lib/demo/marketdata";
import { asOfLabel } from "@/lib/demo/data";

/**
 * Public landing — 06 PART B + DS §9.8 landing IA minimum (AM-17):
 * hero (photo, two-col ≥1024) · authority/proof band · module cards ·
 * institutional footer (in the marketing layout). Imagery per
 * IMAGERY-PROGRAMME.md: hero = the approved golden-hour maize field with the
 * headline over its calm left third; the approved trader still is the single
 * in-app "who this serves" trust moment (placement 2).
 *
 * Entrance choreography (H.2 route/reveal values): staggered fade + 4px rise,
 * 200ms ease-out, 80ms steps, once, transform/opacity only; instant under
 * prefers-reduced-motion.
 */

/* Token-based scrim (delivery law: ≥4.5:1 overlay text in BOTH themes).
 * The gradient fades the photo into --color-bg on the text side, so overlay
 * text sits on the theme's own background color wherever it can reach:
 * solid coverage extends to max(560px, 50% − 72px) — always ≥24px past the
 * text column's right edge (container max-w 1280 + px-24 + copy max-w 520).
 * Because --color-bg flips with the theme, one gradient serves both modes.
 * A second stop fades the photo's base into the page for a calm seam. */
const HERO_SOLID_STOP = "max(560px, 50% - 72px)";
const heroScrim: CSSProperties = {
  background: [
    `linear-gradient(90deg,
      var(--color-bg) 0,
      var(--color-bg) ${HERO_SOLID_STOP},
      color-mix(in srgb, var(--color-bg) 70%, transparent) calc(${HERO_SOLID_STOP} + 150px),
      color-mix(in srgb, var(--color-bg) 30%, transparent) calc(${HERO_SOLID_STOP} + 300px),
      transparent calc(${HERO_SOLID_STOP} + 460px))`,
    `linear-gradient(180deg, transparent 82%, var(--color-bg) 100%)`,
  ].join(", "),
};

const REVEAL_CSS = `
@keyframes lp-rise {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.lp-reveal {
  animation: lp-rise var(--dur-base, 200ms) var(--ease-out, ease-out) both;
  animation-delay: calc(var(--lp-step, 0) * 80ms);
}
@media (prefers-reduced-motion: reduce) {
  .lp-reveal { animation: none; }
}
`;

const modules = [
  {
    icon: Users,
    title: "Membership & Identity",
    body: "One system of record for 400+ member organisations — tiers, dues and defaulter management, replacing scattered spreadsheets.",
  },
  {
    icon: LineChart,
    title: "Market Data & Analytics",
    body: "Honest grain-price dashboards with provenance and freshness on every point — trends, comparisons and a national commodities map.",
  },
  {
    icon: Store,
    title: "Marketplace",
    body: "Asset-light listings, offers and escrow-backed trade between verified members, with goods-in-transit tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Admin & Governance",
    body: "Field-data verification, role-based access and an immutable audit trail — trust built into every write.",
  },
];

const trustRow = [
  "400+ member organisations",
  "Monthly prices with provenance",
  "Escrow-backed member trade",
];

export default function LandingPage() {
  const reportingMarkets = MARKETS.filter((m) => m.reporting).length;

  return (
    <>
      <style>{REVEAL_CSS}</style>

      {/* ── Hero — photo two-col ≥1024; single col with the image below the text
             at 375/768 (PART G). One next/image instance repositions via CSS so
             mobile never downloads a hidden desktop variant. */}
      <section
        className="lp-reveal relative isolate flex flex-col overflow-hidden"
        style={{ "--lp-step": 0 } as CSSProperties}
      >
        <div className="relative z-10 order-1 mx-auto flex w-full max-w-[1280px] flex-col justify-center px-6 py-section-sm lg:min-h-[560px]">
          <div className="max-w-[520px]">
            <p className="text-xs font-semibold tracking-[0.08em] text-brand-700 dark:text-brand-300">
              The Grain Council of Uganda
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-fg md:text-4xl lg:text-5xl">
              The digital home of Uganda&apos;s grain industry
            </h1>
            <p className="mt-4 max-w-[46ch] text-lg text-muted">
              Membership, market intelligence and a trusted grain marketplace — one
              platform for producers, traders, processors, millers and exporters.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className={buttonVariants({ size: "lg" })}>
                Sign in <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                View membership tiers
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {trustRow.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-muted">
                  <Check className="size-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Photo layer — in flow below the text <1024; full-bleed behind it ≥1024 */}
        <div className="relative order-2 aspect-[16/9] w-full sm:aspect-[21/9] lg:absolute lg:inset-0 lg:z-0 lg:aspect-auto">
          <Image
            src={heroMaizeField}
            alt="Rows of ripening maize at golden hour on a Ugandan grain farm, low hills on the horizon"
            fill
            priority
            placeholder="blur"
            quality={70}
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 hidden lg:block" style={heroScrim} />
        </div>
      </section>

      {/* ── Authority band — institution facts vs demo-platform numbers, kept
             verbally and visually distinct (DS §7 / §9.7 provenance rules). */}
      <section
        aria-labelledby="authority-heading"
        className="lp-reveal border-y border-[var(--color-border)] bg-surface"
        style={{ "--lp-step": 1 } as CSSProperties}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 py-12 md:py-16">
          <h2 id="authority-heading" className="text-sm font-semibold tracking-[0.02em] text-muted">
            The institution
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[var(--color-border)]">
            <AuthorityFact
              value="400+"
              label="Member organisations across Uganda's grain value chain"
              source="TGCU · 2026"
              className="md:pr-8"
            />
            <AuthorityFact
              value="Kampala"
              label="Secretariat at Plot 35 Kenneth Dale, Kamwokya"
              source="KCCA directory"
              className="md:px-8"
            />
            <AuthorityFact
              value="Monthly"
              label="Wholesale grain price tracking — never presented as live"
              source="MAAIF / TGCU tracker"
              className="md:pl-8"
            />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--color-border)] pt-5">
            <Badge variant="warning">Demo · seeded data</Badge>
            <p className="text-xs text-muted">
              This demonstration runs on seeded records: {orgs.length} member organisations
              · {reportingMarkets} of {MARKETS.length} markets reporting · {MONTHS.length}{" "}
              months of monthly prices · as of {asOfLabel}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who this serves — the single in-app photographic trust moment
             (IMAGERY-PROGRAMME placement 2: the approved trader still). */}
      <section
        aria-labelledby="serves-heading"
        className="lp-reveal mx-auto w-full max-w-[1280px] px-6 py-section-sm"
        style={{ "--lp-step": 2 } as CSSProperties}
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <figure className="order-2 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] lg:order-1">
            <Image
              src={traderWarehouse}
              alt="A grain trader examining a handful of maize inside a warehouse"
              placeholder="blur"
              quality={70}
              sizes="(min-width: 1024px) 592px, 100vw"
              className="h-auto w-full object-cover"
            />
          </figure>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold tracking-[0.02em] text-muted" id="serves-heading">
              Who this serves
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium text-fg md:text-3xl">
              Built for the people who move Uganda&apos;s grain
            </h2>
            <p className="mt-3 text-base text-muted">
              Producers, traders, processors, millers and exporters — one membership
              register, honest market data and escrow-backed trade for the whole value
              chain.
            </p>
            <Link
              href="/pricing"
              className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-interactive hover:underline lg:min-h-0"
            >
              See what each tier unlocks <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Module cards (DS §9.8) */}
      <section
        aria-labelledby="modules-heading"
        className="lp-reveal mx-auto w-full max-w-[1280px] px-6 pb-section-sm"
        style={{ "--lp-step": 3 } as CSSProperties}
      >
        <h2 id="modules-heading" className="text-sm font-semibold tracking-[0.02em] text-muted">
          What the platform does
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.title} className="p-6">
                <div className="mb-4 grid size-11 place-items-center rounded-[var(--radius-sm)] bg-brand-800/10 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-fg">{m.title}</h3>
                <p className="mt-2 text-sm text-muted">{m.body}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}

function AuthorityFact({
  value,
  label,
  source,
  className,
}: {
  value: string;
  label: string;
  source: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-display text-3xl font-medium tabular text-fg">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      <p className="mt-2 text-xs text-muted">{source}</p>
    </div>
  );
}
