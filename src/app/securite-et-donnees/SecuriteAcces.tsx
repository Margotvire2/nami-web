import { ACCES_CLAIMS } from "./securite-data"

export function SecuriteAcces() {
  return (
    <section
      id="acces"
      style={{
        padding: "72px 24px",
        background: "#F5F3EF",
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
            02 — Accès
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
            Qui peut voir vos données ?
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#374151", margin: 0 }}>
            Par défaut, vos données restent privées. Voici la liste des personnes
            et services qui peuvent y accéder, et dans quelles conditions.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ACCES_CLAIMS.map((claim, idx) => (
            <article
              key={claim.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8ECF4",
                borderRadius: 12,
                padding: "22px 24px",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 18,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#EEEDFB",
                  color: "#5B4EC4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                  flexShrink: 0,
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 16,
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
                    lineHeight: 1.6,
                    color: "#374151",
                    margin: 0,
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
                      margin: "10px 0 0",
                      fontWeight: 500,
                      fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                    }}
                  >
                    Source : {claim.source}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: "18px 22px",
            background: "#FFFFFF",
            border: "1px solid #E8ECF4",
            borderLeft: "3px solid #5B4EC4",
            borderRadius: 8,
            maxWidth: 760,
          }}
        >
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "#1A1A2E",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Vos données ne sont jamais revendues, partagées à des fins publicitaires
            ou exploitées pour entraîner des modèles d&apos;IA.
          </p>
        </div>
      </div>
    </section>
  )
}
