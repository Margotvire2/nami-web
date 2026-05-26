import { HEBERGEMENT_CLAIMS } from "./securite-data"

export function SecuriteHebergement() {
  return (
    <section
      id="hebergement"
      style={{
        padding: "72px 24px",
        background: "#FAFAF8",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 36 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#5B4EC4",
              marginBottom: 12,
            }}
          >
            01 — Hébergement
          </p>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              fontWeight: 700,
              color: "#1A1A2E",
              letterSpacing: "-0.02em",
              margin: "0 0 14px",
            }}
          >
            Où sont vos données ?
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#374151", margin: 0 }}>
            La localisation de vos données et la manière dont elles sont chiffrées
            sont des choix techniques que nous documentons précisément.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {HEBERGEMENT_CLAIMS.map((claim) => (
            <article
              key={claim.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8ECF4",
                borderRadius: 12,
                padding: "22px 22px 20px",
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  margin: "0 0 8px",
                  lineHeight: 1.3,
                }}
              >
                {claim.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#374151",
                  margin: "0 0 12px",
                  fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                }}
              >
                {claim.description}
              </p>
              {claim.source && (
                <p
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    margin: 0,
                    fontWeight: 500,
                    fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                  }}
                >
                  Source : {claim.source}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
