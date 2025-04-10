import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "./lib/auth-edge" // <-- nouveau import

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/accstorage")) {
    if (
      request.nextUrl.pathname === "/accstorage/login" ||
      request.nextUrl.pathname === "/api/auth/login" ||
      request.nextUrl.pathname === "/api/auth/verify-2fa"
    ) {
      return NextResponse.next()
    }

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/accstorage/login", request.url))
    }

    const payload = await verifyTokenEdge(token)

    if (!payload) {
      return NextResponse.redirect(new URL("/accstorage/login", request.url))
    }
  }

  return NextResponse.next()
}
