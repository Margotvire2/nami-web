"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Stethoscope,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import type { AppointmentRequest } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const STATUS_CFG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  PENDING: {
    label: "En attente",
    icon: Hourglass,
    color: "#92400E",
    bg: "rgba(251,191,36,0.12)",
  },
  ACCEPTED: {
    label: "Acceptée",
    icon: CheckCircle2,
    color: "#065F46",
    bg: "rgba(16,185,129,0.12)",
  },
  DECLINED: {
    label: "Refusée",
    icon: XCircle,
    color: "#991B1B",
    bg: "rgba(220,38,38,0.08)",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LocationIcon({ type }: { type: string | null }) {
  if (type === "VIDEO") return <Video size={14} aria-hidden="true" />;
  if (type === "PHONE") return <Phone size={14} aria-hidden="true" />;
  return <MapPin size={14} aria-hidden="true" />;
}

function locationLabel(type: string | null): string {
  if (type === "VIDEO") return "Téléconsultation";
  if (type === "PHONE") return "Téléphone";
  if (type === "IN_PERSON") return "Présentiel";
  return "À préciser";
}

export default function MesDemandesPage() {
  const token = useAuthStore((s) => s.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["patient-appointment-requests"],
    queryFn: async (): Promise<AppointmentRequest[]> => {
      if (!token) return [];
      try {
        const res = await fetch(`${API_URL}/patient/appointment-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Graceful : endpoint pas encore créé backend → empty state, pas de crash
        if (!res.ok) return [];
        return (await res.json()) as AppointmentRequest[];
      } catch {
        return [];
      }
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const items = data ?? [];

  return (
    <main
      style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 96px" }}
      aria-label="Mes demandes de rendez-vous"
    >
      <Link
        href="/rendez-vous"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          color: "#6B7280",
          textDecoration: "none",
          marginBottom: 24,
        }}
        className="hover:text-[#1A1A2E]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Retour à mes rendez-vous
      </Link>

      <header style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#1A1A2E",
            letterSpacing: "-0.04em",
            fontFamily: "var(--font-jakarta)",
            margin: "0 0 6px 0",
          }}
        >
          Mes demandes de rendez-vous
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          Suivez l&apos;état de vos demandes envoyées à vos soignants.
        </p>
      </header>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "#5B4EC4" }}
            aria-label="Chargement des demandes"
          />
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "rgba(91,78,196,0.04)",
            border: "1px solid rgba(91,78,196,0.12)",
            borderRadius: 16,
          }}
          role="status"
        >
          <Calendar
            size={32}
            style={{
              color: "#6B7280",
              opacity: 0.4,
              margin: "0 auto 12px",
              display: "block",
            }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1A1A2E",
              margin: "0 0 6px 0",
            }}
          >
            Aucune demande en cours
          </p>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px 0" }}>
            Quand vous demandez un rendez-vous à un soignant, vous le
            retrouverez ici.
          </p>
          <Link
            href="/trouver-un-soignant"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              background: "#5B4EC4",
              color: "#fff",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            }}
          >
            Trouver un soignant
          </Link>
        </div>
      ) : (
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
          aria-label="Liste des demandes"
        >
          {items.map((req) => {
            const cfg = STATUS_CFG[req.status] ?? STATUS_CFG.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <li
                key={req.id}
                style={{
                  padding: 20,
                  background: "#fff",
                  border: "1px solid rgba(26,26,46,0.06)",
                  borderRadius: 16,
                  boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Stethoscope
                      size={18}
                      style={{ color: "#5B4EC4", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#1A1A2E",
                          margin: "0 0 2px 0",
                        }}
                      >
                        Demande de rendez-vous
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          margin: 0,
                        }}
                      >
                        Envoyée le {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 100,
                      background: cfg.bg,
                      color: cfg.color,
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <StatusIcon size={12} aria-hidden="true" />
                    {cfg.label}
                  </span>
                </div>

                {req.requestedDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    <Clock
                      size={14}
                      style={{ color: "#5B4EC4" }}
                      aria-hidden="true"
                    />
                    Créneau demandé : {formatDateTime(req.requestedDate)}
                  </div>
                )}

                {req.locationType && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "#5B4EC4" }}>
                      <LocationIcon type={req.locationType} />
                    </span>
                    {locationLabel(req.locationType)}
                  </div>
                )}

                {req.motif && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginTop: 8,
                      padding: "8px 12px",
                      background: "rgba(91,78,196,0.04)",
                      borderRadius: 8,
                      fontStyle: "italic",
                      margin: "8px 0 0 0",
                    }}
                  >
                    « {req.motif} »
                  </p>
                )}

                {req.status === "PENDING" && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#92400E",
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      margin: "12px 0 0 0",
                    }}
                  >
                    <AlertCircle size={12} aria-hidden="true" />
                    Vous recevrez une notification dès que le soignant aura
                    répondu.
                  </p>
                )}

                {req.status === "DECLINED" && req.declineReason && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#991B1B",
                      marginTop: 12,
                      padding: "8px 12px",
                      background: "rgba(220,38,38,0.04)",
                      borderRadius: 8,
                      margin: "12px 0 0 0",
                    }}
                  >
                    Motif du refus : {req.declineReason}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
