"use client";

import { useRef, useState } from "react";
import { ProvenanceTooltip, type TooltipSeriesEntry } from "./ProvenanceTooltip";

type Month = { label: string; year: number };
type Series = { name: string; color: string; points: (number | null)[] };

/**
 * Client hover layer for the server-rendered dashboard trend chart (DV-R2-02;
 * 06 A.6 "Hover tooltip"). Mounts absolutely inside PriceTrendSvg's plot box
 * and gives the static SVG the same tooltip capability as the /market island —
 * nearest-month crosshair (1px `--border` vertical, per A.6), month label,
 * per-series values, MoM delta chips and the source line — without pulling any
 * chart library into the dashboard bundle (~2KB vs recharts' ~106KB gz, so the
 * route's First-Load stays ≤170KB and the LCP chart remains server HTML).
 * Pointer-only affordance by design: keyboard/SR users read the same values via
 * the Table view (AF-8) and the sr-only figcaption.
 */
export function TrendHoverLayer({
  months,
  series,
  source,
}: {
  months: Month[];
  series: Series[];
  source: string;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState<number | null>(null);
  const n = months.length;
  if (n < 2) return null;

  const px = (i: number) => (i / (n - 1)) * 100;

  function onMove(e: React.PointerEvent) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const t = (e.clientX - box.left) / box.width;
    setIdx(Math.max(0, Math.min(n - 1, Math.round(t * (n - 1)))));
  }

  const entries: TooltipSeriesEntry[] =
    idx == null
      ? []
      : series.map((s) => ({
          name: s.name,
          color: s.color,
          value: s.points[idx],
          prev: idx > 0 ? s.points[idx - 1] : null,
        }));

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="absolute inset-0"
      onPointerMove={onMove}
      onPointerLeave={() => setIdx(null)}
    >
      {idx != null && (
        <>
          {/* Crosshair — 1px --border vertical (06 A.6) */}
          <span
            className="pointer-events-none absolute inset-y-0 border-l border-[var(--color-border)]"
            style={{ left: `${px(idx)}%` }}
          />
          <div
            className="pointer-events-none absolute top-2 z-10 w-max"
            style={
              idx > (n - 1) / 2
                ? { right: `${100 - px(idx)}%`, marginRight: 8 }
                : { left: `${px(idx)}%`, marginLeft: 8 }
            }
          >
            <ProvenanceTooltip
              label={`${months[idx].label} ${months[idx].year}`}
              entries={entries}
              source={source}
            />
          </div>
        </>
      )}
    </div>
  );
}
