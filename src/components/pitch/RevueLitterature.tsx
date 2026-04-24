"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4",
  teal: "#2BA89C",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#374151",
  light: "#6B7280",
  border: "rgba(26,26,46,0.06)",
  card: "#FEFEFE",
  red: "#D94F4F",
  green: "#2D9B6E",
  amber: "#D4922A",
};
const f = "'Plus Jakarta Sans',system-ui,sans-serif";
const m = "'Inter',system-ui,sans-serif";

function R({ children, d = 0, style }: { children: React.ReactNode; d?: number; style?: React.CSSProperties }) {
  const [v, setV] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(18px)", transition: `all 0.5s cubic-bezier(.22,.68,0,.98) ${d}ms`, ...style }}>
      {children}
    </div>
  );
}

function Section({ icon, title, badge, children, id, accent }: {
  icon: string; title: string; badge?: string; children: React.ReactNode; id: string; accent?: string;
}) {
  return (
    <R d={60} style={{ marginBottom: 26 }}>
      <div id={id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(26,26,46,0.03)" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: accent ? `linear-gradient(135deg, ${accent}06, ${accent}03)` : "linear-gradient(135deg,rgba(91,78,196,0.02),rgba(43,168,156,0.02))" }}>
          <span style={{ fontSize: 17 }}>{icon}</span>
          <h2 style={{ fontFamily: f, fontSize: 15.5, fontWeight: 700, color: C.dark, margin: 0, flex: 1 }}>{title}</h2>
          {badge && <span style={{ fontSize: 10, fontWeight: 700, color: accent || C.primary, background: `${accent || C.primary}0c`, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" as const }}>{badge}</span>}
        </div>
        <div style={{ padding: "18px 22px" }}>{children}</div>
      </div>
    </R>
  );
}

const P = ({ children, s }: { children: React.ReactNode; s?: React.CSSProperties }) => (
  <p style={{ fontFamily: f, fontSize: 13.2, lineHeight: 1.75, color: C.text, margin: "0 0 12px", ...s }}>{children}</p>
);
const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, textTransform: "uppercase" as const, letterSpacing: 1.2, marginBottom: 6 }}>{children}</div>
);
const Sub = ({ children, color = C.dark }: { children: React.ReactNode; color?: string }) => (
  <h3 style={{ fontFamily: f, fontSize: 14, fontWeight: 700, color, margin: "18px 0 8px" }}>{children}</h3>
);

function Stat({ value, unit, label, color = C.primary }: { value: string; unit: string; label: string; color?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 8px" }}>
      <div style={{ fontFamily: m, fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ fontFamily: f, fontSize: 11, color: C.light, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function RefCard({ year, authors, title, journal, tag, tagColor }: {
  year: string; authors: string; title: string; journal: string; tag?: string; tagColor?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, minWidth: 34, marginTop: 2 }}>{year}</span>
      <div style={{ flex: 1 }}>
        <P s={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.dark }}>{authors}</P>
        <P s={{ margin: "2px 0 0", fontSize: 11.5, color: C.light }}>{title}</P>
        <P s={{ margin: "1px 0 0", fontSize: 10.5, fontStyle: "italic", color: `${C.light}90` }}>{journal}</P>
      </div>
      {tag && <span style={{ fontSize: 9, fontWeight: 700, color: tagColor || C.teal, background: `${tagColor || C.teal}0c`, padding: "2px 8px", borderRadius: 10, alignSelf: "flex-start", marginTop: 2, whiteSpace: "nowrap" as const }}>{tag}</span>}
    </div>
  );
}

function KeyFinding({ icon, text, source }: { icon: string; text: string; source?: string }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 14px", background: C.bgAlt, borderRadius: 10, marginBottom: 7 }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <P s={{ margin: 0, fontSize: 12.5 }}>{text}</P>
        {source && <P s={{ margin: "3px 0 0", fontSize: 10.5, color: C.light, fontStyle: "italic" }}>{source}</P>}
      </div>
    </div>
  );
}

function ReversibilityBadge({ level }: { level: "irreversible" | "partial" | "reversible" | "variable" }) {
  const cfg = {
    irreversible: { color: C.red, bg: `${C.red}0c`, label: "Potentiellement irréversible", icon: "⚠️" },
    partial: { color: C.amber, bg: `${C.amber}0c`, label: "Partiellement réversible", icon: "↻" },
    reversible: { color: C.green, bg: `${C.green}0c`, label: "Réversible", icon: "✓" },
    variable: { color: C.light, bg: C.bgAlt, label: "Variable", icon: "~" },
  }[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "3px 10px", borderRadius: 20 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const SECS = [
  { id: "rl-hero", l: "Titre" }, { id: "rl-intro", l: "Introduction" }, { id: "rl-strat", l: "Stratégie" },
  { id: "rl-os", l: "Os" }, { id: "rl-endo", l: "Endocrinien" }, { id: "rl-cardio", l: "Cardio" },
  { id: "rl-renal", l: "Rénal" }, { id: "rl-hepat", l: "Hépatique" }, { id: "rl-synthese", l: "Synthèse" },
  { id: "rl-refs", l: "Références" },
];

export function RevueLitterature() {
  const [active, setActive] = useState("rl-hero");

  useEffect(() => {
    const o = new IntersectionObserver(
      (es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { threshold: 0.2 },
    );
    SECS.forEach((s) => { const el = document.getElementById(s.id); if (el) o.observe(el); });
    return () => o.disconnect();
  }, []);

  return (
    <div style={{ background: C.bg, fontFamily: f }}>
      {/* NAV DOTS */}
      <div style={{ position: "fixed", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 5, zIndex: 50 }}>
        {SECS.map((s, i) => (
          <a key={i} href={`#${s.id}`} title={s.l} style={{ width: active === s.id ? 18 : 7, height: 7, borderRadius: 4, background: active === s.id ? C.primary : `${C.dark}18`, transition: "all 0.3s", cursor: "pointer", display: "block" }} />
        ))}
      </div>

      {/* HERO */}
      <div id="rl-hero" style={{ background: `linear-gradient(165deg, ${C.dark} 0%, #2d2850 45%, #1a3d4a 100%)`, padding: "52px 20px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}14, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}10, transparent 70%)` }} />
        <R>
          <div style={{ display: "inline-block", fontSize: 9.5, fontWeight: 700, color: C.teal, background: `${C.teal}18`, padding: "4px 12px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 18 }}>
            Revue de littérature
          </div>
        </R>
        <R d={100}>
          <h1 style={{ fontFamily: f, fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.28, maxWidth: 520, marginInline: "auto", letterSpacing: "-0.02em" }}>
            Conséquences somatiques à long terme de l&apos;anorexie mentale précoce chez l&apos;adulte
          </h1>
        </R>
        <R d={200}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13.5, fontStyle: "italic", color: "rgba(255,255,255,0.4)", margin: "0 0 28px", maxWidth: 440, marginInline: "auto" }}>
            Margot Vire · DU TCA Enfant-Adolescent · Avril 2026
          </p>
        </R>
        <R d={300}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {["32 références", "4 systèmes", "2019–2026"].map((t, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)" }}>{t}</span>
            ))}
          </div>
        </R>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 16px 60px" }}>

        <Section id="rl-intro" icon="📖" title="Introduction">
          <P>L&apos;anorexie mentale (AM) est un trouble psychiatrique sévère caractérisé par une restriction alimentaire conduisant à une dénutrition significative. Avec un taux de mortalité standardisé pouvant atteindre 5,6 — et jusqu&apos;à 15,9 pour les formes extrêmement sévères — elle constitue le trouble psychiatrique le plus létal, les complications somatiques représentant la première cause de décès avant le suicide (Fichter &amp; Quadflieg, 2016 ; Guinhut, Hanachi et al., 2021).</P>
          <P>L&apos;âge de début se situe classiquement entre 12 et 25 ans avec un pic à 15,5 ans, mais 18% des patientes reçoivent un diagnostic avant 14 ans (Herpertz-Dahlmann et al., 2024). Les formes précoces (early-onset AN) présentent des spécificités cliniques liées à l&apos;interférence avec la croissance, la maturation pubertaire et l&apos;acquisition du pic de masse osseuse.</P>
          <P>L&apos;étude de Guinhut, Melchior, Godart et Hanachi (2021) portant sur 354 patientes adultes hospitalisées dans une unité spécialisée de nutrition clinique a confirmé la gravité des complications somatiques dans les formes sévères. Gosseaume, Dicembre, Bemer, Melchior et Hanachi (2019) ont produit une revue complète de ces complications et de leur prise en charge nutritionnelle.</P>
          <P s={{ fontStyle: "italic", color: C.light, fontSize: 12.5 }}>Cette revue synthétise les connaissances actuelles sur les complications somatiques de l&apos;AM en se focalisant sur quatre systèmes : osseux, endocrinien, cardiovasculaire et rénal, avec une section complémentaire sur les atteintes hépatiques.</P>
        </Section>

        <Section id="rl-strat" icon="🔍" title="Stratégie de recherche documentaire">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ padding: "12px 14px", background: C.bgAlt, borderRadius: 10 }}>
              <L>Bases de données</L>
              <P s={{ margin: 0, fontSize: 12 }}>PubMed · PsycINFO · Cochrane Library</P>
            </div>
            <div style={{ padding: "12px 14px", background: C.bgAlt, borderRadius: 10 }}>
              <L>Période</L>
              <P s={{ margin: 0, fontSize: 12 }}>1999 – 2026</P>
            </div>
          </div>
          <L>Termes MeSH</L>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {["Anorexia Nervosa", "Bone Density", "Osteoporosis", "Thyroid Hormones", "Cardiovascular Diseases", "Kidney Diseases", "Adolescent", "Young Adult", "Retrospective Studies"].map((t, i) => (
              <span key={i} style={{ fontSize: 10, color: C.text, background: C.bgAlt, padding: "3px 8px", borderRadius: 5, fontFamily: m, border: `1px solid ${C.border}` }}>{t}</span>
            ))}
          </div>
          <L>Texte libre</L>
          <P s={{ fontSize: 12 }}>« early-onset anorexia nervosa » · « somatic complications » · « long-term outcomes »</P>
        </Section>

        <Section id="rl-os" icon="🦴" title="Complications osseuses" accent={C.primary} badge="Système 1/4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18, padding: "8px 0" }}>
            <Stat value="92" unit="%" label="Ostéopénie" color={C.primary} />
            <Stat value="38" unit="%" label="Ostéoporose" color={C.red} />
            <Stat value="×3" unit="" label="Risque fracturaire" color={C.amber} />
          </div>
          <Sub>Prévalence et sévérité</Sub>
          <P>La perte de densité minérale osseuse (DMO) est l&apos;une des complications les plus fréquentes et potentiellement irréversibles de l&apos;AM. Les données convergent : 92% des patientes présentent une ostéopénie et 38% une ostéoporose à au moins un site (Misra, 2013). Le risque fracturaire est multiplié par 3 et jusqu&apos;à 57% des femmes atteintes d&apos;AM subiront au moins une fracture au cours de leur vie (Steinman &amp; Shibli-Rahhal, 2019).</P>
          <Sub>Mécanismes physiopathologiques</Sub>
          <P>La perte osseuse résulte d&apos;une combinaison de facteurs : hypo-œstrogénisme, déficit en IGF-1 nutritionnellement dépendant, hypercortisolisme relatif, diminution de la masse maigre et augmentation paradoxale de la graisse médullaire (Misra, 2013). L&apos;adolescence étant la période critique d&apos;acquisition du pic de masse osseuse (60% acquise pendant l&apos;adolescence, 90% atteints à 18 ans), un début précoce compromet définitivement ce capital (Golden et al., 2014).</P>
          <KeyFinding icon="💊" text="La carence en vitamine D (54% des patientes), zinc (64%) et cuivre (37%) constitue un facteur aggravant majeur de la perte de DMO." source="Hanachi et al., 2019 — n=374, IMC moyen 12,5 kg/m²" />
          <Sub>Corrélations et facteurs de risque</Sub>
          <P>Plusieurs facteurs sont associés à une DMO plus basse : IMC faible, durée d&apos;évolution plus longue, aménorrhée, masse musculaire réduite et déficit en vitamine D (Mehler et al., 2024). L&apos;étude de Galusca et al. (2017) sur 160 patientes a montré une corrélation significative entre durée d&apos;évolution et déminéralisation à la hanche (11,4 ± 10,5 ans vs 6,4 ± 6,5 ans, p = 0,001).</P>
          <P>Toutefois, une méta-analyse récente (Robinson et al., 2022) identifie l&apos;IMC, la masse grasse, la masse maigre et l&apos;aménorrhée comme prédicteurs, mais pas systématiquement la durée de maladie — suggérant que la perte osseuse est rapide et précoce.</P>
          <Sub>Réversibilité</Sub>
          <div style={{ marginBottom: 8 }}><ReversibilityBadge level="irreversible" /></div>
          <P>La restauration pondérale améliore partiellement la DMO, notamment à la hanche, indépendamment de la reprise des règles ou de l&apos;utilisation de bisphosphonates (Golden et al., 2005). Mais la normalisation complète n&apos;est généralement pas atteinte, même après 3 ans de suivi (Galusca et al., 2017).</P>
        </Section>

        <Section id="rl-endo" icon="🧬" title="Complications endocriniennes" accent={C.teal} badge="Système 2/4">
          <Sub>Axe hypothalamo-hypophyso-thyroïdien</Sub>
          <P>Les patientes présentent un profil thyroïdien caractéristique appelé « syndrome de T3 basse » (euthyroid sick syndrome) : T3 libre basse, T4 normale basse, TSH normale ou légèrement abaissée (Mehler, 2020). Ce mécanisme adaptatif réduit la dépense énergétique de repos par diminution de la déiodination périphérique de T4 en T3 active, avec conversion préférentielle en T3 reverse inactive (Misra &amp; Klibanski, 2019).</P>
          <KeyFinding icon="🔬" text="Les concentrations basses de T3 libre sont associées à une symptomatologie dépressive plus sévère, confirmant la T3 comme marqueur pertinent de suivi." source="Mattar, Hanachi & Godart, 2025 — Brain Behav." />
          <P>Une atrophie thyroïdienne a été observée même en présence de taux de TSH normaux, probablement liée aux taux bas d&apos;IGF-1 (Müller et al., 2019). L&apos;utilisation de suppléments thyroïdiens est contre-indiquée car ces modifications sont physiologiques et réversibles.</P>
          <Sub>Axe gonadotrope et aménorrhée</Sub>
          <P>L&apos;AM provoque une aménorrhée hypothalamo-hypophysaire par suppression de la pulsatilité de la GnRH. Entre 50 et 75% des patientes développent une aménorrhée, et 20 à 25% avant même une perte de poids significative (Mehler, 2015). Les conséquences à long terme sur la fertilité sont documentées : difficultés de conception, taux plus élevés de complications obstétricales (Kimmel et al., 2013).</P>
          <Sub>Axe corticotrope et GH/IGF-1</Sub>
          <P>L&apos;hypercortisolémie relative (CRH et cortisol élevés) contribue à la perte osseuse. Paradoxalement, la GH est élevée mais l&apos;IGF-1 effondrée (résistance à la GH nutritionnellement médiée). Chez l&apos;enfant, une cohorte japonaise de 246 cas pédiatriques (2025) confirme les mêmes perturbations que chez l&apos;adulte, à l&apos;exception de l&apos;élévation de l&apos;ACTH.</P>
          <div style={{ marginTop: 10 }}><ReversibilityBadge level="reversible" /></div>
        </Section>

        <Section id="rl-cardio" icon="❤️" title="Complications cardiovasculaires" accent={C.red} badge="Système 3/4">
          <Sub>Anomalies structurelles et fonctionnelles</Sub>
          <P>L&apos;AM est associée à de multiples anomalies cardiaques : atrophie myocardique avec réduction de la masse ventriculaire gauche, prolapsus valvulaire mitral, bradycardie sinusale, hypotension et troubles de la contractilité vasculaire périphérique (Sachs et al., 2016). Environ 80% des patientes présenteraient une complication cardiaque au cours de la maladie.</P>
          <KeyFinding icon="📊" text="124 patientes adultes sévèrement dénutries étudiées par échocardiographie : corrélations significatives entre composition corporelle (masse maigre) et altérations cardiaques structurelles." source="Hanachi, Fayssoil et al., 2020 — J Eat Disord." />
          <P>Fayssoil, Melchior et Hanachi (2021) ont complété ces données par une revue synthétisant l&apos;ensemble des atteintes cardiaques, incluant les complications respiratoires, hépatiques, digestives, les troubles électrolytiques et l&apos;immunodépression.</P>
          <Sub>Intervalle QTc — Controverse</Sub>
          <P>La question du prolongement du QTc reste débattue. Une méta-analyse de 25 études (5 687 patientes, Rastogi et al., 2022) n&apos;a pas trouvé de prolongement significatif du QTc. Krantz et al. (2020) sur 1 026 adultes concluent que le prolongement n&apos;est pas intrinsèque à l&apos;AM, les cas marqués étant liés à des facteurs extrinsèques (hypokaliémie, psychotropes).</P>
          <P>Néanmoins, Frederiksen et al. (2018) ont montré un risque de mortalité cardiaque légèrement accru et une dispersion du QTc augmentée. La surveillance électrocardiographique reste indiquée.</P>
          <div style={{ marginTop: 10 }}><ReversibilityBadge level="partial" /></div>
        </Section>

        <Section id="rl-renal" icon="🫘" title="Complications rénales" accent={C.amber} badge="Système 4/4">
          <P>Les complications rénales restent sous-étudiées mais sont potentiellement sévères. Bouquegneau et al. (2012) identifient des risques accrus d&apos;insuffisance rénale aiguë, de maladie rénale chronique, de troubles électrolytiques et de néphrolithiase. Une étude rétrospective sur des adolescentes hospitalisées a retrouvé 37% d&apos;altération de la fonction rénale (Stheneur et al., 2017).</P>
          <P>Les mécanismes incluent la déshydratation chronique, l&apos;hypokaliémie (néphropathie hypokaliémique irréversible), les dérèglements de l&apos;osmo-régulation et les lésions ischémiques rénales. Une série de cas japonaise avec biopsies (Takakura et al., 2020) a révélé des lésions de collapsus glomérulaire et de fibrose interstitielle chez des patientes dont le délai moyen entre début de l&apos;AM et consultation néphrologique était de 17,8 ans.</P>
          <KeyFinding icon="🧪" text="La créatinine sérique surestime le DFG dans cette population (masse musculaire très réduite). L'étude ANKID a validé la technique isotopique (99mTc-DTPA) et la cystatine C comme alternatives fiables." source="Hanachi — Étude ANKID, AP-HP Paul Brousse, NCT05327998, 2022" />
          <div style={{ marginTop: 10 }}><ReversibilityBadge level="variable" /></div>
        </Section>

        <Section id="rl-hepat" icon="🫁" title="Complications hépatiques">
          <P>Hanachi, Melchior et Crenn (2013) ont décrit la fréquence et les facteurs de risque de l&apos;hypertransaminasémie chez des patientes AM sévèrement dénutries, ainsi que son évolution sous nutrition entérale. L&apos;atteinte hépatique peut se manifester par une hépatite de jeûne (cytolyse sur dénutrition profonde) ou par une stéatohépatite lors de la renutrition.</P>
          <P>Gosseaume, Hanachi et al. (2019) soulignent que les perturbations hépatiques font partie du tableau des complications sévères nécessitant une surveillance rapprochée, en particulier lors de la phase de réalimentation où le risque de syndrome de renutrition inappropriée (refeeding syndrome) est élevé.</P>
          <div style={{ marginTop: 10 }}><ReversibilityBadge level="reversible" /></div>
        </Section>

        <Section id="rl-synthese" icon="🧩" title="Synthèse et lacunes identifiées">
          <L>Tableau récapitulatif</L>
          <div style={{ overflowX: "auto", marginBottom: 18 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: f, fontSize: 12 }}>
              <thead>
                <tr style={{ background: `${C.primary}08` }}>
                  {["Système", "Complications", "Réversibilité", "Réf. clés"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, textTransform: "uppercase" as const, letterSpacing: 0.5, borderBottom: `2px solid ${C.primary}20` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { sys: "🦴 Osseux", comp: "Ostéopénie 92%, ostéoporose 38%, risque fracturaire ×3", rev: "Potentiellement irréversible", refs: "Misra 2013 ; Steinman 2019 ; Galusca 2017 ; Hanachi 2019" },
                  { sys: "🧬 Endocrinien", comp: "Syndrome T3 basse, aménorrhée, hypercortisolisme, résistance GH", rev: "Largement réversible", refs: "Swenne 2023 ; Mattar & Hanachi 2025 ; Mehler 2020" },
                  { sys: "❤️ Cardiovasculaire", comp: "Bradycardie, atrophie myocardique, QTc controversé", rev: "Généralement réversible", refs: "Sachs 2016 ; Hanachi & Fayssoil 2020 ; Krantz 2020" },
                  { sys: "🫘 Rénal", comp: "IRA, MRC, néphropathie hypokaliémique", rev: "Variable", refs: "Bouquegneau 2012 ; Hanachi ANKID 2022 ; Tanner 2023" },
                  { sys: "🫁 Hépatique", comp: "Cytolyse hépatique, stéatohépatite de renutrition", rev: "Réversible", refs: "Hanachi 2013 ; Gosseaume & Hanachi 2019" },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: C.dark, whiteSpace: "nowrap" as const }}>{r.sys}</td>
                    <td style={{ padding: "10px 12px", color: C.text }}>{r.comp}</td>
                    <td style={{ padding: "10px 12px", color: C.text, fontSize: 11.5 }}>{r.rev}</td>
                    <td style={{ padding: "10px 12px", color: C.light, fontSize: 11 }}>{r.refs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <L>Lacunes identifiées</L>
          {[
            { n: "1", t: "La plupart des études portent sur les complications en phase active — les données sur la persistance des séquelles à l'âge adulte chez des patientes ayant débuté dans l'enfance sont rares." },
            { n: "2", t: "Peu d'études analysent spécifiquement la corrélation entre durée d'évolution cumulée et sévérité des séquelles à distance. Les larges cohortes (Guinhut & Hanachi, 2021 — 354 patients ; Hanachi et al., 2019 — 374 patients) documentent le profil somatique des formes sévères mais en coupe transversale." },
            { n: "3", t: "Le vécu des patientes concernant leurs complications somatiques est quasi absent de la littérature." },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: `${C.primary}04`, borderRadius: 10, marginBottom: 7, borderLeft: `3px solid ${C.primary}` }}>
              <span style={{ fontFamily: m, fontSize: 11, fontWeight: 700, color: C.primary }}>{l.n}</span>
              <P s={{ margin: 0, fontSize: 12.5 }}>{l.t}</P>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "14px 18px", background: `linear-gradient(135deg, ${C.primary}06, ${C.teal}06)`, borderRadius: 12 }}>
            <P s={{ margin: 0, fontWeight: 600, color: C.dark, fontSize: 13 }}>→ Ces lacunes justifient la réalisation d&apos;une étude exploratoire combinant analyse rétrospective de cohorte et recueil du vécu par entretiens dirigés.</P>
          </div>
        </Section>

        <Section id="rl-refs" icon="📚" title="Références bibliographiques" badge="32 réf.">
          <L>Publications Hanachi et al.</L>
          <RefCard year="2025" authors="Mattar L, Hanachi M, Godart N et al." title="Exploring the interplay between thyroid hormone levels and symptoms of anxiety and depression in AN" journal="Brain Behav. 15(7):e70685" tag="Nouveau" tagColor={C.teal} />
          <RefCard year="2022" authors="Hanachi M (AP-HP)" title="ANKID — Pilot study of renal function by isotopic technique in malnourished AN patients" journal="ClinicalTrials.gov NCT05327998" tag="Essai clinique" tagColor={C.primary} />
          <RefCard year="2021" authors="Guinhut M, Melchior JC, Godart N, Hanachi M" title="Extremely severe AN: Hospital course of 354 adult patients in a clinical nutrition unit" journal="Clin Nutr. 40:1954-1965" tag="n=354" tagColor={C.primary} />
          <RefCard year="2020" authors="Hanachi M, Pleple A, Barry C et al." title="Echocardiographic abnormalities in 124 severely malnourished adult AN patients" journal="J Eat Disord. 8:66" tag="n=124" tagColor={C.primary} />
          <RefCard year="2019" authors="Hanachi M, Dicembre M, Rives-Lange C et al." title="Micronutrients deficiencies in 374 severely malnourished AN inpatients" journal="Nutrients. 11(4):792" tag="n=374" tagColor={C.primary} />
          <RefCard year="2019" authors="Gosseaume C, Dicembre M, Bemer P, Melchior JC, Hanachi M" title="Somatic complications and nutritional management of anorexia nervosa" journal="Clin Nutr Exp. 28:2-10" />
          <RefCard year="2013" authors="Hanachi M, Melchior JC, Crenn P" title="Hypertransaminasemia in severely malnourished adult AN patients" journal="Clin Nutr. 32(3):391-395" />
          <RefCard year="2021" authors="Fayssoil A, Melchior JC, Hanachi M" title="Heart and anorexia nervosa" journal="Heart Fail Rev. 26(1):65-70" />
          <div style={{ height: 18 }} />
          <L>Autres références clés</L>
          <RefCard year="2024" authors="Herpertz-Dahlmann B et al." title="Diagnosis and treatment of AN in childhood and adolescence" journal="Dtsch Arztebl Int." />
          <RefCard year="2024" authors="Namič T et al." title="Early-onset AN: a scoping review and management guidelines" journal="J Eat Disord. 12:130" />
          <RefCard year="2024" authors="Mehler PS et al." title="Loss of bone density in patients with AN: food that alone will not cure" journal="Nutrients. PMC11547391" />
          <RefCard year="2022" authors="Robinson L et al." title="BMD, body composition and amenorrhoea in females with EDs: systematic review" journal="J Eat Disord. 10:194" tag="Méta-analyse" tagColor={C.teal} />
          <RefCard year="2022" authors="Rastogi J et al." title="QTc interval in AN: a systematic review and meta-analysis" journal="Eur Heart J. 43(S2)" tag="Méta-analyse" tagColor={C.teal} />
          <RefCard year="2020" authors="Krantz MJ et al." title="Is QTc-interval prolongation an inherent feature of eating disorders?" journal="Am J Med. 133:1088-1094" tag="n=1026" tagColor={C.primary} />
          <RefCard year="2020" authors="Takakura S et al." title="Kidney disease associated with AN: a case series with kidney biopsies" journal="Kidney Med. 2(5):591-597" />
          <RefCard year="2020" authors="Mehler PS" title="Medical complications of anorexia nervosa" journal="Cleve Clin J Med. 87(6):361-370" />
          <RefCard year="2019" authors="Steinman J, Shibli-Rahhal A" title="AN and osteoporosis: pathophysiology and treatment" journal="J Bone Metab. 26(3):133-143" />
          <RefCard year="2019" authors="Misra M, Klibanski A" title="AN and its associated endocrinopathy in young people" journal="Horm Res Paediatr." />
          <RefCard year="2018" authors="Misra M, Klibanski A" title="Effects of AN on bone metabolism" journal="Endocr Rev. 39(6):895-910" />
          <RefCard year="2018" authors="Frederiksen TC et al." title="QTc interval and risk of cardiac events in adults with AN" journal="Circ Arrhythm Electrophysiol. 11:e005995" />
          <RefCard year="2017" authors="Galusca B et al." title="BMD after weight gain in 160 patients with AN" journal="Front Nutr. 4:46" tag="n=160" tagColor={C.primary} />
          <RefCard year="2017" authors="Stheneur C et al." title="Renal injury in pediatric AN: a retrospective study" journal="Eat Weight Disord." />
          <RefCard year="2016" authors="Sachs KV et al." title="Cardiovascular complications of AN: a systematic review" journal="Int J Eat Disord. 49:238-248" tag="Revue syst." tagColor={C.teal} />
          <RefCard year="2016" authors="Fichter MM, Quadflieg N" title="Mortality in eating disorders — results of a large prospective clinical longitudinal study" journal="Int J Eat Disord. 49:391-401" />
          <RefCard year="2015" authors="Mehler PS, Brown C" title="Anorexia nervosa — medical complications" journal="J Eat Disord. 3:11" />
          <RefCard year="2014" authors="Golden NH et al." title="Optimizing bone health in children and adolescents" journal="Pediatrics. 134(4):e1229-e1243" />
          <RefCard year="2013" authors="Misra M" title="Bone health in anorexia nervosa" journal="Curr Opin Endocrinol Diabetes Obes. 20(6):545-551" />
          <RefCard year="2013" authors="Kimmel MC et al." title="Long-term consequences of anorexia nervosa" journal="Gynecol Endocrinol. PMID:23706279" />
          <RefCard year="2012" authors="Bouquegneau A et al." title="Anorexia nervosa and the kidney" journal="Am J Kidney Dis. 60(2):299-307" />
          <RefCard year="2023" authors="Swenne I" title="Endocrine complications of anorexia nervosa" journal="J Eat Disord. 11:24" />
          <RefCard year="2023" authors="Tanner SM et al." title="Renal and electrolyte complications in eating disorders: comprehensive review" journal="J Eat Disord. 11:26" />
          <RefCard year="1999" authors="Lennkh C et al." title="Osteopenia in AN: specific mechanisms of bone loss" journal="J Psychiatr Res. 33(4):349-356" />
        </Section>

        <R d={100}>
          <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: m, fontSize: 10.5, color: C.light }}>Document de travail · Revue de littérature v2 · Avril 2026</div>
            <div style={{ fontFamily: m, fontSize: 10, color: `${C.light}80`, marginTop: 4 }}>DU TCA Enfant-Adolescent · Université de Rouen · Hôpital Cochin</div>
          </div>
        </R>
      </div>
    </div>
  );
}
