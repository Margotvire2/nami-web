import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/landing-page", destination: "/", permanent: true },
      { source: "/annuaire-public", destination: "/trouver-un-soignant", permanent: true },
      { source: "/annuaire-public/:path*", destination: "/trouver-un-soignant", permanent: true },
      // INIT-682 : typo fréquente sans tiret → vraie route canonique.
      { source: "/aujourdhui", destination: "/aujourd-hui", permanent: true },
      // INIT-644 : /register est une URL attendue mais n'existe pas → rediriger vers /signup, query params préservés natively.
      { source: "/register", destination: "/signup", permanent: true },
      { source: "/register/:path*", destination: "/signup/:path*", permanent: true },
      // F-PUBLIC-ARCHI-3-AUDIENCES : anciennes URLs → nouveaux slugs canoniques par audience.
      { source: "/soignants-liberaux", destination: "/pour-les-soignants", permanent: true },
      { source: "/patient", destination: "/pour-les-patients", permanent: true },
      { source: "/pour-structures", destination: "/pour-les-structures", permanent: true },
      // fix/404-soignants-annuaire : alias /soignants → /trouver-un-soignant
      { source: "/soignants", destination: "/trouver-un-soignant", permanent: true },
      { source: "/soignants/:slug", destination: "/trouver-un-soignant/:slug", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
