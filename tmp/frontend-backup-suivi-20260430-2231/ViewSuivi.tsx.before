"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatShortDate } from "@/lib/date-utils";
import { PatientDashboard } from "@/hooks/usePatientDashboard";
import type { TrajectoryMetric } from "@/lib/api";
import { KEY_TO_METRIC, interpretValue, EXAM_TYPE_LABELS } from "@/lib/metricCatalog";
import type { MetricDef } from "@/lib/metricCatalog";

interface Props {
  careCaseId: string;
  dashboard: PatientDashboard;
}

interface Observation {
  id: string;
  metricId: string;
  metric?: { key?: string; label: string; unit: string | null };
  valueNumeric: number | null;
  valueText: string | null;
  unit: string | null;
  effectiveAt: string;
}

interface BIASessions {
  sessions: { date: string; values: Record<string, number> }[];
  metricKeys: Record<string, { label: string; unit: string }>;
}

// ─── BIA — DELTA_POLARITY ─────────────────────────────────────────────────────

const DELTA_POLARITY: Record<string, "higher_is_better" | "lower_is_better" | "neutral"> = {
  bia_fat_mass_kg: "lower_is_better",
  bia_fat_mass_percent: "lower_is_better",
  bia_fmi: "lower_is_better",
  bia_cardiovascular_risk_score: "lower_is_better",
  bia_metabolic_risk_score: "lower_is_better",
  bia_ecw_tbw_ratio: "lower_is_better",
  bia_ecm_bcm_ratio: "lower_is_better",
  bia_fat_mass_gap: "neutral",
  bia_muscle_mass_gap: "neutral",
  bia_water_volume_gap: "neutral",
  bia_skeletal_muscle_mass: "higher_is_better",
  bia_appendicular_smm: "higher_is_better",
  bia_body_cell_mass: "higher_is_better",
  bia_fat_free_mass_kg: "higher_is_better",
  bia_soft_lean_mass: "higher_is_better",
  bia_dry_fat_free_mass: "higher_is_better",
  bia_phase_angle: "higher_is_better",
  bia_total_body_water: "higher_is_better",
  bia_intracellular_water: "higher_is_better",
  bia_fat_free_hydration_level: "higher_is_better",
  bia_ffmi: "higher_is_better",
  bia_asmi: "higher_is_better",
  bia_smi: "higher_is_better",
  bia_total_protein_mass: "higher_is_better",
  bia_metabolic_protein_mass: "higher_is_better",
  bia_bone_mineral_content: "higher_is_better",
};

// ─── BIA — sous-catégories ────────────────────────────────────────────────────

const BIA_CATEGORIES: { label: string; keys: string[]; collapsible?: boolean }[] = [
  {
    label: "Composition corporelle",
    keys: [
      "bia_fat_mass_kg", "bia_fat_mass_percent",
      "bia_fat_free_mass_kg", "bia_skeletal_muscle_mass", "bia_appendicular_smm",
      "bia_body_cell_mass", "bia_dry_fat_free_mass", "bia_soft_lean_mass",
      "bia_total_protein_mass", "bia_metabolic_protein_mass",
      "bia_total_minerals", "bia_bone_mineral_content", "bia_extracellular_solids",
    ],
  },
  {
    label: "Indices corporels",
    keys: ["bia_fmi", "bia_ffmi", "bia_asmi", "bia_smi"],
  },
  {
    label: "Hydratation",
    keys: [
      "bia_total_body_water", "bia_extracellular_water", "bia_intracellular_water",
      "bia_ecw_tbw_ratio", "bia_fat_free_hydration_level", "bia_hydration_level",
    ],
  },
  {
    label: "Métabolisme",
    keys: [
      "bia_basal_metabolic_rate", "bia_basal_metabolic_rate_ref",
      "bia_total_energy_expenditure",
      "bia_recommended_intake_min", "bia_recommended_intake_max",
    ],
  },
  {
    label: "Ratios et marqueurs",
    keys: [
      "bia_phase_angle", "bia_impedance_ratio",
      "bia_smm_weight_ratio", "bia_ecm_bcm_ratio",
      "bia_e_i_ratio", "bia_tbw_ffm_ratio",
    ],
  },
  {
    label: "Écarts de référence",
    keys: ["bia_fat_mass_gap", "bia_muscle_mass_gap", "bia_water_volume_gap"],
  },
  {
    label: "Scores de risque",
    keys: ["bia_cardiovascular_risk_score", "bia_metabolic_risk_score"],
  },
  {
    label: "Impédances brutes",
    keys: [
      "bia_z5_impedance", "bia_z20_impedance", "bia_z50_impedance",
      "bia_z100_impedance", "bia_z200_impedance", "bia_z500_impedance",
    ],
    collapsible: true,
  },
];

