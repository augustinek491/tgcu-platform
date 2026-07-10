import { DeltaPill } from "@/components/ui/delta-pill";
import { formatUGXPerKg } from "@/lib/utils";

export type TooltipSeriesEntry = {
  name: string;
  color?: string;
  /** Current month's observation; null = not reported (rendered "—", never 0). */
  value: number | null;
  /** Previous month's observation — powers the A.6 MoM delta chip (DV-R2-06). */
  prev?: number | null;
};

const MINUS = "−"; // U+2212 per DS §9.7

/**
 * Shared A.6 hover-tooltip for BOTH trend charts — the /market Recharts island
 * and the dashboard's static-SVG hover layer (DV-R2-02) — so the two cards can
 * never drift apart. Chrome per 06 A.6 (DV-R2-05): `--surface` card, 1px
 * `--border`, radius-8, padding 12, shadow. Content: month, per-series value
 * (tabular, bold), MoM delta chip, and the "Monthly · source" honesty line.
 */
export function ProvenanceTooltip({
  label,
  entries,
  source,
}: {
  label?: string | number;
  entries: TooltipSeriesEntry[];
  source: string;
}) {
  if (!entries.length) return null;
  return (
    <div className="max-w-[calc(100vw-48px)] rounded-[8px] border border-[var(--color-border)] bg-surface p-3 text-xs shadow-[var(--shadow-pop)]">
      <div className="mb-1 font-medium text-fg">{label}</div>
      <div className="space-y-1">
        {entries.map((e) => {
          const pct =
            e.value != null && e.prev != null && e.prev !== 0
              ? ((e.value - e.prev) / e.prev) * 100
              : null;
          return (
            <div key={e.name} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-muted">
                <span className="size-2 shrink-0 rounded-full" style={{ background: e.color }} />
                {e.name}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="tabular font-semibold text-fg">
                  {e.value == null ? (
                    <>
                      <span aria-hidden>—</span>
                      <span className="sr-only">no data</span>
                    </>
                  ) : (
                    formatUGXPerKg(e.value)
                  )}
                </span>
                {pct != null && (
                  <DeltaPill dir={pct >= 0 ? "up" : "down"}>
                    {pct >= 0 ? "+" : MINUS}
                    {Math.abs(pct).toFixed(1)}%
                  </DeltaPill>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 border-t border-[var(--color-border)] pt-1 text-xs text-muted">
        Monthly · {source}
      </div>
    </div>
  );
}
