import { ThemeToggle } from "./ThemeToggle";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { TopbarSearch } from "./TopbarSearch";
import { NotificationsBell } from "./NotificationsBell";
import { MobileNav } from "./MobileNav";
import { LogoMark } from "@/components/brand/Logo";

/** Top bar: drawer trigger + logo mark (<1024), global search (seeded scope), freshness, notifications, theme, profile. */
export function Topbar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    // h56 mobile / h64 ≥768 (06 PART G shell row · A.2; MOB-04).
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-surface/80 px-5 backdrop-blur md:h-16 lg:gap-4">
      {/* <1024: hamburger + logo mark live in topbar-left (DS §9.8 / AM-25; A11Y-10, BR-02).
          ≥1024 the sidebar carries both, so the cluster hides. */}
      <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
        <MobileNav isAdmin={isAdmin} />
        <LogoMark size={28} className="shrink-0" />
      </div>
      <TopbarSearch />

      <div className="ml-auto flex items-center gap-2">
        <div className="mr-2 hidden lg:block">
          <FreshnessIndicator asOf="Jun 2026" source="MAAIF / TGCU tracker" />
        </div>
        <NotificationsBell />
        <ThemeToggle />
        <div
          className="ml-1 grid size-9 place-items-center rounded-full bg-brand-800 text-sm font-semibold text-white"
          aria-label="Profile"
          title="Secretariat demo user"
        >
          TG
        </div>
      </div>
    </header>
  );
}
