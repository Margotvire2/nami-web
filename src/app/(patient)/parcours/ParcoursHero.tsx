"use client";

interface ParcoursHeroProps {
  current?: number;
  total?: number;
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE = "Mon parcours de soins";
const DEFAULT_SUBTITLE =
  "Suivez les phases de votre parcours et l’avancement de chaque étape avec votre équipe soignante.";

export function ParcoursHero({
  current,
  total,
  title,
  subtitle,
}: ParcoursHeroProps) {
  const hasProgress = typeof current === "number" && typeof total === "number";
  const percent =
    hasProgress && total! > 0 ? Math.round((current! / total!) * 100) : 0;

  return (
    <header style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1A1A2E",
          letterSpacing: "-0.02em",
          marginBottom: 8,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        {title ?? DEFAULT_TITLE}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "#6B7280",
          lineHeight: 1.5,
          marginBottom: hasProgress ? 20 : 0,
        }}
      >
        {subtitle ?? DEFAULT_SUBTITLE}
      </p>

      {hasProgress && (
        /* Progress global — Étape X sur Y */
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(26,26,46,0.06)",
            borderRadius: 16,
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
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
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Étape {current} sur {total}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#5B4EC4",
              }}
              aria-hidden="true"
            >
              {percent}%
            </span>
          </div>

          {/* Barre visuelle — wrapped div sert de track */}
          <div
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`Progression du parcours : étape ${current} sur ${total}`}
            aria-valuetext={`${current} sur ${total} phases engagées`}
            style={{
              position: "relative",
              height: 8,
              background: "rgba(91,78,196,0.08)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${percent}%`,
                background:
                  "linear-gradient(90deg, #5B4EC4 0%, #7B6FD9 100%)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
