import { ChevronRight, Search } from "lucide-react"

const ROWS = [
  {
    initials: "GM", name: "Gabrielle M.", age: 16,
    condition: "Anorexie mentale",
    badge: "TCA", badgeColor: "#5B4EC4", badgeBg: "rgba(91,78,196,0.10)",
    phase: "Phase 2 — Stabilisation",
    tags: [
      { label: "Poids ↑ 45,6 kg", ok: true },
      { label: "K+ 3,8", ok: true },
      { label: "PHQ-9 11", ok: false },
    ],
  },
  {
    initials: "MD", name: "Marc D.", age: 52,
    condition: "Obésité complexe — PCR",
    badge: "PCR Obésité", badgeColor: "#2BA89C", badgeBg: "rgba(43,168,156,0.10)",
    phase: "Phase 1 — Évaluation",
    tags: [
      { label: "IMC ↓ 34,2", ok: true },
      { label: "HbA1c 6,8%", ok: false },
      { label: "LDL 1,4", ok: true },
    ],
  },
  {
    initials: "LR", name: "Léo R.", age: 8,
    condition: "Épilepsie pédiatrique",
    badge: "Pédiatrie", badgeColor: "#2563EB", badgeBg: "rgba(37,99,235,0.10)",
    phase: "Phase 2 — Ajustement",
    tags: [
      { label: "Crises ↓ 2/sem", ok: false },
      { label: "Cognitif stable", ok: true },
      { label: "Scolarité adaptée", ok: true },
    ],
  },
]

export function PitchMockup() {
  return (
    <div style={{
      width: "100%", maxWidth: 560,
      borderRadius: 16,
      boxShadow: "0 24px 64px rgba(26,26,46,0.20), 0 4px 12px rgba(26,26,46,0.08)",
      overflow: "hidden", background: "#fff",
      border: "1px solid rgba(26,26,46,0.08)",
      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    }}>
      {/* Browser bar */}
      <div style={{ background: "#F1F3F5", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF6058","#FFBC2E","#29CA41"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.75)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#8A8A96", textAlign: "center" }}>
          app.namipourlavie.com/aujourd-hui
        </div>
      </div>

      {/* App nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(26,26,46,0.06)", padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#5B4EC4,#2BA89C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>N</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E" }}>Nami</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Patients","Agenda","Messages"].map(l => (
            <span key={l} style={{ fontSize: 11, color: "#8A8A96" }}>{l}</span>
          ))}
        </div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(91,78,196,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#5B4EC4" }}>MV</span>
        </div>
      </div>

      {/* Dashboard sub-header */}
      <div style={{ background: "#FAFAF8", borderBottom: "1px solid rgba(26,26,46,0.04)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E" }}>Bonjour, Margot</div>
          <div style={{ fontSize: 11, color: "#8A8A96", marginTop: 1 }}>3 dossiers actifs · Aujourd&apos;hui</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 8, padding: "5px 10px", border: "1px solid rgba(26,26,46,0.08)" }}>
          <Search size={11} color="#8A8A96" />
          <span style={{ fontSize: 11, color: "#8A8A96" }}>Rechercher…</span>
        </div>
      </div>

      {/* Patient rows */}
      {ROWS.map((row, i) => (
        <div key={row.initials} style={{
          padding: "11px 16px",
          borderBottom: i < ROWS.length - 1 ? "1px solid rgba(26,26,46,0.05)" : "none",
          background: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: row.badgeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: row.badgeColor }}>{row.initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E" }}>{row.name} · {row.age} ans</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: row.badgeColor, background: row.badgeBg, padding: "1px 6px", borderRadius: 4 }}>{row.badge}</span>
              </div>
              <div style={{ fontSize: 11, color: "#8A8A96", marginTop: 1 }}>{row.condition}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                {row.tags.map(t => (
                  <span key={t.label} style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 500,
                    background: t.ok ? "#F0FDF4" : "#FFFBEB",
                    color: t.ok ? "#059669" : "#D97706",
                  }}>{t.label}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: "#5B4EC4", fontWeight: 500, whiteSpace: "nowrap" }}>{row.phase}</span>
              <ChevronRight size={13} color="#CBD5E1" />
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ background: "#FAFAF8", borderTop: "1px solid rgba(26,26,46,0.04)", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#8A8A96" }}>Conforme RGPD · Art. L.1110-12 CSP</span>
        <span style={{ fontSize: 10, color: "rgba(91,78,196,0.5)" }}>nami</span>
      </div>
    </div>
  )
}
