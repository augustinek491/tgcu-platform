"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Customized,
} from "recharts";
import { SERIES_COLORS } from "./palette";
import { ProvenanceTooltip, type TooltipSeriesEntry } from "./ProvenanceTooltip";

type TooltipEntry = { dataKey?: string | number; value?: number | null; color?: string };

const SM_QUERY = "(min-width: 640px)";
function subscribeSm(cb: () => void) {
  const m = window.matchMedia(SM_QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

/**
 * Interactive monthly price-trend chart (FR-MKT-11). Lazy client island (kept out
 * of shared bundle via dynamic import). Honesty + spec rules applied here:
 *  – gaps render as gaps (connectNulls OFF) with a visible "no data" tick (DV-04/16);
 *  – series colors come from the canonical categorical palette, keyed to the same
 *    selection order as the market chips (DV-03/06);
 *  – single series renders as an Area with a 20%→0 gradient fill (DS §6, DV-14);
 *  – multi-series lines carry per-series END-LABELS at the last observation so the
 *    chart reads without color (06 A.6; DV-R2-04) — ≥sm only; on the narrowest
 *    screens the tooltip + table carry identification (AM-R2-C posture);
 *  – hover tooltip = shared ProvenanceTooltip (A.6 chrome, MoM delta chip) with a
 *    1px `--border` crosshair (DV-R2-05/06);
 *  – draw-in 400ms once, disabled under prefers-reduced-motion (06 H.2);
 *  – axis text 12px Public Sans; grid `--border` @ 60%, horizontal only (DV-10/13/18).
 */
export function PriceTrendChart({
  data,
  markets,
  source,
}: {
  data: Record<string, number | string | null>[];
  markets: string[];
  source: string;
}) {
  // Reduced motion renders the final state instantly (06 H.2). Hidden documents
  // (background tabs, headless capture) skip the draw too — rAF-driven animation
  // would freeze mid-draw and leave the chart blank.
  const animate = useMemo(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !document.hidden,
    [],
  );
  // End-label rail fits ≥sm; below sm the extra right margin would crush the plot.
  const smUp = useSyncExternalStore(
    subscribeSm,
    () => window.matchMedia(SM_QUERY).matches,
    () => true,
  );

  // Months where any plotted series has no observation → visible "no data" tick.
  const gapMonths = useMemo(() => {
    const out: string[] = [];
    for (const row of data) {
      if (markets.some((m) => m in row && row[m] == null)) out.push(String(row.month));
    }
    return out;
  }, [data, markets]);

  const single = markets.length === 1;
  const endLabels = smUp && !single;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 16, right: endLabels ? 64 : 12, bottom: 0, left: -8 }}
      >
        <defs>
          <linearGradient id="trend-single-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--data)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--data)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.6} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          tickLine={false}
          minTickGap={20}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          // Axis ticks are member-facing: Public Sans 12, never mono (DS §3; TYP-05)
          tick={{ fontSize: 12, fill: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => (v as number).toLocaleString()}
        />
        <Tooltip
          // Crosshair = 1px --border vertical (06 A.6; DV-R2-05)
          cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
          content={(p) => (
            <RechartsTooltipAdapter
              active={p.active}
              label={p.label as string | number}
              payload={p.payload as unknown as TooltipEntry[]}
              data={data}
              source={source}
            />
          )}
        />
        {gapMonths.map((month) => (
          <ReferenceLine
            key={month}
            x={month}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            label={{
              value: "no data",
              position: "insideTop",
              fontSize: 12,
              fill: "var(--color-muted)",
              fontFamily: "var(--font-sans)",
            }}
          />
        ))}
        {single ? (
          <Area
            type="monotone"
            dataKey={markets[0]}
            stroke="var(--data)"
            strokeWidth={2}
            fill="url(#trend-single-fill)"
            dot={{ r: 3, fill: "var(--data)", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={400}
            animationEasing="ease-out"
          />
        ) : (
          markets.map((m, i) => {
            const color = SERIES_COLORS[i % SERIES_COLORS.length];
            return (
              <Line
                key={m}
                type="monotone"
                dataKey={m}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={animate}
                animationDuration={400}
                animationEasing="ease-out"
              />
            );
          })
        )}
        {/* Per-series end-labels (06 A.6 "readable without color"; DV-R2-04) */}
        {endLabels && <Customized key="end-labels" component={EndLabelsLayer} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Adapts the Recharts tooltip payload to the shared A.6 ProvenanceTooltip,
 *  deriving each series' previous-month value for the MoM delta chip. */
function RechartsTooltipAdapter({
  active,
  payload,
  label,
  data,
  source,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  data: Record<string, number | string | null>[];
  source: string;
}) {
  if (!active || !payload?.length) return null;
  const idx = data.findIndex((row) => row.month === label);
  const entries: TooltipSeriesEntry[] = payload.map((p) => {
    const key = String(p.dataKey);
    return {
      name: key,
      color: p.color,
      value: (p.value ?? null) as number | null,
      prev: idx > 0 ? ((data[idx - 1]?.[key] ?? null) as number | null) : null,
    };
  });
  return <ProvenanceTooltip label={label} entries={entries} source={source} />;
}

type GraphicalItemPoint = {
  x: number;
  y: number;
  value?: number | [number, number] | null;
};
type CustomizedProps = {
  formattedGraphicalItems?: Array<{
    /** Computed geometry (recharts 2.x): points carry x/y/value per datum. */
    props: { points?: GraphicalItemPoint[] };
    /** The original <Line> element — dataKey/stroke live on ITS props. */
    item?: { props?: { dataKey?: string | number; stroke?: string } };
  }>;
};

/**
 * End-labels via Recharts' `Customized` layer: label each series at its LAST
 * non-null observation (gap honesty — a truncated series labels where it truly
 * ends), with simple top-down collision nudging (≥13px separation).
 */
function EndLabelsLayer(props: unknown) {
  const { formattedGraphicalItems } = (props ?? {}) as CustomizedProps;
  const labels: { key: string; color: string; x: number; y: number }[] = [];
  for (const item of formattedGraphicalItems ?? []) {
    const pts = item.props.points ?? [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      const v = Array.isArray(p?.value) ? p.value[1] : p?.value;
      if (p && v != null) {
        labels.push({
          key: String(item.item?.props?.dataKey ?? ""),
          color: item.item?.props?.stroke ?? "var(--color-muted)",
          x: p.x,
          y: p.y,
        });
        break;
      }
    }
  }
  labels.sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].y - labels[i - 1].y < 13) labels[i].y = labels[i - 1].y + 13;
  }
  return (
    <g aria-hidden="true">
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x + 6}
          y={l.y}
          dy={4}
          fontSize={12}
          fontWeight={500}
          fill={l.color}
          fontFamily="var(--font-sans)"
          textAnchor="start"
        >
          {l.key}
        </text>
      ))}
    </g>
  );
}
