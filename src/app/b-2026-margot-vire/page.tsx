import type { Metadata } from "next"
import { PitchStickyDemo } from "@/components/pitch/PitchStickyDemo"
import { PitchPricing } from "@/components/pitch/PitchPricing"
import { AmbientGlow } from "@/components/pitch/AmbientGlow"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"

export const metadata: Metadata = {
  title: "Nami — Présentation pour partenaire bancaire",
  description: "Modèle économique, projections 24 mois et plan de financement de Nami, plateforme SaaS de coordination des parcours de soins complexes.",
  robots: { index: false, follow: false },
}

// =============================================================================
// PAGE PITCH BANQUE V2 — vendeuse ambitieuse factuelle
// =============================================================================
// Slug obscur volontaire. Pas indexée. Reuse maximal des composants existants.
// Ton : style /decouvrir hospital adapté banque. Vendeur sans VC bullshit.
// Fondatrice incarnée comme asset différenciant.
// =============================================================================

export default function PitchBanquePage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
      <BanqueHero />
      <BanqueMarche />
      <PitchStickyDemo />
      <BanqueTraction />
      <BanquePricingIntro />
      <PitchPricing
        variant="vc"
        note="Mix client cible : 50 % tier IA (149 €/mois), 20 % Starter, 10 % Coordination, 10 % Pilote, 10 % Hospital. Marge brute SaaS supérieure à 85 %."
      />
      <BanqueStrategie />
      <BanqueProjections />
      <BanquePlanFinancement />
      <BanqueEcosysteme />
      <BanqueFondatrice />
      <BanqueCloture />
    </div>
  )
}

// =============================================================================
// SECTION 1 — HERO
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
            CRÉATION SASU MAI 2026 · ÎLE-DE-FRANCE
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
            Le marché de la coordination<br />
            ambulatoire{" "}
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              n&apos;a pas encore de leader.
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.25} duration={0.7}>
          <p style={{
            fontSize: "clamp(14px, 1.8vw, 18px)",
            lineHeight: 1.65,
            color: "#374151",
            maxWidth: 760,
            margin: "0 0 40px",
          }}>
            600 CPTS françaises sans outil dédié. 269 structures sélectionnées par l&apos;ARS pour
            le PCR Obésité Complexe lancé en mars 2026. Aucun acteur installé. Nami avance
            avec <strong>8 réseaux cliniques déjà engagés</strong>, l&apos;accompagnement de Wilco,
            Medicen et du Catalyseur Santé, et une fondatrice qui a vu le bug en consultation
            avant de le coder.
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
            Document confidentiel · Diffusion restreinte au partenaire bancaire destinataire
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// =============================================================================
// SECTION 2 — MARCHÉ
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
            POURQUOI MAINTENANT
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
            Trois fenêtres réglementaires<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              s&apos;ouvrent en 2026.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 64,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            La France pousse les patients hors de l&apos;hôpital. Mais le virage ambulatoire ne
            fonctionne que si 5 libéraux se coordonnent aussi bien qu&apos;une équipe hospitalière.
            Aujourd&apos;hui, ils n&apos;ont aucun outil commun. <strong>Nami est ce couloir.</strong>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32,
          }}>
            <StatBlock
              value={100}
              suffix=" Md€"
              color="#5B4EC4"
              label="dépensés chaque année en hospitalisation — que le virage ambulatoire veut réduire."
              source="Comptes de la santé 2024"
            />
            <StatBlock
              value={269}
              color="#2BA89C"
              label="structures sélectionnées par l'ARS pour le PCR Obésité Complexe lancé en mars 2026."
              source="Arrêté du 26 février 2026"
            />
            <StatBlock
              value={1772}
              color="#5B4EC4"
              label="praticiens adhérents adressables via les 14 réseaux ciblés en Île-de-France."
              source="Pipeline Nami avril 2026"
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
            Concurrents adjacents : Doctolib (RDV), Lifen (messagerie), Omnidoc (téléconsultation).
            Aucun ne couvre la coordination clinique multi-acteurs entre hôpital, ville et
            médico-social. La fenêtre est ouverte. Elle ne le restera pas longtemps.
          </p>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 4 — TRACTION QUALITATIVE
