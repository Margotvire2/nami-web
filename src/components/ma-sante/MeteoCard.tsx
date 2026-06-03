"use client";

import type { MoodKey } from "@/hooks/useMaSante";

const MOOD_LABEL: Record<MoodKey, { emoji: string; label: string }> = {
  sunny: { emoji: "☀️", label: "Belle journée" },
  partly_cloudy: { emoji: "⛅", label: "Bonne journée" },
  cloudy: { emoji: "☁️", label: "Journée mitigée" },
  rainy: { emoji: "🌧️", label: "Plus difficile aujourd'hui" },
  stormy: { emoji: "⛈️", label: "Journée éprouvante" },
  tornado: { emoji: "🌪️", label: "Très dure aujourd'hui" },
};

interface MeteoCardProps {
  mood: MoodKey | null;
}

export function MeteoCard({ mood }: MeteoCardProps) {
  return (
    <div
      style={{
        background: "var(--nami-card)",
        borderRadius: 20,
        border: "1px solid var(--nami-border)",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--nami-dark)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 12,
        }}
      >
        Comment je me sens
      </div>
      {mood ? (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>
            {MOOD_LABEL[mood].emoji}
          </span>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nami-dark)" }}>
            {MOOD_LABEL[mood].label}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
          Aucune note récente. Ouvrez l&apos;app Nami pour noter comment vous vous sentez.
        </div>
      )}
    </div>
  );
}
