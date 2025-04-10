import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: "auth-token",
    value: "",
    expires: new Date(0),
    path: "/",
  });

  cookieStore.delete("auth-token");

  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}

