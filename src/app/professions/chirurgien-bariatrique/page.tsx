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
  { id: "suivi", label: "Suivi post-opératoire (bilans carences)", d: 25 },
  { id: "cr", label: "Compte-rendu opératoire + consultation", d: 20 },
  { id: "coord", label: "Coordination diét + psy + endocrino", d: 18 },
  { id: "proto", label: "Protocoles de prise en charge PCR", d: 12 },
  { id: "msg", label: "Messages patients (complications)", d: 12 },
  { id: "fact", label: "Facturation CCAM + honoraires", d: 8 },
  { id: "annul", label: "Gestion liste d'attente", d: 8 },
  { id: "form", label: "Dossier préopératoire", d: 6 },
];

const FEATURES = [
  { icon: "🧪", title: "Suivi carences automatisé", desc: "Fer, B12, D3, zinc extraits automatiquement des bilans biologiques post-op. Alertes si carence à J+3mois, J+6mois, J+12mois." },
  { icon: "⚖️", title: "Courbes de poids post-op", desc: "Visualisez l'évolution du poids et de l'IMC depuis l'intervention. Comparez aux courbes de référence de la littérature." },
  { icon: "🤝", title: "Équipe pluridisciplinaire PCR", desc: "Diététicienne, psychologue, endocrinologue, MG — tous dans le même dossier. Le modèle PCR Obésité natif dans Nami." },
  { icon: "📋", title: "Protocole pré-opératoire", desc: "Checklist pré-op complète : consultation psy, bilan nutritionnel, bilan cardio. Complétude visible à tout moment." },
  { icon: "🎙️", title: "Dictée compte-rendu opératoire", desc: "Dictez votre CR pendant ou après l'intervention. L'IA structure et envoie aux correspondants automatiquement." },
  { icon: "📊", title: "Analytics population", desc: "Suivez les résultats sur votre cohorte opérée : perte d'excès de poids, comorbidités résolues, qualité de vie." },
];

const FAQS = [
  { q: "Nami s'intègre-t-il dans le parcours PCR Obésité ?", a: "Oui. Nami est conçu pour les 269 structures PCR en France. Le dossier partagé couvre l'ensemble de l'équipe (diét, psy, endocrino, kiné, MG)." },
  { q: "Comment gérer le suivi des carences post-bariatriques ?", a: "Les bilans biologiques sont extraits automatiquement (PDF → données structurées). Les protocoles J+3/J+6/J+12 mois sont intégrés avec rappels." },
  { q: "Puis-je suivre mes résultats chirurgicaux par cohorte ?", a: "Oui. Le tableau de bord analytique agrège les résultats de votre cohorte : %EWL, résolution des comorbidités, satisfaction." },
  { q: "La psychologue peut-elle accéder au dossier sans voir les données médicales ?", a: "Les droits d'accès sont modulables par rôle et par section du dossier. Chaque soignant voit ce qui est pertinent pour sa pratique." },
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

function TimelineDemo() {
  const steps = [
    { icon: "📋", label: "Bilan pré-op complet", status: "done", date: "J-30" },
    { icon: "🧠", label: "Consultation psychologue", status: "done", date: "J-21" },
    { icon: "🥗", label: "Bilan nutritionnel diét", status: "done", date: "J-14" },
    { icon: "🏥", label: "Sleeve gastrectomie", status: "done", date: "J0" },
    { icon: "🩸", label: "Bilan carences J+3mois", status: "current", date: "J+90" },
    { icon: "📊", label: "Consultation endocrino", status: "upcoming", date: "J+180" },
  ];
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👨</div>
        <div>
          <div style={{ fontWeight: 700 }}>Thomas, 41 ans — Sleeve gastrectomie</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>IMC initial 42 · Parcours PCR Obésité · 6 intervenants</div>
        </div>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            background: s.status === "done" ? "#D1FAE5" : s.status === "current" ? "#EDE9FE" : "#F3F4F6" }}>
            {s.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: s.status === "current" ? 700 : 500, color: s.status === "upcoming" ? "#9CA3AF" : "#1A1A2E" }}>{s.label}</div>
          </div>
          <Badge text={s.date} color={s.status === "done" ? "#059669" : s.status === "current" ? "#5B4EC4" : "#9CA3AF"} />
        </div>
      ))}
    </Card>
  );
}

export default function ChirurgienBariatriqueP() {
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
          <Badge text="Chirurgiens bariatriques" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            L'opération réussit en salle.<br />
            <span style={{ color: "#5B4EC4" }}>Le parcours se joue après.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Suivi des carences post-bariatriques, coordination PCR Obésité, protocoles pré et post-opératoires. Infrastructure conçue pour le parcours long de votre patient.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Thomas, 41 ans — Sleeve gastrectomie</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>IMC 42 · Parcours PCR Obésité · 6 intervenants · Suivi 12 mois</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["Bilan pré-op incomplet détecté la veille de l'intervention", "Carence en B12 à J+6mois non détectée — bilan reçu par courrier", "Diététicienne ne sait pas ce que mange réellement le patient", "Patient perdu de vue à J+18mois"].map((t, i) => (
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
                {["Checklist pré-op complète, visible à J-30 par toute l'équipe", "B12 extrait automatiquement du PDF labo à J+6mois", "Journal alimentaire patient visible par la diét entre les consultations", "Rappels automatiques J+12/18/24mois — 0 patient perdu de vue"].map((t, i) => (
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
              <TimelineDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Bilans carences reçus par courrier, retranscrits manuellement", "Extraction automatique fer/B12/D3/zinc depuis PDF de biologie"],
              ["Patient perdu de vue après 12 mois", "Protocole de rappel automatique J+12/18/24 mois"],
              ["Checklist pré-op vérifiée la veille en urgence", "Complétude pré-op visible à J-30 par toute l'équipe"],
              ["Diét sans visibilité sur le journal alimentaire", "Journal patient partagé avec l'équipe entre les consultations"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les chirurgiens bariatriques</h2></Fade>
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
            &ldquo;La chirurgie bariatrique n&rsquo;est que le début. C&rsquo;est l&rsquo;équipe pluridisciplinaire &mdash; diét, psy, endocrino &mdash; qui construit le résultat à long terme. Nami coordonne cette équipe.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#8A8A96", marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour les équipes PCR" features={["Patients illimités", "Dossier partagé équipe", "Checklist pré-op", "Extraction bio auto"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique complète" features={["Tout Coordination", "Protocoles post-op automatisés", "Dictée CR opératoire", "Alertes carences"]} highlight />
            <Tier name="Pilotage" price="299€" note="Pour les centres bariatriques" features={["Tout Intelligence", "Analytics cohorte", "Multi-praticiens", "Intégration HIS/DPI"]} />
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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Structurez votre parcours bariatrique</h2>
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
