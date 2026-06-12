export async function register() {
  // Sentry server instrumentation désactivée en local (Turbopack + multi-lockfile root detection conflict).
  // En prod (webpack), withSentryConfig dans next.config.ts réinjecte automatiquement.
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }
    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  }
}
