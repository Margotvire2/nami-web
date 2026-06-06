"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { secretaryApi } from "@/lib/api";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isToday,
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Armchair,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DayAgendaView } from "./_components/DayAgendaView";
import { WeekAgendaView } from "./_components/WeekAgendaView";

type AgendaView = "day" | "week";

const VIEW_STORAGE_KEY = "secretariat.agenda.view";

function readPersistedView(): AgendaView | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return v === "day" || v === "week" ? v : null;
  } catch {
    return null;
  }
}

function persistView(view: AgendaView) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    /* ignore */
  }
}

export default function SecretariatPage() {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const [date, setDate] = useState(new Date());

  // Initial view: URL > localStorage > "day"
  const initialView: AgendaView = useMemo(() => {
    const urlView = searchParams.get("view");
    if (urlView === "day" || urlView === "week") return urlView;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return readPersistedView() ?? "day";
    // We only want this on first render; subsequent changes go through setView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [view, setViewState] = useState<AgendaView>(initialView);

  // Sync URL on first render if missing
  useEffect(() => {
    const urlView = searchParams.get("view");
    if (urlView !== "day" && urlView !== "week") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", view);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setView = useCallback(
    (next: AgendaView) => {
      setViewState(next);
      persistView(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const api = useMemo(() => secretaryApi(accessToken ?? ""), [accessToken]);

  const waitingQuery = useQuery({
    queryKey: ["secretary-waiting"],
    queryFn: () => api.getWaitingRoom(),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });
  const waiting = waitingQuery.data ?? [];

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["secretary-agendas"] });
    qc.invalidateQueries({ queryKey: ["secretary-waiting"] });
  }, [qc]);

  // Week starts on Monday (FR convention)
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date]);
  const weekEnd = useMemo(() => endOfWeek(date, { weekStartsOn: 1 }), [date]);
  const isCurrentWeek = isWithinInterval(new Date(), { start: weekStart, end: weekEnd });

  const handlePrev = () => {
    setDate((d) => (view === "day" ? subDays(d, 1) : subDays(d, 7)));
  };
  const handleNext = () => {
    setDate((d) => (view === "day" ? addDays(d, 1) : addDays(d, 7)));
  };
  const handleTodayOrThisWeek = () => setDate(new Date());

  const headerLabel =
    view === "day"
      ? format(date, "EEEE d MMMM yyyy", { locale: fr })
      : `${format(weekStart, "d MMM", { locale: fr })} – ${format(weekEnd, "d MMM yyyy", { locale: fr })}`;

  const showTodayButton = view === "day" ? !isToday(date) : !isCurrentWeek;
  const todayButtonLabel = view === "day" ? "Aujourd'hui" : "Cette semaine";

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E8ECF4] px-6 py-3 flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#374151]"
            aria-label={view === "day" ? "Jour précédent" : "Semaine précédente"}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#1A1A2E] capitalize truncate">
              {headerLabel}
            </p>
            {view === "day" && isToday(date) && (
              <span className="text-[9px] font-medium text-[#5B4EC4] bg-[#EEEDFB] px-1.5 py-0.5 rounded">
                Aujourd'hui
              </span>
            )}
            {view === "week" && isCurrentWeek && (
              <span className="text-[9px] font-medium text-[#5B4EC4] bg-[#EEEDFB] px-1.5 py-0.5 rounded">
                Cette semaine
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#374151]"
            aria-label={view === "day" ? "Jour suivant" : "Semaine suivante"}
          >
            <ChevronRight size={16} />
          </button>
          {showTodayButton && (
            <button
              onClick={handleTodayOrThisWeek}
              className="text-[11px] text-[#5B4EC4] hover:underline ml-1"
            >
              {todayButtonLabel}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Toggle Jour / Semaine */}
          <div
            role="tablist"
            aria-label="Vue agenda"
            className="inline-flex rounded-lg border border-[#E8ECF4] bg-[#F5F3EF] p-0.5"
          >
            <button
              role="tab"
              aria-selected={view === "day"}
              onClick={() => setView("day")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                view === "day"
                  ? "bg-white text-[#1A1A2E] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1A1A2E]",
              )}
            >
              <CalendarDays size={12} />
              Jour
            </button>
            <button
              role="tab"
              aria-selected={view === "week"}
              onClick={() => setView("week")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                view === "week"
                  ? "bg-white text-[#1A1A2E] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1A1A2E]",
              )}
            >
              <CalendarRange size={12} />
              Semaine
            </button>
          </div>

          {/* Salle d'attente badge (info partagée, pas un compteur DOM) */}
          {waiting.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <Armchair size={13} className="text-blue-600" />
              <span className="text-[11px] font-medium text-blue-700">
                {waiting.length} en salle d'attente
              </span>
            </div>
          )}
          <button
            onClick={refresh}
            disabled={waitingQuery.isFetching}
            className="p-1.5 rounded-lg hover:bg-[#F5F3EF] text-[#6B7280] disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw size={14} className={waitingQuery.isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Corps : Jour ou Semaine */}
      {view === "day" ? (
        <DayAgendaView
          date={date}
          api={api}
          accessToken={accessToken}
          userId={user?.id ?? null}
          onRefresh={refresh}
        />
      ) : (
        <WeekAgendaView
          weekStart={weekStart}
          api={api}
          accessToken={accessToken}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
