"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"

interface Props {
  variant?: "light" | "dark"
}

export function PitchFounder({ variant = "light" }: Props) {
  const isDark = variant === "dark"
  const text = isDark ? "#fff" : "#1A1A2E"
  const muted = isDark ? "rgba(255,255,255,0.50)" : "#8A8A96"
  const body = isDark ? "rgba(255,255,255,0.75)" : "#4A4A5A"
  const quoteColor = isDark ? "rgba(255,255,255,0.85)" : "#1A1A2E"

  return (
    <section style={{
      background: isDark ? "transparent" : "#FAFAF8",
      padding: isDark ? "0" : "80px clamp(24px, 5vw, 80px)",
      minHeight: isDark ? undefined : "80vh",
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {!isDark && (
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 40 }}>
              ÉQUIPE
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal variant="fade-up" delay={isDark ? 0 : 0.1} duration={0.75}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 40,
            alignItems: "flex-start",
          }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                width: isDark ? 96 : 140,
                height: isDark ? 96 : 140,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 12px 40px rgba(91,78,196,0.30)",
              }}>
                <span style={{
                  fontSize: isDark ? 28 : 40,
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "var(--font-jakarta)",
                }}>
                  MV
                </span>
              </div>
              <div style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: isDark ? "rgba(91,78,196,0.20)" : "rgba(91,78,196,0.08)",
                border: "1px solid rgba(91,78,196,0.20)",
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#5B4EC4", letterSpacing: "0.06em" }}>FONDATRICE</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Name */}
              <div>
                <div style={{ fontSize: isDark ? 22 : 28, fontWeight: 800, color: text, letterSpacing: "-0.02em", marginBottom: 6, fontFamily: "var(--font-jakarta)" }}>
                  Margot Vire
                </div>
                <div style={{ fontSize: 14, color: body }}>
                  Diététicienne spécialisée TCA · Hôpital Américain de Paris
                </div>
                <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>
                  Master Santé Publique AP-HP · ESSEC · 8 réseaux cliniques
                </div>
              </div>

              {/* Quote */}
              <blockquote style={{
                margin: 0,
                paddingLeft: 18,
                borderLeft: "3px solid #5B4EC4",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
                color: quoteColor,
                lineHeight: 1.65,
              }}>
                &ldquo;J&apos;ai vu une patiente de 16 ans perdre 4 mois parce que
                ses 5 soignants n&apos;avaient aucun outil commun.
                J&apos;ai décidé de le construire.&rdquo;
              </blockquote>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  "Première utilisatrice",
                  "26 500 lignes en 10 jours",
                  "Recherche terrain publiée",
                  "Seule",
                ].map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: muted,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(26,26,46,0.08)"}`,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
