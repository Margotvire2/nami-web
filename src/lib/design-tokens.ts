// Nami Design System — Design Tokens
// Importer depuis toutes les pages cockpit. Ne jamais hardcoder de couleurs ailleurs.
// Référence visuelle : /design-system

// ── Valeurs canoniques ────────────────────────────────────────────────────
// Source de vérité pour les composants React qui ont besoin de valeurs JS
// (style inline, SVG, canvas, calculs dynamiques).
// Pour le CSS pur → utiliser var(--nami-*) depuis globals.css.
// NE PAS modifier les valeurs ici sans mettre à jour globals.css en même temps.

export const N = {
  // Primaires
  primary:       "#5B4EC4",
  primaryHover:  "#4c44b0",
  primaryLight:  "rgba(91,78,196,0.08)",
  primaryMedium: "rgba(91,78,196,0.15)",
  primaryBorder: "rgba(91,78,196,0.2)",
  primaryGlow:   "0 0 0 3px rgba(91,78,196,0.12)",
  teal:          "#2BA89C",   // valeur canonique — NE PAS changer en #3DC5B7
  tealLight:     "rgba(43,168,156,0.08)",
  tealBorder:    "rgba(43,168,156,0.2)",
  gradient:      "linear-gradient(135deg, #5B4EC4, #2BA89C)",
  gradientV:     "linear-gradient(180deg, #5B4EC4, #2BA89C)",

  // Fonds — JAMAIS de blanc pur comme background global
  bg:           "#FAFAF8",
  bgAlt:        "#F5F3EF",
  surface:      "#FFFFFF",
  surfaceRaised:"#FCFBF9",

  // Aliases backward-compat (ancien code)
  card:  "#FFFFFF",
  dark:  "#1A1A2E",

  // Texte — 3 niveaux + faint
  ink:       "#1A1A2E",
  ink2:      "#374151",
  ink3:      "#6B7280",
  inkFaint:  "#9CA3AF",

  // Aliases backward-compat
  textMid:   "#374151",
  textLight: "#6B7280",

  // Bordures — 2 niveaux
  border:    "rgba(26,26,46,0.06)",
  borderMed: "rgba(26,26,46,0.12)",

  // Radius
  radius:    12,
  radiusSm:  8,
  radiusXs:  6,
  radiusLg:  16,
  radiusXl:  20,
  radiusPill:100,

  // Ombres
  shadow:        "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
  shadowHover:   "0 4px 16px rgba(26,26,46,0.08), 0 12px 32px rgba(91,78,196,0.06)",
  shadowDropdown:"0 4px 16px rgba(26,26,46,0.10), 0 1px 4px rgba(26,26,46,0.06)",
  shadowAccent:  "0 2px 10px rgba(91,78,196,0.25)",

  // Motion
  ease:       "cubic-bezier(0.16, 1, 0.3, 1)",
  easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  durFast:    160,
  durMid:     250,
  durSlow:    400,

  // Sémantiques
  danger:        "#D94F4F",
  dangerBg:      "rgba(217,79,79,0.06)",
  dangerBorder:  "rgba(217,79,79,0.15)",
  success:       "#2BA84A",
  successBg:     "rgba(43,168,74,0.06)",
  successBorder: "rgba(43,168,74,0.2)",
  warning:       "#E6993E",
  warningBg:     "rgba(230,153,62,0.06)",
  warningBorder: "rgba(230,153,62,0.2)",
  info:          "#2563EB",
  infoBg:        "rgba(37,99,235,0.06)",
  infoBorder:    "rgba(37,99,235,0.2)",

  // Statuts RDV — valeurs cliniques, NE PAS MODIFIER
  statusPending:   "#E6993E",
  statusConfirmed: "#5B4EC4",
  statusArrived:   "#2BA84A",
  statusCompleted: "#6B7280",
  statusCancelled: "#D94F4F",
  statusNoShow:    "#C0792A",
  statusAbsence:   "#B4B2A9",

  // Backgrounds statuts (8% opacity)
  statusPendingBg:   "rgba(230,153,62,0.08)",
  statusConfirmedBg: "rgba(91,78,196,0.08)",
  statusArrivedBg:   "rgba(43,168,74,0.08)",
  statusCompletedBg: "rgba(107,114,128,0.08)",
  statusCancelledBg: "rgba(217,79,79,0.08)",
  statusNoShowBg:    "rgba(192,121,42,0.08)",

  // Borders statuts (25% opacity)
  statusPendingBorder:   "rgba(230,153,62,0.25)",
  statusConfirmedBorder: "rgba(91,78,196,0.25)",
  statusArrivedBorder:   "rgba(43,168,74,0.25)",
  statusCompletedBorder: "rgba(107,114,128,0.2)",
  statusCancelledBorder: "rgba(217,79,79,0.25)",
  statusNoShowBorder:    "rgba(192,121,42,0.25)",

  // Statuts CIE (parcours) — NE PAS MODIFIER
  cieFuture:     { bg: "#F5F3EF",              border: "rgba(26,26,46,0.06)",   text: "#6B7280" },
  cieApproaching:{ bg: "rgba(91,78,196,0.08)", border: "rgba(91,78,196,0.2)",  text: "#5B4EC4" },
  cieInWindow:   { bg: "rgba(43,168,74,0.06)", border: "rgba(43,168,74,0.2)",  text: "#2BA84A" },
  cieOverdue:    { bg: "rgba(217,79,79,0.06)", border: "rgba(217,79,79,0.15)", text: "#D94F4F" },
  cieCompleted:  { bg: "rgba(43,168,156,0.08)",border: "rgba(43,168,156,0.2)", text: "#2BA89C" },
  cieSkipped:    { bg: "#F5F3EF",              border: "rgba(26,26,46,0.06)",   text: "#6B7280" },

  // Priorités adressage — NE PAS MODIFIER
  priorityRoutine:   { color: "#2BA84A", bg: "rgba(43,168,74,0.06)",   border: "rgba(43,168,74,0.2)"   },
  priorityUrgent:    { color: "#E6993E", bg: "rgba(230,153,62,0.06)",  border: "rgba(230,153,62,0.2)"  },
  priorityEmergency: { color: "#D94F4F", bg: "rgba(217,79,79,0.06)",   border: "rgba(217,79,79,0.15)"  },

  // Catégories knowledge (ordre d'autorité décroissant)
  catRef:  "#1D4ED8",
  catAlgo: "#7C3AED",
  catPcr:  "#2BA89C",
  catKe:   "#E6993E",
  catSem:  "#5B4EC4",

  // Glass surfaces (3 rôles)
  glassOverlayBg:     "rgba(26,26,46,0.4)",
  glassOverlayBlur:   "blur(4px)",
  glassSurfaceBg:     "rgba(250,250,248,0.95)",
  glassSurfaceBlur:   "blur(12px)",
  glassSurfaceBorder: "rgba(26,26,46,0.06)",
  glassChromeBg:      "rgba(250,250,248,0.92)",
  glassChromeBlur:    "blur(8px)",
  glassChromeBorder:  "rgba(26,26,46,0.06)",
}

