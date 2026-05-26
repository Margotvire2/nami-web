import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export function ParcoursEmptyState() {
  return (
    <section
      role="status"
      aria-label="Aucun parcours actif"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(91,78,196,0.08)",
          color: "#5B4EC4",
          marginBottom: 16,
        }}
        aria-hidden="true"
      >
        <Compass size={24} strokeWidth={1.8} />
      </div>
      <h2
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#1A1A2E",
          marginBottom: 6,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Vous n&apos;avez pas encore de parcours actif
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#6B7280",
          maxWidth: 360,
          margin: "0 auto 20px",
          lineHeight: 1.5,
        }}
      >
        Prenez un rendez-vous avec un soignant pour démarrer la coordination
        de votre parcours de soins.
      </p>
      <Link
        href="/trouver-un-soignant"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          background: "#5B4EC4",
          color: "#FFFFFF",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: "var(--font-jakarta)",
          transition: "background 0.15s ease",
        }}
      >
        Trouver un soignant
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </Link>
    </section>
  );
}
