/**
 * Canonical categorical series order (DESIGN-SYSTEM §2, ratified §9.4 / DV-03):
 * #2563EB → #0EA5E9 → #7C3AED → #CA8A04 → #DC2626 → #0D9488.
 * Gold never appears before position 4; brand green never appears in any chart.
 * Both trend charts and the market chips key off this ONE list so the visible
 * color key can never lie (DV-06).
 */
export const SERIES_COLORS = [
  "var(--data)",
  "var(--series-sky)",
  "var(--series-violet)",
  "var(--series-gold)",
  "var(--series-red)",
  "var(--series-teal)",
] as const;

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}
