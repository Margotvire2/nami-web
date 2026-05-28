"use client";

import { useMemo, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import { NotificationSection } from "@/components/cockpit/notifications/NotificationSection";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";

type FilterMode = "all" | "todo" | "activity";

const TAB_LABELS: Record<FilterMode, string> = {
  all: "Toutes",
  todo: "À faire",
  activity: "Activité récente",
};

const TAB_ORDER: FilterMode[] = ["all", "todo", "activity"];

export default function CentreNotificationsPage() {
  const [filter, setFilter] = useState<FilterMode>("all");

  const { data, isLoading } = useNotificationFeed({
    limit: 50,
    section: filter,
  });

  const totalCount = useMemo(
    () => data.todo.length + data.activity.length,
    [data.todo.length, data.activity.length],
  );

  const showTodoSection = filter === "all" || filter === "todo";
  const showActivitySection = filter === "all" || filter === "activity";

  return (
    <>
      <CockpitMeshBackground />
      <main
        aria-label="Centre de notifications"
        className="relative max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 pb-24"
      >
        <header className="mb-6 md:mb-8">
          <h1
            className="text-2xl md:text-3xl font-bold text-[#1A1A2E] tracking-tight"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Notifications
          </h1>
          <p
            className="text-sm text-[#6B7280] mt-1"
            style={{ fontFamily: "Inter" }}
            aria-live="polite"
          >
            {data.counts.todo > 0
              ? `${data.counts.todo} élément${data.counts.todo > 1 ? "s" : ""} à traiter`
              : "Aucun élément à traiter"}
          </p>
        </header>

        <nav
          role="tablist"
          aria-label="Filtrer les notifications"
          className="flex gap-2 mb-6 border-b"
          style={{ borderColor: "rgba(26,26,46,0.06)" }}
        >
          {TAB_ORDER.map((mode) => {
            const isActive = filter === mode;
            const count =
              mode === "todo"
                ? data.counts.todo
                : mode === "activity"
                  ? data.counts.activity
                  : null;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setFilter(mode)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-[#5B4EC4] text-[#5B4EC4]"
                    : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
                }`}
                style={{ fontFamily: "Plus Jakarta Sans" }}
              >
                {TAB_LABELS[mode]}
                {count !== null && count > 0 && (
                  <span className="ml-1.5 text-xs" style={{ fontFamily: "Inter" }}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin text-[#5B4EC4]"
              aria-label="Chargement des notifications"
            />
          </div>
        )}

        {!isLoading && totalCount === 0 && (
          <div
            className="text-center py-16 px-6 bg-white/70 rounded-2xl border"
            style={{ borderColor: "rgba(26,26,46,0.06)" }}
            role="status"
            aria-label="Aucune notification"
          >
            <Bell
              size={32}
              className="mx-auto mb-3 text-[#6B7280] opacity-40"
              aria-hidden="true"
            />
            <p
              className="text-sm font-medium text-[#1A1A2E] mb-1"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              {filter === "todo"
                ? "Aucun élément à traiter"
                : filter === "activity"
                  ? "Aucune activité récente"
                  : "Aucune notification"}
            </p>
            <p
              className="text-xs text-[#6B7280]"
              style={{ fontFamily: "Inter" }}
            >
              {filter === "todo"
                ? "Tout est à jour pour le moment."
                : "Les notifications du cockpit apparaîtront ici."}
            </p>
          </div>
        )}

        {!isLoading && totalCount > 0 && (
          <div
            className="bg-white rounded-2xl border divide-y overflow-hidden"
            style={{
              borderColor: "rgba(26,26,46,0.06)",
              boxShadow: "0 20px 60px rgba(26,26,46,0.04)",
            }}
            role="list"
            aria-label="Liste des notifications"
          >
            {showTodoSection && (
              <NotificationSection
                title="À faire"
                items={data.todo}
                emptyMessage="Aucun élément à traiter pour le moment."
              />
            )}
            {showActivitySection && (
              <NotificationSection
                title="Activité récente"
                items={data.activity}
                emptyMessage="Aucune activité récente."
              />
            )}
          </div>
        )}

        {!isLoading && totalCount >= 50 && (
          <p
            className="text-xs text-[#6B7280] text-center mt-4"
            style={{ fontFamily: "Inter" }}
          >
            Affichage des 50 dernières notifications. L&apos;historique complet
            sera disponible prochainement.
          </p>
        )}
      </main>
    </>
  );
}
