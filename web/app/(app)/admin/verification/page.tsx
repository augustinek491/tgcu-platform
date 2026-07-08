import type { Metadata } from "next";
import { VerificationQueue } from "@/components/admin/VerificationQueue";

export const metadata: Metadata = { title: "Field-data verification" };

export default function VerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[28px] font-semibold text-fg">Field-data verification</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          No field number becomes trusted platform data until it passes provenance capture, automated
          screening, and a recorded human decision. Nothing self-publishes (fail-closed).
        </p>
      </div>
      <VerificationQueue />
    </div>
  );
}
