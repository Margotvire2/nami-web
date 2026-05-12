"use client";

/**
 * RelevanceBar — barre fine de pertinence avec animation breathing pour
 * la card featured (rang 1). Phase 3.B.3.
 *
 * Animations namiRelGrow (700ms forwards) + namiBreathe (4.2s ease infinite)
 * définies dans nami-keyframes.css.
 */

import { NAMI } from "./_tokens";

const FILL_COLOR: Record<"has" | "ffab" | "nami", string> = {
  has: NAMI.violet,
  ffab: NAMI.teal,
  nami: NAMI.textMuted,
};

export default function RelevanceBar({
  value,
  variant = "has",
  breathing = false,
}: {
  value: number;
  variant?: "has" | "ffab" | "nami";
  breathing?: boolean;
}) {
  const v = Math.min(1, Math.max(0, value));
  const fill = FILL_COLOR[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 11,
        color: NAMI.textFaint,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>{Math.round(v * 100)}</span>
      <div
        style={{
          width: 32,
          height: 3,
          background: NAMI.borderStrong,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={
            {
              position: "absolute",
              inset: 0,
              right: "auto",
              background: fill,
              borderRadius: 2,
              transformOrigin: "left",
              transform: `scaleX(${v})`,
              "--rel": String(v),
              animation: breathing
                ? `namiRelGrow 700ms ${NAMI.ease} 200ms backwards, namiBreathe 4.2s ease-in-out 1100ms infinite`
                : `namiRelGrow 700ms ${NAMI.ease} 200ms backwards`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