const BIA_CATEGORY_ORDER: Record<string, number> = {};
BIA_CATEGORIES.forEach((cat, ci) => cat.keys.forEach((k, ki) => { BIA_CATEGORY_ORDER[k] = ci * 100 + ki; }));

// ─── Bio — groupement par examType (MetricCatalog) ───────────────────────────

const BLOOD_EXAM_ORDER = [
  "BLOOD_HEMATOLOGY", "BLOOD_HEMOSTASIS", "BLOOD_BIOCHEMISTRY",
  "BLOOD_HEPATIC", "BLOOD_LIPID", "BLOOD_IRON",
  "BLOOD_VITAMINS", "BLOOD_ENDOCRINE", "BLOOD_IMMUNOLOGY",
];

const BLOOD_EXAM_SET = new Set(BLOOD_EXAM_ORDER);

const OTHER_EXAM_ORDER = [
  "ECG", "DXA_BODY", "DXA_BONE", "CALORIMETRY",
  "EFFORT_TEST", "EFR", "PSG", "ECHO_CARDIAC",
  "GASTRO", "PSYCHIATRY_SCALES",
];

const OTHER_EXAM_SET = new Set(OTHER_EXAM_ORDER);

type BioRow = {
  id: string;
  label: string;
  unit: string | null;
  current: number;
  previous: number | null;
  date: string;
  metricDef: MetricDef | undefined;
};

function buildBioPanels(observations: Observation[]) {
  const map = new Map<string, Map<string, {
    label: string; unit: string | null;
    values: { v: number; date: string }[];
    metricDef: MetricDef | undefined;
  }>>();

  for (const o of observations) {
    if (o.valueNumeric === null) continue;
    const metricKey = o.metric?.key ?? o.metricId;
    const def = KEY_TO_METRIC[metricKey];
    const examType = def?.examType ?? "";
    if (!BLOOD_EXAM_SET.has(examType)) continue;
    if (!map.has(examType)) map.set(examType, new Map());
    const mm = map.get(examType)!;
    if (!mm.has(metricKey)) {
      mm.set(metricKey, {
        label: def?.label ?? o.metric?.label ?? o.metricId,
        unit: def?.unit ?? o.unit ?? o.metric?.unit ?? null,
        values: [],
        metricDef: def,
      });
    }
    mm.get(metricKey)!.values.push({ v: o.valueNumeric!, date: o.effectiveAt });
  }

  return BLOOD_EXAM_ORDER
    .filter((et) => map.has(et))
    .map((et) => {
      const mm = map.get(et)!;
      const rows: BioRow[] = [];
      for (const [id, m] of mm) {
        const sorted = [...m.values].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        if (!sorted.length) continue;
        rows.push({
          id, label: m.label, unit: m.unit,
          current: sorted[0].v, previous: sorted[1]?.v ?? null,
          date: sorted[0].date, metricDef: m.metricDef,
        });
      }
      const info = EXAM_TYPE_LABELS[et] ?? { label: et, icon: "🧪" };
      const abnormalRows = rows.filter((r) => {
        if (!r.metricDef?.ranges.length) return false;
        const interp = interpretValue(r.current, r.metricDef);
        return interp.color === "orange" || interp.color === "red";
      });
      return { examType: et, label: info.label, icon: info.icon, rows, abnormalRows };
    });
}

const ANTHROPOMETRY_KEYS = new Set([
  "weight_kg", "height_cm", "bmi",
  "waist_cm", "hip_cm", "neck_cm",
  "mid_arm_circumference", "calf_circumference", "arm_circumference",
  "weight_lean_target", "weight_fat_target",
]);

