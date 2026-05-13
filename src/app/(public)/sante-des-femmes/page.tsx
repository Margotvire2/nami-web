// app/(public)/sante-des-femmes/page.tsx
//
// Page Nami dédiée — Santé des Femmes (v2)
// Audience : décideurs Région Île-de-France, FemTech, Assises 28 mai 2026
// Non-indexée — lien partagé en mail / DM
//
// Structure narrative : Hero → Contexte → Problème → Solution soignants
// → Solution patientes → Dark final → Footer légal

import type { Metadata } from "next"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { AmbientGlow } from "@/components/pitch/AmbientGlow"

export const metadata: Metadata = {
  title: "Nami — Santé des femmes · La coordination des parcours TCA & obésité",
  description:
    "TCA et obésité complexe pèsent en premier sur les femmes. Soignants peu spécialisés, errance, jugement, isolement. Nami outille les soignants et reconnecte les patientes.",
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

const EYEBROW_TEAL = { ...EYEBROW, color: "#2BA89C" }
const EYEBROW_DARK = { ...EYEBROW, color: "rgba(255,255,255,0.4)" }

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

const BODY_LARGE = {
  fontSize: 18,
  lineHeight: 1.65,
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

const PLAYFAIR_ITALIC = {
  fontFamily: "var(--font-playfair), Georgia, serif",
  fontStyle: "italic" as const,
}

const PAIN_POINTS = [
  {
    title: "Une errance entre soignants qui ne se parlent pas",
    body: "Médecin traitant, psychologue, diététicienne, psychiatre, parfois endocrinologue. Chacun compétent dans son silo. Aucun outil partagé. La patiente devient l'agent de coordination de sa propre maladie.",
  },
  {
    title: "Des soignants peu spécialisés sur ces pathologies",
    body: "Les TCA et l'obésité complexe demandent une expertise spécifique que peu de soignants ville ont. Résultat : conseils contradictoires, recommandations parfois dangereuses, sentiment de mauvaise prise en charge — et perte de confiance dans le système de soin.",
  },
  {
    title: "Le jugement médical, la grossophobie, la stigmatisation",
    body: "Des femmes en situation d'obésité qui ne consultent plus, parce qu'elles savent qu'on leur reparlera de leur poids avant leurs symptômes. Des patientes TCA infantilisées ou caricaturées. Une pathologie qu'on ne prend pas au sérieux parce qu'elle est lue comme un choix.",
  },
  {
    title: "L'isolement",
    body: "Beaucoup de femmes ne sortent presque plus de chez elles. Elles ne connaissent personne qui vit la même chose. Elles se croient seules. Les forums en ligne qui existent sont souvent dangereux — contenus pro-ana, comparaison, déclencheurs.",
  },
] as const

const SOIGNANTS_CARDS = [
  {
    icon: "📋",
    title: "Un dossier de coordination partagé",
    body: "Médecin, diététicienne, psychologue, infirmière : chacun voit ce que les autres ont fait. La patiente ne répète plus son histoire à chaque rendez-vous.",
  },
  {
    icon: "📚",
    title: "Une base documentaire sourcée",
    body: "60 000 sources cliniques (HAS, FFAB, ICHD-3, recommandations internationales) accessibles en contexte de consultation. Le soignant ville s'appuie sur la même base de connaissance qu'un centre expert.",
  },
  {
    icon: "🔗",
    title: "Une continuité entre les rendez-vous",
    body: "Le suivi quotidien de la patiente (repas, humeur, symptômes) remonte dans le dossier. Quand elle revient en consultation, le soignant a le contexte des trois dernières semaines, pas juste le moment présent.",
  },
  {
    icon: "⚙️",
    title: "L'économie du forfait, rendue applicable",
    body: "Le Parcours Coordonné Renforcé ouvert le 5 mai 2026 ne tient son économie que si la coordination est outillée. Nami est le levier qui permet aux 269 structures éligibles de rendre le forfait opérationnel.",
  },
] as const

const PATIENTES_CARDS = [
  {
    icon: "🤝",
    title: "Une communauté qui rompt l'isolement",
    body: "Un espace modéré par les soignants où les patientes se retrouvent entre elles. Sans contenu déclencheur, sans comparaison de poids, sans culture pro-ana. Juste des femmes qui vivent la même chose et qui se comprennent.",
  },
  {
    icon: "🎓",
    title: "Une éducation thérapeutique fiable",
    body: "Comprendre sa pathologie, ses mécanismes, ses enjeux. Travailler la santé mentale, la santé physique, le rapport à l'alimentation. Contenu construit avec des soignants spécialisés — alternative aux forums en ligne souvent dangereux.",
  },
  {
    icon: "📓",
    title: "Un suivi quotidien sans solitude",
    body: "Repas, humeur, symptômes, ressentis — la patiente documente son quotidien à son rythme. Ces données nourrissent son parcours et apparaissent dans le dossier de coordination de ses soignants. Plus de rupture entre les rendez-vous.",
  },
  {
    icon: "💬",
    title: "Un espace sans jugement",
    body: "Pas de moralisation, pas de grossophobie, pas d'infantilisation. Nami part du principe que ces femmes sont des adultes capables, qui ont besoin de soutien — pas d'injonctions. La parole y est libre, sans peur d'être ramenée à son poids.",
  },
  {
    icon: "🌱",
    title: "Reconstruire son rapport à soi",
    body: "Au-delà des symptômes, c'est le rapport au corps, à l'alimentation, à soi-même qu'il s'agit de reconstruire. Nami accompagne ce travail long, par étapes, sans promettre de guérison miracle.",
  },
  {
    icon: "🧭",
    title: "Une boussole dans le parcours de soin",
    body: "Quels soignants voir, dans quel ordre, à quels signaux faire attention. Nami structure le parcours pour que la patiente n'ait pas à le construire seule, en sortie de consultation, sur Google.",
  },
] as const

const REGION_CARDS = [
  {
    eyebrow: "Stratégie Smart Santé 2023–2026",
    title: "La santé des femmes comme axe prioritaire",
    body: "L'un des cinq axes Smart Santé identifiés par la Région : la santé des femmes comme enjeu d'égalité, de santé publique et de souveraineté économique.",
  },
  {
    eyebrow: "Parcours Coordonné Renforcé",
    title: "Le forfait obésité complexe ouvert le 5 mai 2026",
    body: "269 structures éligibles en France. Nami rend le forfait applicable. Demain, TCA, oncologie, BPCO suivront la même logique.",
  },
  {
    eyebrow: "Écosystème Catalyseur Santé",
    title: "Implantation à Suresnes en juin 2026",
    body: "Nami rejoint le Catalyseur Santé de Paris Ouest La Défense — déploiement avec les réseaux TCA franciliens, projet de recherche en cours de cadrage.",
  },
] as const

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
                maxWidth: "16ch",
              }}
            >
              Soigner ce que la France{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ne sait pas accompagner
              </span>
              .
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
              massivement sur les femmes. Pathologies méconnues, soignants peu
              spécialisés, errance entre les rendez-vous, jugement médical. Nami
              construit l&apos;infrastructure qui change ça — pour les soignants, pour
              les patientes.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.45} duration={0.6}>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              Outil de coordination · Non dispositif médical · Conforme RGPD
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2 — CONTEXTE                          */}
      {/* ============================================ */}
      <section
        style={{
          background: "#F5F3EF",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Le contexte</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "22ch", marginBottom: 40 }}>
              Trois pathologies qui ne touchent pas n&apos;importe qui.
            </h2>
          </ScrollReveal>

          <div style={{ maxWidth: 760, marginBottom: 56 }}>
            <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
              <p style={{ ...BODY_LARGE, marginBottom: 18 }}>
                Les TCA touchent 900 000 personnes en France. L&apos;anorexie mentale
                concerne 90 % de femmes, la boulimie 75 %, l&apos;hyperphagie boulimique
                65 %.
              </p>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
              <p style={{ ...BODY_LARGE, marginBottom: 18 }}>
                L&apos;obésité complexe concerne 3,3 millions d&apos;adultes et frappe les
                femmes plus durement : prises de poids hormonales (puberté, grossesse,
                péri-ménopause), stigmatisation professionnelle, jugement médical.
              </p>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.25} duration={0.7}>
              <p style={BODY_LARGE}>
                Ces pathologies partagent un point commun : elles sont méconnues des
                soignants non spécialisés. Les centres experts sont saturés. Et la
                France ne formera jamais assez de spécialistes pour absorber la
                demande.
              </p>
            </ScrollReveal>
          </div>

          {/* Stats — séparées par border-top */}
          <div
            style={{
              borderTop: "1px solid rgba(26,26,46,0.08)",
              paddingTop: 48,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 32,
            }}
          >
            <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
              <div>
                <div style={{ ...STAT_NUMBER_BASE, color: "#5B4EC4" }}>
                  <AnimatedCounter target={90} suffix="%" duration={1800} />
                </div>
                <div style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                  des patients anorexiques sont des femmes.
                </div>
                <div style={SOURCE}>HAS · INSERM · FFAB</div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.25} duration={0.7}>
              <div>
                <div style={{ ...STAT_NUMBER_BASE, color: "#2BA89C" }}>12,7 Md€</div>
                <div style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                  coût collectif annuel de l&apos;obésité en France (2024).
                </div>
                <div style={SOURCE}>Astérès · Novo Nordisk 2024</div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.35} duration={0.7}>
              <div>
                <div style={{ ...STAT_NUMBER_BASE, color: "#5B4EC4" }}>
                  <AnimatedCounter target={273000} duration={2200} />
                </div>
                <div style={{ fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                  femmes en France sans emploi à cause de leur obésité.
                </div>
                <div style={SOURCE}>Astérès 2025</div>
              </div>
            </ScrollReveal>
          </div>

          {/* Phrase transition Astérès */}
          <ScrollReveal variant="fade-up" delay={0.5} duration={0.8}>
            <div
              style={{
                marginTop: 80,
                textAlign: "center",
                maxWidth: 820,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <p
                style={{
                  ...PLAYFAIR_ITALIC,
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  lineHeight: 1.4,
                  color: "#1A1A2E",
                  margin: 0,
                }}
              >
                « L&apos;obésité pèse exclusivement sur la carrière des femmes. On ne
                voit pas d&apos;effet significatif sur celle des hommes. »
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                — Étude Astérès pour Novo Nordisk, 2025
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3 — PROBLÈME                          */}
      {/* ============================================ */}
      <section
        style={{
          background: "#FAFAF8",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>Le problème</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "22ch", marginBottom: 32 }}>
              Pour ces femmes, le parcours de soins est une seconde épreuve.
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
            <p style={{ ...BODY_LARGE, maxWidth: 760, marginBottom: 56 }}>
              Ce que je vois chaque semaine en consultation à l&apos;Hôpital
              Américain : des patientes qui ne se sentent pas comprises, qui
              s&apos;épuisent à répéter leur histoire, et qui finissent par ne plus
              prendre leur propre pathologie au sérieux — parce que personne autour
              d&apos;elles ne le fait.
            </p>
          </ScrollReveal>

          {/* 4 douleurs numérotées */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 880 }}>
            {PAIN_POINTS.map((point, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={0.15 + i * 0.08} duration={0.7}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#5B4EC4",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-inter), system-ui",
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "-0.01em",
                    }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <h3
                      style={{
                        fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                        fontWeight: 700,
                        letterSpacing: "-0.015em",
                        lineHeight: 1.3,
                        color: "#1A1A2E",
                        margin: "0 0 8px",
                      }}
                    >
                      {point.title}
                    </h3>
                    <p style={BODY}>{point.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Phrase transition centrée */}
          <ScrollReveal variant="fade-up" delay={0.5} duration={0.8}>
            <p
              style={{
                ...PLAYFAIR_ITALIC,
                fontSize: "clamp(1.3rem, 2.6vw, 1.8rem)",
                lineHeight: 1.45,
                color: "#1A1A2E",
                margin: "72px auto 0",
                maxWidth: 760,
                textAlign: "center",
              }}
            >
              Pas un problème de compétences.{" "}
              <span style={{ color: "#5B4EC4" }}>
                Un problème d&apos;orchestration et d&apos;accompagnement.
              </span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4 — SOLUTION CÔTÉ SOIGNANTS           */}
      {/* ============================================ */}
      <section
        style={{
          background: "#F5F3EF",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW}>La solution · côté soignants</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "22ch", marginBottom: 32 }}>
              Outiller les soignants qui sont déjà là.
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
            <p style={{ ...BODY_LARGE, maxWidth: 760, marginBottom: 56 }}>
              Plutôt qu&apos;attendre la formation de milliers de spécialistes que la
              France ne produira jamais, Nami permet à un soignant ville non
              spécialisé d&apos;offrir une prise en charge équivalente à celle d&apos;un
              centre expert.
            </p>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {SOIGNANTS_CARDS.map((card, i) => (
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
                  <div
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      marginBottom: 18,
                      filter: "saturate(0.85)",
                    }}
                    aria-hidden="true"
                  >
                    {card.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      color: "#1A1A2E",
                      margin: "0 0 12px",
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
      {/* SECTION 5 — SOLUTION CÔTÉ PATIENTES           */}
      {/* ============================================ */}
      <section
        style={{
          background: "#FAFAF8",
          padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        }}
      >
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW_TEAL}>La solution · côté patientes</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h2 style={{ ...H2, maxWidth: "22ch", marginBottom: 32 }}>
              Reconnecter ce que la maladie a coupé.
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
            <p style={{ ...BODY_LARGE, maxWidth: 760, marginBottom: 56 }}>
              L&apos;application Nami n&apos;est pas un journal de symptômes. C&apos;est un
              espace où une femme atteinte de TCA ou d&apos;obésité retrouve trois
              choses que la maladie lui a prises :{" "}
              <span style={{ fontWeight: 600, color: "#1A1A2E" }}>du lien</span>,{" "}
              <span style={{ fontWeight: 600, color: "#1A1A2E" }}>du savoir fiable</span>
              , et{" "}
              <span style={{ fontWeight: 600, color: "#1A1A2E" }}>
                un accompagnement quotidien sans jugement
              </span>
              .
            </p>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {PATIENTES_CARDS.map((card, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={0.15 + i * 0.06} duration={0.7}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid rgba(26,26,46,0.06)",
                    padding: "28px 30px 32px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      marginBottom: 18,
                      filter: "saturate(0.85)",
                    }}
                    aria-hidden="true"
                  >
                    {card.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      color: "#1A1A2E",
                      margin: "0 0 12px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ ...BODY, fontSize: 14.5 }}>{card.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Phrase de clôture */}
          <ScrollReveal variant="fade-up" delay={0.5} duration={0.8}>
            <p
              style={{
                ...PLAYFAIR_ITALIC,
                fontSize: "clamp(1.3rem, 2.6vw, 1.8rem)",
                lineHeight: 1.45,
                color: "#1A1A2E",
                margin: "72px auto 0",
                maxWidth: 760,
                textAlign: "center",
              }}
            >
              Le médical d&apos;un côté,{" "}
              <span style={{ color: "#2BA89C" }}>l&apos;accompagnement du quotidien</span>{" "}
              de l&apos;autre. Ni l&apos;un ni l&apos;autre ne suffit seul.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6 — DARK FINALE                       */}
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
          {/* Bloc 1 — Fondatrice */}
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

          {/* Bloc 2 — Alignement Région */}
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={EYEBROW_DARK}>L&apos;alignement avec la Région Île-de-France</div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.75)",
                maxWidth: 720,
                marginBottom: 40,
              }}
            >
              Trois tailwinds franciliens font de cette période la bonne fenêtre
              pour structurer la prise en charge des parcours TCA et obésité
              complexe.
            </p>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {REGION_CARDS.map((card, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={0.15 + i * 0.08} duration={0.7}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "24px 26px 28px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(91,78,196,0.85)",
                      marginBottom: 12,
                    }}
                  >
                    {card.eyebrow}
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "-0.005em",
                      lineHeight: 1.3,
                      color: "#fff",
                      margin: "0 0 10px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: "rgba(255,255,255,0.65)",
                      margin: 0,
                    }}
                  >
                    {card.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "64px 0" }} />

          {/* Bloc 3 — CTA */}
          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <h3
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                color: "#fff",
                margin: "0 0 24px",
                maxWidth: "26ch",
              }}
            >
              Faisons de l&apos;Île-de-France un territoire où aucune femme
              n&apos;est laissée seule avec sa pathologie.
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
                href="/gabrielle"
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
                Voir le cas Gabrielle →
              </Link>
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

      {/* ============================================ */}
      {/* SECTION 7 — FOOTER LÉGAL                      */}
      {/* ============================================ */}
      <section
        style={{
          background: "#FAFAF8",
          padding: "40px clamp(24px, 6vw, 80px)",
          borderTop: "1px solid rgba(26,26,46,0.06)",
        }}
      >
        <div style={CTR}>
          <p style={{ fontSize: 11, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Nami — Outil de coordination des parcours de soins · Non dispositif
            médical au sens du règlement (UE) 2017/745 · Conforme RGPD · Article
            L.1110-12 du Code de la Santé Publique
          </p>
          <p style={{ fontSize: 11, color: "#6B7280", margin: "8px 0 0", lineHeight: 1.6 }}>
            Sources : HAS · INSERM · FFAB · Astérès 2024–2025 · Région Île-de-France
            (Smart Santé 2023–2026)
          </p>
        </div>
      </section>
    </div>
  )
}
