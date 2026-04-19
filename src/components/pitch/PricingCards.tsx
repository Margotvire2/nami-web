import { Check } from "lucide-react"

type PricingTier = {
  name: string
  price: string
  priceDetail: string
  highlight?: boolean
  badge?: string
  features: string[]
  cta: string
  ctaHref: string
}

const TIERS: PricingTier[] = [
  {
    name: "Coordination",
    price: "79€",
    priceDetail: "/mois/utilisateur",
    features: [
      "Dossier de coordination partagé",
      "Messagerie sécurisée équipe",
      "Notes structurées + documents",
      "Agenda de coordination",
      "5 soignants inclus",
      "Support email",
    ],
    cta: "Démarrer",
    ctaHref: "mailto:contact@namipourlavie.com",
  },
  {
    name: "Réseau",
    price: "499€",
    priceDetail: "/mois + 79€/utilisateur",
    highlight: true,
    badge: "Recommandé",
    features: [
      "Tout Coordination",
      "Base de connaissances cliniques",
      "Transcription IA (brouillon)",
      "Parcours structurés (131 modèles)",
      "API + intégrations",
      "Support prioritaire",
    ],
    cta: "Contacter l'équipe",
    ctaHref: "mailto:contact@namipourlavie.com",
  },
]

export function PricingCards({ note }: { note?: string }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            style={{
              background: "#fff",
              borderRadius: 20,
              border: tier.highlight
                ? "2px solid #5B4EC4"
                : "1px solid rgba(26,26,46,0.08)",
              padding: "32px 28px",
              boxShadow: tier.highlight
                ? "0 8px 32px rgba(91,78,196,0.14)"
                : "0 2px 12px rgba(26,26,46,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "relative",
            }}
          >
            {tier.badge && (
              <div style={{
                position: "absolute",
                top: -13,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#5B4EC4",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 14px",
                borderRadius: 100,
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}>
                {tier.badge}
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tier.highlight ? "#5B4EC4" : "#8A8A96", marginBottom: 8 }}>
                {tier.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: "#1A1A2E", lineHeight: 1, fontFamily: "var(--font-jakarta)" }}>
                  {tier.price}
                </span>
                <span style={{ fontSize: 13, color: "#8A8A96" }}>{tier.priceDetail}</span>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(26,26,46,0.06)", margin: "20px 0" }} />

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {tier.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: tier.highlight ? "rgba(91,78,196,0.10)" : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={10} color={tier.highlight ? "#5B4EC4" : "#059669"} />
                  </div>
                  <span style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.4 }}>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={tier.ctaHref}
              style={{
                display: "block",
                marginTop: 28,
                padding: "13px 0",
                borderRadius: 100,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                background: tier.highlight ? "#5B4EC4" : "transparent",
                color: tier.highlight ? "#fff" : "#5B4EC4",
                border: `2px solid ${tier.highlight ? "#5B4EC4" : "rgba(91,78,196,0.25)"}`,
                fontFamily: "inherit",
              }}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </div>
      {note && (
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#8A8A96" }}>
          {note}
        </p>
      )}
    </div>
  )
}
