"use client";

import { useState, useCallback } from "react";
import {
  Hash, Lock, Plus, ChevronDown, ChevronRight,
  Search, Send, Smile, Paperclip, AtSign, Pin,
  MessageCircle, Bell, Users, X, Compass,
} from "lucide-react";
import { toast } from "sonner";
import type { Channel, DmContact, ChatMessage } from "./types";

const EMOJI_PICKER = ["👍", "❤️", "🙏", "🔥", "💡", "👆", "✅", "👀", "😂", "🎉"];

/* ═══════════════════════════════════════════════════════════════════════════
   UNREAD BADGE
   ═══════════════════════════════════════════════════════════════════════════ */

export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MEMBER TAG
   ═══════════════════════════════════════════════════════════════════════════ */

interface MemberTagProps {
  firstName: string;
  lastName: string;
  specialty: string;
  isOnline: boolean;
  onClick?: () => void;
}

export function MemberTag({ firstName, lastName, specialty, isOnline, onClick }: MemberTagProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl hover:bg-[#F0F2F8] transition-colors text-left">
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
          {firstName[0]}{lastName[0]}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? "bg-[#16A34A]" : "bg-[#94A3B8]"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#1E293B] truncate">{firstName} {lastName}</p>
        <p className="text-xs text-[#94A3B8] truncate">{specialty}</p>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHANNEL SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */

interface ChannelSidebarProps {
  channels: Channel[];
  groups: Channel[];
  dms: DmContact[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onExplore: () => void;
  onCreateChannel: () => void;
  onCreateGroup: () => void;
  onNewDm: () => void;
}

export function ChannelSidebar({
  channels, groups, dms, activeId,
  onSelect, onExplore, onCreateChannel, onCreateGroup, onNewDm,
}: ChannelSidebarProps) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  return (
    <div className="w-[240px] shrink-0 bg-card flex flex-col h-full overflow-hidden">
      <div className="px-4 h-16 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">N</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1E293B] leading-none">Nami</p>
          <p className="text-[10px] text-[#94A3B8] mt-0.5">Messagerie</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <SidebarSection title="Canaux" isOpen={channelsOpen} onToggle={() => setChannelsOpen(!channelsOpen)} onAdd={onCreateChannel}>
          {channels.map((ch) => (
            <SidebarItem key={ch.id} icon={<Hash size={16} />} label={ch.name} active={activeId === ch.id} unread={ch.unreadCount} onClick={() => onSelect(ch.id)} />
          ))}
          <button onClick={onExplore} className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#64748B] hover:text-primary transition-colors w-full rounded-xl">
            <Compass size={14} /> Explorer les canaux
          </button>
        </SidebarSection>

        <SidebarSection title="Groupes privés" isOpen={groupsOpen} onToggle={() => setGroupsOpen(!groupsOpen)} onAdd={onCreateGroup}>
          {groups.map((gr) => (
            <SidebarItem key={gr.id} icon={<Lock size={14} />} label={gr.name} active={activeId === gr.id} unread={gr.unreadCount} onClick={() => onSelect(gr.id)} />
          ))}
        </SidebarSection>

        <SidebarSection title="Messages directs" isOpen={dmsOpen} onToggle={() => setDmsOpen(!dmsOpen)} onAdd={onNewDm}>
          {dms.map((dm) => (
            <button key={dm.id} onClick={() => onSelect(dm.id)} className={`flex items-center gap-2.5 w-full px-3 py-1.5 rounded-xl transition-colors text-left ${activeId === dm.id ? "bg-secondary text-primary" : "text-[#64748B] hover:bg-[#F0F2F8]"}`}>
              <div className="relative shrink-0">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">{dm.firstName[0]}{dm.lastName[0]}</div>
                <div className={`absolute -bottom-px -right-px w-2 h-2 rounded-full border border-white ${dm.isOnline ? "bg-[#16A34A]" : "bg-[#94A3B8]"}`} />
              </div>
              <span className="text-sm truncate flex-1">{dm.firstName} {dm.lastName}</span>
              <UnreadBadge count={dm.unreadCount} />
            </button>
          ))}
        </SidebarSection>
      </div>

      <div className="px-3 py-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">AS</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#16A34A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1E293B] truncate">Amélie Suela</p>
            <p className="text-[10px] text-[#16A34A] font-medium">En ligne</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, isOpen, onToggle, onAdd, children }: {
  title: string; isOpen: boolean; onToggle: () => void; onAdd: () => void; children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-2 mb-1">
        <button onClick={onToggle} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] hover:text-[#64748B] transition-colors">
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />} {title}
        </button>
        <button onClick={onAdd} className="w-5 h-5 rounded flex items-center justify-center text-[#94A3B8] hover:text-primary hover:bg-secondary transition-colors">
          <Plus size={14} />
        </button>
      </div>
      {isOpen && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function SidebarItem({ icon, label, active, unread, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; unread: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-xl transition-colors text-left ${active ? "bg-secondary text-primary font-medium" : unread > 0 ? "text-[#1E293B] font-medium hover:bg-[#F0F2F8]" : "text-[#64748B] hover:bg-[#F0F2F8]"}`}>
      <span className="shrink-0">{icon}</span>
      <span className="text-sm truncate flex-1">{label}</span>
      <UnreadBadge count={active ? 0 : unread} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATE SEPARATOR
   ═══════════════════════════════════════════════════════════════════════════ */

export function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = d.toDateString() === new Date(Date.now() - 86400000).toDateString();
  const label = isToday ? "Aujourd'hui" : isYesterday ? "Hier" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-[#E2E8F0]" />
      <span className="text-xs uppercase tracking-wide font-medium text-[#94A3B8]">{label}</span>
      <div className="flex-1 h-px bg-[#E2E8F0]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   THREAD PREVIEW
   ═══════════════════════════════════════════════════════════════════════════ */

export function ThreadPreview({ replyCount, participants, onOpen }: {
  replyCount: number;
  participants: { firstName: string; lastName: string }[];
  onOpen?: () => void;
}) {
  if (replyCount <= 0) return null;
  return (
    <button onClick={() => onOpen ? onOpen() : toast.info("Fils de discussion bientôt disponibles")} className="flex items-center gap-2 mt-1.5 bg-secondary rounded-xl px-3 py-2 hover:bg-[#E0E5FF] transition-colors group">
      <div className="flex -space-x-1.5">
        {participants.slice(0, 3).map((p, i) => (
          <div key={i} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground ring-2 ring-white">{p.firstName[0]}{p.lastName[0]}</div>
        ))}
      </div>
      <span className="text-xs font-semibold text-primary">{replyCount} réponse{replyCount > 1 ? "s" : ""}</span>
      <span className="text-xs text-[#64748B] group-hover:text-[#1E293B] transition-colors">Voir le fil →</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE — fully interactive
   ═══════════════════════════════════════════════════════════════════════════ */

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  onReact: (msgId: string, emoji: string) => void;
  onPin: (msgId: string) => void;
  onReply: (msgId: string) => void;
}

export function MessageBubble({ message: m, showAvatar = true, onReact, onPin, onReply }: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const time = new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`relative px-6 py-1.5 transition-colors ${hovered ? "bg-[#F8F9FF]" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setEmojiOpen(false); }}
    >
      {/* Hover actions */}
      {hovered && (
        <div className="absolute -top-3 right-6 flex items-center bg-card rounded-lg overflow-hidden z-10" style={{ border: "1px solid #E2E8F0" }}>
          <button onClick={() => setEmojiOpen(!emojiOpen)} className="p-1.5 text-[#94A3B8] hover:text-primary hover:bg-secondary transition-colors" title="Réagir"><Smile size={14} /></button>
          <button onClick={() => onReply(m.id)} className="p-1.5 text-[#94A3B8] hover:text-primary hover:bg-secondary transition-colors" title="Répondre"><MessageCircle size={14} /></button>
          <button onClick={() => onPin(m.id)} className={`p-1.5 hover:bg-secondary transition-colors ${m.isPinned ? "text-[#CA8A04]" : "text-[#94A3B8] hover:text-primary"}`} title={m.isPinned ? "Désépingler" : "Épingler"}><Pin size={14} /></button>
        </div>
      )}

      {/* Emoji picker */}
      {emojiOpen && (
        <div className="absolute -top-11 right-6 flex items-center gap-0.5 bg-card rounded-xl px-2 py-1.5 z-20" style={{ border: "1px solid #E2E8F0" }}>
          {EMOJI_PICKER.map((emoji) => (
            <button key={emoji} onClick={() => { onReact(m.id, emoji); setEmojiOpen(false); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-sm">
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {showAvatar ? (
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
            {m.sender.firstName[0]}{m.sender.lastName[0]}
          </div>
        ) : (
          <div className="w-9 shrink-0 flex justify-center">
            <span className={`text-[10px] text-[#94A3B8] mt-1 ${hovered ? "visible" : "invisible"}`}>{time}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-sm font-semibold text-[#1E293B]">{m.sender.firstName} {m.sender.lastName}</span>
              <span className="text-xs text-[#94A3B8]">{m.sender.specialty}</span>
              <span className="text-xs text-[#94A3B8]">·</span>
              <span className="text-xs text-[#94A3B8]">{m.sender.establishment}</span>
              <span className="text-xs text-[#94A3B8]">{time}</span>
            </div>
          )}

          <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap">{m.body}</p>

          {/* Reactions — clickable to toggle */}
          {m.reactions && m.reactions.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {m.reactions.map((r, i) => (
                <button key={i} onClick={() => onReact(m.id, r.emoji)} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs hover:bg-[#E0E5FF] transition-colors">
                  <span>{r.emoji}</span>
                  <span className="text-[#64748B] font-medium">{r.count}</span>
                </button>
              ))}
              <button onClick={() => setEmojiOpen(true)} className="w-6 h-6 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-secondary transition-colors">
                <Plus size={12} />
              </button>
            </div>
          )}

          {m.replyCount > 0 && (
            <ThreadPreview replyCount={m.replyCount} participants={[m.sender, { firstName: "Marie", lastName: "Petit" }]} />
          )}

          {m.isPinned && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-[#CA8A04] font-medium">
              <Pin size={10} /> Épinglé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE COMPOSER
   ═══════════════════════════════════════════════════════════════════════════ */

interface MessageComposerProps {
  channelName: string;
  onSend: (text: string) => void;
}

export function MessageComposer({ channelName, onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) { onSend(text.trim()); setText(""); }
    }
  }

  function insertEmoji(emoji: string) {
    setText((prev) => prev + emoji);
    setEmojiOpen(false);
  }

  return (
    <div className="px-6 py-4 shrink-0 relative">
      {/* Emoji picker for composer */}
      {emojiOpen && (
        <div className="absolute bottom-20 left-6 flex items-center gap-0.5 bg-card rounded-xl px-2 py-1.5 z-20" style={{ border: "1px solid #E2E8F0" }}>
          {EMOJI_PICKER.map((emoji) => (
            <button key={emoji} onClick={() => insertEmoji(emoji)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-base">
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="bg-[#F0F2F8] rounded-2xl p-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Écrire dans #${channelName}…`}
          rows={1}
          className="w-full bg-transparent text-sm text-[#1E293B] placeholder:text-[#94A3B8] resize-none focus:outline-none min-h-[24px] max-h-[120px]"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setEmojiOpen(!emojiOpen)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${emojiOpen ? "text-primary bg-white" : "text-[#94A3B8] hover:text-[#64748B] hover:bg-white"}`}>
              <Smile size={18} />
            </button>
            <button onClick={() => toast.info("Pièces jointes bientôt disponibles")} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] hover:bg-white transition-colors">
              <Paperclip size={18} />
            </button>
            <button onClick={() => { setText((prev) => prev + "@"); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] hover:bg-white transition-colors">
              <AtSign size={18} />
            </button>
          </div>
          <button
            onClick={() => { if (text.trim()) { onSend(text.trim()); setText(""); } }}
            disabled={!text.trim()}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${text.trim() ? "bg-primary text-primary-foreground" : "bg-transparent text-[#94A3B8]"}`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-[#94A3B8] mt-1.5 text-center">Entrée pour envoyer · Shift+Entrée pour un retour à la ligne</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHANNEL CARD
   ═══════════════════════════════════════════════════════════════════════════ */

interface ChannelCardProps {
  channel: Channel & { joined?: boolean };
  onJoin: (id: string) => void;
}

export function ChannelCard({ channel: ch, onJoin }: ChannelCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-[#1E293B] flex items-center gap-1.5">
          <Hash size={16} className="text-primary" /> {ch.name}
        </h3>
        {ch.description && <p className="text-sm text-[#64748B] mt-1 leading-snug">{ch.description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {ch.tags?.map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-primary">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Users size={12} /> {ch.memberCount} membres</span>
        {ch.joined ? (
          <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full">Rejoint</span>
        ) : (
          <button onClick={() => onJoin(ch.id)} className="text-xs font-semibold text-primary bg-secondary px-4 py-1.5 rounded-xl hover:bg-[#E0E5FF] transition-colors">
            Rejoindre
          </button>
        )}
      </div>
    </div>
  );
}
