"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#111118", text: "#1A1A2E", textSec: "#4A4A5A", textMut: "#8A8A96",
  border: "rgba(26,26,46,0.06)", grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};

function useVis(t?: number): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([x]) => { if (x.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: t ?? 0.08 }
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
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
      transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}s, transform .6s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function AnimNum({ end, suffix, delay }: { end: number; suffix?: string; delay?: number }) {
  const [ref, vis] = useVis();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!vis) return;
    const timer = setTimeout(() => {
      const s = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - s) / 1400, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 4)) * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay ?? 0);
    return () => clearTimeout(timer);
  }, [vis, end, delay]);
  return <span ref={ref}>{val.toLocaleString("fr-FR")}{suffix ?? ""}</span>;
}

interface PainSolution { teaser: string; title: string; desc: string; }

function PainBlock({ time, pain, solution, icon, delay = 0 }: {
  time: string; pain: string; solution: PainSolution; icon: string; delay?: number;
}) {
  const [ref, vis] = useVis();
  const [flipped, setFlipped] = useState(false);

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(16px)",
      transition: `all .5s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          borderRadius: 14, padding: "22px 20px", cursor: "pointer",
          background: flipped ? `${C.teal}08` : "#fff",
          border: `1px solid ${flipped ? C.teal : C.border}`,
          transition: "all .3s cubic-bezier(.16,1,.3,1)",
          height: "100%", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: flipped ? C.teal : "#e74c3c",
              fontFamily: "'Inter',sans-serif", letterSpacing: ".04em", textTransform: "uppercase",
            }}>
              {flipped ? "Avec Nami" : `${time} perdues/sem`}
            </span>
          </div>
          <span style={{
            fontSize: 10, color: C.textMut, fontFamily: "'Inter',sans-serif",
            padding: "2px 8px", borderRadius: 4, background: C.bgAlt,
          }}>
            {flipped ? "← retour" : "cliquez"}
          </span>
        </div>
        <p style={{
          fontSize: 14, fontWeight: 600, color: C.text, margin: "0 0 6px", lineHeight: 1.35,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}>
          {flipped ? solution.title : pain}
        </p>
        <p style={{
          fontSize: 13, color: flipped ? C.teal : C.textSec, margin: 0, lineHeight: 1.5,
          fontFamily: "'Inter',sans-serif",
        }}>
          {flipped ? solution.desc : solution.teaser}
        </p>
      </div>
    </div>
  );
}

function GlowCard({ icon, title, desc, features, delay = 0 }: {
  icon: string; title: string; desc: string; features?: string[]; delay?: number;
}) {
  const [ref, vis] = useVis();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const b = cardRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - b.left, y: e.clientY - b.top });
  }, []);

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(14px)",
      transition: `all .5s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      <div ref={cardRef} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onMouseMove={onMove}
        style={{
          position: "relative", borderRadius: 16, padding: "28px 24px",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${hov ? "rgba(91,78,196,0.25)" : "rgba(255,255,255,0.06)"}`,
          transition: "border-color .3s, transform .3s cubic-bezier(.16,1,.3,1)",
          transform: hov ? "translateY(-4px)" : "none",
          overflow: "hidden", height: "100%",
        }}>
        {hov && (
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(300px circle at ${mouse.x}px ${mouse.y}px, rgba(91,78,196,0.07), transparent 60%)`,
            pointerEvents: "none",
          }} />
        )}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 24, marginBottom: 14 }}>{icon}</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.3 }}>{title}</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0, fontFamily: "'Inter',sans-serif", marginBottom: features ? 14 : 0 }}>{desc}</p>
          {features && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif" }}>
                  <span style={{ color: C.teal, fontSize: 10 }}>✓</span> {f}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.primary}22; color: ${C.primary}; }
      `}</style>

      {/* NAV */}
      {/* HERO */}
      <section style={{ paddingTop: 40, paddingBottom: 20, paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
        <Fade>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: "-.04em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Imaginez ne faire <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>que votre métier.</span>
          </h1>
        </Fade>
        <Fade delay={0.08}>
          <p style={{ fontSize: "clamp(.95rem,2vw,1.08rem)", color: C.textSec, lineHeight: 1.65, maxWidth: 520, margin: "16px auto 0", fontFamily: "'Inter',sans-serif" }}>
            Pas de compta. Pas de courriers perdus. Pas de « vous connaissez un bon endocrino ? ».
            Pas de protocoles cherchés entre deux patients. Pas de comptes-rendus rédigés à 21h.
            Juste votre consultation. Juste le soin.
          </p>
        </Fade>
        <Fade delay={0.14}>
          <p style={{ fontSize: 15, color: C.text, fontWeight: 700, marginTop: 20, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Inimaginable ? C&apos;est pourtant ce que Nami propose.
          </p>
        </Fade>
      </section>

      {/* STATS compact */}
      <section style={{ padding: "16px 24px 24px" }}>
        <Fade delay={0.18}>
          <div style={{ maxWidth: 780, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, background: C.dark, borderRadius: 12, padding: "16px 12px" }}>
            {([
              [60000, "+", "Sources"], [10, "", "Référentiels"], [131, "", "Parcours"],
              [2362, "", "Étapes"], [397, "K", "Soignants"], [425, "", "Pathologies"],
            ] as [number, string, string][]).map(([n, s, l], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(.9rem,2vw,1.3rem)", fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  <AnimNum end={n} suffix={s} delay={i * 50} />
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter',sans-serif", marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </Fade>
      </section>

      {/* PAIN CARDS */}
      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Fade>
            <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2.2rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.03em", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: "center", marginBottom: 6 }}>
              Tout ce que vous faites. Et que personne ne paie.
            </h2>
            <p style={{ fontSize: 14, color: C.textMut, textAlign: "center", marginBottom: 24, fontFamily: "'Inter',sans-serif" }}>
              Cliquez sur chaque carte pour voir comment Nami le résout.
            </p>
          </Fade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <PainBlock icon="📧" time="1h" pain="Répondre aux messages patients"
              solution={{ teaser: "Se replonger dans le dossier, réfléchir, formuler…", title: "Le contexte est déjà là", desc: "Quand un patient vous écrit, Nami affiche son dossier, ses dernières données, son équipe. Vous répondez en 30 secondes, pas en 5 minutes." }}
              delay={0} />
            <PainBlock icon="📝" time="45min" pain="Rédiger des comptes-rendus"
              solution={{ teaser: "Dicter, formater, envoyer par courrier…", title: "Enregistrez. L'IA structure.", desc: "Enregistrez votre consultation. L'IA produit un brouillon structuré et sourcé. Vous validez. Le rendu part vers l'équipe automatiquement." }}
              delay={0.06} />
            <PainBlock icon="🔍" time="30min" pain="Chercher le bon spécialiste"
              solution={{ teaser: "3 noms dans le carnet, 6 mois d'attente…", title: "Adressage intelligent", desc: "Recherchez par pathologie, zone et disponibilité. Nami affiche les soignants vérifiés de votre réseau. Adressez avec le contexte clinique en 30 secondes." }}
              delay={0.12} />
            <PainBlock icon="📖" time="25min" pain="Vérifier un protocole"
              solution={{ teaser: "GLP-1, switch d'antidépresseur, parcours PCR…", title: "131 protocoles sourcés HAS", desc: "Le protocole est dans Nami : examens, ordre, orientation, seuils. Sourcé HAS, PNDS, sociétés savantes. Accessible pendant la consultation." }}
              delay={0.18} />
            <PainBlock icon="📋" time="40min" pain="Ordonnances, PAI, certificats"
              solution={{ teaser: "Renouvellements, arrêts maladie, documents…", title: "Prescriptions intégrées", desc: "15M+ médicaments BDPM. Brouillons d'ordonnances. Export PDF. Scan ordonnance photo → extraction auto des médicaments." }}
              delay={0.24} />
            <PainBlock icon="📞" time="25min" pain="Appeler les confrères pour se coordonner"
              solution={{ teaser: "Le MG, la diét, le psy — par téléphone entre deux patients…", title: "Vue équipe en temps réel", desc: "Chaque soignant voit ce que les autres ont fait. Timeline d'activité, messagerie sécurisée. Zéro appel. Zéro SMS." }}
              delay={0.3} />
            <PainBlock icon="💼" time="30min" pain="Facturation, compta, déclarations"
              solution={{ teaser: "Notes d'honoraires, impayés, préparation comptable…", title: "Cockpit financier", desc: "CA temps réel, charges, pré-déclarations fiscales, bilan, compte de résultat. Vous êtes soignant, pas comptable. Nami prépare tout." }}
              delay={0.36} />
            <PainBlock icon="❌" time="20min" pain="Annulations, reports, no-shows"
              solution={{ teaser: "Créneaux perdus, patients à rappeler…", title: "Gestion automatisée", desc: "Rappels automatiques, créneaux libérés, notifications. Le no-show baisse, votre planning se remplit." }}
              delay={0.42} />
          </div>

          <Fade delay={0.45}>
            <div style={{ textAlign: "center", marginTop: 20, padding: "16px 20px", borderRadius: 12, background: C.dark, maxWidth: 520, margin: "20px auto 0" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", margin: 0, fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
                Mis bout à bout : <span style={{ color: "#fff", fontWeight: 700 }}>~4h/semaine</span> de travail invisible.
                À 50€/h = <span style={{ color: C.teal, fontWeight: 700 }}>~10 000€/an</span> non rémunéré.
                <br />Nami en automatise la majorité — pour <span style={{ color: C.teal, fontWeight: 700 }}>79€/mois</span>.
              </p>
            </div>
          </Fade>
        </div>
      </section>

      {/* GLOW CARDS */}
      <section style={{ padding: "36px 24px 44px", background: C.dark }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <h2 style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 800, color: "#fff", letterSpacing: "-.03em", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: "center", marginBottom: 8 }}>
              Sous le capot.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", fontFamily: "'Inter',sans-serif", marginBottom: 28 }}>
              Pas un prototype. Une infrastructure clinique complète.
            </p>
          </Fade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <GlowCard icon="📁" title="Dossier & coordination" delay={0}
              desc="Le dossier partagé pluridisciplinaire."
              features={["150+ métriques cliniques", "Équipe multi-pro par dossier", "Timeline d'activité temps réel", "Messagerie sécurisée intra-dossier", "Détection conflits ±24h", "Confidentialité psy par défaut", "Conditions CIM-11, phases de soins"]} />
            <GlowCard icon="🎙️" title="IA clinique" delay={0.06}
              desc="L'IA qui vous assiste sans décider à votre place."
              features={["Enregistrement → transcription → brouillon", "Synthèse 6 blocs sourcés", "Extraction bio auto (PDF/photo)", "Extraction ordonnance photo", "Score qualité (hallucination, complétude)", "Diff-aware : bannière si données changées", "Anonymisation RGPD systématique"]} />
            <GlowCard icon="🛤️" title="Parcours & protocoles" delay={0.12}
              desc="131 parcours structurés. 2 362 étapes. Chaque source traçable."
              features={["Conformité HAS calculée auto", "Complétude parcours en un coup d'œil", "148 règles cliniques actives", "Détection anomalies (12 règles CAD)", "Trajectoires OLS (z-score)", "425 pathologies CIM-11 documentées", "Crosslinks inter-parcours"]} />
            <GlowCard icon="🔍" title="Adressage & réseau" delay={0.18}
              desc="Trouvez, adressez, suivez."
              features={["Matching pathologie × zone × dispo", "Lettre d'adressage générée par IA", "Workflow Draft → Completed", "Annuaire 397K soignants (FHIR ANS)", "Hub réseau (CPTS, MSP)", "Adressage vers soignants hors Nami"]} />
            <GlowCard icon="🩺" title="Spécialités" delay={0.24}
              desc="Nutrition, pédiatrie, prescriptions, questionnaires."
              features={["Journal alimentaire photos + analyse IA", "Courbes pédiatriques OMS/Fenton", "Carnet de santé numérique + OCR", "Milestones ESPGHAN", "BDPM 15M+ médicaments", "EDE-Q, PHQ-9, GAD-7, SCOFF", "RCP virtuelle + export PDF"]} />
            <GlowCard icon="💼" title="Pilotage & facturation" delay={0.3}
              desc="De la note d'honoraires au bilan comptable."
              features={["FSE + NGAP/CCAM (22 professions)", "Export PDF factures", "CA, charges, résultat net temps réel", "Pré-déclarations fiscales", "Bilan, CR, flux de trésorerie", "Export comptable structuré"]} />
          </div>
        </div>
      </section>

      {/* APPS + SECURITY */}
      <section style={{ padding: "28px 24px 32px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {([
            ["📱", "App patient", "Parcours, équipe, RDV, photos repas, humeur, questionnaires."],
            ["🏥", "App soignant mobile", "Dossiers, notifications, messagerie entre deux consultations."],
            ["👨‍👩‍👧", "RCP virtuelle", "Brouillon IA pré-rempli, décisions collectives, export PDF."],
            ["🔒", "Sécurité RGPD", "MFA, anonymisation IA, audit trail, chiffrement, consentement explicite."],
            ["🌐", "Annuaire 397K", "Base FHIR ANS. Spécialité × pathologie × zone. Hub réseau."],
          ] as [string, string, string][]).map(([icon, title, desc], i) => (
            <Fade key={i} delay={i * 0.05}>
              <div style={{ padding: "20px 18px", borderRadius: 12, background: "#fff", border: `1px solid ${C.border}`, height: "100%" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h4>
                <p style={{ fontSize: 12, color: C.textSec, margin: 0, lineHeight: 1.55, fontFamily: "'Inter',sans-serif" }}>{desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ padding: "28px 24px", background: C.bgAlt, textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.3rem)", fontStyle: "italic", color: C.text, maxWidth: 560, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &ldquo;Ce n&apos;était pas un manque de compétence. C&apos;était un défaut d&apos;orchestration.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: C.textMut, marginTop: 12, fontFamily: "'Inter',sans-serif" }}>Margot Vire — Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      {/* CTA */}
      <section style={{ padding: "36px 24px 44px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.6rem,4.5vw,2.6rem)", fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: "-.04em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Arrêtez de compenser. <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Commencez à soigner.</span>
          </h2>
        </Fade>
        <Fade delay={0.06}>
          <p style={{ fontSize: 14, color: C.textMut, marginBottom: 22, fontFamily: "'Inter',sans-serif" }}>
            Gratuit · 79€ Coordination · 149€ Intelligence · 499€ Réseau
          </p>
        </Fade>
        <Fade delay={0.1}>
          <a
            href="/signup"
            style={{ display: "inline-block", padding: "16px 36px", borderRadius: 11, background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 6px 24px rgba(91,78,196,.25)", transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 32px rgba(91,78,196,.35)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(91,78,196,.25)"; }}
          >Commencer gratuitement</a>
        </Fade>
      </section>

    </div>
  );
}
