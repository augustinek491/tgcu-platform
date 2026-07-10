"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * THE segmented control — single registry primitive for every "pick one of a small
 * fixed set" control group (DS §9.8/AM-24). The §9.10 invariant is BAKED IN so no new
 * surface can ship a stateless toggle: the wrapper is a labelled `role=group` and every
 * option carries programmatic selection state (`aria-pressed` by default, or
 * `role=radio` + `aria-checked` when `mode="radio"`). Active = brand-800/white, inactive
 * = muted + hover:surface-2 (the app-wide segment treatment).
 *
 * Geometry is caller-driven (`className`/`optionClassName`/per-option `className`) so the
 * near-duplicate controls it replaces keep their exact current markup — this is a
 * collapse to ONE implementation, not a restyle. Adopters: ChartTableSwitch (Chart|Table),
 * MarketExplorer range picker (lock/disabled), MarketplaceBrowse TYPE + Radio groups.
 */
export interface SegmentedOption<T extends string> {
  value: T;
  /** Visible label (string or node — e.g. icon + text). */
  label: ReactNode;
  /** Rendered before the label (e.g. a view icon or a Lock glyph). */
  icon?: ReactNode;
  disabled?: boolean;
  /** Native title (e.g. the range-picker locked tooltip). */
  title?: string;
  /** Extra classes for this option only (kept for per-option geometry). */
  className?: string;
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  mode = "pressed",
  className,
  optionClassName,
  activeClassName = "bg-brand-800 text-white",
  inactiveClassName = "text-muted hover:bg-surface-2",
}: {
  /** Accessible name for the control group (role=group / radiogroup label). */
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * `pressed` (default) → each option is a toggle button with `aria-pressed`.
   * `radio` → the group is a `radiogroup` and each option is `role=radio` +
   * `aria-checked` (single-select semantics for AT).
   */
  mode?: "pressed" | "radio";
  /** Wrapper classes (the segmented container geometry). */
  className?: string;
  /** Shared per-option classes (applied to every button). */
  optionClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  const isRadio = mode === "radio";
  return (
    <div role={isRadio ? "radiogroup" : "group"} aria-label={label} className={className}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            title={o.title}
            onClick={() => onChange(o.value)}
            {...(isRadio ? { role: "radio", "aria-checked": active } : { "aria-pressed": active })}
            className={cn(
              "transition-colors",
              optionClassName,
              active ? activeClassName : inactiveClassName,
              o.className,
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
