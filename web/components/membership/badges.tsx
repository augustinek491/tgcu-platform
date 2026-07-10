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
      // Text = tier text-safe pair (DS §9.1 / AM-04); gold-family tints ≤10% (ratified
      // 2026-07-10): gold 10% → 4.55:1, bronze (amber fill, darker) needs 7% → 4.57:1.
      // §9.10 worst-backdrop rule: mix against --color-surface (not transparent) so the
      // pair is placement-independent — on --bg the transparent mix measured 4.37 (DM3-02).
      style={{
        color: `var(--tier-${tier.id}-text)`,
        background: `color-mix(in srgb, ${tier.accentVar} ${
          tier.id === "gold" ? 10 : tier.id === "bronze" ? 7 : 14
        }%, var(--color-surface))`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tier.accentVar }} />
      {tier.name}
    </span>
  );
}

// On-tint text = *-badge-text pairs, tint 14%/20% — mirrors core Badge (DS §9.1 / AM-01).
const STANDING_STYLE: Record<Standing, string> = {
  good: "text-[var(--success-badge-text)] bg-[var(--color-success)]/14 dark:bg-[var(--color-success)]/20",
  grace: "text-[var(--warning-badge-text)] bg-[var(--color-warning)]/14 dark:bg-[var(--color-warning)]/20",
  suspended: "text-[var(--danger-badge-text)] bg-[var(--color-danger)]/14 dark:bg-[var(--color-danger)]/20",
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
