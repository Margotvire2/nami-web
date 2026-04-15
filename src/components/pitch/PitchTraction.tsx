"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"

const TIMELINE = [
  { date: "4 avril", label: "Première ligne de code" },
  { date: "14 avril", label: "26 500 lignes · 260 endpoints · 67 modèles · En production" },
  { date: "23 avril", label: "Présentations institutionnelles programmées" },
  { date: "Mai 2026", label: "Premiers pilotes tarifés" },
]

const MOATS = [
  {
    label: "Graphe clinique propriétaire",
    metric: "116 201",
    unit: "relations typées",
    body: "HAS, DSM-5, FFAB, ESPGHAN, Orphanet — chaque relation a un grade de preuve. Irréproductible sans clinicien expert à temps plein.",
    color: "#5B4EC4",
  },
  {
    label: "Évaluation IA mesurée",
    metric: "0,6 %",
    unit: "taux d'hallucination",
    body: "5 métriques quantitatives sur chaque résumé. Score moyen 95%. Aucun concurrent dans la coordination santé ne mesure ses outputs.",
    color: "#2BA89C",
  },
  {
    label: "Compliance MDR native",
    metric: "0",
    unit: "mot interdit dans le code",
    body: "Structuration documentaire, indicateurs de complétude — jamais de détection, diagnostic ou alerte clinique. Dans le nommage, pas en surcouche.",
    color: "#5B4EC4",
  },
  {
    label: "Effet réseau B2B",
    metric: "582 000",
    unit: "soignants référencés",
    body: "Quand un soignant adresse via Nami, le destinataire doit y être. Même mécanique que Doctolib — mais entre soignants, pas patient→soignant. Plus sticky, plus difficile à déloger.",
    color: "#2BA89C",
  },
]

export function PitchTraction() {
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
            OÙ ON EN EST
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
            Construit de l&apos;intérieur.<br />Validé par les institutions.
          </h2>
          <p style={{ fontSize: 16, color: "#4A4A5A", marginBottom: 52, maxWidth: 520, lineHeight: 1.6 }}>
            Nami réunit dans un seul outil les frictions du quotidien soignant — agenda, coordination d&apos;équipe, adressage, messagerie, intelligence documentaire. Conçu par une professionnelle de santé qui les a toutes vécues.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 52, overflowX: "auto", paddingBottom: 8 }}>
            {TIMELINE.map((step, i) => (
              <div key={step.date} style={{ display: "flex", alignItems: "center", flex: "1 0 auto", minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 10 }}>
                    {i > 0 && <div style={{ flex: 1, height: 2, background: "rgba(91,78,196,0.20)" }} />}
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#5B4EC4", flexShrink: 0 }} />
                    {i < TIMELINE.length - 1 && <div style={{ flex: 1, height: 2, background: "rgba(91,78,196,0.20)" }} />}
                  </div>
                  <div style={{ padding: "0 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5B4EC4", marginBottom: 4 }}>{step.date}</div>
                    <div style={{ fontSize: 12, color: "#4A4A5A", lineHeight: 1.4 }}>{step.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* MOAT cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          {MOATS.map((card, i) => (
            <ScrollReveal key={card.label} variant="fade-up" delay={i * 0.1} duration={0.6}>
              <div style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(26,26,46,0.07)",
                padding: "22px 22px",
                borderTop: `3px solid ${card.color}`,
                boxShadow: "0 2px 10px rgba(26,26,46,0.04)",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: card.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>{card.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.03em", fontFamily: "var(--font-jakarta)" }}>{card.metric}</span>
                  <span style={{ fontSize: 12, color: "#8A8A96", fontWeight: 500 }}>{card.unit}</span>
                </div>
                <div style={{ fontSize: 12, color: "#4A4A5A", lineHeight: 1.6, flex: 1 }}>{card.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fade-up" delay={0.35} duration={0.6}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}>
            {[
              { label: "Un seul outil", body: "Agenda, coordination, IA, base documentaire, adressage, messagerie — pas une collection d'outils intégrés." },
              { label: "Terrain d'abord", body: "Chaque feature répond à un pain point documenté sur le terrain par une diététicienne en exercice." },
              { label: "La tech au service du soin", body: "Dictée → note structurée. Dossier incomplet → indicateur de complétude. Réseau inconnu → adressage sécurisé." },
            ].map((item) => (
              <div key={item.label} style={{
                padding: "16px 18px",
                background: "rgba(91,78,196,0.04)",
                borderRadius: 12,
                border: "1px solid rgba(91,78,196,0.09)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5B4EC4", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "#4A4A5A", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
