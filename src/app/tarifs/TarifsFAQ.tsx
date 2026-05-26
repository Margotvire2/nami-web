import { PRICING_FAQS } from "./tarifs-data"

export function TarifsFAQ() {
  return (
    <section
      aria-labelledby="tarifs-faq-title"
      style={{
        background: "#FAFAF8",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
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
            Questions fréquentes
          </div>
          <h2
            id="tarifs-faq-title"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#1A1A2E",
              margin: 0,
              fontFamily: "var(--font-jakarta)",
            }}
          >
            Vos questions sur les tarifs
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PRICING_FAQS.map((faq) => (
            <details
              key={faq.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8ECF4",
                borderRadius: 12,
                padding: "18px 22px",
              }}
              className="tarifs-faq-item"
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  listStyle: "none",
                  fontFamily: "var(--font-jakarta)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="tarifs-faq-chevron"
                  style={{
                    flexShrink: 0,
                    fontSize: 14,
                    color: "#5B4EC4",
                    transition: "transform 0.2s",
                  }}
                >
                  +
                </span>
              </summary>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      <style>{`
        .tarifs-faq-item[open] .tarifs-faq-chevron {
          transform: rotate(45deg);
        }
        .tarifs-faq-item summary:focus-visible {
          outline: 2px solid #5B4EC4;
          outline-offset: 4px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  )
}
