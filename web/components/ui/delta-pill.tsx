import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Delta chip (06 A.5.3, ratified DS §9.4 / AM-18): tint pill, tabular value,
 * ▲/▼ keeps DIRECTION while color encodes VALENCE — an improvement renders
 * success even when the number falls (e.g. overdue invoices −9). Never
 * color-only: the arrow glyph + signed value carry the direction for free.
 */
export function DeltaPill({
  dir,
  valence,
  className,
  children,
}: {
  dir: "up" | "down";
  /** Defaults to the direction (up = good). */
  valence?: "good" | "bad";
  className?: string;
  children: ReactNode;
}) {
  const up = dir === "up";
  const good = valence ? valence === "good" : up;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium",
        // §9.1/AM-04 badge steps on tints (A11Y-R3-02: the *-text steps measure 4.37
        // on the 10% tint; the *-badge-text steps are the on-tint pairs, ≥5.8 both themes)
        good
          ? "bg-[var(--color-success)]/10 text-[var(--success-badge-text)]"
          : "bg-[var(--color-danger)]/10 text-[var(--danger-badge-text)]",
        className,
      )}
    >
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "up" : "down"}</span>
      {children}
    </span>
  );
}
