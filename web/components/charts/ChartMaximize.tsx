"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Maximize2, X } from "lucide-react";

/**
 * 06 A.6 header `maximize-2` icon-button + full-screen chart modal (DV-R2-03).
 * Minimal conformant modal per 06 F.8 / DS §4 z-scale: scrim `rgba(12,10,9,.48)`
 * on its own z-30 layer, dialog on z-50 (LAY-13 role split), `--surface`,
 * radius-12, padding 24, focus-trapped, Esc closes, focus returns to the
 * trigger, `aria-modal` + labelled by title, body scroll locked while open.
 * `children` is the full-size chart + its table toggle, composed by the caller
 * (works for both the server-rendered dashboard chart and the /market island).
 */
export function ChartMaximize({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Focus in on open; restore to the trigger on close. Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  function trapTab(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Expand ${label} to a full-screen view`}
        onClick={() => setOpen(true)}
        className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-fg"
      >
        <Maximize2 className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* Scrim — its own overlay layer (DS §4: overlay z30; F.8 scrim color) */}
          <div
            className="scrim-enter fixed inset-0 z-30 bg-[rgba(12,10,9,0.48)]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4"
            onKeyDown={trapTab}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="modal-enter pointer-events-auto flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface shadow-[var(--shadow-pop)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] p-6 py-4">
                <h2 id={titleId} className="font-display text-lg font-medium text-fg">
                  {label}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close full-screen chart"
                  className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] text-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-fg"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-0 overflow-y-auto p-6">{children}</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
