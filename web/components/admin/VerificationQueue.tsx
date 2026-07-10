"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw, MapPin, Camera, AlertTriangle, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeltaPill } from "@/components/ui/delta-pill";
import { cn } from "@/lib/utils";
import { submissions as seed, FLAG_LABEL, FLAG_PILL, type FieldSubmission, type ScreeningFlag } from "@/lib/demo/admin";
import { ClipboardCheckIllustration } from "@/components/illustrations/empty-states";

type Decision = "APPROVED" | "REJECTED" | "RETURNED";
type ReasonKind = "REJECTED" | "RETURNED";
/** `seq` is a monotonic order key so the decided list survives reload from storage alone. */
type Recorded = { decision: Decision; reason?: string; at: string; seq: number };

const DECISION_LABEL: Record<Decision, string> = {
  APPROVED: "Approved & published",
  REJECTED: "Rejected",
  RETURNED: "Returned for correction",
};

/**
 * sessionStorage key for recorded verification decisions (CON-R3-01, the M14 major).
 * The surface says "Approved (session)" / "Decisions this session" three times, but
 * decisions lived in plain useState and `app/(app)/template.tsx` re-mounts on every
 * navigation — so they vanished on any nav, making the copy false. Persisting to the
 * browser session (mirroring the proven offer fix, MarketplaceBrowse `tgcu-demo-offers`)
 * — hydrate on mount, write on every record — makes "session" literally true.
 */
const DECISIONS_KEY = "tgcu-demo-decisions";

function loadDecisions(): Record<string, Recorded> {
  try {
    const raw = window.sessionStorage.getItem(DECISIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Recorded>) : {};
  } catch {
    return {};
  }
}

