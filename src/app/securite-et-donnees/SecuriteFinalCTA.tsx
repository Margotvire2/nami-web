import Link from "next/link"

export function SecuriteFinalCTA() {
  return (
    <section
      style={{
        padding: "80px 24px 88px",
        background: "linear-gradient(180deg, #FAFAF8 0%, #F5F3EF 100%)",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 700,
            color: "#1A1A2E",
            letterSpacing: "-0.02em",
            margin: "0 0 14px",
            lineHeight: 1.2,
          }}
        >
          Prêt·e à utiliser Nami en confiance ?
        </h2>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "#374151",
            margin: "0 auto 28px",
            maxWidth: 560,
          }}
        >
          Créez votre compte ou explorez l&apos;annuaire des soignants disponibles
          sur Nami.
        </p>

        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <Link
            href="/signup?role=patient"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 22px",
              borderRadius: 999,
              background: "#5B4EC4",
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Créer un compte
          </Link>
          <Link
            href="/trouver-un-soignant"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 22px",
              borderRadius: 999,
              background: "#FFFFFF",
              color: "#1A1A2E",
              border: "1px solid #E8ECF4",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Trouver un soignant
          </Link>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#6B7280",
            margin: 0,
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          }}
        >
          Outil de coordination des parcours de soins · Nami n&apos;est pas un dispositif médical · Conforme RGPD
        </p>
      </div>
    </section>
  )
}
