import Link from "next/link";
import { Activity } from "lucide-react";

export function SuiviEmptyState() {
  return (
    <section
      role="status"
      aria-label="Aucun indicateur à afficher"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
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
        <Activity size={24} strokeWidth={1.8} />
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
        Pas encore de mesure
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#6B7280",
          marginBottom: 20,
          maxWidth: 380,
          margin: "0 auto 20px",
          lineHeight: 1.5,
        }}
      >
        Vos soignants peuvent ajouter des indicateurs de suivi lors de vos
        rendez-vous.
      </p>
      <Link
        href="/rendez-vous"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 22px",
          borderRadius: 999,
          background: "#5B4EC4",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
        }}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
      >
        Voir mes rendez-vous
      </Link>
    </section>
  );
}
