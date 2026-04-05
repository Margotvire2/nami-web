"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import type { ChatMessage, Channel, DmContact } from "@/components/nami/messaging/types";
import {
  ChannelSidebar, MessageBubble, MessageComposer, DateSeparator,
  ChannelCard, MemberTag,
} from "@/components/nami/messaging";
import {
  MOCK_CHANNELS as INIT_CHANNELS, MOCK_GROUPS as INIT_GROUPS,
  MOCK_DMS as INIT_DMS, MOCK_MESSAGES,
  MOCK_CHANNEL_DETAIL, EXPLORE_CHANNELS,
} from "@/components/nami/messaging/mock-data";
import {
  Hash, Lock, Users, Bell, Pin, Search, X,
  ChevronLeft, Compass,
} from "lucide-react";

type View = "chat" | "explore" | "create";

export default function MessagesProPage() {
  const { user } = useAuthStore();
  const [activeId, setActiveId] = useState<string | null>("ch-1");
  const [view, setView] = useState<View>("chat");
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedPanelOpen, setPinnedPanelOpen] = useState(false);

  // ── Mutable state for channels/groups/DMs (unread tracking) ──
  const [channels, setChannels] = useState<Channel[]>(INIT_CHANNELS);
  const [groups, setGroups] = useState<Channel[]>(INIT_GROUPS);
  const [dms, setDms] = useState<DmContact[]>(INIT_DMS);

  // ── Messages state (per channel — simplified: one shared list for demo) ──
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Clear unread when selecting a channel ──
  function handleSelect(id: string) {
    setActiveId(id);
    setView("chat");
    setSearchOpen(false);
    setSearchQuery("");
    setPinnedPanelOpen(false);

    // Clear unread for this channel/group/dm
    setChannels((prev) => prev.map((c) => c.id === id ? { ...c, unreadCount: 0 } : c));
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, unreadCount: 0 } : g));
    setDms((prev) => prev.map((d) => d.id === id ? { ...d, unreadCount: 0 } : d));
  }

  // ── Send message ──
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

  // ── React to a message (toggle emoji) ──
  function handleReact(msgId: string, emoji: string) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId) return m;
      const reactions = [...(m.reactions ?? [])];
      const existing = reactions.findIndex((r) => r.emoji === emoji);
      if (existing >= 0) {
        reactions[existing] = { ...reactions[existing], count: reactions[existing].count + 1 };
      } else {
        reactions.push({ emoji, count: 1 });
      }
      return { ...m, reactions };
    }));
  }

  // ── Pin/unpin a message ──
  function handlePin(msgId: string) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId) return m;
      const newPinned = !m.isPinned;
      toast.success(newPinned ? "Message épinglé" : "Message désépinglé");
      return { ...m, isPinned: newPinned };
    }));
  }

  // ── Reply placeholder ──
  function handleReply(msgId: string) {
    const msg = messages.find((m) => m.id === msgId);
    if (msg) {
      toast.info(`Réponse à ${msg.sender.firstName} — fils de discussion bientôt disponibles`);
    }
  }

  // ── Derived data ──
  const activeChannel = [...channels, ...groups].find((c) => c.id === activeId);
  const activeDm = dms.find((d) => d.id === activeId);
  const activeName = activeChannel?.name ?? (activeDm ? `${activeDm.firstName} ${activeDm.lastName}` : "");
  const activeIcon = activeChannel?.type === "PRIVATE" ? <Lock size={16} /> : activeChannel ? <Hash size={16} /> : null;

  const pinnedMessages = messages.filter((m) => m.isPinned);

  const displayedMessages = searchQuery
    ? messages.filter((m) => m.body.toLowerCase().includes(searchQuery.toLowerCase()) || `${m.sender.firstName} ${m.sender.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Colonne A — Sidebar ── */}
      <ChannelSidebar
        channels={channels}
        groups={groups}
        dms={dms}
        activeId={activeId}
        onSelect={handleSelect}
        onExplore={() => setView("explore")}
        onCreateChannel={() => setView("create")}
        onCreateGroup={() => setView("create")}
        onNewDm={() => toast.info("Messages directs bientôt disponibles")}
      />

      {/* ── Colonne B — Zone principale ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card">
        {view === "chat" && activeId && (
          <>
            {/* Bannière légale — NON dismissable */}
            <div className="bg-[#FFFBEB] px-6 py-1.5 text-[11px] text-[#92400E] flex items-center gap-2 shrink-0" style={{ fontFamily: "var(--font-inter)" }}>
              <span>⚠️</span>
              <span>Canal de coordination non urgent entre professionnels. En cas d'urgence : composer le 15.</span>
            </div>

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
                <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${searchOpen ? "bg-secondary text-primary" : "text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B]"}`} title="Rechercher">
                  <Search size={16} />
                </button>
                <button onClick={() => setPinnedPanelOpen(!pinnedPanelOpen)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${pinnedPanelOpen ? "bg-secondary text-primary" : "text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B]"}`} title={`${pinnedMessages.length} épinglé${pinnedMessages.length > 1 ? "s" : ""}`}>
                  <Pin size={16} />
                </button>
                <button onClick={() => toast.info("Paramètres de notifications bientôt disponibles")} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B] transition-colors" title="Notifications">
                  <Bell size={16} />
                </button>
                <button onClick={() => { setPanelOpen(!panelOpen); setPinnedPanelOpen(false); }} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${panelOpen ? "bg-secondary text-primary" : "text-[#94A3B8] hover:bg-[#F0F2F8] hover:text-[#64748B]"}`} title="Membres">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher dans ce fil…"
                    className="w-full h-9 pl-9 pr-9 rounded-xl bg-[#F0F2F8] text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                    <X size={14} />
                  </button>
                </div>
                {searchQuery && (
                  <p className="text-xs text-[#94A3B8] mt-1.5">{displayedMessages.length} résultat{displayedMessages.length !== 1 ? "s" : ""} pour « {searchQuery} »</p>
                )}
              </div>
            )}

            {/* Pinned panel */}
            {pinnedPanelOpen && (
              <div className="px-6 pb-3">
                <div className="bg-[#F0F2F8] rounded-xl p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2 flex items-center gap-1"><Pin size={10} /> {pinnedMessages.length} message{pinnedMessages.length > 1 ? "s" : ""} épinglé{pinnedMessages.length > 1 ? "s" : ""}</p>
                  {pinnedMessages.length === 0 ? (
                    <p className="text-sm text-[#64748B]">Aucun message épinglé dans ce canal.</p>
                  ) : (
                    <div className="space-y-2">
                      {pinnedMessages.map((msg) => (
                        <div key={msg.id} className="bg-card rounded-lg p-3">
                          <p className="text-xs font-semibold text-[#1E293B]">{msg.sender.firstName} {msg.sender.lastName}</p>
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <DateSeparator date={new Date().toISOString()} />
              {displayedMessages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  showAvatar={i === 0 || displayedMessages[i - 1].sender.id !== msg.sender.id}
                  onReact={handleReact}
                  onPin={handlePin}
                  onReply={handleReply}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Composer */}
            <MessageComposer channelName={activeName} onSend={handleSend} />
          </>
        )}

        {view === "explore" && (
          <ExploreView onBack={() => setView("chat")} onJoin={(id) => { handleSelect(id); }} />
        )}

        {view === "create" && (
          <CreateChannelView
            onBack={() => setView("chat")}
            onCreate={(name, desc, vis) => {
              const newChannel: Channel = {
                id: `ch-${Date.now()}`,
                name,
                type: vis === "PRIVATE" ? "PRIVATE" : "PUBLIC",
                description: desc,
                memberCount: 1,
                unreadCount: 0,
              };
              if (vis === "PRIVATE") {
                setGroups((prev) => [newChannel, ...prev]);
              } else {
                setChannels((prev) => [newChannel, ...prev]);
              }
              toast.success(`Canal #${name} créé`);
              handleSelect(newChannel.id);
            }}
          />
        )}
      </div>

      {/* ── Colonne C — Panel contextuel ── */}
      {panelOpen && activeChannel && (
        <div className="w-[280px] shrink-0 bg-card overflow-y-auto">
          <div className="h-16 px-5 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-[#1E293B]">Détails</h3>
            <button onClick={() => setPanelOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors"><X size={14} /></button>
          </div>
          <div className="px-5 pb-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">Description</p>
              <p className="text-sm text-[#64748B] leading-relaxed">{activeChannel.description ?? "Pas de description"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">Informations</p>
              <div className="space-y-2 text-sm text-[#64748B]">
                <p className="flex items-center gap-1"><Users size={12} /> {activeChannel.memberCount} membres</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">Membres</p>
              <div className="space-y-1">
                {MOCK_CHANNEL_DETAIL.members.map((m) => (
                  <MemberTag key={m.id} firstName={m.firstName} lastName={m.lastName} specialty={m.specialty} isOnline={m.isOnline} />
                ))}
              </div>
            </div>
            {pinnedMessages.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2"><Pin size={10} className="inline mr-1" />Messages épinglés</p>
                {pinnedMessages.map((msg) => (
                  <div key={msg.id} className="bg-[#F0F2F8] rounded-xl p-3 mb-2">
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

/* ═══════════════════════════════════════════════════════════════════════════ */

function ExploreView({ onBack, onJoin }: { onBack: () => void; onJoin: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(EXPLORE_CHANNELS.filter((c) => c.joined).map((c) => c.id)));

  function handleJoin(id: string) {
    setJoinedIds((prev) => new Set(prev).add(id));
    toast.success("Canal rejoint");
    onJoin(id);
  }

  const filtered = EXPLORE_CHANNELS.filter((ch) =>
    !search || ch.name.toLowerCase().includes(search.toLowerCase()) || ch.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-16 px-6 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors"><ChevronLeft size={18} /></button>
        <h2 className="text-page-title flex items-center gap-2"><Compass size={20} className="text-primary" /> Explorer les canaux</h2>
      </div>
      <div className="px-6 pb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, spécialité, pathologie…" className="w-full h-10 pl-10 rounded-xl bg-[#F0F2F8] text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <p className="text-label mb-4">Canaux disponibles · {filtered.length}</p>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ch) => (
            <ChannelCard key={ch.id} channel={{ ...ch, joined: joinedIds.has(ch.id) }} onJoin={handleJoin} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

function CreateChannelView({ onBack, onCreate }: { onBack: () => void; onCreate: (name: string, description: string, visibility: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [tags, setTags] = useState("");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-16 px-6 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F0F2F8] transition-colors"><ChevronLeft size={18} /></button>
        <h2 className="text-page-title">Créer un canal</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-lg space-y-6">
          <div className="space-y-2">
            <label className="text-label">Nom du canal</label>
            <div className="flex items-center bg-[#F0F2F8] rounded-xl h-11">
              <span className="pl-4 text-[#94A3B8] text-sm font-medium">#</span>
              <input value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9àâéèêëïîôùûüÿçæœ-]/g, ""))} placeholder="nom-du-canal" className="flex-1 h-full bg-transparent pl-1 pr-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="À quoi sert ce canal ?" rows={3} className="w-full bg-[#F0F2F8] rounded-xl p-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-2">
            <label className="text-label">Visibilité</label>
            <div className="flex gap-3">
              <button onClick={() => setVisibility("PUBLIC")} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${visibility === "PUBLIC" ? "bg-primary text-primary-foreground" : "bg-[#F0F2F8] text-[#64748B] hover:bg-[#E8EBF0]"}`}>
                <Hash size={14} className="inline mr-1.5" /> Public
              </button>
              <button onClick={() => setVisibility("PRIVATE")} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${visibility === "PRIVATE" ? "bg-primary text-primary-foreground" : "bg-[#F0F2F8] text-[#64748B] hover:bg-[#E8EBF0]"}`}>
                <Lock size={14} className="inline mr-1.5" /> Privé
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-label">Tags (séparés par des virgules)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="endocrinologie, pédiatrie, TCA…" className="w-full h-11 bg-[#F0F2F8] rounded-xl px-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button onClick={() => { if (name.trim()) onCreate(name.trim(), description, visibility); }} disabled={!name.trim()} className={`w-full h-11 rounded-xl text-sm font-semibold transition-colors ${name.trim() ? "bg-primary text-primary-foreground hover:bg-[#3B55E0]" : "bg-[#E8EBF0] text-[#94A3B8] cursor-not-allowed"}`}>
            Créer le canal
          </button>
        </div>
      </div>
    </div>
  );
}
