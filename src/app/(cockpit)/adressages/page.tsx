"use client";

/**
 * /adressages — refonte UX complète Liquid Glass × Nami v1.0.
 *
 * Pattern :
 *   - Mesh animé en background
 *   - Tabs Entrants/Sortants (glass-medium)
 *   - Filtres + search (glass-medium)
 *   - Sections : Urgences cliniques / À traiter / En cours / Aboutis / Non aboutis
 *   - Cards glass-soft (EMERGENCY = renforcement visuel rouge)
 *   - Sheet détail glass-strong (clic sur une card)
 *   - Footer légal MDR
 *
 * Sacrés MDR : 12 statuts distincts, 3 priorités, refus → DeclineReasonModal,
 * consentement jamais pré-coché.
 */

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import {
  useOutgoingReferrals,
  useIncomingReferrals,
} from "@/hooks/useReferrals";
import { referralsApi, type Referral } from "@/lib/api";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import { AdressageCard } from "@/components/adressages/AdressageCard";
import { AdressageDetailSheet } from "@/components/adressages/AdressageDetailSheet";
import {
  AdressageTabBar,
  type AdressageTabKey,
} from "@/components/adressages/AdressageTabBar";
import { AdressageFilterBar } from "@/components/adressages/AdressageFilterBar";
import { EmergencySection } from "@/components/adressages/EmergencySection";
import { StatusSection } from "@/components/adressages/StatusSection";
import {
  STATUS_CATEGORY,
  TERMINAL_OUTCOME,
  PRIORITY_ORDER,
  type FilterValue,
} from "@/components/adressages/_constants";
import { matchesSearch } from "@/components/adressages/_utils";

