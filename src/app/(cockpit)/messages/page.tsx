"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, Message, CareCase } from "@/lib/api";
import { useMessages } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import {
  MessageSquare, MessageCircle, Send, ChevronRight, Clock, User,
  FileText, CornerDownRight, ChevronLeft,
} from "lucide-react";
import { EmptyState } from "@/components/nami/EmptyState";

// ═════════════════════════════════════════════════════════════════════════════
// PAGE MESSAGES — fil de coordination clinique par care case
// ═════════════════════════════════════════════════════════════════════════════

export default function MessagesPage() {
  const { accessToken, user } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Charger tous les care cases pour lister ceux avec des messages
  const { data: cases, isLoading: loadingCases } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <h1 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare size={16} /> Messages
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Coordination clinique par dossier patient
        </p>
      </div>

      {/* [LEGAL] Bannière permanente — coordination uniquement */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 shrink-0 flex items-center gap-2">
        <span className="text-amber-600 text-xs font-semibold">⚠</span>
        <p className="text-xs text-amber-700">
          Cette messagerie est réservée à la coordination entre professionnels. En cas d&apos;urgence : <span className="font-semibold">15</span> ou <span className="font-semibold">112</span>.
        </p>
      </div>

      {/* Layout liste + conversation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des care cases */}
        <div className={`${selectedCaseId ? "w-80" : "w-96"} shrink-0 border-r bg-white overflow-y-auto transition-all`}>
          {loadingCases ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : !(cases?.length) ? (
            <EmptyState
              icon={MessageCircle}
              title="Aucune conversation"
              description="Vos échanges professionnels entre soignants apparaîtront ici."
              variant="subtle"
            />
          ) : (
            <div className="divide-y">
              {cases.map((c) => (
                <CaseChatRow
                  key={c.id}
                  careCase={c}
                  isSelected={c.id === selectedCaseId}
                  onSelect={() => setSelectedCaseId(c.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Conversation */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCaseId ? (
            <ConversationView careCaseId={selectedCaseId} currentUserId={user?.id ?? ""} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <MessageSquare size={32} className="text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Démarrez un fil de coordination</p>
              <p className="text-xs text-muted-foreground/70 max-w-xs">Sélectionnez un dossier patient à gauche pour échanger avec l&apos;équipe de suivi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ligne care case dans la sidebar ─────────────────────────────────────────

function CaseChatRow({ careCase: c, isSelected, onSelect }: {
  careCase: CareCase; isSelected: boolean; onSelect: () => void;
}) {
  // Charger le dernier message pour le preview
  const { data: msgs } = useMessages(c.id);
  const lastMsg = msgs?.[msgs.length - 1];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 transition-colors ${
        isSelected ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
          {c.patient.firstName[0]}{c.patient.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium truncate">{c.patient.firstName} {c.patient.lastName}</p>
            {lastMsg && (
              <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(lastMsg.createdAt)}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{c.caseTitle}</p>
          {lastMsg && (
            <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
              {lastMsg.sender.firstName}: {lastMsg.body.slice(0, 60)}{lastMsg.body.length > 60 ? "…" : ""}
            </p>
          )}
          {!lastMsg && msgs && (
            <p className="text-[11px] text-muted-foreground/50 mt-0.5 italic">Aucun message</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Vue conversation ────────────────────────────────────────────────────────

function ConversationView({ careCaseId, currentUserId }: {
  careCaseId: string; currentUserId: string;
}) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const { data: messages, isLoading } = useMessages(careCaseId);

  // Charger les infos du care case pour le header
  const { data: careCase } = useQuery({
    queryKey: ["care-case", careCaseId],
    queryFn: () => api.careCases.get(careCaseId),
  });

  const sendMutation = useMutation({
    mutationFn: () => api.messages.send(careCaseId, newMessage, replyTo?.id),
    onSuccess: () => {
      setNewMessage("");
      setReplyTo(null);
      qc.invalidateQueries({ queryKey: ["messages", careCaseId] });
      toast.success("Message envoyé");
    },
    onError: () => toast.error("Erreur d'envoi"),
  });

  // Auto-scroll au bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length]);

  // Mark messages as read
  useEffect(() => {
    if (!messages) return;
    for (const msg of messages) {
      const alreadyRead = msg.reads.some((r) => r.personId === currentUserId);
      if (!alreadyRead) {
        api.messages.markRead(careCaseId, msg.id).catch(() => {});
      }
    }
  }, [messages, currentUserId, careCaseId, api]);

  return (
    <div className="flex flex-col h-full">
      {/* Header conversation */}
      {careCase && (
        <div className="border-b bg-white px-5 py-3 shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{careCase.patient.firstName} {careCase.patient.lastName}</p>
              <span className="text-[10px] border rounded px-1.5 py-0.5 text-muted-foreground">{careCase.caseType}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{careCase.caseTitle}</p>
          </div>
          <Link href={`/patients/${careCaseId}`} className="text-[11px] text-primary hover:underline flex items-center gap-1">
            <FileText size={11} /> Ouvrir le dossier
          </Link>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : !messages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare size={24} className="text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">Aucun message. Démarrez la conversation.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender.id === currentUserId}
              onReply={() => setReplyTo(msg)}
              careCaseId={careCaseId}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Zone d'envoi */}
      <div className="border-t bg-white px-5 py-3 shrink-0">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-lg bg-muted/30 text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <CornerDownRight size={10} /> Réponse à {replyTo.sender.firstName}
            </span>
            <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground text-xs">Annuler</button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Écrire un message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
            className="text-sm resize-none flex-1 min-h-[36px] max-h-24"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
                e.preventDefault();
                sendMutation.mutate();
              }
            }}
          />
          <Button
            size="sm"
            className="h-9 px-3"
            disabled={!newMessage.trim() || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulle de message ────────────────────────────────────────────────────────

function MessageBubble({ message: msg, isOwn, onReply, careCaseId, currentUserId }: {
  message: Message; isOwn: boolean; onReply: () => void;
  careCaseId: string; currentUserId: string;
}) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [showReplies, setShowReplies] = useState(false);

  // Fetch replies on demand
  const { data: replies } = useQuery({
    queryKey: ["messages", careCaseId, "replies", msg.id],
    queryFn: () => api.messages.list(careCaseId, msg.id),
    enabled: showReplies && msg._count.replies > 0,
  });

  const hasReplies = msg._count.replies > 0;

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
        isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/40 rounded-bl-md"
      }`}>
        {!isOwn && (
          <p className={`text-[10px] font-semibold mb-0.5 ${isOwn ? "text-primary-foreground/70" : "text-foreground"}`}>
            {msg.sender.firstName} {msg.sender.lastName}
            <span className="font-normal ml-1 opacity-60">{roleLabel(msg.sender.roleType)}</span>
          </p>
        )}
        <p className={`text-sm leading-relaxed ${isOwn ? "" : ""}`}>{msg.body}</p>
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : ""}`}>
          <span className={`text-[9px] ${isOwn ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>
            {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {new Date(msg.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-0.5 px-1">
        <button onClick={onReply} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          Répondre
        </button>
        {hasReplies && (
          <button onClick={() => setShowReplies(!showReplies)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <CornerDownRight size={9} /> {msg._count.replies} réponse{msg._count.replies > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && replies && (
        <div className="ml-8 mt-1 space-y-1 border-l-2 border-primary/10 pl-3">
          {replies.map((reply) => (
            <div key={reply.id} className={`max-w-full rounded-xl px-3 py-2 ${
              reply.sender.id === currentUserId ? "bg-primary/10" : "bg-muted/30"
            }`}>
              <p className="text-[10px] font-semibold">
                {reply.sender.firstName} {reply.sender.lastName}
                <span className="font-normal ml-1 text-muted-foreground">{roleLabel(reply.sender.roleType)}</span>
              </p>
              <p className="text-xs leading-relaxed mt-0.5">{reply.body}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                {new Date(reply.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roleLabel(roleType: string): string {
  const labels: Record<string, string> = {
    PROVIDER: "Soignant",
    PATIENT: "Patient",
    ADMIN: "Admin",
    ORG_ADMIN: "Admin org.",
  };
  return labels[roleType] ?? roleType;
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
