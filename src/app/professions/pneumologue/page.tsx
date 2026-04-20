"use client";
import React, { useRef, useState, useEffect } from "react";

function useVis(t = 0.08): [React.RefObject<HTMLDivElement | null>, boolean] {
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
  return [ref, vis];
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, vis] = useVis();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(18px)", transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease` }}>
      {children}
    </div>
  );
}

const NAV_LINKS = [["Cas clinique", "#cas"], ["Avant/Après", "#avant-apres"], ["Fonctionnalités", "#fonctionnalites"], ["Tarifs", "#tarifs"], ["FAQ", "#faq"]];

const TASKS = [
  { id: "efo", label: "Compte-rendu EFR / spirométrie", d: 18 },
  { id: "cr", label: "Compte-rendu de consultation", d: 18 },
  { id: "proto", label: "Protocoles biothérapies asthme (dupilumab)", d: 14 },
  { id: "coord", label: "Coordination MG + kiné respi + allergologue", d: 15 },
  { id: "bio", label: "Suivi bilans (EOS, IgE, gaz du sang)", d: 12 },
  { id: "msg", label: "Messages patients (exacerbations)", d: 10 },
  { id: "fact", label: "Facturation CCAM", d: 8 },
  { id: "form", label: "Dossier administratif", d: 5 },
];

const FEATURES = [
  { icon: "🫁", title: "EFR intégrées", desc: "Importez les résultats spirométriques (VEMS, CVF, DEP). Graphiques d'évolution sous traitement avec valeurs théoriques." },
  { icon: "💊", title: "Biothérapies asthme sévère", desc: "Dupilumab, mépolizumab, benralizumab — protocoles intégrés avec bilans éosinophiles requis et calendrier d'injections." },
  { icon: "🤝", title: "Coordination pluridisciplinaire", desc: "Kiné respiratoire, allergologue, MG — tous dans le même dossier. Exacerbations documentées entre les consultations." },
  { icon: "📊", title: "Scores de contrôle", desc: "ACT, ACQ, mMRC intégrés. Saisissez en consultation, visualisez la tendance sur 12 mois sous traitement." },
  { icon: "🎙️", title: "Dictée CR EFR", desc: "Dictez votre interprétation des EFR. L'IA structure avec VEMS/CVF, profil obstructif/restrictif et plan thérapeutique." },
  { icon: "📋", title: "Suivi exacerbations", desc: "Le patient documente ses exacerbations via l'app mobile. Fréquence et sévérité visibles avant chaque consultation." },
];

const FAQS = [
  { q: "Nami gère-t-il les protocoles dupilumab pour l'asthme sévère ?", a: "Oui. Dupilumab, mépolizumab, benralizumab et tézépelumab sont intégrés avec les bilans pré-traitement (EOS, IgE) et les calendriers d'injection." },
  { q: "Comment importer les résultats d'EFR ?", a: "Les résultats EFR sont importables en PDF ou via export direct des appareils compatibles. VEMS, CVF, DEP sont graphiqués sur 12 mois." },
  { q: "Puis-je suivre les exacerbations entre les consultations ?", a: "Oui. Le patient documente ses exacerbations via l'app mobile. Fréquence, durée et traitement sont visibles à l'équipe." },
  { q: "Comment coordonner avec le kiné respiratoire ?", a: "Le kiné est invité dans l'équipe de soins. Il accède aux EFR et aux protocoles, et peut saisir ses observations de séance directement." },
];

function Badge({ text, color }: { text: string; color: string }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{text}</span>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8ECF4", padding: 24, ...style }}>{children}</div>;
}

