"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#1A1A2E", text: "#1A1A2E", textSec: "#4A4A5A", textMut: "#8A8A96",
  border: "rgba(26,26,46,0.06)", grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};
const f = "'Plus Jakarta Sans',sans-serif";
const fi = "'Inter',sans-serif";

function useVis(t = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: t });
    obs.observe(el);
    return () => obs.disconnect();
  }, [t]);
  return [ref, vis];
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, vis] = useVis();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}s, transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, letterSpacing: ".03em", background: `${C.primary}12`, color: C.primary, fontFamily: fi }}>{children}</span>;
}

function Card({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <Fade delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        background: "#fff", borderRadius: 16, padding: "32px 28px", border: `1px solid ${C.border}`,
        transition: "all .3s cubic-bezier(.16,1,.3,1)", transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? "0 20px 40px rgba(91,78,196,.08)" : "0 2px 8px rgba(26,26,46,.03)", height: "100%",
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>{icon}</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10, fontFamily: f, lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: C.textSec, margin: 0, fontFamily: fi }}>{desc}</p>
      </div>
    </Fade>
  );
}

function Tier({ name, price, sub, features, highlighted = false, cta, delay = 0 }: {
  name: string; price: string; sub: string; features: string[]; highlighted?: boolean; cta: string; delay?: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Fade delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        background: highlighted ? C.dark : "#fff", borderRadius: 20, padding: "36px 28px 32px",
        border: highlighted ? "none" : `1px solid ${C.border}`,
        transition: "all .3s cubic-bezier(.16,1,.3,1)", transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: highlighted ? "0 24px 48px rgba(91,78,196,.15)" : hov ? "0 16px 32px rgba(26,26,46,.06)" : "0 2px 8px rgba(26,26,46,.03)",
        position: "relative", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
      }}>
        {highlighted && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.grad }} />}
        {highlighted && <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", background: `${C.teal}20`, color: C.teal, marginBottom: 16, alignSelf: "flex-start", fontFamily: fi }}>Recommandé</span>}
        <h4 style={{ fontSize: 16, fontWeight: 700, color: highlighted ? "#fff" : C.text, marginBottom: 8, fontFamily: f }}>{name}</h4>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: highlighted ? "#fff" : C.text, fontFamily: f, letterSpacing: "-.03em" }}>{price}</span>
          {price !== "0€" && <span style={{ fontSize: 15, color: highlighted ? "rgba(255,255,255,.5)" : C.textMut, marginLeft: 4, fontFamily: fi }}>/mois</span>}
        </div>
        <p style={{ fontSize: 13, color: highlighted ? "rgba(255,255,255,.6)" : C.textMut, marginBottom: 24, lineHeight: 1.5, fontFamily: fi }}>{sub}</p>
        <div style={{ flex: 1 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, fontSize: 14, color: highlighted ? "rgba(255,255,255,.85)" : C.textSec, lineHeight: 1.5, fontFamily: fi }}>
              <span style={{ color: C.teal, flexShrink: 0, marginTop: 2 }}>✓</span><span>{feat}</span>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: 14, borderRadius: 10, border: highlighted ? "none" : `1.5px solid ${C.primary}`, background: highlighted ? C.grad : "transparent", color: highlighted ? "#fff" : C.primary, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 24, fontFamily: f }}>{cta}</button>
      </div>
    </Fade>
  );
}

function FaqItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Fade delay={delay}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 0" }}>
        <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: 16 }}>
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

