import type { Metadata } from "next"
import { PitchStickyDemo } from "@/components/pitch/PitchStickyDemo"
import { PitchPricing } from "@/components/pitch/PitchPricing"
import { PitchFounder } from "@/components/pitch/PitchFounder"
import { AmbientGlow } from "@/components/pitch/AmbientGlow"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"

export const metadata: Metadata = {
  title: "Nami — Présentation pour partenaire bancaire",
  description: "Modèle économique, projections 24 mois et plan de financement de Nami, plateforme SaaS de coordination des parcours de soins complexes.",
  robots: { index: true, follow: true },
}

// =============================================================================
// PAGE PITCH BANQUE
// =============================================================================
// Slug obscur volontaire. Pas indexée. Reuse maximal des composants existants.
// Ton : sobre, factuel, banque pro (pas VC). Pas de hockey stick, pas de
// "révolution", pas de "infrastructure qui crée le marché".
// =============================================================================

export default function PitchBanquePage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      {/* ===================================================================== */}
      {/* SECTION 1 — HERO CUSTOM (variant banque)                              */}
      {/* ===================================================================== */}
      <BanqueHero />

      {/* ===================================================================== */}
      {/* SECTION 2 — PROBLÈME & MARCHÉ                                         */}
      {/* ===================================================================== */}
      <BanqueMarche />

      {/* ===================================================================== */}
      {/* SECTION 3 — SOLUTION (sticky demo réutilisée)                         */}
      {/* ===================================================================== */}
      <PitchStickyDemo />

      {/* ===================================================================== */}
      {/* SECTION 4 — MODÈLE ÉCONOMIQUE (5 PRICING)                             */}
      {/* ===================================================================== */}
      <PitchPricing
        variant="vc"
        note="Mix client cible : 50 % tier IA (149 €/mois), 20 % Starter, 10 % Coordination, 10 % Pilote, 10 % Hospital. Marge brute SaaS supérieure à 85 %."
      />

      {/* ===================================================================== */}
      {/* SECTION 5 — STRATÉGIE D'ACQUISITION (14 réseaux)                      */}
      {/* ===================================================================== */}
      <BanqueStrategieAcquisition />

      {/* ===================================================================== */}
      {/* SECTION 6 — PROJECTIONS 24 MOIS                                       */}
      {/* ===================================================================== */}
      <BanqueProjections />

      {/* ===================================================================== */}
      {/* SECTION 7 — PLAN DE FINANCEMENT                                       */}
      {/* ===================================================================== */}
      <BanquePlanFinancement />

      {/* ===================================================================== */}
      {/* SECTION 8 — FONDATRICE (réutilisée, variant dark)                     */}
      {/* SECTION 9 — WHY NOW                                                    */}
      {/* SECTION 10 — RELATION BANCAIRE                                         */}
      {/* (regroupées en une seule section sombre, max 2 sombres par page)      */}
      {/* ===================================================================== */}
      <BanqueClotureSombre />

    </div>
  )
}

