import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge auth gate (design/02 §2.4, layer 1): a cheap presence check on the __session
 * cookie — no Firebase SDK here. Real authorization is the Admin-SDK session verify in
 * the server layout guards. In v1-demo mode this is bypassed so the seeded demo is
 * navigable without a live login.
 */
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

const PROTECTED = [/^\/dashboard/, /^\/market/, /^\/membership/, /^\/marketplace/, /^\/admin/];

export function middleware(req: NextRequest) {
  if (DEMO_MODE) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((re) => re.test(pathname));
  if (!isProtected) return NextResponse.next();

  const hasSession = req.cookies.has("__session");
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url, 307);
}

export const config = {
  // `tiles` excluded (PERF-R2-02): each map view issues 9+ ranged pmtiles/glyph
  // requests — static assets need no edge gate, in demo mode or out of it.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|tiles).*)"],
};
