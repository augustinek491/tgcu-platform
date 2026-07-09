"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw, MapPin, Camera, AlertTriangle, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { submissions as seed, FLAG_LABEL } from "@/lib/demo/admin";
import { ClipboardCheckIllustration } from "@/components/illustrations/empty-states";

type Decision = "APPROVED" | "REJECTED" | "RETURNED";
type ReasonKind = "REJECTED" | "RETURNED";
type Recorded = { decision: Decision; reason?: string; at: string };

const DECISION_LABEL: Record<Decision, string> = {
  APPROVED: "Approved & published",
  REJECTED: "Rejected",
  RETURNED: "Returned for correction",
};

/**
 * Field-data verification queue (FR-ADM-05/07/08/09). Nothing enters trusted data
 * except via an explicit human APPROVE — no time-out self-publish (fail-closed).
 * Reject/return require a reason (FR-ADM-07): the decision cannot commit until a
 * reason is entered, and it is kept in the session decision log. Provenance,
 * screening flags and the external cross-check delta are surfaced so reviewers
 * focus on suspect values.
 */
export function VerificationQueue() {
  const items = seed;
  const [decisions, setDecisions] = useState<Record<string, Recorded>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [reasonFor, setReasonFor] = useState<{ id: string; kind: ReasonKind } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const logRef = useRef<HTMLElement | null>(null);

  const pending = items.filter((s) => !decisions[s.id]);
  const decided = order
    .map((id) => ({ s: items.find((i) => i.id === id)!, d: decisions[id] }))
    .filter((r) => r.d != null);
  const recorded = Object.values(decisions);

  const now = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  function record(id: string, decision: Decision, reason?: string) {
    setDecisions((prev) => ({ ...prev, [id]: { decision, reason, at: now() } }));
    setOrder((prev) => [id, ...prev]);
    setReasonFor(null);
    setReasonText("");
    // The card leaves the pending list — move focus to the decision log so the
    // recorded outcome is the next thing keyboard/SR users land on.
    requestAnimationFrame(() => logRef.current?.focus());
  }

  function openReason(e: React.MouseEvent<HTMLButtonElement>, id: string, kind: ReasonKind) {
    triggerRef.current = e.currentTarget;
    setReasonFor({ id, kind });
    setReasonText("");
  }

  function cancelReason() {
    setReasonFor(null);
    setReasonText("");
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <Stat label="Pending review" value={pending.length} />
        <Stat label="Approved (session)" value={recorded.filter((d) => d.decision === "APPROVED").length} tone="success" />
        <Stat label="Rejected / returned" value={recorded.filter((d) => d.decision !== "APPROVED").length} tone="danger" />
      </div>

      {pending.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardCheckIllustration className="mx-auto" />
          <p className="mt-2 font-medium text-fg">Queue clear</p>
          <p className="text-sm text-muted">
            Every submission has a recorded decision. Nothing self-publishes.
            {decided[0] ? ` Last decision recorded ${decided[0].d.at}.` : ""}
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/admin/audit" className={buttonVariants({ variant: "secondary" })}>
              View audit log
            </Link>
          </div>
        </Card>
      ) : (
        pending.map((s) => {
          const delta = s.benchmark ? ((s.priceUGXPerKg - s.benchmark.value) / s.benchmark.value) * 100 : null;
          const bigDelta = delta != null && Math.abs(delta) > 40;
          const formOpen = reasonFor?.id === s.id;
          return (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold text-fg">
                      {s.commodity} · {s.market}
                    </span>
                    <span className="tabular text-lg font-semibold text-fg">
                      {s.priceUGXPerKg.toLocaleString()} <span className="text-sm font-normal text-muted">UGX/kg</span>
                    </span>
                    <Badge variant="neutral">{s.id}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>Officer: <span className="text-fg">{s.officer}</span></span>
                    <span className={cn(s.officerAccuracy < 80 && "text-[var(--color-warning)]")}>
                      {s.officerAccuracy}% approval rate
                    </span>
                    <span>Observed {s.observationDate} · submitted {s.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* Provenance + screening */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip icon={MapPin} on={!!s.geo} label={s.geo ? "Geo captured" : "Location not captured"} warn={!s.geo} />
                <Chip icon={Camera} on={s.hasPhoto} label={s.hasPhoto ? "Photo attached" : "No photo"} />
                {s.flags.map((f) => (
                  <Chip key={f} icon={AlertTriangle} on={false} label={FLAG_LABEL[f]} warn />
                ))}
                {s.flags.length === 0 && s.geo && (
                  <Chip icon={CircleCheck} on label="Clean screen" />
                )}
              </div>

              {/* Cross-check */}
              <div className="mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-2.5 text-xs">
                {s.benchmark ? (
                  <span className="text-muted">
                    External cross-check:{" "}
                    <span className="text-fg">UGX {s.benchmark.value.toLocaleString()}/kg</span> ·{" "}
                    {s.benchmark.source} · {s.benchmark.date} ·{" "}
                    <span className={cn("font-medium", bigDelta ? "text-[var(--color-danger)]" : "text-[var(--color-success)]")}>
                      submitted {delta! >= 0 ? "+" : "−"}
                      {Math.abs(delta!).toFixed(0)}% vs benchmark
                    </span>
                  </span>
                ) : (
                  <span className="text-muted">No external benchmark available for this commodity/period.</span>
                )}
              </div>

              {/* Decision */}
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
                <Button size="sm" onClick={() => record(s.id, "APPROVED")}>
                  <Check className="size-4" /> Approve &amp; publish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  aria-expanded={formOpen && reasonFor?.kind === "RETURNED"}
                  onClick={(e) => openReason(e, s.id, "RETURNED")}
                >
                  <RotateCcw className="size-4" /> Return for correction
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-expanded={formOpen && reasonFor?.kind === "REJECTED"}
                  onClick={(e) => openReason(e, s.id, "REJECTED")}
                >
                  <X className="size-4" /> Reject
                </Button>
                <span className="ml-auto self-center text-[11px] text-muted">
                  Reject / return requires a recorded reason; decisions are listed below.
                </span>
              </div>

              {/* Mandatory reason (FR-ADM-07) — the decision cannot commit without it */}
              {formOpen && reasonFor && (
                <form
                  className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface-2 p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const reason = reasonText.trim();
                    if (reason) record(s.id, reasonFor.kind, reason);
                  }}
                >
                  <label htmlFor={`reason-${s.id}`} className="block text-sm font-medium text-fg">
                    {reasonFor.kind === "REJECTED" ? "Reason for rejection" : "Reason for return"}{" "}
                    <span aria-hidden className="text-[var(--color-danger)]">*</span>
                  </label>
                  <p className="mt-0.5 text-xs text-muted">
                    Required. Recorded with the decision; in production the submitting officer is notified.
                  </p>
                  <textarea
                    id={`reason-${s.id}`}
                    required
                    autoFocus
                    rows={2}
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelReason();
                      }
                    }}
                    placeholder={
                      reasonFor.kind === "REJECTED"
                        ? "e.g. Price implausible for this market and period"
                        : "e.g. Photo of the market board is missing — please re-capture"
                    }
                    className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface p-2.5 text-base text-fg placeholder:text-muted focus-visible:border-ring"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      variant={reasonFor.kind === "REJECTED" ? "danger" : "secondary"}
                      disabled={reasonText.trim().length === 0}
                    >
                      {reasonFor.kind === "REJECTED" ? "Record rejection" : "Record return"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={cancelReason}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          );
        })
      )}

      {/* Session decision log — reasons stay visible (FR-ADM-07/13) */}
      {decided.length > 0 && (
        <section
          ref={logRef}
          tabIndex={-1}
          aria-label="Decisions this session"
          aria-live="polite"
          className="space-y-2 outline-none"
        >
          <h2 className="text-sm font-semibold text-fg">Decisions this session</h2>
          <Card className="p-0">
            {decided.map(({ s, d }) => (
              <div
                key={s.id}
                className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-fg">
                      {s.commodity} · {s.market}
                    </span>
                    <Badge variant="neutral">{s.id}</Badge>
                    <Badge
                      variant={
                        d.decision === "APPROVED" ? "success" : d.decision === "REJECTED" ? "danger" : "warning"
                      }
                    >
                      {DECISION_LABEL[d.decision]}
                    </Badge>
                  </div>
                  {d.reason && (
                    <p className="mt-1 text-sm text-muted">
                      Reason: <span className="text-fg">{d.reason}</span>
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted">Recorded {d.at}</span>
              </div>
            ))}
          </Card>
          <p className="text-xs text-muted">
            Session-only demo state — a production decision also writes an audit entry and notifies the officer.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "danger" }) {
  const color = tone === "success" ? "text-[var(--color-success)]" : tone === "danger" ? "text-[var(--color-danger)]" : "text-fg";
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5">
      <span className={cn("tabular font-semibold", color)}>{value}</span>{" "}
      <span className="text-muted">{label}</span>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  on,
  warn,
}: {
  icon: typeof MapPin;
  label: string;
  on: boolean;
  warn?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs",
        warn
          ? "bg-[var(--color-warning)]/12 text-[var(--color-warning)]"
          : on
            ? "bg-[var(--color-success)]/12 text-[var(--color-success)]"
            : "bg-surface-2 text-muted",
      )}
    >
      <Icon className="size-3" /> {label}
    </span>
  );
}
