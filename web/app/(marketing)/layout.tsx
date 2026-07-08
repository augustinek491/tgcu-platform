import Link from "next/link";
import { LogoWordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";

/** Public marketing chrome — RSC, zero Firebase SDK (design/02 §1.1). */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5">
          <Link href="/" aria-label="TGCU home">
            <LogoWordmark />
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/pricing" className="hidden px-3 text-sm font-medium text-muted hover:text-fg sm:block">
              Membership
            </Link>
            <ThemeToggle />
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Grain Council of Uganda</span>
          <span>Plot 35 Kenneth Dale, Kamwokya, Kampala · v1 demo</span>
        </div>
      </footer>
    </div>
  );
}
