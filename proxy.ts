import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/cadastro", "/recuperar-senha"];
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon", "/assets"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};