import { Skeleton } from "@/components/ui/skeleton";

/**
 * App-shell skeleton — layout-stable, appears ≤400ms (NFR-89). Dimensions match
 * the rendered dashboard family, measured live per breakpoint (FLOW-R2-01 /
 * 06 A.11 "skeletons match final dimensions"): page header 67px (28px H1 line
 * + sub), KPI cards 229px, trend card 469/431/560 and movers card 560/506/560
 * at 375/768/≥1024 (the A.7 movers card sets the ≥1024 row height). Rhythm
 * mirrors the live pages: 32px regions, 24px gutters (A.1). Admin/table routes
 * get their own table-shaped skeleton (admin/loading.tsx).
 */
export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-[42px] w-64" />
        <Skeleton className="h-[21px] w-80 max-w-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[229px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[469px] sm:h-[431px] lg:col-span-2 lg:h-[560px]" />
        <Skeleton className="h-[560px] sm:h-[506px] lg:h-[560px]" />
      </div>
    </div>
  );
}
