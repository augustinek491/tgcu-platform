import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";

/** Global 404 — routes somewhere useful, never a dead-end (NFR-93). */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-5">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <LogoMark size={48} />
        </div>
        <p className="font-display text-5xl font-semibold text-fg">404</p>
        <p className="mt-2 text-muted">We couldn&apos;t find that page.</p>
        <Link href="/" className={`mt-6 ${buttonVariants()}`}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
