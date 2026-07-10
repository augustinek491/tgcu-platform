/**
 * Data-freshness trust cue — "as of · source". Non-negotiable premium cue
 * (DESIGN-SYSTEM §7): every data surface shows freshness + source, monthly-not-live.
 *
 * The glyph is the DS §9.6 sun-arc motif (freshness/progress — micro version of the
 * LogoMark's golden rising-sun arc), replacing the generic CircleCheck (MOT-16).
 * Same 14px footprint + decorative behavior as before; `status-fade` gives content
 * refreshes a gentle 240ms ease-out opacity tween (DS §9.5; 0ms under
 * prefers-reduced-motion via --dur-status).
 */
function SunArc({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="var(--gold-arc)"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <g strokeWidth="1.4">
        <line x1="7" y1="3.4" x2="7" y2="1.6" />
        <line x1="3.9" y1="4.5" x2="2.7" y2="3.2" />
        <line x1="10.1" y1="4.5" x2="11.3" y2="3.2" />
      </g>
      <path d="M2.3 10.8a4.7 4.7 0 0 1 9.4 0" strokeWidth="1.6" />
    </svg>
  );
}

export function FreshnessIndicator({
  asOf,
  source,
}: {
  asOf: string;
  source: string;
}) {
  return (
    <span
      className="status-fade inline-flex items-center gap-2 text-xs text-muted"
      title="Data freshness"
    >
      <SunArc className="size-3.5 shrink-0" />
      <span>
        as of <span className="tabular font-medium text-fg">{asOf}</span> · {source}
      </span>
    </span>
  );
}
