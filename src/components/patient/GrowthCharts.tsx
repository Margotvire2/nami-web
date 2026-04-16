"use client";

/**
 * GrowthCharts — Courbes de croissance pédiatriques
 *
 * Affiche les courbes de croissance poids/taille/IMC/périmètre crânien
 * avec percentiles OMS (P3, P10, P50, P90, P97) en référence.
 *
 * Données : z-scores et courbes calculés côté serveur (GET /patients/:id/growth/:metric)
 * Référence : OMS / AFPA-CRESS-INSERM-SFP 2018
 *
 * Wording MDR safe : "à documenter" — jamais "alerte clinique", "danger", "risque"
 */

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type GrowthMetric = "weight" | "height" | "bmi" | "head_circumference";

interface GrowthPoint {
  ageMonths: number;
  date: string;
  value: number;
  zScore: number;
  percentile: number;
}

interface ReferenceCurve {
  ageMonths: number;
  P3: number;
  P10: number;
  P50: number;
  P90: number;
  P97: number;
}

interface GrowthAlert {
  type: "PERCENTILE_LOW" | "PERCENTILE_HIGH";
  message: string;
  ageMonths: number;
  value: number;
  zScore: number;
}

interface GrowthCurveResult {
  patient: {
    id: string;
    firstName: string;
    birthDate: string;
    sex: string;
    ageMonths: number;
  };
  metric: GrowthMetric;
  unit: string;
  isMinor: boolean;
  points: GrowthPoint[];
  referenceCurves: ReferenceCurve[];
  alerts: GrowthAlert[];
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface GrowthChartsProps {
  patientId: string;
  careCaseId?: string;
  sex: "M" | "F";
  ageMonths: number;
  isInfant: boolean;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const NAMI_PRIMARY = "#5B4EC4";
const REF_GRAY = "#CBD5E1";
const REF_MEDIAN = "#94A3B8";
const BAND_FILL = "#F1F5F9";
const POINT_OUT_OF_RANGE = "#D97706"; // orange doux — jamais rouge

// ─── Labels ──────────────────────────────────────────────────────────────────

const METRIC_LABELS: Record<GrowthMetric, string> = {
  weight: "Poids",
  height: "Taille",
  bmi: "IMC",
  head_circumference: "Périmètre crânien",
};

const METRIC_UNITS: Record<GrowthMetric, string> = {
  weight: "kg",
  height: "cm",
  bmi: "kg/m²",
  head_circumference: "cm",
};

function ageLabel(months: number): string {
  if (months < 24) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years} ans` : `${years} ans ${rem} m`;
}

// ─── Tooltip personnalisé ────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: any[];
  label?: number;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const patientPoint = payload.find((p: any) => p.dataKey === "value");
  if (!patientPoint) return null;

  const pt = patientPoint.payload as GrowthPoint & { _type?: string };
  if (pt._type !== "patient") return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{ageLabel(label ?? 0)}</p>
      <p className="text-gray-700">
        <span className="font-medium">{pt.value.toFixed(1)}</span>{" "}
        <span className="text-gray-400">{unit}</span>
      </p>
      <p className="text-gray-500 mt-0.5">
        P{pt.percentile} · z = {pt.zScore > 0 ? "+" : ""}
        {pt.zScore.toFixed(2)}
      </p>
      {pt.date && (
        <p className="text-gray-400 mt-0.5">
          {new Date(pt.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

// ─── Graphique ───────────────────────────────────────────────────────────────

/** Interpolation linéaire des percentiles pour un age non couvert par le LMS */
function interpolateRef(age: number, sorted: ReferenceCurve[]): ReferenceCurve | undefined {
  if (sorted.length === 0) return undefined;
  if (age <= sorted[0].ageMonths) return sorted[0];
  if (age >= sorted[sorted.length - 1].ageMonths) return sorted[sorted.length - 1];
  const hi = sorted.findIndex((r) => r.ageMonths >= age);
  if (hi <= 0) return sorted[0];
  const lo = hi - 1;
  const t = (age - sorted[lo].ageMonths) / (sorted[hi].ageMonths - sorted[lo].ageMonths);
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * t) * 100) / 100;
  return {
    ageMonths: age,
    P3:  lerp(sorted[lo].P3,  sorted[hi].P3),
    P10: lerp(sorted[lo].P10, sorted[hi].P10),
    P50: lerp(sorted[lo].P50, sorted[hi].P50),
    P90: lerp(sorted[lo].P90, sorted[hi].P90),
    P97: lerp(sorted[lo].P97, sorted[hi].P97),
  };
}

function GrowthChart({ data, unit }: { data: GrowthCurveResult; unit: string }) {
  // Courbes de référence triées (pour interpolation)
  const sortedRef = [...data.referenceCurves].sort((a, b) => a.ageMonths - b.ageMonths);
  const refByAge = new Map<number, ReferenceCurve>(sortedRef.map((r) => [r.ageMonths, r]));

  // Tous les ages : référence + patient
  const allAges = new Set<number>([
    ...data.referenceCurves.map((r) => r.ageMonths),
    ...data.points.map((p) => p.ageMonths),
  ]);

  const sortedAges = Array.from(allAges).sort((a, b) => a - b);

  const chartData = sortedAges.map((age) => {
    // Pour les ages patient sans entrée LMS exacte, interpoler les percentiles
    const ref = refByAge.get(age) ?? interpolateRef(age, sortedRef);
    const patientPt = data.points.find((p) => p.ageMonths === age);

    const entry: Record<string, number | string | undefined> = {
      ageMonths: age,
      P3: ref?.P3,
      P10: ref?.P10,
      P50: ref?.P50,
      P90: ref?.P90,
      P97: ref?.P97,
    };

    if (patientPt) {
      entry.value = patientPt.value;
      entry.percentile = patientPt.percentile;
      entry.zScore = patientPt.zScore;
      entry.date = patientPt.date;
      entry._type = "patient";
    }

    return entry;
  });

  const isOutOfRange = (entry: Record<string, any>): boolean => {
    if (entry.value == null || entry.P3 == null || entry.P97 == null) return false;
    return entry.value < entry.P3 || entry.value > entry.P97;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis
          dataKey="ageMonths"
          tickFormatter={(v) => ageLabel(v)}
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={{ stroke: "#E2E8F0" }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />

        {/* Zone P3-P97 — fond gris très léger, sans white-override qui masque les courbes */}
        <Area
          type="monotone"
          dataKey="P97"
          stroke="none"
          fill={BAND_FILL}
          fillOpacity={0.35}
          legendType="none"
          isAnimationActive={false}
        />

        {/* Courbes de référence — rendues avant la courbe patient */}
        <Line
          type="monotone"
          dataKey="P3"
          stroke={REF_GRAY}
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
          isAnimationActive={false}
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="P10"
          stroke={REF_GRAY}
          strokeWidth={1}
          dot={false}
          strokeDasharray="2 2"
          isAnimationActive={false}
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="P50"
          stroke={REF_MEDIAN}
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="5 3"
          isAnimationActive={false}
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="P90"
          stroke={REF_GRAY}
          strokeWidth={1}
          dot={false}
          strokeDasharray="2 2"
          isAnimationActive={false}
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="P97"
          stroke={REF_GRAY}
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
          isAnimationActive={false}
          legendType="none"
        />

        {/* Courbe patient — rendue EN DERNIER (z-index maximal), sans fill */}
        <Line
          type="monotone"
          dataKey="value"
          stroke={NAMI_PRIMARY}
          fill="none"
          strokeWidth={2.5}
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            if (payload.value == null) return <></>;
            const outRange = isOutOfRange(payload);
            return (
              <circle
                key={`dot-${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={5}
                fill={outRange ? POINT_OUT_OF_RANGE : NAMI_PRIMARY}
                stroke="white"
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 7, fill: NAMI_PRIMARY, stroke: "white", strokeWidth: 2 }}
          connectNulls={true}
          isAnimationActive={false}
        />

