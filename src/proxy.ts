import { NextRequest, NextResponse } from "next/server";

function isExpired(exp?: number) {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

function decodeJwtPayload(token: string): { id?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as { id?: string; exp?: number };
  } catch {
    return null;
  }
}

function isProtectedPage(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/sell");
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/posts") || pathname.startsWith("/api/products");
}

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("accessToken")?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const loggedIn = Boolean(token && payload && !isExpired(payload.exp));

  if (isAuthPage(pathname) && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedPage(pathname) && !loggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedApi(pathname) && req.method !== "GET" && !loggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sell/:path*",
    "/login",
    "/signup",
    "/api/posts/:path*",
    "/api/products/:path*",
  ],
};
