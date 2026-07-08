import Link from "next/link";
import { LogoWordmark } from "@/components/brand/Logo";

/** Centered card shell for auth screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
        <Link href="/" className="mb-8 flex justify-center" aria-label="TGCU home">
          <LogoWordmark markSize={40} />
        </Link>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
