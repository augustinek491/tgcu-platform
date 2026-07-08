import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { tierById, type TierId } from "@/lib/membership/tiers";
import { STANDING_LABEL, type Standing } from "@/lib/membership/model";

/** Tier chip — uses the tier accent (chips/cards only, DESIGN-SYSTEM §2). */
export function TierBadge({ tierId, className }: { tierId: TierId; className?: string }) {
  const tier = tierById(tierId);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
      style={{ color: tier.accentVar, background: `color-mix(in srgb, ${tier.accentVar} 14%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tier.accentVar }} />
      {tier.name}
    </span>
  );
}

const STANDING_STYLE: Record<Standing, string> = {
  good: "text-[var(--color-success)] bg-[var(--color-success)]/12",
  grace: "text-[var(--color-warning)] bg-[var(--color-warning)]/12",
  suspended: "text-[var(--color-danger)] bg-[var(--color-danger)]/12",
  lapsed: "text-muted bg-surface-2",
};

export function StandingBadge({ standing }: { standing: Standing }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
        STANDING_STYLE[standing],
      )}
    >
      {STANDING_LABEL[standing]}
    </span>
  );
}

/** "Verified TGCU Member" trust badge (FR-MEM-03). */
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-brand-300/25 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:text-brand-300">
      <BadgeCheck className="size-3.5" /> Verified Member
    </span>
  );
}
