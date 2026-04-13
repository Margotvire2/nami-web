"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment, type PatientDocument } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, FileText, Users, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const C = {
  primary: "#0F766E", primaryLight: "#CCFBF1", primaryMid: "#14B8A6",
  text: "#1C2B2A", textSoft: "#6B7280", border: "#E5E7EB",
  card: "#FFFFFF", bg: "#F8FAFB",
};

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#0F766E", "#0369A1", "#7C3AED", "#B45309", "#9D174D"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colors[idx] + "22",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 700, color: colors[idx], flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px 20px", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <Icon size={16} strokeWidth={2} color={C.primary} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
    </div>
  );
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Confirmé", color: "#059669", bg: "#ECFDF5" },
  PENDING:   { label: "En attente", color: "#D97706", bg: "#FFFBEB" },
  CANCELLED: { label: "Annulé", color: "#DC2626", bg: "#FEF2F2" },
  COMPLETED: { label: "Terminé", color: "#6B7280", bg: "#F9FAFB" },
};

export default function AccueilPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const api = apiWithToken(accessToken!);

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: () => api.patient.me(),
    enabled: !!accessToken,
  });

  const { data: upcomingAppts } = useQuery<PatientAppointment[]>({
    queryKey: ["patient-appointments-upcoming"],
    queryFn: () => api.patient.appointments("upcoming"),
    enabled: !!accessToken,
  });

  const { data: docs } = useQuery<PatientDocument[]>({
    queryKey: ["patient-documents"],
    queryFn: () => api.patient.documents(),
    enabled: !!accessToken,
  });

  if (meLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: C.primary }} />
      </div>
    );
  }

  const nextAppt = upcomingAppts?.[0];
  const careCase = me?.careCases?.[0];
  const team = careCase?.members ?? [];
  const recentDocs = docs?.slice(0, 3) ?? [];

  const DOC_TYPE: Record<string, { icon: string; color: string }> = {
    BILAN_BIO: { icon: "🩸", color: "#2563EB" },
    COURRIER: { icon: "✉️", color: "#6B7280" },
    ORDONNANCE: { icon: "💊", color: "#059669" },
    COMPTE_RENDU: { icon: "📋", color: "#D97706" },
  };

  return (
    <div style={{ padding: "28px 24px 80px", maxWidth: 640, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>
          Bonjour {user?.firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: C.textSoft, marginTop: 4 }}>Voici un résumé de votre suivi</p>
      </div>

      {/* Prochain RDV */}
      <div style={{ marginBottom: 20 }}>
        <SectionTitle icon={Calendar} title="Prochain rendez-vous" />
        {nextAppt ? (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                  {format(parseISO(nextAppt.startAt), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                </div>
                <div style={{ fontSize: 14, color: C.textSoft, marginTop: 4 }}>
                  {nextAppt.provider.person.firstName} {nextAppt.provider.person.lastName}
                  {nextAppt.consultationType && ` · ${nextAppt.consultationType.name}`}
                </div>
                {nextAppt.location && (
                  <div style={{ fontSize: 13, color: C.textSoft, marginTop: 2 }}>
                    📍 {nextAppt.location.name}{nextAppt.location.city ? `, ${nextAppt.location.city}` : ""}
                  </div>
                )}
              </div>
              {STATUS_LABEL[nextAppt.status] && (
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                  background: STATUS_LABEL[nextAppt.status].bg,
                  color: STATUS_LABEL[nextAppt.status].color,
                }}>
                  {STATUS_LABEL[nextAppt.status].label}
                </span>
              )}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <Link href="/rendez-vous" style={{
                padding: "8px 16px", borderRadius: 8, background: C.primary, color: "#fff",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>
                Voir le détail
              </Link>
            </div>
          </Card>
        ) : (
          <Card style={{ textAlign: "center", padding: "24px 20px" }}>
            <Calendar size={28} color={C.textSoft} style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: 14, color: C.textSoft }}>Aucun rendez-vous à venir</p>
            <p style={{ fontSize: 12, color: C.textSoft, opacity: 0.7, marginTop: 4 }}>
              Contactez votre soignant pour planifier un rendez-vous.
            </p>
          </Card>
        )}
      </div>

      {/* Équipe soignante */}
      {team.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle icon={Users} title="Mon équipe soignante" />
          <Card style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {team.map((m) => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
                  <Avatar name={`${m.person.firstName} ${m.person.lastName}`} size={44} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.person.firstName}</div>
                    {m.provider?.specialties?.[0] && (
                      <div style={{ fontSize: 10, color: C.textSoft }}>{m.provider.specialties[0]}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Messages */}
      <div style={{ marginBottom: 20 }}>
        <SectionTitle icon={MessageCircle} title="Messages" />
        <Link href="/messages" style={{ textDecoration: "none" }}>
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={18} color={C.primary} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 14, color: C.text }}>Messagerie avec mon équipe</span>
            </div>
            <span style={{ fontSize: 18, color: C.textSoft }}>›</span>
          </Card>
        </Link>
      </div>

      {/* Derniers documents */}
      {recentDocs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} strokeWidth={2} color={C.primary} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>Derniers documents</span>
            </div>
            <Link href="/documents" style={{ fontSize: 13, color: C.primary, textDecoration: "none", fontWeight: 500 }}>Tout voir →</Link>
          </div>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {recentDocs.map((doc, i) => {
              const typeInfo = DOC_TYPE[doc.documentType] ?? { icon: "📄", color: C.textSoft };
              return (
                <div key={doc.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  borderBottom: i < recentDocs.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ fontSize: 20 }}>{typeInfo.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: C.textSoft }}>
                      {format(parseISO(doc.createdAt), "d MMM yyyy", { locale: fr })} · {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
