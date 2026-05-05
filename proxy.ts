import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDefaultRouteForRole,
  canAccessRoute,
  ADMIN_PREFIX,
  INSTRUCTOR_PREFIX,
} from "@/lib/auth/role-routes";

const AUTH_ROUTES = ["/login", "/cadastro", "/recuperar-senha"];
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon", "/assets"];
const PUBLIC_ROUTES = ["/", "/cursos-publicos", "/privacidade", "/termos", "/reembolsos"];
const PUBLIC_DYNAMIC_PREFIXES = ["/curso/"];

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
  const role = session?.user?.role;

  // Se usuario logado tenta acessar /login, /cadastro, /recuperar-senha,
  // manda pro dashboard certo da role dele
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Nao logado tentando acessar rota privada -> manda pro login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logado mas sem permissao para a rota -> manda pro dashboard da role
  if (!canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};