        {/* Lignes P3 et P97 en référence */}
        <ReferenceLine
          y={data.referenceCurves[data.referenceCurves.length - 1]?.P3}
          stroke={REF_GRAY}
          strokeDasharray="3 3"
          label={{ value: "P3", position: "right", fontSize: 9, fill: REF_GRAY }}
        />
        <ReferenceLine
          y={data.referenceCurves[data.referenceCurves.length - 1]?.P97}
          stroke={REF_GRAY}
          strokeDasharray="3 3"
          label={{ value: "P97", position: "right", fontSize: 9, fill: REF_GRAY }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── Résumé dernière mesure ───────────────────────────────────────────────────

function LastMeasureSummary({
  points,
  unit,
  ageMonths,
}: {
  points: GrowthPoint[];
  unit: string;
  ageMonths: number;
}) {
  if (points.length === 0) return null;

  const last = [...points].sort((a, b) => b.ageMonths - a.ageMonths)[0];
  const years = Math.floor(ageMonths / 12);

  return (
    <p className="text-xs text-gray-500 mt-3">
      Dernière mesure :{" "}
      <span className="font-semibold text-gray-800">
        {last.value.toFixed(1)} {unit}
      </span>{" "}
      à {years} ans (P{last.percentile}, z-score{" "}
      {last.zScore > 0 ? "+" : ""}
      {last.zScore.toFixed(2)})
    </p>
  );
}

// ─── Types import carnet ─────────────────────────────────────────────────────

type ImportStep = "idle" | "reading" | "classifying" | "extracting" | "done" | "error";

interface ImportStepConfig {
  label: string;
  active: ImportStep[];
}

const IMPORT_STEPS: ImportStepConfig[] = [
  { label: "Lecture de l'image...", active: ["reading"] },
  { label: "Identification de la page...", active: ["classifying"] },
  { label: "Extraction des mesures...", active: ["extracting"] },
];

// ─── Composant import carnet ──────────────────────────────────────────────────

function CarnetImportButton({
  patientId,
  careCaseId,
  accessToken,
  onSuccess,
}: {
  patientId: string;
  careCaseId: string | null;
  accessToken: string | null;
  onSuccess: (count: number) => void;
}) {
  const [step, setStep] = useState<ImportStep>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastCount, setLastCount] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !careCaseId) return;

