"use client";

import { useState, useMemo } from "react";
import { X, ClipboardList } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

interface Props {
  careCaseId: string;
  patientFirstName: string;
  patientBirthDate: string | null;
  onClose: () => void;
}

const ALL_QUESTIONNAIRES = [
  { code: "edeq",  label: "EDE-Q",  fullLabel: "Examen des troubles alimentaires", desc: "28 questions · 8–12 min", emoji: "🪞" },
  { code: "phq9",  label: "PHQ-9",  fullLabel: "Questionnaire santé / dépression",  desc: "9 questions · 2–3 min",  emoji: "🧠" },
  { code: "eat26", label: "EAT-26", fullLabel: "Test des attitudes alimentaires",    desc: "26 questions · 5–8 min", emoji: "🍽️" },
  { code: "gad7",  label: "GAD-7",  fullLabel: "Anxiété généralisée",                desc: "7 questions · 2 min",   emoji: "😰" },
  { code: "scoff", label: "SCOFF",  fullLabel: "Dépistage rapide TCA",              desc: "5 questions · 1 min",   emoji: "🔍" },
] as const;

type QuestionnaireCode = typeof ALL_QUESTIONNAIRES[number]["code"];

const QUESTIONNAIRES_PAR_FAMILLE: Record<string, QuestionnaireCode[]> = {
  tca:           ["edeq", "scoff", "eat26", "phq9", "gad7"],
  pedopsychiatrie: ["edeq", "scoff", "phq9", "gad7"],
  obesity:       ["phq9", "gad7", "edeq"],
  nutrition:     ["phq9", "gad7"],
  nutrition_clinique: ["phq9", "gad7"],
  dt2:           ["phq9", "gad7"],
  diabete:       ["phq9", "gad7"],
  cardio:        ["phq9"],
  hta:           ["phq9"],
  sante_mentale: ["phq9", "gad7"],
  psychiatrie:   ["phq9", "gad7"],
  neurologie:    ["phq9", "gad7"],
  digestif:      ["phq9", "gad7"],
  gastro:        ["phq9", "gad7"],
  pediatrics:    ["phq9", "gad7"],
  gynecologie:   ["phq9", "gad7"],
  rhumato:       ["phq9", "gad7"],
  oncologie:     ["phq9", "gad7"],
  renal:         ["phq9", "gad7"],
  nephro:        ["phq9", "gad7"],
  pneumologie:   ["phq9", "gad7"],
  endocrino:     ["phq9", "gad7"],
  infectiologie: ["phq9", "gad7"],
  hemato:        ["phq9", "gad7"],
  addiction:     ["phq9", "gad7"],
  post_bariatrique: ["phq9", "gad7", "edeq"],
};

