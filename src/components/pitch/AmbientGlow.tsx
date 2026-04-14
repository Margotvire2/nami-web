interface Props {
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function AmbientGlow({ className = "", intensity = "medium" }: Props) {
  const scale = intensity === "low" ? 0.6 : intensity === "high" ? 1.5 : 1

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes nami-orb-drift-a {
          0%, 100% { transform: translate(0, 0); }
          33%       { transform: translate(${30 * scale}px, ${-20 * scale}px); }
          66%       { transform: translate(${-20 * scale}px, ${15 * scale}px); }
        }
        @keyframes nami-orb-drift-b {
          0%, 100% { transform: translate(0, 0); }
          33%       { transform: translate(${-25 * scale}px, ${18 * scale}px); }
          66%       { transform: translate(${20 * scale}px, ${-12 * scale}px); }
        }
        @keyframes nami-orb-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.08); }
        }
      `}</style>

      {/* Violet orb — top left */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: `${580 * scale}px`,
          height: `${580 * scale}px`,
          borderRadius: "50%",
          background: "rgba(91,78,196,0.14)",
          filter: "blur(80px)",
          animation: "nami-orb-drift-a 12s ease-in-out infinite",
        }}
      />

      {/* Teal orb — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: `${420 * scale}px`,
          height: `${420 * scale}px`,
          borderRadius: "50%",
          background: "rgba(43,168,156,0.10)",
          filter: "blur(70px)",
          animation: "nami-orb-drift-b 9s ease-in-out infinite",
        }}
      />
    </div>
  )
}

/** Centered pulsing orb for CTA sections */
export function AmbientGlowCTA() {
  return (
    <div
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes nami-cta-pulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.12); }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "rgba(91,78,196,0.18)",
          filter: "blur(100px)",
          animation: "nami-cta-pulse 6s ease-in-out infinite",
        }}
      />
    </div>
  )
}
