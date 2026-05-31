"use client";

/**
 * RecentMessagesCard — section /accueil patient.
 *
 * Affiche les 3 threads (channels CARECASE OU DM 1:1) les plus récents — tri
 * par lastMessage.createdAt desc. Source : usePatientMessageThreads() (backend
 * PR #94 : GET /patient/messages/threads).
 *
 * Migration V1-MIGRATE-RECENTMESSAGESCARD-PR94 : retire l'appel legacy
 * api.patient.messages(careCaseId) (couplage premier CareCase uniquement) et
 * unifie sur la nouvelle API thread-aware (multi-CareCase + DMs).
 *
 * Wording MDR-safe : "messagerie de coordination" — vocabulaire organisationnel.
 * A11y : section aria-labelledby + role=status empty + aria-busy.
 *
 * Bannière urgence vitale rendue globalement dans /(patient)/mes-messages — pas
 * répétée ici pour ne pas dramatiser le tableau de bord.
 */

import { usePatientMessageThreads } from "@/hooks/usePatientMessageThreads";
import type { PatientMessageThread } from "@/lib/api";
import { MessageCircle, Loader2, Users, User } from "lucide-react";
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

function sortByLastMessageDesc(a: PatientMessageThread, b: PatientMessageThread): number {
  const ta = a.lastMessage?.createdAt ?? "";
  const tb = b.lastMessage?.createdAt ?? "";
  if (ta === tb) return 0;
  return ta < tb ? 1 : -1;
}

export function RecentMessagesCard() {
  const { data: threads, isLoading } = usePatientMessageThreads();

  const recent = (threads ?? [])
    .slice()
    .sort(sortByLastMessageDesc)
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
        {recent.length > 0 && (
          <Link
            href="/mes-messages"
            style={{
              fontSize: 13,
              color: "var(--nami-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Voir tous mes messages →
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
      ) : recent.length === 0 ? (
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
              {recent.map((t, i) => {
                const ThreadIcon = t.threadType === "CARECASE" ? Users : User;
                const iconLabel =
                  t.threadType === "CARECASE" ? "Équipe de coordination" : "Échange direct";
                return (
                  <li
                    key={`${t.threadType}-${t.threadId}`}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom:
                        i < recent.length - 1 ? "1px solid var(--nami-border)" : "none",
                    }}
                  >
                    <div
                      aria-label={iconLabel}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--nami-primary-light)",
                        color: "var(--nami-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ThreadIcon size={18} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--nami-dark)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.title}
                        </div>
                        {t.unreadCount > 0 && (
                          <span
                            aria-label={`${t.unreadCount} message${t.unreadCount > 1 ? "s" : ""} non lu${t.unreadCount > 1 ? "s" : ""}`}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "var(--nami-primary)",
                              color: "#fff",
                              flexShrink: 0,
                              minWidth: 22,
                              textAlign: "center",
                            }}
                          >
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                      {t.lastMessage ? (
                        <>
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
                            {t.lastMessage.body}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--nami-text-muted)",
                              opacity: 0.7,
                              marginTop: 4,
                            }}
                          >
                            {format(parseISO(t.lastMessage.createdAt), "d MMM 'à' HH:mm", {
                              locale: fr,
                            })}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--nami-text-muted)",
                            opacity: 0.7,
                            marginTop: 2,
                            fontStyle: "italic",
                          }}
                        >
                          Aucun message pour le moment.
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Link>
      )}
    </section>
  );
}