// =============================================================================
function BanqueTraction() {
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
            TRACTION
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
            8 réseaux engagés.<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              0 € de marketing. 6 mois.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 56,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            Le capital relationnel de la fondatrice — diététicienne en exercice à l&apos;Hôpital
            Américain de Paris — donne un accès direct aux réseaux qui structurent les parcours
            complexes en France. Ces 8 réseaux représentent l&apos;amorce du pipeline commercial.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}>
            <ReseauCard
              nom="AHP Pédiatrie"
              type="Hôpital privé"
              detail="Pitch en cours — équipe d'ambulatoire pédiatrique, point d'entrée institutionnel."
              accent="#5B4EC4"
            />
            <ReseauCard
              nom="TCA Francilien"
              type="Réseau régional TCA"
              detail="200 praticiens adhérents. Pitch prévu juin 2026 via la coordination du réseau."
              accent="#2BA89C"
            />
            <ReseauCard
              nom="FFAB"
              type="Réseau national TCA"
              detail="100 membres IDF accessibles. Intro Nathalie Godard (présidente)."
              accent="#5B4EC4"
            />
            <ReseauCard
              nom="CPTS Neuilly-sur-Seine"
              type="Communauté territoriale"
              detail="150 adhérents actifs. Approche prévue septembre 2026, premier pivot 92."
              accent="#2BA89C"
            />
            <ReseauCard
              nom="CSO Sud Paris-Brousse"
              type="Centre Spécialisé Obésité"
              detail="Post-pitch Pr Hanachi. Référence académique pour le PCR Obésité."
              accent="#5B4EC4"
            />
            <ReseauCard
              nom="CSO Centre/Est"
              type="Centre Spécialisé Obésité"
              detail="Approche Pr Oppert. Couvre le territoire Est francilien sur l'obésité complexe."
              accent="#2BA89C"
            />
            <ReseauCard
              nom="Réseau pédiatrie IDF"
              type="Réseau pédiatrique"
              detail="Bouche-à-oreille AHP. Extension naturelle du périmètre pédiatrique."
              accent="#5B4EC4"
            />
            <ReseauCard
              nom="+ 6 CPTS pilotes IDF"
              type="Communautés territoriales"
              detail="Levallois, Boulogne, Issy/Vanves, Suresnes, Paris 15/16/17. Effet domino."
              accent="#2BA89C"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <p style={{
            marginTop: 56,
            fontSize: 15,
            color: "#374151",
            maxWidth: 720,
            lineHeight: 1.7,
            fontStyle: "italic",
            paddingLeft: 20,
            borderLeft: "3px solid #5B4EC4",
          }}>
            Une startup sans capital relationnel met 18 mois à atteindre son premier client.
            Nami a 8 réseaux engagés avant même la création de la SASU. C&apos;est une avance qu&apos;on
            ne rattrape pas avec du marketing.
          </p>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 5 — INTRO PRICING
