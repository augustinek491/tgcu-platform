import { IBM_Plex_Mono } from "next/font/google";

// IBM Plex Mono is scoped to admin routes ONLY (design/02 §5.4 / NFR-11, PERF-01):
// loading it here keeps its ~20KB preload off member/marketing routes. The variable
// cascades from this wrapper, so `font-mono` (and --font-mono consumers) resolve to
// Plex inside /admin/*; elsewhere the token falls back to the system mono stack.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${ibmPlexMono.variable} contents`}
      // Re-declare --font-mono HERE: custom properties resolve their inner var()s at the
      // element that defines them, so the :root-level --font-mono (globals.css) resolves
      // to the system fallback. Declaring it on this wrapper — where the Plex variable
      // exists — makes every var(--font-mono) consumer inside /admin/* get real Plex.
      style={{ "--font-mono": "var(--font-ibm-plex-mono), ui-monospace, monospace" } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
