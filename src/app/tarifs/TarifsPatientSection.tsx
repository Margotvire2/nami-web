import Link from "next/link"
import { PATIENT_TIER } from "./tarifs-data"

export function TarifsPatientSection() {
  const tier = PATIENT_TIER
  return (
    <section
      id="patient"
      aria-labelledby="tarifs-patient-title"
      style={{
        background: "#FAFAF8",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
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
            Pour les patients
          </div>
          <h2
            id="tarifs-patient-title"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#1A1A2E",
              margin: "0 0 12px",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            {tier.tierName}
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
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 6,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
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

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 32px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {tier.features.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: 15,
                  color: "#1A1A2E",
                  lineHeight: 1.5,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#EEEDFB",
                    color: "#5B4EC4",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
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
                marginTop: 24,
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
      </div>

      <style>{`
        .tarifs-cta-primary:hover {
          background: #4A3FB0 !important;
          transform: translateY(-1px);
        }
        .tarifs-cta-primary:focus-visible {
          outline: 2px solid #5B4EC4;
          outline-offset: 3px;
        }
      `}</style>
    </section>
  )
}
