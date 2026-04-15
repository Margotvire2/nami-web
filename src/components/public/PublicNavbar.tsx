"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/#features" },
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
      `}</style>

      <nav
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
                  style={{
                    color: active ? "#5B4EC4" : "#8A8A96",
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#1A1A2E"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#8A8A96"; }}
                >{label}</Link>
              );
            })}
          </div>

          {/* Desktop auth */}
          <div className="nav-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login"
              style={{ color: "#4A4A5A", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px", borderRadius: 100, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#5B4EC4"; e.currentTarget.style.background = "rgba(91,78,196,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#4A4A5A"; e.currentTarget.style.background = "transparent"; }}
            >Connexion</Link>
            <Link href="/signup"
              style={{ background: "#5B4EC4", color: "#fff", fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 100, textDecoration: "none", boxShadow: "0 2px 8px rgba(91,78,196,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#4A3EA6"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(91,78,196,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#5B4EC4"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(91,78,196,0.25)"; }}
            >Démarrer</Link>
          </div>

          {/* Burger button — mobile only */}
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
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

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block",
              padding: "14px 16px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 500,
              color: "#4A4A5A",
              textDecoration: "none",
              minHeight: 44,
            }}
          >
            Connexion
          </Link>
          <Link
            href="/signup"
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
            Créer un compte →
          </Link>
        </div>
      </div>
    </>
  );
}
