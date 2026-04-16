"use client"

import { useEffect, useRef, useState } from "react"
import { PitchMockup } from "./PitchMockup"

interface Props {
  variant: "vc" | "hospital"
}

const CONTENT = {
  vc: {
    eyebrow: "SEED 2026 · VIRAGE AMBULATOIRE",
    lines: ["L'hôpital a des couloirs.", "Les libéraux n'en ont pas."],
    gradientWords: ["couloirs."],
    subtitle:
      "La France pousse les patients hors de l'hôpital. Mais le virage ambulatoire ne fonctionne que si 5 libéraux se coordonnent aussi bien qu'une équipe hospitalière. Aujourd'hui, ils n'ont aucun outil commun. Nami est ce couloir.",
    cta: "Demander un meeting →",
    ctaHref: "mailto:contact@namipourlavie.com",
    ctaSecondary: "contact@namipourlavie.com",
    footer: "Conforme RGPD · Art. L.1110-12 CSP · Hors DM au sens du règlement (UE) 2017/745",
  },
  hospital: {
    eyebrow: "PARCOURS AMBULATOIRE COORDONNÉ",
    lines: ["Vos patients sortent plus tôt.", "Le relais en ville, lui, est toujours cassé."],
    gradientWords: ["cassé."],
    subtitle:
      "5 libéraux prennent le relais à la sortie. Aucun outil commun. Chacun travaille en silo. Nami crée le couloir ambulatoire — dossier partagé, synthèses IA traçables, coordination structurée.",
    cta: "Demander une démo →",
    ctaHref: "mailto:contact@namipourlavie.com",
    ctaSecondary: "Voir en 3 minutes ↓",
    footer: "Conforme RGPD · Hébergement européen · Art. L.1110-12 CSP",
  },
}

export function PitchHero({ variant }: Props) {
  const c = CONTENT[variant]
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  let wordIdx = 0

  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      padding: "0 clamp(20px, 5vw, 80px)",
      overflowX: "hidden",
    }}>
      <style>{`
        @media (max-width: 639px) {
          .pitch-hero-ctas {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .pitch-hero-cta-primary {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 72, paddingBottom: 48 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
          <img src="/nami-mascot.png" alt="Nami" style={{ width: 34, height: 34, borderRadius: 11, objectFit: "contain" }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em" }}>Nami</span>
        </div>

        {/* Eyebrow */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 0.5s ease 0ms, transform 0.5s ease 0ms",
          fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#5B4EC4", marginBottom: 22,
        }}>
          {c.eyebrow}
        </div>

        {/* Title — word by word */}
        <h1 style={{
          fontSize: "clamp(2.2rem, 7.5vw, 5.8rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.08,
          color: "#1A1A2E",
          margin: "0 0 24px",
          fontFamily: "var(--font-jakarta)",
        }}>
          {c.lines.map((line, li) => (
            <span key={li} style={{ display: "block" }}>
              {line.split(" ").map((word, wi) => {
                const delay = 80 + wordIdx++ * 80
                const isGradient = c.gradientWords.some(gw => word.toLowerCase() === gw.toLowerCase())
                return (
                  <span
                    key={wi}
                    style={{
                      display: "inline-block",
                      marginRight: wi < line.split(" ").length - 1 ? "0.28em" : 0,
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.96)",
                      transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                      ...(isGradient ? {
                        background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      } : {}),
                    }}
                  >
                    {word}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "clamp(14px, 1.8vw, 18px)",
          color: "#4A4A5A",
          lineHeight: 1.65,
          maxWidth: 560,
          margin: "0 0 32px",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(20px)",
          transition: "opacity 0.6s ease 600ms, transform 0.6s ease 600ms",
        }}>
          {c.subtitle}
        </p>

        {/* CTAs */}
        <div
          className="pitch-hero-ctas"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 760ms, transform 0.6s ease 760ms",
          }}
        >
          <a
            href={c.ctaHref}
            className="pitch-hero-cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 30px",
              borderRadius: 100,
              background: "#5B4EC4",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(91,78,196,0.30)",
              minHeight: 48,
            }}
          >
            {c.cta}
          </a>
          <a
            href={c.ctaSecondary.startsWith("mailto") || c.ctaSecondary.startsWith("#") ? c.ctaSecondary : "#demo"}
            style={{
              fontSize: 14,
              color: "#8A8A96",
              textDecoration: "none",
              fontFamily: "inherit",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {c.ctaSecondary}
          </a>
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 32,
          fontSize: 11,
          color: "#8A8A96",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease 900ms",
        }}>
          {c.footer}
        </div>

        {/* Mockup */}
        <div style={{
          marginTop: 48,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 500ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 500ms",
          width: "100%",
        }}>
          <PitchMockup />
        </div>
      </div>
    </section>
  )
}
