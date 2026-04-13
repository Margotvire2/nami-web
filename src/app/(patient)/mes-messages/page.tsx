"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientMe, type PatientMessage } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Loader2, MessageCircle } from "lucide-react";

const C = {
  primary: "#0F766E", primaryLight: "#CCFBF1", primaryMid: "#14B8A6",
  text: "#1C2B2A", textSoft: "#6B7280", border: "#E5E7EB",
  card: "#FFFFFF", bg: "#F8FAFB",
};

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
  const bottomRef = useRef<HTMLDivElement>(null);

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
    },
  });

  function handleSend() {
    const text = draft.trim();
    if (!text || !careCaseId || sendMutation.isPending) return;
    sendMutation.mutate(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 640, margin: "0 auto" }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Écrire un message à votre équipe…"
              rows={1}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`,
                fontSize: 14, fontFamily: "inherit", resize: "none", background: C.bg,
                color: C.text, outline: "none", lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || sendMutation.isPending}
              style={{
                width: 42, height: 42, borderRadius: 12, border: "none",
                background: draft.trim() ? C.primary : C.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: draft.trim() ? "pointer" : "not-allowed", flexShrink: 0,
              }}
            >
              {sendMutation.isPending
                ? <Loader2 size={16} color="#fff" className="animate-spin" />
                : <Send size={16} color="#fff" strokeWidth={2} />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
