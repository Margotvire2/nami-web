/**
 * Plages de normalité contextuelles par pathway + patient.
 * Les couleurs dépendent du pathway (TCA vs obésité) et du profil patient (âge, sexe, taille).
 */

export interface MetricRange {
  green: { min: number; max: number } | null;
  orange: { min: number; max: number } | null;
  red: { min: number; max: number } | null;
  label?: string;
}

interface RangeContext {
  sex: "MALE" | "FEMALE";
  age: number;
  height?: number;
  currentWeight?: number;
  pathway: string;
}

type Resolver = (ctx: RangeContext) => MetricRange;

const R: Record<string, Record<string, Resolver>> = {
  weight_kg: {
    "tca.anorexia": (ctx) => {
      const h = ctx.height ?? 165;
      const hm = h / 100;
      const targetBMI = ctx.age < 18 ? 17.5 : 18.5;
      const tw = targetBMI * hm * hm;
      const bmi = ctx.currentWeight ? ctx.currentWeight / (hm * hm) : null;
      return {
        red: { min: 0, max: tw * 0.85 },
        orange: { min: tw * 0.85, max: tw },
        green: { min: tw, max: 200 },
        label: bmi != null ? (bmi < 13 ? "Dénutrition extrême" : bmi < 15 ? "Dénutrition sévère" : bmi < 16 ? "Dénutrition modérée" : bmi < 17.5 ? "Maigreur" : bmi < 18.5 ? "En cours de restauration" : "Poids normal") : undefined,
      };
    },
    obesity: (ctx) => {
      const h = ctx.height ?? 170;
      const bmi = ctx.currentWeight ? ctx.currentWeight / ((h / 100) ** 2) : null;
      return { green: null, orange: null, red: null, label: bmi != null ? (bmi >= 40 ? "Obésité morbide" : bmi >= 35 ? "Obésité sévère" : bmi >= 30 ? "Obésité modérée" : bmi >= 25 ? "Surpoids" : "Normal") : undefined };
    },
    default: (ctx) => {
      const h = (ctx.height ?? 170) / 100;
      return { green: { min: 18.5 * h * h, max: 25 * h * h }, orange: { min: 16 * h * h, max: 18.5 * h * h }, red: { min: 0, max: 16 * h * h } };
    },
  },
  bmi: {
    "tca.anorexia": () => ({ red: { min: 0, max: 15 }, orange: { min: 15, max: 17.5 }, green: { min: 17.5, max: 25 } }),
    obesity: () => ({ green: { min: 18.5, max: 25 }, orange: { min: 25, max: 30 }, red: { min: 30, max: 100 } }),
    default: () => ({ red: { min: 0, max: 16 }, orange: { min: 16, max: 18.5 }, green: { min: 18.5, max: 25 } }),
  },
  heart_rate_bpm: {
    "tca.anorexia": () => ({ red: { min: 0, max: 45 }, orange: { min: 45, max: 55 }, green: { min: 55, max: 100 } }),
    default: () => ({ red: { min: 0, max: 50 }, orange: { min: 50, max: 60 }, green: { min: 60, max: 100 } }),
  },
  potassium_mmol: {
    "tca.anorexia": () => ({ red: { min: 0, max: 3.0 }, orange: { min: 3.0, max: 3.5 }, green: { min: 3.5, max: 5.0 } }),
    "tca.bulimia": () => ({ red: { min: 0, max: 2.8 }, orange: { min: 2.8, max: 3.5 }, green: { min: 3.5, max: 5.0 } }),
    default: () => ({ red: { min: 0, max: 3.0 }, orange: { min: 3.0, max: 3.5 }, green: { min: 3.5, max: 5.0 } }),
  },
  phosphore_mmol: {
    "tca.anorexia": () => ({ red: { min: 0, max: 0.6 }, orange: { min: 0.6, max: 0.8 }, green: { min: 0.8, max: 1.5 } }),
    default: () => ({ red: { min: 0, max: 0.6 }, orange: { min: 0.6, max: 0.8 }, green: { min: 0.8, max: 1.5 } }),
  },
  albumin_gl: {
    "tca.anorexia": () => ({ red: { min: 0, max: 25 }, orange: { min: 25, max: 30 }, green: { min: 30, max: 50 } }),
    default: () => ({ red: { min: 0, max: 25 }, orange: { min: 25, max: 35 }, green: { min: 35, max: 50 } }),
  },
  hba1c_percent: {
    obesity: () => ({ green: { min: 0, max: 6.5 }, orange: { min: 6.5, max: 7.5 }, red: { min: 7.5, max: 20 } }),
    default: () => ({ green: { min: 0, max: 5.7 }, orange: { min: 5.7, max: 6.5 }, red: { min: 6.5, max: 20 } }),
  },
  phq9_score: {
    default: () => ({ green: { min: 0, max: 5 }, orange: { min: 5, max: 15 }, red: { min: 15, max: 27 } }),
  },
  eat26_score: {
    default: () => ({ green: { min: 0, max: 20 }, orange: { min: 20, max: 30 }, red: { min: 30, max: 78 } }),
  },
  gad7_score: {
    default: () => ({ green: { min: 0, max: 5 }, orange: { min: 5, max: 10 }, red: { min: 10, max: 21 } }),
  },
  waist_circumference_cm: {
    default: (ctx) => ({
      green: { min: 0, max: ctx.sex === "FEMALE" ? 80 : 94 },
      orange: { min: ctx.sex === "FEMALE" ? 80 : 94, max: ctx.sex === "FEMALE" ? 88 : 102 },
      red: { min: ctx.sex === "FEMALE" ? 88 : 102, max: 300 },
    }),
  },
};

