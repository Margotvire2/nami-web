"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4",
  teal: "#2BA89C",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#4A4A5A",
  light: "#8A8A96",
  border: "rgba(26,26,46,0.06)",
  card: "#FEFEFE",
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

function S({ icon, title, badge, children, id }: { icon: string; title: string; badge?: string; children: React.ReactNode; id: string }) {
  return (
    <R d={60} style={{ marginBottom: 24 }}>
      <div id={id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(26,26,46,0.03)" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,rgba(91,78,196,0.02),rgba(43,168,156,0.02))" }}>
          <span style={{ fontSize: 17 }}>{icon}</span>
          <h2 style={{ fontFamily: f, fontSize: 15.5, fontWeight: 700, color: C.dark, margin: 0, flex: 1 }}>{title}</h2>
          {badge && <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: "rgba(91,78,196,0.07)", padding: "3px 9px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" as const }}>{badge}</span>}
        </div>
        <div style={{ padding: "18px 22px" }}>{children}</div>
      </div>
    </R>
  );
}

const P = ({ children, s }: { children: React.ReactNode; s?: React.CSSProperties }) => (
  <p style={{ fontFamily: f, fontSize: 13.2, lineHeight: 1.72, color: C.text, margin: "0 0 11px", ...s }}>{children}</p>
);
const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, textTransform: "uppercase" as const, letterSpacing: 1.2, marginBottom: 5 }}>{children}</div>
);
const Ch = ({ children, color = C.primary }: { children: React.ReactNode; color?: string }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color, background: `${color}10`, padding: "3px 10px", borderRadius: 20, marginRight: 5, marginBottom: 4, border: `1px solid ${color}18` }}>{children}</span>
);

function H({ id, text, type }: { id: string; text: string; type: "quanti" | "quali" }) {
  const a = type === "quali" ? C.teal : C.primary;
  return (
    <div style={{ padding: "12px 16px", background: `${a}08`, borderRadius: 10, borderLeft: `3px solid ${a}`, marginBottom: 7 }}>
      <div style={{ display: "flex", gap: 9 }}>
        <span style={{ fontFamily: m, fontSize: 11, fontWeight: 700, color: a }}>{id}</span>
        <P s={{ margin: 0, fontSize: 12.5 }}>{text}</P>
      </div>
    </div>
  );
}

function V({ name, detail, type }: { name: string; detail?: string; type: "dep" | "indep" | "conf" }) {
  const t = { dep: { c: C.primary, l: "VD" }, indep: { c: C.teal, l: "VI" }, conf: { c: C.light, l: "VC" } }[type];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontFamily: m, fontSize: 9.5, fontWeight: 700, color: t.c, background: `${t.c}0d`, padding: "2px 6px", borderRadius: 4, minWidth: 24, textAlign: "center" as const }}>{t.l}</span>
      <span style={{ fontFamily: f, fontSize: 12.5, fontWeight: 600, color: C.dark, flex: 1 }}>{name}</span>
      {detail && <span style={{ fontFamily: m, fontSize: 11, color: C.light }}>{detail}</span>}
    </div>
  );
}

const SECS = [
  { id: "titre", l: "Titre" }, { id: "contexte", l: "Contexte" }, { id: "question", l: "Question" },
  { id: "objectifs", l: "Objectifs" }, { id: "hypotheses", l: "Hypothèses" }, { id: "design", l: "Design" },
  { id: "population", l: "Population" }, { id: "variables", l: "Variables" }, { id: "analyse", l: "Analyse" },
  { id: "ethique", l: "Éthique" }, { id: "calendrier", l: "Calendrier" }, { id: "biblio", l: "Biblio" },
];

