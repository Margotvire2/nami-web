"use client";

import { useMemo, useState } from "react";
import { Megaphone, MailX, Inbox } from "lucide-react";
import { useMyReceivedBroadcasts } from "@/hooks/useMyReceivedBroadcasts";
import { useMarkBroadcastOpened } from "@/hooks/useMarkBroadcastOpened";
import { ReceivedBroadcastCard } from "@/components/broadcast/ReceivedBroadcastCard";

// /cockpit/communications — "Communications de mes structures"
// Lecture des broadcasts SENT reçus par le membre, multi-org agrégé chrono flat.
// Backend : GET /me/broadcasts (PR #124) → ordre sentAt DESC.
// Mark as read auto : IntersectionObserver sur chaque carte → PATCH /me/broadcasts/:id/open.

type ReadFilter = "ALL" | "UNREAD";

export default function CockpitCommunicationsPage() {
  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");
  const { broadcasts, isLoading, isError } = useMyReceivedBroadcasts();
  const markOpened = useMarkBroadcastOpened();

  const unreadCount = useMemo(
    () => broadcasts.filter((b) => b.openedAt === null).length,
    [broadcasts],
  );

  const visible = useMemo(() => {
    if (readFilter === "UNREAD") {
      return broadcasts.filter((b) => b.openedAt === null);
    }
    return broadcasts;
  }, [broadcasts, readFilter]);

  return (
    <div
      className="px-6 py-6 space-y-6 max-w-3xl mx-auto"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <header>
        <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
          <Megaphone size={20} className="text-[#5B4EC4]" />
          Communications de mes structures
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Annonces et informations envoyées par les structures dont vous êtes
          membre.
        </p>
      </header>

      {/* Pills filtre lu/non-lu */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Filtre lecture">
        <FilterPill
          active={readFilter === "ALL"}
          onClick={() => setReadFilter("ALL")}
          label={`Toutes (${broadcasts.length})`}
        />
        <FilterPill
          active={readFilter === "UNREAD"}
          onClick={() => setReadFilter("UNREAD")}
          label={`Non lues (${unreadCount})`}
        />
      </div>

      {/* États */}
      {isLoading && (
        <div className="text-sm text-[#6B7280] py-12 text-center">
          Chargement…
        </div>
      )}

      {isError && (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: "#FECACA",
            backgroundColor: "#FEF2F2",
            color: "#991B1B",
          }}
        >
          Impossible de charger vos communications. Réessayez plus tard.
        </div>
      )}

      {!isLoading && !isError && visible.length === 0 && (
        <EmptyState
          variant={readFilter === "UNREAD" ? "all-read" : "no-broadcasts"}
        />
      )}

      {/* Liste chrono flat multi-org */}
      {!isLoading && !isError && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((item) => (
            <ReceivedBroadcastCard
              key={item.recipientId}
              item={item}
              onSeen={(id) => markOpened.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        color: active ? "#fff" : "#374151",
        backgroundColor: active ? "#5B4EC4" : "#F1F5F9",
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ variant }: { variant: "no-broadcasts" | "all-read" }) {
  const Icon = variant === "all-read" ? MailX : Inbox;
  const title =
    variant === "all-read"
      ? "Tout est à jour"
      : "Aucune communication";
  const description =
    variant === "all-read"
      ? "Vous avez lu toutes les communications de vos structures."
      : "Quand une structure vous envoie une annonce, elle apparaîtra ici.";

  return (
    <div
      className="rounded-xl border bg-white py-16 px-6 text-center"
      style={{ borderColor: "#E8ECF4" }}
    >
      <Icon size={32} className="mx-auto mb-3 text-[#94A3B8]" />
      <h2 className="text-sm font-semibold text-[#0F172A] mb-1">{title}</h2>
      <p className="text-xs text-[#6B7280]">{description}</p>
    </div>
  );
}