function BetweenVisitsDemo() {
  const entries = [
    { who: "Dr. Vire · Diététicienne", date: "12 avr.", what: "Plan nutritionnel ajusté, apports protéiques ↑, objectif -5% masse grasse à 6 mois. Adhésion bonne.", color: C.teal, icon: "🥗", locked: false },
    { who: "Dr. Renard · Psychologue", date: "15 avr.", what: "Suivi psychologique en cours, séances régulières.", color: "#E67E22", icon: "🔒", locked: true },
    { who: "M. Faure · APA", date: "14 avr.", what: "Programme APA : 3×/sem. Régularité 85%. VO2max +8% depuis janvier. Motivation stable.", color: "#8E44AD", icon: "🏃", locked: false },
    { who: "Dr. Lefèvre · MG", date: "18 avr.", what: "Renouvellement metformine. Tension artérielle 135/85. Bilan lipidique prescrit.", color: "#3498db", icon: "🩺", locked: false },
    { who: "Extraction bio auto", date: "20 avr.", what: "HbA1c : 7.2% (↓ vs 8.1% en jan.) · LDL : 1.45 g/L · TG : 1.8 g/L · Créatinine : 82 µmol/L", color: C.primary, icon: "🔬", locked: false },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,26,46,.04)", maxWidth: 580, margin: "0 auto" }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.primary, marginBottom: 8, fontFamily: fi }}>
        Marc, 52 ans, Prochain RDV avec vous : 3 mai
      </div>
      <p style={{ fontSize: 13, color: C.textMut, marginBottom: 20, fontFamily: fi }}>
        Ce qui s&apos;est passé depuis votre dernière consultation (8 janvier) :
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((e, i) => (
          <div key={i} style={{
            padding: "14px 16px", borderRadius: 12, borderLeft: `3px solid ${e.color}`,
            background: e.locked ? `${e.color}04` : C.bgAlt,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: e.color, fontFamily: fi }}>
                {e.icon} {e.who}
              </span>
              <span style={{ fontSize: 12, color: C.textMut, fontFamily: fi }}>{e.date}</span>
            </div>
            <p style={{
              fontSize: 14, margin: 0, fontFamily: fi, lineHeight: 1.55,
              color: e.locked ? C.textMut : C.text,
              fontStyle: e.locked ? "italic" : "normal",
            }}>{e.what}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 10, background: `${C.teal}08`, border: `1px solid ${C.teal}15` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 4, fontFamily: fi }}>COMPLÉTUDE PARCOURS OBÉSITÉ</div>
        <p style={{ fontSize: 13, color: C.textSec, margin: 0, fontFamily: fi, lineHeight: 1.5 }}>
          82% complet. Manquant : bilan lipidique de contrôle (prescrit, en attente), évaluation qualité de vie (non planifiée).
        </p>
      </div>
    </div>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "bio", label: "Récupérer et analyser les résultats bio dispersés entre labos et confrères", d: 40 },
    { id: "cr", label: "Comptes-rendus de consultation, courriers au MG et aux confrères", d: 45 },
    { id: "proto", label: "Protocoles : initiation GLP-1, switch insuline, titration, surveillance", d: 30 },
    { id: "coord", label: "Appeler la diét, le MG, le chirurgien, savoir ce qui s'est passé depuis 3 mois", d: 30 },
    { id: "msg", label: "Messages patients (questions sur le traitement, effets secondaires)", d: 25 },
    { id: "pcr", label: "Dossiers PCR, éligibilité, suivi des parcours structurés ARS", d: 20 },
    { id: "fact", label: "Facturation, préparation comptable", d: 25 },
    { id: "annul", label: "Annulations, reports, patients perdus de vue entre deux RDV trimestriels", d: 15 },
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
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, marginBottom: 24, fontFamily: fi }}>Votre temps invisible par semaine</div>
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
          {([[`${daily}min`, "par jour"], [`${weekH}h`, "par semaine"], [`${yearH}h`, "par an"]] as [string, string][]).map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f }}>{v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: fi }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,.06)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", margin: 0, fontFamily: fi, lineHeight: 1.7 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> hors consultation, non rémunéré.
            {" "}À 50€/h = <span style={{ color: C.teal, fontWeight: 700 }}>{yearVal.toLocaleString("fr-FR")}€/an</span>.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>149€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EndocrinoPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}::selection{background:${C.primary}22;color:${C.primary}}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: `${C.bg}e8`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: f }}>N</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: f }}>Nami</span>
          </div>
          <button style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: C.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: f }}>Créer mon espace gratuit</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: "clamp(120px,18vh,180px)", paddingBottom: "clamp(60px,8vh,100px)", paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <Fade><Badge>Pour les endocrinologues &amp; diabétologues</Badge></Fade>
        <Fade delay={0.1}>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginTop: 24, marginBottom: 20, fontFamily: f }}>
            3 mois entre deux RDV.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Voyez enfin ce qui s&apos;est passé.
            </span>
          </h1>
        </Fade>
        <Fade delay={0.2}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 620, margin: "0 auto 28px", fontFamily: fi }}>
            Obésité, diabète, thyroïde, SOPK, vos patients sont suivis entre vos consultations par un MG, un diététicien, un psychologue, un APA. Aujourd&apos;hui vous les revoyez à l&apos;aveugle. Avec Nami, vous arrivez avec le contexte complet.
          </p>
        </Fade>
        <Fade delay={0.25}>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {["Obésité complexe", "Diabète type 2", "GLP-1 / Ozempic", "Thyroïde", "SOPK", "Chirurgie bariatrique", "PCR Obésité"].map(p => (
              <span key={p} style={{ display: "inline-block", padding: "8px 18px", borderRadius: 100, fontSize: 14, fontWeight: 500, background: "#fff", border: `1px solid ${C.border}`, color: C.textSec, fontFamily: fi }}>{p}</span>
            ))}
          </div>
        </Fade>
        <Fade delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "16px 32px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</button>
            <button style={{ padding: "16px 32px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: f }}>Voir le cas Marc</button>
          </div>
        </Fade>
      </section>

      {/* STATS */}
      <section style={{ background: "#fff", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
          <StatBlock value="269" label="structures PCR Obésité en France" />
          <StatBlock value="5+" label="soignants par parcours obésité" delay={0.1} />
          <StatBlock value="Bio auto" label="HbA1c, lipides, créat extraits automatiquement" delay={0.2} />
        </div>
      </section>

      {/* BETWEEN VISITS DEMO */}
      <section style={{ background: C.dark, padding: "clamp(64px,10vh,100px) 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-.03em", fontFamily: f }}>
                Tout ce qui s&apos;est passé<br /><span style={{ color: C.teal }}>depuis 3 mois. En 30 secondes.</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 520, margin: "16px auto 0", fontFamily: fi, lineHeight: 1.6 }}>
                Avant de revoir Marc, vous ouvrez son dossier Nami. Le plan nutritionnel, l&apos;activité physique, le suivi psy, les résultats bio, tout est là. Vous consultez avec le contexte.
              </p>
            </div>
          </Fade>
          <Fade delay={0.2}><BetweenVisitsDemo /></Fade>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Badge>Ce qui change</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Finies les consultations à l&apos;aveugle.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {[
              { b: "Marc revient après 3 mois. Vous ne savez pas s'il a vu la diét, le psy, fait ses bilans. Vous passez 10 minutes à reconstituer.", a: "Vous ouvrez le dossier Nami : plan nutritionnel ajusté, APA régulière, psy actif, HbA1c à 7.2%. Vous consultez en 30 secondes de contexte." },
              { b: "Le MG a prescrit un bilan lipidique. L'avez-vous reçu ? Vous cherchez dans vos courriers.", a: "Les résultats bio sont extraits automatiquement et structurés dans le dossier. LDL, TG, HbA1c, tout est là." },
              { b: "Vous initiez un GLP-1. Le MG ne le sait pas. La diét ne sait pas. Le patient gère les effets secondaires seul.", a: "Vous mettez à jour dans Nami. Le MG et la diét voient l'initiation. La diét ajuste le plan en conséquence." },
              { b: "Le patient est éligible à la chirurgie bariatrique. Qui l'a vu ? Le bilan pré-op est-il complet ? Personne ne sait.", a: "L'indicateur de complétude montre le parcours pré-bariatrique : consultations faites, bilans en attente, étapes manquantes." },
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
                Résultats bio éparpillés, appels aux confrères,<br />courriers, protocoles GLP-1,
              </h2>
              <p style={{ fontSize: 15, color: C.textSec, maxWidth: 560, margin: "16px auto 0", fontFamily: fi, lineHeight: 1.7 }}>
                tout ça n&apos;est pas compris dans le prix de la consultation.
              </p>
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
              <Badge>Conçu pour les parcours longs</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Le parcours vit entre vos consultations.<br />Nami aussi.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            <Card icon="🔬" title="Extraction bio automatique" desc="HbA1c, bilan lipidique, TSH, créatinine, les résultats sont extraits et structurés automatiquement. Plus de recopie, plus de résultats perdus." delay={0} />
            <Card icon="👁️" title="Vue inter-consultations" desc="Ce que la diét, le MG, le psy, l'APA ont fait depuis votre dernier RDV, en un écran. Vous consultez avec le contexte, pas à l'aveugle." delay={0.1} />
            <Card icon="💊" title="Protocoles GLP-1 & insuline" desc="Initiation GLP-1 (sémaglutide, tirzepatide), switch insuline, titration, surveillance des effets secondaires. Protocoles HAS sourcés." delay={0.2} />
            <Card icon="📋" title="Parcours PCR Obésité" desc="Profils A, B, C, D configurés. Éligibilité, étapes, bilans requis. Prêt pour les 269 structures ARS. Candidatures ouvertes 5 mai 2026." delay={0.3} />
            <Card icon="🎙️" title="Enregistrement consultation" desc="Enregistrez vos observations. L'IA structure. Vous validez. Le MG et la diét reçoivent vos conclusions sans courrier." delay={0.4} />
            <Card icon="✅" title="Complétude parcours" desc="Bilan pré-bariatrique complet ? Bilan à 3 mois fait ? Évaluation psy réalisée ? L'indicateur montre ce qui manque." delay={0.5} />
          </div>
        </div>
      </section>

      {/* CITATION */}
      <section style={{ background: C.bgAlt, padding: "clamp(48px,8vh,80px) 24px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1.1rem,2.5vw,1.4rem)", fontStyle: "italic", color: C.text, maxWidth: 640, margin: "0 auto", lineHeight: 1.6, fontFamily: "'Playfair Display',serif" }}>
            &ldquo;Les 269 structures PCR Obésité ont besoin d&apos;un outil de coordination. Nami est prêt.&rdquo;
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, alignItems: "stretch" }}>
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie patients & soignants", "Fiche patient basique", "Annuaire soignants"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="Vue inter-consultations + adressage" features={["Tout Gratuit inclus", "Vue équipe entre vos RDV", "Adressage structuré", "App patient (photos repas)", "Téléexpertise tracée", "Facturation + visio"]} cta="Essayer" delay={0.1} />
            <Tier name="Intelligence" price="149€" sub="Bio auto + IA + protocoles" highlighted features={["Tout Coordination", "Extraction bio automatique", "Enregistrement + transcription IA", "Protocoles GLP-1, insuline, HAS", "60 000+ sources cliniques", "Essai 14 jours gratuit"]} cta="Essai gratuit" delay={0.2} />
            <Tier name="Pilotage" price="299€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, CR, trésorerie", "Export comptable"]} cta="Découvrir" delay={0.3} />
          </div>
          <Fade delay={0.4}><p style={{ textAlign: "center", fontSize: 13, color: C.textMut, marginTop: 24, fontFamily: fi }}>Structures PCR et cabinets d&apos;endocrinologie : offre Réseau à partir de 499€/mois.</p></Fade>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px", background: C.bgAlt }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: C.text, marginBottom: 40, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="Nami est-il adapté aux parcours PCR Obésité Complexe ?" a="Oui. Les 4 profils PCR (A, B, C, D définis par l'arrêté du 26 février 2026) sont configurables dans Nami. Éligibilité, étapes, bilans requis, suivi pluridisciplinaire, le tout structuré et traçable pour les ARS. Les candidatures ouvrent le 5 mai 2026." />
          <FaqItem q="Comment fonctionne l'extraction bio automatique ?" a="Quand un résultat biologique arrive dans le dossier (scan, import, transmission patient), Nami extrait les valeurs clés, HbA1c, bilan lipidique, TSH, créatinine, et les structure automatiquement. Plus de recopie manuelle, plus de valeurs perdues entre deux consultations." delay={0.06} />
          <FaqItem q="Les protocoles GLP-1 sont-ils sourcés ?" a="Oui. Initiation sémaglutide et tirzepatide, titration, surveillance des effets secondaires, contre-indications, switch entre molécules. Sourcés HAS et sociétés savantes (SFE, SFD). Accessibles en consultation." delay={0.12} />
          <FaqItem q="Pourquoi Intelligence (149€) est recommandé pour les endocrinos ?" a="Parce que l'extraction bio automatique et les protocoles médicamenteux sont vos outils quotidiens. La Coordination (79€) vous donne la vue d'ensemble. L'Intelligence y ajoute l'automatisation des données biologiques et l'IA, ce qui change radicalement la qualité de vos consultations trimestrielles." delay={0.18} />
          <FaqItem q="Le Pilotage à 299€, c'est quoi ?" a="Le cockpit financier complet : CA temps réel, charges, pré-déclarations fiscales (BNC, SELARL), bilan et compte de résultat préparés, export comptable. Vous êtes endocrinologue, pas chef d'entreprise, Nami prépare tout." delay={0.24} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.6rem,4.5vw,2.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.035em", marginBottom: 16, fontFamily: f }}>
            Vos patients vivent entre vos RDV.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Leur parcours aussi.</span>
          </h2>
        </Fade>
        <Fade delay={0.15}>
          <button style={{ padding: "18px 40px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 24px rgba(91,78,196,.25)", marginTop: 16 }}>Commencer gratuitement</button>
        </Fade>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.textMut, fontFamily: fi, lineHeight: 1.6 }}>Outil de coordination · Non dispositif médical · Conforme RGPD · © 2026 Nami</p>
      </footer>
    </div>
  );
}