// =============================================================================
// SECTION 1 — HERO BANQUE
// =============================================================================
function BanqueHero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      background: "#FAFAF8",
      position: "relative",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 24,
          }}>
            DOSSIER PARTENAIRE BANCAIRE · CRÉATION SASU MAI 2026
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <h1 style={{
            fontSize: "clamp(2.2rem, 7.5vw, 5.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: "#1A1A2E",
            margin: "0 0 24px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Un modèle SaaS B2B,<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ancré dans le réseau clinique français.
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.25} duration={0.7}>
          <p style={{
            fontSize: "clamp(14px, 1.8vw, 18px)",
            lineHeight: 1.65,
            color: "#374151",
            maxWidth: 720,
            margin: "0 0 40px",
          }}>
            Nami structure la coordination entre soignants pour les patients à parcours complexes.
            5 tiers d'abonnement, 14 réseaux cliniques engagés, projections financières documentées
            sur 24 mois. Ce dossier présente le modèle, les hypothèses et le plan de financement.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.4} duration={0.7}>
          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            <a
              href="#projections"
              style={{
                padding: "14px 30px",
                borderRadius: 100,
                background: "#5B4EC4",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(91,78,196,0.30)",
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Voir les projections ↓
            </a>
            <a
              href="mailto:margot@namipourlavie.com"
              style={{
                fontSize: 14,
                color: "#6B7280",
                textDecoration: "none",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              margot@namipourlavie.com
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.55} duration={0.7}>
          <div style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: "1px solid rgba(26,26,46,0.08)",
            fontSize: 11,
            color: "#6B7280",
            fontStyle: "italic",
          }}>
            Document confidentiel · Dossier d'ouverture de relation bancaire · Avril 2026
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// =============================================================================
// SECTION 2 — MARCHÉ (3 stats banque)
// =============================================================================
function BanqueMarche() {
  return (
    <section style={{
      background: "#F5F3EF",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      position: "relative",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 14,
          }}>
            MARCHÉ ADRESSABLE
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
            Un marché structuré,<br />
            financé publiquement,<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              sans outil dédié à ce jour.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 64,
            maxWidth: 640,
            lineHeight: 1.6,
          }}>
            La coordination des parcours complexes est portée par les CPTS (Communautés
            Professionnelles Territoriales de Santé) et les CSO (Centres Spécialisés Obésité),
            financés par l'État. Aucun éditeur SaaS ne couvre aujourd'hui leur besoin opérationnel.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32,
          }}>
            <StatBlock
              value={600}
              suffix="+"
              color="#5B4EC4"
              label="CPTS validées en France, 104 actives en Île-de-France."
              source="Source : ARS, État des CPTS 2025"
            />
            <StatBlock
              value={269}
              color="#2BA89C"
              label="structures sélectionnées par l'ARS pour le PCR Obésité Complexe lancé en mars 2026."
              source="Source : Arrêté du 26 février 2026"
            />
            <StatBlock
              value={1772}
              color="#5B4EC4"
              label="praticiens adhérents adressables via les 14 réseaux ciblés en pipeline."
              source="Pipeline Nami — détail en annexe"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <p style={{
            marginTop: 56,
            fontSize: 14,
            color: "#6B7280",
            maxWidth: 720,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}>
            Concurrents adjacents : Doctolib (prise de RDV), Lifen (messagerie), Omnidoc
            (téléconsultation). Aucun ne couvre la coordination clinique multi-acteurs entre
            hôpital, ville et médico-social.
          </p>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 5 — STRATÉGIE D'ACQUISITION
// =============================================================================
function BanqueStrategieAcquisition() {
  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      position: "relative",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 14,
          }}>
            STRATÉGIE D'ACQUISITION
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
            Conquête réseau par réseau,<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              pas client par client.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 56,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            Chaque réseau clinique conquis active 50 % de ses adhérents en 10 mois. 22 % d'entre
            eux deviennent abonnés payants après 2 mois de découverte. Effet domino entre
            réseaux d'un même territoire.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>

            <AcquisitionCard
              titre="6 réseaux conquis fin 2026"
              detail="AHP Pédiatrie, TCA Francilien, FFAB, CPTS Neuilly-sur-Seine, CPTS Levallois-Perret, CPTS Boulogne-Billancourt"
              chiffre="60 paying"
              label="fin Année 1"
            />

            <AcquisitionCard
              titre="14 réseaux cumulés fin 2027"
              detail="Effet domino : CPTS 92 → CPTS Paris 15 (400 adhérents confirmés), Paris 16, 17 + CSO Sud, Nord, Centre/Est"
              chiffre="147 paying"
              label="fin Année 2"
            />

            <AcquisitionCard
              titre="Capital relationnel actif"
              detail="8 réseaux cliniques engagés via la fondatrice (FFAB, TCA Francilien, AHP, Via Sana, CPTS, CSO obésité)"
              chiffre="0 €"
              label="de marketing payant Y1"
            />

          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 6 — PROJECTIONS 24 MOIS
