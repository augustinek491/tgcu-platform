"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { primaryNav, adminNav, type NavItem } from "./nav";
import { cn } from "@/lib/utils";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)]",
        active
          ? "bg-brand-800/10 text-brand-800 dark:bg-brand-600/15 dark:text-brand-300"
          : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {item.label}
    </Link>
  );
}

/** Left sidebar (collapses to a drawer < 1024 via the topbar — see AppShell). */
export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  // Exact match or a nested route (href + "/"), so /market never matches /marketplace.
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--color-border)] px-5">
        <LogoMark size={28} />
        <span className="font-display text-sm font-semibold tracking-tight text-fg">TGCU</span>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Primary">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        {isAdmin && (
          <>
            <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Secretariat
            </div>
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} />
            ))}
          </>
        )}
      </nav>
      <div className="border-t border-[var(--color-border)] p-4 text-[11px] text-muted">
        v1 demo · seeded data
      </div>
    </aside>
  );
}
