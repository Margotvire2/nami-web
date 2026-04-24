"use client"

import { Check } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const DOCTOLIB_FEATURES = [
  "Agenda + prise de RDV",
  "Messagerie patients",
  "Référencement annuaire",
  "— Messagerie soignants",
  "— Téléexpertise",
  "— Réseau",
]

const NAMI_FREE_FEATURES = [
  "Agenda + prise de RDV",
  "Messagerie patients",
  "Référencement 582 000 soignants",
  "Messagerie soignants",
  "Téléexpertise",
  "Réseau",
]

const TIERS = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    badge: null,
    features: ["Agenda, RDV, référencement 582K", "Messagerie patients & soignants", "Téléexpertise", "Réseau soignants"],
    color: "#5B4EC4",
    highlight: false,
  },
  {
    name: "Essentiel",
    price: "19€",
    period: "/mois",
    badge: null,
    features: ["Tout Gratuit", "Facturation (non-médecin)", "Visio / Téléconsultation (0% commission)"],
    color: "#5B4EC4",
    highlight: false,
  },
  {
    name: "Coordination",
    price: "79€",
    period: "/mois",
    badge: null,
    features: ["Tout Essentiel", "Adressage structuré", "App patient (IA photos repas)", "Dashboard KPIs soignant"],
    color: "#5B4EC4",
    highlight: false,
  },
  {
    name: "Intelligence",
    price: "149€",
    period: "/mois",
    badge: "Le plus populaire",
    features: ["Tout Coordination", "Synthèses IA sourcées", "Extraction bio automatique", "Base documentaire 22 308 sources", "App soignant mobile complète"],
    color: "#5B4EC4",
    highlight: true,
  },
  {
    name: "Réseau",
    price: "499€",
    period: "/mois + 79€/user",
    badge: null,
    features: ["Tout Intelligence", "Parcours complexes sur mesure", "Vue pilote structures", "Multi-équipes", "Dashboard KPIs structures", "Admin & accès"],
    color: "#2BA89C",
    highlight: false,
  },
]

interface Props {
  note?: string
  variant?: "vc" | "hospital"
}

export function PitchPricing({ note, variant = "vc" }: Props) {
  return (
    <section style={{
      background: "#F5F3EF",
      minHeight: "100dvh",
      display: "flex",
      alignItems: "flex-start",
      padding: "80px clamp(20px, 5vw, 80px)",
      overflowX: "hidden",
    }}>
      <style>{`
        @media (max-width: 639px) {
          .pricing-comparison {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .pricing-vs-divider {
            display: none !important;
          }
          .pricing-tiers-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .pricing-tiers-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
            {variant === "vc" ? "MODÈLE" : "TARIFS"}
          </div>
          {variant === "vc" ? (
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1A1A2E", lineHeight: 1.1, margin: "0 0 8px", fontFamily: "var(--font-jakarta)" }}>
              Le wedge.
            </h2>
          ) : (
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1A1A2E", lineHeight: 1.1, margin: "0 0 8px", fontFamily: "var(--font-jakarta)" }}>
              Transparent. Sans engagement.
            </h2>
          )}
          {variant === "vc" && (
            <p style={{ fontSize: 16, color: "#374151", marginBottom: 52, maxWidth: 480, lineHeight: 1.6 }}>
              Tout ce que Doctolib facture 149€/mois, Nami l&apos;offre.
            </p>
          )}
        </ScrollReveal>

        {/* Nuclear comparison — Doctolib vs Nami */}
        {variant === "vc" && (
          <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
            <div
              className="pricing-comparison"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 16,
                alignItems: "stretch",
                marginBottom: 56,
              }}
            >
              {/* Doctolib card */}
              <div style={{
                background: "rgba(26,26,46,0.04)",
                borderRadius: 20,
                border: "1px solid rgba(26,26,46,0.08)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>
                  Doctolib
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: "#6B7280",
                    textDecoration: "line-through",
                    fontFamily: "var(--font-jakarta)",
                  }}>
                    149€
                  </span>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>/mois</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {DOCTOLIB_FEATURES.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: f.startsWith("—") ? "transparent" : "rgba(26,26,46,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {!f.startsWith("—") && <Check size={9} color="#6B7280" />}
                        {f.startsWith("—") && <span style={{ fontSize: 11, color: "#D1D5DB" }}>×</span>}
                      </div>
                      <span style={{ fontSize: 13, color: f.startsWith("—") ? "#C4C4CC" : "#374151" }}>
                        {f.startsWith("—") ? f.slice(2) : f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VS divider */}
              <div className="pricing-vs-divider" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em" }}>VS</span>
              </div>

              {/* Nami card */}
              <div style={{
                background: "#fff",
                borderRadius: 20,
                border: "2px solid #5B4EC4",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 8px 40px rgba(91,78,196,0.12)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 10 }}>
                  Nami · Gratuit
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "var(--font-jakarta)",
                  }}>
                    0€
                  </span>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>/mois</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {NAMI_FREE_FEATURES.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(91,78,196,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={9} color="#5B4EC4" />
                      </div>
                      <span style={{ fontSize: 13, color: "#1A1A2E", fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 48, padding: "16px", background: "rgba(91,78,196,0.06)", borderRadius: 12, border: "1px solid rgba(91,78,196,0.12)" }}>
              <span style={{ fontSize: "clamp(13px, 1.4vw, 15px)", fontWeight: 700, color: "#1A1A2E" }}>
                Ce que Doctolib facture 149€/mois, Nami l&apos;offre.{" "}
              </span>
              <span style={{ fontSize: "clamp(13px, 1.4vw, 15px)", color: "#5B4EC4", fontWeight: 600 }}>
                Et tout ce que Doctolib facture 307€ avec les options, Nami le fait pour 19€.
              </span>
            </div>
          </ScrollReveal>
        )}

        {/* 5 Tiers */}
        <ScrollReveal variant="fade-up" delay={variant === "vc" ? 0.25 : 0.1} duration={0.7}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 20 }}>
            Les 5 tiers
          </div>
        </ScrollReveal>
        <div
          className="pricing-tiers-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "stretch" }}
        >
          {TIERS.map((tier, i) => (
            <ScrollReveal key={tier.name} variant="fade-up" delay={0.1 + i * 0.08} duration={0.6} style={{ height: "100%" }}>
              <div style={{
                background: tier.highlight ? "#fff" : "rgba(255,255,255,0.7)",
                borderRadius: 16,
                border: `${tier.highlight ? "2px" : "1px"} solid ${tier.highlight ? "#5B4EC4" : "rgba(26,26,46,0.08)"}`,
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
                boxShadow: tier.highlight ? "0 8px 32px rgba(91,78,196,0.12)" : "none",
                position: "relative",
              }}>
                {tier.badge && (
                  <div style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#5B4EC4",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 12px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}>
                    {tier.badge}
                  </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tier.highlight ? "#5B4EC4" : "#6B7280", marginBottom: 8 }}>
                  {tier.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 16 }}>
                  <span style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}>
                    {tier.price}
                  </span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>{tier.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tier.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: tier.highlight ? "rgba(91,78,196,0.10)" : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <Check size={8} color={tier.highlight ? "#5B4EC4" : "#059669"} />
                      </div>
                      <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {note && (
          <ScrollReveal variant="fade-up" delay={0.5} duration={0.6}>
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#6B7280", fontStyle: "italic" }}>
              {note}
            </p>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
