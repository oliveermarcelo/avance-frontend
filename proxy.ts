import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const AUTH_ROUTES = ["/login", "/cadastro", "/recuperar-senha"];
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon", "/assets"];
const PUBLIC_ROUTES = ["/", "/cursos-publicos", "/privacidade", "/termos", "/reembolsos"];
const PUBLIC_DYNAMIC_PREFIXES = ["/curso/"];
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicStatic = PUBLIC_ROUTES.includes(pathname);
  const isPublicDynamic = PUBLIC_DYNAMIC_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicRoute = isPublicStatic || isPublicDynamic;

  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(ADMIN_PREFIX) && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};