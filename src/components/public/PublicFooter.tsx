"use client";

import Link from "next/link";

const FOOTER_COLS = [
  {
    title: "Produit",
    links: [
      { l: "Fonctionnalités", h: "/#features" },
      { l: "Connexion", h: "/login" },
      { l: "Créer un compte", h: "/signup" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { l: "Annuaire", h: "/trouver-un-soignant" },
      { l: "Pathologies", h: "/pathologies" },
      { l: "Blog", h: "/blog" },
    ],
  },
  {
    title: "Légal",
    links: [
      { l: "CGU", h: "/cgu" },
      { l: "Confidentialité", h: "/confidentialite" },
      { l: "Mentions légales", h: "/mentions-legales" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer
      style={{
        background: "#1A1A2E",
        padding: "56px 24px 32px",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Grid */}
        <div
          className="footer-grid"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 44, marginBottom: 44 }}
        >
          {/* Brand column */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 14 }}>
              <img src="/nami-mascot.png" alt="Nami" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
              <span style={{ color: "#EEECEA", fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
            </Link>
            <p style={{ color: "rgba(238,236,234,0.35)", fontSize: 13, lineHeight: 1.7, maxWidth: 230 }}>
              Le système nerveux des parcours de soins complexes. Coordination, visibilité, passage de relais.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(238,236,234,0.2)", marginBottom: 16 }}>{col.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(({ l, h }) => (
                  <Link key={l} href={h}
                    style={{ fontSize: 13, color: "rgba(238,236,234,0.4)", textDecoration: "none" }}
                    onMouseOver={e => (e.currentTarget.style.color = "rgba(238,236,234,0.8)")}
                    onMouseOut={e => (e.currentTarget.style.color = "rgba(238,236,234,0.4)")}
                  >{l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            className="footer-bottom-bar"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span style={{ fontSize: 12, color: "rgba(238,236,234,0.2)" }}>© 2026 Nami — Margot Vire</span>
            <span style={{ fontSize: 12, color: "rgba(238,236,234,0.15)" }}>Coordination des parcours de soins complexes</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(238,236,234,0.15)", textAlign: "center" }}>
            Nami n&apos;est pas un dispositif médical. Aucune information fournie ne constitue un avis médical. En cas d&apos;urgence, appelez le 15 ou le 112.
          </p>
        </div>
      </div>
    </footer>
  );
}
