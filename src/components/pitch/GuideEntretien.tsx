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
  red: "#D94F4F",
  green: "#2D9B6E",
  amber: "#D4922A",
};
const f = "'Plus Jakarta Sans',system-ui,sans-serif";
const mono = "'Inter',system-ui,sans-serif";

function R({ children, d = 0, style }: { children: React.ReactNode; d?: number; style?: React.CSSProperties }) {
  const [v, setV] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: `all 0.45s cubic-bezier(.22,.68,0,.98) ${d}ms`, ...style }}>
      {children}
    </div>
  );
}

function Sec({ icon, title, subtitle, children, id, accent, qCount }: {
  icon: string; title: string; subtitle?: string; children: React.ReactNode;
  id?: string; accent?: string; qCount?: string;
}) {
  return (
    <R d={50} style={{ marginBottom: 26 }}>
      <div id={id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(26,26,46,0.03)" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, background: accent ? `linear-gradient(135deg, ${accent}05, transparent)` : "linear-gradient(135deg,rgba(91,78,196,0.02),rgba(43,168,156,0.02))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 17 }}>{icon}</span>
            <h2 style={{ fontFamily: f, fontSize: 15, fontWeight: 700, color: C.dark, margin: 0, flex: 1 }}>{title}</h2>
            {qCount && <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: accent || C.primary, background: `${accent || C.primary}0c`, padding: "3px 9px", borderRadius: 20 }}>{qCount}</span>}
          </div>
          {subtitle && <p style={{ fontFamily: f, fontSize: 11.5, color: C.light, margin: "6px 0 0", fontStyle: "italic" }}>{subtitle}</p>}
        </div>
        <div style={{ padding: "18px 22px" }}>{children}</div>
      </div>
    </R>
  );
}

const P = ({ children, s }: { children: React.ReactNode; s?: React.CSSProperties }) => (
  <p style={{ fontFamily: f, fontSize: 13, lineHeight: 1.72, color: C.text, margin: "0 0 10px", ...s }}>{children}</p>
);

function Q({ num, text, type }: { num: number; text: string; type: string }) {
  const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
    "Fermée": { color: C.primary, bg: `${C.primary}08`, label: "Fermée" },
    "QCM": { color: C.teal, bg: `${C.teal}08`, label: "QCM" },
    "Likert": { color: C.amber, bg: `${C.amber}08`, label: "Likert 1–5" },
    "Ouverte": { color: C.green, bg: `${C.green}08`, label: "Ouverte" },
  };
  const cfg = typeConfig[type] || { color: C.light, bg: C.bgAlt, label: type };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 4, marginTop: 16 }}>
      <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 800, color: C.primary, minWidth: 28, marginTop: 2 }}>Q{num}</span>
      <div style={{ flex: 1 }}>
        <P s={{ margin: 0, fontWeight: 600, color: C.dark, fontSize: 13.5 }}>{text}</P>
        <span style={{ display: "inline-block", fontFamily: mono, fontSize: 9.5, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 10, marginTop: 4 }}>{cfg.label}</span>
      </div>
    </div>
  );
}

