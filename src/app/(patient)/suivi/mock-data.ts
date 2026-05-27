// Mock V1 — données illustratives /suivi patient.
// Indicateurs NEUTRES sans pathologie associée (pas de "diabète", "obésité").
// V2 = ticket dérivé F-PATIENT-SUIVI-API-INTEGRATION (brancher Observation model).

export type PeriodKey = "7d" | "30d" | "3m" | "6m" | "1y";

export type IndicatorTrend = "up" | "down" | "stable";

export interface IndicatorMeasurement {
  date: string; // ISO YYYY-MM-DD
  value: number;
}

export interface MockIndicator {
  slug: string; // pour future page /suivi/[slug]
  label: string;
  unit: string;
  // Valeur latest pour affichage card
  latestValue: number;
  latestDate: string; // ISO
  // Delta vs valeur du mois précédent — signe uniquement (up/down/stable),
  // sans aucune interprétation MDR (pas de seuil, pas de qualification clinique)
  trend: IndicatorTrend;
  // Mesures sur la période la plus large (1y), on filtre côté front
  measurements: IndicatorMeasurement[];
}

// Helper : 12 mesures réparties sur 6 mois
function generateMeasurements(
  startIso: string,
  endIso: string,
  count: number,
  baseValue: number,
  amplitude: number,
): IndicatorMeasurement[] {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const step = (end - start) / (count - 1);
  const result: IndicatorMeasurement[] = [];
  for (let i = 0; i < count; i++) {
    const t = start + step * i;
    // Variation pseudo-aléatoire mais déterministe (basée sur i)
    const noise = Math.sin(i * 1.3) * amplitude;
    const value = Math.round((baseValue + noise) * 10) / 10;
    const d = new Date(t).toISOString().slice(0, 10);
    result.push({ date: d, value });
  }
  return result;
}

export const MOCK_INDICATORS: MockIndicator[] = [
  {
    slug: "poids",
    label: "Poids",
    unit: "kg",
    latestValue: 69.2,
    latestDate: "2026-05-23",
    trend: "stable",
    measurements: generateMeasurements("2025-11-23", "2026-05-23", 12, 69.5, 1.5),
  },
  {
    slug: "tension-systolique",
    label: "Tension (systolique)",
    unit: "mmHg",
    latestValue: 124,
    latestDate: "2026-05-21",
    trend: "down",
    measurements: generateMeasurements("2026-02-15", "2026-05-21", 8, 126, 6),
  },
  {
    slug: "glycemie-jeun",
    label: "Glycémie à jeun",
    unit: "g/L",
    latestValue: 0.96,
    latestDate: "2026-05-15",
    trend: "stable",
    measurements: generateMeasurements("2025-11-15", "2026-05-15", 6, 0.97, 0.08),
  },
  {
    slug: "frequence-cardiaque",
    label: "Fréquence cardiaque au repos",
    unit: "bpm",
    latestValue: 68,
    latestDate: "2026-05-25",
    trend: "down",
    measurements: generateMeasurements("2026-01-25", "2026-05-25", 10, 71, 4),
  },
  {
    slug: "sommeil",
    label: "Sommeil",
    unit: "h/nuit",
    latestValue: 7.2,
    latestDate: "2026-05-25",
    trend: "up",
    measurements: generateMeasurements("2026-04-26", "2026-05-25", 30, 6.8, 0.8),
  },
  {
    slug: "activite-physique",
    label: "Activité physique",
    unit: "min/jour",
    latestValue: 42,
    latestDate: "2026-05-25",
    trend: "up",
    measurements: generateMeasurements("2026-04-26", "2026-05-25", 30, 35, 15),
  },
];

export const PERIOD_OPTIONS: Array<{ key: PeriodKey; label: string; days: number }> = [
  { key: "7d", label: "7 jours", days: 7 },
  { key: "30d", label: "30 jours", days: 30 },
  { key: "3m", label: "3 mois", days: 90 },
  { key: "6m", label: "6 mois", days: 180 },
  { key: "1y", label: "1 an", days: 365 },
];

export function filterMeasurementsByPeriod(
  measurements: IndicatorMeasurement[],
  period: PeriodKey,
): IndicatorMeasurement[] {
  const periodCfg = PERIOD_OPTIONS.find((p) => p.key === period);
  if (!periodCfg) return measurements;
  const cutoff = Date.now() - periodCfg.days * 24 * 60 * 60 * 1000;
  return measurements.filter((m) => new Date(m.date).getTime() >= cutoff);
}
