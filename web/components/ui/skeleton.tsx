import { cn } from "@/lib/utils";

/** Layout-stable loading placeholder (matches final layout → CLS-safe). NFR-89. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-surface-2", className)}
      {...props}
    />
  );
}