function Tier({ name, price, note, features, highlight }: { name: string; price: string; note: string; features: string[]; highlight?: boolean }) {
  return (
    <Card style={{ border: highlight ? "2px solid #5B4EC4" : undefined, position: "relative" }}>
      {highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#5B4EC4", color: "#fff", borderRadius: 20, padding: "2px 14px", fontSize: 12, fontWeight: 700 }}>Recommandé</div>}
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E" }}>{price}<span style={{ fontSize: 14, fontWeight: 400, color: "#6B7280" }}>/mois</span></div>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>{note}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {features.map((f, i) => <li key={i} style={{ fontSize: 14, color: "#374151", marginBottom: 8, display: "flex", gap: 8 }}><span style={{ color: "#5B4EC4" }}>✓</span>{f}</li>)}
      </ul>
    </Card>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #E8ECF4", paddingBottom: 16, marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontWeight: 600, fontSize: 16, color: "#1A1A2E", display: "flex", justifyContent: "space-between" }}>
        {q}<span>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ marginTop: 8, color: "#6B7280", fontSize: 15 }}>{a}</p>}
    </div>
  );
}

function EFRDemo() {
  const data = [
    { date: "Jan 26", vems: 58, cvf: 82, acq: 3.2 },
    { date: "Fév 26", vems: 64, cvf: 84, acq: 2.1 },
    { date: "Mar 26", vems: 71, cvf: 86, acq: 1.4 },
    { date: "Avr 26", vems: 78, cvf: 88, acq: 0.8 },
  ];
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👨</div>
        <div>
          <div style={{ fontWeight: 700 }}>David, 41 ans — Asthme sévère éosinophile</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Dupilumab 300mg/2sem · EOS 620/mm³ initial</div>
        </div>
        <Badge text="Contrôlé" color="#059669" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>ÉVOLUTION EFR + SCORE SOUS DUPILUMAB</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Date", "VEMS %th", "CVF %th", "ACQ"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#9CA3AF", fontWeight: 600, borderBottom: "1px solid #E8ECF4" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAF8" : "#fff" }}>
              <td style={{ padding: "8px", fontWeight: 600 }}>{d.date}</td>
              <td style={{ padding: "8px", color: d.vems > 70 ? "#059669" : "#D97706", fontWeight: 700 }}>{d.vems}%</td>
              <td style={{ padding: "8px", color: "#374151" }}>{d.cvf}%</td>
              <td style={{ padding: "8px", color: d.acq < 1.5 ? "#059669" : "#D97706", fontWeight: 700 }}>{d.acq}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, padding: 10, background: "#D1FAE5", borderRadius: 8 }}>
        <Badge text="VEMS normalisé — asthme contrôlé à 4 mois" color="#059669" />
      </div>
    </Card>
  );
}

