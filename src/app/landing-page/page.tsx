"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Scroll Reveal Hook ─────────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

/* ─── Counter Hook ───────────────────────────────────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started || !ref.current) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      ref.current!.textContent = Math.round(target * eased).toLocaleString("fr-FR");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);
  return ref;
}

/* ─── Reveal wrapper ─────────────────────────────────────────────────────── */
function Reveal({
  children, delay = 0, from = "bottom", className = "", style = {}
}: {
  children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right" | "scale"; className?: string; style?: React.CSSProperties;
}) {
  const [ref, visible] = useReveal();
  const transforms: Record<string, string> = {
    bottom: "translateY(48px)", left: "translateX(-48px)",
    right: "translateX(48px)", scale: "scale(0.92) translateY(24px)"
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[from],
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPremium() {
  /* ── Navbar scroll ── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── Sticky feature section ── */
  const stickyRef = useRef<HTMLDivElement>(null);
  const [stickyProgress, setStickyProgress] = useState(0);
  useEffect(() => {
    const h = () => {
      const el = stickyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -rect.top / (el.offsetHeight - window.innerHeight)));
      setStickyProgress(p);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const panel = stickyProgress < 0.33 ? 0 : stickyProgress < 0.66 ? 1 : 2;

  /* ── Counters ── */
  const c1 = useCounter(865000);
  const c2 = useCounter(22308);
  const c3 = useCounter(116);
  const c4 = useCounter(121);

  /* ── Cursor glow ── */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const FEATURES = [
    {
      tag: "COORDINATION",
      title: "Un dossier partagé.\nUne équipe alignée.",
      body: "Médecin, diét, psy, pédiatre — chacun voit ce que les autres ont fait, en temps réel. Plus de coordination par SMS.",
      color: "#6366F1",
      icon: "🔗",
    },
    {
      tag: "SUIVI LONGITUDINAL",
      title: "L'évolution du patient.\nPas un instantané.",
      body: "Courbes de poids, bilans biologiques, scores cliniques, questionnaires — l'histoire complète en un coup d'œil.",
      color: "#8B5CF6",
      icon: "📈",
    },
    {
      tag: "ADRESSAGE",
      title: "La bonne orientation.\nAu bon moment.",
      body: "Trouvez le confrère idéal en 3 clics. Lettre d'adressage générée automatiquement. Traçabilité complète.",
      color: "#06B6D4",
      icon: "→",
    },
    {
      tag: "INTELLIGENCE CLINIQUE",
      title: "22 308 fiches.\nTout le savoir clinique.",
      body: "Recommandations HAS, FFAB, ESPGHAN, DSM-5. Recherche sémantique pendant la consultation.",
      color: "#10B981",
      icon: "🧠",
    },
  ];

  return (
    <>
      {/* ── CSS global ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        :root {
          --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nami-bg { background: #05050f; }
        .nami-light { background: #f5f5f7; }
        .gradient-text {
          background: linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #67E8F9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-warm {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.7) 0%, #fff 40%, rgba(255,255,255,0.7) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }
        .float-slow { animation: floatSlow 8s ease-in-out infinite alternate; }
        @keyframes floatSlow { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(40px,-30px) scale(1.08); } }
        .pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
        @keyframes pulseSlow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .card-hover {
          transition: transform 0.3s var(--ease-expo), box-shadow 0.3s var(--ease-expo);
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(99,102,241,0.15);
        }
        .sticky-panel-enter { animation: panelIn 0.5s var(--ease-expo) both; }
        @keyframes panelIn { from { opacity:0; transform:translateY(30px);} to { opacity:1; transform:none;} }
        .btn-glow {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s var(--ease-expo), box-shadow 0.2s;
        }
        .btn-glow:hover {
          transform: scale(1.03);
          box-shadow: 0 0 40px rgba(99,102,241,0.4);
        }
        .btn-glow:active { transform: scale(0.98); }
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.3; }
        }
        .scroll-dot { animation: scrollBounce 2s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        .nav-enter { animation: fadeIn 0.6s var(--ease-expo) 0.1s both; }
        .hero-eyebrow-enter { animation: fadeIn 0.7s var(--ease-expo) 0.3s both; }
        .hero-title-enter { animation: fadeIn 0.9s var(--ease-expo) 0.5s both; }
        .hero-sub-enter { animation: fadeIn 0.8s var(--ease-expo) 0.8s both; }
        .hero-cta-enter { animation: fadeIn 0.8s var(--ease-expo) 1.0s both; }
        .hero-scroll-enter { animation: fadeIn 0.8s var(--ease-expo) 1.4s both; }
      `}</style>

      <div className="nami-bg" style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* ═══ CURSOR GLOW ══════════════════════════════════════════════════ */}
        <div
          style={{
            position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
            background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(99,102,241,0.06), transparent 40%)`,
          }}
        />

        {/* ═══ NAVBAR ═══════════════════════════════════════════════════════ */}
        <nav
          className="nav-enter"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            padding: scrolled ? "12px 24px" : "20px 24px",
            background: scrolled ? "rgba(5,5,15,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>N</span>
              </div>
              <span style={{ color: "#fff", fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
            </div>
            {/* Links */}
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {["Fonctionnalités", "Blog", "Annuaire"].map(l => (
                <Link key={l} href={l === "Blog" ? "/blog" : l === "Annuaire" ? "/trouver-un-soignant" : "#features"}
                  style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 500, transition: "color 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >{l}</Link>
              ))}
              <Link href="/login"
                style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 500, transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >Connexion</Link>
              <Link href="/signup" className="btn-glow"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 600, padding: "9px 22px", borderRadius: 100, textDecoration: "none" }}
              >Démarrer</Link>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ════════════════════════════════════════════════════════ */}
        <section className="grid-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "140px 24px 100px", position: "relative", overflow: "hidden" }}>

          {/* Ambient orbs */}
          <div className="float-slow" style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", animation: "floatSlow 10s ease-in-out infinite alternate-reverse" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
            {/* Eyebrow */}
            <div className="hero-eyebrow-enter" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", marginBottom: 32 }}>
              <span className="pulse-slow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8", display: "inline-block" }} />
              <span style={{ color: "#818CF8", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Coordination des parcours complexes</span>
            </div>

            {/* Headline */}
            <h1 className="hero-title-enter" style={{ fontSize: "clamp(3rem,7vw,6rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.04, color: "#fff", marginBottom: 28 }}>
              Le soin est<br />
              <span className="gradient-text">fragmenté.</span><br />
              Nami le coud.
            </h1>

            {/* Sub */}
            <p className="hero-sub-enter" style={{ fontSize: "clamp(1.1rem,1.8vw,1.35rem)", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 44px" }}>
              Gabrielle a 16 ans, une anorexie, 3 soignants.
              Ils se coordonnent par SMS. 4 mois perdus.<br />
              <span style={{ color: "rgba(255,255,255,0.8)" }}>Ce n'est pas un manque de compétence. C'est un défaut d'orchestration.</span>
            </p>

            {/* CTA */}
            <div className="hero-cta-enter" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-glow"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "16px 40px", borderRadius: 100, textDecoration: "none" }}
              >
                Accéder à Nami
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, padding: "16px 32px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s", backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.03)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >Connexion soignant</Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll-enter" style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Scroll</span>
            <div className="scroll-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
          </div>
        </section>

        {/* ═══ PROBLEM — sticky scroll ══════════════════════════════════════ */}
        <div ref={stickyRef} style={{ height: "320vh", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#05050f" }}>
            <div style={{ maxWidth: 1100, width: "100%", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

              {/* Left — text panels */}
              <div style={{ position: "relative", minHeight: 280 }}>
                {[
                  {
                    tag: "LE PROBLÈME",
                    title: "Trois soignants.\nZéro coordination.",
                    body: "Le médecin ne sait pas ce que la diét a dit. La psychologue ignore les dernières analyses. Les parents font le lien entre tous. Par SMS.",
                    color: "#F87171",
                  },
                  {
                    tag: "LA CONSÉQUENCE",
                    title: "4 mois perdus.\nUn patient épuisé.",
                    body: "Chaque consultation repart de zéro. Les informations se perdent. Le patient — ou ses parents — devient coordinateur de son propre soin.",
                    color: "#FB923C",
                  },
                  {
                    tag: "LA SOLUTION",
                    title: "Nami transfère\ncette charge.",
                    body: "Du patient vers les soignants. Un dossier partagé. Une timeline commune. Une décision collective en quelques clics.",
                    color: "#818CF8",
                  },
                ].map((p, i) => (
                  <div
                    key={i}
                    style={{
                      position: i === 0 ? "relative" : "absolute",
                      top: 0, left: 0, right: 0,
                      opacity: panel === i ? 1 : 0,
                      transform: panel === i ? "none" : panel > i ? "translateY(-24px)" : "translateY(24px)",
                      transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                      pointerEvents: panel === i ? "auto" : "none",
                    }}
                  >
                    <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: p.color, textTransform: "uppercase", marginBottom: 20, padding: "5px 14px", border: `1px solid ${p.color}30`, borderRadius: 100, background: `${p.color}10` }}>{p.tag}</div>
                    <h2 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#fff", marginBottom: 20, whiteSpace: "pre-line" }}>{p.title}</h2>
                    <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 420 }}>{p.body}</p>
                  </div>
                ))}
              </div>

              {/* Right — visual */}
              <div style={{ position: "relative" }}>
                {/* Progress bar */}
                <div style={{ position: "absolute", left: -32, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 3, height: panel === i ? 48 : 24, borderRadius: 2, background: panel === i ? "#818CF8" : "rgba(255,255,255,0.12)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
                  ))}
                </div>

                {/* Card visual */}
                {panel === 0 && (
                  <div style={{ background: "#0d0d1f", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: 32, backdropFilter: "blur(10px)" }}>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Canal de coordination actuel</p>
                    {["SMS 🩺 Médecin → Dr Suela: 'bilan reçu?'", "Email Dr Suela → parents: 'dernier poids?'", "SMS Parents → Psy: 'on refait le point?'", "Email Psy → tous: réunion annulée 😔"].map((msg, i) => (
                      <div key={i} style={{ padding: "12px 16px", borderRadius: 12, background: i % 2 === 0 ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)", marginBottom: 8, fontSize: 13, color: i < 3 ? "rgba(255,255,255,0.6)" : "#F87171", border: "1px solid rgba(255,255,255,0.05)" }}>
                        {msg}
                      </div>
                    ))}
                    <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", fontSize: 12, color: "#F87171", textAlign: "center" }}>
                      4 mois de délai · 0 décision commune
                    </div>
                  </div>
                )}
                {panel === 1 && (
                  <div style={{ background: "#0d0d1f", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: 32 }}>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Ce que chaque soignant ignore</p>
                    {[
                      { who: "👩‍⚕️ Médecin", missing: "N'a pas vu la séance psy de lundi", color: "#FB923C" },
                      { who: "🥗 Diét", missing: "Ne sait pas que le poids a chuté de 2kg", color: "#FB923C" },
                      { who: "🧠 Psychologue", missing: "Ignore les nouvelles analyses bio", color: "#FB923C" },
                      { who: "👨‍👩‍👧 Parents", missing: "Répètent la même histoire à chaque RDV", color: "#F87171" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ fontSize: 14, opacity: 0.8 }}>{item.who}</span>
                        <span style={{ fontSize: 13, color: item.color, flex: 1 }}>← {item.missing}</span>
                      </div>
                    ))}
                  </div>
                )}
                {panel === 2 && (
                  <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))", borderRadius: 24, border: "1px solid rgba(99,102,241,0.2)", padding: 32 }}>
                    <p style={{ color: "#818CF8", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Avec Nami</p>
                    {[
                      { icon: "✅", text: "Dossier partagé — tout le monde voit tout" },
                      { icon: "✅", text: "Timeline clinique commune" },
                      { icon: "✅", text: "RCP virtuelle en 2 clics" },
                      { icon: "✅", text: "Parents informés, pas coordinateurs" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(99,102,241,0.1)" : "none" }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{item.text}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 20, padding: "10px 16px", borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", fontSize: 13, color: "#818CF8", textAlign: "center", fontWeight: 600 }}>
                      Décision collective en 1 session
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FEATURES BENTO ═════════════════════════════════════════════ */}
        <section id="features" style={{ padding: "140px 24px", background: "#05050f" }}>
          <Reveal className="text-center" style={{ marginBottom: 80 } as React.CSSProperties}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#818CF8", textTransform: "uppercase", marginBottom: 20, padding: "5px 16px", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 100 }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#fff" }}>
              Tout ce dont une équipe<br />
              <span className="gradient-text">pluridisciplinaire a besoin.</span>
            </h2>
          </Reveal>

          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.tag} delay={i * 80} from="scale">
                <div className="card-hover" style={{ background: "rgba(255,255,255,0.025)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: "40px 36px", height: "100%", cursor: "default", backdropFilter: "blur(10px)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: f.color, textTransform: "uppercase", padding: "4px 12px", border: `1px solid ${f.color}30`, borderRadius: 100, background: `${f.color}10` }}>{f.tag}</span>
                    <span style={{ fontSize: 28, opacity: 0.6 }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, color: "#fff", marginBottom: 16, whiteSpace: "pre-line" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{f.body}</p>
                  <div style={{ marginTop: 28, width: 40, height: 3, borderRadius: 2, background: f.color, opacity: 0.6 }} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ STATS ═══════════════════════════════════════════════════════ */}
        <section style={{ padding: "120px 24px", background: "#07071a", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Reveal>
            <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 64 }}>Infrastructure clinique réelle — pas des mocks</p>
          </Reveal>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 48, textAlign: "center" }}>
            {[
              { ref: c1, suffix: "+", label: "Soignants\nen annuaire", color: "#818CF8" },
              { ref: c2, suffix: "", label: "Fiches\ncliniques RAG", color: "#C084FC" },
              { ref: c3, suffix: "k", label: "Liens de\nknowledge graph", color: "#67E8F9" },
              { ref: c4, suffix: "", label: "Parcours de\nsoin structurés", color: "#6EE7B7" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: "clamp(2.8rem,5vw,4.5rem)", fontWeight: 900, letterSpacing: "-0.05em", color: s.color, lineHeight: 1 }}>
                  <span ref={s.ref}>0</span>{s.suffix}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "pre-line", lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ QUOTE — Margot ═══════════════════════════════════════════════ */}
        <section style={{ padding: "160px 24px", background: "#05050f" }}>
          <Reveal>
            <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 22, fontWeight: 900, color: "#fff" }}>M</div>
              <blockquote style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.4, color: "#fff", marginBottom: 32, fontStyle: "normal" }}>
                <span className="shimmer">"J'ai vécu le problème en première personne.</span>
                <br />
                <span style={{ color: "rgba(255,255,255,0.55)" }}>Alors j'ai construit l'outil que j'aurais voulu avoir."</span>
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Margot Vire</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Diététicienne TCA · Fondatrice de Nami</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ LIGHT — Spécialités ══════════════════════════════════════════ */}
        <section style={{ padding: "120px 24px", background: "#f5f5f7" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6366F1", textTransform: "uppercase", marginBottom: 20, padding: "5px 16px", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100 }}>CONÇU POUR</div>
              <h2 style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#1d1d1f" }}>
                Les pathologies qui<br />
                <span className="gradient-text-warm">demandent une équipe.</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "🌱", label: "TCA", sub: "Anorexie · Boulimie · ARFID · BED" },
              { icon: "⚖️", label: "Obésité", sub: "Pédiatrique · Grade II/III · PCR" },
              { icon: "👶", label: "Pédiatrie", sub: "Cassure de courbe · Crohn · APLV" },
              { icon: "🧠", label: "Santé mentale", sub: "TSA · TDAH · Anxiété alimentaire" },
              { icon: "🩺", label: "Maladies chroniques", sub: "MICI · Diabète · Pathologies rares" },
              { icon: "💊", label: "Post-chimio", sub: "Réhabilitation nutritionnelle" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.06)", padding: "28px 24px", transition: "all 0.25s", cursor: "default" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(99,102,241,0.12)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.06)"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1d1d1f", marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: "#6e6e73" }}>{s.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ CTA FINAL ════════════════════════════════════════════════════ */}
        <section style={{ padding: "180px 24px", background: "#05050f", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* Big ambient glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />
          <Reveal>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.05, color: "#fff", marginBottom: 24 }}>
                Prêt à coordonner<br />
                <span className="gradient-text">sans friction ?</span>
              </h2>
              <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.45)", marginBottom: 48, lineHeight: 1.6 }}>
                Rejoignez les premiers soignants sur Nami.<br />Accès gratuit. Aucune carte de crédit.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/signup" className="btn-glow"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "18px 48px", borderRadius: 100, textDecoration: "none" }}
                >
                  Créer un compte gratuit
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/trouver-un-soignant"
                  style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 500, padding: "18px 36px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s", background: "rgba(255,255,255,0.03)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                >Annuaire des soignants</Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ FOOTER ═════════════════════════════════════════════════════ */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "60px 24px 40px", background: "#03030c" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>N</span>
                </div>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
                Le système nerveux des parcours de soins complexes. Coordination, visibilité, passage de relais.
              </p>
            </div>
            {[
              { title: "Produit", links: [{ l: "Fonctionnalités", h: "#features" }, { l: "Connexion", h: "/login" }, { l: "Créer un compte", h: "/signup" }] },
              { title: "Ressources", links: [{ l: "Annuaire", h: "/trouver-un-soignant" }, { l: "Pathologies", h: "/pathologies" }, { l: "Blog", h: "/blog" }] },
              { title: "Légal", links: [{ l: "CGU", h: "/cgu" }, { l: "Confidentialité", h: "/confidentialite" }, { l: "Mentions légales", h: "/mentions-legales" }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>{col.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map(({ l, h }) => (
                    <Link key={l} href={h}
                      style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                    >{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>© 2026 Nami — Margot Vire</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.15)" }}>Coordination des parcours de soins complexes</span>
          </div>
        </footer>

      </div>
    </>
  );
}