// =============================================================================
function BanquePricingIntro() {
  return (
    <section style={{
      background: "#F5F3EF",
      padding: "120px clamp(24px, 5vw, 80px) 0",
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
            MODÈLE ÉCONOMIQUE
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
            5 tiers. Un seul produit.<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ARPU moyen 137 €/mois.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 32,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            Modèle SaaS B2B classique : abonnement mensuel récurrent, marge brute supérieure à
            85 % grâce à un coût marginal quasi-nul. Le tier IA (149 €/mois) est conçu pour
            représenter 50 % du mix client cible — c&apos;est la vedette du catalogue.
          </p>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 6 — STRATÉGIE D'ACQUISITION
// =============================================================================
function BanqueStrategie() {
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
            STRATÉGIE D&apos;ACQUISITION
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
            Pendant que Doctolib gère<br />
            les rendez-vous,{" "}
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Nami construit le couloir.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 56,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            Conquête réseau par réseau, pas client par client. Chaque réseau conquis est un
            graphe clinique verrouillé : <strong>l&apos;effet de réseau crée le moat</strong>. Plus
            les soignants utilisent Nami pour se coordonner entre eux, plus il devient coûteux
            pour un nouvel entrant de les déloger.
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
              detail="AHP Pédiatrie, TCA Francilien, FFAB, CPTS Neuilly, Levallois, Boulogne. Ramp 12 %/mois jusqu'à saturation 50 %."
              chiffre="60"
              label="abonnés payants fin Année 1"
            />
            <AcquisitionCard
              titre="14 réseaux cumulés fin 2027"
              detail="Effet domino : CPTS 92 → CPTS Paris 15 (400 adhérents confirmés), 16, 17 + 3 CSO obésité. Pipeline visible et cartographié."
              chiffre="147"
              label="abonnés payants fin Année 2"
            />
            <AcquisitionCard
              titre="0 € de CAC sur Année 1"
              detail="Distribution via les coordinateurs de réseaux. Pas de marketing payant pré-seed. Le bouche-à-oreille fait le reste."
              chiffre="< 500 €"
              label="CAC cible Année 2"
            />
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 7 — PROJECTIONS 24 MOIS
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
            PROJECTIONS 24 MOIS
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
            Rentable dès l&apos;année 1.<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Trésorerie positive sur 24 mois.
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
            churn 2-2,5 %. <strong>Mode bootstrap intégral en Année 1</strong> — la fondatrice
            n&apos;est pas rémunérée par Nami avant la levée seed prévue Q3 2027.
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

              <ProjRow label="Abonnés payants (fin de période)" y1="60" y2="147" cumul="—" highlight />
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
            Le détail mensuel des flux est disponible dans le fichier Excel joint au dossier.
          </p>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 8 — PLAN DE FINANCEMENT
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
            182 500 € sur 24 mois,<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              92 % en aides publiques.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 56,
            maxWidth: 720,
            lineHeight: 1.6,
          }}>
            <strong>C&apos;est une stratégie, pas un palliatif.</strong> Nami coche toutes les cases
            des dispositifs Région Île-de-France et Bpifrance dédiés à l&apos;innovation santé : JEII,
            innovation française, hébergement HDS, ancrage territorial CPTS/CSO. La levée privée
            est différée à Q3 2027, quand la valorisation sera tirée par la traction réelle.
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
              statut="Confirmé"
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
              Une levée pré-seed (BSA-AIR, 150 K€) est envisagée pour mai 2027, suivie d&apos;une
              levée seed (1,5 M€) au Q3 2027. <strong>Ces levées ne sont pas comptées dans le
              business plan</strong> — elles constituent des jalons de croissance indépendants.
              Le BP tient debout sans elles.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 9 — ÉCOSYSTÈME & SOUTIENS
// =============================================================================
function BanqueEcosysteme() {
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
            textTransform: "uppercase" as const,
            color: "#5B4EC4",
            marginBottom: 14,
          }}>
            ÉCOSYSTÈME & SOUTIENS
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
            Nami n&apos;avance pas seule.<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Le projet est déjà ancré.
            </span>
          </h2>
          <p style={{
            fontSize: 16,
            color: "#374151",
            marginBottom: 64,
            maxWidth: 760,
            lineHeight: 1.6,
          }}>
            Quatre acteurs majeurs de l&apos;écosystème innovation santé française accompagnent Nami
            avant même la création de la SASU. Une recherche académique cosignée avec l&apos;AP-HP
            documente le besoin et fonde la thèse produit.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
            marginBottom: 56,
          }}>
            <SoutienCard
              eyebrow="ACCÉLÉRATEUR"
              nom="Wilco"
              detail="Accompagnement actif : hébergement, ressources, recherche de subventions. Label."
              accent="#5B4EC4"
            />
            <SoutienCard
              eyebrow="LABEL"
              nom="Medicen"
              detail="Pôle de compétitivité santé Île-de-France. Labellisation du projet — référence sectorielle pour les dispositifs publics."
              accent="#2BA89C"
            />
            <SoutienCard
              eyebrow="INCUBATEUR SANTÉ"
              nom="Le Catalyseur Santé"
              detail="Hébergement et ressources opérationnelles. Ancrage dans l&apos;écosystème santé territorial des Hauts-de-Seine."
              accent="#5B4EC4"
            />
            <SoutienCard
              eyebrow="COLLECTIVITÉ"
              nom="Ville de Suresnes"
              detail="Soutien institutionnel et accès au tissu local de santé. Couplage opérationnel avec la CPTS Suresnes (pipeline réseau)."
              accent="#2BA89C"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "36px 40px",
            border: "1px solid rgba(26,26,46,0.08)",
            boxShadow: "0 8px 24px rgba(26,26,46,0.06)",
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#5B4EC4",
              marginBottom: 12,
            }}>
              FONDATIONS ACADÉMIQUES
            </div>
            <h3 style={{
              fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#1A1A2E",
              lineHeight: 1.2,
              margin: "0 0 20px",
              fontFamily: "var(--font-jakarta)",
            }}>
              Une thèse produit fondée sur la recherche.
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2BA89C",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}>
                  M2 SANTÉ PUBLIQUE — VALIDÉ
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginBottom: 8, lineHeight: 1.4 }}>
                  Université Paris-Saclay
                </div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                  Recherche sur la télésurveillance et les parcours de soins chroniques —
                  thèse produit Nami issue directement de ces travaux.
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2BA89C",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}>
                  PUBLICATION À PARAÎTRE
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginBottom: 8, lineHeight: 1.4 }}>
                  Co-écriture Laboratoire ARENES × AP-HP
                </div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                  Projet de recherche cosigné avec le Laboratoire ARENES (Sciences Po Rennes /
                  CNRS) et la Direction de la stratégie de l&apos;AP-HP. Rédaction en cours,
                  publication visée 2026.
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.45} duration={0.7}>
          <div style={{
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            padding: "20px 24px",
            background: "rgba(91,78,196,0.03)",
            borderRadius: 12,
            border: "1px solid rgba(91,78,196,0.10)",
          }}>
            <ConformiteBadge label="Hébergement HDS" detail="Scalingo HDS France" />
            <ConformiteBadge label="RGPD" detail="Conformité native" />
            <ConformiteBadge label="Zero Data Retention" detail="Mistral AI · Voxtral" />
            <ConformiteBadge label="Hors DM" detail="Règlement (UE) 2017/745" />
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 10 — FONDATRICE (sombre #1)
// =============================================================================
function BanqueFondatrice() {
  return (
    <section style={{
      background: "#1A1A2E",
      padding: "120px clamp(24px, 5vw, 80px)",
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

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#2BA89C",
            marginBottom: 14,
          }}>
            FONDATRICE
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            lineHeight: 1.1,
            margin: "0 0 40px",
            fontFamily: "var(--font-jakarta)",
            maxWidth: 800,
          }}>
            Margot a vu le bug en consultation<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              avant de le coder.
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 32,
            marginBottom: 56,
          }}>
            <FondatriceBlock
              eyebrow="LE TERRAIN"
              titre="Diététicienne en exercice"
              detail="Consultations à l'Hôpital Américain de Paris. Spécialisée TCA et obésité complexe — exactement les pathologies qui exigent une coordination pluridisciplinaire."
            />
            <FondatriceBlock
              eyebrow="LA FORMATION"
              titre="ESSEC + Paris-Saclay"
              detail="Master de santé publique (Paris-Saclay), recherche sur la télésurveillance et les parcours chroniques en partenariat avec l'AP-HP. Background business ESSEC."
            />
            <FondatriceBlock
              eyebrow="LE CAPITAL RELATIONNEL"
              titre="8 réseaux cliniques actifs"
              detail="FFAB, TCA Francilien, AHP, plusieurs CPTS et CSO. Connexions construites sur 5 ans d'exercice clinique et de recherche, pas sur du networking startup."
            />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.3} duration={0.7}>
          <div style={{
            padding: "32px 36px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            borderLeft: "3px solid #5B4EC4",
          }}>
            <p style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.92)",
              margin: 0,
            }}>
              &ldquo;J&apos;ai accompagné une patiente de 10 ans pendant quatre mois avant que les bons
              soignants ne soient enfin alignés. Quatre mois perdus, pas par manque de
              compétence — par défaut d&apos;orchestration. Nami est né de cette consultation.&rdquo;
            </p>
            <div style={{
              marginTop: 16,
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 500,
            }}>
              Margot Vire — Présidente fondatrice
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// =============================================================================
// SECTION 11 — CLÔTURE (sombre #2)
// =============================================================================
function BanqueCloture() {
  return (
    <section style={{
      background: "#1A1A2E",
      padding: "100px clamp(24px, 5vw, 80px) 80px",
      position: "relative",
      overflow: "hidden",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      <AmbientGlow intensity="low" />

      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        position: "relative",
        zIndex: 1,
      }}>

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
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            lineHeight: 1.1,
            margin: "0 0 32px",
            fontFamily: "var(--font-jakarta)",
            maxWidth: 900,
          }}>
            Un partenaire bancaire qui sait<br />
            <span style={{
              background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              accompagner les startups santé.
            </span>
          </h2>
          <p style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 760,
            lineHeight: 1.7,
            margin: "0 0 32px",
          }}>
            Nami sera rentable dès la première année. Mais nous avons besoin d&apos;un partenaire
            qui sache lire un BP, accompagner une levée seed, structurer un compte pro adapté
            à une boîte tech, et dialoguer avec Bpifrance sur le statut JEII et les dispositifs
            Région IDF.
          </p>
          <p style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 760,
            lineHeight: 1.7,
            margin: "0 0 48px",
          }}>
            <strong style={{ color: "#FFFFFF" }}>C&apos;est cette relation que je viens construire
            aujourd&apos;hui.</strong> Le compte pro est l&apos;amorce. Le reste se fera avec l&apos;historique.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.2} duration={0.7}>
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
              Margot Vire · Présidente fondatrice · Île-de-France
            </span>
          </div>
        </ScrollReveal>

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
        Source : {source}
      </div>
    </div>
  )
}