    // Reset
    setErrorMsg(null);
    setStep("reading");

    try {
      // Lire le fichier en base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Enlever le préfixe data:image/...;base64,
          const b64 = result.split(",")[1];
          if (!b64) reject(new Error("Fichier illisible"));
          else resolve(b64);
        };
        reader.onerror = () => reject(new Error("Erreur lecture fichier"));
        reader.readAsDataURL(file);
      });

      setStep("classifying");

      // Petit délai visuel pour que l'utilisateur voit l'étape
      await new Promise((r) => setTimeout(r, 400));

      setStep("extracting");

      const res = await fetch(`${API_URL}/patients/${patientId}/growth/import-carnet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
          careCaseId,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(body.error ?? `Erreur ${res.status}`);
        setStep("error");
        return;
      }

      const count: number = body.observationsCreated ?? 0;
      setLastCount(count);
      setStep("done");
      onSuccess(count);

      // Reset après 4s
      setTimeout(() => setStep("idle"), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
      setStep("error");
    } finally {
      // Reset input file pour permettre re-sélection du même fichier
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <span>✓</span>
        <span>{lastCount} mesure{lastCount > 1 ? "s" : ""} ajoutée{lastCount > 1 ? "s" : ""} — à vérifier</span>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-amber-600">{errorMsg}</span>
        <button
          onClick={() => { setStep("idle"); setErrorMsg(null); }}
          className="text-gray-400 hover:text-gray-600 underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const activeStepLabel =
    step !== "idle"
      ? IMPORT_STEPS.find((s) => s.active.includes(step))?.label ?? "Traitement..."
      : null;

  if (activeStepLabel) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#5B4EC4] border-t-transparent animate-spin shrink-0" />
        <span>{activeStepLabel}</span>
      </div>
    );
  }

  // idle
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={!careCaseId}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={!careCaseId}
        className="flex items-center gap-1.5 text-xs text-[#5B4EC4] hover:text-[#4a3eb3] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Importer depuis le carnet de santé"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v8M5 7l3 3 3-3M2 13h12" />
        </svg>
        Importer carnet
      </button>
    </>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function GrowthCharts({ patientId, careCaseId: propCareCaseId, sex: _sex, ageMonths, isInfant }: GrowthChartsProps) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const availableMetrics: GrowthMetric[] = isInfant
    ? ["weight", "height", "bmi", "head_circumference"]
    : ["weight", "height", "bmi"];

  const [activeMetric, setActiveMetric] = useState<GrowthMetric>("weight");
  const careCaseId = propCareCaseId ?? null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const { data, isLoading, error } = useQuery<GrowthCurveResult>({
    queryKey: ["growth-curve", patientId, activeMetric],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/patients/${patientId}/growth/${activeMetric}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      return res.json() as Promise<GrowthCurveResult>;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const unit = METRIC_UNITS[activeMetric];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Courbes de croissance</h3>
        <div className="flex items-center gap-4">
          <CarnetImportButton
            patientId={patientId}
            careCaseId={careCaseId}
            accessToken={accessToken}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["growth-curve", patientId] });
            }}
          />
          <span className="text-[10px] text-gray-400 font-medium hidden sm:block">
            OMS / AFPA-CRESS-INSERM-SFP 2018
          </span>
        </div>
      </div>

      {/* Onglets métriques */}
      <div className="flex gap-1 border-b border-gray-100 mb-5">
        {availableMetrics.map((metric) => (
          <button
            key={metric}
            onClick={() => setActiveMetric(metric)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-px ${
              activeMetric === metric
                ? "border-[#5B4EC4] text-[#5B4EC4]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {METRIC_LABELS[metric]}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {isLoading && (
        <div className="flex items-center justify-center h-[280px]">
          <div className="w-5 h-5 rounded-full border-2 border-[#5B4EC4] border-t-transparent animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-[280px] text-xs text-gray-400">
          Données non disponibles
        </div>
      )}

      {data && !isLoading && !error && (
        <>
          {/* Légende courbes de référence */}
          <div className="flex items-center gap-4 mb-3 text-[10px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-0.5"
                style={{
                  background: NAMI_PRIMARY,
                  borderBottom: "2px solid",
                }}
              />
              <span>Patient</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-0.5"
                style={{ borderBottom: `2px dashed ${REF_MEDIAN}` }}
              />
              <span>P50</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-3 rounded-sm"
                style={{ background: BAND_FILL, border: `1px dashed ${REF_GRAY}` }}
              />
              <span>P3 – P97</span>
            </div>
            {data.alerts.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-3 h-3 rounded-full" style={{ background: POINT_OUT_OF_RANGE }} />
                <span className="text-amber-600">Valeur à documenter</span>
              </div>
            )}
          </div>

          {data.points.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-xs text-gray-400 italic">
              Aucune mesure de {METRIC_LABELS[activeMetric].toLowerCase()} enregistrée
            </div>
          ) : (
            <GrowthChart data={data} unit={unit} />
          )}

          <LastMeasureSummary
            points={data.points}
            unit={unit}
            ageMonths={ageMonths}
          />

          {/* Indicateurs à documenter — wording MDR safe */}
          {data.alerts.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {data.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700"
                >
                  <span className="shrink-0 mt-0.5">◉</span>
                  <span>{alert.message}</span>
                </div>
              ))}
              <p className="text-[10px] text-gray-400 mt-1 italic">
                Indicateurs de complétude du dossier — brouillon, à vérifier par le soignant
              </p>
            </div>
          )}

          {/* Note source */}
          <p className="text-[10px] text-gray-400 mt-3 text-center">
            Référence : OMS Child Growth Standards + WHO Reference 2007 ·
            Compatible AFPA-CRESS-INSERM-SFP 2018
          </p>
        </>
      )}
    </div>
  );
}
