import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques — pas besoin d'auth
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
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
  "/pitch-banque",
  "/gabrielle",
  "/sante-des-femmes",
  "/demander-une-demo",
  "/protocole-recherche",
  "/methodologie-editoriale",
  "/cgu",
  "/confidentialite",
  "/mentions-legales",
  "/professions",
  "/fonctionnalites",
  "/clinique-pediatrique",
  "/api",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
];

// Routes du cockpit soignant (espace PROVIDER)
const COCKPIT_PATHS = [
  "/aujourd-hui",
  "/patients",
  "/agenda",
  "/messages",
  "/documents",
  "/equipe",
  "/adressages",
  "/facturation",
  "/intelligence",
  "/taches",
  "/reglages",
  "/admin",
  "/annuaire",
  "/centre-notifications",
  "/collaboration",
  "/consultations",
  "/dashboard",
  "/import",
  "/reseau",
  "/upgrade",
];

// Fichiers statiques à ignorer
const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|css|js|map)$/;

function isPublic(pathname: string): boolean {
  if (STATIC_EXTENSIONS.test(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  return PUBLIC_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );
}

function isCockpitPath(pathname: string): boolean {
  return COCKPIT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — pass through
  if (isPublic(pathname)) return NextResponse.next();

  const token = request.cookies.get("nami-access-token")?.value;
  const authHeader = request.headers.get("authorization");

  // Auth guard — pas de token = redirect /login
  if (!token && !authHeader) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Routing role-based post-login.
  // Les cookies nami-user-role + nami-has-provider sont syncés par le store
  // au login + à la réhydratation (cf. src/lib/store.ts).
  const role = request.cookies.get("nami-user-role")?.value;
  const hasProvider = request.cookies.get("nami-has-provider")?.value === "1";

  // ORG_ADMIN pur (sans ProviderProfile) qui tente d'aller dans le cockpit soignant
  // → redirect vers sa console d'animation.
  // Les layouts (cockpit) finiront le routage côté client si la première org
  // n'est pas connue (fallback gracieux).
  if (role === "ORG_ADMIN" && !hasProvider && isCockpitPath(pathname)) {
    const adminOrgId = request.cookies.get("nami-admin-org-ids")?.value?.split(",")[0];
    if (adminOrgId) {
      return NextResponse.redirect(new URL(`/structure/${adminOrgId}/admin`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