const EXTRA_ANTHROPOMETRY_KEYS = new Set([
  "waist_cm", "hip_cm", "neck_cm",
  "mid_arm_circumference", "calf_circumference", "arm_circumference",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deltaColor(key: string, delta: number): string {
  if (delta === 0) return "text-gray-500";
  const polarity = DELTA_POLARITY[key] ?? "neutral";
  if (polarity === "neutral") return "text-gray-500";
  const isGood = (polarity === "higher_is_better" && delta > 0) || (polarity === "lower_is_better" && delta < 0);
  return isGood ? "text-emerald-600" : "text-red-500";
}

// ─── Weight curve ────────────────────────────────────────────────────────────

function WeightCurveCard({ observations }: { observations: Observation[] }) {
  const weights = observations
    .filter((o) => {
      const k = o.metric?.key ?? o.metricId;
      return k === "weight_kg" || k === "poids";
    })
    .filter((o) => o.valueNumeric !== null)
    .sort((a, b) => new Date(a.effectiveAt).getTime() - new Date(b.effectiveAt).getTime())
    .slice(-20);

  if (weights.length < 2) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Courbe de poids</h3>
        <p className="text-sm text-gray-400 italic text-center py-6">Pas assez de mesures</p>
      </div>
    );
  }

  const values = weights.map((w) => w.valueNumeric as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 480, H = 100;
  const step = W / (values.length - 1);
  const y = (v: number) => H - ((v - min) / range) * (H - 16) - 8;

  const pts = values.map((v, i) => `${i * step},${y(v)}`);
  const fillPts = [...pts, `${(values.length - 1) * step},${H}`, `0,${H}`].join(" ");

  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Courbe de poids</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-900">{last.toFixed(1)} kg</span>
          {delta !== 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta < 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B4EC4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#5B4EC4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#weightFill)" />
        <polyline points={pts.join(" ")} fill="none" stroke="#5B4EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => (
          <circle key={i} cx={i * step} cy={y(v)} r="3" fill="white" stroke="#5B4EC4" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{formatShortDate(weights[0].effectiveAt)}</span>
        <span>{formatShortDate(weights[weights.length - 1].effectiveAt)}</span>
      </div>
    </div>
  );
}

// ─── BIA section ─────────────────────────────────────────────────────────────

function BIASection({ careCaseId }: { careCaseId: string }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Composition corporelle");
  const [showComparison, setShowComparison] = useState(false);

  const { data: sessionsData, isLoading } = useQuery<BIASessions>({
    queryKey: ["bia-sessions", careCaseId],
    queryFn: async () => {
      const { data } = await api.get<BIASessions>(
        `/care-cases/${careCaseId}/observations/sessions?prefix=bia_&sessions=10`
      );
      return data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="h-4 w-44 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const sessions = sessionsData?.sessions ?? [];
  const metricKeys = sessionsData?.metricKeys ?? {};

  if (sessions.length === 0) return null;

  const latestSession = sessions[sessions.length - 1];
  const prevSession = sessions.length > 1 ? sessions[sessions.length - 2] : null;

  // Key metrics summary row
  const KEY_METRICS = [
    { key: "bia_skeletal_muscle_mass", label: "Masse musc." },
    { key: "bia_fat_mass_percent", label: "Graisse %" },
    { key: "bia_phase_angle", label: "Angle de phase" },
    { key: "bia_total_body_water", label: "Eau totale" },
  ].filter((m) => latestSession.values[m.key] !== undefined);

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ border: "1px solid #DDD6FE", borderLeft: "3px solid #5B4EC4" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Impédancemétrie (BIA)</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {sessions.length} mesure{sessions.length > 1 ? "s" : ""} · dernière le {formatShortDate(latestSession.date)}
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs text-[#5B4EC4] hover:underline font-medium"
          >
            {showComparison ? "Vue synthèse" : "Tableau comparatif"}
          </button>
        )}
      </div>

      {/* Key metrics summary */}
      {!showComparison && KEY_METRICS.length > 0 && (
        <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-50">
          {KEY_METRICS.map(({ key, label }) => {
            const current = latestSession.values[key];
            const previous = prevSession?.values[key];
            const delta = previous !== undefined ? current - previous : null;
            const meta = metricKeys[key];
            return (
              <div key={key} className="bg-gray-50/60 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-1 truncate">{meta?.label ?? label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900">{fmtVal(current)}</span>
                  {meta?.unit && <span className="text-[10px] text-gray-400">{meta.unit}</span>}
                </div>
                {delta !== null && delta !== 0 && (
                  <span className={`text-[10px] font-semibold ${deltaColor(key, delta)}`}>
                    {delta > 0 ? "+" : ""}{fmtVal(delta)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison table */}
      {showComparison && (
        <BIAComparisonTable sessions={sessions} metricKeys={metricKeys} />
      )}

      {/* Sub-categories accordion */}
      {!showComparison && (
        <div className="divide-y divide-gray-50">
          {BIA_CATEGORIES.map((cat) => {
            const catValues = cat.keys
              .map((k) => ({
                key: k,
                value: latestSession.values[k],
                prevValue: prevSession?.values[k],
                meta: metricKeys[k],
              }))
              .filter((v) => v.value !== undefined);

            if (catValues.length === 0) return null;

            const isExpanded = expandedCategory === cat.label;

            return (
              <div key={cat.label}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{catValues.length} valeur{catValues.length > 1 ? "s" : ""}</span>
                    <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {catValues.map(({ key, value, prevValue, meta }) => {
                      const delta = prevValue !== undefined ? value - prevValue : null;
                      return (
                        <div key={key} className="bg-gray-50/60 rounded-lg p-2.5">
                          <p className="text-[10px] text-gray-500 mb-0.5 truncate">{meta?.label ?? key}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-semibold text-gray-800">{fmtVal(value)}</span>
                            {meta?.unit && <span className="text-[9px] text-gray-400">{meta.unit}</span>}
                          </div>
                          {delta !== null && delta !== 0 && (
                            <span className={`text-[9px] font-medium ${deltaColor(key, delta)}`}>
                              {delta > 0 ? "+" : ""}{fmtVal(delta)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── BIA comparison table ─────────────────────────────────────────────────────

function BIAComparisonTable({
  sessions,
  metricKeys,
}: {
  sessions: { date: string; values: Record<string, number> }[];
  metricKeys: Record<string, { label: string; unit: string }>;
}) {
  const displaySessions = sessions.slice(-5);

  // Keys present in ≥2 sessions (show progression)
  const allKeys = new Set<string>();
  for (const s of displaySessions) Object.keys(s.values).forEach((k) => allKeys.add(k));
  const keysWithMultiple = [...allKeys].filter(
    (k) => displaySessions.filter((s) => s.values[k] !== undefined).length >= 2
  );

  if (keysWithMultiple.length === 0) {
    return (
      <div className="p-5 text-center text-sm text-gray-400 italic">
        Pas assez de mesures pour la comparaison
      </div>
    );
  }

  keysWithMultiple.sort((a, b) => (BIA_CATEGORY_ORDER[a] ?? 999) - (BIA_CATEGORY_ORDER[b] ?? 999));

  const latest = displaySessions[displaySessions.length - 1];
  const prev = displaySessions[displaySessions.length - 2];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-2.5 font-semibold text-gray-600 min-w-[140px]">Métrique</th>
            {displaySessions.map((s) => (
              <th key={s.date} className="text-right px-3 py-2.5 font-semibold text-gray-600 whitespace-nowrap">
                {formatShortDate(s.date)}
              </th>
            ))}
            <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Δ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {keysWithMultiple.map((key) => {
            const meta = metricKeys[key];
            const currentVal = latest.values[key];
            const prevVal = prev.values[key];
            const delta =
              currentVal !== undefined && prevVal !== undefined ? currentVal - prevVal : null;
            return (
              <tr key={key} className="hover:bg-gray-50/40">
                <td className="px-5 py-2 text-gray-700 font-medium truncate max-w-[150px]">
                  {meta?.label ?? key}
                  {meta?.unit && (
                    <span className="text-gray-400 font-normal ml-1">({meta.unit})</span>
                  )}
                </td>
                {displaySessions.map((s) => (
                  <td key={s.date} className="px-3 py-2 text-right text-gray-600 tabular-nums">
                    {s.values[key] !== undefined ? (
                      fmtVal(s.values[key])
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
                <td className="px-5 py-2 text-right font-semibold tabular-nums">
                  {delta !== null ? (
                    <span className={deltaColor(key, delta)}>
                      {delta > 0 ? "+" : ""}{fmtVal(delta)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Bio section ─────────────────────────────────────────────────────────────

function BioSection({ observations }: { observations: Observation[] }) {
  const panels = buildBioPanels(observations);

  // Auto-ouvre le premier panel avec des valeurs hors-norme
  const [expandedPanel, setExpandedPanel] = useState<string | null>(
    panels.find((p) => p.abnormalRows.length > 0)?.examType ?? null
  );

  if (panels.length === 0) return null;

  const totalValues = panels.reduce((acc, p) => acc + p.rows.length, 0);
  const totalAbnormal = panels.reduce((acc, p) => acc + p.abnormalRows.length, 0);

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ border: "1px solid #BFDBFE", borderLeft: "3px solid #3B82F6" }}>
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">🩸</span>
          <h3 className="text-sm font-semibold text-gray-900">Bilan biologique</h3>
          {totalAbnormal > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {totalAbnormal} valeur{totalAbnormal > 1 ? "s" : ""} à vérifier
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {panels.length} panel{panels.length > 1 ? "s" : ""} · {totalValues} marqueur{totalValues > 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-gray-50">
        {panels.map((panel) => {
          const isExpanded = expandedPanel === panel.examType;
          return (
            <div key={panel.examType}>
              <button
                onClick={() => setExpandedPanel(isExpanded ? null : panel.examType)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{panel.icon}</span>
                  <span className="text-xs font-semibold text-gray-700">{panel.label}</span>
                  {panel.abnormalRows.length > 0 && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      {panel.abnormalRows.length} à vérifier
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    {panel.rows.length} marqueur{panel.rows.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 divide-y divide-gray-50">
                  {panel.rows.map((row) => {
                    const delta = row.previous !== null ? row.current - row.previous : null;
                    const interp =
                      row.metricDef && row.metricDef.ranges.length > 0
                        ? interpretValue(row.current, row.metricDef)
                        : null;
                    return (
                      <div key={row.id} className="flex items-center justify-between py-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-gray-700">{row.label}</span>
                          <span className="text-[10px] text-gray-400 ml-1">
                            {formatShortDate(row.date)}
                          </span>
                          {interp?.rangeStr && (
                            <span className="text-[10px] text-gray-300 ml-1">[{interp.rangeStr}]</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                          {row.previous !== null && (
                            <span className="text-xs text-gray-400 line-through">
                              {fmtVal(row.previous)}{row.unit ? ` ${row.unit}` : ""}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-gray-900">
                            {fmtVal(row.current)}{row.unit ? ` ${row.unit}` : ""}
                          </span>
                          {interp && interp.color !== "green" && interp.color !== "gray" && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                              interp.color === "red"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}>
                              {interp.label}
                            </span>
                          )}
                          {delta !== null && delta !== 0 && (
                            <span className={`text-[10px] font-medium ${delta < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                              {delta > 0 ? "+" : ""}{fmtVal(delta)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Anthropométrie complémentaire ────────────────────────────────────────────

function AnthropometryCard({ observations }: { observations: Observation[] }) {
  const anthrObs = observations
    .filter((o) => EXTRA_ANTHROPOMETRY_KEYS.has(o.metric?.key ?? o.metricId) && o.valueNumeric !== null)
    .sort((a, b) => new Date(b.effectiveAt).getTime() - new Date(a.effectiveAt).getTime());

  if (anthrObs.length === 0) return null;

  // Latest + previous per metric
  const byMetric = new Map<
    string,
    { label: string; unit: string | null; current: number; previous: number | null; date: string }
  >();
  for (const o of anthrObs) {
    const mKey = o.metric?.key ?? o.metricId;
    if (!byMetric.has(mKey)) {
      byMetric.set(mKey, {
        label: o.metric?.label ?? o.metricId,
        unit: o.unit ?? o.metric?.unit ?? null,
        current: o.valueNumeric!,
        previous: null,
        date: o.effectiveAt,
      });
    } else {
      const m = byMetric.get(mKey)!;
      if (m.previous === null) m.previous = o.valueNumeric!;
    }
  }

  return (
    <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #BBF7D0", borderLeft: "3px solid #10B981" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📏</span>
        <h3 className="text-sm font-semibold text-gray-900">Anthropométrie</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...byMetric.entries()].map(([id, m]) => {
          const delta = m.previous !== null ? m.current - m.previous : null;
          return (
            <div key={id} className="bg-gray-50/60 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-0.5 truncate">{m.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-gray-800">{fmtVal(m.current)}</span>
                {m.unit && <span className="text-[10px] text-gray-400">{m.unit}</span>}
              </div>
              {delta !== null && delta !== 0 && (
                <span className={`text-[10px] font-medium ${delta < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {delta > 0 ? "+" : ""}{fmtVal(delta)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Alimentation heatmap (journal MEAL) ─────────────────────────────────────

function AlimentationHeatmap({ careCaseId }: { careCaseId: string }) {
  const { data: journal } = useQuery<any[]>({
    queryKey: [`journal-${careCaseId}`],
    queryFn: async () => {
      const { data } = await api.get<any[]>(`/care-cases/${careCaseId}/journal`);
      return data;
    },
    staleTime: 60_000,
  });

  const meals = (journal ?? []).filter((j) => j.entryType === "MEAL");

  // Compter les repas par jour sur les 8 dernières semaines
  const dayCount = new Map<string, number>();
  for (const m of meals) {
    const day = new Date(m.occurredAt ?? m.createdAt).toISOString().split("T")[0];
    dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
  }

  // Générer les 56 derniers jours
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: dayCount.get(key) ?? 0 });
  }

  const colorFor = (n: number) => {
    if (n === 0) return "bg-gray-100";
    if (n === 1) return "bg-[#C4BBF0]";
    if (n === 2) return "bg-[#9B8EE4]";
    return "bg-[#5B4EC4]";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Journal alimentaire</h3>
        <span className="text-xs text-gray-400">{meals.length} repas enregistrés</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} repas`}
            className={`w-4 h-4 rounded-sm ${colorFor(d.count)} transition-colors cursor-pointer`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
        <span>Moins</span>
        <div className="flex gap-1">
          {["bg-gray-100", "bg-[#C4BBF0]", "bg-[#9B8EE4]", "bg-[#5B4EC4]"].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}

// ─── Santé mentale (questionnaires scores) ───────────────────────────────────

function MentalHealthCard({ dashboard }: { dashboard: PatientDashboard }) {
  const mental = dashboard.questionnaires.filter((q) =>
    ["phq9", "gad7", "binge", "ors", "ede", "ede-q", "eq5d", "bem", "bdi"].some((k) =>
      q.key.toLowerCase().includes(k)
    )
  );

  if (mental.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Santé mentale</h3>
        <p className="text-sm text-gray-400 italic text-center py-6">Aucun questionnaire de santé mentale</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Santé mentale</h3>
      <div className="space-y-3">
        {mental.map((q) => {
          const pct = q.lastScore !== null && q.maxScore ? (q.lastScore / q.maxScore) * 100 : null;
          const barColor = pct === null ? "bg-gray-200" : pct < 40 ? "bg-green-400" : pct < 70 ? "bg-amber-400" : "bg-red-400";
          return (
            <div key={q.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{q.label}</span>
                <div className="flex items-center gap-2">
                  {q.lastScore !== null ? (
                    <span className="text-sm font-semibold text-gray-900">
                      {q.lastScore}{q.maxScore ? `/${q.maxScore}` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                  {q.lastCompletedAt && (
                    <span className="text-[10px] text-gray-400">
                      {formatShortDate(q.lastCompletedAt)}
                    </span>
                  )}
                </div>
              </div>
              {pct !== null && (
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activité physique ───────────────────────────────────────────────────────

function ActivityCard({ careCaseId }: { careCaseId: string }) {
  const { data: journal } = useQuery<any[]>({
    queryKey: [`journal-${careCaseId}`],
    queryFn: async () => {
      const { data } = await api.get<any[]>(`/care-cases/${careCaseId}/journal`);
      return data;
    },
    staleTime: 60_000,
  });

  const activities = (journal ?? [])
    .filter((j) => j.entryType === "PHYSICAL_ACTIVITY")
    .sort((a: any, b: any) => new Date(b.occurredAt ?? b.createdAt).getTime() - new Date(a.occurredAt ?? a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Activité physique</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-6">Aucune activité enregistrée</p>
      ) : (
        <div className="space-y-2">
          {activities.map((a: any, i: number) => {
            const payload = a.payload as any;
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏃</span>
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {payload?.activity ?? payload?.type ?? "Activité"}
                    </p>
                    {payload?.duration && (
                      <p className="text-[10px] text-gray-400">{payload.duration} min</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {formatShortDate(a.occurredAt ?? a.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Autres examens (ECG, DXA, Scores psy, etc.) ─────────────────────────────

function buildOtherPanels(observations: Observation[]) {
  const map = new Map<string, Map<string, {
    label: string; unit: string | null;
    values: { v: number; date: string }[];
    metricDef: MetricDef | undefined;
  }>>();

  for (const o of observations) {
    if (o.valueNumeric === null) continue;
    const metricKey = o.metric?.key ?? o.metricId;
    const def = KEY_TO_METRIC[metricKey];
    const examType = def?.examType ?? "";
    if (!OTHER_EXAM_SET.has(examType)) continue;
    if (!map.has(examType)) map.set(examType, new Map());
    const mm = map.get(examType)!;
    if (!mm.has(metricKey)) {
      mm.set(metricKey, {
        label: def?.label ?? o.metric?.label ?? o.metricId,
        unit: def?.unit ?? o.unit ?? o.metric?.unit ?? null,
        values: [],
        metricDef: def,
      });
    }
    mm.get(metricKey)!.values.push({ v: o.valueNumeric!, date: o.effectiveAt });
  }

  return OTHER_EXAM_ORDER
    .filter((et) => map.has(et))
    .map((et) => {
      const mm = map.get(et)!;
      const rows: BioRow[] = [];
      for (const [id, m] of mm) {
        const sorted = [...m.values].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        if (!sorted.length) continue;
        rows.push({
          id, label: m.label, unit: m.unit,
          current: sorted[0].v, previous: sorted[1]?.v ?? null,
          date: sorted[0].date, metricDef: m.metricDef,
        });
      }
      const info = EXAM_TYPE_LABELS[et] ?? { label: et, icon: "📋" };
      return { examType: et, label: info.label, icon: info.icon, rows };
    });
}

function OthersSection({ observations }: { observations: Observation[] }) {
  const panels = buildOtherPanels(observations);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(
    panels[0]?.examType ?? null
  );

  if (panels.length === 0) return null;

  const totalValues = panels.reduce((acc, p) => acc + p.rows.length, 0);

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ border: "1px solid #E5E7EB", borderLeft: "3px solid #9CA3AF" }}>
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h3 className="text-sm font-semibold text-gray-900">Autres examens</h3>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {panels.length} type{panels.length > 1 ? "s" : ""} · {totalValues} valeur{totalValues > 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-gray-50">
        {panels.map((panel) => {
          const isExpanded = expandedPanel === panel.examType;
          return (
            <div key={panel.examType}>
              <button
                onClick={() => setExpandedPanel(isExpanded ? null : panel.examType)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{panel.icon}</span>
                  <span className="text-xs font-semibold text-gray-700">{panel.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    {panel.rows.length} valeur{panel.rows.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 divide-y divide-gray-50">
                  {panel.rows.map((row) => {
                    const delta = row.previous !== null ? row.current - row.previous : null;
                    const interp =
                      row.metricDef && row.metricDef.ranges.length > 0
                        ? interpretValue(row.current, row.metricDef)
                        : null;
                    return (
                      <div key={row.id} className="flex items-center justify-between py-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-gray-700">{row.label}</span>
                          <span className="text-[10px] text-gray-400 ml-1">
                            {formatShortDate(row.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                          {row.previous !== null && (
                            <span className="text-xs text-gray-400 line-through">
                              {fmtVal(row.previous)}{row.unit ? ` ${row.unit}` : ""}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-gray-900">
                            {fmtVal(row.current)}{row.unit ? ` ${row.unit}` : ""}
                          </span>
                          {interp && interp.color !== "green" && interp.color !== "gray" && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                              interp.color === "red"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}>
                              {interp.label}
                            </span>
                          )}
                          {delta !== null && delta !== 0 && (
                            <span className={`text-[10px] font-medium ${delta < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                              {delta > 0 ? "+" : ""}{fmtVal(delta)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ViewSuivi({ careCaseId, dashboard }: Props) {
  const { data: observations } = useQuery<Observation[]>({
    queryKey: [`observations-${careCaseId}`],
    queryFn: async () => {
      const { data } = await api.get<{ observations: Observation[] }>(`/care-cases/${careCaseId}/observations`);
      return data.observations ?? [];
    },
    staleTime: 60_000,
  });

  const obs = observations ?? [];

  return (
    <div className="space-y-5">
      {/* Trajectoires z-score */}
      <TrajectoryInsightsCard careCaseId={careCaseId} />

      {/* Courbe de poids */}
      <WeightCurveCard observations={obs} />

      {/* Impédancemétrie BIA */}
      <BIASection careCaseId={careCaseId} />

      {/* Bilan biologique (panneaux) */}
      <BioSection observations={obs} />

      {/* Anthropométrie complémentaire */}
      <AnthropometryCard observations={obs} />

      {/* Autres examens : ECG, DXA, scores psy, etc. */}
      <OthersSection observations={obs} />

      {/* Alimentation + Santé mentale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AlimentationHeatmap careCaseId={careCaseId} />
        <MentalHealthCard dashboard={dashboard} />
      </div>

      {/* Activité physique */}
      <ActivityCard careCaseId={careCaseId} />
    </div>
  );
}

// ─── Trajectory Insights ─────────────────────────────────────────────────────

function ZSparkline({ spark, stdResidual, zScore }: {
  spark: { value: number; predicted: number; date: string }[];
  stdResidual: number;
  zScore: number;
}) {
  if (spark.length < 2) return null;
  const W = 160, H = 40;

  // y-range includes actual values + ±2σ bands around the regression line
  const predFirst = spark[0].predicted;
  const predLast  = spark[spark.length - 1].predicted;
  const allVals = [
    ...spark.map((p) => p.value),
    predFirst + 2 * stdResidual, predFirst - 2 * stdResidual,
    predLast  + 2 * stdResidual, predLast  - 2 * stdResidual,
  ];
  const min   = Math.min(...allVals);
  const max   = Math.max(...allVals);
  const range = max - min || 1;

  const xi  = (i: number) => (i / (spark.length - 1)) * W;
  const yv  = (v: number) => H - ((v - min) / range) * (H - 6) - 3;

  // OLS line endpoints
  const olsY0 = yv(spark[0].predicted);
  const olsY1 = yv(spark[spark.length - 1].predicted);

  // ±1σ bands around OLS line (parallelogram)
  const topBand = [
    `0,${yv(spark[0].predicted + stdResidual)}`,
    `${W},${yv(spark[spark.length - 1].predicted + stdResidual)}`,
    `${W},${yv(spark[spark.length - 1].predicted - stdResidual)}`,
    `0,${yv(spark[0].predicted - stdResidual)}`,
  ].join(" ");

  const linePts = spark.map((p, i) => `${xi(i)},${yv(p.value)}`).join(" ");
  const fillPts = [
    ...spark.map((p, i) => `${xi(i)},${yv(p.value)}`),
    `${W},${H}`, `0,${H}`,
  ].join(" ");

  const absZ     = Math.abs(zScore);
  const dotColor = absZ >= 3 ? "#DC2626" : "#D97706";
  const lastX    = xi(spark.length - 1);
  const lastY    = yv(spark[spark.length - 1].value);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 40 }} preserveAspectRatio="none">
      {/* ±1σ band around regression line */}
      <polygon points={topBand} fill="#5B4EC4" fillOpacity="0.07" />
      {/* OLS regression line */}
      <line x1={0} y1={olsY0} x2={W} y2={olsY1}
        stroke="#5B4EC4" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="4,3" />
      {/* actual data area fill */}
      <polygon points={fillPts} fill="#6B7280" fillOpacity="0.06" />
      {/* actual data line */}
      <polyline points={linePts} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round" />
      {/* historic dots */}
      {spark.slice(0, -1).map((p, i) => (
        <circle key={i} cx={xi(i)} cy={yv(p.value)} r={1.5} fill="#D1D5DB" />
      ))}
      {/* last point — deviation highlight */}
      <circle cx={lastX} cy={lastY} r={5} fill={dotColor} fillOpacity="0.18" />
      <circle cx={lastX} cy={lastY} r={2.8} fill={dotColor} />
    </svg>
  );
}

function TrajectoryInsightsCard({ careCaseId }: { careCaseId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["obs-trajectory", careCaseId],
    queryFn: async () => {
      const { data } = await api.get<{
        computedAt: string; window: number; threshold: number;
        deviations: TrajectoryMetric[]; stable: TrajectoryMetric[];
      }>(`/care-cases/${careCaseId}/observations/trajectory`);
      return data;
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const deviations: TrajectoryMetric[] = data?.deviations ?? [];
  const stable: TrajectoryMetric[] = data?.stable ?? [];
  const total = deviations.length + stable.length;

  if (total === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Trajectoires métriques</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Fenêtre {data?.window ?? 20} mesures · seuil {data?.threshold ?? 2}σ
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deviations.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {deviations.length} évolution{deviations.length > 1 ? "s" : ""} notable{deviations.length > 1 ? "s" : ""}
            </span>
          )}
          {deviations.length === 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tendances stables
            </span>
          )}
        </div>
      </div>

      {deviations.length > 0 && (
        <div className="space-y-3 mb-4">
          {deviations.map((m) => {
            const absZ = Math.abs(m.zScore);
            const isCritical = absZ >= 3;
            const accentColor = isCritical ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/40";
            const badgeColor  = isCritical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
            const arrow = m.direction === "up" ? "↑" : "↓";
            const diff  = m.currentValue - m.predictedValue;
            const diffStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}${m.unit ? ` ${m.unit}` : ""}`;
            return (
              <div key={m.metricKey} className={`rounded-xl border p-3 ${accentColor}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {m.metricLabel}
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                        {arrow} {m.deviationLabel}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Écart vs trajectoire attendue : <strong>{diffStr}</strong> · attendu {m.predictedValue.toFixed(1)}{m.unit ? ` ${m.unit}` : ""}
                      {m.trendSlopeLabel !== "stable" && (
                        <span className="ml-1 text-gray-400">· tendance {m.trendSlopeLabel}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{m.n} pts</span>
                </div>
                <ZSparkline spark={m.spark} stdResidual={m.stdResidual} zScore={m.zScore} />
              </div>
            );
          })}
        </div>
      )}

      {stable.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Dans la norme ({stable.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stable.map((m) => (
              <div key={m.metricKey} className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5">
                <p className="text-[10px] text-gray-500 truncate">{m.metricLabel}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-semibold text-gray-700">{m.currentValue.toFixed(1)}{m.unit ? ` ${m.unit}` : ""}</span>
                  <span className="text-[9px] text-gray-400 ml-auto">{m.deviationLabel}</span>
                </div>
                <ZSparkline spark={m.spark} stdResidual={m.stdResidual} zScore={m.zScore} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function fmtVal(v: number): string {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1);
}
