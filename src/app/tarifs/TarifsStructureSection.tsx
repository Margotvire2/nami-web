import Link from "next/link"
import { STRUCTURE_TIER, CPTS_FORFAITS } from "./tarifs-data"

export function TarifsStructureSection() {
  const tier = STRUCTURE_TIER
  return (
    <section
      id="structure"
      aria-labelledby="tarifs-structure-title"
      style={{
        background: "#FAFAF8",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#5B4EC4",
              marginBottom: 12,
            }}
          >
            Pour les structures
          </div>
          <h2
            id="tarifs-structure-title"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#1A1A2E",
              margin: "0 0 12px",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            CPTS, MSP, hôpital, mutuelle, réseau ville-hôpital
          </h2>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.6, margin: 0 }}>
            {tier.description}
          </p>
        </div>

        <article
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8ECF4",
            borderRadius: 16,
            padding: "36px clamp(24px, 4vw, 44px)",
            boxShadow: "0 1px 2px rgba(26,26,46,0.04)",
            marginBottom: 28,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#5B4EC4",
              margin: "0 0 14px",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            {tier.tierName}
          </h3>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {tier.price}
            </span>
            {tier.priceUnit && (
              <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
                {tier.priceUnit}
              </span>
            )}
          </div>

          <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 24px" }}>
            Tarification adaptée selon le nombre d'utilisateurs, le périmètre fonctionnel et les besoins d'intégration (SSO, FHIR, etc.).
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 10,
            }}
          >
            {tier.features.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 14,
                  color: "#1A1A2E",
                  lineHeight: 1.5,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#EEEDFB",
                    color: "#5B4EC4",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 1,
                  }}
                >
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "center" }}>
            <Link
              href={tier.cta.href}
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
              {tier.cta.label}
            </Link>
          </div>

          {tier.caveat && (
            <p
              style={{
                marginTop: 22,
                fontSize: 12,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {tier.caveat}
            </p>
          )}
        </article>

        {/* Forfait CPTS - section secondaire */}
        <details
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8ECF4",
            borderRadius: 12,
            padding: "20px 24px",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              color: "#1A1A2E",
              listStyle: "none",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            Forfait dédié CPTS (modèle indicatif)
          </summary>
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 14px" }}>
              Les CPTS bénéficient d'une tarification forfaitaire par taille (selon la population couverte). Tarifs hors taxes, à confirmer lors de la souscription.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {CPTS_FORFAITS.map((row) => (
                <li
                  key={row.taille}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 13,
                    color: "#1A1A2E",
                    padding: "8px 12px",
                    background: "#FAFAF8",
                    borderRadius: 8,
                  }}
                >
                  <span>{row.taille}</span>
                  <span style={{ fontWeight: 700 }}>{row.prix}</span>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 14, fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
              Tarifs indicatifs valables au 26 mai 2026 — sous réserve d'évolution.
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}
