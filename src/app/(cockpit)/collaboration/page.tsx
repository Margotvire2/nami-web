"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, ProConversation, ProMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Hash, Lock, Users, MessageSquare, Plus, Search, X, Send,
  ChevronRight, Smile, Paperclip, AtSign, Pin, Bell,
  UserPlus, AlertTriangle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function CollaborationPage() {
  const { accessToken, user } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [createDmOpen, setCreateDmOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch conversations ──
  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ["pro-conversations"],
    queryFn: () => api.proMessages.getConversations(),
  });

  // ── Fetch messages for active conversation ──
  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ["pro-messages", activeConvId],
    queryFn: () => api.proMessages.getMessages(activeConvId!),
    enabled: !!activeConvId,
  });

  // ── Send message ──
  const sendMsg = useMutation({
    mutationFn: (content: string) => api.proMessages.sendMessage(activeConvId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-messages", activeConvId] });
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
    },
  });

  // ── Mark as read on conversation open ──
  useEffect(() => {
    if (activeConvId) {
      api.proMessages.markAsRead(activeConvId).catch(() => {});
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
    }
  }, [activeConvId]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // ── Create DM ──
  const createDm = useMutation({
    mutationFn: (targetUserId: string) => api.proMessages.createDirect(targetUserId),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
      setActiveConvId(conv.id);
      setCreateDmOpen(false);
      toast.success("Conversation créée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  // ── Create group ──
  const createGroup = useMutation({
    mutationFn: ({ name, memberIds, description }: { name: string; memberIds: string[]; description?: string }) =>
      api.proMessages.createGroup(name, memberIds, description),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
      setActiveConvId(conv.id);
      setCreateGroupOpen(false);
      toast.success(`Groupe "${conv.name}" créé`);
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  // ── Derived data ──
  const convList = conversations ?? [];
  const directs = convList.filter((c) => c.type === "DIRECT");
  const groups = convList.filter((c) => c.type === "GROUP");
  const channels = convList.filter((c) => c.type === "CHANNEL");
  const activeConv = convList.find((c) => c.id === activeConvId);

  const filteredMessages = searchQuery
    ? (messages ?? []).filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : (messages ?? []);

  function getConvName(conv: ProConversation): string {
    if (conv.name) return conv.name;
    const other = conv.members.find((m) => m.id !== user?.id);
    return other ? `${other.firstName} ${other.lastName}` : "Conversation";
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Sidebar conversations ── */}
      <div className="w-[260px] shrink-0 bg-white border-r border-[#E8ECF4] flex flex-col overflow-hidden">
        <div className="px-4 h-14 flex items-center gap-2 shrink-0 border-b border-[#E8ECF4]">
          <MessageSquare size={16} className="text-[#4F46E5]" />
          <span className="text-[14px] font-semibold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Réseau</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {/* Groupes */}
          {groups.length > 0 && (
            <SidebarSection title="Groupes" onAdd={() => setCreateGroupOpen(true)}>
              {groups.map((c) => (
                <ConvItem key={c.id} label={getConvName(c)} icon={<Lock size={14} />} unread={c.unreadCount} active={activeConvId === c.id} onClick={() => setActiveConvId(c.id)} />
              ))}
            </SidebarSection>
          )}

          {/* Canaux */}
          {channels.length > 0 && (
            <SidebarSection title="Canaux">
              {channels.map((c) => (
                <ConvItem key={c.id} label={getConvName(c)} icon={<Hash size={14} />} unread={c.unreadCount} active={activeConvId === c.id} onClick={() => setActiveConvId(c.id)} />
              ))}
            </SidebarSection>
          )}

          {/* DMs */}
          <SidebarSection title="Messages directs" onAdd={() => setCreateDmOpen(true)}>
            {directs.map((c) => {
              const other = c.members.find((m) => m.id !== user?.id);
              return (
                <ConvItem key={c.id} label={other ? `${other.firstName} ${other.lastName}` : "DM"} unread={c.unreadCount} active={activeConvId === c.id} onClick={() => setActiveConvId(c.id)} />
              );
            })}
            {directs.length === 0 && !loadingConvs && (
              <p className="text-[11px] text-[#94A3B8] px-3 py-2">Aucun message direct</p>
            )}
          </SidebarSection>

          {/* Bouton créer si vide */}
          {convList.length === 0 && !loadingConvs && (
            <div className="px-3 py-8 text-center">
              <MessageSquare size={24} className="text-[#CBD5E1] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8] mb-3">Aucune conversation</p>
              <button onClick={() => setCreateDmOpen(true)} className="w-full h-9 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors">
                <Plus size={14} /> Démarrer une conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Zone conversation ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {activeConv ? (
          <>
            {/* Bannière légale */}
            <div className="bg-[#FFFBEB] px-6 py-1.5 text-[11px] text-[#92400E] flex items-center gap-2 shrink-0" style={{ fontFamily: "var(--font-inter)" }}>
              <AlertTriangle size={11} />
              <span>Canal de coordination non urgent entre professionnels. En cas d'urgence : composer le 15.</span>
            </div>

            {/* Header */}
            <div className="h-14 px-6 flex items-center justify-between shrink-0 border-b border-[#E8ECF4]">
              <div className="flex items-center gap-2">
                {activeConv.type === "GROUP" ? <Lock size={14} className="text-[#94A3B8]" /> : activeConv.type === "CHANNEL" ? <Hash size={14} className="text-[#94A3B8]" /> : null}
                <h2 className="text-[14px] font-semibold text-[#0F172A]">{getConvName(activeConv)}</h2>
                <span className="text-[11px] text-[#94A3B8]">· {activeConv.members.length} membres</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", searchOpen ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#94A3B8] hover:bg-[#F1F5F9]")}>
                  <Search size={14} />
                </button>
              </div>
            </div>

            {/* Search */}
            {searchOpen && (
              <div className="px-6 py-2 border-b border-[#E8ECF4]">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher dans ce fil…" className="w-full h-8 pl-8 pr-8 rounded-lg bg-[#F0F2FA] text-sm focus:outline-none" />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8]"><X size={12} /></button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32 text-[#94A3B8] text-sm">Chargement…</div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageSquare size={20} className="text-[#CBD5E1] mb-2" />
                  <p className="text-sm text-[#94A3B8]">{searchQuery ? "Aucun résultat" : "Aucun message"}</p>
                  {!searchQuery && <p className="text-xs text-[#CBD5E1] mt-1">Écrivez le premier message de cette conversation</p>}
                </div>
              ) : (
                filteredMessages.map((msg, i) => {
                  const showAvatar = i === 0 || filteredMessages[i - 1].senderId !== msg.senderId;
                  const time = new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={msg.id} className={cn("py-1.5 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors", showAvatar ? "mt-3" : "")}>
                      <div className="flex gap-3">
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                            {msg.sender.firstName[0]}{msg.sender.lastName[0]}
                          </div>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          {showAvatar && (
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="text-[13px] font-semibold text-[#0F172A]">{msg.sender.firstName} {msg.sender.lastName}</span>
                              <span className="text-[10px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{time}</span>
                            </div>
                          )}
                          <p className="text-[13px] text-[#374151] leading-relaxed">{msg.content}</p>
                          {msg.reactions.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {Object.entries(msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([emoji, count]) => (
                                <button key={emoji} onClick={() => api.proMessages.toggleReaction(msg.id, emoji).then(() => qc.invalidateQueries({ queryKey: ["pro-messages", activeConvId] }))} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F5F9] text-xs hover:bg-[#EEF2FF] transition-colors">
                                  <span>{emoji}</span>
                                  <span className="text-[#64748B] font-medium">{count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="px-6 py-3 shrink-0 border-t border-[#E8ECF4]">
              <MessageInput onSend={(text) => sendMsg.mutate(text)} placeholder={`Écrire dans ${getConvName(activeConv)}…`} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={32} className="text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-sm text-[#94A3B8]">Sélectionnez une conversation</p>
              <p className="text-xs text-[#CBD5E1] mt-1">ou créez-en une nouvelle</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {createDmOpen && <CreateDmModal onClose={() => setCreateDmOpen(false)} onCreate={(targetId) => createDm.mutate(targetId)} />}
      {createGroupOpen && <CreateGroupModal onClose={() => setCreateGroupOpen(false)} onCreate={(name, memberIds, desc) => createGroup.mutate({ name, memberIds, description: desc })} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarSection({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{title}</p>
        {onAdd && <button onClick={onAdd} className="w-5 h-5 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"><Plus size={12} /></button>}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ConvItem({ label, icon, unread, active, onClick }: { label: string; icon?: React.ReactNode; unread: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-left transition-colors", active ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : unread > 0 ? "text-[#0F172A] font-medium hover:bg-[#F8FAFC]" : "text-[#64748B] hover:bg-[#F8FAFC]")}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate flex-1">{label}</span>
      {unread > 0 && !active && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#4F46E5] text-white text-[10px] font-semibold flex items-center justify-center">{unread}</span>}
    </button>
  );
}

function MessageInput({ onSend, placeholder }: { onSend: (text: string) => void; placeholder: string }) {
  const [text, setText] = useState("");
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) { onSend(text.trim()); setText(""); }
    }
  }
  return (
    <div className="bg-[#F0F2FA] rounded-xl p-3 focus-within:ring-2 focus-within:ring-[#4F46E5]/20">
      <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} rows={1} className="w-full bg-transparent text-sm text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:outline-none min-h-[24px] max-h-[100px]" style={{ fieldSizing: "content" } as React.CSSProperties} />
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1">
          <button onClick={() => toast.info("Pièces jointes bientôt disponibles")} className="w-7 h-7 rounded-md flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] hover:bg-white transition-colors"><Paperclip size={15} /></button>
        </div>
        <button onClick={() => { if (text.trim()) { onSend(text.trim()); setText(""); } }} disabled={!text.trim()} className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors", text.trim() ? "bg-[#4F46E5] text-white" : "text-[#94A3B8]")}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════

function CreateDmModal({ onClose, onCreate }: { onClose: () => void; onCreate: (targetId: string) => void }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [search, setSearch] = useState("");

  // Fetch providers to search
  const { data: providers } = useQuery({
    queryKey: ["providers-search"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/providers`).then((r) => r.json()) as Promise<{ id: string; person: { id: string; firstName: string; lastName: string }; specialties: string[] }[]>,
  });

  const filtered = (providers ?? []).filter((p) => !search || `${p.person.firstName} ${p.person.lastName}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E8ECF4] flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Nouveau message direct</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><X size={14} /></button>
        </div>
        <div className="p-5 space-y-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un praticien…" autoFocus className="w-full h-10 rounded-lg bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
          <div className="max-h-[250px] overflow-y-auto space-y-1">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => onCreate(p.person.id)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[#F8FAFC] transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                  {p.person.firstName[0]}{p.person.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{p.person.firstName} {p.person.lastName}</p>
                  <p className="text-xs text-[#64748B]">{p.specialties.join(", ")}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-[#94A3B8] text-center py-4">Aucun praticien trouvé</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateGroupModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, memberIds: string[], description?: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E8ECF4] flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Nouveau groupe</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><X size={14} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Nom du groupe</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Staff Nephro" autoFocus className="w-full h-10 mt-1.5 rounded-lg bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du groupe (optionnel)" className="w-full h-10 mt-1.5 rounded-lg bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[#E8ECF4] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[#64748B] hover:bg-[#F1F5F9]">Annuler</button>
          <button onClick={() => { if (name.trim()) onCreate(name.trim(), [], description.trim() || undefined); }} disabled={!name.trim()} className={cn("px-5 py-2 rounded-lg text-sm font-semibold transition-colors", name.trim() ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]" : "bg-[#E8ECF4] text-[#94A3B8]")}>
            Créer le groupe
          </button>
        </div>
      </div>
    </div>
  );
}
