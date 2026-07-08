import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { Button } from "@/components/ui/button";

/** Top bar: global search, freshness, notifications, theme, profile. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-surface/80 px-5 backdrop-blur">
      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search members, markets, listings…"
          aria-label="Global search"
          className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-bg pl-9 pr-3 text-sm outline-none placeholder:text-muted focus-visible:border-[var(--color-primary)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="mr-2 hidden lg:block">
          <FreshnessIndicator asOf="Jun 2026" source="MAAIF / TGCU tracker" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
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
