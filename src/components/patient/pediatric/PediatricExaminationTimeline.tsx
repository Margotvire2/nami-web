"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Clock, AlertTriangle, SkipForward, ChevronDown, ChevronUp } from "lucide-react";
import type { PediatricExamination } from "./types";

interface Props {
  examinations: PediatricExamination[];
}

const STATUS_CONFIG = {
  DONE:      { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Réalisé" },
  DUE:       { icon: Clock,        color: "text-[#5B4EC4]",   bg: "bg-[#5B4EC4]/5", label: "À documenter" },
  OVERDUE:   { icon: AlertTriangle,color: "text-amber-600",   bg: "bg-amber-50",    label: "Non documenté" },
  UPCOMING:  { icon: Clock,        color: "text-[#8A8A96]",   bg: "bg-[#FAFAF8]",  label: "À venir" },
  SKIPPED:   { icon: SkipForward,  color: "text-[#8A8A96]",   bg: "bg-[#FAFAF8]",  label: "Non réalisé" },
  CANCELLED: { icon: SkipForward,  color: "text-[#8A8A96]",   bg: "bg-[#FAFAF8]",  label: "Annulé" },
};

export function PediatricExaminationTimeline({ examinations }: Props) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll
    ? examinations
    : examinations.filter((e) => e.status !== "UPCOMING").slice(0, 8);

  const hasMore = examinations.filter((e) => e.status !== "UPCOMING").length > 8 || examinations.some((e) => e.status === "UPCOMING");

  const counts = {
    done:    examinations.filter((e) => e.status === "DONE").length,
    overdue: examinations.filter((e) => e.status === "OVERDUE").length,
    due:     examinations.filter((e) => e.status === "DUE").length,
  };

  return (
    <div className="space-y-3">
      {/* Indicateurs de complétude */}
      <div className="flex gap-3 text-xs">
        <span className="text-emerald-600 font-medium">{counts.done}/{examinations.length} réalisés</span>
        {counts.due > 0 && <span className="text-[#5B4EC4] font-medium">{counts.due} à documenter</span>}
        {counts.overdue > 0 && <span className="text-amber-600 font-medium">{counts.overdue} non documentés</span>}
      </div>

      {/* Liste */}
      <div className="space-y-1">
        {visible.map((exam) => (
          <ExamRow key={exam.id} exam={exam} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="flex items-center gap-1 text-xs text-[#5B4EC4] hover:underline"
        >
          {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showAll ? "Réduire" : `Voir tous (${examinations.length})`}
        </button>
      )}
    </div>
  );
}

function ExamRow({ exam }: { exam: PediatricExamination }) {
  const cfg = STATUS_CONFIG[exam.status] ?? STATUS_CONFIG.UPCOMING;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${cfg.bg}`}>
      <Icon size={14} className={cfg.color} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#1A1A2E] truncate">{exam.label}</p>
        <p className="text-[10px] text-[#8A8A96]">
          {exam.performedDate
            ? `Réalisé le ${format(new Date(exam.performedDate), "d MMM yyyy", { locale: fr })}`
            : `Prévu ${format(new Date(exam.dueDate), "d MMM yyyy", { locale: fr })}`}
          {exam.hasTndScreening && <span className="ml-2 text-[#5B4EC4]">· Grille TND</span>}
        </p>
      </div>
      <span className={`text-[10px] font-medium ${cfg.color} shrink-0`}>{cfg.label}</span>
    </div>
  );
}
