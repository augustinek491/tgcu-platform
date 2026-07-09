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
        good
          ? "bg-[var(--color-success)]/10 text-success-text"
          : "bg-[var(--color-danger)]/10 text-danger-text",
        className,
      )}
    >
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "up" : "down"}</span>
      {children}
    </span>
  );
}
