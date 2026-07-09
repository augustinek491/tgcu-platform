import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * THE verified trust marker — single treatment for every surface (BR-06; DS §9.8
 * registry; 07 §6.0 F.M2 geometry: radius-999, px-8 py-2, 12/500, 12px check-circle).
 * Tint brand-600 @14% light / @20% dark; text = text-safe steps (brand-800 6.1:1 /
 * brand-300 9.5:1 — AA both themes). Icon + text, colour never sole.
 * Adopters: marketplace cards + header (done), member directory, deal room,
 * membership header — pass `label` for variants like "Verified Member".
 */
export function VerifiedBadge({
  label = "Verified",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-brand-600/14 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-600/20 dark:text-brand-300",
        className,
      )}
    >
      <CircleCheck className="size-3 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
      {label}
    </span>
  );
}
