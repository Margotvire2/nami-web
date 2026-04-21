"use client"

import { useState } from "react"


const N = {
  primary: "#5B4EC4",
  primaryHover: "#4c44b0",
  primaryLight: "rgba(91,78,196,0.08)",
  teal: "#2BA89C",
  tealLight: "rgba(43,168,156,0.08)",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  textMid: "#4A4A5A",
  textLight: "#8A8A96",
  card: "#FFFFFF",
  border: "rgba(26,26,46,0.06)",
  borderMed: "rgba(26,26,46,0.12)",
  danger: "#D94F4F",
  dangerBg: "rgba(217,79,79,0.06)",
  dangerBorder: "rgba(217,79,79,0.15)",
  success: "#2BA84A",
  successBg: "rgba(43,168,74,0.06)",
  warning: "#E6993E",
  warningBg: "rgba(230,153,62,0.06)",
  info: "#2563EB",
  infoBg: "rgba(37,99,235,0.06)",
  gradient: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
  shadow: "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
  shadowHover: "0 4px 16px rgba(26,26,46,0.08), 0 12px 32px rgba(91,78,196,0.06)",
  radius: 12,
  radiusSm: 10,
  radiusXs: 8,
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
}

function Swatch({ color, name, hex, sub }: { color: string; name: string; hex: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, background: color, flexShrink: 0,
        border: color === "#FFFFFF" || color === N.bg || color === N.bgAlt ? `1px solid ${N.borderMed}` : "none",
      }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: N.dark }}>{name}</div>
        <div style={{ fontSize: 12, fontFamily: "monospace", color: N.textLight }}>{hex}</div>
        {sub && <div style={{ fontSize: 11, color: N.textLight }}>{sub}</div>}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: N.dark, letterSpacing: "-0.02em", marginBottom: 4 }}>{title}</div>
      <div style={{ width: 40, height: 3, borderRadius: 2, background: N.gradient, marginBottom: 20 }} />
      {children}
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: N.textLight, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function Rule({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 13, color: N.textMid, lineHeight: 1.6 }}>
      <span style={{ color: N.danger, flexShrink: 0, fontWeight: 700 }}>✕</span>{text}
    </div>
  )
}

