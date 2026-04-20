"use client";

import { useState, useEffect, useRef } from "react";
import type { Metadata } from "next";

const COLORS = {
  primary: "#5B4EC4",
  primaryHover: "#4c44b0",
  teal: "#2BA89C",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#1A1A2E",
  textSecondary: "#4A4A5A",
  textMuted: "#8A8A96",
  border: "rgba(26,26,46,0.06)",
  gradient: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
};

function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: "100px",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: `${COLORS.primary}12`,
        color: COLORS.primary,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }: { icon: string; title: string; description: string; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px 28px",
          border: `1px solid ${COLORS.border}`,
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 20px 40px rgba(91,78,196,0.08)"
            : "0 2px 8px rgba(26,26,46,0.03)",
          cursor: "default",
          height: "100%",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: COLORS.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            marginBottom: 20,
          }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 10,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.65,
            color: COLORS.textSecondary,
            margin: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {description}
        </p>
      </div>
    </FadeIn>
  );
}

function PricingTier({
  name, price, subtitle, features, highlighted = false, cta, delay = 0,
}: {
  name: string; price: string; subtitle: string; features: string[];
  highlighted?: boolean; cta: string; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: highlighted ? COLORS.dark : "#fff",
          borderRadius: "20px",
          padding: "36px 28px 32px",
          border: highlighted ? "none" : `1px solid ${COLORS.border}`,
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: highlighted
            ? "0 24px 48px rgba(91,78,196,0.15)"
            : hovered
            ? "0 16px 32px rgba(26,26,46,0.06)"
            : "0 2px 8px rgba(26,26,46,0.03)",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {highlighted && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: COLORS.gradient }} />
        )}
        {highlighted && (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              background: `${COLORS.teal}20`,
              color: COLORS.teal,
              marginBottom: 16,
              alignSelf: "flex-start",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Recommandé pour les diét
          </span>
        )}
        <h4
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: highlighted ? "#fff" : COLORS.text,
            marginBottom: 8,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {name}
        </h4>
        <div style={{ marginBottom: 4 }}>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: highlighted ? "#fff" : COLORS.text,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            {price}
          </span>
          {price !== "0€" && (
            <span
              style={{
                fontSize: "15px",
                color: highlighted ? "rgba(255,255,255,0.5)" : COLORS.textMuted,
                marginLeft: 4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              /mois
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: "13px",
            color: highlighted ? "rgba(255,255,255,0.6)" : COLORS.textMuted,
            marginBottom: 24,
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {subtitle}
        </p>
        <div style={{ flex: 1 }}>
          {features.map((feat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 12,
                fontSize: "14px",
                color: highlighted ? "rgba(255,255,255,0.85)" : COLORS.textSecondary,
                lineHeight: 1.5,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span style={{ color: COLORS.teal, flexShrink: 0, marginTop: 2 }}>✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
        <button
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: highlighted ? "none" : `1.5px solid ${COLORS.primary}`,
            background: highlighted ? COLORS.gradient : "transparent",
            color: highlighted ? "#fff" : COLORS.primary,
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 24,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "all 0.2s ease",
          }}
        >
          {cta}
        </button>
      </div>
    </FadeIn>
  );
}

function TimelineStep({ number, title, description, delay = 0 }: { number: string; title: string; description: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: COLORS.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 800,
            flexShrink: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {number}
        </div>
        <div style={{ paddingTop: 2 }}>
          <h4
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 6,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.65,
              color: COLORS.textSecondary,
              margin: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

function Stat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 800,
            background: COLORS.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: COLORS.textMuted,
            marginTop: 8,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
      </div>
    </FadeIn>
  );
}

function FAQItem({ question, answer, delay = 0 }: { question: string; answer: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "20px 0" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            padding: 0,
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: COLORS.text,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.4,
            }}
          >
            {question}
          </span>
          <span
            style={{
              fontSize: "20px",
              color: COLORS.textMuted,
              flexShrink: 0,
              transition: "transform 0.3s ease",
              transform: open ? "rotate(45deg)" : "rotate(0)",
            }}
          >
            +
          </span>
        </button>
        <div
          style={{
            maxHeight: open ? 300 : 0,
            overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: COLORS.textSecondary,
              paddingTop: 12,
              fontFamily: "'Inter', sans-serif",
              margin: 0,
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

export default function DieteticienPage() {
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${COLORS.primary}22; color: ${COLORS.primary}; }
      `}</style>


      {/* HERO */}
      <section
        style={{
          paddingTop: "clamp(40px, 6vh, 80px)",
          paddingBottom: "clamp(80px, 12vh, 140px)",
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: "center",
          maxWidth: 840,
          margin: "0 auto",
        }}
      >
        <FadeIn>
          <Badge>Pour les diététiciens-nutritionnistes</Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              fontWeight: 800,
              color: COLORS.text,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              marginTop: 24,
              marginBottom: 20,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Vous coordonnez déjà.
            <br />
            <span style={{ background: COLORS.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Rendez-le visible.
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              lineHeight: 1.7,
              color: COLORS.textSecondary,
              maxWidth: 600,
              margin: "0 auto 36px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Médecin traitant, endocrinologue, psychologue, APA, vous travaillez déjà
            avec eux. Nami structure cette coordination pour que chaque soignant voie
            ce que les autres ont fait. Un seul espace, un seul parcours.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/signup"
              style={{
                padding: "16px 32px",
                borderRadius: 12,
                border: "none",
                background: COLORS.primary,
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 16px rgba(91,78,196,0.2)",
              }}
            >
              Commencer gratuitement
            </a>
            <a
              href="/demo"
              style={{
                padding: "16px 32px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.border}`,
                background: "transparent",
                color: COLORS.text,
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Voir la démo
            </a>
          </div>
        </FadeIn>
      </section>

      {/* STATS BAR */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${COLORS.border}`,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 32,
          }}
        >
          <Stat value="0€" label="Agenda, RDV, messagerie" delay={0} />
          <Stat value="19€" label="Facturation + visio" delay={0.1} />
          <Stat value="79€" label="Coordination complète" delay={0.2} />
          <Stat value="14j" label="Essai IA gratuit" delay={0.3} />
        </div>
      </section>

      {/* SCENARIO */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px", maxWidth: 760, margin: "0 auto" }}>
        <FadeIn>
          <Badge>Cas concret</Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              color: COLORS.text,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              marginTop: 16,
              marginBottom: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Gabrielle, 16 ans. Anorexie mentale.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.1rem)",
              lineHeight: 1.7,
              color: COLORS.textSecondary,
              marginBottom: 44,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            5 soignants la suivent en ambulatoire : vous (diététicienne), son médecin
            traitant, une psychologue, un endocrinologue, un éducateur APA.
            Aujourd&apos;hui, chacun travaille dans son coin. Avec Nami, chacun voit ce que les autres ont
            fait, sans sortir de son cabinet.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <TimelineStep number="1" title="Vous dictez votre consultation" description="En fin de séance, vous dictez vos observations. L'IA transcrit, structure en brouillon sourcé. Vous relisez, vous validez. 2 minutes au lieu de 15." delay={0.1} />
          <TimelineStep number="2" title="L'équipe voit vos observations" description="Le médecin traitant voit que vous avez noté une baisse d'apport protéique. La psychologue voit que l'humeur en séance est stable. L'endocrino vérifie les résultats bio. Chacun a le contexte." delay={0.2} />
          <TimelineStep number="3" title="Gabrielle avance dans son parcours" description="Sur son app, Gabrielle voit son équipe, ses prochains RDV, sa progression. Elle renseigne ses repas avec des photos, l'IA structure, vous recevez un récapitulatif avant la prochaine séance." delay={0.3} />
          <TimelineStep number="4" title="Personne ne se perd en chemin" description="L'indicateur de complétude montre que le bilan endocrino trimestriel est en retard. Vous adressez un rappel à l'endocrino via Nami. La chaîne ne se casse plus." delay={0.4} />
        </div>
      </section>

      {/* CITATION */}
      <section
        style={{
          background: COLORS.bgAlt,
          padding: "clamp(48px, 8vh, 80px) 24px",
          textAlign: "center",
        }}
      >
        <FadeIn>
          <p
            style={{
              fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
              fontStyle: "italic",
              color: COLORS.text,
              maxWidth: 680,
              margin: "0 auto",
              lineHeight: 1.6,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
            }}
          >
            &ldquo;Ce n&apos;était pas un manque de compétence. C&apos;était un défaut
            d&apos;orchestration. Quatre mois perdus, parce qu&apos;aucun outil
            ne reliait les cinq soignants.&rdquo;
          </p>
          <p
            style={{
              fontSize: "14px",
              color: COLORS.textMuted,
              marginTop: 20,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Margot Vire, Diététicienne-nutritionniste, fondatrice de Nami
          </p>
        </FadeIn>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Badge>Ce que Nami change pour vous</Badge>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  fontWeight: 800,
                  color: COLORS.text,
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                  marginTop: 16,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Moins de temps administratif.
                <br />
                Plus de temps clinique.
              </h2>
            </div>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            <FeatureCard icon="🎙️" title="Dictez, l'IA structure" description="Dictez vos observations en fin de consultation. L'IA transcrit et produit un brouillon structuré, sourcé sur les référentiels HAS et FFAB. Vous validez." delay={0} />
            <FeatureCard icon="👥" title="Vue équipe en temps réel" description="Chaque soignant de l'équipe voit les dernières observations, les résultats bio, les prochaines étapes. Tout le monde a les mêmes cartes en main." delay={0.1} />
            <FeatureCard icon="📸" title="Photos repas par le patient" description="Votre patient photographie ses repas. L'IA structure un récapitulatif nutritionnel. Vous arrivez en consultation avec un aperçu de la semaine." delay={0.2} />
            <FeatureCard icon="📋" title="Adressage en un clic" description="Adressez un patient vers un endocrinologue avec tout le contexte clinique. Le confrère reçoit le dossier structuré, pas un post-it." delay={0.3} />
            <FeatureCard icon="📊" title="Extraction bio automatique" description="Scannez les résultats biologiques de votre patient. Nami structure les données et les intègre au dossier. Plus de saisie manuelle." delay={0.4} />
            <FeatureCard icon="✅" title="Indicateur de complétude" description="Nami identifie les étapes manquantes du parcours HAS : bilan initial, consultations de suivi, examens complémentaires. Rien ne se perd." delay={0.5} />
          </div>
        </div>
      </section>

      {/* DOCTOLIB COMPARISON */}
      <section style={{ background: COLORS.dark, padding: "clamp(64px, 10vh, 100px) 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <Badge>Nami vs Doctolib</Badge>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                marginTop: 16,
                marginBottom: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Ce que Doctolib facture 149€,
              <br />
              <span style={{ color: COLORS.teal }}>Nami l&apos;offre gratuitement.</span>
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 44,
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
              }}
            >
              Et tout ce que Doctolib ne fait pas, coordonner un parcours
              pluridisciplinaire, c&apos;est Nami à partir de 79€.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              {[
                { feature: "Agenda + Prise de RDV", doctolib: "149€/mois", nami: "Gratuit", namiColor: COLORS.teal },
                { feature: "Messagerie patients & soignants", doctolib: "149€/mois", nami: "Gratuit", namiColor: COLORS.teal },
                { feature: "Facturation (non conventionnée)", doctolib: "307€/mois", nami: "19€/mois", namiColor: COLORS.teal },
                { feature: "Visio, 0% commission", doctolib: "307€ + 1% HT", nami: "19€/mois", namiColor: COLORS.teal },
                { feature: "Coordination + adressage", doctolib: "—", nami: "79€/mois", namiColor: "#fff" },
                { feature: "Synthèses IA sourcées", doctolib: "—", nami: "149€/mois", namiColor: "#fff" },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 16,
                    padding: "16px 24px",
                    borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", fontFamily: "'Inter', sans-serif", textAlign: "left" }}>{row.feature}</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", minWidth: 90, textAlign: "right" }}>{row.doctolib}</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: row.namiColor, fontFamily: "'Inter', sans-serif", minWidth: 90, textAlign: "right" }}>{row.nami}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Badge>Tarifs</Badge>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  fontWeight: 800,
                  color: COLORS.text,
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                  marginTop: 16,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Choisissez votre rythme.
                <br />
                Upgradez quand le terrain l&apos;exige.
              </h2>
              <p style={{ fontSize: "15px", color: COLORS.textMuted, marginTop: 12, fontFamily: "'Inter', sans-serif" }}>
                79€/mois = environ 2-3% du CA moyen d&apos;un diététicien libéral.
              </p>
            </div>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            <PricingTier
              name="Gratuit" price="0€" subtitle="Tout ce que Doctolib facture 149€"
              features={["Agenda complet", "Prise de RDV en ligne", "Référencement annuaire Nami", "Messagerie patients & soignants", "Fiche patient basique"]}
              cta="Commencer" delay={0}
            />
            <PricingTier
              name="Coordination" price="79€" subtitle="Le parcours pluridisciplinaire structuré"
              features={["Tout Gratuit + Essentiel inclus", "Adressage structuré avec contexte", "Téléexpertise tracée", "Vue équipe patient partagée", "App patient avec photos repas IA", "Réseau de confrères"]}
              cta="Essayer la Coordination" delay={0.1}
            />
            <PricingTier
              name="Intelligence" price="149€" subtitle="L'IA qui structure vos consultations"
              features={["Tout Coordination inclus", "Synthèses IA sourcées (HAS, FFAB, DSM-5)", "Extraction bio automatique", "Base de 60 000+ sources cliniques", "Moteur de complétude parcours", "Essai gratuit 14 jours"]}
              highlighted cta="Essayer 14 jours gratuit" delay={0.2}
            />
            <PricingTier
              name="Pilotage" price="499€" subtitle="Le cockpit financier du libéral"
              features={["Tout Intelligence inclus", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, compte de résultat", "Export comptable structuré"]}
              cta="Découvrir le Pilotage" delay={0.3}
            />
          </div>
          <FadeIn delay={0.3}>
            <p style={{ textAlign: "center", fontSize: "13px", color: COLORS.textMuted, marginTop: 24, fontFamily: "'Inter', sans-serif" }}>
              Essentiel à 19€/mois (facturation + visio) inclus dans Coordination et Intelligence.
              <br />
              Structures et réseaux : offre Réseau sur mesure à partir de 499€/mois.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: COLORS.bgAlt, padding: "clamp(64px, 10vh, 100px) 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeIn>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 800,
                color: COLORS.text,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                marginBottom: 40,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textAlign: "center",
              }}
            >
              Questions fréquentes
            </h2>
          </FadeIn>
          <FAQItem question="Nami remplace-t-il mon logiciel de cabinet ?" answer="Nami n'est pas un logiciel métier. C'est un outil de coordination. Vous pouvez continuer à utiliser votre logiciel de cabinet pour vos notes internes. Nami structure ce que vous partagez avec l'équipe, les observations, les résultats, les prochaines étapes. L'agenda et la facturation intégrés vous permettent cependant de tout centraliser si vous le souhaitez." delay={0} />
          <FAQItem question="Mes confrères doivent-ils aussi payer ?" answer="Non. Vous les invitez, ils s'inscrivent gratuitement. Ils voient qu'ils font partie de l'équipe et peuvent vous écrire. Pour accéder au parcours complet et contribuer activement, ils passent à Coordination (79€). Et souvent, c'est le patient lui-même qui invite ses soignants via son app." delay={0.08} />
          <FAQItem question="Les notes du psychologue sont-elles visibles par l'équipe ?" answer="Non. Par défaut, seul le fait que la prise en charge psychologique est en cours est visible (date et statut). Le contenu des séances reste confidentiel. Le psychologue peut choisir de partager des observations spécifiques, mais c'est toujours opt-in, jamais par défaut." delay={0.16} />
          <FAQItem question="L'IA prend-elle des décisions cliniques ?" answer="Jamais. L'IA produit des brouillons que vous validez. Elle transcrit, structure et source, mais c'est toujours le soignant qui décide. Chaque synthèse porte le badge « Brouillon IA, à vérifier » et un bouton « Voir les sources » pour l'audit." delay={0.24} />
          <FAQItem question="Comment fonctionne la facturation à 19€ ?" answer="Le tier Essentiel couvre la facturation non conventionnée : notes d'honoraires, suivi des paiements, export comptable. C'est adapté aux diététiciens, psychologues, APA et toutes les professions non conventionnées." delay={0.32} />
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px", textAlign: "center" }}>
        <FadeIn>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 4.5vw, 2.8rem)",
              fontWeight: 800,
              color: COLORS.text,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              marginBottom: 16,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Vos patients ont déjà une équipe.
            <br />
            <span style={{ background: COLORS.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Donnez-leur un couloir.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p style={{ fontSize: "15px", color: COLORS.textMuted, marginBottom: 32, fontFamily: "'Inter', sans-serif" }}>
            Créez votre espace en 2 minutes. Gratuit, sans engagement.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <a
            href="/signup"
            style={{
              display: "inline-block",
              padding: "18px 40px",
              borderRadius: 12,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              fontSize: "17px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(91,78,196,0.25)",
            }}
          >
            Commencer gratuitement
          </a>
        </FadeIn>
      </section>

      {/* FOOTER */}
    </div>
  );
}
