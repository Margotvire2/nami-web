"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Inbox,
  CalendarDays,
  Megaphone,
  MessageSquare,
  Library,
  CalendarRange,
  Newspaper,
  Moon,
  Ban,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useOrgDetail } from "@/hooks/useOrgDetail";
import { usePendingMembershipRequests } from "@/hooks/usePendingMembershipRequests";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import { ConsoleStatCard } from "./ConsoleStatCard";
import { QuickActionButton } from "./QuickActionButton";
import { MembershipRequestRow } from "./MembershipRequestRow";
import { ConsoleSidebar } from "./ConsoleSidebar";
import { DiscussionRow } from "./DiscussionRow";
import { PlaceholderSection } from "./PlaceholderSection";

const ORG_EMOJI: Record<string, string> = {
  HOSPITAL: "🏥",
  HOSPITAL_SERVICE: "🏥",
  CLINIC: "🏥",
  HEALTH_CENTER: "🩺",
  CPTS: "🤝",
  MSP: "🏘️",
  NETWORK: "🌐",
  FEDERATION: "🪢",
  ASSOCIATION: "🤝",
  PROFESSIONAL_GROUP: "👥",
  PRIVATE_PRACTICE: "💼",
};

interface AnimationDashboardProps {
  orgId: string;
}

export function AnimationDashboard({ orgId }: AnimationDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { org, isLoading: orgLoading } = useOrgDetail(orgId);
  const { requests, isLoading: requestsLoading } =
    usePendingMembershipRequests(orgId);
  const { members: suspendedMembers } = useOrgMembers(orgId, "SUSPENDED");

  const emoji = org?.type ? (ORG_EMOJI[org.type] ?? "🏢") : "🏢";
  const firstName = user?.firstName ?? "";

  const memberCount = org?.memberCount ?? 0;
  const pendingCount = requests.length;
  const suspendedCount = suspendedMembers.length;

  const topConversations = (org?.conversations ?? [])
    .slice()
    .sort((a, b) => {
      const aTs = a.messages[0]?.createdAt
        ? new Date(a.messages[0].createdAt).getTime()
        : 0;
      const bTs = b.messages[0]?.createdAt
        ? new Date(b.messages[0].createdAt).getTime()
        : 0;
      return bTs - aTs;
    })
    .slice(0, 3);

  function handleResolved() {
    queryClient.invalidateQueries({
      queryKey: ["org-membership-requests", orgId],
    });
    queryClient.invalidateQueries({
      queryKey: ["organizations", "mine"],
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-2xl">
          <span aria-hidden>{emoji}</span>
          <h1
            className="font-bold text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {org?.name ?? (orgLoading ? "Chargement…" : "Organisation")}
          </h1>
        </div>
        <p className="text-sm text-[#6B7280]">
          Bonjour {firstName || "vous"} — voici votre console d&apos;animation.
        </p>
      </header>

      <section aria-label="Indicateurs">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          <ConsoleStatCard
            icon={Users}
            label="Membres actifs"
            value={memberCount}
            hint={memberCount > 1 ? "soignants dans la structure" : "soignant"}
          />
          <ConsoleStatCard
            icon={Inbox}
            label="Adhésions à valider"
            value={pendingCount}
            hint={requestsLoading ? "Chargement…" : undefined}
          />
          <ConsoleStatCard
            icon={Moon}
            label="Membres en sommeil"
            value={0}
            comingSoon
          />
          <ConsoleStatCard
            icon={Ban}
            label="Membres suspendus"
            value={suspendedCount}
            hint={suspendedCount > 0 ? "à revoir" : undefined}
          />
          <ConsoleStatCard
            icon={CalendarDays}
            label="Événements à venir"
            value={0}
            comingSoon
          />
          <ConsoleStatCard
            icon={Megaphone}
            label="Actus publiées"
            value={0}
            comingSoon
          />
        </div>
      </section>

      <section aria-label="Actions rapides" className="space-y-2">
        <h2
          className="text-sm font-semibold text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Animer le réseau
        </h2>
        <div className="flex flex-wrap gap-2">
          <QuickActionButton label="Publier une actu" comingSoon />
          <QuickActionButton label="Planifier un événement" comingSoon />
          <QuickActionButton label="Inviter un soignant" comingSoon />
          <QuickActionButton label="Créer un groupe de travail" comingSoon />
        </div>
      </section>

      <section aria-label="Pipeline d'adhésion" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2
            className="text-sm font-semibold text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Pipeline d&apos;adhésion
          </h2>
          {pendingCount > 0 && (
            <span className="text-xs text-[#6B7280]">
              {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
            </span>
          )}
        </div>

        {requestsLoading ? (
          <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-6 text-sm text-[#6B7280] text-center">
            Chargement des demandes…
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-6 text-center">
            <Inbox size={20} className="mx-auto text-[#6B7280] mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">
              Aucune demande d&apos;adhésion en attente.
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Les nouvelles demandes apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((r) => (
              <MembershipRequestRow
                key={r.id}
                request={r}
                onResolved={handleResolved}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-label="Discussions actives"
          className="lg:col-span-2 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-sm font-semibold text-[#0F172A]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Discussions actives
            </h2>
            {topConversations.length > 0 && (
              <span className="text-xs text-[#6B7280]">
                {topConversations.length} récente
                {topConversations.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {topConversations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-6 text-center">
              <MessageSquare
                size={20}
                className="mx-auto text-[#6B7280] mb-2"
              />
              <p className="text-sm text-[#6B7280]">
                Aucune discussion pour le moment.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E8ECF4] bg-white p-1.5">
              {topConversations.map((c) => (
                <DiscussionRow
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  messageCount={c._count.messages}
                  lastActivityAt={c.messages[0]?.createdAt}
                />
              ))}
            </div>
          )}
        </section>

        <section aria-label="Vie de la structure" className="space-y-3">
          <h2
            className="text-sm font-semibold text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Vie de la structure
          </h2>
          <PlaceholderSection
            icon={CalendarRange}
            title="Agenda événements"
            description="Les événements à venir de la structure apparaîtront ici."
          />
          <PlaceholderSection
            icon={Newspaper}
            title="Veille de coordination"
            description="Les ressources documentaires partagées arriveront en V2."
          />
          <PlaceholderSection
            icon={Library}
            title="Ressources"
            description="Bibliothèque documentaire de la structure (V2)."
          />
        </section>
      </div>

      <ConsoleSidebar orgId={orgId} active="dashboard" />
    </div>
  );
}
