"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"

const PAINS = [
  {
    icon: "📋",
    title: "20 min d'admin par consultation",
    body: "Notes, comptes-rendus, ordonnances, certificats. Chaque consultation génère autant de paperasse que de soin.",
  },
  {
    icon: "📬",
    title: "Emails patients sans fin",
    body: "Demandes de renouvellement, questions entre deux RDV, transmissions de résultats. Une messagerie non structurée qui déborde.",
  },
  {
    icon: "🔗",
    title: "Orienter vers un inconnu, c'est risqué",
    body: "Vous devez adresser mais vous ne connaissez pas les autres pros. Faire confiance à quelqu'un que vous n'avez jamais vu pour vos patients — c'est une prise de risque réelle.",
  },
  {
    icon: "📅",
    title: "Un agenda qui vous appartient enfin",
    body: "Gérez vos créneaux, vos absences, vos types de consultations. Les patients réservent en ligne. Vous reprenez le contrôle.",
  },
]

export function LibProblem() {
  return (
    <section style={{
      background: "#F5F3EF",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 16 }}>
            LE PROBLÈME
          </div>
          <h2 style={{
            fontSize: "clamp(1.8rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1A1A2E",
            lineHeight: 1.1,
            margin: "0 0 16px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Vous passez autant de temps<br />à documenter qu&apos;à soigner.
          </h2>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 56, maxWidth: 520, lineHeight: 1.65 }}>
            Ce n&apos;est pas un manque d&apos;organisation. C&apos;est une infrastructure qui n&apos;a jamais été conçue pour les libéraux.
          </p>
        </ScrollReveal>

        {/* Pain points */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 64 }}>
          {PAINS.map((pain, i) => (
            <ScrollReveal key={pain.title} variant="fade-up" delay={i * 0.1} duration={0.65}>
              <div style={{
                background: "#fff",
                borderRadius: 18,
                padding: "24px 22px",
                border: "1px solid rgba(26,26,46,0.07)",
                boxShadow: "0 2px 12px rgba(26,26,46,0.04)",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                <div style={{ fontSize: 28 }}>{pain.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.3 }}>{pain.title}</div>
                <div style={{ fontSize: 13, color: "#4A4A5A", lineHeight: 1.6, flex: 1 }}>{pain.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats */}
        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px 48px" }}>
            {[
              { value: 35, suffix: "%", label: "du temps médical consacré à l'administration", source: "Étude DREES 2024" },
              { value: 47, suffix: "j", label: "de délai moyen avant prise en charge spécialisée sans coordination", source: "HAS 2023" },
              { static: "5,2", label: "soignants impliqués en moyenne dans un parcours complexe", source: "Étude terrain 2025" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: "#5B4EC4",
                  fontFamily: "var(--font-jakarta)",
                }}>
                  {"static" in s ? s.static : <AnimatedCounter target={s.value} suffix={s.suffix} duration={2000} />}
                </div>
                <div style={{ fontSize: 13, color: "#4A4A5A", lineHeight: 1.5, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#8A8A96", fontStyle: "italic" }}>Source : {s.source}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}
