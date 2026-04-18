"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, Edit3 } from "lucide-react";
import type { PendingObservation } from "./types";

interface Props {
  obs: PendingObservation;
  onValidate: (id: string, correctedValue?: number) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export function ObservationValidationCard({ obs, onValidate, onReject }: Props) {
  const [editing, setEditing] = useState(false);
  const [corrected, setCorrected] = useState<string>(
    obs.valueNumeric != null ? String(obs.valueNumeric) : ""
  );
  const [busy, setBusy] = useState(false);

  async function handleValidate() {
    setBusy(true);
    try {
      const val = editing && corrected !== "" ? parseFloat(corrected) : undefined;
      await onValidate(obs.id, val);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    try {
      await onReject(obs.id, "Rejetée par le soignant");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-[rgba(26,26,46,0.06)] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-[#1A1A2E]">{obs.metric.label}</p>
          <p className="text-[10px] text-[#8A8A96]">
            {format(new Date(obs.effectiveAt), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <input
              type="number"
              value={corrected}
              onChange={(e) => setCorrected(e.target.value)}
              step="0.01"
              className="w-20 text-sm border border-[#5B4EC4] rounded px-2 py-1 text-right"
            />
          ) : (
            <span className="text-sm font-semibold text-amber-600">
              {obs.valueNumeric != null ? `${obs.valueNumeric} ${obs.metric.unit ?? ""}` : obs.valueText ?? "—"}
            </span>
          )}
          <button
            onClick={() => setEditing((e) => !e)}
            className="text-[#8A8A96] hover:text-[#5B4EC4] transition-colors"
            title="Corriger la valeur"
          >
            <Edit3 size={12} />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-amber-600">Extrait automatiquement — à vérifier par le soignant</p>

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={handleValidate}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          <CheckCircle2 size={13} />
          Valider
        </button>
        <button
          disabled={busy}
          onClick={handleReject}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <XCircle size={13} />
          Rejeter
        </button>
      </div>
    </div>
  );
}
