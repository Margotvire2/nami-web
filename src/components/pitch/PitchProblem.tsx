"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const LINES_VC = [
  '\u201CLe virage ambulatoire ne marche',
  ' que si les libéraux se coordonnent.',
  ' Aujourd\u2019hui, ils ne peuvent pas.\u201D',
]

const LINES_HOSPITAL = [
  '\u201CVos patients sortent plus tôt.',
  ' Le relais en ville est toujours cassé.\u201D',
]

const STATS_VC = [
  { value: 100, suffix: "Md€", label: "dépensés chaque année en hospitalisation — que le virage ambulatoire veut réduire", source: "Comptes de la santé 2024", color: "#5B4EC4" },
  { value: 63, suffix: "%", label: "d'informations perdues entre deux consultations en ville-hôpital", source: "Coord. ville-hôpital 2023", color: "#2BA89C" },
  { static: "5,2", label: "soignants en moyenne par parcours complexe sans outil commun", source: "Étude terrain 2025", color: "#5B4EC4" },
] as const

const STATS_HOSPITAL = [
  { value: 47, suffix: "j", label: "de délai moyen entre détection et prise en charge", source: "HAS 2023", color: "#5B4EC4" },
  { value: 63, suffix: "%", label: "d'informations perdues entre deux consultations", source: "HAS 2023", color: "#2BA89C" },
  { value: 8,  suffix: "", label: "outils différents pour un seul patient (WhatsApp, email, Doctolib, fax...)", source: "Terrain 2025", color: "#5B4EC4" },
] as const

interface Props {
  variant: "vc" | "hospital"
}

export function PitchProblem({ variant }: Props) {
  const lines = variant === "vc" ? LINES_VC : LINES_HOSPITAL
  const stats = variant === "vc" ? STATS_VC : STATS_HOSPITAL

  const quoteRef = useRef<HTMLDivElement>(null)
  const lineCount = lines.length
  const [lineVisible, setLineVisible] = useState<boolean[]>(Array(lineCount).fill(false))

  useEffect(() => {
    const el = quoteRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lines.forEach((_, idx) => {
            setTimeout(() => setLineVisible(prev => {
              const next = [...prev]
              next[idx] = true
              return next
            }), idx * 400)
          })
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
      background: "#F5F3EF",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {/* Big quote — line by line */}
        <div ref={quoteRef} style={{ marginBottom: 56, textAlign: "center" }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              display: "block",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              color: "#1A1A2E",
              lineHeight: 1.35,
              opacity: lineVisible[i] ? 1 : 0,
              filter: lineVisible[i] ? "blur(0)" : "blur(8px)",
              transform: lineVisible[i] ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {line}
            </div>
          ))}
          <ScrollReveal variant="fade-up" delay={0.9} duration={0.6}>
            <p style={{
              marginTop: 24,
              fontSize: "clamp(15px, 1.6vw, 17px)",
              fontWeight: 600,
              color: "#5B4EC4",
              textAlign: "center",
            }}>
              Nami n&apos;est pas un outil dans un marché existant. Nami est l&apos;infrastructure qui crée le marché du parcours ambulatoire coordonné.
            </p>
            {variant === "hospital" && (
              <p style={{ marginTop: 12, fontSize: 15, color: "#374151", maxWidth: 560, margin: "12px auto 0", lineHeight: 1.65, textAlign: "center" }}>
                Marc, 52 ans, obésité complexe — même problème.
                Léo, 8 ans, épilepsie — même problème.
                La pathologie change. Le défaut de coordination, jamais.
              </p>
            )}
          </ScrollReveal>
        </div>

        {/* Stats — giant */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
          {stats.map((s, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.15} duration={0.7}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "clamp(3.5rem, 7vw, 6rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: s.color,
                }}>
                  {"static" in s ? s.static : (
                    <AnimatedCounter target={s.value} suffix={s.suffix} duration={2200} />
                  )}
                </div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>Source : {s.source}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
