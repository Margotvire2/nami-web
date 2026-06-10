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
  title: "Nami — Pour les soignants",
  description:
    "Coordonnez votre équipe de soins, centralisez la communication et accédez aux recommandations HAS depuis un seul espace. Conçu par une soignante.",
  keywords: [
    "soignants",
    "coordination soins",
    "dictée médicale",
    "adressage sécurisé",
    "dossier de coordination",
    "pluridisciplinaire",
    "base documentaire",
    "réseau soignants",
  ],
  alternates: { canonical: "/pour-les-soignants" },
  openGraph: {
    title: "Nami — Pour les soignants",
    description:
      "Coordonnez votre équipe de soins, centralisez la communication et accédez aux recommandations HAS.",
    url: "https://namipourlavie.com/pour-les-soignants",
    type: "website",
    siteName: "Nami",
    locale: "fr_FR",
    images: [
      {
        url: "/og-image-pro.svg",
        width: 1200,
        height: 630,
        alt: "Nami — Pour les soignants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nami — Pour les soignants",
    description:
      "Coordonnez votre équipe de soins, centralisez la communication et accédez aux recommandations HAS.",
    images: ["/og-image-pro.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

const SPECIALITES = [
  "Diététicien·ne",
  "Médecin généraliste",
  "Psychologue",
  "Psychiatre",
  "Infirmier·ère",
  "Médecin nutritionniste",
  "Pédiatre",
  "Sage-femme",
  "Kinésithérapeute",
  "Orthophoniste",
  "Ergothérapeute",
  "Endocrinologue",
  "Gastro-entérologue",
  "Chirurgien bariatrique",
  "Allergologue",
  "Rhumatologue",
  "Neurologue",
  "Cardiologue",
]

export default function PourLesSoignantsPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      <LibHero />

      {/* Validation notice — annoncé dès l'arrivée, pas à l'étape 7 du wizard */}
      <div style={{
        background: "#F2F0FB",
        borderTop: "1px solid rgba(91,78,196,0.10)",
        borderBottom: "1px solid rgba(91,78,196,0.10)",
        padding: "10px 24px",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, fontSize: 13, color: "#5B4EC4", fontWeight: 500 }}>
          Inscription gratuite · Validation manuelle par l&apos;équipe Nami sous 24 à 48h · Accès dès validation
        </p>
      </div>

      <LibProblem />

      {/* Spécialités accueillies */}
      <section style={{
        background: "#FAFAF8",
        padding: "64px clamp(24px, 5vw, 80px)",
        borderBottom: "1px solid rgba(26,26,46,0.05)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 12 }}>
              SPÉCIALITÉS ACCUEILLIES
            </div>
            <h2 style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#1A1A2E",
              margin: "0 0 10px",
              fontFamily: "var(--font-jakarta)",
            }}>
              Conçu pour tous les soignants du parcours
            </h2>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32, maxWidth: 540 }}>
              Libéral ou salarié, médical ou paramédical — Nami s&apos;adapte à votre pratique.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {SPECIALITES.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-block",
                    padding: "7px 16px",
                    borderRadius: 999,
                    background: "#FFFFFF",
                    border: "1px solid rgba(91,78,196,0.15)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  {s}
                </span>
              ))}
              <span style={{
                display: "inline-block",
                padding: "7px 16px",
                borderRadius: 999,
                background: "rgba(91,78,196,0.06)",
                border: "1px solid rgba(91,78,196,0.15)",
                fontSize: 13,
                fontWeight: 500,
                color: "#5B4EC4",
              }}>
                + d&apos;autres spécialités
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

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
