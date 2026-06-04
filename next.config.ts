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
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