function ReseauCard({ nom, type, detail, accent }: {
  nom: string
  type: string
  detail: string
  accent: string
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 12,
      padding: 24,
      border: "1px solid rgba(26,26,46,0.06)",
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{
        fontSize: 16,
        fontWeight: 700,
        color: "#1A1A2E",
        marginBottom: 4,
        lineHeight: 1.3,
      }}>
        {nom}
      </div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: accent,
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        marginBottom: 12,
      }}>
        {type}
      </div>
      <div style={{
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 1.55,
      }}>
        {detail}
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
          fontSize: 36,
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
      textTransform: "uppercase" as const,
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
      <div style={{ ...cellStyle, fontWeight: highlight ? 700 : 500, color: highlight ? "#1A1A2E" : "#374151" }}>
        {label}
      </div>
      <div style={{ ...cellStyle, fontWeight: highlight ? 700 : 500, color: highlight ? "#5B4EC4" : "#374151", textAlign: "right" as const }}>
        {y1}
      </div>
      <div style={{ ...cellStyle, fontWeight: highlight ? 700 : 500, color: highlight ? "#5B4EC4" : "#374151", textAlign: "right" as const }}>
        {y2}
      </div>
      <div style={{ ...cellStyle, fontWeight: highlight ? 700 : 500, color: highlight ? "#1A1A2E" : "#374151", textAlign: "right" as const }}>
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: couleur }} />
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#6B7280",
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        marginBottom: 12,
        marginTop: 8,
      }}>
        {titre}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 16 }}>
        {montant}
      </div>
      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 20 }}>
        {detail}
      </div>
      <div style={{ fontSize: 11, color: "#6B7280", fontStyle: "italic", paddingTop: 16, borderTop: "1px solid rgba(26,26,46,0.06)" }}>
        {statut}
      </div>
    </div>
  )
}

function SoutienCard({ eyebrow, nom, detail, accent }: {
  eyebrow: string
  nom: string
  detail: string
  accent: string
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: 32,
      border: "1px solid rgba(26,26,46,0.08)",
      boxShadow: "0 8px 24px rgba(26,26,46,0.06)",
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: accent,
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        marginBottom: 10,
      }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.3, marginBottom: 14 }}>
        {nom}
      </div>
      <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.65 }}>
        {detail}
      </div>
    </div>
  )
}

function ConformiteBadge({ label, detail }: {
  label: string
  detail: string
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#6B7280" }}>{detail}</div>
    </div>
  )
}

function FondatriceBlock({ eyebrow, titre, detail }: {
  eyebrow: string
  titre: string
  detail: string
}) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#2BA89C",
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        marginBottom: 10,
      }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3, marginBottom: 14 }}>
        {titre}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
        {detail}
      </div>
    </div>
  )
}
