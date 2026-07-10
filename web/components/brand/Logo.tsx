"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * TGCU logo — faithful rendering of the OFFICIAL mark (adopted 2026-07-10 from the
 * TGCU Corporate Profile 2024 asset; see knowledge-base/12-corporate-profile-2024.md).
 * The emblem is a green **wheat-ear** flanked by two green **leaves**, cradled by an
 * open **gold crescent**, with a green **"TGCU" banner** across the base.
 *
 * ⚠ The previous version reconstructed a "rising-sun with five rays over a wheat sheaf"
 * — that motif is NOT in the real mark (it was a placeholder built before the official
 * asset arrived). Colours come from brand tokens (--gold-arc = the real crescent gold,
 * --brand-600/700 = the emblem greens) so both themes and the a11y-tuned palette hold.
 *
 * `mark` = emblem only (sidebar/topbar); `LogoWordmark` adds the full wordmark
 * (landing/auth). See DESIGN-SYSTEM §2 "Logo" + §9.11 — the mark MUST appear in the
 * sidebar, landing and auth screens.
 *
 * Signature moment P1 "harvest" (DS §9.6, re-framed off the real geometry; MOT-15/16):
 * on the FIRST mount of a browser session the **gold crescent** draws left→right
 * (stroke-dashoffset, 320ms ease-out) and the green ear/leaves/banner fade up
 * (240ms from 160ms) — everything settles by ~400ms. Native WAAPI, stroke/opacity
 * only, zero layout. A sessionStorage gate stops it replaying on later navigations;
 * `prefers-reduced-motion` renders the finished mark instantly. Server render is
 * always the complete static logo (no-JS safe).
 */
const DRAWN_KEY = "tgcu:logo-drawn";
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)"; // --ease-out (H.2 default)

/** Wheat-ear leaflets, bottom→top; each renders as a mirrored pair fanning off the stem. */
const LEAFLETS = [
  { y: 30.5, s: 1.0 },
  { y: 26.2, s: 0.9 },
  { y: 22.1, s: 0.78 },
  { y: 18.2, s: 0.64 },
] as const;
// A single leaflet: pointed tip up (0,-8.4), base at the stem (0,0).
const LEAFLET_D = "M0 0 C -1.9 -2.6 -1.9 -6.4 0 -8.4 C 1.9 -6.4 1.9 -2.6 0 0 Z";

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  // "TGCU" banner text is only legible at display sizes; below that the pill reads as
  // the mark's silhouette (crisper than muddy sub-pixel letters).
  const showBannerText = size >= 44;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(DRAWN_KEY)) return;
      sessionStorage.setItem(DRAWN_KEY, "1"); // claim before playing — only one mark per session draws
    } catch {
      return; // storage unavailable → never animate rather than replay on every nav
    }

    // The gold crescent draws left→right (pathLength=100 normalizes it; offset 100→0).
    svg
      .querySelector<SVGPathElement>("[data-logo-arc]")
      ?.animate({ strokeDashoffset: ["100", "0"] }, { duration: 320, easing: EASE_OUT, fill: "backwards" });

    // The green ear + leaves + banner rise into the crescent (opacity only — no layout,
    // and it never fights the leaflets' positioning transforms).
    svg
      .querySelector<SVGGElement>("[data-logo-grow]")
      ?.animate({ opacity: ["0", "1"] }, { duration: 240, delay: 160, easing: EASE_OUT, fill: "backwards" });
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="The Grain Council of Uganda"
      className={className}
    >
      {/* Gold crescent — open at the top where the ear emerges; drawn on first mount. */}
      <path
        data-logo-arc
        d="M14 17 A 15.5 15.5 0 1 0 34 17"
        fill="none"
        stroke="var(--gold-arc)"
        strokeWidth="3.4"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
      />

      <g data-logo-grow>
        {/* Two flanking leaves at the base of the ear. */}
        <path
          d="M24 34 C 15.5 33.5 10.8 28.5 12 22.4 C 17.4 25 22 29 24 34 Z"
          fill="var(--brand-700)"
        />
        <path
          d="M24 34 C 32.5 33.5 37.2 28.5 36 22.4 C 30.6 25 26 29 24 34 Z"
          fill="var(--brand-700)"
        />

        {/* Wheat ear — central stem + mirrored leaflet pairs + terminal tip. */}
        <line x1="24" y1="33" x2="24" y2="13" stroke="var(--brand-600)" strokeWidth="1.6" strokeLinecap="round" />
        {LEAFLETS.map((l) => (
          <g key={l.y}>
            <path d={LEAFLET_D} transform={`translate(24 ${l.y}) rotate(-30) scale(${l.s})`} fill="var(--brand-600)" />
            <path d={LEAFLET_D} transform={`translate(24 ${l.y}) rotate(30) scale(${l.s})`} fill="var(--brand-600)" />
          </g>
        ))}
        <path d={LEAFLET_D} transform="translate(24 13.5) scale(0.62)" fill="var(--brand-600)" />

        {/* Green "TGCU" banner across the base. */}
        <ellipse cx="24" cy="35.4" rx="9.2" ry="3.7" fill="var(--brand-700)" />
        {showBannerText && (
          <text
            x="24"
            y="35.4"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="4.3"
            fontWeight="700"
            fontFamily="var(--font-sans, ui-sans-serif), sans-serif"
            letterSpacing="0.1"
            fill="#ffffff"
          >
            TGCU
          </text>
        )}
      </g>
    </svg>
  );
}

export function LogoWordmark({
  className,
  markSize = 34,
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
