import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

/**
 * AppShell for the authenticated member area. In v1-demo mode this renders the shell
 * directly; production wires the session-cookie guard (requireUser) + admin claim here
 * (design/02 §2.4). isAdmin is hard-true for the demo so the secretariat nav shows.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar isAdmin />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar hosts the <1024 drawer (MobileNav) — same isAdmin as the sidebar. */}
        <Topbar isAdmin />
        {/* px-4 mobile (LAY-07: 20px is card-padding-only); px-32/py-24 ≥768 per A.1 */}
        <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
