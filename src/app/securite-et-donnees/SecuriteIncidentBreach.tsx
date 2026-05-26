export function SecuriteIncidentBreach() {
  return (
    <section
      id="incident"
      style={{
        padding: "72px 24px",
        background: "#FAFAF8",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 32 }}>
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
            05 — Transparence
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
            En cas d&apos;incident
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#374151", margin: 0 }}>
            Aucun système informatique ne peut prétendre à une protection parfaite.
            Notre engagement : la transparence et la rapidité d&apos;information si
            un incident survenait.
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8ECF4",
            borderRadius: 12,
            padding: "26px 28px",
            display: "grid",
            gap: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A1A2E",
                margin: "0 0 8px",
              }}
            >
              Notre engagement de notification
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
              En cas de violation de données personnelles susceptible d&apos;engendrer
              un risque pour vos droits et libertés, nous nous engageons à informer
              l&apos;autorité de contrôle (CNIL) dans un délai de 72 heures
              conformément à l&apos;article 33 du RGPD, et à vous notifier
              directement par email si l&apos;article 34 du RGPD le requiert.
            </p>
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderRadius: 8,
              background: "#F5F3EF",
              border: "1px solid #E8ECF4",
            }}
          >
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: "#374151",
                margin: 0,
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              Notre engagement porte sur l&apos;information rapide et la coopération
              avec les autorités compétentes — pas sur une garantie d&apos;absence
              totale d&apos;incident, qu&apos;aucun acteur sérieux ne peut honnêtement
              promettre.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
