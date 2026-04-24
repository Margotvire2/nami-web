"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"

const FEATURES = [
  {
    title: "Un réseau de confiance",
    body: "582 000 professionnels de santé référencés. Filtrez par spécialité, localisation, disponibilité. Lisez leurs spécialisations, leurs formations, leurs réseaux. Vous choisissez avec qui vous travaillez.",
    color: "#5B4EC4",
    icon: "🤝",
  },
  {
    title: "Adressage structuré",
    body: "Un adressage Nami n'est pas un email. C'est un dossier partagé — contexte, objectif, documents joints. Le collègue reçoit tout ce qu'il faut pour reprendre le fil sans vous appeler.",
    color: "#2BA89C",
    icon: "📤",
  },
  {
    title: "Messagerie par équipe patient",
    body: "Créez un groupe autour d'un patient en quelques secondes. Médecin traitant, diét, psy, kiné — chacun voit les messages qui le concernent. Plus de fils éparpillés sur WhatsApp.",
    color: "#5B4EC4",
    icon: "💬",
  },
  {
    title: "Parcours de soins",
    body: "Créez un parcours structuré pour vos patients complexes. Chaque soignant connaît son rôle, son calendrier, les informations à transmettre. Le patient suit l'avancement depuis son app.",
    color: "#2BA89C",
    icon: "🗺️",
  },
]

export function LibNetwork() {
  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 16 }}>
            RÉSEAU & COORDINATION
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1A1A2E",
            lineHeight: 1.1,
            margin: "0 0 16px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Orientez vos patients<br />vers des soignants que vous connaissez.
          </h2>
          <p style={{ fontSize: 16, color: "#374151", marginBottom: 56, maxWidth: 540, lineHeight: 1.65 }}>
            Donner sa confiance à un confrère inconnu ou orienter un patient vers quelqu&apos;un qu&apos;on n&apos;a jamais vu, c&apos;est une prise de risque réelle. Nami vous donne les moyens de construire un réseau de confiance vérifiée — et de coordonner ce réseau sans friction.
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} variant="fade-up" delay={i * 0.1} duration={0.65}>
              <div style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 24px",
                border: "1px solid rgba(26,26,46,0.07)",
                borderTop: `3px solid ${f.color}`,
                boxShadow: "0 2px 14px rgba(26,26,46,0.05)",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
              }}>
                <div style={{ fontSize: 30 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.3 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, flex: 1 }}>{f.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  )
}
