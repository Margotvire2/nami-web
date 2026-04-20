"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#111118", text: "#1A1A2E", textSec: "#4A4A5A", textMut: "#8A8A96",
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
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
      transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}s, transform .6s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, letterSpacing: ".03em", background: `${C.primary}12`, color: C.primary, fontFamily: fi }}>
      {children}
    </span>
  );
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
        {highlighted && (
          <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", background: `${C.teal}20`, color: C.teal, marginBottom: 14, alignSelf: "flex-start", fontFamily: fi }}>
            Recommandé
          </span>
        )}
        <h4 style={{ fontSize: 15, fontWeight: 700, color: highlighted ? "#fff" : C.text, marginBottom: 6, fontFamily: f }}>{name}</h4>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: highlighted ? "#fff" : C.text, fontFamily: f, letterSpacing: "-.03em" }}>{price}</span>
          {price !== "0€" && <span style={{ fontSize: 14, color: highlighted ? "rgba(255,255,255,.5)" : C.textMut, marginLeft: 4, fontFamily: fi }}>/mois</span>}
        </div>
        <p style={{ fontSize: 12, color: highlighted ? "rgba(255,255,255,.55)" : C.textMut, marginBottom: 20, lineHeight: 1.4, fontFamily: fi }}>{sub}</p>
        <div style={{ flex: 1 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 13, color: highlighted ? "rgba(255,255,255,.8)" : C.textSec, lineHeight: 1.45, fontFamily: fi }}>
              <span style={{ color: C.teal, flexShrink: 0, marginTop: 2, fontSize: 12 }}>✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: 12, borderRadius: 10, border: highlighted ? "none" : `1.5px solid ${C.primary}`, background: highlighted ? C.grad : "transparent", color: highlighted ? "#fff" : C.primary, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 20, fontFamily: f }}>
          {cta}
        </button>
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

