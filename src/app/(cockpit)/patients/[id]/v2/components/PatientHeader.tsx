"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, PatientCondition } from "@/lib/api";
import { PatientDashboard } from "@/hooks/usePatientDashboard";
import { CareCaseDetail } from "@/lib/api";
import { PATHOLOGIES } from "@/lib/data/pathologies";


// CIM-11 code → pathology slug (code principal + aliases)
const CIM_TO_SLUG: Record<string, string> = Object.fromEntries([
  ...PATHOLOGIES.filter((p) => p.cim11).map((p) => [p.cim11!, p.slug]),
  ...PATHOLOGIES.flatMap((p) => (p.cim11Aliases ?? []).map((alias) => [alias, p.slug])),
]);

interface Props {
  dashboard: PatientDashboard;
  careCase: CareCaseDetail;
  careCaseId: string;
  onAddNote: () => void;
  onReferral: () => void;
  onTask: () => void;
  onRecord: () => void;
  onStartConsultation?: () => void;
  onAiSummarize: () => void;
  aiStreaming: boolean;
}

export function PatientHeader({
  dashboard,
  careCase,
  careCaseId,
  onAddNote,
  onReferral,
  onTask,
  onStartConsultation,
  onAiSummarize,
  aiStreaming,
}: Props) {
  const { indicators } = dashboard;
  const c = careCase;

  const { data: conditions = [] } = useQuery<PatientCondition[]>({
    queryKey: ["conditions", careCaseId],
    queryFn: async () => {
      const res = await api.get<PatientCondition[]>(`/care-cases/${careCaseId}/conditions`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const poids = indicators.find((i) => ["weight_kg", "poids"].includes(i.metricKey));
  const imc = indicators.find((i) => ["bmi", "imc"].includes(i.metricKey));

  const age = c.patient.birthDate
    ? Math.floor((Date.now() - new Date(c.patient.birthDate).getTime()) / (365.25 * 24 * 3600000))
    : null;

  const sexLabel =
    c.patient.sex === "F" || c.patient.sex === "FEMALE"
      ? "F"
      : c.patient.sex === "M" || c.patient.sex === "MALE"
      ? "M"
      : null;

  const primaryCondition = conditions.find((cond) => cond.conditionType === "PRIMARY") ?? conditions[0];

  return (
    <div className="px-6 sm:px-8 py-2.5 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        {/* Back */}
        <Link href="/patients" className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {/* Name + demographics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {c.patient.firstName} {c.patient.lastName}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              {age && <span>{age} ans</span>}
              {sexLabel && <><span>·</span><span>{sexLabel}</span></>}
              {poids?.value && (
                <>
                  <span>·</span>
                  <span>
                    {poids.value} {poids.unit}
                    {poids.delta ? (
                      <span className={`ml-0.5 text-xs ${poids.delta > 0 ? "text-green-600" : "text-red-500"}`}>
                        ({poids.delta > 0 ? "+" : ""}{poids.delta.toFixed(1)})
                      </span>
                    ) : null}
                  </span>
                </>
              )}
              {imc?.value && <><span>·</span><span>IMC {imc.value}</span></>}
            </div>
          </div>

          {/* Condition badge */}
          {primaryCondition && (() => {
            const slug = CIM_TO_SLUG[primaryCondition.conditionCode];
            const badge = (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EDE9FC] text-[#5B4EC4]">
                {primaryCondition.conditionLabel}
                {slug && <span className="ml-1 opacity-50 text-[9px]">↗</span>}
              </span>
            );
            return slug ? (
              <Link key={primaryCondition.id} href={`/pathologies/${slug}`} target="_blank" rel="noopener noreferrer">
                {badge}
              </Link>
            ) : (
              <span key={primaryCondition.id}>{badge}</span>
            );
          })()}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ActionButton label="Note" icon="✏️" onClick={onAddNote} />
          <ActionButton label="Tâche" icon="☑️" onClick={onTask} />
          <ActionButton label="Adresser" icon="↗️" onClick={onReferral} />
          {onStartConsultation && (
            <ActionButton label="Enregistrer" icon="🎙️" accent onClick={onStartConsultation} />
          )}
          <ActionButton
            label={aiStreaming ? "Génération…" : "Synthèse"}
            icon="✨"
            onClick={onAiSummarize}
            disabled={aiStreaming}
          />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  accent,
  onClick,
  disabled,
}: {
  label: string;
  icon: string;
  accent?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-colors duration-150 disabled:opacity-50
        ${
          accent
            ? "bg-[#5B4EC4] text-white hover:bg-[#4A3DB3]"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        }
      `}
    >
      <span className="text-base">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ExportPdfButton({ careCaseId }: { careCaseId: string }) {
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  async function handleExport() {
    setLoading(true);
    try {
      const token = (() => {
        try { const s = localStorage.getItem("nami-auth"); return s ? JSON.parse(s)?.state?.accessToken : null; } catch { return null; }
      })();
      const res = await fetch(`${API_URL}/care-cases/${careCaseId}/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-${careCaseId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      title="Exporter en PDF"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 disabled:opacity-50"
    >
      {loading ? "⏳" : "📄"} Export
    </button>
  );
}
