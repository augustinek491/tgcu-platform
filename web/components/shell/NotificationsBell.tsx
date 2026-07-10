"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEEDED_NOTIFICATIONS } from "@/lib/demo/notifications";

/**
 * Notifications bell (FLOW-05) — opens a panel of seeded notifications with a
 * reachable empty state. Non-modal popover: Esc closes and returns focus to
 * the bell; outside click closes. Session-only demo state.
 */
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const items = cleared ? [] : SEEDED_NOTIFICATIONS;
  const unread = items.length;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          close();
        }
      }}
    >
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[var(--color-accent)]"
          />
        )}
      </Button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          className="menu-enter absolute right-0 top-[calc(100%+6px)] z-20 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-2">
            <p className="text-sm font-semibold text-fg">Notifications</p>
            {items.length > 0 && (
              <Button variant="ghost" className="px-3 text-xs" onClick={() => setCleared(true)}>
                Clear all
              </Button>
            )}
          </div>

          {items.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="border-b border-[var(--color-border)] last:border-0">
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block min-h-11 px-4 py-3 transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 focus-visible:bg-surface-2"
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-fg">{n.title}</span>
                      <span className="shrink-0 text-xs text-muted">{n.at}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{n.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <CircleCheck className="mx-auto size-6 text-[var(--color-success)]" aria-hidden />
              <p className="mt-2 text-sm font-medium text-fg">All caught up</p>
              <p className="mt-1 text-xs text-muted">New platform activity will appear here.</p>
              <Button variant="secondary" className="mt-4" onClick={close} autoFocus>
                Close
              </Button>
            </div>
          )}

          <p className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-muted">
            Seeded demo notifications · session-only
          </p>
        </div>
      )}
    </div>
  );
}
