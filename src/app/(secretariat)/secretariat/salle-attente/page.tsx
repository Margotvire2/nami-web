"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Armchair, ArrowLeft, RefreshCw, Clock, UserX } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { secretaryApi } from "@/lib/api";

type Severity = "calm" | "warning" | "urgent";

function severityOf(minutes: number): Severity {
  if (minutes >= 30) return "urgent";
  if (minutes >= 15) return "warning";
  return "calm";
}

const SEVERITY_STYLES: Record<
  Severity,
  { cardBg: string; cardBorder: string; chipBg: string; chipText: string; label: string }
> = {
  calm: {
    cardBg: "#FFFFFF",
    cardBorder: "#E8ECF4",
    chipBg: "#ECFDF5",
    chipText: "#047857",
    label: "Vient d'arriver",
  },
  warning: {
    cardBg: "#FFFBEB",
    cardBorder: "#FCD34D",
    chipBg: "#FEF3C7",
    chipText: "#92400E",
    label: "Attente modérée",
  },
  urgent: {
    cardBg: "#FEF2F2",
    cardBorder: "#FCA5A5",
    chipBg: "#FEE2E2",
    chipText: "#B91C1C",
    label: "Attente longue",
  },
};

function formatWait(minutes: number): string {
  if (minutes <= 0) return "À l'instant";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

export default function SecretariatWaitingRoomFullscreenPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = useMemo(() => secretaryApi(accessToken ?? ""), [accessToken]);

  const waitingQuery = useQuery({
    queryKey: ["secretary-waiting-fullscreen"],
    queryFn: () => api.getWaitingRoom(),
    enabled: !!accessToken,
    refetchInterval: 15_000,
  });

  const waiting = waitingQuery.data ?? [];
  const lastUpdated = waitingQuery.dataUpdatedAt
    ? new Date(waitingQuery.dataUpdatedAt)
    : null;

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header plein écran */}
      <header className="bg-white border-b border-[#E8ECF4] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEEDFB] flex items-center justify-center">
            <Armchair size={20} className="text-[#5B4EC4]" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#1A1A2E] leading-tight">
              Salle d&apos;attente
            </h1>
            <p className="text-[12px] text-[#6B7280]">
              {waiting.length === 0
                ? "Aucun patient n'attend actuellement"
                : `${waiting.length} ${
                    waiting.length === 1 ? "patient" : "patients"
                  } en attente`}
              {lastUpdated && (
                <span className="ml-2 text-[#9CA3AF]">
                  · MAJ {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => waitingQuery.refetch()}
            disabled={waitingQuery.isFetching}
            className="p-2 rounded-lg hover:bg-[#F5F3EF] text-[#6B7280] disabled:opacity-50"
            aria-label="Rafraîchir"
          >
            <RefreshCw
              size={16}
              className={waitingQuery.isFetching ? "animate-spin" : ""}
            />
          </button>
          <Link
            href="/secretariat"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A1A2E] text-white text-[12px] font-medium hover:bg-[#2A2A3E] transition"
          >
            <ArrowLeft size={14} />
            Vue compacte
          </Link>
        </div>
      </header>

      {/* Corps */}
      <main className="px-8 py-8">
        {waitingQuery.isLoading ? (
          <div className="flex items-center justify-center py-24 text-[14px] text-[#6B7280]">
            Chargement…
          </div>
        ) : waiting.length === 0 ? (
          <div className="max-w-xl mx-auto bg-white border border-[#E8ECF4] rounded-2xl px-8 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EEEDFB] flex items-center justify-center mx-auto mb-4">
              <Armchair size={28} className="text-[#5B4EC4]" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-1">
              Aucun patient en salle d&apos;attente
            </h2>
            <p className="text-[13px] text-[#6B7280]">
              Les patients apparaîtront ici dès leur arrivée au cabinet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {waiting.map((entry) => {
              const severity = severityOf(entry.waitingMinutes);
              const style = SEVERITY_STYLES[severity];
              const scheduled = new Date(entry.scheduledAt);

              return (
                <article
                  key={entry.appointmentId}
                  className="rounded-2xl p-5 transition-shadow hover:shadow-md"
                  style={{
                    background: style.cardBg,
                    border: `1px solid ${style.cardBorder}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-[18px] font-bold text-[#1A1A2E] leading-tight">
                      {entry.patientName || "Patient"}
                    </h3>
                    <span
                      className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        background: style.chipBg,
                        color: style.chipText,
                      }}
                    >
                      <Clock size={10} />
                      {style.label}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span
                      className="text-[32px] font-bold leading-none"
                      style={{ color: style.chipText }}
                    >
                      {formatWait(entry.waitingMinutes)}
                    </span>
                    <span className="text-[11px] text-[#6B7280]">d&apos;attente</span>
                  </div>

                  <div className="space-y-1 text-[12px] text-[#374151] border-t border-[#E8ECF4] pt-3">
                    <p>
                      <span className="text-[#6B7280]">Soignant : </span>
                      <span className="font-medium">{entry.providerName || "—"}</span>
                    </p>
                    <p>
                      <span className="text-[#6B7280]">RDV prévu à </span>
                      <span className="font-medium">
                        {scheduled.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Action « Marquer parti » — disponible prochainement.\n\nEn attendant, l'agenda compact reste source de vérité."
                      )
                    }
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8ECF4] bg-white text-[12px] font-medium text-[#6B7280] hover:text-[#1A1A2E] hover:border-[#D1D5DB] transition"
                  >
                    <UserX size={13} />
                    Marquer parti
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
