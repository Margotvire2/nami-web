"use client";

import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   NAMI — Pitch Deck Générique Haut Niveau
   Pour têtes de réseaux, institutionnels, KOL cliniques
   ═══════════════════════════════════════════════════════════════ */

// ── Design tokens ──
const V = {
  nami: "#5B4EC4", namiH: "#4c44b0", teal: "#2BA89C", tealL: "#45C4B8",
  cream: "#FAFAF8", creamAlt: "#F5F3EF", deep: "#1A1A2E", deepS: "#252540",
  t1: "#1A1A2E", t2: "#374151", tm: "#6B7280",
  border: "rgba(26,26,46,0.06)",
};
const GRAD: React.CSSProperties = {
  background: `linear-gradient(135deg, ${V.nami} 0%, ${V.teal} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// ── Scroll reveal hook ──
function useReveal(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function Reveal({
  children, delay = 0, style = {}, className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [ref, vis] = useReveal(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s ${EASE} ${delay}ms, transform 0.8s ${EASE} ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated counter ──
function Counter({ end, suffix = "", duration = 2200 }: { end: number; suffix?: string; duration?: number }) {
  const [ref, vis] = useReveal(0.2);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!vis) return;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 5);
      setVal(Math.round(ease * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [vis, end, duration]);
  return <span ref={ref}>{val.toLocaleString("fr-FR")}{suffix}</span>;
}

// ── Glow orb ──
function Glow({ x = "50%", y = "50%", size = 500, color = V.nami, opacity = 0.12 }: {
  x?: string; y?: string; size?: number; color?: string; opacity?: number;
}) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
      transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 0,
    }} />
  );
}

// ── Eyebrow ──
function Eye({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
      color: light ? "rgba(255,255,255,0.3)" : V.nami, marginBottom: 16,
    }}>{children}</div>
  );
}

// ── Section wrapper ──
function Section({
  bg = V.cream, dark = false, minH = "100vh", children, style = {},
}: {
  bg?: string; dark?: boolean; minH?: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <section style={{
      minHeight: minH, background: bg, color: dark ? "#fff" : V.t1,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "clamp(60px,10vh,120px) clamp(24px,6vw,80px)",
      position: "relative", overflow: "hidden", ...style,
    }}>
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S1 — HERO
   ═══════════════════════════════════════════════════════════════ */
function S1Hero() {
  const words = ["Coordonner", "les", "parcours", "de", "soins.", "Enfin."];
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <Section bg={V.deep} dark>
      <Glow x="60%" y="30%" size={700} opacity={0.1} />
      <Glow x="80%" y="70%" size={400} color={V.teal} opacity={0.06} />

      <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(10px)", transition: `all 0.6s ${EASE}` }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: V.nami, letterSpacing: "-0.02em", marginBottom: 40 }}>nami</div>
      </div>

      <h1 style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", marginBottom: 28 }}>
        {words.map((w, i) => (
          <span key={i} style={{
            display: "inline-block",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.7s ${EASE} ${200 + i * 90}ms, transform 0.7s ${EASE} ${200 + i * 90}ms`,
          }}>
            {i === words.length - 1 ? <span style={GRAD}>{w}</span> : w}
            {i < words.length - 1 && "\u00A0"}
          </span>
        ))}
      </h1>

      <p style={{
        fontSize: "clamp(15px, 1.6vw, 18px)", color: "rgba(255,255,255,0.45)",
        lineHeight: 1.65, maxWidth: 560,
        opacity: loaded ? 1 : 0, transition: `opacity 0.8s ${EASE} 900ms`,
      }}>
        Une plateforme de coordination des parcours pluridisciplinaires — des TCA à l&apos;obésité complexe,
        de la pédiatrie aux maladies chroniques. L&apos;hôpital et la ville partagent le même espace.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", opacity: loaded ? 1 : 0, transition: `opacity 0.8s ${EASE} 1100ms` }}>
        <a href="mailto:margot@namipourlavie.com"
          style={{ textDecoration: "none", background: "#fff", color: V.nami, padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: `0 8px 32px rgba(91,78,196,0.2)`, cursor: "pointer" }}>
          Planifier un échange →
        </a>
        <a href="https://namipourlavie.com/demo-tca" target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", padding: "13px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: `all 0.25s ${EASE}` }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
          Voir un parcours en action →
        </a>
      </div>

      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 48, fontFamily: "Inter, sans-serif", letterSpacing: "0.02em", opacity: loaded ? 1 : 0, transition: `opacity 0.8s ${EASE} 1300ms` }}>
        Outil de coordination · Non dispositif médical · Conforme RGPD · Art. L.1110-12 CSP
      </p>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S2 — LE CONSTAT
   ═══════════════════════════════════════════════════════════════ */
