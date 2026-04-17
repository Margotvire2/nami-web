"use client";

import { useState } from "react";
import { X, ClipboardList } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

interface Props {
  careCaseId: string;
  patientFirstName: string;
  onClose: () => void;
}

const QUESTIONNAIRES = [
  {
    code: "edeq",
    label: "EDE-Q",
    fullLabel: "Examen des troubles alimentaires",
    desc: "28 questions · 8–12 min",
    emoji: "🪞",
  },
  {
    code: "phq9",
    label: "PHQ-9",
    fullLabel: "Questionnaire santé / dépression",
    desc: "9 questions · 2–3 min",
    emoji: "🧠",
  },
  {
    code: "eat26",
    label: "EAT-26",
    fullLabel: "Test des attitudes alimentaires",
    desc: "26 questions · 5–8 min",
    emoji: "🍽️",
  },
  {
    code: "gad7",
    label: "GAD-7",
    fullLabel: "Anxiété généralisée",
    desc: "7 questions · 2 min",
    emoji: "😰",
  },
  {
    code: "scoff",
    label: "SCOFF",
    fullLabel: "Dépistage rapide TCA",
    desc: "5 questions · 1 min",
    emoji: "🔍",
  },
] as const;

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ScheduleQuestionnaireModal({ careCaseId, patientFirstName, onClose }: Props) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const api = apiWithToken(accessToken!);

  // Default: tomorrow at 09:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const [selectedCode, setSelectedCode] = useState<string>("edeq");
  const [scheduledAt, setScheduledAt] = useState<string>(toLocalDatetimeValue(tomorrow));
  const [message, setMessage] = useState<string>("");

  const minDatetime = toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)); // +5 min

  const mutation = useMutation({
    mutationFn: () =>
      api.tasks.scheduleQuestionnaire(careCaseId, {
        questionnaireCode: selectedCode,
        scheduledAt: new Date(scheduledAt).toISOString(),
        patientMessage: message.trim() || undefined,
      }),
    onSuccess: () => {
      const q = QUESTIONNAIRES.find((q) => q.code === selectedCode);
      const dateLabel = new Date(scheduledAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
            <div className="space-y-2">
              {QUESTIONNAIRES.map((q) => (
                <button
                  key={q.code}
                  type="button"
                  onClick={() => setSelectedCode(q.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedCode === q.code
                      ? "border-[#5B4EC4] bg-[#F5F3FF]"
                      : "border-[#E8ECF4] hover:border-[#C4B5FD] hover:bg-[#FAFAF8]"
                  }`}
                >
                  <span className="text-xl shrink-0">{q.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold ${selectedCode === q.code ? "text-[#5B4EC4]" : "text-[#0F172A]"}`}>
                      {q.label}
                    </p>
                    <p className="text-[12px] text-[#64748B] truncate">{q.fullLabel} · {q.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    selectedCode === q.code ? "border-[#5B4EC4] bg-[#5B4EC4]" : "border-[#CBD5E1]"
                  }`}>
                    {selectedCode === q.code && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
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
            disabled={mutation.isPending || !scheduledAt}
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
