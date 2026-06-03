"use client";

interface EnergieCardProps {
  latestEnergy: number | null;
  averageEnergy7d: number | null;
  energyPoints7d: number[];
}

export function EnergieCard({
  latestEnergy,
  averageEnergy7d,
  energyPoints7d,
}: EnergieCardProps) {
  const hasData = energyPoints7d.length > 0;

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
        Mon énergie
      </div>

      {!hasData ? (
        <div style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
          Aucune note récente. Notez votre énergie depuis l&apos;app Nami.
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
              {latestEnergy ?? averageEnergy7d}
            </span>
            <span style={{ fontSize: 14, color: "var(--nami-text-muted)" }}>
              / 100
              {averageEnergy7d !== null && (
                <> · moyenne 7 j : <strong style={{ color: "var(--nami-dark)" }}>{averageEnergy7d}</strong></>
              )}
            </span>
          </div>

          <div
            aria-label="Énergie des 7 derniers jours"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 48,
            }}
          >
            {energyPoints7d.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(6, v)}%`,
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
