import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const protectedRegex = /^\/dashboard(.*)/;

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (protectedRegex.test(pathname)) {
    const token = req.cookies.get("access_token")?.value;
    const refresh = req.cookies.get("refresh_token")?.value;

    // If access token is missing but refresh token exists, allow request through
    // so server code can attempt to rotate the refresh token and set new access token.
    if (!token) {
      if (refresh) return NextResponse.next();
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    try {
      verifyAccessToken(token);
      return NextResponse.next();
    } catch (err) {
      // On invalid access token, allow through if refresh token present so server can refresh
      if (refresh) return NextResponse.next();
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
