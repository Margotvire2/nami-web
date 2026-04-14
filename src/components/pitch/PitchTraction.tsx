"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"

const TIMELINE = [
  { date: "4 avril", label: "Première ligne de code" },
  { date: "14 avril", label: "26 500 lignes · 260 endpoints · 67 modèles · En production" },
  { date: "23 avril", label: "Présentations institutionnelles programmées" },
  { date: "Mai 2026", label: "Premiers pilotes tarifés" },
]

const PIPELINE = [
  { name: "Hôpital Paul-Brousse (AP-HP)", status: "Présentation programmée", specialty: "TCA — référence nationale", color: "#5B4EC4" },
  { name: "Hôpital Américain de Paris", status: "Présentation programmée", specialty: "Pédiatrie · Réseau ville-hôpital", color: "#2BA89C" },
  { name: "Hôpital Foch", status: "Contact établi — Direction de l'Innovation", specialty: "Pluridisciplinaire", color: "#5B4EC4" },
]

export function PitchTraction() {
  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
            OÙ ON EN EST
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
            10 jours de build.<br />Un pipeline institutionnel.
          </h2>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 52, maxWidth: 480, lineHeight: 1.6 }}>
            Première ligne de code : 4 avril 2026. En production le 14 avril.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 52, overflowX: "auto", paddingBottom: 8 }}>
            {TIMELINE.map((step, i) => (
              <div key={step.date} style={{ display: "flex", alignItems: "center", flex: "1 0 auto", minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 10 }}>
                    {i > 0 && <div style={{ flex: 1, height: 2, background: "rgba(91,78,196,0.20)" }} />}
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#5B4EC4", flexShrink: 0 }} />
                    {i < TIMELINE.length - 1 && <div style={{ flex: 1, height: 2, background: "rgba(91,78,196,0.20)" }} />}
                  </div>
                  <div style={{ padding: "0 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5B4EC4", marginBottom: 4 }}>{step.date}</div>
                    <div style={{ fontSize: 12, color: "#4A4A5A", lineHeight: 1.4 }}>{step.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Pipeline cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          {PIPELINE.map((card, i) => (
            <ScrollReveal key={card.name} variant="fade-up" delay={i * 0.1} duration={0.6}>
              <div style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(26,26,46,0.07)",
                padding: "20px 22px",
                borderLeft: `4px solid ${card.color}`,
                boxShadow: "0 2px 10px rgba(26,26,46,0.04)",
                transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>{card.name}</div>
                <div style={{ fontSize: 12, color: card.color, fontWeight: 600, marginBottom: 4 }}>{card.status}</div>
                <div style={{ fontSize: 12, color: "#8A8A96" }}>{card.specialty}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fade-up" delay={0.35} duration={0.6}>
          <p style={{ fontSize: 12, color: "#8A8A96", maxWidth: 560, lineHeight: 1.6, fontStyle: "italic" }}>
            Pipeline construit en 10 jours sur la légitimité clinique de la fondatrice, pas sur du marketing.
            Aucun engagement formel à ce stade — c&apos;est à ça que sert un seed.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
