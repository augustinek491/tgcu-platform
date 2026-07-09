/**
 * Accessible data-table alternative for the monthly trend charts (AF-8; 06 A.10):
 * sticky header, tabular-nums, right-aligned numerics, Source + As-of columns always
 * visible, missing observation = "—" (never blank, never zero — gap honesty, DV-04).
 * Server-safe (no hooks) so both the dashboard RSC and the /market island reuse it.
 */
export type TrendTableRow = {
  /** Member-facing period, e.g. "Dec 2025". */
  period: string;
  /** Data vintage for the row (same calendar month for monthly series). */
  asOf: string;
  /** One value per series, aligned with `seriesNames`; null = not reported. */
  values: (number | null)[];
};

export function TrendDataTable({
  seriesNames,
  rows,
  source,
  caption,
}: {
  seriesNames: string[];
  rows: TrendTableRow[];
  source: string;
  caption: string;
}) {
  return (
    <div className="max-h-[320px] overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
      <table
        className="w-full text-sm"
        style={{ minWidth: 220 + seriesNames.length * 96 + 180 }}
      >
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-[var(--color-border)] text-xs text-muted">
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              Month
            </th>
            {seriesNames.map((name) => (
              <th key={name} scope="col" className="px-3 py-2 text-right font-semibold">
                {name} (UGX/kg)
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              Source
            </th>
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              As of
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.period}
              className="border-b border-[var(--color-border)] transition-colors duration-[var(--dur-fast)] last:border-0 hover:bg-surface-2"
            >
              <th scope="row" className="px-3 py-1.5 text-left text-sm font-medium text-fg">
                {row.period}
              </th>
              {row.values.map((value, i) => (
                <td key={seriesNames[i]} className="tabular px-3 py-1.5 text-right text-fg">
                  {value == null ? (
                    <>
                      <span aria-hidden className="text-muted">
                        —
                      </span>
                      <span className="sr-only">no data</span>
                    </>
                  ) : (
                    value.toLocaleString()
                  )}
                </td>
              ))}
              <td className="px-3 py-1.5 text-xs text-muted">{source}</td>
              <td className="tabular px-3 py-1.5 text-xs text-muted">{row.asOf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
