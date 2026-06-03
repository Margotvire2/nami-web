"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { CockpitCareCaseChannelsTab } from "./_components/CockpitCareCaseChannelsTab";
import { CockpitDmInboxTab } from "./_components/CockpitDmInboxTab";
import { CockpitProConversationsTab } from "./_components/CockpitProConversationsTab";
import { useUnifiedInbox } from "@/hooks/useUnifiedInbox";

type TabKey = "carecase" | "dm" | "pro";
const TAB_KEYS: TabKey[] = ["carecase", "dm", "pro"];

function isValidTab(v: string | null): v is TabKey {
  return v !== null && (TAB_KEYS as string[]).includes(v);
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const activeTab: TabKey = isValidTab(rawTab) ? rawTab : "carecase";
  const proThreadId = searchParams.get("threadId");

  const { counts } = useUnifiedInbox();

  const updateUrl = useCallback(
    (next: { tab?: TabKey; threadId?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.tab !== undefined) params.set("tab", next.tab);
      if (next.threadId === null) params.delete("threadId");
      else if (next.threadId !== undefined) params.set("threadId", next.threadId);
      const qs = params.toString();
      router.replace(qs ? `/messages?${qs}` : "/messages", { scroll: false });
    },
    [router, searchParams],
  );

  const setTab = useCallback(
    (tab: TabKey) => {
      // Clear threadId quand on change de tab pour éviter de targeter un id
      // d'un autre silo.
      updateUrl({ tab, threadId: null });
    },
    [updateUrl],
  );

  const setProThreadId = useCallback(
    (id: string | null) => {
      updateUrl({ threadId: id });
    },
    [updateUrl],
  );

  const dmBadge = useMemo(() => counts.dm, [counts.dm]);
  const proBadge = useMemo(() => counts.pro, [counts.pro]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 pt-4 shrink-0">
        <h1 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare size={16} /> Messages
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Coordination clinique, messages directs patients, et réseau pro
        </p>

        <div
          role="tablist"
          aria-label="Catégories de messages"
          className="flex items-end gap-1 mt-3 -mb-px"
        >
          <TabButton
            id="tab-carecase"
            panelId="panel-carecase"
            active={activeTab === "carecase"}
            onClick={() => setTab("carecase")}
            label="📁 Dossiers patients"
          />
          <TabButton
            id="tab-dm"
            panelId="panel-dm"
            active={activeTab === "dm"}
            onClick={() => setTab("dm")}
            label="💬 Messages directs"
            badgeCount={dmBadge}
          />
          <TabButton
            id="tab-pro"
            panelId="panel-pro"
            active={activeTab === "pro"}
            onClick={() => setTab("pro")}
            label="🌐 Réseau pro"
            badgeCount={proBadge}
          />
        </div>
      </div>

      {/* [LEGAL] Triple barrière anti-urgence — Art. 50 AI Act + MDR */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 shrink-0 flex items-center gap-2">
        <span className="text-amber-600 text-xs font-semibold">⚠</span>
        <p className="text-xs text-amber-700">
          Messagerie réservée à la{" "}
          <strong>coordination non urgente</strong>. En cas d&apos;urgence
          vitale :{" "}
          <a
            href="tel:15"
            className="font-bold underline hover:text-amber-900"
          >
            15 (SAMU)
          </a>{" "}
          ou{" "}
          <a
            href="tel:112"
            className="font-bold underline hover:text-amber-900"
          >
            112
          </a>
          .
        </p>
      </div>

      {/* Panels */}
      <div
        role="tabpanel"
        id="panel-carecase"
        aria-labelledby="tab-carecase"
        hidden={activeTab !== "carecase"}
        className={activeTab === "carecase" ? "flex-1 flex overflow-hidden" : ""}
      >
        {activeTab === "carecase" && <CockpitCareCaseChannelsTab />}
      </div>
      <div
        role="tabpanel"
        id="panel-dm"
        aria-labelledby="tab-dm"
        hidden={activeTab !== "dm"}
        className={activeTab === "dm" ? "flex-1 flex overflow-hidden" : ""}
      >
        {activeTab === "dm" && <CockpitDmInboxTab />}
      </div>
      <div
        role="tabpanel"
        id="panel-pro"
        aria-labelledby="tab-pro"
        hidden={activeTab !== "pro"}
        className={activeTab === "pro" ? "flex-1 flex overflow-hidden" : ""}
      >
        {activeTab === "pro" && (
          <CockpitProConversationsTab
            activeConvId={proThreadId}
            onSelectConv={setProThreadId}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  id,
  panelId,
  active,
  onClick,
  label,
  badgeCount,
}: {
  id: string;
  panelId: string;
  active: boolean;
  onClick: () => void;
  label: string;
  badgeCount?: number;
}) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      onClick={onClick}
      className={`relative h-10 px-4 text-xs font-medium transition-colors ${
        active ? "text-[#5B4EC4]" : "text-muted-foreground hover:text-foreground"
      }`}
      style={{
        borderBottom: active ? "2px solid #5B4EC4" : "2px solid transparent",
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {badgeCount && badgeCount > 0 ? (
          <span
            data-testid={`tab-badge-${id}`}
            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: "#5B4EC4" }}
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </span>
    </button>
  );
}
