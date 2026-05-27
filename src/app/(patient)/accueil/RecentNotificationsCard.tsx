"use client";

/**
 * RecentNotificationsCard — section /accueil patient (F-PATIENT-ACCUEIL-DASHBOARD-V2-LIVE-DATA).
 *
 * Affiche les 3 dernières notifications non-lues du patient connecté.
 * Source : GET /patient/notifications/feed?section=unread&limit=3 (backend PR #59).
 * Action : clic sur un item → PATCH /patient/notifications/:id/read (PR #61) +
 *          invalidate du feed pour rafraîchir le compteur.
 *
 * Wording MDR-safe : "notifications" = info purement organisationnelle (jamais de signal clinique).
 * Pas de navigation forcée vers une page /notifications (route inexistante côté
 * patient à date — la sidebar marque "Bientôt disponible"). Le clic marque
 * simplement comme lu pour vider la liste.
 *
 * A11y : section aria-labelledby + role=status sur empty + aria-busy loading.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientNotificationFeed } from "@/lib/api";
import { Bell, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

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

export function RecentNotificationsCard() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<PatientNotificationFeed>({
    queryKey: ["patient-notifications-feed", "unread", 3],
    queryFn: () => api.patient.notifications.feed({ section: "unread", limit: 3 }),
    enabled: !!accessToken,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patient.notifications.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-notifications-feed"] });
    },
  });

  const items = data?.items ?? [];
  const headingId = "accueil-notifs-heading";

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
          <Bell size={16} strokeWidth={2} color="var(--nami-primary)" aria-hidden="true" />
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
            Notifications récentes
          </h2>
        </div>
        {data && data.unreadCount > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--nami-primary-light)",
              color: "var(--nami-primary)",
            }}
          >
            {data.unreadCount} non {data.unreadCount > 1 ? "lues" : "lue"}
          </span>
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
          <span className="sr-only">Chargement des notifications…</span>
        </Card>
      ) : items.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "24px 20px" }} role="status">
          <Bell
            size={26}
            color="var(--nami-text-muted)"
            style={{ margin: "0 auto 8px", display: "block" }}
            aria-hidden="true"
          />
          <p style={{ fontSize: 14, color: "var(--nami-text-muted)", margin: 0 }}>
            Aucune notification non lue
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--nami-text-muted)",
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            Tout est à jour. Vous êtes au courant.
          </p>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((notif, i) => (
              <li
                key={notif.id}
                style={{
                  borderBottom:
                    i < items.length - 1 ? "1px solid var(--nami-border)" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => markReadMutation.mutate(notif.id)}
                  disabled={markReadMutation.isPending}
                  aria-label={`Marquer comme lue la notification : ${notif.title}`}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 16px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--nami-primary)",
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--nami-dark)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.title}
                    </div>
                    {notif.body && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--nami-text-muted)",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notif.body}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--nami-text-muted)",
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {format(parseISO(notif.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
