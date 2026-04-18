"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Clock, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { PediatricVaccination } from "./types";

interface Props {
  vaccinations: PediatricVaccination[];
}

const STATUS_CONFIG = {
  DONE:     { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50",      label: "Administré" },
  DUE:      { icon: Clock,        color: "text-[#5B4EC4]",   bg: "bg-[#5B4EC4]/5",    label: "À documenter" },
  OVERDUE:  { icon: AlertTriangle,color: "text-amber-600",   bg: "bg-amber-50",        label: "Non documenté" },
  DEFERRED: { icon: Clock,        color: "text-[#8A8A96]",   bg: "bg-[#FAFAF8]",      label: "Différé" },
  REFUSED:  { icon: XCircle,      color: "text-red-400",     bg: "bg-red-50/60",      label: "Refusé" },
};

export function PediatricVaccinationTimeline({ vaccinations }: Props) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll
    ? vaccinations
    : vaccinations.filter((v) => v.status !== "DUE" || new Date(v.dueDate) <= new Date()).slice(0, 10);

  const counts = {
    done:    vaccinations.filter((v) => v.status === "DONE").length,
    overdue: vaccinations.filter((v) => v.status === "OVERDUE").length,
    due:     vaccinations.filter((v) => v.status === "DUE").length,
  };

  return (
    <div className="space-y-3">
      {/* Indicateurs */}
      <div className="flex gap-3 text-xs">
        <span className="text-emerald-600 font-medium">{counts.done}/{vaccinations.length} administrés</span>
        {counts.due > 0 && <span className="text-[#5B4EC4] font-medium">{counts.due} à documenter</span>}
        {counts.overdue > 0 && <span className="text-amber-600 font-medium">{counts.overdue} non documentés</span>}
      </div>

      <div className="space-y-1">
        {visible.map((vac) => (
          <VacRow key={vac.id} vac={vac} />
        ))}
      </div>

      <button
        onClick={() => setShowAll((s) => !s)}
        className="flex items-center gap-1 text-xs text-[#5B4EC4] hover:underline"
      >
        {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {showAll ? "Réduire" : `Voir tous les vaccins (${vaccinations.length})`}
      </button>
    </div>
  );
}

function VacRow({ vac }: { vac: PediatricVaccination }) {
  const cfg = STATUS_CONFIG[vac.status] ?? STATUS_CONFIG.DUE;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${cfg.bg}`}>
      <Icon size={14} className={cfg.color} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#1A1A2E] truncate">{vac.vaccineName}</p>
        <p className="text-[10px] text-[#8A8A96]">
          {vac.administeredDate
            ? `Le ${format(new Date(vac.administeredDate), "d MMM yyyy", { locale: fr })}`
            : `Prévu ${format(new Date(vac.dueDate), "d MMM yyyy", { locale: fr })}`}
          {vac.batchNumber && <span className="ml-2">· Lot {vac.batchNumber}</span>}
        </p>
      </div>
      <span className={`text-[10px] font-medium ${cfg.color} shrink-0`}>{cfg.label}</span>
    </div>
  );
}
