import Link from "next/link"
import { DROITS_RGPD } from "./securite-data"

export function SecuriteVosDroitsRGPD() {
  return (
    <section
      id="vos-droits"
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
            04 — Vos droits
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
            Vos droits sur vos données
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#374151", margin: 0 }}>
            Le RGPD vous confère des droits précis sur vos données personnelles.
            Voici comment les exercer chez Nami.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {DROITS_RGPD.map((d) => (
            <article
              key={d.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8ECF4",
                borderRadius: 12,
                padding: "20px 20px 18px",
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  margin: "0 0 6px",
                  lineHeight: 1.3,
                }}
              >
                {d.title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "#374151",
                  margin: 0,
                  fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                }}
              >
                {d.description}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8ECF4",
            borderRadius: 12,
            padding: "22px 24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A1A2E",
                margin: "0 0 6px",
              }}
            >
              Comment exercer ces droits
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: "#374151",
                margin: 0,
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              Adressez votre demande à notre référent protection des données :{" "}
              <a
                href="mailto:dpo@namipourlavie.com"
                style={{ color: "#5B4EC4", textDecoration: "underline", fontWeight: 600 }}
              >
                dpo@namipourlavie.com
              </a>
              . Vous pouvez aussi consulter notre politique de confidentialité pour le détail
              des procédures.
            </p>
          </div>
          <Link
            href="/confidentialite"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 999,
              background: "#5B4EC4",
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            Lire la politique de confidentialité
          </Link>
        </div>
      </div>
    </section>
  )
}
