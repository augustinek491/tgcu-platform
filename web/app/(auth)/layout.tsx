import Link from "next/link";
import { LogoWordmark } from "@/components/brand/Logo";
import { GrainHorizon } from "@/components/brand/GrainHorizon";

/**
 * Auth shell — split composition per 06 PART C (LAY-10/IMG-03): on ≥1024 a
 * theme-invariant --brand-800 brand panel (wordmark, one-line value prop,
 * PART I.4 line-art grain-horizon motif, honesty notes) sits left of the form
 * panel; below 1024 the brand panel collapses to a slim top bar and the form
 * comes first (375 = single column). The panel is line-art only — never a
 * photo (IMAGERY-PROGRAMME placement 4).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[minmax(400px,44%)_minmax(0,1fr)]">
      {/* Brand panel (≥1024) */}
      <aside className="relative hidden overflow-hidden bg-brand-800 lg:flex lg:flex-col lg:justify-between lg:gap-12 lg:p-12">
        <Link href="/" aria-label="TGCU home" className="relative z-10 w-fit">
          <LogoWordmark tone="onBrand" />
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="font-display text-3xl font-medium leading-snug text-white">
            Trusted market intelligence and membership for Uganda&apos;s grain sector.
          </p>
          <p className="mt-4 text-sm text-brand-300">
            Monthly prices with provenance · verified members · escrow-backed trade.
          </p>
        </div>

        <div className="relative z-10 space-y-1 text-xs text-brand-300">
          <p>Informational, not financial advice.</p>
          <p>Demonstration platform · seeded data</p>
        </div>

        {/* PART I.4 motif — texture, not illustration; decorative only */}
        <GrainHorizon className="absolute inset-x-0 bottom-0 h-48 w-full" />
      </aside>

      {/* Form panel */}
      <div className="flex min-h-dvh flex-col lg:min-h-0">
        {/* Slim brand bar (<1024) — PART C: the brand panel becomes a slim top bar */}
        <div className="flex h-14 shrink-0 items-center bg-brand-800 px-4 lg:hidden">
          <Link href="/" aria-label="TGCU home">
            <LogoWordmark tone="onBrand" markSize={26} />
          </Link>
        </div>
        {/* 432 − 2×16 gutter = the PART C card max-w 400 (LAY-15); px-4 on-token (LAY-07) */}
        <div className="mx-auto flex w-full max-w-[432px] flex-1 flex-col justify-center px-4 py-12">
          <main id="main">{children}</main>
        </div>
      </div>
    </div>
  );
}
