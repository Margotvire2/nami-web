"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CockpitDmInboxMessage, CockpitDmInboxPatient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { MessageSquare, Send, FileText } from "lucide-react";
import { useCockpitDmThread } from "@/hooks/useCockpitDmThread";
import { useSendCockpitDm } from "@/hooks/useSendCockpitDm";
import { toast } from "sonner";
import { avatarBg, initials } from "./avatarUtils";

export function CockpitDmConversationView({
  patientPersonId,
  patient,
}: {
  patientPersonId: string;
  patient: CockpitDmInboxPatient;
}) {
  const { accessToken, user } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data, isLoading } = useCockpitDmThread({ patientPersonId });
  const sendMutation = useSendCockpitDm();

  const messages = data?.messages;
  const currentUserId = user?.id ?? "";

  const orderedMessages = messages ? [...messages].reverse() : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orderedMessages?.length]);

  // markRead côté soignant (différent du patient)
  useEffect(() => {
    if (!messages) return;
    for (const msg of messages) {
      if (!msg.isRead && msg.senderId !== currentUserId) {
        // Pas d'endpoint markRead DM dédié côté cockpit V1 — la lecture est
        // implicite via listDmMessagesWithPatient qui ne ré-injecte pas les
        // reads. On laisse cet effet comme placeholder pour l'extension V1.1.
      }
    }
  }, [messages, currentUserId]);

  const handleSend = () => {
    if (!newMessage.trim() || sendMutation.isPending) return;
    sendMutation.mutate(
      { patientPersonId, body: newMessage.trim() },
      {
        onSuccess: () => {
          setNewMessage("");
          toast.success("Message envoyé");
        },
      },
    );
  };

  const headerName = `${patient.firstName} ${patient.lastName}`.trim();
  const headerColor = "#5B4EC4";

  return (
    <div className="flex flex-col h-full">
      <div style={{ borderBottom: "1px solid #F1F5F9", background: "#FFFFFF", flexShrink: 0 }}>
        <div style={{ height: 3, background: headerColor }} />
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: avatarBg(patientPersonId),
                color: "#1A1A2E",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}
            >
              {initials(patient.firstName, patient.lastName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{headerName}</p>
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                    background: `${headerColor}15`,
                    color: headerColor,
                    letterSpacing: "0.05em", textTransform: "uppercase" as const,
                  }}
                >
                  Message privé
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Conversation directe patient ↔ soignant</p>
            </div>
          </div>
          <Link
            href={`/patients/${patientPersonId}`}
            className="text-[11px] text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <FileText size={11} /> Voir fiche patient
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : !orderedMessages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare size={24} className="text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">Aucun message dans cette conversation.</p>
          </div>
        ) : (
          orderedMessages.map((msg) => (
            <DmMessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))
        )}
      </div>

      <div className="border-t bg-white px-5 py-3 shrink-0">
        <div className="flex gap-2">
          <Textarea
            placeholder="Répondre au patient…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
            className="text-sm resize-none flex-1 min-h-[36px] max-h-24"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="sm"
            className="h-9 px-3"
            disabled={!newMessage.trim() || sendMutation.isPending}
            onClick={handleSend}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DmMessageBubble({
  message,
  isOwn,
}: {
  message: CockpitDmInboxMessage;
  isOwn: boolean;
}) {
  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div
        className="max-w-[75%] rounded-2xl px-4 py-2.5"
        style={{
          background: isOwn ? "#5B4EC4" : "#F5F3EF",
          color: isOwn ? "#FFFFFF" : "#1A1A2E",
          borderBottomRightRadius: isOwn ? 6 : undefined,
          borderBottomLeftRadius: isOwn ? undefined : 6,
        }}
      >
        {!isOwn && (
          <p className="text-[10px] font-semibold mb-0.5 opacity-80">
            {message.senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : ""}`}>
          <span
            className="text-[9px]"
            style={{ color: isOwn ? "rgba(255,255,255,0.6)" : "rgba(26,26,46,0.5)" }}
          >
            {new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {new Date(message.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
    </div>
  );
}
