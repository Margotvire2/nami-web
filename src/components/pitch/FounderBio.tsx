export function FounderBio({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark"
  const textPrimary = isDark ? "#FFFFFF" : "#1A1A2E"
  const textMuted = isDark ? "rgba(255,255,255,0.55)" : "#8A8A96"
  const textBody = isDark ? "rgba(255,255,255,0.80)" : "#4A4A5A"
  const borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(26,26,46,0.08)"

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 32,
      alignItems: "flex-start",
    }}>
      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 8px 24px rgba(91,78,196,0.25)",
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "var(--font-jakarta)" }}>
            MV
          </span>
        </div>
        <div style={{
          padding: "4px 12px",
          borderRadius: 100,
          background: isDark ? "rgba(91,78,196,0.20)" : "rgba(91,78,196,0.08)",
          border: `1px solid ${isDark ? "rgba(91,78,196,0.30)" : "rgba(91,78,196,0.15)"}`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#5B4EC4", letterSpacing: "0.06em" }}>
            FONDATRICE
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Name + credentials */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", fontFamily: "var(--font-jakarta)", marginBottom: 4 }}>
            Margot Vire
          </div>
          <div style={{ fontSize: 14, color: textBody, lineHeight: 1.5 }}>
            Diététicienne spécialisée TCA · Hôpital Américain de Paris
          </div>
          <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
            Master Santé Publique AP-HP · ESSEC · 8 réseaux cliniques
          </div>
        </div>

        {/* Quote */}
        <blockquote style={{
          margin: 0,
          paddingLeft: 16,
          borderLeft: `3px solid #5B4EC4`,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
          fontSize: 16,
          color: textBody,
          lineHeight: 1.65,
        }}>
          &ldquo;J&apos;ai vu une patiente de 16 ans perdre 4 mois parce que ses 5 soignants
          n&apos;avaient aucun outil commun. J&apos;ai décidé de le construire.&rdquo;
        </blockquote>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            "Première utilisatrice",
            "Recherche terrain publiée",
            "26 500 lignes en 10 jours",
          ].map((tag) => (
            <span key={tag} style={{
              fontSize: 11,
              fontWeight: 600,
              color: isDark ? "rgba(255,255,255,0.65)" : "#8A8A96",
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${borderColor}`,
              background: isDark ? "rgba(255,255,255,0.05)" : "transparent",
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
