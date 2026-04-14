"use client"

import { useEffect, useRef, useState } from "react"

const QUOTE_LINES = [
  "Tous les outils médicaux améliorent les pratiques.",
  "Aucun ne rend du temps.",
]

export function PitchInsight() {
  const ref = useRef<HTMLDivElement>(null)
  const [lineVisible, setLineVisible] = useState([false, false])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLineVisible([true, false])
          setTimeout(() => setLineVisible([true, true]), 450)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px clamp(24px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: 740, margin: "0 auto", textAlign: "center" }}>
        {/* Quote lines — progressive reveal */}
        <div ref={ref}>
          {QUOTE_LINES.map((line, i) => (
            <div key={i} style={{
              display: "block",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.5rem, 3.5vw, 2.6rem)",
              color: "#1A1A2E",
              lineHeight: 1.4,
              marginBottom: i < QUOTE_LINES.length - 1 ? "0.1em" : 0,
              opacity: lineVisible[i] ? 1 : 0,
              filter: lineVisible[i] ? "blur(0)" : "blur(10px)",
              transform: lineVisible[i] ? "translateY(0) scale(1)" : "translateY(18px) scale(0.97)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}>
              &ldquo;{line}&rdquo;
            </div>
          ))}
        </div>

        {/* Attribution */}
        <p style={{
          marginTop: 32,
          fontSize: 12,
          color: "#8A8A96",
          lineHeight: 1.6,
          opacity: lineVisible[1] ? 1 : 0,
          transition: "opacity 0.6s ease 300ms",
        }}>
          — Projet de recherche 2025 · Interviews de médecins, infirmiers et chefs de service
          <br />
          sur la coordination des pathologies chroniques
        </p>

        {/* Body */}
        <p style={{
          marginTop: 28,
          fontSize: "clamp(14px, 1.5vw, 16px)",
          color: "#4A4A5A",
          maxWidth: 520,
          margin: "28px auto 0",
          lineHeight: 1.7,
          opacity: lineVisible[1] ? 1 : 0,
          transition: "opacity 0.6s ease 500ms",
        }}>
          Chaque nouveau logiciel coûte du temps ETP supplémentaire.
          Nami est conçu pour restituer du temps, pas en consommer.
          C&apos;est la thèse fondatrice.
        </p>
      </div>
    </section>
  )
}
