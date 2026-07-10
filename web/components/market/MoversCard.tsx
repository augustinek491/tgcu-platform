"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DeltaPill } from "@/components/ui/delta-pill";
import { WheatSheafIllustration } from "@/components/illustrations/empty-states";
import { cn } from "@/lib/utils";

export type MoverRow = {
  key: string;
  /** Row label per 06 A.7 — "commodity" or "commodity · market", truncated. */
  label: string;
  /** Mini-sparkline series (nulls = reporting gaps; short series render nothing). */
  spark: (number | null)[];
  /** Latest value, pre-formatted (UGX/kg). */
  value: string;
  delta: { dir: "up" | "down"; text: string };
};

/** Mini sparkline geometry (06 A.7: w64 h20) — single-hue `--data` per ratified
 * DS §9.4/DV-05; direction is carried by the delta pill, never by color alone. */
function sparkPoints(vals: (number | null)[], w = 64, h = 20, pad = 2): string {
  const nums = vals.filter((v): v is number => v != null);
  if (nums.length < 2) return "";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return vals
    .map((v, i) =>
      v == null
        ? null
        : `${(pad + (i * (w - 2 * pad)) / (vals.length - 1)).toFixed(1)},${(max === min
            ? h / 2
            : pad + (h - 2 * pad) * (1 - (v - min) / (max - min))
          ).toFixed(1)}`,
    )
    .filter(Boolean)
    .join(" ");
}

/**
 * Shared movers card (06 A.7; DV-R2-01): header with the `Rising · Falling`
 * segmented toggle (12/500), rows of label + mini sparkline (w64 h20) + delta
 * pill, max 6 rows, "View all movers →" footer and card-level provenance
 * (AF-9). Used by BOTH /dashboard (market-level movers) and /market
 * (commodity-level movers) so the two treatments can never diverge again.
 * An empty side renders the A.11 empty state (illustration + 16/600 headline
 * + action) — reachable via the toggle even with an all-rising seed.
 */
export function MoversCard({
  title = "Movers",
  subtitle,
  rows,
  footerHref,
  footerLabel = "View all movers →",
  asOf,
  sources,
}: {
  title?: string;
  subtitle: string;
  rows: MoverRow[];
  footerHref?: string;
  footerLabel?: string;
  asOf: string;
  sources: string;
}) {
  const [dir, setDir] = useState<"up" | "down">("up");
  const shown = rows.filter((r) => r.delta.dir === dir).slice(0, 6);

  const segment = (target: "up" | "down", text: string) => {
    const active = dir === target;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => setDir(target)}
        className={cn(
          "inline-flex min-h-11 items-center px-3 text-xs font-medium transition-colors duration-[var(--dur-fast)]",
          active ? "bg-brand-800 text-white" : "text-muted hover:bg-surface-2",
        )}
      >
        {text}
      </button>
    );
  };

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        {/* A.7 segmented Rising · Falling toggle */}
        <div
          role="group"
          aria-label={`${title} — rising or falling`}
          className="inline-flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]"
        >
          {segment("up", "Rising")}
          {segment("down", "Falling")}
        </div>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          /* A.11/A.7 empty state — illustration + 16/600 headline + action */
          <div className="py-6 text-center">
            <WheatSheafIllustration size={64} className="mx-auto" />
            <p className="mt-2 text-base font-semibold text-fg">
              No {dir === "up" ? "rising" : "falling"} movers this month
            </p>
            <p className="mt-1 text-sm text-muted">
              Movers derive from reporting markets only — nothing is fabricated.
            </p>
            <Link
              href="/market"
              className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-brand-interactive hover:underline"
            >
              Open market data →
            </Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {shown.map((r) => (
              <li
                key={r.key}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] px-2 py-2 transition-colors duration-[var(--dur-fast)] hover:bg-surface-2"
              >
                <span className="min-w-0 truncate text-sm font-medium text-fg">{r.label}</span>
                {/* Mini sparkline (A.7/DV-R2-01) — decorative; the value + pill
                    are the data record. In the narrow lg band (3-col grid ⇒
                    ~219px card) the fixed 64px spark would crush the label to
                    unreadable, so it yields until xl; full width below lg. */}
                <svg
                  viewBox="0 0 64 20"
                  width="64"
                  height="20"
                  aria-hidden="true"
                  className="ml-auto shrink-0 text-[var(--data)] lg:hidden xl:block"
                >
                  <polyline
                    points={sparkPoints(r.spark)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-right">
                  <div className="tabular text-sm text-fg">{r.value}</div>
                  <DeltaPill dir={r.delta.dir} className="mt-1">
                    {r.delta.text}
                  </DeltaPill>
                </div>
              </li>
            ))}
          </ul>
        )}
        {/* Footer link (A.7) */}
        {footerHref && (
          <Link
            href={footerHref}
            className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-brand-interactive hover:underline"
          >
            {footerLabel}
          </Link>
        )}
        {/* Card-level provenance (AF-9) */}
        <p className="mt-1 text-xs text-muted">
          as of {asOf} · {sources}
        </p>
      </CardContent>
    </Card>
  );
}
