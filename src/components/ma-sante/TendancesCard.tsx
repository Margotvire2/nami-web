"use client";

interface TendancesCardProps {
  entriesCount7d: number;
  entriesCountPrev7d: number;
}

function formatDelta(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return "stable";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${Math.abs(diff)} cette semaine`;
}

export function TendancesCard({ entriesCount7d, entriesCountPrev7d }: TendancesCardProps) {
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
        Ma semaine
      </div>

      {entriesCount7d === 0 ? (
        <div style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
          Aucune note ces 7 derniers jours.
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "var(--nami-secondary)",
              lineHeight: 1,
              fontFamily: "var(--font-jakarta)",
            }}
          >
            {entriesCount7d}
          </span>
          <div style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
            note{entriesCount7d > 1 ? "s" : ""} cette semaine
            <div style={{ fontSize: 13, color: "var(--nami-text-muted)", marginTop: 2 }}>
              {formatDelta(entriesCount7d, entriesCountPrev7d)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
