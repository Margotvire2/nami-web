"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PediatricExamination } from "./types";

interface Props {
  exam: PediatricExamination & { parentVisibleNotes?: string | null; clinicalNotes?: string | null };
  profileId: string;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function PediatricExaminationModal({ exam, profileId, onClose }: Props) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const [performedDate, setPerformedDate] = useState(
    exam.performedDate ? format(new Date(exam.performedDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [parentNotes, setParentNotes]   = useState(exam.parentVisibleNotes ?? "");
  const [clinicalNotes, setClinicalNotes] = useState((exam as any).clinicalNotes ?? "");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        performedDate: new Date(performedDate).toISOString(),
        parentVisibleNotes: parentNotes || null,
        clinicalNotes:      clinicalNotes || null,
        ...(status ? { status } : {}),
      };
      const res = await fetch(
        `${API_URL}/pediatric/profiles/${profileId}/examinations/${exam.type}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      toast.success("Examen enregistré");
      qc.invalidateQueries({ queryKey: ["pediatric-profile"] });
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">{exam.label}</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A2E]">
            <X size={16} />
          </button>
        </div>

        {/* Date de réalisation */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#374151]">Date de réalisation</label>
          <input
            type="date"
            value={performedDate}
            onChange={(e) => setPerformedDate(e.target.value)}
            className="w-full text-sm border border-[rgba(26,26,46,0.1)] rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
          />
        </div>

        {/* Notes carnet (visibles parent) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#374151]">
            Notes carnet{" "}
            <span className="text-[#6B7280] font-normal">(visibles par les parents)</span>
          </label>
          <textarea
            value={parentNotes}
            onChange={(e) => setParentNotes(e.target.value)}
            placeholder="Ex : RAS, bon développement, prise de poids régulière…"
            rows={3}
            className="w-full text-sm border border-[rgba(26,26,46,0.1)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
          />
        </div>

        {/* Notes cliniques (équipe uniquement) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#374151]">
            Notes cliniques{" "}
            <span className="text-[#6B7280] font-normal">(équipe soignante uniquement)</span>
          </label>
          <textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="Observations cliniques, points à suivre, hypothèses…"
            rows={3}
            className="w-full text-sm border border-[rgba(26,26,46,0.1)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30"
          />
          <p className="text-[10px] text-[#6B7280]">Non transmises aux parents</p>
        </div>

        {/* Bouton */}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-[#5B4EC4] text-white text-sm font-medium rounded-xl py-2.5 hover:bg-[#5B4EC4] disabled:opacity-50 transition-colors"
        >
          {saveMutation.isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Enregistrement…</>
          ) : (
            <><CheckCircle2 size={14} /> Enregistrer</>
          )}
        </button>
      </div>
    </div>
  );
}
