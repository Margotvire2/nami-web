"use client";

interface HumeurCardProps {
  /** Score moyen 1-6 sur 7 j, null si aucune note. */
  moodAvg7d: number | null;
  /** Points 1-6 chronologiques sur 7 j. */
  moodPoints7d: number[];
}

/**
 * Mon humeur — vue 7 j.
 *
 * Wording MDR-safe : pas de "humeur anormale", pas d'alerte. On affiche
 * simplement le ressenti moyen sur l'échelle 1-6 (1 = très dure, 6 = belle).
 * Données purement subjectives, saisies par la patiente elle-même.
 */
export function HumeurCard({ moodAvg7d, moodPoints7d }: HumeurCardProps) {
  const hasData = moodPoints7d.length > 0;

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
        Mon humeur
      </div>

      {!hasData ? (
        <div style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
          Aucune note récente. Notez comment vous vous sentez depuis l&apos;app Nami.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "var(--nami-secondary)",
                lineHeight: 1,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {moodAvg7d}
            </span>
            <span style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
              / 6 · moyenne 7 j
            </span>
          </div>

          <div
            aria-label="Humeur des 7 derniers jours"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 48,
            }}
          >
            {moodPoints7d.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  // 1 → 16%, 6 → 100% : visuel proportionnel à la perception subjective
                  height: `${Math.max(6, (v / 6) * 100)}%`,
                  borderRadius: 6,
                  background:
                    "linear-gradient(180deg, var(--nami-secondary), var(--nami-primary))",
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
