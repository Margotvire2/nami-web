"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader2, MessageCircle, Users, UserCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type {
  PatientMessageItem,
  PatientMessageThread,
  PatientMessageThreadType,
} from "@/lib/api";
import { ComposerEnhanced } from "../ComposerEnhanced";
import { formatProviderSpecialty } from "@/lib/provider-display";

interface ConversationPanelProps {
  thread: PatientMessageThread;
  messages: PatientMessageItem[];
  isLoading: boolean;
  isSending: boolean;
  currentUserPersonId: string | null;
  onSend: (body: string) => void;
}

function pastelFromKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 60%, 90%)`;
}
function pastelTextFromKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 65%, 28%)`;
}
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ personId, name, size = 30 }: { personId: string; name: string; size?: number }) {
  const bg = pastelFromKey(personId);
  const fg = pastelTextFromKey(personId);
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initialsOf(name)}
    </div>
  );
}

function ThreadHeader({
  thread,
  threadType,
}: {
  thread: PatientMessageThread;
  threadType: PatientMessageThreadType;
}) {
  const Icon = threadType === "CARECASE" ? Users : UserCircle2;
  const subtitle =
    threadType === "CARECASE"
      ? `Équipe soignante · ${thread.participants.length} membre${
          thread.participants.length > 1 ? "s" : ""
        }`
      : formatProviderSpecialty(thread.participants[0]?.specialty) || "Échange privé";

  // Aperçu des avatars membres (cap à 4).
  const visible = thread.participants.slice(0, 4);
  const extra = thread.participants.length - visible.length;

  return (
    <header
      style={{
        background: "var(--nami-card, #FFFFFF)",
        borderBottom: "1px solid var(--nami-border, rgba(26,26,46,0.06))",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}
    >
      <Icon
        size={18}
        strokeWidth={2}
        style={{ color: "var(--nami-primary, #5B4EC4)", flexShrink: 0 }}
        aria-hidden="true"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--nami-dark, #1A1A2E)",
            letterSpacing: "-0.3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {thread.title}
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--nami-text-muted, #6B7280)",
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </p>
      </div>
      {visible.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {visible.map((p, idx) => (
            <div
              key={p.personId}
              style={{
                marginLeft: idx === 0 ? 0 : -8,
                border: "2px solid var(--nami-card, #FFFFFF)",
                borderRadius: "50%",
              }}
            >
              <Avatar
                personId={p.personId}
                name={`${p.firstName} ${p.lastName}`}
                size={28}
              />
            </div>
          ))}
          {extra > 0 && (
            <div
              aria-label={`+${extra} autre${extra > 1 ? "s" : ""}`}
              style={{
                marginLeft: -8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--nami-bg, #FAFAF8)",
                color: "var(--nami-text-muted, #6B7280)",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--nami-card, #FFFFFF)",
              }}
            >
              +{extra}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

/**
 * Panel de conversation — header + timeline + composer.
 *
 * Timeline :
 *   - Backend renvoie les messages tri DESC (createdAt desc). On rend ASC
 *     visuellement (du plus ancien en haut au plus récent en bas) en
 *     inversant la liste localement, pour conserver le pattern messagerie
 *     attendu.
 *   - Auto-scroll en bas à chaque nouveau message (sur length change).
 *   - Bulles patient (= currentUserPersonId) : bg violet droite #5B4EC4 / blanc.
 *     Bulles soignant : bg #F5F3EF gauche / texte #1A1A2E.
 *
 * Composer :
 *   - On réutilise ComposerEnhanced existant (UX validée — autogrow, char
 *     counter, attachments preview mock). L'envoi est dispatché par le
 *     parent via onSend(body) ; le composer reste agnostic du threadType.
 *
 * Pas d'accusé lu/vu côté UI (décision UX 31/05) — on n'expose JAMAIS
 * isRead dans la timeline, même si le backend le fournit.
 */
export function ConversationPanel({
  thread,
  messages,
  isLoading,
  isSending,
  currentUserPersonId,
  onSend,
}: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Backend renvoie desc → on inverse pour rendu chrono ASC.
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [orderedMessages.length]);

  return (
    <section
      aria-label={`Conversation ${thread.title}`}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--nami-bg, #FAFAF8)",
        minWidth: 0,
      }}
    >
      <ThreadHeader thread={thread} threadType={thread.threadType} />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Loader2
              size={22}
              className="animate-spin"
              style={{ color: "var(--nami-primary, #5B4EC4)" }}
              aria-label="Chargement des messages"
            />
          </div>
        ) : orderedMessages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--nami-text-muted, #6B7280)" }}>
            <MessageCircle size={28} strokeWidth={1.5} style={{ margin: "0 auto 10px", opacity: 0.4 }} aria-hidden="true" />
            <p style={{ fontSize: 14 }}>Aucun message dans cette conversation.</p>
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Vous pouvez écrire le premier message ci-dessous.
            </p>
          </div>
        ) : (
          orderedMessages.map((msg) => {
            const isMe = !!currentUserPersonId && msg.senderId === currentUserPersonId;
            const senderName = msg.senderName || (isMe ? "Vous" : "Soignant");
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  gap: 10,
                  alignItems: "flex-end",
                }}
              >
                {!isMe && <Avatar personId={msg.senderId} name={senderName} size={30} />}
                <div style={{ maxWidth: "70%" }}>
                  {!isMe && thread.threadType === "CARECASE" && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--nami-text-muted, #6B7280)",
                        marginBottom: 3,
                        fontWeight: 500,
                      }}
                    >
                      {senderName}
                    </div>
                  )}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: isMe ? "var(--nami-primary, #5B4EC4)" : "#F5F3EF",
                      color: isMe ? "#FFFFFF" : "var(--nami-dark, #1A1A2E)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.body}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--nami-text-muted, #6B7280)",
                      marginTop: 4,
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {format(parseISO(msg.createdAt), "d MMM à HH:mm", { locale: fr })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <ComposerEnhanced disabled={false} isPending={isSending} onSend={onSend} target={{ threadType: thread.threadType, threadId: thread.threadId }} />
    </section>
  );
}