export function ProtocoleRecherche() {
  const [active, setActive] = useState("titre");

  useEffect(() => {
    const o = new IntersectionObserver(
      (es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { threshold: 0.25 }
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
      <div id="titre" style={{ background: `linear-gradient(165deg, ${C.dark} 0%, #2d2850 50%, #1e3a4f 100%)`, padding: "52px 20px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}12, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}10, transparent 70%)` }} />
        <R>
          <div style={{ display: "inline-block", fontSize: 9.5, fontWeight: 700, color: C.teal, background: `${C.teal}18`, padding: "4px 12px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 18 }}>
            Synopsis de protocole
          </div>
        </R>
        <R d={100}>
          <h1 style={{ fontFamily: f, fontSize: 23, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.28, maxWidth: 500, marginInline: "auto" }}>
            Conséquences somatiques à long terme de l&apos;anorexie mentale précoce chez l&apos;adulte
          </h1>
        </R>
        <R d={200}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13.5, fontStyle: "italic", color: "rgba(255,255,255,0.45)", margin: "0 0 24px", maxWidth: 440, marginInline: "auto" }}>
            Long-term somatic consequences of early-onset anorexia nervosa in adults: a retrospective study with structured interviews
          </p>
        </R>
        <R d={300}>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 3 }}>INVESTIGATEUR</div>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Margot Vire</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Diététicienne-Nutritionniste</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)", alignSelf: "stretch" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 3 }}>FORMATION</div>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>DU TCA Enfant-Adolescent</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Univ. Rouen · Cochin · Paris Cité</div>
            </div>
          </div>
        </R>
        <R d={400}>
          <div style={{ marginTop: 20, fontSize: 10.5, color: "rgba(255,255,255,0.25)" }}>Avril 2026 · Version 1</div>
        </R>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 60px" }}>

        <S id="contexte" icon="📋" title="Contexte et justification">
          <P>L&apos;anorexie mentale (AM) débutant avant 14 ans est associée à des complications somatiques spécifiques liées à l&apos;interférence avec la croissance et la maturation pubertaire. L&apos;étude de Guinhut, Melchior, Godart et Hanachi (2021) portant sur 354 patientes adultes sévères a confirmé la gravité de ces complications, avec un taux de mortalité standardisé pouvant atteindre 15,9 pour les formes les plus sévères.</P>
          <P>Les principales atteintes documentées incluent : ostéoporose, perturbations endocriniennes (syndrome de T3 basse, aménorrhée prolongée), complications cardiovasculaires et rénales (Gosseaume, Hanachi et al., 2019 ; Mehler, 2020).</P>
          <P>Les données sur la persistance de ces complications à l&apos;âge adulte chez des patientes ayant débuté précocement restent limitées, justifiant la présente étude exploratoire.</P>
        </S>

        <S id="question" icon="❓" title="Question de recherche">
          <div style={{ padding: "18px 20px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}05, ${C.teal}05)`, borderLeft: `3px solid ${C.primary}` }}>
            <P s={{ margin: 0, fontSize: 14, fontStyle: "italic", fontWeight: 500, color: C.dark, lineHeight: 1.75 }}>
              Quelles sont les conséquences somatiques à long terme de l&apos;anorexie mentale précoce chez des patientes adultes, et quels facteurs cliniques (durée d&apos;évolution, sévérité initiale) sont associés à leur gravité ?
            </P>
          </div>
        </S>

        <S id="objectifs" icon="🎯" title="Objectifs">
          <L>Objectif principal</L>
          <P>Décrire la prévalence et la sévérité des complications somatiques (osseuses, endocriniennes, cardiovasculaires, rénales) dans une cohorte de patientes adultes ayant présenté une AM précoce.</P>
          <div style={{ height: 12 }} />
          <L>Objectifs secondaires</L>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Analyser la corrélation entre durée d'évolution de l'AM et sévérité de l'ostéoporose (T-score)",
              "Étudier l'association entre sévérité clinique (score SRI) et perturbations endocriniennes (T3 basse)",
              "Recueillir le vécu des patientes concernant leurs complications somatiques via entretiens dirigés",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontFamily: m, fontSize: 11, fontWeight: 700, color: C.teal, marginTop: 2 }}>0{i + 1}</span>
                <P s={{ margin: 0 }}>{t}</P>
              </div>
            ))}
          </div>
        </S>

        <S id="hypotheses" icon="💡" title="Hypothèses" badge="3 hypothèses">
          <H id="H1" type="quanti" text="La durée d'évolution de l'AM est positivement corrélée à la sévérité de l'ostéoporose (T-score plus bas)." />
          <H id="H2" type="quanti" text="Les patientes présentant les scores de sévérité les plus élevés ont davantage de perturbations de l'axe thyroïdien (T3 basse persistante)." />
          <H id="H3" type="quali" text="Les complications somatiques ont un impact significatif sur la qualité de vie perçue par les patientes, indépendamment de la rémission du trouble alimentaire." />
        </S>

        <S id="design" icon="🔬" title="Design méthodologique" badge="Mixte">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ padding: "14px 16px", background: `${C.primary}06`, borderRadius: 10, borderTop: `3px solid ${C.primary}` }}>
              <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, marginBottom: 6, letterSpacing: 0.5 }}>VOLET 1 — QUANTITATIF</div>
              <P s={{ margin: 0, fontSize: 12.5 }}>Étude de cohorte rétrospective monocentrique. Analyse des données cliniques, biologiques et d&apos;imagerie (ostéodensitométrie) existantes dans la base de données du service.</P>
            </div>
            <div style={{ padding: "14px 16px", background: `${C.teal}06`, borderRadius: 10, borderTop: `3px solid ${C.teal}` }}>
              <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.teal, marginBottom: 6, letterSpacing: 0.5 }}>VOLET 2 — QUALITATIF</div>
              <P s={{ margin: 0, fontSize: 12.5 }}>Entretiens dirigés (questionnaire structuré à questions fermées) auprès d&apos;un échantillon de patientes, pour recueillir leur vécu des complications somatiques.</P>
            </div>
          </div>
        </S>

        <S id="population" icon="👥" title="Population d'étude">
          <L>Critères d&apos;inclusion</L>
          <div style={{ marginBottom: 14 }}>
            {[
              "Patientes adultes (≥ 18 ans)",
              "Diagnostic d'AM posé avant 14 ans (early-onset)",
              "Hospitalisées ou suivies dans le service",
              "Données disponibles dans la base",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, flexShrink: 0 }} />
                <P s={{ margin: 0 }}>{t}</P>
              </div>
            ))}
          </div>
          <L>Critères d&apos;exclusion</L>
          {[
            "Dossiers incomplets (variables principales manquantes)",
            "Comorbidité somatique préexistante pouvant expliquer les complications étudiées",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e05252", flexShrink: 0 }} />
              <P s={{ margin: 0 }}>{t}</P>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "10px 14px", background: C.bgAlt, borderRadius: 8 }}>
            <P s={{ margin: 0, fontSize: 12, fontStyle: "italic" }}>Échantillon estimé : à déterminer selon la base de données disponible</P>
          </div>
        </S>

        <S id="variables" icon="📊" title="Variables d'intérêt">
          <L>Variables dépendantes — Complications</L>
          <V name="T-score ostéodensitométrie" detail="rachis, col fémoral" type="dep" />
          <V name="T3 libre, TSH" detail="axe thyroïdien" type="dep" />
          <V name="Marqueurs cardiovasculaires" detail="FC, ECG, QTc" type="dep" />
          <V name="Fonction rénale" detail="créatinine, DFG" type="dep" />
          <V name="Aménorrhée" detail="durée, récupération" type="dep" />
          <div style={{ height: 14 }} />
          <L>Variables indépendantes</L>
          <V name="Durée d'évolution de l'AM" detail="années" type="indep" />
          <V name="Âge de début de l'AM" type="indep" />
          <V name="Score de sévérité" detail="SRI ou équivalent" type="indep" />
          <V name="IMC minimal atteint / IMC actuel" type="indep" />
          <div style={{ height: 14 }} />
          <L>Variables de confusion</L>
          <V name="Âge actuel" type="conf" />
          <V name="Traitements en cours" detail="bisphosphonates, HRT" type="conf" />
          <V name="Tabagisme" type="conf" />
          <V name="Statut vitamine D" detail="Hanachi 2019" type="conf" />
        </S>

        <S id="analyse" icon="📈" title="Méthode d'analyse">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <L>Volet quantitatif</L>
              {[
                "Statistiques descriptives (médianes, IQR, fréquences)",
                "Corrélations de Spearman (durée × T-score)",
                "Comparaisons : Mann-Whitney / Kruskal-Wallis",
                "Régression multivariée si effectif suffisant",
                "Logiciel : R ou SPSS",
              ].map((t, i) => <P key={i} s={{ fontSize: 12, marginBottom: 6 }}>→ {t}</P>)}
            </div>
            <div>
              <L>Volet qualitatif</L>
              {[
                "Analyse descriptive des réponses au questionnaire dirigé",
                "Synthèse thématique des verbatims",
                "Triangulation avec les données quantitatives",
              ].map((t, i) => <P key={i} s={{ fontSize: 12, marginBottom: 6 }}>→ {t}</P>)}
            </div>
          </div>
        </S>

        <S id="ethique" icon="⚖️" title="Considérations éthiques">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "12px 16px", background: `${C.primary}05`, borderRadius: 10 }}>
              <P s={{ margin: 0, fontSize: 12.5 }}>
                <strong style={{ color: C.primary }}>Volet rétrospectif :</strong> RNIPH catégorie 3 (Loi Jardé). Déclaration MR-004 (CNIL). Vérification de non-opposition des patientes.
              </P>
            </div>
            <div style={{ padding: "12px 16px", background: `${C.teal}05`, borderRadius: 10 }}>
              <P s={{ margin: 0, fontSize: 12.5 }}>
                <strong style={{ color: C.teal }}>Volet entretiens :</strong> Information et consentement écrit des participantes. Anonymisation complète des données.
              </P>
            </div>
            <div style={{ padding: "12px 16px", background: C.bgAlt, borderRadius: 10 }}>
              <P s={{ margin: 0, fontSize: 12.5, fontStyle: "italic" }}>À confirmer : nécessité d&apos;un avis du comité d&apos;éthique de l&apos;établissement.</P>
            </div>
          </div>
        </S>

        <S id="calendrier" icon="📅" title="Calendrier prévisionnel">
          <div style={{ position: "relative", paddingLeft: 22 }}>
            <div style={{ position: "absolute", left: 4.5, top: 5, bottom: 5, width: 2, background: `linear-gradient(to bottom, ${C.primary}, ${C.teal})`, borderRadius: 1 }} />
            {[
              { m: "AVR 2026", t: "Validation du protocole · Revue de littérature", a: true },
              { m: "MAI 2026", t: "Extraction et analyse de la base de données · Construction du questionnaire · Réalisation des entretiens", a: true },
              { m: "JUIN 2026", t: "Rédaction du mémoire · Soutenance fin juin", a: false },
            ].map((it, i) => (
              <R key={i} d={i * 80}>
                <div style={{ display: "flex", gap: 12, paddingBottom: 16, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: -19.5, top: 3,
                    width: 9, height: 9, borderRadius: "50%",
                    background: it.a ? `linear-gradient(135deg,${C.primary},${C.teal})` : C.bgAlt,
                    border: it.a ? "none" : `2px solid ${C.light}30`,
                    boxShadow: it.a ? `0 0 0 3px ${C.primary}15` : "none",
                  }} />
                  <div>
                    <div style={{ fontFamily: m, fontSize: 10.5, fontWeight: 700, color: it.a ? C.primary : C.light, marginBottom: 3 }}>{it.m}</div>
                    <P s={{ margin: 0, fontSize: 12.5 }}>{it.t}</P>
                  </div>
                </div>
              </R>
            ))}
          </div>
        </S>

        <S id="biblio" icon="📚" title="Références clés" badge="32 réf.">
          <L>Auteurs principaux</L>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
            <Ch color={C.primary}>Hanachi M.</Ch>
            <Ch color={C.primary}>Mehler PS.</Ch>
            <Ch color={C.teal}>Misra M.</Ch>
            <Ch color={C.teal}>Steinman J.</Ch>
            <Ch>Sachs KV.</Ch>
            <Ch>Frederiksen TC.</Ch>
            <Ch>Galusca B.</Ch>
            <Ch>Bouquegneau A.</Ch>
            <Ch>Mattar L.</Ch>
          </div>
          <L>Publications Hanachi et al.</L>
          {[
            { y: "2021", t: "Guinhut, Hanachi et al. — Extremely severe AN: 354 adult patients. Clin Nutr." },
            { y: "2020", t: "Hanachi, Fayssoil et al. — Echocardiographic abnormalities, n=124. J Eat Disord." },
            { y: "2019a", t: "Hanachi et al. — Micronutrients deficiencies, n=374. Nutrients." },
            { y: "2019b", t: "Gosseaume, Hanachi et al. — Somatic complications and nutritional management. Clin Nutr Exp." },
            { y: "2013", t: "Hanachi, Melchior, Crenn — Hypertransaminasemia in AN. Clin Nutr." },
            { y: "2025", t: "Mattar, Hanachi, Godart — Thyroid hormones and anxiety/depression in AN. Brain Behav." },
            { y: "2022", t: "Étude ANKID (AP-HP) — Renal function by isotopic technique. NCT05327998." },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: m, fontSize: 10.5, fontWeight: 700, color: C.primary, minWidth: 38 }}>{r.y}</span>
              <P s={{ margin: 0, fontSize: 12 }}>{r.t}</P>
            </div>
          ))}
          <div style={{ height: 14 }} />
          <L>Axes de recherche MeSH</L>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["Anorexia Nervosa", "Bone Density", "Osteoporosis", "Thyroid Hormones", "Cardiovascular Diseases", "Kidney Diseases", "Retrospective Studies"].map((t, i) => (
              <span key={i} style={{ fontSize: 10.5, color: C.text, background: C.bgAlt, padding: "3px 9px", borderRadius: 6, fontFamily: m }}>{t}</span>
            ))}
          </div>
          <div style={{ height: 14 }} />
          <L>Bases de données</L>
          <P s={{ fontSize: 12 }}>PubMed · PsycINFO · Cochrane Library</P>
        </S>

        {/* FOOTER */}
        <R d={100}>
          <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: m, fontSize: 10.5, color: C.light }}>Document de travail · Version 1 · Avril 2026</div>
            <div style={{ fontFamily: m, fontSize: 10, color: `${C.light}80`, marginTop: 4 }}>DU TCA Enfant-Adolescent · Université de Rouen · Hôpital Cochin</div>
          </div>
        </R>
      </div>
    </div>
  );
}
