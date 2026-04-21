---
name: nami-design-system
description: Référence complète du design system Nami — tokens couleurs, typographie, composants, règles et patterns. Utiliser SYSTÉMATIQUEMENT avant toute création ou modification UI dans nami-web. Déclencher sur : toute création de composant, page ou style, toute mention de couleur/typo/spacing, toute question sur le design Nami.
---

# Nami Design System — Référence Claude

**Page visuelle interactive :** `/design-system` sur nami-web-orpin.vercel.app/design-system

---

## Tokens couleurs (const N)

```ts
primary:      "#5B4EC4"              // violet Nami — boutons, liens, focus
primaryHover: "#4c44b0"              // hover bouton primaire
primaryLight: "rgba(91,78,196,0.08)" // backgrounds légers, highlights
teal:         "#2BA89C"              // secondaire, validations
tealLight:    "rgba(43,168,156,0.08)"
bg:           "#FAFAF8"              // fond global — JAMAIS blanc pur
bgAlt:        "#F5F3EF"              // zones inactives, cards secondaires
card:         "#FFFFFF"              // surface des cards
dark:         "#1A1A2E"              // titres, labels
textMid:      "#4A4A5A"              // corps de texte
textLight:    "#8A8A96"              // labels secondaires, timestamps
border:       "rgba(26,26,46,0.06)"  // bordures par défaut
borderMed:    "rgba(26,26,46,0.12)"  // hover, boutons secondaires
danger:       "#D94F4F"
success:      "#2BA84A"
warning:      "#E6993E"
info:         "#2563EB"
gradient:     "linear-gradient(135deg, #5B4EC4, #2BA89C)"
shadow:       "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)"
shadowHover:  "0 4px 16px rgba(26,26,46,0.08), 0 12px 32px rgba(91,78,196,0.06)"
radius:   12  // cards, modales, panneaux
radiusSm: 10  // boutons
radiusXs: 8   // inputs, pills, badges
ease: "cubic-bezier(0.16, 1, 0.3, 1)"
```

**JAMAIS utiliser** `#4F46E5` (ancien indigo) — c'est l'ancienne palette, remplacée par `#5B4EC4`.

---

## Typographie

- **Plus Jakarta Sans** → UI, titres, boutons, navigation — PARTOUT sauf data
- **Inter** → données numériques, stats, valeurs bio (47.8 kg, IMC 17.7)
- Échelle : 26px/700 page title → 10px/600 badge text
- Section labels : 11px / 700 / uppercase / letterSpacing 0.06em / color textLight

---

## Composants clés

### Bouton primaire
```tsx
<button style={{
  fontSize: 13, fontWeight: 600, padding: "9px 22px",
  borderRadius: 10, border: "none",
  background: "#5B4EC4", color: "#fff", cursor: "pointer"
}}>Label</button>
```

### Badge
```tsx
<span style={{
  fontSize: 10, fontWeight: 600, padding: "3px 10px",
  borderRadius: 999, background: "rgba(91,78,196,0.08)", color: "#5B4EC4"
}}>Label</span>
```

### Card standard
```tsx
style={{
  background: "#fff", borderRadius: 12,
  border: "1px solid rgba(26,26,46,0.06)",
  boxShadow: "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)"
}}
```

### Toggle
```tsx
// width 44, height 24, borderRadius 12, padding 2
// background: on ? "#5B4EC4" : "rgba(26,26,46,0.12)"
// knob: width 20, height 20, borderRadius 50%, transform translateX(20px) si on
```

### Section label (SL)
```tsx
<div style={{
  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.06em", color: "#8A8A96", marginBottom: 10
}}>TITRE</div>
```

---

## Règles absolues

### JAMAIS
- `#FFFFFF` comme fond global → toujours `#FAFAF8`
- `#4F46E5` (indigo) → remplacé par `#5B4EC4`
- Cacher les 6 boutons du header patient dans un menu
- Modal pour les notes (inline uniquement)
- Badge "Brouillon IA" supprimé (AI Act Art. 50)
- `checked: true` sans possibilité de décocher sur consentements patients (Art. L.1110-4 CSP)
- Delta vert = toujours bien → vérifier DELTA_POLARITY par métrique

### TOUJOURS
- Badge "Brouillon IA — à vérifier" sur tout output IA
- Bannière 🚨 15/112 visible dans messagerie
- 1 seul bouton primaire par écran
- Drawer latéral pour les détails (pas modal plein écran, sauf PrepMode)
- easing `cubic-bezier(0.16, 1, 0.3, 1)` pour toutes les transitions
- EMERGENCY en tête de liste adressages

---

## Couleurs cliniques (immuables)

### Statuts RDV
- PENDING → `#E6993E` | CONFIRMED → `#5B4EC4` | ARRIVED → `#2BA84A`
- COMPLETED → `#8A8A96` | CANCELLED → `#D94F4F` | NO_SHOW → `#C0792A`

### Statuts CIE (parcours)
- FUTURE → bgAlt / APPROACHING → primaryLight / IN_WINDOW → successBg
- OVERDUE → dangerBg / COMPLETED → tealLight / SKIPPED → bgAlt

### Priorités adressage
- ROUTINE → `#2BA84A` | URGENT → `#E6993E` | EMERGENCY → `#D94F4F`

### Catégories knowledge (ordre d'autorité)
- REF `#1D4ED8` → ALGO `#7C3AED` → PCR teal → KE warning → SEM primary

---

## Layout patterns

| Page | Layout |
|------|--------|
| /aujourd-hui | Main 2/3 + Right sidebar 1/3 |
| /patients/[id] | Full width + segmented tabs |
| /agenda | Grille + Drawer conditionnel |
| /adressages | Liste 1/2 + Panneau détail 1/2 |
| /reglages | Left nav 220px + Content area |
| /intelligence | Centré 900px max, toggle search/QA |

---

## Grammaire d'interaction
- VOIR DÉTAILS → drawer latéral (pas modal)
- CRÉER → bouton "+" haut droite
- MODIFIER → inline edit ou icône au hover
- SUPPRIMER → menu "..." + confirmation + soft delete 30s toast
- CHERCHER → ⌘K (CommandPalette)
- BRIEFING → PrepMode (seule exception modale plein écran)
- ENREGISTRER → ConsultationWidget draggable
