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
  { id: "bilan", label: "Bilan gériatrique standardisé (BGA)", d: 25 },
  { id: "cr", label: "Compte-rendu de consultation", d: 18 },
  { id: "coord", label: "Coordination SSIAD + famille + MG", d: 20 },
  { id: "medoc", label: "Révision ordonnance (polymédication)", d: 15 },
  { id: "msg", label: "Messages famille / aidants", d: 12 },
  { id: "fact", label: "Facturation CCAM", d: 8 },
  { id: "annul", label: "Gestion plannings EHPAD/SSIAD", d: 8 },
  { id: "form", label: "Dossier administratif + MDPH", d: 8 },
];

const FEATURES = [
  { icon: "📋", title: "Bilan gériatrique structuré", desc: "BGA complet (MMS, GDS, ADL, IADL, Tinetti) structuré en consultation. Comparaison avec les bilans précédents en un clic." },
  { icon: "💊", title: "Révision ordonnance", desc: "Polymédication : visualisez toutes les prescriptions en cours. Identifiez les interactions et les médicaments potentiellement inappropriés (critères STOPP/START)." },
  { icon: "👨‍👩‍👧", title: "Interface famille & aidants", desc: "Les aidants accèdent aux informations pertinentes (rendez-vous, médicaments, évolution). Moins d'appels, meilleure coordination à domicile." },
  { icon: "🤝", title: "Coordination ville-EHPAD", desc: "SSIAD, ergothérapeute, kiné, MG — tous dans le même dossier partagé. Passage de relais sécurisé sans perte d'information." },
  { icon: "🎙️", title: "Dictée consultation", desc: "Dictez en fin de consultation. L'IA structure en SOAP avec scores gériatriques intégrés et plan de soins actualisé." },
  { icon: "📊", title: "Suivi longitudinal", desc: "Visualisez l'évolution des scores cognitifs et fonctionnels sur 12-24 mois. Identifiez les tendances avant la décompensation." },
];

