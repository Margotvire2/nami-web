"use client"

import { useState } from "react"
import { Check } from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 220, H = 52, PAD = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }))
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
  const fill = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`
  const last = pts[pts.length - 1]
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ display: "block" }}>
      <path d={fill} fill={color} fillOpacity={0.08} />
      <path d={line} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={6} fill={color} fillOpacity={0.15} />
      <circle cx={last.x} cy={last.y} r={3.5} fill={color} />
    </svg>
  )
}

function PhaseTimeline({ current, phases }: { current: 1 | 2 | 3; phases: [string, string, string] }) {
  const C = { active: "#5B4EC4", done: "#059669", inactive: "#E8ECF4" }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {([1, 2, 3] as const).map((n, i) => (
        <div key={n} style={{ display: "flex", alignItems: "center" }}>
          {i > 0 && (
            <div style={{ width: 28, height: 2, background: n <= current ? C.active : C.inactive }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: n < current ? C.done : n === current ? C.active : "transparent",
              border: `2px solid ${n < current ? C.done : n === current ? C.active : C.inactive}`,
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
            }}>
              {n < current && <Check size={11} color="#fff" />}
              {n === current && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
            </div>
            <span style={{ fontSize: 9, color: n <= current ? "#4A4A5A" : "#8A8A96", whiteSpace: "nowrap", fontWeight: n === current ? 600 : 400 }}>
              {phases[n - 1]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PATIENTS = [
  {
    id: "gabrielle",
    tabLabel: "Anorexie — Gabrielle",
    name: "Gabrielle M.", age: 16,
    condition: "Anorexie mentale",
    badge: "TCA", badgeColor: "#5B4EC4", badgeBg: "rgba(91,78,196,0.10)",
    team: [
      { initials: "Dr L", role: "Psychiatre", color: "#5B4EC4", bg: "rgba(91,78,196,0.10)" },
      { initials: "MV", role: "Diét.", color: "#2BA89C", bg: "rgba(43,168,156,0.10)" },
      { initials: "Dr B", role: "Psy.", color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
      { initials: "Dr R", role: "Médecin", color: "#059669", bg: "rgba(5,150,105,0.10)" },
      { initials: "Dr S", role: "Endocr.", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
    ],
    sparkValues: [42.1, 42.3, 42.0, 42.5, 43.0, 43.4, 43.8, 44.1, 44.5, 44.8, 45.2, 45.6],
    sparkLabel: "Poids (kg) — 12 semaines",
    sparkColor: "#5B4EC4",
    metrics: [
      { key: "K+", value: "3,8 mmol/L", ok: true },
      { key: "Albumine", value: "38 g/L", ok: true },
      { key: "PHQ-9", value: "11 / 27", ok: false },
    ],
    currentPhase: 2 as const,
    phases: ["Évaluation", "Stabilisation", "Consolidation"] as [string, string, string],
  },
  {
    id: "marc",
    tabLabel: "Obésité — Marc",
    name: "Marc D.", age: 52,
    condition: "Obésité complexe — PCR",
    badge: "PCR Obésité", badgeColor: "#2BA89C", badgeBg: "rgba(43,168,156,0.10)",
    team: [
      { initials: "Dr P", role: "Endocr.", color: "#2BA89C", bg: "rgba(43,168,156,0.10)" },
      { initials: "JD", role: "Diét.", color: "#5B4EC4", bg: "rgba(91,78,196,0.10)" },
      { initials: "Dr M", role: "Psy.", color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
      { initials: "PT", role: "APA", color: "#059669", bg: "rgba(5,150,105,0.10)" },
      { initials: "Dr C", role: "Médecin", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
    ],
    sparkValues: [36.8, 36.5, 36.3, 36.0, 35.7, 35.5, 35.2, 35.0],
    sparkLabel: "IMC — 8 semaines",
    sparkColor: "#2BA89C",
    metrics: [
      { key: "HbA1c", value: "6,8 %", ok: false },
      { key: "LDL", value: "1,4 g/L", ok: true },
      { key: "VO2max", value: "22 ml/kg/min", ok: false },
    ],
    currentPhase: 1 as const,
    phases: ["Évaluation initiale", "Traitement", "Maintien"] as [string, string, string],
  },
  {
    id: "leo",
    tabLabel: "Épilepsie — Léo",
    name: "Léo R.", age: 8,
    condition: "Épilepsie pédiatrique",
    badge: "Pédiatrie", badgeColor: "#2563EB", badgeBg: "rgba(37,99,235,0.10)",
    team: [
      { initials: "Dr T", role: "Neuropéd.", color: "#2563EB", bg: "rgba(37,99,235,0.10)" },
      { initials: "Dr F", role: "Neuropsy.", color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
      { initials: "AO", role: "Ortho.", color: "#059669", bg: "rgba(5,150,105,0.10)" },
      { initials: "ER", role: "Ens. réf.", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
      { initials: "Dr G", role: "Médecin", color: "#2BA89C", bg: "rgba(43,168,156,0.10)" },
    ],
    sparkValues: [8, 7, 6, 5, 5, 4, 3, 3, 2, 2],
    sparkLabel: "Crises / semaine — 10 semaines",
    sparkColor: "#2563EB",
    metrics: [
      { key: "Crises/sem", value: "2 / sem", ok: false },
      { key: "Bilan cognitif", value: "Stable", ok: true },
      { key: "Scolarité", value: "Adaptée", ok: true },
    ],
    currentPhase: 2 as const,
    phases: ["Bilan initial", "Ajustement", "Intégration"] as [string, string, string],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function PatientTab() {
  const [active, setActive] = useState(0)
  const p = PATIENTS[active]

  return (
    <div style={{ width: "100%" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {PATIENTS.map((pt, i) => (
          <button key={pt.id} onClick={() => setActive(i)} style={{
            padding: "8px 16px", borderRadius: 100,
            border: `1.5px solid ${active === i ? p.badgeColor : "rgba(26,26,46,0.10)"}`,
            background: active === i ? p.badgeBg : "#fff",
            color: active === i ? p.badgeColor : "#8A8A96",
            fontSize: 13, fontWeight: active === i ? 600 : 400,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {pt.tabLabel}
          </button>
        ))}
      </div>

      {/* Patient card */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid rgba(26,26,46,0.08)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(26,26,46,0.06)",
        transition: "all 0.3s",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(26,26,46,0.06)",
          background: `linear-gradient(135deg, ${p.badgeBg}, rgba(255,255,255,0))`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: p.badgeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: p.badgeColor }}>
              {p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>{p.name} · {p.age} ans</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: p.badgeColor, background: p.badgeBg, padding: "2px 8px", borderRadius: 6 }}>{p.badge}</span>
            </div>
            <div style={{ fontSize: 13, color: "#8A8A96", marginTop: 2 }}>{p.condition}</div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Team */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A8A96", marginBottom: 10 }}>Équipe ({p.team.length} soignants)</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {p.team.map(m => (
                <div key={m.initials} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.initials}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#8A8A96" }}>{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A8A96", marginBottom: 8 }}>
              {p.sparkLabel}
            </div>
            <div style={{ background: "#FAFAF8", borderRadius: 10, padding: "10px 14px" }}>
              <Sparkline values={p.sparkValues} color={p.sparkColor} />
            </div>
          </div>

          {/* Metrics */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A8A96", marginBottom: 10 }}>Indicateurs</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.metrics.map(m => (
                <div key={m.key} style={{
                  padding: "8px 12px", borderRadius: 10,
                  background: m.ok ? "#F0FDF4" : "#FFFBEB",
                  border: `1px solid ${m.ok ? "#BBF7D0" : "#FDE68A"}`,
                }}>
                  <div style={{ fontSize: 10, color: "#8A8A96", marginBottom: 2 }}>{m.key}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.ok ? "#059669" : "#D97706" }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase timeline */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A8A96", marginBottom: 10 }}>Parcours</div>
            <PhaseTimeline current={p.currentPhase} phases={p.phases} />
          </div>
        </div>

        {/* AI disclaimer */}
        <div style={{ borderTop: "1px solid rgba(26,26,46,0.06)", padding: "10px 24px", background: "#FFFBEB", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10 }}>⚠️</span>
          <span style={{ fontSize: 11, color: "#92400E" }}>
            Brouillon IA — à vérifier par le soignant avant intégration au dossier
          </span>
        </div>
      </div>

      {/* Knowledge base footnote */}
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <span style={{ fontSize: 12, color: "#8A8A96" }}>
          22 308 sources cliniques indexées · 425 pathologies · 121 parcours structurés
        </span>
      </div>
    </div>
  )
}
