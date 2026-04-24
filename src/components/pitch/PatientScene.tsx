"use client"

import { Check } from "lucide-react"
import { AnimatedSVGCurve } from "./AnimatedSVGCurve"

// ── Data ──────────────────────────────────────────────────────────────────────

const SCENES = [
  {
    name: "Gabrielle M.", age: 16,
    condition: "Anorexie mentale",
    badge: "TCA", badgeColor: "#5B4EC4", badgeBg: "rgba(91,78,196,0.10)",
    team: [
      { initials: "Dr L", role: "Psychiatre", color: "#5B4EC4", bg: "rgba(91,78,196,0.10)" },
      { initials: "MV",   role: "Diét.",     color: "#2BA89C", bg: "rgba(43,168,156,0.10)" },
      { initials: "Dr B", role: "Psy.",      color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
      { initials: "Dr R", role: "Médecin",   color: "#059669", bg: "rgba(5,150,105,0.10)" },
      { initials: "Dr S", role: "Endocr.",   color: "#D97706", bg: "rgba(217,119,6,0.10)" },
    ],
    sparkValues: [42.1, 42.3, 42.0, 42.5, 43.0, 43.4, 43.8, 44.1, 44.5, 44.8, 45.2, 45.6],
    sparkLabel: "Poids (kg) — 12 semaines",
    sparkColor: "#5B4EC4",
    metrics: [
      { key: "K+", value: "3,8 mmol/L", ok: true },
      { key: "Albumine", value: "38 g/L", ok: true },
      { key: "PHQ-9", value: "11 / 27", ok: false },
    ],
    currentPhase: 2,
    phases: ["Évaluation", "Stabilisation", "Consolidation"],
  },
  {
    name: "Marc D.", age: 52,
    condition: "Obésité complexe — PCR",
    badge: "PCR Obésité", badgeColor: "#2BA89C", badgeBg: "rgba(43,168,156,0.10)",
    team: [
      { initials: "Dr P", role: "Endocr.", color: "#2BA89C", bg: "rgba(43,168,156,0.10)" },
      { initials: "JD",   role: "Diét.",  color: "#5B4EC4", bg: "rgba(91,78,196,0.10)" },
      { initials: "Dr M", role: "Psy.",   color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
      { initials: "PT",   role: "APA",    color: "#059669", bg: "rgba(5,150,105,0.10)" },
      { initials: "Dr C", role: "Médecin",color: "#D97706", bg: "rgba(217,119,6,0.10)" },
    ],
    sparkValues: [36.8, 36.5, 36.3, 36.0, 35.7, 35.5, 35.2, 35.0],
    sparkLabel: "IMC — 8 semaines",
    sparkColor: "#2BA89C",
    metrics: [
      { key: "HbA1c",  value: "6,8 %",         ok: false },
      { key: "LDL",    value: "1,4 g/L",        ok: true },
      { key: "VO2max", value: "22 ml/kg/min",   ok: false },
    ],
    currentPhase: 1,
    phases: ["Évaluation", "Traitement", "Maintien"],
  },
  {
    name: "Léo R.", age: 8,
    condition: "Épilepsie pédiatrique",
    badge: "Pédiatrie", badgeColor: "#2563EB", badgeBg: "rgba(37,99,235,0.10)",
    team: [
      { initials: "Dr T", role: "Neuropéd.", color: "#2563EB", bg: "rgba(37,99,235,0.10)" },
      { initials: "Dr F", role: "Neuropsy.", color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
      { initials: "AO",   role: "Ortho.",    color: "#059669", bg: "rgba(5,150,105,0.10)" },
      { initials: "ER",   role: "Ens. réf.", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
      { initials: "Dr G", role: "Médecin",   color: "#2BA89C", bg: "rgba(43,168,156,0.10)" },
    ],
    sparkValues: [8, 7, 6, 5, 5, 4, 3, 3, 2, 2],
    sparkLabel: "Crises / semaine — 10 semaines",
    sparkColor: "#2563EB",
    metrics: [
      { key: "Crises/sem",   value: "2 / sem",  ok: false },
      { key: "Cognitif",     value: "Stable",   ok: true },
      { key: "Scolarité",    value: "Adaptée",  ok: true },
    ],
    currentPhase: 2,
    phases: ["Bilan initial", "Ajustement", "Intégration"],
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function PhaseTimeline({
  current,
  phases,
  color,
}: {
  current: number
  phases: string[]
  color: string
}) {
  const C = { active: color, done: "#059669", inactive: "rgba(26,26,46,0.12)" }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {phases.map((phase, i) => (
        <div key={phase} style={{ display: "flex", alignItems: "center" }}>
          {i > 0 && (
            <div style={{ width: 32, height: 2, background: i < current ? C.done : i === current ? C.active : C.inactive, transition: "background 0.4s ease" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: i < current ? C.done : i + 1 === current ? C.active : "transparent",
              border: `2px solid ${i < current ? C.done : i + 1 === current ? C.active : C.inactive}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s ease",
            }}>
              {i < current && <Check size={11} color="#fff" />}
              {i + 1 === current && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
            </div>
            <span style={{
              fontSize: 9, color: i + 1 <= current ? "#374151" : "#6B7280",
              whiteSpace: "nowrap", fontWeight: i + 1 === current ? 700 : 400,
            }}>
              {phase}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────────

export function PatientScene({
  sceneIndex,
  isActive,
}: {
  sceneIndex: 0 | 1 | 2
  isActive: boolean
}) {
  const p = SCENES[sceneIndex]

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: "1px solid rgba(26,26,46,0.08)",
      overflow: "hidden",
      boxShadow: "0 4px 32px rgba(26,26,46,0.08)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(26,26,46,0.06)",
        background: `linear-gradient(135deg, ${p.badgeBg}, transparent)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: p.badgeBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: p.badgeColor }}>
            {p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>
              {p.name} · {p.age} ans
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: p.badgeColor,
              background: p.badgeBg, padding: "2px 8px", borderRadius: 6,
            }}>
              {p.badge}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{p.condition}</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto" }}>
        {/* Team */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 8 }}>
            Équipe ({p.team.length} soignants)
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {p.team.map(m => (
              <div key={m.initials} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: m.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.initials}</span>
                </div>
                <span style={{ fontSize: 9, color: "#6B7280" }}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sparkline */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 6 }}>
            {p.sparkLabel}
          </div>
          <div style={{ background: "#FAFAF8", borderRadius: 10, padding: "10px 12px" }}>
            <AnimatedSVGCurve
              values={p.sparkValues}
              color={p.sparkColor}
              height={56}
              isActive={isActive}
            />
          </div>
        </div>

        {/* Metrics */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 8 }}>
            Indicateurs
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.metrics.map(m => (
              <div key={m.key} style={{
                padding: "8px 12px", borderRadius: 10,
                background: m.ok ? "#F0FDF4" : "#FFFBEB",
                border: `1px solid ${m.ok ? "#BBF7D0" : "#FDE68A"}`,
              }}>
                <div style={{ fontSize: 9, color: "#6B7280", marginBottom: 2 }}>{m.key}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.ok ? "#059669" : "#D97706" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 8 }}>
            Parcours
          </div>
          <PhaseTimeline current={p.currentPhase} phases={p.phases} color={p.badgeColor} />
        </div>
      </div>

      {/* AI disclaimer */}
      <div style={{
        borderTop: "1px solid rgba(26,26,46,0.06)",
        padding: "8px 20px",
        background: "#FFFBEB",
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10 }}>⚠️</span>
        <span style={{ fontSize: 10, color: "#92400E" }}>Brouillon IA — à vérifier par le soignant avant intégration</span>
      </div>
    </div>
  )
}