export default function AdressagesPage() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const [tab, setTab] = useState<AdressageTabKey>("incoming");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: incoming, isLoading: loadIn } = useIncomingReferrals();
  const { data: outgoing, isLoading: loadOut } = useOutgoingReferrals();

  const isLoading = loadIn || loadOut;
  const list = (tab === "incoming" ? incoming : outgoing) ?? [];

  // Tri : priorité d'abord, puis date desc
  const sorted = useMemo(() => {
    return [...list].sort((a, b) => {
      const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (p !== 0) return p;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [list]);

  // Filtrage : chip + search
  const filtered = useMemo(() => {
    return sorted.filter((r) => {
      if (!matchesSearch(r, search)) return false;
      if (filter === "all") return true;
      const cat = STATUS_CATEGORY[r.status];
      if (filter === "todo") return cat === "pending";
      if (filter === "in_progress") return cat === "active";
      if (filter === "done") return cat === "terminal";
      return true;
    });
  }, [sorted, filter, search]);

  // Split par section
  const emergency = filtered.filter(
    (r) =>
      r.priority === "EMERGENCY" && STATUS_CATEGORY[r.status] !== "terminal",
  );
  const todo = filtered.filter(
    (r) =>
      r.priority !== "EMERGENCY" && STATUS_CATEGORY[r.status] === "pending",
  );
  const inProgress = filtered.filter(
    (r) =>
      r.priority !== "EMERGENCY" && STATUS_CATEGORY[r.status] === "active",
  );
  const aboutis = filtered.filter((r) => TERMINAL_OUTCOME[r.status] === "aboutis");
  const nonAboutis = filtered.filter(
    (r) => TERMINAL_OUTCOME[r.status] === "non_aboutis",
  );

  const selected = selectedId
    ? filtered.find((r) => r.id === selectedId) ?? null
    : null;

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const acceptMutation = useMutation({
    mutationFn: (id: string) =>
      referralsApi.respond(accessToken!, id, "ACCEPTED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Adressage accepté");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Impossible d'accepter");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (params: { id: string; reason: string }) =>
      referralsApi.respond(accessToken!, params.id, "DECLINED", params.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Adressage refusé — motif tracé dans l'audit log");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Impossible de refuser");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      referralsApi.updateStatus(accessToken!, id, "CANCELLED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Adressage annulé");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Impossible d'annuler");
    },
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen">
      <CockpitMeshBackground />

      <main className="relative max-w-[1100px] mx-auto px-6 lg:px-9 py-7">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">
            Adressages
          </h1>
          <p className="text-sm text-[#4A4A5A] mt-1">
            Orientations vers et depuis d'autres soignants
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <AdressageTabBar
            tab={tab}
            onTabChange={setTab}
            incomingCount={incoming?.length}
            outgoingCount={outgoing?.length}
          />
          <div className="flex-1 min-w-[280px]">
            <AdressageFilterBar
              filter={filter}
              onFilterChange={setFilter}
              searchValue={search}
              onSearchChange={setSearch}
            />
          </div>
        </div>

        {isLoading && filtered.length === 0 && (
          <div className="glass-soft rounded-2xl p-12 text-center">
            <p className="text-[#4A4A5A]">Chargement des adressages…</p>
          </div>
        )}

        {!isLoading && (
          <>
            <EmergencySection count={emergency.length}>
              {emergency.map((r) => (
                <AdressageCard
                  key={r.id}
                  referral={r}
                  onClick={(ref) => setSelectedId(ref.id)}
                />
              ))}
            </EmergencySection>

            <StatusSection title="À traiter" count={todo.length}>
              {todo.map((r) => (
                <AdressageCard
                  key={r.id}
                  referral={r}
                  onClick={(ref) => setSelectedId(ref.id)}
                />
              ))}
            </StatusSection>

            <StatusSection title="En cours" count={inProgress.length}>
              {inProgress.map((r) => (
                <AdressageCard
                  key={r.id}
                  referral={r}
                  onClick={(ref) => setSelectedId(ref.id)}
                />
              ))}
            </StatusSection>

            <StatusSection
              title="Aboutis"
              count={aboutis.length}
              defaultCollapsed
            >
              {aboutis.map((r) => (
                <AdressageCard
                  key={r.id}
                  referral={r}
                  onClick={(ref) => setSelectedId(ref.id)}
                />
              ))}
            </StatusSection>

            <StatusSection
              title="Non aboutis"
              count={nonAboutis.length}
              defaultCollapsed
            >
              {nonAboutis.map((r) => (
                <AdressageCard
                  key={r.id}
                  referral={r}
                  onClick={(ref) => setSelectedId(ref.id)}
                />
              ))}
            </StatusSection>

            {filtered.length === 0 && (
              <div className="glass-soft rounded-2xl p-12 text-center">
                <p className="text-[#4A4A5A] font-medium">
                  Aucun adressage à afficher
                </p>
                <p className="text-sm text-[#8A8A96] mt-1">
                  {search || filter !== "all"
                    ? "Essayez d'élargir vos filtres."
                    : tab === "incoming"
                      ? "Vous n'avez pas encore reçu d'adressage."
                      : "Vous n'avez pas encore envoyé d'adressage."}
                </p>
              </div>
            )}
          </>
        )}

        <footer className="mt-10 glass-soft rounded-xl px-5 py-3 text-center text-[11px] text-[#1A1A2E]/50">
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </footer>
      </main>

      <AdressageDetailSheet
        referral={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        isRecipient={tab === "incoming"}
        isOwner={tab === "outgoing"}
        onAccept={async (id) => {
          await acceptMutation.mutateAsync(id);
          setSelectedId(null);
        }}
        onDecline={async (id, reason) => {
          await declineMutation.mutateAsync({ id, reason });
          setSelectedId(null);
        }}
        onCancel={async (id) => {
          await cancelMutation.mutateAsync(id);
          setSelectedId(null);
        }}
        onProposeSlotSuccess={() => {
          qc.invalidateQueries({ queryKey: ["referrals"] });
          toast.success("Créneaux proposés au patient");
          setSelectedId(null);
        }}
      />
    </div>
  );
}
