"use client"

import { AmbientGlowCTA } from "./AmbientGlow"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

interface Props {
  variant: "vc" | "hospital"
  /** If true, renders as a bottom panel inside a dark section (no own bg) */
  embedded?: boolean
}

export function PitchCTA({ variant, embedded = false }: Props) {
  const cta = variant === "vc" ? "Demander un meeting →" : "Demander une démo →"

  const inner = (
    <div style={{ maxWidth: 600, margin: "0 auto", width: "100%", position: "relative", zIndex: 1, textAlign: "center" }}>
      <ScrollReveal variant="fade-up" duration={0.7}>
        <h2 style={{
          fontSize: "clamp(2.2rem, 5vw, 4rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#fff",
          lineHeight: 1.1,
          margin: "0 0 18px",
          fontFamily: "var(--font-jakarta)",
        }}>
          Prêt à discuter ?
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.65 }}>
          {variant === "vc"
            ? "15 minutes pour comprendre Nami et son potentiel."
            : "15 minutes pour voir Nami en action sur vos cas cliniques."}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="mailto:contact@namipourlavie.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "15px 36px",
              borderRadius: 100,
              background: "#fff",
              color: "#1A1A2E",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(91,78,196,0.20)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {cta}
          </a>
          <a
            href="mailto:contact@namipourlavie.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "15px 24px",
              borderRadius: 100,
              border: "1.5px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.65)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            contact@namipourlavie.com
          </a>
        </div>
        <p style={{ marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.8 }}>
          Nami · Coordination des parcours de soins
          <br />
          Conforme RGPD · Art. L.1110-12 CSP
          <br />
          Nami n&apos;est pas un dispositif médical au sens du règlement (UE) 2017/745.
        </p>
      </ScrollReveal>
    </div>
  )

  if (embedded) return inner

  return (
    <section style={{
      background: "#1A1A2E",
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      position: "relative",
    }}>
      <AmbientGlowCTA />
      {inner}
    </section>
  )
}
