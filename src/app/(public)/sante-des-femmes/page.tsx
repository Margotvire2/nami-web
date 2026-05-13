// app/(public)/sante-des-femmes/page.tsx
//
// Page Nami dédiée — Santé des Femmes
// Audience : décideurs Région Île-de-France, FemTech, Assises 28 mai 2026
// Non-indexée — lien partagé en mail / DM
//
// Respecte strictement le design system Nami :
// - Couleurs : #FAFAF8 / #F5F3EF / #1A1A2E, gradient violet (#5B4EC4) → teal (#2BA89C)
// - Easing : cubic-bezier(0.16, 1, 0.3, 1)
// - Typo : Plus Jakarta Sans (titres), Inter (data), Playfair Display (citation)
// - Max 2 sections sombres par page (1 ici)
// - Wording MDR safe : "coordination", "indicateurs de complétude"

import type { Metadata } from "next"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { AmbientGlow } from "@/components/pitch/AmbientGlow"

export const metadata: Metadata = {
  title: "Nami — Santé des femmes · La coordination des parcours TCA & obésité",
  description:
    "La dette de coordination des parcours pluridisciplinaires pèse en premier sur les femmes. Anorexie, obésité complexe : Nami outille les soignants et reconnecte les patientes.",
  robots: { index: false, follow: false },
}

const CTR = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 clamp(20px, 5vw, 80px)",
  width: "100%",
}

const EYEBROW = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#5B4EC4",
  marginBottom: 14,
}

const EYEBROW_DARK = {
  ...EYEBROW,
  color: "rgba(255,255,255,0.4)",
}

const H2 = {
  fontSize: "clamp(2rem, 5vw, 3.8rem)",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  lineHeight: 1.1,
  color: "#1A1A2E",
  marginBottom: 24,
}

const BODY = {
  fontSize: 16,
  lineHeight: 1.6,
  color: "#374151",
}

const SOURCE = {
  fontSize: 11,
  color: "#6B7280",
  fontStyle: "italic" as const,
  marginTop: 8,
}

const STAT_NUMBER_BASE = {
  fontFamily: "var(--font-inter), system-ui",
  fontSize: "clamp(3.5rem, 7vw, 6rem)",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  lineHeight: 1,
  marginBottom: 12,
  display: "block",
} as const

