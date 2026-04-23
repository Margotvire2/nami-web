import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques — pas besoin d'auth
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/onboarding",
  "/invite",
  "/blog",
  "/pathologies",
  "/soignants",
  "/soignants-liberaux",
  "/shared",
  "/pitch",
  "/decouvrir",
  "/landing-page",
  "/validation-en-cours",
  "/verify-email",
  "/annuaire-public",
  "/trouver-un-soignant",
  "/demo",
  "/demo-hap",
  "/demo-tca",
  "/pitch-reseau",
  "/gabrielle",
  "/protocole-recherche",
  "/api",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
];

// Fichiers statiques à ignorer
const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|css|js|map)$/;

function isPublic(pathname: string): boolean {
  // Static files
  if (STATIC_EXTENSIONS.test(pathname)) return true;
  // Next.js internals
  if (pathname.startsWith("/_next")) return true;
  // Exact match or prefix match
  return PUBLIC_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — pass through
  if (isPublic(pathname)) return NextResponse.next();

  // Check for auth token in cookie or zustand-persisted localStorage
  // Next.js middleware can't read localStorage, so we check for the auth cookie
  // The Zustand persist store uses localStorage key "nami-auth"
  // We check the cookie that the client sets on login
  const token = request.cookies.get("nami-access-token")?.value;

  // If no cookie, check Authorization header (API calls from the app)
  const authHeader = request.headers.get("authorization");

  if (!token && !authHeader) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
