"use client";

import type { AppointmentRequestStatus } from "./mock-data";

type FilterKey = "ALL" | AppointmentRequestStatus;

interface DemandesHeroProps {
  filter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  counts: Record<FilterKey, number>;
}

const TABS: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "ACCEPTED", label: "Acceptées" },
  { key: "DECLINED", label: "Refusées" },
];

export function DemandesHero({ filter, onFilterChange, counts }: DemandesHeroProps) {
  return (
    <header style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1A1A2E",
          letterSpacing: "-0.02em",
          marginBottom: 8,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Mes demandes de rendez-vous
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "#6B7280",
          lineHeight: 1.5,
          marginBottom: 20,
        }}
      >
        Suivez l&apos;état de vos demandes en attente, acceptées ou refusées.
      </p>

      {/* Banner V1 — transparence dev (pas de promesse, pas de DGCCRF) */}
      <div
        role="note"
        style={{
          background: "rgba(91,78,196,0.08)",
          border: "1px solid rgba(91,78,196,0.2)",
          borderRadius: 12,
          padding: "10px 16px",
          fontSize: 13,
          color: "#374151",
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        Cette page affiche un aperçu de l&apos;expérience. La connexion à vos demandes
        réelles arrive très bientôt.
      </div>

      {/* Tabs filter */}
      <nav
        role="tablist"
        aria-label="Filtrer les demandes par statut"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(26,26,46,0.08)",
          paddingBottom: 12,
        }}
      >
        {TABS.map((tab) => {
          const active = filter === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: `1px solid ${active ? "#5B4EC4" : "rgba(26,26,46,0.1)"}`,
                background: active ? "rgba(91,78,196,0.08)" : "#FFFFFF",
                color: active ? "#5B4EC4" : "#374151",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
            >
              {tab.label}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: active ? "#5B4EC4" : "rgba(26,26,46,0.06)",
                  color: active ? "#FFFFFF" : "#6B7280",
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
