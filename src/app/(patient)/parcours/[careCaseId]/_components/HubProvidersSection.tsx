"use client";

import Link from "next/link";
import type { PatientAuthorizedProvider } from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";

interface HubProvidersSectionProps {
  providers: PatientAuthorizedProvider[];
  careCaseId: string;
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "Pas encore de rendez-vous";
  try {
    const d = new Date(iso);
    return `Dernier RDV le ${d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  } catch {
    return "";
  }
}

export function HubProvidersSection({
  providers,
  careCaseId,
}: HubProvidersSectionProps) {
  const headingId = "hub-providers-heading";
  const { openEntityHub } = useEntityHubControls();

  return (
    <section
      aria-labelledby={headingId}
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2
          id={headingId}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            margin: 0,
          }}
        >
          Mon équipe soignante
        </h2>
        <Link
          href="/mes-soignants"
          style={{
            fontSize: 12,
            color: "#5B4EC4",
            fontFamily: "var(--font-inter)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Voir tout
        </Link>
      </div>

      {providers.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucun soignant n&apos;est associé à ce parcours pour le moment.
        </p>
      ) : (
        <ul
          role="list"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {providers.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() =>
                  openEntityHub({
                    type: "provider",
                    careCaseId,
                    entityId: p.id,
                  })
                }
                aria-label={`Voir la fiche de ${p.firstName} ${p.lastName}`}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "#FAFAF8",
                  border: "1px solid transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 120ms ease, border-color 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(91,78,196,0.06)";
                  e.currentTarget.style.borderColor = "rgba(91,78,196,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FAFAF8";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(91,78,196,0.12)",
                    color: "#5B4EC4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--font-jakarta)",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1A1A2E",
                      fontFamily: "var(--font-jakarta)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.firstName} {p.lastName}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontFamily: "var(--font-inter)",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    {p.specialty ? <span>{p.specialty}</span> : null}
                    {p.specialty && p.lastAppointmentAt ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                    <span>{formatLastSeen(p.lastAppointmentAt)}</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