export function getMetricRange(metricKey: string, pathwayKey: string, context: Omit<RangeContext, "pathway">): MetricRange {
  const metric = R[metricKey];
  if (!metric) return { green: null, orange: null, red: null };
  const resolver = metric[pathwayKey] || metric[pathwayKey.split(".").slice(0, 2).join(".")] || metric[pathwayKey.split(".")[0]] || metric.default;
  if (!resolver) return { green: null, orange: null, red: null };
  return resolver({ ...context, pathway: pathwayKey });
}

export function getValueColor(value: number, range: MetricRange): "green" | "orange" | "red" | "gray" {
  if (range.red && value >= range.red.min && value <= range.red.max) return "red";
  if (range.orange && value >= range.orange.min && value <= range.orange.max) return "orange";
  if (range.green && value >= range.green.min && value <= range.green.max) return "green";
  return "gray";
}

// ─── Questionnaire scoring ──────────────────────────────────────────────────

interface ScoreRange { min: number; max: number; label: string; severity: "none" | "mild" | "moderate" | "moderately_severe" | "severe" }

const SCORING: Record<string, ScoreRange[]> = {
  phq9: [
    { min: 0, max: 4, label: "Pas de dépression", severity: "none" },
    { min: 5, max: 9, label: "Dépression légère", severity: "mild" },
    { min: 10, max: 14, label: "Dépression modérée", severity: "moderate" },
    { min: 15, max: 19, label: "Dépression modérée-sévère", severity: "moderately_severe" },
    { min: 20, max: 27, label: "Dépression sévère", severity: "severe" },
  ],
  gad7: [
    { min: 0, max: 4, label: "Anxiété minimale", severity: "none" },
    { min: 5, max: 9, label: "Anxiété légère", severity: "mild" },
    { min: 10, max: 14, label: "Anxiété modérée", severity: "moderate" },
    { min: 15, max: 21, label: "Anxiété sévère", severity: "severe" },
  ],
  eat26: [
    { min: 0, max: 19, label: "Pas de risque TCA", severity: "none" },
    { min: 20, max: 29, label: "Risque TCA", severity: "moderate" },
    { min: 30, max: 78, label: "TCA probable", severity: "severe" },
  ],
  scoff: [
    { min: 0, max: 1, label: "Dépistage négatif", severity: "none" },
    { min: 2, max: 5, label: "Dépistage TCA positif", severity: "severe" },
  ],
};

const SEVERITY_COLOR: Record<string, string> = {
  none: "bg-emerald-100 text-emerald-700",
  mild: "bg-amber-100 text-amber-700",
  moderate: "bg-orange-100 text-orange-700",
  moderately_severe: "bg-red-100 text-red-700",
  severe: "bg-red-200 text-red-800",
};

export function getQuestionnaireScoring(code: string, score: number): { label: string; severity: string; colorClass: string } | null {
  const ranges = SCORING[code];
  if (!ranges) return null;
  const match = ranges.find((r) => score >= r.min && score <= r.max);
  if (!match) return null;
  return { label: match.label, severity: match.severity, colorClass: SEVERITY_COLOR[match.severity] ?? "" };
}

// ─── Mifflin-St Jeor ───────────────────────────────────────────────────────

export function calculateBMR(weight: number, height: number, age: number, sex: "MALE" | "FEMALE"): number {
  if (sex === "MALE") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(weight: number, height: number, age: number, sex: "MALE" | "FEMALE", nap: number): number {
  return Math.round(calculateBMR(weight, height, age, sex) * nap);
}
