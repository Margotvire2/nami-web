"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/nami/EmptyState";
import { MessageCircle, MessageSquare } from "lucide-react";
import { useCockpitDmInbox } from "@/hooks/useCockpitDmInbox";
import { CockpitDmInboxThread } from "@/lib/api";
import { CockpitDmConversationView } from "./CockpitDmConversationView";
import { avatarBg, initials } from "./avatarUtils";

export function CockpitDmInboxTab() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { data, isLoading } = useCockpitDmInbox();

  const threads = data?.threads ?? [];
  const selectedThread = threads.find((t) => t.patientPersonId === selectedPatientId) ?? null;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`${selectedPatientId ? "w-80" : "w-96"} shrink-0 border-r bg-white overflow-y-auto transition-all`}>
        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : threads.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Aucun message privé"
            description="Les messages directs envoyés par vos patients apparaîtront ici."
            variant="subtle"
          />
        ) : (
          <div className="divide-y divide-[#F1F5F9] nami-card-stagger">
            {threads.map((t) => (
              <DmThreadRow
                key={t.patientPersonId}
                thread={t}
                isSelected={t.patientPersonId === selectedPatientId}
                onSelect={() => setSelectedPatientId(t.patientPersonId)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedThread ? (
          <CockpitDmConversationView
            patientPersonId={selectedThread.patientPersonId}
            patient={selectedThread.patient}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <MessageSquare size={32} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">Sélectionnez un patient</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">Les conversations directes 1-à-1 avec vos patients s&apos;affichent ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DmThreadRow({
  thread,
  isSelected,
  onSelect,
}: {
  thread: CockpitDmInboxThread;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { patient, lastMessage, unreadCount } = thread;
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 transition-all duration-150 ${
        isSelected
          ? "bg-[#EEEDFB] border-l-[3px] border-[#5B4EC4] pl-[13px]"
          : "border-l-[3px] border-transparent hover:bg-[#F8FAFC]"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
          style={{ background: avatarBg(thread.patientPersonId), color: "#1A1A2E" }}
        >
          {initials(patient.firstName, patient.lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium truncate">
              {patient.firstName} {patient.lastName}
            </p>
            {lastMessage && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {timeAgo(lastMessage.createdAt)}
              </span>
            )}
          </div>
          {lastMessage ? (
            <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
              {lastMessage.body.slice(0, 80)}{lastMessage.body.length > 80 ? "…" : ""}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground/50 mt-0.5 italic">Pas encore de message</p>
          )}
        </div>
        {unreadCount > 0 && (
          <span
            className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: "#5B4EC4" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  return `${days}j`;
}
