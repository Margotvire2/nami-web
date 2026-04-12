"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PatientDashboard } from "@/hooks/usePatientDashboard";
import { CareCaseDetail } from "@/lib/api";

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
  onRecord,
  onStartConsultation,
  onAiSummarize,
  aiStreaming,
}: Props) {
  const { pathway, indicators } = dashboard;
  const c = careCase;

  const poids = indicators.find((i) => ["weight_kg", "poids"].includes(i.metricKey));
  const imc = indicators.find((i) => ["bmi", "imc"].includes(i.metricKey));

  const age = c.patient.birthDate
    ? Math.floor((Date.now() - new Date(c.patient.birthDate).getTime()) / (365.25 * 24 * 3600000))
    : null;

  return (
    <div className="py-6 px-6 sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {c.patient.firstName} {c.patient.lastName}
          </h1>
          {/* Ligne démographique */}
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            {age && <span>{age} ans</span>}
            {c.patient.sex && (
              <span>
                •{" "}
                {c.patient.sex === "F" || c.patient.sex === "FEMALE"
                  ? "Femme"
                  : c.patient.sex === "M" || c.patient.sex === "MALE"
                  ? "Homme"
                  : c.patient.sex}
              </span>
            )}
            {poids?.value && (
              <>
                <span>•</span>
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
            {imc?.value && (
              <>
                <span>•</span>
                <span>IMC {imc.value}</span>
              </>
            )}
          </div>
          {/* Badges parcours — ligne séparée */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {pathway && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EDE9FC] text-[#5B4EC4]">
                {pathway.label}
              </span>
            )}
            {c.careStage && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {c.careStage}
              </span>
            )}
            {c.leadProvider && (
              <span className="text-xs text-gray-400">
                Lead : {c.leadProvider.person.firstName} {c.leadProvider.person.lastName}
              </span>
            )}
            {c.nextStepSummary && (
              <span className="text-xs text-gray-400">→ {c.nextStepSummary}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Équipe */}
          <div className="hidden sm:flex items-center gap-1.5">
            <TeamAvatars careCaseId={careCaseId} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ActionButton label="Note" icon="✏️" onClick={onAddNote} />
            <ActionButton label="Tâche" icon="☑️" onClick={onTask} />
            <ActionButton label="Adresser" icon="↗️" onClick={onReferral} />
            <ActionButton label="Enregistrer" icon="🎙️" onClick={onRecord} />
            {onStartConsultation && (
              <ActionButton label="Consultation" icon="🩺" accent onClick={onStartConsultation} />
            )}
            <ActionButton
              label={aiStreaming ? "Génération…" : "Résumé IA"}
              icon="✨"
              onClick={onAiSummarize}
              disabled={aiStreaming}
            />
          </div>
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

function TeamAvatars({ careCaseId }: { careCaseId: string }) {
  const { data: team } = useQuery({
    queryKey: ["team", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/team`);
      return res.data;
    },
  });

  const members: any[] = team?.members || team || [];
  const visible = members.slice(0, 4);

  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {visible.map((m: any, i: number) => {
          const p = m.person || m;
          const initials = `${p.firstName?.[0] || "?"}${p.lastName?.[0] || ""}`.toUpperCase();
          return (
            <div
              key={m.id || i}
              className="w-7 h-7 rounded-full border-2 border-white bg-[#EDE9FC] flex items-center justify-center text-[9px] font-semibold text-[#5B4EC4]"
              title={`${p.firstName || ""} ${p.lastName || ""}`.trim()}
            >
              {initials}
            </div>
          );
        })}
      </div>
      {members.length > 0 && (
        <span className="text-xs text-gray-400">{members.length}</span>
      )}
    </div>
  );
}
