import { cn } from "@/lib/utils";

/** Layout-stable loading placeholder (matches final layout → CLS-safe). NFR-89.
 *  Visuals: `.skeleton` in globals.css — grain-sweep shimmer (1400ms linear, H.2/AM-23),
 *  static under prefers-reduced-motion. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}
