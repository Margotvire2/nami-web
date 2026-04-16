/**
 * Dictionnaire de nomenclature des panels biologiques.
 * Source : NABM (Nomenclature des Actes de Biologie Médicale).
 *
 * ⚠️ Ce fichier est un mapping TERMINOLOGIQUE, PAS de l'aide à la décision.
 * Nami ne suggère ni ne recommande d'examens complémentaires.
 * Il décompose uniquement ce que le prescripteur a énoncé.
 */

export interface LabPanel {
  label: string;
  components: string[];
  nabmCode?: string;
  /** Panels dont ce test est déjà un composant */
  containedIn?: string[];
}

export const LAB_PANELS: Record<string, LabPanel> = {
  // ─── Panels composites ──────────────────────────────────────────────────────
  ionogramme: {
    label: "Ionogramme sanguin",
    components: ["Sodium (Na)", "Potassium (K)", "Chlore (Cl)", "Bicarbonates (CO₂)"],
    nabmCode: "0592",
  },
  "ionogramme urinaire": {
    label: "Ionogramme urinaire",
    components: ["Sodium urinaire", "Potassium urinaire", "Chlore urinaire"],
  },
  "bilan hépatique": {
    label: "Bilan hépatique",
    components: ["ASAT (SGOT)", "ALAT (SGPT)", "GGT", "Phosphatases alcalines (PAL)", "Bilirubine totale"],
  },
  "bilan lipidique": {
    label: "Exploration d'une anomalie lipidique (EAL)",
    components: ["Cholestérol total", "HDL-cholestérol", "LDL-cholestérol (calculé)", "Triglycérides"],
    nabmCode: "0996",
  },
  "bilan rénal": {
    label: "Bilan rénal",
    components: ["Créatinine", "DFG estimé (CKD-EPI)", "Urée"],
  },
  "bilan thyroïdien": {
    label: "Bilan thyroïdien",
    components: ["TSH"],
  },
  "bilan martial": {
    label: "Bilan martial",
    components: ["Fer sérique", "Ferritine", "Transferrine", "Coefficient de saturation"],
  },
  "bilan phosphocalcique": {
    label: "Bilan phosphocalcique",
    components: ["Calcium", "Phosphore", "Vitamine D (25-OH)"],
  },
  "bilan nutritionnel": {
    label: "Bilan nutritionnel",
    components: ["Albumine", "Pré-albumine (transthyrétine)", "CRP"],
  },
  nfs: {
    label: "Numération Formule Sanguine (NFS)",
    components: ["Hémoglobine", "Hématocrite", "Leucocytes", "Plaquettes", "VGM", "Formule leucocytaire"],
    nabmCode: "1104",
  },
  hémostase: {
    label: "Bilan d'hémostase",
    components: ["TP (taux de prothrombine)", "TCA", "INR"],
  },
  "bilan inflammatoire": {
    label: "Bilan inflammatoire",
    components: ["CRP", "VS (vitesse de sédimentation)"],
  },
  "bilan pancréatique": {
    label: "Bilan pancréatique",
    components: ["Lipase", "Amylase"],
  },
  transaminases: {
    label: "Transaminases",
    components: ["ASAT (SGOT)", "ALAT (SGPT)"],
    containedIn: ["bilan hépatique"],
  },
  "bilan biologique": {
    label: "Bilan biologique standard",
    components: ["NFS", "Ionogramme", "Créatinine", "CRP"],
  },

  // ─── Dosages isolés (souvent subsets d'un panel) ──────────────────────────
  kaliémie: {
    label: "Kaliémie",
    components: ["Potassium (K)"],
    containedIn: ["ionogramme"],
  },
  natrémie: {
    label: "Natrémie",
    components: ["Sodium (Na)"],
    containedIn: ["ionogramme"],
  },
  créatinine: {
    label: "Créatinine",
    components: ["Créatinine"],
    containedIn: ["bilan rénal"],
  },
  creatinine: {
    label: "Créatinine",
    components: ["Créatinine"],
    containedIn: ["bilan rénal"],
  },
  albumine: {
    label: "Albumine",
    components: ["Albumine"],
    containedIn: ["bilan nutritionnel"],
  },
  ferritine: {
    label: "Ferritine",
    components: ["Ferritine"],
    containedIn: ["bilan martial"],
  },
  glycémie: {
    label: "Glycémie à jeun",
    components: ["Glycémie à jeun"],
  },
  hba1c: {
    label: "Hémoglobine glyquée (HbA1c)",
    components: ["HbA1c"],
  },
  "hémoglobine glyquée": {
    label: "Hémoglobine glyquée (HbA1c)",
    components: ["HbA1c"],
  },
  tsh: {
    label: "TSH",
    components: ["TSH"],
    containedIn: ["bilan thyroïdien"],
  },
  ammoniémie: {
    label: "Ammoniémie",
    components: ["Ammoniémie (NH₃)"],
  },
  crp: {
    label: "CRP (Protéine C-réactive)",
    components: ["CRP"],
    containedIn: ["bilan inflammatoire", "bilan nutritionnel"],
  },
  "vitamine d": {
    label: "Vitamine D (25-OH)",
    components: ["Vitamine D (25-OH)"],
    containedIn: ["bilan phosphocalcique"],
  },
  calcium: {
    label: "Calcémie",
    components: ["Calcium"],
    containedIn: ["bilan phosphocalcique"],
  },
  "acide valproïque": {
    label: "Dosage acide valproïque",
    components: ["Acide valproïque (valproate)"],
  },
  valproate: {
    label: "Dosage valproate",
    components: ["Acide valproïque (valproate)"],
  },
  "taux de valproate": {
    label: "Taux résiduel valproate",
    components: ["Acide valproïque (valproate)"],
  },
};

// ─── expandLabPanel ──────────────────────────────────────────────────────────

export interface LabExpansion {
  expanded: boolean;
  label: string;
  components: string[];
  nabmCode?: string;
  containedIn?: string[];
}

/** Prend un libellé brut et retourne l'expansion NABM si connue. */
export function expandLabPanel(rawLabel: string): LabExpansion {
  const lower = rawLabel.toLowerCase().trim();

  if (LAB_PANELS[lower]) {
    return { expanded: true, ...LAB_PANELS[lower] };
  }

  for (const [key, panel] of Object.entries(LAB_PANELS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { expanded: true, ...panel };
    }
  }

  return { expanded: false, label: rawLabel, components: [rawLabel] };
}

/**
 * Détecte si cet acte est déjà un sous-ensemble d'un autre acte de la liste.
 * Retourne le label du panel parent, ou null.
 */
export function findDuplicatePanel(
  actDescription: string,
  allDescriptions: string[]
): string | null {
  const lower = actDescription.toLowerCase().trim();
  const panel = LAB_PANELS[lower];
  if (!panel?.containedIn) return null;

  for (const parentKey of panel.containedIn) {
    if (allDescriptions.some((d) => d.toLowerCase().trim() === parentKey ||
      d.toLowerCase().includes(parentKey))) {
      return LAB_PANELS[parentKey]?.label ?? parentKey;
    }
  }
  return null;
}
