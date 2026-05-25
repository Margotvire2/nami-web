"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/fonctionnalites" },
  { label: "Pathologies", href: "/pathologies" },
  { label: "Annuaire", href: "/trouver-un-soignant" },
  { label: "Blog", href: "/blog" },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Échap pour fermer le drawer mobile (pas d'API call ici — pas besoin d'intercepter)
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // CTAs contextuels selon le pathname (patient acquisition vs soignant/corporate).
  // - /patient* est dormant jusqu'au merge de PR #56 (acceptable comportement, fallback safe).
  // - /trouver-un-soignant existe déjà → active dès merge de cette PR.
  const isPatientContext =
    (pathname?.startsWith("/patient") ?? false) ||
    (pathname?.startsWith("/trouver-un-soignant") ?? false);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-auth  { display: none !important; }
          .nav-burger        { display: flex !important; }
        }
        @media (min-width: 768px) {
          .nav-burger        { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
        /* A11y — focus visible ring (styles inline empêchent classes Tailwind directes,
           on injecte donc le :focus-visible ici. Hex hardcodé car composant n'utilise
           pas var(--nami-primary) ailleurs → fallback safe avant PR #40 mergée). */
        .public-navbar a:focus-visible,
        .public-navbar button:focus-visible {
          outline: 2px solid #5B4EC4;
          outline-offset: 2px;
          border-radius: 4px;
        }
        /* Skip-to-content : visible only on focus (a11y standard) */
        .public-navbar-skip {
          position: absolute;
          top: -100px;
          left: 8px;
          padding: 8px 16px;
          background: #5B4EC4;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          z-index: 200;
          transition: top 0.15s;
        }
        .public-navbar-skip:focus {
          top: 8px;
        }
      `}</style>

      {/* Skip-to-content link — a11y (visible only on keyboard focus) */}
      <a href="#main" className="public-navbar-skip">
        Aller au contenu principal
      </a>

      <nav
        className="public-navbar"
        aria-label="Navigation principale"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: scrolled ? "12px 20px" : "18px 24px",
          background: scrolled ? "rgba(250,250,248,0.95)" : "rgba(250,250,248,0.7)",
          backdropFilter: "blur(16px)",
          borderBottom: scrolled ? "1px solid rgba(26,26,46,0.08)" : "1px solid transparent",
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/nami-mascot.png" alt="Nami" style={{ width: 32, height: 32, borderRadius: 9, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ color: "#1A1A2E", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href || (href !== "/" && pathname?.startsWith(href.split("#")[0]));
              return (
                <Link key={label} href={href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    color: active ? "#5B4EC4" : "#6B7280",
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#1A1A2E"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#6B7280"; }}
                >{label}</Link>
              );
            })}
          </div>

          {/* Desktop auth — CTAs contextuels patient vs soignant/corporate */}
          <div className="nav-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isPatientContext ? (
              <>
                <Link href="/login?role=patient"
                  style={{ color: "#374151", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px", borderRadius: 100, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#5B4EC4"; e.currentTarget.style.background = "rgba(91,78,196,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; }}
                >Se connecter</Link>
                <Link href="/trouver-un-soignant"
                  style={{ background: "#5B4EC4", color: "#fff", fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 100, textDecoration: "none", boxShadow: "0 2px 8px rgba(91,78,196,0.25)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#4A3EA6"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(91,78,196,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#5B4EC4"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(91,78,196,0.25)"; }}
                >Trouver un soignant</Link>
              </>
            ) : (
              <>
                <Link href="/login"
                  style={{ color: "#374151", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px", borderRadius: 100, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#5B4EC4"; e.currentTarget.style.background = "rgba(91,78,196,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; }}
                >Connexion</Link>
                <Link href="/demander-une-demo"
                  style={{ background: "#5B4EC4", color: "#fff", fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 100, textDecoration: "none", boxShadow: "0 2px 8px rgba(91,78,196,0.25)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#4A3EA6"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(91,78,196,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#5B4EC4"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(91,78,196,0.25)"; }}
                >Demander une démo</Link>
              </>
            )}
          </div>

          {/* Burger button — mobile only */}
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu-drawer"
            style={{
              display: "none", // overridden by CSS on mobile
              background: "none",
              border: "1px solid rgba(26,26,46,0.10)",
              borderRadius: 10,
              padding: "8px",
              cursor: "pointer",
              color: "#1A1A2E",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 44,
              minHeight: 44,
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu mobile"
        aria-hidden={!menuOpen}
        className="nav-mobile-drawer"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.35)", backdropFilter: "blur(4px)" }}
        />

        {/* Drawer panel */}
        <div style={{
          position: "relative",
          background: "#FAFAF8",
          padding: "80px 24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          boxShadow: "0 8px 40px rgba(26,26,46,0.15)",
          animation: "drawerIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        }}>
          <style>{`
            @keyframes drawerIn {
              from { transform: translateY(-16px); opacity: 0; }
              to   { transform: translateY(0);     opacity: 1; }
            }
          `}</style>

          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href || (href !== "/" && pathname?.startsWith(href.split("#")[0]));
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#5B4EC4" : "#1A1A2E",
                  textDecoration: "none",
                  background: active ? "rgba(91,78,196,0.06)" : "transparent",
                  minHeight: 44,
                  lineHeight: "16px",
                }}
              >
                {label}
              </Link>
            );
          })}

          <div style={{ height: 1, background: "rgba(26,26,46,0.07)", margin: "8px 0" }} />

          {/* CTAs mobile contextuels — miroir du desktop */}
          {isPatientContext ? (
            <>
              <Link
                href="/login?role=patient"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#374151",
                  textDecoration: "none",
                  minHeight: 44,
                }}
              >
                Se connecter
              </Link>
              <Link
                href="/trouver-un-soignant"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#5B4EC4",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(91,78,196,0.30)",
                  minHeight: 44,
                }}
              >
                Trouver un soignant →
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#374151",
                  textDecoration: "none",
                  minHeight: 44,
                }}
              >
                Connexion
              </Link>
              <Link
                href="/demander-une-demo"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#5B4EC4",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(91,78,196,0.30)",
                  minHeight: 44,
                }}
              >
                Demander une démo →
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