function Opts({ options }: { options: string[] }) {
  return (
    <div style={{ marginLeft: 38, marginTop: 8, marginBottom: 6 }}>
      {options.map((o, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${C.light}50`, flexShrink: 0 }} />
          <P s={{ margin: 0, fontSize: 12.5 }}>{o}</P>
        </div>
      ))}
    </div>
  );
}

function Likert({ labels }: { labels?: string[] }) {
  const l = labels || ["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Extrêmement"];
  return (
    <div style={{ marginLeft: 38, marginTop: 10, display: "flex", gap: 4, marginBottom: 6 }}>
      {l.map((label, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 4px", background: i === 0 ? `${C.primary}06` : i === l.length - 1 ? `${C.teal}06` : C.bgAlt, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 800, color: i < 2 ? C.primary : i > 2 ? C.teal : C.light }}>{i + 1}</div>
          <div style={{ fontFamily: f, fontSize: 9, color: C.light, marginTop: 3, lineHeight: 1.2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function Verbatim({ prompt }: { prompt: string }) {
  return (
    <div style={{ marginLeft: 38, marginTop: 8, padding: "10px 14px", background: `${C.teal}05`, borderRadius: 8, borderLeft: `2px solid ${C.teal}40` }}>
      <P s={{ margin: 0, fontSize: 11.5, fontStyle: "italic", color: C.teal }}>✍ Verbatim : {prompt}</P>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "14px 38px 6px" }} />;
}

const SECS = [
  { id: "ge-hero", l: "Titre" }, { id: "ge-consignes", l: "Consignes" }, { id: "ge-socio", l: "Données" },
  { id: "ge-s1", l: "Vécu global" }, { id: "ge-s2", l: "Os" }, { id: "ge-s3", l: "Endocrinien" },
  { id: "ge-s4", l: "Cardio" }, { id: "ge-s5", l: "Rénal" }, { id: "ge-s6", l: "Qualité de vie" },
];

export function GuideEntretien() {
  const [active, setActive] = useState("ge-hero");

  useEffect(() => {
    const o = new IntersectionObserver(
      (es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { threshold: 0.15 },
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
      <div id="ge-hero" style={{ background: `linear-gradient(165deg, ${C.dark} 0%, #2d2850 45%, #1a3d4a 100%)`, padding: "52px 20px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}12, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}10, transparent 70%)` }} />
        <R>
          <div style={{ display: "inline-block", fontSize: 9.5, fontWeight: 700, color: C.teal, background: `${C.teal}18`, padding: "4px 12px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 18 }}>
            Guide d&apos;entretien dirigé
          </div>
        </R>
        <R d={100}>
          <h1 style={{ fontFamily: f, fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.3, maxWidth: 480, marginInline: "auto" }}>
            Vécu des complications somatiques de l&apos;anorexie mentale précoce
          </h1>
        </R>
        <R d={200}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.4)", margin: "0 0 24px" }}>
            Margot Vire · DU TCA Enfant-Adolescent · Avril 2026
          </p>
        </R>
        <R d={300}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {["22 questions", "6 sections", "20–30 min"].map((t, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)" }}>{t}</span>
            ))}
          </div>
        </R>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* CONSIGNES */}
        <Sec id="ge-consignes" icon="📋" title="Consignes pour l'investigateur">
          <P>Ce questionnaire est administré en face-à-face auprès de patientes adultes actuellement hospitalisées, ayant reçu un diagnostic d&apos;anorexie mentale avant l&apos;âge de 14 ans.</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { icon: "⏱", label: "Durée", value: "20–30 min" },
              { icon: "📝", label: "Mode", value: "Face-à-face" },
            ].map((d, i) => (
              <div key={i} style={{ padding: "10px 14px", background: C.bgAlt, borderRadius: 10, textAlign: "center" as const }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{d.icon}</div>
                <div style={{ fontFamily: mono, fontSize: 9.5, fontWeight: 700, color: C.light, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{d.label}</div>
                <div style={{ fontFamily: f, fontSize: 13, fontWeight: 600, color: C.dark }}>{d.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { c: C.primary, t: "Questions fermées : cocher la réponse de la patiente" },
              { c: C.amber, t: "Échelles Likert : entourer le chiffre (1 = pas du tout → 5 = extrêmement)" },
              { c: C.teal, t: "Verbatims : noter les mots exacts entre guillemets" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 12px", background: `${r.c}06`, borderRadius: 8, borderLeft: `3px solid ${r.c}30` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.c, flexShrink: 0 }} />
                <P s={{ margin: 0, fontSize: 12 }}>{r.t}</P>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: `${C.amber}06`, borderRadius: 10 }}>
            <P s={{ margin: 0, fontSize: 12, fontStyle: "italic" }}>Rappeler à la patiente : participation volontaire, anonymisation des données, possibilité d&apos;interrompre à tout moment.</P>
          </div>
        </Sec>

        {/* SOCIO-DÉMO */}
        <Sec id="ge-socio" icon="👤" title="Données sociodémographiques et cliniques" subtitle="Pré-renseignées par le dossier médical avant l'entretien">
          {["Code patiente", "Âge actuel", "Âge de début de l'AM", "Durée d'évolution", "IMC actuel", "IMC minimal atteint", "Nombre d'hospitalisations", "Aménorrhée actuelle", "Sous-type AM"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: f, fontSize: 12.5, fontWeight: 600, color: C.dark, minWidth: 160 }}>{label}</span>
              <div style={{ flex: 1, height: 1, borderBottom: `1px dashed ${C.light}40` }} />
            </div>
          ))}
        </Sec>

        {/* SECTION 1 */}
        <Sec id="ge-s1" icon="🩺" title="Connaissance et vécu des complications" subtitle="Évaluer la connaissance qu'a la patiente de ses propres complications" accent={C.primary} qCount="Q1–Q3">
          <Q num={1} text="Avez-vous été informée de complications physiques liées à votre anorexie par un médecin ?" type="Fermée" />
          <Opts options={["Oui", "Non", "Je ne sais pas"]} />
          <Divider />

          <Q num={2} text="Parmi les complications suivantes, lesquelles vous ont été diagnostiquées ?" type="QCM" />
          <Opts options={["Fragilité osseuse / ostéoporose", "Problèmes hormonaux (règles, thyroïde)", "Problèmes cardiaques (rythme lent, malaises)", "Problèmes rénaux", "Problèmes dentaires", "Problèmes hépatiques (foie)", "Retard de croissance", "Autre : ___", "Aucune à ma connaissance"]} />
          <Divider />

          <Q num={3} text="Quelle complication physique vous préoccupe le plus au quotidien ?" type="Ouverte" />
          <Verbatim prompt="En quelques mots, quelle complication vous inquiète ou vous gêne le plus ?" />
        </Sec>

        {/* SECTION 2 */}
        <Sec id="ge-s2" icon="🦴" title="Complications osseuses" subtitle="Évaluer le vécu spécifique des atteintes osseuses" accent={C.primary} qCount="Q4–Q7">
          <Q num={4} text="Avez-vous déjà eu une fracture depuis le début de votre maladie ?" type="Fermée" />
          <Opts options={["Oui — combien : ___", "Non"]} />
          <Divider />

          <Q num={5} text="Avez-vous déjà eu un examen d'ostéodensitométrie ?" type="Fermée" />
          <Opts options={["Oui, résultat normal", "Oui, ostéopénie", "Oui, ostéoporose", "Oui, résultat inconnu", "Non, jamais"]} />
          <Divider />

          <Q num={6} text="Dans quelle mesure la fragilité de vos os vous inquiète-t-elle pour votre avenir ?" type="Likert" />
          <Likert />
          <Divider />

          <Q num={7} text="Ressentez-vous des douleurs osseuses ou articulaires au quotidien ?" type="Fermée" />
          <Opts options={["Jamais", "Rarement (1–2 fois/mois)", "Souvent (plusieurs fois/semaine)", "Tous les jours"]} />
        </Sec>

        {/* SECTION 3 */}
        <Sec id="ge-s3" icon="🧬" title="Complications endocriniennes" subtitle="Évaluer le vécu des perturbations hormonales" accent={C.teal} qCount="Q8–Q12">
          <Q num={8} text="Avez-vous actuellement vos règles ?" type="Fermée" />
          <Opts options={["Oui, régulières", "Oui, irrégulières", "Non (aménorrhée)", "Sous contraception hormonale"]} />
          <Divider />

          <Q num={9} text="Combien de temps avez-vous été sans règles au total (hors contraception) ?" type="Fermée" />
          <Opts options={["Moins de 6 mois", "6 mois à 1 an", "1 à 3 ans", "Plus de 3 ans", "Je n'ai jamais eu mes règles"]} />
          <Divider />

          <Q num={10} text="Dans quelle mesure l'absence ou l'irrégularité de vos règles vous préoccupe-t-elle ?" type="Likert" />
          <Likert />
          <Divider />

          <Q num={11} text="Avez-vous des préoccupations concernant votre fertilité future ?" type="Fermée" />
          <Opts options={["Oui, c'est une inquiétude majeure", "Oui, un peu", "Non, pas pour l'instant", "Ce sujet ne me concerne pas"]} />
          <Divider />

          <Q num={12} text="Ressentez-vous des symptômes que vous attribuez à un dérèglement hormonal ?" type="Fermée" />
          <P s={{ marginLeft: 38, fontSize: 11.5, color: C.light, fontStyle: "italic" }}>Fatigue intense, frilosité extrême, perte de cheveux, peau sèche</P>
          <Opts options={["Oui, plusieurs de ces symptômes", "Oui, un ou deux", "Non"]} />
        </Sec>

        {/* SECTION 4 */}
        <Sec id="ge-s4" icon="❤️" title="Complications cardiovasculaires" subtitle="Évaluer le vécu des atteintes cardiaques" accent={C.red} qCount="Q13–Q15">
          <Q num={13} text="Avez-vous déjà ressenti des palpitations, malaises ou évanouissements ?" type="Fermée" />
          <Opts options={["Jamais", "Rarement", "Plusieurs fois", "Fréquemment"]} />
          <Divider />

          <Q num={14} text="Vous a-t-on déjà signalé un rythme cardiaque anormalement lent (bradycardie) ?" type="Fermée" />
          <Opts options={["Oui", "Non", "Je ne sais pas"]} />
          <Divider />

          <Q num={15} text="Dans quelle mesure les complications cardiaques potentielles vous inquiètent-elles ?" type="Likert" />
          <Likert />
        </Sec>

        {/* SECTION 5 */}
        <Sec id="ge-s5" icon="🫘" title="Complications rénales" subtitle="Évaluer la connaissance et le vécu des atteintes rénales" accent={C.amber} qCount="Q16–Q17">
          <Q num={16} text="Vous a-t-on déjà parlé d'un problème rénal lié à votre anorexie ?" type="Fermée" />
          <Opts options={["Oui", "Non"]} />
          <Divider />

          <Q num={17} text="Avez-vous déjà été hospitalisée pour un problème de déshydratation ou un déséquilibre électrolytique ?" type="Fermée" />
          <Opts options={["Oui, une fois", "Oui, plusieurs fois", "Non"]} />
        </Sec>

        {/* SECTION 6 */}
        <Sec id="ge-s6" icon="💬" title="Impact global et qualité de vie" subtitle="Évaluer l'impact global des complications somatiques sur la qualité de vie" accent={C.green} qCount="Q18–Q22">
          <Q num={18} text="Globalement, dans quelle mesure les complications physiques affectent-elles votre vie quotidienne ?" type="Likert" />
          <Likert />
          <Divider />

          <Q num={19} text="Dans quelle mesure les complications physiques vous motivent-elles à poursuivre les soins ?" type="Likert" />
          <Likert />
          <Divider />

          <Q num={20} text="Pensez-vous que les complications physiques de l'anorexie sont suffisamment expliquées aux patientes ?" type="Fermée" />
          <Opts options={["Oui, tout à fait", "Plutôt oui", "Plutôt non", "Non, pas du tout"]} />
          <Divider />

          <Q num={21} text="Si vous pouviez dire une chose aux soignants concernant les conséquences physiques de l'anorexie, ce serait quoi ?" type="Ouverte" />
          <Verbatim prompt="Notez la réponse spontanée de la patiente, entre guillemets." />
          <Divider />

          <Q num={22} text="Y a-t-il autre chose que vous souhaiteriez ajouter concernant votre expérience des complications physiques ?" type="Ouverte" />
          <Verbatim prompt="Notez la réponse spontanée de la patiente, entre guillemets." />
        </Sec>

        {/* CLÔTURE */}
        <Sec icon="✅" title="Clôture de l'entretien">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Remercier la patiente pour sa participation",
              "Rappeler l&apos;anonymisation des données",
              "Proposer de revenir vers elle si elle souhaite compléter ses réponses",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${C.teal}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: C.teal }}>✓</span>
                </div>
                <P s={{ margin: 0, fontSize: 12.5 }}>{t}</P>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: C.bgAlt, borderRadius: 10 }}>
            <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.light, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 6 }}>Observations de l&apos;investigateur</div>
            <P s={{ margin: 0, fontSize: 12, fontStyle: "italic", color: C.light }}>Attitude, émotions observées, difficultés éventuelles</P>
          </div>
        </Sec>

        <R d={80}>
          <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 10.5, color: C.light }}>Document de travail · Guide d&apos;entretien v1 · Avril 2026</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: `${C.light}80`, marginTop: 4 }}>DU TCA Enfant-Adolescent · Université de Rouen · Hôpital Cochin</div>
          </div>
        </R>
      </div>
    </div>
  );
}