function Do({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 13, color: N.textMid, lineHeight: 1.6 }}>
      <span style={{ color: N.success, flexShrink: 0, fontWeight: 700 }}>✓</span>{text}
    </div>
  )
}

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState("colors")

  const nav = [
    { id: "colors", label: "Couleurs" },
    { id: "typography", label: "Typographie" },
    { id: "spacing", label: "Espacements" },
    { id: "components", label: "Composants" },
    { id: "patterns", label: "Patterns" },
    { id: "clinical", label: "Couleurs cliniques" },
    { id: "icons", label: "Iconographie" },
    { id: "rules", label: "Règles" },
  ]

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", background: N.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ padding: "32px 40px 24px", borderBottom: `1px solid ${N.border}`, background: N.card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: N.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>N</span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: N.dark, letterSpacing: "-0.03em" }}>Nami Design System</div>
            <div style={{ fontSize: 13, color: N.textLight, marginTop: 1 }}>Référence visuelle — avril 2026</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 20, flexWrap: "wrap" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setActiveSection(n.id)} style={{
              fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: N.radiusXs, border: "none", cursor: "pointer",
              background: activeSection === n.id ? N.primary : "transparent",
              color: activeSection === n.id ? "#fff" : N.textLight,
              transition: `all 0.15s ${N.ease}`,
            }}>{n.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px 80px", maxWidth: 900 }}>

        {/* ═══ COULEURS ═══ */}
        {activeSection === "colors" && (
          <Section title="Palette de couleurs">
            <SubSection title="Couleurs primaires">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Swatch color={N.primary} name="Primary" hex="#5B4EC4" sub="Actions, liens, focus, boutons primaires" />
                <Swatch color={N.primaryHover} name="Primary Hover" hex="#4c44b0" sub="Hover sur boutons primaires" />
                <Swatch color={N.teal} name="Teal" hex="#2BA89C" sub="Actions secondaires, validations, succès" />
                <Swatch color={N.primaryLight} name="Primary Light" hex="rgba(91,78,196,0.08)" sub="Backgrounds légers, highlights" />
                <Swatch color={N.tealLight} name="Teal Light" hex="rgba(43,168,156,0.08)" sub="Backgrounds secondaires légers" />
              </div>
            </SubSection>

            <SubSection title="Fonds">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Swatch color={N.bg} name="Background" hex="#FAFAF8" sub="Fond global — crème très légère, JAMAIS blanc pur" />
                <Swatch color={N.bgAlt} name="Background Alt" hex="#F5F3EF" sub="Cards légèrement marquées, zones inactives" />
                <Swatch color={N.card} name="Card" hex="#FFFFFF" sub="Surface des cards et panneaux" />
              </div>
            </SubSection>

            <SubSection title="Texte">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Swatch color={N.dark} name="Text Dark" hex="#1A1A2E" sub="Titres, labels importants" />
                <Swatch color={N.textMid} name="Text Body" hex="#4A4A5A" sub="Corps de texte, descriptions" />
                <Swatch color={N.textLight} name="Text Muted" hex="#8A8A96" sub="Labels secondaires, timestamps" />
              </div>
            </SubSection>

            <SubSection title="Bordures">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Swatch color="rgba(26,26,46,0.06)" name="Border Light" hex="rgba(26,26,46,0.06)" sub="Bordures par défaut des cards" />
                <Swatch color="rgba(26,26,46,0.12)" name="Border Medium" hex="rgba(26,26,46,0.12)" sub="Bordures hover, boutons secondaires" />
              </div>
            </SubSection>

            <SubSection title="Sémantiques">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Swatch color={N.danger} name="Danger" hex="#D94F4F" sub="Erreurs, alertes critiques, suppressions" />
                <Swatch color={N.success} name="Success" hex="#2BA84A" sub="Validations, étapes complétées" />
                <Swatch color={N.warning} name="Warning" hex="#E6993E" sub="Alertes modérées, en attente" />
                <Swatch color={N.info} name="Info" hex="#2563EB" sub="Informations, liens contextuels" />
              </div>
            </SubSection>

            <SubSection title="Gradient">
              <div style={{ height: 60, borderRadius: N.radius, background: N.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>linear-gradient(135deg, #5B4EC4, #2BA89C)</span>
              </div>
              <div style={{ fontSize: 12, color: N.textLight, marginTop: 6 }}>Utilisé pour : avatar, logo Nami, accents premium. Max 2 usages par page.</div>
            </SubSection>
          </Section>
        )}

        {/* ═══ TYPOGRAPHIE ═══ */}
        {activeSection === "typography" && (
          <Section title="Typographie">
            <SubSection title="Familles de polices">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: "20px", borderRadius: N.radius, border: `1px solid ${N.border}`, background: N.card }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: N.dark }}>Plus Jakarta Sans</div>
                  <div style={{ fontSize: 13, color: N.textLight, marginTop: 4 }}>Titres, UI, boutons, navigation — PARTOUT sauf data</div>
                  <div style={{ fontSize: 14, color: N.textMid, marginTop: 8, lineHeight: 1.6 }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</div>
                </div>
                <div style={{ padding: "20px", borderRadius: N.radius, border: `1px solid ${N.border}`, background: N.card }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: N.dark, fontFamily: "Inter, sans-serif" }}>Inter</div>
                  <div style={{ fontSize: 13, color: N.textLight, marginTop: 4 }}>Données, stats, captions, labels techniques, valeurs numériques</div>
                  <div style={{ fontSize: 14, color: N.textMid, marginTop: 8, fontFamily: "Inter, sans-serif" }}>47.8 kg · IMC 17.7 · K+ 3.2 mmol/L · FC 58 bpm</div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Échelle typographique">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { size: 26, weight: 700, label: "Page title", spacing: "-0.03em", usage: "Titre de page principal" },
                  { size: 20, weight: 700, label: "Section title", spacing: "-0.02em", usage: "Titres de section" },
                  { size: 17, weight: 700, label: "Card title", spacing: "-0.02em", usage: "Noms de patients, titres de cards" },
                  { size: 15, weight: 600, label: "Subtitle", spacing: "-0.01em", usage: "Sous-titres, noms dans les listes" },
                  { size: 14, weight: 500, label: "Body", spacing: "0", usage: "Corps de texte, descriptions" },
                  { size: 13, weight: 500, label: "Small body", spacing: "0", usage: "Texte secondaire, motifs, preview" },
                  { size: 12, weight: 500, label: "Caption", spacing: "0", usage: "Timestamps, metadata, sub-labels" },
                  { size: 11, weight: 700, label: "Section label", spacing: "0.06em", usage: "Labels de section, uppercase, tracking wide" },
                  { size: 10, weight: 600, label: "Badge text", spacing: "0.01em", usage: "Badges, pills, micro-labels" },
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "8px 0", borderBottom: `1px solid ${N.border}` }}>
                    <span style={{ fontSize: t.size, fontWeight: t.weight, color: N.dark, letterSpacing: t.spacing, minWidth: 200 }}>{t.label}</span>
                    <span style={{ fontSize: 12, color: N.textLight, fontFamily: "monospace" }}>{t.size}px / {t.weight}</span>
                    <span style={{ fontSize: 12, color: N.textMid }}>{t.usage}</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══ ESPACEMENTS ═══ */}
        {activeSection === "spacing" && (
          <Section title="Espacements & Rayons">
            <SubSection title="Border radius">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { r: 12, label: "radius (12px)", usage: "Cards, modales, panneaux" },
                  { r: 10, label: "radiusSm (10px)", usage: "Boutons" },
                  { r: 8, label: "radiusXs (8px)", usage: "Inputs, pills, badges internes" },
                  { r: 999, label: "999px", usage: "Badges, avatars, pills" },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: item.r, background: N.primaryLight, border: `2px solid ${N.primary}`, margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: N.dark }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: N.textLight }}>{item.usage}</div>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Shadows">
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1, padding: 24, borderRadius: N.radius, background: N.card, boxShadow: N.shadow }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: N.dark }}>Shadow default</div>
                  <div style={{ fontSize: 11, color: N.textLight, fontFamily: "monospace", marginTop: 4 }}>0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)</div>
                </div>
                <div style={{ flex: 1, padding: 24, borderRadius: N.radius, background: N.card, boxShadow: N.shadowHover }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: N.dark }}>Shadow hover</div>
                  <div style={{ fontSize: 11, color: N.textLight, fontFamily: "monospace", marginTop: 4 }}>0 4px 16px rgba(26,26,46,0.08), 0 12px 32px rgba(91,78,196,0.06)</div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Règles d'espacement">
              <div style={{ padding: "16px 20px", borderRadius: N.radius, background: N.card, border: `1px solid ${N.border}` }}>
                <Do text="Padding intérieur cards ≥ 20px (16px minimum sur mobile)" />
                <Do text="Gap entre cards ≥ 16px" />
                <Do text="Sections séparées par 32-48px de vide" />
                <Do text="Max 5-7 éléments distincts visibles sans scroll" />
                <Do text="Inputs : padding 10px 14px" />
                <Do text="Boutons : padding 9px 22px (primaire) / 9px 16px (secondaire)" />
              </div>
            </SubSection>

            <SubSection title="Animation">
              <div style={{ padding: "16px 20px", borderRadius: N.radius, background: N.card, border: `1px solid ${N.border}` }}>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: N.dark, marginBottom: 8 }}>cubic-bezier(0.16, 1, 0.3, 1)</div>
                <div style={{ fontSize: 12, color: N.textLight }}>Easing principal pour toutes les transitions. Rapide au départ, doux à l'arrivée. Durée : 150-250ms pour les micro-interactions, 300-400ms pour les panneaux/modales.</div>
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══ COMPOSANTS ═══ */}
        {activeSection === "components" && (
          <Section title="Composants">
            <SubSection title="Boutons">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button style={{ fontSize: 13, fontWeight: 600, padding: "9px 22px", borderRadius: N.radiusSm, border: "none", background: N.primary, color: "#fff", cursor: "pointer" }}>Bouton primaire</button>
                <button style={{ fontSize: 13, padding: "9px 18px", borderRadius: N.radiusSm, border: `1px solid ${N.borderMed}`, background: N.card, color: N.textMid, cursor: "pointer" }}>Secondaire</button>
                <button style={{ fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: N.radiusSm, border: "none", background: N.success, color: "#fff", cursor: "pointer" }}>Succès</button>
                <button style={{ fontSize: 13, padding: "9px 18px", borderRadius: N.radiusSm, border: `1px solid ${N.dangerBorder}`, background: "transparent", color: N.danger, cursor: "pointer" }}>Danger</button>
                <button style={{ fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: N.radiusSm, border: "none", background: N.gradient, color: "#fff", cursor: "pointer" }}>Gradient (rare)</button>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: N.radiusXs, border: "none", background: N.primary, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>🎙️ Enregistrer</button>
                <button style={{ fontSize: 12, padding: "6px 12px", borderRadius: N.radiusXs, border: `1px solid ${N.borderMed}`, background: N.card, color: N.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>✏️ Note</button>
                <button style={{ padding: "12px", borderRadius: N.radiusXs, border: `2px dashed ${N.borderMed}`, background: "transparent", fontSize: 13, fontWeight: 600, color: N.primary, cursor: "pointer" }}>+ Ajouter</button>
              </div>
            </SubSection>

            <SubSection title="Badges">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: N.primaryLight, color: N.primary }}>Anorexie mentale</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: N.tealLight, color: N.teal }}>Routine</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: N.warningBg, color: N.warning }}>Brouillon · à valider</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: N.dangerBg, color: N.danger }}>Critique</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: N.successBg, color: N.success }}>Accepté</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: N.bgAlt, color: N.textMid }}>Psychiatrie</span>
              </div>
            </SubSection>

            <SubSection title="Cards">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: N.card, borderRadius: N.radius, border: `1px solid ${N.border}`, boxShadow: N.shadow, padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: N.textLight, marginBottom: 8 }}>Card standard</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: N.dark }}>Fond blanc, border subtle, shadow douce</div>
                </div>
                <div style={{ background: "rgba(91,78,196,0.015)", borderRadius: N.radius, border: `2px solid rgba(91,78,196,0.15)`, boxShadow: N.shadow, padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: N.primary, marginBottom: 8 }}>Card accent</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: N.dark }}>Bordure violet — "Votre prochaine étape"</div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Tabs (segmented control)">
              <div style={{ display: "flex", gap: 2, background: N.bgAlt, borderRadius: N.radiusXs + 2, padding: 3, maxWidth: 500 }}>
                {["Vue globale", "Suivi", "Parcours", "Dossier", "Coordination"].map((t, i) => (
                  <button key={t} style={{ flex: 1, padding: "9px 8px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", borderRadius: N.radiusXs, background: i === 0 ? N.card : "transparent", color: i === 0 ? N.dark : N.textLight, boxShadow: i === 0 ? N.shadow : "none" }}>{t}</button>
                ))}
              </div>
            </SubSection>

            <SubSection title="Toggle">
              <div style={{ display: "flex", gap: 24 }}>
                {[true, false].map((on, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 44, height: 24, borderRadius: 12, padding: 2, background: on ? N.primary : N.borderMed }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", transform: on ? "translateX(20px)" : "translateX(0)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: `transform 0.2s ${N.ease}` }} />
                    </div>
                    <span style={{ fontSize: 13, color: N.dark }}>{on ? "Activé" : "Désactivé"}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Avatar">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {[24, 28, 32, 38, 42].map(s => (
                  <div key={s} style={{ width: s, height: s, borderRadius: "50%", background: N.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: s * 0.35, fontWeight: 700 }}>SK</div>
                ))}
                <span style={{ fontSize: 12, color: N.textLight }}>24 / 28 / 32 / 38 / 42px</span>
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══ PATTERNS ═══ */}
        {activeSection === "patterns" && (
          <Section title="Patterns d'interface">
            <SubSection title="Layout par page">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { page: "Dashboard", layout: "Sidebar + Main (2/3) + Right sidebar (1/3)" },
                  { page: "Fiche patient", layout: "Full width avec tabs segmented control" },
                  { page: "Vue globale", layout: "Main (2/3) + Right sidebar (1/3)" },
                  { page: "Agenda", layout: "Sidebar + Main (grille) + Drawer conditionnel" },
                  { page: "Adressages", layout: "Sidebar + Liste (1/2) + Panneau détail (1/2)" },
                  { page: "Intelligence", layout: "Centré 900px max, toggle search/QA" },
                  { page: "Réglages", layout: "Left nav tabs (220px) + Content area" },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: N.radiusXs, background: N.card, border: `1px solid ${N.border}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: N.primary, minWidth: 120 }}>{p.page}</span>
                    <span style={{ fontSize: 13, color: N.textMid }}>{p.layout}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Grammaire d'interaction">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { action: "VOIR DÉTAILS", pattern: "Panneau latéral (drawer) — jamais modale plein écran" },
                  { action: "CRÉER", pattern: "Bouton '+' en haut à droite de la section" },
                  { action: "MODIFIER", pattern: "Inline edit ou icône au hover" },
                  { action: "SUPPRIMER", pattern: "Menu '...' + confirmation explicite + soft delete 30s" },
                  { action: "NAVIGUER", pattern: "Clic sur le titre de l'élément" },
                  { action: "FILTRER", pattern: "Pills/tabs en haut de la liste" },
                  { action: "CHERCHER", pattern: "⌘K (CommandPalette) ou barre de recherche" },
                  { action: "BRIEFING", pattern: "PrepMode — modale plein écran (exception au drawer)" },
                  { action: "ENREGISTRER", pattern: "Widget flottant draggable" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "8px 14px", borderRadius: N.radiusXs, background: i % 2 === 0 ? N.bg : N.card }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: N.primary, minWidth: 130, fontFamily: "monospace" }}>{a.action}</span>
                    <span style={{ fontSize: 13, color: N.textMid }}>{a.pattern}</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══ COULEURS CLINIQUES ═══ */}
        {activeSection === "clinical" && (
          <Section title="Couleurs cliniques (non modifiables)">
            <SubSection title="Statuts RDV (agenda)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { label: "PENDING", color: "#E6993E", desc: "En attente" },
                  { label: "CONFIRMED", color: "#5B4EC4", desc: "Confirmé" },
                  { label: "ARRIVED", color: "#2BA84A", desc: "Patient arrivé" },
                  { label: "COMPLETED", color: "#8A8A96", desc: "Terminé" },
                  { label: "CANCELLED", color: "#D94F4F", desc: "Annulé" },
                  { label: "NO_SHOW", color: "#C0792A", desc: "Absent" },
                  { label: "ABSENCE", color: "#B4B2A9", desc: "Indisponible" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: N.radiusXs, border: `1px solid ${N.border}` }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: N.dark, fontFamily: "monospace" }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: N.textLight }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Statuts CIE (parcours)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { label: "FUTURE", color: N.bgAlt, border: N.border, text: N.textLight, desc: "À venir" },
                  { label: "APPROACHING", color: N.primaryLight, border: "rgba(91,78,196,0.2)", text: N.primary, desc: "Dans 7 jours" },
                  { label: "IN_WINDOW", color: N.successBg, border: "rgba(43,168,74,0.2)", text: N.success, desc: "À faire" },
                  { label: "OVERDUE", color: N.dangerBg, border: N.dangerBorder, text: N.danger, desc: "En retard" },
                  { label: "COMPLETED", color: N.tealLight, border: "rgba(43,168,156,0.2)", text: N.teal, desc: "Fait" },
                  { label: "SKIPPED", color: N.bgAlt, border: N.border, text: N.textLight, desc: "Sauté" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "10px 14px", borderRadius: N.radiusXs, background: s.color, border: `1px solid ${s.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: N.textLight }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Priorités adressage">
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "ROUTINE", color: N.success, bg: N.successBg, desc: "4-6 semaines" },
                  { label: "URGENT", color: N.warning, bg: N.warningBg, desc: "15 jours" },
                  { label: "EMERGENCY", color: N.danger, bg: N.dangerBg, desc: "48-72h" },
                ].map((p, i) => (
                  <div key={i} style={{ flex: 1, padding: "14px 16px", borderRadius: N.radiusXs, background: p.bg, borderLeft: `4px solid ${p.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: N.textLight, marginTop: 2 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Catégories knowledge (ordre d'autorité)">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "REF", color: "#1D4ED8" },
                  { label: "ALGO", color: "#7C3AED" },
                  { label: "PCR", color: N.teal },
                  { label: "KE", color: N.warning },
                  { label: "SEM", color: N.primary },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: N.radiusXs, background: `${c.color}12`, border: `1px solid ${c.color}25` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: N.textLight }}>#{i + 1}</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══ ICONOGRAPHIE ═══ */}
        {activeSection === "icons" && (
          <Section title="Iconographie (emojis natifs)">
            <div style={{ padding: "14px 18px", borderRadius: N.radius, background: N.primaryLight, fontSize: 13, color: N.primary, marginBottom: 24 }}>
              Nami utilise des emojis natifs (pas de bibliothèque SVG). Zéro dépendance, rendu natif, cohérent avec l&apos;identité chaleureuse et non-corporate.
            </div>

            <SubSection title="Navigation (sidebar)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { emoji: "⊞", label: "Aujourd'hui" }, { emoji: "📅", label: "Agenda" },
                  { emoji: "💳", label: "Facturation" }, { emoji: "👤", label: "Patients" },
                  { emoji: "🔔", label: "Rappels" }, { emoji: "✓", label: "Tâches" },
                  { emoji: "📋", label: "Références" }, { emoji: "📚", label: "Base documentaire" },
                  { emoji: "💬", label: "Messages" }, { emoji: "↗", label: "Adressages" },
                  { emoji: "👥", label: "Vue réseau" }, { emoji: "◉", label: "Collaboration" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: N.radiusXs, border: `1px solid ${N.border}`, background: N.card }}>
                    <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{item.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: N.dark }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Header patient (6 boutons — jamais cachés)">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { emoji: "✏️", label: "Note", usage: "NoteInline sous le header" },
                  { emoji: "☑️", label: "Tâche", usage: "QuickTaskModal" },
                  { emoji: "📋", label: "Questionnaire", usage: "EDE-Q / PHQ-9 / etc." },
                  { emoji: "↗️", label: "Adresser", usage: "ReferralModal 3 étapes" },
                  { emoji: "🎙️", label: "Enregistrer", usage: "ConsultationWidget" },
                  { emoji: "✨", label: "Synthèse", usage: "Résumé IA async" },
                ].map((btn, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: N.radiusXs, border: `1px solid ${N.border}`, background: N.card, minWidth: 130 }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{btn.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: N.dark }}>{btn.label}</div>
                    <div style={{ fontSize: 11, color: N.textLight, marginTop: 2 }}>{btn.usage}</div>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Types de notes (bordure gauche colorée)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { emoji: "📝", label: "Évolution", color: N.primary },
                  { emoji: "📊", label: "SOAP", color: N.teal },
                  { emoji: "📈", label: "Progression", color: N.success },
                  { emoji: "👥", label: "Équipe", color: N.warning },
                  { emoji: "✨", label: "Résumé IA", color: "rgba(91,78,196,0.5)" },
                  { emoji: "📞", label: "Appel téléphonique", color: N.textLight },
                ].map((note, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: N.radiusXs, borderLeft: `4px solid ${note.color}`, background: N.card, border: `1px solid ${N.border}`, borderLeftWidth: 4, borderLeftColor: note.color }}>
                    <span style={{ fontSize: 16 }}>{note.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: N.dark }}>{note.label}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Confidence IA (photos repas)">
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { emoji: "🟢", label: "High", desc: "Photo claire, aliments identifiables", bg: N.successBg, color: N.success },
                  { emoji: "🟡", label: "Medium", desc: "Photo floue ou description ambiguë", bg: N.warningBg, color: N.warning },
                  { emoji: "🔴", label: "Low", desc: "Photo illisible ou insuffisante", bg: N.dangerBg, color: N.danger },
                ].map((c, i) => (
                  <div key={i} style={{ flex: 1, padding: "14px 16px", borderRadius: N.radiusXs, background: c.bg }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: N.textLight, marginTop: 2 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══ RÈGLES ═══ */}
        {activeSection === "rules" && (
          <Section title="Règles de design">
            <SubSection title="Jamais">
              <div style={{ padding: "16px 20px", borderRadius: N.radius, background: N.card, border: `1px solid ${N.border}` }}>
                <Rule text="Fond blanc pur (#FFFFFF) comme background global — toujours #FAFAF8" />
                <Rule text="Couleur indigo #4F46E5 — Nami est violet #5B4EC4 + teal #2BA89C" />
                <Rule text="Plus de 2 sections sombres par page" />
                <Rule text="Cacher les 6 boutons du header patient dans un menu" />
                <Rule text="Modal pour les notes (toujours inline sous le header)" />
                <Rule text="Statut 'Lu' sur les messages (médicolégal)" />
                <Rule text="Pré-cocher le consentement patient (légal — Art. L.1110-4 CSP)" />
                <Rule text="Supprimer le badge 'Brouillon IA' (AI Act Art. 50)" />
                <Rule text="Delta vert = toujours bon — vérifier DELTA_POLARITY par métrique" />
                <Rule text="Cases de 30min fixes dans l'agenda (pixel/minute 2px/min)" />
                <Rule text="Overlay bloquant sur le ConsultationWidget (draggable uniquement)" />
                <Rule text="Wording : 'alerte', 'surveillance', 'risque', 'anormal' (compliance MDR)" />
              </div>
            </SubSection>

            <SubSection title="Toujours">
              <div style={{ padding: "16px 20px", borderRadius: N.radius, background: N.card, border: `1px solid ${N.border}` }}>
                <Do text="Badge 'Brouillon IA — à vérifier' sur tout output IA" />
                <Do text="Bannière 🚨 15/112 visible en permanence dans la messagerie" />
                <Do text="Bouton export RGPD accessible (Art. 15 & 20)" />
                <Do text="Sources citées dans les réponses QA clinique (Art. 50 AI Act)" />
                <Do text="Disclaimer MDR sous toute réponse QA" />
                <Do text="EMERGENCY en tête de liste des adressages" />
                <Do text="Fond crème #FAFAF8 — jamais blanc pur comme fond global" />
                <Do text="Plus Jakarta Sans pour l'UI, Inter pour les données numériques" />
                <Do text="1 seul bouton primaire violet (#5B4EC4) par écran" />
                <Do text="Drawer latéral pour les détails (pas de modal plein écran, sauf PrepMode)" />
                <Do text="easing cubic-bezier(0.16, 1, 0.3, 1) pour toutes les transitions" />
              </div>
            </SubSection>
          </Section>
        )}

      </div>
    </div>
  )
}
