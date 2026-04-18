// ─── PALETTE NAMI HARMONISÉE ─────────────────────────────────────────────────
// Violet  = données primaires (faim, intensité, énergie)
// Teal    = données secondaires (rassasiement, plaisir, positif)
// Ardoise = neutre (métadonnées, timestamps, contexte, douleur)

export const namiPalette = {
  violet: {
    50:  "#EDE9FE",
    100: "#DDD6FE",
    200: "#C4B5FD",
    400: "#A78BFA",
    500: "#7C3AED",
    600: "#6D28D9",
    700: "#5B21B6",
  },
  teal: {
    50:  "#CCFBF1",
    100: "#99F6E4",
    200: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
  },
  slate: {
    50:  "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
  },
} as const

// ─── USAGE SENSATIONS ────────────────────────────────────────────────────────
export const SENSATION_COLORS = {
  hunger:    { bar: namiPalette.violet[500], bg: namiPalette.violet[50]  },
  satiety:   { bar: namiPalette.teal[500],   bg: namiPalette.teal[50]    },
  pleasure:  { bar: namiPalette.teal[400],   bg: namiPalette.teal[50]    },
  intensity: { bar: namiPalette.violet[500], bg: namiPalette.violet[50]  },
  energy:    { bar: namiPalette.violet[400], bg: namiPalette.violet[50]  },
  pain:      { bar: namiPalette.slate[400],  bg: namiPalette.slate[100]  },
  quality:   { bar: namiPalette.teal[500],   bg: namiPalette.teal[50]    },
}

// ─── MACROS ──────────────────────────────────────────────────────────────────
export const MACRO_COLORS = {
  protein: namiPalette.violet[500],
  carbs:   namiPalette.teal[500],
  fat:     namiPalette.slate[400],
  fiber:   namiPalette.teal[200],
}
