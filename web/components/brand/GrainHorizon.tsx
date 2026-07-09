import { cn } from "@/lib/utils";

/**
 * Grain-field horizon motif for the auth brand panel — 06 PART I.4: "a very
 * subtle single-line grain-field horizon or wheat contour at low opacity on the
 * --brand-800 panel — texture, not illustration." Hand-authored inline SVG,
 * decorative only (aria-hidden); no photo ever sits on this panel
 * (IMAGERY-PROGRAMME placement 4).
 *
 * Strokes stay on brand tokens (--brand-300 horizon lines, --gold-arc wheat
 * contour) at low opacity so the panel reads as quiet texture in both themes
 * (the panel itself is theme-invariant --brand-800).
 */
export function GrainHorizon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 220"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none select-none", className)}
    >
      {/* rolling horizon */}
      <path
        d="M0 128 C 90 108 170 126 260 118 C 360 109 430 88 520 96 C 570 100 610 108 640 104"
        stroke="var(--brand-300)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.34"
      />
      {/* nearer field line */}
      <path
        d="M0 168 C 110 152 200 166 300 158 C 410 149 500 158 640 144"
        stroke="var(--brand-300)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.22"
      />
      {/* furrow hints */}
      <g stroke="var(--brand-300)" strokeWidth="1.5" strokeLinecap="round" opacity="0.14">
        <path d="M40 196 C 140 186 240 192 340 186" />
        <path d="M300 206 C 400 198 500 202 600 194" />
      </g>
      {/* single wheat contour rising off the horizon */}
      <g
        stroke="var(--gold-arc)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      >
        <path d="M520 96 C 519 74 521 58 524 40" />
        <path d="M523 48 C 517 46 513.5 48.5 513 54" />
        <path d="M523 48 C 529 46 532.5 48.5 533 54" />
        <path d="M523.5 58 C 517.5 56 514 58.5 513.5 64" />
        <path d="M523.5 58 C 529.5 56 533 58.5 533.5 64" />
        <path d="M524 40 L524.5 32" />
      </g>
    </svg>
  );
}