function S2Constat() {
  const stats = [
    { n: 5, s: "+", label: "soignants", desc: "par parcours complexe en moyenne", src: "Terrain 2025" },
    { n: 0, s: "", label: "outil commun", desc: "entre ville et hôpital", src: "Constat national" },
    { n: 50, s: "%", label: "perdus de vue", desc: "dans les 6 mois post-hospitalisation", src: "Coordination ville-hôpital" },
  ];
  return (
    <Section bg={V.creamAlt}>
      <Reveal><Eye>Le constat</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 12 }}>
          Le patient sort de l&apos;hôpital.
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 28, ...GRAD }}>
          Son dossier reste sur place.
        </h2>
      </Reveal>
      <Reveal delay={300}>
        <p style={{ fontSize: 15, color: V.t2, lineHeight: 1.65, maxWidth: 580, marginBottom: 40 }}>
          En TCA, en obésité complexe, en pédiatrie, en santé mentale adolescente. Le suivi ambulatoire repose
          sur le mail, le téléphone, et le patient qui fait le messager entre ses soignants.
        </p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {stats.map((s, i) => (
          <Reveal key={i} delay={400 + i * 120}>
            <div
              style={{ background: "#fff", borderRadius: 16, border: `1px solid ${V.border}`, padding: "24px", display: "flex", alignItems: "center", gap: 20, transition: `transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(91,78,196,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "Inter, sans-serif", color: i % 2 === 0 ? V.nami : V.teal, lineHeight: 1, minWidth: 80 }}>
                <Counter end={s.n} />{s.s}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: V.tm, marginTop: 2 }}>{s.desc}</div>
                <div style={{ fontSize: 9, color: V.tm, marginTop: 4, fontStyle: "italic", fontFamily: "Inter, sans-serif" }}>{s.src}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S3 — L'INSIGHT
   ═══════════════════════════════════════════════════════════════ */
function S3Insight() {
  const lines = [
    "« Tous les outils médicaux",
    "améliorent les pratiques.",
    "Aucun ne rend du temps",
    "aux soignants. »",
  ];
  return (
    <Section bg={V.cream} minH="85vh" style={{ display: "flex", alignItems: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
        <Reveal><Eye>L&apos;observation</Eye></Reveal>
        {lines.map((l, i) => (
          <Reveal key={i} delay={200 + i * 250}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", fontStyle: "italic", lineHeight: 1.35, letterSpacing: "-0.01em", color: V.t1, margin: "4px 0" }}>{l}</p>
          </Reveal>
        ))}
        <Reveal delay={1300}>
          <p style={{ fontSize: 13, fontWeight: 600, color: V.t2, marginTop: 32 }}>
            — Margot Vire, d&apos;après 21 entretiens dans 9 services AP-HP
          </p>
          <p style={{ fontSize: 11, color: V.tm, marginTop: 4, fontFamily: "Inter, sans-serif" }}>
            Master 2 Recherche en Santé publique — AP-HP / Paris-Saclay
          </p>
        </Reveal>
        <Reveal delay={1500}>
          <p style={{ fontSize: 14, color: V.tm, marginTop: 28, lineHeight: 1.6, maxWidth: 520, margin: "28px auto 0" }}>
            Chaque nouveau logiciel coûte du temps ETP supplémentaire. Nami est conçu pour restituer du temps, pas en consommer.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S4 — LE PROBLÈME EST PARTOUT
   ═══════════════════════════════════════════════════════════════ */
function S4Partout() {
  const cases = [
    { icon: "🧠", path: "TCA", desc: "Le patient sort de Paul-Brousse. Relais ambulatoire : diét, psy, psychiatre, MT. 3 semaines après — qui sait si le suivi a pris ?", tag: "3-6 mois d'attente HC" },
    { icon: "⚖️", path: "Obésité complexe", desc: "Le PCR structure 4 niveaux de parcours. 269 structures en France. Le suivi pluripro repose sur des tableurs et des mails.", tag: "Nouveau PCR 2026" },
    { icon: "👶", path: "Pédiatrie", desc: "L'enfant est suivi par un pédiatre, un orthophoniste, une diététicienne, un gastropédiatre. Les parents font le lien.", tag: "ARFID, troubles alimentaires pédiatriques" },
    { icon: "💊", path: "Maladies chroniques", desc: "Post-greffe, diabète, cardiologie : le suivi ambulatoire implique 5+ soignants. La coordination est manuelle.", tag: "Recherche AP-HP 2025" },
  ];
  return (
    <Section bg={V.creamAlt}>
      <Reveal><Eye>Un problème universel</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 32 }}>Le même scénario. Partout.</h2>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cases.map((c, i) => (
          <Reveal key={i} delay={200 + i * 100}>
            <div
              style={{ background: "#fff", borderRadius: 14, border: `1px solid ${V.border}`, padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start", transition: `transform 0.3s ${EASE}, border-color 0.3s ${EASE}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = V.nami + "40"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = V.border; }}
            >
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{c.path}</div>
                <div style={{ fontSize: 13, color: V.t2, lineHeight: 1.55, marginBottom: 8 }}>{c.desc}</div>
                <div style={{ fontSize: 10, color: V.nami, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{c.tag}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={700}>
        <p style={{ fontSize: 12, color: V.tm, marginTop: 24, textAlign: "center", fontStyle: "italic" }}>
          Les recommandations existent. Les soignants existent. L&apos;outil de coordination entre eux n&apos;existe pas.
        </p>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S5 — NAMI : LA SOLUTION
   ═══════════════════════════════════════════════════════════════ */
function S5Solution() {
  const features = [
    { icon: "🎙", title: "Scribe ambiant", desc: "Le soignant consulte normalement. Nami écoute, transcrit, structure la note en 10 catégories. 30 secondes pour valider — pas 15 minutes pour rédiger.", badge: "Brouillon IA — à vérifier" },
    { icon: "📋", title: "Parcours guidé", desc: "131 parcours sourcés, 10 référentiels internationaux. Le soignant non spécialisé est guidé — les recommandations HAS sont intégrées dans le parcours, pas dans un PDF qu'il n'a pas lu.", badge: null },
    { icon: "💬", title: "Coordination tracée", desc: "Messagerie dans le dossier, adressage structuré, RCP activables. L'hôpital et la ville partagent le même espace. Le patient ne fait plus le messager.", badge: null },
  ];
  return (
    <Section bg={V.cream}>
      <Reveal><Eye>Nami</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 12 }}>
          Un seul espace. Toute l&apos;équipe.
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 32, ...GRAD }}>
          Toutes les pathologies.
        </h2>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {features.map((f, i) => (
          <Reveal key={i} delay={300 + i * 120}>
            <div
              style={{ background: "#fff", borderRadius: 16, border: `1px solid ${V.border}`, padding: "28px 24px", display: "flex", gap: 20, alignItems: "flex-start", transition: `transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 20px 60px rgba(91,78,196,0.1)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: V.t2, lineHeight: 1.6 }}>{f.desc}</div>
                {f.badge && (
                  <div style={{ marginTop: 12, display: "inline-block", background: `${V.nami}12`, color: V.nami, padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                    {f.badge}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S5b — INTERLUDE
   ═══════════════════════════════════════════════════════════════ */
function S5bInterlude() {
  return (
    <Section bg={V.deep} dark minH="auto" style={{ minHeight: "auto", padding: "clamp(40px,6vh,72px) clamp(24px,6vw,80px)" }}>
      <Glow x="50%" y="50%" size={400} opacity={0.08} />
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <p style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 700, marginBottom: 6 }}>
              Envie de voir ça sur un <span style={GRAD}>parcours TCA réel</span> ?
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
              Gabrielle, 10 ans, anorexie mentale — 5 soignants, un seul espace.
            </p>
          </div>
          <a href="https://namipourlavie.com/demo-tca" target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: "none", background: "#fff", color: V.nami, padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: `transform 0.2s ${EASE}, box-shadow 0.2s ${EASE}`, boxShadow: "0 4px 20px rgba(91,78,196,0.15)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(91,78,196,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(91,78,196,0.15)"; }}>
            Découvrir la démo TCA →
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S6 — LE FLOW CONSULTATION
   ═══════════════════════════════════════════════════════════════ */
function S6Scribe() {
  const steps = [
    { n: 1, t: "Appuyer sur « Enregistrer »", hl: false },
    { n: 2, t: "Consulter normalement", hl: false },
    { n: 3, t: "Arrêter l'enregistrement", hl: false },
    { n: 4, t: "L'IA structure la note en 10 types", hl: true },
    { n: 5, t: "Brouillons d'ordonnance générés", hl: true },
    { n: 6, t: "Valider, corriger, signer — 30 secondes", hl: false },
  ];
  const outputs = ["Motif de consultation", "Anamnèse structurée", "Examen clinique", "Décisions thérapeutiques", "Brouillon d'ordonnance"];
  return (
    <Section bg={V.creamAlt}>
      <Reveal><Eye>Consultation</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 32 }}>
          Le soignant consulte. <span style={GRAD}>Nami écoute.</span>
        </h2>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <Reveal delay={200}>
          <div>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", fontSize: 14, color: s.hl ? V.nami : V.t1, fontWeight: s.hl ? 700 : 400 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: s.hl ? V.nami : "#fff", color: s.hl ? "#fff" : V.tm, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, border: s.hl ? "none" : `1px solid ${V.border}` }}>
                  {s.n}
                </span>
                {s.t}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={400}>
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${V.border}`, boxShadow: "0 8px 32px rgba(26,26,46,0.06)", padding: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: V.nami, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Structuration automatique
            </div>
            {outputs.map((o, i) => (
              <div key={i}
                style={{ background: V.creamAlt, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: V.t2, marginBottom: 8, transition: `background 0.2s ${EASE}` }}
                onMouseEnter={e => { e.currentTarget.style.background = `${V.nami}08`; }}
                onMouseLeave={e => { e.currentTarget.style.background = V.creamAlt; }}
              >
                {o}
              </div>
            ))}
            <p style={{ fontSize: 10, color: V.tm, marginTop: 14, fontStyle: "italic", fontFamily: "Inter, sans-serif" }}>
              Brouillon IA — à vérifier par le praticien
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S7 — INTELLIGENCE CLINIQUE
   ═══════════════════════════════════════════════════════════════ */
function S7Intelligence() {
  const layers = [
    { n: 1, c: V.nami, title: "Sources officielles exclusivement", desc: "22 000+ recommandations indexées — HAS, NICE, DSM-5, FFAB, ESPGHAN, Orphanet, ICD-11. Sources officielles exclusivement — pas d'Internet ouvert. Chaque source est vérifiable." },
    { n: 2, c: V.nami, title: "Score de qualité sur chaque fragment", desc: "Chaque recommandation est scorée : autorité de la source, fraîcheur, grade de preuve. Score moyen : 0.77. Les résultats les plus fiables remontent en premier — pas les plus populaires." },
    { n: 3, c: V.teal, title: "Les concepts sont liés entre eux", desc: "116 000 relations typées entre pathologies, traitements, bilans, contre-indications. Quand on cherche « anorexie », le système sait que c'est lié à l'ostéoporose, au phosphore, au SRI, aux comorbidités psy." },
    { n: 4, c: V.teal, title: "La recommandation arrive au soignant — au bon moment", desc: "Le médecin de ville n'a pas besoin de chercher. Le parcours intègre les bonnes pratiques à chaque étape : quels bilans, quand, quels seuils, vers qui orienter. Adapté à l'âge, à la pathologie, aux comorbidités.", badge: true },
  ] as const;
  const metrics = [
    { n: "22 000+", l: "recommandations indexées" },
    { n: "116 000", l: "relations cliniques" },
    { n: "0.7%", l: "taux d'hallucination" },
  ];
  return (
    <Section bg={V.cream}>
      <Reveal><Eye>Intelligence clinique</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
          Les recommandations arrivent
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 28, ...GRAD }}>
          au bon soignant, au bon moment.
        </h2>
      </Reveal>
      <Reveal delay={300}>
        <p style={{ fontSize: 14, color: V.t2, lineHeight: 1.6, marginBottom: 32, maxWidth: 580 }}>
          Pas un moteur de recherche. Une infrastructure clinique construite en 4 couches — pour que chaque réponse soit fiable, sourcée, et adaptée au patient.
        </p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {layers.map((l, i) => (
          <Reveal key={i} delay={400 + i * 120}>
            <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
              <div style={{ width: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: l.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                  {l.n}
                </div>
                {i < 3 && <div style={{ width: 2, flex: 1, background: `linear-gradient(${l.c}, ${layers[i + 1]?.c || V.teal})`, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, background: "#fff", borderRadius: 14, border: "badge" in l && l.badge ? `1.5px solid ${V.nami}30` : `1px solid ${V.border}`, padding: "16px 20px", position: "relative" }}>
                {"badge" in l && l.badge && (
                  <div style={{ position: "absolute", top: -9, right: 16, background: V.nami, color: "#fff", padding: "3px 10px", borderRadius: 5, fontSize: 8, fontWeight: 800, letterSpacing: "0.06em" }}>
                    DANS LE PARCOURS
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{l.title}</div>
                <div style={{ fontSize: 12, color: V.t2, lineHeight: 1.55 }}>{l.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={900}>
        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 28 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: V.nami, fontFamily: "Inter, sans-serif" }}>{m.n}</div>
              <div style={{ fontSize: 10, color: V.tm }}>{m.l}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S8 — L'HÔPITAL A DES COULOIRS
   ═══════════════════════════════════════════════════════════════ */
function S8Couloirs() {
  const hosp = [
    "Staff pluridisciplinaire chaque semaine",
    "DPI partagé — tous les soignants voient tout",
    "Transmissions infirmières structurées",
    "Le patient ne sort pas sans plan de suivi",
  ];
  const ambu = [
    "Pas de staff — chacun dans son cabinet",
    "Pas de DPI partagé — mail, téléphone, WhatsApp",
    "Pas de transmissions — le patient fait le lien",
    "Le patient sort — et personne ne coordonne",
  ];
  return (
    <Section bg={V.deep} dark>
      <Glow x="45%" y="40%" size={650} opacity={0.1} />
      <Glow x="75%" y="65%" size={400} color={V.teal} opacity={0.06} />
      <Reveal><Eye light>Le vrai enjeu</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 8 }}>
          L&apos;hôpital a des couloirs.
        </h2>
      </Reveal>
      <Reveal delay={250}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 28 }}>
          Le libéral <span style={GRAD}>n&apos;en a pas.</span>
        </h2>
      </Reveal>
      <Reveal delay={400}>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 36, maxWidth: 580, lineHeight: 1.65 }}>
          À l&apos;hôpital, les soignants se croisent, font des staffs, partagent un DPI. En ambulatoire, chacun est seul dans son cabinet. Même coordination pluridisciplinaire — zéro infrastructure pour la porter.
        </p>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Reveal delay={500}>
          <div style={{ borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>À l&apos;hôpital</div>
            {hosp.map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", padding: "6px 0", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>✓</span>{t}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={600}>
          <div style={{ borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>En ambulatoire</div>
            {ambu.map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", padding: "6px 0", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#DC2626", fontSize: 12 }}>✗</span>{t}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal delay={750}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 28, textAlign: "center", fontWeight: 600 }}>
          Nami donne au libéral la même structure de coordination que l&apos;hospitalier.
        </p>
      </Reveal>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S9 — IMPACT TRANSDISCIPLINAIRE
   ═══════════════════════════════════════════════════════════════ */
function S9Transdisciplinaire() {
  const cards = [
    { icon: "🩺", title: "Former sans former", desc: "Le soignant non spécialisé est guidé par le parcours — les recommandations sont intégrées dans le suivi, pas dans un PDF qu'il n'a pas lu." },
    { icon: "💬", title: "Se parler sans se croiser", desc: "Les échanges sont dans le dossier, rattachés au patient. Le staff pluridisciplinaire existe — même quand les soignants ne partagent pas les mêmes murs." },
    { icon: "📋", title: "Suivre sans perdre", desc: "Le parcours indique les prochaines étapes, les retards, les bilans manquants. Le patient ne tombe plus entre les mailles du filet." },
    { icon: "🔔", title: "Compléter sans surveiller", desc: "Des indicateurs de complétude signalent quand un parcours décroche. Sans intrusion — juste de la visibilité organisationnelle." },
    { icon: "📊", title: "Rendre des comptes", desc: "Les données de coordination produisent les indicateurs ARS automatiquement — file active, complétude des parcours, délais. Plus de tableaux Excel." },
    { icon: "🤝", title: "Intégrer les réseaux", desc: "Les membres du réseau partagent les mêmes parcours, les mêmes protocoles, les mêmes contacts. L'annuaire vit dans le parcours." },
  ];
  return (
    <Section bg={V.cream}>
      <Reveal><Eye>Impact</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
          Des parcours transdisciplinaires
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 28, ...GRAD }}>
          en dehors de l&apos;hôpital.
        </h2>
      </Reveal>
      <Reveal delay={300}>
        <p style={{ fontSize: 14, color: V.t2, marginBottom: 32, maxWidth: 580, lineHeight: 1.6 }}>
          L&apos;hospitalisation coûte cher et les places manquent. Le but : que le patient soit pris en charge en ambulatoire avec la même rigueur qu&apos;à l&apos;hôpital. Nami rend ça possible.
        </p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cards.map((c, i) => (
          <Reveal key={i} delay={400 + i * 100}>
            <div
              style={{ background: "#fff", borderRadius: 14, border: `1px solid ${V.border}`, padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start", transition: `transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 16px 48px rgba(91,78,196,0.08)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: V.t2, lineHeight: 1.55 }}>{c.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S10 — CONFIANCE & CONFORMITÉ
   ═══════════════════════════════════════════════════════════════ */
function S10Confiance() {
  const items = [
    { icon: "🇪🇺", title: "Données en Europe", desc: "Hébergé en UE. Trajectoire HDS documentée." },
    { icon: "🔒", title: "Chiffrement", desc: "Au repos et en transit. Secret médical par architecture." },
    { icon: "👤", title: "19 rôles cliniques", desc: "Psychiatre et psychologue gardent leurs notes confidentielles. Matrice de visibilité par profession." },
    { icon: "🏥", title: "Non dispositif médical", desc: "Coordination, pas diagnostic. Art. L.1110-12 CSP. Brouillon IA toujours identifié." },
  ];
  return (
    <Section bg={V.creamAlt}>
      <Reveal><Eye>Confiance</Eye></Reveal>
      <Reveal delay={100}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 40 }}>
          Construit pour le secret médical,<br />pas adapté après coup.
        </h2>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it, i) => (
          <Reveal key={i} delay={200 + i * 100}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "#fff", borderRadius: 14, border: `1px solid ${V.border}`, padding: "20px 24px" }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{it.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{it.title}</div>
                <div style={{ fontSize: 13, color: V.tm, lineHeight: 1.55 }}>{it.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S11 — FONDATRICE
   ═══════════════════════════════════════════════════════════════ */
function S11Fondatrice() {
  const parcours = [
    "Diététicienne-nutritionniste — Hôpital Américain de Paris & exercice libéral",
    "Recherche AP-HP : impact de la télésurveillance sur les parcours ville-hôpital",
    "Recherche Paul-Brousse / FFAB : complications somatiques de l\u2019anorexie précoce",
    "DU TCA CMME, DU TCA enfants & adolescents · Nutrition & obésité pédiatrique · PMA & infertilité · Alimentation, sport, santé",
    "ESSEC Business School · HSBC Investment Banking · Startups seed & scale",
    "A construit l\u2019intégralité de la plateforme — 94 modèles de données, 3 repos",
    "Incubée par Wilco — incubateur santé, Paris",
    "Accompagnée par Le Catalyseur Santé",
    "Accompagnée par Medicen — pôle de compétitivité santé Île-de-France",
    "Soutenue par la Ville de Suresnes",
  ];
  return (
    <Section bg={V.cream} minH="85vh">
      <Reveal><Eye>Fondatrice</Eye></Reveal>
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>
        <Reveal delay={100}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${V.nami}, ${V.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
            MV
          </div>
        </Reveal>
        <div>
          <Reveal delay={150}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Margot Vire</h2>
            <p style={{ fontSize: 14, color: V.nami, fontWeight: 600, marginBottom: 20 }}>Diététicienne-nutritionniste · Fondatrice de Nami</p>
          </Reveal>
          {parcours.map((p, i) => (
            <Reveal key={i} delay={250 + i * 60}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: V.t2, lineHeight: 1.5, padding: "4px 0" }}>
                <span style={{ color: V.teal, fontWeight: 700, flexShrink: 0 }}>✓</span>{p}
              </div>
            </Reveal>
          ))}
          <Reveal delay={900}>
            <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: V.tm, marginTop: 20, maxWidth: 500 }}>
              &laquo;&nbsp;Le founder-market fit le plus dur à répliquer&nbsp;: une clinicienne qui code, qui soigne, et qui utilise son propre produit.&nbsp;&raquo;
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   S12 — CTA FINAL
   ═══════════════════════════════════════════════════════════════ */
function S12CTA() {
  return (
    <Section bg={V.deep} dark minH="80vh" style={{ display: "flex", alignItems: "center" }}>
      <Glow x="50%" y="45%" size={600} opacity={0.12} />
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Reveal>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 16 }}>
            Prêts à coordonner<br />autrement ?
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 36, lineHeight: 1.6 }}>
            Un pilote. Votre équipe. Vos patients.<br />
            La même coordination qu&apos;à l&apos;hôpital — en ambulatoire.
          </p>
        </Reveal>
        <Reveal delay={400}>
          <a href="mailto:margot@namipourlavie.com"
            style={{ textDecoration: "none", background: "#fff", color: V.nami, padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 700, boxShadow: `0 8px 40px rgba(91,78,196,0.15)`, cursor: "pointer", display: "inline-block", transition: `transform 0.2s ${EASE}, box-shadow 0.2s ${EASE}` }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 48px rgba(91,78,196,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(91,78,196,0.15)"; }}>
            Planifier un échange →
          </a>
        </Reveal>
        <Reveal delay={500}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>margot@namipourlavie.com</p>
            <a href="https://namipourlavie.com/demo-tca" target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none", fontSize: 13, color: "rgba(255,255,255,0.35)", transition: `color 0.2s ${EASE}` }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
              Voir la démo TCA complète →
            </a>
          </div>
        </Reveal>
        <Reveal delay={600}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.14)", marginTop: 36, fontFamily: "Inter, sans-serif", lineHeight: 1.7, letterSpacing: "0.02em" }}>
            Nami · Coordination des parcours de soins<br />
            Conforme RGPD · Non dispositif médical · Art. L.1110-12 CSP · Données hébergées en UE
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ASSEMBLAGE
   ═══════════════════════════════════════════════════════════════ */
export default function PitchReseauPage() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: V.cream, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: #5B4EC430; color: #1A1A2E; }
      `}</style>
      <S1Hero />
      <S2Constat />
      <S3Insight />
      <S4Partout />
      <S5Solution />
      <S5bInterlude />
      <S6Scribe />
      <S7Intelligence />
      <S8Couloirs />
      <S9Transdisciplinaire />
      <S10Confiance />
      <S11Fondatrice />
      <S12CTA />
    </div>
  );
}

