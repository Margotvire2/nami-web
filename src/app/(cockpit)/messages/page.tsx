"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { CockpitCareCaseChannelsTab } from "./_components/CockpitCareCaseChannelsTab";
import { CockpitDmInboxTab } from "./_components/CockpitDmInboxTab";
import { useCockpitDmInbox } from "@/hooks/useCockpitDmInbox";

type TabKey = "carecase" | "dm";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("carecase");

  // Compteur unread total pour badge tab DM
  const { data: dmData } = useCockpitDmInbox();
  const dmUnreadTotal =
    dmData?.threads.reduce((acc, t) => acc + (t.unreadCount > 0 ? 1 : 0), 0) ?? 0;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 pt-4 shrink-0">
        <h1 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare size={16} /> Messages
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Coordination clinique et messages directs avec vos patients
        </p>

        {/* Tabs */}
        <div role="tablist" aria-label="Catégories de messages" className="flex items-end gap-1 mt-3 -mb-px">
          <TabButton
            id="tab-carecase"
            panelId="panel-carecase"
            active={activeTab === "carecase"}
            onClick={() => setActiveTab("carecase")}
            label="📁 Dossiers patients"
          />
          <TabButton
            id="tab-dm"
            panelId="panel-dm"
            active={activeTab === "dm"}
            onClick={() => setActiveTab("dm")}
            label="💬 Messages privés"
            badgeCount={dmUnreadTotal}
          />
        </div>
      </div>

      {/* [LEGAL] Triple barrière anti-urgence — Art. 50 AI Act + MDR */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 shrink-0 flex items-center gap-2">
        <span className="text-amber-600 text-xs font-semibold">⚠</span>
        <p className="text-xs text-amber-700">
          Messagerie réservée à la <strong>coordination non urgente</strong>. En cas d&apos;urgence vitale :{" "}
          <a href="tel:15" className="font-bold underline hover:text-amber-900">15 (SAMU)</a>
          {" "}ou{" "}
          <a href="tel:112" className="font-bold underline hover:text-amber-900">112</a>.
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
