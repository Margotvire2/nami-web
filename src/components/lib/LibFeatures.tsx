"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"

const FEATURES = [
  { label: "Agenda & prise de RDV en ligne", tier: "Gratuit", color: "#059669" },
  { label: "Messagerie patients sécurisée", tier: "Gratuit", color: "#059669" },
  { label: "Référencement annuaire 582 000 soignants", tier: "Gratuit", color: "#059669" },
  { label: "Messagerie soignants & téléexpertise", tier: "Gratuit", color: "#059669" },
  { label: "Réseau pluridisciplinaire", tier: "Gratuit", color: "#059669" },
  { label: "Facturation & téléconsultation (0% commission)", tier: "Essentiel · 19€", color: "#2BA89C" },
  { label: "Adressage structuré + app patient", tier: "Coordination · 79€", color: "#5B4EC4" },
  { label: "Synthèses IA sourcées + extraction bio", tier: "Intelligence · 149€", color: "#7C3AED" },
  { label: "Base documentaire 22 308 sources", tier: "Intelligence · 149€", color: "#7C3AED" },
  { label: "Parcours complexes sur mesure + KPIs", tier: "Réseau · 499€", color: "#1A1A2E" },
]

export function LibFeatures() {
  return (
    <section style={{
      background: "#F5F3EF",
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 16 }}>
            TOUT CE QUE NAMI FAIT POUR VOUS
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1A1A2E",
            lineHeight: 1.1,
            margin: "0 0 14px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Tout ce que Doctolib<br />facture 149€, Nami l&apos;offre.
          </h2>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
            Agenda, messagerie, réseau, référencement — gratuit. L&apos;IA, l&apos;adressage structuré et la base documentaire arrivent quand vous en avez besoin.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "14px 18px",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid rgba(26,26,46,0.06)",
                  opacity: 0,
                  animation: `fadeInRow 0.4s cubic-bezier(0.16,1,0.3,1) ${100 + i * 50}ms forwards`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: f.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 500 }}>{f.label}</span>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: f.color,
                  background: `${f.color}14`,
                  padding: "3px 10px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}>
                  {f.tier}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <style>{`
          @keyframes fadeInRow {
            from { opacity: 0; transform: translateX(-12px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>

      </div>
    </section>
  )
}
