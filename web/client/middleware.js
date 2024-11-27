import { NextResponse } from "next/server";

export async function middleware(request) {
  const accessToken = request.cookies.get("accessToken")?.value;

  const protectedRoutes = ["/dashboard"];

  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  if (
    accessToken &&
    (request.nextUrl.pathname === "/auth/signin" ||
      request.nextUrl.pathname === "/auth/signup")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/auth/signin", "/auth/signup"],
};
