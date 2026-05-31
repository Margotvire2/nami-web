"use client";

import Link from "next/link";
import type { PatientCareCaseHubMessages } from "@/lib/api";

interface HubMessagesSectionProps {
  messages: PatientCareCaseHubMessages;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export function HubMessagesSection({ messages }: HubMessagesSectionProps) {
  const headingId = "hub-messages-heading";
  const href = `/mes-messages?thread=${encodeURIComponent(messages.threadId)}`;
  const hasUnread = messages.unreadCount > 0;

  return (
    <section
      aria-labelledby={headingId}
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2
          id={headingId}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            margin: 0,
          }}
        >
          Messagerie du parcours
        </h2>
        <Link
          href={href}
          style={{
            fontSize: 12,
            color: "#5B4EC4",
            fontFamily: "var(--font-inter)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Ouvrir la conversation
        </Link>
      </div>

      {messages.lastMessage ? (
        <Link
          href={href}
          style={{
            display: "block",
            padding: "12px 14px",
            borderRadius: 12,
            background: "#FAFAF8",
            textDecoration: "none",
            color: "#1A1A2E",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                fontFamily: "var(--font-inter)",
              }}
            >
              Dernier message · {formatDate(messages.lastMessage.createdAt)}
            </span>
            {hasUnread ? (
              <span
                aria-label={`${messages.unreadCount} message(s) non lu(s)`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(91,78,196,0.12)",
                  color: "#5B4EC4",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "var(--font-inter)",
                }}
              >
                {messages.unreadCount} non lu{messages.unreadCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#374151",
              fontFamily: "var(--font-inter)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {truncate(messages.lastMessage.body)}
          </p>
        </Link>
      ) : (
        <p
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Aucun message pour le moment.
        </p>
      )}

      <p
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "#9CA3AF",
          fontFamily: "var(--font-inter)",
          lineHeight: 1.5,
        }}
      >
        En cas d&apos;urgence vitale : 15 / 112.
      </p>
    </section>
  );
}
