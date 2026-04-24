"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#111118", text: "#1A1A2E", textSec: "#374151", textMut: "#6B7280",
  border: "rgba(26,26,46,0.06)", grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};
const f = "'Plus Jakarta Sans',sans-serif";
const fi = "'Inter',sans-serif";

function useVis(t?: number): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: t ?? 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [t]);
  return [ref, vis];
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

function Tier({ name, price, sub, features, highlighted = false, cta, delay = 0 }: {
  name: string; price: string; sub: string; features: string[]; highlighted?: boolean; cta: string; delay?: number;
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

function CaseDemo() {
  const team = [
    { role: "Vous · Allergologue", color: C.primary, note: "ITA lait en cours, palier 3/7 atteint. Tolérance 20 mL. Prick-tests arachide : 8mm (stable). Prochaine épreuve de provocation : juin." },
    { role: "Dr. Petit · Pédiatre / MG", color: "#3498db", note: "Croissance normale. Dernier épisode asthmatique il y a 6 semaines. Ventoline diminuée." },
    { role: "Mme Vire · Diététicienne", color: C.teal, note: "Régime d'éviction adapté : APLV + arachide. Apports calciques compensés. Diversification en cours selon vos paliers." },
    { role: "Dr. Laurent · Pneumopédiatre", color: "#8E44AD", note: "Asthme allergique stable sous Flixotide 50. EFR prévue en mai. Pas de modification de traitement." },
    { role: "Dr. Simon · Dermatologue", color: "#E67E22", note: "Eczéma en rémission sous émollient seul. Pas de poussée depuis 2 mois." },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: `1px solid ${C.border}`, boxShadow: "0 6px 24px rgba(26,26,46,.04)", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.primary, marginBottom: 6, fontFamily: fi }}>
        Hugo, 6 ans, APLV + arachide + asthme + eczéma
      </div>
      <p style={{ fontSize: 12, color: C.textMut, marginBottom: 16, fontFamily: fi }}>
        Ce que vous voyez en ouvrant son dossier avant la consultation :
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
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 3, fontFamily: fi }}>COMPLÉTUDE PARCOURS ALLERGIQUE</div>
        <p style={{ fontSize: 12, color: C.textSec, margin: 0, fontFamily: fi, lineHeight: 1.45 }}>
          74% complet. Manquant : EFR pneumo (prévue mai), renouvellement PAI scolaire (échéance septembre), épreuve de provocation arachide (planifiée juin).
        </p>
      </div>
      <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, background: `${C.primary}06`, border: `1px solid ${C.primary}12` }}>
        <p style={{ fontSize: 12, color: C.primary, margin: 0, fontFamily: fi, fontWeight: 600 }}>
          Les parents d&apos;Hugo voient le parcours dans l&apos;app : prochains RDV, paliers d&apos;ITA, équipe. Ils sont informés, pas perdus.
        </p>
      </div>
    </div>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "resultats", label: "Récupérer prick-tests, IgE spécifiques, EFR, bilans dispersés", d: 35 },
    { id: "cr", label: "Comptes-rendus, courriers au pédiatre, au pneumologue, à la diét", d: 40 },
    { id: "pai", label: "PAI scolaires, protocoles d'urgence, trousses d'urgence, certificats", d: 35 },
    { id: "coord", label: "Appeler la diét pour les paliers, le pneumo pour l'asthme, l'école", d: 25 },
    { id: "proto", label: "Protocoles ITA, paliers de désensibilisation, seuils de réactivité", d: 25 },
    { id: "msg", label: "Messages parents (réactions, inquiétudes, questions alimentation)", d: 30 },
    { id: "fact", label: "Facturation, préparation comptable", d: 20 },
    { id: "form", label: "Se former, nouvelles molécules, congrès", d: 15 },
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
          {([[`${daily}min`, "par jour"], [`${weekH}h`, "par semaine"], [`${yearH}h`, "par an"]] as [string, string][]).map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontFamily: fi }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,.06)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", margin: 0, fontFamily: fi, lineHeight: 1.6 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> non rémunéré.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>79€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AllergologuePage() {
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
        <Fade><Badge>Pour les allergologues</Badge></Fade>
        <Fade delay={0.08}>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: "-.035em", marginTop: 20, marginBottom: 16, fontFamily: f }}>
            Allergies multiples, asthme, eczéma,<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              5 soignants autour d&apos;un seul patient.
            </span>
          </h1>
        </Fade>
        <Fade delay={0.14}>
          <p style={{ fontSize: "clamp(.95rem,2vw,1.1rem)", lineHeight: 1.65, color: C.textSec, maxWidth: 580, margin: "0 auto 20px", fontFamily: fi }}>
            Le pédiatre, le pneumologue, le dermatologue, la diététicienne, l&apos;école, quand un patient cumule APLV, arachide, asthme et eczéma, vous êtes le chef d&apos;orchestre. Nami vous donne la partition complète.
          </p>
        </Fade>
        <Fade delay={0.18}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {["Allergies alimentaires", "Triade atopique", "ITA / Désensibilisation", "Asthme allergique", "Rhinite", "Allergies médicamenteuses"].map(p => (
              <span key={p} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: "#fff", border: `1px solid ${C.border}`, color: C.textSec, fontFamily: fi }}>{p}</span>
            ))}
          </div>
        </Fade>
        <Fade delay={0.22}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</button>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: `1.5px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: f }}>Voir le cas Hugo</button>
          </div>
        </Fade>
      </section>

      {/* CASE STUDY */}
      <section style={{ background: C.dark, padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-.03em", fontFamily: f }}>
                Hugo, 6 ans. APLV, arachide, asthme, eczéma.<br />
                <span style={{ color: C.teal }}>Toute l&apos;équipe sur un seul écran.</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)", maxWidth: 480, margin: "12px auto 0", fontFamily: fi, lineHeight: 1.55 }}>
                Vous faites son ITA lait. Le pédiatre gère au quotidien. La diététicienne adapte le régime d&apos;éviction à vos paliers. Le pneumopédiatre suit l&apos;asthme. Le dermato suit l&apos;eczéma. Avant Nami, chacun travaillait dans son coin.
              </p>
            </div>
          </Fade>
          <Fade delay={0.15}><CaseDemo /></Fade>
        </div>
      </section>

      {/* AVANT/APRÈS */}
      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Badge>Ce qui change</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Le régime suit les paliers. L&apos;asthme suit l&apos;allergie. Et tout le monde le sait.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { b: "Vous montez un palier d'ITA lait. La diététicienne ne le sait pas. Elle maintient l'éviction totale pendant 3 semaines de trop.", a: "La diét voit le palier dans Nami. Elle adapte le régime en conséquence : introduction progressive de 20 mL, apports calciques maintenus." },
              { b: "L'asthme se déstabilise. Le pneumopédiatre augmente le Flixotide. Vous ne le savez pas avant la prochaine consultation.", a: "La modification du traitement apparaît dans le dossier. Vous évaluez si la déstabilisation est liée à une réactivité allergique." },
              { b: "Le PAI doit être renouvelé en septembre. Personne ne s'en souvient. L'école appelle la veille de la rentrée.", a: "L'indicateur de complétude signale l'échéance. Vous préparez le PAI avec les données à jour, paliers, trousse d'urgence, protocole." },
              { b: "Les parents appellent : Hugo a eu une réaction au goûter. Quel allergène ? Quel palier ? Vous cherchez dans vos dossiers.", a: "Les parents signalent dans l'app. Vous voyez les paliers en cours, les allergènes actifs, et l'historique des réactions." },
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
                PAI, courriers, paliers à communiquer, résultats éparpillés,
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
              <Badge>Vos outils</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Orchestrez le parcours allergique<br />sans un coup de fil de plus.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <Card icon="📊" title="Suivi allergènes sur la durée" desc="Prick-tests, IgE spécifiques, paliers d'ITA, tracés dans le temps. Visualisez l'évolution de la tolérance et la réactivité par allergène." delay={0} />
            <Card icon="🥛" title="Coordination diét temps réel" desc="La diététicienne voit vos paliers d'ITA et adapte le régime d'éviction en conséquence. Plus de décalage entre la désensibilisation et l'alimentation." delay={0.06} />
            <Card icon="🫁" title="Lien pneumo & dermato" desc="Le pneumologue voit si l'asthme se déstabilise pendant un palier. Le dermatologue voit si l'eczéma flambe. L'information circule." delay={0.12} />
            <Card icon="🎒" title="PAI & protocoles d'urgence" desc="PAI structurés dans le dossier : allergènes, seuils, trousse d'urgence, conduite à tenir. L'indicateur signale les renouvellements." delay={0.18} />
            <Card icon="👨‍👩‍👧" title="App famille" desc="Les parents voient le parcours, les paliers en cours, les RDV. Ils signalent les réactions. Informés, pas perdus." delay={0.24} />
            <Card icon="🎙️" title="Enregistrement consultation" desc="Enregistrez vos observations. L'IA structure. Vous validez. Le pédiatre reçoit vos conclusions sans courrier." delay={0.3} />
            <Card icon="🔍" title="Adressage spécialisé" desc="Trouvez le bon pneumologue, dermatologue, diététicien spécialisé allergies, par spécialité, zone, disponibilité." delay={0.36} />
            <Card icon="✅" title="Complétude parcours" desc="ITA en cours ? EFR faite ? PAI à jour ? Épreuve de provocation planifiée ? Tout est visible, rien ne se perd." delay={0.42} />
          </div>
        </div>
      </section>

      {/* CITATION */}
      <section style={{ background: C.bgAlt, padding: "24px 24px 28px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.2vw,1.25rem)", fontStyle: "italic", color: C.text, maxWidth: 560, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &ldquo;Quand un patient a 4 allergènes, un asthme et un eczéma, 5 soignants doivent avancer ensemble. Le PAI, les paliers, le régime, tout est lié. Nami rend ces liens visibles.&rdquo;
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
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie parents & soignants", "Annuaire soignants", "Fiche patient basique"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="L'équipe autour du patient allergique" features={["Tout Gratuit inclus", "Vue équipe complète", "Coordination diét en temps réel", "PAI structurés + rappels", "App famille", "Facturation + visio"]} cta="Essayer" delay={0.06} />
            <Tier name="Intelligence" price="149€" sub="IA + suivi allergènes + protocoles" highlighted features={["Tout Coordination", "Enregistrement + transcription IA", "Suivi allergènes sur la durée", "Protocoles ITA sourcés", "Essai 14 jours gratuit"]} cta="Essai gratuit" delay={0.12} />
            <Tier name="Pilotage" price="299€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, CR, trésorerie", "Export comptable"]} cta="Découvrir" delay={0.18} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "28px 24px 32px", background: C.bgAlt }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 800, color: C.text, marginBottom: 24, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="Comment la diététicienne voit mes paliers d'ITA ?" a="Quand vous mettez à jour le palier dans le dossier (ex: palier 3/7, 20 mL lait toléré), la diététicienne le voit immédiatement. Elle adapte le régime d'éviction en conséquence. Plus de décalage entre votre protocole de désensibilisation et l'alimentation du patient." />
          <FaqItem q="Le PAI est-il gérable dans Nami ?" a="Oui. Allergènes, seuils de réactivité, trousse d'urgence, conduite à tenir, contacts, structurés dans le dossier. L'enseignant référent peut être dans l'équipe. L'indicateur de complétude signale quand le renouvellement approche." delay={0.05} />
          <FaqItem q="Les parents ont-ils accès aux données ?" a="Les parents voient le parcours dans l'app : équipe, RDV, paliers en cours, documents. Ils peuvent signaler une réaction. Ils ne voient pas les notes internes entre soignants." delay={0.1} />
          <FaqItem q="Comment fonctionne le suivi multi-allergènes ?" a="Chaque allergène est tracé séparément : prick-tests, IgE spécifiques, paliers d'ITA, réactions. Vous visualisez l'évolution de la tolérance dans le temps, allergène par allergène. L'indicateur signale quand une épreuve de provocation est due." delay={0.15} />
          <FaqItem q="Et pour les patients adultes ?" a="Nami fonctionne pour tous les âges. Les mêmes fonctionnalités s'appliquent aux adultes : rhinite allergique, allergies médicamenteuses, désensibilisation aux venins. L'app patient remplace l'app famille." delay={0.2} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "32px 24px 40px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginBottom: 12, fontFamily: f }}>
            4 allergènes. 5 soignants.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Un seul parcours.</span>
          </h2>
        </Fade>
        <Fade delay={0.1}>
          <button style={{ padding: "16px 36px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 6px 24px rgba(91,78,196,.25)", marginTop: 8 }}>
            Commencer gratuitement
          </button>
        </Fade>
      </section>

    </div>
  );
}
