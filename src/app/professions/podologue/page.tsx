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
  { id: "bilan", label: "Bilan podologique + semelles", d: 20 },
  { id: "cr", label: "Compte-rendu de consultation", d: 15 },
  { id: "coord", label: "Coordination endocrino + MG + kiné", d: 14 },
  { id: "suivi", label: "Suivi plaies diabétiques", d: 18 },
  { id: "msg", label: "Messages patients / équipe", d: 8 },
  { id: "fact", label: "Facturation AMO", d: 8 },
  { id: "annul", label: "Gestion annulations", d: 5 },
  { id: "form", label: "Dossier administratif", d: 5 },
];

const FEATURES = [
  { icon: "🦶", title: "Suivi plaies diabétiques", desc: "Photos horodatées de plaies avec comparaison J0/J+n. Stade Wagner documenté. Évolution partagée avec endocrinologue et MG." },
  { icon: "👟", title: "Prescription semelles", desc: "Ordonnance de semelles orthopédiques structurée avec bilan podologique. Exportable directement vers le podo orthésiste ou le médecin." },
  { icon: "🤝", title: "Coordination diabète", desc: "Dans les équipes PCR Obésité ou de suivi diabétique, le podologue coordonne avec endocrinologue, diét et MG depuis le même dossier." },
  { icon: "📋", title: "Bilan podologique structuré", desc: "Bilan statique et dynamique, examen vasculaire, test monofilament — templates intégrés pour le pied diabétique et la rhumatologie." },
  { icon: "🎙️", title: "Dictée séance", desc: "Dictez votre compte-rendu de séance. L'IA structure avec bilan podologique, actes réalisés et plan de suivi." },
  { icon: "📸", title: "Documentation photographique", desc: "Photos des lésions horodatées et sécurisées HDS. Comparaison séance par séance. Exportable pour le dossier médical partagé." },
];

const FAQS = [
  { q: "Nami est-il adapté au suivi du pied diabétique ?", a: "Oui. Le suivi du pied diabétique (stade Wagner, test monofilament, photos horodatées) est intégré avec coordination endocrinologue et MG." },
  { q: "Comment documenter l'évolution d'une plaie entre les séances ?", a: "Les photos sont horodatées et stockées en HDS. La comparaison J0/J+n est visible en un clic dans le dossier partagé. Le médecin peut consulter sans appel." },
  { q: "La nomenclature AMO pour les podologues est-elle intégrée ?", a: "Oui. Les actes AMO (BS, CS) sont intégrés pour la facturation. Les séances diabète et rhumatologie ont leurs propres codes." },
  { q: "Puis-je partager mon bilan avec le rhumatologue qui a prescrit les semelles ?", a: "Oui. Le rhumatologue ou le médecin prescripteur est invité dans l'équipe de soins et accède au bilan podologique en temps réel." },
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

function PlaieDemo() {
  const suivi = [
    { date: "J0", taille: "2.2cm²", wagner: 1, statut: "Ouverte" },
    { date: "J+7", taille: "1.8cm²", wagner: 1, statut: "Bourgeonnante" },
    { date: "J+14", taille: "1.1cm²", wagner: 1, statut: "Épidermisation" },
    { date: "J+21", taille: "0.3cm²", wagner: 0, statut: "Fermée" },
  ];
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#5B4EC422", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👨</div>
        <div>
          <div style={{ fontWeight: 700 }}>Claude, 68 ans — Pied diabétique, plaie hallux</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Diabète type 2 · HbA1c 8.2% · Endocrino + MG informés</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>SUIVI PLAIE — 21 JOURS</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Date", "Surface", "Stade Wagner", "Statut"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#9CA3AF", fontWeight: 600, borderBottom: "1px solid #E8ECF4" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {suivi.map((s, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAF8" : "#fff" }}>
              <td style={{ padding: "8px", fontWeight: 600 }}>{s.date}</td>
              <td style={{ padding: "8px" }}>{s.taille}</td>
              <td style={{ padding: "8px" }}><Badge text={`W${s.wagner}`} color={s.wagner > 0 ? "#D97706" : "#059669"} /></td>
              <td style={{ padding: "8px", color: s.statut === "Fermée" ? "#059669" : "#D97706", fontWeight: 600 }}>{s.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, padding: 10, background: "#D1FAE5", borderRadius: 8 }}>
        <Badge text="Cicatrisation complète en 21 jours" color="#059669" />
      </div>
    </Card>
  );
}

export default function PodologuePage() {
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
          <Badge text="Podologues" color="#5B4EC4" />
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "20px 0 24px" }}>
            La plaie évolue entre chaque séance.<br />
            <span style={{ color: "#5B4EC4" }}>L'endocrinologue doit le savoir.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#6B7280", maxWidth: 640, margin: "0 auto 40px" }}>
            Suivi photographique des plaies, stade Wagner, bilans podologiques et coordination avec endocrinologue et MG. Dossier sécurisé HDS.
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
            <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Claude, 68 ans — Pied diabétique, plaie hallux droit</h2>
            <p style={{ color: "#9CA3AF", marginBottom: 40 }}>Diabète type 2 · HbA1c 8.2% · Suivi 3 semaines · Endocrino + MG informés</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <Fade delay={0.1}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SANS NAMI</div>
                {["Photos de la plaie sur le téléphone du praticien (non HDS)", "Endocrinologue informé par téléphone — sans voir les photos", "MG ne sait pas que la plaie est en cours de suivi", "Évolution de la plaie non documentée entre les séances"].map((t, i) => (
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
                {["Photos horodatées stockées en HDS dans le dossier partagé", "Endocrinologue voit les photos d'évolution en temps réel", "MG consulte le suivi de plaie avant toute prescription", "Comparaison J0/J+21 en 1 clic — cicatrisation documentée"].map((t, i) => (
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
              <PlaieDemo />
            </div>
          </Fade>
        </div>
      </section>

      <section id="avant-apres" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Ce qui change concrètement</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              ["Photos de plaie sur téléphone personnel (non HDS)", "Photos horodatées dans le dossier HDS partagé"],
              ["Endocrinologue informé par téléphone sans voir les images", "Évolution visible en temps réel dans le dossier commun"],
              ["MG sans visibilité sur le suivi podologique", "MG consulte le suivi avant toute prescription"],
              ["Bilan podologique sur papier, non partagé", "Bilan structuré accessible au prescripteur des semelles"],
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
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Conçu pour les podologues</h2></Fade>
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
            &ldquo;Le pied diabétique implique endocrino, diét, infirmière et kiné. Nami crée le dossier commun qui évite les doublons et les pertes d&rsquo;information.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#8A8A96", marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      <section id="tarifs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade><h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Tarifs</h2></Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            <Tier name="Gratuit" price="0€" note="Pour découvrir" features={["3 patients actifs", "Dossier patient simple", "Partage manuel PDF"]} />
            <Tier name="Coordination" price="79€" note="Pour le pied diabétique" features={["Tout Gratuit inclus", "Dossier partagé équipe", "Stade Wagner documenté", "Coordination endocrino"]} />
            <Tier name="Intelligence" price="149€" note="IA clinique" features={["Tout Coordination", "Comparaison photos J0/Jn", "Dictée CR séance IA", "Rapports prescripteur"]} highlight />

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
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Documentez et partagez chaque séance</h2>
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
