"use client";

import {
  NOTIFICATION_PREFERENCE_CHANNELS,
  type NotificationPreferenceCategory,
  type NotificationPreferenceChannel,
} from "@/lib/api";

// Toggle inline (a11y role="switch") — identique au pattern utilisé Section 4
// de /mon-compte (page.tsx) pour cohérence visuelle.
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: 999,
        border: "none",
        background: checked ? "var(--nami-primary)" : "#E5E7EB",
        cursor: "pointer",
        transition: "background 0.18s ease",
        flexShrink: 0,
        outline: "none",
        padding: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 19 : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(26,26,46,0.25)",
          transition: "left 0.18s ease",
        }}
      />
    </button>
  );
}

const CHANNEL_LABELS_FR: Record<NotificationPreferenceChannel, string> = {
  EMAIL: "Email",
  PUSH: "Push",
  SMS: "SMS",
  IN_APP: "Dans l'app",
};

interface Props {
  category: NotificationPreferenceCategory;
  categoryLabel: string;
  categoryDescription: string;
  channels: Record<NotificationPreferenceChannel, boolean>;
  onToggle: (
    category: NotificationPreferenceCategory,
    channel: NotificationPreferenceChannel,
    enabled: boolean,
  ) => void;
}

export default function NotificationPreferencesCategoryRow({
  category,
  categoryLabel,
  categoryDescription,
  channels,
  onToggle,
}: Props) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: `1px solid var(--nami-border)`,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--nami-dark)",
            marginBottom: 2,
          }}
        >
          {categoryLabel}
        </div>
        <div style={{ fontSize: 12, color: "var(--nami-text-muted)", lineHeight: 1.4 }}>
          {categoryDescription}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px 16px",
        }}
      >
        {NOTIFICATION_PREFERENCE_CHANNELS.map((channel) => (
          <div
            key={channel}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--nami-dark)" }}>
              {CHANNEL_LABELS_FR[channel]}
            </span>
            <Toggle
              checked={channels[channel]}
              onChange={(next) => onToggle(category, channel, next)}
              label={`${categoryLabel} — ${CHANNEL_LABELS_FR[channel]}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
