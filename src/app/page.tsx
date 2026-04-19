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
    bottom: "translateY(40px)", left: "translateX(-40px)",
    right: "translateX(40px)", scale: "scale(0.94) translateY(20px)"
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

const FEATURES = [
  {
    tag: "COORDINATION",
    title: "Un dossier partagé.\nUne équipe alignée.",
    body: "Médecin, diét, psy, pédiatre — chacun voit ce que les autres ont fait, en temps réel. Plus de coordination par SMS.",
    color: "#5B4EC4",
    accent: "rgba(91,78,196,0.08)",
    border: "rgba(91,78,196,0.15)",
  },
  {
    tag: "CONTINUITÉ",
    title: "L'histoire du patient.\nPas un instantané.",
    body: "Courbes de poids, bilans biologiques, indicateurs de progression, questionnaires — le dossier complet en un coup d'œil.",
    color: "#2BA89C",
    accent: "rgba(43,168,156,0.08)",
    border: "rgba(43,168,156,0.15)",
  },
  {
    tag: "ADRESSAGE",
    title: "La bonne orientation.\nAu bon moment.",
    body: "Trouvez le confrère idéal en 3 clics. Lettre d'adressage générée automatiquement. Traçabilité complète.",
    color: "#5B4EC4",
    accent: "rgba(91,78,196,0.08)",
    border: "rgba(91,78,196,0.15)",
  },
  {
    tag: "BASE DE CONNAISSANCES",
    title: "22 308 fiches.\nTout le savoir organisé.",
    body: "Recommandations HAS, FFAB, ESPGHAN, DSM-5. Recherche sémantique pendant la consultation.",
    color: "#2BA89C",
    accent: "rgba(43,168,156,0.08)",
    border: "rgba(43,168,156,0.15)",
  },
];

