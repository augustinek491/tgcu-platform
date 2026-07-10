"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw, MapPin, Camera, AlertTriangle, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { submissions as seed, FLAG_LABEL, type FieldSubmission } from "@/lib/demo/admin";
import { ClipboardCheckIllustration } from "@/components/illustrations/empty-states";

type Decision = "APPROVED" | "REJECTED" | "RETURNED";
type ReasonKind = "REJECTED" | "RETURNED";
type Recorded = { decision: Decision; reason?: string; at: string };

const DECISION_LABEL: Record<Decision, string> = {
  APPROVED: "Approved & published",
  REJECTED: "Rejected",
  RETURNED: "Returned for correction",
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Field-data verification queue (FR-ADM-05/07/08/09) in the binding 06 E.1
 * master/detail composition (LAY-03): left queue list (420px at ≥1024; stacked
 * above the detail below 1024) + right detail panel — THE decision surface,
 * with a sticky decision bar (E.2). Exactly ONE decision set is visible at a
 * time; the list is keyboard-navigable (arrow keys, roving tabindex) and
 * selection stays in sync with the detail pane.
 *
 * Integrity rules unchanged: nothing enters trusted data except via an explicit
 * human APPROVE — no time-out self-publish (fail-closed). Reject/return require
 * a reason (FR-ADM-07): the decision cannot commit until a reason is entered,
 * and it is kept in the session decision log. Provenance, screening flags and
 * the external cross-check delta are surfaced so reviewers focus on suspect
 * values. On decision, the list advances to the next pending item (E.2).
 */
export function VerificationQueue() {
  const items = seed;
  const [decisions, setDecisions] = useState<Record<string, Recorded>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [reasonFor, setReasonFor] = useState<{ id: string; kind: ReasonKind } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const logRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const pending = items.filter((s) => !decisions[s.id]);
  const selected = pending.find((s) => s.id === selectedId) ?? pending[0] ?? null;
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
    // E.2: the list advances to the next pending item (the row that takes the
    // decided row's place; clamps to the new last row at the end of the queue).
    const idx = pending.findIndex((s) => s.id === id);
    const rest = pending.filter((s) => s.id !== id);
    setSelectedId(rest[Math.min(Math.max(idx, 0), rest.length - 1)]?.id ?? null);
    // The record leaves the queue — move focus to the decision log so the
    // recorded outcome is the next thing keyboard/SR users land on.
    requestAnimationFrame(() => logRef.current?.focus());
  }

  function select(id: string) {
    setSelectedId(id);
    setReasonFor(null);
    setReasonText("");
    // <1024 the panes stack (E.1) — bring the decision surface into view.
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }),
      );
    }
  }

  /** Roving arrow-key navigation over the queue list (E.1 keyboard contract). */
  function onListKeyDown(e: React.KeyboardEvent) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = Math.max(
      0,
      pending.findIndex((s) => s.id === selected?.id),
    );
    const next =
      e.key === "ArrowDown"
        ? Math.min(pending.length - 1, i + 1)
        : e.key === "ArrowUp"
          ? Math.max(0, i - 1)
          : e.key === "Home"
            ? 0
            : pending.length - 1;
    const id = pending[next]?.id;
    if (!id) return;
    setSelectedId(id);
    setReasonFor(null);
    setReasonText("");
    listRef.current?.querySelector<HTMLButtonElement>(`[data-row="${id}"]`)?.focus();
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
        /* E.1 master/detail: queue list w-420 + detail panel at ≥1024; stacked below. */
        <div className="grid items-start gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <Card className="min-w-0 p-0">
            {/* E.1 toolbar: count + the fail-closed reminder micro-note */}
            <div className="border-b border-[var(--color-border)] p-4">
              <p className="text-sm font-medium text-fg">Pending review ({pending.length})</p>
              <p className="mt-1 text-xs text-muted">
                Nothing publishes without a decision — oldest first.
              </p>
            </div>
            <ul
              ref={listRef}
              role="listbox"
              aria-label={`Verification queue — ${pending.length} pending`}
              onKeyDown={onListKeyDown}
              className="max-h-[560px] overflow-y-auto"
            >
              {pending.map((s) => {
                const active = s.id === selected?.id;
                const delta = s.benchmark
                  ? ((s.priceUGXPerKg - s.benchmark.value) / s.benchmark.value) * 100
                  : null;
                return (
                  <li key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                    {/* E.1 row (h64): initials · commodity·market · value · status
                        chip · flag count · cross-check delta · submitted time.
                        Selected = left --brand-600 accent + tint. */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-row={s.id}
                      tabIndex={active ? 0 : -1}
                      onClick={() => select(s.id)}
                      className={cn(
                        "relative flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-[var(--dur-fast)]",
                        active ? "bg-brand-800/5 dark:bg-brand-600/10" : "hover:bg-surface-2",
                      )}
                    >
                      {active && (
                        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-brand-600" />
                      )}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-fg">
                        {initials(s.officer)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-fg">
                            {s.commodity} · {s.market}
                          </span>
                          <Badge variant="neutral">
                            {s.state === "SCREENED" ? "Screened" : "Submitted"}
                          </Badge>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          <span className="tabular font-medium text-fg">
                            {s.priceUGXPerKg.toLocaleString()} UGX/kg
                          </span>
                          {s.flags.length > 0 && (
                            <span className="text-warning-text">
                              {s.flags.length} flag{s.flags.length > 1 ? "s" : ""}
                            </span>
                          )}
                          {delta != null && (
                            <span className="tabular">
                              {delta >= 0 ? "▲ +" : "▼ −"}
                              {Math.abs(delta).toFixed(0)}% vs benchmark
                            </span>
                          )}
                          <span>{s.submittedAt}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {selected && (
            <DetailPanel
              key={selected.id}
              s={selected}
              detailRef={detailRef}
              reasonFor={reasonFor}
              reasonText={reasonText}
              setReasonText={setReasonText}
              record={record}
              openReason={openReason}
              cancelReason={cancelReason}
            />
          )}
        </div>
      )}

      {/* Session decision log — reasons stay visible (FR-ADM-07/13) */}
      {decided.length > 0 && (
        <section
          ref={logRef}
          tabIndex={-1}
          aria-label="Decisions this session"
          aria-live="polite"
          className="space-y-2"
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

/**
 * E.2 detail panel — the ONE decision surface. Header (mono record id ·
 * commodity·market·period · submitted value big tabular 28), provenance +
 * screening chips, cross-check block, the mandatory-reason disclosure, and the
 * sticky bottom decision bar with guardrail copy.
 */
function DetailPanel({
  s,
  detailRef,
  reasonFor,
  reasonText,
  setReasonText,
  record,
  openReason,
  cancelReason,
}: {
  s: FieldSubmission;
  detailRef: React.RefObject<HTMLDivElement | null>;
  reasonFor: { id: string; kind: ReasonKind } | null;
  reasonText: string;
  setReasonText: (v: string) => void;
  record: (id: string, decision: Decision, reason?: string) => void;
  openReason: (e: React.MouseEvent<HTMLButtonElement>, id: string, kind: ReasonKind) => void;
  cancelReason: () => void;
}) {
  const delta = s.benchmark
    ? ((s.priceUGXPerKg - s.benchmark.value) / s.benchmark.value) * 100
    : null;
  const bigDelta = delta != null && Math.abs(delta) > 40;
  const formOpen = reasonFor?.id === s.id;

  return (
    <div ref={detailRef} className="min-w-0 scroll-mt-20">
      <Card className="min-w-0 p-0">
        <div className="p-4">
          {/* E.2 header: record id (mono) · commodity·market·period · value big (tabular 28) */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">
                  <span style={{ fontFamily: "var(--font-mono)" }}>{s.id}</span>
                </Badge>
                <span className="font-display text-lg font-semibold text-fg">
                  {s.commodity} · {s.market}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span>Officer: <span className="text-fg">{s.officer}</span></span>
                <span className={cn(s.officerAccuracy < 80 && "text-warning-text")}>
                  {s.officerAccuracy}% approval rate
                </span>
                <span>Observed {s.observationDate} · submitted {s.submittedAt}</span>
              </div>
            </div>
            <div className="tabular text-[28px] font-semibold leading-none text-fg">
              {s.priceUGXPerKg.toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted">UGX/kg</span>
            </div>
          </div>

          {/* Provenance + screening */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip icon={MapPin} on={!!s.geo} label={s.geo ? "Geo captured" : "Location not captured"} warn={!s.geo} />
            <Chip icon={Camera} on={s.hasPhoto} label={s.hasPhoto ? "Photo attached" : "No photo"} />
            {/* Dedupe guard (CE2-01): when the provenance chip already says the
                location is missing, don't repeat it as a screening chip. */}
            {s.flags
              .filter((f) => !(f === "geo-missing" && !s.geo))
              .map((f) => (
                <Chip key={f} icon={AlertTriangle} on={false} label={FLAG_LABEL[f]} warn />
              ))}
            {s.flags.length === 0 && s.geo && (
              <Chip icon={CircleCheck} on label="Clean screen" />
            )}
          </div>

          {/* Cross-check */}
          <div className="mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-3 text-xs">
            {s.benchmark ? (
              <span className="text-muted">
                External cross-check:{" "}
                <span className="text-fg">UGX {s.benchmark.value.toLocaleString()}/kg</span> ·{" "}
                {s.benchmark.source} · {s.benchmark.date} ·{" "}
                <span className={cn("font-medium", bigDelta ? "text-danger-text" : "text-success-text")}>
                  submitted {delta! >= 0 ? "+" : "−"}
                  {Math.abs(delta!).toFixed(0)}% vs benchmark
                </span>
              </span>
            ) : (
              <span className="text-muted">No external benchmark available for this commodity/period.</span>
            )}
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
                <span aria-hidden className="text-danger-text">*</span>
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
                className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface p-3 text-base text-fg placeholder:text-muted focus-visible:border-ring"
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
        </div>

        {/* E.2 decision bar — sticky bottom, the ONLY visible decision set.
            Buttons at the F.1 44px step (LAY-09; was size-sm 36). */}
        <div className="sticky bottom-0 rounded-b-[var(--radius-card)] border-t border-[var(--color-border)] bg-surface p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => record(s.id, "APPROVED")}>
              <Check className="size-4" /> Approve &amp; publish
            </Button>
            <Button
              variant="secondary"
              aria-expanded={formOpen && reasonFor?.kind === "RETURNED"}
              onClick={(e) => openReason(e, s.id, "RETURNED")}
            >
              <RotateCcw className="size-4" /> Return for correction
            </Button>
            <Button
              variant="ghost"
              aria-expanded={formOpen && reasonFor?.kind === "REJECTED"}
              onClick={(e) => openReason(e, s.id, "REJECTED")}
            >
              <X className="size-4" /> Reject
            </Button>
          </div>
          {/* E.2 guardrail copy — the fail-closed line lives with the actions */}
          <p className="mt-2 text-xs text-muted">
            Approval publishes this to the trusted price series. Reject / return requires a
            recorded reason; decisions are listed below.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "danger" }) {
  const color = tone === "success" ? "text-success-text" : tone === "danger" ? "text-danger-text" : "text-fg";
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
        // On-tint text = *-badge-text pairs, 14%/20% tints — mirrors core Badge (DS §9.1 / AM-01).
        warn
          ? "bg-[var(--color-warning)]/14 text-[var(--warning-badge-text)] dark:bg-[var(--color-warning)]/20"
          : on
            ? "bg-[var(--color-success)]/14 text-[var(--success-badge-text)] dark:bg-[var(--color-success)]/20"
            : "bg-surface-2 text-muted",
      )}
    >
      <Icon className="size-3" /> {label}
    </span>
  );
}
