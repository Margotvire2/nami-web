"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#1A1A2E", text: "#374151", light: "#6B7280", border: "rgba(26,26,46,0.06)",
  card: "#FEFEFE", red: "#D94F4F", green: "#2D9B6E", amber: "#D4922A",
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

function S({ icon, title, badge, children, id, accent }: {
  icon: string; title: string; badge?: string; children: React.ReactNode; id: string; accent?: string;
}) {
  return (
    <R d={60} style={{ marginBottom: 24 }}>
      <div id={id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(26,26,46,0.03)" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: accent ? `linear-gradient(135deg, ${accent}05, transparent)` : "linear-gradient(135deg,rgba(91,78,196,0.02),rgba(43,168,156,0.02))" }}>
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
  <p style={{ fontFamily: f, fontSize: 13.2, lineHeight: 1.72, color: C.text, margin: "0 0 11px", ...s }}>{children}</p>
);
const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, textTransform: "uppercase" as const, letterSpacing: 1.2, marginBottom: 5 }}>{children}</div>
);
const Ch = ({ children, color = C.primary }: { children: React.ReactNode; color?: string }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color, background: `${color}10`, padding: "3px 10px", borderRadius: 20, marginRight: 5, marginBottom: 4, border: `1px solid ${color}18` }}>{children}</span>
);

function H({ id, text, type }: { id: string; text: string; type: "quanti" | "quali" | "psy" }) {
  const a = type === "quali" ? C.teal : type === "psy" ? C.amber : C.primary;
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

function Change({ before, after, type }: { before?: string; after: string; type: "added" | "changed" | "removed" }) {
  const colors = { added: C.green, changed: C.amber, removed: C.red };
  const labels = { added: "AJOUTÉ", changed: "MODIFIÉ", removed: "RETIRÉ" };
  const c = colors[type];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 12px", background: `${c}08`, borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${c}30` }}>
      <span style={{ fontFamily: m, fontSize: 9, fontWeight: 800, color: c, background: `${c}15`, padding: "1px 6px", borderRadius: 4, marginTop: 2, whiteSpace: "nowrap" as const }}>{labels[type]}</span>
      <div>
        {before && <P s={{ margin: 0, fontSize: 11.5, textDecoration: "line-through", color: C.light }}>{before}</P>}
        <P s={{ margin: 0, fontSize: 12, color: C.dark, fontWeight: 500 }}>{after}</P>
      </div>
    </div>
  );
}

