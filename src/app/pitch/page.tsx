import type { Metadata } from "next"
import { PitchMockup } from "@/components/pitch/PitchMockup"
import { PatientTab } from "@/components/pitch/PatientTab"
import { ProblemStats } from "@/components/pitch/ProblemStats"
import { PricingCards } from "@/components/pitch/PricingCards"
import { FounderBio } from "@/components/pitch/FounderBio"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"

export const metadata: Metadata = {
  title: "Nami — Pitch Investisseurs · Seed 2026",
  description: "Le système nerveux des parcours de soins complexes. Coordination pluridisciplinaire, base de connaissances propriétaire, modèle récurrent.",
  robots: { index: false, follow: false },
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({
  children,
  bg = "#FAFAF8",
  maxWidth = 1100,
  py = 100,
}: {
  children: React.ReactNode
  bg?: string
  maxWidth?: number
  py?: number
}) {
  return (
    <section style={{ background: bg, padding: `${py}px 24px` }}>
      <div style={{ maxWidth, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  )
}

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase" as const,
      letterSpacing: "0.12em",
      color: light ? "rgba(255,255,255,0.45)" : "#5B4EC4",
      marginBottom: 14,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2 style={{
      fontSize: "clamp(28px, 4vw, 44px)",
      fontWeight: 900,
      letterSpacing: "-0.03em",
      color: light ? "#FFFFFF" : "#1A1A2E",
      lineHeight: 1.1,
      margin: 0,
      fontFamily: "var(--font-jakarta)",
    }}>
      {children}
    </h2>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PitchPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      {/* S1 — HERO */}
      <Section bg="#FAFAF8" py={0}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 0",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 64 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>N</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em" }}>Nami</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 60, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#5B4EC4", marginBottom: 20 }}>
                SEED 2026
              </div>
              <h1 style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                lineHeight: 1.05,
                margin: "0 0 24px",
                fontFamily: "var(--font-jakarta)",
              }}>
                Le système nerveux<br />
                des parcours<br />
                <span style={{ color: "#5B4EC4" }}>de soins complexes.</span>
              </h1>
              <p style={{
                fontSize: "clamp(15px, 1.8vw, 18px)",
                color: "#4A4A5A",
                lineHeight: 1.65,
                maxWidth: 520,
                margin: "0 0 36px",
              }}>
                Nami coordonne les équipes pluridisciplinaires autour de chaque patient.
                TCA, obésité, pédiatrie, maladies chroniques — un seul espace
                pour structurer, documenter et communiquer.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <a href="mailto:contact@namipourlavie.com" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 100,
                  background: "#5B4EC4",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontFamily: "inherit",
                }}>
                  Demander un meeting →
                </a>
                <a href="mailto:contact@namipourlavie.com" style={{
                  fontSize: 14,
                  color: "#8A8A96",
                  textDecoration: "none",
                  fontFamily: "inherit",
                }}>
                  contact@namipourlavie.com
                </a>
              </div>
              <div style={{ marginTop: 48, fontSize: 11, color: "#8A8A96" }}>
                Conforme RGPD · Art. L.1110-12 CSP
              </div>
            </div>

            {/* Right — mockup */}
            <div style={{ flexShrink: 0, display: "none" }} className="pitch-mockup-desktop">
              <PitchMockup />
            </div>
          </div>

          {/* Mockup below on small screens */}
          <div style={{ marginTop: 48 }}>
            <PitchMockup />
          </div>
        </div>
      </Section>

      {/* S2 — LE PROBLÈME */}
      <Section bg="#F5F3EF">
        <ScrollReveal variant="fade-up" duration={0.8}>
          <blockquote style={{
            margin: "0 0 48px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: "clamp(22px, 3.5vw, 36px)",
            color: "#1A1A2E",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 740,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            &ldquo;5 soignants. 8 outils. 0 espace commun.<br />
            Le patient fait le facteur entre ses consultations.&rdquo;
          </blockquote>
          <p style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 600,
            color: "#5B4EC4",
            marginBottom: 48,
          }}>
            Ce n&apos;est pas un manque de compétence. C&apos;est un défaut d&apos;infrastructure.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
          <ProblemStats stats={[
            {
              animated: { target: 47, suffix: "j" },
              label: "délai moyen entre détection et prise en charge spécialisée",
              source: "Source : HAS 2023",
            },
            {
              animated: { target: 63, suffix: "%" },
              label: "d'informations perdues entre deux consultations",
              source: "Source : Coord. ville-hôpital 2023",
            },
            {
              staticValue: "5,2",
              label: "soignants en moyenne par parcours complexe sans outil commun",
              source: "Source : Étude terrain 2025",
            },
          ]} />
        </ScrollReveal>
      </Section>

      {/* S3 — L'INSIGHT */}
      <Section bg="#FAFAF8">
        <ScrollReveal variant="fade-blur" duration={0.9}>
          <blockquote style={{
            margin: "0 auto 24px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: "clamp(20px, 2.8vw, 32px)",
            color: "#1A1A2E",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 680,
          }}>
            &ldquo;Tous les outils médicaux améliorent les pratiques.<br />
            Aucun ne rend du temps aux soignants.&rdquo;
          </blockquote>
          <p style={{
            textAlign: "center",
            fontSize: 13,
            color: "#8A8A96",
            maxWidth: 480,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}>
            — Projet de recherche 2025, interviews de médecins, infirmiers<br />
            et chefs de service sur la coordination des pathologies chroniques
          </p>
          <p style={{
            textAlign: "center",
            fontSize: 16,
            color: "#4A4A5A",
            maxWidth: 580,
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Chaque nouveau logiciel coûte du temps ETP supplémentaire.
            Nami est conçu pour restituer du temps, pas en consommer.
            C&apos;est la thèse fondatrice.
          </p>
        </ScrollReveal>
      </Section>

      {/* S4 — LA SOLUTION : DÉMO */}
      <Section bg="#FAFAF8" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Eyebrow>PRODUIT</Eyebrow>
            <SectionTitle>Un espace. Toute l&apos;équipe. Trois pathologies.</SectionTitle>
          </div>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <PatientTab />
        </ScrollReveal>
      </Section>

      {/* S5 — TRACTION */}
      <Section bg="#F5F3EF" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>TRACTION</Eyebrow>
          <SectionTitle>10 jours de build. Un pipeline institutionnel.</SectionTitle>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginTop: 16, marginBottom: 48, maxWidth: 540, lineHeight: 1.6 }}>
            Première ligne de code : 4 avril 2026. En production le 14 avril.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 0,
            marginBottom: 48,
          }}>
            {[
              { date: "4 avril", label: "Première ligne de code" },
              { date: "14 avril", label: "26 500 lignes · 260 endpoints · 67 modèles · En production" },
              { date: "23 avril", label: "Présentation institutionnelle programmée" },
              { date: "Mai 2026", label: "Premiers pilotes tarifés" },
            ].map((step, i) => (
              <div key={step.date} style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "0 16px 0 0",
                borderLeft: i > 0 ? "none" : undefined,
                position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {i > 0 && (
                    <div style={{ height: 1, background: "rgba(26,26,46,0.15)", flex: 1 }} />
                  )}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5B4EC4", flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#5B4EC4" }}>{step.date}</div>
                <div style={{ fontSize: 13, color: "#4A4A5A", lineHeight: 1.45 }}>{step.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Pipeline cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { institution: "Hôpital Paul-Brousse (AP-HP)", status: "Présentation programmée", specialty: "TCA — référence nationale" },
            { institution: "Hôpital Américain de Paris", status: "Présentation programmée", specialty: "Pédiatrie — réseau ville-hôpital" },
            { institution: "Hôpital Foch", status: "Contact établi — Direction de l'Innovation", specialty: "Pluridisciplinaire" },
          ].map((card, i) => (
            <ScrollReveal key={card.institution} variant="fade-up" delay={i * 0.1} duration={0.6}>
              <div style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid rgba(26,26,46,0.08)",
                padding: "20px 20px",
                boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>{card.institution}</div>
                <div style={{ fontSize: 12, color: "#5B4EC4", fontWeight: 600, marginBottom: 4 }}>{card.status}</div>
                <div style={{ fontSize: 12, color: "#8A8A96" }}>{card.specialty}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.6}>
          <p style={{ fontSize: 12, color: "#8A8A96", maxWidth: 560, lineHeight: 1.6 }}>
            Pipeline construit en 10 jours sur la légitimité clinique de la fondatrice,
            pas sur du marketing. Aucun engagement formel à ce stade.
          </p>
        </ScrollReveal>
      </Section>

      {/* S6 — MARCHÉ */}
      <Section bg="#1A1A2E" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow light>MARCHÉ</Eyebrow>
          <SectionTitle light>Un marché structurel, pas conjoncturel.</SectionTitle>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginTop: 48, marginBottom: 48 }}>
          {[
            { target: 269, suffix: "", label: "structures PCR Obésité éligibles 2026", source: "Arrêté ministériel 2026" },
            { target: 40, prefix: "", suffix: "M+", label: "patients en parcours chronique complexe", source: "HAS / DREES" },
            { target: 582101, suffix: "", label: "professionnels dans l'annuaire", source: "ANS / RPPS" },
            { target: 22308, suffix: "", label: "sources cliniques indexées", source: "Base Nami 2025" },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} variant="fade-up" delay={i * 0.1} duration={0.6}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, fontFamily: "var(--font-jakarta)" }}>
                  <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} duration={1800} />
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.70)", lineHeight: 1.45 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{stat.source}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fade-up" delay={0.25} duration={0.6}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "PCR Obésité Complexe adulte — lancement mars 2026, candidatures 5 mai 2026",
              "Explosion des parcours chroniques pluridisciplinaires (TCA, obésité, santé mentale, pédiatrie)",
              "Pénurie de soignants — la coordination fait plus avec moins",
            ].map((line) => (
              <div key={line} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#5B4EC4", marginTop: 2, flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Section>

      {/* S7 — MOAT */}
      <Section bg="#FAFAF8" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>AVANTAGE STRUCTUREL</Eyebrow>
          <SectionTitle>Ce qu&apos;on a et que les autres n&apos;ont pas.</SectionTitle>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
          {[
            {
              icon: "🏥",
              title: "Légitimité clinique",
              body: "Construit PAR une soignante en exercice, à l'Hôpital Américain, membre de 8 réseaux cliniques, avec une recherche terrain publiée. Pas un produit tech qui essaie de comprendre la santé.",
            },
            {
              icon: "🔒",
              title: "Conformité native",
              body: "RGPD, architecture anti-DM, secret professionnel par design. Les établissements éliminent sur ces critères en premier — avant même de regarder le produit.",
            },
            {
              icon: "📚",
              title: "Base de connaissances propriétaire",
              body: "22 308 sources structurées. 116 000 liens de knowledge graph. 425 pathologies. Ce dataset n'existe nulle part ailleurs.",
            },
            {
              icon: "🌐",
              title: "Effets de réseau",
              body: "582 000 soignants référencés. Plus de soignants → meilleur adressage → plus de soignants. Flywheel défendable.",
            },
          ].map((card, i) => (
            <ScrollReveal key={card.title} variant="fade-up" delay={i * 0.1} duration={0.6}>
              <div style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(26,26,46,0.08)",
                padding: "24px 22px",
                height: "100%",
                boxShadow: "0 2px 12px rgba(26,26,46,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                <div style={{ fontSize: 28 }}>{card.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.6 }}>{card.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* S8 — MODÈLE */}
      <Section bg="#F5F3EF" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>MODÈLE</Eyebrow>
          <SectionTitle>Récurrent. Prévisible. Scalable.</SectionTitle>
        </ScrollReveal>

        <div style={{ marginTop: 40 }}>
          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <PricingCards />
          </ScrollReveal>
        </div>

        {/* Velocity callout */}
        <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
          <div style={{
            marginTop: 32,
            background: "rgba(91,78,196,0.06)",
            border: "1px solid rgba(91,78,196,0.15)",
            borderRadius: 14,
            padding: "20px 24px",
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5B4EC4", marginBottom: 6 }}>VÉLOCITÉ</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>
                10 jours. 26 500 lignes. 260 endpoints. 67 modèles Prisma.
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.5 }}>
              0 erreur TypeScript. Déployé en production. Seule.
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* S9 — FONDATRICE */}
      <Section bg="#FAFAF8" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>ÉQUIPE</Eyebrow>
          <SectionTitle>Founder-market fit.</SectionTitle>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginTop: 16, marginBottom: 48, maxWidth: 520, lineHeight: 1.6 }}>
            La fondatrice est la première utilisatrice. Nami résout son propre problème.
          </p>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <FounderBio variant="light" />
        </ScrollReveal>
      </Section>

      {/* S10 — CTA */}
      <Section bg="#1A1A2E" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <SectionTitle light>Prêt à discuter ?</SectionTitle>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
              15 minutes pour comprendre Nami et son potentiel.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              <a href="mailto:contact@namipourlavie.com" style={{
                padding: "14px 32px",
                borderRadius: 100,
                background: "#5B4EC4",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "inherit",
              }}>
                Prendre un rendez-vous →
              </a>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 24, lineHeight: 1.8 }}>
              Nami n&apos;est pas un dispositif médical au sens du règlement (UE) 2017/745 · Conforme RGPD · Art. L.1110-12 CSP
            </p>
          </div>
        </ScrollReveal>
      </Section>

    </div>
  )
}
