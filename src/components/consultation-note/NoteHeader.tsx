"use client";

import Image from "next/image";
import { DraftBadge } from "./DraftBadge";

interface AuthorInfo {
  firstName: string;
  lastName: string;
  specialty?: string;
  avatarUrl?: string;
}

interface Props {
  author?: AuthorInfo;
  createdAt?: string;
  isDraft: boolean;
  onViewTranscript?: () => void;
}

function formatNoteDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) +
    " à " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

export function NoteHeader({ author, createdAt, isDraft, onViewTranscript }: Props) {
  const fullName = author
    ? `${author.firstName || ""} ${author.lastName || ""}`.trim()
    : null;
  const initials = fullName
    ? fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px",
      marginBottom: "16px",
      flexWrap: "wrap",
    }}>
      {/* Left: avatar + name + meta */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#EDE9FC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {author?.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={fullName || ""}
              width={40}
              height={40}
              style={{ objectFit: "cover", width: "40px", height: "40px", borderRadius: "50%" }}
            />
          ) : (
            <span style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#5B4EC4",
              fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)",
            }}>
              {initials}
            </span>
          )}
        </div>

        <div>
          {fullName && (
            <p style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)",
              margin: 0,
              lineHeight: 1.3,
            }}>
              {fullName}
            </p>
          )}
          <p style={{
            fontSize: "12px",
            color: "#8A8A96",
            fontFamily: "'Inter', system-ui, sans-serif",
            margin: "2px 0 0",
          }}>
            {author?.specialty && <span>{author.specialty}</span>}
            {author?.specialty && createdAt && <span> · </span>}
            {createdAt && <span>{formatNoteDate(createdAt)}</span>}
          </p>
        </div>
      </div>

      {/* Right: draft badge + transcript link */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {isDraft && <DraftBadge />}
        {onViewTranscript && (
          <button
            onClick={onViewTranscript}
            style={{
              fontSize: "12px",
              color: "#5B4EC4",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
            }}
          >
            Voir transcription brute →
          </button>
        )}
      </div>
    </div>
  );
}
