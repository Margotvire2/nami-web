import type { Metadata } from "next"
import { PitchFounder } from "@/components/pitch/PitchFounder"
import { PitchPricing } from "@/components/pitch/PitchPricing"
import { PitchCTA } from "@/components/pitch/PitchCTA"
import { KnowledgeSearch } from "@/components/pitch/KnowledgeSearch"
import { SecurityGrid } from "@/components/pitch/SecurityGrid"
import { AmbientGlow } from "@/components/pitch/AmbientGlow"
import { LibHero } from "@/components/lib/LibHero"
import { LibProblem } from "@/components/lib/LibProblem"
import { LibAI } from "@/components/lib/LibAI"
import { LibNetwork } from "@/components/lib/LibNetwork"
import { LibFeatures } from "@/components/lib/LibFeatures"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export const metadata: Metadata = {
  title: "Nami — Pour les soignants libéraux",
  description: "Nami supprime la charge administrative autour de la consultation. Dictée → dossier structuré, adressage sécurisé, réseau de confiance. Conçu par une soignante.",
  robots: { index: false, follow: false },
}

export default function SoignantsLiberauxPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      <LibHero />
      <LibProblem />
      <LibAI />

      {/* Base de connaissances */}
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
              Un doute sur un traitement ?<br />22 308 sources. 2 secondes.
            </h2>
            <p style={{ fontSize: 16, color: "#374151", marginBottom: 16, maxWidth: 540, lineHeight: 1.65 }}>
              Protocoles HAS, DSM-5, FFAB, BDPM, Orphanet, ICD-11 — structurés en graphe de connaissances avec 116 000 relations cliniques typées et grades de preuve.
            </p>
            <p style={{ fontSize: 15, color: "#374151", marginBottom: 48, maxWidth: 540, lineHeight: 1.65 }}>
              Interactions médicamenteuses, contre-indications, seuils de référence, consensus internationaux. Consultable en quelques secondes depuis n&apos;importe quelle fiche patient.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
            <KnowledgeSearch />
          </ScrollReveal>
        </div>
      </section>

      <LibNetwork />
      <LibFeatures />

      {/* Sécurité */}
      <section style={{
        background: "#FAFAF8",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
              CONFIANCE & CONFORMITÉ
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
            <p style={{ fontSize: 16, color: "#374151", marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
              La conformité n&apos;est pas une case à cocher. C&apos;est l&apos;architecture de base. Données hébergées en Europe, RGPD natif, Art. L.1110-12 CSP.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
            <SecurityGrid />
          </ScrollReveal>
        </div>
      </section>

      <PitchPricing
        variant="hospital"
        note="Accès gratuit sans engagement. Upgrade quand le besoin se présente."
      />

      {/* Fondatrice + CTA */}
      <section style={{
        background: "#1A1A2E",
        padding: "80px clamp(24px, 5vw, 80px)",
        position: "relative",
      }}>
        <AmbientGlow />
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <PitchFounder variant="dark" />
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "56px 0" }} />
          <PitchCTA variant="hospital" embedded />
        </div>
      </section>

    </div>
  )
}