const SECS = [
  { id: "titre", l: "Titre" }, { id: "changelog", l: "Changelog" }, { id: "contexte", l: "Contexte" },
  { id: "question", l: "Question" }, { id: "objectifs", l: "Objectifs" }, { id: "hypotheses", l: "Hypothèses" },
  { id: "design", l: "Design" }, { id: "population", l: "Population" }, { id: "variables", l: "Variables" },
  { id: "analyse", l: "Analyse" }, { id: "ethique", l: "Éthique" }, { id: "calendrier", l: "Calendrier" },
  { id: "biblio", l: "Biblio" },
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
            Synopsis de protocole · v2
          </div>
        </R>
        <R d={100}>
          <h1 style={{ fontFamily: f, fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.28, maxWidth: 520, marginInline: "auto" }}>
            Durée d&apos;évolution de l&apos;anorexie mentale et état somatique et psychiatrique actuel chez l&apos;adulte
          </h1>
        </R>
        <R d={150}>
          <p style={{ fontFamily: f, fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 6px", maxWidth: 480, marginInline: "auto" }}>
            Étude rétrospective monocentrique sur une cohorte hospitalière
          </p>
        </R>
        <R d={200}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.35)", margin: "0 0 28px", maxWidth: 480, marginInline: "auto" }}>
            Duration of anorexia nervosa and current somatic and psychiatric status in adults: a single-center retrospective cohort study
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
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 3 }}>DIRECTRICE</div>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Pr Mouna Hanachi</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>PU-PH · Nutrition clinique</div>
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
          <div style={{ marginTop: 20, fontSize: 10.5, color: "rgba(255,255,255,0.25)" }}>Avril 2026 · Version 2 — post-réunion Pr Hanachi</div>
        </R>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* CHANGELOG */}
        <S id="changelog" icon="🔄" title="Évolutions v1 → v2" badge="Post-réunion" accent={C.amber}>
          <P s={{ fontSize: 12, fontStyle: "italic", color: C.light, marginBottom: 14 }}>Modifications suite à la réunion avec le Pr Hanachi et Maeva (thèse de science, responsable unité d&apos;hospitalisation)</P>
          <Change type="changed" before="Focus : anorexie mentale précoce (début < 14 ans)" after="Focus : durée d'évolution de la maladie comme facteur pronostique principal. L'âge de début reste une variable mais n'est plus le critère de sélection." />
          <Change type="changed" before="Question : conséquences somatiques de l'AM précoce" after="Question : lien entre la durée d'évolution et la gravité de l'état somatique ET psychiatrique actuel" />
          <Change type="added" after="Ajout du versant psychiatrique : troubles de l'humeur, anxiété, comorbidités psy" />
          <Change type="added" after="Cohorte précisée : fichier Déborah Dambert, ~100 patientes, 2019–2026, données SRI complètes" />
          <Change type="added" after="Backup data : Cohorte 360 pour extraction de données biologiques manquantes (phosphore, etc.)" />
          <Change type="changed" before="Deux approches : cohorte rétrospective + entretiens" after="Priorité au quantitatif rétrospectif. Entretiens en complément si le temps le permet." />
          <Change type="added" after="Deux approches statistiques possibles : corrélation continue OU cut-off avec 2 groupes (précoce vs non précoce)" />
        </S>

        {/* CONTEXTE */}
        <S id="contexte" icon="📋" title="Contexte et justification">
          <P>L&apos;anorexie mentale (AM) est une maladie qui débute au moment de la puberté et de l&apos;adolescence, mais qui peut se poursuivre toute la vie. Si le taux de rémission atteint 80% chez les adolescentes, il diminue significativement chez les adultes, avec une augmentation des comorbidités somatiques et psychiatriques (Fichter & Quadflieg, 2016 ; Guinhut, Hanachi et al., 2021).</P>
          <P>La durée d&apos;évolution de la maladie est suspectée d&apos;être un facteur pronostique péjoratif majeur : plus la maladie dure, plus les complications somatiques et psychiatriques s&apos;accumulent et deviennent potentiellement irréversibles. L&apos;ostéoporose, les perturbations endocriniennes, les atteintes cardiovasculaires et rénales sont documentées (Gosseaume, Hanachi et al., 2019 ; Mehler, 2020), mais le lien quantifié entre durée d&apos;évolution et sévérité de ces atteintes reste insuffisamment étudié.</P>
          <P>Par ailleurs, l&apos;état somatique dépend aussi de la gravité des symptômes et de la vitesse de la perte de poids, ce qui nécessite d&apos;intégrer ces facteurs dans l&apos;analyse.</P>
          <P>L&apos;exploitation d&apos;une cohorte hospitalière existante (~100 patientes adultes, données complètes incluant le score SRI) offre une opportunité unique d&apos;explorer ces associations.</P>
        </S>

        {/* QUESTION */}
        <S id="question" icon="❓" title="Question de recherche">
          <div style={{ padding: "18px 20px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}05, ${C.teal}05)`, borderLeft: `3px solid ${C.primary}` }}>
            <P s={{ margin: 0, fontSize: 14, fontStyle: "italic", fontWeight: 500, color: C.dark, lineHeight: 1.75 }}>
              Existe-t-il un lien entre la durée d&apos;évolution de l&apos;anorexie mentale et la gravité de l&apos;état somatique et psychiatrique actuel chez des patientes adultes hospitalisées ?
            </P>
          </div>
          <div style={{ marginTop: 12, padding: "12px 16px", background: C.bgAlt, borderRadius: 10 }}>
            <L>Sous-questions</L>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "La durée d'évolution est-elle un facteur pronostique fonctionnel péjoratif ?",
                "Y a-t-il un lien entre l'âge de début et l'état actuel, indépendamment de la durée ?",
                "Quels sont les profils de patientes selon la durée d'évolution ?",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontFamily: m, fontSize: 11, fontWeight: 700, color: C.teal, marginTop: 1 }}>→</span>
                  <P s={{ margin: 0, fontSize: 12.5 }}>{t}</P>
                </div>
              ))}
            </div>
          </div>
        </S>

        {/* OBJECTIFS */}
        <S id="objectifs" icon="🎯" title="Objectifs">
          <L>Objectif principal</L>
          <P>Analyser le lien entre la durée d&apos;évolution de l&apos;AM et la fréquence / gravité des complications somatiques et psychiatriques actuelles dans une cohorte hospitalière de patientes adultes.</P>
          <div style={{ height: 12 }} />
          <L>Objectifs secondaires</L>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Décrire le profil nutritionnel, somatique et psychiatrique des patientes selon la durée d'évolution",
              "Analyser la corrélation entre durée d'évolution et sévérité de l'ostéoporose (T-score)",
              "Étudier l'association entre durée d'évolution et perturbations endocriniennes (T3 basse, aménorrhée)",
              "Explorer le lien entre durée d'évolution et comorbidités psychiatriques (troubles de l'humeur, anxiété)",
              "Évaluer si l'âge de début de la maladie a un effet indépendant de la durée d'évolution",
              "Recueillir le vécu de quelques patientes via entretiens dirigés (si temps disponible)",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontFamily: m, fontSize: 11, fontWeight: 700, color: C.teal, marginTop: 2 }}>0{i + 1}</span>
                <P s={{ margin: 0 }}>{t}</P>
              </div>
            ))}
          </div>
        </S>

        {/* HYPOTHÈSES */}
        <S id="hypotheses" icon="💡" title="Hypothèses" badge="4 hypothèses">
          <P s={{ fontSize: 12, fontStyle: "italic", color: C.light, marginBottom: 10 }}>Hypothèse générale : la durée d&apos;évolution de l&apos;AM est un facteur pronostique péjoratif pour l&apos;état somatique et psychiatrique actuel.</P>
          <H id="H1" type="quanti" text="Une durée d'évolution plus longue est associée à une prévalence plus élevée et une sévérité accrue des complications somatiques (ostéoporose, perturbations endocriniennes, cardiovasculaires, rénales)." />
          <H id="H2" type="psy" text="Une durée d'évolution plus longue est associée à une fréquence plus élevée de comorbidités psychiatriques (troubles de l'humeur, anxiété)." />
          <H id="H3" type="quanti" text="L'âge de début précoce de l'AM (avant 14 ans) est associé à un état somatique plus péjoratif, en partie médié par une durée d'évolution plus longue." />
          <H id="H4" type="quali" text="Les patientes ayant une durée d'évolution longue rapportent un impact plus important des complications somatiques sur leur qualité de vie quotidienne." />
        </S>

        {/* DESIGN */}
        <S id="design" icon="🔬" title="Design méthodologique" badge="Mixte séquentiel">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ padding: "16px 18px", background: `${C.primary}06`, borderRadius: 10, borderTop: `3px solid ${C.primary}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: 0.5 }}>VOLET PRINCIPAL — QUANTITATIF RÉTROSPECTIF</div>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.card, background: C.primary, padding: "2px 8px", borderRadius: 10 }}>PRIORITÉ</span>
              </div>
              <P s={{ margin: 0, fontSize: 12.5 }}>Étude de cohorte rétrospective monocentrique à partir du fichier Déborah Dambert (~100 patientes, 2019–2026). Analyse des données cliniques, biologiques, score SRI et complications somatiques et psychiatriques.</P>
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                <Ch color={C.primary}>Fichier Dambert</Ch>
                <Ch color={C.primary}>~100 patientes</Ch>
                <Ch color={C.primary}>SRI complet</Ch>
                <Ch color={C.primary}>2019–2026</Ch>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: "14px 16px", background: `${C.teal}06`, borderRadius: 10, borderTop: `3px solid ${C.teal}` }}>
                <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.teal, marginBottom: 6, letterSpacing: 0.5 }}>VOLET COMPLÉMENTAIRE</div>
                <P s={{ margin: 0, fontSize: 12 }}>Quelques entretiens dirigés auprès de patientes hospitalisées, si le temps le permet. Objectif : enrichir l&apos;analyse quantitative par le vécu.</P>
              </div>
              <div style={{ padding: "14px 16px", background: `${C.amber}06`, borderRadius: 10, borderTop: `3px solid ${C.amber}` }}>
                <div style={{ fontFamily: m, fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 6, letterSpacing: 0.5 }}>BACKUP DATA</div>
                <P s={{ margin: 0, fontSize: 12 }}>Cohorte 360 disponible pour extraction ciblée de données biologiques manquantes (ex : phosphore, données PMSI). Requête ponctuelle via Maeva.</P>
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 16px", background: C.bgAlt, borderRadius: 10 }}>
            <L>Deux approches statistiques envisagées</L>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
              <div style={{ padding: "10px 12px", background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <P s={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.dark }}>Approche A — Corrélation</P>
                <P s={{ margin: "4px 0 0", fontSize: 11.5, color: C.light }}>Durée d&apos;évolution en variable continue. Corrélations avec chaque complication.</P>
              </div>
              <div style={{ padding: "10px 12px", background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <P s={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.dark }}>Approche B — Deux groupes</P>
                <P s={{ margin: "4px 0 0", fontSize: 11.5, color: C.light }}>Cut-off début précoce (&lt;14 ans) vs non précoce. Comparaison inter-groupes.</P>
              </div>
            </div>
            <P s={{ fontSize: 11.5, fontStyle: "italic", color: C.light, marginTop: 8, marginBottom: 0 }}>→ À décider en fonction de la distribution des données dans le fichier</P>
          </div>
        </S>

        {/* POPULATION */}
        <S id="population" icon="👥" title="Population d'étude">
          <L>Critères d&apos;inclusion</L>
          <div style={{ marginBottom: 14 }}>
            {[
              "Patientes adultes (≥ 18 ans)",
              "Diagnostic d'anorexie mentale (DSM-5)",
              "Hospitalisées dans le service entre 2019 et 2026",
              "Données présentes dans le fichier Dambert",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, flexShrink: 0 }} />
                <P s={{ margin: 0 }}>{t}</P>
              </div>
            ))}
          </div>
          <L>Critères d&apos;exclusion</L>
          {[
            "Dossiers avec données principales manquantes (durée d'évolution, SRI)",
            "Comorbidité somatique préexistante pouvant expliquer les complications étudiées",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
              <P s={{ margin: 0 }}>{t}</P>
            </div>
          ))}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { v: "~100", l: "Patientes", icon: "👤" },
              { v: "~30 ans", l: "Âge moyen", icon: "📊" },
              { v: "2019–26", l: "Période", icon: "📅" },
            ].map((d, i) => (
              <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: C.bgAlt, borderRadius: 10 }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>{d.icon}</div>
                <div style={{ fontFamily: m, fontSize: 20, fontWeight: 800, color: C.primary }}>{d.v}</div>
                <div style={{ fontFamily: f, fontSize: 10.5, color: C.light }}>{d.l}</div>
              </div>
            ))}
          </div>
        </S>

        {/* VARIABLES */}
        <S id="variables" icon="📊" title="Variables d'intérêt">
          <L>Variables dépendantes — État actuel</L>
          <P s={{ fontSize: 11.5, fontStyle: "italic", color: C.light, marginBottom: 4 }}>Complications somatiques</P>
          <V name="T-score ostéodensitométrie" detail="rachis, col fémoral" type="dep" />
          <V name="T3 libre, TSH" detail="axe thyroïdien" type="dep" />
          <V name="Aménorrhée" detail="durée, récupération" type="dep" />
          <V name="Marqueurs cardiovasculaires" detail="FC, ECG, QTc" type="dep" />
          <V name="Fonction rénale" detail="créatinine, DFG" type="dep" />
          <V name="Phosphorémie" detail="extraction Cohorte 360 si absent" type="dep" />
          <V name="Score SRI global" detail="dans le fichier Dambert" type="dep" />
          <div style={{ height: 10 }} />
          <P s={{ fontSize: 11.5, fontStyle: "italic", color: C.light, marginBottom: 4 }}>Comorbidités psychiatriques</P>
          <V name="Troubles de l'humeur" detail="dépression" type="dep" />
          <V name="Troubles anxieux" detail="anxiété généralisée, phobies" type="dep" />
          <V name="Nombre de comorbidités psy" detail="fréquence cumulée" type="dep" />
          <div style={{ height: 14 }} />
          <L>Variables indépendantes</L>
          <V name="Durée d'évolution de l'AM" detail="années — variable principale" type="indep" />
          <V name="Âge de début de l'AM" detail="années" type="indep" />
          <V name="Âge actuel" detail="années" type="indep" />
          <div style={{ height: 14 }} />
          <L>Variables de confusion / ajustement</L>
          <V name="Sous-type d'AM" detail="restrictif vs binge-purge" type="conf" />
          <V name="IMC minimal atteint" type="conf" />
          <V name="IMC actuel" type="conf" />
          <V name="Vitesse de perte de poids" detail="si disponible" type="conf" />
          <V name="Traitements en cours" detail="bisphosphonates, HRT, psychotropes" type="conf" />
          <V name="Nombre d'hospitalisations" type="conf" />
          <V name="Tabagisme" type="conf" />
        </S>

        {/* ANALYSE */}
        <S id="analyse" icon="📈" title="Méthode d'analyse">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <L>Analyse descriptive</L>
              {[
                "Profil des patientes (médianes, IQR, fréquences)",
                "Prévalence de chaque complication par durée d'évolution",
                "Distribution de la durée d'évolution et de l'âge de début",
              ].map((t, i) => <P key={i} s={{ fontSize: 12, marginBottom: 6 }}>→ {t}</P>)}
            </div>
            <div>
              <L>Analyse inférentielle</L>
              {[
                "Corrélations de Spearman (durée × T-score, durée × SRI, etc.)",
                "Comparaisons de groupes (Mann-Whitney / Kruskal-Wallis)",
                "Régression multivariée si effectif suffisant (ajustement sur IMC, sous-type, âge)",
                "Logiciel : R ou SPSS",
              ].map((t, i) => <P key={i} s={{ fontSize: 12, marginBottom: 6 }}>→ {t}</P>)}
            </div>
          </div>
          <div style={{ marginTop: 14, padding: "12px 16px", background: C.bgAlt, borderRadius: 10 }}>
            <L>Approche B optionnelle — Deux groupes</L>
            <P s={{ fontSize: 12, marginBottom: 0 }}>Si l&apos;approche par groupes est retenue : définir le seuil de début précoce (&lt;14 ans par défaut), comparer les deux groupes sur l&apos;ensemble des variables dépendantes. Test exact de Fisher pour les variables catégorielles, Mann-Whitney pour les continues.</P>
          </div>
        </S>

        {/* ÉTHIQUE */}
        <S id="ethique" icon="⚖️" title="Considérations éthiques">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "12px 16px", background: `${C.primary}05`, borderRadius: 10 }}>
              <P s={{ margin: 0, fontSize: 12.5 }}>
                <strong style={{ color: C.primary }}>Volet rétrospectif :</strong> RNIPH catégorie 3 (Loi Jardé). Déclaration MR-004 (CNIL). Données anonymisées par le Pr Hanachi (codes 1, 2, 3… sans noms). Table de correspondance conservée dans le service uniquement.
              </P>
            </div>
            <div style={{ padding: "12px 16px", background: `${C.teal}05`, borderRadius: 10 }}>
              <P s={{ margin: 0, fontSize: 12.5 }}>
                <strong style={{ color: C.teal }}>Volet entretiens (si réalisé) :</strong> Information et consentement écrit des participantes. Anonymisation complète des verbatims.
              </P>
            </div>
            <div style={{ padding: "12px 16px", background: C.bgAlt, borderRadius: 10 }}>
              <P s={{ margin: 0, fontSize: 12.5 }}>
                <strong>Accès aux données :</strong> Margot n&apos;a pas d&apos;accès direct à Cohorte 360. Toute requête complémentaire passe par Maeva. Consultation des dossiers sur site uniquement (codes du Pr Hanachi), une demi-journée si nécessaire.
              </P>
            </div>
          </div>
        </S>

        {/* CALENDRIER */}
        <S id="calendrier" icon="📅" title="Calendrier prévisionnel">
          <div style={{ position: "relative", paddingLeft: 22 }}>
            <div style={{ position: "absolute", left: 4.5, top: 5, bottom: 5, width: 2, background: `linear-gradient(to bottom, ${C.primary}, ${C.teal})`, borderRadius: 1 }} />
            {[
              { m: "AVR 2026", t: "Validation du protocole avec le Pr Hanachi · Revue de littérature · Réception du fichier Dambert anonymisé", a: true },
              { m: "MAI 2026", t: "Exploration et nettoyage de la base · Analyses statistiques · Extraction complémentaire via Cohorte 360 si nécessaire · Entretiens dirigés (si temps disponible) · Accès dossiers sur site le matin (jusqu'à 13h30)", a: true },
              { m: "JUIN 2026", t: "Rédaction du mémoire · Intégration résultats quanti + verbatims · Soutenance fin juin", a: false },
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

        {/* BIBLIO */}
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
          <L>Publications clés — Hanachi et al.</L>
          {[
            { y: "2025", t: "Mattar, Hanachi, Godart — T3 et anxiété/dépression dans l'AM. Brain Behav." },
            { y: "2022", t: "Hanachi — ANKID, fonction rénale par technique isotopique. NCT05327998." },
            { y: "2021", t: "Guinhut, Hanachi et al. — 354 patientes sévères, parcours hospitalier. Clin Nutr." },
            { y: "2020", t: "Hanachi, Fayssoil — Anomalies échocardio, n=124. J Eat Disord." },
            { y: "2019", t: "Hanachi et al. — Carences en micronutriments, n=374. Nutrients." },
            { y: "2019", t: "Gosseaume, Hanachi — Complications somatiques et prise en charge nutritionnelle. Clin Nutr Exp." },
            { y: "2013", t: "Hanachi, Melchior, Crenn — Hypertransaminasémie dans l'AM sévère. Clin Nutr." },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: m, fontSize: 10.5, fontWeight: 700, color: C.primary, minWidth: 34 }}>{r.y}</span>
              <P s={{ margin: 0, fontSize: 12 }}>{r.t}</P>
            </div>
          ))}
          <div style={{ height: 14 }} />
          <L>Axes MeSH</L>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["Anorexia Nervosa", "Disease Duration", "Prognosis", "Bone Density", "Thyroid Hormones", "Comorbidity", "Mood Disorders", "Retrospective Studies"].map((t, i) => (
              <span key={i} style={{ fontSize: 10, color: C.text, background: C.bgAlt, padding: "3px 8px", borderRadius: 5, fontFamily: m, border: `1px solid ${C.border}` }}>{t}</span>
            ))}
          </div>
        </S>

        {/* FOOTER */}
        <R d={100}>
          <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: m, fontSize: 10.5, color: C.light }}>Document de travail · Synopsis v2 · Avril 2026</div>
            <div style={{ fontFamily: m, fontSize: 10, color: `${C.light}80`, marginTop: 4 }}>DU TCA Enfant-Adolescent · Directrice : Pr Mouna Hanachi</div>
          </div>
        </R>
      </div>
    </div>
  );
}
