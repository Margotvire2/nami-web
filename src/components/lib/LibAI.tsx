"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const STEPS = [
  {
    num: "01",
    label: "Vous dictez",
    body: "Vous parlez pendant ou après la consultation. Nami transcrit en temps réel.",
    color: "#5B4EC4",
  },
  {
    num: "02",
    label: "L'IA structure",
    body: "Note de consultation structurée, brouillon d'ordonnance, résumé de synthèse — générés automatiquement, sourcés sur 22 308 références.",
    color: "#2BA89C",
  },
  {
    num: "03",
    label: "Vous validez",
    body: "Tout est un brouillon jusqu'à votre validation. L'IA propose, vous décidez. Badge \"Brouillon IA — à vérifier\" toujours visible.",
    color: "#5B4EC4",
  },
  {
    num: "04",
    label: "Le dossier est partagé",
    body: "L'équipe pluridisciplinaire autour du patient voit ce qui la concerne. Chaque soignant dans son rôle. Tout au même endroit.",
    color: "#2BA89C",
  },
]

export function LibAI() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="comment-ca-marche"
      style={{
        background: "#1A1A2E",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "60%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(91,78,196,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(91,78,196,0.7)", marginBottom: 16 }}>
            L&apos;IA AU SERVICE DE VOTRE PRATIQUE
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            lineHeight: 1.1,
            margin: "0 0 14px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Vous dictez.<br />Nami rédige.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.50)", marginBottom: 56, maxWidth: 480, lineHeight: 1.6 }}>
            Une consultation enregistrée devient une note structurée, un brouillon d&apos;ordonnance, une lettre d&apos;adressage — en quelques secondes. Vous validez, vous corrigez, vous signez.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 3, marginBottom: 56 }}>
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} variant="fade-up" delay={i * 0.12} duration={0.65}>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                borderTop: `3px solid ${step.color}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: "0.06em" }}>{step.num}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{step.label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.55 }}>{step.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* What gets generated */}
        <ScrollReveal variant="fade-up" delay={0.4} duration={0.6}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: 16 }}>
              CE QUE NAMI GÉNÈRE POUR VOUS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                "Note de consultation structurée",
                "Brouillon d'ordonnance",
                "Lettre d'adressage",
                "Synthèse de parcours",
                "Compte-rendu de consultation",
                "Extraction de biologie",
                "Résumé patient",
              ].map((item) => (
                <span key={item} style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.60)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                }}>
                  {item}
                </span>
              ))}
            </div>
            <p style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
              Tout brouillon IA doit être validé par le soignant avant intégration au dossier — badge &quot;Brouillon IA — à vérifier&quot; visible en permanence.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}
