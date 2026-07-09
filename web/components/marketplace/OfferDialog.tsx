"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GRADE_LABEL, type Listing } from "@/lib/marketplace/model";

/** A recorded sandbox offer — session-only demo state, never leaves the browser. */
export type OfferDraft = {
  priceUGXPerKg: number;
  note?: string;
};

/**
 * Make-offer / respond dialog (FLOW-02; 07 §6.0 F.M3 flavour). Modal contract per
 * 06 F.8: focus-trapped, Esc closes, focus returns to the trigger (restored on
 * unmount), aria-modal + labelled by title. Records into the caller's seeded demo
 * state — the sandbox nature is labelled persistently (F.M6 honesty rule).
 */
export function OfferDialog({
  listing,
  initial,
  onClose,
  onSubmit,
}: {
  listing: Listing;
  initial?: OfferDraft;
  onClose: () => void;
  onSubmit: (draft: OfferDraft) => void;
}) {
  const isBuy = listing.type === "buy";
  const titleId = useId();
  const priceErrorId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const [price, setPrice] = useState(
    initial ? String(initial.priceUGXPerKg) : listing.priceUGXPerKg ? String(listing.priceUGXPerKg) : "",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  // Focus in on open; restore to the trigger on unmount. Lock body scroll while open.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    priceRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus();
    };
  }, []);

  function trapTab(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(price.replace(/[,\s]/g, ""));
    if (!price.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a price above 0 — whole UGX per kg.");
      priceRef.current?.focus();
      return;
    }
    onSubmit({ priceUGXPerKg: Math.round(parsed), note: note.trim() || undefined });
  }

  const mt = Math.round(listing.quantityKg / 1000);

  return (
    <div
      className="scrim-enter fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      onKeyDown={trapTab}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="modal-enter max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5 shadow-[var(--shadow-pop)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-lg font-semibold text-fg">
              {initial ? "Edit your offer" : isBuy ? "Respond to buy request" : "Make an offer"}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {mt} MT {listing.commodity} · {GRADE_LABEL[listing.grade]} · {listing.market}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] text-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Price context — the reference anchor (07 §6.2) */}
        <div className="mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-3 text-xs text-muted">
          {listing.priceUGXPerKg ? (
            <p>
              {isBuy ? "Buyer bids" : "Seller asks"}{" "}
              <span className="tabular font-medium text-fg">
                UGX {listing.priceUGXPerKg.toLocaleString()}/kg
              </span>
            </p>
          ) : (
            <p className="font-medium text-fg">Open to offers — no asking price set.</p>
          )}
          <p className="mt-0.5">
            Reference UGX {listing.referenceUGXPerKg.toLocaleString()}/kg · MAAIF / TGCU tracker · as of
            Jun 2026
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          <label htmlFor={`${titleId}-price`} className="mt-4 block text-sm font-medium text-fg">
            {isBuy ? "Your asking price (UGX per kg)" : "Your offer (UGX per kg)"}
          </label>
          <input
            id={`${titleId}-price`}
            ref={priceRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? priceErrorId : undefined}
            className="tabular mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 text-base text-fg focus:border-ring"
            placeholder="e.g. 1,850"
          />
          {error && (
            <p id={priceErrorId} role="alert" className="mt-1.5 text-sm text-danger-text">
              {error}
            </p>
          )}

          <label htmlFor={`${titleId}-note`} className="mt-4 block text-sm font-medium text-fg">
            Note to the {isBuy ? "buyer" : "seller"} <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={`${titleId}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-base text-fg focus:border-ring"
            placeholder={isBuy ? "e.g. Can deliver within 5 days" : "e.g. Collecting from your store"}
          />

          {/* Sandbox honesty label — persistent on every money surface (F.M6) */}
          <p className="mt-3 flex items-start gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-warning)]/14 p-2.5 text-xs text-[var(--warning-badge-text)] dark:bg-[var(--color-warning)]/20">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Demo sandbox — this offer is recorded in your session only. No real funds move and no
              commitment is made.
            </span>
          </p>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Update offer" : isBuy ? "Send response" : "Send offer"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
