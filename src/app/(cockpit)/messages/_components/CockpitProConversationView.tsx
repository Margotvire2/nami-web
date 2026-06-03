"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { type ProConversation, type ProMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MessageSquare, AlertTriangle } from "lucide-react";
import {
  useCockpitProMessages,
  useSendCockpitProMessage,
  useMarkProConversationRead,
  useToggleProReaction,
} from "@/hooks/useCockpitProConversations";
import { getSpaceConfig, proInitials } from "./proSpaceConfig";
import { ProComposer } from "./ProComposer";

function getConvName(conv: ProConversation, userId?: string): string {
  if (conv.name) return conv.name;
  const other = conv.members.find((m) => m.id !== userId);
  return other ? `${other.firstName} ${other.lastName}` : "Conversation";
}

export function CockpitProConversationView({
  conversation,
}: {
  conversation: ProConversation;
}) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: loadingMsgs } = useCockpitProMessages(
    conversation.id,
  );
  const sendMsg = useSendCockpitProMessage(conversation.id);
  const markRead = useMarkProConversationRead();
  const toggleReaction = useToggleProReaction();

  useEffect(() => {
    markRead.mutate(conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const messagesByDate = (messages ?? []).reduce<Record<string, ProMessage[]>>(
    (acc, msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    },
    {},
  );

  const cfg = getSpaceConfig(conversation.type);
  const Icon = cfg.icon;

  return (
    <>
      {/* Header */}
      <div className="h-12 px-5 flex items-center justify-between shrink-0 border-b">
        <div className="flex items-center gap-2">
          <Icon size={14} className={cfg.color} />
          <h2 className="text-sm font-semibold">
            {getConvName(conversation, user?.id)}
          </h2>
          {conversation.description && (
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              — {conversation.description}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            · {conversation.members.length} membre
            {conversation.members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Chargement…
          </div>
        ) : (messages ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare size={20} className="text-muted-foreground/25 mb-2" />
            <p className="text-xs text-muted-foreground">
              Soyez le premier à écrire dans cet espace
            </p>
          </div>
        ) : (
          Object.entries(messagesByDate).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground font-medium capitalize">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {msgs.map((msg, i) => {
                const showAvatar =
                  i === 0 || msgs[i - 1].senderId !== msg.senderId;
                const time = new Date(msg.createdAt).toLocaleTimeString(
                  "fr-FR",
                  { hour: "2-digit", minute: "2-digit" },
                );
                const isSystem = msg.contentType === "SYSTEM";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center py-1">
                      <span className="text-[10px] text-muted-foreground italic">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "py-1 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors group",
                      showAvatar ? "mt-3" : "",
                    )}
                  >
                    <div className="flex gap-3">
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {proInitials(msg.sender.firstName, msg.sender.lastName)}
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
                            <span className="text-xs font-semibold">
                              {msg.sender.firstName} {msg.sender.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {time}
                            </span>
                          </div>
                        )}
                        <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {Object.entries(
                              msg.reactions.reduce(
                                (acc, r) => {
                                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                  return acc;
                                },
                                {} as Record<string, number>,
                              ),
                            ).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() =>
                                  toggleReaction.mutate({
                                    messageId: msg.id,
                                    emoji,
                                    conversationId: conversation.id,
                                  })
                                }
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs hover:bg-primary/10 transition-colors"
                              >
                                <span>{emoji}</span>
                                <span className="text-muted-foreground font-medium">
                                  {count}
                                </span>
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

      {/* Bannière + composer */}
      <div className="shrink-0 border-t">
        <div className="bg-amber-50/60 px-5 py-1.5 text-[10px] text-amber-800 flex items-center gap-2">
          <AlertTriangle size={10} className="shrink-0" />
          <span>
            Espace de coordination professionnelle — en cas d&apos;urgence
            patient : 15 ou 112.
          </span>
        </div>
        <div className="px-5 py-3">
          <ProComposer
            onSend={(text) => sendMsg.mutate(text)}
            placeholder={`Écrire dans ${getConvName(conversation, user?.id)}…`}
            disabled={sendMsg.isPending}
          />
        </div>
      </div>
    </>
  );
}
