"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { primaryNav, adminNav, type NavItem } from "./nav";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        // h-11 = 44px row, px-4 = 16px item padding per 06 A.3 ("item h44, px-16").
        "flex h-11 items-center gap-3 rounded-[var(--radius-sm)] px-4 text-sm font-medium transition-colors duration-[var(--dur-fast)]",
        active
          ? // Active: brand-interactive text (brand-700/brand-300, DS §9.1) + tint;
            // dark = brand-600 @20% + 3px --grain-500 accent bar (06 A.3/H.1, DM-02).
            "nav-item-active bg-brand-800/10 text-brand-interactive dark:bg-brand-600/20"
          : "text-muted hover:bg-surface-2 hover:text-fg dark:text-sidebar-muted dark:hover:bg-[var(--color-border)]/40 dark:hover:text-fg",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {item.label}
    </Link>
  );
}

/**
 * The shell nav list — shared verbatim between the ≥1024 sidebar and the <1024
 * MobileNav drawer (06 A.3: drawer carries the "same content"). `onNavigate`
 * lets the drawer close itself when an item is clicked (incl. same-route clicks).
 */
export function ShellNav({
  isAdmin = false,
  onNavigate,
}: {
  isAdmin?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // Exact match or a nested route (href + "/"), so /market never matches /marketplace.
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3" aria-label="Primary">
      {primaryNav.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
      ))}
      {isAdmin && (
        <>
          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted dark:text-sidebar-muted">
            Secretariat
          </div>
          {adminNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}
    </nav>
  );
}

/** Left sidebar (≥1024 only). Below 1024 the same nav renders in the MobileNav drawer (see Topbar). */
export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    // Dark sidebar = --brand-900 surface with --brand-800 dividers (06 A.3 / H.1 / AM-06).
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-surface lg:flex dark:border-brand-800 dark:bg-brand-900">
      {/* px-6/gap-3 on-token (LAY-06/07; A.2 shell bars px-24) */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-6 dark:border-brand-800">
        <LogoMark size={28} />
        <span className="font-display text-sm font-semibold tracking-tight text-fg">TGCU</span>
      </div>
      <ShellNav isAdmin={isAdmin} />
      <div className="border-t border-[var(--color-border)] p-4 text-xs text-muted dark:border-brand-800 dark:text-sidebar-muted">
        v1 demo · seeded data
      </div>
    </aside>
  );
}
