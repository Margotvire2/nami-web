"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function HomeNav() {
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

  return (
    <>
      <nav
        className="nav-enter"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: scrolled ? "12px 24px" : "20px 24px",
          background: scrolled ? "rgba(250,250,248,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(26,26,46,0.08)" : "1px solid transparent",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/nami-mascot.png" alt="Nami" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "contain" }} />
            <span style={{ color: "var(--nami-text)", fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
          </div>
          <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[
              { l: "Fonctionnalités", h: "#features" },
              { l: "Annuaire", h: "/trouver-un-soignant" },
              { l: "Blog", h: "/blog" },
            ].map(({ l, h }) => (
              <Link key={l} href={h} className="nav-link"
                style={{ color: "var(--nami-text-3)", fontSize: 14, fontWeight: 500, transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--nami-text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--nami-text-3)")}
              >{l}</Link>
            ))}
          </div>
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
          <button
            className="landing-nav-burger"
            onClick={() => setMobileMenuOpen(o => !o)}
            style={{ display: "none", background: "none", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 10, padding: "8px", cursor: "pointer", color: "var(--nami-text)", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 }}
            aria-label="Menu"
          >
            {mobileMenuOpen
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="landing-nav-mobile" style={{ position: "fixed", inset: 0, zIndex: 99, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.35)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#FAFAF8", padding: "80px 24px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
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
    </>
  );
}
