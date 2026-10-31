import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "campusops_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "campusops-super-secure-production-ready-jwt-secret-key-32chars"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/v1/auth") ||
    pathname.startsWith("/api/v1/departments") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  // Check auth session cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = (payload as any).role;

    // Role-based route protection
    if (pathname.startsWith("/student") && role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith("/faculty") && role !== "FACULTY" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/student/:path*",
    "/faculty/:path*",
    "/admin/:path*",
    "/api/v1/:path*",
  ],
};