// =============================================================================
function BanqueProjections() {
  return (
    <section
      id="projections"
      style={{
        background: "#F5F3EF",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 14,
          }}>
            PROJECTIONS FINANCIÈRES — 24 MOIS
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
            Trésorerie positive<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              sur les 24 mois.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 56,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            Hypothèses prudentes : 50 % de saturation par réseau, 22 % de conversion paying,
            churn 2 % S2 2026 puis 2,5 % stabilisé. Mode bootstrap intégral en Année 1
            (présidente non rémunérée jusqu'à la levée seed prévue Q3 2027).
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid rgba(26,26,46,0.08)",
            boxShadow: "0 24px 64px rgba(26,26,46,0.08), 0 4px 12px rgba(26,26,46,0.04)",
            overflow: "hidden",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
              gap: 0,
            }}>

              <ProjHeader>Indicateur</ProjHeader>
              <ProjHeader>Année 1</ProjHeader>
              <ProjHeader>Année 2</ProjHeader>
              <ProjHeader>Cumul</ProjHeader>

              <ProjRow label="Clients payants (fin de période)" y1="60" y2="147" cumul="—" highlight />
              <ProjRow label="Revenus annuels (HT)" y1="65 K€" y2="260 K€" cumul="325 K€" />
              <ProjRow label="Charges annuelles (HT)" y1="15 K€" y2="66 K€" cumul="81 K€" />
              <ProjRow label="Résultat avant aides" y1="+50 K€" y2="+194 K€" cumul="+244 K€" />
              <ProjRow label="Aides publiques perçues" y1="67,5 K€" y2="100 K€" cumul="167,5 K€" />
              <ProjRow label="Résultat après aides" y1="+118 K€" y2="+294 K€" cumul="+411 K€" highlight />
              <ProjRow label="Trésorerie en fin de période" y1="117 K€" y2="411 K€" cumul="—" highlight last />

            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <p style={{
            marginTop: 32,
            fontSize: 13,
            color: "#6B7280",
            maxWidth: 720,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}>
            Le mois le plus tendu en trésorerie : juin 2026 à 12 K€ (creux normal post-création).
            Le détail mensuel des flux est disponible dans le fichier Excel joint.
          </p>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 7 — PLAN DE FINANCEMENT
// =============================================================================
function BanquePlanFinancement() {
  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      position: "relative",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 14,
          }}>
            PLAN DE FINANCEMENT
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
            182 500 €<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              dont 92 % en aides publiques.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 56,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            Apport personnel limité, levée privée différée à Q3 2027. La majorité du financement
            s'appuie sur les dispositifs Région Île-de-France et Bpifrance dédiés à l'innovation
            santé.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}>

            <FinancementBlock
              titre="Apports personnels"
              montant="15 000 €"
              detail="Capital social SASU 5 000 € + compte courant associé 10 000 €"
              statut="Confirmé / À confirmer"
              couleur="#5B4EC4"
            />

            <FinancementBlock
              titre="Aides Année 1"
              montant="67 500 €"
              detail="Initiative IDF 15K€ + Bpifrance 7,5K€ + Innov'up Faisabilité 30K€ + capital 15K€"
              statut="À candidater Q3-Q4 2026"
              couleur="#2BA89C"
            />

            <FinancementBlock
              titre="Aides Année 2"
              montant="100 000 €"
              detail="Innov'up Expérimentation 80K€ + TP'up 20K€"
              statut="Conditionné aux pilotes validés"
              couleur="#5B4EC4"
            />

          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <div style={{
            marginTop: 56,
            padding: "24px 28px",
            background: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid rgba(26,26,46,0.08)",
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#6B7280",
              marginBottom: 10,
            }}>
              JALONS HORS BUSINESS PLAN
            </div>
            <p style={{
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.6,
              margin: 0,
            }}>
              Une levée pré-seed (BSA-AIR, 150 K€) est envisagée pour mai 2027, suivie d'une
              levée seed (1,5 M€) au Q3 2027. <strong>Ces levées ne sont pas comptées dans les
              projections du business plan</strong> — elles constituent des jalons stratégiques
              indépendants. Le BP tient debout sans elles.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 8 + 9 + 10 — CLÔTURE SOMBRE
