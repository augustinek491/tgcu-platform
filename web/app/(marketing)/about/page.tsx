import type { Metadata } from "next";
import { Compass, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * About / Governance — real institutional identity, sourced verbatim from TGCU's
 * own Corporate Profile 2024 (primary source; KB dossier 12). This surfaces facts,
 * not demo records, so it carries a dated "as published" provenance line rather than
 * the "seeded data" chip used on demo surfaces (DS §9.7 / §9.11 honesty split).
 * Static content → SSG/ISR, no Firebase (design/02 §1.1).
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About & governance",
  description:
    "The Grain Council of Uganda — the apex body of Uganda's grains value chain. Vision, mission, 2024–2029 strategy, services and governance, as published in the TGCU Corporate Profile 2024.",
};

const PROVENANCE = "As published in the TGCU Corporate Profile 2024";

const MANDATE = [
  "Represent the grain sector as its lead advocate for policy change.",
  "Streamline grain-sector activities and provide the environment for industry self-regulation.",
  "Provide linkage to structured markets.",
  "Enable access to affordable financing for agri-business players.",
  "Provide capacity building to members and other stakeholders in the grain sub-sector.",
];

const PILLARS = [
  { n: 1, title: "Enabling environment for sustainable agribusiness development" },
  { n: 2, title: "Institutional & membership capacity growth and development" },
  { n: 3, title: "Inclusive agribusiness value-chain development" },
  { n: 4, title: "Sustainable markets and structured grain trade" },
  { n: 5, title: "Stakeholder management, engagement & coordination" },
];

const SERVICES = [
  "Policy advocacy for an enabling business environment for grain production and trading.",
  "Enabling and supporting affordable financing products and models for agricultural financing.",
  "Compiling, collating and disseminating sector-specific information.",
  "Training and capacity building for improved grain production efficiency and quality.",
  "Linkage to beneficial and structured input and output markets for members.",
];

// Board of Directors — officers & committee chairs first, then members (dossier 12 §6).
const BOARD = [
  { name: "Mr. Robert Mwanje", role: "Board Chairman" },
  { name: "Mrs. Annet Twebaze", role: "Vice Chairperson · Chair, HR & Administration Committee" },
  { name: "Mr. Henry K. Musisi", role: "Executive Director & Board Secretary" },
  { name: "Mr. Robert Rutebemberwa", role: "Chair, Membership & Corporate Affairs Committee" },
  { name: "Mr. Tom Opio Oming", role: "Chair, Audit, Monitoring & Evaluation Committee" },
  { name: "Mr. Benjamin Prinz", role: "Chair, Finance, Strategy & Business Development Committee" },
  { name: "Mr. Jacob Kabondo", role: "Member" },
  { name: "Col. Ronald Rubaale", role: "Member" },
  { name: "Dr. Aisha Kamira", role: "Member" },
  { name: "Mrs. Joan Mbonye", role: "Member" },
  { name: "Mr. Narcis Tumushabe", role: "Member" },
  { name: "Mr. Alfred Mwangi", role: "Member" },
  { name: "Mr. John Bosco Senoga", role: "Member" },
];

const ORGANOGRAM = [
  "Member Annual General Meeting",
  "Board of Directors",
  "Executive Director",
];