// Card style réutilisable (pour style inline uniquement — préférer classe .nami-card en CSS)
export const cardStyle: React.CSSProperties = {
  background:   N.surface,
  borderRadius: N.radius,
  border:       `1px solid ${N.border}`,
  boxShadow:    N.shadow,
}

// Section label style réutilisable
export const slStyle: React.CSSProperties = {
  fontSize:      11,
  fontWeight:    700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color:         N.ink3,
  marginBottom:  10,
}

// getStatusColor — retourne la couleur texte du statut
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:                N.statusPending,
    CONFIRMED:              N.statusConfirmed,
    RESCHEDULED:            N.statusCompleted,
    IN_PROGRESS:            N.statusConfirmed,
    ARRIVED:                N.statusArrived,
    PATIENT_ARRIVED:        N.statusArrived,
    COMPLETED:              N.statusCompleted,
    CANCELLED:              N.statusCancelled,
    CANCELLED_BY_PATIENT:   N.statusCancelled,
    CANCELLED_BY_PROVIDER:  N.statusCancelled,
    CANCELLED_BY_SECRETARY: N.statusCancelled,
    CANCELLED_BY_SYSTEM:    N.statusCancelled,
    NO_SHOW:                N.statusNoShow,
    ABSENCE:                N.statusAbsence,
  }
  return map[status] ?? N.ink3
}

