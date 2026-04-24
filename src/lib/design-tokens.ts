// Nami Design System — Design Tokens
// Importer depuis toutes les pages cockpit. Ne jamais hardcoder de couleurs ailleurs.
// Référence visuelle : /design-system

export const N = {
  // Primaires
  primary:      "#5B4EC4",
  primaryHover: "#4c44b0",
  primaryLight: "rgba(91,78,196,0.08)",
  teal:         "#2BA89C",
  tealLight:    "rgba(43,168,156,0.08)",

  // Fonds — JAMAIS de blanc pur comme background global
  bg:    "#FAFAF8",
  bgAlt: "#F5F3EF",
  card:  "#FFFFFF",

  // Texte — 3 niveaux
  dark:      "#1A1A2E",
  textMid:   "#374151",
  textLight: "#6B7280",

  // Bordures — 2 niveaux
  border:    "rgba(26,26,46,0.06)",
  borderMed: "rgba(26,26,46,0.12)",

  // Sémantiques
  danger:       "#D94F4F",
  dangerBg:     "rgba(217,79,79,0.06)",
  dangerBorder: "rgba(217,79,79,0.15)",
  success:      "#2BA84A",
  successBg:    "rgba(43,168,74,0.06)",
  warning:      "#E6993E",
  warningBg:    "rgba(230,153,62,0.06)",
  info:         "#2563EB",
  infoBg:       "rgba(37,99,235,0.06)",

  // Gradient & effets
  gradient:    "linear-gradient(135deg, #5B4EC4, #2BA89C)",
  shadow:      "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
  shadowHover: "0 4px 16px rgba(26,26,46,0.08), 0 12px 32px rgba(91,78,196,0.06)",

  // Rayons
  radius:   12,
  radiusSm: 10,
  radiusXs: 8,

  // Animation
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",

  // Statuts RDV — couleurs cliniques, NE PAS MODIFIER
  statusPending:   "#E6993E",
  statusConfirmed: "#5B4EC4",
  statusArrived:   "#2BA84A",
  statusCompleted: "#6B7280",
  statusCancelled: "#D94F4F",
  statusNoShow:    "#C0792A",
  statusAbsence:   "#B4B2A9",

  // Statuts CIE (parcours) — couleurs cliniques, NE PAS MODIFIER
  cieFuture:     { bg: "#F5F3EF", border: "rgba(26,26,46,0.06)", text: "#6B7280" },
  cieApproaching:{ bg: "rgba(91,78,196,0.08)", border: "rgba(91,78,196,0.2)", text: "#5B4EC4" },
  cieInWindow:   { bg: "rgba(43,168,74,0.06)", border: "rgba(43,168,74,0.2)", text: "#2BA84A" },
  cieOverdue:    { bg: "rgba(217,79,79,0.06)", border: "rgba(217,79,79,0.15)", text: "#D94F4F" },
  cieCompleted:  { bg: "rgba(43,168,156,0.08)", border: "rgba(43,168,156,0.2)", text: "#2BA89C" },
  cieSkipped:    { bg: "#F5F3EF", border: "rgba(26,26,46,0.06)", text: "#6B7280" },

  // Priorités adressage — NE PAS MODIFIER
  priorityRoutine:   { color: "#2BA84A", bg: "rgba(43,168,74,0.06)" },
  priorityUrgent:    { color: "#E6993E", bg: "rgba(230,153,62,0.06)" },
  priorityEmergency: { color: "#D94F4F", bg: "rgba(217,79,79,0.06)" },

  // Catégories knowledge (ordre d'autorité décroissant)
  catRef:  "#1D4ED8",
  catAlgo: "#7C3AED",
  catPcr:  "#2BA89C",
  catKe:   "#E6993E",
  catSem:  "#5B4EC4",
}

// Card style réutilisable
export const cardStyle: React.CSSProperties = {
  background:   N.card,
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
  color:         N.textLight,
  marginBottom:  10,
}

// Helpers statuts RDV
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:          N.statusPending,
    CONFIRMED:        N.statusConfirmed,
    ARRIVED:          N.statusArrived,
    PATIENT_ARRIVED:  N.statusArrived,
    COMPLETED:        N.statusCompleted,
    CANCELLED:        N.statusCancelled,
    NO_SHOW:          N.statusNoShow,
    ABSENCE:          N.statusAbsence,
  }
  return map[status] ?? N.textLight
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:         "En attente",
    CONFIRMED:       "Confirmé",
    ARRIVED:         "Arrivé",
    PATIENT_ARRIVED: "Arrivé",
    COMPLETED:       "Terminé",
    CANCELLED:       "Annulé",
    NO_SHOW:         "Absent",
    ABSENCE:         "Indisponible",
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