function persistDecisions(decisions: Record<string, Recorded>) {
  try {
    window.sessionStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
  } catch {
    // Storage unavailable (private mode etc.) — decisions stay page-local, still sandbox.
  }
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const deltaPct = (s: FieldSubmission) =>
  s.benchmark ? ((s.priceUGXPerKg - s.benchmark.value) / s.benchmark.value) * 100 : null;

/** Parse "6 Jul 2026, 14:22" → epoch ms for the oldest/newest sort (E.1 toolbar). */
const submittedMs = (s: FieldSubmission) => {
  const t = Date.parse(s.submittedAt.replace(",", ""));
  return Number.isNaN(t) ? 0 : t;
};

type StatusFilter = "all" | "pending" | "flagged";

/**
 * Field-data verification queue (FR-ADM-05/07/08/09) in the binding 06 E.1
 * master/detail composition (LAY-03): left queue list (minmax(320,420) at ≥1024,
 * so the detail — the decision surface — keeps ≥380px, §9.10; stacked above the
 * detail below 1024) + right detail panel — THE decision surface, with a sticky
 * decision bar (E.2). Exactly ONE decision set is visible at a time; the list is
 * keyboard-navigable (arrow keys, roving tabindex) and selection stays in sync
 * with the detail pane.
 *
 * Integrity rules unchanged: nothing enters trusted data except via an explicit
 * human APPROVE — no time-out self-publish (fail-closed). Reject/return require
 * a reason (FR-ADM-07): the decision cannot commit until a reason is entered,
 * and it is kept in the session decision log. Provenance, screening flags and
 * the external cross-check delta are surfaced so reviewers focus on suspect
 * values. On decision, the list advances to the next pending item (E.2).
 *
 * Decisions persist for the browser session (sessionStorage, CON-R3-01) so the
 * "session" copy is literally true across navigation — the (app) template
 * re-mounts every route change and would otherwise reset the queue.
 */
export function VerificationQueue() {
  const items = seed;
  const [decisions, setDecisions] = useState<Record<string, Recorded>>({});
  // CON-R3-01: hydrate recorded decisions from sessionStorage after mount (SSR
  // renders none, so the markup matches), then write back on every record().
  useEffect(() => {
    setDecisions(loadDecisions());
  }, []);
  const seqRef = useRef(0);
  const [reasonFor, setReasonFor] = useState<{ id: string; kind: ReasonKind } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);

  // E.1 toolbar (R3-L-02): status + commodity filters and an oldest/newest sort,
  // operating on the seeded queue. Oldest-first is the fail-closed default.
  const [status, setStatus] = useState<StatusFilter>("all");
  const [commodity, setCommodity] = useState<string>("all");
  const [oldestFirst, setOldestFirst] = useState(true);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const logRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const commodities = useMemo(
    () => Array.from(new Set(items.map((s) => s.commodity))).sort(),
    [items],
  );

  const pending = useMemo(() => {
    const rows = items
      .filter((s) => !decisions[s.id])
      .filter((s) => (commodity === "all" ? true : s.commodity === commodity))
      .filter((s) =>
        status === "all" ? true : status === "flagged" ? s.flags.length > 0 : true,
      );
    rows.sort((a, b) => (oldestFirst ? submittedMs(a) - submittedMs(b) : submittedMs(b) - submittedMs(a)));
    return rows;
  }, [items, decisions, status, commodity, oldestFirst]);

  // Count of undecided rows regardless of filter — the honest "still to review" total.
  const undecidedTotal = items.filter((s) => !decisions[s.id]).length;
  const selected = pending.find((s) => s.id === selectedId) ?? pending[0] ?? null;
  const decided = useMemo(
    () =>
      Object.entries(decisions)
        .map(([id, d]) => ({ s: items.find((i) => i.id === id)!, d }))
        .filter((r) => r.s != null)
        .sort((a, b) => b.d.seq - a.d.seq),
    [decisions, items],
  );
  const recorded = Object.values(decisions);

  const now = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  function record(id: string, decision: Decision, reason?: string) {
    // Advance to the next pending row BEFORE the decision removes this one (E.2).
    const idx = pending.findIndex((s) => s.id === id);
    const rest = pending.filter((s) => s.id !== id);
    setSelectedId(rest[Math.min(Math.max(idx, 0), rest.length - 1)]?.id ?? null);

    setDecisions((prev) => {
      const next = { ...prev, [id]: { decision, reason, at: now(), seq: ++seqRef.current } };
      persistDecisions(next);
      return next;
    });
    setReasonFor(null);
    setReasonText("");
    // The record leaves the queue — move focus to the decision log so the
    // recorded outcome is the next thing keyboard/SR users land on.
    requestAnimationFrame(() => logRef.current?.focus());
  }

  function select(id: string) {
    setSelectedId(id);
    setReasonFor(null);
    setReasonText("");
    // <1024 the panes stack (E.1) — bring the decision surface into view.
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1280px)").matches) {
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

  const selectCls =
    "h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-2 text-xs text-fg focus-visible:border-ring lg:h-9";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <Stat label="Pending review" value={undecidedTotal} />
        <Stat label="Approved (session)" value={recorded.filter((d) => d.decision === "APPROVED").length} tone="success" />
        <Stat label="Rejected / returned" value={recorded.filter((d) => d.decision !== "APPROVED").length} tone="danger" />
      </div>

      {undecidedTotal === 0 ? (
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
        /* E.1 master/detail splits at xl (1280): at 1024–1279 the 256px sidebar leaves
           only 768px content — below the 420+24+380 the split needs — so it would starve
           the decision pane to 260px (R4 M3). Stack until xl. */
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <Card className="min-w-0 p-0">
            {/* E.1 toolbar (R3-L-02): compact status + commodity filters and an
                oldest/newest sort, plus the fail-closed reminder micro-note. */}
            <div className="border-b border-[var(--color-border)] p-4">
              <p className="text-sm font-medium text-fg">Pending review ({pending.length})</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="vq-status">Filter by status</label>
                <select
                  id="vq-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  className={selectCls}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                </select>
                <label className="sr-only" htmlFor="vq-commodity">Filter by commodity</label>
                <select
                  id="vq-commodity"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className={selectCls}
                >
                  <option value="all">All commodities</option>
                  {commodities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-pressed={oldestFirst}
                  onClick={() => setOldestFirst((v) => !v)}
                  className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-2.5 text-xs font-medium text-fg hover:bg-surface-2 lg:h-9"
                >
                  {oldestFirst ? "Oldest first" : "Newest first"}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted">
                Nothing publishes without a decision · oldest first.
              </p>
            </div>
            <ul
              ref={listRef}
              role="listbox"
              aria-label={`Verification queue — ${pending.length} pending`}
              onKeyDown={onListKeyDown}
              className="max-h-[560px] overflow-y-auto"
            >
              {pending.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted">
                  No submissions match these filters — {undecidedTotal} still pending.
                </li>
              ) : (
                pending.map((s) => {
                  const active = s.id === selected?.id;
                  const delta = deltaPct(s);
                  return (
                    <li key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                      {/* E.1 row (~h64): grain-500 unreviewed tick · initials ·
                          commodity·market · value · status chip · flag pills ·
                          cross-check DeltaPill · submitted time. Selected = left
                          --brand-600 accent + tint; one-line meta at 420. */}
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
                        {/* Unreviewed left tick (grain-500); the brand accent takes over when selected. */}
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-0.5"
                          style={{ background: active ? "var(--brand-600)" : "var(--grain-500)" }}
                        />
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
                            {s.flags.map((f) => (
                              <FlagPill key={f} flag={f} />
                            ))}
                            {delta != null && (
                              <DeltaPill dir={delta >= 0 ? "up" : "down"} valence={Math.abs(delta) > 40 ? "bad" : "good"}>
                                {delta >= 0 ? "+" : "−"}
                                {Math.abs(delta).toFixed(0)}%
                              </DeltaPill>
                            )}
                            <span>{s.submittedAt}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
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
            Session-only demo state — kept for this browser session; a production decision also
            writes an audit entry and notifies the officer.
          </p>
        </section>
      )}
    </div>
  );
}

/**
 * E.2 detail panel — the ONE decision surface. Header (mono record id ·
 * commodity·market·period · submitted value big tabular 28), provenance +
 * screening chips, cross-check block (side-by-side submitted-vs-trusted with a
 * delta chip + trusted-series sparkline; submitter accuracy mini-bar), the
 * mandatory-reason disclosure, and the sticky bottom decision bar with
 * guardrail copy.
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
  const delta = deltaPct(s);
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

          {/* E.2 cross-check block (R3-L-04): side-by-side submitted-vs-trusted value
              with the delta as a chip + a 64×20 sparkline of the trusted series. */}
          <div className="mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-3">
            {s.benchmark ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Submitted</p>
                    <p className="tabular text-lg font-semibold text-fg">
                      {s.priceUGXPerKg.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted">UGX/kg</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Trusted series</p>
                    <div className="flex items-end gap-2">
                      <p className="tabular text-lg font-semibold text-fg">
                        {s.benchmark.value.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-muted">UGX/kg</span>
                      </p>
                      <Sparkline values={s.benchmark.series} className="mb-1" />
                    </div>
                  </div>
                  {delta != null && (
                    <DeltaPill dir={delta >= 0 ? "up" : "down"} valence={bigDelta ? "bad" : "good"} className="mb-1">
                      {delta >= 0 ? "+" : "−"}
                      {Math.abs(delta).toFixed(0)}% vs trusted
                    </DeltaPill>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {s.benchmark.source} · trailing 5 months to {s.benchmark.date}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted">No external benchmark available for this commodity/period.</p>
            )}
          </div>

          {/* E.2 submitter accuracy history — mini-bar of recent outcomes */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-muted">Submitter’s recent outcomes</span>
            <OutcomeBar outcomes={s.officerOutcomes} />
            <span className="tabular text-muted">
              {s.officerOutcomes.filter(Boolean).length}/{s.officerOutcomes.length} approved
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

/** Compact screening pill for the E.1 row (R3-L-03) — warning-tinted, one word. */
function FlagPill({ flag }: { flag: ScreeningFlag }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-warning)]/14 px-1.5 py-0.5 text-xs font-medium text-[var(--warning-badge-text)] dark:bg-[var(--color-warning)]/20">
      {FLAG_PILL[flag]}
    </span>
  );
}

/**
 * Minimal inline sparkline (64×20) of the trusted series for the E.2 cross-check
 * (R3-L-04) — built here so the admin surface takes no chart-lane dependency
 * (MoversCard is F3 territory). Decorative: the numbers alongside carry the data.
 */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 64;
  const h = 20;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`)
    .join(" ");
  const rising = values[values.length - 1] >= values[0];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={className}
      aria-hidden
      focusable="false"
      style={{ overflow: "visible" }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={rising ? "var(--color-success)" : "var(--color-danger)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Recent-outcome mini-bar for the E.2 submitter-accuracy block (R3-L-04). */
function OutcomeBar({ outcomes }: { outcomes: boolean[] }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {outcomes.map((ok, i) => (
        <span
          key={i}
          className="h-3.5 w-1.5 rounded-[1px]"
          style={{ background: ok ? "var(--color-success)" : "var(--color-danger)" }}
        />
      ))}
    </span>
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
