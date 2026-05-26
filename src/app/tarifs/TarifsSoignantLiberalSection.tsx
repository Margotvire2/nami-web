import Link from "next/link"
import { SOIGNANT_TIERS } from "./tarifs-data"

export function TarifsSoignantLiberalSection() {
  return (
    <section
      id="soignant-liberal"
      aria-labelledby="tarifs-soignant-title"
      style={{
        background: "#F5F3EF",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
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
            Pour les soignants libéraux
          </div>
          <h2
            id="tarifs-soignant-title"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#1A1A2E",
              margin: "0 0 12px",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            Quatre périmètres, selon votre activité
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#374151",
              lineHeight: 1.6,
              margin: "0 auto",
              maxWidth: 620,
            }}
          >
            Démarrez avec le périmètre Gratuit, montez en gamme si votre pratique s'élargit.
          </p>
        </div>

        <div
          className="tarifs-soignant-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {SOIGNANT_TIERS.map((tier) => {
            const isHighlight = Boolean(tier.badge)
            return (
              <article
                key={tier.id}
                style={{
                  background: "#FFFFFF",
                  border: isHighlight ? "2px solid #5B4EC4" : "1px solid #E8ECF4",
                  borderRadius: 16,
                  padding: "28px 22px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: isHighlight
                    ? "0 8px 28px rgba(91,78,196,0.12)"
                    : "0 1px 2px rgba(26,26,46,0.04)",
                }}
              >
                {tier.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#5B4EC4",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      padding: "4px 12px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: isHighlight ? "#5B4EC4" : "#1A1A2E",
                    margin: "0 0 12px",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {tier.tierName}
                </h3>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 14 }}>
                  <span
                    style={{
                      fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.025em",
                      color: "#1A1A2E",
                      fontFamily: "var(--font-jakarta)",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.priceUnit && (
                    <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
                      {tier.priceUnit}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.5,
                    margin: "0 0 20px",
                    minHeight: 40,
                  }}
                >
                  {tier.description}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                    flex: 1,
                  }}
                >
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 9,
                        fontSize: 13,
                        color: "#1A1A2E",
                        lineHeight: 1.45,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#EEEDFB",
                          color: "#5B4EC4",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
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

                <Link
                  href={tier.cta.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 18px",
                    background: isHighlight ? "#5B4EC4" : "#FFFFFF",
                    color: isHighlight ? "#FFFFFF" : "#5B4EC4",
                    border: isHighlight ? "1px solid #5B4EC4" : "1px solid #5B4EC4",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    borderRadius: 999,
                    transition: "background 0.2s, transform 0.2s",
                  }}
                  className="tarifs-cta-tier"
                >
                  {tier.cta.label}
                </Link>

                {tier.caveat && (
                  <p
                    style={{
                      marginTop: 14,
                      fontSize: 11,
                      color: "#6B7280",
                      lineHeight: 1.5,
                      textAlign: "center",
                    }}
                  >
                    {tier.caveat}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </div>

      <style>{`
        .tarifs-cta-tier:hover {
          background: #5B4EC4 !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }
        .tarifs-cta-tier:focus-visible {
          outline: 2px solid #5B4EC4;
          outline-offset: 3px;
        }
      `}</style>
    </section>
  )
}
