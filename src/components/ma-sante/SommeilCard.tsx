"use client";

interface SommeilCardProps {
  /** Dernière durée de sommeil renseignée (heures). */
  latestSleepHours: number | null;
  /** Moyenne heures de sommeil sur 7 j. */
  sleepHours7d: number | null;
  /** Suite des durées de sommeil 7 j en heures, triées chronologiquement. */
  sleepPoints7d: number[];
}

function formatHours(value: number): string {
  // 7.5 → "7 h 30", 8 → "8 h"
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60);
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

/**
 * Mon sommeil — vue 7 j.
 *
 * Wording MDR-safe : pas d'alerte sommeil, pas de "manque de sommeil" jugé
 * cliniquement. On affiche le ressenti de la patiente, qu'elle a saisi
 * elle-même depuis l'app mobile.
 */
export function SommeilCard({
  latestSleepHours,
  sleepHours7d,
  sleepPoints7d,
}: SommeilCardProps) {
  const hasData = sleepPoints7d.length > 0;

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
        Mon sommeil
      </div>

      {!hasData ? (
        <div style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
          Aucune note récente. Notez vos nuits depuis l&apos;app Nami.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "var(--nami-primary)",
                lineHeight: 1,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {formatHours(latestSleepHours ?? sleepHours7d ?? 0)}
            </span>
            <span style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
              {sleepHours7d !== null && (
                <>
                  moyenne 7 j :{" "}
                  <strong style={{ color: "var(--nami-dark)" }}>
                    {formatHours(sleepHours7d)}
                  </strong>
                </>
              )}
            </span>
          </div>

          <div
            aria-label="Mes nuits cette semaine"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 48,
            }}
          >
            {sleepPoints7d.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  // 0 h → 6%, 9 h+ → 100% (référence indicative, non clinique)
                  height: `${Math.max(6, Math.min(100, (v / 9) * 100))}%`,
                  borderRadius: 6,
                  background:
                    "linear-gradient(180deg, var(--nami-primary), var(--nami-secondary))",
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
