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
  { id: "suivi", label: "Compte-rendu de visite prénatale", d: 18 },
  { id: "coord", label: "Coordination gynéco + MG + pédiatre", d: 16 },
  { id: "postnat", label: "Suivi post-natal (J+3, J+8, retour couches)", d: 15 },
  { id: "allait", label: "Suivi allaitement + courbes nourrisson", d: 12 },
  { id: "msg", label: "Messages patientes (nuit, urgences)", d: 12 },
  { id: "fact", label: "Facturation CCAM / AMO", d: 8 },
  { id: "annul", label: "Gestion planning", d: 6 },
  { id: "form", label: "Dossier administratif maternité", d: 5 },
];

const FEATURES = [
  { icon: "🤰", title: "Suivi prénatal structuré", desc: "Consultations mensuelles structurées avec résultats examens obligatoires. Partagé en temps réel avec le gynécologue et la maternité." },
  { icon: "👶", title: "Suivi post-natal et allaitement", desc: "Visites J+3, J+8, retour couches documentées. Courbes de poids du nourrisson suivies avec alertes si cassure de courbe." },
  { icon: "🤝", title: "Coordination maternité", desc: "Dossier de grossesse accessible à la maternité dès l'arrivée. Plus besoin de redonner les informations à l'équipe de salle de naissance." },
  { icon: "📋", title: "Préparation à la naissance", desc: "Séances de préparation à l'accouchement documentées. Plan de naissance partagé avec la maternité en amont." },
  { icon: "🎙️", title: "Dictée visite", desc: "Dictez votre compte-rendu de visite prénatale. L'IA structure avec termes, bilans, mesures et plan de suivi." },
  { icon: "🔒", title: "Confidentialité et consentement", desc: "Chaque partage d'information est consenti par la patiente. Les données obstétricales sont hébergées HDS certifié." },
];

const FAQS = [
  { q: "Nami est-il adapté au suivi de grossesse pathologique (HTA, diabète) ?", a: "Oui. Les protocoles de suivi rapproché (HTA gravidique, diabète gestationnel) sont intégrés avec coordination gynécologue et endocrinologue." },
  { q: "Comment le dossier est-il accessible à la maternité lors de l'accouchement ?", a: "Le dossier de grossesse est partagé avec la maternité avec les droits appropriés. L'équipe de salle accède en temps réel sans ressaisie." },
  { q: "Puis-je suivre l'allaitement et les courbes du nourrisson ?", a: "Oui. Les courbes de poids OMS pour le nourrisson sont intégrées. L'évolution du poids à J+3 et J+8 est graphiquée avec alertes si cassure." },
  { q: "La facturation CCAM et AMO est-elle intégrée ?", a: "Oui. Les actes de sage-femme (SF, SFI) sont intégrés pour la facturation. Les consultations prénatales et post-natales ont leurs propres codes." },
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

function GrossesseTimeline() {
  const visites = [
    { sa: "SA 8", acte: "1ère consultation + séros", sf: true, done: true },
    { sa: "SA 12", acte: "Écho T1 → CR partagé gyné", sf: false, done: true },
    { sa: "SA 16", acte: "Consultation SF + RCIU", sf: true, done: true },
    { sa: "SA 20", acte: "Morphologique → O'Sullivan planifié", sf: false, done: true },
    { sa: "SA 24", acte: "Test O'Sullivan", sf: true, done: false },
    { sa: "SA 28", acte: "Séance préparation naissance #3", sf: true, done: false },
  ];
  return (
    <Card style={{ maxWidth: 500 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤰</div>
        <div>
          <div style={{ fontWeight: 700 }}>Clara, 29 ans — Grossesse SA 22 (primigest)</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Sage-femme libérale + gynécologue + maternité Cochin</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 14 }}>SUIVI DE GROSSESSE PARTAGÉ</div>
      {visites.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            background: v.done ? "#D1FAE5" : "#F3F4F6" }}>
            {v.done ? "✓" : "○"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: v.done ? "#374151" : "#9CA3AF" }}>{v.acte}</div>
            {v.sf && <div style={{ fontSize: 11, color: "#5B4EC4", fontWeight: 600 }}>Sage-femme</div>}
          </div>
          <Badge text={v.sa} color={v.done ? "#059669" : "#9CA3AF"} />
        </div>
      ))}
    </Card>
  );
}

export default function SageFemmePage() {
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
          <Badge text="Sages-femmes" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            Vous suivez la grossesse semaine par semaine.<br />
            <span style={{ color: "#5B4EC4" }}>La maternité doit avoir le dossier complet.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Suivi prénatal partagé, coordination avec gynécologue et maternité, suivi post-natal et allaitement. Dossier accessible à la salle de naissance à J0.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Clara, 29 ans — Primigest, grossesse simple SA 22</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>Sage-femme libérale + gynécologue + maternité Cochin · 6 intervenants</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["Gynécologue ne sait pas ce que la SF a fait en SA 16", "Maternité reçoit le carnet de grossesse papier à l'arrivée en salle", "Test O'Sullivan oublié — détecté seulement en SA 26", "Patiente répète les mêmes informations à chaque intervenant"].map((t, i) => (
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
                {["Gynécologue voit le CR de la SF avant sa consultation", "Maternité accède au dossier complet avant l'arrivée en salle", "O'Sullivan planifié automatiquement dans le suivi SF", "Dossier partagé : 0 répétition, 0 information perdue"].map((t, i) => (
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
              <GrossesseTimeline />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Gynécologue sans visibilité sur les CR de la SF", "Gynécologue consulte tous les CR SF en temps réel"],
              ["Carnet de grossesse papier apporté le jour de l'accouchement", "Dossier numérique accessible à la maternité avant l'arrivée"],
              ["Examen obligatoire oublié, détecté tardivement", "Planning d'examens visible par tous — 0 oubli"],
              ["Suivi post-natal fragmenté entre SF, MG et pédiatre", "Suivi post-natal coordonné dans un dossier partagé"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les sages-femmes</h2></Fade>
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
            &ldquo;Le suivi périnatal est l&rsquo;affaire de toute une équipe. Nami connecte sage-femme, gynécologue, diét et pédiatre sur le même dossier partagé.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patientes actives", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour le suivi partagé" features={["Tout Gratuit inclus", "Dossier partagé maternité", "Coordination gynécologue", "Courbes nourrisson"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique" features={["Tout Coordination", "Dictée CR visite IA", "Plan de naissance partagé", "Suivi post-natal IA"]} highlight />

            <Tier name="Pilotage" price="299€" note="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Export comptable"]} />
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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Coordonnez votre suivi périnatal</h2>
          <p style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>30 jours gratuits, sans carte bancaire.</p>
          <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 14, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Commencer maintenant</a>
        </Fade>
      </section>

      <footer style={{ padding: "20px 24px", textAlign: "center", borderTop: "1px solid rgba(26,26,46,0.06)", background: "#FAFAF8" }}>
        <p style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Inter',sans-serif" }}>
          Outil de coordination · Non dispositif médical · Conforme RGPD · © 2026 Nami
        </p>
      </footer>

    </div>
  );
}
