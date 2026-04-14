"use client"

import { UserPlus, FileText, Users } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const STEPS = [
  {
    num: "①",
    icon: <UserPlus size={22} color="#5B4EC4" />,
    title: "Invitez",
    body: "Créez le dossier de coordination de votre patient. Ajoutez les soignants de l'équipe en un clic.",
  },
  {
    num: "②",
    icon: <FileText size={22} color="#2BA89C" />,
    title: "Documentez",
    body: "Dictez ou écrivez. L'IA structure en brouillon. Partagez bilans, notes, comptes-rendus. Tout est centralisé.",
  },
  {
    num: "③",
    icon: <Users size={22} color="#059669" />,
    title: "Coordonnez",
    body: "Chaque soignant voit ce qui le concerne. Le parcours avance. L'équipe est alignée.",
  },
]

export function HowItWorks() {
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
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
            EN 3 ÉTAPES
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1A1A2E",
            lineHeight: 1.1,
            margin: "0 0 14px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Simple à déployer.<br />Immédiat à utiliser.
          </h2>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 60, maxWidth: 480, lineHeight: 1.6 }}>
            Aucune formation de deux jours. Aucun paramétrage complexe. En 15 minutes, votre première équipe est active.
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.title} variant="fade-up" delay={i * 0.14} duration={0.65}>
              <div style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid rgba(26,26,46,0.07)",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                boxShadow: "0 2px 12px rgba(26,26,46,0.04)",
                transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
              }}>
                {/* Icon + number */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(91,78,196,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                    fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
                    fontWeight: 900,
                    color: "#1A1A2E",
                    letterSpacing: "-0.03em",
                    fontFamily: "var(--font-jakarta)",
                  }}>
                    {step.num}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.65 }}>{step.body}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
