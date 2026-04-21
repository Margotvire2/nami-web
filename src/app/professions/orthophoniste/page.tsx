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

function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, vis] = useVis();
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(18px)", transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease` }}>
      {children}
    </div>
  );
}

const NAV_LINKS = [["Cas clinique", "#cas"], ["Avant/Après", "#avant-apres"], ["Fonctionnalités", "#fonctionnalites"], ["Tarifs", "#tarifs"], ["FAQ", "#faq"]];

const TASKS = [
  { id: "cr", label: "Compte-rendu de bilan", d: 20 },
  { id: "coord", label: "Coordination avec équipe", d: 15 },
  { id: "prog", label: "Suivi progression patient", d: 10 },
  { id: "ordonnances", label: "Renouvellements ordonnances", d: 8 },
  { id: "msg", label: "Messages famille/équipe", d: 10 },
  { id: "fact", label: "Facturation AMO", d: 8 },
  { id: "annul", label: "Gestion annulations", d: 6 },
  { id: "form", label: "Dossier administratif", d: 5 },
];

const FEATURES = [
  { icon: "📋", title: "Bilans structurés", desc: "Saisie guidée des bilans orthophoniques (langage, déglutition, voix). Export PDF prêt à envoyer au prescripteur." },
  { icon: "📈", title: "Suivi des objectifs", desc: "Suivez les objectifs thérapeutiques séance par séance. Visualisez la progression et partagez avec l'équipe." },
  { icon: "👨‍👩‍👧", title: "Interface famille", desc: "Les parents accèdent aux exercices à domicile et aux comptes-rendus de séance. Moins d'appels, plus de compliance." },
  { icon: "🤝", title: "Adressages coordonnés", desc: "Transmettez vos bilans au pédiatre, neurologue ou ORL directement depuis le dossier partagé." },
  { icon: "🎙️", title: "Enregistrement séance", desc: "Dictez vos notes pendant la séance. L'IA structure automatiquement en SOAP + objectifs thérapeutiques." },
  { icon: "✅", title: "Complétude dossier", desc: "Indicateur de complétude dossier en temps réel. Soyez certaine de n'oublier aucun renouvellement." },
];

