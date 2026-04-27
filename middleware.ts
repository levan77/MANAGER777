import { NextRequest, NextResponse } from "next/server";

// The primary domain that hosts the SaaS platform itself.
// Override via NEXT_PUBLIC_ROOT_DOMAIN in production.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "manager777.com";

function isPlatformHost(hostname: string): boolean {
  return (
    // local development (with or without port)
    hostname === "localhost" ||
    hostname.startsWith("localhost:") ||
    // Vercel preview / production deployments
    hostname.endsWith(".vercel.app") ||
    // the platform's own domain
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}`
  );
}

export function middleware(request: NextRequest) {
  // host header includes the port on local dev; strip it for comparison.
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const { pathname } = request.nextUrl;

  if (isPlatformHost(hostname)) {
    return NextResponse.next();
  }

  // Any other hostname is treated as a tenant custom domain.
  // Rewrite to /app/[domain]/...path so Next.js can resolve the dynamic segment.
  const url = request.nextUrl.clone();
  url.pathname = `/app/${hostname}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *  - /api/*          (API routes)
     *  - /_next/*        (Next.js internals / static assets)
     *  - /favicon.ico
     *  - common static image / font extensions
     */
    "/((?!api/|_next/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)",
  ],
};
