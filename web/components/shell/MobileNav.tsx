"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";
import { ShellNav } from "./Sidebar";
import { cn } from "@/lib/utils";

const DRAWER_ID = "mobile-nav-drawer";

/**
 * Mobile nav (<1024): topbar hamburger + left drawer carrying the exact sidebar
 * nav (06 A.3 "Drawer (<1024)"; fixes A11Y-10 / MOB-01 / FLOW-01 / BR-02-adjacent).
 *
 * - Slide: translateX over --dur-drawer (220ms ease-out; the global
 *   prefers-reduced-motion block zeroes the var → instant, no slide).
 * - Scrim: opacity over --dur-menu (160ms, H.2 modal-scrim value).
 * - Focus is trapped while open; Esc / scrim tap / nav click / route change
 *   close it; focus returns to the hamburger; body scroll is locked.
 * - The overlay portals to <body>: the topbar's backdrop-blur creates a
 *   containing block, so `fixed inset-0` inside it would size to the header.
 * - Closed = inert + aria-hidden: nothing off-screen is tabbable or read by AT.
 */
export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(false);

  // Portal target exists only client-side.
  useEffect(() => setMounted(true), []);

  // Route navigation closes the drawer.
  useEffect(() => setOpen(false), [pathname]);

  // ≥1024 the real sidebar takes over — close so the scroll lock can't strand.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Body scroll lock + initial focus (close button) while open. The lock is a
  // max-lg-scoped utility (not an inline style) so it self-releases at ≥1024
  // via CSS even if a resize never fires the matchMedia listener above.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("max-lg:overflow-hidden");
    panelRef.current?.querySelector<HTMLElement>("[data-drawer-close]")?.focus();
    return () => {
      document.body.classList.remove("max-lg:overflow-hidden");
    };
  }, [open]);

  // Focus returns to the trigger on every close path (Esc, scrim, item, resize).
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Esc closes; Tab cycles inside the panel (manual trap, dialog pattern).
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement;
    if (e.shiftKey && (current === first || current === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const overlay = (
    // z30 = overlay step on the DS §4 z-scale (10 sticky / 20 dropdown / 30 overlay / 50 modal).
    <div
      id={DRAWER_ID}
      inert={!open}
      aria-hidden={!open}
      onKeyDown={onKeyDown}
      className={cn("fixed inset-0 z-30 lg:hidden", !open && "pointer-events-none")}
    >
      {/* Scrim — --overlay rgba(12,10,9,.48) per 06 A.3; tap closes. */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-[rgba(12,10,9,0.48)] transition-opacity duration-[var(--dur-menu)] ease-[var(--ease-out)]",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Panel — w280, same surface treatment as the sidebar (06 A.3 / H.1). */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-[var(--color-border)] bg-surface transition-transform duration-[var(--dur-drawer)] ease-[var(--ease-out)] dark:border-brand-800 dark:bg-brand-900",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo mark at the top of the drawer (AM-25), aligned to topbar height. */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--color-border)] px-4 md:h-16 dark:border-brand-800">
          <LogoMark size={28} />
          <span className="font-display text-sm font-semibold tracking-tight text-fg">TGCU</span>
          <Button
            variant="ghost"
            size="icon"
            data-drawer-close
            className="ml-auto [&_svg]:size-5"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden />
          </Button>
        </div>
        <ShellNav isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
        <div className="border-t border-[var(--color-border)] p-4 text-xs text-muted dark:border-brand-800 dark:text-sidebar-muted">
          v1 demo · seeded data
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden [&_svg]:size-5"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls={DRAWER_ID}
        onClick={() => setOpen((v) => !v)}
      >
        <Menu aria-hidden />
      </Button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