const MANAGERS = [
  "Finance & Administration Manager",
  "Partnerships & Programs Manager",
  "Member Services & Communications Manager",
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-section-sm">
      {/* ── Header + mandate */}
      <header className="max-w-3xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          The institution
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-fg md:text-4xl lg:text-5xl">
          The apex body of Uganda&apos;s grain industry
        </h1>
        <p className="mt-4 text-lg text-muted">
          The Grain Council of Uganda (TGCU) is a non-profit membership organisation, limited by
          guarantee and registered in 2012. It brings key stakeholders along the grains value chain
          into a single voice to engage and influence policy — making Uganda grain more competitive.
        </p>
        <p className="mt-4 text-xs text-muted">{PROVENANCE}</p>
      </header>

      <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {MANDATE.map((m) => (
          <li key={m} className="flex gap-2.5 text-sm text-muted">
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden />
            {m}
          </li>
        ))}
      </ul>

      {/* ── Vision & Mission */}
      <section aria-labelledby="vm-heading" className="mt-section-sm">
        <h2 id="vm-heading" className="sr-only">
          Vision and mission
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 md:p-8">
            <div
              aria-hidden
              className="mb-4 grid size-11 place-items-center rounded-[var(--radius-sm)] bg-brand-800/10 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300"
            >
              <Compass className="size-5" />
            </div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Vision
            </p>
            <p className="mt-2 font-display text-xl font-medium text-fg md:text-2xl">
              A Uganda that feeds the region and is the preferred source of high-quality grain in East
              and Central Africa.
            </p>
          </Card>
          <Card className="p-6 md:p-8">
            <div
              aria-hidden
              className="mb-4 grid size-11 place-items-center rounded-[var(--radius-sm)] bg-brand-800/10 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300"
            >
              <Target className="size-5" />
            </div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Mission
            </p>
            <p className="mt-2 font-display text-xl font-medium text-fg md:text-2xl">
              Championing efforts to make Uganda the grain basket and leading supplier for East and
              Central Africa&apos;s grain needs — through raising productivity, assuring food security
              and promoting regional trade.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Strategic direction 2024–2029 */}
      <section aria-labelledby="strategy-heading" className="mt-section-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="strategy-heading" className="font-display text-2xl font-medium text-fg md:text-3xl">
            Strategic direction
          </h2>
          <Badge variant="brand">2024–2029</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-base text-muted">
          The current strategic plan is built on five pillars that set TGCU&apos;s focus for the
          five-year period.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.n}>
              <Card className="flex h-full items-start gap-4 p-5">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] font-display text-lg font-medium text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {p.n}
                </span>
                <span className="text-sm font-medium text-fg">{p.title}</span>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ── What we do */}
      <section aria-labelledby="services-heading" className="mt-section-sm">
        <h2 id="services-heading" className="font-display text-2xl font-medium text-fg md:text-3xl">
          What we do
        </h2>
        <ul className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">
          {SERVICES.map((s) => (
            <li key={s} className="flex gap-3 border-t border-[var(--color-border)] pt-4 text-base text-muted">
              <ArrowRight className="mt-1 size-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Governance */}
      <section aria-labelledby="gov-heading" className="mt-section-sm">
        <h2 id="gov-heading" className="font-display text-2xl font-medium text-fg md:text-3xl">
          Governance
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted">
          TGCU is led by an elected Board that reports to the members&apos; Annual General Meeting. A
          thin Secretariat, led by the Executive Director, runs the council day to day.
        </p>

        {/* Organogram — reporting line + three management functions */}
        <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
          <ol className="flex flex-col items-center gap-2 text-center">
            {ORGANOGRAM.map((node, i) => (
              <li key={node} className="flex flex-col items-center gap-2">
                <span
                  className="rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-medium text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {node}
                </span>
                {i < ORGANOGRAM.length && (
                  <span aria-hidden className="h-4 w-px bg-[var(--color-border)]" />
                )}
              </li>
            ))}
          </ol>
          <ul className="mt-2 grid gap-3 sm:grid-cols-3">
            {MANAGERS.map((m) => (
              <li
                key={m}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2.5 text-center text-sm text-muted"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Board of Directors */}
        <h3 className="mt-10 font-display text-xl font-medium text-fg">Board of Directors</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD.map((d) => (
            <li key={d.name}>
              <Card className="h-full p-4">
                <p className="text-sm font-semibold text-fg">{d.name}</p>
                <p className="mt-1 text-xs text-muted">{d.role}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Provenance + contact */}
      <section className="mt-section-sm border-t border-[var(--color-border)] pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-fg">Get in touch</p>
            <address className="mt-2 text-sm not-italic text-muted">
              Plot 35 Kenneth Dale — Kamwokya · P.O. Box 24735, Kampala, Uganda
              <br />
              <a href="tel:+256393517499" className="hover:text-fg">
                (+256) 393 517499
              </a>{" "}
              ·{" "}
              <a href="mailto:info@tgcu.org" className="hover:text-fg">
                info@tgcu.org
              </a>
            </address>
          </div>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-interactive hover:underline"
          >
            Explore membership tiers <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">
          Institutional facts on this page are drawn from the TGCU Corporate Profile 2024 and reflect
          that document&apos;s point in time; board composition and figures may change.
        </p>
      </section>
    </div>
  );
}
