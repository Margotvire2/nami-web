"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import {
  useMembershipRequests,
  type MembershipRequestFilter,
  type MembershipRequestRow,
} from "@/hooks/useMembershipRequests";
import { useReviewMembershipRequest } from "@/hooks/useReviewMembershipRequest";
import { MembershipRequestCard } from "./MembershipRequestCard";
import { MembershipRequestReviewModal } from "./MembershipRequestReviewModal";

const TABS: ReadonlyArray<{ key: MembershipRequestFilter; label: string }> = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "ACCEPTED", label: "Approuvées" },
  { key: "REJECTED", label: "Refusées" },
];

interface MembershipRequestsListProps {
  orgId: string;
}

export function MembershipRequestsList({ orgId }: MembershipRequestsListProps) {
  const [activeTab, setActiveTab] = useState<MembershipRequestFilter>("PENDING");
  const [selected, setSelected] = useState<MembershipRequestRow | null>(null);

  // On charge "ALL" pour calculer les compteurs de tabs sans 4 round-trips.
  const all = useMembershipRequests(orgId, "ALL");
  const reviewMutation = useReviewMembershipRequest(orgId);

  const counts = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let rejected = 0;
    for (const r of all.requests) {
      if (r.status === "PENDING") pending++;
      else if (r.status === "ACCEPTED") accepted++;
      else if (r.status === "REJECTED") rejected++;
    }
    return { pending, accepted, rejected, total: all.requests.length };
  }, [all.requests]);

  const filtered = useMemo(() => {
    if (activeTab === "ALL") return all.requests;
    return all.requests.filter((r) => r.status === activeTab);
  }, [all.requests, activeTab]);

  function countForTab(key: MembershipRequestFilter): number {
    switch (key) {
      case "ALL":
        return counts.total;
      case "PENDING":
        return counts.pending;
      case "ACCEPTED":
        return counts.accepted;
      case "REJECTED":
        return counts.rejected;
    }
  }

  function handleExamine(request: MembershipRequestRow) {
    setSelected(request);
    reviewMutation.reset();
  }

  function handleReview(input: { id: string; status: "ACCEPTED" | "REJECTED" }) {
    reviewMutation.mutate(input, {
      onSuccess: () => setSelected(null),
    });
  }

  const errorMessage = reviewMutation.isError
    ? reviewMutation.error instanceof Error
      ? reviewMutation.error.message
      : "Une erreur est survenue."
    : null;

  return (
    <section aria-label="Demandes d'adhésion" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2
          className="text-sm font-semibold text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Demandes d&apos;adhésion
        </h2>
        {counts.pending > 0 && (
          <span className="text-xs text-[#6B7280]">
            {counts.pending} en attente
          </span>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Filtrer les demandes d'adhésion"
        className="flex flex-wrap gap-1 border-b border-[#E8ECF4]"
      >
        {TABS.map((tab) => {
          const count = countForTab(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-[#5B4EC4] text-[#5B4EC4]"
                  : "border-transparent text-[#6B7280] hover:text-[#0F172A]"
              }`}
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {tab.label}
              <span
                className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isActive
                    ? "bg-[#EEEDFB] text-[#5B4EC4]"
                    : "bg-[#F0F2FA] text-[#6B7280]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {all.isLoading ? (
        <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-6 text-sm text-[#6B7280] text-center">
          Chargement des demandes…
        </div>
      ) : all.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-5 py-4 text-sm text-[#991B1B]"
        >
          Impossible de charger les demandes d&apos;adhésion.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-6 text-center">
          <Inbox size={20} className="mx-auto text-[#6B7280] mb-2" aria-hidden />
          <p className="text-sm font-medium text-[#0F172A]">
            {activeTab === "PENDING"
              ? "Aucune demande d'adhésion en attente."
              : activeTab === "ACCEPTED"
                ? "Aucune demande approuvée."
                : activeTab === "REJECTED"
                  ? "Aucune demande refusée."
                  : "Aucune demande d'adhésion."}
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            {activeTab === "PENDING"
              ? "Les nouvelles demandes apparaîtront ici."
              : "Cet onglet est vide pour le moment."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2" aria-label={`Liste — ${activeTab}`}>
          {filtered.map((r) => (
            <li key={r.id}>
              <MembershipRequestCard request={r} onExamine={handleExamine} />
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <MembershipRequestReviewModal
          key={selected.id}
          open
          request={selected}
          submitting={reviewMutation.isPending}
          errorMessage={errorMessage}
          onClose={() => {
            setSelected(null);
            reviewMutation.reset();
          }}
          onReview={handleReview}
        />
      )}
    </section>
  );
}
