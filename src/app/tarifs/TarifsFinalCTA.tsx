import Link from "next/link"

export function TarifsFinalCTA() {
  return (
    <section
      aria-labelledby="tarifs-final-cta-title"
      style={{
        background: "#FAFAF8",
        padding: "80px clamp(24px, 5vw, 80px) 96px",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <h2
          id="tarifs-final-cta-title"
          style={{
            fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#1A1A2E",
            margin: "0 0 16px",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Une question sur nos tarifs ?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#374151",
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          Notre équipe répond aux soignants libéraux et aux structures. Échange préalable avant toute souscription.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <Link
            href="/demander-une-demo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              background: "#5B4EC4",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 999,
              transition: "background 0.2s, transform 0.2s",
            }}
            className="tarifs-cta-primary"
          >
            Demander une démo
          </Link>
          <Link
            href="/demander-une-demo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              background: "#FFFFFF",
              color: "#5B4EC4",
              border: "1px solid #5B4EC4",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 999,
              transition: "background 0.2s, transform 0.2s",
            }}
            className="tarifs-cta-secondary"
          >
            Nous contacter
          </Link>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#6B7280",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Plateforme de coordination des parcours de soins · Conforme RGPD
        </p>
      </div>

      <style>{`
        .tarifs-cta-secondary:hover {
          background: #EEEDFB !important;
          transform: translateY(-1px);
        }
        .tarifs-cta-secondary:focus-visible {
          outline: 2px solid #5B4EC4;
          outline-offset: 3px;
        }
      `}</style>
    </section>
  )
}
