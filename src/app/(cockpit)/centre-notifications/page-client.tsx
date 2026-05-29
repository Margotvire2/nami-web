"use client";

import { useMemo, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import type { NotificationFeedItem, NotificationFeedSource } from "@/lib/api";
import { FiltersBar, type FilterKey } from "./FiltersBar";
import { NotificationGroupedList } from "./NotificationGroupedList";

const SOURCE_FILTERS: Record<
  Exclude<FilterKey, "all" | "unread">,
  NotificationFeedSource[]
> = {
  rdv: ["appointment_request"],
  patients: ["referral", "coordination_anomaly"],
  equipe: ["team_invitation", "pro_message", "task"],
  rcp: [],
  consentements: [],
};

const EMPTY_TITLE: Record<FilterKey, string> = {
  all: "Aucune notification",
  unread: "Vous êtes à jour",
  rdv: "Aucune notification de rendez-vous",
  patients: "Aucune notification patient",
  equipe: "Aucune notification d'équipe",
  rcp: "Aucune notification RCP",
  consentements: "Aucune notification de consentement",
};

const EMPTY_HINT: Record<FilterKey, string> = {
  all: "Les notifications du cockpit apparaîtront ici.",
  unread: "Tout est traité pour le moment.",
  rdv: "Les demandes et confirmations de RDV apparaîtront ici.",
  patients: "Adressages et anomalies de coordination apparaîtront ici.",
  equipe: "Invitations, messages et tâches d'équipe apparaîtront ici.",
  rcp: "Le suivi RCP sera disponible prochainement.",
  consentements: "Le suivi des consentements sera disponible prochainement.",
};

export function CentreNotificationsClient() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data, isLoading } = useNotificationFeed({
    limit: 50,
    section: "all",
  });

  const todoIds = useMemo(
    () => new Set(data.todo.map((i) => i.id)),
    [data.todo],
  );

  const allItems = useMemo(() => {
    const seen = new Set<string>();
    const merged: NotificationFeedItem[] = [];
    for (const item of [...data.todo, ...data.activity]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
    merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return merged;
  }, [data.todo, data.activity]);

  const counts = useMemo<Record<FilterKey, number>>(() => {
    const bySource = (sources: NotificationFeedSource[]) =>
      sources.length === 0
        ? 0
        : allItems.filter((i) => sources.includes(i.source)).length;
    return {
      all: allItems.length,
      unread: data.todo.length,
      rdv: bySource(SOURCE_FILTERS.rdv),
      patients: bySource(SOURCE_FILTERS.patients),
      equipe: bySource(SOURCE_FILTERS.equipe),
      rcp: bySource(SOURCE_FILTERS.rcp),
      consentements: bySource(SOURCE_FILTERS.consentements),
    };
  }, [allItems, data.todo.length]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return allItems;
    if (filter === "unread") {
      return allItems.filter((i) => todoIds.has(i.id));
    }
    const sources = SOURCE_FILTERS[filter];
    if (sources.length === 0) return [];
    return allItems.filter((i) => sources.includes(i.source));
  }, [filter, allItems, todoIds]);

  const headerStatus =
    data.counts.todo > 0
      ? `${data.counts.todo} élément${data.counts.todo > 1 ? "s" : ""} à traiter`
      : "Aucun élément à traiter";

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
            {headerStatus}
          </p>
        </header>

        <FiltersBar selected={filter} onChange={setFilter} counts={counts} />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin text-[#5B4EC4]"
              aria-label="Chargement des notifications"
            />
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div
            className="text-center py-16 px-6 bg-white/70 rounded-2xl border"
            style={{ borderColor: "rgba(26,26,46,0.06)" }}
            role="status"
            aria-label={EMPTY_TITLE[filter]}
          >
            {filter === "unread" ? (
              <Check
                size={32}
                className="mx-auto mb-3 text-[#2BA89C]"
                aria-hidden="true"
              />
            ) : (
              <Bell
                size={32}
                className="mx-auto mb-3 text-[#6B7280] opacity-40"
                aria-hidden="true"
              />
            )}
            <p
              className="text-sm font-medium text-[#1A1A2E] mb-1"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              {EMPTY_TITLE[filter]}
            </p>
            <p
              className="text-xs text-[#6B7280]"
              style={{ fontFamily: "Inter" }}
            >
              {EMPTY_HINT[filter]}
            </p>
          </div>
        )}

        {!isLoading && filteredItems.length > 0 && (
          <NotificationGroupedList items={filteredItems} />
        )}

        {!isLoading && allItems.length >= 50 && (
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
