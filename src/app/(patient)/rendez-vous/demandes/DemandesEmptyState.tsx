import Link from "next/link";
import { CalendarSearch } from "lucide-react";
import type { AppointmentRequestStatus } from "./mock-data";

type FilterKey = "ALL" | AppointmentRequestStatus;

interface DemandesEmptyStateProps {
  filter: FilterKey;
}

const EMPTY_MESSAGES: Record<FilterKey, { title: string; description: string }> = {
  ALL: {
    title: "Vous n'avez aucune demande de rendez-vous",
    description: "Commencez par trouver un soignant pour faire votre première demande.",
  },
  PENDING: {
    title: "Aucune demande en attente",
    description: "Toutes vos demandes ont été traitées par les soignants.",
  },
  ACCEPTED: {
    title: "Aucune demande acceptée pour le moment",
    description: "Vos demandes acceptées apparaîtront ici.",
  },
  DECLINED: {
    title: "Aucune demande refusée",
    description: "Bonne nouvelle : aucune de vos demandes n'a été refusée.",
  },
};

export function DemandesEmptyState({ filter }: DemandesEmptyStateProps) {
  const { title, description } = EMPTY_MESSAGES[filter];

  return (
    <section
      role="status"
      aria-label="Aucune demande à afficher"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "#FFFFFF",
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
        <CalendarSearch size={24} strokeWidth={1.8} />
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
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#6B7280",
          marginBottom: filter === "ALL" ? 20 : 0,
          maxWidth: 360,
          margin: filter === "ALL" ? "0 auto 20px" : "0 auto",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {filter === "ALL" && (
        <Link
          href="/trouver-un-soignant"
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
          Trouver un soignant
        </Link>
      )}
    </section>
  );
}
