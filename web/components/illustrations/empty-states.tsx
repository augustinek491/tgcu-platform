import { cn } from "@/lib/utils";

/**
 * TGCU empty-state line-art family — hand-authored per 06 PART I.2 and the
 * imagery programme (IMAGERY-PROGRAMME.md placement 5): grain basket · wheat
 * sheaf · map-with-pin · clipboard-check. One visual language, swappable per
 * context.
 *
 * Rules (binding):
 *  – 2px stroke; primary strokes --brand-600, secondary strokes --color-muted;
 *    minimal fills --brand-300 at 20% (fill-opacity, never a text token).
 *  – Shared 96×96 viewBox and scale so the pieces are interchangeable.
 *  – aria-hidden: the adjacent empty-state headline/body carry the meaning
 *    (imagery delivery law: decorative → aria-hidden).
 *  – Gentle one-time draw-in (opacity + 3px rise, ≤300ms via --dur-status,
 *    ease-out) with prefers-reduced-motion rendering static (DS §9.6 / H.2).
 */

type IllustrationProps = {
  /** Rendered square size in px (default 88). */
  size?: number;
  className?: string;
};

/** One-time entrance for the family; removed entirely under reduced motion. */
const DRAW_IN_CSS = `
@keyframes tgcu-illustration-in {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: none; }
}
.tgcu-illustration {
  animation: tgcu-illustration-in var(--dur-status, 240ms) var(--ease-out, ease-out) both;
}
@media (prefers-reduced-motion: reduce) {
  .tgcu-illustration { animation: none; }
}
`;

function Frame({
  size = 88,
  className,
  children,
}: IllustrationProps & { children: React.ReactNode }) {
  return (
    <>
      <style>{DRAW_IN_CSS}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={cn("tgcu-illustration", className)}
      >
        {children}
      </svg>
    </>
  );
}

/** Empty grain basket — "nothing here yet" (marketplace browse, listings). */
export function GrainBasketIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/* body (woven basket, tapering) */}
      <path
        d="M26 40 L31 66 Q32.5 73 40 73 L56 73 Q63.5 73 65 66 L70 40"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--brand-300)"
        fillOpacity="0.2"
      />
      {/* rim */}
      <ellipse
        cx="48"
        cy="40"
        rx="24"
        ry="5.5"
        stroke="var(--brand-600)"
        strokeWidth="2"
      />
      {/* weave hints (secondary) */}
      <path
        d="M29.5 52 Q48 56.5 66.5 52"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M31.5 62 Q48 66 64.5 62"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* a single stray grain beside the basket */}
      <ellipse
        cx="77.5"
        cy="71"
        rx="4"
        ry="2.6"
        transform="rotate(-24 77.5 71)"
        stroke="var(--color-muted)"
        strokeWidth="2"
      />
      {/* ground line */}
      <path
        d="M22 78 H74"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Frame>
  );
}

/** Wheat sheaf — quiet brand mark for "no movement / nothing to show". */
export function WheatSheafIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/* side stems (secondary) */}
      <path
        d="M40 78 C40 62 42.5 50 46.5 38"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M56 78 C56 62 53.5 50 49.5 38"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* central stem */}
      <path
        d="M48 78 V22"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* grain pairs on the head */}
      <g stroke="var(--brand-600)" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M48 30 C43.5 29 41 31 40.5 35" />
        <path d="M48 30 C52.5 29 55 31 55.5 35" />
        <path d="M48 37 C43.5 36 41 38 40.5 42" />
        <path d="M48 37 C52.5 36 55 38 55.5 42" />
      </g>
      {/* awns at the tip (secondary) */}
      <g stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round">
        <path d="M48 22 L48 15" />
        <path d="M45.5 23 L42.5 17" />
        <path d="M50.5 23 L53.5 17" />
      </g>
      {/* tie band */}
      <path
        d="M38 57 Q48 62 58 57 L57 64 Q48 68.5 39 64 Z"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--brand-300)"
        fillOpacity="0.2"
      />
      {/* ground line */}
      <path
        d="M30 84 H66"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Frame>
  );
}

/** Folded map with a price pin — "not found / not on the map". */
export function MapPinIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/* trifold map outline */}
      <path
        d="M14 32 L38 25 L58 31 L82 25 L82 64 L58 71 L38 65 L14 71 Z"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--brand-300)"
        fillOpacity="0.2"
      />
      {/* fold lines (secondary) */}
      <path d="M38 25 V65" stroke="var(--color-muted)" strokeWidth="2" />
      <path d="M58 31 V71" stroke="var(--color-muted)" strokeWidth="2" />
      {/* dashed route on the left panel (secondary) */}
      <path
        d="M20 56 Q26 46 33 49"
        stroke="var(--color-muted)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      {/* pin over the centre panel */}
      <path
        d="M48 30 C41.5 30 37.5 35 37.5 40.5 C37.5 48 48 58 48 58 C48 58 58.5 48 58.5 40.5 C58.5 35 54.5 30 48 30 Z"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--brand-300)"
        fillOpacity="0.2"
      />
      <circle cx="48" cy="41" r="3.5" stroke="var(--brand-600)" strokeWidth="2" />
    </Frame>
  );
}

/** Clipboard with a check — "queue clear / everything reviewed". */
export function ClipboardCheckIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/* board */}
      <rect
        x="28"
        y="18"
        width="40"
        height="60"
        rx="6"
        stroke="var(--brand-600)"
        strokeWidth="2"
      />
      {/* clip */}
      <rect
        x="41"
        y="12"
        width="14"
        height="10"
        rx="3"
        stroke="var(--brand-600)"
        strokeWidth="2"
        fill="var(--brand-300)"
        fillOpacity="0.2"
      />
      {/* checklist lines (secondary) */}
      <path d="M36 34 H60" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 42 H52" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" />
      {/* check, softly backed */}
      <circle cx="48" cy="59" r="13" fill="var(--brand-300)" fillOpacity="0.2" />
      <path
        d="M40.5 59.5 L46 65 L57 53"
        stroke="var(--brand-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}
