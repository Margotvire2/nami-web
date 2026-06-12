"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type ConsultationSummary } from "@/lib/api";
import { Clock, CheckCircle2, Circle, Sparkles, FileText, Loader2, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatWeekdayDate(iso: string) {
  const d = parseISO(iso);
  return format(d, "EEEE d MMMM yyyy", { locale: fr });
}

function formatTime(iso: string) {
  return format(parseISO(iso), "HH:mm");
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "en cours";
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalMin = Math.round(ms / 60000);
  if (totalMin <= 0) return "< 1 min";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

function extractSummaryLine(c: ConsultationSummary): string | null {
  const text = c.aiSummary ?? c.notes;
  if (!text) return null;
  const firstLine = text.split("\n").find((l) => l.trim().length > 10);
  if (!firstLine) return null;
  const trimmed = firstLine.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
  return trimmed.length > 90 ? trimmed.slice(0, 90) + "…" : trimmed;
}

// ─── Carte consultation ───────────────────────────────────────────────────────

function ConsultationCard({
  c,
  careCaseId,
  providerLabel,
}: {
  c: ConsultationSummary;
  careCaseId: string;
  providerLabel: string | null;
}) {
  const isCompleted = c.status === "COMPLETED";
  const hasAiContent = c.aiSummaryStatus === "DONE" || !!c.generatedNote;
  const summaryLine = extractSummaryLine(c);
  const date = formatWeekdayDate(c.startedAt);
  const time = formatTime(c.startedAt);
  const duration = formatDuration(c.startedAt, c.completedAt);

  return (
    <Link
      href={`/consultations/${c.id}?careCaseId=${careCaseId}`}
      className="group block bg-white rounded-2xl border border-[rgba(26,26,46,0.07)] p-4 hover:shadow-[0_4px_16px_rgba(26,26,46,0.08)] hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
    >

      {/* Row 1: date + status */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A2E] capitalize leading-tight">
            {date}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#8A8A96] flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {time} · {duration}
            </span>
            {providerLabel && (
              <span className="flex items-center gap-1">
                <User size={11} />
                {providerLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted ? (
            <CheckCircle2 size={15} className="text-[#2BA84A]" />
          ) : (
            <Circle size={15} className="text-[#E6993E]" />
          )}
        </div>
      </div>

      {/* Summary line */}
      {summaryLine && (
        <p className="text-[12px] text-[#4A4A5A] line-clamp-2 mb-2 leading-relaxed">
          {summaryLine}
        </p>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasAiContent && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(91,78,196,0.08)] text-[#5B4EC4]">
            <Sparkles size={9} />
            Compte-rendu
          </span>
        )}
        {!hasAiContent && c.notes && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(26,26,46,0.05)] text-[#4A4A5A]">
            <FileText size={9} />
            Notes
          </span>
        )}
        {c.audioDurationSec && c.audioDurationSec > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(43,168,156,0.08)] text-[#2BA89C]">
            🎙 Audio
          </span>
        )}
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
        <p className="text-xs text-[#8A8A96]">Les consultations apparaissent ici une fois démarrées depuis le dossier patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#8A8A96] mb-2">
        {consultations.length} consultation{consultations.length > 1 ? "s" : ""}
      </p>
      {consultations.map((c) => {
        const providerLabel = c.provider
          ? `${c.provider.person.firstName} ${c.provider.person.lastName}`
          : null;
        return (
          <ConsultationCard
            key={c.id}
            c={c}
            careCaseId={careCaseId}
            providerLabel={providerLabel}
          />
        );
      })}
    </div>
  );
}
