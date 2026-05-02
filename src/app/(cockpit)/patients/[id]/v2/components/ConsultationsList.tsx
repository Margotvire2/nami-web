"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type ConsultationSummary } from "@/lib/api";
import { Clock, CheckCircle2, Circle, Sparkles, FileText, Loader2 } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "en cours";
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalMin = Math.round(ms / 60000);
  return totalMin > 0 ? `${totalMin} min` : "< 1 min";
}

// ─── Carte consultation ───────────────────────────────────────────────────────

function ConsultationCard({ c, careCaseId }: { c: ConsultationSummary; careCaseId: string }) {
  const isCompleted = c.status === "COMPLETED";
  const StatusIcon = isCompleted ? CheckCircle2 : Circle;
  const statusColor = isCompleted ? "text-green-600" : "text-amber-500";

  const hasAiContent = c.aiSummaryStatus === "DONE" || !!c.generatedNote;

  return (
    <Link
      href={`/consultations/${c.id}?careCaseId=${careCaseId}`}
      className="block bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon size={14} className={statusColor} />
            <span className="text-sm font-medium text-[#1A1A2E]">
              {formatDate(c.startedAt)}
            </span>
            <span className="text-xs text-gray-400">à {formatTime(c.startedAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDuration(c.startedAt, c.completedAt)}
            </span>
            {hasAiContent && (
              <span className="flex items-center gap-1 text-[#5B4EC4]">
                <Sparkles size={11} />
                Compte-rendu disponible
              </span>
            )}
            {!hasAiContent && c.notes && (
              <span className="flex items-center gap-1">
                <FileText size={11} />
                Notes
              </span>
            )}
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ─── ConsultationsList ────────────────────────────────────────────────────────

type Props = {
  careCaseId: string;
};

export function ConsultationsList({ careCaseId }: Props) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const { data: consultations, isLoading } = useQuery({
    queryKey: ["consultations", "by-care-case", careCaseId],
    queryFn: () => api.consultations.listByCareCase(careCaseId),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-[#5B4EC4]" />
      </div>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEEDFB] mb-3">
          <Clock size={20} className="text-[#5B4EC4]" />
        </div>
        <p className="text-sm font-medium text-[#1A1A2E] mb-1">Aucune consultation enregistrée</p>
        <p className="text-xs text-gray-400">Les consultations apparaissent ici une fois démarrées depuis le dossier patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-1">{consultations.length} consultation{consultations.length > 1 ? "s" : ""}</p>
      {consultations.map((c) => (
        <ConsultationCard key={c.id} c={c} careCaseId={careCaseId} />
      ))}
    </div>
  );
}
