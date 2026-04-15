"use client";

import Link from "next/link";
import { ChevronLeft, Command, Mic } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, PatientCondition } from "@/lib/api";
import { PatientDashboard } from "@/hooks/usePatientDashboard";
import { CareCaseDetail } from "@/lib/api";
import { PATHOLOGIES } from "@/lib/data/pathologies";
import { CompletenessPlant, computeCompleteness } from "@/components/ui/CompletenessPlant";

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
  onRecord,
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

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent("nami-command-palette"));
  }

  return (
    <div className="px-6 sm:px-8 py-2.5 border-b border-gray-100 bg-white">
      {/* Row 1: back + name + actions */}
      <div className="flex items-center gap-3">
        <Link href="/patients" className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <h1 className="text-base font-semibold text-gray-900 truncate flex-1 min-w-0">
          {c.patient.firstName} {c.patient.lastName}
        </h1>

        {/* Demographics inline — row 2 on large screens, collapsed here on small */}
        <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
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
          <CompletenessPlant percentage={computeCompleteness(c)} size={16} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={openCommandPalette}
            title="Palette de commandes (⌘K)"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Command className="w-3 h-3" />
            <span className="hidden sm:inline text-[10px] text-gray-400">⌘K</span>
          </button>
          <button
            onClick={onRecord}
            title="Dicter une note"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] transition-colors"
          >
            <Mic className="w-3 h-3" />
            <span className="hidden sm:inline">Dicter</span>
          </button>
        </div>
      </div>

      {/* Row 2: demographics (mobile) */}
      <div className="flex md:hidden items-center gap-1.5 text-xs text-gray-500 mt-0.5 ml-7">
        {age && <span>{age} ans</span>}
        {sexLabel && <><span>·</span><span>{sexLabel}</span></>}
        {poids?.value && (
          <>
            <span>·</span>
            <span>{poids.value} {poids.unit}</span>
          </>
        )}
        {imc?.value && <><span>·</span><span>IMC {imc.value}</span></>}
        <CompletenessPlant percentage={computeCompleteness(c)} size={16} />
      </div>

      {/* Row 3: primary condition badge */}
      {primaryCondition && (() => {
        const slug = CIM_TO_SLUG[primaryCondition.conditionCode];
        const badge = (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EDE9FC] text-[#5B4EC4] mt-0.5 ml-7">
            {primaryCondition.conditionLabel}
            {slug && <span className="ml-1 opacity-50 text-[9px]">↗</span>}
          </span>
        );
        return slug ? (
          <Link href={`/pathologies/${slug}`} target="_blank" rel="noopener noreferrer">
            {badge}
          </Link>
        ) : (
          <span>{badge}</span>
        );
      })()}
    </div>
  );
}
