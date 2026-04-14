import type { Metadata } from "next"
import { PitchHero } from "@/components/pitch/PitchHero"
import { PitchProblem } from "@/components/pitch/PitchProblem"
import { HowItWorks } from "@/components/pitch/HowItWorks"
import { PitchStickyDemo } from "@/components/pitch/PitchStickyDemo"
import { PitchPricing } from "@/components/pitch/PitchPricing"
import { PitchFounder } from "@/components/pitch/PitchFounder"
import { PitchCTA } from "@/components/pitch/PitchCTA"
import { KnowledgeSearch } from "@/components/pitch/KnowledgeSearch"
import { SecurityGrid } from "@/components/pitch/SecurityGrid"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export const metadata: Metadata = {
  title: "Nami — Coordination des parcours complexes · Pour les soignants",
  description: "Nami est l'espace commun de votre équipe pluridisciplinaire. Dossier partagé, communication sécurisée, base de connaissances cliniques.",
  robots: { index: false, follow: false },
}

export default function DecouvrirPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      <PitchHero variant="hospital" />
      <PitchProblem variant="hospital" />
      <HowItWorks />
      <PitchStickyDemo />

      {/* S5 — BASE DE CONNAISSANCES */}
      <section style={{
        background: "#F5F3EF",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
              BASE DOCUMENTAIRE
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
              22 308 sources cliniques.<br />Une seule recherche.
            </h2>
            <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
              Protocoles HAS, consensus internationaux, fiches parcours — tout structuré et consultable en quelques secondes.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
            <KnowledgeSearch />
          </ScrollReveal>
        </div>
      </section>

      {/* S6 — SÉCURITÉ & CONFORMITÉ */}
      <section style={{
        background: "#FAFAF8",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
              CONFIANCE
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
              Construit pour le secret médical,<br />pas adapté après coup.
            </h2>
            <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
              La conformité n&apos;est pas une case à cocher. C&apos;est l&apos;architecture de base.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
            <SecurityGrid />
          </ScrollReveal>
        </div>
      </section>

      <PitchPricing
        variant="hospital"
        note="Tarif fondateur pour structures pilotes. Déploiement accompagné. Formation incluse."
      />

      {/* S8 — FONDATRICE + CTA */}
      <section style={{
        background: "#1A1A2E",
        padding: "80px clamp(24px, 5vw, 80px)",
        position: "relative",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <PitchFounder variant="dark" />
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "56px 0" }} />
          <PitchCTA variant="hospital" embedded />
        </div>
      </section>

    </div>
  )
}
