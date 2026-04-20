"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4",
  teal: "#2BA89C",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#1A1A2E",
  textSec: "#4A4A5A",
  textMut: "#8A8A96",
  border: "rgba(26,26,46,0.06)",
  grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};
const f = "'Plus Jakarta Sans',sans-serif";
const fi = "'Inter',sans-serif";

function useVis(t = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
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
  return [ref, vis];
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

function Tier({
  name, price, sub, features, highlighted = false, cta, delay = 0,
}: {
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
          }}>Le plus choisi</span>
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
        <div style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f, letterSpacing: "-.03em", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 14, color: C.textMut, marginTop: 8, fontFamily: fi, lineHeight: 1.4 }}>{label}</div>
      </div>
    </Fade>
  );
}

interface AdressageResult {
  name: string;
  spec: string;
  zone: string;
  dispo: string;
  match: string;
  vf: boolean;
}

interface AdressageStep {
  label: string;
  content?: string;
  type: string;
  results?: AdressageResult[];
}

function AdressageDemo() {
  const [step, setStep] = useState(0);
  const steps: AdressageStep[] = [
    { label: "Le patient", content: "Docteur, vous connaissez un bon endocrino ? Celui d'avant a 8 mois d'attente…", type: "patient" },
    { label: "Vous ouvrez Nami", content: "Recherche : endocrinologue · diabète type 2 · IdF sud · dispo < 6 semaines", type: "search" },
    { label: "Nami recommande", type: "results", results: [
      { name: "Dr. Durand", spec: "Endocrino, diabète & métabolisme", zone: "Massy (91)", dispo: "3 sem.", match: "97%", vf: true },
      { name: "Dr. Karim", spec: "Endocrino, obésité & NASH", zone: "Palaiseau (91)", dispo: "5 sem.", match: "84%", vf: true },
    ]},
    { label: "Vous adressez", content: "Envoyé au Dr. Durand avec contexte : HbA1c 8.1%, IMC 41, metformine. Le Dr. Durand reçoit le dossier.", type: "sent" },
  ];

  useEffect(() => {
    if (step < steps.length) {
      const d = step === 0 ? 600 : step === 2 ? 2200 : 1600;
      const t = setTimeout(() => setStep(s => s + 1), d);
      return () => clearTimeout(t);
    }
  }, [step, steps.length]);

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,26,46,.04)", maxWidth: 540, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: step > i ? C.teal : C.border, transition: "background .5s" }} />
        ))}
      </div>
      <div style={{ minHeight: 240, display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.slice(0, step).map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: s.type === "patient" ? C.primary : s.type === "results" ? C.teal : C.textMut, marginBottom: 6, fontFamily: fi }}>{s.label}</div>
            {s.content && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: s.type === "patient" ? `${C.primary}06` : s.type === "search" ? C.bgAlt : `${C.teal}06`, border: `1px solid ${s.type === "patient" ? `${C.primary}12` : C.border}`, fontSize: 14, color: C.text, lineHeight: 1.55, fontFamily: fi, fontStyle: s.type === "patient" ? "italic" : "normal" }}>{s.content}</div>
            )}
            {s.results && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.results.map((r, j) => (
                  <div key={j} style={{ padding: "12px 16px", borderRadius: 12, background: j === 0 ? `${C.teal}06` : "#fff", border: `1px solid ${j === 0 ? C.teal : C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: fi }}>{r.name}{r.vf && <span style={{ marginLeft: 6, fontSize: 11, color: C.teal }}>✓ vérifié</span>}</div>
                      <div style={{ fontSize: 12, color: C.textMut, fontFamily: fi }}>{r.spec} · {r.zone} · {r.dispo}</div>
                    </div>
                    <div style={{ padding: "4px 10px", borderRadius: 100, background: `${C.teal}15`, fontSize: 12, fontWeight: 700, color: C.teal, fontFamily: fi }}>{r.match}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {step >= steps.length && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button onClick={() => setStep(0)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fi }}>Revoir</button>
        </div>
      )}
    </div>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "msg", label: "Messagerie patients : relire le dossier, réfléchir, répondre", d: 60 },
    { id: "cr", label: "Comptes-rendus, courriers, lettres d'adressage", d: 45 },
    { id: "ordo", label: "Ordonnances, PAI, arrêts, certificats", d: 40 },
    { id: "res", label: "Chercher le bon spécialiste, appeler, vérifier dispos", d: 30 },
    { id: "proto", label: "Protocoles, éligibilité, parcours (ex: GLP-1 obésité)", d: 25 },
    { id: "annul", label: "Annulations, reports, no-shows", d: 20 },
    { id: "fact", label: "Facturation, impayés, préparation comptable", d: 30 },
    { id: "form", label: "Se former, lire les nouvelles recos", d: 20 },
    { id: "admin", label: "Résultats non arrivés, relances labo", d: 20 },
  ];
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    tasks.forEach(t => { v[t.id] = t.d; });
    return v;
  });
  const tot = Object.values(vals).reduce((a, b) => a + b, 0);
  const daily = Math.round(tot / 5);
  const weekH = (tot / 60).toFixed(1);
  const monthH = Math.round(tot / 60 * 4.3);
  const yearH = Math.round(tot / 60 * 52);
  const yearVal = Math.round(tot / 60 * 52 * 50);

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "32px 24px", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,26,46,.04)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, marginBottom: 24, fontFamily: fi }}>Estimez votre temps invisible par semaine</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {tasks.map(t => (
          <div key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: fi, lineHeight: 1.4, flex: 1, paddingRight: 12 }}>{t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: fi, minWidth: 45, textAlign: "right" }}>{vals[t.id]} min</span>
            </div>
            <input
              type="range" min={0} max={120} step={5} value={vals[t.id]}
              onChange={e => setVals(v => ({ ...v, [t.id]: parseInt(e.target.value) }))}
              style={{ width: "100%", height: 4, borderRadius: 2, outline: "none", cursor: "pointer", accentColor: C.primary }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: "20px", borderRadius: 16, background: C.dark, color: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {([[`${daily}min`, "par jour"], [`${weekH}h`, "par sem."], [`${monthH}h`, "par mois"], [`${yearH}h`, "par an"]] as [string, string][]).map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f }}>{v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: fi }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", margin: 0, fontFamily: fi, lineHeight: 1.7 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> non compris dans le prix de la consultation.
            {" "}À 50€/h = <span style={{ color: C.teal, fontWeight: 700 }}>{yearVal.toLocaleString("fr-FR")}€/an</span> non rémunéré.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>79€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MGPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
        ::selection{background:${C.primary}22;color:${C.primary}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: `${C.bg}e8`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: f }}>N</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: f }}>Nami</span>
          </a>
          <a href="/signup" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: C.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: f, textDecoration: "none", display: "inline-block" }}>Créer mon espace gratuit</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: "clamp(120px,18vh,180px)", paddingBottom: "clamp(60px,8vh,100px)", paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <Fade><Badge>Pour les médecins généralistes</Badge></Fade>
        <Fade delay={0.1}>
          <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginTop: 24, marginBottom: 20, fontFamily: f }}>
            Le bon spécialiste,<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>pour le bon patient,<br />sans 6 mois d&apos;attente.</span>
          </h1>
        </Fade>
        <Fade delay={0.2}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 1.7, color: C.textSec, maxWidth: 600, margin: "0 auto 36px", fontFamily: fi }}>
            Votre patient a besoin d&apos;un endocrinologue, d&apos;un gastro, d&apos;un psychologue. Vous avez 3 noms, tous avec des mois d&apos;attente. Nami vous montre les soignants disponibles, vérifiés, proches de votre patient.
          </p>
        </Fade>
        <Fade delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/signup" style={{ padding: "16px 32px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: f, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</a>
            <a href="/demo" style={{ padding: "16px 32px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: f, textDecoration: "none", display: "inline-block" }}>Voir la démo</a>
          </div>
        </Fade>
      </section>

      {/* STATS */}
      <section style={{ background: "#fff", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
          <StatBlock value="0€" label="Agenda + messagerie + annuaire" />
          <StatBlock value="131" label="parcours structurés par pathologie" delay={0.1} />
          <StatBlock value="< 1%" label="du CA mensuel pour la coordination" delay={0.2} />
        </div>
      </section>

      {/* ADRESSAGE */}
      <section style={{ background: C.dark, padding: "clamp(64px,10vh,100px) 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-.03em", fontFamily: f }}>
                L&apos;adressage intelligent.<br /><span style={{ color: C.teal }}>En 30 secondes.</span>
              </h2>
            </div>
          </Fade>
          <Fade delay={0.2}><AdressageDemo /></Fade>
        </div>
      </section>

      {/* PROTOCOLS */}
      <section style={{ padding: "clamp(64px,10vh,120px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Badge>Protocoles</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Vous suspectez une pathologie.<br />Nami montre le parcours.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {[
              { p: "Diabète type 2", s: ["Glycémie + HbA1c", "Bilan lipidique + rénal", "Fond d'œil", "Diététicien", "Endocrino si HbA1c > 8%"], src: "HAS 2024" },
              { p: "Obésité IMC > 35", s: ["Bilan métabolique", "Évaluation psy", "Diététicien", "APA", "Endocrino", "Chirurgie si IMC > 40"], src: "HAS 2023" },
              { p: "NASH / Stéatose", s: ["Bilan hépatique", "FIB-4 + Fibroscan", "Gastro si FIB-4 > 1.3", "Prise en charge nutrition", "Suivi 3 mois"], src: "EASL 2024" },
              { p: "Suspicion TCA", s: ["IMC + courbe poids", "K+, albumine, NFS, TSH", "Psychiatre", "Diét spécialisé TCA", "Psychothérapie"], src: "HAS 2019" },
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.1}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", border: `1px solid ${C.border}`, height: "100%" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 14, fontFamily: f }}>{item.p}</h4>
                  {item.s.map((step, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: `${C.teal}12`, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, fontFamily: fi }}>{j + 1}</span>
                      <span style={{ fontSize: 13, color: C.textSec, fontFamily: fi }}>{step}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textMut, fontFamily: fi }}>{item.src}</div>
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
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Tout ce que vous faites<br />et que personne ne paie.
              </h2>
              <p style={{ fontSize: 15, color: C.textSec, maxWidth: 600, margin: "16px auto 0", fontFamily: fi, lineHeight: 1.7 }}>
                Messages patients, comptes-rendus, chercher un spécialiste, protocoles, PAI, facturation, compta, tout ça mis bout à bout, et ce n&apos;est pas dans le prix de la consultation.
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
              <Badge>Conçu pour 25 patients/jour (ou plus !)</Badge>
              <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.12, letterSpacing: "-.03em", marginTop: 16, fontFamily: f }}>
                Zéro travail supplémentaire.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            <Card icon="🔍" title="Adressage intelligent" desc="Par pathologie, zone, disponibilité. Soignants vérifiés. Contexte clinique inclus." delay={0} />
            <Card icon="📖" title="131 protocoles HAS" desc="Le protocole est là, examens, ordre, orientation. Plus besoin de chercher." delay={0.1} />
            <Card icon="👁️" title="Vue d'ensemble 30s" desc="Actions de chaque soignant, résultats bio, prochaines étapes. Pas de courrier." delay={0.2} />
            <Card icon="🎙️" title="Enregistrement IA" desc="Enregistrez. L'IA structure. Vous validez. L'équipe reçoit vos conclusions." delay={0.3} />
            <Card icon="✅" title="Complétude parcours" desc="Bilan fait ? Psy actif ? APA suivie ? D'un coup d'œil." delay={0.4} />
            <Card icon="💼" title="Cockpit financier" desc="CA, charges, déclarations, bilan, tout préparé. Vous êtes médecin, pas comptable." delay={0.5} />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "clamp(64px,10vh,120px) 24px", background: C.bgAlt }}>
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
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie", "Annuaire soignants", "Aperçu équipe patient"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="Adressage + protocoles" features={["Tout Gratuit inclus", "Adressage intelligent", "131 protocoles HAS", "Vue équipe complète", "Téléexpertise", "Facturation + visio"]} cta="Essayer" delay={0.1} />
            <Tier name="Intelligence" price="149€" sub="L'IA clinique" highlighted features={["Tout Coordination", "Enregistrement + IA", "60 000+ sources", "Extraction bio auto", "Essai 14j gratuit"]} cta="Essai gratuit" delay={0.2} />
            <Tier name="Pilotage" price="499€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, CR, trésorerie", "Export comptable"]} cta="Découvrir" delay={0.3} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: C.text, marginBottom: 40, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="Comment Nami vérifie les soignants ?" a="Questionnaire structuré à l'inscription. Les profils « vérifiés » sont complets. Vous pouvez noter après un adressage." />
          <FaqItem q="Doctolib + Nami ?" a="Nami ne remplace pas Doctolib pour la prise de RDV. Nami fait ce que Doctolib ne fait pas : trouver le bon spécialiste, les protocoles HAS, la vue d'ensemble du parcours." delay={0.06} />
          <FaqItem q="Le Pilotage remplace mon comptable ?" a="Il prépare tout : bilan, CR, flux, pré-déclarations. Votre comptable reçoit un dossier structuré. À 300€/mois de comptable, 299€ avec tout prémâché change l'équation." delay={0.12} />
          <FaqItem q="Confidentialité des notes psy ?" a="Seul le statut est visible. Le contenu reste confidentiel. Le psy choisit ce qu'il partage." delay={0.18} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(64px,10vh,100px) 24px", textAlign: "center", background: C.bgAlt }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.6rem,4.5vw,2.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.035em", marginBottom: 16, fontFamily: f }}>
            Arrêtez de chercher.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Commencez à orienter.</span>
          </h2>
        </Fade>
        <Fade delay={0.15}>
          <a href="/signup" style={{ display: "inline-block", padding: "18px 40px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: f, textDecoration: "none", boxShadow: "0 4px 24px rgba(91,78,196,.25)", marginTop: 16 }}>Commencer gratuitement</a>
        </Fade>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.textMut, fontFamily: fi, lineHeight: 1.6 }}>Outil de coordination · Non dispositif médical · Conforme RGPD · © 2026 Nami</p>
      </footer>
    </div>
  );
}
