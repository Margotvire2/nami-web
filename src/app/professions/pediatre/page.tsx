"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#111118", text: "#1A1A2E", textSec: "#374151", textMut: "#6B7280",
  border: "rgba(26,26,46,0.06)", grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};
const f = "'Plus Jakarta Sans',sans-serif";
const fi = "'Inter',sans-serif";

function useVis(t?: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: t || 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [t]);
  return [ref, vis] as const;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, vis] = useVis();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}s, transform .6s cubic-bezier(.16,1,.3,1) ${delay}s` }}>
      {children}
    </div>
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
        background: "#fff", borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.border}`,
        transition: "all .3s cubic-bezier(.16,1,.3,1)", transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 16px 32px rgba(91,78,196,.08)" : "0 2px 8px rgba(26,26,46,.03)", height: "100%",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: f, lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textSec, margin: 0, fontFamily: fi }}>{desc}</p>
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
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        background: highlighted ? C.dark : "#fff", borderRadius: 20, padding: "32px 24px 28px",
        border: highlighted ? "none" : `1px solid ${C.border}`,
        transition: "all .3s cubic-bezier(.16,1,.3,1)", transform: hov ? "translateY(-4px)" : "none",
        boxShadow: highlighted ? "0 20px 40px rgba(91,78,196,.15)" : hov ? "0 12px 28px rgba(26,26,46,.06)" : "0 2px 8px rgba(26,26,46,.03)",
        position: "relative", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
      }}>
        {highlighted && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.grad }} />}
        {highlighted && <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", background: `${C.teal}20`, color: C.teal, marginBottom: 14, alignSelf: "flex-start", fontFamily: fi }}>Recommandé</span>}
        <h4 style={{ fontSize: 15, fontWeight: 700, color: highlighted ? "#fff" : C.text, marginBottom: 6, fontFamily: f }}>{name}</h4>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: highlighted ? "#fff" : C.text, fontFamily: f, letterSpacing: "-.03em" }}>{price}</span>
          {price !== "0€" && <span style={{ fontSize: 14, color: highlighted ? "rgba(255,255,255,.5)" : C.textMut, marginLeft: 4, fontFamily: fi }}>/mois</span>}
        </div>
        <p style={{ fontSize: 12, color: highlighted ? "rgba(255,255,255,.55)" : C.textMut, marginBottom: 20, lineHeight: 1.4, fontFamily: fi }}>{sub}</p>
        <div style={{ flex: 1 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 13, color: highlighted ? "rgba(255,255,255,.8)" : C.textSec, lineHeight: 1.45, fontFamily: fi }}>
              <span style={{ color: C.teal, flexShrink: 0, marginTop: 2, fontSize: 12 }}>✓</span><span>{feat}</span>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: 12, borderRadius: 10, border: highlighted ? "none" : `1.5px solid ${C.primary}`, background: highlighted ? C.grad : "transparent", color: highlighted ? "#fff" : C.primary, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 20, fontFamily: f }}>{cta}</button>
      </div>
    </Fade>
  );
}

function FaqItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Fade delay={delay}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
        <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: f, lineHeight: 1.4 }}>{q}</span>
          <span style={{ fontSize: 18, color: C.textMut, flexShrink: 0, transition: "transform .3s ease", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.16,1,.3,1)" }}>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textSec, paddingTop: 10, fontFamily: fi, margin: 0 }}>{a}</p>
        </div>
      </div>
    </Fade>
  );
}