// (fondatrice + why now + relation bancaire — 1 seule section pour respecter
//  la règle "max 2 sections sombres par page")
// =============================================================================
function BanqueClotureSombre() {
  return (
    <section style={{
      background: "#1A1A2E",
      padding: "120px clamp(24px, 5vw, 80px) 80px",
      position: "relative",
      overflow: "hidden",
    }}>
      <AmbientGlow intensity="medium" />

      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Fondatrice */}
        <PitchFounder variant="dark" />

        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
          margin: "80px 0",
        }} />

        {/* Why now */}
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#2BA89C",
            marginBottom: 14,
          }}>
            CONTEXTE 2026
          </div>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            lineHeight: 1.1,
            margin: "0 0 40px",
            fontFamily: "var(--font-jakarta)",
            maxWidth: 800,
          }}>
            Trois fenêtres réglementaires<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              alignent ce démarrage.
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            <WhyNowCard
              titre="PCR Obésité Complexe"
              date="Mars 2026"
              detail="Lancement national, déploiement sur 269 structures sélectionnées par l'ARS. Candidatures ouvertes le 5 mai 2026."
            />
            <WhyNowCard
              titre="Statut JEII"
              date="Loi de finances 2026"
              detail="Seuil R&D abaissé à 5-20 %, exonération URSSAF jusqu'à 240 300 €/an. Critère impact santé applicable."
            />
            <WhyNowCard
              titre="Marché de la coordination"
              date="2026-2028"
              detail="Aucun acteur dédié installé. Fenêtre courte avant que Doctolib ou Lifen lance une feature équivalente."
            />
          </div>
        </ScrollReveal>

        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
          margin: "80px 0",
        }} />

        {/* Relation bancaire */}
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#2BA89C",
            marginBottom: 14,
          }}>
            CE QUE NOUS RECHERCHONS
          </div>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            lineHeight: 1.1,
            margin: "0 0 24px",
            fontFamily: "var(--font-jakarta)",
            maxWidth: 800,
          }}>
            Une relation bancaire pérenne,<br />
            pas un financement immédiat.
          </h2>
          <p style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 720,
            lineHeight: 1.7,
            margin: "0 0 48px",
          }}>
            L'objectif de cette présentation est l'ouverture d'un compte professionnel et la
            mise en place d'une relation de confiance. Nami est rentable dès la première année
            sur la base des projections présentées. La discussion sur les outils bancaires
            (carte, découvert, prêt éventuel) viendra naturellement avec l'historique du compte.
          </p>

          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            <a
              href="mailto:margot@namipourlavie.com"
              style={{
                padding: "14px 30px",
                borderRadius: 100,
                background: "#5B4EC4",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(91,78,196,0.30)",
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              margot@namipourlavie.com
            </a>
            <span style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
            }}>
              Margot Vire · Présidente fondatrice
            </span>
          </div>
        </ScrollReveal>

        {/* Footer légal */}
        <div style={{
          marginTop: 100,
          paddingTop: 32,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.6,
        }}>
          Document confidentiel — Diffusion restreinte au partenaire bancaire destinataire.
          Nami — Outil de coordination · Non dispositif médical · Conforme RGPD ·
          Art. L.1110-12 CSP · Hors DM au sens du règlement (UE) 2017/745.
        </div>

      </div>
    </section>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatBlock({ value, suffix = "", color, label, source }: {
  value: number
  suffix?: string
  color: string
  label: string
  source: string
}) {
  return (
    <div>
      <div style={{
        fontSize: "clamp(3.5rem, 7vw, 6rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        color,
        lineHeight: 1,
        marginBottom: 16,
        fontFamily: "var(--font-jakarta)",
      }}>
        <AnimatedCounter target={value} suffix={suffix} />
      </div>
      <div style={{
        fontSize: 14,
        color: "#374151",
        fontWeight: 500,
        marginBottom: 8,
        lineHeight: 1.5,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 11,
        color: "#6B7280",
        fontStyle: "italic",
      }}>
        {source}
      </div>
    </div>
  )
}

