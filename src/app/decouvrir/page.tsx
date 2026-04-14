import type { Metadata } from "next"
import { UserPlus, FileText, Users } from "lucide-react"
import { PitchMockup } from "@/components/pitch/PitchMockup"
import { PatientTab } from "@/components/pitch/PatientTab"
import { ProblemStats } from "@/components/pitch/ProblemStats"
import { PricingCards } from "@/components/pitch/PricingCards"
import { FounderBio } from "@/components/pitch/FounderBio"
import { KnowledgeSearch } from "@/components/pitch/KnowledgeSearch"
import { SecurityGrid } from "@/components/pitch/SecurityGrid"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export const metadata: Metadata = {
  title: "Nami — Coordination des parcours complexes · Pour les soignants",
  description: "Nami est l'espace commun de votre équipe pluridisciplinaire. Dossier partagé, communication sécurisée, base de connaissances cliniques.",
  robots: { index: false, follow: false },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({
  children,
  bg = "#FAFAF8",
  maxWidth = 1100,
  py = 80,
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
      fontSize: "clamp(26px, 3.8vw, 42px)",
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

export default function DecouvrirPage() {
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

          {/* Content */}
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#5B4EC4", marginBottom: 20 }}>
              COORDINATION DES PARCOURS COMPLEXES
            </div>
            <h1 style={{
              fontSize: "clamp(32px, 5vw, 58px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#1A1A2E",
              lineHeight: 1.05,
              margin: "0 0 24px",
              fontFamily: "var(--font-jakarta)",
            }}>
              Quand votre patient voit 5 soignants,<br />
              <span style={{ color: "#5B4EC4" }}>chacun sait ce que les autres ont fait.</span>
            </h1>
            <p style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "#4A4A5A",
              lineHeight: 1.65,
              margin: "0 0 36px",
            }}>
              Nami est l&apos;espace commun de votre équipe pluridisciplinaire.
              Un dossier de coordination partagé, structuré, sécurisé.
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
                Demander une démo →
              </a>
              <a href="#demo" style={{
                fontSize: 14,
                color: "#8A8A96",
                textDecoration: "none",
                fontFamily: "inherit",
              }}>
                Voir en 3 minutes ↓
              </a>
            </div>
          </div>

          <PitchMockup />

          <div style={{ marginTop: 40, fontSize: 11, color: "#8A8A96" }}>
            Conforme RGPD · Hébergement européen · Art. L.1110-12 CSP
          </div>
        </div>
      </Section>

      {/* S2 — LE PROBLÈME */}
      <Section bg="#F5F3EF" py={80}>
        <ScrollReveal variant="fade-up" duration={0.8}>
          <blockquote style={{
            margin: "0 0 32px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: "clamp(20px, 3vw, 30px)",
            color: "#1A1A2E",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 680,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            &ldquo;Gabrielle a 16 ans. Une anorexie. 5 soignants.
            Ils se coordonnent par SMS et mails.
            Entre deux consultations, personne ne sait ce que l&apos;autre a fait.&rdquo;
          </blockquote>
          <p style={{
            textAlign: "center",
            fontSize: 16,
            color: "#4A4A5A",
            maxWidth: 560,
            margin: "0 auto 24px",
            lineHeight: 1.65,
          }}>
            Marc, 52 ans, en parcours obésité complexe — même problème.
            Léo, 8 ans, pédiatrie — même problème.
            La pathologie change. Le défaut de coordination, jamais.
          </p>
          <p style={{
            textAlign: "center",
            fontSize: 17,
            fontWeight: 600,
            color: "#5B4EC4",
            marginBottom: 48,
          }}>
            Ce n&apos;est pas un manque de compétence. C&apos;est un manque d&apos;outil.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
          <ProblemStats stats={[
            {
              animated: { target: 47, suffix: "j" },
              label: "de délai moyen entre la détection et la prise en charge spécialisée",
              source: "Source : HAS 2023",
            },
            {
              animated: { target: 63, suffix: "%" },
              label: "d'informations perdues entre deux consultations",
              source: "Source : HAS 2023",
            },
            {
              animated: { target: 8, suffix: "" },
              label: "outils utilisés (WhatsApp, email, Doctolib, fax, courrier, DMP...) pour un seul patient",
              source: "Source : Terrain 2025",
            },
          ]} />
        </ScrollReveal>
      </Section>

      {/* S3 — COMMENT ÇA MARCHE */}
      <Section bg="#FAFAF8" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>EN 3 ÉTAPES</Eyebrow>
          <SectionTitle>Simple à déployer. Immédiat à utiliser.</SectionTitle>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginTop: 48 }}>
          {[
            {
              num: "①",
              icon: <UserPlus size={20} color="#5B4EC4" />,
              title: "Invitez",
              body: "Créez le dossier de coordination de votre patient. Ajoutez les soignants de l'équipe en un clic.",
            },
            {
              num: "②",
              icon: <FileText size={20} color="#2BA89C" />,
              title: "Documentez",
              body: "Dictez ou écrivez. L'IA structure en brouillon. Partagez bilans, notes, comptes-rendus. Tout est centralisé.",
            },
            {
              num: "③",
              icon: <Users size={20} color="#059669" />,
              title: "Coordonnez",
              body: "Chaque soignant voit ce qui le concerne. Le parcours avance. L'équipe est alignée.",
            },
          ].map((step, i) => (
            <ScrollReveal key={step.title} variant="fade-up" delay={i * 0.12} duration={0.6}>
              <div style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(26,26,46,0.07)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                boxShadow: "0 2px 10px rgba(26,26,46,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(91,78,196,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#1A1A2E", letterSpacing: "-0.03em" }}>
                    {step.num}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>{step.title}</div>
                <div style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.6 }}>{step.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* S4 — DÉMO INTERACTIVE */}
      <Section bg="#FAFAF8" py={80}>
        <div id="demo">
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <Eyebrow>PRODUIT</Eyebrow>
              <SectionTitle>Un espace. Toute l&apos;équipe. Trois parcours.</SectionTitle>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
            <PatientTab />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.25} duration={0.6}>
            <p style={{
              textAlign: "center",
              fontSize: 15,
              color: "#4A4A5A",
              maxWidth: 580,
              margin: "28px auto 0",
              lineHeight: 1.65,
            }}>
              Chaque professionnel voit ce qui le concerne.
              La psychiatre voit les scores psy. La diét voit la nutrition.
              Le neuropédiatre voit les crises. Le médecin traitant voit la synthèse.
            </p>
          </ScrollReveal>
        </div>
      </Section>

      {/* S5 — BASE DE CONNAISSANCES */}
      <Section bg="#F5F3EF" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>BASE DOCUMENTAIRE</Eyebrow>
          <SectionTitle>22 308 sources cliniques. Une seule recherche.</SectionTitle>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginTop: 16, marginBottom: 48, maxWidth: 520, lineHeight: 1.6 }}>
            Protocoles HAS, consensus internationaux, fiches parcours — tout structuré et consultable en quelques secondes.
          </p>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <KnowledgeSearch />
        </ScrollReveal>
      </Section>

      {/* S6 — SÉCURITÉ & CONFORMITÉ */}
      <Section bg="#FAFAF8" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>CONFIANCE</Eyebrow>
          <SectionTitle>Construit pour le secret médical,<br />pas adapté après coup.</SectionTitle>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginTop: 16, marginBottom: 48, maxWidth: 520, lineHeight: 1.6 }}>
            La conformité n&apos;est pas une case à cocher. C&apos;est l&apos;architecture de base.
          </p>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <SecurityGrid />
        </ScrollReveal>
      </Section>

      {/* S7 — PRICING */}
      <Section bg="#F5F3EF" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>TARIFS</Eyebrow>
          <SectionTitle>Transparent. Sans engagement.</SectionTitle>
        </ScrollReveal>
        <div style={{ marginTop: 40 }}>
          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <PricingCards note="Tarif fondateur disponible pour les structures pilotes. Déploiement accompagné. Formation incluse." />
          </ScrollReveal>
        </div>
      </Section>

      {/* S8 — FONDATRICE + CTA */}
      <Section bg="#1A1A2E" py={80}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <FounderBio variant="dark" />
        </ScrollReveal>

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "48px 0" }} />

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <SectionTitle light>Prêt à structurer vos parcours ?</SectionTitle>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.60)", maxWidth: 460, lineHeight: 1.65, margin: 0 }}>
              15 minutes pour voir Nami en action sur vos cas cliniques.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              <a href="mailto:contact@namipourlavie.com" style={{
                padding: "14px 32px",
                borderRadius: 100,
                background: "#fff",
                color: "#1A1A2E",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "inherit",
              }}>
                Demander une démo →
              </a>
              <a href="mailto:contact@namipourlavie.com" style={{
                padding: "14px 24px",
                borderRadius: 100,
                border: "1.5px solid rgba(255,255,255,0.20)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "inherit",
              }}>
                contact@namipourlavie.com
              </a>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 24, lineHeight: 1.8 }}>
              Nami · Coordination des parcours de soins<br />
              Conforme RGPD · Art. L.1110-12 CSP<br />
              Nami n&apos;est pas un dispositif médical au sens du règlement (UE) 2017/745.
            </p>
          </div>
        </ScrollReveal>
      </Section>

    </div>
  )
}
