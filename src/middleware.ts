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
  "/protocoles",
  "/taches",
  "/reglages",
  "/admin",
  "/alertes",
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

// F-UX-PATIENT-V1-LAUNCH-1 — Host detection (Doctolib pattern)
// app.namipourlavie.com sert les surfaces soignant (landing + signup),
// namipourlavie.com sert les surfaces patient. Pas de duplication de code :
// rewrite vers les pages existantes (/soignants-liberaux et /signup/professional).
const PROVIDER_HOSTS = new Set([
  "app.namipourlavie.com",
  "app.localhost:3001",
  "app.localhost",
]);

function isProviderHost(host: string | null): boolean {
  if (!host) return false;
  return PROVIDER_HOSTS.has(host);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");

  // Sous-domaine app. — rewrites vers contenu soignant existant.
  // /login et /forgot-password restent communs : la page détecte le host
  // côté client pour appeler le bon endpoint backend.
  if (isProviderHost(host)) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/soignants-liberaux", request.url));
    }
    if (pathname === "/signup" || pathname === "/signup/") {
      return NextResponse.rewrite(new URL("/signup/professional", request.url));
    }
  }

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

  // PLATFORM_ADMIN/ORG_ADMIN pur (sans ProviderProfile) qui tente d'aller dans le cockpit
  // soignant → redirect vers sa console d'animation.
  // F-SEC-RENAME-PLATFORM-ADMIN — coexistence transitoire (V2 J+30 : retirer "ORG_ADMIN").
  // Le cookie nami-user-role peut porter "PLATFORM_ADMIN" (nouveau) OU "ORG_ADMIN" (legacy)
  // pendant la migration ; on accepte les deux.
  // Les layouts (cockpit) finiront le routage côté client si la première org
  // n'est pas connue (fallback gracieux).
  if ((role === "PLATFORM_ADMIN" || role === "ORG_ADMIN") && !hasProvider && isCockpitPath(pathname)) {
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
