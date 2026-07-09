import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Map body geometry is PINNED (DS §9.9 / AM-33): ≈360px desktop, 280px below
 * `lg` (PART G mobile map row). Skeleton and live map share this exact class
 * so the island swap causes zero CLS (A.11 "skeletons match final dimensions").
 */
export const MAP_BODY_CLASS = "h-[280px] lg:h-[360px]";

/** Loading placeholder for the lazy map island — grain-sweep shimmer via
 *  `.skeleton` (static under prefers-reduced-motion), sized to the final map. */
export function MapSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("w-full rounded-[var(--radius-sm)]", MAP_BODY_CLASS, className)}
      aria-hidden="true"
    />
  );
}
