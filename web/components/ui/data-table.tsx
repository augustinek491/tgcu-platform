import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * THE data-table registry primitives — single source of truth for every tabular
 * surface (DS §9.8/AM-24; 06 A.10 / F.4). Before this existed, six tables shipped
 * under two divergent conventions (data-tables `px-3 py-2 · font-semibold · 12px`
 * vs admin-tables `px-4 py-3 · font-medium · 14px`). The DATA-TABLE convention is
 * canonical here — it matches 06 A.10 — and the admin tables were migrated TO it:
 * ONE header treatment, ONE cell padding step, no third system.
 *
 * These ARE the AF-8 accessible tables (a real <table> with sticky header,
 * scope-typed headers, tabular-nums numerics, and a caption slot) — never a
 * chart-only or toggle-gated alternative. Geometry that a specific table needs
 * beyond the shared baseline (max-height, min-width, sticky-scroll) is caller-
 * driven via `className` so each migrated table keeps its exact prior behaviour;
 * this is a collapse to one implementation, not a restyle.
 *
 * Server-safe (no hooks) so RSC pages and client islands share the same table.
 *
 * Convention (canonical):
 *   Th  → px-3 py-2 · text-xs · font-semibold · text-muted   (scope + align props)
 *   Td  → px-3 py-2                                          (tabular prop for numerics, align prop)
 *   Tr  → border-b border-[--color-border] · last:border-0 · hover:bg-surface-2
 *   Thead → sticky top-0 z-10 bg-surface
 */

type Align = "left" | "right" | "center";

const ALIGN: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * Table wrapper. Renders the horizontal-scroll container (A.10: tables scroll
 * within their card, never overflow it) and the semantic <table>. Pass
 * `containerClassName` for the outer box (e.g. a bordered/max-height scroll
 * region) and `caption` for the AF-8 sr-only description. `style`/other table
 * attributes (e.g. an intrinsic min-width) forward to the <table>.
 */
export function DataTable({
  children,
  caption,
  className,
  containerClassName,
  ...tableProps
}: {
  children: ReactNode;
  /** Accessible table description (rendered as an sr-only <caption>). */
  caption?: ReactNode;
  /** Classes for the scroll container (default: overflow-x-auto). */
  containerClassName?: string;
} & HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={cn("overflow-x-auto", containerClassName)}>
      <table className={cn("w-full text-sm", className)} {...tableProps}>
        {caption != null && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

/** Sticky table header band (sticky top-0 z-10 bg-surface). */
export function Thead({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("sticky top-0 z-10 bg-surface", className)} {...props}>
      {children}
    </thead>
  );
}

export function Tbody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

/**
 * Table row. Body rows carry the shared divider + hover; header rows opt out via
 * `hover={false}` (a <thead> row should not react to hover). `border`
 * defaults on (bottom divider, cleared on the last row).
 */
export function Tr({
  children,
  className,
  hover = true,
  border = true,
  ...props
}: {
  /** Row hover highlight (default true; set false for header rows). */
  hover?: boolean;
  /** Bottom divider + last:border-0 (default true). */
  border?: boolean;
} & HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        border && "border-b border-[var(--color-border)] last:border-0",
        hover &&
          "transition-colors duration-[var(--dur-fast)] hover:bg-surface-2",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * Header cell — the ONE canonical treatment (px-3 py-2 · text-xs · font-semibold
 * · text-muted). `scope` defaults to "col"; pass "row" for a row-header <th>.
 * `align` right-aligns numeric-column headers to match their cells (A.10).
 */
export function Th({
  children,
  className,
  align = "left",
  scope = "col",
  ...props
}: {
  align?: Align;
} & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        "px-3 py-2 text-xs font-semibold text-muted",
        ALIGN[align],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/**
 * Data cell — px-3 py-2. `tabular` applies tabular-nums (numeric columns) and,
 * with `align="right"`, gives the standard right-aligned numeric column (A.10 /
 * LAY-05). Cell text color is caller-driven (default text-fg via className).
 */
export function Td({
  children,
  className,
  align = "left",
  tabular = false,
  ...props
}: {
  align?: Align;
  /** tabular-nums for numeric values. */
  tabular?: boolean;
} & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-3 py-2", tabular && "tabular", ALIGN[align], className)}
      {...props}
    >
      {children}
    </td>
  );
}
