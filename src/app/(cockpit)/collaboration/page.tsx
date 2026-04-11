"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { getProMessagesSocket, disconnectProMessagesSocket } from "@/lib/socket";
import { apiWithToken, type ProConversation, type ProMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  AlertTriangle,
  Network,
  MapPin,
  Building2,
  Home,
  GraduationCap,
  Users,
  MessageCircle,
  Hash,
  Lock,
} from "lucide-react";
import { EmptyState } from "@/components/nami/EmptyState";

// ─── Types d'espaces ────────────────────────────────────────────────────────

const SPACE_CONFIG: Record<string, { icon: typeof Network; color: string; bgColor: string }> = {
  CLINICAL_NETWORK: { icon: Network, color: "text-teal-600", bgColor: "bg-teal-50" },
  CPTS: { icon: MapPin, color: "text-blue-600", bgColor: "bg-blue-50" },
  HOSPITAL: { icon: Building2, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  PRACTICE: { icon: Home, color: "text-purple-600", bgColor: "bg-purple-50" },
  ALUMNI: { icon: GraduationCap, color: "text-amber-600", bgColor: "bg-amber-50" },
  COMMUNITY: { icon: Users, color: "text-pink-600", bgColor: "bg-pink-50" },
  GROUP: { icon: Lock, color: "text-muted-foreground", bgColor: "bg-muted/30" },
  CHANNEL: { icon: Hash, color: "text-muted-foreground", bgColor: "bg-muted/30" },
  DIRECT: { icon: MessageCircle, color: "text-muted-foreground", bgColor: "bg-muted/30" },
};

function getSpaceConfig(type: string) {
  return SPACE_CONFIG[type] ?? SPACE_CONFIG.GROUP;
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "maintenant";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  return `${days}j`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CollaborationPage() {
  const { accessToken, user } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations — pas de polling, mis à jour par socket
  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ["pro-conversations"],
    queryFn: () => api.proMessages.getConversations(),
    staleTime: 30_000,
  });

  // Fetch messages for active conversation — pas de polling, mis à jour par socket
  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ["pro-messages", activeConvId],
    queryFn: () => api.proMessages.getMessages(activeConvId!),
    enabled: !!activeConvId,
    staleTime: 30_000,
  });

  // Send message
  const sendMsg = useMutation({
    mutationFn: (content: string) => api.proMessages.sendMessage(activeConvId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-messages", activeConvId] });
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
    },
  });

  // Socket.io — connexion temps réel, remplace le polling 10s
  useEffect(() => {
    if (!accessToken) return;
    const socket = getProMessagesSocket(accessToken);

    const onNewMessage = () => {
      qc.invalidateQueries({ queryKey: ["pro-messages", activeConvId] });
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
    };
    const onConvUpdated = () => {
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
    };

    socket.on("new_message", onNewMessage);
    socket.on("conversation_updated", onConvUpdated);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("conversation_updated", onConvUpdated);
    };
  }, [accessToken, activeConvId, qc]);

  // Rejoindre/quitter la room de la conversation active
  useEffect(() => {
    if (!accessToken || !activeConvId) return;
    const socket = getProMessagesSocket(accessToken);
    socket.emit("join_conversation", activeConvId);
    return () => {
      socket.emit("leave_conversation", activeConvId);
    };
  }, [accessToken, activeConvId]);

  // Déconnexion socket au démontage de la page
  useEffect(() => {
    return () => { disconnectProMessagesSocket(); };
  }, []);

  // Mark as read on conversation open
  useEffect(() => {
    if (activeConvId) {
      api.proMessages.markAsRead(activeConvId).catch(() => {});
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
    }
  }, [activeConvId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // Auto-select first conversation
  useEffect(() => {
    if (!activeConvId && conversations?.length) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Derived data
  const convList = conversations ?? [];
  const spaces = convList.filter((c) => c.type !== "DIRECT");
  const directs = convList.filter((c) => c.type === "DIRECT");
  const activeConv = convList.find((c) => c.id === activeConvId);

  // Sidebar filter
  const filteredSpaces = spaces.filter((c) =>
    !sidebarSearch || getConvName(c, user?.id).toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const filteredDirects = directs.filter((c) =>
    !sidebarSearch || getConvName(c, user?.id).toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  function getConvName(conv: ProConversation, userId?: string): string {
    if (conv.name) return conv.name;
    const other = conv.members.find((m) => m.id !== userId);
    return other ? `${other.firstName} ${other.lastName}` : "Conversation";
  }

  // Group messages by date
  const messagesByDate = (messages ?? []).reduce<Record<string, ProMessage[]>>((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Sidebar gauche (280px) ── */}
      <div className="w-[280px] shrink-0 bg-card border-r flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="px-4 h-12 flex items-center justify-between shrink-0 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-primary" />
            <span className="text-sm font-semibold">Collaboration</span>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Sidebar search */}
        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loadingConvs ? (
            <div className="space-y-1 px-1">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : convList.length === 0 ? (
            <div className="px-3 py-6">
              <EmptyState
                icon={Users}
                title="Pas encore de réseau"
                description="Invitez des confrères pour collaborer sur vos dossiers patients."
                action={{ label: "Créer un espace", onClick: () => setCreateOpen(true) }}
                variant="subtle"
              />
            </div>
          ) : (
            <>
              {/* Espaces */}
              {filteredSpaces.length > 0 && (
                <SidebarSection title="Mes espaces" onAdd={() => setCreateOpen(true)}>
                  {filteredSpaces.map((c) => {
                    const cfg = getSpaceConfig(c.type);
                    const Icon = cfg.icon;
                    return (
                      <ConvItem
                        key={c.id}
                        label={getConvName(c, user?.id)}
                        icon={<Icon size={13} className={cfg.color} />}
                        unread={c.unreadCount}
                        active={activeConvId === c.id}
                        lastTime={c.lastMessage?.createdAt}
                        onClick={() => setActiveConvId(c.id)}
                      />
                    );
                  })}
                </SidebarSection>
              )}

              {/* Messages directs */}
              <SidebarSection title="Messages directs" onAdd={() => setCreateOpen(true)}>
                {filteredDirects.map((c) => {
                  const other = c.members.find((m) => m.id !== user?.id);
                  return (
                    <ConvItem
                      key={c.id}
                      label={other ? `${other.firstName} ${other.lastName}` : "DM"}
                      avatar={other ? initials(other.firstName, other.lastName) : "?"}
                      unread={c.unreadCount}
                      active={activeConvId === c.id}
                      lastTime={c.lastMessage?.createdAt}
                      onClick={() => setActiveConvId(c.id)}
                    />
                  );
                })}
                {filteredDirects.length === 0 && !sidebarSearch && (
                  <p className="text-[10px] text-muted-foreground px-3 py-2">Aucun message direct</p>
                )}
              </SidebarSection>
            </>
          )}
        </div>
      </div>

      {/* ── Zone conversation (droite) ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card">
        {activeConv ? (
          <>
            {/* Header espace */}
            <div className="h-12 px-5 flex items-center justify-between shrink-0 border-b">
              <div className="flex items-center gap-2">
                {(() => {
                  const cfg = getSpaceConfig(activeConv.type);
                  const Icon = cfg.icon;
                  return <Icon size={14} className={cfg.color} />;
                })()}
                <h2 className="text-sm font-semibold">{getConvName(activeConv, user?.id)}</h2>
                {activeConv.description && (
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    — {activeConv.description}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  · {activeConv.members.length} membre{activeConv.members.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Chargement…</div>
              ) : (messages ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageSquare size={20} className="text-muted-foreground/25 mb-2" />
                  <p className="text-xs text-muted-foreground">Soyez le premier à écrire dans cet espace</p>
                </div>
              ) : (
                Object.entries(messagesByDate).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground font-medium capitalize">{date}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    {msgs.map((msg, i) => {
                      const showAvatar = i === 0 || msgs[i - 1].senderId !== msg.senderId;
                      const time = new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                      const isSystem = msg.contentType === "SYSTEM";

                      if (isSystem) {
                        return (
                          <div key={msg.id} className="flex justify-center py-1">
                            <span className="text-[10px] text-muted-foreground italic">{msg.content}</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "py-1 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors group",
                            showAvatar ? "mt-3" : ""
                          )}
                        >
                          <div className="flex gap-3">
                            {showAvatar ? (
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                {initials(msg.sender.firstName, msg.sender.lastName)}
                              </div>
                            ) : (
                              <div className="w-8 shrink-0">
                                <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                  {time}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {showAvatar && (
                                <div className="flex items-baseline gap-2 mb-0.5">
                                  <span className="text-xs font-semibold">{msg.sender.firstName} {msg.sender.lastName}</span>
                                  <span className="text-[10px] text-muted-foreground">{time}</span>
                                </div>
                              )}
                              <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              {msg.reactions.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  {Object.entries(
                                    msg.reactions.reduce((acc, r) => {
                                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                      return acc;
                                    }, {} as Record<string, number>)
                                  ).map(([emoji, count]) => (
                                    <button
                                      key={emoji}
                                      onClick={() =>
                                        api.proMessages
                                          .toggleReaction(msg.id, emoji)
                                          .then(() => qc.invalidateQueries({ queryKey: ["pro-messages", activeConvId] }))
                                      }
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs hover:bg-primary/10 transition-colors"
                                    >
                                      <span>{emoji}</span>
                                      <span className="text-muted-foreground font-medium">{count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bannière légale + zone de saisie */}
            <div className="shrink-0 border-t">
              <div className="bg-amber-50/60 px-5 py-1.5 text-[10px] text-amber-800 flex items-center gap-2">
                <AlertTriangle size={10} className="shrink-0" />
                <span>Espace de coordination professionnelle — en cas d&apos;urgence patient : 15 ou 112.</span>
              </div>
              <div className="px-5 py-3">
                <MessageInput
                  onSend={(text) => sendMsg.mutate(text)}
                  placeholder={`Écrire dans ${getConvName(activeConv, user?.id)}…`}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={28} className="text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Sélectionnez une conversation</p>
              <p className="text-xs text-muted-foreground/60 mt-1">ou créez-en une nouvelle</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal créer un espace */}
      <CreateSpaceModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        api={api}
        qc={qc}
        onCreated={(id) => setActiveConvId(id)}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

function SidebarSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus size={11} />
          </button>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ConvItem({
  label,
  icon,
  avatar,
  unread,
  active,
  lastTime,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  avatar?: string;
  unread: number;
  active: boolean;
  lastTime?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : unread > 0
            ? "text-foreground font-medium hover:bg-muted/50"
            : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {avatar && !icon && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          {avatar}
        </div>
      )}
      <span className="truncate flex-1">{label}</span>
      {lastTime && !active && (
        <span className="text-[9px] text-muted-foreground/60 shrink-0">{timeAgo(lastTime)}</span>
      )}
      {unread > 0 && !active && (
        <span className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center shrink-0">
          {unread}
        </span>
      )}
    </button>
  );
}

function MessageInput({
  onSend,
  placeholder,
}: {
  onSend: (text: string) => void;
  placeholder: string;
}) {
  const [text, setText] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSend(text.trim());
        setText("");
      }
    }
  }

  return (
    <div className="bg-muted/30 rounded-xl p-3 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[100px]"
        style={{ fieldSizing: "content" } as React.CSSProperties}
      />
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1">
          <button
            disabled
            title="Pièces jointes — prochainement"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/40 cursor-not-allowed"
          >
            <Paperclip size={14} />
          </button>
        </div>
        <button
          onClick={() => {
            if (text.trim()) {
              onSend(text.trim());
              setText("");
            }
          }}
          disabled={!text.trim()}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
            text.trim()
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL — CRÉER UN ESPACE
// ═════════════════════════════════════════════════════════════════════════════

const SPACE_TYPES = [
  { value: "CLINICAL_NETWORK", label: "Réseau clinique" },
  { value: "CPTS", label: "CPTS" },
  { value: "HOSPITAL", label: "Hôpital / Service" },
  { value: "PRACTICE", label: "Cabinet" },
  { value: "ALUMNI", label: "Alumni / Formation" },
  { value: "COMMUNITY", label: "Communauté" },
] as const;

function CreateSpaceModal({
  open,
  onOpenChange,
  api,
  qc,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: ReturnType<typeof apiWithToken>;
  qc: ReturnType<typeof useQueryClient>;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("CLINICAL_NETWORK");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  function reset() {
    setName("");
    setType("CLINICAL_NETWORK");
    setDescription("");
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const conv = await api.proMessages.createGroup(name.trim(), [], description.trim() || undefined, type);
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
      onCreated(conv.id);
      onOpenChange(false);
      reset();
      toast.success(`Espace "${name.trim()}" créé`);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Créer un espace
          </DialogTitle>
          <DialogDescription>
            Créez un espace de coordination pour échanger avec vos pairs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Type d&apos;espace</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {SPACE_TYPES.map((t) => {
                const cfg = getSpaceConfig(t.value);
                const Icon = cfg.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      type === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Nom de l&apos;espace</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Réseau TCA Francilien"
              className="h-9 text-xs mt-1"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Description (optionnel)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description courte de l'espace"
              className="h-9 text-xs mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="text-xs gap-1.5"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
          >
            <Plus size={12} />
            Créer l&apos;espace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