// getStatusStyle — retourne { color, bg, border } pour les cartes RDV
// Remplace les STATUS_CONFIG Tailwind hardcodés dans les composants agenda
export function getStatusStyle(status: string): { color: string; bg: string; border: string } {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    PENDING:                { color: N.statusPending,   bg: N.statusPendingBg,   border: N.statusPendingBorder   },
    CONFIRMED:              { color: N.statusConfirmed, bg: N.statusConfirmedBg, border: N.statusConfirmedBorder },
    RESCHEDULED:            { color: N.statusCompleted, bg: N.statusCompletedBg, border: N.statusCompletedBorder },
    IN_PROGRESS:            { color: N.statusConfirmed, bg: N.statusConfirmedBg, border: N.statusConfirmedBorder },
    ARRIVED:                { color: N.statusArrived,   bg: N.statusArrivedBg,   border: N.statusArrivedBorder   },
    PATIENT_ARRIVED:        { color: N.statusArrived,   bg: N.statusArrivedBg,   border: N.statusArrivedBorder   },
    COMPLETED:              { color: N.statusCompleted, bg: N.statusCompletedBg, border: N.statusCompletedBorder },
    CANCELLED:              { color: N.statusCancelled, bg: N.statusCancelledBg, border: N.statusCancelledBorder },
    CANCELLED_BY_PATIENT:   { color: N.statusCancelled, bg: N.statusCancelledBg, border: N.statusCancelledBorder },
    CANCELLED_BY_PROVIDER:  { color: N.statusCancelled, bg: N.statusCancelledBg, border: N.statusCancelledBorder },
    CANCELLED_BY_SECRETARY: { color: N.statusCancelled, bg: N.statusCancelledBg, border: N.statusCancelledBorder },
    CANCELLED_BY_SYSTEM:    { color: N.statusCancelled, bg: N.statusCancelledBg, border: N.statusCancelledBorder },
    NO_SHOW:                { color: N.statusNoShow,    bg: N.statusNoShowBg,    border: N.statusNoShowBorder    },
    ABSENCE:                { color: N.statusAbsence,   bg: N.statusCompletedBg, border: N.statusCompletedBorder },
  }
  return map[status] ?? { color: N.ink3, bg: N.bgAlt, border: N.border }
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:                "En attente",
    CONFIRMED:              "Confirmé",
    RESCHEDULED:            "Reporté",
    IN_PROGRESS:            "En cours",
    ARRIVED:                "Arrivé",
    PATIENT_ARRIVED:        "Arrivé",
    COMPLETED:              "Terminé",
    CANCELLED:              "Annulé",
    CANCELLED_BY_PATIENT:   "Annulé (patient)",
    CANCELLED_BY_PROVIDER:  "Annulé (soignant)",
    CANCELLED_BY_SECRETARY: "Annulé (secrét.)",
    CANCELLED_BY_SYSTEM:    "Annulé (système)",
    NO_SHOW:                "Absent",
    ABSENCE:                "Indisponible",
  }
  return map[status] ?? status
}

export function getCieStyle(status: string) {
  const map: Record<string, typeof N.cieFuture> = {
    FUTURE:     N.cieFuture,
    APPROACHING:N.cieApproaching,
    IN_WINDOW:  N.cieInWindow,
    OVERDUE:    N.cieOverdue,
    COMPLETED:  N.cieCompleted,
    SKIPPED:    N.cieSkipped,
  }
  return map[status] ?? N.cieFuture
}
