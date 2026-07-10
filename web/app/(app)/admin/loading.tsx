import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin-route skeleton — table-shaped (FLOW-R2-01; 06 A.11 "Table: 8 shimmer
 * rows", 01 §6.8 "skeleton rows matching final columns"): page header, a stat
 * strip, then a card-shaped block of 8 rows. Replaces the KPI-grid shape that
 * used to flash on /admin/members and friends before content arrived.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-[42px] w-64" />
        <Skeleton className="h-[21px] w-80 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-40" />
        ))}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        <Skeleton className="h-11 w-full rounded-none" />
        <div className="space-y-px p-px">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
