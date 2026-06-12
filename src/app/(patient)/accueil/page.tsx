"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment, type PatientDocument } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, FileText, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RecentNotificationsCard } from "./RecentNotificationsCard";
import { RecentMessagesCard } from "./RecentMessagesCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { NetworkAwarenessBadge } from "@/components/patient/NetworkAwarenessBadge";
import { AppointmentHeroCard } from "@/components/patient/AppointmentHeroCard";

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
    <div style={{ background: "var(--nami-card)", borderRadius: 20, border: `1px solid var(--nami-border)`, padding: "20px 24px", boxShadow: "0 1px 3px rgba(26,26,46,0.05)", transition: "box-shadow 0.2s ease, transform 0.2s ease", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <Icon size={16} strokeWidth={2} color={"var(--nami-primary)"} />
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--nami-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
    </div>
  );
}

function formatWhenLabel(iso: string): string {
  const d = new Date(iso);
  const datePart = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  }).format(d);
  const cap = (s: string) => s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
  return `${cap(datePart)} à ${timePart.replace(":", "h")}`;
}

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
    queryFn: () => api.patient.appointments.list({ status: "upcoming" }),
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
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
      </div>
    );
  }

  const nextAppt = upcomingAppts?.[0];
  const careCase = me?.careCases?.[0];
  const team = careCase?.members ?? [];
  // Exclure TRANSCRIPTION (alignement gap d'omission cross-espace audit PR #145 + PR #153 entity-hub)
  const recentDocs = docs?.filter((d) => d.documentType !== "TRANSCRIPTION").slice(0, 3) ?? [];

  const DOC_TYPE: Record<string, { icon: string; color: string }> = {
    BILAN_BIO: { icon: "🩸", color: "#2563EB" },
    COURRIER: { icon: "✉️", color: "#6B7280" },
    ORDONNANCE: { icon: "💊", color: "#059669" },
    COMPTE_RENDU: { icon: "📋", color: "#D97706" },
  };

  return (
    <main
      aria-label="Tableau de bord de votre espace patient"
      style={{ padding: "36px 28px 96px", maxWidth: 900, margin: "0 auto" }}
    >
      {/* Header */}
      <ScrollReveal variant="fade-up" delay={0} duration={0.6}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--nami-dark)", letterSpacing: "-0.04em", fontFamily: "var(--font-jakarta)" }}>
            Bonjour {user?.firstName} 💙
          </h1>
          <p style={{ fontSize: 15, color: "var(--nami-text-muted)", marginTop: 6 }}>Votre parcours, au même endroit.</p>
        </div>
      </ScrollReveal>

      {/* Badge structure de coordination (F-STRUCT-Q11) */}
      <ScrollReveal variant="fade-up" delay={0.04} duration={0.6}>
        <NetworkAwarenessBadge organization={careCase?.organization} />
      </ScrollReveal>

      {/* Prochain RDV */}
      <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
      <div style={{ marginBottom: 20 }}>
        {nextAppt ? (
          <AppointmentHeroCard
            whenLabel={formatWhenLabel(nextAppt.startAt)}
            providerName={`${nextAppt.provider.person.firstName} ${nextAppt.provider.person.lastName}`}
            consultationType={nextAppt.consultationType?.name}
            locationLabel={nextAppt.location ? `${nextAppt.location.name}${nextAppt.location.city ? `, ${nextAppt.location.city}` : ""}` : undefined}
            detailHref={`/rendez-vous/${nextAppt.id}`}
          />
        ) : (
          <Card style={{ textAlign: "center", padding: "24px 20px" }}>
            <Calendar size={28} color={"var(--nami-text-muted)"} style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>Aucun rendez-vous à venir</p>
            <p style={{ fontSize: 12, color: "var(--nami-text-muted)", opacity: 0.7, marginTop: 4 }}>
              Contactez votre soignant pour planifier un rendez-vous.
            </p>
          </Card>
        )}
      </div>
      </ScrollReveal>

      {/* Équipe soignante */}
      {team.length > 0 && (
        <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
          <div style={{ marginBottom: 20 }}>
            <SectionTitle icon={Users} title="Mon équipe soignante" />
            <Card style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {team.map((m) => (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
                    <Avatar name={`${m.person.firstName} ${m.person.lastName}`} size={44} />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--nami-dark)" }}>{m.person.firstName}</div>
                      {m.provider?.specialties?.[0] && (
                        <div style={{ fontSize: 10, color: "var(--nami-text-muted)" }}>{m.provider.specialties[0]}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Notifications récentes */}
      <ScrollReveal variant="fade-up" delay={0.20} duration={0.6}>
        <RecentNotificationsCard />
      </ScrollReveal>

      {/* Messages récents — threads CARECASE + DM (PR #94) */}
      <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
        <RecentMessagesCard />
      </ScrollReveal>

      {/* Derniers documents */}
      {recentDocs.length > 0 && (
        <ScrollReveal variant="fade-up" delay={0.32} duration={0.6}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={16} strokeWidth={2} color={"var(--nami-primary)"} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--nami-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Derniers documents</span>
              </div>
              <Link href="/documents" style={{ fontSize: 13, color: "var(--nami-primary)", textDecoration: "none", fontWeight: 500 }}>Tout voir →</Link>
            </div>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recentDocs.map((doc, i) => {
                const typeInfo = DOC_TYPE[doc.documentType] ?? { icon: "📄", color: "var(--nami-text-muted)" };
                return (
                  <div key={doc.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    borderBottom: i < recentDocs.length - 1 ? `1px solid var(--nami-border)` : "none",
                  }}>
                    <span style={{ fontSize: 20 }}>{typeInfo.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--nami-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</div>
                      <div style={{ fontSize: 12, color: "var(--nami-text-muted)" }}>
                        {format(parseISO(doc.createdAt), "d MMM yyyy", { locale: fr })} · {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </ScrollReveal>
      )}

      {/* Accès rapide — routes patient existantes (rendez-vous, mes-soignants, mes-documents, trouver-un-soignant) */}
      <ScrollReveal variant="fade-up" delay={0.40} duration={0.6}>
        <QuickActionsCard />
      </ScrollReveal>
    </main>
  );
}
