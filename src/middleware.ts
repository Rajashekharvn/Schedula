import { NextRequest, NextResponse } from "next/server";

// Pure cookie-based auth check — no NextAuth/Prisma imports
// Keeps edge function well under Vercel's 1MB limit
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NextAuth v5 sets one of these cookies for JWT sessions
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Protect all /dashboard routes
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from login/register
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

