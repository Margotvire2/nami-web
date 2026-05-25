// Certifications listées ici : uniquement celles ACTIVES au 26/05/2026
// Source : /confidentialite §3 (HDS L.1111-8 CSP) + §8 (RGPD/CCT pour transferts EU)
// Aucune mention de certification "en cours" ou "prévue".

const CERTIFS = [
  {
    id: "hds",
    label: "Hébergement de Données de Santé",
    detail:
      "Données de santé hébergées sur une infrastructure certifiée HDS, conformément à l'article L.1111-8 du Code de la santé publique.",
    ref: "Art. L.1111-8 CSP",
  },
  {
    id: "rgpd",
    label: "Conformité RGPD",
    detail:
      "Plateforme conçue conformément au Règlement (UE) 2016/679. Transferts hors UE encadrés par les clauses contractuelles types (CCT) de la Commission européenne.",
    ref: "Règlement (UE) 2016/679",
  },
] as const

export function SecuriteCertifications() {
  return (
    <section
      id="certifications"
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
            03 — Cadre réglementaire
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
            Cadre légal applicable
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#374151", margin: 0 }}>
            Voici les référentiels réglementaires que nous appliquons aujourd&apos;hui.
            Nous listons uniquement ce qui est en vigueur — pas de promesses futures.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {CERTIFS.map((c) => (
            <article
              key={c.id}
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
                {c.label}
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
                {c.detail}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  margin: 0,
                  fontWeight: 500,
                  fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                }}
              >
                Référence : {c.ref}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
