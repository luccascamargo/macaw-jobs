import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/auth/login", "/auth/register"];

  // Se está tentando acessar uma rota pública, permite
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Se não há token e não é rota pública, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Se há token e está tentando acessar rota de auth, redireciona para home
  if (pathname.startsWith("/auth/") && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
