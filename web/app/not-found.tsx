import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MapPinIllustration } from "@/components/illustrations/empty-states";

/** Global 404 — routes somewhere useful, never a dead-end (NFR-93).
 *  Map-with-pin from the PART I.2 line-art family: "not on the map". */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-5">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <MapPinIllustration size={96} />
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
