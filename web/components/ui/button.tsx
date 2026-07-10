import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
        // Gold CTA carries dark text — never white (DS §9.1 / 06 F.1 locked; A11Y-04).
        // Hover per 06 F.1: grain-700 + white (light) / grain-300 + dark ink (dark).
        // `cta-glint` = harvest sheen sweep on hover (DS §9.6 / P2; globals.css) —
        // opacity/transform only, absolute pseudo, no layout shift.
        cta: "cta-glint bg-[var(--color-accent)] text-on-accent hover:bg-grain-700 hover:text-white dark:hover:bg-grain-300 dark:hover:text-on-accent",
        secondary:
          "border border-[var(--color-border)] bg-surface text-fg hover:bg-surface-2",
        ghost: "text-fg hover:bg-surface-2",
        // Token-derived hover shift riding the 150ms transition-colors — replaces the
        // hover:brightness-110 `filter` 0ms snap (MOT-04; H.2 sanctions color/bg only).
        danger:
          "bg-[var(--color-danger)] text-white hover:bg-[color-mix(in_srgb,var(--color-danger)_85%,black)]",
      },
      size: {
        // sm keeps the 36px visual but carries an invisible ::before hit-area to 44px
        // (A11Y-R2-12; ::before because cta-glint owns ::after). Focus ring unchanged.
        sm: "relative h-9 px-3 before:absolute before:inset-x-0 before:-inset-y-1",
        md: "h-11 px-4", // 44px min touch target
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
