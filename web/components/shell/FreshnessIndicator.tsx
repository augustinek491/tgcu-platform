import { CircleCheck } from "lucide-react";

/**
 * Data-freshness trust cue — "as of · source". Non-negotiable premium cue
 * (DESIGN-SYSTEM §7): every data surface shows freshness + source, monthly-not-live.
 */
export function FreshnessIndicator({
  asOf,
  source,
}: {
  asOf: string;
  source: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" title="Data freshness">
      <CircleCheck className="size-3.5 text-[var(--color-success)]" aria-hidden />
      <span>
        as of <span className="tabular font-medium text-fg">{asOf}</span> · {source}
      </span>
    </span>
  );
}
