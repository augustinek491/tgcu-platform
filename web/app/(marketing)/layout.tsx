import Link from "next/link";
import { LogoWordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";

/** Public marketing chrome — RSC, zero Firebase SDK (design/02 §1.1).
 *  Footer per DS §9.8 landing IA minimum (AM-17 / CE-06): nav columns,
 *  Kamwokya contact, legal/demo notice, wordmark. Sentence case, quiet. */

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Market data", href: "/market" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Membership portal", href: "/membership" },
    ],
  },
  {
    title: "Membership",
    links: [
      { label: "About & governance", href: "/about" },
      { label: "Membership tiers", href: "/pricing" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Verification queue", href: "/admin/verification" },
      { label: "Audit log", href: "/admin/audit" },
      { label: "Roles & access", href: "/admin/roles" },
    ],
  },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-18 w-full max-w-[1280px] items-center justify-between px-6">
          <Link href="/" aria-label="TGCU home">
            <LogoWordmark />
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/about"
              className="hidden min-h-11 items-center px-3 text-sm font-medium text-muted hover:text-fg sm:inline-flex"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="hidden min-h-11 items-center px-3 text-sm font-medium text-muted hover:text-fg sm:inline-flex"
            >
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

      <footer className="border-t border-[var(--color-border)] bg-surface">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] md:gap-8">
            <div>
              <LogoWordmark />
              <p className="mt-4 max-w-xs text-sm text-muted">
                Membership, market intelligence and a trusted marketplace for
                Uganda&apos;s grain sector.
              </p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-sm font-semibold text-fg">{col.title}</p>
                <ul className="mt-3 space-y-1">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        // ::after = invisible 44px hit-area (MOB-02) — visual link unchanged.
                        className="relative inline-flex min-h-11 items-center text-sm text-muted hover:text-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-12 border-t border-[var(--color-border)] pt-6">
            <address className="text-sm not-italic text-muted">
              The Grain Council of Uganda · Plot 35 Kenneth Dale, Kamwokya, Kampala ·{" "}
              <a href="tel:+256393517499" className="hover:text-fg">
                0393 517499
              </a>{" "}
              ·{" "}
              <a href="mailto:info@tgcu.org" className="hover:text-fg">
                info@tgcu.org
              </a>
            </address>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>© {new Date().getFullYear()} The Grain Council of Uganda</span>
              <span aria-hidden>·</span>
              <span>Demonstration platform · seeded data</span>
              <span aria-hidden>·</span>
              <span>Informational, not financial advice</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
