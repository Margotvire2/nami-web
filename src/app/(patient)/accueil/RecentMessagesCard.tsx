"use client";

/**
 * RecentMessagesCard — section /accueil patient (F-PATIENT-ACCUEIL-DASHBOARD-V2-LIVE-DATA).
 *
 * Affiche les 3 derniers messages reçus de l'équipe de coordination sur le
 * premier care case du patient. Filtre côté client les messages dont l'auteur
 * est le patient lui-même (pour ne pas lister ses propres envois) et trie par
 * createdAt desc.
 *
 * Source : GET /patient/messages/:careCaseId (existant).
 * Pas d'endpoint dédié /patient/messages/unread → on filtre côté client, sans
 * créer de waterfall (la requête tourne en parallèle des autres useQuery).
 *
 * Wording MDR-safe : "messagerie de coordination" — vocabulaire organisationnel uniquement.
 * A11y : section aria-labelledby + role=status empty + aria-busy.
 *
 * Bannière urgence vitale rendue globalement dans /(patient)/mes-messages — pas
 * répétée ici pour ne pas dramatiser le tableau de bord (la card reste un
 * indicateur organisationnel).
 */

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientMe, type PatientMessage } from "@/lib/api";
import { MessageCircle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

function Card({
  children,
  style,
  role,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  role?: string;
}) {
  return (
    <div
      role={role}
      style={{
        background: "var(--nami-card)",
        borderRadius: 20,
        border: "1px solid var(--nami-border)",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function RecentMessagesCard({ me }: { me: PatientMe | undefined }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = apiWithToken(accessToken!);

  const careCaseId = me?.careCases?.[0]?.id;
  const myPersonId = me?.person?.id;

  const { data: messages, isLoading } = useQuery<PatientMessage[]>({
    queryKey: ["patient-messages", careCaseId],
    queryFn: () => api.patient.messages(careCaseId!),
    enabled: !!accessToken && !!careCaseId,
    staleTime: 30_000,
  });

  // Filtre : messages reçus (pas mes envois), triés desc, top 3.
  // On NE dépend pas du flag `reads` côté frontend — les 3 plus récents
  // reçus de l'équipe constituent un indicateur organisationnel correct.
  const recentReceived = (messages ?? [])
    .filter((m) => m.sender.id !== myPersonId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3);

  const headingId = "accueil-messages-heading";

  return (
    <section aria-labelledby={headingId} aria-busy={isLoading} style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MessageCircle size={16} strokeWidth={2} color="var(--nami-primary)" aria-hidden="true" />
          <h2
            id={headingId}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--nami-dark)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            Messages récents
          </h2>
        </div>
        {recentReceived.length > 0 && (
          <Link
            href="/mes-messages"
            style={{
              fontSize: 13,
              color: "var(--nami-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Tout voir →
          </Link>
        )}
      </div>

      {isLoading ? (
        <Card style={{ textAlign: "center", padding: "20px" }}>
          <Loader2
            size={18}
            className="animate-spin"
            style={{ color: "var(--nami-text-muted)" }}
            aria-hidden="true"
          />
          <span className="sr-only">Chargement des messages…</span>
        </Card>
      ) : recentReceived.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "24px 20px" }} role="status">
          <MessageCircle
            size={26}
            color="var(--nami-text-muted)"
            style={{ margin: "0 auto 8px", display: "block" }}
            aria-hidden="true"
          />
          <p style={{ fontSize: 14, color: "var(--nami-text-muted)", margin: 0 }}>
            Aucun message récent
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--nami-text-muted)",
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            Votre équipe vous écrira ici quand nécessaire.
          </p>
        </Card>
      ) : (
        <Link href="/mes-messages" style={{ textDecoration: "none" }}>
          <Card
            style={{
              padding: 0,
              overflow: "hidden",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {recentReceived.map((msg, i) => (
                <li
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom:
                      i < recentReceived.length - 1
                        ? "1px solid var(--nami-border)"
                        : "none",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--nami-primary-light)",
                      color: "var(--nami-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(msg.sender.firstName?.[0] ?? "") + (msg.sender.lastName?.[0] ?? "")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--nami-dark)",
                      }}
                    >
                      {msg.sender.firstName} {msg.sender.lastName}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--nami-text-muted)",
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {msg.body}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--nami-text-muted)",
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {format(parseISO(msg.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </Link>
      )}
    </section>
  );
}
