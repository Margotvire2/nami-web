"use client"

import { AmbientGlow } from "./AmbientGlow"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const STATS = [
  { value: 237200, suffix: "", label: "médecins en activité en France", source: "DREES, janv. 2025", color: "#7B6FD4" },
  { value: 4000,   suffix: "+", label: "MSP visées d'ici 2027", source: "Plan national MSP", color: "#45C4B8" },
  { value: 269,    suffix: "", label: "structures PCR Obésité éligibles 2026", source: "Arrêté ministériel 2026", color: "#7B6FD4" },
  { value: 20,     suffix: "M", label: "patients en parcours chronique complexe", source: "HAS France", color: "#45C4B8" },
]

const TAILWINDS = [
  "PCR Obésité Complexe adulte — 269 structures ARS, candidatures 5 mai 2026",
  "Plan 4 000 MSP — objectif gouvernemental 2027",
  "CPTS 100% couverture territoire — budget ACI pour la coordination ambulatoire",
  "Pénurie soignants — 7M de Français sans médecin traitant, coordination = faire plus avec moins",
  "Article 51 — cadre réglementaire pour financer des parcours ambulatoires innovants",
]

export function PitchMarket() {
  return (
    <section style={{
      background: "#1A1A2E",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      position: "relative",
    }}>
      <AmbientGlow />
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(91,78,196,0.7)", marginBottom: 14 }}>
            MARCHÉ
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            lineHeight: 1.1,
            margin: "0 0 16px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Le virage ambulatoire :<br />100 milliards€/an à coordonner.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.40)", marginBottom: 52, maxWidth: 560, lineHeight: 1.65 }}>
            SAM France : ~100M€/an · TAM Europe (×5-8) : 500-800M€
          </p>
        </ScrollReveal>

        {/* Giant counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "48px 56px", marginBottom: 52 }}>
          {STATS.map((s, i) => (
            <ScrollReveal key={s.label} variant="fade-up" delay={i * 0.1} duration={0.65}>
              <div>
                <div style={{
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "clamp(3rem, 6vw, 5.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: s.color,
                  marginBottom: 10,
                }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} duration={2200} />
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.4, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", fontStyle: "italic" }}>{s.source}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Tailwinds */}
        <ScrollReveal variant="fade-up" delay={0.3} duration={0.6}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: 16 }}>
              TAILWINDS RÉGLEMENTAIRES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TAILWINDS.map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "#5B4EC4", flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
