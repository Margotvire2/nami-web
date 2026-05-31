"use client";

import { useMemo } from "react";
import { Users, UserCircle2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { PatientMessageThread } from "@/lib/api";

interface ThreadsSidebarProps {
  threads: PatientMessageThread[];
  selectedThreadType: PatientMessageThread["threadType"] | null;
  selectedThreadId: string | null;
  isLoading: boolean;
  onSelect: (thread: PatientMessageThread) => void;
}

// Hash léger pour générer une teinte stable depuis personId/threadId.
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

function initialsOf(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trim() + "…";
}

function ThreadItem({
  thread,
  isSelected,
  onSelect,
}: {
  thread: PatientMessageThread;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colorKey = `${thread.threadType}:${thread.threadId}`;
  const avatarBg = pastelFromKey(colorKey);
  const avatarFg = pastelTextFromKey(colorKey);
  const initials = initialsOf(thread.title);
  const preview = thread.lastMessage?.body
    ? truncate(thread.lastMessage.body.replace(/\s+/g, " "), 60)
    : "Aucun message pour l'instant";
  const dateLabel = thread.lastMessage
    ? formatDistanceToNow(new Date(thread.lastMessage.createdAt), {
        addSuffix: false,
        locale: fr,
      })
    : null;
  const hasUnread = thread.unreadCount > 0;

  return (
    <li style={{ listStyle: "none" }}>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isSelected ? "true" : undefined}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 12px 10px 13px",
          borderRadius: 10,
          background: isSelected ? "var(--nami-primary-light, #EEEDFB)" : "transparent",
          borderLeft: isSelected
            ? "3px solid var(--nami-primary, #5B4EC4)"
            : "3px solid transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          transition: "background 120ms ease",
        }}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)]/40"
      >
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: avatarBg,
            color: avatarFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: hasUnread ? 700 : 600,
                color: "var(--nami-dark, #1A1A2E)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
              }}
            >
              {thread.title}
            </span>
            {dateLabel && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--nami-text-muted, #6B7280)",
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dateLabel}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 12,
                color: hasUnread
                  ? "var(--nami-dark, #1A1A2E)"
                  : "var(--nami-text-muted, #6B7280)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                fontWeight: hasUnread ? 600 : 400,
              }}
            >
              {preview}
            </span>
            {hasUnread && (
              <span
                aria-label={`${thread.unreadCount} message${thread.unreadCount > 1 ? "s" : ""} non lu${
                  thread.unreadCount > 1 ? "s" : ""
                }`}
                style={{
                  flexShrink: 0,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  padding: "0 6px",
                  background: "var(--nami-primary, #5B4EC4)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {thread.unreadCount > 99 ? "99+" : thread.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof Users;
  label: string;
  count: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "12px 14px 6px",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--nami-text-muted, #6B7280)",
      }}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
      <span style={{ fontWeight: 500, opacity: 0.7 }}>· {count}</span>
    </div>
  );
}

/**
 * Sidebar threads patient — pattern Slack/WhatsApp adapté MDR.
 *
 * Deux sections séparées par un divider :
 *   a) "Mes équipes soignantes" → tous les threads CARECASE (channels)
 *   b) "Mes échanges privés"    → tous les threads DM (1:1)
 *
 * Tri intra-section : par lastMessage.createdAt desc (servi par le backend
 * via merged.sort), on conserve l'ordre fourni. Item sélectionné mis en
 * évidence par un bg violet light + borderLeft 3px violette.
 */
export function ThreadsSidebar({
  threads,
  selectedThreadType,
  selectedThreadId,
  isLoading,
  onSelect,
}: ThreadsSidebarProps) {
  const { careCaseThreads, dmThreads } = useMemo(() => {
    const cc: PatientMessageThread[] = [];
    const dm: PatientMessageThread[] = [];
    for (const t of threads) {
      if (t.threadType === "CARECASE") cc.push(t);
      else if (t.threadType === "DM") dm.push(t);
    }
    return { careCaseThreads: cc, dmThreads: dm };
  }, [threads]);

  return (
    <aside
      aria-label="Liste des conversations"
      style={{
        width: 320,
        minWidth: 280,
        background: "var(--nami-card, #FFFFFF)",
        borderRight: "1px solid var(--nami-border, rgba(26,26,46,0.06))",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 16px 10px",
          borderBottom: "1px solid var(--nami-border, rgba(26,26,46,0.06))",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--nami-dark, #1A1A2E)",
            letterSpacing: "-0.3px",
          }}
        >
          Conversations
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: "var(--nami-primary, #5B4EC4)" }}
              aria-label="Chargement des conversations"
            />
          </div>
        ) : (
          <>
            <SectionHeader icon={Users} label="Mes équipes soignantes" count={careCaseThreads.length} />
            {careCaseThreads.length === 0 ? (
              <p
                style={{
                  padding: "0 14px 8px",
                  fontSize: 12,
                  color: "var(--nami-text-muted, #6B7280)",
                  lineHeight: 1.5,
                }}
              >
                Aucune équipe pour le moment.
              </p>
            ) : (
              <ul style={{ padding: "0 8px", margin: 0 }}>
                {careCaseThreads.map((t) => (
                  <ThreadItem
                    key={`CARECASE-${t.threadId}`}
                    thread={t}
                    isSelected={
                      selectedThreadType === "CARECASE" && selectedThreadId === t.threadId
                    }
                    onSelect={() => onSelect(t)}
                  />
                ))}
              </ul>
            )}

            <div
              role="separator"
              aria-hidden="true"
              style={{
                margin: "10px 14px",
                borderTop: "1px solid var(--nami-border, rgba(26,26,46,0.06))",
              }}
            />

            <SectionHeader icon={UserCircle2} label="Mes échanges privés" count={dmThreads.length} />
            {dmThreads.length === 0 ? (
              <p
                style={{
                  padding: "0 14px 16px",
                  fontSize: 12,
                  color: "var(--nami-text-muted, #6B7280)",
                  lineHeight: 1.5,
                }}
              >
                Aucun soignant à contacter en direct pour le moment.
              </p>
            ) : (
              <ul style={{ padding: "0 8px 12px", margin: 0 }}>
                {dmThreads.map((t) => (
                  <ThreadItem
                    key={`DM-${t.threadId}`}
                    thread={t}
                    isSelected={selectedThreadType === "DM" && selectedThreadId === t.threadId}
                    onSelect={() => onSelect(t)}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