const FAQS = [
  { q: "Puis-je utiliser Nami pour les bilans de déglutition en EHPAD ?", a: "Oui. Nami s'adapte à tous les contextes d'intervention — libéral, EHPAD, hôpital. Les bilans déglutition ont leurs propres templates." },
  { q: "Comment les parents accèdent-ils aux exercices ?", a: "Via l'application mobile Nami. Vous publiez les exercices depuis votre interface, les parents les reçoivent instantanément avec les consignes." },
  { q: "Est-ce que Nami gère la CCAM pour les orthophonistes ?", a: "Oui. La nomenclature AMO (AMO, AMI) est intégrée. La facturation se fait depuis le dossier patient sans ressaisie." },
  { q: "Mes échanges avec le pédiatre sont-ils sécurisés ?", a: "Tous les échanges sont chiffrés end-to-end et hébergés sur des serveurs certifiés HDS (Hébergeur de Données de Santé)." },
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

function ProgressDemo() {
  const goals = [
    { name: "Discrimination phonémique /p/-/b/", sessions: 8, target: 12, score: 72 },
    { name: "Fluidité verbale catégorielle", sessions: 6, target: 10, score: 58 },
    { name: "Compréhension de consignes complexes", sessions: 4, target: 8, score: 45 },
  ];
  return (
    <Card style={{ maxWidth: 520 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧒</div>
        <div>
          <div style={{ fontWeight: 700 }}>Maxime, 7 ans — Dyslexie + TDL</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Suivi depuis 3 mois · 18 séances</div>
        </div>
        <Badge text="En cours" color="#059669" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>OBJECTIFS THÉRAPEUTIQUES</div>
      {goals.map((g, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{g.name}</span>
            <span style={{ fontSize: 13, color: "#5B4EC4", fontWeight: 700 }}>{g.score}%</span>
          </div>
          <div style={{ background: "#F3F4F6", borderRadius: 8, height: 8 }}>
            <div style={{ background: "#5B4EC4", borderRadius: 8, height: 8, width: `${g.score}%`, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{g.sessions}/{g.target} séances planifiées</div>
        </div>
      ))}
      <div style={{ marginTop: 12, padding: 12, background: "#F0F2FA", borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#5B4EC4" }}>NOTE DE SÉANCE (IA)</div>
        <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>"Bonne progression sur /p/-/b/. Difficultés persistantes en fluidité. Exercices maison partagés aux parents."</div>
      </div>
    </Card>
  );
}

export default function OrthophonistePage() {
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
      {/* NAV */}

      {/* HERO */}
      <section style={{ padding: "96px 24px 72px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Fade>
          <Badge text="Orthophonistes" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            Vous suivez la progression.<br />
            <span style={{ color: "#5B4EC4" }}>Le prescripteur doit le savoir.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Bilans structurés, suivi d'objectifs thérapeutiques, coordination avec pédiatres et neurologues. Tout dans un dossier partagé, sécurisé HDS.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 12, padding: "14px 32px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>Essai gratuit 30 jours</a>
            <a href="#cas" style={{ border: "2px solid #E8ECF4", borderRadius: 12, padding: "14px 32px", fontWeight: 600, fontSize: 16, textDecoration: "none", color: "#1A1A2E" }}>Voir un cas clinique</a>
          </div>
        </Fade>
      </section>

      {/* CASE STUDY */}
      <section id="cas" style={{ background: "#1A1A2E", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade>
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Maxime, 7 ans — Dyslexie + Trouble du langage</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>Suivi orthophonique depuis 3 mois, 5 intervenants impliqués</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["Bilan initial envoyé par courrier postal au pédiatre (3 semaines)", "Parents ne comprennent pas les exercices à domicile", "Neurologue prescrit un bilan sans avoir vu les comptes-rendus précédents", "Maîtresse non informée des adaptations pédagogiques recommandées"].map((t, i) => (
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
                {["Bilan partagé au pédiatre en 1 clic, reçu en 10 minutes", "Exercices à domicile publiés sur l'app parents avec consignes audio", "Neurologue consulte les 3 bilans précédents avant l'examen", "Équipe éducative notifiée automatiquement des adaptations recommandées"].map((t, i) => (
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
              <ProgressDemo />
            </div>
          </Fade>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Bilan envoyé par courrier", "Bilan partagé en 1 clic depuis le dossier"],
              ["Exercices expliqués oralement aux parents", "Exercices publiés sur l'app famille avec consignes"],
              ["Prescripteur sans nouvelles entre les bilans", "Progression visible en temps réel dans le dossier partagé"],
              ["Notes de séance sur papier ou Word", "Dictée vocale → SOAP structuré en 30 secondes"],
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

      {/* TIME CALC */}
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

      {/* FEATURES */}
      <section id="fonctionnalites" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les orthophonistes</h2></Fade>
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

      {/* QUOTE */}
      <section style={{ background: "#F5F3EF", padding: "28px 24px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.2vw,1.25rem)", fontStyle: "italic", color: "#1A1A2E", maxWidth: 560, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &ldquo;L&rsquo;orthophoniste travaille en lien étroit avec le neuropédiatre, l&rsquo;enseignant et les parents. Nami facilite ce travail commun au quotidien.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#8A8A96", marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      {/* PRICING */}
      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Tarifs</h2></Fade>
          <Fade delay={0.1}><p style={{ textAlign: "center", color: "#6B7280", marginBottom: 48 }}>Sans engagement, résiliable à tout moment</p></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour les suivis complexes" features={["Tout Gratuit inclus", "Partage équipe temps réel", "App parents enrichie", "Adressages structurés"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique" features={["Tout Coordination", "Dictée → SOAP IA", "Suivi objectifs automatisé", "Rapports prescripteur IA"]} highlight />

            <Tier name="Pilotage" price="299€" note="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Export comptable"]} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: "#F0F2FA", padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          {FAQS.map((f, i) => <Fade key={i} delay={i * 0.08}><FaqItem q={f.q} a={f.a} /></Fade>)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Prête à rejoindre le réseau ?</h2>
          <p style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>30 jours gratuits, sans carte bancaire.</p>
          <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 14, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Commencer maintenant</a>
        </Fade>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "20px 24px", textAlign: "center", borderTop: "1px solid rgba(26,26,46,0.06)", background: "#FAFAF8" }}>
        <p style={{ fontSize: 11, color: "#8A8A96", fontFamily: "'Inter',sans-serif" }}>
          Outil de coordination · Non dispositif médical · Conforme RGPD · © 2026 Nami
        </p>
      </footer>

    </div>
  );
}
