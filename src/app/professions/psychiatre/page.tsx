"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4",
  teal: "#2BA89C",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#1A1A2E",
  textSec: "#374151",
  textMut: "#6B7280",
  border: "rgba(26,26,46,0.06)",
  grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};
const f = "'Plus Jakarta Sans',sans-serif";
const fi = "'Inter',sans-serif";

function useVis(t = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: t }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [t]);
  return [ref, vis] as const;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, vis] = useVis();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}s, transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "6px 16px", borderRadius: 100,
      fontSize: 13, fontWeight: 600, letterSpacing: ".03em",
      background: `${C.primary}12`, color: C.primary, fontFamily: fi,
    }}>
      {children}
    </span>
  );
}

function Card({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <Fade delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff", borderRadius: 16, padding: "32px 28px",
          border: `1px solid ${C.border}`,
          transition: "all .3s cubic-bezier(.16,1,.3,1)",
          transform: hov ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hov ? "0 20px 40px rgba(91,78,196,.08)" : "0 2px 8px rgba(26,26,46,.03)",
          height: "100%",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>{icon}</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10, fontFamily: f, lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: C.textSec, margin: 0, fontFamily: fi }}>{desc}</p>
      </div>
    </Fade>
  );
}

function Tier({ name, price, sub, features, highlighted, cta, delay = 0 }: {
  name: string; price: string; sub: string; features: string[];
  highlighted?: boolean; cta: string; delay?: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Fade delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: highlighted ? C.dark : "#fff",
          borderRadius: 20, padding: "36px 28px 32px",
          border: highlighted ? "none" : `1px solid ${C.border}`,
          transition: "all .3s cubic-bezier(.16,1,.3,1)",
          transform: hov ? "translateY(-4px)" : "translateY(0)",
          boxShadow: highlighted ? "0 24px 48px rgba(91,78,196,.15)" : hov ? "0 16px 32px rgba(26,26,46,.06)" : "0 2px 8px rgba(26,26,46,.03)",
          position: "relative", overflow: "hidden", height: "100%",
          display: "flex", flexDirection: "column",
        }}
      >
        {highlighted && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.grad }} />}
        {highlighted && (
          <span style={{
            display: "inline-block", padding: "4px 12px", borderRadius: 100,
            fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
            background: `${C.teal}20`, color: C.teal, marginBottom: 16,
            alignSelf: "flex-start", fontFamily: fi,
          }}>Recommandé</span>
        )}
        <h4 style={{ fontSize: 16, fontWeight: 700, color: highlighted ? "#fff" : C.text, marginBottom: 8, fontFamily: f }}>{name}</h4>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: highlighted ? "#fff" : C.text, fontFamily: f, letterSpacing: "-.03em" }}>{price}</span>
          {price !== "0€" && <span style={{ fontSize: 15, color: highlighted ? "rgba(255,255,255,.5)" : C.textMut, marginLeft: 4, fontFamily: fi }}>/mois</span>}
        </div>
        <p style={{ fontSize: 13, color: highlighted ? "rgba(255,255,255,.6)" : C.textMut, marginBottom: 24, lineHeight: 1.5, fontFamily: fi }}>{sub}</p>
        <div style={{ flex: 1 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, fontSize: 14, color: highlighted ? "rgba(255,255,255,.85)" : C.textSec, lineHeight: 1.5, fontFamily: fi }}>
              <span style={{ color: C.teal, flexShrink: 0, marginTop: 2 }}>✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
        <button style={{
          width: "100%", padding: 14, borderRadius: 10,
          border: highlighted ? "none" : `1.5px solid ${C.primary}`,
          background: highlighted ? C.grad : "transparent",
          color: highlighted ? "#fff" : C.primary,
          fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 24, fontFamily: f,
        }}>{cta}</button>
      </div>
    </Fade>
  );
}

function FaqItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Fade delay={delay}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 0" }}>
        <button onClick={() => setOpen(!open)} style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: 16,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: f, lineHeight: 1.4 }}>{q}</span>
          <span style={{ fontSize: 20, color: C.textMut, flexShrink: 0, transition: "transform .3s ease", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 500 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.16,1,.3,1)" }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.textSec, paddingTop: 12, fontFamily: fi, margin: 0 }}>{a}</p>
        </div>
      </div>
    </Fade>
  );
}

function StatBlock({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <Fade delay={delay}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f, letterSpacing: "-.03em", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 14, color: C.textMut, marginTop: 8, fontFamily: fi }}>{label}</div>
      </div>
    </Fade>
  );
}

function ConfidentialityDemo() {
  const [view, setView] = useState("equipe");
  const equipeView = [
    { who: "Dr. Vire · Diététicienne", date: "12 avril", note: "Plan nutritionnel ajusté, apports protéiques augmentés. Prochain RDV : 10 mai.", color: C.teal },
    { who: "Dr. Lefèvre · Médecin traitant", date: "8 avril", note: "Renouvellement ordonnance. Bilan bio prescrit.", color: "#3498db" },
    { who: "Dr. Martin · Psychiatre (vous)", date: "15 avril", note: null as string | null, status: "Prise en charge psychiatrique en cours", color: C.primary },
    { who: "M. Faure · APA", date: "14 avril", note: "3 séances/semaine. Régularité 85%.", color: "#E67E22", status: undefined as string | undefined },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,26,46,.04)", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["equipe", "vous"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: view === v ? C.primary : C.bgAlt,
            color: view === v ? "#fff" : C.textSec,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fi,
            transition: "all .2s",
          }}>
            {v === "equipe" ? "Ce que l'équipe voit" : "Ce que VOUS voyez"}
          </button>
        ))}
      </div>

      {view === "equipe" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {equipeView.map((entry, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: 12,
              borderLeft: `3px solid ${entry.color}`,
              background: entry.note === null ? `${C.primary}04` : C.bgAlt,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: entry.color, fontFamily: fi }}>{entry.who}</span>
                <span style={{ fontSize: 12, color: C.textMut, fontFamily: fi }}>{entry.date}</span>
              </div>
              {entry.note ? (
                <p style={{ fontSize: 14, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.5 }}>{entry.note}</p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontFamily: fi }}>🔒</span>
                  <p style={{ fontSize: 14, color: C.textMut, margin: 0, fontFamily: fi, fontStyle: "italic" }}>{entry.status}</p>
                </div>
              )}
            </div>
          ))}
          <div style={{ padding: "12px 16px", borderRadius: 10, background: `${C.primary}06`, border: `1px solid ${C.primary}12`, marginTop: 4 }}>
            <p style={{ fontSize: 13, color: C.primary, margin: 0, fontFamily: fi, fontWeight: 600 }}>
              Vos notes restent confidentielles. L&apos;équipe voit uniquement que la prise en charge psychiatrique est active.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, borderLeft: `3px solid ${C.primary}`, background: C.bgAlt }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 6, fontFamily: fi }}>Vos notes complètes (visibles par vous seul)</div>
            <p style={{ fontSize: 14, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.6 }}>
              Séance du 15 avril. Patiente stable. Humeur euthymique. Sommeil amélioré sous mirtazapine 15mg. Maintien du traitement. Travail en cours sur les conduites restrictives. Prochaine séance : 29 avril.
            </p>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 12, borderLeft: `3px solid ${C.teal}`, background: `${C.teal}04` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 6, fontFamily: fi }}>Ce que vous choisissez de partager (opt-in)</div>
            <p style={{ fontSize: 14, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.6 }}>
              Exemple : &quot;Traitement bien toléré. Suivi régulier. Pas de modification de traitement nécessitant un ajustement somatique.&quot;
            </p>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: `${C.teal}06`, border: `1px solid ${C.teal}12` }}>
            <p style={{ fontSize: 13, color: C.teal, margin: 0, fontFamily: fi, fontWeight: 600 }}>
              Vous décidez ce qui est partagé. Toujours opt-in, jamais par défaut.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "adressage", label: "Reconstituer le contexte d'un patient adressé sans info", d: 45 },
    { id: "cr", label: "Rédiger courriers au MG, à l'endocrino, certificats", d: 40 },
    { id: "msg", label: "Messages patients entre deux séances, urgences", d: 35 },
    { id: "proto", label: "Vérifier interactions, protocoles de switch, titration, bilan sous lithium", d: 30 },
    { id: "coord", label: "Appeler le MG, la diét, l'infirmier psy, se coordonner par téléphone", d: 25 },
    { id: "fact", label: "Facturation, impayés, préparation comptable", d: 25 },
    { id: "annul", label: "Annulations, reports, patients perdus de vue", d: 20 },
    { id: "form", label: "Se former, lire les nouvelles recos, congrès", d: 20 },
  ];
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    tasks.forEach(t => { v[t.id] = t.d; });
    return v;
  });
  const tot = Object.values(vals).reduce((a, b) => a + b, 0);
  const daily = Math.round(tot / 5);
  const weekH = (tot / 60).toFixed(1);
  const yearH = Math.round(tot / 60 * 52);
  const yearVal = Math.round(tot / 60 * 52 * 50);

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "32px 24px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, marginBottom: 24, fontFamily: fi }}>
        Votre temps invisible par semaine
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {tasks.map(t => (
          <div key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: fi, lineHeight: 1.4, flex: 1, paddingRight: 12 }}>{t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: fi, minWidth: 45, textAlign: "right" }}>{vals[t.id]} min</span>
            </div>
            <input type="range" min={0} max={120} step={5} value={vals[t.id]}
              onChange={e => setVals(v => ({ ...v, [t.id]: parseInt(e.target.value) }))}
              style={{ width: "100%", height: 4, borderRadius: 2, outline: "none", cursor: "pointer", accentColor: C.primary }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: "20px", borderRadius: 16, background: C.dark, color: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          {[[`${daily}min`, "par jour"], [`${weekH}h`, "par semaine"], [`${yearH}h`, "par an"]].map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f }}>{v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: fi }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,.06)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", margin: 0, fontFamily: fi, lineHeight: 1.7 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> non rémunéré.
            {" "}À 50€/h = <span style={{ color: C.teal, fontWeight: 700 }}>{yearVal.toLocaleString("fr-FR")}€/an</span>.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>79€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PsychiatrePage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}::selection{background:${C.primary}22;color:${C.primary}}`}</style>

      {/* NAV */}

      {/* HERO */}
      <section style={{ paddingTop: "clamp(120px,18vh,180px)", paddingBottom: "clamp(60px,8vh,100px)", paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <Fade><Badge>Pour les psychiatres</Badge></Fade>
        <Fade delay={0.1}>
          <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginTop: 24, marginBottom: 20, fontFamily: f }}>
            Coordonnez avec l&apos;équipe.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Gardez la main sur vos notes.
            </span>
          </h1>
        </Fade>
        <Fade delay={0.2}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 600, margin: "0 auto 36px", fontFamily: fi }}>
            TCA, dépression sévère, addictions, TSA, vos patients sont suivis par une équipe.
            Le MG, le diététicien, l&apos;endocrino ont besoin de savoir que la prise en charge psy
            est en place. Pas ce qui s&apos;y dit. Nami respecte cette frontière.
          </p>
        </Fade>
        <Fade delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "16px 32px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</button>
            <button style={{ padding: "16px 32px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: f }}>Voir la confidentialité</button>
          </div>
        </Fade>
      </section>

      {/* STATS */}
      <section style={{ background: "#fff", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
          <StatBlock value="🔒" label="Notes confidentielles par défaut" />
          <StatBlock value="Opt-in" label="Vous choisissez ce que l'équipe voit" delay={0.1} />
          <StatBlock value="0 appel" label="pour se coordonner avec le MG" delay={0.2} />
        </div>
      </section>

      {/* CONFIDENTIALITY DEMO */}
      <section style={{ background: C.dark, padding: "clamp(64px,10vh,100px) 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-.03em", fontFamily: f }}>
                La confidentialité,<br /><span style={{ color: C.teal }}>par design.</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 520, margin: "16px auto 0", fontFamily: fi, lineHeight: 1.6 }}>
                Vos notes ne sont jamais visibles par l&apos;équipe. Seul le statut
                de la prise en charge est partagé. Vous pouvez choisir de partager
                une observation, c&apos;est toujours votre décision.
              </p>
            </div>
          </Fade>
          <Fade delay={0.2}><ConfidentialityDemo /></Fade>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Badge>Le paradoxe du psychiatre</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Central dans le parcours.<br />Isolé dans la coordination.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {[
              { b: "Le MG vous adresse un patient « pour avis psy ». Aucun contexte. Vous passez 20 minutes à reconstituer l'histoire.", a: "L'adressage arrive avec le dossier structuré : antécédents, traitements, résultats bio, motif précis." },
              { b: "Vous prescrivez de la mirtazapine. L'endocrino prescrit de la metformine. Personne ne vérifie les interactions.", a: "L'équipe voit les traitements en cours. Le moteur signale les interactions potentielles à vérifier." },
              { b: "Votre patient TCA ne vient plus chez la diét depuis 3 semaines. Vous l'apprenez par hasard.", a: "L'indicateur de complétude signale l'interruption. Vous en parlez en séance." },
              { b: "Le MG vous appelle pour savoir « où en est le suivi psy ». Vous ne pouvez pas détailler par téléphone.", a: "Le MG voit dans Nami : « Prise en charge psy active, suivi régulier ». Il a l'info sans que vous décrochiez." },
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.1}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.border}`, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                    <span style={{ color: "#e74c3c", fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✗</span>
                    <p style={{ fontSize: 14, color: C.textMut, margin: 0, fontFamily: fi, lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(231,76,60,.3)" }}>{item.b}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: C.teal, fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <p style={{ fontSize: 14, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.5, fontWeight: 500 }}>{item.a}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPS INVISIBLE */}
      <section style={{ padding: "clamp(64px,10vh,120px) 24px", background: C.bgAlt }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Badge>Le temps invisible</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Tout ce temps hors séance<br />que personne ne paie.
              </h2>
            </div>
          </Fade>
          <Fade delay={0.15}><TimeCalc /></Fade>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "clamp(64px,10vh,120px) 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Badge>Vos outils</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Coordonnez sans compromis<br />sur la confidentialité.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            <Card icon="🔒" title="Confidentialité par défaut" desc="Vos notes ne sont jamais visibles. Seul le statut est partagé : prise en charge active, fréquence, pas de contenu. Vous partagez ce que vous décidez." delay={0} />
            <Card icon="📋" title="Adressages entrants structurés" desc="Quand un MG vous adresse un patient, vous recevez le dossier complet : antécédents, traitements, bio, motif. Plus de première consultation à l'aveugle." delay={0.1} />
            <Card icon="💊" title="Protocoles médicamenteux" desc="Switch d'antidépresseur, titration, surveillance bio sous lithium ou clozapine, interactions. Les protocoles HAS et sociétés savantes accessibles en consultation." delay={0.2} />
            <Card icon="🎙️" title="Enregistrement de séance" desc="Enregistrez vos observations. L'IA structure un brouillon privé. Vous validez. Rien n'est partagé sauf votre choix explicite." delay={0.3} />
            <Card icon="👥" title="Vue équipe sans intrusion" desc="Vous voyez ce que les autres soignants font, plan nutritionnel, activité physique, résultats bio, sans qu'ils voient vos notes." delay={0.4} />
            <Card icon="✅" title="Indicateur de complétude" desc="Le suivi diét est interrompu ? Le bilan bio est en retard ? Vous le voyez dans Nami, vous en parlez en séance." delay={0.5} />
          </div>
        </div>
      </section>

      {/* CITATION */}
      <section style={{ background: C.bgAlt, padding: "clamp(48px,8vh,80px) 24px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1.1rem,2.5vw,1.4rem)", fontStyle: "italic", color: C.text, maxWidth: 640, margin: "0 auto", lineHeight: 1.6, fontFamily: "'Playfair Display',serif" }}>
            &quot;Le psychiatre a besoin de savoir ce qui se passe autour de son patient. L&apos;équipe a besoin de savoir que le suivi psy est en place. Nami donne les deux, sans franchir la ligne.&quot;
          </p>
          <p style={{ fontSize: 14, color: C.textMut, marginTop: 20, fontFamily: fi }}>Margot Vire, Diététicienne-nutritionniste, fondatrice de Nami</p>
        </Fade>
      </section>

      {/* PRICING */}
      <section style={{ padding: "clamp(64px,10vh,120px) 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Badge>Tarifs</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Commencez gratuitement.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "stretch" }}>
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie patients & soignants", "Fiche patient basique", "Annuaire soignants"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="Coordination confidentielle" features={["Tout Gratuit inclus", "Adressages entrants structurés", "Vue équipe (vos notes protégées)", "Partage opt-in uniquement", "Téléexpertise tracée", "Facturation + visio"]} cta="Essayer" delay={0.1} />
            <Tier name="Intelligence" price="149€" sub="L'IA pour vos séances" highlighted features={["Tout Coordination", "Enregistrement + transcription privée", "Protocoles médicamenteux", "60 000+ sources cliniques", "Essai 14 jours gratuit"]} cta="Essai gratuit" delay={0.2} />
            <Tier name="Pilotage" price="299€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, CR, trésorerie", "Export comptable"]} cta="Découvrir" delay={0.3} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px", background: C.bgAlt }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: C.text, marginBottom: 40, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="Mes notes de séance sont-elles vraiment confidentielles ?" a="Oui. Par défaut, l'équipe ne voit que le statut : « Prise en charge psychiatrique en cours, suivi régulier ». Le contenu de vos séances n'est jamais visible. Si vous souhaitez partager une observation spécifique (par ex. « traitement bien toléré, pas d'ajustement somatique nécessaire »), c'est opt-in, vous rédigez ce que vous voulez partager." />
          <FaqItem q="Le MG peut-il me demander d'en dire plus ?" a="Le MG peut vous envoyer une demande de téléexpertise dans Nami, c'est une question structurée. Vous répondez ce que vous jugez approprié, dans le cadre de votre secret professionnel. Nami ne force jamais le partage." delay={0.06} />
          <FaqItem q="L'enregistrement de séance est-il sécurisé ?" a="L'enregistrement et la transcription restent dans votre espace privé. Le brouillon IA est un outil pour VOUS, pour structurer vos notes. Il n'est jamais partagé automatiquement." delay={0.12} />
          <FaqItem q="Quels protocoles sont disponibles ?" a="Les protocoles HAS et des sociétés savantes : switch d'antidépresseur, titration, surveillance bio sous lithium et clozapine, interactions médicamenteuses, parcours TCA, dépression résistante, addictions. Base de 60 000+ sources, 10 référentiels." delay={0.18} />
          <FaqItem q="Comment fonctionne la facturation ?" a="Le tier Essentiel (inclus dans Coordination) couvre la facturation non conventionnée : notes d'honoraires, suivi des paiements, export comptable. Adapté aux psychiatres en secteur 2 ou déconventionnés." delay={0.24} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.6rem,4.5vw,2.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.035em", marginBottom: 16, fontFamily: f }}>
            Coordonnez.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sans rien révéler.</span>
          </h2>
        </Fade>
        <Fade delay={0.15}>
          <button style={{ padding: "18px 40px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 24px rgba(91,78,196,.25)", marginTop: 16 }}>Commencer gratuitement</button>
        </Fade>
      </section>

    </div>
  );
}
