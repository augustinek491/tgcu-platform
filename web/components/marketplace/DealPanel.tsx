"use client";

import { useState } from "react";
import { Check, Circle, ShieldCheck, Truck, MapPin, Star, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatUGX } from "@/lib/utils";
import {
  DEAL_STEPS,
  GRADE_LABEL,
  dealAmount,
  escrowHeld,
  type Deal,
  type DealState,
  type EscrowLedger,
} from "@/lib/marketplace/model";

/**
 * Interactive deal + escrow + Tagtel tracking (FR-MKTPL-31/40-42/50-53). Drives the
 * real state machine + escrow ledger client-side (Cloud Functions own it in prod).
 * Money integrity: only buyer-confirm (or the audited timer) releases escrow — a
 * "delivered" mark never moves money (FR-MKTPL-52). No real funds move (sandbox).
 */
export function DealPanel({ deal: initial }: { deal: Deal }) {
  const amount = dealAmount(initial);
  const [state, setState] = useState<DealState>(initial.state);
  const [ledger, setLedger] = useState<EscrowLedger>({
    funded: amount,
    released: 0,
    refunded: 0,
    state: "held",
  });
  const [rating, setRating] = useState<number>(0);

  const stepIndex = DEAL_STEPS.findIndex((s) => s.state === state);

  function markDelivered() {
    setState("delivered");
  }
  function confirmRelease() {
    setState("completed");
    setLedger((l) => ({ ...l, released: l.funded, state: "released" }));
  }
  function raiseDispute() {
    setState("disputed");
    setLedger((l) => ({ ...l, state: "frozen" }));
  }
  function resolveRefund() {
    setState("cancelled");
    setLedger((l) => ({ ...l, refunded: l.funded, state: "refunded" }));
  }
  function resolveRelease() {
    setState("completed");
    setLedger((l) => ({ ...l, released: l.funded, state: "released" }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Escrow & deal status */}
      <Card>
        <CardHeader>
          <CardTitle>Escrow & deal status</CardTitle>
          <p className="text-sm text-muted">Server-owned · both parties see the same state</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-surface-2 p-3">
            <div>
              <div className="text-sm font-medium text-fg">
                {Math.round(initial.listing.quantityKg / 1000)} MT {initial.listing.commodity}
              </div>
              <div className="text-xs text-muted">
                {GRADE_LABEL[initial.listing.grade]} (self-declared) ·{" "}
                {initial.priceUGXPerKg.toLocaleString()} UGX/kg
              </div>
            </div>
            <div className="text-right">
              <div className="tabular font-display text-lg font-semibold text-fg">
                {formatUGX(amount)}
              </div>
              <div className="text-[11px] text-muted">
                {initial.listing.quantityKg.toLocaleString()} kg × {initial.priceUGXPerKg}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <ol className="flex items-center justify-between">
            {DEAL_STEPS.map((step, i) => {
              const done = i < stepIndex || state === "completed";
              const current = i === stepIndex && state !== "completed";
              return (
                <li key={step.state} className="flex flex-1 flex-col items-center text-center">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full border-2 text-xs",
                      done && "border-[var(--color-success)] bg-[var(--color-success)] text-white",
                      current && "border-brand-600 text-brand-700 dark:text-brand-500",
                      !done && !current && "border-[var(--color-border)] text-muted",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : <Circle className="size-2 fill-current" />}
                  </span>
                  <span className={cn("mt-1 text-[11px]", current ? "font-medium text-fg" : "text-muted")}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Escrow ledger */}
          <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-fg">
                <ShieldCheck className="size-4 text-brand-600" /> Escrow:{" "}
                <span className="capitalize">{ledger.state}</span>
              </span>
              <span className="tabular text-sm font-semibold text-fg">{formatUGX(escrowHeld(ledger))} held</span>
            </div>
            {state === "in_transit" || state === "delivered" ? (
              <p className="mt-1 text-xs text-muted">
                Auto-releases to seller in {initial.autoReleaseDays} days if you don&apos;t confirm.
              </p>
            ) : null}
            <p className="mt-2 border-t border-[var(--color-border)] pt-2 text-[11px] text-muted">
              <span className="font-medium text-fg">No real funds are held in this demo (sandbox).</span>{" "}
              The escrow ledger & state machine run for real (held = funded − released − refunded), but no
              money moves.
            </p>
          </div>

          {/* State-appropriate actions */}
          <div className="flex flex-wrap gap-2">
            {state === "in_transit" && (
              <>
                <Button size="sm" variant="secondary" onClick={markDelivered}>
                  <Truck className="size-4" /> Mark delivered (transporter)
                </Button>
                <Button size="sm" variant="ghost" onClick={raiseDispute}>
                  Raise dispute
                </Button>
              </>
            )}
            {state === "delivered" && (
              <>
                <Button size="sm" onClick={confirmRelease}>
                  <Check className="size-4" /> Confirm delivery & release
                </Button>
                <Button size="sm" variant="ghost" onClick={raiseDispute}>
                  Raise dispute
                </Button>
              </>
            )}
            {state === "disputed" && (
              <div className="w-full rounded-[var(--radius-sm)] bg-[var(--color-warning)]/10 p-3">
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-warning)]">
                  <AlertTriangle className="size-4" /> Escrow frozen · admin resolution
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={resolveRelease}>
                    Release to seller
                  </Button>
                  <Button size="sm" variant="secondary" onClick={resolveRefund}>
                    Refund buyer
                  </Button>
                </div>
              </div>
            )}
            {state === "completed" && (
              <div className="w-full">
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-success)]">
                  <Check className="size-4" /> Completed · escrow released. Rate the seller:
                </p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <Star
                        className={cn(
                          "size-6",
                          n <= rating ? "fill-[var(--tier-gold)] text-[var(--tier-gold)]" : "text-muted",
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-1 text-xs text-muted">Rating recorded — ratings unlock only after completed deals.</p>
                )}
              </div>
            )}
            {state === "cancelled" && (
              <p className="text-sm font-medium text-muted">Deal cancelled · escrow refunded to buyer.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tagtel tracking */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Goods in transit</CardTitle>
            <p className="text-sm text-muted">Tagtel tracking · Deal #{initial.dealId}</p>
          </div>
          <Badge variant="brand">Platinum</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {initial.transporter && (
            <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-surface-2 p-2.5 text-xs">
              <Truck className="size-4 text-muted" />
              <span className="font-medium text-fg">{initial.transporter.name}</span>
              <span className="text-muted">· {initial.transporter.vehicle}</span>
            </div>
          )}
          <TrackingTimeline state={state} />
          <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-2.5 text-[11px] text-muted">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>
              No live GPS on this shipment — this is the{" "}
              <span className="font-medium text-fg">last-known point</span> from the transporter&apos;s
              check-in, not a real-time position. Tracking as of Jul 3 · 09:42 · Tagtel (sandbox adapter).
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrackingTimeline({ state }: { state: DealState }) {
  const advanced = state === "delivered" || state === "completed";
  const items = [
    { label: "Dispatched from Mbale", at: "Jul 2 · 07:14", done: true },
    { label: "In transit · near Jinja on the Kampala highway", at: "Jul 3 · 09:42", done: true },
    { label: "Arrived at Kampala", at: advanced ? "Jul 3 · 14:52" : "Expected Jul 3 · ~15:00", done: advanced },
    {
      label: advanced ? "Delivered & signed" : "Delivered & signed",
      at: advanced ? "Jul 3 · 15:08" : "Pending confirmation",
      done: state === "completed",
    },
  ];
  return (
    <ol className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full",
                it.done ? "bg-brand-600 text-white" : "border-2 border-[var(--color-border)]",
              )}
            >
              {it.done && <Check className="size-3" />}
            </span>
            {i < items.length - 1 && <span className="my-0.5 w-0.5 flex-1 bg-[var(--color-border)]" />}
          </div>
          <div className="pb-1">
            <div className={cn("text-sm", it.done ? "font-medium text-fg" : "text-muted")}>{it.label}</div>
            <div className="text-[11px] text-muted">{it.at}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