export default function HomePage() {
  /* ── Navbar scroll + mobile menu ── */
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  /* ── Sticky problem/solution section ── */
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
  const c1 = useCounter(60000);
  const c2 = useCounter(10);
  const c3 = useCounter(131);
  const c4 = useCounter(2362);

  return (
    <>
      {/* ── CSS global ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,opsz,wght@0,6..18,300..800;1,6..18,300..800&display=swap');
        :root {
          --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --nami-primary: #5B4EC4;
          --nami-secondary: #2BA89C;
          --nami-white: #FAFAF8;
          --nami-bg-alt: #F5F3EF;
          --nami-dark: #1A1A2E;
          --nami-dark-2: #252540;
          --nami-text: #1A1A2E;
          --nami-text-2: #4A4A5A;
          --nami-text-3: #8A8A96;
        }
        * { box-sizing: border-box; }
        .nami-gradient-text {
          background: linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nami-gradient-text-dark {
          background: linear-gradient(135deg, #7B6FD4 0%, #45C4B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .float-slow { animation: floatSlow 9s ease-in-out infinite alternate; }
        @keyframes floatSlow { 0% { transform: translate(0,0); } 100% { transform: translate(30px,-24px); } }
        .pulse { animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .card-hover {
          transition: transform 0.3s var(--ease-expo), box-shadow 0.3s var(--ease-expo), border-color 0.3s;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(91,78,196,0.1);
          border-color: rgba(91,78,196,0.25) !important;
        }
        .btn-primary {
          transition: transform 0.2s var(--ease-expo), box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(91,78,196,0.35);
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-secondary {
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(91,78,196,0.06) !important;
          border-color: rgba(91,78,196,0.4) !important;
          color: #5B4EC4 !important;
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(10px); opacity: 0.15; }
        }
        .scroll-dot { animation: scrollBounce 2s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        .nav-enter { animation: fadeIn 0.6s var(--ease-expo) 0.1s both; }
        .hero-eyebrow { animation: fadeIn 0.7s var(--ease-expo) 0.3s both; }
        .hero-title { animation: fadeIn 0.9s var(--ease-expo) 0.5s both; }
        .hero-sub { animation: fadeIn 0.8s var(--ease-expo) 0.8s both; }
        .hero-cta { animation: fadeIn 0.8s var(--ease-expo) 1.0s both; }
        .hero-scroll { animation: fadeIn 0.8s var(--ease-expo) 1.4s both; }

        /* ─ Responsive ─ */
        @media (max-width: 767px) {
          .landing-nav-links, .landing-nav-auth { display: none !important; }
          .landing-nav-burger { display: flex !important; }
          .landing-sticky-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 0 20px !important; }
          .landing-sticky-right { display: none !important; }
          .landing-features-grid { grid-template-columns: 1fr !important; }
          .landing-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 28px !important; }
          .landing-steps-grid { grid-template-columns: 1fr !important; }
          .landing-specialties-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-security-grid { grid-template-columns: 1fr !important; }
          .landing-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .landing-footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
          .landing-cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .landing-cta-btns a { justify-content: center !important; }
          .landing-hero-cta { flex-direction: column !important; align-items: stretch !important; }
          .landing-hero-cta a { justify-content: center !important; }
        }
        @media (min-width: 768px) {
          .landing-nav-burger { display: none !important; }
          .landing-nav-mobile { display: none !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .landing-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-specialties-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", background: "var(--nami-white)", color: "var(--nami-text)" }}>

        {/* ═══ NAVBAR ═══════════════════════════════════════════════════════ */}
        <nav
          className="nav-enter"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            padding: scrolled ? "12px 24px" : "20px 24px",
            background: scrolled ? "rgba(250,250,248,0.88)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(26,26,46,0.08)" : "1px solid transparent",
            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/nami-mascot.png" alt="Nami" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "contain" }} />
              <span style={{ color: "var(--nami-text)", fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
            </div>
            {/* Desktop links */}
            <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {[
                { l: "Fonctionnalités", h: "#features" },
                { l: "Annuaire", h: "/trouver-un-soignant" },
                { l: "Blog", h: "/blog" },
              ].map(({ l, h }) => (
                <Link key={l} href={h}
                  style={{ color: "var(--nami-text-3)", fontSize: 14, fontWeight: 500, transition: "color 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--nami-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--nami-text-3)")}
                >{l}</Link>
              ))}
            </div>
            {/* Desktop auth */}
            <div className="landing-nav-auth" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/login"
                style={{ color: "var(--nami-text-2)", fontSize: 14, fontWeight: 500, transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--nami-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--nami-text-2)")}
              >Connexion</Link>
              <Link href="/signup" className="btn-primary"
                style={{ background: "var(--nami-primary)", color: "#fff", fontSize: 14, fontWeight: 600, padding: "9px 22px", borderRadius: 100, textDecoration: "none", boxShadow: "0 2px 10px rgba(91,78,196,0.25)" }}
              >Démarrer</Link>
            </div>
            {/* Burger — mobile only */}
            <button
              className="landing-nav-burger"
              onClick={() => setMobileMenuOpen(o => !o)}
              style={{ display: "none", background: "none", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 10, padding: "8px", cursor: "pointer", color: "var(--nami-text)", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 }}
              aria-label="Menu"
            >
              {mobileMenuOpen
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="landing-nav-mobile" style={{ position: "fixed", inset: 0, zIndex: 99 }}>
            <div onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.35)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", background: "#FAFAF8", padding: "80px 24px 32px", display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              {[{ l: "Fonctionnalités", h: "#features" }, { l: "Annuaire", h: "/trouver-un-soignant" }, { l: "Blog", h: "/blog" }].map(({ l, h }) => (
                <Link key={l} href={h} onClick={() => setMobileMenuOpen(false)}
                  style={{ display: "block", padding: "14px 16px", borderRadius: 12, fontSize: 16, fontWeight: 500, color: "var(--nami-text)", textDecoration: "none", minHeight: 44 }}
                >{l}</Link>
              ))}
              <div style={{ height: 1, background: "rgba(26,26,46,0.07)", margin: "8px 0" }} />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "14px 16px", borderRadius: 12, fontSize: 16, fontWeight: 500, color: "var(--nami-text-2)", textDecoration: "none", minHeight: 44 }}>Connexion</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 16px", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "#fff", background: "var(--nami-primary)", textDecoration: "none", boxShadow: "0 4px 16px rgba(91,78,196,0.30)", minHeight: 44 }}>Créer un compte →</Link>
            </div>
          </div>
        )}

        {/* ═══ HERO ════════════════════════════════════════════════════════ */}
        <section style={{
          minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center", padding: "140px 24px 100px",
          position: "relative", overflow: "hidden",
          background: "linear-gradient(180deg, #FAFAF8 0%, #F5F3EF 100%)",
        }}>
          {/* Ambient orbs */}
          <div className="float-slow" style={{ position: "absolute", top: "5%", left: "10%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,78,196,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(43,168,156,0.07) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", animation: "floatSlow 12s ease-in-out infinite alternate-reverse" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 840 }}>
            {/* Eyebrow */}
            <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(91,78,196,0.2)", background: "rgba(91,78,196,0.06)", marginBottom: 32 }}>
              <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B4EC4", display: "inline-block" }} />
              <span style={{ color: "#5B4EC4", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Coordination des parcours complexes</span>
            </div>

            {/* Headline */}
            <h1 className="hero-title" style={{ fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06, color: "var(--nami-text)", marginBottom: 28 }}>
              Le soin est fragmenté.<br />
              <span className="nami-gradient-text">Nami le coud.</span>
            </h1>

            {/* Sub */}
            <p className="hero-sub" style={{ fontSize: "clamp(1.05rem,1.8vw,1.3rem)", color: "var(--nami-text-2)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 44px" }}>
              Gabrielle a 10 ans, une anorexie, 3 soignants.
              Ils se coordonnent par SMS. 4 mois perdus.<br />
              <span style={{ color: "var(--nami-text)", fontWeight: 600 }}>Ce n'est pas un manque de compétence. C'est un défaut d'orchestration.</span>
            </p>

            {/* CTAs */}
            <div className="hero-cta landing-hero-cta" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--nami-primary)", color: "#fff", fontSize: 15, fontWeight: 700, padding: "15px 38px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 16px rgba(91,78,196,0.3)" }}
              >
                Accéder à Nami
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login" className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid rgba(91,78,196,0.2)", color: "var(--nami-text-2)", fontSize: 15, fontWeight: 500, padding: "15px 30px", borderRadius: 100, textDecoration: "none", background: "transparent" }}
              >Connexion soignant</Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll" style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--nami-text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll</span>
            <div className="scroll-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--nami-primary)" }} />
          </div>
        </section>

        {/* ═══ PROBLÈME / SOLUTION — sticky scroll ════════════════════════ */}
        {/* Dark contrast section — 1 of 2 */}
        <div ref={stickyRef} style={{ height: "320vh", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--nami-dark)" }}>
            <div className="landing-sticky-grid" style={{ maxWidth: 1100, width: "100%", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

              {/* Left — text panels */}
              <div style={{ position: "relative", minHeight: 280 }}>
                {[
                  {
                    tag: "LE PROBLÈME",
                    title: "Trois soignants.\nZéro coordination.",
                    body: "Le médecin ne sait pas ce que la diét a dit. La psychologue ignore les dernières analyses. Les parents font le lien entre tous. Par SMS.",
                    color: "#E06B6B",
                  },
                  {
                    tag: "LA CONSÉQUENCE",
                    title: "4 mois perdus.\nUn patient épuisé.",
                    body: "Chaque consultation repart de zéro. Les informations se perdent. Le patient — ou ses parents — devient coordinateur de son propre parcours.",
                    color: "#E69342",
                  },
                  {
                    tag: "LA SOLUTION",
                    title: "Nami transfère\ncette charge.",
                    body: "Du patient vers les soignants. Un dossier partagé. Une activité du dossier commune. Une décision collective en quelques clics.",
                    color: "#7B6FD4",
                  },
                ].map((p, i) => (
                  <div
                    key={i}
                    style={{
                      position: i === 0 ? "relative" : "absolute",
                      top: 0, left: 0, right: 0,
                      opacity: panel === i ? 1 : 0,
                      transform: panel === i ? "none" : panel > i ? "translateY(-20px)" : "translateY(20px)",
                      transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                      pointerEvents: panel === i ? "auto" : "none",
                    }}
                  >
                    <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: p.color, textTransform: "uppercase", marginBottom: 20, padding: "5px 14px", border: `1px solid ${p.color}40`, borderRadius: 100, background: `${p.color}12` }}>{p.tag}</div>
                    <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#EEECEA", marginBottom: 20, whiteSpace: "pre-line" }}>{p.title}</h2>
                    <p style={{ fontSize: "1.05rem", color: "rgba(238,236,234,0.55)", lineHeight: 1.7, maxWidth: 420 }}>{p.body}</p>
                  </div>
                ))}
              </div>

              {/* Right — progress + visual card */}
              <div className="landing-sticky-right" style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 3, height: panel === i ? 44 : 22, borderRadius: 2, background: panel === i ? "#7B6FD4" : "rgba(238,236,234,0.12)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
                  ))}
                </div>

                {panel === 0 && (
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 32 }}>
                    <p style={{ color: "rgba(238,236,234,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Canal de coordination actuel</p>
                    {[
                      "SMS 🩺 Médecin → Dr Suela : « bilan reçu ? »",
                      "Email Dr Suela → parents : « dernier poids ? »",
                      "SMS Parents → Psy : « on refait le point ? »",
                      "Email Psy → tous : réunion annulée 😔",
                    ].map((msg, i) => (
                      <div key={i} style={{ padding: "11px 14px", borderRadius: 10, background: i < 3 ? "rgba(255,255,255,0.03)" : "rgba(224,107,107,0.08)", marginBottom: 8, fontSize: 13, color: i < 3 ? "rgba(238,236,234,0.55)" : "#E06B6B", border: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(224,107,107,0.2)" }}>
                        {msg}
                      </div>
                    ))}
                    <div style={{ marginTop: 14, padding: "9px 14px", borderRadius: 10, background: "rgba(224,107,107,0.08)", border: "1px solid rgba(224,107,107,0.2)", fontSize: 12, color: "#E06B6B", textAlign: "center", fontWeight: 600 }}>
                      4 mois de délai · 0 décision commune
                    </div>
                  </div>
                )}
                {panel === 1 && (
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 32 }}>
                    <p style={{ color: "rgba(238,236,234,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Ce que chaque soignant ignore</p>
                    {[
                      { who: "👩‍⚕️ Médecin", missing: "N'a pas vu la séance psy de lundi" },
                      { who: "🥗 Diét", missing: "Ne sait pas que le poids a évolué de 2 kg" },
                      { who: "🧠 Psychologue", missing: "Ignore les nouveaux bilans biologiques" },
                      { who: "👨‍👩‍👧 Parents", missing: "Répètent la même histoire à chaque RDV" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ fontSize: 14, opacity: 0.8, whiteSpace: "nowrap" }}>{item.who}</span>
                        <span style={{ fontSize: 13, color: "#E69342", flex: 1 }}>← {item.missing}</span>
                      </div>
                    ))}
                  </div>
                )}
                {panel === 2 && (
                  <div style={{ background: "rgba(91,78,196,0.1)", borderRadius: 24, border: "1px solid rgba(91,78,196,0.25)", padding: 32 }}>
                    <p style={{ color: "#7B6FD4", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Avec Nami</p>
                    {[
                      "Dossier partagé — tout le monde voit tout",
                      "Activité du dossier centralisée",
                      "RCP virtuelle en 2 clics",
                      "Parents informés, pas coordinateurs",
                    ].map((text, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(91,78,196,0.12)" : "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(91,78,196,0.2)"/><path d="M8 12l3 3 5-5" stroke="#7B6FD4" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span style={{ fontSize: 14, color: "rgba(238,236,234,0.8)" }}>{text}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 18, padding: "10px 14px", borderRadius: 10, background: "rgba(91,78,196,0.15)", border: "1px solid rgba(91,78,196,0.3)", fontSize: 13, color: "#7B6FD4", textAlign: "center", fontWeight: 700 }}>
                      Décision collective en 1 session
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FEATURES BENTO ═════════════════════════════════════════════ */}
        <section id="features" style={{ padding: "130px 24px", background: "var(--nami-bg-alt)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 100, background: "rgba(91,78,196,0.06)" }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--nami-text)" }}>
              Tout ce dont une équipe<br />
              <span className="nami-gradient-text">pluridisciplinaire a besoin.</span>
            </h2>
          </Reveal>

          <div className="landing-features-grid" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.tag} delay={i * 80} from="scale">
                <div className="card-hover" style={{ background: "#fff", borderRadius: 22, border: `1px solid ${f.border}`, padding: "36px 32px", height: "100%", cursor: "default", boxShadow: "0 1px 4px rgba(26,26,46,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: f.color, textTransform: "uppercase", padding: "4px 12px", border: `1px solid ${f.border}`, borderRadius: 100, background: f.accent }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.18, color: "var(--nami-text)", marginBottom: 14, whiteSpace: "pre-line" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--nami-text-2)", lineHeight: 1.7 }}>{f.body}</p>
                  <div style={{ marginTop: 26, width: 36, height: 3, borderRadius: 2, background: f.color, opacity: 0.5 }} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ STATS ═══════════════════════════════════════════════════════ */}
        <section style={{ padding: "110px 24px", background: "var(--nami-white)", borderTop: "1px solid rgba(26,26,46,0.06)", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
          <Reveal>
            <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-text-3)", textTransform: "uppercase", marginBottom: 60 }}>Infrastructure de coordination réelle — pas des mocks</p>
          </Reveal>
          <div className="landing-stats-grid" style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, textAlign: "center" }}>
            {[
              { ref: c1, suffix: "+", label: "Sources cliniques\nindexées", color: "var(--nami-primary)" },
              { ref: c2, suffix: "", label: "Référentiels\ninternationaux", color: "var(--nami-secondary)" },
              { ref: c3, suffix: "", label: "Parcours de\nsoin structurés", color: "var(--nami-primary)" },
              { ref: c4, suffix: "", label: "Étapes de\nparcours sourcées", color: "var(--nami-secondary)" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.04em", color: s.color, lineHeight: 1 }}>
                  <span ref={s.ref}>0</span>{s.suffix}
                </div>
                <p style={{ fontSize: 12, color: "var(--nami-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "pre-line", lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ COMMENT ÇA MARCHE ═══════════════════════════════════════════ */}
        <section style={{ padding: "120px 24px", background: "var(--nami-bg-alt)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-secondary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(43,168,156,0.2)", borderRadius: 100, background: "rgba(43,168,156,0.06)" }}>EN PRATIQUE</div>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--nami-text)" }}>
              Trois étapes.<br />
              <span className="nami-gradient-text">Une équipe coordonnée.</span>
            </h2>
          </Reveal>
          <div className="landing-steps-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { n: "01", tag: "INVITEZ", title: "Constituez l'équipe", body: "Ajoutez vos confrères et votre patient au dossier de coordination. Chaque rôle voit ce qui le concerne." },
              { n: "02", tag: "DOCUMENTEZ", title: "Centralisez tout", body: "Dictez, l'IA structure le brouillon. Partagez bilans et comptes-rendus. Tout est en un seul endroit." },
              { n: "03", tag: "COORDONNEZ", title: "Avancez ensemble", body: "Chaque soignant voit ce que les autres ont fait. Le parcours progresse. Le patient n'est plus coordinateur." },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100} from="bottom">
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(26,26,46,0.06)", padding: "32px 28px", position: "relative", boxShadow: "0 1px 4px rgba(26,26,46,0.05)" }}>
                  <div style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.05em", color: "rgba(91,78,196,0.07)", lineHeight: 1, marginBottom: 16 }}>{step.n}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 12 }}>{step.tag}</div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--nami-text)", marginBottom: 10, letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--nami-text-2)", lineHeight: 1.7 }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ QUOTE — Margot ═══════════════════════════════════════════════ */}
        <section style={{ padding: "140px 24px", background: "var(--nami-white)" }}>
          <Reveal>
            <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#5B4EC4,#2BA89C)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 22, fontWeight: 900, color: "#fff" }}>M</div>
              <blockquote style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.45, color: "var(--nami-text)", marginBottom: 32, fontStyle: "normal" }}>
                <span className="nami-gradient-text">"J'ai vécu le problème en première personne.</span>
                <br />
                <span>Alors j'ai construit l'outil que j'aurais voulu avoir."</span>
              </blockquote>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--nami-text)" }}>Margot Vire</p>
                <p style={{ fontSize: 13, color: "var(--nami-text-3)", marginTop: 4 }}>Diététicienne TCA · Fondatrice de Nami · AP-HP</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ SPÉCIALITÉS ═════════════════════════════════════════════════ */}
        <section style={{ padding: "110px 24px", background: "var(--nami-bg-alt)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 100, background: "rgba(91,78,196,0.06)" }}>CONÇU POUR</div>
            <h2 style={{ fontSize: "clamp(1.9rem,4.5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--nami-text)" }}>
              Les pathologies qui<br />
              <span className="nami-gradient-text">demandent une équipe.</span>
            </h2>
          </Reveal>
          <div className="landing-specialties-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { icon: "🌱", label: "TCA", sub: "Anorexie · Boulimie · ARFID · BED" },
              { icon: "⚖️", label: "Obésité", sub: "Pédiatrique · Grade II/III · PCR" },
              { icon: "👶", label: "Pédiatrie", sub: "Cassure de courbe · Crohn · APLV" },
              { icon: "🧠", label: "Santé mentale", sub: "TSA · TDAH · Anxiété alimentaire" },
              { icon: "🩺", label: "Maladies chroniques", sub: "MICI · Diabète · Pathologies rares" },
              { icon: "💊", label: "Post-traitement", sub: "Réhabilitation · Suivi à long terme" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 55} from="scale">
                <div
                  style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(26,26,46,0.06)", padding: "26px 22px", cursor: "default", transition: "all 0.25s", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(91,78,196,0.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(91,78,196,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(26,26,46,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.06)"; }}
                >
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--nami-text)", marginBottom: 5 }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: "var(--nami-text-3)" }}>{s.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ SÉCURITÉ ═════════════════════════════════════════════════════ */}
        <section style={{ padding: "100px 24px", background: "var(--nami-white)" }}>
          <Reveal>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 100, background: "rgba(91,78,196,0.06)" }}>VOS DONNÉES</div>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--nami-text)", marginBottom: 48 }}>
                Construits pour la conformité<br />
                <span className="nami-gradient-text">dès le jour 1.</span>
              </h2>
              <div className="landing-security-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, textAlign: "left" }}>
                {[
                  { icon: "🇪🇺", label: "Hébergement en Europe", sub: "Migration HDS en cours" },
                  { icon: "🔒", label: "Chiffrement bout en bout", sub: "Données en transit et au repos" },
                  { icon: "🤖", label: "IA — brouillon uniquement", sub: "Validation humaine obligatoire" },
                  { icon: "👥", label: "Secret professionnel", sub: "Architecture dédiée aux soignants" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "20px", background: "var(--nami-bg-alt)", borderRadius: 14, border: "1px solid rgba(26,26,46,0.05)" }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--nami-text)", marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--nami-text-3)" }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ CTA FINAL — dark contrast section 2 of 2 ═══════════════════ */}
        <section style={{ padding: "160px 24px", background: "var(--nami-dark)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,78,196,0.18) 0%, transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />
          <Reveal>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(2.4rem,6vw,4.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.07, color: "#EEECEA", marginBottom: 22 }}>
                Prêt à orchestrer<br />
                <span className="nami-gradient-text-dark">le parcours ?</span>
              </h2>
              <p style={{ fontSize: "1.15rem", color: "rgba(238,236,234,0.5)", marginBottom: 44, lineHeight: 1.65 }}>
                Rejoignez les premiers soignants sur Nami.<br />Accès gratuit. Aucune carte de crédit.
              </p>
              <div className="landing-cta-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/signup" className="btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--nami-primary)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "17px 44px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 24px rgba(91,78,196,0.4)" }}
                >
                  Créer un compte gratuit
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/trouver-un-soignant"
                  style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(238,236,234,0.15)", color: "rgba(238,236,234,0.55)", fontSize: 15, fontWeight: 500, padding: "17px 32px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s", background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#EEECEA"; e.currentTarget.style.borderColor = "rgba(238,236,234,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(238,236,234,0.55)"; e.currentTarget.style.borderColor = "rgba(238,236,234,0.15)"; }}
                >Annuaire des soignants</Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 24px 36px", background: "var(--nami-dark-2)" }}>
          <div className="landing-footer-grid" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 44, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src="/nami-mascot.png" alt="Nami" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "contain" }} />
                <span style={{ color: "#EEECEA", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
              </div>
              <p style={{ color: "rgba(238,236,234,0.35)", fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
                Le système nerveux des parcours de soins complexes. Coordination, visibilité, passage de relais.
              </p>
            </div>
            {[
              { title: "Produit", links: [{ l: "Fonctionnalités", h: "#features" }, { l: "Connexion", h: "/login" }, { l: "Créer un compte", h: "/signup" }] },
              { title: "Ressources", links: [{ l: "Annuaire", h: "/trouver-un-soignant" }, { l: "Pathologies", h: "/pathologies" }, { l: "Blog", h: "/blog" }] },
              { title: "Légal", links: [{ l: "CGU", h: "/cgu" }, { l: "Confidentialité", h: "/confidentialite" }, { l: "Mentions légales", h: "/mentions-legales" }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(238,236,234,0.2)", marginBottom: 18 }}>{col.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {col.links.map(({ l, h }) => (
                    <Link key={l} href={h}
                      style={{ fontSize: 13, color: "rgba(238,236,234,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(238,236,234,0.8)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(238,236,234,0.4)")}
                    >{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="landing-footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(238,236,234,0.2)" }}>© 2026 Nami — Margot Vire</span>
            <span style={{ fontSize: 12, color: "rgba(238,236,234,0.15)" }}>Coordination des parcours de soins complexes</span>
          </div>
        </footer>

      </div>
    </>
  );
}
