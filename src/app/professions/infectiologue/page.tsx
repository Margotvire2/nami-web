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
  { id: "bio", label: "Suivi bilans (NFS, CRP, ECBU, sérologies)", d: 20 },
  { id: "cr", label: "Compte-rendu de consultation", d: 18 },
  { id: "antib", label: "Suivi antibiothérapies/antiviraux", d: 15 },
  { id: "coord", label: "Coordination équipe hospitalière + ville", d: 18 },
  { id: "msg", label: "Messages patients / équipe", d: 10 },
  { id: "fact", label: "Facturation CCAM", d: 8 },
  { id: "avis", label: "Avis infectiologiques inter-services", d: 12 },
  { id: "form", label: "Dossier administratif", d: 5 },
];

const FEATURES = [
  { icon: "🧪", title: "Suivi biologique automatisé", desc: "NFS, CRP, PCT, hémocultures, ECBU, sérologies extraits automatiquement. Alertes sur les valeurs significatives à surveiller." },
  { icon: "💊", title: "Protocoles antibiothérapies", desc: "Suivi des antibiothérapies en cours : molécule, durée, résistance. Durée de traitement calculée avec rappels automatiques." },
  { icon: "🏥", title: "Avis infectiologiques structurés", desc: "Formatez vos avis inter-services en templates standardisés. Partagez directement dans le dossier du service demandeur." },
  { icon: "🤝", title: "Coordination ville-hôpital", desc: "MG, infectiologue ville et services hospitaliers dans le même dossier. Relais de sortie documenté en temps réel." },
  { icon: "🎙️", title: "Dictée avis / CR", desc: "Dictez votre avis infectiologique. L'IA structure avec bactériologie, antibiogramme et recommandations thérapeutiques." },
  { icon: "📊", title: "Suivi longitudinal VIH/VHC", desc: "CD4, CV, charge virale VHC graphiqués sur 24 mois. Protocoles ARV et suivi de tolérance intégrés." },
];

const FAQS = [
  { q: "Nami est-il adapté au suivi ambulatoire du VIH ?", a: "Oui. CD4, charge virale, bilan lipidique sous ARV sont graphiqués sur 24 mois. Les protocoles antirétroviraux sont intégrés avec suivi d'observance." },
  { q: "Comment structurer les avis infectiologiques inter-services ?", a: "Les avis sont formatés en templates standardisés (bactériologie, antibiogramme, recommandations). Ils sont partagés directement dans le dossier du service." },
  { q: "Puis-je suivre les durées d'antibiothérapie avec des rappels ?", a: "Oui. Chaque antibiothérapie prescrite a une durée et une date de fin prévue. Des rappels sont envoyés à l'équipe à J-2 pour réévaluation." },
  { q: "Nami est-il utilisable pour des avis rapides en mobilité ?", a: "Oui. L'application mobile permet de consulter le dossier et de rédiger un avis depuis n'importe quel service ou en mobilité." },
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

function ViralDemo() {
  const data = [
    { date: "Jan 25", cd4: 210, cv: 45000 },
    { date: "Avr 25", cd4: 380, cv: 1200 },
    { date: "Jul 25", cd4: 520, cv: 85 },
    { date: "Jan 26", cd4: 680, cv: "<50" },
  ];
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👨</div>
        <div>
          <div style={{ fontWeight: 700 }}>Samir, 38 ans — VIH sous ARV</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Bictegravir/TAF/FTC · Suivi depuis 12 mois</div>
        </div>
        <Badge text="Indétectable" color="#059669" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>ÉVOLUTION CD4 / CHARGE VIRALE</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Date", "CD4 (cell/mm³)", "CV (copies/mL)"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#9CA3AF", fontWeight: 600, borderBottom: "1px solid #E8ECF4" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAF8" : "#fff" }}>
              <td style={{ padding: "8px", fontWeight: 600 }}>{d.date}</td>
              <td style={{ padding: "8px", color: d.cd4 > 500 ? "#059669" : d.cd4 > 350 ? "#D97706" : "#DC2626", fontWeight: 700 }}>{d.cd4}</td>
              <td style={{ padding: "8px", color: typeof d.cv === "string" || d.cv < 200 ? "#059669" : "#DC2626", fontWeight: 700 }}>{d.cv}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, padding: 10, background: "#D1FAE5", borderRadius: 8 }}>
        <Badge text="CV indétectable — CD4 normalisé en 12 mois" color="#059669" />
      </div>
    </Card>
  );
}

export default function InfectiologuePage() {
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
          <Badge text="Infectiologues" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            L'antibiothérapie engage toute l'équipe.<br />
            <span style={{ color: "#5B4EC4" }}>Partagez le protocole, pas les doutes.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Suivi biologique automatisé, protocoles antibiothérapies avec durées trackées, avis inter-services structurés et coordination ville-hôpital.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Samir, 38 ans — VIH sous antirétroviraux</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>Bictegravir/TAF/FTC · Suivi 12 mois · Coordination MG + pharmacien</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["CD4 et CV retranscrits manuellement depuis courrier labo", "MG prescrit sans connaître le protocole ARV en cours", "Pharmacien n'est pas informé des interactions potentielles", "Bilan de tolérance manquant détecté en consultation"].map((t, i) => (
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
                {["CD4/CV extraits automatiquement des PDF, graphiqués sur 24 mois", "MG consulte le protocole ARV avant toute prescription", "Pharmacien accède aux traitements en cours (interactions)", "Rappel automatique si bilan de tolérance manquant"].map((t, i) => (
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
              <ViralDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Bilans bio retranscrits manuellement depuis les courriers", "Extraction automatique depuis PDF — graphiques sur 24 mois"],
              ["Antibiothérapie sans suivi de durée ni rappel de réévaluation", "Durées trackées avec rappels automatiques à J-2"],
              ["Avis inter-services dictés oralement ou par téléphone", "Avis structurés partagés directement dans le dossier"],
              ["MG prescrit sans connaître le protocole ARV en cours", "Dossier partagé — protocoles visibles par tous"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les infectiologues</h2></Fade>
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
            "Le service de chirurgie avait accès à mon avis avant même que j'arrive au service. Ça nous a économisé 6 heures sur la prise en charge."
          </p>
          <p style={{ color: "#C7D2FE" }}>— Dr Nadia F., infectiologue, CHU de Strasbourg</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour le suivi ambulatoire" features={["Patients illimités", "Extraction bio auto", "Dossier partagé équipe", "Protocoles antibiothérapies"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique complète" features={["Tout Coordination", "Suivi VIH/VHC graphiqué", "Avis structurés IA", "Rappels durée antibio"]} highlight />
            <Tier name="Pilotage" price="299€" note="Pour les services hospitaliers" features={["Tout Intelligence", "Avis inter-services", "Analytics résistances", "Intégration HIS/DPI"]} />
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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Coordonnez vos prises en charge infectieuses</h2>
          <p style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>30 jours gratuits, sans carte bancaire.</p>
          <a href="/signup" style={{ background: "#5B4EC4", color: "#fff", borderRadius: 14, padding: "16px 40px", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Commencer maintenant</a>
        </Fade>
      </section>

    </div>
  );
}
