"use client";

import { Users } from "lucide-react";
import type { PatientRcpSummary } from "@/lib/api";
import { usePatientRcps } from "@/hooks/usePatientRcps";

/**
 * PatientRcpHistory — F-CROSS-GAP-RCP-PATIENT (CC #5).
 *
 * Section READ_ONLY affichée dans /parcours pour informer le patient des
 * réunions de concertation pluridisciplinaire qui ont eu lieu pour son cas.
 *
 * Cadre légal : Art. L.1111-2 CSP — droit du patient à l'information sur les
 * décisions collégiales.
 *
 * Wording strict (CLAUDE.md nami-web — mots interdits) :
 *   - "réunion de concertation" / "concertation pluridisciplinaire" (jamais
 *     "RCP" en sigle isolé côté UI patient — l'acronyme reste cockpit).
 *   - "votre équipe soignante s'est concertée" (jamais "alerte / surveillance
 *     / signalement / monitoring").
 *   - "décision communiquée par votre soignant" (jamais "recommandation
 *     clinique" ou "prescription").
 *   - Pas d'identité de participant — uniquement "X soignants ont participé".
 *
 * UX :
 *   - 0 RCP : section masquée (pas de bruit visuel sur l'évidence du parcours).
 *   - 1 ou + : liste verticale, plus récente en tête, format card violet
 *     (palette Nami #5B4EC4 doux).
 *   - Aucun CTA, aucune action — purement informationnel (READ_ONLY).
 */

interface PatientRcpHistoryProps {
  careCaseId: string;
}

const SECTION_LABEL = "Réunions de concertation pluridisciplinaire";

const DECISION_TYPE_LABEL: Record<string, string> = {
  CONSENSUS: "Décision collégiale",
  MAJORITY: "Décision majoritaire",
  INITIATOR_DECISION: "Décision du soignant référent",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatParticipants(count: number): string {
  if (count <= 0) return "Votre équipe soignante";
  if (count === 1) return "1 soignant a participé";
  return `${count} soignants ont participé`;
}

export function PatientRcpHistory({ careCaseId }: PatientRcpHistoryProps) {
  const { data, isLoading, error } = usePatientRcps(careCaseId);

  // Loading : skeleton léger (pas de spinner intrusif sur une section
  // secondaire). On garde le titre pour ancrer la place.
  if (isLoading) {
    return (
      <section
        aria-label={SECTION_LABEL}
        style={{
          marginTop: 32,
          padding: 20,
          background: "#FFFFFF",
          border: "1px solid rgba(26,26,46,0.06)",
          borderRadius: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 15,
            fontWeight: 600,
            color: "#1A1A2E",
          }}
        >
          {SECTION_LABEL}
        </h2>
        <p
          role="status"
          aria-live="polite"
          style={{ margin: 0, fontSize: 13, color: "#6B7280" }}
        >
          Chargement…
        </p>
      </section>
    );
  }

  // Erreur : message neutre, jamais alarmant (pas de "erreur réseau" — le
  // patient n'a rien à débugger).
  if (error) {
    return (
      <section
        aria-label={SECTION_LABEL}
        style={{
          marginTop: 32,
          padding: 20,
          background: "#FFFFFF",
          border: "1px solid rgba(26,26,46,0.06)",
          borderRadius: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 15,
            fontWeight: 600,
            color: "#1A1A2E",
          }}
        >
          {SECTION_LABEL}
        </h2>
        <p
          role="alert"
          style={{ margin: 0, fontSize: 13, color: "#6B7280" }}
        >
          Cette section sera de nouveau disponible plus tard.
        </p>
      </section>
    );
  }

  const items: PatientRcpSummary[] = data?.items ?? [];

  // 0 RCP : on masque complètement la section pour ne pas charger l'UI
  // d'un patient qui n'a jamais eu de concertation (cas dominant en V1).
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={SECTION_LABEL}
      style={{
        marginTop: 32,
        padding: 20,
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 12,
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            marginBottom: 4,
            fontSize: 15,
            fontWeight: 600,
            color: "#1A1A2E",
          }}
        >
          {SECTION_LABEL}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#6B7280",
            lineHeight: 1.5,
          }}
        >
          Votre équipe soignante s&apos;est concertée pour organiser votre
          suivi. Vous trouverez ici la décision communiquée par votre soignant
          référent.
        </p>
      </header>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.map((rcp) => {
          const decisionLabel = rcp.decisionType
            ? DECISION_TYPE_LABEL[rcp.decisionType] ?? "Décision communiquée"
            : "Décision communiquée";
          return (
            <li
              key={rcp.id}
              data-testid="patient-rcp-item"
              style={{
                padding: 16,
                background: "rgba(91,78,196,0.04)",
                border: "1px solid rgba(91,78,196,0.16)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5B4EC4",
                  }}
                >
                  {formatDate(rcp.closedAt)}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#6B7280",
                  }}
                >
                  <Users size={14} aria-hidden="true" />
                  {formatParticipants(rcp.participantsCount)}
                </span>
              </div>
              <p
                data-testid="patient-rcp-decision-label"
                style={{
                  margin: 0,
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#5B4EC4",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {decisionLabel}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {rcp.decision}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Footer MDR : rappel que ce contenu est non-clinique */}
      <p
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#9CA3AF",
          lineHeight: 1.5,
        }}
      >
        Ces informations vous sont communiquées à titre informationnel. Pour
        toute question, contactez votre soignant référent.
      </p>
    </section>
  );
}
