import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, de-duping Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer number of UGX (stored as whole shillings) for display.
 * Copy standard (DESIGN-SYSTEM §9.7): ISO code + thousands separators — "UGX 1,200,000". */
export function formatUGX(minorUnits: number): string {
  return `UGX ${new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0,
  }).format(minorUnits)}`;
}

/** Wholesale price copy standard — "UGX 2,180/kg" (DESIGN-SYSTEM §9.7). */
export function formatUGXPerKg(value: number): string {
  return `${formatUGX(value)}/kg`;
}

/** Member-facing date — "19 Jan 2025" (DESIGN-SYSTEM §9.7; ISO stays only in mono admin tables).
 * UTC-pinned so server and client render the same string. */
export function formatDay(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Compact "as of" freshness label for provenance cues. */
export function asOf(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date);
}