function CaseDemo() {
  const team = [
    { role: "Vous, pédiatre", color: C.primary, note: "Cassure courbe poids P25 vers P10 entre 12 et 18 mois. Suspicion APLV. Adressage allergologue + diététicien. Vaccins à jour." },
    { role: "Mme Vire, diététicienne", color: C.teal, note: "Diversification adaptée. Régime d'éviction PLV en place. Apports calciques compensés par alternatives végétales. Courbe de poids en cours de stabilisation." },
    { role: "Dr. Petit, allergologue", color: "#E67E22", note: "Prick-tests positifs lait de vache (6mm). IgE spécifiques en attente. Oeuf et arachide négatifs. Pas d'ITA pour le moment." },
    { role: "Mme Duval, orthophoniste", color: "#8E44AD", note: "Bilan de langage réalisé : retard léger de parole (simplifications phonologiques). 1 séance/semaine recommandée. Prochain bilan dans 6 mois." },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: `1px solid ${C.border}`, boxShadow: "0 6px 24px rgba(26,26,46,.04)", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.primary, marginBottom: 6, fontFamily: fi }}>
        Lina, 2 ans, cassure de courbe + APLV + retard de parole
      </div>
      <p style={{ fontSize: 12, color: C.textMut, marginBottom: 16, fontFamily: fi }}>
        Vous l&apos;avez orientée il y a 2 mois. Voici ce qui s&apos;est passé depuis :
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {team.map((m, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 10, borderLeft: `3px solid ${m.color}`, background: C.bgAlt }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 4, fontFamily: fi }}>{m.role}</div>
            <p style={{ fontSize: 13, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.5 }}>{m.note}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: `${C.teal}08`, border: `1px solid ${C.teal}15` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 3, fontFamily: fi }}>COMPLÉTUDE</div>
        <p style={{ fontSize: 12, color: C.textSec, margin: 0, fontFamily: fi, lineHeight: 1.45 }}>
          Parcours en cours. IgE spécifiques en attente. Consultation ORL non planifiée (à prévoir si otites récurrentes). Prochain contrôle courbe de poids : 3 mois.
        </p>
      </div>
      <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, background: `${C.primary}06`, border: `1px solid ${C.primary}12` }}>
        <p style={{ fontSize: 12, color: C.primary, margin: 0, fontFamily: fi, fontWeight: 600 }}>
          Les parents de Lina voient le parcours dans l&apos;app : prochains RDV, équipe, progression de la courbe. Ils savent quoi faire, sans appeler 4 cabinets.
        </p>
      </div>
    </div>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "parents", label: "Répondre aux messages parents (fièvre, alimentation, inquiétudes)", d: 50 },
    { id: "cr", label: "Comptes-rendus, courriers au spécialiste, certificats", d: 35 },
    { id: "carnet", label: "Carnet de santé, vaccins, courbes, examens obligatoires", d: 30 },
    { id: "pai", label: "PAI scolaires, certificats crèche, protocoles médicaments", d: 25 },
    { id: "orient", label: "Trouver le bon orthophoniste, allergologue, ORL, psy dans la zone", d: 25 },
    { id: "coord", label: "Appeler les parameds, le MG quand l'enfant grandit, l'école", d: 20 },
    { id: "fact", label: "Facturation, tiers payant, préparation comptable", d: 25 },
    { id: "form", label: "Se former, nouvelles recos, calendrier vaccinal", d: 15 },
  ];
  const [vals, setVals] = useState<Record<string, number>>(() => { const v: Record<string, number> = {}; tasks.forEach(t => { v[t.id] = t.d; }); return v; });
  const tot = Object.values(vals).reduce((a, b) => a + b, 0);
  const daily = Math.round(tot / 5);
  const weekH = (tot / 60).toFixed(1);
  const yearH = Math.round(tot / 60 * 52);
  const yearVal = Math.round(tot / 60 * 52 * 50);

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, marginBottom: 20, fontFamily: fi }}>Votre temps invisible par semaine</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tasks.map(t => (
          <div key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: fi, lineHeight: 1.35, flex: 1, paddingRight: 12 }}>{t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: fi, minWidth: 45, textAlign: "right" }}>{vals[t.id]} min</span>
            </div>
            <input type="range" min={0} max={120} step={5} value={vals[t.id]}
              onChange={e => setVals(v => ({ ...v, [t.id]: parseInt(e.target.value) }))}
              style={{ width: "100%", height: 4, borderRadius: 2, outline: "none", cursor: "pointer", accentColor: C.primary }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: "18px", borderRadius: 14, background: C.dark, color: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[[`${daily}min`, "par jour"], [`${weekH}h`, "par semaine"], [`${yearH}h`, "par an"]].map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontFamily: fi }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,.06)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", margin: 0, fontFamily: fi, lineHeight: 1.6 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> hors consultation, non rémunéré.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>79€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PediatrePage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.primary}22; color: ${C.primary}; }
      `}</style>


      {/* HERO */}
      <section style={{ paddingTop: 40, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <Fade><Badge>Pour les pédiatres</Badge></Fade>
        <Fade delay={0.08}>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: "-.035em", marginTop: 20, marginBottom: 16, fontFamily: f }}>
            La courbe casse. Vous repérez.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Mais ensuite, qui coordonne ?
            </span>
          </h1>
        </Fade>
        <Fade delay={0.14}>
          <p style={{ fontSize: "clamp(.95rem,2vw,1.1rem)", lineHeight: 1.65, color: C.textSec, maxWidth: 580, margin: "0 auto 20px", fontFamily: fi }}>
            Cassure de courbe, APLV, eczéma, retard de langage, otites à répétition, reflux, troubles du sommeil. Vous orientez vers l&apos;allergologue, l&apos;orthophoniste, l&apos;ORL, le diététicien. Et après ? Après, le patient disparait dans 4 cabinets différents. Avec Nami, vous gardez la vue d&apos;ensemble.
          </p>
        </Fade>
        <Fade delay={0.18}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {["Cassure de courbe", "APLV / allergies", "Retard de langage", "Eczéma", "Reflux / coliques", "Otites récurrentes", "Troubles du sommeil", "Vaccinations"].map(p => (
              <span key={p} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: "#fff", border: `1px solid ${C.border}`, color: C.textSec, fontFamily: fi }}>{p}</span>
            ))}
          </div>
        </Fade>
        <Fade delay={0.22}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</button>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: `1.5px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: f }}>Voir le cas Lina</button>
          </div>
        </Fade>
      </section>

      {/* CASE */}
      <section style={{ background: C.dark, padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-.03em", fontFamily: f }}>
                Lina, 2 ans. Cassure de courbe, APLV, retard de parole.<br />
                <span style={{ color: C.teal }}>Vous avez orienté. Voici ce qui s&apos;est passé.</span>
              </h2>
            </div>
          </Fade>
          <Fade delay={0.15}><CaseDemo /></Fade>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Badge>Ce qui change</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Vous repérez, vous orientez. Et après, vous savez.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { b: "Vous repérez une cassure de courbe à 18 mois. Vous adressez au diét et à l'allergologue. 3 mois plus tard, aucune nouvelle.", a: "Le diét documente l'éviction PLV et la reprise pondérale. L'allergologue envoie les résultats des prick-tests. Vous voyez tout." },
              { b: "L'orthophoniste fait un bilan de langage. Vous recevez le compte-rendu par courrier 6 semaines plus tard. Il est dans une pile.", a: "Le bilan est dans le dossier Nami dès validation. Retard léger de parole, 1 séance/semaine, prochain bilan dans 6 mois. Lu en 1 minute." },
              { b: "Les parents appellent : Lina a vomi après un yaourt. APLV confirmée ? En attente de résultats ? Vous ne savez plus où on en est.", a: "Le dossier Nami : prick-tests positifs lait (6mm), IgE en attente, éviction en place. Vous répondez en 30 secondes." },
              { b: "Le PAI doit être fait pour la crèche. L'allergologue a les résultats, vous avez le certificat à faire, personne ne se coordonne.", a: "Les résultats de l'allergologue sont dans le dossier. Vous préparez le PAI avec les données à jour. L'indicateur signale l'échéance." },
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.08}>
                <div style={{ background: "#fff", borderRadius: 14, padding: "22px 20px", border: `1px solid ${C.border}`, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                    <span style={{ color: "#e74c3c", fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✗</span>
                    <p style={{ fontSize: 13, color: C.textMut, margin: 0, fontFamily: fi, lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(231,76,60,.3)" }}>{item.b}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: C.teal, fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <p style={{ fontSize: 13, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.5, fontWeight: 500 }}>{item.a}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPS INVISIBLE */}
      <section style={{ padding: "32px 24px 36px", background: C.bgAlt }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <Badge>Le temps invisible</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Messages parents, courriers, PAI, carnet de santé, orientation...
              </h2>
              <p style={{ fontSize: 14, color: C.textSec, marginTop: 6, fontFamily: fi }}>Ce n&apos;est pas compris dans le prix de la consultation.</p>
            </div>
          </Fade>
          <Fade delay={0.1}><TimeCalc /></Fade>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Badge>Vos outils au quotidien</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Vous repérez, vous orientez, vous suivez.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <Card icon="📈" title="Courbes intégrées" desc="Courbes de croissance OMS et Fenton, 11 tranches d'âge, directement dans le dossier. Vous repérez la cassure, vous orientez." delay={0} />
            <Card icon="🔍" title="Adressage pédiatrique" desc="Trouvez l'allergologue, l'orthophoniste, l'ORL, le diét dans la zone du patient. Par spécialité, disponibilité, pathologie." delay={0.06} />
            <Card icon="👨‍👩‍👧" title="App parents" desc="Les parents voient l'équipe, les RDV, la progression. Ils savent quoi faire sans appeler 4 cabinets. Partenaires, pas perdus." delay={0.12} />
            <Card icon="📋" title="Carnet de santé numérique" desc="Vaccins, examens obligatoires, jalons développementaux HAS. OCR du carnet papier. Tout centralisé." delay={0.18} />
            <Card icon="🎒" title="PAI et lien crèche/école" desc="PAI structurés : allergènes, protocole, trousse d'urgence. L'indicateur signale les renouvellements." delay={0.24} />
            <Card icon="🎙️" title="Enregistrement consultation" desc="Enregistrez vos observations. L'IA structure. Vous validez. Le spécialiste reçoit sans courrier." delay={0.3} />
            <Card icon="✅" title="Complétude" desc="Vaccins à jour ? Bilan orthophonique fait ? IgE reçues ? Prochain contrôle courbe planifié ?" delay={0.36} />
            <Card icon="🧒" title="Milestones développementaux" desc="Jalons ESPGHAN par âge. Détection automatique des retards. Vous repérez tôt, vous orientez vite." delay={0.42} />
          </div>
        </div>
      </section>

      {/* CITATION */}
      <section style={{ background: C.bgAlt, padding: "24px 24px 28px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.2vw,1.25rem)", fontStyle: "italic", color: C.text, maxWidth: 560, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &quot;Le pédiatre est le premier à voir que quelque chose ne va pas. Mais une fois qu&apos;il a orienté, il perd le fil. Nami le garde.&quot;
          </p>
          <p style={{ fontSize: 13, color: C.textMut, marginTop: 12, fontFamily: fi }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      {/* PRICING */}
      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Badge>Tarifs</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Commencez gratuitement.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, alignItems: "stretch" }}>
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie parents & soignants", "Annuaire soignants pédiatriques", "Fiche patient basique"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="Orientation + suivi du parcours" features={["Tout Gratuit inclus", "Adressage pédiatrique", "App parents", "Carnet de santé numérique", "PAI structurés", "Facturation + visio"]} cta="Essayer" delay={0.06} />
            <Tier name="Intelligence" price="149€" sub="IA + courbes + milestones" highlighted features={["Tout Coordination", "Enregistrement + transcription IA", "Courbes OMS/Fenton intégrées", "Milestones ESPGHAN", "60 000+ sources", "Essai 14 jours gratuit"]} cta="Essai gratuit" delay={0.12} />
            <Tier name="Pilotage" price="299€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, compte de résultat", "Export comptable structuré"]} cta="Découvrir" delay={0.18} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "28px 24px 32px", background: C.bgAlt }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 800, color: C.text, marginBottom: 24, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="C'est adapté aux consultations classiques de pédiatrie de ville ?" a="Oui. Cassure de courbe, APLV, eczéma, retard de langage, otites, reflux, troubles du sommeil, vaccins en retard. Ce sont vos consultations quotidiennes. Nami structure l'orientation et le suivi quand vous devez impliquer un allergologue, un orthophoniste, un ORL ou un diététicien." />
          <FaqItem q="Les parents ont accès à quoi ?" a="Les parents voient le parcours de leur enfant dans l'app : l'équipe, les RDV, les documents partagés, la progression de la courbe. Ils ne voient pas les notes internes entre soignants. Ils sont informés et rassurés, sans appeler 4 cabinets." delay={0.05} />
          <FaqItem q="Et pour les pathologies plus lourdes (épilepsie, TSA) ?" a="Nami gère aussi les parcours complexes : coordination ville-hôpital avec le neuropédiatre, le neuropsychologue, l'ergothérapeute. Les mêmes outils, simplement un parcours plus long avec plus de soignants." delay={0.1} />
          <FaqItem q="Le carnet de santé numérique remplace le carnet papier ?" a="Non. Il le complète. Les examens obligatoires, vaccinations, jalons développementaux HAS sont structurés dans Nami. L'OCR du carnet papier permet d'importer les données existantes. Le carnet papier reste la référence officielle." delay={0.15} />
          <FaqItem q="Le PAI est-il gérable dans Nami ?" a="Oui. Allergènes, seuils, trousse d'urgence, conduite à tenir : structurés dans le dossier. L'indicateur de complétude signale quand le renouvellement approche. L'allergologue fournit les données, vous préparez le PAI." delay={0.2} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "32px 24px 40px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginBottom: 12, fontFamily: f }}>
            Vous repérez. Vous orientez.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gardez le fil.</span>
          </h2>
        </Fade>
        <Fade delay={0.1}>
          <button
            style={{ padding: "16px 36px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 6px 24px rgba(91,78,196,.25)", marginTop: 8, transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 32px rgba(91,78,196,.35)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(91,78,196,.25)"; }}
          >Commencer gratuitement</button>
        </Fade>
      </section>

    </div>
  );
}
