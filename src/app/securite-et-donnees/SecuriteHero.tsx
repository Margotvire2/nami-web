import Link from "next/link"

export function SecuriteHero() {
  return (
    <section
      style={{
        padding: "80px 24px 56px",
        background: "linear-gradient(180deg, #F5F3EF 0%, #FAFAF8 100%)",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 18,
          }}
        >
          Sécurité &amp; protection des données
        </p>

        <h1
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            fontWeight: 800,
            color: "#1A1A2E",
            letterSpacing: "-0.02em",
            margin: "0 0 20px",
          }}
        >
          Vos données de santé méritent une protection sérieuse
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: "#374151",
            maxWidth: 640,
            margin: "0 auto 28px",
          }}
        >
          Nami est conçu pour la coordination des soins. La protection de votre dossier
          est un prérequis, pas une option. Voici, en clair, ce que nous faisons
          pour protéger vos données.
        </p>

        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              background: "#FFFFFF",
              border: "1px solid #E8ECF4",
              fontSize: 13,
              color: "#1A1A2E",
              fontWeight: 600,
            }}
          >
            Conforme RGPD
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              background: "#FFFFFF",
              border: "1px solid #E8ECF4",
              fontSize: 13,
              color: "#1A1A2E",
              fontWeight: 600,
            }}
          >
            Données de santé hébergées HDS
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              background: "#FFFFFF",
              border: "1px solid #E8ECF4",
              fontSize: 13,
              color: "#1A1A2E",
              fontWeight: 600,
            }}
          >
            Hébergement France (eu-west-3)
          </span>
        </div>

        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 24 }}>
          Pour les détails juridiques complets, consultez notre{" "}
          <Link
            href="/confidentialite"
            style={{ color: "#5B4EC4", textDecoration: "underline", fontWeight: 600 }}
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
