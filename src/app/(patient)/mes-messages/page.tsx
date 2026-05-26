"use client";

import { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientMe, type PatientMessage } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MessageCircle } from "lucide-react";
import { ComposerEnhanced } from "./ComposerEnhanced";

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "var(--nami-primary-light)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "var(--nami-primary)", flexShrink: 0,
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

  // Envoyer un message — API REELLE PRÉSERVÉE INCHANGÉE
  // ComposerEnhanced appelle handleSendBody(body) qui delegue à cette mutation
  const sendMutation = useMutation({
    mutationFn: (body: string) => api.patient.sendMessage(careCaseId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-messages", careCaseId] });
    },
  });

  function handleSendBody(body: string) {
    if (!careCaseId || sendMutation.isPending) return;
    sendMutation.mutate(body);
  }

  const team = me?.careCases?.[0]?.members ?? [];
  const teamNames = team.map((m) => `${m.person.firstName} ${m.person.lastName}`).join(", ");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--nami-bg)" }}>
      {/* Header */}
      <div style={{ background: "var(--nami-card)", borderBottom: `1px solid var(--nami-border)`, padding: "16px 24px", flexShrink: 0 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--nami-dark)", letterSpacing: "-0.3px" }}>Messages</h1>
        {teamNames && (
          <p style={{ fontSize: 12, color: "var(--nami-text-muted)", marginTop: 2 }}>
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
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
          </div>
        ) : !careCaseId ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <MessageCircle size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>Aucun suivi actif trouvé.</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <MessageCircle size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>Aucun message pour l&apos;instant.</p>
            <p style={{ fontSize: 12, color: "var(--nami-text-muted)", opacity: 0.7, marginTop: 4 }}>
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
                    <div style={{ fontSize: 11, color: "var(--nami-text-muted)", marginBottom: 3, fontWeight: 500 }}>
                      {senderName}
                    </div>
                  )}
                  <div style={{
                    padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isMe ? "var(--nami-primary)" : "var(--nami-card)",
                    border: isMe ? "none" : `1px solid var(--nami-border)`,
                    color: isMe ? "#fff" : "var(--nami-dark)",
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {msg.body}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--nami-text-muted)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                    {format(parseISO(msg.createdAt), "d MMM à HH:mm", { locale: fr })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer enhanced V2 — autogrow + char counter + attachments UI mock.
          API reste celle de sendMutation existant (préservation totale). */}
      {careCaseId && (
        <ComposerEnhanced
          disabled={!careCaseId}
          isPending={sendMutation.isPending}
          onSend={handleSendBody}
        />
      )}
    </div>
  );
}