// Âge minimum (et max) pour chaque questionnaire (en années)
const QUESTIONNAIRE_AGE_LIMITS: Partial<Record<QuestionnaireCode, { min?: number; max?: number }>> = {
  edeq:  { min: 14 },
  scoff: { min: 15 },
  eat26: { min: 13 },
  phq9:  { min: 12 },
  gad7:  { min: 12 },
};

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600000));
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ScheduleQuestionnaireModal({ careCaseId, patientFirstName, patientBirthDate, onClose }: Props) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const api = apiWithToken(accessToken!);

  // Fetch pathway family from template-steps endpoint (already cached by ViewParcours)
  const { data: pathwayData } = useQuery({
    queryKey: ["pathway-template-steps", careCaseId],
    queryFn: () => api.careCases.pathwayTemplateSteps(careCaseId),
    staleTime: 5 * 60 * 1000,
  });
  const family = pathwayData?.pathway?.family ?? "";

  const patientAge = calcAge(patientBirthDate);

  // Filter by pathway family + patient age
  const availableQuestionnaires = useMemo(() => {
    const allowed: QuestionnaireCode[] = family
      ? (QUESTIONNAIRES_PAR_FAMILLE[family] ?? (["phq9", "gad7"] as QuestionnaireCode[]))
      : ALL_QUESTIONNAIRES.map((q) => q.code as QuestionnaireCode);

    return ALL_QUESTIONNAIRES.filter((q) => {
      if (!allowed.includes(q.code as QuestionnaireCode)) return false;
      const limits = QUESTIONNAIRE_AGE_LIMITS[q.code as QuestionnaireCode];
      if (!limits) return true;
      if (patientAge !== null) {
        if (limits.min !== undefined && patientAge < limits.min) return false;
        if (limits.max !== undefined && patientAge > limits.max) return false;
      }
      return true;
    });
  }, [family, patientAge]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const [selectedCode, setSelectedCode] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>(toLocalDatetimeValue(tomorrow));
  const [message, setMessage] = useState<string>("");

  // Auto-select first available questionnaire when list resolves
  const effectiveSelected = selectedCode || availableQuestionnaires[0]?.code || "";

  const minDatetime = toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000));

  const mutation = useMutation({
    mutationFn: () =>
      api.tasks.scheduleQuestionnaire(careCaseId, {
        questionnaireCode: effectiveSelected,
        scheduledAt: new Date(scheduledAt).toISOString(),
        patientMessage: message.trim() || undefined,
      }),
    onSuccess: () => {
      const q = ALL_QUESTIONNAIRES.find((q) => q.code === effectiveSelected);
      const dateLabel = new Date(scheduledAt).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      toast.success(`${q?.label ?? "Questionnaire"} programmé pour le ${dateLabel}`);
      qc.invalidateQueries({ queryKey: ["tasks", careCaseId] });
      qc.invalidateQueries({ queryKey: ["tasks-mine"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" style={{ border: "1px solid #E8ECF4" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8ECF4]">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-[#5B4EC4]" />
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Programmer un questionnaire</h2>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Questionnaire selector */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B] mb-2.5">
              Questionnaire
            </p>

            {availableQuestionnaires.length === 0 ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-[#FFF7ED] border border-[#FED7AA]">
                <span className="text-base shrink-0">⚠️</span>
                <p className="text-[13px] text-[#92400E]">
                  Aucun questionnaire validé pour ce patient (âge ou parcours non compatible).
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableQuestionnaires.map((q) => {
                  const isSelected = (selectedCode || availableQuestionnaires[0]?.code) === q.code;
                  return (
                    <button
                      key={q.code}
                      type="button"
                      onClick={() => setSelectedCode(q.code)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? "border-[#5B4EC4] bg-[#F5F3FF]"
                          : "border-[#E8ECF4] hover:border-[#C4B5FD] hover:bg-[#FAFAF8]"
                      }`}
                    >
                      <span className="text-xl shrink-0">{q.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold ${isSelected ? "text-[#5B4EC4]" : "text-[#0F172A]"}`}>
                          {q.label}
                        </p>
                        <p className="text-[12px] text-[#64748B] truncate">{q.fullLabel} · {q.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        isSelected ? "border-[#5B4EC4] bg-[#5B4EC4]" : "border-[#CBD5E1]"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date/time picker */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B] mb-2">
              Envoyer le
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minDatetime}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF4] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
            />
          </div>

          {/* Message personnalisé */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B] mb-2">
              Message personnalisé <span className="font-normal normal-case text-[#94A3B8]">(optionnel)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Bonjour ${patientFirstName}, merci de remplir ce questionnaire avant notre prochain rendez-vous.`}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF4] text-[13px] text-[#0F172A] resize-none focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4] placeholder:text-[#CBD5E1]"
            />
            <p className="text-[11px] text-[#94A3B8] mt-1">{message.length}/500</p>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]">
            <span className="text-base shrink-0">ℹ️</span>
            <p className="text-[12px] text-[#0369A1] leading-relaxed">
              {patientFirstName} recevra une notification push sur son téléphone à la date choisie. Le message personnalisé est conservé dans la tâche pour référence.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8ECF4]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !scheduledAt || availableQuestionnaires.length === 0}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#5B4EC4] hover:bg-[#4A3DB3] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {mutation.isPending ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Programmation…</>
            ) : (
              <><ClipboardList size={14} /> Programmer</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