export default function PneumologuePage() {
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    TASKS.forEach(t => { v[t.id] = t.d; });
    return v;
  });

  const total = Object.values(vals).reduce((a, b) => a + b, 0);
  const saved = Math.round(total * 0.6);
  const daily = total - saved;
  const weekH = Math.round((daily * 5) / 60);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAFAF8", color: "#1A1A2E", minHeight: "100vh" }}>

      <section style={{ padding: "96px 24px 72px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Fade>
          <Badge text="Pneumologues" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            L'exacerbation arrive la nuit.<br />
            <span style={{ color: "#5B4EC4" }}>Votre équipe doit avoir le dossier complet.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            EFR intégrées, protocoles biothérapies asthme, scores ACT/ACQ et coordination avec kiné respiratoire et allergologue. Hébergement HDS.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 12, padding: "14px 32px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>Essai gratuit 30 jours</a>
            <a href="#cas" style={{ border: "2px solid #E8ECF4", borderRadius: 12, padding: "14px 32px", fontWeight: 600, fontSize: 16, textDecoration: "none", color: "#1A1A2E" }}>Voir un cas clinique</a>
          </div>
        </Fade>
      </section>

      <section id="cas" style={{ background: "#1A1A2E", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>David, 41 ans — Asthme sévère éosinophile</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>Dupilumab · EOS 620/mm³ · Kiné respiratoire + allergologue + MG</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["EFR retranscrites manuellement depuis le compte-rendu papier", "Kiné sans visibilité sur les valeurs spirométriques récentes", "Allergologue ne sait pas que le dupilumab est en cours", "Exacerbations non documentées entre les consultations"].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                    <span style={{ color: "#EF4444", fontSize: 18 }}>✗</span>
                    <span style={{ color: "#D1D5DB", fontSize: 15 }}>{t}</span>
                  </div>
                ))}
              </div>
            </Fade>
            <Fade delay={0.2}>
              <div>
                <div style={{ color: "#5B4EC4", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>AVEC NAMI</div>
                {["EFR importées automatiquement, graphiques VEMS/CVF sur 12 mois", "Kiné voit les EFR et adapte les séances de drainage", "Allergologue consulte le protocole dupilumab avant tests", "Exacerbations documentées par patient via l'app — fréquence visible"].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                    <span style={{ color: "#10B981", fontSize: 18 }}>✓</span>
                    <span style={{ color: "#D1D5DB", fontSize: 15 }}>{t}</span>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
          <Fade delay={0.3}>
            <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
              <EFRDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["EFR retranscrites manuellement depuis CR papier", "EFR importées automatiquement, VEMS/CVF graphiqués"],
              ["Kiné sans visibilité sur les EFR récentes", "EFR partagées avec le kiné — séances adaptées"],
              ["Exacerbations non tracées entre les consultations", "Exacerbations documentées par patient via l'app"],
              ["ACT calculé de mémoire sans tendance historique", "ACT/ACQ graphiqués sur 12 mois — tendance visible"],
            ].map(([avant, apres], i) => (
              <Fade key={i} delay={i * 0.08}>
                <Card>
                  <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 700, marginBottom: 6 }}>AVANT</div>
                  <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>{avant}</div>
                  <div style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginBottom: 6 }}>APRÈS</div>
                  <div style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{apres}</div>
                </Card>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#F0F2FA", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Calculez votre temps libéré</h2></Fade>
          <div style={{ display: "grid", gap: 16 }}>
            {TASKS.map(task => (
              <Fade key={task.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{task.label}</div>
                  <input type="range" min={0} max={60} value={vals[task.id]} onChange={e => setVals(v => ({ ...v, [task.id]: +e.target.value }))} style={{ flex: 2 }} />
                  <div style={{ width: 52, textAlign: "right", fontWeight: 700, color: "#5B4EC4" }}>{vals[task.id]}min</div>
                </div>
              </Fade>
            ))}
          </div>
          <Fade delay={0.2}>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {([[`${daily}min`, "par jour"], [`${weekH}h`, "par semaine"]] as [string, string][]).map(([v, l], i) => (
                <Card key={i} style={{ textAlign: "center", background: i === 0 ? "#5B4EC4" : "#fff" }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: i === 0 ? "#fff" : "#5B4EC4" }}>{v}</div>
                  <div style={{ fontSize: 14, color: i === 0 ? "#C7D2FE" : "#6B7280" }}>récupérés {l}</div>
                </Card>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      <section id="fonctionnalites" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les pneumologues</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <Fade key={i} delay={i * 0.07}>
                <Card>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{f.desc}</div>
                </Card>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#5B4EC4", padding: "64px 24px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#fff", maxWidth: 680, margin: "0 auto 16px" }}>
            "Le kiné a vu les EFR avant la séance et a adapté le drainage. C'est exactement ce type de coordination qu'on n'arrivait pas à mettre en place avant."
          </p>
          <p style={{ color: "#C7D2FE" }}>— Dr Thomas B., pneumologue, CHU de Grenoble</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour les suivis respiratoires" features={["Patients illimités", "EFR importées auto", "Dossier partagé équipe", "Suivi exacerbations"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique complète" features={["Tout Coordination", "Protocoles biothérapies", "Scores ACT/ACQ graphiqués", "Dictée CR EFR IA"]} highlight />
            <Tier name="Pilotage" price="299€" note="Pour les services pneumologie" features={["Tout Intelligence", "Analytics cohorte", "Multi-praticiens", "Intégration HIS/DPI"]} />
          </div>
        </div>
      </section>

      <section id="faq" style={{ background: "#F0F2FA", padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          {FAQS.map((f, i) => <Fade key={i} delay={i * 0.08}><FaqItem q={f.q} a={f.a} /></Fade>)}
        </div>
      </section>

      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Coordonnez votre équipe respiratoire</h2>
          <p style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>30 jours gratuits, sans carte bancaire.</p>
          <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 14, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Commencer maintenant</a>
        </Fade>
      </section>

    </div>
  );
}
