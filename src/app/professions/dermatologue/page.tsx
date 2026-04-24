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
  { id: "photos", label: "Documentation photographique lésions", d: 15 },
  { id: "cr", label: "Compte-rendu de consultation", d: 18 },
  { id: "proto", label: "Protocoles biothérapies (dupilumab, etc.)", d: 12 },
  { id: "coord", label: "Coordination allergologue + pédiatre", d: 12 },
  { id: "msg", label: "Messages patients (poussées eczéma)", d: 10 },
  { id: "fact", label: "Facturation CCAM", d: 8 },
  { id: "annul", label: "Gestion liste d'attente", d: 6 },
  { id: "form", label: "Dossier administratif", d: 5 },
];

const FEATURES = [
  { icon: "📸", title: "Suivi photographique", desc: "Documentez l'évolution des lésions avec photos horodatées. Comparaison côte à côte J0/J+3mois. Exportable pour le dossier partagé." },
  { icon: "💊", title: "Protocoles biothérapies", desc: "Dupilumab, secukinumab, ixekizumab — protocoles intégrés avec bilans pré-traitement requis et calendrier de suivi." },
  { icon: "🤝", title: "Coordination multi-soignants", desc: "Partagez le dossier avec l'allergologue, le pédiatre ou le MG. Moins de comptes-rendus par courrier, décisions collectives." },
  { icon: "📋", title: "Scores de sévérité", desc: "SCORAD, EASI, IGA intégrés. Saisissez en consultation, visualisez la tendance sur le graphique d'évolution." },
  { icon: "🎙️", title: "Dictée clinique", desc: "Dictez vos observations cliniques pendant la consultation. L'IA structure en SOAP avec scores et protocoles actualisés." },
  { icon: "🔔", title: "Suivi inter-consultations", desc: "Le patient documente ses poussées via l'app mobile. Vous consultez l'intensité et la localisation avant la prochaine séance." },
];

const FAQS = [
  { q: "Puis-je suivre l'évolution des lésions avec des photos ?", a: "Oui. Nami intègre un module photographique horodaté avec comparaison avant/après. Les photos sont chiffrées et hébergées HDS." },
  { q: "Nami gère-t-il les protocoles dupilumab ?", a: "Oui. Les biothérapies dermatologiques courantes sont intégrées avec les bilans pré-traitement requis et les calendriers de suivi." },
  { q: "Comment coordonner avec l'allergologue pour un eczéma allergique ?", a: "L'allergologue est invité dans l'équipe de soins et accède au dossier en temps réel. Plus de CR par courrier ou de doublons de bilans." },
  { q: "Les données photos sont-elles conformes RGPD ?", a: "Oui. Toutes les données (y compris les photos cliniques) sont hébergées sur serveurs HDS certifiés en France." },
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

function ScoreDemo() {
  const points = [
    { label: "J0", score: 42, cat: "Sévère" },
    { label: "J+1mois", score: 28, cat: "Modéré" },
    { label: "J+3mois", score: 14, cat: "Léger" },
    { label: "J+6mois", score: 6, cat: "Minimal" },
  ];
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👧</div>
        <div>
          <div style={{ fontWeight: 700 }}>Amandine, 28 ans — Dermatite atopique sévère</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Dupilumab 300mg/2sem · Suivi depuis 6 mois</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 16 }}>ÉVOLUTION SCORAD SOUS DUPILUMAB</div>
      {points.map((p, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: p.score > 25 ? "#DC2626" : p.score > 10 ? "#D97706" : "#059669" }}>SCORAD {p.score} — {p.cat}</span>
          </div>
          <div style={{ background: "#F3F4F6", borderRadius: 8, height: 8 }}>
            <div style={{ background: p.score > 25 ? "#DC2626" : p.score > 10 ? "#D97706" : "#059669", borderRadius: 8, height: 8, width: `${(p.score / 72) * 100}%` }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, padding: 10, background: "#D1FAE5", borderRadius: 8 }}>
        <Badge text="-86% SCORAD en 6 mois" color="#059669" />
      </div>
    </Card>
  );
}

export default function DermatologuePage() {
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
          <Badge text="Dermatologues" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            La lésion évolue entre deux consultations.<br />
            <span style={{ color: "#5B4EC4" }}>Documentez-la sans y penser.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Suivi photographique horodaté, scores SCORAD/EASI, protocoles biothérapies et coordination avec allergologue et pédiatre.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Amandine, 28 ans — Dermatite atopique sévère</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>Sous dupilumab · Suivi 6 mois · Coordination avec allergologue</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["Photos des lésions sur le téléphone du praticien (non tracé)", "Poussées signalées par message WhatsApp", "Allergologue ne sait pas que le dupilumab est en cours", "SCORAD calculé de mémoire sans historique"].map((t, i) => (
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
                {["Photos horodatées dans le dossier HDS, comparaison J0/J+6mois", "Poussées documentées dans l'app patient avec score intensité", "Allergologue consulte le protocole dupilumab en temps réel", "SCORAD graphiqué depuis le début du traitement"].map((t, i) => (
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
              <ScoreDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Photos des lésions sur téléphone personnel (non tracé, non sécurisé)", "Photos horodatées dans le dossier HDS avec comparaison"],
              ["SCORAD calculé de mémoire, sans historique", "Scores graphiqués depuis le début du traitement"],
              ["Poussées signalées par SMS ou WhatsApp", "Poussées documentées dans l'app avec score d'intensité"],
              ["Allergologue sans visibilité sur le traitement en cours", "Dossier partagé : protocole visible par tous les intervenants"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les dermatologues</h2></Fade>
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
            &ldquo;Le patient atopique sévère consulte un allergologue, un psy et parfois une diét. Chacun travaille dans son coin. Nami crée le fil conducteur entre tous.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour les suivis chroniques" features={["Patients illimités", "Photos horodatées HDS", "Dossier partagé équipe", "Scores SCORAD/EASI"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique complète" features={["Tout Coordination", "Protocoles biothérapies", "Dictée → SOAP IA", "Suivi inter-consultations"]} highlight />
            <Tier name="Pilotage" price="299€" note="Pour les équipes hospitalières" features={["Tout Intelligence", "Analytics cohorte", "Multi-praticiens", "Support prioritaire"]} />
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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Documentez. Partagez. Coordonnez.</h2>
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
