import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        // AA badge recipe (AM-04; A11Y-02/DM-05/DM-06): tint bg ~14% light / ~20% dark,
        // text = the accent's text-safe step (--*-badge-text pairs in globals.css).
        neutral: "bg-surface-2 text-muted",
        brand: "bg-brand-300/30 text-brand-800 dark:text-brand-300",
        success:
          "bg-[var(--color-success)]/14 text-[var(--success-badge-text)] dark:bg-[var(--color-success)]/20",
        warning:
          "bg-[var(--color-warning)]/14 text-[var(--warning-badge-text)] dark:bg-[var(--color-warning)]/20",
        danger:
          "bg-[var(--color-danger)]/14 text-[var(--danger-badge-text)] dark:bg-[var(--color-danger)]/20",
        info: "bg-[var(--color-info)]/14 text-[var(--info-badge-text)] dark:bg-[var(--color-info)]/20",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