function AcquisitionCard({ titre, detail, chiffre, label }: {
  titre: string
  detail: string
  chiffre: string
  label: string
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: 32,
      border: "1px solid rgba(26,26,46,0.08)",
      boxShadow: "0 8px 24px rgba(26,26,46,0.06)",
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#1A1A2E",
        marginBottom: 12,
        lineHeight: 1.3,
      }}>
        {titre}
      </div>
      <div style={{
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 1.6,
        marginBottom: 24,
      }}>
        {detail}
      </div>
      <div style={{
        paddingTop: 20,
        borderTop: "1px solid rgba(26,26,46,0.06)",
      }}>
        <div style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#5B4EC4",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: 6,
        }}>
          {chiffre}
        </div>
        <div style={{
          fontSize: 12,
          color: "#6B7280",
          fontWeight: 500,
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function ProjHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: "16px 24px",
      background: "#F5F3EF",
      borderBottom: "1px solid rgba(26,26,46,0.08)",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#6B7280",
    }}>
      {children}
    </div>
  )
}

function ProjRow({ label, y1, y2, cumul, highlight, last }: {
  label: string
  y1: string
  y2: string
  cumul: string
  highlight?: boolean
  last?: boolean
}) {
  const cellStyle = {
    padding: "18px 24px",
    borderBottom: last ? "none" : "1px solid rgba(26,26,46,0.06)",
    fontSize: 15,
    fontFamily: "var(--font-jakarta)",
    background: highlight ? "rgba(91,78,196,0.04)" : "transparent",
  }
  return (
    <>
      <div style={{
        ...cellStyle,
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#1A1A2E" : "#374151",
      }}>
        {label}
      </div>
      <div style={{
        ...cellStyle,
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#5B4EC4" : "#374151",
        textAlign: "right" as const,
      }}>
        {y1}
      </div>
      <div style={{
        ...cellStyle,
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#5B4EC4" : "#374151",
        textAlign: "right" as const,
      }}>
        {y2}
      </div>
      <div style={{
        ...cellStyle,
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#1A1A2E" : "#374151",
        textAlign: "right" as const,
      }}>
        {cumul}
      </div>
    </>
  )
}

function FinancementBlock({ titre, montant, detail, statut, couleur }: {
  titre: string
  montant: string
  detail: string
  statut: string
  couleur: string
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: 32,
      border: "1px solid rgba(26,26,46,0.08)",
      boxShadow: "0 8px 24px rgba(26,26,46,0.06)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: couleur,
      }} />
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 12,
        marginTop: 8,
      }}>
        {titre}
      </div>
      <div style={{
        fontSize: 36,
        fontWeight: 800,
        color: "#1A1A2E",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        marginBottom: 16,
      }}>
        {montant}
      </div>
      <div style={{
        fontSize: 14,
        color: "#374151",
        lineHeight: 1.6,
        marginBottom: 20,
      }}>
        {detail}
      </div>
      <div style={{
        fontSize: 11,
        color: "#6B7280",
        fontStyle: "italic",
        paddingTop: 16,
        borderTop: "1px solid rgba(26,26,46,0.06)",
      }}>
        {statut}
      </div>
    </div>
  )
}

function WhyNowCard({ titre, date, detail }: {
  titre: string
  date: string
  detail: string
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 28,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#2BA89C",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 8,
      }}>
        {date}
      </div>
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        color: "#FFFFFF",
        lineHeight: 1.3,
        marginBottom: 14,
      }}>
        {titre}
      </div>
      <div style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.65)",
        lineHeight: 1.6,
      }}>
        {detail}
      </div>
    </div>
  )
}
