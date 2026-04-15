"use client"

import { AmbientGlow } from "./AmbientGlow"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const LAYERS = [
  {
    num: "COUCHE 1",
    title: "Référentiel médical vectorisé",
    body: "22 308 entrées : HAS, DSM-5, FFAB, Orphanet, BDPM, ICD-11. 116 000 relations cliniques typées avec grades de preuve.",
    badge: "22 308 sources",
    badgeColor: "#5B4EC4",
  },
  {
    num: "COUCHE 2",
    title: "Pipeline RAG hybride + graphe",
    body: "Vectoriel large → reranking pertinence fine → traversée automatique du graphe. Remonte comorbidités, CI, seuils, grades de preuve.",
    badge: "116 000 relations",
    badgeColor: "#2BA89C",
  },
  {
    num: "COUCHE 3",
    title: "Moteur de règles temps réel",
    body: "Exécuté sur chaque mise à jour du dossier. Indicateurs de complétude, anomalies temporelles. Chaque exécution loguée et auditable.",
    badge: "Temps réel · Auditable",
    badgeColor: "#7C3AED",
  },
  {
    num: "COUCHE 4",
    title: "Évaluation automatique",
    body: "Chaque résumé évalué par modèle indépendant sur 5 métriques : couverture sources, hallucination, complétude, actionnabilité, cohérence. Boucle feedback soignant.",
    badge: "5 métriques qualité",
    badgeColor: "#059669",
  },
]

export function PitchArchitecture() {
  return (
    <section style={{
      background: "#1A1A2E",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px clamp(24px, 5vw, 80px)",
      position: "relative",
    }}>
      <AmbientGlow />

      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(91,78,196,0.7)", marginBottom: 16 }}>
            ARCHITECTURE TECHNIQUE
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            lineHeight: 1.1,
            margin: "0 0 16px",
            fontFamily: "var(--font-jakarta)",
          }}>
            Ce n&apos;est pas un modèle.<br />C&apos;est un système.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
            Quatre couches indépendantes et assemblées. Chaque couche seule est reproductible. L&apos;assemblage câblé sur des parcours ambulatoires réels ne l&apos;est pas.{" "}
            <span style={{ color: "rgba(255,255,255,0.25)" }}>Temps de reproduction par une équipe de 5 : 18-24 mois.</span>
          </p>
        </ScrollReveal>

        {/* Layers stack — appear bottom to top visually (reverse order) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {LAYERS.map((layer, i) => (
            <ScrollReveal key={layer.num} variant="fade-up" delay={i * 0.15} duration={0.65}>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
              }}>
                {/* Layer number */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.30)",
                    marginBottom: 4,
                  }}>
                    {layer.num}
                  </div>
                  <div style={{
                    width: 3,
                    height: 32,
                    borderRadius: 100,
                    background: layer.badgeColor,
                    opacity: 0.6,
                  }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{layer.title}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: layer.badgeColor,
                      background: `${layer.badgeColor}20`,
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}>
                      {layer.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>
                    {layer.body}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom stats */}
        <ScrollReveal variant="fade-up" delay={0.6} duration={0.6}>
          <div style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            flexWrap: "wrap",
          }}>
            {[
              { value: "22 308", label: "sources", color: "#5B4EC4" },
              { value: "116 000", label: "relations typées", color: "#2BA89C" },
              { value: "5", label: "métriques qualité", color: "#7C3AED" },
              { value: "425", label: "pathologies", color: "#059669" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 800, color: s.color, letterSpacing: "-0.03em", fontFamily: "var(--font-jakarta)" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Data flywheel */}
        <ScrollReveal variant="fade-up" delay={0.75} duration={0.6}>
          <div style={{
            marginTop: 40,
            padding: "24px 28px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(91,78,196,0.7)", marginBottom: 12 }}>
              DATA FLYWHEEL
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {[
                "Plus de parcours",
                "Plus de feedbacks soignants",
                "Meilleure pertinence",
                "Plus de confiance",
                "Plus de parcours",
              ].map((step, i, arr) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: i === arr.length - 1 ? 700 : 400, color: i === arr.length - 1 ? "#5B4EC4" : "rgba(255,255,255,0.55)" }}>
                    {step}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 12 }}>→</span>}
                </span>
              ))}
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2BA89C" }}>BOUCLE</span>
            </div>
            <p style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.30)", lineHeight: 1.5 }}>
              Coût marginal par patient : tend vers zéro. Chaque parcours enrichit le système. Rendements d&apos;échelle croissants.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
