export function SecuriteContactDPO() {
  return (
    <section
      id="contact-dpo"
      style={{
        padding: "72px 24px",
        background: "#F5F3EF",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 28 }}>
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
            06 — Contact
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
            Une question, une demande ?
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          <article
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
              }}
            >
              Référent protection des données
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
              Pour toute question relative à vos données personnelles ou à l&apos;exercice
              de vos droits RGPD.
            </p>
            <a
              href="mailto:dpo@namipourlavie.com"
              style={{
                fontSize: 14,
                color: "#5B4EC4",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              dpo@namipourlavie.com
            </a>
          </article>

          <article
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
              }}
            >
              Saisir la CNIL
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
              Vous pouvez à tout moment introduire une réclamation auprès de la Commission
              nationale de l&apos;informatique et des libertés.
            </p>
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                color: "#5B4EC4",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              cnil.fr/plaintes
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}
