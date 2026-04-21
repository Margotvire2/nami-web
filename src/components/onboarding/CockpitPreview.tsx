"use client"

import { LayoutDashboard, CalendarDays, Users, ArrowLeftRight, FileText, CheckCircle2 } from "lucide-react"

interface Props {
  firstName: string
  lastName: string
  professionLabel: string
  patientFirstName: string
  patientLastName: string
  step: number
  confirmed?: boolean
}

const NAV = [
  { icon: LayoutDashboard, label: "Aujourd'hui", active: true },
  { icon: CalendarDays, label: "Agenda", active: false },
  { icon: Users, label: "Patients", active: false },
  { icon: ArrowLeftRight, label: "Adressages", active: false },
  { icon: FileText, label: "Documents", active: false },
]

export function CockpitPreview({ firstName, lastName, professionLabel, patientFirstName, patientLastName, step, confirmed }: Props) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?"
  const displayName = lastName ? `${firstName?.[0] ?? ""}. ${lastName}` : firstName || "Vous"
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Vous"

  const hasPatient = patientFirstName.trim().length > 0

  return (
    <div style={{
      width: "100%",
      maxWidth: 460,
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 24px 80px rgba(26,26,46,0.14), 0 4px 16px rgba(26,26,46,0.06)",
      border: "1px solid rgba(26,26,46,0.08)",
      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    }}>

      {/* Browser chrome */}
      <div style={{ background: "#F8F9FA", borderBottom: "1px solid #E8ECF4", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: "#ECEEF2", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#94A3B8", textAlign: "center" }}>
          nami · aujourd-hui
        </div>
      </div>

      {/* App layout */}
      <div style={{ display: "flex", height: 360 }}>

        {/* Sidebar */}
        <div style={{ width: 160, background: "#FFFFFF", borderRight: "1px solid #F1F5F9", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid #F8FAFC" }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg, #5B4EC4, #2BA89C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>N</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>Nami</span>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(({ icon: Icon, label, active }) => (
              <div key={label} style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 8px",
                borderRadius: 7,
                background: active ? "rgba(91,78,196,0.08)" : "transparent",
                borderLeft: active ? "2.5px solid #5B4EC4" : "2.5px solid transparent",
                paddingLeft: active ? "5.5px" : "8px",
              }}>
                <Icon size={11} color={active ? "#5B4EC4" : "#94A3B8"} strokeWidth={1.75} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "#5B4EC4" : "#94A3B8" }}>{label}</span>
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding: "8px 10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 8, fontWeight: 800 }}>{initials}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                {professionLabel && (
                  <div style={{ fontSize: 8, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{professionLabel}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, background: "#FAFAF8", padding: 16, overflowY: "auto" }}>

          {confirmed ? (
            /* Confirmed state */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(5,150,105,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={28} color="#059669" />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>Votre espace est prêt !</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>Bienvenue sur Nami, {firstName}.</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Bonjour {firstName || "…"} 💙
                </div>
                {professionLabel && (
                  <div style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>{professionLabel}</div>
                )}
              </div>

              {/* Patient card — fades in at step 2+ */}
              {hasPatient && step >= 2 && (
                <div style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 10,
                  boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
                  border: "1px solid #E8ECF4",
                  animation: "nami-card-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(91,78,196,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#5B4EC4" }}>
                        {patientFirstName?.[0]?.toUpperCase()}{patientLastName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#1A1A2E" }}>
                        {patientFirstName} {patientLastName}
                      </div>
                      <div style={{ fontSize: 9, color: "#94A3B8" }}>Dossier de coordination</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder cards */}
              {[...Array(step >= 2 && hasPatient ? 2 : 3)].map((_, i) => (
                <div key={i} style={{
                  height: i === 0 ? 52 : 36,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid #E8ECF4",
                  marginBottom: 6,
                  opacity: 0.5,
                }} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
