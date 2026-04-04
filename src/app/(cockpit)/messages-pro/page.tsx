"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import type { ChatMessage } from "@/components/nami/messaging/types";
import {
  ChannelSidebar, MessageBubble, MessageComposer, DateSeparator,
  ChannelCard, MemberTag, UnreadBadge,
} from "@/components/nami/messaging";
import {
  MOCK_CHANNELS, MOCK_GROUPS, MOCK_DMS, MOCK_MESSAGES,
  MOCK_CHANNEL_DETAIL, EXPLORE_CHANNELS,
} from "@/components/nami/messaging/mock-data";
import {
  Hash, Lock, Users, Bell, Pin, Search, X,
  ChevronLeft, Plus, Compass,
} from "lucide-react";

type View = "chat" | "explore" | "create";

export default function MessagesProPage() {
  const { user } = useAuthStore();
  const [activeId, setActiveId] = useState<string | null>("ch-1");
  const [view, setView] = useState<View>("chat");
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend(text: string) {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      body: text,
      createdAt: new Date().toISOString(),
      sender: {
        id: user?.id ?? "me",
        firstName: user?.firstName ?? "Vous",
        lastName: user?.lastName ?? "",
        specialty: (user as any)?.providerProfile?.specialties?.[0] ?? "Soignant",
        establishment: "Nami",
      },
      replyCount: 0,
      isPinned: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  }

  const activeChannel = [...MOCK_CHANNELS, ...MOCK_GROUPS].find((c) => c.id === activeId);
  const activeDm = MOCK_DMS.find((d) => d.id === activeId);
  const activeName = activeChannel?.name ?? (activeDm ? `${activeDm.firstName} ${activeDm.lastName}` : "");
  const activeIcon = activeChannel?.type === "PRIVATE" ? <Lock size={16} /> : activeChannel ? <Hash size={16} /> : null;

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Colonne A — Sidebar messagerie ── */}
      <ChannelSidebar
        channels={MOCK_CHANNELS}
        groups={MOCK_GROUPS}
        dms={MOCK_DMS}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setView("chat"); }}
        onExplore={() => setView("explore")}
        onCreateChannel={() => setView("create")}
        onCreateGroup={() => setView("create")}
        onNewDm={() => {}}
      />

      {/* ── Colonne B — Zone principale ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card">
        {view === "chat" && activeId && (
          <>
            {/* Topbar */}
            <div className="h-16 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-primary">{activeIcon}</span>
                <h2 className="text-base font-semibold text-[#1E293B] truncate">{activeName}</h2>
                {activeChannel?.description && (
                  <span className="text-xs text-[#94A3B8] truncate hidden lg:block ml-2">— {activeChannel.description}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B] transition-colors"
                  title="Rechercher"
                >
                  <Search size={16} />
                </button>
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B] transition-colors" title="Épinglés">
                  <Pin size={16} />
                </button>
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B] transition-colors" title="Notifications">
                  <Bell size={16} />
                </button>
                <button
                  onClick={() => setPanelOpen(!panelOpen)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    panelOpen ? "bg-secondary text-primary" : "text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B]"
                  }`}
                  title="Membres"
                >
                  <Users size={16} />
                </button>
              </div>
            </div>

            {/* Search bar */}
            {searchOpen && (
              <div className="px-6 pb-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    autoFocus
                    placeholder="Rechercher dans ce fil…"
                    className="w-full h-9 pl-9 pr-9 rounded-xl bg-[#F0F2F8] text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
              <DateSeparator date={new Date().toISOString()} />
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  showAvatar={i === 0 || messages[i - 1].sender.id !== msg.sender.id}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Composer */}
            <MessageComposer
              channelName={activeName}
              onSend={handleSend}
            />
          </>
        )}

        {view === "explore" && (
          <ExploreView onBack={() => setView("chat")} onJoin={(id) => { setActiveId(id); setView("chat"); }} />
        )}

        {view === "create" && (
          <CreateChannelView onBack={() => setView("chat")} onCreate={(name) => { setView("chat"); }} />
        )}
      </div>

      {/* ── Colonne C — Panel contextuel ── */}
      {panelOpen && activeChannel && (
        <div className="w-[280px] shrink-0 bg-card overflow-y-auto">
          <div className="h-16 px-5 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-[#1E293B]">Détails</h3>
            <button onClick={() => setPanelOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="px-5 pb-6 space-y-6">
            {/* Description */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">Description</p>
              <p className="text-sm text-[#64748B] leading-relaxed">{MOCK_CHANNEL_DETAIL.description}</p>
            </div>

            {/* Meta */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">Informations</p>
              <div className="space-y-2 text-sm text-[#64748B]">
                <p>Créé par {MOCK_CHANNEL_DETAIL.createdBy}</p>
                <p>{new Date(MOCK_CHANNEL_DETAIL.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="flex items-center gap-1"><Users size={12} /> {MOCK_CHANNEL_DETAIL.memberCount} membres</p>
              </div>
            </div>

            {/* Members */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">Membres</p>
              <div className="space-y-1">
                {MOCK_CHANNEL_DETAIL.members.map((m) => (
                  <MemberTag
                    key={m.id}
                    firstName={m.firstName}
                    lastName={m.lastName}
                    specialty={m.specialty}
                    isOnline={m.isOnline}
                  />
                ))}
              </div>
            </div>

            {/* Pinned */}
            {MOCK_CHANNEL_DETAIL.pinnedMessages.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">
                  <Pin size={10} className="inline mr-1" />
                  Messages épinglés
                </p>
                {MOCK_CHANNEL_DETAIL.pinnedMessages.map((msg) => (
                  <div key={msg.id} className="bg-[#F0F2F8] rounded-xl p-3">
                    <p className="text-xs font-semibold text-[#1E293B]">{msg.sender.firstName} {msg.sender.lastName}</p>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-3">{msg.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPLORE VIEW — browse + join channels
   ═══════════════════════════════════════════════════════════════════════════ */

function ExploreView({ onBack, onJoin }: { onBack: () => void; onJoin: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = EXPLORE_CHANNELS.filter((ch) =>
    !search || ch.name.toLowerCase().includes(search.toLowerCase()) || ch.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-page-title flex items-center gap-2"><Compass size={20} className="text-primary" /> Explorer les canaux</h2>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, spécialité, pathologie…"
            className="w-full h-10 pl-10 rounded-xl bg-[#F0F2F8] text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <p className="text-label mb-4">Canaux disponibles · {filtered.length}</p>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onJoin={onJoin} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CREATE CHANNEL VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function CreateChannelView({ onBack, onCreate }: { onBack: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [tags, setTags] = useState("");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-16 px-6 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-page-title">Créer un canal</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-lg space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-label">Nom du canal</label>
            <div className="flex items-center bg-[#F0F2F8] rounded-xl h-11">
              <span className="pl-4 text-[#94A3B8] text-sm font-medium">#</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9àâéèêëïîôùûüÿçæœ-]/g, ""))}
                placeholder="nom-du-canal"
                className="flex-1 h-full bg-transparent pl-1 pr-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="À quoi sert ce canal ?"
              rows={3}
              className="w-full bg-[#F0F2F8] rounded-xl p-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-label">Visibilité</label>
            <div className="flex gap-3">
              <button
                onClick={() => setVisibility("PUBLIC")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  visibility === "PUBLIC" ? "bg-primary text-primary-foreground" : "bg-[#F0F2F8] text-[#64748B] hover:bg-[#E8EBF0]"
                }`}
              >
                <Hash size={14} className="inline mr-1.5" /> Public
              </button>
              <button
                onClick={() => setVisibility("PRIVATE")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  visibility === "PRIVATE" ? "bg-primary text-primary-foreground" : "bg-[#F0F2F8] text-[#64748B] hover:bg-[#E8EBF0]"
                }`}
              >
                <Lock size={14} className="inline mr-1.5" /> Privé
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-label">Tags (séparés par des virgules)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="endocrinologie, pédiatrie, TCA…"
              className="w-full h-11 bg-[#F0F2F8] rounded-xl px-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => { if (name.trim()) onCreate(name.trim()); }}
            disabled={!name.trim()}
            className={`w-full h-11 rounded-xl text-sm font-semibold transition-colors ${
              name.trim() ? "bg-primary text-primary-foreground hover:bg-[#3B55E0]" : "bg-[#E8EBF0] text-[#94A3B8] cursor-not-allowed"
            }`}
          >
            Créer le canal
          </button>
        </div>
      </div>
    </div>
  );
}