export default function SanteDesFemmesPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif", background: "#FAFAF8" }}>
      {/* ============================================ */}
      {/* SECTION 1 — HERO                              */}
      {/* ============================================ */}
      <section
        style={{
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
          background: "#FAFAF8",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ ...CTR, maxWidth: 1200 }}>
          <ScrollReveal variant="fade-up" delay={0} duration={0.7}>
            <div style={EYEBROW}>Santé des femmes · Île-de-France</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.8}>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 7.5vw, 5.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.08,
                color: "#1A1A2E",
                margin: "0 0 28px",
                maxWidth: "14ch",
              }}
            >
              La dette de{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                coordination
              </span>{" "}
              est une dette féminine.
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
            <p
              style={{
                fontSize: "clamp(15px, 1.8vw, 19px)",
                lineHeight: 1.65,
                color: "#374151",
                maxWidth: 720,
                margin: "0 0 36px",
              }}
            >
              Les troubles du comportement alimentaire et l&apos;obésité complexe pèsent
              massivement sur les femmes. La France les traite mal — pas par manque de
              compétences, par défaut d&apos;orchestration. Nami construit l&apos;infrastructure
              qui change ça.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.45} duration={0.6}>
            <p
              style={{
                fontSize: 13,
                color: "#6B7280",
                margin: 0,
              }}
            >
              Outil de coordination · Non dispositif médical · Conforme RGPD
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2 — LE CONSTAT CHIFFRÉ                */}
      {/* ============================================ */}
      <section
        style={{
          background: "#F5F3EF",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Trois pathologies, un même angle mort</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "18ch", marginBottom: 60 }}>
              La fragmentation des soins n&apos;est pas neutre.
            </h2>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 32,
              marginTop: 40,
            }}
          >
            {/* Stat 1 — Anorexie 90% */}
            <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
              <div>
                <div style={{ ...STAT_NUMBER_BASE, color: "#5B4EC4" }}>
                  <AnimatedCounter target={90} suffix="%" duration={1800} />
                </div>
                <div style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                  des patients atteints d&apos;anorexie mentale sont des femmes.
                </div>
                <div style={SOURCE}>HAS · INSERM · FFAB</div>
              </div>
            </ScrollReveal>

            {/* Stat 2 — Obésité 12,7 Md€ (texte statique : decimals non supportés par AnimatedCounter) */}
            <ScrollReveal variant="fade-up" delay={0.25} duration={0.7}>
              <div>
                <div style={{ ...STAT_NUMBER_BASE, color: "#2BA89C" }}>
                  12,7 Md€
                </div>
                <div style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                  Coût collectif annuel de l&apos;obésité en France en 2024.
                </div>
                <div style={SOURCE}>Astérès · Novo Nordisk 2024</div>
              </div>
            </ScrollReveal>

            {/* Stat 3 — Femmes sans emploi 273 000 */}
            <ScrollReveal variant="fade-up" delay={0.35} duration={0.7}>
              <div>
                <div style={{ ...STAT_NUMBER_BASE, color: "#5B4EC4" }}>
                  <AnimatedCounter target={273000} duration={2200} />
                </div>
                <div style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                  femmes en France sont sans emploi en raison de leur obésité.
                </div>
                <div style={SOURCE}>Astérès 2025</div>
              </div>
            </ScrollReveal>
          </div>

          {/* Citation Astérès */}
          <ScrollReveal variant="fade-up" delay={0.5} duration={0.8}>
            <blockquote
              style={{
                marginTop: 80,
                paddingLeft: 28,
                borderLeft: "3px solid #5B4EC4",
                maxWidth: 760,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  lineHeight: 1.4,
                  color: "#1A1A2E",
                  margin: 0,
                }}
              >
                « L&apos;obésité pèse exclusivement sur la carrière des femmes. On ne voit
                pas d&apos;effet significatif sur celle des hommes. »
              </p>
              <footer
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginTop: 16,
                  fontStyle: "normal",
                }}
              >
                Nicolas Bouzou, étude Astérès pour Novo Nordisk, 2025
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3 — L'INSIGHT (thèse fondatrice)      */}
      {/* ============================================ */}
      <section
        style={{
          background: "#FAFAF8",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={{ ...CTR, maxWidth: 900 }}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Notre conviction</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.8}>
            <h2 style={{ ...H2, maxWidth: "22ch" }}>
              On ne formera jamais assez de spécialistes.
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.25} duration={0.7}>
            <p style={{ ...BODY, fontSize: 18, lineHeight: 1.65, maxWidth: 680, marginBottom: 20 }}>
              Les centres experts en TCA et en obésité complexe sont saturés. Les
              spécialistes formés en France n&apos;absorberont jamais la demande. Et
              pendant ce temps, les patientes restent en errance, parfois pendant
              des années.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.35} duration={0.7}>
            <p style={{ ...BODY, fontSize: 18, lineHeight: 1.65, maxWidth: 680, fontWeight: 600, color: "#1A1A2E" }}>
              La seule réponse à l&apos;échelle : outiller les soignants qui sont déjà là
              — généralistes, diététiciens, psychologues, infirmiers, kinés —
              pour qu&apos;ils coordonnent la prise en charge avec la même qualité qu&apos;un
              centre expert.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4 — LES DEUX FACES DE NAMI            */}
      {/* ============================================ */}
      <section
        style={{
          background: "#F5F3EF",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Comment Nami fonctionne</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "24ch", marginBottom: 64 }}>
              Deux faces, une même mission.
            </h2>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 32,
            }}
          >
            {/* Card soignants */}
            <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid rgba(26,26,46,0.06)",
                  padding: "36px 36px 40px",
                  height: "100%",
                }}
              >
                <div style={{ ...EYEBROW, color: "#5B4EC4", marginBottom: 20 }}>
                  Côté soignants
                </div>
                <h3
                  style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    color: "#1A1A2E",
                    margin: "0 0 20px",
                  }}
                >
                  Un cockpit de coordination clinique.
                </h3>
                <p style={{ ...BODY, marginBottom: 16 }}>
                  Un dossier de coordination partagé entre tous les professionnels
                  d&apos;un même parcours. Chacun voit ce que les autres ont fait,
                  documenté, prévu.
                </p>
                <p style={{ ...BODY, marginBottom: 16 }}>
                  Une base documentaire de 60 000 sources cliniques sourcées
                  (HAS, FFAB, ICHD-3, recommandations internationales) accessible en
                  contexte de consultation.
                </p>
                <p style={BODY}>
                  Le levier opérationnel qui rend applicable le forfait du Parcours
                  Coordonné Renforcé.
                </p>
              </div>
            </ScrollReveal>

            {/* Card patientes */}
            <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid rgba(26,26,46,0.06)",
                  padding: "36px 36px 40px",
                  height: "100%",
                }}
              >
                <div style={{ ...EYEBROW, color: "#2BA89C", marginBottom: 20 }}>
                  Côté patientes
                </div>
                <h3
                  style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    color: "#1A1A2E",
                    margin: "0 0 20px",
                  }}
                >
                  Une application qui crée du lien.
                </h3>
                <p style={{ ...BODY, marginBottom: 16 }}>
                  Ces pathologies isolent. Beaucoup de femmes ne sortent presque plus
                  de chez elles et ne connaissent personne qui vit la même chose.
                  Elles se croient seules.
                </p>
                <p style={{ ...BODY, marginBottom: 16 }}>
                  Nami leur permet de se retrouver entre elles, dans un espace
                  modéré, sans jugement, sans contenu déclencheur.
                </p>
                <p style={BODY}>
                  Une éducation thérapeutique au sens strict : comprendre sa
                  pathologie, travailler la santé mentale, la santé physique, le
                  rapport à l&apos;alimentation.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="fade-up" delay={0.5} duration={0.7}>
            <p
              style={{
                ...BODY,
                fontSize: 17,
                fontStyle: "italic",
                color: "#1A1A2E",
                marginTop: 56,
                textAlign: "center",
                maxWidth: 720,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Le médical d&apos;un côté, l&apos;accompagnement du quotidien de l&apos;autre —
              parce que ni l&apos;un ni l&apos;autre ne suffit seul.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4.5 — CAS GABRIELLE (rattachement)    */}
      {/* ============================================ */}
      <section
        style={{
          background: "#FAFAF8",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Un cas qui condense tout</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "22ch", marginBottom: 32 }}>
              Gabrielle, 10 ans.
            </h2>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 32,
              alignItems: "stretch",
            }}
          >
            <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
              <div style={{ maxWidth: 580 }}>
                <p style={{ ...BODY, fontSize: 17, lineHeight: 1.65, marginBottom: 18 }}>
                  Anorexie mentale dans un contexte de harcèlement scolaire. Médecin
                  traitant, psychologue, diététicienne. Chacun compétent dans son silo.
                </p>
                <p style={{ ...BODY, fontSize: 17, lineHeight: 1.65, marginBottom: 18 }}>
                  Les parents coordonnaient les soins par SMS. Quatre mois perdus avant
                  une décision collective.
                </p>
                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.65,
                    color: "#1A1A2E",
                    fontWeight: 600,
                    marginBottom: 0,
                  }}
                >
                  Ce n&apos;était pas un manque de compétences. C&apos;était un défaut
                  d&apos;orchestration.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid rgba(26,26,46,0.06)",
                  padding: "32px 32px 36px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 220,
                }}
              >
                <div>
                  <div style={{ ...EYEBROW, marginBottom: 14 }}>Cas fondateur Nami</div>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: "#374151",
                      marginBottom: 24,
                    }}
                  >
                    L&apos;histoire complète, les acteurs, la chronologie, et ce que Nami
                    aurait changé.
                  </p>
                </div>
                <Link
                  href="/gabrielle"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#5B4EC4",
                    textDecoration: "none",
                    letterSpacing: "-0.005em",
                  }}
                >
                  Lire le cas Gabrielle <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5 — ALIGNEMENT AVEC LA RÉGION         */}
      {/* ============================================ */}
      <section
        style={{
          background: "#F5F3EF",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Pourquoi maintenant, pourquoi l&apos;Île-de-France</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "22ch", marginBottom: 56 }}>
              Trois tailwinds alignés.
            </h2>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                eyebrow: "Stratégie Smart Santé 2023–2026",
                title: "La santé des femmes comme axe prioritaire de la Région",
                body: "Nami s'inscrit dans l'un des cinq axes Smart Santé identifiés par la Région : la santé des femmes, traitée comme un enjeu d'égalité, de santé publique et de souveraineté économique.",
              },
              {
                eyebrow: "Parcours Coordonné Renforcé",
                title: "Le forfait obésité complexe ouvert le 5 mai 2026",
                body: "269 structures éligibles en France. Le PCR ne tient son économie que si la coordination est outillée — c'est ce que Nami apporte. Demain, les TCA, l'oncologie, la BPCO suivront la même logique.",
              },
              {
                eyebrow: "Écosystème Catalyseur Santé",
                title: "Implantation à Suresnes en juin 2026",
                body: "Nami rejoint le Catalyseur Santé de Paris Ouest La Défense en juin — déploiement avec les réseaux TCA franciliens, projet de recherche en cours de cadrage pour adosser scientifiquement les indicateurs de coordination.",
              },
            ].map((card, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={0.15 + i * 0.08} duration={0.7}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid rgba(26,26,46,0.06)",
                    padding: "28px 30px 32px",
                    height: "100%",
                  }}
                >
                  <div style={{ ...EYEBROW, marginBottom: 14 }}>{card.eyebrow}</div>
                  <h3
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      color: "#1A1A2E",
                      margin: "0 0 14px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ ...BODY, fontSize: 14.5 }}>{card.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6 — FONDATRICE + CTA (fond sombre)    */}
      {/* ============================================ */}
      <section
        style={{
          background: "#1A1A2E",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AmbientGlow />
        <div style={{ ...CTR, position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW_DARK}>Qui porte Nami</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.8}>
            <h2
              style={{
                ...H2,
                color: "#fff",
                maxWidth: "22ch",
                marginBottom: 32,
              }}
            >
              Une clinicienne qui code l&apos;outil qu&apos;elle aurait voulu avoir en
              consultation.
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.75)",
                maxWidth: 720,
                marginBottom: 16,
              }}
            >
              Margot Vire est diététicienne-nutritionniste à l&apos;Hôpital Américain de
              Paris, spécialisée TCA, pédiatrie et obésité. ESSEC, Master 2 santé
              publique Paris-Saclay (parcours coordonnés et télésurveillance des
              maladies chroniques).
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.75)",
                maxWidth: 720,
                margin: 0,
              }}
            >
              Active dans 8 réseaux cliniques franciliens — FFAB, Réseau TCA
              Francilien, CPTS Neuilly, CPTS Levallois, Via Sana — Margot construit
              Nami depuis le terrain. Pas un MVP de fondatrice, un outil de
              clinicienne.
            </p>
          </ScrollReveal>

          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "64px 0" }} />

          {/* CTA bloc */}
          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h3
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                color: "#fff",
                margin: "0 0 24px",
                maxWidth: "24ch",
              }}
            >
              Construisons un Île-de-France où aucune patiente ne perd quatre mois
              dans le vide.
            </h3>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 640,
                marginBottom: 36,
              }}
            >
              Nami cherche un alignement opérationnel avec la Région Île-de-France :
              Assises Santé des Femmes du 28 mai, dispositif Innov&apos;Up, ouverture
              vers le Fonds FemTech au bon stade. La prochaine étape, c&apos;est une
              conversation.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3} duration={0.6}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a
                href="mailto:margot@namipourlavie.com"
                style={{
                  padding: "14px 30px",
                  borderRadius: 100,
                  background: "#fff",
                  color: "#1A1A2E",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 48,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.30)",
                }}
              >
                Échanger avec Margot
              </a>
              <Link
                href="/"
                style={{
                  padding: "14px 24px",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 48,
                }}
              >
                Découvrir Nami →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
