import Link from "next/link"

export function TarifsHero() {
  return (
    <section
      style={{
        background: "#FAFAF8",
        padding: "96px clamp(24px, 5vw, 80px) 64px",
        borderBottom: "1px solid #E8ECF4",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 18,
          }}
        >
          Tarifs
        </div>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1A1A2E",
            lineHeight: 1.08,
            margin: "0 0 22px",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Sans frais pour les patients.<br />
          Adapté pour les soignants et les structures.
        </h1>
        <p
          style={{
            fontSize: "clamp(15px, 1.4vw, 17px)",
            color: "#374151",
            lineHeight: 1.6,
            maxWidth: 640,
            margin: "0 auto 36px",
          }}
        >
          Une tarification transparente, alignée sur l'usage. Choisissez le profil qui vous correspond.
        </p>

        <nav
          aria-label="Sections de tarifs"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {[
            { href: "#patient", label: "Patient" },
            { href: "#soignant-liberal", label: "Soignant libéral" },
            { href: "#structure", label: "Structure" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 18px",
                background: "#FFFFFF",
                border: "1px solid #E8ECF4",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1A2E",
                textDecoration: "none",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              className="tarifs-anchor-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <style>{`
        .tarifs-anchor-link:hover {
          border-color: #5B4EC4 !important;
          transform: translateY(-1px);
        }
        .tarifs-anchor-link:focus-visible {
          outline: 2px solid #5B4EC4;
          outline-offset: 2px;
        }
      `}</style>
    </section>
  )
}
