"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientMe, type PatientMessage } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Loader2, MessageCircle } from "lucide-react";

const C = {
  primary: "#5B4EC4", primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E", textSoft: "#6B7280", border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF", bg: "#FAFAF8",
};

const MAX_LENGTH = 2000;

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: C.primaryLight,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: C.primary, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Récupérer le care case du patient
  const { data: me } = useQuery<PatientMe>({
    queryKey: ["patient-me"],
    queryFn: () => api.patient.me(),
    enabled: !!accessToken,
  });

  const careCaseId = me?.careCases?.[0]?.id;

  // Charger les messages
  const { data: messages = [], isLoading } = useQuery<PatientMessage[]>({
    queryKey: ["patient-messages", careCaseId],
    queryFn: () => api.patient.messages(careCaseId!),
    enabled: !!accessToken && !!careCaseId,
    refetchInterval: 15_000, // polling 15s
  });

  // Scroll to bottom quand nouveaux messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Envoyer un message
  const sendMutation = useMutation({
    mutationFn: (body: string) => api.patient.sendMessage(careCaseId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-messages", careCaseId] });
      setDraft("");
      setError(null);
      textareaRef.current?.focus();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi du message";
      setError(msg);
    },
  });

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !careCaseId || sendMutation.isPending) return;
    if (text.length > MAX_LENGTH) {
      setError(`Message trop long (maximum ${MAX_LENGTH} caractères)`);
      return;
    }
    sendMutation.mutate(text);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    if (error) setError(null);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const team = me?.careCases?.[0]?.members ?? [];
  const teamNames = team.map((m) => `${m.person.firstName} ${m.person.lastName}`).join(", ");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", flexShrink: 0 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>Messages</h1>
        {teamNames && (
          <p style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
            Conversation avec votre équipe soignante · {teamNames}
          </p>
        )}
      </div>

      {/* Disclaimer urgences */}
      <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 24px", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13 }}>⚠️</span>
        <p style={{ fontSize: 12, color: "#92400E" }}>
          Ce canal n&apos;est pas destiné aux urgences médicales. En cas d&apos;urgence, appelez le <strong>15</strong> ou le <strong>112</strong>.
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 size={22} className="animate-spin" style={{ color: C.primary }} />
          </div>
        ) : !careCaseId ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <MessageCircle size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14, color: C.textSoft }}>Aucun suivi actif trouvé.</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <MessageCircle size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14, color: C.textSoft }}>Aucun message pour l&apos;instant.</p>
            <p style={{ fontSize: 12, color: C.textSoft, opacity: 0.7, marginTop: 4 }}>
              Vous pouvez écrire à votre équipe soignante ci-dessous.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.id === user?.id;
            const senderName = `${msg.sender.firstName} ${msg.sender.lastName}`;
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                {!isMe && <Avatar name={senderName} size={30} />}
                <div style={{ maxWidth: "70%" }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 3, fontWeight: 500 }}>
                      {senderName}
                    </div>
                  )}
                  <div style={{
                    padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isMe ? C.primary : C.card,
                    border: isMe ? "none" : `1px solid ${C.border}`,
                    color: isMe ? "#fff" : C.text,
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {msg.body}
                  </div>
                  <div style={{ fontSize: 10, color: C.textSoft, marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                    {format(parseISO(msg.createdAt), "d MMM à HH:mm", { locale: fr })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {careCaseId && (
        <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "12px 16px", flexShrink: 0 }}>
          <form
            onSubmit={handleSubmit}
            aria-label="Envoyer un message à mon équipe soignante"
            style={{ maxWidth: 640, margin: "0 auto" }}
          >
            {error && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  marginBottom: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(220,38,38,0.06)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  fontSize: 12,
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}
            <label htmlFor="message-composer" className="sr-only">
              Écrire un message à mon équipe soignante
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <textarea
                  id="message-composer"
                  ref={textareaRef}
                  value={draft}
                  onChange={handleChange}
                  onKeyDown={handleKey}
                  placeholder="Écrire un message à votre équipe…"
                  rows={1}
                  aria-describedby="message-char-count"
                  style={{
                    padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`,
                    fontSize: 14, fontFamily: "inherit", resize: "none", background: C.bg,
                    color: C.text, outline: "none", lineHeight: 1.5,
                  }}
                />
                <p
                  id="message-char-count"
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    textAlign: "right",
                    color: draft.length > MAX_LENGTH ? "#DC2626" : "#9CA3AF",
                    fontWeight: draft.length > MAX_LENGTH ? 600 : 400,
                  }}
                >
                  {draft.length} / {MAX_LENGTH}
                </p>
              </div>
              <button
                type="submit"
                aria-label="Envoyer le message"
                disabled={!draft.trim() || sendMutation.isPending || draft.length > MAX_LENGTH}
                style={{
                  width: 42, height: 42, borderRadius: 12, border: "none",
                  background: draft.trim() && draft.length <= MAX_LENGTH ? C.primary : C.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: draft.trim() && draft.length <= MAX_LENGTH ? "pointer" : "not-allowed",
                  flexShrink: 0,
                }}
              >
                {sendMutation.isPending
                  ? <Loader2 size={16} color="#fff" className="animate-spin" />
                  : <Send size={16} color="#fff" strokeWidth={2} />
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
