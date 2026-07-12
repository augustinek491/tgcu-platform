import Image from "next/image";
import { cn } from "@/lib/utils";
import emblem from "@/assets/tgcu-emblem.webp";

/**
 * TGCU logo — the OFFICIAL mark (exact artwork from the TGCU Corporate Profile 2024;
 * KB dossier 12). The emblem is the real vector-derived raster: a green wheat-ear with
 * gold grains, flanked by green leaves, cradled by an open gold crescent, over a green
 * "TGCU" banner. Cropped from the official asset and background-removed to transparency
 * (`assets/tgcu-emblem.webp`, 310×400) so it sits cleanly on any surface in both themes.
 *
 * `LogoMark` = emblem only (sidebar/topbar); `LogoWordmark` adds the wordmark text
 * (rendered in theme-aware HTML so "THE GRAIN COUNCIL / of Uganda" adapts to light/dark,
 * while the emblem stays the exact brand artwork). See DESIGN-SYSTEM §2 + §9.11 — the
 * logo MUST appear in the sidebar, landing and auth screens.
 */
const EMBLEM_ASPECT = 310 / 400; // width / height of the tight emblem crop

/** `size` = rendered height in px; width scales to the emblem's true aspect. */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={emblem}
      alt="The Grain Council of Uganda"
      width={Math.round(size * EMBLEM_ASPECT)}
      height={size}
      className={cn("h-auto w-auto shrink-0 select-none", className)}
      style={{ height: size, width: Math.round(size * EMBLEM_ASPECT) }}
      priority
    />
  );
}

export function LogoWordmark({
  className,
  markSize = 36,
  tone = "default",
}: {
  className?: string;
  markSize?: number;
  /** `onBrand` = light-on-green treatment for the theme-invariant --brand-800
   *  auth panel (06 PART C) — white wordmark ≈6:1, --brand-300 subline ≈7.5:1. */
  tone?: "default" | "onBrand";
}) {
  const onBrand = tone === "onBrand";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={markSize} />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-sm font-semibold tracking-tight",
            onBrand ? "text-white" : "text-brand-800 dark:text-brand-600",
          )}
        >
          THE GRAIN COUNCIL
        </span>
        <span
          className={cn(
            "block text-xs font-medium uppercase tracking-[0.14em]",
            onBrand ? "text-brand-300" : "text-muted",
          )}
        >
          of Uganda
        </span>
      </span>
    </span>
  );
}
