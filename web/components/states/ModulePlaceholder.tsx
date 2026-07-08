import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Honest scaffold state for modules whose data/logic land in a later PH-1 slice.
 * Never a dead-end (NFR-93): states what's coming + a way back. Not fake data.
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  summary,
  points,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  points: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[28px] font-semibold text-fg">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{summary}</p>
      </div>
      <Card className="p-6">
        <Badge variant="brand">Planned · this PH-1 slice</Badge>
        <ul className="mt-4 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-fg">
              <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-500"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
      </Card>
    </div>
  );
}
