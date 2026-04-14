"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/landing-page#features" },
  { label: "Pathologies", href: "/pathologies" },
  { label: "Annuaire", href: "/trouver-un-soignant" },
  { label: "Blog", href: "/blog" },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? "12px 24px" : "18px 24px",
        background: scrolled ? "rgba(250,250,248,0.92)" : "rgba(250,250,248,0.7)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(26,26,46,0.08)" : "1px solid transparent",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/landing-page" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#5B4EC4,#2BA89C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>N</span>
          </div>
          <span style={{ color: "#1A1A2E", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
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

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
      </div>
    </nav>
  );
}
