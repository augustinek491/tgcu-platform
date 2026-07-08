import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-2 text-muted",
        brand: "bg-brand-300/30 text-brand-800 dark:text-brand-300",
        success: "bg-[var(--color-success)]/12 text-[var(--color-success)]",
        warning: "bg-[var(--color-warning)]/12 text-[var(--color-warning)]",
        danger: "bg-[var(--color-danger)]/12 text-[var(--color-danger)]",
        info: "bg-[var(--color-info)]/12 text-[var(--color-info)]",
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
