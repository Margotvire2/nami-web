"use client";

import { AlertTriangle, Activity, CheckCircle, Clock, Users, FileText, BarChart2 } from "lucide-react";
import type { StructuredContext } from "@/lib/api";

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#D94F4F",
  HIGH:     "#D97706",
  MEDIUM:   "#5B4EC4",
  LOW:      "#8A8A96",
  INFO:     "#2BA89C",
};

export function StructuredContextFallback({ ctx, fallbackReason }: { ctx: StructuredContext; fallbackReason?: string }) {
  const s = ctx.bloc1_situation;
  const compliance = ctx.bloc2_compliance;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Banner */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: "rgba(217,79,79,0.06)", border: "1px solid rgba(217,79,79,0.15)",
        borderRadius: 12, padding: "12px 16px",
      }}>
        <AlertTriangle size={16} color="#D94F4F" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#D94F4F", margin: 0 }}>Brouillon IA indisponible</p>
          <p style={{ fontSize: 12, color: "#8A8A96", margin: "2px 0 0" }}>
            {fallbackReason ?? "Le service IA est temporairement indisponible."} Les données structurées ci-dessous sont extraites directement du dossier.
          </p>
        </div>
      </div>

      {/* Bloc 1 — Situation */}
      <Section icon={<Activity size={14} color="#5B4EC4" />} title="Situation clinique" accent="#5B4EC4">
        <Row label="Dossier" value={s.caseTitle} />
        <Row label="Type" value={s.caseType} />
        <Row label="Pathway" value={s.pathwayLabel ?? "—"} />
        {s.mainConcern && <Row label="Préoccupation" value={s.mainConcern} />}
        <Row label="Phase" value={s.currentStage ?? "—"} />
        <Row label="Ouvert le" value={s.openedAt} />
        {s.weightKg !== null && (
          <Row
            label="Poids"
            value={`${s.weightKg} kg${s.weightDeltaKg !== null ? ` (Δ${s.weightDeltaKg > 0 ? "+" : ""}${s.weightDeltaKg} kg)` : ""}`}
          />
        )}
        {s.bmi !== null && <Row label="IMC" value={String(s.bmi)} />}
        {s.calorieNeeds && <Row label="Besoins estimés" value={s.calorieNeeds} />}
      </Section>

      {/* Bloc 2 — Conformité */}
      <Section icon={<CheckCircle size={14} color="#2BA89C" />} title={`Conformité — ${compliance.percentage}%`} accent="#2BA89C">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 6, background: "rgba(26,26,46,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${compliance.percentage}%`, height: "100%", background: compliance.percentage >= 70 ? "#2BA89C" : "#D97706", borderRadius: 3, transition: "width 0.6s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#4A4A5A" }}>{compliance.score}/{compliance.total}</span>
        </div>
        {compliance.unmetCriteria.map((c, i) => (
          <div key={i} style={{ fontSize: 12, color: "#D97706", marginBottom: 4 }}>
            ⚠ {c.label}{c.action ? ` — ${c.action}` : ""}
          </div>
        ))}
        {compliance.unmetCriteria.length === 0 && (
          <span style={{ fontSize: 12, color: "#2BA89C" }}>Tous les critères sont remplis.</span>
        )}
      </Section>

      {/* Bloc 3 — Prochaines étapes */}
      {ctx.bloc3_nextSteps.length > 0 && (
        <Section icon={<Clock size={14} color="#7C6FCD" />} title="Prochaines étapes" accent="#7C6FCD">
          {ctx.bloc3_nextSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingBottom: 8, borderBottom: i < ctx.bloc3_nextSteps.length - 1 ? "1px solid rgba(26,26,46,0.06)" : "none" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#2D2B3D", margin: 0 }}>{step.label}</p>
                {step.specialty && <p style={{ fontSize: 11, color: "#8A8A96", margin: "2px 0 0" }}>{step.specialty}{step.phase ? ` · ${step.phase}` : ""}</p>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {step.expectedDate && <p style={{ fontSize: 11, color: "#8A8A96", margin: 0 }}>{step.expectedDate}</p>}
                {step.daysOverdue && step.daysOverdue > 0 && (
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#D94F4F", margin: "2px 0 0" }}>+{step.daysOverdue}j de retard</p>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Bloc 4 — Alertes */}
      {ctx.bloc4_alerts.length > 0 && (
        <Section icon={<AlertTriangle size={14} color="#D94F4F" />} title={`Alertes (${ctx.bloc4_alerts.length})`} accent="#D94F4F">
          {ctx.bloc4_alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_COLOR[a.severity] ?? "#8A8A96", marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#2D2B3D", margin: 0 }}>{a.title}</p>
                {a.description && <p style={{ fontSize: 12, color: "#8A8A96", margin: "2px 0 0" }}>{a.description.slice(0, 120)}</p>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Bloc 5 — Questionnaires */}
      {ctx.bloc5_questionnaires.length > 0 && (
        <Section icon={<BarChart2 size={14} color="#9B6FD4" />} title="Questionnaires" accent="#9B6FD4">
          {ctx.bloc5_questionnaires.map((q, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#4A4A5A" }}>{q.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>{q.value}</span>
                {q.delta !== undefined && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: q.delta > 0 ? "#D94F4F" : "#2BA89C" }}>
                    {q.delta > 0 ? "+" : ""}{q.delta}
                  </span>
                )}
                <span style={{ fontSize: 11, color: "#8A8A96" }}>({q.date})</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Bloc 6 — Équipe */}
      {ctx.bloc6_teamSynthesis.length > 0 && (
        <Section icon={<Users size={14} color="#2BA89C" />} title="Équipe de soins" accent="#2BA89C">
          {ctx.bloc6_teamSynthesis.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.role === "lead" ? "rgba(91,78,196,0.1)" : "rgba(43,168,156,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: m.role === "lead" ? "#5B4EC4" : "#2BA89C" }}>
                  {m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: m.role === "lead" ? 600 : 400, color: "#2D2B3D", margin: 0 }}>{m.name}{m.role === "lead" ? " (lead)" : ""}</p>
                {m.specialties.length > 0 && <p style={{ fontSize: 11, color: "#8A8A96", margin: "1px 0 0" }}>{m.specialties.join(", ")}</p>}
              </div>
            </div>
          ))}
        </Section>
      )}

      <p style={{ fontSize: 11, color: "#8A8A96", margin: 0, textAlign: "center" }}>
        Données extraites directement depuis la base — à valider par le soignant responsable.
      </p>
    </div>
  );
}

function Section({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.06)", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: "#8A8A96", minWidth: 100, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: "#4A4A5A", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