function BetweenVisitsDemo() {
  const entries = [
    { who: "Mme Leroy · Orthophoniste", date: "5 avr.", what: "Rééducation aphasie : 3 séances/sem. Récupération fluence verbale en progression. Compréhension orale améliorée.", color: C.teal, icon: "🗣️" },
    { who: "M. Dupont · Kinésithérapeute", date: "8 avr.", what: "Rééducation motrice post-AVC : équilibre debout acquis. Marche avec aide technique. Objectif : autonomie à domicile.", color: "#E67E22", icon: "🦿" },
    { who: "Dr. Martin · MG", date: "10 avr.", what: "Renouvellement traitement antihypertenseur. PA 128/78. Bilan lipidique prescrit.", color: "#3498db", icon: "🩺" },
    { who: "Mme Renard · Neuropsychologue", date: "12 avr.", what: "Bilan en cours : fonctions exécutives, mémoire de travail, attention. Résultats préliminaires : déficit attentionnel modéré.", color: "#8E44AD", icon: "🧠" },
    { who: "Extraction bio auto", date: "15 avr.", what: "Dosage valproate : 72 µg/mL (cible 50-100) · NFS normale · Bilan hépatique normal", color: C.primary, icon: "🔬" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: `1px solid ${C.border}`, boxShadow: "0 6px 24px rgba(26,26,46,.04)", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.primary, marginBottom: 6, fontFamily: fi }}>
        Patient AVC, Prochain RDV avec vous : 28 avril
      </div>
      <p style={{ fontSize: 12, color: C.textMut, marginBottom: 16, fontFamily: fi }}>
        Depuis votre dernière consultation (15 janvier) :
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 10, borderLeft: `3px solid ${e.color}`, background: C.bgAlt }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: e.color, fontFamily: fi }}>{e.icon} {e.who}</span>
              <span style={{ fontSize: 11, color: C.textMut, fontFamily: fi }}>{e.date}</span>
            </div>
            <p style={{ fontSize: 13, margin: 0, fontFamily: fi, lineHeight: 1.5, color: C.text }}>{e.what}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: `${C.teal}08`, border: `1px solid ${C.teal}15` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 3, fontFamily: fi }}>COMPLÉTUDE</div>
        <p style={{ fontSize: 12, color: C.textSec, margin: 0, fontFamily: fi, lineHeight: 1.45 }}>
          Parcours post-AVC, 68%. Manquant : bilan neuropsychologique complet (en cours), visite ergothérapeute (non planifiée).
        </p>
      </div>
    </div>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "resultats", label: "Récupérer IRM, EEG, dosages médicamenteux dispersés", d: 40 },
    { id: "cr", label: "Comptes-rendus, courriers au MG, aux rééducateurs", d: 45 },
    { id: "coord", label: "Appeler kiné, orthophoniste, neuropsychologue, coordination téléphonique", d: 35 },
    { id: "proto", label: "Protocoles antiépileptiques, immunomodulateurs, switch, titration", d: 30 },
    { id: "msg", label: "Messages patients (crises, effets secondaires, inquiétudes)", d: 25 },
    { id: "adressage", label: "Trouver le bon rééducateur, centre de réhab, neuropsychologue", d: 20 },
    { id: "fact", label: "Facturation, préparation comptable", d: 25 },
    { id: "form", label: "Se former, congrès, nouvelles molécules", d: 20 },
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
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> non rémunéré.
            {" "}À 50€/h = <span style={{ color: C.teal, fontWeight: 700 }}>{yearVal.toLocaleString("fr-FR")}€/an</span>.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>149€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NeurologuePage() {
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
        <Fade><Badge>Pour les neurologues</Badge></Fade>
        <Fade delay={0.08}>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: "-.035em", marginTop: 20, marginBottom: 16, fontFamily: f }}>
            Entre deux consultations,<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              le parcours ne s&apos;arrête pas.
            </span>
          </h1>
        </Fade>
        <Fade delay={0.14}>
          <p style={{ fontSize: "clamp(.95rem,2vw,1.1rem)", lineHeight: 1.65, color: C.textSec, maxWidth: 580, margin: "0 auto 20px", fontFamily: fi }}>
            Épilepsie, SEP, Parkinson, AVC, migraines chroniques, vos patients sont suivis entre vos RDV par un kiné, un orthophoniste, un neuropsychologue, un MG. Vous les revoyez tous les 3 à 6 mois. Aujourd&apos;hui, à l&apos;aveugle. Avec Nami, avec le contexte.
          </p>
        </Fade>
        <Fade delay={0.18}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {["Épilepsie", "SEP", "Parkinson", "AVC / Rééducation", "Migraines chroniques", "Neuropathies"].map(p => (
              <span key={p} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: "#fff", border: `1px solid ${C.border}`, color: C.textSec, fontFamily: fi }}>{p}</span>
            ))}
          </div>
        </Fade>
        <Fade delay={0.22}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</button>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: `1.5px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: f }}>Voir le cas AVC</button>
          </div>
        </Fade>
      </section>

      {/* CASE STUDY */}
      <section style={{ background: C.dark, padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-.03em", fontFamily: f }}>
                3 mois de rééducation.<br /><span style={{ color: C.teal }}>Tout visible en 30 secondes.</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)", maxWidth: 480, margin: "12px auto 0", fontFamily: fi, lineHeight: 1.55 }}>
                Votre patient post-AVC revient. L&apos;orthophoniste, le kiné, le neuropsychologue et le MG l&apos;ont suivi pendant 3 mois. Voici ce que vous voyez en ouvrant Nami.
              </p>
            </div>
          </Fade>
          <Fade delay={0.15}><BetweenVisitsDemo /></Fade>
        </div>
      </section>

      {/* AVANT/APRÈS */}
      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Badge>Ce qui change</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Vos consultations ne sont plus des reconstitutions.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { b: "Votre patient épileptique revient après 4 mois. Nombre de crises ? Dosage antiépileptique ? Bilan hépatique ? Vous reconstituez.", a: "Fréquence des crises trackée, dosage valproate à 72 µg/mL, bilan hépatique normal. Tout dans Nami, extrait automatiquement." },
              { b: "Le kiné fait de la rééducation post-AVC depuis 3 mois. Vous ne savez pas où en est la motricité.", a: "Le kiné documente : équilibre debout acquis, marche avec aide technique, objectif autonomie. Vous lisez en 30 secondes." },
              { b: "Vous changez un antiépileptique. Le MG ne le sait pas. La pharmacie non plus.", a: "Vous mettez à jour dans Nami. Le MG voit le changement. L'indicateur signale les interactions potentielles." },
              { b: "L'IRM de contrôle a été faite il y a 2 mois. Où est le compte-rendu ? Vous cherchez dans vos courriers.", a: "Les résultats d'imagerie sont dans le dossier Nami. Le radiologue les a partagés, le MG les a vus aussi." },
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
                IRM à retrouver, dosages à vérifier, rééducateurs à appeler,
              </h2>
              <p style={{ fontSize: 14, color: C.textSec, marginTop: 6, fontFamily: fi }}>ce n&apos;est pas compris dans le prix de la consultation.</p>
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
              <Badge>Conçu pour les parcours longs (ou plus !)</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Le parcours vit entre vos consultations. Nami aussi.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <Card icon="🧠" title="Vue inter-consultations" desc="Ce que le kiné, l'orthophoniste, le neuropsychologue et le MG ont fait depuis 3 mois, en un écran. Plus de consultation à l'aveugle." delay={0} />
            <Card icon="🔬" title="Extraction bio automatique" desc="Dosages antiépileptiques, NFS, bilan hépatique, thyroïde, extraits depuis le PDF de biologie et structurés dans le dossier." delay={0.06} />
            <Card icon="💊" title="Protocoles médicamenteux" desc="Anti-épileptiques, immunomodulateurs SEP, dopaminergiques Parkinson. Titration, switch, surveillance, interactions. Sourcés HAS." delay={0.12} />
            <Card icon="🏥" title="Coordination ville-hôpital" desc="Le neuroradiologue hospitalier, le MPR, l'équipe de réhab, leurs mises à jour dans le dossier. Le pont entre l'hôpital et la ville." delay={0.18} />
            <Card icon="🔍" title="Adressage rééducation" desc="Trouvez le bon kiné spécialisé neuro, le bon orthophoniste, le bon neuropsychologue, par spécialité, zone, disponibilité." delay={0.24} />
            <Card icon="🎙️" title="Enregistrement consultation" desc="Enregistrez vos observations. L'IA structure. Vous validez. Le MG et les rééducateurs reçoivent vos conclusions." delay={0.3} />
            <Card icon="✅" title="Indicateur de complétude" desc="IRM de contrôle faite ? Bilan neuropsychologique terminé ? Ergothérapeute vu ? Le parcours ne se perd plus." delay={0.36} />
            <Card icon="📊" title="Trajectoires de suivi" desc="Fréquence des crises, scores EDSS (SEP), scores moteurs, trajectoires visualisées sur la durée. Détection de déviation automatique." delay={0.42} />
          </div>
        </div>
      </section>

      {/* CITATION */}
      <section style={{ background: C.bgAlt, padding: "24px 24px 28px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.2vw,1.3rem)", fontStyle: "italic", color: C.text, maxWidth: 580, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &quot;Le neurologue voit son patient tous les 3 mois. Entre les deux, 4 soignants travaillent. Sans Nami, il ne sait rien de ce qu&apos;ils ont fait.&quot;
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
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Commencez gratuitement.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, alignItems: "stretch" }}>
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie patients & soignants", "Annuaire soignants", "Fiche patient basique"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="Vue inter-consultations + adressage" features={["Tout Gratuit inclus", "Vue équipe entre vos RDV", "Adressage rééducation", "Téléexpertise tracée", "App patient", "Facturation + visio"]} cta="Essayer" delay={0.06} />
            <Tier name="Intelligence" price="149€" sub="Bio auto + IA + protocoles" highlighted features={["Tout Coordination", "Extraction bio automatique", "Enregistrement + transcription IA", "Protocoles antiépileptiques, SEP, Parkinson", "Trajectoires de suivi", "Essai 14 jours gratuit"]} cta="Essai gratuit" delay={0.12} />
            <Tier name="Pilotage" price="299€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, CR, trésorerie", "Export comptable"]} cta="Découvrir" delay={0.18} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "28px 24px 32px", background: C.bgAlt }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 800, color: C.text, marginBottom: 24, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="Comment le kiné et l'orthophoniste partagent dans Nami ?" a="Chaque rééducateur s'inscrit sur Nami et fait partie de l'équipe du patient. Quand il documente une séance (progression motrice, récupération langagière), vous le voyez dans le dossier avant votre prochain RDV. Plus besoin de les appeler." />
          <FaqItem q="Les résultats d'imagerie (IRM, EEG) sont-ils gérés ?" a="Les résultats sont partagés dans le dossier par le radiologue ou importés par le patient. L'extraction automatique structure les valeurs biologiques (dosages, NFS). Les comptes-rendus d'IRM et d'EEG sont accessibles par toute l'équipe." delay={0.05} />
          <FaqItem q="Quels protocoles sont disponibles en neurologie ?" a="Anti-épileptiques (valproate, lévétiracétam, lamotrigine, titration, switch, surveillance hépatique), immunomodulateurs SEP (interférons, tériflunomide, ocrelizumab), dopaminergiques Parkinson. Sourcés HAS et sociétés savantes. Base de 60 000+ sources." delay={0.1} />
          <FaqItem q="Intelligence (149€) est recommandé, pourquoi ?" a="Parce que l'extraction bio automatique (dosages antiépileptiques, bilans) et les protocoles médicamenteux sont vos outils quotidiens. La Coordination donne la vue d'ensemble. L'Intelligence ajoute l'automatisation des données et les trajectoires de suivi." delay={0.15} />
          <FaqItem q="Et la coordination avec l'hôpital ?" a="Les spécialistes hospitaliers (neuroradiologues, MPR, équipes de réhab) peuvent rejoindre l'équipe dans Nami. Leurs mises à jour arrivent dans le dossier. C'est le pont ville-hôpital." delay={0.2} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "32px 24px 40px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginBottom: 12, fontFamily: f }}>
            Vos patients vivent entre vos RDV.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Leur rééducation aussi.</span>
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
