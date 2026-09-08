import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "worktrail-ai-secure-secret-token-key-change-in-prod"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPrefixes = [
    "/dashboard",
    "/work-logs",
    "/timeline",
    "/calendar",
    "/files",
    "/journal",
    "/reports",
    "/analytics",
    "/ai-insights",
    "/search",
    "/admin",
  ];

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get("worktrail_session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/work-logs/:path*",
    "/timeline/:path*",
    "/calendar/:path*",
    "/files/:path*",
    "/journal/:path*",
    "/reports/:path*",
    "/analytics/:path*",
    "/ai-insights/:path*",
    "/search/:path*",
    "/admin/:path*",
  ],
};
