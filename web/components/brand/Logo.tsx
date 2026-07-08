import { cn } from "@/lib/utils";

/**
 * TGCU logo — faithful recreation of the official mark: a golden rising-sun / grain
 * arc over a green wheat sheaf. Colours come from brand tokens (--gold-arc, --brand-*).
 * `mark` = emblem only (sidebar/topbar); `LogoWordmark` adds the full wordmark
 * (landing/auth). See DESIGN-SYSTEM §2 "Logo" — the mark MUST appear in the sidebar,
 * landing and auth screens.
 */
export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="The Grain Council of Uganda"
      className={className}
    >
      {/* golden rising-sun / grain arc */}
      <g stroke="var(--gold-arc)" strokeWidth="2.2" strokeLinecap="round">
        <line x1="20" y1="9.5" x2="20" y2="3" />
        <line x1="12.7" y1="11.2" x2="9.4" y2="5.4" />
        <line x1="27.3" y1="11.2" x2="30.6" y2="5.4" />
        <line x1="7.3" y1="15.6" x2="2.6" y2="12.2" />
        <line x1="32.7" y1="15.6" x2="37.4" y2="12.2" />
      </g>
      <path
        d="M6 19.5a14 14 0 0 1 28 0"
        fill="none"
        stroke="var(--gold-arc)"
        strokeWidth="2.6"
        strokeLinecap="round"
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
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold tracking-tight text-brand-800 dark:text-brand-600">
          THE GRAIN COUNCIL
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          of Uganda
        </span>
      </span>
    </span>
  );
}
