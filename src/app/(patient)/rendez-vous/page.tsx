"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const C = {
  primary: "#5B4EC4", primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E", textSoft: "#6B7280", border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF", bg: "#FAFAF8",
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Confirmé",   color: "#059669", bg: "#ECFDF5" },
  PENDING:   { label: "En attente", color: "#D97706", bg: "#FFFBEB" },
  CANCELLED: { label: "Annulé",     color: "#DC2626", bg: "#FEF2F2" },
  COMPLETED: { label: "Terminé",    color: "#6B7280", bg: "#F9FAFB" },
  NO_SHOW:   { label: "Absent",     color: "#DC2626", bg: "#FEF2F2" },
};

function ApptCard({ appt }: { appt: PatientAppointment }) {
  const st = STATUS[appt.status] ?? STATUS.CONFIRMED;
  const start = parseISO(appt.startAt);
  const end = parseISO(appt.endAt);
  const dur = Math.round((end.getTime() - start.getTime()) / 60000);

  return (
    <div className="nami-patient-card" style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Date + statut */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
            {format(start, "EEEE d MMMM", { locale: fr })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: C.textSoft, fontSize: 13 }}>
            <Clock size={13} strokeWidth={2} />
            {format(start, "HH:mm")} → {format(end, "HH:mm")} ({dur} min)
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
          {st.label}
        </span>
      </div>

      {/* Soignant + type */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
          {appt.provider.person.firstName} {appt.provider.person.lastName}
        </div>
        {appt.consultationType && (
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 2 }}>{appt.consultationType.name}</div>
        )}
      </div>

      {/* Lieu */}
      {appt.location && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textSoft }}>
          <MapPin size={13} strokeWidth={2} />
          {appt.location.name}{appt.location.city ? `, ${appt.location.city}` : ""}
          {appt.location.address ? ` · ${appt.location.address}` : ""}
        </div>
      )}

      {/* Notes */}
      {appt.notes && (
        <div style={{ fontSize: 13, color: C.textSoft, fontStyle: "italic", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
          {appt.notes}
        </div>
      )}
    </div>
  );
}

export default function RendezVousPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = apiWithToken(accessToken!);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data: upcoming, isLoading: loadingUp } = useQuery<PatientAppointment[]>({
    queryKey: ["patient-appts-upcoming"],
    queryFn: () => api.patient.appointments("upcoming"),
    enabled: !!accessToken,
  });

  const { data: past, isLoading: loadingPast } = useQuery<PatientAppointment[]>({
    queryKey: ["patient-appts-past"],
    queryFn: () => api.patient.appointments("past"),
    enabled: !!accessToken,
  });

  const items = tab === "upcoming" ? (upcoming ?? []) : (past ?? []);
  const loading = tab === "upcoming" ? loadingUp : loadingPast;

  return (
    <div style={{ padding: "28px 24px 80px", maxWidth: 720, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20, letterSpacing: "-0.4px" }}>
        Mes rendez-vous
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(91,78,196,0.07)", borderRadius: 10, padding: 3, marginBottom: 20 }}>
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
            fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: "pointer",
            background: tab === t ? C.primary : "transparent",
            color: tab === t ? "#fff" : C.textSoft, fontFamily: "inherit",
          }}>
            {t === "upcoming" ? "À venir" : "Passés"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={22} className="animate-spin" style={{ color: C.primary }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <Calendar size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 14, color: C.textSoft }}>
            {tab === "upcoming" ? "Aucun rendez-vous à venir" : "Aucun rendez-vous passé"}
          </p>
          {tab === "upcoming" && (
            <p style={{ fontSize: 12, color: C.textSoft, opacity: 0.7, marginTop: 6 }}>
              Contactez votre soignant pour planifier un rendez-vous.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((appt, idx) => (
            <ScrollReveal key={appt.id} variant="fade-up" delay={idx * 0.06} duration={0.5}>
              <ApptCard appt={appt} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
