import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MapPinIllustration } from "@/components/illustrations/empty-states";
import { TopbarSearch } from "@/components/shell/TopbarSearch";

/** Global 404 — routes somewhere useful, never a dead-end (NFR-93; 01 §6.7:
 *  impersonal copy + link home + the global seeded search, CON-R2-09/FLOW-R2-03).
 *  Map-with-pin from the PART I.2 line-art family: "not on the map". */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <MapPinIllustration size={96} />
        </div>
        <h1 className="font-display text-5xl font-semibold text-fg">404</h1>
        <p className="mt-2 text-muted">That page doesn&apos;t exist.</p>
        {/* The seeded global search, scoped to the 404 (visible at every width). */}
        <div className="mt-6 text-left">
          <TopbarSearch className="block max-w-none" />
        </div>
        <Link href="/" className={`mt-6 ${buttonVariants()}`}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
