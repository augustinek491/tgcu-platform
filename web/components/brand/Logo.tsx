"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * TGCU logo — faithful recreation of the official mark: a golden rising-sun / grain
 * arc over a green wheat sheaf. Colours come from brand tokens (--gold-arc, --brand-*).
 * `mark` = emblem only (sidebar/topbar); `LogoWordmark` adds the full wordmark
 * (landing/auth). See DESIGN-SYSTEM §2 "Logo" — the mark MUST appear in the sidebar,
 * landing and auth screens.
 *
 * Signature moment P1 "sunrise over the grain" (DS §9.6 sun-arc motif; MOT-15/16):
 * on the FIRST mount of a browser session the golden arc draws left→right
 * (stroke-dashoffset, 280ms ease-out) and the five sun rays fade in east→west
 * (100ms each, 40ms stagger from 120ms) — everything settles by 400ms. Native WAAPI,
 * stroke/opacity only, zero layout. A sessionStorage gate stops it replaying on
 * later navigations; `prefers-reduced-motion` renders the finished mark instantly.
 * Server render is always the complete static logo (no-JS safe).
 */
const DRAWN_KEY = "tgcu:logo-drawn";
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)"; // --ease-out (H.2 default)

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

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

    const arc = svg.querySelector<SVGPathElement>("[data-logo-arc]");
    // pathLength=100 normalizes the arc; offset 100→0 draws it left→right.
    arc?.animate(
      { strokeDashoffset: ["100", "0"] },
      { duration: 280, easing: EASE_OUT, fill: "backwards" },
    );

    // Rays rise east→west across the arc (sorted by x): 100ms each, 40ms stagger.
    const rays = Array.from(svg.querySelectorAll<SVGLineElement>("[data-logo-ray]")).sort(
      (a, b) => Number(a.getAttribute("x1")) - Number(b.getAttribute("x1")),
    );
    rays.forEach((ray, i) => {
      ray.animate(
        { opacity: ["0", "1"] },
        { duration: 100, delay: 120 + i * 40, easing: EASE_OUT, fill: "backwards" },
      );
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="The Grain Council of Uganda"
      className={className}
    >
      {/* golden rising-sun / grain arc */}
      <g stroke="var(--gold-arc)" strokeWidth="2.2" strokeLinecap="round">
        <line data-logo-ray x1="20" y1="9.5" x2="20" y2="3" />
        <line data-logo-ray x1="12.7" y1="11.2" x2="9.4" y2="5.4" />
        <line data-logo-ray x1="27.3" y1="11.2" x2="30.6" y2="5.4" />
        <line data-logo-ray x1="7.3" y1="15.6" x2="2.6" y2="12.2" />
        <line data-logo-ray x1="32.7" y1="15.6" x2="37.4" y2="12.2" />
      </g>
      <path
        data-logo-arc
        d="M6 19.5a14 14 0 0 1 28 0"
        fill="none"
        stroke="var(--gold-arc)"
        strokeWidth="2.6"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
      />
      {/* green wheat sheaf */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="20" y1="21" x2="20" y2="36.5" stroke="var(--brand-700)" strokeWidth="2.4" />
        <path d="M20 26 C16 25 14 27 13.4 30.6" stroke="var(--brand-600)" strokeWidth="2.2" />
        <path d="M20 26 C24 25 26 27 26.6 30.6" stroke="var(--brand-600)" strokeWidth="2.2" />
        <path d="M20 30 C16.6 29.4 14.8 31 14.2 34" stroke="var(--brand-700)" strokeWidth="2.2" />
        <path d="M20 30 C23.4 29.4 25.2 31 25.8 34" stroke="var(--brand-700)" strokeWidth="2.2" />
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-[15px] font-semibold tracking-tight",
            onBrand ? "text-white" : "text-brand-800 dark:text-brand-600",
          )}
        >
          THE GRAIN COUNCIL
        </span>
        <span
          className={cn(
            "block text-[11px] font-medium uppercase tracking-[0.14em]",
            onBrand ? "text-brand-300" : "text-muted",
          )}
        >
          of Uganda
        </span>
      </span>
    </span>
  );
}
