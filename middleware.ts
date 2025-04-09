import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Vérifier si la route est protégée
  if (request.nextUrl.pathname.startsWith("/accstorage")) {
    // Exclure la page de login et les API d'authentification
    if (
      request.nextUrl.pathname === "/accstorage/login" ||
      request.nextUrl.pathname === "/api/auth/login" ||
      request.nextUrl.pathname === "/api/auth/verify-2fa"
    ) {
      return NextResponse.next()
    }

    // Vérifier le token d'authentification
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/accstorage/login", request.url))
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.redirect(new URL("/accstorage/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/accstorage/:path*", "/api/:path*"],
}
