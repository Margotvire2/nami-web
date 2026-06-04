import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
