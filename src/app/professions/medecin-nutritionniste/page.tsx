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
  { id: "bia", label: "Analyse composition corporelle (BIA)", d: 20 },
  { id: "cr", label: "Compte-rendu de consultation", d: 18 },
  { id: "coord", label: "Coordination diét + psy + endocrino + APA", d: 16 },
  { id: "journal", label: "Revue journal alimentaire patient", d: 15 },
  { id: "bio", label: "Suivi bilans métaboliques", d: 12 },
  { id: "fact", label: "Facturation CCAM", d: 8 },
  { id: "annul", label: "Gestion liste d'attente", d: 6 },
  { id: "form", label: "Dossier administratif", d: 5 },
];

const FEATURES = [
  { icon: "⚖️", title: "Composition corporelle BIA", desc: "52 métriques BIA importées automatiquement. Masse grasse, muscle, hydratation, métabolisme basal — graphiqués sur 12 mois." },
  { icon: "🧪", title: "Bilans métaboliques automatisés", desc: "HbA1c, lipides, TSH, ferritine, vitamine D extraits automatiquement des PDF. Tableau de bord métabolique complet." },
  { icon: "🥗", title: "Journal alimentaire IA", desc: "Le patient saisit ses repas via l'app mobile. L'IA calcule l'apport en macros et micronutriments — accessible en consultation." },
  { icon: "🤝", title: "Coordination PCR Obésité", desc: "Diététicienne, psychologue, APA, endocrinologue — le modèle PCR dans le même dossier. Décisions concertées documentées." },
  { icon: "🎙️", title: "Dictée consultation", desc: "Dictez votre consultation nutrition. L'IA structure avec BIA, objectifs nutritionnels, prescriptions et plan d'action." },
  { icon: "📊", title: "Courbes de suivi longitudinal", desc: "IMC, pourcentage masse grasse, tour de taille graphiqués sur 24 mois. Comparez aux objectifs thérapeutiques fixés." },
];

const FAQS = [
  { q: "Nami gère-t-il l'importation des données BIA ?", a: "Oui. Les appareils BIA compatibles (InBody, Tanita, Seca, Biody) exportent des fichiers importables dans Nami. 52 métriques disponibles." },
  { q: "Comment le journal alimentaire patient est-il structuré ?", a: "Le patient saisit ses repas via l'app mobile (texte ou photo). L'IA calcule les apports en énergie, macros et micronutriments clés. Vous consultez l'analyse en consultation." },
  { q: "Nami est-il adapté au suivi post-bariatrique nutritionnel ?", a: "Oui. Suivi carences (B12, fer, D3, zinc), protocoles post-op, BIA mensuelle — tout est intégré pour le suivi nutritionnel post-bariatrique." },
  { q: "Puis-je coordonner avec la diététicienne qui suit aussi mon patient ?", a: "Oui. La diététicienne est invitée dans l'équipe de soins avec des droits modulables. Elle peut saisir ses observations entre les consultations." },
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

function MetaDemo() {
  const metrics = [
    { name: "IMC", value: "31.2", unit: "kg/m²", trend: "↓", prev: "34.8", ok: true },
    { name: "Masse grasse", value: "34.2", unit: "%", trend: "↓", prev: "41.1%", ok: true },
    { name: "Masse musculaire", value: "52.4", unit: "kg", trend: "↑", prev: "48.2 kg", ok: true },
    { name: "HbA1c", value: "5.9", unit: "%", trend: "↓", prev: "7.2%", ok: true },
  ];
  return (
    <Card style={{ maxWidth: 440 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👩</div>
        <div>
          <div style={{ fontWeight: 700 }}>Sophie, 44 ans — Obésité de grade 1 + pré-diabète</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Suivi 8 mois · PCR Obésité · 4 intervenants</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 14 }}>ÉVOLUTION 8 MOIS</div>
      {metrics.map((m, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>{m.prev}</span>
            <span style={{ fontWeight: 700, color: "#059669" }}>{m.value} {m.unit}</span>
            <span style={{ color: "#059669", fontWeight: 700 }}>{m.trend}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, padding: 10, background: "#D1FAE5", borderRadius: 8 }}>
        <Badge text="-12.3kg — objectif 6 mois atteint" color="#059669" />
      </div>
    </Card>
  );
}

export default function MedecinNutritionnistePage() {
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
          <Badge text="Médecins nutritionnistes" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            La composition corporelle évolue entre les consultations.<br />
            <span style={{ color: "#5B4EC4" }}>Toute l'équipe doit le voir.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            BIA automatisée, bilans métaboliques, journal alimentaire IA et coordination PCR Obésité. Tout dans un dossier partagé, sécurisé HDS.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Sophie, 44 ans — Obésité grade 1 + pré-diabète</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>PCR Obésité · Diét + psy + APA + endocrino · Suivi 8 mois</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["BIA saisie manuellement dans un tableur non partagé", "Diét ne sait pas ce que le patient mange réellement", "APA n'a pas accès aux résultats BIA ni aux objectifs médicaux", "Psy consulte sans connaître l'évolution pondérale"].map((t, i) => (
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
                {["BIA importée automatiquement, graphiqués sur 12 mois", "Journal alimentaire patient accessible en consultation", "APA voit les objectifs nutritionnels et la composition corporelle", "Psy consulte la courbe de poids avant chaque séance"].map((t, i) => (
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
              <MetaDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["BIA saisie manuellement dans un tableur non partagé", "BIA importée automatiquement, graphiques sur 12 mois partagés"],
              ["Journal alimentaire patient inconnu entre les consultations", "Journal alimentaire IA accessible par toute l'équipe"],
              ["APA sans visibilité sur les objectifs médicaux", "Objectifs nutritionnels et BIA accessibles par l'APA"],
              ["Psy consulte sans connaître l'évolution pondérale", "Courbe de poids consultable par le psy avant chaque séance"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les médecins nutritionnistes</h2></Fade>
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
            "L'APA a ajusté son programme en voyant les résultats BIA entre les consultations. C'est la première fois qu'on travrait vraiment en équipe."
          </p>
          <p style={{ color: "#C7D2FE" }}>— Dr Isabelle C., médecin nutritionniste, Toulouse</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour le PCR Obésité" features={["Patients illimités", "BIA auto importée", "Dossier partagé équipe", "Journal alimentaire IA"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique complète" features={["Tout Coordination", "Bilans métaboliques auto", "Courbes composition corporelle", "Dictée consultation IA"]} highlight />
            <Tier name="Pilotage" price="299€" note="Pour les centres spécialisés" features={["Tout Intelligence", "Analytics cohorte", "Multi-praticiens", "Intégration BIA externe"]} />
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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Orchestrez votre équipe nutrition</h2>
          <p style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>30 jours gratuits, sans carte bancaire.</p>
          <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 14, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Commencer maintenant</a>
        </Fade>
      </section>

    </div>
  );
}