const FAQS = [
  { q: "Nami gère-t-il les outils gériatriques standardisés (MMS, GDS, ADL) ?", a: "Oui. MMS, GDS, ADL, IADL, Tinetti sont intégrés. Saisissez en consultation, comparez dans le temps, exportez pour le dossier MDPH." },
  { q: "Comment coordonner avec le SSIAD et la famille ?", a: "Le SSIAD et les membres de famille désignés sont invités dans l'espace de soins. Chacun accède aux informations pertinentes pour son rôle." },
  { q: "Puis-je identifier les interactions médicamenteuses dans les ordonnances complexes ?", a: "L'IA signale les associations potentiellement inappropriées selon les critères STOPP/START. La validation reste médicale." },
  { q: "Nami est-il adapté aux consultations en EHPAD ?", a: "Oui. Nami est utilisable en mobilité (tablette, mobile). Les données synchronisent en temps réel avec le dossier central." },
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

function ScoresDemo() {
  const scores = [
    { name: "MMS (cognition)", j0: 22, j1: 20, max: 30, icon: "🧠" },
    { name: "ADL (autonomie)", j0: 4, j1: 3, max: 6, icon: "🚶" },
    { name: "GDS (dépression)", j0: 12, j1: 14, max: 30, icon: "💭" },
    { name: "Tinetti (chutes)", j0: 18, j1: 16, max: 28, icon: "⚖️" },
  ];
  return (
    <Card style={{ maxWidth: 500 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👴</div>
        <div>
          <div style={{ fontWeight: 700 }}>Gérard, 82 ans — Syndrome démentiel léger</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>8 médicaments · SSIAD 3x/sem · Famille impliquée</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 16 }}>BILAN GÉRIATRIQUE — ÉVOLUTION 6 MOIS</div>
      {scores.map((s, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{s.icon} {s.name}</span>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>J0: <b style={{ color: "#5B4EC4" }}>{s.j0}</b> → J+6m: <b style={{ color: s.j1 < s.j0 ? "#D97706" : "#059669" }}>{s.j1}</b>/{s.max}</span>
          </div>
          <div style={{ background: "#F3F4F6", borderRadius: 8, height: 6 }}>
            <div style={{ background: "#5B4EC4", borderRadius: 8, height: 6, width: `${(s.j1 / s.max) * 100}%` }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, padding: 10, background: "#FEF3C7", borderRadius: 8, fontSize: 13, color: "#92400E" }}>
        ⚠️ Révision ordonnance — 2 interactions STOPP identifiées à valider
      </div>
    </Card>
  );
}

export default function GeriatrePage() {
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');`}</style>

      <section style={{ padding: "96px 24px 72px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Fade>
          <Badge text="Gériatres" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            Votre patient a 8 médicaments et 6 intervenants.<br />
            <span style={{ color: "#5B4EC4" }}>Un seul dossier pour tous.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Bilans gériatriques structurés, révision d'ordonnance, coordination SSIAD/famille et suivi longitudinal. Conçu pour la complexité du patient âgé.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Gérard, 82 ans — Syndrome démentiel léger + polymédication</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>8 médicaments · SSIAD 3x/semaine · 6 intervenants · Famille à distance</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["Famille appelle MG, SSIAD et gériatre séparément pour les mêmes infos", "Ordonnance complexe mal lue par l'aide-soignante du SSIAD", "MMS de J-6mois introuvable au moment de la consultation", "Chute signalée par l'aide-soignante — personne d'autre au courant"].map((t, i) => (
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
                {["Famille accède aux informations essentielles depuis l'app sans appeler", "Ordonnance structurée visible par SSIAD, MG et pharmacien", "MMS graphiqué sur 24 mois, accessible en 1 clic en consultation", "Chute documentée par l'aide-soignante — visible à toute l'équipe"].map((t, i) => (
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
              <ScoresDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Bilans gériatriques sur papier, introuvables en consultation", "BGA structuré, graphiqué sur 24 mois, accessible en 1 clic"],
              ["Famille appelle MG, SSIAD et gériatre séparément", "Famille accède aux informations essentielles depuis l'app"],
              ["Ordonnance complexe mal lue par les intervenants à domicile", "Ordonnance structurée et accessible à tous les intervenants"],
              ["Chute ou décompensation signalée oralement par l'aide-soignante", "Évènements documentés par tous, visibles à toute l'équipe"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Calculez votre temps libéré</h2></Fade>
          <Fade delay={0.1}><p style={{ textAlign: "center", color: "#6B7280", marginBottom: 48 }}>Ajustez selon votre pratique</p></Fade>
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les gériatres</h2></Fade>
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

      <section style={{ background: "#F5F3EF", padding: "28px 24px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.2vw,1.25rem)", fontStyle: "italic", color: "#1A1A2E", maxWidth: 560, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &ldquo;Le patient gériatrique polypathologique a cinq spécialistes. Chacun voit sa partie. Nami donne la vue d&rsquo;ensemble à toute l&rsquo;équipe de coordination.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#8A8A96", marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour les suivis complexes" features={["Patients illimités", "BGA structuré", "Dossier partagé équipe", "Interface famille"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique complète" features={["Tout Coordination", "Scores cognitifs graphiqués", "Révision ordonnance STOPP", "Dictée consultation IA"]} highlight />
            <Tier name="Pilotage" price="299€" note="Pour les services gériatriques" features={["Tout Intelligence", "Multi-sites EHPAD", "Analytics population âgée", "Intégration HIS/DPI"]} />
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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Simplifiez la complexité gériatrique</h2>
          <p style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>30 jours gratuits, sans carte bancaire.</p>
          <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 14, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Commencer maintenant</a>
        </Fade>
      </section>

      <footer style={{ padding: "20px 24px", textAlign: "center", borderTop: "1px solid rgba(26,26,46,0.06)", background: "#FAFAF8" }}>
        <p style={{ fontSize: 11, color: "#8A8A96", fontFamily: "'Inter',sans-serif" }}>
          Outil de coordination · Non dispositif médical · Conforme RGPD · © 2026 Nami
        </p>
      </footer>

    </div>
  );
}
